import React, { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, ArrowLeft, FileSpreadsheet } from 'lucide-react'
import { useFinance } from '../../context/useFinance'
import { formatCurrency } from '../../lib/formatCurrency'
import type { TransactionType } from '../../types/finance'

export const TransactionsPage: React.FC = () => {
  const { filteredTransactions, openAddTxModal } = useFinance()

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState<'ALL' | TransactionType>('ALL')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>()
    filteredTransactions.forEach((t) => set.add(t.category))
    return Array.from(set).sort()
  }, [filteredTransactions])

  // Filtered list based on search and dropdowns
  const displayedTransactions = useMemo(() => {
    return filteredTransactions.filter((tx) => {
      const matchesSearch =
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesType = selectedType === 'ALL' || tx.type === selectedType
      const matchesCategory = selectedCategory === 'ALL' || tx.category === selectedCategory

      return matchesSearch && matchesType && matchesCategory
    })
  }, [filteredTransactions, searchTerm, selectedType, selectedCategory])

  const totalFilteredInflow = useMemo(() => {
    return displayedTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [displayedTransactions])

  const totalFilteredOutflow = useMemo(() => {
    return displayedTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)
  }, [displayedTransactions])

  return (
    <div className="space-y-6">
      {/* Back Link & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E6E6DF]">
        <div>
          <Link
            to="/app"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#52796F] hover:text-[#153326] transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Overview</span>
          </Link>
          <h1 className="text-2xl font-serif font-medium text-[#16201B]">
            Money Ledger &amp; Transactions
          </h1>
          <p className="text-xs text-[#62726A] mt-0.5">
            Examine and filter raw transactions in the current forensic window.
          </p>
        </div>

        <button
          onClick={openAddTxModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] transition-colors shadow-xs self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 text-[#9DB4AC]" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Honest Roadmap Notice for Phase 03 */}
      <div className="p-4 rounded-2xl bg-[#F2F7F4] border border-[#C2D3CC] text-xs text-[#1B4332] flex items-start gap-3">
        <FileSpreadsheet className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-[#0E241B]">
            Phase 02 Interactive Preview Active
          </strong>
          <p className="text-[11px] text-[#35423B] mt-0.5 leading-relaxed">
            You can search, filter, and add demo transactions in-memory right now. Full automated bank statement parsing, persistent database storage, custom tags, and rule-based auto-categorization are scheduled for <strong>Phase 03 (Money Ledger)</strong>.
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Box */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-[#788780] absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search merchant, notes, or keyword..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] placeholder-[#A2B0A9] focus:outline-none focus:ring-1 focus:ring-[#1B4332] focus:border-[#1B4332] transition-colors"
            />
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
            >
              <option value="ALL">All Types (Inflow &amp; Debits)</option>
              <option value="income">Inflow Only</option>
              <option value="expense">Debits Only</option>
            </select>
          </div>

          {/* Category Filter */}
          <div className="sm:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] text-[#16201B] focus:outline-none focus:ring-1 focus:ring-[#1B4332]"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary Metrics Bar */}
        <div className="pt-2 border-t border-[#F5F5F0] flex flex-wrap items-center justify-between text-xs text-[#62726A] gap-2">
          <span>
            Showing <strong className="font-mono text-[#16201B]">{displayedTransactions.length}</strong> matching transaction{displayedTransactions.length !== 1 ? 's' : ''}
          </span>
          <div className="flex items-center gap-4 font-mono text-[11px]">
            <span className="text-[#2D6A4F]">
              Inflow: {formatCurrency(totalFilteredInflow)}
            </span>
            <span className="text-[#B83A2E]">
              Debits: {formatCurrency(totalFilteredOutflow)}
            </span>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#FBFBFA] border-b border-[#E6E6DF] text-[11px] font-mono uppercase text-[#788780]">
                <th className="py-3 px-4 font-medium">Merchant / Description</th>
                <th className="py-3 px-4 font-medium">Category</th>
                <th className="py-3 px-4 font-medium">Date</th>
                <th className="py-3 px-4 font-medium">Account</th>
                <th className="py-3 px-4 font-medium">Forensic Tags</th>
                <th className="py-3 px-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F5F0]">
              {displayedTransactions.length > 0 ? (
                displayedTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    className="hover:bg-[#FBFBFA] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-[#16201B]">{tx.description}</div>
                      {tx.notes && (
                        <div className="text-[11px] text-[#788780] font-normal mt-0.5 max-w-sm truncate">
                          {tx.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-[#4B5952]">
                      <span className="px-2.5 py-1 rounded-md bg-[#F5F5F0] text-[11px]">
                        {tx.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#62726A] text-[11px]">
                      {tx.date}
                    </td>
                    <td className="py-3.5 px-4 text-[#788780] text-[11px]">
                      {tx.account || 'Checking'}
                    </td>
                    <td className="py-3.5 px-4">
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
                    <td className="py-3.5 px-4 text-right font-mono font-medium text-sm">
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
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#788780]">
                    No transactions match your search filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
