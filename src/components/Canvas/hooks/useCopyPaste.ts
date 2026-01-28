import { useRef, useCallback } from 'react'
import { useStore } from '../../../store'
import { ElementConfig } from '../../../types/elements'

const PASTE_OFFSET = 20 // pixels

interface ClipboardData {
  elements: ElementConfig[]
  sourceWindowId: string | null
}

export function useCopyPaste() {
  // In-memory clipboard storage with source window tracking
  const clipboardRef = useRef<ClipboardData>({ elements: [], sourceWindowId: null })

  // Store selectors
  const selectedIds = useStore((state) => state.selectedIds)
  const getElement = useStore((state) => state.getElement)
  const addElement = useStore((state) => state.addElement)
  const clearSelection = useStore((state) => state.clearSelection)
  const selectMultiple = useStore((state) => state.selectMultiple)
  const activeWindowId = useStore((state) => state.activeWindowId)
  const addElementToWindow = useStore((state) => state.addElementToWindow)
  const getWindowForElement = useStore((state) => state.getWindowForElement)

  const copyToClipboard = useCallback(() => {
    // Get selected elements that belong to the active window only
    const elements = selectedIds
      .map((id) => getElement(id))
      .filter((el): el is ElementConfig => {
        if (el === undefined) return false
        // Only include elements that belong to the active window
        const elementWindow = getWindowForElement(el.id)
        return elementWindow?.id === activeWindowId
      })

    if (elements.length === 0) return

    // Store in in-memory clipboard with source window
    clipboardRef.current = {
      elements,
      sourceWindowId: activeWindowId,
    }

    // Optionally write to system clipboard for debugging (non-blocking)
    try {
      navigator.clipboard.writeText(JSON.stringify(elements, null, 2))
    } catch {
      // Silently ignore - system clipboard is optional
    }
  }, [selectedIds, getElement, activeWindowId, getWindowForElement])

  const pasteFromClipboard = useCallback(() => {
    if (clipboardRef.current.elements.length === 0) return

    const pastedIds: string[] = []

    // Clone and paste each element
    for (const original of clipboardRef.current.elements) {
      // Deep clone to handle nested objects like colorStops in meters
      const cloned = structuredClone(original)

      // Generate new UUID and offset position
      const newId = crypto.randomUUID()
      const pasted: ElementConfig = {
        ...cloned,
        id: newId,
        x: cloned.x + PASTE_OFFSET,
        y: cloned.y + PASTE_OFFSET,
      }

      // Add to store (automatically tracked by zundo for undo)
      addElement(pasted)

      // Add element to active window
      addElementToWindow(newId)

      pastedIds.push(newId)
    }

    // Select the pasted elements
    clearSelection()
    selectMultiple(pastedIds)
  }, [addElement, addElementToWindow, clearSelection, selectMultiple])

  const duplicateSelected = useCallback(() => {
    // Duplicate = copy + paste in one action
    // Get selected elements that belong to the active window only
    const elements = selectedIds
      .map((id) => getElement(id))
      .filter((el): el is ElementConfig => {
        if (el === undefined) return false
        // Only include elements that belong to the active window
        const elementWindow = getWindowForElement(el.id)
        return elementWindow?.id === activeWindowId
      })

    if (elements.length === 0) return

    const pastedIds: string[] = []

    // Clone and paste each element directly (no clipboard storage)
    for (const original of elements) {
      const cloned = structuredClone(original)
      const newId = crypto.randomUUID()
      const pasted: ElementConfig = {
        ...cloned,
        id: newId,
        x: cloned.x + PASTE_OFFSET,
        y: cloned.y + PASTE_OFFSET,
      }

      addElement(pasted)
      addElementToWindow(newId)
      pastedIds.push(newId)
    }

    // Select the duplicated elements
    clearSelection()
    selectMultiple(pastedIds)
  }, [selectedIds, getElement, addElement, addElementToWindow, clearSelection, selectMultiple, getWindowForElement, activeWindowId])

  return { copyToClipboard, pasteFromClipboard, duplicateSelected }
}
