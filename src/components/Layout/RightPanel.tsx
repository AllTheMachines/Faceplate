import { useState } from 'react'
import { useStore } from '../../store'
import { PropertyPanel } from '../Properties'
import { HelpPanel } from './HelpPanel'
import { SaveLoadPanel } from '../project/SaveLoadPanel'
import { ExportModal } from '../export/ExportModal'
import { isEmbedMode } from '../../lib/embedMode'

export function RightPanel() {
  const [exportModalOpen, setExportModalOpen] = useState(false)
  const selectedIds = useStore((state) => state.selectedIds)
  const hasSelection = selectedIds.length > 0

  // Get active window for canvas dimensions/background
  const activeWindow = useStore((state) => state.getActiveWindow())
  const updateWindow = useStore((state) => state.updateWindow)

  const canvasWidth = activeWindow?.width ?? 800
  const canvasHeight = activeWindow?.height ?? 600
  const backgroundColor = activeWindow?.backgroundColor ?? '#1a1a1a'

  // Grid settings (global, not per-window)
  const snapToGrid = useStore((state) => state.snapToGrid)
  const gridSize = useStore((state) => state.gridSize)
  const showGrid = useStore((state) => state.showGrid)
  const setSnapToGrid = useStore((state) => state.setSnapToGrid)
  const setShowGrid = useStore((state) => state.setShowGrid)
  const setGridSize = useStore((state) => state.setGridSize)
  const lockAllMode = useStore((state) => state.lockAllMode)
  const toggleLockAllMode = useStore((state) => state.toggleLockAllMode)

  // Update handlers that modify active window
  const setCanvasDimensions = (width: number, height: number) => {
    if (activeWindow) {
      updateWindow(activeWindow.id, { width, height })
    }
  }

  const setBackgroundColor = (color: string) => {
    if (activeWindow) {
      updateWindow(activeWindow.id, { backgroundColor: color })
    }
  }

  return (
    <div className="bg-gray-800 border-l border-gray-700 overflow-y-auto flex flex-col">
      {!isEmbedMode && <SaveLoadPanel />}

      {/* Export Button */}
      {!isEmbedMode && (
        <div className="px-4 py-3 border-b border-gray-700">
          <button
            onClick={() => setExportModalOpen(true)}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded transition-colors flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
          </button>
        </div>
      )}

      {/* Lock All Toggle */}
      <div className="px-4 py-2 border-b border-gray-700">
        <button
          onClick={toggleLockAllMode}
          className={`flex items-center gap-2 px-3 py-1.5 rounded text-sm font-medium transition-colors w-full justify-center ${
            lockAllMode
              ? 'bg-amber-600 text-white hover:bg-amber-500'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          <span>{lockAllMode ? '🔒' : '🔓'}</span>
          <span>{lockAllMode ? 'Unlock All' : 'Lock All'}</span>
        </button>
        {lockAllMode && (
          <p className="text-xs text-amber-400 mt-1 text-center">
            UI Test Mode: Elements cannot be selected
          </p>
        )}
      </div>
      <div className="p-4 flex-1 overflow-y-auto">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Properties</h2>

        {hasSelection ? (
          <PropertyPanel />
        ) : (
          <>
            {/* Window Properties Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Window Properties</h3>

              <div className="space-y-3">
                {/* Window Name */}
                <div>
                  <label htmlFor="window-name" className="block text-xs text-gray-400 mb-1">
                    Name
                  </label>
                  <input
                    id="window-name"
                    type="text"
                    value={activeWindow?.name ?? ''}
                    onChange={(e) => {
                      if (activeWindow) {
                        updateWindow(activeWindow.id, { name: e.target.value })
                      }
                    }}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm"
                  />
                </div>

                {/* Window Type Toggle */}
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Type</label>
                  <div className="flex rounded overflow-hidden border border-gray-600">
                    <button
                      onClick={() => {
                        if (activeWindow) {
                          updateWindow(activeWindow.id, { type: 'release' })
                        }
                      }}
                      className={`flex-1 px-3 py-1.5 text-sm font-medium transition-colors ${
                        activeWindow?.type === 'release'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      Release
                    </button>
                    <button
                      onClick={() => {
                        if (activeWindow) {
                          updateWindow(activeWindow.id, { type: 'developer' })
                        }
                      }}
                      className={`flex-1 px-3 py-1.5 text-sm font-medium transition-colors ${
                        activeWindow?.type === 'developer'
                          ? 'bg-amber-600 text-white'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                      }`}
                    >
                      Developer
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {activeWindow?.type === 'developer'
                      ? 'Developer windows are excluded from default export'
                      : 'Release windows are always included in export'}
                  </p>
                </div>

                {/* Width Input */}
                <div>
                  <label htmlFor="canvas-width" className="block text-xs text-gray-400 mb-1">
                    Width
                  </label>
                  <input
                    id="canvas-width"
                    type="number"
                    value={canvasWidth}
                    onChange={(e) => setCanvasDimensions(Number(e.target.value), canvasHeight)}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm"
                    min={100}
                    max={4000}
                  />
                </div>

                {/* Height Input */}
                <div>
                  <label htmlFor="canvas-height" className="block text-xs text-gray-400 mb-1">
                    Height
                  </label>
                  <input
                    id="canvas-height"
                    type="number"
                    value={canvasHeight}
                    onChange={(e) => setCanvasDimensions(canvasWidth, Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm"
                    min={100}
                    max={4000}
                  />
                </div>

                {/* Background Color Input */}
                <div>
                  <label htmlFor="bg-color" className="block text-xs text-gray-400 mb-1">
                    Background Color
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="bg-color"
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="h-8 w-12 bg-gray-700 border border-gray-600 rounded cursor-pointer"
                    />
                    <input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className="flex-1 bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Grid Settings Section */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-300 mb-3">Grid Settings</h3>
              <div className="space-y-2">
                {/* Show Grid Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="show-grid-toggle"
                    checked={showGrid}
                    onChange={(e) => setShowGrid(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <label htmlFor="show-grid-toggle" className="text-sm text-gray-300">
                    Show grid
                  </label>
                  <span className="text-xs text-gray-500 ml-auto">Ctrl+G</span>
                </div>

                {/* Snap to Grid Toggle */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="snap-toggle"
                    checked={snapToGrid}
                    onChange={(e) => setSnapToGrid(e.target.checked)}
                    className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <label htmlFor="snap-toggle" className="text-sm text-gray-300">
                    Snap to grid
                  </label>
                </div>

                {/* Grid Size Selector */}
                <div className="flex items-center gap-2">
                  <label htmlFor="grid-size" className="text-sm text-gray-300">
                    Grid size
                  </label>
                  <select
                    id="grid-size"
                    value={gridSize}
                    onChange={(e) => setGridSize(Number(e.target.value))}
                    className="ml-auto bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm"
                  >
                    <option value={5}>5px</option>
                    <option value={10}>10px</option>
                    <option value={20}>20px</option>
                    <option value={50}>50px</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className="mt-auto">
        <HelpPanel />
      </div>

      {!isEmbedMode && (
        <ExportModal
          isOpen={exportModalOpen}
          onClose={() => setExportModalOpen(false)}
        />
      )}
    </div>
  )
}
