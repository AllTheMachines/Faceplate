import { useRef } from 'react'
import type { ModulationMatrixElementConfig } from '../../../../types/elements'
import { DEFAULT_SCROLLBAR_CONFIG } from '../../../../types/elements/containers'
import { CustomScrollbar } from '../containers/CustomScrollbar'

interface ModulationMatrixRendererProps {
  config: ModulationMatrixElementConfig
}

export function ModulationMatrixRenderer({ config }: ModulationMatrixRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null)
  const {
    sources,
    destinations,
    cellSize,
    cellColor,
    activeColor,
    borderColor,
    headerBackground,
    headerColor,
    headerFontSize,
    headerFontFamily,
    headerFontWeight,
    previewActiveConnections,
    allowScroll,
  } = config

  // Scrollbar config with defaults
  const scrollbarConfig = {
    width: config.scrollbarWidth ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarWidth,
    thumbColor: config.scrollbarThumbColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbColor,
    thumbHoverColor: config.scrollbarThumbHoverColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbHoverColor,
    trackColor: config.scrollbarTrackColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarTrackColor,
    borderRadius: config.scrollbarBorderRadius ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarBorderRadius,
    thumbBorder: config.scrollbarThumbBorder ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbBorder,
  }

  // Check if a cell is active
  const isActive = (sourceIndex: number, destIndex: number): boolean => {
    return previewActiveConnections.some(
      ([sIdx, dIdx]) => sIdx === sourceIndex && dIdx === destIndex
    )
  }

  const gridContent = (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `auto repeat(${destinations.length}, ${cellSize}px)`,
        gridTemplateRows: `auto repeat(${sources.length}, ${cellSize}px)`,
        gap: '1px',
        backgroundColor: borderColor,
        border: `1px solid ${borderColor}`,
        width: allowScroll ? 'max-content' : '100%',
        height: allowScroll ? 'max-content' : '100%',
      }}
    >
      {/* Top-left corner (empty) */}
      <div
        style={{
          backgroundColor: headerBackground,
          gridColumn: 1,
          gridRow: 1,
        }}
      />

      {/* Column headers (destinations) */}
      {destinations.map((dest, idx) => (
        <div
          key={`dest-${idx}`}
          style={{
            backgroundColor: headerBackground,
            color: headerColor,
            fontSize: `${headerFontSize}px`,
            fontFamily: headerFontFamily,
            fontWeight: headerFontWeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2px',
            textAlign: 'center',
            wordBreak: 'break-word',
            gridColumn: idx + 2,
            gridRow: 1,
          }}
        >
          {dest}
        </div>
      ))}

      {/* Row headers (sources) and cells */}
      {sources.map((source, sourceIdx) => (
        <div
          key={`row-${sourceIdx}`}
          style={{
            display: 'contents',
          }}
        >
          {/* Row header */}
          <div
            style={{
              backgroundColor: headerBackground,
              color: headerColor,
              fontSize: `${headerFontSize}px`,
              fontFamily: headerFontFamily,
              fontWeight: headerFontWeight,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              padding: '4px 8px',
              gridColumn: 1,
              gridRow: sourceIdx + 2,
            }}
          >
            {source}
          </div>

          {/* Cells for this row */}
          {destinations.map((_, destIdx) => (
            <div
              key={`cell-${sourceIdx}-${destIdx}`}
              style={{
                backgroundColor: isActive(sourceIdx, destIdx) ? activeColor : cellColor,
                gridColumn: destIdx + 2,
                gridRow: sourceIdx + 2,
                cursor: 'pointer',
                transition: 'background-color 0.15s ease',
              }}
            />
          ))}
        </div>
      ))}
    </div>
  )

  // If scrolling is not enabled, return the grid directly
  if (!allowScroll) {
    return (
      <div style={{ width: '100%', height: '100%', overflow: 'hidden' }}>
        {gridContent}
      </div>
    )
  }

  // Scrollable container with custom scrollbars
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        ref={contentRef}
        className={`modmatrix-content-${config.id?.replace(/-/g, '') || 'default'}`}
        style={{
          width: `calc(100% - ${scrollbarConfig.width}px)`,
          height: `calc(100% - ${scrollbarConfig.width}px)`,
          overflow: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {gridContent}
      </div>

      {/* Vertical scrollbar */}
      <CustomScrollbar
        contentRef={contentRef}
        config={scrollbarConfig}
        orientation="vertical"
      />

      {/* Horizontal scrollbar */}
      <CustomScrollbar
        contentRef={contentRef}
        config={scrollbarConfig}
        orientation="horizontal"
      />

      {/* Hide webkit scrollbar */}
      <style>{`
        .modmatrix-content-${config.id?.replace(/-/g, '') || 'default'}::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
      `}</style>
    </div>
  )
}
