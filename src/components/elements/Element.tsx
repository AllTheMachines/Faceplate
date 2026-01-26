import React from 'react'
import { ElementConfig } from '../../types/elements'
import { useStore } from '../../store'
import { BaseElement } from './BaseElement'
import { getRenderer } from './renderers'

interface ElementProps {
  element: ElementConfig
}

function ElementComponent({ element }: ElementProps) {
  // Get selection actions from store
  const selectElement = useStore((state) => state.selectElement)
  const toggleSelection = useStore((state) => state.toggleSelection)
  const addToSelection = useStore((state) => state.addToSelection)
  const lockAllMode = useStore((state) => state.lockAllMode)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()

    // Lock-all mode blocks ALL interactions (for UI testing)
    if (lockAllMode) return

    // Get current selection to check if element is already selected
    const selectedIds = useStore.getState().selectedIds
    const isAlreadySelected = selectedIds.includes(element.id)

    if (e.shiftKey) {
      // Shift+click: add to selection
      addToSelection(element.id)
    } else if (e.ctrlKey || e.metaKey) {
      // Ctrl/Cmd+click: toggle in selection
      toggleSelection(element.id)
    } else if (isAlreadySelected && selectedIds.length > 1) {
      // Plain click on already-selected element with multi-selection: keep selection
    } else {
      // Plain click: select only this element
      selectElement(element.id)
    }
  }

  // Get renderer from registry (O(1) lookup)
  const Renderer = getRenderer(element.type)

  // Fallback for unknown types (defensive - should never happen with proper typing)
  if (!Renderer) {
    console.warn(`No renderer found for element type: ${element.type}`)
    return null
  }

  return (
    <BaseElement element={element} onClick={handleClick}>
      <Renderer config={element} />
    </BaseElement>
  )
}

// Memoize to prevent re-renders when other elements change
export const Element = React.memo(ElementComponent)
