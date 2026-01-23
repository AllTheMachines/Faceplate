import { useHotkeys } from 'react-hotkeys-hook'
import { useStore } from '../../../store'

export function useKeyboardShortcuts() {
  const selectedIds = useStore((state) => state.selectedIds)
  const removeElement = useStore((state) => state.removeElement)
  const clearSelection = useStore((state) => state.clearSelection)
  const moveToFront = useStore((state) => state.moveToFront)
  const moveToBack = useStore((state) => state.moveToBack)
  const moveForward = useStore((state) => state.moveForward)
  const moveBackward = useStore((state) => state.moveBackward)

  // Undo
  useHotkeys(
    'ctrl+z',
    () => {
      useStore.temporal.getState().undo()
    },
    { preventDefault: true }
  )

  // Redo (both Ctrl+Y and Ctrl+Shift+Z)
  useHotkeys(
    'ctrl+y, ctrl+shift+z',
    () => {
      useStore.temporal.getState().redo()
    },
    { preventDefault: true }
  )

  // Delete selected elements
  useHotkeys(
    'delete, backspace',
    () => {
      if (selectedIds.length > 0) {
        selectedIds.forEach((id) => removeElement(id))
        clearSelection()
      }
    },
    { preventDefault: true },
    [selectedIds, removeElement, clearSelection]
  )

  // Clear selection
  useHotkeys('escape', () => {
    clearSelection()
  }, [clearSelection])

  // Bring to Front: Ctrl/Cmd + Shift + ]
  useHotkeys(
    'mod+shift+]',
    (e) => {
      e.preventDefault()
      const id = selectedIds[0]
      if (selectedIds.length === 1 && id) {
        moveToFront(id)
      }
    },
    { enableOnFormTags: false },
    [selectedIds, moveToFront]
  )

  // Send to Back: Ctrl/Cmd + Shift + [
  useHotkeys(
    'mod+shift+[',
    (e) => {
      e.preventDefault()
      const id = selectedIds[0]
      if (selectedIds.length === 1 && id) {
        moveToBack(id)
      }
    },
    { enableOnFormTags: false },
    [selectedIds, moveToBack]
  )

  // Bring Forward: Ctrl/Cmd + ]
  useHotkeys(
    'mod+]',
    (e) => {
      e.preventDefault()
      const id = selectedIds[0]
      if (selectedIds.length === 1 && id) {
        moveForward(id)
      }
    },
    { enableOnFormTags: false },
    [selectedIds, moveForward]
  )

  // Send Backward: Ctrl/Cmd + [
  useHotkeys(
    'mod+[',
    (e) => {
      e.preventDefault()
      const id = selectedIds[0]
      if (selectedIds.length === 1 && id) {
        moveBackward(id)
      }
    },
    { enableOnFormTags: false },
    [selectedIds, moveBackward]
  )
}
