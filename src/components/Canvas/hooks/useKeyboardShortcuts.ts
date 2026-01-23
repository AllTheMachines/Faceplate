import { useHotkeys } from 'react-hotkeys-hook'
import { useStore } from '../../../store'
import { useCopyPaste } from './useCopyPaste'

export function useKeyboardShortcuts() {
  const selectedIds = useStore((state) => state.selectedIds)
  const removeElement = useStore((state) => state.removeElement)
  const clearSelection = useStore((state) => state.clearSelection)
  const moveToFront = useStore((state) => state.moveToFront)
  const moveToBack = useStore((state) => state.moveToBack)
  const moveForward = useStore((state) => state.moveForward)
  const moveBackward = useStore((state) => state.moveBackward)

  // Copy/paste functionality
  const { copyToClipboard, pasteFromClipboard } = useCopyPaste()

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
      if (selectedIds.length === 1 && selectedIds[0]) {
        moveToFront(selectedIds[0])
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
      if (selectedIds.length === 1 && selectedIds[0]) {
        moveToBack(selectedIds[0])
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
      if (selectedIds.length === 1 && selectedIds[0]) {
        moveForward(selectedIds[0])
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
      if (selectedIds.length === 1 && selectedIds[0]) {
        moveBackward(selectedIds[0])
      }
    },
    { enableOnFormTags: false },
    [selectedIds, moveBackward]
  )

  // Copy: Ctrl/Cmd + C
  useHotkeys(
    'mod+c',
    (e) => {
      e.preventDefault()
      copyToClipboard()
    },
    { enableOnFormTags: false },
    [copyToClipboard]
  )

  // Paste: Ctrl/Cmd + V
  useHotkeys(
    'mod+v',
    (e) => {
      e.preventDefault()
      pasteFromClipboard()
    },
    { enableOnFormTags: false },
    [pasteFromClipboard]
  )
}
