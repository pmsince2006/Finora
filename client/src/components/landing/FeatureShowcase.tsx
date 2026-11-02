import React, { useState } from 'react'
import {
  FileSpreadsheet,
  Repeat,
  AlertTriangle,
  PiggyBank,
  CheckCircle2,
  ArrowRight,
  Check,
  ChevronRight,
} from 'lucide-react'

export const FeatureShowcase: React.FC = () => {
  const [activeFeatureIndex, setActiveFeatureIndex] = useState(0)

  // Interactive slider state for feature 4 preview
  const [diningCutPercent, setDiningCutPercent] = useState(20)

  const features = [
    {
      id: 'ledger',
      badge: 'FEATURE 01 // CANONICAL RECORD',
      title: 'Money Ledger',
      subtitle: 'Forensic transaction record with integer-cent accuracy.',
      description:
        'Every financial calculation rests on an unshakeable foundation. SpendSleuth stores amounts in minor units (integer cents) to eliminate IEEE-754 floating-point drift, while intelligent CSV column mapping ingests messy bank exports cleanly.',
      highlights: [
        'Integer-cent storage eliminates fractional rounding errors',
        'Intelligent CSV column mapper with live preview & mapping recall',
        'SHA-256 fingerprint deduplication flags repeated imports',
        'Structured category taxonomy optimized for students & young professionals',
      ],
      icon: FileSpreadsheet,
      accent: '#153326',
    },
    {
      id: 'detective',
      badge: 'FEATURE 02 // CADENCE SURVEILLANCE',
      title: 'Recurring Payment Detective',
      subtitle: 'Identify sneaky renewals and hidden monthly commitments.',
      description:
        'Subscription creep drains student and graduate budgets silently. The Detective analyzes interval regularity (weekly, bi-weekly, monthly, annual) and amount variance, calculating an explainable confidence score for every candidate.',
      highlights: [
        'Deterministic cadence clustering with tolerance windows',
        'Amount variance tolerance detects creeping price hikes',
        'User review lifecycle: Confirm, Ignore, or Adjust detected rules',
        '30/60/90-day forward cashflow forecasting for active commitments',
      ],
      icon: Repeat,
      accent: '#52796F',
    },
    {
      id: 'radar',
      badge: 'FEATURE 03 // STATISTICAL ANOMALY DETECTION',
      title: 'Spending Anomaly Radar',
      subtitle: 'Mathematically explainable alerts—never opaque guesswork.',
      description:
        'Instead of generic alert notifications, SpendSleuth models your rolling 60-day baseline per category. Outliers are flagged using z-score thresholds, 48-hour burst velocity, and unexpected merchant recognition with plain-language evidence.',
      highlights: [
        'Z-score outlier detection (flags outlays > 2.5x normal standard deviation)',
        '48-hour velocity spikes identify uncharacteristic shopping clusters',
        'Clear mathematical explanations: "3.4x higher than your $45 grocery baseline"',
        'Direct 1-click action: route any anomaly into an actionable savings plan',
      ],
      icon: AlertTriangle,
      accent: '#C97A2B',
    },
    {
      id: 'lab',
      badge: 'FEATURE 04 // INTERACTIVE SIMULATION',
      title: 'Savings Opportunity Lab',
      subtitle: 'Interactive what-if scenarios turned into committed goals.',
      description:
        'Closing the loop between investigation and action. Test what happens when you cut dining out by 15% or drop two unused streaming subscriptions. View 30-day, 6-month, and 1-year compounded yield forecasts.',
      highlights: [
        'Interactive discretionary spending sliders with instant yield math',
        'Subscription cancellation impact modeling',
        'Save scenarios as concrete milestones with ledger progress tracking',
        'Designed specifically for emergency fund & tuition cushion building',
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
              Core Intelligence Modules
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-sans font-medium tracking-tight text-[#0C120F]">
            Four specialized engines.{' '}
            <span className="font-serif italic font-normal text-[#153326]">
              One canonical dataset.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#4B5952] leading-relaxed">
            SpendSleuth unites transaction ingestion, pattern detection, statistical vigilance, and savings modeling into a cohesive investigative platform.
          </p>
        </div>

        {/* Feature Navigation Tabs (Steep-inspired clean segmented buttons) */}
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
          {/* Left: Deep Dive Editorial Description */}
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
                <span>Inspect in live dashboard preview</span>
                <ChevronRight className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Right: Live Interactive Card for the Selected Feature */}
          <div className="lg:col-span-6">
            {activeFeatureIndex === 0 && (
              /* Feature 1 Preview: Money Ledger Ingestion & Dedup */
              <div className="p-6 rounded-2xl bg-[#FBFBFA] border border-[#E6E6DF] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E6DF]">
                  <span className="text-xs font-semibold text-[#16201B]">CSV Ingestion &amp; Column Mapping</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E3ECE8] text-[#153326]">
                    PARSER READY
                  </span>
                </div>

                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg bg-white border border-[#E6E6DF] flex items-center justify-between">
                    <span className="text-[#62726A]">Header: [Posting Date]</span>
                    <span className="text-[#153326] font-bold">Mapped $\rightarrow$ date (ISO 8601)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E6E6DF] flex items-center justify-between">
                    <span className="text-[#62726A]">Header: [Description]</span>
                    <span className="text-[#153326] font-bold">Mapped $\rightarrow$ rawMerchant</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white border border-[#E6E6DF] flex items-center justify-between">
                    <span className="text-[#62726A]">Header: [Amount (USD)]</span>
                    <span className="text-[#153326] font-bold">Mapped $\rightarrow$ amountInCents (int)</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[#F2F7F4] border border-[#C2D3CC] text-xs text-[#153326]">
                  <div className="font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-[#2D6A4F]" />
                    <span>Fingerprint Deduplication Active</span>
                  </div>
                  <p className="text-[11px] text-[#4B5952] mt-1">
                    SHA-256 hashes each row's date, normalized merchant, and integer cents. Zero risk of double-counting.
                  </p>
                </div>
              </div>
            )}

            {activeFeatureIndex === 1 && (
              /* Feature 2 Preview: Recurring Payment Detective */
              <div className="p-6 rounded-2xl bg-[#FBFBFA] border border-[#E6E6DF] shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[#E6E6DF]">
                  <span className="text-xs font-semibold text-[#16201B]">Candidate Subscription Audit</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#E3ECE8] text-[#153326]">
                    30-DAY REGULARITY
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#E6E6DF] space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#16201B]">Netflix Standard HD</div>
                      <div className="text-xs text-[#62726A]">Digital Entertainment • Monthly billing</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-[#16201B]">$15.49/mo</div>
                      <div className="text-[10px] text-[#52796F] font-mono">$185.88/yr</div>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#788780]">
                      <span>Cadence Confidence</span>
                      <span className="font-mono text-[#153326] font-semibold">98.4%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#E6E6DF] overflow-hidden">
                      <div className="h-full bg-[#2D6A4F] rounded-full" style={{ width: '98%' }} />
                    </div>
                  </div>

                  <div className="text-[11px] font-mono text-[#62726A] pt-1">
                    Evidence: Billed on Mar 14 ($15.49), Feb 14 ($15.49), Jan 14 ($15.49)
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 py-2 px-3 rounded-lg bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] transition-colors cursor-pointer">
                    Confirm Recurring Rule
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
                    <span className="text-xs font-semibold text-[#7A400B]">Anomaly Investigation Card</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FCF4EB] text-[#C97A2B] font-bold border border-[#F3D7BD]">
                    HIGH SEVERITY
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-white border border-[#F3D7BD] space-y-2.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#16201B]">Campus Tech Store</div>
                      <div className="text-xs text-[#788780]">Electronics &amp; Hardware</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-[#B83A2E]">$342.00</div>
                      <div className="text-[10px] text-[#788780]">Baseline: $45.00</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-[#FCF4EB] text-[11px] text-[#7A400B] font-mono">
                    RULE TRIGGERED: Z-Score 3.82 (&gt; 2.5 threshold). Single transaction represents 760% of average category outlay.
                  </div>

                  <div className="flex items-center justify-between pt-1 text-[11px] text-[#62726A]">
                    <span>Detected on Apr 24, 2026</span>
                    <span className="text-[#C97A2B] font-semibold">Flagged for user review</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button className="flex-1 py-2 px-3 rounded-lg bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] transition-colors cursor-pointer">
                    Convert to Savings Target
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
                  <span className="text-xs font-semibold text-[#153326]">Live Interactive Simulation</span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-[#2D6A4F] border border-[#C2D3CC]">
                    WHAT-IF MODEL
                  </span>
                </div>

                {/* Interactive Slider */}
                <div className="p-4 rounded-xl bg-white border border-[#C2D3CC] space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#16201B]">Adjust Discretionary Dining</span>
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
                    <span>5% (Conservative)</span>
                    <span>20% (Recommended)</span>
                    <span>40% (Aggressive)</span>
                  </div>

                  {/* Projected Capital Yield */}
                  <div className="pt-3 border-t border-[#E6E6DF] grid grid-cols-2 gap-3 text-center">
                    <div className="p-2.5 rounded-lg bg-[#FBFBFA] border border-[#E6E6DF]">
                      <span className="text-[10px] font-mono text-[#788780] block">Monthly Yield</span>
                      <span className="text-base font-serif font-bold text-[#153326]">
                        +${Math.round((diningCutPercent * 450) / 100)}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#FBFBFA] border border-[#E6E6DF]">
                      <span className="text-[10px] font-mono text-[#788780] block">Annual Reserve</span>
                      <span className="text-base font-serif font-bold text-[#2D6A4F]">
                        +${Math.round((diningCutPercent * 450 * 12) / 100)}
                      </span>
                    </div>
                  </div>
                </div>

                <button className="w-full py-2.5 px-3 rounded-lg bg-[#153326] text-[#F2F7F4] text-xs font-medium hover:bg-[#1B4332] transition-colors flex items-center justify-center gap-2 cursor-pointer">
                  <span>Commit Scenario to Savings Goals</span>
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
