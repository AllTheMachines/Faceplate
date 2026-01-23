import { useRef, useCallback } from 'react'
import { useStore } from '../../../store'
import { ElementConfig } from '../../../types/elements'

const PASTE_OFFSET = 20 // pixels

export function useCopyPaste() {
  // In-memory clipboard storage
  const clipboardRef = useRef<ElementConfig[]>([])

  // Store selectors
  const selectedIds = useStore((state) => state.selectedIds)
  const getElement = useStore((state) => state.getElement)
  const addElement = useStore((state) => state.addElement)
  const clearSelection = useStore((state) => state.clearSelection)
  const selectMultiple = useStore((state) => state.selectMultiple)

  const copyToClipboard = useCallback(() => {
    // Get selected elements
    const elements = selectedIds
      .map((id) => getElement(id))
      .filter((el): el is ElementConfig => el !== undefined)

    if (elements.length === 0) return

    // Store in in-memory clipboard
    clipboardRef.current = elements

    // Optionally write to system clipboard for debugging (non-blocking)
    try {
      navigator.clipboard.writeText(JSON.stringify(elements, null, 2))
    } catch {
      // Silently ignore - system clipboard is optional
    }
  }, [selectedIds, getElement])

  const pasteFromClipboard = useCallback(() => {
    if (clipboardRef.current.length === 0) return

    const pastedIds: string[] = []

    // Clone and paste each element
    for (const original of clipboardRef.current) {
      // Deep clone to handle nested objects like colorStops in meters
      const cloned = structuredClone(original)

      // Generate new UUID and offset position
      const pasted: ElementConfig = {
        ...cloned,
        id: crypto.randomUUID(),
        x: cloned.x + PASTE_OFFSET,
        y: cloned.y + PASTE_OFFSET,
      }

      // Add to store (automatically tracked by zundo for undo)
      addElement(pasted)
      pastedIds.push(pasted.id)
    }

    // Select the pasted elements
    clearSelection()
    selectMultiple(pastedIds)
  }, [addElement, clearSelection, selectMultiple])

  return { copyToClipboard, pasteFromClipboard }
}
