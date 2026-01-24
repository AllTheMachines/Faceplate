import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { parseJUCETemplate } from '../../services/import/templateParser'
import { useStore } from '../../store'
import { ElementConfig } from '../../types/elements'

interface TemplateImporterProps {
  isOpen: boolean
  onClose: () => void
}

interface ParsedFiles {
  html?: string
  css?: string
  js?: string
}

export function TemplateImporter({ isOpen, onClose }: TemplateImporterProps) {
  const [files, setFiles] = useState<ParsedFiles>({})
  const [preview, setPreview] = useState<{
    elements: ElementConfig[]
    errors: string[]
    canvasWidth: number
    canvasHeight: number
  } | null>(null)
  const [importing, setImporting] = useState(false)

  const addElements = useStore((state) => state.addElements)
  const setCanvasDimensions = useStore((state) => state.setCanvasDimensions)
  const clearSelection = useStore((state) => state.clearSelection)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const content = reader.result as string
        const ext = file.name.split('.').pop()?.toLowerCase()

        setFiles((prev) => {
          const updated = { ...prev }
          if (ext === 'html' || ext === 'htm') {
            updated.html = content
          } else if (ext === 'css') {
            updated.css = content
          } else if (ext === 'js') {
            updated.js = content
          }
          return updated
        })
      }
      reader.readAsText(file)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/html': ['.html', '.htm'],
      'text/css': ['.css'],
      'text/javascript': ['.js'],
    },
  })

  const handleParse = useCallback(() => {
    if (!files.html) return

    const result = parseJUCETemplate({
      html: files.html,
      css: files.css,
      js: files.js,
    })

    setPreview(result)
  }, [files])

  const handleImport = useCallback(() => {
    if (!preview) return

    setImporting(true)
    console.log('Starting import:', preview.elements.length, 'elements')

    // Update canvas size
    setCanvasDimensions(preview.canvasWidth, preview.canvasHeight)

    // Clear existing selection
    clearSelection()

    // Add all elements in a single batch update
    console.log('Adding elements to store...')
    addElements(preview.elements)

    // Verify elements were added to store
    const currentElements = useStore.getState().elements
    console.log('Elements in store after import:', currentElements.length)
    console.log('Import complete')

    // Clean up and close modal
    setImporting(false)
    setFiles({})
    setPreview(null)
    onClose()
  }, [preview, addElements, setCanvasDimensions, clearSelection, onClose])

  const handleReset = useCallback(() => {
    setFiles({})
    setPreview(null)
  }, [])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">Import Template</h2>
            <p className="text-sm text-gray-400">
              Import HTML/CSS/JS from existing JUCE WebView2 projects
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            x
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* File Drop Zone */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragActive
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-600 hover:border-gray-500'
            }`}
          >
            <input {...getInputProps()} />
            <p className="text-gray-300">
              {isDragActive
                ? 'Drop files here...'
                : 'Drag & drop HTML, CSS, and JS files here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">or click to select files</p>
          </div>

          {/* Loaded Files */}
          <div className="flex gap-2">
            <span
              className={`px-2 py-1 rounded text-sm ${
                files.html ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              HTML {files.html ? '✓' : ''}
            </span>
            <span
              className={`px-2 py-1 rounded text-sm ${
                files.css ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              CSS {files.css ? '✓' : ''}
            </span>
            <span
              className={`px-2 py-1 rounded text-sm ${
                files.js ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-400'
              }`}
            >
              JS {files.js ? '✓' : ''}
            </span>
          </div>

          {/* Parse Button */}
          {files.html && !preview && (
            <button
              onClick={handleParse}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-500"
            >
              Parse Template
            </button>
          )}

          {/* Preview */}
          {preview && (
            <div className="space-y-3">
              <div className="bg-gray-800 rounded p-3">
                <h3 className="font-medium text-white mb-2">Parse Result</h3>
                <p className="text-sm text-gray-300">
                  Found {preview.elements.length} elements
                </p>
                <p className="text-sm text-gray-400">
                  Canvas: {preview.canvasWidth} x {preview.canvasHeight}
                </p>

                {preview.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-amber-400">Warnings:</p>
                    <ul className="text-xs text-gray-400 list-disc list-inside">
                      {preview.errors.map((err, i) => (
                        <li key={i}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="bg-gray-800 rounded p-3 max-h-40 overflow-y-auto">
                <h4 className="text-sm font-medium text-gray-300 mb-2">Elements</h4>
                <ul className="space-y-1">
                  {preview.elements.map((el) => (
                    <li key={el.id} className="text-xs text-gray-400 flex justify-between">
                      <span>{el.name}</span>
                      <span className="text-gray-500">{el.type}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
          {preview ? (
            <>
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-300 hover:text-white text-sm"
              >
                Reset
              </button>
              <button
                onClick={handleImport}
                disabled={importing || preview.elements.length === 0}
                className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-500 disabled:opacity-50"
              >
                {importing ? 'Importing...' : `Import ${preview.elements.length} Elements`}
              </button>
            </>
          ) : (
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-300 hover:text-white text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
