import React from 'react'
import { FrameElementConfig } from '../../../../types/elements'

interface FrameRendererProps {
  config: FrameElementConfig
}

/**
 * Frame Renderer - Bordered container for visual grouping
 * Displays as a border-only container with configurable border style
 */
export function FrameRenderer({ config }: FrameRendererProps) {
  const hasChildren = config.children && config.children.length > 0

  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: `${config.borderWidth}px ${config.borderStyle} ${config.borderColor}`,
    borderRadius: `${config.borderRadius}px`,
    padding: `${config.padding}px`,
    position: 'relative',
    overflow: config.allowScroll ? 'auto' : 'hidden',
  }

  return (
    <div style={style}>
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
