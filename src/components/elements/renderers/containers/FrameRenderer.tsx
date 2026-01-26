import React from 'react'
import { FrameElementConfig } from '../../../types/elements'

interface FrameRendererProps {
  config: FrameElementConfig
}

/**
 * Frame Renderer - Bordered container for visual grouping
 * Displays as a border-only container with configurable border style
 */
export function FrameRenderer({ config }: FrameRendererProps) {
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: `${config.borderWidth}px ${config.borderStyle} ${config.borderColor}`,
    borderRadius: `${config.borderRadius}px`,
    padding: `${config.padding}px`,
  }

  return <div style={style} />
}
