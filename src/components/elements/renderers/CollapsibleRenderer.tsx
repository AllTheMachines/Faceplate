import React from 'react'
import { CollapsibleContainerElementConfig } from '../../../types/elements'

interface CollapsibleRendererProps {
  config: CollapsibleContainerElementConfig
}

/**
 * Collapsible Container Renderer - Container with collapsible header
 * Shows header with toggle arrow and content area with collapse animation
 */
export function CollapsibleRenderer({ config }: CollapsibleRendererProps) {
  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    border: `${config.borderWidth}px solid ${config.borderColor}`,
    borderRadius: `${config.borderRadius}px`,
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  }

  const headerStyle: React.CSSProperties = {
    height: `${config.headerHeight}px`,
    minHeight: `${config.headerHeight}px`,
    backgroundColor: config.headerBackground,
    color: config.headerColor,
    fontSize: `${config.headerFontSize}px`,
    fontFamily: 'Inter, system-ui, sans-serif',
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    padding: '0 12px',
    userSelect: 'none',
    cursor: 'pointer',
    borderBottom: config.collapsed ? 'none' : `${config.borderWidth}px solid ${config.borderColor}`,
  }

  const arrowStyle: React.CSSProperties = {
    marginRight: '8px',
    fontSize: '10px',
    transition: 'transform 0.2s ease',
    transform: config.collapsed ? 'rotate(-90deg)' : 'rotate(0deg)',
  }

  const contentStyle: React.CSSProperties = {
    flex: 1,
    backgroundColor: config.contentBackground,
    overflow: config.scrollBehavior,
    maxHeight: config.collapsed ? '0px' : `${config.maxContentHeight}px`,
    transition: 'max-height 0.3s ease',
    opacity: config.collapsed ? 0 : 1,
    transitionProperty: 'max-height, opacity',
  }

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <span style={arrowStyle}>▼</span>
        <span>{config.headerText}</span>
      </div>
      <div style={contentStyle}>
        {/* Content area - can contain child elements in future */}
      </div>
    </div>
  )
}
