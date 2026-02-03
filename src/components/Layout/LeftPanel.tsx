import { useState, useEffect } from 'react'
import { useStore } from 'zustand/react'
import { formatDistanceToNow } from 'date-fns'
import { Palette } from '../Palette'
import { AssetLibraryPanel } from '../AssetLibrary'
import { LayersPanel } from '../Layers'
import { FontSettings } from '../Settings/FontSettings'
import { useStore as useAppStore } from '../../store'
import { useLicense } from '../../hooks/useLicense'

export function LeftPanel() {
  const { isPro } = useLicense()
  const [fontSettingsOpen, setFontSettingsOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'elements' | 'assets' | 'layers'>('elements')
  const [, forceUpdate] = useState(0)

  // Use temporal store reactively via zustand's useStore hook
  const canUndo = useStore(useAppStore.temporal, (state) => state.pastStates.length > 0)
  const canRedo = useStore(useAppStore.temporal, (state) => state.futureStates.length > 0)

  // Subscribe to lastSavedTimestamp for "Last saved" display
  const lastSavedTimestamp = useAppStore((state) => state.lastSavedTimestamp)

  // Auto-refresh relative time every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      forceUpdate(n => n + 1)
    }, 60000) // 60 seconds

    return () => clearInterval(interval)
  }, [])

  const handleUndo = () => {
    useAppStore.temporal.getState().undo()
  }

  const handleRedo = () => {
    useAppStore.temporal.getState().redo()
  }

  // Format last saved time
  const lastSavedText = lastSavedTimestamp
    ? `Last saved: ${formatDistanceToNow(lastSavedTimestamp, { addSuffix: true })}`
    : 'Never saved'

  return (
    <div className="bg-gray-800 border-r border-gray-700 overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white tracking-tight">Faceplate</h1>
        <div className="flex flex-col gap-0.5">
          <span className="text-xs text-gray-500">VST3 UI Designer</span>
          <span className="text-xs text-gray-500">{lastSavedText}</span>
        </div>
      </div>

      {/* Undo/Redo buttons */}
      <div className="flex gap-2 px-4 py-2 border-b border-gray-700">
        <button
          onClick={handleUndo}
          disabled={!canUndo}
          className={`flex-1 py-1.5 px-3 rounded text-sm flex items-center justify-center gap-1 ${
            canUndo
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
          title="Undo (Ctrl+Z)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
          </svg>
          <span>Undo</span>
        </button>
        <button
          onClick={handleRedo}
          disabled={!canRedo}
          className={`flex-1 py-1.5 px-3 rounded text-sm flex items-center justify-center gap-1 ${
            canRedo
              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              : 'bg-gray-800 text-gray-500 cursor-not-allowed'
          }`}
          title="Redo (Ctrl+Y)"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
          </svg>
          <span>Redo</span>
        </button>
      </div>

      {/* Tab buttons */}
      <div className="flex border-b border-gray-700">
        <button
          onClick={() => setActiveTab('elements')}
          className={`flex-1 px-4 py-2 text-sm ${
            activeTab === 'elements'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Elements
        </button>
        {isPro && (
          <button
            onClick={() => setActiveTab('assets')}
            className={`flex-1 px-4 py-2 text-sm ${
              activeTab === 'assets'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            Assets
          </button>
        )}
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 px-4 py-2 text-sm ${
            activeTab === 'layers'
              ? 'text-blue-400 border-b-2 border-blue-400'
              : 'text-gray-400 hover:text-gray-200'
          }`}
        >
          Layers
        </button>
      </div>

      {/* Conditional render based on active tab */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'elements' && <Palette />}
        {activeTab === 'assets' && isPro && <AssetLibraryPanel />}
        {activeTab === 'layers' && <LayersPanel />}
      </div>

      {/* Manage Fonts button */}
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={() => setFontSettingsOpen(true)}
          className="w-full py-2 px-3 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
          </svg>
          <span>Manage Fonts</span>
        </button>
      </div>

      <FontSettings
        isOpen={fontSettingsOpen}
        onClose={() => setFontSettingsOpen(false)}
      />
    </div>
  )
}
