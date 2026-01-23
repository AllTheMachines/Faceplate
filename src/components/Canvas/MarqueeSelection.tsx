interface MarqueeSelectionProps {
  rect: {
    x: number
    y: number
    width: number
    height: number
  }
}

export function MarqueeSelection({ rect }: MarqueeSelectionProps) {
  return (
    <div
      style={{
        position: 'absolute',
        left: rect.x,
        top: rect.y,
        width: rect.width,
        height: rect.height,
        border: '1px dashed #3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        pointerEvents: 'none',
      }}
    />
  )
}
