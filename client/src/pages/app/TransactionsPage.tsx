import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Search,
  Edit2,
  Trash2,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  X,
  ChevronLeft,
  ChevronRight,
  Database,
  AlertCircle,
} from 'lucide-react'
import { useFinance } from '../../context/useFinance'
import { useAuth } from '../../context/useAuth'
import { useToast } from '../../context/useToast'
import { formatCurrency } from '../../lib/formatCurrency'
import { DeleteConfirmModal } from '../../components/app/DeleteConfirmModal'
import type { Transaction, TransactionType } from '../../types/finance'

type SortColumn = 'date' | 'description' | 'category' | 'amount'
type SortDirection = 'asc' | 'desc'

export const TransactionsPage: React.FC = () => {
  const { isAuthenticated } = useAuth()
  const {
    filteredTransactions,
    transactions,
    openEditTxModal,
    deleteTransaction,
    undoDelete,
  } = useFinance()
  const { showToast, showUndoToast } = useToast()

  // Search & Type/Category Filters
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'ALL' | TransactionType>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  // Independent Custom Date Range Filters (Does NOT mutate global period)
  const [customStartDate, setCustomStartDate] = useState<string>('')
  const [customEndDate, setCustomEndDate] = useState<string>('')

  // Sorting & Pagination State
  const [sortColumn, setSortColumn] = useState<SortColumn>('date')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [currentPage, setCurrentPage] = useState<number>(1)
  const [pageSize, setPageSize] = useState<number>(20)

  // Deletion Modal State
  const [deletingTx, setDeletingTx] = useState<Transaction | null>(null)

  // Unique categories list derived from all canonical transactions
  const categories = useMemo(() => {
    const cats = new Set<string>()
    transactions.forEach((tx) => cats.add(tx.category))
    return Array.from(cats).sort()
  }, [transactions])

  // Derive date range validation error directly during render (avoids setState in effect)
  const dateRangeError = useMemo(() => {
    if (customStartDate && customEndDate && customStartDate > customEndDate) {
      return 'Start date must be before or equal to End date'
    }
    return null
  }, [customStartDate, customEndDate])

  // Filter pipeline:
  // Starts from filteredTransactions (which applies the active global reporting period),
  // then applies ledger-specific custom search, type, category, and custom date range.
  const filteredList = useMemo(() => {
    return filteredTransactions.filter((tx) => {
      // Search matching (description or notes or category)
      const query = searchTerm.toLowerCase().trim()
      if (query) {
        const matchesDesc = tx.description.toLowerCase().includes(query)
        const matchesNotes = tx.notes ? tx.notes.toLowerCase().includes(query) : false
        const matchesCat = tx.category.toLowerCase().includes(query)
        if (!matchesDesc && !matchesNotes && !matchesCat) return false
      }

      // Type matching
      if (selectedType !== 'ALL' && tx.type !== selectedType) {
        return false
      }

      // Category matching
      if (selectedCategory !== 'ALL' && tx.category !== selectedCategory) {
        return false
      }

      // Independent Custom Date range matching
      if (customStartDate && !dateRangeError) {
        if (tx.date < customStartDate) return false
      }
      if (customEndDate && !dateRangeError) {
        if (tx.date > customEndDate) return false
      }

      return true
    })
  }, [
    filteredTransactions,
    searchTerm,
    selectedType,
    selectedCategory,
    customStartDate,
    customEndDate,
    dateRangeError,
  ])

  // Sorting pipeline (stable sorting)
  const sortedTransactions = useMemo(() => {
    const list = [...filteredList]
    list.sort((a, b) => {
      let comparison = 0
      if (sortColumn === 'date') {
        comparison = a.date.localeCompare(b.date)
      } else if (sortColumn === 'amount') {
        comparison = a.amount - b.amount
      } else if (sortColumn === 'category') {
        comparison = a.category.localeCompare(b.category)
      } else if (sortColumn === 'description') {
        comparison = a.description.localeCompare(b.description)
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
    return list
  }, [filteredList, sortColumn, sortDirection])

  // Pagination calculation
  const totalRecords = sortedTransactions.length
  const totalPages = Math.max(1, Math.ceil(totalRecords / pageSize))
  const clampedPage = Math.min(currentPage, totalPages)

  const paginatedTransactions = useMemo(() => {
    const start = (clampedPage - 1) * pageSize
    return sortedTransactions.slice(start, start + pageSize)
  }, [sortedTransactions, clampedPage, pageSize])

  // Summary figures for currently filtered list
  const totalInflow = useMemo(() => {
    return filteredList
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [filteredList])

  const totalOutflow = useMemo(() => {
    return filteredList
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [filteredList])

  // Sort toggle handler
  const handleSortToggle = (col: SortColumn) => {
    if (sortColumn === col) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortColumn(col)
      setSortDirection(col === 'date' || col === 'amount' ? 'desc' : 'asc')
    }
  }

  // Delete transaction with undo
  const handleDeleteConfirm = (tx: Transaction) => {
    const deleted = deleteTransaction(tx.id)
    setDeletingTx(null)
    if (deleted) {
      showUndoToast(
        `Deleted "${deleted.description}" (₹${deleted.amount})`,
        () => {
          undoDelete(deleted)
          showToast(`Restored "${deleted.description}"`, 'success')
        },
        'Undo'
      )
    }
  }

  const handleClearCustomDates = () => {
    setCustomStartDate('')
    setCustomEndDate('')
    setCurrentPage(1)
  }

  const handleResetAllFilters = () => {
    setSearchTerm('')
    setSelectedType('ALL')
    setSelectedCategory('ALL')
    setCustomStartDate('')
    setCustomEndDate('')
    setCurrentPage(1)
  }

  return (
    <div className="space-y-6">
      {/* Storage Notification Banner */}
      <div className="p-3.5 rounded-2xl bg-[#F2F7F4] border border-[#C2D3CC] text-xs text-[#1B4332] flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-[#2D6A4F] shrink-0" />
          <span className="text-[11px] text-[#35423B]">
            {isAuthenticated ? (
              <>
                <strong>Cloud Database Active:</strong> Changes are synchronized with your authenticated account in MongoDB Atlas. Your transactions persist across all devices.
              </>
            ) : (
              <>
                <strong>Local Storage Active:</strong> Changes are saved to your browser cache (`finora.transactions.v1`). You can edit, delete, or import records safely without cloud credentials.
              </>
            )}
          </span>
        </div>
        <Link
          to="/app/settings"
          className="text-[11px] font-medium text-[#2D6A4F] hover:underline whitespace-nowrap"
        >
          Manage Storage in Settings &rarr;
        </Link>
      </div>

      {/* Filter, Search & Custom Date Controls */}
      <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-4 shadow-2xs space-y-3.5">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* 1. Search Box (5 cols) */}
          <div className="sm:col-span-5 relative">
            <Search className="w-4 h-4 text-[#788780] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search merchant, notes, or category..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] placeholder-[#A2B0A9] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
            />
            {searchTerm && (
              <button
                onClick={() => {
                  setSearchTerm('')
                  setCurrentPage(1)
                }}
                className="absolute right-3 top-2.5 p-0.5 rounded text-[#788780] hover:text-[#16201B]"
                aria-label="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* 2. Type Filter (3 cols) */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as any)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
            >
              <option value="ALL">All Types (Income &amp; Debits)</option>
              <option value="income">Inflow Only (Income)</option>
              <option value="expense">Debits Only (Expenses)</option>
            </select>
          </div>

          {/* 3. Category Filter (4 cols) */}
          <div className="sm:col-span-4">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
            >
              <option value="ALL">All Categories ({categories.length})</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Start & End Date Pickers */}
        <div className="pt-2 border-t border-[#F5F5F0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[#62726A] flex items-center gap-1 text-[11px] font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#52796F]" />
              <span>Custom Date Range:</span>
            </span>

            <input
              type="date"
              aria-label="Start date"
              value={customStartDate}
              onChange={(e) => {
                setCustomStartDate(e.target.value)
                setCurrentPage(1)
              }}
              className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
            />
            <span className="text-[#788780]">to</span>
            <input
              type="date"
              aria-label="End date"
              value={customEndDate}
              onChange={(e) => {
                setCustomEndDate(e.target.value)
                setCurrentPage(1)
              }}
              className="px-2.5 py-1.5 text-xs font-mono rounded-lg border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
            />

            {(customStartDate || customEndDate) && (
              <button
                type="button"
                onClick={handleClearCustomDates}
                className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#F5F5F0] hover:bg-[#E6E6DF] text-[11px] text-[#62726A] hover:text-[#16201B] transition-colors"
              >
                <X className="w-3 h-3" />
                <span>Clear Range</span>
              </button>
            )}
          </div>

          {/* Quick Clear All Filters */}
          {(searchTerm || selectedType !== 'ALL' || selectedCategory !== 'ALL' || customStartDate || customEndDate) && (
            <button
              onClick={handleResetAllFilters}
              className="text-[11px] text-[#52796F] hover:text-[#153326] underline font-medium self-start sm:self-auto"
            >
              Reset all filters
            </button>
          )}
        </div>

        {/* Date Range Error Alert */}
        {dateRangeError && (
          <div className="text-[11px] text-[#B83A2E] flex items-center gap-1.5 pt-1">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{dateRangeError}</span>
          </div>
        )}

        {/* Filter Summary Metrics Bar */}
        <div className="pt-2 border-t border-[#F5F5F0] flex flex-wrap items-center justify-between text-xs text-[#62726A] gap-2">
          <span>
            Showing <strong className="font-mono text-[#16201B]">{filteredList.length}</strong> matching transaction{filteredList.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="text-[#2D6A4F]">
              Inflow: {formatCurrency(totalInflow)}
            </span>
            <span className="text-[#B83A2E]">
              Debits: {formatCurrency(totalOutflow)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table Container */}
      <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FBFBFA] border-b border-[#E6E6DF] text-[11px] font-mono uppercase text-[#788780]">
                {/* 1. Date Header */}
                <th scope="col" className="py-3 px-4 font-medium" aria-sort={sortColumn === 'date' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button
                    onClick={() => handleSortToggle('date')}
                    className="inline-flex items-center gap-1.5 hover:text-[#16201B] transition-colors cursor-pointer"
                  >
                    <span>Date</span>
                    {sortColumn === 'date' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#153326]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#153326]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-[#A2B0A9]" />
                    )}
                  </button>
                </th>

                {/* 2. Description Header */}
                <th scope="col" className="py-3 px-4 font-medium" aria-sort={sortColumn === 'description' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button
                    onClick={() => handleSortToggle('description')}
                    className="inline-flex items-center gap-1.5 hover:text-[#16201B] transition-colors cursor-pointer"
                  >
                    <span>Merchant / Description</span>
                    {sortColumn === 'description' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#153326]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#153326]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-[#A2B0A9]" />
                    )}
                  </button>
                </th>

                {/* 3. Category Header */}
                <th scope="col" className="py-3 px-4 font-medium" aria-sort={sortColumn === 'category' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button
                    onClick={() => handleSortToggle('category')}
                    className="inline-flex items-center gap-1.5 hover:text-[#16201B] transition-colors cursor-pointer"
                  >
                    <span>Category</span>
                    {sortColumn === 'category' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#153326]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#153326]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-[#A2B0A9]" />
                    )}
                  </button>
                </th>

                <th scope="col" className="py-3 px-4 font-medium hidden md:table-cell">Account</th>
                <th scope="col" className="py-3 px-4 font-medium">Tags</th>

                {/* 4. Amount Header */}
                <th scope="col" className="py-3 px-4 font-medium text-right" aria-sort={sortColumn === 'amount' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : 'none'}>
                  <button
                    onClick={() => handleSortToggle('amount')}
                    className="inline-flex items-center gap-1.5 hover:text-[#16201B] transition-colors cursor-pointer ml-auto"
                  >
                    <span>Amount</span>
                    {sortColumn === 'amount' ? (
                      sortDirection === 'asc' ? <ArrowUp className="w-3.5 h-3.5 text-[#153326]" /> : <ArrowDown className="w-3.5 h-3.5 text-[#153326]" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3 text-[#A2B0A9]" />
                    )}
                  </button>
                </th>

                {/* 5. Actions Column */}
                <th scope="col" className="py-3 px-4 font-medium text-right w-24">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F5F5F0]">
              {paginatedTransactions.length > 0 ? (
                paginatedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#FBFBFA] transition-colors group"
                  >
                    {/* Date */}
                    <td className="py-3.5 px-4 font-mono text-[#62726A] text-[11px] whitespace-nowrap">
                      {tx.date}
                    </td>

                    {/* Merchant / Description */}
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#16201B] max-w-sm truncate">{tx.description}</div>
                      {tx.notes && (
                        <div className="text-[11px] text-[#788780] font-normal mt-0.5 max-w-sm truncate">
                          {tx.notes}
                        </div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4 text-[#4B5952] whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-md bg-[#F5F5F0] text-[11px]">
                        {tx.category}
                      </span>
                    </td>

                    {/* Account */}
                    <td className="py-3.5 px-4 text-[#788780] text-[11px] hidden md:table-cell whitespace-nowrap">
                      {tx.account || 'Checking'}
                    </td>

                    {/* Forensic Tags */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {tx.isAnomaly ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#FCF4EB] text-[#C97A2B] text-[10px] font-mono font-medium">
                          Spike Flagged
                        </span>
                      ) : tx.isRecurringCandidate ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#E3ECE8] text-[#153326] text-[10px] font-mono">
                          Recurring {tx.recurringCadence}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono text-[#A2B0A9]">—</span>
                      )}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-sm whitespace-nowrap">
                      <span
                        className={
                          tx.type === 'income' ? 'text-[#153326]' : 'text-[#16201B]'
                        }
                      >
                        {formatCurrency(tx.amount, {
                          showSign: tx.type === 'income',
                        })}
                      </span>
                    </td>

                    {/* Action buttons (Edit & Delete) */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="inline-flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEditTxModal(tx)}
                          className="p-1.5 rounded-lg text-[#62726A] hover:text-[#153326] hover:bg-[#F2F7F4] transition-colors cursor-pointer"
                          aria-label={`Edit ${tx.description}`}
                          title="Edit transaction"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingTx(tx)}
                          className="p-1.5 rounded-lg text-[#62726A] hover:text-[#B83A2E] hover:bg-[#FCF0EF] transition-colors cursor-pointer"
                          aria-label={`Delete ${tx.description}`}
                          title="Delete transaction"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-14 text-center">
                    <div className="max-w-xs mx-auto space-y-2">
                      <div className="w-10 h-10 rounded-full bg-[#F5F5F0] text-[#788780] flex items-center justify-center mx-auto">
                        <Search className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-medium text-[#16201B]">
                        No matching transactions found
                      </p>
                      <p className="text-[11px] text-[#62726A]">
                        Try adjusting your search terms, categories, or date range.
                      </p>
                      <button
                        onClick={handleResetAllFilters}
                        className="inline-block mt-2 px-3 py-1.5 rounded-lg bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalRecords > 0 && (
          <div className="p-4 bg-[#FBFBFA] border-t border-[#E6E6DF] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#62726A]">
            <div className="flex items-center gap-3">
              <span>
                Showing{' '}
                <strong className="font-mono text-[#16201B]">
                  {(clampedPage - 1) * pageSize + 1}
                </strong>
                –
                <strong className="font-mono text-[#16201B]">
                  {Math.min(clampedPage * pageSize, totalRecords)}
                </strong>{' '}
                of <strong className="font-mono text-[#16201B]">{totalRecords}</strong>
              </span>

              {/* Page size selector */}
              <div className="flex items-center gap-1.5 border-l border-[#E6E6DF] pl-3">
                <span className="text-[11px]">Rows:</span>
                <select
                  aria-label="Rows per page"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 text-xs rounded-lg border border-[#E6E6DF] bg-[#FFFFFF] text-[#16201B]"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={clampedPage <= 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E6E6DF] bg-[#FFFFFF] hover:bg-[#F5F5F0] text-xs font-medium text-[#16201B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Previous</span>
              </button>

              <span className="px-2 font-mono text-[11px] text-[#16201B]">
                Page {clampedPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={clampedPage >= totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E6E6DF] bg-[#FFFFFF] hover:bg-[#F5F5F0] text-xs font-medium text-[#16201B] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmModal
        isOpen={Boolean(deletingTx)}
        transaction={deletingTx}
        onClose={() => setDeletingTx(null)}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
