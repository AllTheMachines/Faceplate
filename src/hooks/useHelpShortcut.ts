/**
 * F1 Help Shortcut Hook
 * Opens contextual help for selected element or general app help
 */

import { useHotkeys } from 'react-hotkeys-hook'
import { useStore } from '../store'
import { openHelpWindow } from '../services/helpService'
import { getElementHelp } from '../content/help/elements'
import { generalHelp } from '../content/help/general'

export function useHelpShortcut() {
  const selectedIds = useStore(state => state.selectedIds)
  const elements = useStore(state => state.elements)

  useHotkeys('f1', (event) => {
    event.preventDefault() // Prevent browser's default help

    // Get help for currently selected element
    if (selectedIds.length === 1) {
      const element = elements.find(el => el.id === selectedIds[0])
      if (element) {
        const helpContent = getElementHelp(element.type)
        openHelpWindow(helpContent)
        return
      }
    }

    // Multiple selection or no selection - show general help
    openHelpWindow(generalHelp)
  }, {
    preventDefault: true,
    enableOnFormTags: true, // Allow F1 even when inputs are focused
  }, [selectedIds, elements])
}
