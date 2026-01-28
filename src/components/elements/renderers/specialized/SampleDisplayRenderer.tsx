import React, { useRef, useCallback, useEffect, useState } from 'react'
import { SampleDisplayElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'

interface SampleDisplayRendererProps {
  config: SampleDisplayElementConfig
}

// Generate mock waveform data
function generateMockWaveform(samples: number): number[] {
  const data: number[] = []
  for (let i = 0; i < samples; i++) {
    // Create a more realistic waveform pattern
    const t = i / samples
    const envelope = Math.sin(t * Math.PI) // Fade in/out
    const frequency = 4 + Math.sin(t * 6) * 2
    const wave = Math.sin(t * frequency * Math.PI * 20) * envelope
    const noise = (Math.random() - 0.5) * 0.1
    data.push(wave + noise)
  }
  return data
}

export function SampleDisplayRenderer({ config }: SampleDisplayRendererProps) {
  const updateElement = useStore((state) => state.updateElement)
  const containerRef = useRef<SVGSVGElement>(null)
  const [isDragging, setIsDragging] = useState<'pan' | 'selection' | null>(null)
  const dragStartRef = useRef<{ x: number; viewStart: number; viewEnd: number }>({ x: 0, viewStart: 0, viewEnd: 1 })

  const {
    viewStart,
    viewEnd,
    selectionStart,
    selectionEnd,
    showSelection,
    showZeroLine,
    showTimeRuler,
    showPeaks,
    waveformColor,
    peakColor,
    zeroLineColor,
    selectionColor,
    backgroundColor,
    rulerColor,
    labelColor,
    fontSize,
    fontFamily,
    fontWeight,
    width,
    height,
  } = config

  const rulerHeight = showTimeRuler ? 20 : 0
  const waveformHeight = height - rulerHeight
  const waveformCenter = waveformHeight / 2

  // Generate mock waveform data
  const [waveformData] = useState(() => generateMockWaveform(1000))

  // Calculate visible range
  const visibleStart = Math.floor(viewStart * waveformData.length)
  const visibleEnd = Math.ceil(viewEnd * waveformData.length)
  const visibleSamples = visibleEnd - visibleStart

  // Generate waveform path
  const generateWaveformPath = () => {
    const points: string[] = []
    const samplesPerPixel = Math.max(1, Math.floor(visibleSamples / width))

    for (let x = 0; x < width; x++) {
      const sampleIndex = visibleStart + Math.floor((x / width) * visibleSamples)
      const endSampleIndex = Math.min(sampleIndex + samplesPerPixel, waveformData.length)

      // Find min/max in this range for better visualization
      let minVal = 0
      let maxVal = 0
      for (let i = sampleIndex; i < endSampleIndex; i++) {
        const val = waveformData[i] || 0
        minVal = Math.min(minVal, val)
        maxVal = Math.max(maxVal, val)
      }

      const y = waveformCenter - maxVal * (waveformHeight / 2 - 4)

      if (x === 0) {
        points.push(`M ${x} ${y}`)
      } else {
        points.push(`L ${x} ${y}`)
      }
    }

    // Return path and mirror it
    return points.join(' ')
  }

  // Generate peak indicators
  const generatePeaks = () => {
    const peaks: { x: number; level: number }[] = []
    const samplesPerPixel = Math.max(1, Math.floor(visibleSamples / width))

    for (let x = 0; x < width; x += 10) {
      const sampleIndex = visibleStart + Math.floor((x / width) * visibleSamples)
      const endSampleIndex = Math.min(sampleIndex + samplesPerPixel * 10, waveformData.length)

      let maxAbs = 0
      for (let i = sampleIndex; i < endSampleIndex; i++) {
        maxAbs = Math.max(maxAbs, Math.abs(waveformData[i] || 0))
      }

      if (maxAbs > 0.9) {
        peaks.push({ x, level: maxAbs })
      }
    }

    return peaks
  }

  // Handle mouse interactions for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const normalizedX = x / width
    const timePosition = viewStart + normalizedX * (viewEnd - viewStart)

    // Check if clicking in selection area
    if (showSelection && timePosition >= selectionStart && timePosition <= selectionEnd) {
      setIsDragging('selection')
    } else {
      setIsDragging('pan')
    }

    dragStartRef.current = { x: e.clientX, viewStart, viewEnd }
  }, [viewStart, viewEnd, width, showSelection, selectionStart, selectionEnd])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || !containerRef.current) return

      const dx = e.clientX - dragStartRef.current.x
      const deltaTime = (dx / width) * (dragStartRef.current.viewEnd - dragStartRef.current.viewStart)

      if (isDragging === 'pan') {
        const newStart = Math.max(0, Math.min(1 - (viewEnd - viewStart), dragStartRef.current.viewStart - deltaTime))
        const range = dragStartRef.current.viewEnd - dragStartRef.current.viewStart
        updateElement(config.id, {
          viewStart: newStart,
          viewEnd: newStart + range
        })
      }
    }

    const handleMouseUp = () => {
      setIsDragging(null)
    }

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, config.id, width, viewEnd, viewStart, updateElement])

  // Handle zoom with wheel
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault()

    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return

    const x = e.clientX - rect.left
    const normalizedX = x / width
    const zoomPoint = viewStart + normalizedX * (viewEnd - viewStart)

    const zoomFactor = e.deltaY > 0 ? 1.1 : 0.9
    const currentRange = viewEnd - viewStart
    const newRange = Math.max(0.01, Math.min(1, currentRange * zoomFactor))

    const newStart = Math.max(0, zoomPoint - normalizedX * newRange)
    const newEnd = Math.min(1, newStart + newRange)

    updateElement(config.id, {
      viewStart: newStart,
      viewEnd: newEnd,
      zoomLevel: 1 / newRange
    })
  }, [config.id, viewStart, viewEnd, width, updateElement])

  const peaks = showPeaks ? generatePeaks() : []

  // Selection overlay position
  const selectionX = ((selectionStart - viewStart) / (viewEnd - viewStart)) * width
  const selectionWidth = ((selectionEnd - selectionStart) / (viewEnd - viewStart)) * width

  return (
    <svg
      ref={containerRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ backgroundColor, cursor: isDragging ? 'grabbing' : 'grab' }}
      onMouseDown={handleMouseDown}
      onWheel={handleWheel}
    >
      {/* Selection overlay */}
      {showSelection && selectionX >= 0 && selectionX < width && (
        <rect
          x={Math.max(0, selectionX)}
          y={0}
          width={Math.min(selectionWidth, width - selectionX)}
          height={waveformHeight}
          fill={selectionColor}
        />
      )}

      {/* Zero line */}
      {showZeroLine && (
        <line
          x1={0}
          y1={waveformCenter}
          x2={width}
          y2={waveformCenter}
          stroke={zeroLineColor}
          strokeWidth={1}
        />
      )}

      {/* Waveform */}
      <path
        d={generateWaveformPath()}
        fill="none"
        stroke={waveformColor}
        strokeWidth={1}
      />

      {/* Mirror waveform for stereo-like appearance */}
      <g transform={`translate(0, ${waveformCenter}) scale(1, -1) translate(0, ${-waveformCenter})`}>
        <path
          d={generateWaveformPath()}
          fill="none"
          stroke={waveformColor}
          strokeWidth={1}
          opacity={0.7}
        />
      </g>

      {/* Peak indicators */}
      {peaks.map((peak, i) => (
        <rect
          key={i}
          x={peak.x}
          y={0}
          width={2}
          height={4}
          fill={peakColor}
        />
      ))}

      {/* Time ruler */}
      {showTimeRuler && (
        <g transform={`translate(0, ${waveformHeight})`}>
          <rect x={0} y={0} width={width} height={rulerHeight} fill={backgroundColor} />
          <line x1={0} y1={0} x2={width} y2={0} stroke={rulerColor} strokeWidth={1} />

          {/* Time markers */}
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const timeInView = viewStart + t * (viewEnd - viewStart)
            const x = t * width
            return (
              <g key={t}>
                <line x1={x} y1={0} x2={x} y2={6} stroke={rulerColor} strokeWidth={1} />
                <text
                  x={x}
                  y={rulerHeight - 4}
                  textAnchor="middle"
                  fill={labelColor}
                  fontSize={fontSize}
                  fontFamily={fontFamily}
                  fontWeight={fontWeight}
                >
                  {(timeInView * 100).toFixed(0)}%
                </text>
              </g>
            )
          })}
        </g>
      )}
    </svg>
  )
}
