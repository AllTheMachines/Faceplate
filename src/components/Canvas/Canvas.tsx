import { useRef, useEffect, useState } from 'react'
import { useStore } from '../../store'
import { usePan, useZoom } from './hooks'

export function Canvas() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })

  // Get viewport state from store
  const scale = useStore((state) => state.scale)
  const offsetX = useStore((state) => state.offsetX)
  const offsetY = useStore((state) => state.offsetY)
  const isPanning = useStore((state) => state.isPanning)
  const dragStart = useStore((state) => state.dragStart)

  // Get canvas dimensions and background
  const canvasWidth = useStore((state) => state.canvasWidth)
  const canvasHeight = useStore((state) => state.canvasHeight)
  const backgroundColor = useStore((state) => state.backgroundColor)
  const backgroundType = useStore((state) => state.backgroundType)
  const gradientConfig = useStore((state) => state.gradientConfig)

  // Get elements
  const elements = useStore((state) => state.elements)

  // Use pan and zoom hooks
  const { handlers: panHandlers } = usePan(viewportRef)
  const { handleWheel } = useZoom(viewportRef)

  // Measure viewport size with ResizeObserver
  useEffect(() => {
    if (!viewportRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setViewportSize({ width, height })
      }
    })

    resizeObserver.observe(viewportRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  // Calculate CSS transform: translate BEFORE scale (critical!)
  const transform = `translate(${offsetX}px, ${offsetY}px) scale(${scale})`

  // Calculate background style
  const getBackgroundStyle = (): React.CSSProperties => {
    if (backgroundType === 'gradient' && gradientConfig) {
      const angle = gradientConfig.angle ?? 180
      const colorString = gradientConfig.colors.join(', ')
      return {
        background: `linear-gradient(${angle}deg, ${colorString})`,
      }
    }

    // Default: solid color
    return {
      backgroundColor,
    }
  }

  // Cursor style
  const cursor = isPanning && dragStart ? 'grabbing' : isPanning ? 'grab' : 'default'

  return (
    <div className="w-full h-full relative">
      {/* Viewport container (handles events) */}
      <div
        ref={viewportRef}
        className="canvas-viewport w-full h-full overflow-hidden"
        style={{ cursor }}
        {...panHandlers}
        onWheel={handleWheel}
      >
        {/* Transform container (applies zoom/pan) */}
        <div
          className="canvas-container"
          style={{
            transform,
            transformOrigin: '0 0',
            willChange: 'transform',
          }}
        >
          {/* Canvas background (the actual canvas area) */}
          <div
            className="canvas-background"
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              border: '1px solid #4b5563',
              position: 'relative',
              ...getBackgroundStyle(),
            }}
          >
            {/* Elements will render here */}
            {elements.map((element) => (
              <div
                key={element.id}
                className="canvas-element"
                style={{
                  position: 'absolute',
                  left: `${element.x}px`,
                  top: `${element.y}px`,
                  width: `${element.width}px`,
                  height: `${element.height}px`,
                  transform: `rotate(${element.rotation}deg)`,
                  zIndex: element.zIndex,
                  visibility: element.visible ? 'visible' : 'hidden',
                  pointerEvents: element.locked ? 'none' : 'auto',
                  // Placeholder styling for v1 (Phase 3+ will render actual elements)
                  border: '2px dashed #3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#3b82f6',
                  fontSize: '12px',
                  fontFamily: 'monospace',
                }}
              >
                {element.type}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Zoom indicator */}
      {viewportSize.width > 0 && (
        <div className="absolute bottom-4 right-4 bg-gray-800 border border-gray-700 px-3 py-1 rounded text-sm text-gray-300">
          {Math.round(scale * 100)}%
        </div>
      )}
    </div>
  )
}
