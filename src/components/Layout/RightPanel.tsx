import { useStore } from '../../store'

export function RightPanel() {
  const canvasWidth = useStore((state) => state.canvasWidth)
  const canvasHeight = useStore((state) => state.canvasHeight)
  const backgroundColor = useStore((state) => state.backgroundColor)
  const setCanvasDimensions = useStore((state) => state.setCanvasDimensions)
  const setBackgroundColor = useStore((state) => state.setBackgroundColor)

  return (
    <div className="bg-gray-800 border-l border-gray-700 overflow-y-auto">
      <div className="p-4">
        <h2 className="text-lg font-semibold text-gray-100 mb-4">Properties</h2>

        {/* Canvas Settings Section */}
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
          </div>
        </div>

        <p className="text-sm text-gray-400">Full property panel (Phase 5)</p>
      </div>
    </div>
  )
}
