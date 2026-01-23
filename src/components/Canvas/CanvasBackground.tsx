import { Rect } from 'react-konva'
import { useStore } from '../../store'

export function CanvasBackground() {
  const canvasWidth = useStore((state) => state.canvasWidth)
  const canvasHeight = useStore((state) => state.canvasHeight)
  const backgroundColor = useStore((state) => state.backgroundColor)
  const backgroundType = useStore((state) => state.backgroundType)
  const gradientConfig = useStore((state) => state.gradientConfig)

  // Render based on background type
  if (backgroundType === 'gradient' && gradientConfig) {
    // Calculate gradient points based on angle (default: top to bottom)
    const angle = gradientConfig.angle ?? 180
    const angleRad = (angle * Math.PI) / 180

    const startX = canvasWidth / 2 - (Math.cos(angleRad) * canvasWidth) / 2
    const startY = canvasHeight / 2 - (Math.sin(angleRad) * canvasHeight) / 2
    const endX = canvasWidth / 2 + (Math.cos(angleRad) * canvasWidth) / 2
    const endY = canvasHeight / 2 + (Math.sin(angleRad) * canvasHeight) / 2

    // Build color stops array [position, color, position, color, ...]
    const colorStops: (number | string)[] = []
    gradientConfig.colors.forEach((color, index) => {
      const position = index / (gradientConfig.colors.length - 1)
      colorStops.push(position, color)
    })

    return (
      <Rect
        x={0}
        y={0}
        width={canvasWidth}
        height={canvasHeight}
        fillLinearGradientStartPoint={{ x: startX, y: startY }}
        fillLinearGradientEndPoint={{ x: endX, y: endY }}
        fillLinearGradientColorStops={colorStops}
        listening={false}
      />
    )
  }

  if (backgroundType === 'image') {
    // Image background - placeholder for Phase 6+
    // Complex implementation: need to load image, handle aspect ratio, tiling, etc.
    return (
      <Rect
        x={0}
        y={0}
        width={canvasWidth}
        height={canvasHeight}
        fill={backgroundColor}
        listening={false}
      />
    )
  }

  // Default: solid color background
  return (
    <Rect
      x={0}
      y={0}
      width={canvasWidth}
      height={canvasHeight}
      fill={backgroundColor}
      listening={false}
    />
  )
}
