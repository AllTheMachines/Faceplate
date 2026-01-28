import React, { useState } from 'react'
import { useTemplateStore } from '../../store/templateStore'
import { useStore } from '../../store'
import type { Template } from '../../types/template'

interface NewProjectDialogProps {
  isOpen: boolean
  onClose: () => void
}

export const NewProjectDialog: React.FC<NewProjectDialogProps> = ({ isOpen, onClose }) => {
  const { templates } = useTemplateStore()
  const { loadFromTemplate, clearCanvas, updateWindow, getActiveWindow } = useStore()
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null)

  if (!isOpen) return null

  const handleStartFromTemplate = () => {
    if (!selectedTemplate) return
    loadFromTemplate(selectedTemplate)
    onClose()
  }

  const handleStartBlank = () => {
    clearCanvas()
    // Update active window dimensions
    const activeWindow = getActiveWindow()
    if (activeWindow) {
      updateWindow(activeWindow.id, { width: 600, height: 400 })
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-[600px] max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4 text-white">New Project</h2>
        
        {/* Blank Canvas Option */}
        <div className="mb-6">
          <button
            onClick={handleStartBlank}
            className="w-full p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition-colors"
          >
            <div className="font-semibold text-white">Start with Blank Canvas</div>
            <div className="text-sm text-gray-400 mt-1">
              Create a custom UI from scratch
            </div>
          </button>
        </div>

        {/* Template Options */}
        <div>
          <h3 className="font-semibold mb-3 text-white">Start from Template</h3>
          <div className="space-y-3">
            {templates.map((template) => (
              <button
                key={template.name}
                onClick={() => setSelectedTemplate(template)}
                className={`w-full p-4 rounded-lg text-left transition-colors ${
                  selectedTemplate?.name === template.name
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white">{template.name}</div>
                    <div className="text-sm text-gray-400 mt-1">
                      {template.description}
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {template.elements.length} elements • {template.metadata.canvasWidth}x{template.metadata.canvasHeight}px
                    </div>
                  </div>
                  <div className="text-xs px-2 py-1 bg-gray-900 rounded text-gray-400">
                    {template.category}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleStartFromTemplate}
            disabled={!selectedTemplate}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded disabled:opacity-50 disabled:cursor-not-allowed text-white"
          >
            Create from Template
          </button>
        </div>

        {/* VST3 Repo Link */}
        {selectedTemplate?.metadata.recommendedVST3Repo && (
          <div className="mt-4 p-3 bg-gray-900 rounded text-sm">
            <div className="text-gray-400 mb-1">Recommended VST3 template:</div>
            <a
              href={selectedTemplate.metadata.recommendedVST3Repo}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {selectedTemplate.metadata.recommendedVST3Repo}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}