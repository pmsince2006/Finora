import React from 'react'

export interface MicroSlatsProps {
  preset?: 'swell' | 'tide' | 'storm' | 'signal' | string
  color?: string
  glintColor?: string
  backgroundColor?: string
  slatWidth?: number
  slatHeight?: number
  gap?: number
  roundness?: number
  interactive?: boolean
  cursorStrength?: number
  cursorSize?: number
  swirl?: number
  trail?: number
  lean?: number
  intro?: boolean
  className?: string
  style?: React.CSSProperties
}

declare const MicroSlats: React.FC<MicroSlatsProps>
export default MicroSlats
