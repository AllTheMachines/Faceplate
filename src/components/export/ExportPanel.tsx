import { useState } from 'react'
import { useStore } from '../../store'
import {
  exportJUCEBundle,
  exportHTMLPreview,
  previewHTMLExport,
  validateForExport,
} from '../../services/export'

interface ExportDetails {
  timestamp: string
  fileCount: number
  sizeSavings?: {
    percent: number
  }
}

export function ExportPanel() {
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [lastExport, setLastExport] = useState<ExportDetails | null>(null)
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
    setExportStatus('Generating HTML...')

    // Simulate progress steps
    setTimeout(() => setExportStatus('Generating CSS...'), 200)
    setTimeout(() => setExportStatus('Processing JavaScript...'), 400)
    if (optimizeSVG) {
      setTimeout(() => setExportStatus('Optimizing SVGs...'), 600)
    }
    setTimeout(() => setExportStatus('Creating bundle...'), 800)

    const result = await exportJUCEBundle({
      elements,
      canvasWidth,
      canvasHeight,
      backgroundColor,
      optimizeSVG,
      enableResponsiveScaling,
    })

    setIsExporting(false)
    setExportStatus('')

    if (result.success) {
      const timestamp = new Date().toLocaleString()
      const fileCount = 5 // index.html, style.css, components.js, bindings.js, README.md
      setLastExport({
        timestamp,
        fileCount,
        sizeSavings: result.sizeSavings,
      })
    } else {
      setError(result.error)
    }
  }

  const handleExportPreview = async () => {
    setIsExporting(true)
    setError(null)
    setLastExport(null)
    setExportStatus('Generating preview...')

    // Simulate progress steps
    setTimeout(() => setExportStatus('Optimizing assets...'), 200)
    setTimeout(() => setExportStatus('Creating bundle...'), 400)

    const result = await exportHTMLPreview({
      elements,
      canvasWidth,
      canvasHeight,
      backgroundColor,
      optimizeSVG,
      enableResponsiveScaling,
    })

    setIsExporting(false)
    setExportStatus('')

    if (result.success) {
      const timestamp = new Date().toLocaleString()
      const fileCount = 5 // index.html, style.css, components.js, bindings.js (with mock), README.md
      setLastExport({
        timestamp,
        fileCount,
        sizeSavings: result.sizeSavings,
      })
    } else {
      setError(result.error)
    }
  }

  const handlePreview = async () => {
    setIsExporting(true)
    setError(null)
    setExportStatus('Opening preview...')

    const result = await previewHTMLExport({
      elements,
      canvasWidth,
      canvasHeight,
      backgroundColor,
      enableResponsiveScaling: true,
    })

    setIsExporting(false)
    setExportStatus('')

    if (!result.success) {
      const errorMessage = result.error || 'Preview failed'
      const suggestion = errorMessage.includes('Popup blocked')
        ? '\n\nTip: Enable popups for this site in your browser settings.'
        : '\n\nTip: Try refreshing the page or check the console for details.'
      setError(errorMessage + suggestion)
    }
  }

  const copyErrorToClipboard = () => {
    if (error) {
      navigator.clipboard.writeText(error)
    }
  }

  return (
    <div className="border-b border-gray-700">
      <div className="p-3">
        <h3 className="text-sm font-medium text-gray-200 mb-3">Export</h3>

        {/* Validation errors (blocking) */}
        {!validationResult.valid && validationResult.errors.length > 0 && (
          <div className="mb-3 p-2 bg-red-900/30 border border-red-700 rounded text-xs text-red-200">
            <div className="font-medium mb-1">Fix these errors before exporting:</div>
            <ul className="mt-1 space-y-1">
              {validationResult.errors.map((err) => (
                <li key={err.elementId + err.field} className="text-red-300">
                  • {err.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Validation warnings (non-blocking) */}
        {!validationResult.valid && validationResult.warnings.length > 0 && (
          <div className="mb-3 p-2 bg-yellow-900/30 border border-yellow-700 rounded text-xs text-yellow-200">
            <div className="font-medium mb-1">Warnings (export will still work):</div>
            <ul className="mt-1 space-y-1">
              {validationResult.warnings.map((warn) => (
                <li key={warn.elementId + warn.field} className="text-yellow-300">
                  • {warn.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Export Options Section */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Options</h4>
          <div className="space-y-2 bg-gray-800/50 rounded p-2">
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={optimizeSVG}
                onChange={(e) => setOptimizeSVG(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-blue-500"
              />
              Optimize SVG assets
            </label>
            <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-gray-100 transition-colors">
              <input
                type="checkbox"
                checked={enableResponsiveScaling}
                onChange={(e) => setEnableResponsiveScaling(e.target.checked)}
                className="rounded border-gray-600 bg-gray-700 text-blue-500"
              />
              Enable responsive scaling
            </label>
          </div>
        </div>

        {/* Export Progress */}
        {isExporting && exportStatus && (
          <div className="mb-3 p-2 bg-blue-900/30 border border-blue-700 rounded">
            <div className="flex items-center gap-2 text-xs text-blue-200">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>{exportStatus}</span>
            </div>
          </div>
        )}

        {/* Export Actions Section */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Actions</h4>
          <div className="space-y-2">
            <button
              onClick={handleExportJUCE}
              disabled={isExporting || (validationResult.valid === false && validationResult.errors.length > 0)}
              className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
            >
              {isExporting ? exportStatus : 'Export JUCE Bundle'}
            </button>

            <button
              onClick={handlePreview}
              disabled={isExporting}
              className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
            >
              {isExporting ? 'Loading...' : 'Preview in Browser'}
            </button>

            <button
              onClick={handleExportPreview}
              disabled={isExporting || (validationResult.valid === false && validationResult.errors.length > 0)}
              className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white text-sm font-medium rounded transition-colors"
            >
              {isExporting ? exportStatus : 'Export HTML Only'}
            </button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="p-2 bg-red-900/30 border border-red-700 rounded">
            <div className="flex justify-between items-start mb-2">
              <div className="font-medium text-xs text-red-200">Export Failed</div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-300 text-lg leading-none"
                title="Dismiss"
              >
                ×
              </button>
            </div>
            <div className="text-xs text-red-300 whitespace-pre-line">{error}</div>
            <button
              onClick={copyErrorToClipboard}
              className="mt-2 text-xs text-red-400 hover:text-red-300 underline"
            >
              Copy error message
            </button>
          </div>
        )}

        {/* Success message */}
        {lastExport && (
          <div className="p-2 bg-green-900/30 border border-green-700 rounded text-xs">
            <div className="font-medium text-green-200 mb-1">Export Complete</div>
            <div className="text-green-300/80">
              {lastExport.timestamp} • {lastExport.fileCount} files
              {lastExport.sizeSavings && lastExport.sizeSavings.percent > 0 && (
                <span> • SVG optimized: {lastExport.sizeSavings.percent.toFixed(1)}% smaller</span>
              )}
            </div>
          </div>
        )}

        {/* Info text */}
        <div className="pt-3 border-t border-gray-700">
          <p className="text-xs text-gray-400 leading-relaxed">
            <span className="font-medium text-gray-300">JUCE Bundle:</span> Complete package with HTML/CSS/JS + integration README
            <br />
            <span className="font-medium text-gray-300">Preview:</span> Test in browser with mock interactivity
            <br />
            <span className="font-medium text-gray-300">HTML Only:</span> Standalone preview bundle
          </p>
        </div>
      </div>
    </div>
  )
}
