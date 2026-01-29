import { useRef, useEffect, useState, useCallback, useMemo, KeyboardEvent } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { useStore } from '../../store'
import { usePan, useZoom, useKeyboardShortcuts, useMarquee, useElementNudge } from './hooks'
import { Element } from '../elements'
import { SelectionOverlay } from './SelectionOverlay'
import { MarqueeSelection } from './MarqueeSelection'
import { ElementConfig } from '../../types/elements'
import { LAYER_COLOR_MAP } from '../../types/layer'

// Context menu state type
interface ContextMenuState {
  x: number
  y: number
  elementId: string
}

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

  // Get active window for canvas dimensions and background
  const activeWindow = useStore((state) => state.getActiveWindow())
  const canvasWidth = activeWindow?.width ?? 800
  const canvasHeight = activeWindow?.height ?? 600
  const backgroundColor = activeWindow?.backgroundColor ?? '#1a1a1a'
  const backgroundType = activeWindow?.backgroundType ?? 'color'
  const gradientConfig = activeWindow?.gradientConfig

  // Grid settings
  const showGrid = useStore((state) => state.showGrid)
  const gridSize = useStore((state) => state.gridSize)
  const gridColor = useStore((state) => state.gridColor)

  // Get elements - filter to only show elements in the active window
  const allElements = useStore((state) => state.elements)
  const activeWindowElementIds = activeWindow?.elementIds ?? []
  const elements = allElements.filter((el) => activeWindowElementIds.includes(el.id))
  const selectedIds = useStore((state) => state.selectedIds)
  const clearSelection = useStore((state) => state.clearSelection)
  const updateElement = useStore((state) => state.updateElement)

  // Get layers for z-order sorting and visibility filtering
  const getLayersInOrder = useStore((state) => state.getLayersInOrder)
  const getLayerById = useStore((state) => state.getLayerById)
  const layers = useStore((state) => state.layers)

  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState | null>(null)
  const [showLayerSubmenu, setShowLayerSubmenu] = useState(false)

  // Sort elements by layer order for z-index rendering and filter out hidden layers
  // Elements in lower-order layers render first (back), higher-order layers render later (front)
  const visibleElements = useMemo(() => {
    const orderedLayers = getLayersInOrder() // Returns layers sorted by order (0 = bottom)
    const layerOrderMap = new Map(orderedLayers.map((l, idx) => [l.id, idx]))

    // Filter out elements from hidden layers
    const visibleElems = elements.filter((element) => {
      const layerId = element.layerId || 'default'
      const layer = getLayerById(layerId)
      // Show element if layer is visible or layer not found (backwards compatibility)
      return layer?.visible !== false
    })

    const sortElementsByLayerOrder = (elems: ElementConfig[]): ElementConfig[] => {
      return [...elems].sort((a, b) => {
        const layerIdA = a.layerId || 'default'
        const layerIdB = b.layerId || 'default'

        const orderA = layerOrderMap.get(layerIdA) ?? 0
        const orderB = layerOrderMap.get(layerIdB) ?? 0

        // Elements in lower-order layers render first (back)
        // Elements in higher-order layers render later (front)
        if (orderA !== orderB) {
          return orderA - orderB
        }

        // Within same layer, maintain creation order (array position)
        return 0
      })
    }

    // Sort by layer order
    return sortElementsByLayerOrder(visibleElems)
  }, [elements, getLayersInOrder, getLayerById, layers])

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
    // Close context menu if open
    if (contextMenu) {
      setContextMenu(null)
      setShowLayerSubmenu(false)
      return
    }
    clearSelection()
  }, [clearSelection, justFinishedDrag, contextMenu])

  // Handle context menu on canvas elements
  const handleContextMenu = useCallback((e: React.MouseEvent, elementId: string) => {
    e.preventDefault()
    e.stopPropagation()
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      elementId,
    })
    setShowLayerSubmenu(false)
  }, [])

  // Close context menu when clicking outside
  const handleCloseContextMenu = useCallback(() => {
    setContextMenu(null)
    setShowLayerSubmenu(false)
  }, [])

  // Move element to layer
  const handleMoveToLayer = useCallback((elementId: string, layerId: string) => {
    updateElement(elementId, { layerId })
    setContextMenu(null)
    setShowLayerSubmenu(false)
  }, [updateElement])

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

  // Close context menu when clicking outside
  useEffect(() => {
    if (!contextMenu) return

    const handleClickOutside = (e: MouseEvent) => {
      // Close if clicking anywhere outside the context menu
      const target = e.target as HTMLElement
      if (!target.closest('.canvas-context-menu')) {
        handleCloseContextMenu()
      }
    }

    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleCloseContextMenu()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [contextMenu, handleCloseContextMenu])

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
            onContextMenu={(e) => {
              // Find the element that was right-clicked by traversing up the DOM
              const target = e.target as HTMLElement
              const elementDiv = target.closest('[data-element-id]') as HTMLElement | null
              if (elementDiv) {
                const elementId = elementDiv.getAttribute('data-element-id')
                if (elementId) {
                  handleContextMenu(e, elementId)
                }
              }
            }}
          >
            {/* Elements render here - sorted by layer order, filtered by visibility, exclude children (elements inside containers) */}
            {visibleElements
              .filter((element) => !element.parentId)
              .map((element) => (
                <Element key={element.id} element={element} />
              ))}

            {/* Selection overlays - only for visible top-level elements */}
            {selectedIds
              .filter((id) => {
                const el = visibleElements.find((e) => e.id === id)
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

      {/* Context menu for canvas elements */}
      {contextMenu && (() => {
        const element = allElements.find((el) => el.id === contextMenu.elementId)
        const currentLayerId = element?.layerId || 'default'
        const orderedLayers = getLayersInOrder()

        return (
          <div
            className="canvas-context-menu fixed bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 z-50 min-w-[180px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            {/* Move to Layer menu item */}
            <div
              className="relative"
              onMouseEnter={() => setShowLayerSubmenu(true)}
              onMouseLeave={() => setShowLayerSubmenu(false)}
            >
              <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-700 cursor-pointer text-gray-200 text-sm">
                <span>Move to Layer</span>
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>

              {/* Layer submenu */}
              {showLayerSubmenu && (
                <div className="absolute left-full top-0 bg-gray-800 border border-gray-600 rounded-lg shadow-xl py-1 min-w-[160px] -ml-1">
                  {orderedLayers.map((layer) => {
                    const isCurrentLayer = layer.id === currentLayerId
                    const colorHex = LAYER_COLOR_MAP[layer.color]

                    return (
                      <div
                        key={layer.id}
                        className={`flex items-center gap-2 px-3 py-2 hover:bg-gray-700 cursor-pointer text-sm ${
                          isCurrentLayer ? 'text-blue-400' : 'text-gray-200'
                        }`}
                        onClick={() => handleMoveToLayer(contextMenu.elementId, layer.id)}
                      >
                        {/* Color dot */}
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: colorHex }}
                        />
                        {/* Layer name */}
                        <span className="flex-1 truncate">{layer.name}</span>
                        {/* Checkmark for current layer */}
                        {isCurrentLayer && (
                          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )
      })()}
    </div>
  )
}
