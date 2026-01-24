import React, { useRef, useEffect } from 'react'
import { useDraggable, useDndContext } from '@dnd-kit/core'
import { ElementConfig } from '../../types/elements'
import { useStore } from '../../store'

interface BaseElementProps {
  element: ElementConfig
  children: React.ReactNode
  onClick?: (e: React.MouseEvent) => void
}

export function BaseElement({ element, children, onClick }: BaseElementProps) {
  // Check if element is selected
  const selectedIds = useStore((state) => state.selectedIds)
  const isSelected = selectedIds.includes(element.id)
  const lockAllMode = useStore((state) => state.lockAllMode)
  const liveDragValues = useStore((state) => state.liveDragValues)

  // Get DnD context to detect multi-select dragging
  const { active } = useDndContext()

  // Enable dragging for selected, unlocked elements
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `element-${element.id}`,
    data: {
      sourceType: 'element',
      element,
    },
    disabled: !isSelected || element.locked || lockAllMode,
  })

  // Track when drag just finished to prevent onClick from resetting selection
  const wasDraggingRef = useRef(false)
  const justFinishedDragRef = useRef(false)

  useEffect(() => {
    if (isDragging) {
      wasDraggingRef.current = true
    } else if (wasDraggingRef.current) {
      // Drag just ended - set flag to block onClick
      justFinishedDragRef.current = true
      wasDraggingRef.current = false
      // Clear the flag after a short delay (after onClick would fire)
      const timer = setTimeout(() => {
        justFinishedDragRef.current = false
      }, 50)
      return () => clearTimeout(timer)
    }
  }, [isDragging])

  // Wrap onClick to skip if we just finished dragging
  const handleClick = (e: React.MouseEvent) => {
    if (justFinishedDragRef.current) {
      return
    }
    onClick?.(e)
  }

  // Check if ANY selected element is being dragged (for multi-select visual feedback)
  const activeElementId = active?.data.current?.element?.id
  const isMultiSelectDrag =
    active?.data.current?.sourceType === 'element' &&
    activeElementId &&
    selectedIds.includes(activeElementId)

  // Get the live drag position from the store (calculated in App.tsx handleDragMove)
  const liveValue = liveDragValues?.[element.id]

  // Calculate drag offset for transform
  // The dragged element uses its own transform, other selected elements use the calculated delta
  let dragOffsetX = 0
  let dragOffsetY = 0

  if (isDragging && transform) {
    // This element is being dragged - use its own transform
    dragOffsetX = transform.x
    dragOffsetY = transform.y
  } else if (isMultiSelectDrag && liveValue && isSelected && !element.locked) {
    // Another selected element is being dragged - use calculated delta from live values
    dragOffsetX = liveValue.x !== undefined ? liveValue.x - element.x : 0
    dragOffsetY = liveValue.y !== undefined ? liveValue.y - element.y : 0
  }

  // Apply drag offset transform
  const transformValue = dragOffsetX !== 0 || dragOffsetY !== 0
    ? `translate(${dragOffsetX}px, ${dragOffsetY}px)`
    : undefined

  const style: React.CSSProperties = {
    position: 'absolute',
    left: element.x,
    top: element.y,
    width: element.width,
    height: element.height,
    transform: transformValue,
    zIndex: element.zIndex,
    visibility: element.visible ? 'visible' : 'hidden',
    // Pointer events: only disable for lock-all mode (UI testing mode)
    // Individual locked elements need pointer events for selection
    pointerEvents: lockAllMode ? 'none' : 'auto',
    cursor: lockAllMode
      ? 'default'
      : element.locked
        ? 'pointer'  // Locked elements: show pointer (can click to select, but not drag)
        : (isDragging || isMultiSelectDrag ? 'grabbing' : isSelected ? 'grab' : 'pointer'),
    userSelect: 'none',
  }

  return (
    <div
      ref={setNodeRef}
      data-element-id={element.id}
      style={style}
      onClick={handleClick}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  )
}
