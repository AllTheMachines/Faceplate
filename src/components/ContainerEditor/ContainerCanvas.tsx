import { useCallback, useState, useMemo, useRef } from 'react'
import { useStore } from '../../store'
import { Element } from '../elements/Element'
import { isEditableContainer, EditableContainer } from '../../types/elements/containers'

interface ContainerCanvasProps {
  containerId: string
  contentWidth: number
  contentHeight: number
}

/**
 * Canvas area for editing container contents
 * Renders child elements and allows selection/manipulation
 */
export function ContainerCanvas({ containerId, contentWidth, contentHeight }: ContainerCanvasProps) {
  const elements = useStore((state) => state.elements)
  const updateElement = useStore((state) => state.updateElement)
  const removeChildFromContainer = useStore((state) => state.removeChildFromContainer)
  const startEditingContainer = useStore((state) => state.startEditingContainer)

  const [selectedChildId, setSelectedChildId] = useState<string | null>(null)

  // Drag state
  const [isDragging, setIsDragging] = useState(false)
  const dragStartRef = useRef<{ x: number; y: number; elementX: number; elementY: number } | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Get container and its children reactively
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

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback(() => {
    setSelectedChildId(null)
  }, [])

  // Handle delete selected child
  const handleDeleteChild = useCallback(() => {
    if (selectedChildId) {
      removeChildFromContainer(containerId, selectedChildId)
      setSelectedChildId(null)
    }
  }, [containerId, selectedChildId, removeChildFromContainer])

  // Handle double-click on container child (edit nested container)
  const handleChildDoubleClick = useCallback((childId: string) => {
    const child = elements.find((el) => el.id === childId)
    if (child && isEditableContainer(child)) {
      startEditingContainer(childId)
    }
  }, [elements, startEditingContainer])

  // Handle keyboard events
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Delete' || e.key === 'Backspace') {
      handleDeleteChild()
    }
  }, [handleDeleteChild])

  // Handle drag start on a child element
  const handleChildMouseDown = useCallback((childId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    setSelectedChildId(childId)

    const child = elements.find((el) => el.id === childId)
    if (!child) return

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      elementX: child.x,
      elementY: child.y,
    }
    setIsDragging(true)
  }, [elements])

  // Handle drag move
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !selectedChildId || !dragStartRef.current) return

    const deltaX = e.clientX - dragStartRef.current.x
    const deltaY = e.clientY - dragStartRef.current.y

    const newX = Math.max(0, Math.min(contentWidth - 20, dragStartRef.current.elementX + deltaX))
    const newY = Math.max(0, Math.min(contentHeight - 20, dragStartRef.current.elementY + deltaY))

    updateElement(selectedChildId, { x: newX, y: newY })
  }, [isDragging, selectedChildId, contentWidth, contentHeight, updateElement])

  // Handle drag end
  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    dragStartRef.current = null
  }, [])

  return (
    <div
      ref={canvasRef}
      className="relative"
      onClick={handleCanvasClick}
      onKeyDown={handleKeyDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      tabIndex={0}
    >
      {/* Canvas background representing container content area */}
      <div
        className="relative bg-gray-800 border-2 border-dashed border-gray-600 rounded"
        style={{
          width: Math.max(contentWidth, 200),
          height: Math.max(contentHeight, 150),
        }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(to right, #ffffff10 1px, transparent 1px),
              linear-gradient(to bottom, #ffffff10 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
          }}
        />

        {/* Empty state */}
        {children.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-gray-500 text-sm">
              Click elements in the palette to add them here
            </p>
          </div>
        )}

        {/* Render children */}
        {children.map((child) => {
          const isSelected = child.id === selectedChildId
          const isContainer = isEditableContainer(child)

          // Create a modified element with zeroed position for rendering
          // (the wrapper div handles positioning, BaseElement would double-position otherwise)
          const renderElement = { ...child, x: 0, y: 0 }

          return (
            <div
              key={child.id}
              className={`absolute cursor-move select-none ${
                isSelected ? 'ring-2 ring-blue-500 ring-offset-1 ring-offset-transparent' : ''
              } ${isDragging && isSelected ? 'opacity-80' : ''}`}
              style={{
                left: child.x,
                top: child.y,
                width: child.width,
                height: child.height,
              }}
              onMouseDown={(e) => handleChildMouseDown(child.id, e)}
              onDoubleClick={() => handleChildDoubleClick(child.id)}
            >
              {/* pointer-events:none prevents Element/BaseElement's dnd-kit from interfering with our manual drag */}
              <div style={{ pointerEvents: 'none', width: '100%', height: '100%' }}>
                <Element element={renderElement} />
              </div>

              {/* Container indicator */}
              {isContainer && (
                <div
                  className="absolute -top-1 -right-1 w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center"
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

      {/* Selection toolbar */}
      {selectedChildId && (
        <div className="absolute top-2 right-2 flex gap-2 bg-gray-800 rounded p-1 border border-gray-700">
          <button
            onClick={handleDeleteChild}
            className="p-1 text-red-400 hover:text-red-300 hover:bg-gray-700 rounded"
            title="Delete (Del)"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      )}
    </div>
  )
}
