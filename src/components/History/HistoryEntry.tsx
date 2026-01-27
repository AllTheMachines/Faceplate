interface HistoryEntryProps {
  index: number
  isCurrent: boolean
  isFuture: boolean
  elementCount: number
  timestamp?: string
  onClick?: () => void
}

export function HistoryEntry({
  index,
  isCurrent,
  isFuture,
  elementCount,
  onClick,
}: HistoryEntryProps) {
  // Determine action indicator based on state
  let actionLabel: string
  let actionColor: string

  if (isCurrent) {
    actionLabel = 'CURRENT'
    actionColor = 'text-green-400'
  } else if (isFuture) {
    actionLabel = 'FUTURE'
    actionColor = 'text-blue-400'
  } else {
    actionLabel = 'PAST'
    actionColor = 'text-gray-400'
  }

  // Background styling based on state
  const bgClass = isCurrent
    ? 'bg-blue-900'
    : 'hover:bg-gray-800'

  return (
    <div
      className={`flex items-center gap-3 px-3 py-2 border-b border-gray-700 cursor-pointer ${bgClass}`}
      onClick={onClick}
    >
      {/* Index number */}
      <span className="text-xs text-gray-500 font-mono w-8 text-right">
        {index}
      </span>

      {/* Action indicator */}
      <span className={`text-xs font-semibold ${actionColor} w-16`}>
        {actionLabel}
      </span>

      {/* Element count */}
      <span className="text-sm text-gray-300 flex-1">
        {elementCount} element{elementCount !== 1 ? 's' : ''}
      </span>
    </div>
  )
}
