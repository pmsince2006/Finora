import React from 'react'
import { motion } from 'framer-motion'
import { FileUp, SearchCheck, PiggyBank, ArrowRight, Check } from 'lucide-react'

export const HowItWorks: React.FC = () => {
  const steps = [
    {
      number: '01',
      title: 'Import Transactions',
      subtitle: 'Canonical Data Ingestion',
      description:
        'Upload standard CSV exports from any financial institution or student account. Column mapping auto-detects dates, descriptions, and amounts with SHA-256 fingerprint deduplication.',
      features: [
        'Local CSV parsing with privacy protection',
        'Auto-column detection & header normalization',
        'Duplicate rejection & integer-cent precision',
      ],
      icon: FileUp,
      accentColor: 'text-[#1B4332]',
      tag: 'INGESTION ENGINE',
    },
    {
      number: '02',
      title: 'Investigate Patterns',
      subtitle: 'Rule-Based Pattern Detection',
      description:
        'Deterministic algorithms scan your history for regular billing intervals, amount drift, and statistical outliers against rolling 60-day category averages with complete mathematical explainability.',
      features: [
        'Cadence clustering (weekly, monthly, annual)',
        'Outlier z-score & spending velocity alerts',
        'Plain-language evidence drawers for every finding',
      ],
      icon: SearchCheck,
      accentColor: 'text-[#52796F]',
      tag: 'FORENSIC DETECTIVE',
    },
    {
      number: '03',
      title: 'Discover Potential Savings',
      subtitle: 'Scenario Simulation & Action',
      description:
        'Turn investigative findings directly into tangible capital. Run what-if simulations on discretionary spending and unneeded subscriptions to commit to realistic, milestone-tracked savings goals.',
      features: [
        'Interactive category reduction sliders',
        'Subscription cancellation yield forecasts',
        'Direct linkage between anomalies and saved goals',
      ],
      icon: PiggyBank,
      accentColor: 'text-[#2D6A4F]',
      tag: 'OPPORTUNITY LAB',
    },
  ]

  return (
    <section id="how-it-works" className="py-24 bg-[#FBFBFA] border-t border-[#E6E6DF] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-[#153326]" />
            <span className="font-mono text-xs text-[#52796F] uppercase tracking-wider">
              Forensic Workflow
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-sans font-medium tracking-tight text-[#0C120F]">
            How raw transactions become{' '}
            <span className="font-serif italic font-normal text-[#153326]">
              actionable capital.
            </span>
          </h2>
          <p className="mt-4 text-sm sm:text-base text-[#4B5952] leading-relaxed">
            SpendSleuth bridges the gap between passive bank statements and proactive wealth-building through a continuous three-stage investigative loop.
          </p>
        </div>

        {/* 3 Step Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.5, delay: idx * 0.15 }}
                className="relative rounded-2xl bg-[#FFFFFF] border border-[#E6E6DF] p-7 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group hover:border-[#C2D3CC]"
              >
                <div>
                  {/* Top Bar with Number & Tag */}
                  <div className="flex items-center justify-between pb-6 border-b border-[#E6E6DF]/80">
                    <span className="font-serif text-3xl text-[#153326] font-normal">
                      {step.number}
                    </span>
                    <span className="font-mono text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[#F5F5F0] text-[#62726A] border border-[#E6E6DF]">
                      {step.tag}
                    </span>
                  </div>

                  {/* Icon & Title */}
                  <div className="mt-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E3ECE8] text-[#153326] flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-[#16201B]">{step.title}</h3>
                      <span className="text-[11px] font-mono text-[#52796F]">{step.subtitle}</span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="mt-4 text-xs text-[#4B5952] leading-relaxed">
                    {step.description}
                  </p>

                  {/* Bullet Checklist */}
                  <ul className="mt-6 space-y-2.5">
                    {step.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-xs text-[#35423B]">
                        <Check className="w-3.5 h-3.5 text-[#2D6A4F] shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Bottom Step Indicator */}
                <div className="mt-8 pt-4 border-t border-[#E6E6DF] flex items-center justify-between text-[11px] font-mono text-[#788780]">
                  <span>STAGE {step.number} OF 03</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#52796F] group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
