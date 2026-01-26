import React from 'react'
import { VerticalSpacerElementConfig } from '../../../../types/elements'

interface VerticalSpacerRendererProps {
  config: VerticalSpacerElementConfig
}

/**
 * Vertical Spacer Renderer - Invisible layout spacer for vertical spacing
 * Shows dashed outline with sizing label in designer for visibility
 */
export function VerticalSpacerRenderer({ config }: VerticalSpacerRendererProps) {
  const isFlexible = config.sizingMode === 'flexible'

  // Calculate display height
  const displayHeight = isFlexible
    ? `flex: ${config.flexGrow} (min: ${config.minHeight}px, max: ${config.maxHeight}px)`
    : `${config.fixedHeight}px`

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
    writingMode: 'vertical-lr' as const,
    textOrientation: 'mixed',
  }

  return (
    <div style={containerStyle}>
      {config.showIndicator && (
        <span style={labelStyle}>{displayHeight}</span>
      )}
    </div>
  )
}
