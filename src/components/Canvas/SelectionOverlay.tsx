import { useStore } from '../../store'
import { useResize, getResizeCursor } from './hooks'

interface SelectionOverlayProps {
  elementId: string
}

type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

export function SelectionOverlay({ elementId }: SelectionOverlayProps) {
  const element = useStore((state) => state.getElement(elementId))
  const { startResize } = useResize()

  // If element doesn't exist, don't render
  if (!element) {
    return null
  }

  const { x, y, width, height, rotation = 0 } = element

  // Calculate transform
  const transform = rotation !== 0 ? `rotate(${rotation}deg)` : undefined

  // ResizeHandle component
  const ResizeHandle = ({ position }: { position: HandlePosition }) => {
    const handleStyles: React.CSSProperties = {
      position: 'absolute',
      width: '8px',
      height: '8px',
      background: 'white',
      border: '1px solid #3b82f6',
      pointerEvents: 'auto',
      cursor: getResizeCursor(position),
    }

    // Position-specific styles
    const positionStyles: React.CSSProperties = {}
    switch (position) {
      case 'nw':
        positionStyles.left = '-4px'
        positionStyles.top = '-4px'
        break
      case 'n':
        positionStyles.left = '50%'
        positionStyles.top = '-4px'
        positionStyles.transform = 'translateX(-50%)'
        break
      case 'ne':
        positionStyles.right = '-4px'
        positionStyles.top = '-4px'
        break
      case 'e':
        positionStyles.right = '-4px'
        positionStyles.top = '50%'
        positionStyles.transform = 'translateY(-50%)'
        break
      case 'se':
        positionStyles.right = '-4px'
        positionStyles.bottom = '-4px'
        break
      case 's':
        positionStyles.left = '50%'
        positionStyles.bottom = '-4px'
        positionStyles.transform = 'translateX(-50%)'
        break
      case 'sw':
        positionStyles.left = '-4px'
        positionStyles.bottom = '-4px'
        break
      case 'w':
        positionStyles.left = '-4px'
        positionStyles.top = '50%'
        positionStyles.transform = 'translateY(-50%)'
        break
    }

    return (
      <div
        className="resize-handle"
        style={{ ...handleStyles, ...positionStyles }}
        onMouseDown={(e) => startResize(e, position, elementId)}
      />
    )
  }

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
      <ResizeHandle position="nw" />
      <ResizeHandle position="ne" />
      <ResizeHandle position="sw" />
      <ResizeHandle position="se" />

      {/* Edge handles */}
      <ResizeHandle position="n" />
      <ResizeHandle position="s" />
      <ResizeHandle position="e" />
      <ResizeHandle position="w" />
    </div>
  )
}
