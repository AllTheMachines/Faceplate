import { useStore } from '../../store'
import { PropertyPanel } from '../Properties'
import { HelpPanel } from './HelpPanel'
import { SaveLoadPanel } from '../project/SaveLoadPanel'
import { ExportPanel } from '../export/ExportPanel'

export function RightPanel() {
  const selectedIds = useStore((state) => state.selectedIds)
  const hasSelection = selectedIds.length > 0
  const canvasWidth = useStore((state) => state.canvasWidth)
  const canvasHeight = useStore((state) => state.canvasHeight)
  const backgroundColor = useStore((state) => state.backgroundColor)
  const snapToGrid = useStore((state) => state.snapToGrid)
  const gridSize = useStore((state) => state.gridSize)
  const setCanvasDimensions = useStore((state) => state.setCanvasDimensions)
  const setBackgroundColor = useStore((state) => state.setBackgroundColor)
  const setSnapToGrid = useStore((state) => state.setSnapToGrid)
  const lockAllMode = useStore((state) => state.lockAllMode)
  const toggleLockAllMode = useStore((state) => state.toggleLockAllMode)

  return (
    <div className="bg-gray-800 border-l border-gray-700 overflow-y-auto flex flex-col">
      <SaveLoadPanel />
      <ExportPanel />
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
          /* Canvas Settings Section */
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-300 mb-3">Canvas Settings</h3>

            <div className="space-y-3">
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

              {/* Snap to Grid Toggle */}
              <div className="flex items-center gap-2 pt-2 border-t border-gray-700">
                <input
                  type="checkbox"
                  id="snap-toggle"
                  checked={snapToGrid}
                  onChange={(e) => setSnapToGrid(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-0"
                />
                <label htmlFor="snap-toggle" className="text-sm text-gray-300">
                  Snap to grid ({gridSize}px)
                </label>
              </div>
            </div>
          </div>
        )}
      </div>
      <div className="mt-auto">
        <HelpPanel />
      </div>
    </div>
  )
}
