import React, { useRef, useCallback, useEffect, useMemo } from 'react'
import { LoopPointsElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'

interface LoopPointsRendererProps {
  config: LoopPointsElementConfig
}

// Generate mock waveform data - memoized seed for consistent waveform
function generateMockWaveform(points: number, seed: number): number[] {
  const data: number[] = []
  // Use seed to create pseudo-random but consistent waveform
  let rand = seed
  const pseudoRandom = () => {
    rand = (rand * 1103515245 + 12345) & 0x7fffffff
    return rand / 0x7fffffff
  }

  for (let i = 0; i < points; i++) {
    const t = i / points
    // Create a realistic-looking waveform
    const env = Math.sin(t * Math.PI) * 0.8 + 0.2
    const wave = Math.sin(t * 50) * pseudoRandom() * 0.5 + Math.sin(t * 120) * 0.3
    data.push(wave * env)
  }
  return data
}

export function LoopPointsRenderer({ config }: LoopPointsRendererProps) {
  const updateElement = useStore((state) => state.updateElement)
  const containerRef = useRef<SVGSVGElement>(null)
  const draggingMarkerRef = useRef<'start' | 'end' | null>(null)

  const {
    loopStart,
    loopEnd,
    crossfadeLength,
    showWaveform,
    showCrossfade,
    showTimeRuler,
    waveformColor,
    loopRegionColor,
    startMarkerColor,
    endMarkerColor,
    crossfadeColor,
    backgroundColor,
    rulerColor,
    markerWidth,
    markerHandleSize,
    fontSize,
    fontFamily,
    labelColor,
    width,
    height,
  } = config

  const rulerHeight = showTimeRuler ? 20 : 0
  const waveformHeight = height - rulerHeight
  const centerY = rulerHeight + waveformHeight / 2

  // Convert normalized positions to pixels
  const startX = loopStart * width
  const endX = loopEnd * width
  const crossfadeWidth = crossfadeLength * width

  // Generate mock waveform with consistent seed based on element id
  const waveformPoints = 200
  const seed = config.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const waveformData = useMemo(() => generateMockWaveform(waveformPoints, seed), [seed])

  // Build waveform path
  const waveformPath = useMemo(() => {
    let path = ''
    waveformData.forEach((val, i) => {
      const x = (i / waveformPoints) * width
      const y = centerY + val * (waveformHeight / 2 - 4)
      path += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`
    })
    return path
  }, [waveformData, width, centerY, waveformHeight])

  // Update marker position from mouse event
  const updateMarkerPosition = useCallback((clientX: number) => {
    if (!containerRef.current || !draggingMarkerRef.current) return

    const rect = containerRef.current.getBoundingClientRect()
    const normalizedX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width))

    if (draggingMarkerRef.current === 'start') {
      // Start marker can't go past end marker
      const newStart = Math.min(normalizedX, loopEnd - 0.01)
      updateElement(config.id, { loopStart: newStart })
    } else {
      // End marker can't go before start marker
      const newEnd = Math.max(normalizedX, loopStart + 0.01)
      updateElement(config.id, { loopEnd: newEnd })
    }
  }, [config.id, loopStart, loopEnd, updateElement])

  const handleStartMarkerMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    draggingMarkerRef.current = 'start'
  }, [])

  const handleEndMarkerMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    draggingMarkerRef.current = 'end'
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggingMarkerRef.current) {
        updateMarkerPosition(e.clientX)
      }
    }

    const handleMouseUp = () => {
      draggingMarkerRef.current = null
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [updateMarkerPosition])

  // Ruler ticks
  const rulerTicks = []
  if (showTimeRuler) {
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * width
      const tickHeight = i % 5 === 0 ? 8 : 4
      rulerTicks.push(
        <line
          key={`tick-${i}`}
          x1={x}
          y1={0}
          x2={x}
          y2={tickHeight}
          stroke={rulerColor}
          strokeWidth={1}
        />
      )
    }
  }

  return (
    <svg
      ref={containerRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ backgroundColor }}
    >
      {/* Time ruler */}
      {showTimeRuler && (
        <g>
          <line x1={0} y1={rulerHeight} x2={width} y2={rulerHeight} stroke={rulerColor} strokeWidth={1} />
          {rulerTicks}
          <text x={4} y={rulerHeight - 6} fill={labelColor} fontSize={fontSize} fontFamily={fontFamily}>
            0.0s
          </text>
          <text x={width - 4} y={rulerHeight - 6} fill={labelColor} fontSize={fontSize} fontFamily={fontFamily} textAnchor="end">
            1.0s
          </text>
        </g>
      )}

      {/* Loop region background */}
      <rect
        x={startX}
        y={rulerHeight}
        width={endX - startX}
        height={waveformHeight}
        fill={loopRegionColor}
      />

      {/* Crossfade regions */}
      {showCrossfade && (
        <>
          <rect
            x={startX}
            y={rulerHeight}
            width={crossfadeWidth}
            height={waveformHeight}
            fill={crossfadeColor}
          />
          <rect
            x={endX - crossfadeWidth}
            y={rulerHeight}
            width={crossfadeWidth}
            height={waveformHeight}
            fill={crossfadeColor}
          />
        </>
      )}

      {/* Waveform */}
      {showWaveform && (
        <path
          d={waveformPath}
          fill="none"
          stroke={waveformColor}
          strokeWidth={1}
        />
      )}

      {/* Start marker - draggable */}
      <g
        onMouseDown={handleStartMarkerMouseDown}
        style={{ cursor: 'ew-resize' }}
      >
        <line
          x1={startX}
          y1={rulerHeight}
          x2={startX}
          y2={height}
          stroke={startMarkerColor}
          strokeWidth={markerWidth}
        />
        <rect
          x={startX - markerHandleSize / 2}
          y={rulerHeight}
          width={markerHandleSize}
          height={markerHandleSize}
          fill={startMarkerColor}
        />
        {/* Larger invisible hit area for easier grabbing */}
        <rect
          x={startX - markerHandleSize}
          y={rulerHeight}
          width={markerHandleSize * 2}
          height={height - rulerHeight}
          fill="transparent"
        />
      </g>

      {/* End marker - draggable */}
      <g
        onMouseDown={handleEndMarkerMouseDown}
        style={{ cursor: 'ew-resize' }}
      >
        <line
          x1={endX}
          y1={rulerHeight}
          x2={endX}
          y2={height}
          stroke={endMarkerColor}
          strokeWidth={markerWidth}
        />
        <rect
          x={endX - markerHandleSize / 2}
          y={rulerHeight}
          width={markerHandleSize}
          height={markerHandleSize}
          fill={endMarkerColor}
        />
        {/* Larger invisible hit area for easier grabbing */}
        <rect
          x={endX - markerHandleSize}
          y={rulerHeight}
          width={markerHandleSize * 2}
          height={height - rulerHeight}
          fill="transparent"
        />
      </g>
    </svg>
  )
}
