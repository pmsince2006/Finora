import React, { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { formatCurrency } from '../../lib/formatCurrency'

interface InteractiveScenarioTesterProps {
  onCommitPlan: () => void
}

export const InteractiveScenarioTester: React.FC<InteractiveScenarioTesterProps> = ({
  onCommitPlan,
}) => {
  const [diningReduction, setDiningReduction] = useState<number>(20) // percent
  const [cancelStreaming, setCancelStreaming] = useState<boolean>(true) // ₹299/mo
  const [prepCampusMeals, setPrepCampusMeals] = useState<boolean>(false) // ₹1,800/mo

  // INR Calculations
  const diningBaseSpend = 6500 // ₹6,500/mo average dining
  const diningSavings = (diningBaseSpend * diningReduction) / 100
  const streamingSavings = cancelStreaming ? 299 : 0
  const mealSavings = prepCampusMeals ? 1800 : 0

  const monthlyTotal = Math.round(diningSavings + streamingSavings + mealSavings)
  const sixMonthTotal = monthlyTotal * 6
  const annualTotal = monthlyTotal * 12

  return (
    <section id="savings-calculator" className="py-20 bg-[#FBFBFA] border-t border-[#E6E6DF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="font-mono text-xs text-[#52796F] uppercase tracking-wider block mb-2">
            SAVINGS CALCULATOR
          </span>
          <h2 className="text-3xl sm:text-4xl font-sans font-medium tracking-tight text-[#0C120F]">
            Try a monthly savings goal in{' '}
            <span className="font-serif italic font-normal text-[#153326]">
              real time.
            </span>
          </h2>
          <p className="mt-3 text-sm text-[#4B5952] max-w-xl mx-auto">
            Test the Savings Opportunity Lab engine below. See how small, targeted lifestyle adjustments accumulate into substantial student cushions.
          </p>
        </div>

        {/* Interactive Calculator Card */}
        <div className="max-w-4xl mx-auto rounded-2xl bg-white border border-[#E6E6DF] shadow-md p-6 sm:p-9 grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
          {/* Controls Column */}
          <div className="md:col-span-7 space-y-6">
            <div>
              <div className="flex items-center justify-between text-xs font-semibold text-[#16201B] mb-2">
                <span>Flexible Dining Out Adjustment</span>
                <span className="font-mono text-[#153326] bg-[#E3ECE8] px-2 py-0.5 rounded text-xs">
                  {diningReduction}% ({formatCurrency(Math.round(diningSavings))}/mo saved)
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="5"
                value={diningReduction}
                onChange={(e) => setDiningReduction(Number(e.target.value))}
                className="w-full accent-[#153326] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-[#788780] mt-1">
                <span>0%</span>
                <span>20% (Balanced)</span>
                <span>40% (Frugal)</span>
              </div>
            </div>

            {/* Toggles */}
            <div className="space-y-3 pt-2">
              <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] hover:bg-[#F5F5F0] transition-colors cursor-pointer select-none">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={cancelStreaming}
                    onChange={(e) => setCancelStreaming(e.target.checked)}
                    className="w-4 h-4 rounded text-[#153326] accent-[#153326] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-[#16201B] block">
                      Cancel 1 unused streaming subscription
                    </span>
                    <span className="text-[11px] text-[#788780]">
                      E.g. video or audio streaming service
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-[#2D6A4F]">+{formatCurrency(299)}/mo</span>
              </label>

              <label className="flex items-center justify-between p-3.5 rounded-xl border border-[#E6E6DF] bg-[#FBFBFA] hover:bg-[#F5F5F0] transition-colors cursor-pointer select-none">
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={prepCampusMeals}
                    onChange={(e) => setPrepCampusMeals(e.target.checked)}
                    className="w-4 h-4 rounded text-[#153326] accent-[#153326] cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-medium text-[#16201B] block">
                      Pack lunch twice a week
                    </span>
                    <span className="text-[11px] text-[#788780]">
                      Replaces campus café purchases
                    </span>
                  </div>
                </div>
                <span className="font-mono text-xs font-semibold text-[#2D6A4F]">+{formatCurrency(1800)}/mo</span>
              </label>
            </div>
          </div>

          {/* Results Summary Column */}
          <div className="md:col-span-5 bg-[#FBFBFA] rounded-xl border border-[#E6E6DF] p-6 text-center space-y-5">
            <div>
              <span className="font-mono text-[10px] uppercase tracking-wider text-[#788780] block">
                Estimated Monthly Savings
              </span>
              <div className="text-4xl font-serif font-bold text-[#153326] mt-1">
                +{formatCurrency(monthlyTotal)}
                <span className="text-xs font-mono font-normal text-[#788780]">/mo</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[#E6E6DF] text-left">
              <div className="p-2.5 rounded-lg bg-white border border-[#E6E6DF]">
                <span className="text-[10px] font-mono text-[#788780] block">6-Month Buffer</span>
                <span className="text-base font-serif font-bold text-[#16201B]">
                  +{formatCurrency(sixMonthTotal)}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-white border border-[#E6E6DF]">
                <span className="text-[10px] font-mono text-[#788780] block">1-Year Reserve</span>
                <span className="text-base font-serif font-bold text-[#2D6A4F]">
                  +{formatCurrency(annualTotal)}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#E3ECE8]/60 text-[11px] text-[#153326] text-left">
              <span className="font-semibold block">Realistic Milestone:</span>
              <span className="text-[#35423B]">
                {annualTotal > 30000
                  ? 'Covers semester books, exam fees, and emergency travel reserves.'
                  : 'Builds a solid security deposit and emergency fund.'}
              </span>
            </div>

            <button
              onClick={onCommitPlan}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] active:scale-98 transition-all shadow-xs cursor-pointer"
            >
              <span>Try this plan in the demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
