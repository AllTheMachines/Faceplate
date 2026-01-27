import { inferAction, getAffectedElements, ACTION_COLORS, formatTimestamp } from './historyUtils'
import type { UIElement } from '../../types/elements'

interface StoreState {
  elements: UIElement[]
  canvasWidth?: number
  canvasHeight?: number
  backgroundColor?: string
  [key: string]: unknown
}

interface HistoryEntryProps {
  index: number
  isCurrent: boolean
  isFuture: boolean
  beforeState: StoreState | null
  afterState: StoreState
  timestamp?: number
  onClick?: () => void
}

export function HistoryEntry({
  index,
  isCurrent,
  isFuture,
  beforeState,
  afterState,
  timestamp,
  onClick,
}: HistoryEntryProps) {
  // Infer action type from state comparison
  const action = inferAction(beforeState, afterState)
  const affectedElements = getAffectedElements(beforeState, afterState)
  const relativeTime = formatTimestamp(timestamp)

  // Action label and color
  const actionLabel = action.toUpperCase()
  const actionColor = ACTION_COLORS[action]

  // Background styling based on state
  let bgClass = 'hover:bg-gray-800'
  let borderClass = ''

  if (isCurrent) {
    bgClass = 'bg-blue-900 hover:bg-blue-800'
    borderClass = 'border-l-4 border-l-green-400'
  } else if (isFuture) {
    bgClass = 'bg-gray-900 hover:bg-gray-800 opacity-70'
  }

  // Format affected elements (show first 2-3, then "+ X more")
  let elementsDisplay = ''
  if (affectedElements.length === 0) {
    elementsDisplay = `${afterState.elements?.length || 0} elements`
  } else if (affectedElements.length <= 3) {
    elementsDisplay = affectedElements.join(', ')
  } else {
    const displayed = affectedElements.slice(0, 2).join(', ')
    const remaining = affectedElements.length - 2
    elementsDisplay = `${displayed} + ${remaining} more`
  }

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 border-b border-gray-700 cursor-pointer ${bgClass} ${borderClass}`}
      onClick={onClick}
    >
      {/* Index number */}
      <span className="text-xs text-gray-500 font-mono w-8 text-right">
        {index}
      </span>

      {/* Action indicator */}
      <span className={`text-xs font-semibold ${actionColor} w-20`}>
        {actionLabel}
      </span>

      {/* Affected elements */}
      <span className="text-sm text-gray-300 flex-1 truncate">
        {elementsDisplay}
      </span>

      {/* Relative timestamp */}
      <span className="text-xs text-gray-500 whitespace-nowrap">
        {relativeTime}
      </span>
    </div>
  )
}
