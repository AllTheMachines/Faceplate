import React from 'react'
import { HorizontalSpacerElementConfig } from '../../../../types/elements'

interface HorizontalSpacerRendererProps {
  config: HorizontalSpacerElementConfig
}

/**
 * Horizontal Spacer Renderer - Invisible layout spacer for horizontal spacing
 * Shows dashed outline with sizing label in designer for visibility
 */
export function HorizontalSpacerRenderer({ config }: HorizontalSpacerRendererProps) {
  const isFlexible = config.sizingMode === 'flexible'

  // Calculate display width
  const displayWidth = isFlexible
    ? `flex: ${config.flexGrow} (min: ${config.minWidth}px, max: ${config.maxWidth}px)`
    : `${config.fixedWidth}px`

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...(config.showIndicator && {
      backgroundColor: 'rgba(107, 114, 128, 0.1)', // Subtle shaded background
      border: `1px dashed ${config.indicatorColor}`,
      borderRadius: '2px',
    }),
  }

  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    color: config.indicatorColor,
    fontFamily: 'monospace',
    userSelect: 'none',
    pointerEvents: 'none',
  }

  return (
    <div style={containerStyle}>
      {config.showIndicator && (
        <span style={labelStyle}>{displayWidth}</span>
      )}
    </div>
  )
}
