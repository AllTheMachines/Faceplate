import { SegmentButtonElementConfig, SegmentConfig } from '../../../../types/elements'
import { builtInIconSVG, BuiltInIcon } from '../../../../utils/builtInIcons'
import { useStore } from '../../../../store'

interface SegmentButtonRendererProps {
  config: SegmentButtonElementConfig
}

/**
 * SegmentButtonRenderer
 *
 * Renders an iOS-style segmented control with 2-8 segments.
 * Features:
 * - Single or multi-select mode
 * - Horizontal or vertical orientation
 * - Segments can show icon, text, or icon+text
 */
export function SegmentButtonRenderer({ config }: SegmentButtonRendererProps) {
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
