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

  // Check if another selected element is being dragged (multi-select scenario)
  const activeElementId = active?.data.current?.element?.id
  const isAnotherSelectedElementDragging =
    active?.data.current?.sourceType === 'element' &&
    activeElementId !== element.id &&
    selectedIds.includes(activeElementId) &&
    isSelected &&
    !element.locked

  // Get the drag delta from the active element for multi-select dragging
  // We need to use the same delta that the dragged element has
  const activeDragDelta = active && isAnotherSelectedElementDragging
    ? { x: (active.rect.current.translated?.left ?? 0) - (active.rect.current.initial?.left ?? 0),
        y: (active.rect.current.translated?.top ?? 0) - (active.rect.current.initial?.top ?? 0) }
    : null

  // Apply drag transform for live preview
  // For the dragged element, use its own transform
  // For other selected elements during multi-drag, use the active element's delta
  const dragStyle = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
      }
    : activeDragDelta
    ? {
        transform: `translate(${activeDragDelta.x}px, ${activeDragDelta.y}px)`,
      }
    : undefined

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
      isAnotherSelectedElementDragging,
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
