import Papa from 'papaparse'
import type { Transaction, TransactionType } from '../types/finance'
import { checkDuplicates, type DuplicateCheckResult } from './transactionFingerprint'

export interface BankProfile {
  id: string
  name: string
  description: string
  dateHeaderAliases: string[]
  descriptionHeaderAliases: string[]
  debitHeaderAliases: string[]
  creditHeaderAliases: string[]
  amountHeaderAliases?: string[]
  typeHeaderAliases?: string[]
  dateFormat: 'auto' | 'DD/MM/YYYY' | 'DD-MM-YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY'
}

export const BANK_PROFILES: BankProfile[] = [
  {
    id: 'generic',
    name: 'Generic Bank / Budget CSV',
    description: 'Standard spreadsheet export with Date, Description, and Amount or Inflow/Outflow columns.',
    dateHeaderAliases: ['date', 'txn date', 'transaction date', 'timestamp'],
    descriptionHeaderAliases: ['description', 'narration', 'particulars', 'merchant', 'details', 'name'],
    debitHeaderAliases: ['debit', 'withdrawal', 'expense', 'outflow', 'dr'],
    creditHeaderAliases: ['credit', 'deposit', 'income', 'inflow', 'cr'],
    amountHeaderAliases: ['amount', 'txn amount', 'transaction amount', 'net amount'],
    typeHeaderAliases: ['type', 'transaction type', 'cr/dr', 'd/c'],
    dateFormat: 'auto',
  },
  {
    id: 'hdfc',
    name: 'HDFC Bank Statement',
    description: 'Supports HDFC NetBanking account statement export format.',
    dateHeaderAliases: ['date', 'txn date', 'transaction date', 'value date'],
    descriptionHeaderAliases: ['narration', 'description', 'particulars'],
    debitHeaderAliases: ['withdrawal amt.', 'withdrawal amount', 'debit', 'debit amount'],
    creditHeaderAliases: ['deposit amt.', 'deposit amount', 'credit', 'credit amount'],
    dateFormat: 'DD/MM/YYYY',
  },
  {
    id: 'icici',
    name: 'ICICI Bank Statement',
    description: 'Supports ICICI iMobile and NetBanking statement export format.',
    dateHeaderAliases: ['transaction date', 'value date', 'date'],
    descriptionHeaderAliases: ['transaction remarks', 'description', 'particulars'],
    debitHeaderAliases: ['withdrawal amount (inr )', 'withdrawal amount', 'debit', 'dr'],
    creditHeaderAliases: ['deposit amount (inr )', 'deposit amount', 'credit', 'cr'],
    dateFormat: 'DD/MM/YYYY',
  },
  {
    id: 'sbi',
    name: 'SBI (State Bank of India)',
    description: 'Supports SBI YONO and OnlineSBI statement export format.',
    dateHeaderAliases: ['txn date', 'value date', 'date'],
    descriptionHeaderAliases: ['description', 'narration', 'particulars'],
    debitHeaderAliases: ['debit', 'withdrawal', 'debit (inr)'],
    creditHeaderAliases: ['credit', 'deposit', 'credit (inr)'],
    dateFormat: 'DD-MM-YYYY',
  },
]

export interface ColumnMappingConfig {
  dateCol: string
  descriptionCol: string
  mappingMode: 'split' | 'single' // split = separate Debit/Credit columns; single = one Amount column
  debitCol?: string
  creditCol?: string
  amountCol?: string
  typeCol?: string
  categoryCol?: string
  notesCol?: string
  dateFormat: 'auto' | 'DD/MM/YYYY' | 'DD-MM-YYYY' | 'YYYY-MM-DD' | 'MM/DD/YYYY'
  defaultTypeForSingleAmount?: TransactionType
}

export interface ParsedCsvRow {
  rowNumber: number
  rawValues: Record<string, string>
  isValid: boolean
  validationError?: string
  transaction?: Omit<Transaction, 'id'>
  duplicateCheck?: DuplicateCheckResult
  shouldImport?: boolean
}

/**
 * Strips UTF-8 BOM, removes surrounding quotes, and trims whitespace.
 */
export function cleanHeader(str: string): string {
  return str.replace(/^\uFEFF/, '').trim()
}

/**
 * Parses numeric currency strings common in Indian banking exports:
 * e.g. "1,250.50", " ₹ 4,500.00 ", "(350)", "150.00 Dr"
 */
export function parseCurrencyAmount(rawStr: string | undefined): { amount: number; inferredType?: TransactionType } | null {
  if (!rawStr) return null
  let clean = rawStr.trim()
  if (!clean || clean === '-' || clean === '—' || clean === '0' || clean === '0.00') {
    return null
  }

  let inferredType: TransactionType | undefined

  // Check for Dr / Cr indicators
  if (/cr\.?$/i.test(clean) || /\bcredit\b/i.test(clean)) {
    inferredType = 'income'
  } else if (/dr\.?$/i.test(clean) || /\bdebit\b/i.test(clean)) {
    inferredType = 'expense'
  }

  // Handle accounting parentheses: (500) -> 500 expense
  if (clean.startsWith('(') && clean.endsWith(')')) {
    clean = clean.slice(1, -1)
    inferredType = 'expense'
  }

  // Remove currency signs (₹, $, Rs, INR), commas, letters, and spaces
  clean = clean.replace(/[₹$]|(Rs\.?)|(INR)|\s|dr|cr/gi, '').replace(/,/g, '')

  const num = parseFloat(clean)
  if (isNaN(num)) return null

  // If number was negative, treat magnitude as positive and type as expense
  if (num < 0) {
    return { amount: Math.abs(num), inferredType: 'expense' }
  }

  return { amount: num, inferredType }
}

/**
 * Parses diverse date formats into canonical 'YYYY-MM-DD'.
 */
export function parseDateToIso(dateStr: string | undefined, formatPreference: string = 'auto'): string | null {
  if (!dateStr) return null
  const clean = dateStr.trim()
  if (!clean) return null

  // Check ISO format YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const d = new Date(clean)
    if (!isNaN(d.getTime())) return clean
  }

  // Check DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/)
  if (dmyMatch) {
    const [, p1, p2, year] = dmyMatch
    const part1 = parseInt(p1, 10)
    const part2 = parseInt(p2, 10)

    let day = part1
    let month = part2

    if (formatPreference === 'MM/DD/YYYY' || (part1 <= 12 && part2 > 12)) {
      month = part1
      day = part2
    }

    if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const mm = String(month).padStart(2, '0')
      const dd = String(day).padStart(2, '0')
      return `${year}-${mm}-${dd}`
    }
  }

  // Check DD-Mon-YYYY (e.g. 15-Apr-2026 or 15/Apr/2026)
  const dMonYMatch = clean.match(/^(\d{1,2})[-/ ]([A-Za-z]{3})[-/ ](\d{2,4})$/)
  if (dMonYMatch) {
    const [, dayStr, monStr, yrStr] = dMonYMatch
    const months: Record<string, string> = {
      jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
      jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
    }
    const month = months[monStr.toLowerCase()]
    if (month) {
      const year = yrStr.length === 2 ? `20${yrStr}` : yrStr
      const day = String(parseInt(dayStr, 10)).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
  }

  // Fallback to standard Date.parse
  const fallback = new Date(clean)
  if (!isNaN(fallback.getTime())) {
    return fallback.toISOString().slice(0, 10)
  }

  return null
}

/**
 * Guesses default column mappings given CSV headers and an optional bank profile.
 */
export function autoDetectColumnMappings(headers: string[], profileId: string = 'generic'): ColumnMappingConfig {
  const profile = BANK_PROFILES.find((p) => p.id === profileId) || BANK_PROFILES[0]
  const lowerHeaders = headers.map((h) => h.toLowerCase().trim())

  const findHeader = (aliases: string[]): string | undefined => {
    for (const alias of aliases) {
      const idx = lowerHeaders.findIndex((h) => h === alias || h.includes(alias))
      if (idx !== -1) return headers[idx]
    }
    return undefined
  }

  const dateCol = findHeader(profile.dateHeaderAliases) || headers[0] || ''
  const descriptionCol = findHeader(profile.descriptionHeaderAliases) || headers[1] || ''
  const debitCol = findHeader(profile.debitHeaderAliases)
  const creditCol = findHeader(profile.creditHeaderAliases)
  const amountCol = profile.amountHeaderAliases ? findHeader(profile.amountHeaderAliases) : undefined
  const typeCol = profile.typeHeaderAliases ? findHeader(profile.typeHeaderAliases) : undefined

  // If separate debit and credit columns exist, default to split mode
  if (debitCol && creditCol) {
    return {
      dateCol,
      descriptionCol,
      mappingMode: 'split',
      debitCol,
      creditCol,
      dateFormat: profile.dateFormat,
    }
  }

  // Otherwise single amount mode
  return {
    dateCol,
    descriptionCol,
    mappingMode: 'single',
    amountCol: amountCol || headers[2] || '',
    typeCol,
    dateFormat: profile.dateFormat,
    defaultTypeForSingleAmount: 'expense',
  }
}

/**
 * Validates and converts raw parsed CSV rows into Finora transactions using active mappings.
 */
export function mapCsvRowsToTransactions(
  rawRows: Array<Record<string, string>>,
  mapping: ColumnMappingConfig,
  existingTransactions: Transaction[]
): ParsedCsvRow[] {
  const parsedRows: ParsedCsvRow[] = []

  rawRows.forEach((row, idx) => {
    const rowNumber = idx + 2 // +2 accounts for 1-based index and header row

    // 1. Validate Date
    const rawDate = row[mapping.dateCol]
    const parsedDate = parseDateToIso(rawDate, mapping.dateFormat)
    if (!parsedDate) {
      parsedRows.push({
        rowNumber,
        rawValues: row,
        isValid: false,
        validationError: `Invalid or missing date in column "${mapping.dateCol}": "${rawDate || ''}"`,
      })
      return
    }

    // 2. Validate Description
    const rawDesc = row[mapping.descriptionCol]
    const cleanDesc = (rawDesc || '').trim()
    if (!cleanDesc) {
      parsedRows.push({
        rowNumber,
        rawValues: row,
        isValid: false,
        validationError: `Missing description in column "${mapping.descriptionCol}"`,
      })
      return
    }

    // 3. Determine Amount and Transaction Type
    let finalAmount = 0
    let finalType: TransactionType = 'expense'

    if (mapping.mappingMode === 'split') {
      const debitParsed = mapping.debitCol ? parseCurrencyAmount(row[mapping.debitCol]) : null
      const creditParsed = mapping.creditCol ? parseCurrencyAmount(row[mapping.creditCol]) : null

      if (debitParsed && debitParsed.amount > 0) {
        finalAmount = debitParsed.amount
        finalType = 'expense'
      } else if (creditParsed && creditParsed.amount > 0) {
        finalAmount = creditParsed.amount
        finalType = 'income'
      } else {
        parsedRows.push({
          rowNumber,
          rawValues: row,
          isValid: false,
          validationError: `No debit or credit amount found in row`,
        })
        return
      }
    } else {
      // Single amount column
      const amtParsed = mapping.amountCol ? parseCurrencyAmount(row[mapping.amountCol]) : null
      if (!amtParsed || amtParsed.amount <= 0) {
        parsedRows.push({
          rowNumber,
          rawValues: row,
          isValid: false,
          validationError: `Invalid or zero amount in column "${mapping.amountCol}": "${(mapping.amountCol && row[mapping.amountCol]) || ''}"`,
        })
        return
      }

      finalAmount = amtParsed.amount

      if (amtParsed.inferredType) {
        finalType = amtParsed.inferredType
      } else if (mapping.typeCol && row[mapping.typeCol]) {
        const rawType = row[mapping.typeCol].toLowerCase().trim()
        if (rawType.includes('cr') || rawType.includes('in') || rawType.includes('dep')) {
          finalType = 'income'
        } else {
          finalType = 'expense'
        }
      } else {
        finalType = mapping.defaultTypeForSingleAmount || 'expense'
      }
    }

    // Category inference / mapping
    let category = finalType === 'income' ? 'Salary & Stipend' : 'Shopping & Discretionary'
    if (mapping.categoryCol && row[mapping.categoryCol]) {
      const rawCat = row[mapping.categoryCol].trim()
      if (rawCat) category = rawCat
    } else {
      // Auto-categorize common keywords
      const descLower = cleanDesc.toLowerCase()
      if (descLower.includes('swiggy') || descLower.includes('zomato') || descLower.includes('cafe') || descLower.includes('food') || descLower.includes('restaurant')) {
        category = 'Food & Dining'
      } else if (descLower.includes('blinkit') || descLower.includes('zepto') || descLower.includes('instamart') || descLower.includes('grocery')) {
        category = 'Groceries & Staples'
      } else if (descLower.includes('uber') || descLower.includes('ola') || descLower.includes('metro') || descLower.includes('fuel') || descLower.includes('petrol')) {
        category = 'Transportation'
      } else if (descLower.includes('netflix') || descLower.includes('spotify') || descLower.includes('prime') || descLower.includes('github') || descLower.includes('hotstar')) {
        category = 'Digital Services'
      } else if (descLower.includes('rent') || descLower.includes('maintenance')) {
        category = 'Housing & Rent'
      } else if (descLower.includes('stipend') || descLower.includes('salary') || descLower.includes('payroll')) {
        category = 'Salary & Stipend'
      }
    }

    const notes = mapping.notesCol && row[mapping.notesCol] ? row[mapping.notesCol].trim() : undefined

    parsedRows.push({
      rowNumber,
      rawValues: row,
      isValid: true,
      transaction: {
        date: parsedDate,
        description: cleanDesc,
        amount: Math.round(finalAmount * 100) / 100,
        type: finalType,
        category,
        notes,
        account: 'Imported CSV Statement',
        status: 'regular',
      },
    })
  })

  // Duplicate detection for all valid transactions
  const validOnly = parsedRows.filter((r) => r.isValid && r.transaction)
  const candidateTxs = validOnly.map((r) => r.transaction!)
  const dupResults = checkDuplicates(existingTransactions, candidateTxs)

  let dupIdx = 0
  parsedRows.forEach((row) => {
    if (row.isValid && row.transaction) {
      const dup = dupResults[dupIdx++]
      row.duplicateCheck = dup
      // By default, do not import duplicates unless explicitly chosen
      row.shouldImport = !dup.isDuplicate
    }
  })

  return parsedRows
}

/**
 * Parses raw CSV text or File into header list and object rows using Papa Parse.
 */
export function parseCsvFileContent(fileContent: string): Promise<{ headers: string[]; rows: Array<Record<string, string>> }> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(fileContent, {
      header: true,
      skipEmptyLines: 'greedy',
      transformHeader: cleanHeader,
      complete: (results) => {
        const headers = results.meta.fields ? results.meta.fields.map(cleanHeader).filter(Boolean) : []
        resolve({
          headers,
          rows: results.data,
        })
      },
      error: (error: Error) => {
        reject(error)
      },
    })
  })
}
