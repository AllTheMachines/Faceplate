import type { WaveformElementConfig } from '../../../types/elements'

interface WaveformRendererProps {
  config: WaveformElementConfig
}

export function WaveformRenderer({ config }: WaveformRendererProps) {
  return (
    <div
      className="waveform-element"
      data-type="waveform"
      data-zoom-level={config.zoomLevel}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        border: `${config.borderWidth}px solid ${config.borderColor}`,
        borderRadius: 0,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grid lines (if enabled) */}
      {config.showGrid && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${config.gridColor} 1px, transparent 1px),
              linear-gradient(90deg, ${config.gridColor} 1px, transparent 1px)
            `,
            backgroundSize: '20% 50%',
            opacity: 0.5,
          }}
        />
      )}

      {/* Placeholder waveform visualization */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 50"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0 }}
      >
        <path
          d="M0,25 Q10,10 20,25 T40,25 T60,25 T80,25 T100,25"
          fill="none"
          stroke={config.waveformColor}
          strokeWidth="2"
          opacity="0.5"
        />
      </svg>

      {/* Label */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: config.waveformColor,
          opacity: 0.7,
          fontSize: '12px',
          fontWeight: 500,
          userSelect: 'none',
        }}
      >
        Waveform Display
      </div>
    </div>
  )
}
