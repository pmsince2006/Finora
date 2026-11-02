import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  Building2,
  Loader2,
} from 'lucide-react'
import { useFinance } from '../../context/useFinance'
import { useToast } from '../../context/useToast'
import {
  BANK_PROFILES,
  parseCsvFileContent,
  autoDetectColumnMappings,
  mapCsvRowsToTransactions,
  type ColumnMappingConfig,
  type ParsedCsvRow,
} from '../../lib/csvParser'
import { formatCurrency } from '../../lib/formatCurrency'

type ImportStep = 'upload' | 'mapping' | 'review' | 'success'

interface ImportDialogContentProps {
  onClose: () => void
}

const ImportDialogContent: React.FC<ImportDialogContentProps> = ({ onClose }) => {
  const { transactions, importTransactions } = useFinance()
  const { showToast } = useToast()

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [step, setStep] = useState<ImportStep>('upload')
  const [fileName, setFileName] = useState('')
  const [headers, setHeaders] = useState<string[]>([])
  const [rawRows, setRawRows] = useState<Array<Record<string, string>>>([])
  const [selectedProfile, setSelectedProfile] = useState<string>('generic')
  const [mapping, setMapping] = useState<ColumnMappingConfig | null>(null)
  const [parsedRows, setParsedRows] = useState<ParsedCsvRow[]>([])
  const [activeReviewTab, setActiveReviewTab] = useState<'all' | 'valid' | 'duplicates' | 'invalid'>('all')
  const [skipAllDuplicates, setSkipAllDuplicates] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [importSummary, setImportSummary] = useState<{
    importedCount: number
    skippedDuplicates: number
    invalidCount: number
  } | null>(null)

  // ESC key handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = 'unset'
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [onClose])

  // File parsing handler
  const handleFile = async (file: File) => {
    if (!file) return
    setIsProcessing(true)
    setFileName(file.name)

    try {
      const text = await file.text()
      const { headers: parsedHeaders, rows: parsedData } = await parseCsvFileContent(text)

      if (parsedHeaders.length === 0 || parsedData.length === 0) {
        showToast('The selected file appears to be empty or contains no headers.', 'error')
        setIsProcessing(false)
        return
      }

      setHeaders(parsedHeaders)
      setRawRows(parsedData)

      // Auto-detect mappings for generic profile
      const detected = autoDetectColumnMappings(parsedHeaders, 'generic')
      setMapping(detected)
      setStep('mapping')
    } catch (err) {
      console.error('[Finora CSV Import] Failed to parse CSV:', err)
      showToast('Failed to parse CSV file. Ensure it is a valid comma-separated text file.', 'error')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleProfileChange = (profileId: string) => {
    setSelectedProfile(profileId)
    if (headers.length > 0) {
      const detected = autoDetectColumnMappings(headers, profileId)
      setMapping(detected)
    }
  }

  // Generate parsed & validated transactions from active mapping
  const proceedToReview = () => {
    if (!mapping) return
    const evaluated = mapCsvRowsToTransactions(rawRows, mapping, transactions)
    setParsedRows(evaluated)
    setStep('review')
  }

  // Toggle single row import
  const toggleRowImport = (index: number) => {
    setParsedRows((prev) => {
      const next = [...prev]
      next[index] = {
        ...next[index],
        shouldImport: !next[index].shouldImport,
      }
      return next
    })
  }

  // Toggle all duplicates
  const handleToggleSkipAllDuplicates = (skip: boolean) => {
    setSkipAllDuplicates(skip)
    setParsedRows((prev) =>
      prev.map((r) => {
        if (r.isValid && r.duplicateCheck?.isDuplicate) {
          return { ...r, shouldImport: !skip }
        }
        return r
      })
    )
  }

  // Commit valid & selected transactions
  const handleCommitImport = () => {
    const toImport = parsedRows
      .filter((r) => r.isValid && r.shouldImport && r.transaction)
      .map((r) => r.transaction!)

    const skippedDuplicates = parsedRows.filter(
      (r) => r.isValid && r.duplicateCheck?.isDuplicate && !r.shouldImport
    ).length

    const invalidCount = parsedRows.filter((r) => !r.isValid).length

    const res = importTransactions(toImport)

    setImportSummary({
      importedCount: res.importedCount,
      skippedDuplicates,
      invalidCount,
    })

    showToast(`Successfully imported ${res.importedCount} transaction${res.importedCount !== 1 ? 's' : ''}`, 'success')
    setStep('success')
  }

  // Metric counts
  const validRows = parsedRows.filter((r) => r.isValid)
  const duplicateRows = parsedRows.filter((r) => r.isValid && r.duplicateCheck?.isDuplicate)
  const invalidRows = parsedRows.filter((r) => !r.isValid)
  const activeImportCount = parsedRows.filter((r) => r.isValid && r.shouldImport).length

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0C120F]/50 backdrop-blur-xs overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="import-title"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 16 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-4xl bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl shadow-2xl p-5 sm:p-7 text-left my-8 max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#1B4332] via-[#52796F] to-[#74968C]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-[#62726A] hover:text-[#16201B] hover:bg-[#F5F5F0] transition-colors"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-4 shrink-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#E3ECE8] text-[#153326] text-[10px] font-mono font-medium">
              <FileSpreadsheet className="w-3 h-3 text-[#2D6A4F]" />
              <span>CSV &amp; STATEMENT IMPORT ENGINE</span>
            </span>
            {fileName && (
              <span className="text-[11px] font-mono text-[#52796F] truncate max-w-xs">
                {fileName}
              </span>
            )}
          </div>
          <h2 id="import-title" className="text-xl font-serif font-medium text-[#16201B]">
            {step === 'upload' && 'Import Bank Statement or CSV'}
            {step === 'mapping' && 'Configure Column Mapping'}
            {step === 'review' && 'Review & Deduplicate Transactions'}
            {step === 'success' && 'Import Completed'}
          </h2>
          <p className="text-xs text-[#62726A] mt-0.5">
            {step === 'upload' && 'Files are processed locally in your browser. No financial data is uploaded to external servers.'}
            {step === 'mapping' && 'Verify how CSV columns map to Finora date, merchant, and amount fields.'}
            {step === 'review' && 'Inspect validation results, resolve duplicates, and commit valid records into your Money Ledger.'}
            {step === 'success' && 'Transactions have been merged into your canonical ledger and stored locally.'}
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mb-5 shrink-0 border-b border-[#E6E6DF] pb-3 text-[11px] font-mono text-[#788780]">
          <span className={step === 'upload' ? 'text-[#153326] font-bold' : ''}>1. Upload File</span>
          <span>&rarr;</span>
          <span className={step === 'mapping' ? 'text-[#153326] font-bold' : ''}>2. Column Mapping</span>
          <span>&rarr;</span>
          <span className={step === 'review' ? 'text-[#153326] font-bold' : ''}>3. Review &amp; Dedup</span>
          <span>&rarr;</span>
          <span className={step === 'success' ? 'text-[#2D6A4F] font-bold' : ''}>4. Complete</span>
        </div>

        {/* STEP 1: UPLOAD */}
        {step === 'upload' && (
          <div className="space-y-5 flex-1 flex flex-col justify-center">
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file) handleFile(file)
              }}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[#C2D3CC] hover:border-[#153326] rounded-2xl p-8 text-center bg-[#FBFBFA] hover:bg-[#F5F8F6] transition-all cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleFile(file)
                }}
              />
              <div className="w-14 h-14 rounded-full bg-[#E3ECE8] text-[#153326] flex items-center justify-center mx-auto mb-3 shadow-xs">
                {isProcessing ? (
                  <Loader2 className="w-7 h-7 text-[#2D6A4F] animate-spin" />
                ) : (
                  <UploadCloud className="w-7 h-7 text-[#2D6A4F]" />
                )}
              </div>
              <p className="text-sm font-medium text-[#16201B]">
                {isProcessing ? 'Parsing Statement Columns...' : 'Click to browse or drop your bank CSV here'}
              </p>
              <p className="text-xs text-[#62726A] mt-1 max-w-sm mx-auto">
                Supports standard bank exports from HDFC, ICICI, SBI, Axis, or generic expense sheets.
              </p>
              <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E3ECE8] text-[11px] font-mono text-[#153326]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#2D6A4F]" />
                <span>100% Client-Side Private Ingestion</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF]">
                <div className="font-semibold text-[#16201B]">RFC 4180 Compliant</div>
                <div className="text-[11px] text-[#62726A] mt-0.5">Handles commas inside quotes, multi-line notes, and UTF-8 BOMs.</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF]">
                <div className="font-semibold text-[#16201B]">Indian Bank Profiles</div>
                <div className="text-[11px] text-[#62726A] mt-0.5">Preconfigured aliases for HDFC, ICICI, and SBI date &amp; amount columns.</div>
              </div>
              <div className="p-3 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF]">
                <div className="font-semibold text-[#16201B]">Compound Fingerprinting</div>
                <div className="text-[11px] text-[#62726A] mt-0.5">Detects duplicate transactions before anything touches your ledger.</div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: COLUMN MAPPING */}
        {step === 'mapping' && mapping && (
          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {/* Bank Profile Preset Selector */}
            <div className="p-3.5 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-[#16201B] flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-[#52796F]" />
                  <span>Bank Statement Profile</span>
                </span>
                <span className="text-[10px] font-mono text-[#788780]">
                  {headers.length} columns found in CSV
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {BANK_PROFILES.map((prof) => (
                  <button
                    key={prof.id}
                    type="button"
                    onClick={() => handleProfileChange(prof.id)}
                    className={`p-2.5 rounded-xl text-left border transition-all text-xs cursor-pointer ${
                      selectedProfile === prof.id
                        ? 'bg-[#153326] text-[#F2F7F4] border-[#153326] shadow-xs'
                        : 'bg-[#FFFFFF] text-[#35423B] border-[#E6E6DF] hover:bg-[#F5F5F0]'
                    }`}
                  >
                    <div className="font-semibold truncate">{prof.name}</div>
                    <div className="text-[10px] opacity-80 mt-0.5 truncate">{prof.dateFormat}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mapping Controls Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
              {/* Date Column */}
              <div>
                <label className="block font-medium text-[#35423B] mb-1">Date Column *</label>
                <select
                  value={mapping.dateCol}
                  onChange={(e) => setMapping({ ...mapping, dateCol: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B]"
                >
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description Column */}
              <div>
                <label className="block font-medium text-[#35423B] mb-1">Description / Merchant *</label>
                <select
                  value={mapping.descriptionCol}
                  onChange={(e) => setMapping({ ...mapping, descriptionCol: e.target.value })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B]"
                >
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Mode Switcher */}
              <div className="sm:col-span-2 p-3 rounded-xl bg-[#F5F5F0] border border-[#E6E6DF]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-[#16201B]">Amount Structure in CSV</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setMapping({ ...mapping, mappingMode: 'split' })}
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                        mapping.mappingMode === 'split'
                          ? 'bg-[#153326] text-[#F2F7F4] shadow-xs'
                          : 'bg-[#FFFFFF] text-[#62726A]'
                      }`}
                    >
                      Separate Debit &amp; Credit Columns
                    </button>
                    <button
                      type="button"
                      onClick={() => setMapping({ ...mapping, mappingMode: 'single' })}
                      className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                        mapping.mappingMode === 'single'
                          ? 'bg-[#153326] text-[#F2F7F4] shadow-xs'
                          : 'bg-[#FFFFFF] text-[#62726A]'
                      }`}
                    >
                      Single Amount Column
                    </button>
                  </div>
                </div>

                {mapping.mappingMode === 'split' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-[#4B5952] mb-1">
                        Debit / Withdrawal Column
                      </label>
                      <select
                        value={mapping.debitCol || ''}
                        onChange={(e) => setMapping({ ...mapping, debitCol: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E6DF] bg-[#FFFFFF] text-[#16201B]"
                      >
                        <option value="">(None)</option>
                        {headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#4B5952] mb-1">
                        Credit / Deposit Column
                      </label>
                      <select
                        value={mapping.creditCol || ''}
                        onChange={(e) => setMapping({ ...mapping, creditCol: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E6DF] bg-[#FFFFFF] text-[#16201B]"
                      >
                        <option value="">(None)</option>
                        {headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-[11px] font-medium text-[#4B5952] mb-1">
                        Amount Column
                      </label>
                      <select
                        value={mapping.amountCol || ''}
                        onChange={(e) => setMapping({ ...mapping, amountCol: e.target.value })}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E6DF] bg-[#FFFFFF] text-[#16201B]"
                      >
                        {headers.map((h) => (
                          <option key={h} value={h}>
                            {h}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-[#4B5952] mb-1">
                        Default Type if Unsigned
                      </label>
                      <select
                        value={mapping.defaultTypeForSingleAmount || 'expense'}
                        onChange={(e) =>
                          setMapping({
                            ...mapping,
                            defaultTypeForSingleAmount: e.target.value as any,
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E6DF] bg-[#FFFFFF] text-[#16201B]"
                      >
                        <option value="expense">Debit (Expense)</option>
                        <option value="income">Credit (Income)</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Date Format Preference */}
              <div>
                <label className="block font-medium text-[#35423B] mb-1">Date Format Interpretation</label>
                <select
                  value={mapping.dateFormat}
                  onChange={(e) => setMapping({ ...mapping, dateFormat: e.target.value as any })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B]"
                >
                  <option value="auto">Auto-detect</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY (Indian Standard)</option>
                  <option value="DD-MM-YYYY">DD-MM-YYYY (SBI Standard)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (US Format)</option>
                </select>
              </div>

              {/* Optional Category Column */}
              <div>
                <label className="block font-medium text-[#35423B] mb-1">Category Column (Optional)</label>
                <select
                  value={mapping.categoryCol || ''}
                  onChange={(e) => setMapping({ ...mapping, categoryCol: e.target.value || undefined })}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B]"
                >
                  <option value="">Auto-categorize from merchant keywords</option>
                  {headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-[#E6E6DF]">
              <button
                type="button"
                onClick={() => setStep('upload')}
                className="px-4 py-2 rounded-xl border border-[#E6E6DF] text-xs font-medium text-[#62726A] hover:bg-[#F5F5F0] cursor-pointer"
              >
                Change File
              </button>
              <button
                type="button"
                onClick={proceedToReview}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] shadow-xs cursor-pointer"
              >
                <span>Validate &amp; Preview Rows ({rawRows.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & DEDUPLICATION */}
        {step === 'review' && (
          <div className="space-y-4 flex-1 flex flex-col overflow-hidden">
            {/* Summary Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 shrink-0 pb-2 border-b border-[#E6E6DF]">
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveReviewTab('all')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeReviewTab === 'all'
                      ? 'bg-[#153326] text-[#FFFFFF]'
                      : 'bg-[#F5F5F0] text-[#62726A] hover:text-[#16201B]'
                  }`}
                >
                  All Rows ({parsedRows.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveReviewTab('valid')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                    activeReviewTab === 'valid'
                      ? 'bg-[#2D6A4F] text-[#FFFFFF]'
                      : 'bg-[#E3ECE8] text-[#153326] hover:bg-[#D5E4DE]'
                  }`}
                >
                  Valid Ready ({validRows.length})
                </button>
                {duplicateRows.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveReviewTab('duplicates')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeReviewTab === 'duplicates'
                        ? 'bg-[#C97A2B] text-[#FFFFFF]'
                        : 'bg-[#FCF4EB] text-[#C97A2B] hover:bg-[#FBEBD9]'
                    }`}
                  >
                    Duplicates ({duplicateRows.length})
                  </button>
                )}
                {invalidRows.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setActiveReviewTab('invalid')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                      activeReviewTab === 'invalid'
                        ? 'bg-[#B83A2E] text-[#FFFFFF]'
                        : 'bg-[#FCF0EF] text-[#B83A2E] hover:bg-[#F9DDDA]'
                    }`}
                  >
                    Invalid / Rejected ({invalidRows.length})
                  </button>
                )}
              </div>

              {duplicateRows.length > 0 && (
                <div className="flex items-center gap-2 text-xs">
                  <label className="flex items-center gap-1.5 text-[#35423B] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={skipAllDuplicates}
                      onChange={(e) => handleToggleSkipAllDuplicates(e.target.checked)}
                      className="rounded border-[#C2D3CC] text-[#153326] focus:ring-[#153326]"
                    />
                    <span>Skip duplicate candidates (Recommended)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Table Preview */}
            <div className="flex-1 overflow-y-auto border border-[#E6E6DF] rounded-xl bg-[#FFFFFF]">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FBFBFA] sticky top-0 border-b border-[#E6E6DF] text-[11px] font-mono text-[#788780] z-10">
                  <tr>
                    <th className="py-2.5 px-3 w-12 text-center">Import</th>
                    <th className="py-2.5 px-3">Row</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Description</th>
                    <th className="py-2.5 px-3">Category</th>
                    <th className="py-2.5 px-3 text-right">Amount</th>
                    <th className="py-2.5 px-3">Validation Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F5F5F0]">
                  {parsedRows
                    .filter((row) => {
                      if (activeReviewTab === 'valid') return row.isValid
                      if (activeReviewTab === 'duplicates') return row.isValid && row.duplicateCheck?.isDuplicate
                      if (activeReviewTab === 'invalid') return !row.isValid
                      return true
                    })
                    .map((row, index) => {
                      const isDup = row.duplicateCheck?.isDuplicate
                      return (
                        <tr
                          key={row.rowNumber}
                          className={`hover:bg-[#FBFBFA] transition-colors ${
                            !row.isValid
                              ? 'bg-[#FCF0EF]/40'
                              : isDup
                              ? 'bg-[#FCF4EB]/40'
                              : ''
                          }`}
                        >
                          <td className="py-2 px-3 text-center">
                            {row.isValid ? (
                              <input
                                type="checkbox"
                                checked={row.shouldImport}
                                onChange={() => toggleRowImport(index)}
                                className="rounded border-[#C2D3CC] text-[#153326] focus:ring-[#153326]"
                              />
                            ) : (
                              <span className="text-[#B83A2E] text-xs font-bold">&times;</span>
                            )}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-[#788780]">
                            #{row.rowNumber}
                          </td>
                          <td className="py-2 px-3 font-mono text-[11px] text-[#16201B]">
                            {row.transaction?.date || '—'}
                          </td>
                          <td className="py-2 px-3">
                            <div className="font-medium text-[#16201B] max-w-xs truncate">
                              {row.transaction?.description || Object.values(row.rawValues)[1] || '—'}
                            </div>
                          </td>
                          <td className="py-2 px-3 text-[#4B5952] text-[11px]">
                            {row.transaction?.category || '—'}
                          </td>
                          <td className="py-2 px-3 text-right font-mono font-medium">
                            {row.transaction ? (
                              <span className={row.transaction.type === 'income' ? 'text-[#153326]' : 'text-[#16201B]'}>
                                {row.transaction.type === 'income' ? '+' : '-'}
                                {formatCurrency(row.transaction.amount)}
                              </span>
                            ) : (
                              <span className="text-[#A2B0A9]">—</span>
                            )}
                          </td>
                          <td className="py-2 px-3 text-[11px]">
                            {!row.isValid ? (
                              <span className="inline-flex items-center gap-1 text-[#B83A2E]">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{row.validationError}</span>
                              </span>
                            ) : isDup ? (
                              <span className="inline-flex items-center gap-1 text-[#C97A2B] font-medium">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                                <span>{row.duplicateCheck?.duplicateReason}</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[#2D6A4F]">
                                <Check className="w-3.5 h-3.5 shrink-0" />
                                <span>Ready to commit</span>
                              </span>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                </tbody>
              </table>
            </div>

            {/* Bottom Actions */}
            <div className="pt-3 flex items-center justify-between border-t border-[#E6E6DF] shrink-0">
              <button
                type="button"
                onClick={() => setStep('mapping')}
                className="px-4 py-2 rounded-xl border border-[#E6E6DF] text-xs font-medium text-[#62726A] hover:bg-[#F5F5F0] cursor-pointer"
              >
                &larr; Back to Mapping
              </button>

              <div className="flex items-center gap-3">
                <span className="text-xs text-[#62726A]">
                  Selected to import:{' '}
                  <strong className="text-[#16201B] font-mono">{activeImportCount}</strong> rows
                </span>
                <button
                  type="button"
                  disabled={activeImportCount === 0}
                  onClick={handleCommitImport}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] active:scale-98 transition-all shadow-xs cursor-pointer disabled:opacity-40"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#4EAC85]" />
                  <span>Import {activeImportCount} Transactions</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: SUCCESS SUMMARY */}
        {step === 'success' && importSummary && (
          <div className="space-y-6 flex-1 flex flex-col justify-center items-center py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-[#E3ECE8] text-[#1B4332] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-9 h-9 text-[#2D6A4F]" />
            </div>

            <div>
              <h3 className="text-2xl font-serif font-medium text-[#16201B]">
                Import Successfully Committed
              </h3>
              <p className="text-xs text-[#62726A] mt-1.5 max-w-md mx-auto">
                Your Money Ledger has been updated with the verified records. All summary metrics, trends, and category splits have been re-calculated.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg text-left">
              <div className="p-4 rounded-xl bg-[#F2F7F4] border border-[#C2D3CC]">
                <div className="text-[11px] font-mono text-[#52796F]">COMMITTED</div>
                <div className="text-xl font-mono font-bold text-[#153326] mt-0.5">
                  {importSummary.importedCount}
                </div>
                <div className="text-[11px] text-[#4B5952] mt-0.5">Active transactions</div>
              </div>

              <div className="p-4 rounded-xl bg-[#FCF4EB] border border-[#F0D5BA]">
                <div className="text-[11px] font-mono text-[#C97A2B]">DUPLICATES SKIPPED</div>
                <div className="text-xl font-mono font-bold text-[#C97A2B] mt-0.5">
                  {importSummary.skippedDuplicates}
                </div>
                <div className="text-[11px] text-[#7A4B1A] mt-0.5">Prevented double-count</div>
              </div>

              <div className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF]">
                <div className="text-[11px] font-mono text-[#788780]">REJECTED ROWS</div>
                <div className="text-xl font-mono font-bold text-[#62726A] mt-0.5">
                  {importSummary.invalidCount}
                </div>
                <div className="text-[11px] text-[#788780] mt-0.5">Invalid format/empty</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] shadow-xs cursor-pointer"
            >
              Return to Money Ledger
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export const ImportModal: React.FC = () => {
  const { isImportModalOpen, closeImportModal } = useFinance()

  return (
    <AnimatePresence>
      {isImportModalOpen && <ImportDialogContent onClose={closeImportModal} />}
    </AnimatePresence>
  )
}
