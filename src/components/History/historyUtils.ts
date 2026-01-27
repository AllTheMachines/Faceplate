import type { ElementConfig } from '../../types/elements'

// Types
export type HistoryAction = 'add' | 'delete' | 'move' | 'resize' | 'update' | 'canvas' | 'initial'

// Action color mapping for UI
export const ACTION_COLORS: Record<HistoryAction, string> = {
  add: 'text-green-400',
  delete: 'text-red-400',
  move: 'text-yellow-400',
  resize: 'text-purple-400',
  update: 'text-blue-400',
  canvas: 'text-cyan-400',
  initial: 'text-gray-400',
}

// Store state shape for inference
export interface StoreState {
  elements: ElementConfig[]
  canvasWidth?: number
  canvasHeight?: number
  backgroundColor?: string
  [key: string]: unknown
}

/**
 * Infer the action type by comparing before and after states
 */
export function inferAction(beforeState: StoreState | null, afterState: StoreState): HistoryAction {
  // Initial state (first entry)
  if (!beforeState) {
    return 'initial'
  }

  const beforeElements = beforeState.elements || []
  const afterElements = afterState.elements || []

  // Check for canvas property changes
  if (
    beforeState.canvasWidth !== afterState.canvasWidth ||
    beforeState.canvasHeight !== afterState.canvasHeight ||
    beforeState.backgroundColor !== afterState.backgroundColor
  ) {
    return 'canvas'
  }

  // Check for element count changes
  if (afterElements.length > beforeElements.length) {
    return 'add'
  }
  if (afterElements.length < beforeElements.length) {
    return 'delete'
  }

  // Same count - check for property changes
  // Create map for O(1) lookup
  const beforeMap = new Map(beforeElements.map(el => [el.id, el]))

  // Check each element for changes
  for (const afterEl of afterElements) {
    const beforeEl = beforeMap.get(afterEl.id)
    if (!beforeEl) continue // Shouldn't happen with same count

    // Position change (move)
    if (beforeEl.x !== afterEl.x || beforeEl.y !== afterEl.y) {
      return 'move'
    }

    // Size change (resize)
    if (beforeEl.width !== afterEl.width || beforeEl.height !== afterEl.height) {
      return 'resize'
    }
  }

  // Default to update if elements changed but not position/size
  return 'update'
}

/**
 * Get list of affected element names from state comparison
 */
export function getAffectedElements(beforeState: StoreState | null, afterState: StoreState): string[] {
  if (!beforeState) {
    // Initial state - all elements are "affected"
    const elements = afterState.elements || []
    return elements.slice(0, 3).map(el => el.name)
  }

  const beforeElements = beforeState.elements || []
  const afterElements = afterState.elements || []

  const beforeMap = new Map(beforeElements.map(el => [el.id, el]))
  const afterMap = new Map(afterElements.map(el => [el.id, el]))

  const affectedNames: string[] = []

  // Find added elements
  for (const afterEl of afterElements) {
    if (!beforeMap.has(afterEl.id)) {
      affectedNames.push(afterEl.name)
    }
  }

  // Find removed elements
  for (const beforeEl of beforeElements) {
    if (!afterMap.has(beforeEl.id)) {
      affectedNames.push(beforeEl.name)
    }
  }

  // Find modified elements (if not already covered by add/remove)
  if (affectedNames.length === 0) {
    for (const afterEl of afterElements) {
      const beforeEl = beforeMap.get(afterEl.id)
      if (!beforeEl) continue

      // Check if any property changed
      if (JSON.stringify(beforeEl) !== JSON.stringify(afterEl)) {
        affectedNames.push(afterEl.name)
      }
    }
  }

  return affectedNames
}

/**
 * Format timestamp as relative time string
 */
export function formatTimestamp(timestamp?: number): string {
  if (!timestamp) {
    return 'just now'
  }

  const now = Date.now()
  const diff = now - timestamp
  const seconds = Math.floor(diff / 1000)

  if (seconds < 5) {
    return 'just now'
  }
  if (seconds < 60) {
    return `${seconds}s ago`
  }

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    return `${minutes}m ago`
  }

  const hours = Math.floor(minutes / 60)
  return `${hours}h ago`
}
