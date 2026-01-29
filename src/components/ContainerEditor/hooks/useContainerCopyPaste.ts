import { useRef, useCallback } from 'react'
import { useStore } from '../../../store'
import { ElementConfig } from '../../../types/elements'

const PASTE_OFFSET = 20

export function useContainerCopyPaste(containerId: string) {
  const clipboardRef = useRef<ElementConfig[]>([])

  const selectedIds = useStore((state) => state.selectedIds)
  const getElement = useStore((state) => state.getElement)
  const addChildToContainer = useStore((state) => state.addChildToContainer)
  const getContainerChildren = useStore((state) => state.getContainerChildren)
  const clearSelection = useStore((state) => state.clearSelection)
  const selectMultiple = useStore((state) => state.selectMultiple)

  const copyToClipboard = useCallback(() => {
    // Get selected elements that are children of this container
    const children = getContainerChildren(containerId)
    const childIds = new Set(children.map(c => c.id))

    const elements = selectedIds
      .filter(id => childIds.has(id))
      .map(id => getElement(id))
      .filter((el): el is ElementConfig => el !== undefined)

    if (elements.length === 0) return

    clipboardRef.current = elements
  }, [selectedIds, getElement, containerId, getContainerChildren])

  const pasteFromClipboard = useCallback(() => {
    if (clipboardRef.current.length === 0) return

    const pastedIds: string[] = []

    for (const original of clipboardRef.current) {
      // Clone with new ID and offset
      const cloned = {
        ...structuredClone(original),
        id: crypto.randomUUID(),
        x: original.x + PASTE_OFFSET,
        y: original.y + PASTE_OFFSET,
        name: `${original.name} copy`,
      }

      // Add to container
      addChildToContainer(containerId, cloned)
      pastedIds.push(cloned.id)
    }

    // Select pasted elements
    clearSelection()
    selectMultiple(pastedIds)
  }, [containerId, addChildToContainer, clearSelection, selectMultiple])

  const duplicateSelected = useCallback(() => {
    // Get selected elements that are children of this container
    const children = getContainerChildren(containerId)
    const childIds = new Set(children.map(c => c.id))

    const elements = selectedIds
      .filter(id => childIds.has(id))
      .map(id => getElement(id))
      .filter((el): el is ElementConfig => el !== undefined)

    if (elements.length === 0) return

    const duplicatedIds: string[] = []

    for (const original of elements) {
      const cloned = {
        ...structuredClone(original),
        id: crypto.randomUUID(),
        x: original.x + PASTE_OFFSET,
        y: original.y + PASTE_OFFSET,
        name: `${original.name} copy`,
      }

      addChildToContainer(containerId, cloned)
      duplicatedIds.push(cloned.id)
    }

    clearSelection()
    selectMultiple(duplicatedIds)
  }, [selectedIds, getElement, containerId, getContainerChildren, addChildToContainer, clearSelection, selectMultiple])

  return { copyToClipboard, pasteFromClipboard, duplicateSelected }
}
