import { PadGridElementConfig } from '../../../../types/elements'

interface PadGridRendererProps {
  config: PadGridElementConfig
}

export function PadGridRenderer({ config }: PadGridRendererProps) {
  const {
    rows,
    columns,
    padLabels,
    activePads,
    padColor,
    activePadColor,
    labelColor,
    borderColor,
    gridGap,
    fontSize,
    fontFamily,
    fontWeight,
    width,
    height,
  } = config

  const padWidth = (width - gridGap * (columns + 1)) / columns
  const padHeight = (height - gridGap * (rows + 1)) / rows

  const pads = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col
      const isActive = activePads.includes(index)
      const label = padLabels[index] || `${index + 1}`

      pads.push(
        <div
          key={index}
          style={{
            position: 'absolute',
            left: gridGap + col * (padWidth + gridGap),
            top: gridGap + row * (padHeight + gridGap),
            width: padWidth,
            height: padHeight,
            backgroundColor: isActive ? activePadColor : padColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.05s ease-out',
            transform: isActive ? 'scale(0.95)' : 'scale(1)',
          }}
        >
          <span
            style={{
              color: labelColor,
              fontSize: `${fontSize}px`,
              fontFamily,
              fontWeight,
              userSelect: 'none',
            }}
          >
            {label}
          </span>
        </div>
      )
    }
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: borderColor,
        position: 'relative',
      }}
    >
      {pads}
    </div>
  )
}
