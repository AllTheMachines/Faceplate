import { useHotkeys } from 'react-hotkeys-hook'
import { useStore } from '../../../store'

/**
 * Check if user is currently typing in an input field
 * Prevents arrow key nudge from firing while editing properties
 */
function isTypingInInput(): boolean {
  const active = document.activeElement
  if (!active) return false
  const tagName = active.tagName.toLowerCase()
  return tagName === 'input' || tagName === 'textarea' || active.getAttribute('contenteditable') === 'true'
}

export function useElementNudge() {
  const selectedIds = useStore((state) => state.selectedIds)
  const getElement = useStore((state) => state.getElement)
  const updateElement = useStore((state) => state.updateElement)

  const nudge = (dx: number, dy: number) => {
    if (isTypingInInput()) return
    if (selectedIds.length === 0) return

    selectedIds.forEach((id) => {
      const element = getElement(id)
      if (!element || element.locked) return

      updateElement(id, {
        x: element.x + dx,
        y: element.y + dy,
      })
    })
  }

  // 1px nudge with arrow keys
  useHotkeys('ArrowUp', (e) => {
    e.preventDefault()
    nudge(0, -1)
  }, { enableOnFormTags: false })

  useHotkeys('ArrowDown', (e) => {
    e.preventDefault()
    nudge(0, 1)
  }, { enableOnFormTags: false })

  useHotkeys('ArrowLeft', (e) => {
    e.preventDefault()
    nudge(-1, 0)
  }, { enableOnFormTags: false })

  useHotkeys('ArrowRight', (e) => {
    e.preventDefault()
    nudge(1, 0)
  }, { enableOnFormTags: false })

  // 10px nudge with Shift+Arrow
  useHotkeys('shift+ArrowUp', (e) => {
    e.preventDefault()
    nudge(0, -10)
  }, { enableOnFormTags: false })

  useHotkeys('shift+ArrowDown', (e) => {
    e.preventDefault()
    nudge(0, 10)
  }, { enableOnFormTags: false })

  useHotkeys('shift+ArrowLeft', (e) => {
    e.preventDefault()
    nudge(-10, 0)
  }, { enableOnFormTags: false })

  useHotkeys('shift+ArrowRight', (e) => {
    e.preventDefault()
    nudge(10, 0)
  }, { enableOnFormTags: false })
}
