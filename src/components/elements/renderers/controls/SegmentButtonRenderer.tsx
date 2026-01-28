import { SegmentButtonElementConfig, SegmentConfig } from '../../../../types/elements'

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
            {renderSegmentContent(segment, isSelected)}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Render segment content based on display mode
 */
function renderSegmentContent(segment: SegmentConfig, isSelected: boolean) {
  const iconSize = 16

  switch (segment.displayMode) {
    case 'icon':
      return renderIcon(segment, iconSize, isSelected)

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
          {renderIcon(segment, iconSize, isSelected)}
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
 * Render icon based on source type
 * Falls back to placeholder if icon not available
 */
function renderIcon(segment: SegmentConfig, size: number, _isSelected: boolean) {
  // For builtin icons, render a simple placeholder for now
  // Real icon rendering will use builtInIconSVG utility when available
  if (segment.iconSource === 'builtin' && segment.builtInIcon) {
    return (
      <span
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: size * 0.75,
        }}
      >
        {getBuiltInIconSymbol(segment.builtInIcon)}
      </span>
    )
  }

  // For asset icons, show placeholder
  if (segment.iconSource === 'asset' && segment.assetId) {
    return (
      <span
        style={{
          width: size,
          height: size,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(128,128,128,0.3)',
          borderRadius: 2,
          fontSize: 8,
        }}
      >
        IMG
      </span>
    )
  }

  return null
}

/**
 * Get simple unicode symbol for common built-in icon names
 */
function getBuiltInIconSymbol(iconName: string): string {
  const iconMap: Record<string, string> = {
    play: '\u25B6',
    pause: '\u23F8',
    stop: '\u25A0',
    record: '\u23FA',
    forward: '\u23E9',
    backward: '\u23EA',
    next: '\u23ED',
    previous: '\u23EE',
    loop: '\u21BB',
    shuffle: '\u21C4',
    volume: '\u266A',
    mute: '\u266A',
    settings: '\u2699',
    power: '\u23FB',
    check: '\u2713',
    close: '\u2715',
    add: '+',
    remove: '-',
  }
  return iconMap[iconName.toLowerCase()] || '\u25CF' // Default to filled circle
}
