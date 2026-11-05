import React, { useState } from 'react'
import {
  FileSpreadsheet,
  Repeat,
  AlertTriangle,
  PiggyBank,
  CheckCircle2,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  Check,
  ChevronRight,
} from 'lucide-react'
import { formatCurrency } from '../../lib/formatCurrency'

export const FeatureShowcase: React.FC = () => {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)

  // Interactive slider state for feature 4 preview (in INR)
  const [diningCutPercent, setDiningCutPercent] = useState(20)
  const baseDiningSpend = 6500 // ₹6,500/mo average dining
  const monthlySavings = Math.round((baseDiningSpend * diningCutPercent) / 100)
  const annualSavings = monthlySavings * 12

  const features = [
    {
      id: 'ledger',
      badge: 'FEATURE 01 // MONEY LEDGER',
      title: 'Money Ledger',
      subtitle: 'See your income and expenses in one clean place.',
      description:
        'Add your transactions manually or import a standard CSV file from your bank. Finora organizes everything clearly so you always know where your money goes.',
      highlights: [
        'Accurate calculations with no rounding discrepancies',
        'Simple CSV import with automatic column detection',
        'Automatic duplicate detection prevents double-counting',
        'Organized categories designed for students and young professionals',
      ],
      icon: FileSpreadsheet,
      accent: '#153326',
    },
    {
      id: 'detective',
      badge: 'FEATURE 02 // RECURRING PAYMENT DETECTIVE',
      title: 'Recurring Payment Detective',
      subtitle: 'Find payments that happen again and again, like subscriptions and monthly bills.',
      description:
        'Subscription creep can quietly eat into your monthly allowance. The Detective spots repeating weekly, monthly, and annual charges so you can review what you are actually using.',
      highlights: [
        'Recognizes regular weekly, monthly, and annual charges',
        'Catches price increases on recurring memberships',
        'Review and confirm which subscriptions you want to track',
        'Estimates your next 30-day and 90-day upcoming bills',
      ],
      icon: Repeat,
      accent: '#52796F',
    },
    {
      id: 'radar',
      badge: 'FEATURE 03 // SPENDING ANOMALY RADAR',
      title: 'Spending Anomaly Radar',
      subtitle: 'Spot spending that is higher than usual and see what changed.',
      description:
        'Rather than confusing charts, Finora compares purchases against your typical category averages. When an unusually high charge occurs, it gives you a clear, plain-language reason.',
      highlights: [
        'Highlights purchases that are significantly higher than normal',
        'Spots short-term spending spikes over a few days',
        'Plain-English reasons: "7x higher than your usual electronics average"',
        'One-click action to turn an unexpected cost into a savings target',
      ],
      icon: AlertTriangle,
      accent: '#C97A2B',
    },
    {
      id: 'lab',
      badge: 'FEATURE 04 // SAVINGS OPPORTUNITY LAB',
      title: 'Savings Opportunity Lab',
      subtitle: 'Try a new monthly spending target and see how much you could set aside.',
      description:
        'Explore how small changes can add up over time. Adjust sliders for flexible spending like dining out or streaming services, and see estimated savings over 6 months and a full year.',
      highlights: [
        'Interactive sliders with instant monthly and yearly estimates',
        'See the financial impact of canceling unused subscriptions',
        'Save plans as concrete goals and track them with new transactions',
        'Built for emergency cushions, semester expenses, and savings goals',
      ],
      icon: PiggyBank,
      accent: '#2D6A4F',
    },
  ]

  const currentFeature = features[activeFeatureIndex]

  return (
    <section id="features" className="py-24 bg-[#FFFFFF] border-t border-[#E6E6DF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-14">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#153326]" />
            <span className="font-mono text-xs text-[#52796F] uppercase tracking-wider">
              CORE FEATURES
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-sans font-medium tracking-tight text-[#0C120F]">
            Four helpful tools.{' '}
            <span className="font-serif italic font-normal text-[#153326]">
              One clear view of your money.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#4B5952] leading-relaxed">
            Finora brings transaction tracking, subscription detection, spending alerts, and savings planning together into one unified experience.
          </p>
        </div>

        {/* Feature Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-10 no-scrollbar border-b border-[#E6E6DF]">
          {features.map((feat, idx) => {
            const Icon = feat.icon
            const isActive = activeFeatureIndex === idx
            return (
              <button
                key={feat.id}
                onClick={() => setActiveFeatureIndex(idx)}
                className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-[#153326] text-[#F2F7F4] shadow-xs'
                    : 'bg-[#FBFBFA] text-[#4B5952] hover:bg-[#F5F5F0] border border-[#E6E6DF]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#9DB4AC]' : 'text-[#788780]'}`} />
                <span>{feat.title}</span>
              </button>
            )
          })}
        </div>

        {/* Active Feature Showcase Presentation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left: Description */}
          <div className="lg:col-span-6 space-y-6">
            <div>
              <span className="font-mono text-[11px] text-[#52796F] tracking-wide block mb-2">
                {currentFeature.badge}
              </span>
              <h3 className="text-2xl sm:text-3xl font-sans font-medium text-[#16201B] tracking-tight">
                {currentFeature.title}
              </h3>
              <p className="text-sm font-serif italic text-[#153326] mt-1">
                {currentFeature.subtitle}
              </p>
            </div>

            <p className="text-xs sm:text-sm text-[#4B5952] leading-relaxed">
              {currentFeature.description}
            </p>

            <div className="space-y-3 pt-2">
              {currentFeature.highlights.map((h, i) => (
                <div key={i} className="flex items-start gap-3 text-xs text-[#24302A]">
                  <div className="w-5 h-5 rounded-full bg-[#E3ECE8] text-[#153326] flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="leading-normal">{h}</span>
                </div>
              ))}
            </div>

            <div className="pt-4 flex items-center gap-4">
              <a
                href="#preview"
                className="inline-flex items-center gap-2 text-xs font-semibold text-[#153326] hover:text-[#2D6A4F] transition-colors"
              >
                <span>See it in the demo preview</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right: Live Interactive Card for the Selected Feature */}
          <div className="lg:col-span-6">
            {activeFeatureIndex === 0 && (
              /* Feature 1 Preview: Personal Money Ledger */
              <div className="p-5 sm:p-6 rounded-2xl bg-[#FBFBFA] border border-[#E6E6DF] shadow-xs space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E6DF]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                    <span className="text-xs font-semibold text-[#16201B]">Monthly Cash Flow &amp; Ledger</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E3ECE8] text-[#153326] font-medium">
                    APRIL 2026 // LIVE
                  </span>
                </div>

                {/* Cash-Flow Summary Strip */}
                <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] text-center">
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#52796F]">Inflow</div>
                    <div className="text-xs sm:text-sm font-mono font-semibold text-[#166534] mt-0.5">
                      +₹45,000
                    </div>
                  </div>
                  <div className="border-x border-[#E6E6DF]">
                    <div className="text-[10px] font-mono uppercase text-[#788780]">Outflow</div>
                    <div className="text-xs sm:text-sm font-mono font-semibold text-[#35423B] mt-0.5">
                      -₹24,350
                    </div>
                  </div>
                  <div>
                    <div className="text-[10px] font-mono uppercase text-[#52796F]">Net Cashflow</div>
                    <div className="text-xs sm:text-sm font-mono font-semibold text-[#153326] mt-0.5">
                      +₹20,650
                    </div>
                  </div>
                </div>

                {/* Ledger Entries List */}
                <div className="space-y-2">
                  <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] flex items-center justify-between hover:border-[#CBD5D0] transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[#16201B] truncate">
                          Software Engineering Stipend
                        </div>
                        <div className="text-[10px] text-[#62726A] truncate">
                          Apex Labs Tech • Direct Deposit
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-[#166534]">+₹40,000</span>
                      <span className="block text-[9px] font-mono uppercase text-[#52796F]">Income</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] flex items-center justify-between hover:border-[#CBD5D0] transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#F5F5F0] text-[#35423B] flex items-center justify-center shrink-0">
                        <ArrowDownRight className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[#16201B] truncate">
                          Apartment Rent &amp; Maintenance
                        </div>
                        <div className="text-[10px] text-[#62726A] truncate">
                          Urban Spaces • Housing
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-[#16201B]">-₹12,500</span>
                      <span className="block text-[9px] font-mono uppercase text-[#788780]">Housing</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] flex items-center justify-between hover:border-[#CBD5D0] transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#F5F5F0] text-[#35423B] flex items-center justify-center shrink-0">
                        <ArrowDownRight className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[#16201B] truncate">
                          Third Wave Coffee Roasters
                        </div>
                        <div className="text-[10px] text-[#62726A] truncate">
                          Cold brew &amp; study • Dining
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-[#16201B]">-₹380</span>
                      <span className="block text-[9px] font-mono uppercase text-[#788780]">Dining</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] flex items-center justify-between hover:border-[#CBD5D0] transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#DCFCE7] text-[#15803D] flex items-center justify-center shrink-0">
                        <ArrowUpRight className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-medium text-[#16201B] truncate">
                          Freelance Design Sprint
                        </div>
                        <div className="text-[10px] text-[#62726A] truncate">
                          Campus Studio • Client Credit
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs font-mono font-bold text-[#166534]">+₹5,000</span>
                      <span className="block text-[9px] font-mono uppercase text-[#52796F]">Income</span>
                    </div>
                  </div>
                </div>

                {/* Subtitle indicator footer */}
                <div className="p-2.5 rounded-xl bg-[#F2F7F4] border border-[#C2D3CC] flex items-center gap-2 text-[11px] text-[#153326]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0" />
                  <span>Clear view of all money in and money out • No double-counting</span>
                </div>
              </div>
            )}

            {activeFeatureIndex === 1 && (
              /* Feature 2 Preview: Recurring Payment Detective */
              <div className="p-6 rounded-2xl bg-[#FBFBFA] border border-[#E6E6DF] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E6DF]">
                  <span className="text-xs font-semibold text-[#16201B]">Found Subscription</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E3ECE8] text-[#153326]">
                    MONTHLY BILL
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E6E6DF] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#16201B]">Netflix Basic Plan</div>
                      <div className="text-xs text-[#62726A]">Digital Entertainment • Monthly billing</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-[#16201B]">{formatCurrency(199)}/mo</div>
                      <div className="text-[10px] text-[#52796F] font-mono">{formatCurrency(2388)}/yr</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#788780]">
                      <span>Repeat Pattern Score</span>
                      <span className="font-mono text-[#153326] font-semibold">98% regular</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#E6E6DF] overflow-hidden">
                      <div className="h-full bg-[#2D6A4F] rounded-full" style={{ width: '98%' }} />
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-[#62726A] pt-1">
                    Evidence: Billed on Mar 14 ({formatCurrency(199)}), Feb 14 ({formatCurrency(199)}), Jan 14 ({formatCurrency(199)})
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 py-2 px-3 rounded-lg bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] transition-colors cursor-pointer">
                    Confirm Subscription
                  </button>
                  <button className="py-2 px-3 rounded-lg bg-[#FFFFFF] border border-[#E6E6DF] text-[#62726A] text-xs hover:bg-[#F5F5F0] transition-colors cursor-pointer">
                    Ignore
                  </button>
                </div>
              </div>
            )}

            {activeFeatureIndex === 2 && (
              /* Feature 3 Preview: Spending Anomaly Radar */
              <div className="p-6 rounded-2xl bg-[#FCF4EB]/70 border border-[#F3D7BD] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#F3D7BD]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#C97A2B] animate-pulse" />
                    <span className="text-xs font-semibold text-[#7A400B]">Unusual Spending Alert</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FCF4EB] text-[#C97A2B] font-bold border border-[#F3D7BD]">
                    HIGHER THAN USUAL
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#F3D7BD] space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#16201B]">Campus Electronics Store</div>
                      <div className="text-xs text-[#788780]">Hardware &amp; Equipment</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-[#B83A2E]">{formatCurrency(8450)}</div>
                      <div className="text-[10px] text-[#788780]">Usual average: {formatCurrency(1200)}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FCF4EB] text-[11px] text-[#7A400B] font-mono">
                    NOTICE: This purchase is 7x higher than your usual electronics average of {formatCurrency(1200)}.
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#62726A]">
                    <span>Recorded on Apr 24, 2026</span>
                    <span className="text-[#C97A2B] font-semibold">Flagged for review</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 py-2 px-3 rounded-lg bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] transition-colors cursor-pointer">
                    Turn into Savings Goal
                  </button>
                  <button className="py-2 px-3 rounded-lg bg-white border border-[#E6E6DF] text-[#62726A] text-xs hover:bg-[#F5F5F0] transition-colors cursor-pointer">
                    Dismiss (One-off)
                  </button>
                </div>
              </div>
            )}

            {activeFeatureIndex === 3 && (
              /* Feature 4 Preview: Savings Opportunity Lab */
              <div className="p-6 rounded-2xl bg-[#F2F7F4] border border-[#C2D3CC] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#C2D3CC]">
                  <span className="text-xs font-semibold text-[#153326]">Interactive Savings Calculator</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#2D6A4F] border border-[#C2D3CC]">
                    WHAT-IF MODEL
                  </span>
                </div>

                {/* Interactive Slider */}
                <div className="p-4 rounded-xl bg-white border border-[#C2D3CC] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#16201B]">Flexible Dining Out Adjustment</span>
                    <span className="font-mono font-bold text-[#153326] bg-[#E3ECE8] px-2 py-0.5 rounded">
                      -{diningCutPercent}%
                    </span>
                  </div>

                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="5"
                    value={diningCutPercent}
                    onChange={(e) => setDiningCutPercent(Number(e.target.value))}
                    className="w-full accent-[#153326] cursor-pointer"
                  />

                  <div className="flex justify-between text-[10px] font-mono text-[#788780]">
                    <span>5% (Gentle)</span>
                    <span>20% (Recommended)</span>
                    <span>40% (Ambitious)</span>
                  </div>

                  {/* Projected Savings in INR */}
                  <div className="pt-3 border-t border-[#E6E6DF] grid grid-cols-2 gap-3 text-center">
                    <div className="p-2.5 rounded-lg bg-[#FBFBFA] border border-[#E6E6DF]">
                      <span className="text-[10px] font-mono text-[#788780] block">Monthly Savings</span>
                      <span className="text-base font-serif font-bold text-[#153326]">
                        +{formatCurrency(monthlySavings)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#FBFBFA] border border-[#E6E6DF]">
                      <span className="text-[10px] font-mono text-[#788780] block">Annual Savings</span>
                      <span className="text-base font-serif font-bold text-[#2D6A4F]">
                        +{formatCurrency(annualSavings)}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="w-full py-2.5 px-3 rounded-lg bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <span>Save this monthly goal</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
