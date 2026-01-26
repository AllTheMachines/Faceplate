import { useState } from 'react'
import { useStore } from '../../store'
import {
  exportJUCEBundle,
  exportHTMLPreview,
  previewHTMLExport,
  validateForExport,
} from '../../services/export'

export function ExportPanel() {
  const [isExporting, setIsExporting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastExport, setLastExport] = useState<string | null>(null)
  const [optimizeSVG, setOptimizeSVG] = useState(true)
  const [enableResponsiveScaling, setEnableResponsiveScaling] = useState(true)

  // Get state from store
  const elements = useStore((state) => state.elements)
  const canvasWidth = useStore((state) => state.canvasWidth)
  const canvasHeight = useStore((state) => state.canvasHeight)
  const backgroundColor = useStore((state) => state.backgroundColor)

  // Run validation
  const validationResult = validateForExport(elements)

  const handleExportJUCE = async () => {
    setIsExporting(true)
    setError(null)
    setLastExport(null)

    const result = await exportJUCEBundle({
      elements,
      canvasWidth,
      canvasHeight,
      backgroundColor,
      optimizeSVG,
      enableResponsiveScaling,
    })

    setIsExporting(false)

    if (result.success) {
      let message = 'JUCE bundle exported successfully'
      if (result.sizeSavings && result.sizeSavings.percent > 0) {
        message += ` (SVG optimized: ${result.sizeSavings.percent.toFixed(1)}% smaller)`
      }
      setLastExport(message)
    } else {
      setError(result.error)
    }
  }

  const handleExportPreview = async () => {
    setIsExporting(true)
    setError(null)
    setLastExport(null)

    const result = await exportHTMLPreview({
      elements,
      canvasWidth,
      canvasHeight,
      backgroundColor,
      optimizeSVG,
      enableResponsiveScaling,
    })

    setIsExporting(false)

    if (result.success) {
      let message = 'HTML preview exported successfully'
      if (result.sizeSavings && result.sizeSavings.percent > 0) {
        message += ` (SVG optimized: ${result.sizeSavings.percent.toFixed(1)}% smaller)`
      }
      setLastExport(message)
    } else {
      setError(result.error)
    }
  }

  const handlePreview = async () => {
    setIsExporting(true)
    setError(null)

    const result = await previewHTMLExport({
      elements,
      canvasWidth,
      canvasHeight,
      backgroundColor,
      enableResponsiveScaling: true,
    })

    setIsExporting(false)

    if (!result.success) {
      setError(result.error || 'Preview failed')
    }
  }

  return (
    <div className="border-b border-gray-700">
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-200 mb-3">Export</h3>

        {/* Validation warnings (if any) */}
        {!validationResult.valid && (
          <div className="mb-3 p-2 bg-yellow-900/30 border border-yellow-700 rounded text-xs text-yellow-200">
            <span className="font-medium">Warnings:</span>
            <ul className="mt-1 list-disc list-inside">
              {validationResult.errors.map((err) => (
                <li key={err.elementId + err.field}>{err.message}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Export Options */}
        <div className="mb-3 space-y-2">
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={optimizeSVG}
              onChange={(e) => setOptimizeSVG(e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-blue-500"
            />
            Optimize SVG assets
          </label>
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer">
            <input
              type="checkbox"
              checked={enableResponsiveScaling}
              onChange={(e) => setEnableResponsiveScaling(e.target.checked)}
              className="rounded border-gray-600 bg-gray-700 text-blue-500"
            />
            Enable responsive scaling
          </label>
        </div>

        {/* Export buttons */}
        <div className="space-y-2">
          <button
            onClick={handleExportJUCE}
            disabled={isExporting}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white text-sm font-medium rounded transition-colors"
          >
            {isExporting ? 'Exporting...' : 'Export JUCE Bundle'}
          </button>

          <button
            onClick={handleExportPreview}
            disabled={isExporting}
            className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 text-white text-sm font-medium rounded transition-colors"
          >
            {isExporting ? 'Exporting...' : 'Export HTML Preview'}
          </button>

          <button
            onClick={handlePreview}
            disabled={isExporting}
            className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white text-sm font-medium rounded transition-colors"
          >
            {isExporting ? 'Loading...' : 'Preview in Browser'}
          </button>
        </div>

        {/* Error display */}
        {error && (
          <div className="mt-3 p-2 bg-red-900/30 border border-red-700 rounded">
            <div className="flex justify-between items-start">
              <span className="text-xs text-red-200">{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Success message */}
        {lastExport && (
          <div className="mt-3 p-2 bg-green-900/30 border border-green-700 rounded">
            <span className="text-xs text-green-200">{lastExport}</span>
          </div>
        )}

        {/* Info text */}
        <p className="mt-3 text-xs text-gray-400">
          JUCE Bundle: HTML/CSS/JS + C++ snippets
          <br />
          HTML Preview: Standalone with mock values
        </p>
      </div>
    </div>
  )
}
