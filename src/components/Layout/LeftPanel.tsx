import { useState } from 'react'
import { Palette } from '../Palette'
import { AssetLibraryPanel } from '../AssetLibrary'
import { TemplateImporter } from '../Import/TemplateImporter'
import { useStore } from '../../store'

export function LeftPanel() {
  const [importerOpen, setImporterOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'elements' | 'assets'>('elements')
  // Pre-formatted timestamp from project file, null for new/unsaved projects
  const lastSavedTimestamp = useStore((state) => state.lastSavedTimestamp)

  return (
    <div className="bg-gray-800 border-r border-gray-700 overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white tracking-tight">Faceplate</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">VST3 UI Designer</span>
          <span className="text-xs text-yellow-400 bg-gray-900 px-1 rounded">{lastSavedTimestamp ? `${lastSavedTimestamp} CET` : 'New Project'}</span>
        </div>
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
      </div>

      {/* Conditional render based on active tab */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'elements' ? <Palette /> : <AssetLibraryPanel />}
      </div>

      {/* Import Template button visible on both tabs */}
      <div className="p-3 border-t border-gray-700">
        <button
          onClick={() => setImporterOpen(true)}
          className="w-full py-2 px-3 bg-gray-700 text-gray-300 rounded text-sm hover:bg-gray-600 flex items-center justify-center gap-2"
        >
          <span>Import Template</span>
        </button>
      </div>

      <TemplateImporter
        isOpen={importerOpen}
        onClose={() => setImporterOpen(false)}
      />
    </div>
  )
}
