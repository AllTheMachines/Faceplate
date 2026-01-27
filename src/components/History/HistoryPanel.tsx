import { useStore } from 'zustand/react'
import { useStore as useAppStore, type Store } from '../../store'
import { HistoryEntry } from './HistoryEntry'
import { useRef, useEffect } from 'react'
import type { StoreState } from './historyUtils'

export function HistoryPanel() {
  // Subscribe to pastStates and futureStates reactively using established pattern
  // WHY: This pattern from LeftPanel.tsx provides automatic re-renders when temporal state changes
  const pastStates = useStore(useAppStore.temporal, (state) => state.pastStates)
  const futureStates = useStore(useAppStore.temporal, (state) => state.futureStates)

  // Calculate current index (past states count)
  const currentIndex = pastStates.length

  // Track creation timestamp for relative time calculation
  const creationTimestampRef = useRef<number>(Date.now())

  // Ref for scrollable container to auto-scroll to current entry
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const currentEntryRef = useRef<HTMLDivElement>(null)

  // Reset timestamp on mount
  useEffect(() => {
    creationTimestampRef.current = Date.now()
  }, [])

  // Auto-scroll to current entry when it changes
  useEffect(() => {
    if (currentEntryRef.current && scrollContainerRef.current) {
      currentEntryRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [currentIndex])

  // Time-travel navigation - jump to specific history index
  // Uses imperative getState() for one-time read without re-render subscription
  const jumpToHistoryIndex = (targetIndex: number) => {
    const { pastStates: currentPastStates, undo, redo } = useAppStore.temporal.getState()
    const currentIdx = currentPastStates.length

    if (targetIndex < currentIdx) {
      // Undo N steps to reach target
      undo(currentIdx - targetIndex)
    } else if (targetIndex > currentIdx) {
      // Redo N steps to reach target
      redo(targetIndex - currentIdx)
    }
    // If targetIndex === currentIdx, we're already there
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

  // Get all states in order: past + current + future
  // For beforeState comparison, we need to shift the states array
  // Cast states to StoreState for comparison
  const currentState = useAppStore.getState() as unknown as StoreState
  const allStates: (Partial<Store> | StoreState)[] = [
    ...pastStates,
    currentState,
    ...futureStates,
  ]

  return (
    <div className="h-full flex flex-col bg-gray-800">
      {/* Header row */}
      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-semibold text-gray-300">History</h2>
          <span className="text-xs text-gray-500 font-mono">
            [{pastStates.length + futureStates.length + 1} states]
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {pastStates.length} past | {futureStates.length} future
        </span>
      </div>

      {/* Scrollable history list */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto scroll-smooth">
        {/* Past states */}
        {pastStates.map((state, i) => (
          <HistoryEntry
            key={`past-${i}`}
            index={i}
            isCurrent={false}
            isFuture={false}
            beforeState={(i > 0 ? allStates[i - 1] : null) as StoreState | null}
            afterState={state as unknown as StoreState}
            timestamp={creationTimestampRef.current - (pastStates.length - i) * 1000}
            onClick={() => jumpToHistoryIndex(i)}
          />
        ))}

        {/* Current state indicator */}
        <div ref={currentEntryRef}>
          <HistoryEntry
            key="current"
            index={currentIndex}
            isCurrent={true}
            isFuture={false}
            beforeState={(pastStates.length > 0 ? pastStates[pastStates.length - 1] : null) as StoreState | null}
            afterState={currentState}
            timestamp={creationTimestampRef.current}
            onClick={() => jumpToHistoryIndex(currentIndex)}
          />
        </div>

        {/* Future states */}
        {futureStates.map((state, i) => (
          <HistoryEntry
            key={`future-${i}`}
            index={currentIndex + 1 + i}
            isCurrent={false}
            isFuture={true}
            beforeState={allStates[currentIndex + i] as StoreState | null}
            afterState={state as unknown as StoreState}
            timestamp={creationTimestampRef.current + (i + 1) * 1000}
            onClick={() => jumpToHistoryIndex(currentIndex + 1 + i)}
          />
        ))}
      </div>
    </div>
  )
}
