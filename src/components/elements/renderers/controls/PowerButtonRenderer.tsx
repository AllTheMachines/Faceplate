import { useMemo } from 'react'
import { PowerButtonElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

interface PowerButtonRendererProps {
  config: PowerButtonElementConfig
}

// ============================================================================
// Default CSS Power Button (original implementation)
// ============================================================================

function DefaultPowerButtonRenderer({ config }: PowerButtonRendererProps) {
  const { ledPosition, ledSize, ledOnColor, ledOffColor, isOn } = config

  // Calculate LED position styles
  const getLedPositionStyles = (): React.CSSProperties => {
    const offset = 4 // pixels from edge
    const baseStyles: React.CSSProperties = {
      position: 'absolute',
      width: ledSize,
      height: ledSize,
      borderRadius: '50%',
      backgroundColor: isOn ? ledOnColor : ledOffColor,
      boxShadow: isOn ? `0 0 ${ledSize}px ${ledOnColor}` : 'none',
      transition: 'none',
    }

    switch (ledPosition) {
      case 'top':
        return { ...baseStyles, top: offset, left: '50%', transform: 'translateX(-50%)' }
      case 'bottom':
        return { ...baseStyles, bottom: offset, left: '50%', transform: 'translateX(-50%)' }
      case 'left':
        return { ...baseStyles, left: offset, top: '50%', transform: 'translateY(-50%)' }
      case 'right':
        return { ...baseStyles, right: offset, top: '50%', transform: 'translateY(-50%)' }
      case 'center':
        return { ...baseStyles, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }
      default:
        return baseStyles
    }
  }

  // Calculate label position based on LED
  const getLabelPadding = () => {
    const ledPadding = ledSize + 8
    switch (ledPosition) {
      case 'top':
        return { paddingTop: ledPadding }
      case 'bottom':
        return { paddingBottom: ledPadding }
      case 'left':
        return { paddingLeft: ledPadding }
      case 'right':
        return { paddingRight: ledPadding }
      default:
        return {}
    }
  }

  return (
    <div
      className="power-button-element"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: config.backgroundColor,
        color: config.textColor,
        borderRadius: `${config.borderRadius}px`,
        border: `2px solid ${config.borderColor}`,
        fontSize: `${config.fontSize}px`,
        fontFamily: config.fontFamily,
        fontWeight: config.fontWeight,
        userSelect: 'none',
        cursor: 'pointer',
        transition: 'none',
        // Brighter when on
        filter: isOn ? 'brightness(1.1)' : 'brightness(1)',
        boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        ...getLabelPadding(),
      }}
    >
      {/* LED indicator */}
      <div style={getLedPositionStyles()} />

      {/* Label */}
      {config.label && (
        <span style={{ textAlign: 'center' }}>{config.label}</span>
      )}
    </div>
  )
}

// ============================================================================
// Styled SVG Power Button
// ============================================================================

function StyledPowerButtonRenderer({ config }: PowerButtonRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const style = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation - must be button
  if (style && style.category !== 'button') {
    console.warn('PowerButton requires button category style')
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
      led: style.layers.led ? extractElementLayer(svgContent, style.layers.led) : null,
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
      {/* Normal state - visible when NOT on */}
      {layers?.normal && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.isOn ? 0 : 1,
          transition: 'none',
        }}>
          <SafeSVG content={layers.normal} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Pressed state - visible when on */}
      {layers?.pressed && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.isOn ? 1 : 0,
          transition: 'none',
        }}>
          <SafeSVG content={layers.pressed} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Icon layer - always visible */}
      {layers?.icon && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.icon} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* LED indicator - toggles with isOn, colorable via led color override */}
      {layers?.led && (
        <div style={{
          position: 'absolute', inset: 0,
          opacity: config.isOn ? 1 : 0,
          transition: 'none',
        }}>
          <SafeSVG content={layers.led} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Text label (fallback if no label layer) */}
      {config.label && (
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
// Main PowerButtonRenderer (delegates to default or styled)
// ============================================================================

export function PowerButtonRenderer({ config }: PowerButtonRendererProps) {
  if (!config.styleId) {
    return <DefaultPowerButtonRenderer config={config} />
  }
  return <StyledPowerButtonRenderer config={config} />
}
