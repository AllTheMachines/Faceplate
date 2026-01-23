import { useStore } from '../../store'

interface SelectionOverlayProps {
  elementId: string
}

export function SelectionOverlay({ elementId }: SelectionOverlayProps) {
  const element = useStore((state) => state.getElement(elementId))

  // If element doesn't exist, don't render
  if (!element) {
    return null
  }

  const { x, y, width, height, rotation = 0 } = element

  // Calculate transform
  const transform = rotation !== 0 ? `rotate(${rotation}deg)` : undefined

  return (
    <div
      className="selection-overlay"
      style={{
        position: 'absolute',
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
        height: `${height}px`,
        border: '2px solid #3b82f6',
        pointerEvents: 'none',
        transformOrigin: '0 0',
        transform,
      }}
    >
      {/* Corner handles */}
      <div
        className="resize-handle"
        style={{
          position: 'absolute',
          width: '8px',
          height: '8px',
          background: 'white',
          border: '1px solid #3b82f6',
          left: '-4px',
          top: '-4px',
        }}
      />
      <div
        className="resize-handle"
        style={{
          position: 'absolute',
          width: '8px',
          height: '8px',
          background: 'white',
          border: '1px solid #3b82f6',
          right: '-4px',
          top: '-4px',
        }}
      />
      <div
        className="resize-handle"
        style={{
          position: 'absolute',
          width: '8px',
          height: '8px',
          background: 'white',
          border: '1px solid #3b82f6',
          left: '-4px',
          bottom: '-4px',
        }}
      />
      <div
        className="resize-handle"
        style={{
          position: 'absolute',
          width: '8px',
          height: '8px',
          background: 'white',
          border: '1px solid #3b82f6',
          right: '-4px',
          bottom: '-4px',
        }}
      />

      {/* Edge handles */}
      <div
        className="resize-handle"
        style={{
          position: 'absolute',
          width: '8px',
          height: '8px',
          background: 'white',
          border: '1px solid #3b82f6',
          left: '50%',
          top: '-4px',
          transform: 'translateX(-50%)',
        }}
      />
      <div
        className="resize-handle"
        style={{
          position: 'absolute',
          width: '8px',
          height: '8px',
          background: 'white',
          border: '1px solid #3b82f6',
          left: '50%',
          bottom: '-4px',
          transform: 'translateX(-50%)',
        }}
      />
      <div
        className="resize-handle"
        style={{
          position: 'absolute',
          width: '8px',
          height: '8px',
          background: 'white',
          border: '1px solid #3b82f6',
          right: '-4px',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
      <div
        className="resize-handle"
        style={{
          position: 'absolute',
          width: '8px',
          height: '8px',
          background: 'white',
          border: '1px solid #3b82f6',
          left: '-4px',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
      />
    </div>
  )
}
