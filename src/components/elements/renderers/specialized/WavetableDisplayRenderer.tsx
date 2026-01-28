import { WavetableDisplayElementConfig } from '../../../../types/elements'

interface WavetableDisplayRendererProps {
  config: WavetableDisplayElementConfig
}

// Generate mock waveform data for a frame
function generateWaveform(frameIndex: number, points: number): number[] {
  const data: number[] = []
  for (let i = 0; i < points; i++) {
    const t = i / points
    // Create evolving waveform based on frame index
    const fundamental = Math.sin(t * Math.PI * 2)
    const harmonic2 = Math.sin(t * Math.PI * 4) * (0.5 - frameIndex * 0.02)
    const harmonic3 = Math.sin(t * Math.PI * 6) * (0.3 - frameIndex * 0.01)
    data.push((fundamental + harmonic2 + harmonic3) / 1.8)
  }
  return data
}

export function WavetableDisplayRenderer({ config }: WavetableDisplayRendererProps) {
  const {
    frameCount,
    currentFrame,
    perspectiveAngle,
    frameSpacing,
    waveformColor,
    currentFrameColor,
    backgroundColor,
    gridColor,
    showGrid,
    fillWaveform,
    width,
    height,
  } = config

  const points = 64
  const waveHeight = height * 0.4
  const baseY = height * 0.8

  // Generate paths for each frame
  const frames = []
  for (let f = 0; f < frameCount; f++) {
    const waveform = generateWaveform(f, points)
    const yOffset = -f * frameSpacing
    const xOffset = f * (perspectiveAngle / 90) * 20
    const opacity = 0.3 + (f / frameCount) * 0.7

    let pathD = ''
    waveform.forEach((val, i) => {
      const x = xOffset + (i / points) * (width - xOffset * 2)
      const y = baseY + yOffset + val * waveHeight * -1
      pathD += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
    })

    const isCurrent = f === currentFrame
    const color = isCurrent ? currentFrameColor : waveformColor

    frames.push(
      <g key={f} opacity={opacity}>
        {fillWaveform && (
          <path
            d={`${pathD} L ${width - xOffset * 2 + xOffset} ${baseY + yOffset} L ${xOffset} ${baseY + yOffset} Z`}
            fill={color}
            fillOpacity={0.2}
          />
        )}
        <path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={isCurrent ? 2 : 1}
        />
      </g>
    )
  }

  // Grid lines
  const gridLines = []
  if (showGrid) {
    // Horizontal center line
    gridLines.push(
      <line
        key="center"
        x1={0}
        y1={baseY}
        x2={width}
        y2={baseY}
        stroke={gridColor}
        strokeWidth={1}
        strokeDasharray="4 4"
      />
    )
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ backgroundColor, borderRadius: 4 }}
    >
      {gridLines}
      {frames}
    </svg>
  )
}
