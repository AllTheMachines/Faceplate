import { LineElementConfig } from '../../../types/elements'

interface LineRendererProps {
  config: LineElementConfig
}

export function LineRenderer({ config }: LineRendererProps) {
  // Determine orientation based on aspect ratio
  // horizontal: width > height, vertical: height > width
  const isHorizontal = config.width > config.height

  // For horizontal lines, use height as strokeWidth
  // For vertical lines, use width as strokeWidth
  const lineStyle: React.CSSProperties = isHorizontal
    ? {
        width: '100%',
        height: `${config.strokeWidth}px`,
        backgroundColor: config.strokeStyle === 'solid' ? config.strokeColor : 'transparent',
        borderTop: config.strokeStyle !== 'solid'
          ? `${config.strokeWidth}px ${config.strokeStyle} ${config.strokeColor}`
          : 'none',
      }
    : {
        width: `${config.strokeWidth}px`,
        height: '100%',
        backgroundColor: config.strokeStyle === 'solid' ? config.strokeColor : 'transparent',
        borderLeft: config.strokeStyle !== 'solid'
          ? `${config.strokeWidth}px ${config.strokeStyle} ${config.strokeColor}`
          : 'none',
      }

  return <div className="w-full h-full flex items-center justify-center">
    <div style={lineStyle} />
  </div>
}
