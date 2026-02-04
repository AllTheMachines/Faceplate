import { useMemo } from 'react'
import { ToggleSwitchElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

interface ToggleSwitchRendererProps {
  config: ToggleSwitchElementConfig
}

// ============================================================================
// Default CSS Toggle Switch (original implementation)
// ============================================================================

function DefaultToggleSwitchRenderer({ config }: ToggleSwitchRendererProps) {
  const { width, height } = config

  // iOS-style toggle switch with pill shape
  // Thumb is circular with diameter = height - padding
  const padding = 2
  const thumbDiameter = height - padding * 2
  const trackRadius = height / 2

  // Thumb position: instant snap (no transition)
  const thumbOffset = config.isOn ? width - height : 0

  return (
    <div
      className="toggle-switch-element"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        userSelect: 'none',
        cursor: 'pointer',
      }}
    >
      {/* Track */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: trackRadius,
          backgroundColor: config.isOn ? config.onColor : config.offColor,
          border: `1px solid ${config.borderColor}`,
          transition: 'none',
          position: 'relative',
        }}
      >
        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            top: padding,
            left: padding + thumbOffset,
            width: thumbDiameter,
            height: thumbDiameter,
            borderRadius: '50%',
            backgroundColor: config.thumbColor,
            boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            transition: 'none',
          }}
        />

        {/* Labels */}
        {config.showLabels && (
          <>
            {/* ON label (left side, visible when off) */}
            <div
              style={{
                position: 'absolute',
                left: height * 0.4,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: config.labelFontSize || Math.max(8, height * 0.35),
                fontFamily: config.labelFontFamily,
                fontWeight: config.labelFontWeight || 600,
                color: config.labelColor,
                opacity: config.isOn ? 0.3 : 0.8,
                transition: 'none',
                userSelect: 'none',
              }}
            >
              {config.offLabel}
            </div>
            {/* OFF label (right side, visible when on) */}
            <div
              style={{
                position: 'absolute',
                right: height * 0.4,
                top: '50%',
                transform: 'translateY(-50%)',
                fontSize: config.labelFontSize || Math.max(8, height * 0.35),
                fontFamily: config.labelFontFamily,
                fontWeight: config.labelFontWeight || 600,
                color: config.labelColor,
                opacity: config.isOn ? 0.8 : 0.3,
                transition: 'none',
                userSelect: 'none',
              }}
            >
              {config.onLabel}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// Styled SVG Toggle Switch
// ============================================================================

function StyledToggleSwitchRenderer({ config }: ToggleSwitchRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation - must be button
  if (style && style.category !== 'button') {
    console.warn('ToggleSwitch requires button category style')
    return null
  }

  // Memoize SVG content with color overrides
  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  // Extract layers
  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      body: style.layers.body ? extractElementLayer(svgContent, style.layers.body) : null,
      on: style.layers.on ? extractElementLayer(svgContent, style.layers.on) : null,
      off: style.layers.off ? extractElementLayer(svgContent, style.layers.off) : null,
      indicator: style.layers.indicator ? extractElementLayer(svgContent, style.layers.indicator) : null,
    }
  }, [style, svgContent])

  // Style not found fallback
  if (!style) {
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#374151', borderRadius: '4px',
        color: '#9CA3AF', fontSize: '12px', textAlign: 'center', padding: '8px',
      }}>
        Style not found
      </div>
    )
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Background body - always visible */}
      {layers?.body && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.body} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Off state layer - visible when off */}
      {layers?.off && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.isOn ? 0 : 1,
          transition: 'none', // Per CONTEXT.md: layer swap only, no sliding
        }}>
          <SafeSVG content={layers.off} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* On state layer - visible when on */}
      {layers?.on && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.isOn ? 1 : 0,
          transition: 'none',
        }}>
          <SafeSVG content={layers.on} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Indicator layer - toggles independently (but same state variable per RESEARCH.md) */}
      {layers?.indicator && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.isOn ? 1 : 0,
          transition: 'none',
        }}>
          <SafeSVG content={layers.indicator} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main ToggleSwitchRenderer (delegates to default or styled)
// ============================================================================

export function ToggleSwitchRenderer({ config }: ToggleSwitchRendererProps) {
  if (!config.styleId) {
    return <DefaultToggleSwitchRenderer config={config} />
  }
  return <StyledToggleSwitchRenderer config={config} />
}
