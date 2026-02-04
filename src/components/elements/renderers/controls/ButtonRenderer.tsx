import { useMemo } from 'react'
import { ButtonElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

interface ButtonRendererProps {
  config: ButtonElementConfig
}

// ============================================================================
// Default CSS Button (existing implementation)
// ============================================================================

function DefaultButtonRenderer({ config }: ButtonRendererProps) {
  return (
    <div
      className="button-element"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: config.backgroundColor,
        color: config.textColor,
        borderRadius: `${config.borderRadius}px`,
        border: `${config.borderWidth ?? 1}px solid ${config.borderColor}`,
        fontSize: `${config.fontSize}px`,
        fontFamily: config.fontFamily,
        fontWeight: config.fontWeight,
        userSelect: 'none',
        cursor: 'pointer',
        transition: 'background-color 0.1s, box-shadow 0.1s, transform 0.1s',
        // Pressed state visuals
        filter: config.pressed ? 'brightness(0.85)' : 'brightness(1)',
        boxShadow: config.pressed
          ? 'inset 0 2px 4px rgba(0,0,0,0.3)'
          : '0 1px 2px rgba(0,0,0,0.2)',
        transform: config.pressed ? 'translateY(1px)' : 'none',
      }}
    >
      {config.label}
    </div>
  )
}

// ============================================================================
// Styled SVG Button (new implementation)
// ============================================================================

function StyledButtonRenderer({ config }: ButtonRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const rawStyle = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation - must be button, narrow type
  const style = rawStyle && rawStyle.category === 'button' ? rawStyle : undefined

  if (rawStyle && rawStyle.category !== 'button') {
    console.warn('Button requires button category style')
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
      normal: style.layers.normal ? extractElementLayer(svgContent, style.layers.normal) : null,
      pressed: style.layers.pressed ? extractElementLayer(svgContent, style.layers.pressed) : null,
      icon: style.layers.icon ? extractElementLayer(svgContent, style.layers.icon) : null,
      label: style.layers.label ? extractElementLayer(svgContent, style.layers.label) : null,
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
      {/* Normal state - visible when NOT pressed */}
      {layers?.normal && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.pressed ? 0 : 1,
          transition: 'none', // Instant swap per CONTEXT.md
        }}>
          <SafeSVG content={layers.normal} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Pressed state - visible when pressed */}
      {layers?.pressed && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.pressed ? 1 : 0,
          transition: 'none',
        }}>
          <SafeSVG content={layers.pressed} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Icon layer - always visible if present */}
      {layers?.icon && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.icon} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Label layer OR text label */}
      {layers?.label ? (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.label} style={{ width: '100%', height: '100%' }} />
        </div>
      ) : config.label && (
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: config.textColor,
          fontSize: `${config.fontSize}px`,
          fontFamily: config.fontFamily,
          fontWeight: config.fontWeight,
          pointerEvents: 'none',
        }}>
          {config.label}
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main ButtonRenderer (delegates to default or styled)
// ============================================================================

export function ButtonRenderer({ config }: ButtonRendererProps) {
  if (!config.styleId) {
    return <DefaultButtonRenderer config={config} />
  }
  return <StyledButtonRenderer config={config} />
}
