/**
 * Finora Currency Formatter
 * Formats financial values in Indian Rupees (INR) using standard Intl.NumberFormat conventions.
 */

const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
})

const inrDecimalFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
})

export interface FormatCurrencyOptions {
  showSign?: boolean
  withDecimals?: boolean
  compact?: boolean
}

export function formatCurrency(
  amount: number,
  options: FormatCurrencyOptions = {}
): string {
  const { showSign = false, withDecimals = false, compact = false } = options

  if (compact && Math.abs(amount) >= 100000) {
    // Format in Lakhs (L) for large figures if compact requested
    const inLakhs = (amount / 100000).toFixed(1)
    const sign = showSign && amount > 0 ? '+' : ''
    return `${sign}₹${inLakhs}L`
  }

  const formatter = withDecimals ? inrDecimalFormatter : inrFormatter
  const formatted = formatter.format(Math.abs(amount))

  if (showSign) {
    if (amount > 0) return `+${formatted}`
    if (amount < 0) return `-${formatted}`
  }

  return amount < 0 ? `-${formatted}` : formatted
}

export function formatPercent(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`
}
