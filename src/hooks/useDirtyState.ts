import { useStore } from '../store'

export function useDirtyState() {
  // Subscribe to all state that isDirty computation depends on
  // This ensures React re-renders when any of these change
  const savedStateSnapshot = useStore((state) => state.savedStateSnapshot)
  const lastSavedTimestamp = useStore((state) => state.lastSavedTimestamp)
  const elements = useStore((state) => state.elements)
  const windows = useStore((state) => state.windows)
  const snapToGrid = useStore((state) => state.snapToGrid)
  const gridSize = useStore((state) => state.gridSize)
  const showGrid = useStore((state) => state.showGrid)
  const gridColor = useStore((state) => state.gridColor)
  const assets = useStore((state) => state.assets)
  const knobStyles = useStore((state) => state.knobStyles)

  // Compute isDirty from subscribed state
  const isDirty = (() => {
    // Never saved project
    if (savedStateSnapshot === null) {
      // Dirty if has content (elements added)
      return elements.length > 0
    }

    // Compare current serializable state against saved snapshot
    const currentSnapshot = JSON.stringify({
      elements,
      windows,
      snapToGrid,
      gridSize,
      showGrid,
      gridColor,
      assets,
      knobStyles,
    })

    return currentSnapshot !== savedStateSnapshot
  })()

  return {
    isDirty,
    lastSavedTimestamp,
  }
}
