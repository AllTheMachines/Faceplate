import React from 'react'
import { PanelElementConfig } from '../../../types/elements'

interface PanelRendererProps {
  config: PanelElementConfig
}

/**
 * Panel Renderer - Visual container with background and optional border
 * Used for grouping UI sections with a colored background
 */
export function PanelRenderer({ config }: PanelRendererProps) {
  const style: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: config.backgroundColor,
    borderRadius: `${config.borderRadius}px`,
    padding: `${config.padding}px`,
    ...(config.borderWidth > 0 && {
      border: `${config.borderWidth}px solid ${config.borderColor}`,
    }),
  }

  return <div style={style} />
}
