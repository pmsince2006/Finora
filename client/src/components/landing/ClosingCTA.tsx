import React from 'react'
import { motion } from 'framer-motion'
import { ArrowRight, Shield, FileSearch, Sparkles } from 'lucide-react'

interface ClosingCTAProps {
  onStartInvestigating: () => void
  onExploreDemo: () => void
}

export const ClosingCTA: React.FC<ClosingCTAProps> = ({
  onStartInvestigating,
  onExploreDemo,
}) => {
  return (
    <section className="py-24 bg-[#FFFFFF] border-t border-[#E6E6DF] relative overflow-hidden">
      {/* Decorative Subtle Background Glow / Texture */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-[#E3ECE8]/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#E3ECE8] border border-[#C2D3CC] text-[11px] font-mono text-[#153326]">
            <Sparkles className="w-3.5 h-3.5 text-[#2D6A4F]" />
            <span>START TODAY</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-sans font-medium tracking-tight text-[#0C120F]">
            Take control of your money before{' '}
            <span className="font-serif italic font-normal text-[#153326] block sm:inline-block">
              small expenses add up.
            </span>
          </h2>

          <p className="max-w-xl mx-auto text-sm sm:text-base text-[#4B5952] leading-relaxed">
            Import your recent transactions from a CSV file or explore the sample student demo to see how Finora brings clarity to your everyday spending.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <button
              onClick={onStartInvestigating}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#153326] text-[#F2F7F4] text-sm font-medium hover:bg-[#1B4332] active:scale-98 transition-all shadow-sm cursor-pointer"
            >
              <FileSearch className="w-4 h-4 text-[#9DB4AC]" />
              <span>Start investigating now</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={onExploreDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] text-[#16201B] text-sm font-medium hover:bg-[#F5F5F0] transition-colors shadow-2xs cursor-pointer"
            >
              <span>Explore student demo</span>
            </button>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-[#788780]">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#52796F]" />
              <span>No bank passwords needed</span>
            </div>
            <span>•</span>
            <span>Local CSV file imports</span>
            <span>•</span>
            <span>Built for students &amp; young professionals</span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
