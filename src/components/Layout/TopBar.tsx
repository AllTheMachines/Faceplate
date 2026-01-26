import { useState, useEffect } from 'react'
import { NewProjectDialog } from '../dialogs/NewProjectDialog'
import { useStore } from '../../store'
import { detectKeyboardLayout, getUndoShortcutLabel, getRedoShortcutLabel, type KeyboardLayout } from '../../lib/keyboard'

// Undo icon (arrow curving left)
function UndoIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
    </svg>
  )
}

// Redo icon (arrow curving right)
function RedoIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
    </svg>
  )
}

export const TopBar = () => {
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  const [keyboardLayout, setKeyboardLayout] = useState<KeyboardLayout>('unknown')

  // Get undo/redo state from temporal store
  const { pastStates, futureStates } = useStore.temporal.getState()
  const canUndo = pastStates.length > 0
  const canRedo = futureStates.length > 0

  // Subscribe to temporal state changes to trigger re-render
  const [, forceUpdate] = useState({})
  useEffect(() => {
    const unsubscribe = useStore.temporal.subscribe(() => {
      forceUpdate({})
    })
    return unsubscribe
  }, [])

  // Detect keyboard layout on mount
  useEffect(() => {
    detectKeyboardLayout().then(setKeyboardLayout)
  }, [])

  const undoLabel = getUndoShortcutLabel(keyboardLayout)
  const redoLabel = getRedoShortcutLabel(keyboardLayout)

  const handleUndo = () => {
    useStore.temporal.getState().undo()
  }

  const handleRedo = () => {
    useStore.temporal.getState().redo()
  }

  return (
    <div className="top-bar flex items-center gap-4 p-4">
      <span className="text-xl font-bold text-white tracking-tight mr-2">Facet</span>

      {/* Undo/Redo buttons */}
      <div className="flex items-center gap-1 mr-2">
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className={`p-2 rounded transition-colors ${
            canUndo
              ? 'text-gray-300 hover:text-white hover:bg-gray-700'
              : 'text-gray-600 cursor-not-allowed'
          }`}
          title={`Undo (${undoLabel})`}
          aria-label="Undo"
        >
          <UndoIcon />
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className={`p-2 rounded transition-colors ${
            canRedo
              ? 'text-gray-300 hover:text-white hover:bg-gray-700'
              : 'text-gray-600 cursor-not-allowed'
          }`}
          title={`Redo (${redoLabel})`}
          aria-label="Redo"
        >
          <RedoIcon />
        </button>
      </div>

      <button
        onClick={() => setShowNewProjectDialog(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
      >
        New Project
      </button>

      {/* Other buttons */}

      <NewProjectDialog
        isOpen={showNewProjectDialog}
        onClose={() => setShowNewProjectDialog(false)}
      />
    </div>
  )
}
