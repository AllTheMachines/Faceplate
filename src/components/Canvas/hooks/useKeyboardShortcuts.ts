import { useHotkeys } from 'react-hotkeys-hook'
import { useStore } from '../../../store'

export function useKeyboardShortcuts() {
  const selectedIds = useStore((state) => state.selectedIds)
  const removeElement = useStore((state) => state.removeElement)
  const clearSelection = useStore((state) => state.clearSelection)

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
}
