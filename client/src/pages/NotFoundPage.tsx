import React from 'react'
import { Link } from 'react-router-dom'
import { Home, FileSearch } from 'lucide-react'
import { BrandLogo } from '../components/common/BrandLogo'

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#FBFBFA] text-[#16201B] flex flex-col items-center justify-center p-6 text-center">
      <div className="max-w-md w-full bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl shadow-lg p-8">
        <div className="flex justify-center mb-6">
          <BrandLogo size="md" showTagline />
        </div>

        <span className="font-mono text-xs text-[#C97A2B] bg-[#FCF4EB] px-3 py-1 rounded-full uppercase tracking-wider">
          Forensic Anomaly // 404
        </span>

        <h1 className="text-2xl font-serif font-medium text-[#16201B] mt-4">
          Case File Not Found
        </h1>

        <p className="text-xs text-[#62726A] mt-2 leading-relaxed">
          The requested coordinate or ledger path does not exist in the SpendSleuth investigation database.
        </p>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/app"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] transition-colors"
          >
            <FileSearch className="w-3.5 h-3.5" />
            <span>Open Dashboard</span>
          </Link>
          <Link
            to="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F5F5F0] hover:bg-[#E6E6DF] text-[#16201B] text-xs font-medium transition-colors"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Landing Page</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
