import { useMemo } from 'react'
import { SegmentButtonElementConfig, SegmentConfig } from '../../../../types/elements'
import { builtInIconSVG, BuiltInIcon } from '../../../../utils/builtInIcons'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'
import { extractElementLayer } from '../../../../services/elementLayers'
import { applyAllColorOverrides } from '../../../../services/knobLayers'

interface SegmentButtonRendererProps {
  config: SegmentButtonElementConfig
}

// ============================================================================
// Default CSS Segment Button (existing implementation)
// ============================================================================

/**
 * DefaultSegmentButtonRenderer
 *
 * Renders an iOS-style segmented control with 2-8 segments.
 * Features:
 * - Single or multi-select mode
 * - Horizontal or vertical orientation
 * - Segments can show icon, text, or icon+text
 */
function DefaultSegmentButtonRenderer({ config }: SegmentButtonRendererProps) {
  const getAsset = useStore((state) => state.getAsset)
  const { segments, selectedIndices, orientation, segmentCount } = config
  const isHorizontal = orientation === 'horizontal'

  // Ensure we have segment configs for all segments
  const effectiveSegments: SegmentConfig[] = Array.from(
    { length: segmentCount },
    (_, i) => segments[i] || { displayMode: 'text', text: String(i + 1) }
  )

  return (
    <div
      className="segmentbutton-element"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        border: `1px solid ${config.borderColor}`,
        borderRadius: '4px',
        overflow: 'hidden',
        backgroundColor: config.backgroundColor,
        userSelect: 'none',
      }}
    >
      {effectiveSegments.map((segment, index) => {
        const isSelected = selectedIndices.includes(index)
        const isLast = index === segmentCount - 1

        return (
          <div
            key={index}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '4px 8px',
              backgroundColor: isSelected ? config.selectedColor : 'transparent',
              color: isSelected ? config.selectedTextColor : config.textColor,
              cursor: 'pointer',
              transition: 'none', // Instant selection change
              borderRight:
                isHorizontal && !isLast ? `1px solid ${config.borderColor}` : 'none',
              borderBottom:
                !isHorizontal && !isLast ? `1px solid ${config.borderColor}` : 'none',
              fontSize: `${config.fontSize}px`,
              fontFamily: config.fontFamily,
              fontWeight: config.fontWeight,
              minWidth: 0,
              overflow: 'hidden',
            }}
          >
            {renderSegmentContent(segment, isSelected, config, getAsset)}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Render segment content based on display mode
 */
function renderSegmentContent(
  segment: SegmentConfig,
  isSelected: boolean,
  config: SegmentButtonElementConfig,
  getAsset: (id: string) => { svgContent?: string } | undefined
) {
  const iconSize = config.iconSize ?? 16
  const iconColor = isSelected
    ? (config.selectedIconColor ?? '#ffffff')
    : (config.iconColor ?? '#888888')

  switch (segment.displayMode) {
    case 'icon':
      return renderIcon(segment, iconSize, iconColor, getAsset)

    case 'text':
      return (
        <span
          style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {segment.text || ''}
        </span>
      )

    case 'icon-text':
      return (
        <>
          {renderIcon(segment, iconSize, iconColor, getAsset)}
          <span
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {segment.text || ''}
          </span>
        </>
      )

    default:
      return null
  }
}

/**
 * Render icon based on source type using actual SVG content
 */
function renderIcon(
  segment: SegmentConfig,
  size: number,
  color: string,
  getAsset: (id: string) => { svgContent?: string } | undefined
) {
  let iconContent: string | null = null

  // Get SVG content based on icon source
  if (segment.iconSource === 'builtin' && segment.builtInIcon) {
    iconContent = builtInIconSVG[segment.builtInIcon as BuiltInIcon] ?? null
  } else if (segment.iconSource === 'asset' && segment.assetId) {
    const asset = getAsset(segment.assetId)
    if (asset?.svgContent) {
      iconContent = asset.svgContent
    }
  }

  // Fallback to Play icon if no icon found
  if (!iconContent) {
    iconContent = builtInIconSVG[BuiltInIcon.Play]
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        color: color,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
      dangerouslySetInnerHTML={{ __html: iconContent }}
    />
  )
}

// ============================================================================
// Styled SVG Segment Button (new implementation)
// ============================================================================

/**
 * StyledSegmentButtonRenderer
 *
 * Renders a segment button using SVG style with highlight layer approach.
 * The highlight layer clips to show only the selected segment(s).
 */
function StyledSegmentButtonRenderer({ config }: SegmentButtonRendererProps) {
  const getElementStyle = useStore((state) => state.getElementStyle)
  const rawStyle = config.styleId ? getElementStyle(config.styleId) : undefined

  // Category validation - must be button, narrow type
  const style = rawStyle && rawStyle.category === 'button' ? rawStyle : undefined

  if (rawStyle && rawStyle.category !== 'button') {
    console.warn('SegmentButton requires button category style')
    return null
  }

  const { segmentCount, selectedIndices, orientation } = config
  const isHorizontal = orientation === 'horizontal'

  // Memoize SVG content with color overrides
  const svgContent = useMemo(() => {
    if (!style) return ''
    return applyAllColorOverrides(style.svgContent, style.layers, config.colorOverrides)
  }, [style, config.colorOverrides])

  // Extract layers
  const layers = useMemo(() => {
    if (!style || !svgContent) return null
    return {
      base: style.layers.base ? extractElementLayer(svgContent, style.layers.base) : null,
      highlight: style.layers.highlight ? extractElementLayer(svgContent, style.layers.highlight) : null,
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
      {/* Base - all segments background */}
      {layers?.base && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <SafeSVG content={layers.base} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Highlight layers - one per selected segment */}
      {layers?.highlight && selectedIndices.map((selectedIndex) => {
        // Calculate clip-path to show only the selected segment's portion
        // This positions the highlight layer over just the selected segment
        const clipPath = isHorizontal
          ? `inset(0 ${100 - ((selectedIndex + 1) / segmentCount) * 100}% 0 ${(selectedIndex / segmentCount) * 100}%)`
          : `inset(${(selectedIndex / segmentCount) * 100}% 0 ${100 - ((selectedIndex + 1) / segmentCount) * 100}% 0)`

        return (
          <div
            key={selectedIndex}
            style={{
              position: 'absolute', inset: 0,
              clipPath: clipPath,
              transition: 'none', // Instant selection change
            }}
          >
            <SafeSVG content={layers.highlight} style={{ width: '100%', height: '100%' }} />
          </div>
        )
      })}

      {/* Segment labels/icons - overlay text on each segment */}
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        pointerEvents: 'none',
      }}>
        {config.segments.slice(0, segmentCount).map((segment, index) => {
          const isSelected = selectedIndices.includes(index)
          return (
            <div
              key={index}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px',
                fontSize: `${config.fontSize}px`,
                fontFamily: config.fontFamily,
                fontWeight: config.fontWeight,
                color: isSelected ? config.selectedTextColor : config.textColor,
              }}
            >
              {renderSegmentContentStyled(segment, isSelected, config)}
            </div>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Render segment content for styled version (text only, icons use existing pattern)
 */
function renderSegmentContentStyled(
  segment: SegmentConfig,
  isSelected: boolean,
  config: SegmentButtonElementConfig
) {
  switch (segment.displayMode) {
    case 'text':
      return (
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {segment.text || ''}
        </span>
      )
    case 'icon':
    case 'icon-text':
      // For styled version, icons are still rendered via text overlays
      // The actual SVG styling is in base/highlight layers
      return (
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {segment.text || ''}
        </span>
      )
    default:
      return null
  }
}

// ============================================================================
// Main SegmentButtonRenderer (delegates to default or styled)
// ============================================================================

export function SegmentButtonRenderer({ config }: SegmentButtonRendererProps) {
  if (!config.styleId) {
    return <DefaultSegmentButtonRenderer config={config} />
  }
  return <StyledSegmentButtonRenderer config={config} />
}
