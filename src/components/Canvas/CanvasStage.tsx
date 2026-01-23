import { useRef, useEffect, useState } from 'react'
import { Stage, Layer, Rect } from 'react-konva'
import Konva from 'konva'
import { useStore } from '../../store'
import { CanvasBackground } from './CanvasBackground'
import { usePan } from './hooks'

export function CanvasStage() {
  const stageRef = useRef<Konva.Stage>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  // Get viewport state from store
  const scale = useStore((state) => state.scale)
  const offsetX = useStore((state) => state.offsetX)
  const offsetY = useStore((state) => state.offsetY)
  const dragStart = useStore((state) => state.dragStart)

  // Get canvas dimensions for border
  const canvasWidth = useStore((state) => state.canvasWidth)
  const canvasHeight = useStore((state) => state.canvasHeight)

  // Use pan hook
  const { isPanning, handlers: panHandlers } = usePan()

  // Measure container size with ResizeObserver
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect
        setContainerSize({ width, height })
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {containerSize.width > 0 && containerSize.height > 0 && (
        <>
          <Stage
            ref={stageRef}
            width={containerSize.width}
            height={containerSize.height}
            scaleX={scale}
            scaleY={scale}
            x={offsetX}
            y={offsetY}
            {...panHandlers}
            style={{
              cursor: isPanning && dragStart ? 'grabbing' : isPanning ? 'grab' : 'default',
            }}
          >
            <Layer>
              <CanvasBackground />
              {/* Canvas border */}
              <Rect
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
                stroke="#4b5563"
                strokeWidth={1}
                listening={false}
              />
            </Layer>
          </Stage>

          {/* Zoom indicator */}
          <div className="absolute bottom-4 right-4 bg-gray-800 border border-gray-700 px-3 py-1 rounded text-sm text-gray-300">
            {Math.round(scale * 100)}%
          </div>
        </>
      )}
    </div>
  )
}
