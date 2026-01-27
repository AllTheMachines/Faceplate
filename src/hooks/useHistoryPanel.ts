import { useState } from 'react'

export function useHistoryPanel() {
  const [isPanelVisible, setIsPanelVisible] = useState(true)

  const togglePanel = () => {
    setIsPanelVisible(prev => !prev)
  }

  return {
    isPanelVisible,
    setIsPanelVisible,
    togglePanel,
  }
}
