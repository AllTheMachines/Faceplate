import { useState, useMemo } from 'react'
import { useStore } from '../../store'
import type { ElementConfig } from '../../types/elements'
import {
  exportJUCEBundle,
  exportHTMLPreview,
  exportMultiWindowBundle,
  exportMultiWindowToFolder,
  previewHTMLExport,
  previewMultiWindowExport,
  validateForExport,
} from '../../services/export'
import type { WindowExportData, ExportError } from '../../services/export'
import { useLicense } from '../../hooks/useLicense'
import { ProElementsBlockingModal, hasProElements } from './ProElementsBlockingModal'

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

interface ExportDetails {
  timestamp: string
  fileCount: number
  folderName?: string
  sizeSavings?: {
    percent: number
  }
}

export function ExportPanel() {
  const [expanded, setExpanded] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportStatus, setExportStatus] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [lastExport, setLastExport] = useState<ExportDetails | null>(null)
  const [optimizeSVG, setOptimizeSVG] = useState(true)
  const [enableResponsiveScaling, setEnableResponsiveScaling] = useState(true)
  const [includeDeveloperWindows, setIncludeDeveloperWindows] = useState(false)
  const [exportMode, setExportMode] = useState<'zip' | 'folder'>('zip')
  const [showProBlockingModal, setShowProBlockingModal] = useState(false)

  const { isPro } = useLicense()

  // Get state from store
  const allElements = useStore((state) => state.elements)
  const windows = useStore((state) => state.windows)
  const activeWindow = useStore((state) => state.getActiveWindow())
  const layers = useStore((state) => state.layers)
  const getLayersInOrder = useStore((state) => state.getLayersInOrder)

  // Helper to get all elements including children (for containers with children not in elementIds)
  const getElementsWithChildren = (windowElementIds: string[]): ElementConfig[] => {
    const result: ElementConfig[] = []
    const seen = new Set<string>()

    const addWithChildren = (id: string) => {
      if (seen.has(id)) return
      seen.add(id)

      const el = allElements.find(e => e.id === id)
      if (!el) return

      result.push(el)

      // If container, recursively add children via parentId relationship
      const children = allElements.filter(child => child.parentId === id)
      for (const child of children) {
        addWithChildren(child.id)
      }
    }

    for (const id of windowElementIds) {
      addWithChildren(id)
    }

    return result
  }

  // Helper to sort elements by layer order (lowest order first = bottom layer)
  const sortElementsByLayerOrder = (elements: ElementConfig[]): ElementConfig[] => {
    const orderedLayers = getLayersInOrder()
    const layerOrderMap = new Map(orderedLayers.map((layer, index) => [layer.id, index]))

    return [...elements].sort((a, b) => {
      const layerA = a.layerId || 'default'
      const layerB = b.layerId || 'default'
      const orderA = layerOrderMap.get(layerA) ?? 0
      const orderB = layerOrderMap.get(layerB) ?? 0

      // Sort by layer order first
      if (orderA !== orderB) {
        return orderA - orderB
      }

      // Within same layer, maintain original zIndex order
      return (a.zIndex || 0) - (b.zIndex || 0)
    })
  }

  // For backwards compatibility with single-window exports, get active window data
  const elements = useMemo(() => {
    if (!activeWindow) return []
    return sortElementsByLayerOrder(getElementsWithChildren(activeWindow.elementIds))
  }, [allElements, activeWindow, layers])

  const canvasWidth = activeWindow?.width ?? 800
  const canvasHeight = activeWindow?.height ?? 600
  const backgroundColor = activeWindow?.backgroundColor ?? '#1a1a1a'

  // Build window export data
  const windowsData = useMemo((): WindowExportData[] => {
    return windows.map(w => ({
      id: w.id,
      name: w.name,
      type: w.type,
      width: w.width,
      height: w.height,
      backgroundColor: w.backgroundColor,
      elements: sortElementsByLayerOrder(getElementsWithChildren(w.elementIds)),
    }))
  }, [windows, allElements, layers])

  // Window counts for UI
  const releaseWindowCount = windows.filter(w => w.type === 'release').length
  const developerWindowCount = windows.filter(w => w.type === 'developer').length
  const hasMultipleWindows = windows.length > 1

  // Run validation per-window (name uniqueness is per-window, not global)
  // Combine validation results from all windows
  const validationResult = useMemo(() => {
    const allErrors: ExportError[] = []
    const allWarnings: ExportError[] = []

    for (const window of windowsData) {
      const result = validateForExport(window.elements)
      if (!result.valid) {
        allErrors.push(...result.errors)
        allWarnings.push(...result.warnings)
      }
    }

    if (allErrors.length > 0 || allWarnings.length > 0) {
      return { valid: false, errors: allErrors, warnings: allWarnings } as const
    }
    return { valid: true } as const
  }, [windowsData])

  const handleExportJUCE = async () => {
    // Check for Pro elements if not licensed
    if (!isPro && hasProElements(allElements)) {
      setShowProBlockingModal(true)
      return
    }

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

    let result: { success: boolean; folderName?: string; error?: string; sizeSavings?: any }

    // Folder export (direct to directory)
    if (exportMode === 'folder') {
      result = await exportMultiWindowToFolder(windowsData, {
        optimizeSVG,
        enableResponsiveScaling,
        includeDeveloperWindows,
      })
    } else {
      // ZIP export (existing behavior)
      result = hasMultipleWindows
        ? await exportMultiWindowBundle(windowsData, {
            optimizeSVG,
            enableResponsiveScaling,
            includeDeveloperWindows,
          })
        : await exportJUCEBundle({
            elements,
            canvasWidth,
            canvasHeight,
            backgroundColor,
            optimizeSVG,
            enableResponsiveScaling,
          })
    }

    setIsExporting(false)
    setExportStatus('')

    if (result.success) {
      const timestamp = new Date().toLocaleString()
      const windowCount = hasMultipleWindows
        ? (includeDeveloperWindows ? windows.length : releaseWindowCount)
        : 1
      const fileCount = hasMultipleWindows
        ? windowCount * 4 + 1 // 4 files per window + README
        : 5 // index.html, style.css, components.js, bindings.js, README.md
      setLastExport({
        timestamp,
        fileCount,
        folderName: result.folderName,
        sizeSavings: result.sizeSavings,
      })
    } else {
      setError(result.error ?? null)
    }
  }

  const handleExportPreview = async () => {
    // Check for Pro elements if not licensed
    if (!isPro && hasProElements(allElements)) {
      setShowProBlockingModal(true)
      return
    }

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

    // Use multi-window preview if there are multiple windows
    const result = hasMultipleWindows
      ? await previewMultiWindowExport({
          windows: windows.map(w => ({
            id: w.id,
            name: w.name,
            elements: sortElementsByLayerOrder(getElementsWithChildren(w.elementIds)),
            width: w.width,
            height: w.height,
            backgroundColor: w.backgroundColor,
          })),
          activeWindowId: activeWindow?.id || windows[0]?.id || '',
          enableResponsiveScaling: true,
        })
      : await previewHTMLExport({
          elements: sortElementsByLayerOrder(elements),
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
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-700/50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-200">Export</span>
        <ChevronIcon expanded={expanded} />
      </button>
      {expanded && (
        <div className="p-3 pt-0">
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

        {/* Window Summary */}
        {hasMultipleWindows && (
          <div className="mb-3 p-2 bg-gray-800/50 rounded text-xs text-gray-300">
            <div className="font-medium mb-1">Windows ({windows.length})</div>
            <div className="text-gray-400">
              {releaseWindowCount} release{releaseWindowCount !== 1 ? '' : ''}{developerWindowCount > 0 && `, ${developerWindowCount} developer`}
            </div>
          </div>
        )}

        {/* Export Mode Selection */}
        <div className="mb-4">
          <h4 className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wide">Export Mode</h4>
          <div className="space-y-2 bg-gray-800/50 rounded p-2">
            <label className="flex items-start gap-2 text-xs text-gray-300 cursor-pointer hover:text-gray-100 transition-colors">
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'zip'}
                onChange={() => setExportMode('zip')}
                className="mt-0.5 border-gray-600 bg-gray-700 text-blue-500"
              />
              <div className="flex-1">
                <div className="font-medium">ZIP Archive</div>
                <div className="text-gray-400 mt-0.5">Download as .zip file (traditional)</div>
              </div>
            </label>
            <label className={`flex items-start gap-2 text-xs cursor-pointer transition-colors ${
              'showDirectoryPicker' in window
                ? 'text-gray-300 hover:text-gray-100'
                : 'text-gray-500 opacity-50 cursor-not-allowed'
            }`}>
              <input
                type="radio"
                name="exportMode"
                checked={exportMode === 'folder'}
                onChange={() => setExportMode('folder')}
                disabled={!('showDirectoryPicker' in window)}
                className="mt-0.5 border-gray-600 bg-gray-700 text-blue-500"
              />
              <div className="flex-1">
                <div className="font-medium">
                  Export to Folder
                  {!('showDirectoryPicker' in window) && (
                    <span className="ml-1 text-gray-500">(Not supported)</span>
                  )}
                </div>
                <div className="text-gray-400 mt-0.5">
                  {('showDirectoryPicker' in window)
                    ? 'Write directly to a folder - choose your project\'s UI folder to skip unzipping'
                    : 'Requires Chrome, Edge, or Opera browser'}
                </div>
              </div>
            </label>
          </div>
        </div>

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
            {developerWindowCount > 0 && (
              <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer hover:text-gray-100 transition-colors">
                <input
                  type="checkbox"
                  checked={includeDeveloperWindows}
                  onChange={(e) => setIncludeDeveloperWindows(e.target.checked)}
                  className="rounded border-gray-600 bg-gray-700 text-amber-500"
                />
                Include developer windows
              </label>
            )}
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
              {isExporting ? exportStatus : `Export JUCE Bundle ${exportMode === 'folder' ? '(to Folder)' : '(as ZIP)'}`}
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
              {lastExport.folderName && (
                <div className="mb-1">Exported to: <span className="font-medium">{lastExport.folderName}/</span></div>
              )}
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
      )}

      {/* Pro Elements Blocking Modal */}
      <ProElementsBlockingModal
        isOpen={showProBlockingModal}
        onClose={() => setShowProBlockingModal(false)}
        onUpgrade={() => {
          setShowProBlockingModal(false)
          window.open('https://polar.sh/all-the-machines', '_blank')
        }}
        elements={allElements}
      />
    </div>
  )
}
