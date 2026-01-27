import React, { useRef } from 'react'
import { PanelElementConfig } from '../../../../types/elements'
import { DEFAULT_SCROLLBAR_CONFIG } from '../../../../types/elements/containers'
import { CustomScrollbar } from './CustomScrollbar'

interface PanelRendererProps {
  config: PanelElementConfig
}

/**
 * Panel Renderer - Visual container with background and optional border
 * Uses custom scrollbar for full design control
 */
export function PanelRenderer({ config }: PanelRendererProps) {
  const hasChildren = config.children && config.children.length > 0
  const contentRef = useRef<HTMLDivElement>(null)

  // Scrollbar config with defaults
  const scrollbarConfig = {
    width: config.scrollbarWidth ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarWidth,
    thumbColor: config.scrollbarThumbColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbColor,
    thumbHoverColor: config.scrollbarThumbHoverColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbHoverColor,
    trackColor: config.scrollbarTrackColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarTrackColor,
    borderRadius: config.scrollbarBorderRadius ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarBorderRadius,
    thumbBorder: config.scrollbarThumbBorder ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbBorder,
  }

  const containerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    backgroundColor: config.backgroundColor,
    borderRadius: `${config.borderRadius}px`,
    ...(config.borderWidth > 0 && {
      border: `${config.borderWidth}px solid ${config.borderColor}`,
    }),
    position: 'relative',
    overflow: 'hidden',
  }

  const contentStyle: React.CSSProperties = {
    width: config.allowScroll ? `calc(100% - ${scrollbarConfig.width}px)` : '100%',
    height: '100%',
    padding: `${config.padding}px`,
    overflow: config.allowScroll ? 'auto' : 'hidden',
    boxSizing: 'border-box',
    // Hide native scrollbar
    scrollbarWidth: 'none', // Firefox
    msOverflowStyle: 'none', // IE/Edge
  }

  // CSS to hide webkit scrollbar
  const hideScrollbarCSS = config.allowScroll ? `
    .panel-content-${config.id?.replace(/-/g, '') || 'default'}::-webkit-scrollbar {
      display: none;
      width: 0;
      height: 0;
    }
  ` : null

  const contentClassName = `panel-content-${config.id?.replace(/-/g, '') || 'default'}`

  return (
    <div style={containerStyle}>
      {hideScrollbarCSS && <style>{hideScrollbarCSS}</style>}
      <div
        ref={contentRef}
        className={contentClassName}
        style={contentStyle}
      >
        {hasChildren && (
          <div
            style={{
              position: 'absolute',
              bottom: 4,
              right: config.allowScroll ? scrollbarConfig.width + 4 : 4,
              fontSize: '10px',
              color: 'rgba(255,255,255,0.4)',
              pointerEvents: 'none',
            }}
          >
            {config.children!.length} item{config.children!.length > 1 ? 's' : ''}
          </div>
        )}
      </div>
      {config.allowScroll && (
        <CustomScrollbar
          contentRef={contentRef}
          config={scrollbarConfig}
          orientation="vertical"
        />
      )}
    </div>
  )
}
