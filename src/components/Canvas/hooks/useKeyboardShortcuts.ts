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
  const toggleShowGrid = useStore((state) => state.toggleShowGrid)

  // Copy/paste/duplicate functionality
  const { copyToClipboard, pasteFromClipboard, duplicateSelected } = useCopyPaste()

  // Undo - explicit ctrl+z for Windows/Linux, cmd+z for Mac
  useHotkeys(
    'ctrl+z, meta+z',
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      useStore.temporal.getState().undo()
    },
    { preventDefault: true, enableOnFormTags: true, enableOnContentEditable: true }
  )

  // Redo - ctrl+y, ctrl+shift+z (Windows/Linux), cmd+shift+z (Mac)
  useHotkeys(
    'ctrl+y, ctrl+shift+z, meta+shift+z',
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      useStore.temporal.getState().redo()
    },
    { preventDefault: true, enableOnFormTags: true, enableOnContentEditable: true }
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
    { preventDefault: true, enableOnFormTags: false },
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

  // Duplicate: Ctrl/Cmd + D
  useHotkeys(
    'mod+d',
    (e) => {
      e.preventDefault()
      duplicateSelected()
    },
    { enableOnFormTags: false },
    [duplicateSelected]
  )

  // Toggle Grid: Ctrl/Cmd + G
  useHotkeys(
    'mod+g',
    (e) => {
      e.preventDefault()
      toggleShowGrid()
    },
    { enableOnFormTags: false },
    [toggleShowGrid]
  )
}
