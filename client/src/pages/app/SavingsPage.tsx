import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, Sliders, ShieldCheck } from 'lucide-react'
import { useFinance } from '../../context/useFinance'
import { formatCurrency } from '../../lib/formatCurrency'

export const SavingsPage: React.FC = () => {
  const { savingsSummary } = useFinance()

  const [diningTrimPercent, setDiningTrimPercent] = useState<number>(20)
  const [cancelUnusedStreaming, setCancelUnusedStreaming] = useState<boolean>(true)
  const [mealPrepDays, setMealPrepDays] = useState<number>(2)

  // Simulation calculations based on realistic student baseline
  const baseDiningSpend = 8400 // ₹8,400/mo average dining & coffee
  const diningSavings = (baseDiningSpend * diningTrimPercent) / 100
  const streamingSavings = cancelUnusedStreaming ? 499 : 0 // Netflix standard
  const mealSavings = mealPrepDays * 450 * 4 // ₹450 saved per cook day * 4 weeks

  const simulatedMonthlyTotal = Math.round(diningSavings + streamingSavings + mealSavings)
  const simulatedSixMonth = simulatedMonthlyTotal * 6
  const simulatedAnnual = simulatedMonthlyTotal * 12

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
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-serif font-medium text-[#16201B]">
              Savings Opportunity Lab
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E3ECE8] text-[#153326]">
              SIMULATION ENGINE
            </span>
          </div>
          <p className="text-xs text-[#62726A] mt-0.5">
            Model behavioral spending adjustments and evaluate compound financial cushions.
          </p>
        </div>
      </div>

      {/* Honest Roadmap Notice for Phase 05 */}
      <div className="p-4 rounded-2xl bg-[#F2F7F4] border border-[#C2D3CC] text-xs text-[#1B4332] flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-[#2D6A4F] shrink-0 mt-0.5" />
        <div>
          <strong className="font-semibold block text-[#0E241B]">
            Phase 02 Interactive Preview Active
          </strong>
          <p className="text-[11px] text-[#35423B] mt-0.5 leading-relaxed">
            The opportunity simulation below models high-impact student levers. In <strong>Phase 05 (Savings Lab Engine)</strong>, we will implement dynamic plan commitments, goal-linked emergency fund tracking, and category-by-category burn rate targets.
          </p>
        </div>
      </div>

      {/* Interactive Simulation Sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column (7 cols) */}
        <div className="lg:col-span-7 bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-6 shadow-2xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-[#E6E6DF]">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[#153326]" />
              <h2 className="text-base font-serif font-medium text-[#16201B]">
                Adjust Simulation Variables
              </h2>
            </div>
            <span className="text-[10px] font-mono text-[#52796F]">
              REAL-TIME MODEL
            </span>
          </div>

          {/* Slider 1: Dining */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-[#16201B]">
              <span>Discretionary Dining &amp; Coffee Trim</span>
              <span className="font-mono text-[#153326] bg-[#E3ECE8] px-2 py-0.5 rounded text-[11px]">
                {diningTrimPercent}% ({formatCurrency(diningSavings)}/mo saved)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={diningTrimPercent}
              onChange={(e) => setDiningTrimPercent(Number(e.target.value))}
              className="w-full accent-[#153326] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#788780]">
              <span>0% (Current)</span>
              <span>20% (Recommended)</span>
              <span>40% (Aggressive)</span>
            </div>
          </div>

          {/* Toggle 2: Streaming */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF]">
            <div>
              <div className="text-xs font-medium text-[#16201B]">
                Trim Redundant Video Streaming Tier
              </div>
              <div className="text-[11px] text-[#62726A] mt-0.5">
                Consolidate personal Netflix Standard to family or student plan
              </div>
            </div>
            <button
              onClick={() => setCancelUnusedStreaming(!cancelUnusedStreaming)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                cancelUnusedStreaming
                  ? 'bg-[#153326] text-[#F2F7F4]'
                  : 'bg-[#F5F5F0] text-[#788780]'
              }`}
            >
              {cancelUnusedStreaming ? 'Included (+₹499)' : 'Off (₹0)'}
            </button>
          </div>

          {/* Slider 3: Campus Batch Meal Prep */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-medium text-[#16201B]">
              <span>Weekly Campus Meal Prep Days</span>
              <span className="font-mono text-[#153326] bg-[#E3ECE8] px-2 py-0.5 rounded text-[11px]">
                {mealPrepDays} days/wk ({formatCurrency(mealSavings)}/mo saved)
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="5"
              step="1"
              value={mealPrepDays}
              onChange={(e) => setMealPrepDays(Number(e.target.value))}
              className="w-full accent-[#153326] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[#788780]">
              <span>0 days (Frequent delivery)</span>
              <span>2 days (Target)</span>
              <span>5 days (Full cook)</span>
            </div>
          </div>
        </div>

        {/* Projection Column (5 cols) */}
        <div className="lg:col-span-5 bg-[#153326] text-[#F2F7F4] rounded-2xl p-6 shadow-md flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#1B4332] text-[#E3ECE8] text-[10px] font-mono mb-4 border border-[#2D6A4F]">
              <Sparkles className="w-3 h-3 text-[#74968C]" />
              <span>PROJECTED SAVINGS CUSHION</span>
            </div>

            <div className="text-xs font-mono text-[#9DB4AC] uppercase tracking-wider">
              Monthly Accumulated Cushion
            </div>
            <div className="text-4xl font-serif font-medium text-[#FFFFFF] mt-1 tracking-tight">
              +{formatCurrency(simulatedMonthlyTotal)}
              <span className="text-sm font-mono font-normal text-[#9DB4AC] ml-1">/mo</span>
            </div>

            <div className="mt-6 space-y-3 pt-4 border-t border-[#1B4332]">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9DB4AC]">6-Month Cushion:</span>
                <span className="font-mono font-medium text-[#FFFFFF]">
                  +{formatCurrency(simulatedSixMonth)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#9DB4AC]">1-Year Total Capital:</span>
                <span className="font-mono font-medium text-[#FFFFFF]">
                  +{formatCurrency(simulatedAnnual)}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-[#1B4332] text-[11px] text-[#9DB4AC] flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#74968C] shrink-0" />
            <span>Deterministic simulation based on current student transaction frequency</span>
          </div>
        </div>
      </div>

      {/* Identified High-Impact Scenarios in Portfolio */}
      <div className="bg-[#FFFFFF] border border-[#E6E6DF] rounded-2xl p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-serif font-medium text-[#16201B]">
          Pre-Calculated Opportunity Matrix
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {savingsSummary.scenarios.map((sc) => (
            <div
              key={sc.id}
              className="p-4 rounded-xl bg-[#FBFBFA] border border-[#E6E6DF] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E3ECE8] text-[#153326]">
                    {sc.category}
                  </span>
                  <span className="text-[10px] font-mono text-[#52796F]">
                    {sc.effort} Effort
                  </span>
                </div>
                <h3 className="text-xs font-semibold text-[#16201B] mt-2">
                  {sc.title}
                </h3>
                <p className="text-[11px] text-[#62726A] mt-1 leading-relaxed">
                  {sc.description}
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-[#E6E6DF] flex items-center justify-between text-xs font-mono">
                <span className="text-[#788780]">Estimated:</span>
                <span className="font-medium text-[#2D6A4F]">
                  +{formatCurrency(sc.potentialMonthlySavings)}/mo
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
