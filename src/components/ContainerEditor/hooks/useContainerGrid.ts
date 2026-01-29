import { useStore } from '../../../store'

export function useContainerGrid() {
  // Subscribe to canvas grid settings
  const snapToGrid = useStore((state) => state.snapToGrid)
  const gridSize = useStore((state) => state.gridSize)
  const showGrid = useStore((state) => state.showGrid)
  const gridColor = useStore((state) => state.gridColor)

  /**
   * Snap a position to the grid
   */
  const snapPosition = (x: number, y: number): { x: number; y: number } => {
    if (!snapToGrid) return { x, y }
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize,
    }
  }

  /**
   * Snap a size to the grid
   */
  const snapSize = (width: number, height: number): { width: number; height: number } => {
    if (!snapToGrid) return { width, height }
    return {
      width: Math.max(gridSize, Math.round(width / gridSize) * gridSize),
      height: Math.max(gridSize, Math.round(height / gridSize) * gridSize),
    }
  }

  return {
    snapToGrid,
    gridSize,
    showGrid,
    gridColor,
    snapPosition,
    snapSize,
  }
}
