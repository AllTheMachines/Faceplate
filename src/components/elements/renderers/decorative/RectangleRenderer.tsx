import { RectangleElementConfig } from '../../../types/elements'

interface RectangleRendererProps {
  config: RectangleElementConfig
}

export function RectangleRenderer({ config }: RectangleRendererProps) {
  // Convert fillOpacity (0-1) to rgba/hex with alpha
  const fillColorWithOpacity = config.fillOpacity < 1
    ? `${config.fillColor}${Math.round(config.fillOpacity * 255).toString(16).padStart(2, '0')}`
    : config.fillColor

  return (
    <div
      className="w-full h-full"
      style={{
        backgroundColor: fillColorWithOpacity,
        border: config.borderWidth > 0
          ? `${config.borderWidth}px ${config.borderStyle} ${config.borderColor}`
          : 'none',
        borderRadius: `${config.borderRadius}px`,
      }}
    />
  )
}
