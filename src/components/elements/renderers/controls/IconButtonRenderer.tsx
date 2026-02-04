import { useMemo } from 'react'
import { IconButtonElementConfig } from '../../../../types/elements'
import { builtInIconSVG, BuiltInIcon } from '../../../../utils/builtInIcons'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

interface IconButtonRendererProps {
  config: IconButtonElementConfig
}

// ============================================================================
// Default CSS Icon Button (existing implementation)
// ============================================================================

function DefaultIconButtonRenderer({ config }: IconButtonRendererProps) {
  const getAsset = useStore((state) => state.getAsset)

  // Get icon SVG content
  let iconContent: string | null = null

  if (config.iconSource === 'builtin' && config.builtInIcon) {
    iconContent = builtInIconSVG[config.builtInIcon]
  } else if (config.iconSource === 'asset' && config.assetId) {
    const asset = getAsset(config.assetId)
    if (asset?.svgContent) {
      iconContent = asset.svgContent
    }
  }

  // Fallback to Play icon if no icon found
  if (!iconContent) {
    iconContent = builtInIconSVG[BuiltInIcon.Play]
  }

  // Calculate icon size (70% of container)
  const iconSize = Math.min(config.width, config.height) * 0.7

  return (
    <div
      className="icon-button-element"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: config.backgroundColor,
        borderRadius: `${config.borderRadius}px`,
        border: `2px solid ${config.borderColor}`,
        userSelect: 'none',
        cursor: 'pointer',
        transition: 'none',
        // Pressed state: darken
        filter: config.pressed ? 'brightness(0.85)' : 'brightness(1)',
        boxShadow: config.pressed
          ? 'inset 0 2px 4px rgba(0,0,0,0.3)'
          : '0 1px 2px rgba(0,0,0,0.2)',
      }}
    >
      <div
        style={{
          width: iconSize,
          height: iconSize,
          color: config.iconColor,
        }}
        dangerouslySetInnerHTML={{ __html: iconContent }}
      />
    </div>
  )
}

// ============================================================================
// Styled SVG Icon Button (new implementation)
// ============================================================================

function StyledIconButtonRenderer({ config }: IconButtonRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const rawStyle = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation - must be button, narrow type
  const style = rawStyle && rawStyle.category === 'button' ? rawStyle : undefined

  if (rawStyle && rawStyle.category !== 'button') {
    console.warn('IconButton requires button category style')
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
          transition: 'none',
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

      {/* Icon layer - colorable via style.layers.icon color override */}
      {layers?.icon && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.icon} style={{ width: '100%', height: '100%' }} />
        </div>
      )}
    </div>
  )
}

// ============================================================================
// Main IconButtonRenderer (delegates to default or styled)
// ============================================================================

export function IconButtonRenderer({ config }: IconButtonRendererProps) {
  if (!config.styleId) {
    return <DefaultIconButtonRenderer config={config} />
  }
  return <StyledIconButtonRenderer config={config} />
}
