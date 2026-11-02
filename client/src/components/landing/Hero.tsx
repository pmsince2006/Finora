import React from 'react'
import { motion, type Variants } from 'framer-motion'
import { ArrowRight, Shield, Sparkles, FileSearch } from 'lucide-react'

interface HeroProps {
  onStartInvestigating: () => void
  onExploreProduct: () => void
}

export const Hero: React.FC<HeroProps> = ({ onStartInvestigating, onExploreProduct }) => {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.1,
      },
    },
  }

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  }

  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Refined and responsive background grid lines (contained & subtle) */}
      <div className="absolute inset-0 max-w-7xl mx-auto pointer-events-none select-none opacity-40 -z-10" aria-hidden="true">
        <div className="absolute left-6 top-32 text-xs font-mono text-[#A2B0A9]">
          +
        </div>
        <div className="absolute right-6 top-32 text-xs font-mono text-[#A2B0A9]">
          +
        </div>
        <div className="hidden sm:block absolute left-1/4 top-40 text-[10px] font-mono text-[#CBD5D0]">
          +
        </div>
        <div className="hidden sm:block absolute right-1/4 top-40 text-[10px] font-mono text-[#CBD5D0]">
          +
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center"
        >
          {/* Meaningful, Clean Eyebrow Badge (Issue 1 & 3: Friendly & Relevant) */}
          <motion.div variants={itemVariants} className="mb-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#E3ECE8]/80 border border-[#C2D3CC] text-[11px] font-mono tracking-wide text-[#153326] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2D6A4F] animate-pulse" />
              <span>PERSONAL FINANCE INTELLIGENCE</span>
            </span>
          </motion.div>

          {/* Centered Serif Editorial Headline */}
          <motion.h1
            variants={itemVariants}
            className="text-4xl sm:text-6xl md:text-7xl font-sans font-medium tracking-tight text-[#0C120F] leading-[1.1] max-w-3xl"
          >
            Your money.{' '}
            <span className="font-serif italic font-normal text-[#153326] block sm:inline-block mt-1 sm:mt-0">
              Under investigation.
            </span>
          </motion.h1>

          {/* Supporting Copy (Issue 3: Simple, natural English) */}
          <motion.p
            variants={itemVariants}
            className="mt-6 text-base sm:text-lg text-[#4B5952] max-w-2xl font-normal leading-relaxed text-balance"
          >
            SpendSleuth helps you understand your money by finding recurring subscriptions, spotting unusually high spending, and exploring realistic ways to save.
          </motion.p>

          {/* Primary & Secondary Call to Actions */}
          <motion.div
            variants={itemVariants}
            className="mt-9 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto"
          >
            <button
              onClick={onStartInvestigating}
              className="w-full sm:w-auto group inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#153326] text-[#F2F7F4] text-sm font-medium hover:bg-[#1B4332] active:scale-98 transition-all shadow-sm hover:shadow cursor-pointer"
            >
              <FileSearch className="w-4 h-4 text-[#9DB4AC]" />
              <span>Start investigating</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <button
              onClick={onExploreProduct}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl bg-[#FFFFFF] border border-[#E6E6DF] text-[#16201B] text-sm font-medium hover:bg-[#F5F5F0] hover:border-[#D4D4CA] transition-all shadow-2xs cursor-pointer"
            >
              <span>Explore the product</span>
            </button>
          </motion.div>

          {/* Editorial Trust & Privacy Notice */}
          <motion.div
            variants={itemVariants}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-[#62726A]"
          >
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#52796F]" />
              <span>No bank passwords needed</span>
            </div>
            <span className="text-[#D4D4CA] hidden sm:inline">•</span>
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#52796F]" />
              <span>Clear, explainable calculations</span>
            </div>
            <span className="text-[#D4D4CA] hidden sm:inline">•</span>
            <span>Manual entries &amp; CSV files</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
