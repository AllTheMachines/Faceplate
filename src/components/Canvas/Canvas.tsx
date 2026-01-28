import { useRef, useEffect, useState, useCallback, KeyboardEvent } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useStore } from '../../store'
import { usePan, useZoom, useKeyboardShortcuts, useMarquee, useElementNudge } from './hooks'
import { Element } from '../elements'
import { SelectionOverlay } from './SelectionOverlay'
import { MarqueeSelection } from './MarqueeSelection'

export function Canvas() {
  const viewportRef = useRef<HTMLDivElement>(null)
  const canvasBackgroundRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })

  // Setup droppable area for palette items
  const { setNodeRef: setDroppableRef, isOver } = useDroppable({
    id: 'canvas-droppable',
  })

  // Get viewport state from store
  const scale = useStore((state) => state.scale)
  const offsetX = useStore((state) => state.offsetX)
  const offsetY = useStore((state) => state.offsetY)
  const isPanning = useStore((state) => state.isPanning)
  const dragStart = useStore((state) => state.dragStart)
  const setScale = useStore((state) => state.setScale)
  const setViewport = useStore((state) => state.setViewport)

  // Zoom input state
  const [isEditingZoom, setIsEditingZoom] = useState(false)
  const [zoomInputValue, setZoomInputValue] = useState('')
  const zoomInputRef = useRef<HTMLInputElement>(null)

  // Get canvas dimensions and background
  const canvasWidth = useStore((state) => state.canvasWidth)
  const canvasHeight = useStore((state) => state.canvasHeight)
  const backgroundColor = useStore((state) => state.backgroundColor)
  const backgroundType = useStore((state) => state.backgroundType)
  const gradientConfig = useStore((state) => state.gradientConfig)

  // Grid settings
  const showGrid = useStore((state) => state.showGrid)
  const gridSize = useStore((state) => state.gridSize)
  const gridColor = useStore((state) => state.gridColor)

  // Get elements
  const elements = useStore((state) => state.elements)
  const selectedIds = useStore((state) => state.selectedIds)
  const clearSelection = useStore((state) => state.clearSelection)

  // Use pan and zoom hooks
  const { handlers: panHandlers } = usePan(viewportRef)
  useZoom(viewportRef)

  // Use marquee selection
  const { marqueeRect, justFinishedDrag, handlers: marqueeHandlers } = useMarquee(canvasBackgroundRef)

  // Use keyboard shortcuts
  useKeyboardShortcuts()
  useElementNudge()

  // Handle background click - only clear selection if it wasn't a marquee drag
  const handleBackgroundClick = useCallback(() => {
    // If we just finished a marquee drag, don't clear selection
    // The marquee just selected elements, we don't want to immediately clear them
    if (justFinishedDrag) {
      return
    }
    clearSelection()
  }, [clearSelection, justFinishedDrag])

  // Zoom edit handlers
  const handleZoomDoubleClick = useCallback(() => {
    // Reset to 100% and center the canvas
    const viewportEl = viewportRef.current
    if (viewportEl) {
      const rect = viewportEl.getBoundingClientRect()
      // Center the canvas at 100%
      const newOffsetX = (rect.width - canvasWidth) / 2
      const newOffsetY = (rect.height - canvasHeight) / 2
      setViewport(1, newOffsetX, newOffsetY)
    } else {
      setScale(1)
    }
  }, [canvasWidth, canvasHeight, setViewport, setScale])

  const handleZoomClick = useCallback(() => {
    setZoomInputValue(Math.round(scale * 100).toString())
    setIsEditingZoom(true)
    // Focus input after render
    setTimeout(() => zoomInputRef.current?.select(), 0)
  }, [scale])

  const handleZoomInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers
    const value = e.target.value.replace(/[^0-9]/g, '')
    setZoomInputValue(value)
  }, [])

  const handleZoomInputBlur = useCallback(() => {
    const percent = parseInt(zoomInputValue, 10)
    if (!isNaN(percent) && percent >= 10 && percent <= 1000) {
      setScale(percent / 100)
    }
    setIsEditingZoom(false)
  }, [zoomInputValue, setScale])

  const handleZoomInputKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleZoomInputBlur()
    } else if (e.key === 'Escape') {
      setIsEditingZoom(false)
    }
  }, [handleZoomInputBlur])

  // Combine refs for canvas background (both droppable and local ref)
  // Use effect to sync the droppable ref after canvasBackgroundRef is set
  useEffect(() => {
    if (canvasBackgroundRef.current) {
      setDroppableRef(canvasBackgroundRef.current)
    }
  }, [setDroppableRef])

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

  // Calculate grid pattern style
  const getGridPattern = (): string | undefined => {
    if (!showGrid) return undefined

    // Create a subtle grid using CSS gradients
    // Use 10% opacity for a subtle effect
    const gridColorWithAlpha = `${gridColor}1a` // ~10% opacity
    const lineWidth = 1

    return `
      linear-gradient(to right, ${gridColorWithAlpha} ${lineWidth}px, transparent ${lineWidth}px),
      linear-gradient(to bottom, ${gridColorWithAlpha} ${lineWidth}px, transparent ${lineWidth}px)
    `.trim()
  }

  // Calculate background style
  const getBackgroundStyle = (): React.CSSProperties => {
    const gridPattern = getGridPattern()

    if (backgroundType === 'gradient' && gradientConfig) {
      const angle = gradientConfig.angle ?? 180
      const colorString = gradientConfig.colors.join(', ')

      if (gridPattern) {
        return {
          background: `${gridPattern}, linear-gradient(${angle}deg, ${colorString})`,
          backgroundSize: `${gridSize}px ${gridSize}px, 100% 100%`,
        }
      }

      return {
        background: `linear-gradient(${angle}deg, ${colorString})`,
      }
    }

    // Default: solid color
    if (gridPattern) {
      return {
        backgroundColor,
        backgroundImage: gridPattern,
        backgroundSize: `${gridSize}px ${gridSize}px`,
      }
    }

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
            ref={canvasBackgroundRef}
            className={`canvas-background ${isOver ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}
            style={{
              width: `${canvasWidth}px`,
              height: `${canvasHeight}px`,
              border: '1px solid #4b5563',
              position: 'relative',
              ...getBackgroundStyle(),
            }}
            onClick={handleBackgroundClick}
            onMouseDown={marqueeHandlers.onMouseDown}
            onMouseMove={marqueeHandlers.onMouseMove}
            onMouseUp={marqueeHandlers.onMouseUp}
            onMouseLeave={marqueeHandlers.onMouseLeave}
          >
            {/* Elements render here - filter out children (elements inside containers) */}
            {elements
              .filter((element) => !element.parentId)
              .map((element) => (
                <Element key={element.id} element={element} />
              ))}

            {/* Selection overlays - only for top-level elements */}
            {selectedIds
              .filter((id) => {
                const el = elements.find((e) => e.id === id)
                return el && !el.parentId
              })
              .map((id) => (
                <SelectionOverlay key={`selection-${id}`} elementId={id} />
              ))}

            {/* Marquee selection rectangle (only show after 5px threshold) */}
            {marqueeRect && marqueeRect.width > 5 && marqueeRect.height > 5 && (
              <MarqueeSelection rect={marqueeRect} />
            )}
          </div>
        </div>
      </div>

      {/* Zoom indicator - click to edit, double-click to reset to 100% */}
      {viewportSize.width > 0 && (
        <div
          className="absolute bottom-4 right-4 bg-gray-800 border border-gray-700 px-3 py-1 rounded text-sm text-gray-300 cursor-pointer hover:bg-gray-700 hover:border-gray-600 transition-colors select-none"
          onClick={handleZoomClick}
          onDoubleClick={handleZoomDoubleClick}
          title="Click to edit, double-click to reset to 100%"
        >
          {isEditingZoom ? (
            <input
              ref={zoomInputRef}
              type="text"
              value={zoomInputValue}
              onChange={handleZoomInputChange}
              onBlur={handleZoomInputBlur}
              onKeyDown={handleZoomInputKeyDown}
              className="w-12 bg-transparent border-none outline-none text-gray-300 text-center"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            Math.round(scale * 100)
          )}%
        </div>
      )}
    </div>
  )
}
