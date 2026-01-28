import { useState } from 'react'
import { useHotkeys } from 'react-hotkeys-hook'

export function useHistoryPanel() {
  const [isPanelVisible, setIsPanelVisible] = useState(false)

  const togglePanel = () => {
    setIsPanelVisible(prev => !prev)
  }

  // Keyboard shortcut: Ctrl+Shift+H (Windows/Linux) or Cmd+Shift+H (Mac)
  useHotkeys(
    'ctrl+shift+h, meta+shift+h',
    (e) => {
      e.preventDefault()
      togglePanel()
    },
    { preventDefault: true, enableOnFormTags: true, enableOnContentEditable: true }
  )

  return {
    isPanelVisible,
    setIsPanelVisible,
    togglePanel,
  }
}
