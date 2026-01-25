import type { ModulationMatrixElementConfig } from '../../../types/elements'

interface ModulationMatrixRendererProps {
  config: ModulationMatrixElementConfig
}

export function ModulationMatrixRenderer({ config }: ModulationMatrixRendererProps) {
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
    previewActiveConnections,
  } = config

  // Check if a cell is active
  const isActive = (sourceIndex: number, destIndex: number): boolean => {
    return previewActiveConnections.some(
      ([sIdx, dIdx]) => sIdx === sourceIndex && dIdx === destIndex
    )
  }

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `auto repeat(${destinations.length}, ${cellSize}px)`,
        gridTemplateRows: `auto repeat(${sources.length}, ${cellSize}px)`,
        gap: '1px',
        backgroundColor: borderColor,
        border: `1px solid ${borderColor}`,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
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
            fontWeight: 600,
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
              fontWeight: 600,
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
}
