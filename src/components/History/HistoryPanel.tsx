import { useStore } from 'zustand'
import { useStore as useAppStore } from '../../store'
import { HistoryEntry } from './HistoryEntry'

export function HistoryPanel() {
  // Subscribe to pastStates and futureStates reactively using established pattern
  // WHY: This pattern from LeftPanel.tsx provides automatic re-renders when temporal state changes
  const pastStates = useStore(useAppStore.temporal, (state) => state.pastStates)
  const futureStates = useStore(useAppStore.temporal, (state) => state.futureStates)

  // Calculate current index (past states count)
  const currentIndex = pastStates.length

  // Handle time-travel (will be implemented in Plan 02)
  const handleEntryClick = (index: number) => {
    // TODO: Plan 02 - Implement time-travel navigation
    console.log('Time-travel to index:', index)
  }

  // Empty state
  if (pastStates.length === 0 && futureStates.length === 0) {
    return (
      <div className="h-full flex flex-col bg-gray-800">
        <div className="p-3 border-b border-gray-700">
          <h2 className="text-sm font-semibold text-gray-300">History</h2>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <p className="text-sm text-gray-500">No history yet</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header row */}
      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-300">History</h2>
        <span className="text-xs text-gray-500">
          {pastStates.length} past / {futureStates.length} future
        </span>
      </div>

      {/* Scrollable history list */}
      <div className="flex-1 overflow-y-auto">
        {/* Past states */}
        {pastStates.map((state, i) => (
          <HistoryEntry
            key={`past-${i}`}
            index={i}
            isCurrent={false}
            isFuture={false}
            elementCount={state.elements?.length || 0}
            onClick={() => handleEntryClick(i)}
          />
        ))}

        {/* Current state indicator */}
        <HistoryEntry
          key="current"
          index={currentIndex}
          isCurrent={true}
          isFuture={false}
          elementCount={useAppStore.getState().elements?.length || 0}
          onClick={() => handleEntryClick(currentIndex)}
        />

        {/* Future states */}
        {futureStates.map((state, i) => (
          <HistoryEntry
            key={`future-${i}`}
            index={currentIndex + 1 + i}
            isCurrent={false}
            isFuture={true}
            elementCount={state.elements?.length || 0}
            onClick={() => handleEntryClick(currentIndex + 1 + i)}
          />
        ))}
      </div>
    </div>
  )
}
