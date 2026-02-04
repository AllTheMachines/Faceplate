/**
 * StyledMeterRenderer - SVG-based meter rendering with zone fill animation
 *
 * Renders professional meters using imported SVG styles with clip-path animation.
 * Supports multi-zone fills (green/yellow/red), peak indicator, and horizontal orientation.
 *
 * Layer expectations:
 * - body: Static background
 * - fill-green, fill-yellow, fill-red: Zone fill layers (stacked reveal)
 * - fill: Fallback single fill layer (if no zone layers exist)
 * - scale: Static ticks/markings (optional)
 * - peak: Peak hold indicator (positioned at value)
 *
 * @implements Phase 57-02: SVG Meter Styling
 */

import { useMemo } from 'react'
import { useStore } from '../../../../../store'
import { SafeSVG } from '../../../../SafeSVG'
import { extractElementLayer } from '../../../../../services/elementLayers'
import { applyColorOverride } from '../../../../../services/knobLayers'
import { dbToNormalized } from '../../../../../utils/meterUtils'
import type { ColorOverrides, MeterLayers } from '../../../../../types/elementStyle'

// Props interface for StyledMeterRenderer
// Works with any professional meter config that has styleId
interface StyledMeterRendererProps {
  config: {
    // Required properties from BaseProfessionalMeterConfig
    width: number
    height: number
    value: number
    minDb: number
    maxDb: number
    orientation: 'vertical' | 'horizontal'
    showPeakHold: boolean

    // Styling properties
    styleId: string
    colorOverrides?: ColorOverrides
  }
}

/**
 * Apply color overrides to SVG content for meter layers
 * Meter-specific override keys: fill, fill-green, fill-yellow, fill-red, peak
 */
function applyMeterColorOverrides(
  svgContent: string,
  layers: MeterLayers,
  overrides: ColorOverrides | undefined
): string {
  if (!overrides) return svgContent

  let result = svgContent

  // Apply overrides for each meter-specific layer
  if (overrides.fill && layers.fill) {
    result = applyColorOverride(result, layers.fill, overrides.fill)
  }
  if (overrides['fill-green'] && layers['fill-green']) {
    result = applyColorOverride(result, layers['fill-green'], overrides['fill-green'])
  }
  if (overrides['fill-yellow'] && layers['fill-yellow']) {
    result = applyColorOverride(result, layers['fill-yellow'], overrides['fill-yellow'])
  }
  if (overrides['fill-red'] && layers['fill-red']) {
    result = applyColorOverride(result, layers['fill-red'], overrides['fill-red'])
  }
  if (overrides.peak && layers.peak) {
    result = applyColorOverride(result, layers.peak, overrides.peak)
  }
  if (overrides.body && layers.body) {
    result = applyColorOverride(result, layers.body, overrides.body)
  }

  return result
}

/**
 * StyledMeterRenderer - Renders SVG-based meter with zone fills and peak indicator
 */
export function StyledMeterRenderer({ config }: StyledMeterRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation - must be meter
  if (style && style.category !== 'meter') {
    console.warn('StyledMeterRenderer requires meter category style')
    return null
  }

  // Normalized value (0-1)
  const normalizedValue = config.value

  // Zone thresholds (normalized) - standard audio meter zones
  const yellowThreshold = dbToNormalized(-18, config.minDb, config.maxDb)
  const redThreshold = dbToNormalized(-6, config.minDb, config.maxDb)

  // Memoize SVG content with color overrides
  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyMeterColorOverrides(
      style.svgContent,
      style.layers as MeterLayers,
      config.colorOverrides
    )
  }, [style, config.colorOverrides])

  // Extract layers
  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    const meterLayers = style.layers as MeterLayers
    return {
      body: meterLayers.body ? extractElementLayer(svgContent, meterLayers.body) : null,
      fill: meterLayers.fill ? extractElementLayer(svgContent, meterLayers.fill) : null,
      'fill-green': meterLayers['fill-green'] ? extractElementLayer(svgContent, meterLayers['fill-green']) : null,
      'fill-yellow': meterLayers['fill-yellow'] ? extractElementLayer(svgContent, meterLayers['fill-yellow']) : null,
      'fill-red': meterLayers['fill-red'] ? extractElementLayer(svgContent, meterLayers['fill-red']) : null,
      scale: meterLayers.scale ? extractElementLayer(svgContent, meterLayers.scale) : null,
      peak: meterLayers.peak ? extractElementLayer(svgContent, meterLayers.peak) : null,
    }
  }, [style, svgContent])

  // Determine if we have zone layers or single fill
  const hasZoneLayers = layers && (layers['fill-green'] || layers['fill-yellow'] || layers['fill-red'])

  // Style not found fallback
  if (!style) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#374151',
        borderRadius: '4px',
        color: '#9CA3AF',
        fontSize: '12px',
        textAlign: 'center',
        padding: '8px',
      }}>
        Style not found
      </div>
    )
  }

  // Clip-path calculations for vertical meter (bottom-up fill)
  // inset(top right bottom left) - clip from top to reveal from bottom
  const getZoneClipPath = (zoneThreshold: number, value: number): string => {
    // Zone fills from bottom up to value position
    // Green: fills from 0 to min(value, yellowThreshold)
    // Yellow: fills from yellowThreshold to min(value, redThreshold)
    // Red: fills from redThreshold to value
    const effectiveValue = Math.min(1, Math.max(0, value))
    const clipFromTop = (1 - effectiveValue) * 100
    return `inset(${clipFromTop}% 0 0 0)`
  }

  // For zone fills, calculate individual zone clip paths
  const greenClipPath = getZoneClipPath(0, normalizedValue)
  const yellowClipPath = normalizedValue > yellowThreshold
    ? getZoneClipPath(yellowThreshold, normalizedValue)
    : 'inset(100% 0 0 0)' // Fully clipped (hidden)
  const redClipPath = normalizedValue > redThreshold
    ? getZoneClipPath(redThreshold, normalizedValue)
    : 'inset(100% 0 0 0)' // Fully clipped (hidden)

  // Single fill clip path (fallback if no zone layers)
  const singleFillClipPath = getZoneClipPath(0, normalizedValue)

  // Peak indicator position (vertical: bottom-up)
  const peakPosition = `${normalizedValue * 100}%`

  // Container styles - apply 90deg rotation for horizontal orientation
  const containerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    ...(config.orientation === 'horizontal' && {
      transform: 'rotate(-90deg)',
      transformOrigin: 'center center',
    }),
  }

  return (
    <div style={containerStyle}>
      {/* Body - static background */}
      {layers?.body && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.body} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Zone fill layers (stacked: green base, yellow middle, red top) */}
      {hasZoneLayers ? (
        <>
          {/* Green zone - always visible from bottom to value (up to yellow threshold) */}
          {layers?.['fill-green'] && (
            <div style={{
              position: 'absolute',
              inset: 0,
              clipPath: greenClipPath,
              transition: 'clip-path 0.05s ease-out',
            }}>
              <SafeSVG content={layers['fill-green']} style={{ width: '100%', height: '100%' }} />
            </div>
          )}

          {/* Yellow zone - reveals above -18dB threshold */}
          {layers?.['fill-yellow'] && (
            <div style={{
              position: 'absolute',
              inset: 0,
              clipPath: yellowClipPath,
              transition: 'clip-path 0.05s ease-out',
            }}>
              <SafeSVG content={layers['fill-yellow']} style={{ width: '100%', height: '100%' }} />
            </div>
          )}

          {/* Red zone - reveals above -6dB threshold */}
          {layers?.['fill-red'] && (
            <div style={{
              position: 'absolute',
              inset: 0,
              clipPath: redClipPath,
              transition: 'clip-path 0.05s ease-out',
            }}>
              <SafeSVG content={layers['fill-red']} style={{ width: '100%', height: '100%' }} />
            </div>
          )}
        </>
      ) : (
        /* Single fill fallback (if no zone layers exist) */
        layers?.fill && (
          <div style={{
            position: 'absolute',
            inset: 0,
            clipPath: singleFillClipPath,
            transition: 'clip-path 0.05s ease-out',
          }}>
            <SafeSVG content={layers.fill} style={{ width: '100%', height: '100%' }} />
          </div>
        )
      )}

      {/* Scale - static ticks/markings */}
      {layers?.scale && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.scale} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Peak indicator - positioned at value */}
      {config.showPeakHold && layers?.peak && (
        <div style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: peakPosition,
          transform: 'translateY(50%)',
          height: 'auto',
          transition: 'bottom 0.05s ease-out',
        }}>
          <SafeSVG content={layers.peak} style={{ width: '100%', height: 'auto' }} />
        </div>
      )}
    </div>
  )
}
