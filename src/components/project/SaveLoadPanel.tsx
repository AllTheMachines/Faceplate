import { useState } from 'react'
import { useStore } from '../../store'
import { useDirtyState } from '../../hooks/useDirtyState'
import { serializeProject, deserializeProject } from '../../services/serialization'
import { saveProjectFile, loadProjectFile } from '../../services/fileSystem'
import { BUILT_IN_TEMPLATES, loadBuiltInTemplate } from '../../services/templateLoader'
import { UnsavedChangesDialog } from '../dialogs/UnsavedChangesDialog'

function SaveIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
      />
    </svg>
  )
}

function LoadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
      />
    </svg>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function TemplateIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
      />
    </svg>
  )
}

export function SaveLoadPanel() {
  const [expanded, setExpanded] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingAction, setPendingAction] = useState<{
    type: 'load' | 'template'
    execute: () => Promise<void>
  } | null>(null)

  // Get state for save
  const elements = useStore((state) => state.elements)
  const windows = useStore((state) => state.windows)
  const snapToGrid = useStore((state) => state.snapToGrid)
  const gridSize = useStore((state) => state.gridSize)
  const showGrid = useStore((state) => state.showGrid)
  const gridColor = useStore((state) => state.gridColor)
  const selectedIds = useStore((state) => state.selectedIds)
  const assets = useStore((state) => state.assets)
  const knobStyles = useStore((state) => state.knobStyles)
  const layers = useStore((state) => state.layers)

  // Get dirty state via hook (properly subscribes to all dependencies)
  const { isDirty } = useDirtyState()
  const setSavedState = useStore((state) => state.setSavedState)
  const clearSavedState = useStore((state) => state.clearSavedState)

  // Get actions for load
  const setElements = useStore((state) => state.setElements)
  const setWindows = useStore((state) => state.setWindows)
  const setSnapToGrid = useStore((state) => state.setSnapToGrid)
  const setGridSize = useStore((state) => state.setGridSize)
  const setShowGrid = useStore((state) => state.setShowGrid)
  const setGridColor = useStore((state) => state.setGridColor)
  const selectMultiple = useStore((state) => state.selectMultiple)
  const setAssets = useStore((state) => state.setAssets)
  const setKnobStyles = useStore((state) => state.setKnobStyles)
  const setLayers = useStore((state) => state.setLayers)
  const setLastModified = useStore((state) => state.setLastModified)
  const addWindow = useStore((state) => state.addWindow)
  const addElementToWindow = useStore((state) => state.addElementToWindow)

  const handleSave = async () => {
    setLoading(true)
    setError(null)

    try {
      // Capture current state snapshot BEFORE save
      const currentSnapshot = JSON.stringify({
        elements,
        windows,
        snapToGrid,
        gridSize,
        showGrid,
        gridColor,
        assets,
        knobStyles,
        layers,
      })

      // Serialize current state (adds lastModified timestamp)
      const json = serializeProject({
        elements,
        windows,
        snapToGrid,
        gridSize,
        showGrid,
        gridColor,
        selectedIds,
        assets,
        knobStyles,
        layers,
      })

      // Save to file
      await saveProjectFile(json)

      // After successful save, update saved state
      const timestamp = Date.now()
      setSavedState(currentSnapshot, timestamp)
      setLastModified(timestamp)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save project')
    } finally {
      setLoading(false)
    }
  }

  const handleLoad = async () => {
    setLoading(true)
    setError(null)

    try {
      // Load file
      const loadResult = await loadProjectFile()

      // Check if cancelled
      if (!loadResult.success) {
        // Only show error if it's not a cancellation
        if (loadResult.error !== 'File selection cancelled') {
          setError(loadResult.error)
        }
        setLoading(false)
        return
      }

      // Deserialize and validate
      const deserializeResult = deserializeProject(loadResult.content)

      if (!deserializeResult.success) {
        setError(deserializeResult.error)
        setLoading(false)
        return
      }

      // Load successful - update store
      const { data } = deserializeResult

      // Update windows (v2 format)
      // Cast UIWindowData to UIWindow (same structure)
      setWindows(data.windows as import('../../store/windowsSlice').UIWindow[])

      // Update global settings
      setSnapToGrid(data.snapToGrid ?? false)
      setGridSize(data.gridSize ?? 10)
      setShowGrid(data.showGrid ?? false)
      setGridColor(data.gridColor ?? '#ffffff')

      // Replace all elements (setElements replaces, doesn't append)
      // Cast needed: Zod schema type != TypeScript type due to Phase 13 extended elements
      setElements(data.elements as import('../../types/elements').ElementConfig[])

      // Restore selection if present (filter to valid element IDs)
      if (data.selectedIds) {
        const validIds = data.selectedIds.filter(id =>
          data.elements.some(el => el.id === id)
        )
        selectMultiple(validIds)
      }

      // Restore assets if present
      if (data.assets) {
        setAssets(data.assets)
      }

      // Restore knob styles if present
      if (data.knobStyles) {
        setKnobStyles(data.knobStyles)
      }

      // Restore layers if present
      if (data.layers) {
        setLayers(data.layers)
      }

      // Restore timestamp from project file (or null if old file without timestamp)
      setLastModified(data.lastModified || null)

      // After successful load, capture saved state snapshot
      const loadedSnapshot = JSON.stringify({
        elements: data.elements,
        windows: data.windows,
        snapToGrid: data.snapToGrid,
        gridSize: data.gridSize,
        showGrid: data.showGrid,
        gridColor: data.gridColor,
        assets: data.assets,
        knobStyles: data.knobStyles,
        layers: data.layers,
      })
      setSavedState(loadedSnapshot, data.lastModified || Date.now())

      // Clear error on success
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project')
    } finally {
      setLoading(false)
    }
  }

  const handleLoadTemplate = async (templateId: string) => {
    if (!templateId) return

    setLoading(true)
    setError(null)

    try {
      const template = await loadBuiltInTemplate(templateId)

      // Create a new window from template metadata
      const windowId = crypto.randomUUID()
      const templateWindow = {
        id: windowId,
        name: 'Main Window',
        type: 'release' as const,
        width: template.metadata.canvasWidth,
        height: template.metadata.canvasHeight,
        backgroundColor: template.metadata.backgroundColor,
        backgroundType: 'color' as const,
        elementIds: template.elements.map(el => el.id),
        createdAt: Date.now(),
      }

      // Set the window
      setWindows([templateWindow])

      // Clear selection and load elements
      selectMultiple([])
      setElements(template.elements)

      // Clear saved state after loading template (fresh template has no save)
      clearSavedState()

      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load template')
    } finally {
      setLoading(false)
    }
  }

  // Wrapped handlers to check dirty state
  const handleLoadClick = () => {
    if (isDirty) {
      setPendingAction({
        type: 'load',
        execute: handleLoad,
      })
    } else {
      handleLoad()
    }
  }

  const handleLoadTemplateClick = async (templateId: string) => {
    if (!templateId) return

    if (isDirty) {
      setPendingAction({
        type: 'template',
        execute: () => handleLoadTemplate(templateId),
      })
    } else {
      handleLoadTemplate(templateId)
    }
  }

  // Dialog handlers
  const handleDialogSave = async () => {
    await handleSave()
    if (pendingAction) {
      await pendingAction.execute()
    }
    setPendingAction(null)
  }

  const handleDialogDiscard = async () => {
    if (pendingAction) {
      await pendingAction.execute()
    }
    setPendingAction(null)
  }

  const handleDialogCancel = () => {
    setPendingAction(null)
  }

  return (
    <div className="border-b border-gray-700">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-700/50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-200">Project</span>
        <ChevronIcon expanded={expanded} />
      </button>
      {expanded && (
        <div className="p-3 pt-0 space-y-3">
          {/* Save/Load Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={loading}
              className={`flex-1 flex items-center justify-center gap-2 ${
                isDirty
                  ? 'bg-amber-600 hover:bg-amber-700'  // Orange when dirty
                  : 'bg-blue-600 hover:bg-blue-700'    // Blue when clean
              } disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors`}
            >
              <SaveIcon />
              <span>Save Project</span>
            </button>
            <button
              onClick={handleLoadClick}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 text-white px-3 py-2 rounded text-sm font-medium transition-colors"
            >
              <LoadIcon />
              <span>Load Project</span>
            </button>
          </div>

          {/* Load Template Dropdown */}
          <div className="flex items-center gap-2">
            <TemplateIcon />
            <select
              onChange={(e) => handleLoadTemplateClick(e.target.value)}
              disabled={loading}
              value=""
              className="flex-1 bg-gray-700 text-gray-200 px-3 py-2 rounded text-sm border border-gray-600 hover:border-gray-500 disabled:opacity-50 cursor-pointer"
            >
              <option value="" disabled>
                Load Template...
              </option>
              {BUILT_IN_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name}
                </option>
              ))}
            </select>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-700 rounded p-2">
              <div className="flex items-start justify-between gap-2">
                <p className="text-red-400 text-xs whitespace-pre-line flex-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-400 hover:text-red-300 shrink-0"
                  aria-label="Dismiss error"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Unsaved Changes Dialog */}
      <UnsavedChangesDialog
        isOpen={pendingAction !== null}
        onSave={handleDialogSave}
        onDiscard={handleDialogDiscard}
        onCancel={handleDialogCancel}
        actionDescription={
          pendingAction?.type === 'load'
            ? 'loading a project'
            : 'loading a template'
        }
      />
    </div>
  )
}
