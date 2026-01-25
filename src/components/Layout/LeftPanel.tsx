import { useState } from 'react'
import { Palette } from '../Palette'
import { TemplateImporter } from '../Import/TemplateImporter'

export function LeftPanel() {
  const [importerOpen, setImporterOpen] = useState(false)

  return (
    <div className="bg-gray-800 border-r border-gray-700 overflow-y-auto flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h1 className="text-xl font-bold text-white tracking-tight">Facet</h1>
        <span className="text-xs text-gray-500">VST3 UI Designer</span>
      </div>
      <div className="p-3 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-100">Components</h2>
      </div>
      <div className="flex-1 overflow-y-auto">
        <Palette />
      </div>
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
