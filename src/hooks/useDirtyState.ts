import { useStore } from '../store'

export function useDirtyState() {
  // Subscribe to all state that isDirty computation depends on
  // This ensures React re-renders when any of these change
  const savedStateSnapshot = useStore((state) => state.savedStateSnapshot)
  const lastSavedTimestamp = useStore((state) => state.lastSavedTimestamp)
  const elements = useStore((state) => state.elements)
  const canvasWidth = useStore((state) => state.canvasWidth)
  const canvasHeight = useStore((state) => state.canvasHeight)
  const backgroundColor = useStore((state) => state.backgroundColor)
  const backgroundType = useStore((state) => state.backgroundType)
  const gradientConfig = useStore((state) => state.gradientConfig)
  const snapToGrid = useStore((state) => state.snapToGrid)
  const gridSize = useStore((state) => state.gridSize)
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
      canvasWidth,
      canvasHeight,
      backgroundColor,
      backgroundType,
      gradientConfig,
      snapToGrid,
      gridSize,
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
