import { useState, useCallback, useEffect } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { useStore } from '../../store'
import { SafeSVG } from '../SafeSVG'
import { validateSVGFile, validateSVGContent, getSVGMetadata } from '../../lib/svg-validator'
import { sanitizeSVG } from '../../lib/svg-sanitizer'
import { DEFAULT_CATEGORIES } from '../../types/asset'

interface ImportAssetDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ImportAssetDialog({ isOpen, onClose }: ImportAssetDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [svgContent, setSvgContent] = useState<string>('')
  const [sanitizedContent, setSanitizedContent] = useState<string>('')
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [name, setName] = useState<string>('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [validationResult, setValidationResult] = useState<ReturnType<typeof validateSVGContent> | null>(null)
  const [importing, setImporting] = useState(false)

  const addAsset = useStore((state) => state.addAsset)

  // Clean up preview URL when dialog closes or new file selected
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileDrop = useCallback(async (acceptedFiles: File[]) => {
    const droppedFile = acceptedFiles[0]
    if (!droppedFile) return

    // Validate file size
    const fileSizeValidation = validateSVGFile(droppedFile)
    if (!fileSizeValidation.valid) {
      toast.error(fileSizeValidation.error || 'File validation failed')
      return
    }

    try {
      // Read file content
      const text = await droppedFile.text()

      // Validate content
      const contentValidation = validateSVGContent(text)
      setValidationResult(contentValidation)

      if (!contentValidation.valid) {
        toast.error(contentValidation.error || 'Invalid SVG content')
        return
      }

      // Sanitize content
      const sanitized = sanitizeSVG(text)

      // Create preview URL
      const blob = new Blob([sanitized], { type: 'image/svg+xml' })
      const url = URL.createObjectURL(blob)

      // Update state
      setFile(droppedFile)
      setSvgContent(text)
      setSanitizedContent(sanitized)
      setPreviewUrl(url)

      toast.success('SVG loaded successfully')
    } catch (error) {
      toast.error('Failed to read file')
      console.error('File read error:', error)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/svg+xml': ['.svg'] },
    multiple: false,
    maxFiles: 1,
    onDrop: handleFileDrop,
  })

  const handleCategoryToggle = useCallback((category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    )
  }, [])

  const handleImport = useCallback(async () => {
    if (!file || !sanitizedContent || !name.trim() || !validationResult?.valid) {
      return
    }

    setImporting(true)

    try {
      // Get SVG metadata
      const metadata = getSVGMetadata(sanitizedContent)

      // Add asset to store
      addAsset({
        name: name.trim(),
        svgContent: sanitizedContent,
        categories: selectedCategories,
        fileSize: file.size,
        elementCount: metadata.elementCount,
      })

      toast.success(`Asset "${name}" imported successfully`)

      // Reset and close
      handleReset()
      onClose()
    } catch (error) {
      toast.error('Failed to import asset')
      console.error('Import error:', error)
    } finally {
      setImporting(false)
    }
  }, [file, sanitizedContent, name, validationResult, selectedCategories, addAsset, onClose])

  const handleReset = useCallback(() => {
    // Revoke preview URL before clearing
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    setFile(null)
    setSvgContent('')
    setSanitizedContent('')
    setPreviewUrl(null)
    setName('')
    setSelectedCategories([])
    setValidationResult(null)
  }, [previewUrl])

  const handleClose = useCallback(() => {
    handleReset()
    onClose()
  }, [handleReset, onClose])

  if (!isOpen) return null

  const metadata = validationResult?.metadata
  const isImportDisabled = !file || !name.trim() || !validationResult?.valid || importing

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-white">Import SVG Asset</h2>
            <p className="text-sm text-gray-400">
              Add an SVG file to your asset library
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            x
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto max-h-[60vh]">
          {/* Drop Zone */}
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
                ? 'Drop SVG file here...'
                : 'Drag & drop an SVG file here'}
            </p>
            <p className="text-sm text-gray-500 mt-1">or click to select file</p>
          </div>

          {/* File Selected - Preview and Info */}
          {file && validationResult?.valid && (
            <div className="space-y-4">
              {/* Preview */}
              <div className="bg-gray-800 rounded p-4">
                <h3 className="font-medium text-white mb-3">Preview</h3>
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-24 h-24 bg-gray-700 rounded flex items-center justify-center">
                    {sanitizedContent && (
                      <SafeSVG
                        content={sanitizedContent}
                        className="max-w-full max-h-full"
                        style={{ width: '96px', height: '96px' }}
                      />
                    )}
                  </div>
                  <div className="flex-1 text-sm text-gray-300 space-y-1">
                    <p>
                      <span className="text-gray-400">File:</span> {file.name}
                    </p>
                    <p>
                      <span className="text-gray-400">Size:</span>{' '}
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                    {metadata && (
                      <p>
                        <span className="text-gray-400">Elements:</span>{' '}
                        {metadata.elementCount}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Validation Status */}
              <div className="bg-gray-800 rounded p-4">
                <h3 className="font-medium text-white mb-2">Validation</h3>
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2 text-green-400">
                    <span>✓</span>
                    <span>File size within limits</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <span>✓</span>
                    <span>Element count within limits</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <span>✓</span>
                    <span>No dangerous elements found</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                    <span>✓</span>
                    <span>SVG format valid</span>
                  </div>
                </div>
              </div>

              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Asset Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter a name for this asset"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Categories
                </label>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_CATEGORIES.map((category) => (
                    <label
                      key={category}
                      className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded cursor-pointer hover:bg-gray-700 transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(category)}
                        onChange={() => handleCategoryToggle(category)}
                        className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-300 capitalize">
                        {category}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={handleClose}
            className="px-4 py-2 text-gray-300 hover:text-white text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isImportDisabled}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importing ? 'Importing...' : 'Import Asset'}
          </button>
        </div>
      </div>
    </div>
  )
}
