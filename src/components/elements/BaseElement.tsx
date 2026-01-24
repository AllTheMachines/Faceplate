import React from 'react'
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

  // Check if ANY selected element is being dragged (for multi-select visual feedback)
  const isMultiSelectDrag =
    active?.data.current?.sourceType === 'element' &&
    selectedIds.includes(active.data.current.element?.id)

  // Get the live drag position from the store (calculated in App.tsx handleDragMove)
  const liveValue = liveDragValues?.[element.id]

  // Calculate drag delta from live values (for elements not being directly dragged)
  // The dragged element uses its own transform, other selected elements use the calculated delta
  let dragStyle: React.CSSProperties | undefined

  if (isDragging && transform) {
    // This element is being dragged - use its own transform
    dragStyle = { transform: `translate(${transform.x}px, ${transform.y}px)` }
  } else if (isMultiSelectDrag && liveValue && isSelected && !element.locked) {
    // Another selected element is being dragged - use calculated delta from live values
    const deltaX = liveValue.x !== undefined ? liveValue.x - element.x : 0
    const deltaY = liveValue.y !== undefined ? liveValue.y - element.y : 0
    if (deltaX !== 0 || deltaY !== 0) {
      dragStyle = { transform: `translate(${deltaX}px, ${deltaY}px)` }
    }
  }

  const style = React.useMemo(
    () => ({
      position: 'absolute' as const,
      left: element.x,
      top: element.y,
      width: element.width,
      height: element.height,
      transform: `rotate(${element.rotation}deg)`,
      zIndex: element.zIndex,
      visibility: element.visible ? ('visible' as const) : ('hidden' as const),
      // Pointer events: only disable for lock-all mode (UI testing mode)
      // Individual locked elements need pointer events for selection
      pointerEvents: lockAllMode ? ('none' as const) : ('auto' as const),
      cursor: lockAllMode
        ? 'default'
        : element.locked
          ? 'pointer'  // Locked elements: show pointer (can click to select, but not drag)
          : (isDragging ? 'grabbing' : isSelected ? 'grab' : 'pointer'),
      userSelect: 'none' as const,
      ...dragStyle,
    }),
    [
      element.x,
      element.y,
      element.width,
      element.height,
      element.rotation,
      element.zIndex,
      element.visible,
      element.locked,
      lockAllMode,
      isSelected,
      isDragging,
      dragStyle,
      isMultiSelectDrag,
      liveValue,
    ]
  )

  return (
    <div
      ref={setNodeRef}
      data-element-id={element.id}
      style={style}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      {children}
    </div>
  )
}
