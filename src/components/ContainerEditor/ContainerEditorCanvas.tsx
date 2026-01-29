import { useCallback, useMemo, useRef, useEffect, useState } from 'react'
import { useStore } from '../../store'
import { getRenderer } from '../elements/renderers'
import { isEditableContainer, EditableContainer } from '../../types/elements/containers'
import { useContainerCopyPaste } from './hooks/useContainerCopyPaste'
import { useContainerGrid } from './hooks/useContainerGrid'

interface ContainerEditorCanvasProps {
  containerId: string
  contentWidth: number
  contentHeight: number
  onClose: () => void
}

interface DragState {
  isDragging: boolean
  childId: string | null
  startX: number
  startY: number
  currentX: number
  currentY: number
  elementStartX: number
  elementStartY: number
}

/**
 * Canvas area for editing container contents
 * Renders child elements with diagonal stripes outside the canvas area
 */
export function ContainerEditorCanvas({
  containerId,
  contentWidth,
  contentHeight,
  onClose
}: ContainerEditorCanvasProps) {
  const elements = useStore((state) => state.elements)
  const updateElement = useStore((state) => state.updateElement)
  const removeChildFromContainer = useStore((state) => state.removeChildFromContainer)
  const startEditingContainer = useStore((state) => state.startEditingContainer)
  const selectElement = useStore((state) => state.selectElement)
  const toggleSelection = useStore((state) => state.toggleSelection)
  const addToSelection = useStore((state) => state.addToSelection)
  const clearSelection = useStore((state) => state.clearSelection)
  const selectedIds = useStore((state) => state.selectedIds)

  const viewportRef = useRef<HTMLDivElement>(null)
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 })

  // Copy/paste/duplicate support
  const { copyToClipboard, pasteFromClipboard, duplicateSelected } = useContainerCopyPaste(containerId)

  // Grid support - syncs with main canvas settings
  const { showGrid, gridSize, gridColor, snapPosition } = useContainerGrid()

  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null)

  // Drag state - using useState for reactivity
  const [drag, setDrag] = useState<DragState>({
    isDragging: false,
    childId: null,
    startX: 0,
    startY: 0,
    currentX: 0,
    currentY: 0,
    elementStartX: 0,
    elementStartY: 0
  })

  // Get container and its children
  const container = useMemo(() =>
    elements.find((el) => el.id === containerId),
    [elements, containerId]
  )

  const children = useMemo(() => {
    if (!container || !isEditableContainer(container)) return []
    const childIds = (container as EditableContainer).children || []
    return childIds
      .map((id) => elements.find((el) => el.id === id))
      .filter((el): el is typeof elements[number] => el !== undefined)
  }, [container, elements])

  // Measure viewport size
  useEffect(() => {
    if (!viewportRef.current) return
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setViewportSize({ width: entry.contentRect.width, height: entry.contentRect.height })
      }
    })
    resizeObserver.observe(viewportRef.current)
    return () => resizeObserver.disconnect()
  }, [])

  // Calculate canvas position - center in viewport
  const canvasLeft = Math.max(40, (viewportSize.width - contentWidth) / 2)
  const canvasTop = Math.max(40, (viewportSize.height - contentHeight - 60) / 2)

  // Mouse move handler
  useEffect(() => {
    if (!drag.isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      setDrag(prev => ({
        ...prev,
        currentX: e.clientX,
        currentY: e.clientY
      }))
    }

    const handleMouseUp = () => {
      // Apply final position to store
      if (drag.childId) {
        const deltaX = drag.currentX - drag.startX
        const deltaY = drag.currentY - drag.startY
        let newX = Math.max(0, Math.min(contentWidth - 20, drag.elementStartX + deltaX))
        let newY = Math.max(0, Math.min(contentHeight - 20, drag.elementStartY + deltaY))

        // Snap to grid if enabled
        const snapped = snapPosition(newX, newY)
        newX = snapped.x
        newY = snapped.y

        updateElement(drag.childId, { x: newX, y: newY })
      }

      setDrag({
        isDragging: false,
        childId: null,
        startX: 0,
        startY: 0,
        currentX: 0,
        currentY: 0,
        elementStartX: 0,
        elementStartY: 0
      })
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [drag.isDragging, drag.childId, drag.startX, drag.startY, drag.currentX, drag.currentY, drag.elementStartX, drag.elementStartY, contentWidth, contentHeight, updateElement, snapPosition])

  // Handle element click with modifier key support
  const handleElementClick = useCallback((childId: string, e: React.MouseEvent) => {
    const isAlreadySelected = selectedIds.includes(childId)
    const isAltOrCtrl = e.altKey || e.ctrlKey || e.metaKey

    if (e.shiftKey) {
      // Shift+click: Add to selection
      addToSelection(childId)
    } else if (isAltOrCtrl && isAlreadySelected) {
      // Alt/Ctrl+click on selected: Remove from selection
      toggleSelection(childId)
    } else if (isAltOrCtrl && !isAlreadySelected) {
      // Alt/Ctrl+click on unselected: Add to selection
      addToSelection(childId)
    } else if (isAlreadySelected && selectedIds.length > 1) {
      // Plain click on already selected: keep selection
    } else {
      // Plain click: Select only this element
      selectElement(childId)
    }
  }, [selectedIds, selectElement, toggleSelection, addToSelection])

  // Start dragging
  const startDrag = useCallback((childId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    const child = elements.find((el) => el.id === childId)
    if (!child) return

    // Handle selection with modifier keys
    handleElementClick(childId, e)

    // Only start drag if not deselecting
    const isAltOrCtrl = e.altKey || e.ctrlKey || e.metaKey
    const wasSelected = selectedIds.includes(childId)
    if (isAltOrCtrl && wasSelected) {
      // Don't start drag if we're deselecting
      return
    }

    setDrag({
      isDragging: true,
      childId,
      startX: e.clientX,
      startY: e.clientY,
      currentX: e.clientX,
      currentY: e.clientY,
      elementStartX: child.x,
      elementStartY: child.y
    })
  }, [elements, selectedIds, handleElementClick])

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      clearSelection()
    }
  }, [clearSelection])

  // Handle delete selected child
  const handleDeleteChild = useCallback(() => {
    if (selectedIds.length > 0) {
      selectedIds.forEach((id) => {
        const child = elements.find((el) => el.id === id)
        if (child?.parentId === containerId) {
          removeChildFromContainer(containerId, id)
        }
      })
      clearSelection()
    }
  }, [containerId, selectedIds, elements, removeChildFromContainer, clearSelection])

  // Handle double-click on container child (edit nested container)
  const handleChildDoubleClick = useCallback((childId: string) => {
    const child = elements.find((el) => el.id === childId)
    if (child && isEditableContainer(child)) {
      startEditingContainer(childId)
    }
  }, [elements, startEditingContainer])

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Don't intercept if typing in an input
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return
    }

    const isMod = e.metaKey || e.ctrlKey

    if (isMod && e.key === 'c') {
      e.preventDefault()
      copyToClipboard()
    } else if (isMod && e.key === 'v') {
      e.preventDefault()
      pasteFromClipboard()
    } else if (isMod && e.key === 'd') {
      e.preventDefault()
      duplicateSelected()
    } else if (e.key === 'Delete' || e.key === 'Backspace') {
      handleDeleteChild()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [copyToClipboard, pasteFromClipboard, duplicateSelected, handleDeleteChild, onClose])

  // Handle context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY })
  }, [])

  // Focus the viewport on mount for keyboard events
  useEffect(() => {
    viewportRef.current?.focus()
  }, [])

  // Close context menu on click outside
  useEffect(() => {
    if (!contextMenu) return
    const handleClick = () => setContextMenu(null)
    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [contextMenu])

  // Calculate drag offset for visual feedback
  const getDragOffset = (childId: string) => {
    if (!drag.isDragging || drag.childId !== childId) return { x: 0, y: 0 }
    return {
      x: drag.currentX - drag.startX,
      y: drag.currentY - drag.startY
    }
  }

  return (
    <div
      ref={viewportRef}
      className="w-full h-full relative overflow-hidden"
      onKeyDown={handleKeyDown}
      onContextMenu={handleContextMenu}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {/* Diagonal stripes background */}
      <div
        className="absolute inset-0"
        onClick={handleCanvasClick}
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(80, 30, 30, 0.3) 10px,
            rgba(80, 30, 30, 0.3) 20px
          )`,
          backgroundColor: '#120808'
        }}
      />

      {/* Canvas area */}
      <div
        className="absolute"
        style={{
          left: canvasLeft,
          top: canvasTop,
          width: contentWidth,
          height: contentHeight,
          backgroundColor: '#1f1f1f',
          border: '2px solid #4a2020',
          borderRadius: '4px',
          boxShadow: '0 0 40px rgba(0,0,0,0.5)',
          overflow: 'hidden'
        }}
        onClick={handleCanvasClick}
      >
        {/* Grid pattern - synced with main canvas settings */}
        {showGrid && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(to right, ${gridColor}22 1px, transparent 1px),
                linear-gradient(to bottom, ${gridColor}22 1px, transparent 1px)
              `,
              backgroundSize: `${gridSize}px ${gridSize}px`,
            }}
          />
        )}

        {/* Empty state */}
        {children.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <p className="text-gray-500 text-sm">
              Click elements in the palette to add them here
            </p>
          </div>
        )}

        {/* Render children using renderers directly */}
        {children.map((child) => {
          const isSelected = selectedIds.includes(child.id)
          const isBeingDragged = drag.isDragging && drag.childId === child.id
          const isContainer = isEditableContainer(child)
          const Renderer = getRenderer(child.type)
          const dragOffset = getDragOffset(child.id)

          if (!Renderer) return null

          // Calculate position with drag offset
          const displayX = child.x + dragOffset.x
          const displayY = child.y + dragOffset.y

          return (
            <div
              key={child.id}
              className={`absolute select-none ${isSelected ? 'ring-2 ring-red-500' : ''}`}
              style={{
                left: displayX,
                top: displayY,
                width: child.width,
                height: child.height,
                cursor: isBeingDragged ? 'grabbing' : 'grab',
                zIndex: isBeingDragged ? 100 : isSelected ? 10 : 1,
                opacity: isBeingDragged ? 0.8 : 1,
              }}
              onMouseDown={(e) => startDrag(child.id, e)}
              onDoubleClick={() => handleChildDoubleClick(child.id)}
            >
              {/* Render the element visually */}
              <div style={{ width: '100%', height: '100%', pointerEvents: 'none' }}>
                <Renderer config={child} />
              </div>

              {/* Container indicator */}
              {isContainer && (
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 rounded-full flex items-center justify-center pointer-events-none"
                  title="Double-click to edit contents"
                >
                  <svg className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                  </svg>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* OK Button - floating below canvas */}
      <button
        onClick={onClose}
        className="absolute px-6 py-2 text-white font-semibold rounded-lg shadow-lg transition-all hover:scale-105"
        style={{
          left: canvasLeft + contentWidth - 80,
          top: canvasTop + contentHeight + 20,
          backgroundColor: '#b91c1c',
          boxShadow: '0 4px 14px rgba(185, 28, 28, 0.4)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.backgroundColor = '#dc2626'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.backgroundColor = '#b91c1c'
        }}
      >
        OK
      </button>

      {/* Selection info bar */}
      {selectedIds.length > 0 && (
        <div
          className="absolute top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-lg flex items-center gap-4"
          style={{ backgroundColor: 'rgba(45, 21, 21, 0.95)', border: '1px solid #4a2020' }}
        >
          <span className="text-red-200 text-sm">
            {selectedIds.length} element{selectedIds.length > 1 ? 's' : ''} selected
          </span>
          <button
            onClick={handleDeleteChild}
            className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </div>
      )}

      {/* Debug: Show drag state */}
      {drag.isDragging && (
        <div className="absolute bottom-4 left-4 bg-black/80 text-white text-xs p-2 rounded">
          Dragging: {drag.childId} | Offset: {Math.round(drag.currentX - drag.startX)}, {Math.round(drag.currentY - drag.startY)}
        </div>
      )}

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed bg-gray-800 border border-gray-700 rounded shadow-lg py-1 z-50"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full px-4 py-1 text-left text-sm hover:bg-gray-700 text-white"
            onClick={() => { copyToClipboard(); setContextMenu(null) }}
          >
            Copy <span className="text-gray-500 ml-4">Ctrl+C</span>
          </button>
          <button
            className="w-full px-4 py-1 text-left text-sm hover:bg-gray-700 text-white"
            onClick={() => { pasteFromClipboard(); setContextMenu(null) }}
          >
            Paste <span className="text-gray-500 ml-4">Ctrl+V</span>
          </button>
          <button
            className="w-full px-4 py-1 text-left text-sm hover:bg-gray-700 text-white"
            onClick={() => { duplicateSelected(); setContextMenu(null) }}
          >
            Duplicate <span className="text-gray-500 ml-4">Ctrl+D</span>
          </button>
        </div>
      )}
    </div>
  )
}
