import React from 'react'
import MicroSlats from '../MicroSlats'

/**
 * Shared full-viewport MicroSlats background layer for Finora authentication pages.
 * Configured with emerald green slats (#10b981), white glints (#ffffff), and a black backdrop (#000000).
 */
export const AuthBackground: React.FC = () => {
  return (
    <div
      className="fixed inset-0 w-full h-[100dvh] overflow-hidden -z-10 pointer-events-none select-none bg-black"
      aria-hidden="true"
    >
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <MicroSlats
          preset="swell"
          color="#10b981"
          glintColor="#ffffff"
          backgroundColor="#000000"
          slatWidth={10}
          slatHeight={25}
          gap={3}
          roundness={0.75}
          interactive
          cursorStrength={1}
          cursorSize={40}
          swirl={0}
          trail={1.4}
          lean={0}
          intro
        />
      </div>

      {/* Subtle, restrained ambient dark radial vignette to enhance form readability while preserving slats */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.65) 100%)',
        }}
      />
    </div>
  )
}
