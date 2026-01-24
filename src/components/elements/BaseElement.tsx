import React from 'react'
import { useDraggable } from '@dnd-kit/core'
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

  // Enable dragging for selected, unlocked elements
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `element-${element.id}`,
    data: {
      sourceType: 'element',
      element,
    },
    disabled: !isSelected || element.locked || lockAllMode,
  })

  // Apply drag transform for live preview
  const dragStyle = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
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
      pointerEvents: element.locked || lockAllMode ? ('none' as const) : ('auto' as const),
      cursor: lockAllMode || element.locked ? 'default' : (isDragging ? 'grabbing' : isSelected ? 'grab' : 'pointer'),
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
