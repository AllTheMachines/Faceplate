import { useRef, useCallback } from 'react'
import { useStore } from '../../../store'
import { ElementConfig } from '../../../types/elements'

const PASTE_OFFSET = 20 // pixels

interface ClipboardData {
  elements: ElementConfig[]
  sourceWindowId: string | null
}

/**
 * Deep clone an element and all its children, generating new IDs
 * Returns an array of all cloned elements (parent + all descendants)
 */
function deepCloneElement(
  element: ElementConfig,
  getElement: (id: string) => ElementConfig | undefined,
  offset: { x: number; y: number } = { x: PASTE_OFFSET, y: PASTE_OFFSET },
  newParentId?: string
): ElementConfig[] {
  const result: ElementConfig[] = []

  // Clone the element itself
  const cloned = structuredClone(element)
  const newId = crypto.randomUUID()

  // Apply offset and new ID
  cloned.id = newId
  cloned.x = element.x + offset.x
  cloned.y = element.y + offset.y

  // Update parentId if this is a child being cloned
  if (newParentId !== undefined) {
    cloned.parentId = newParentId
  }

  // Check if this element has children (is a container)
  const elementWithChildren = element as ElementConfig & { children?: string[] }
  if (elementWithChildren.children && elementWithChildren.children.length > 0) {
    const newChildIds: string[] = []

    // Recursively clone each child
    for (const childId of elementWithChildren.children) {
      const childElement = getElement(childId)
      if (childElement) {
        // Children are positioned relative to parent, so no offset needed
        const clonedChildren = deepCloneElement(childElement, getElement, { x: 0, y: 0 }, newId)
        result.push(...clonedChildren)
        // First element in result is the direct child
        if (clonedChildren.length > 0) {
          newChildIds.push(clonedChildren[0]!.id)
        }
      }
    }

    // Update the container's children array with new IDs
    ;(cloned as ElementConfig & { children?: string[] }).children = newChildIds
  }

  // Add the cloned element first (so it's at index 0 for direct access)
  result.unshift(cloned)

  return result
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

    // Clone and paste each element (with children if container)
    for (const original of clipboardRef.current.elements) {
      // Skip elements that are children of another selected element
      // (they will be cloned as part of their parent)
      const originalWithParent = original as ElementConfig & { parentId?: string }
      if (originalWithParent.parentId) {
        const parentIsAlsoSelected = clipboardRef.current.elements.some(
          (el) => el.id === originalWithParent.parentId
        )
        if (parentIsAlsoSelected) continue
      }

      // Deep clone element and all its children
      const clonedElements = deepCloneElement(original, getElement)

      // Add all cloned elements to store
      for (const cloned of clonedElements) {
        addElement(cloned)
        addElementToWindow(cloned.id)
      }

      // Track the top-level element for selection
      if (clonedElements.length > 0) {
        pastedIds.push(clonedElements[0]!.id)
      }
    }

    // Select the pasted elements
    clearSelection()
    selectMultiple(pastedIds)
  }, [addElement, addElementToWindow, clearSelection, selectMultiple, getElement])

  const duplicateSelected = useCallback(() => {
    // Duplicate = copy + paste in one action
    // Get selected elements that belong to the active window only
    const totalSelected = selectedIds.length
    const elements = selectedIds
      .map((id) => getElement(id))
      .filter((el): el is ElementConfig => {
        if (el === undefined) return false
        // Only include elements that belong to the active window
        const elementWindow = getWindowForElement(el.id)
        return elementWindow?.id === activeWindowId
      })

    const fromOtherWindows = totalSelected - elements.length
    if (fromOtherWindows > 0) {
      console.log(`[Duplicate] Skipping ${fromOtherWindows} element(s) from other windows (duplicating ${elements.length} in active window)`)
    }

    if (elements.length === 0) return

    const pastedIds: string[] = []

    // Clone and paste each element directly (with children if container)
    for (const original of elements) {
      // Skip elements that are children of another selected element
      // (they will be cloned as part of their parent)
      const originalWithParent = original as ElementConfig & { parentId?: string }
      if (originalWithParent.parentId) {
        const parentIsAlsoSelected = elements.some(
          (el) => el.id === originalWithParent.parentId
        )
        if (parentIsAlsoSelected) continue
      }

      // Deep clone element and all its children
      const clonedElements = deepCloneElement(original, getElement)

      // Add all cloned elements to store
      for (const cloned of clonedElements) {
        addElement(cloned)
        addElementToWindow(cloned.id)
      }

      // Track the top-level element for selection
      if (clonedElements.length > 0) {
        pastedIds.push(clonedElements[0]!.id)
      }
    }

    // Select the duplicated elements
    clearSelection()
    selectMultiple(pastedIds)
  }, [selectedIds, getElement, addElement, addElementToWindow, clearSelection, selectMultiple, getWindowForElement, activeWindowId])

  return { copyToClipboard, pasteFromClipboard, duplicateSelected }
}
