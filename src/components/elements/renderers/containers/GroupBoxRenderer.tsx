import React from 'react'
import { GroupBoxElementConfig } from '../../../../types/elements'

interface GroupBoxRendererProps {
  config: GroupBoxElementConfig
}

/**
 * Group Box Renderer - Container with header text that "breaks" the top border
 * Classic UI pattern for grouping related controls with a labeled border
 */
export function GroupBoxRenderer({ config }: GroupBoxRendererProps) {
  const hasChildren = config.children && config.children.length > 0

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    padding: `${config.padding}px`,
    paddingTop: `${config.padding + config.headerFontSize / 2}px`,
    overflow: config.allowScroll ? 'auto' : 'hidden',
  }

  const borderStyle: React.CSSProperties = {
    position: 'absolute',
    top: `${config.headerFontSize / 2}px`,
    left: 0,
    right: 0,
    bottom: 0,
    border: `${config.borderWidth}px solid ${config.borderColor}`,
    borderRadius: `${config.borderRadius}px`,
    pointerEvents: 'none',
  }

  const headerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 0,
    left: `${config.padding + 4}px`,
    fontSize: `${config.headerFontSize}px`,
    color: config.headerColor,
    backgroundColor: config.headerBackground,
    padding: '0 4px',
    fontFamily: config.headerFontFamily,
    fontWeight: config.headerFontWeight,
    userSelect: 'none',
  }

  return (
    <div style={containerStyle}>
      <div style={borderStyle} />
      <div style={headerStyle}>{config.headerText}</div>
      {hasChildren && (
        <div
          style={{
            position: 'absolute',
            bottom: 4,
            right: 4,
            fontSize: '10px',
            color: 'rgba(255,255,255,0.4)',
            pointerEvents: 'none',
          }}
        >
          {config.children!.length} item{config.children!.length > 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}
