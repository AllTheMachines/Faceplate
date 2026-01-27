import { useEffect, useState } from 'react'
import { useFonts } from '../../hooks/useFonts'
import { formatDistanceToNow } from 'date-fns'

interface FontSettingsProps {
  isOpen: boolean
  onClose: () => void
}

export function FontSettings({ isOpen, onClose }: FontSettingsProps) {
  const {
    customFonts,
    fontsDirectoryPath,
    fontsLoading,
    fontsError,
    lastScanTime,
    selectDirectory,
    rescanDirectory,
    clearDirectory,
    restoreOnMount,
  } = useFonts()

  const [copied, setCopied] = useState(false)

  // Restore fonts on mount
  useEffect(() => {
    restoreOnMount()
  }, [restoreOnMount])

  // Copy path to clipboard
  const handleCopyPath = async () => {
    if (fontsDirectoryPath) {
      await navigator.clipboard.writeText(fontsDirectoryPath)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Font Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Fonts Directory Section */}
          <div>
            <h3 className="text-sm font-medium text-gray-300 mb-2">Custom Fonts Directory</h3>

            {fontsDirectoryPath ? (
              <div className="space-y-2">
                {/* Path display with copy */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-900 rounded px-3 py-2 text-sm text-gray-300 font-mono truncate">
                    {fontsDirectoryPath}
                  </div>
                  <button
                    onClick={handleCopyPath}
                    className="px-3 py-2 bg-gray-700 hover:bg-gray-600 rounded text-sm text-gray-300 transition-colors"
                    title="Copy path"
                  >
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={rescanDirectory}
                    disabled={fontsLoading}
                    className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm text-white font-medium transition-colors"
                  >
                    {fontsLoading ? 'Scanning...' : 'Rescan Fonts'}
                  </button>
                  <button
                    onClick={selectDirectory}
                    disabled={fontsLoading}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-sm text-gray-300 transition-colors"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={selectDirectory}
                disabled={fontsLoading}
                className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed rounded text-white font-medium transition-colors"
              >
                {fontsLoading ? 'Loading...' : 'Select Fonts Folder'}
              </button>
            )}
          </div>

          {/* Status Section */}
          <div className="bg-gray-900 rounded p-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Custom fonts loaded:</span>
              <span className="text-white font-medium">{customFonts.length}</span>
            </div>
            {lastScanTime && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Last scan:</span>
                <span className="text-gray-300">
                  {formatDistanceToNow(lastScanTime, { addSuffix: true })}
                </span>
              </div>
            )}
          </div>

          {/* Error display */}
          {fontsError && (
            <div className="bg-red-900/30 border border-red-700 rounded p-3 text-sm text-red-300">
              {fontsError}
            </div>
          )}

          {/* Clear button */}
          {fontsDirectoryPath && (
            <button
              onClick={clearDirectory}
              className="w-full px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
            >
              Clear Custom Fonts
            </button>
          )}

          {/* Info text */}
          <p className="text-xs text-gray-500">
            Select a folder containing .ttf, .otf, .woff, or .woff2 font files.
            Fonts will be available in all font dropdowns and bundled with exports.
          </p>
        </div>
      </div>
    </div>
  )
}
