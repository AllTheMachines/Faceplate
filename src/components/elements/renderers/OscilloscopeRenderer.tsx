import type { OscilloscopeElementConfig } from '../../../types/elements'

interface OscilloscopeRendererProps {
  config: OscilloscopeElementConfig
}

export function OscilloscopeRenderer({ config }: OscilloscopeRendererProps) {
  const divPercent = 100 / config.gridDivisions

  return (
    <div
      className="oscilloscope-element"
      data-type="oscilloscope"
      data-time-div={config.timeDiv}
      data-amplitude-scale={config.amplitudeScale}
      data-trigger-level={config.triggerLevel}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        border: `${config.borderWidth}px solid ${config.borderColor}`,
        borderRadius: '4px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Grid lines */}
      {config.showGrid && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: `
              linear-gradient(${config.gridColor} 1px, transparent 1px),
              linear-gradient(90deg, ${config.gridColor} 1px, transparent 1px)
            `,
            backgroundSize: `${divPercent}% ${divPercent}%`,
          }}
        />
      )}

      {/* Center crosshair */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: 0,
          right: 0,
          height: '1px',
          backgroundColor: config.gridColor,
          opacity: 0.8,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: 0,
          bottom: 0,
          width: '1px',
          backgroundColor: config.gridColor,
          opacity: 0.8,
        }}
      />

      {/* Placeholder sine wave */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0 }}
      >
        <path
          d="M0,50 Q12.5,20 25,50 T50,50 T75,50 T100,50"
          fill="none"
          stroke={config.traceColor}
          strokeWidth="2"
          opacity="0.6"
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
          color: config.traceColor,
          opacity: 0.7,
          fontSize: '12px',
          fontWeight: 500,
          userSelect: 'none',
        }}
      >
        Oscilloscope
      </div>
    </div>
  )
}
