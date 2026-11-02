import React from 'react'

interface BrandLogoProps {
  className?: string
  showTagline?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  showTagline = false,
  size = 'md',
}) => {
  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-8 h-8',
    lg: 'w-10 h-10',
  }

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Sleuth Reticle Symbol */}
      <div
        className={`${iconSizes[size]} rounded-lg bg-[#153326] flex items-center justify-center shadow-xs transition-transform hover:scale-105 duration-200 shrink-0`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          className="w-4/5 h-4/5 text-[#E3ECE8]"
        >
          {/* Outer measurement ring */}
          <circle cx="11" cy="11" r="6.5" stroke="#E3ECE8" strokeWidth="1.75" />
          {/* Investigative crosshair reticle */}
          <line x1="11" y1="4.5" x2="11" y2="7" stroke="#74968C" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="11" y1="15" x2="11" y2="17.5" stroke="#74968C" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="4.5" y1="11" x2="7" y2="11" stroke="#74968C" strokeWidth="1.5" strokeLinecap="round" />
          <line x1="15" y1="11" x2="17.5" y2="11" stroke="#74968C" strokeWidth="1.5" strokeLinecap="round" />
          {/* Focal dot */}
          <circle cx="11" cy="11" r="1.5" fill="#E3ECE8" />
          {/* Handle / investigative pointer */}
          <path d="M16 16L20 20" stroke="#9DB4AC" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex flex-col text-left">
        <span className={`${textSizes[size]} font-sans font-semibold tracking-tight text-[#16201B] leading-none`}>
          Spend<span className="font-serif italic font-normal text-[#1B4332] ml-0.5">Sleuth</span>
        </span>
        {showTagline && (
          <span className="text-[10px] uppercase font-mono tracking-wider text-[#62726A] mt-0.5">
            Finance Intelligence
          </span>
        )}
      </div>
    </div>
  )
}
