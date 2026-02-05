import { useState } from 'react'
import toast from 'react-hot-toast'
import { useStore } from '../../store'
import { LayerMappingDialog } from './LayerMappingDialog'
import { SafeSVG } from '../SafeSVG'

interface ManageKnobStylesDialogProps {
  isOpen: boolean
  onClose: () => void
}

export function ManageKnobStylesDialog({ isOpen, onClose }: ManageKnobStylesDialogProps) {
  const knobStyles = useStore((state) => state.knobStyles)
  const elements = useStore((state) => state.elements)
  const removeKnobStyle = useStore((state) => state.removeKnobStyle)
  const updateKnobStyle = useStore((state) => state.updateKnobStyle)

  const [showImport, setShowImport] = useState(false)
  const [remapStyleId, setRemapStyleId] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  // Count how many elements use a style
  const getStyleUsage = (styleId: string): number => {
    return elements.filter(
      (el) => el.type === 'knob' && 'styleId' in el && el.styleId === styleId
    ).length
  }

  // Handle delete with usage check
  const handleDelete = (styleId: string, styleName: string) => {
    const usage = getStyleUsage(styleId)
    if (usage > 0) {
      const confirmed = window.confirm(
        `"${styleName}" is used by ${usage} knob element${usage > 1 ? 's' : ''}. ` +
        `Delete anyway? Knobs will revert to default style.`
      )
      if (!confirmed) return
    }

    removeKnobStyle(styleId)
    toast.success(`Deleted style "${styleName}"`)
  }

  // Handle rename
  const handleStartRename = (styleId: string, currentName: string) => {
    setEditingId(styleId)
    setEditName(currentName)
  }

  const handleSaveRename = () => {
    if (editingId && editName.trim()) {
      updateKnobStyle(editingId, { name: editName.trim() })
      toast.success('Style renamed')
    }
    setEditingId(null)
    setEditName('')
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Manage Knob Styles</h2>

          {/* Import New Style Button */}
          <button
            onClick={() => setShowImport(true)}
            className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 flex items-center justify-center gap-2"
          >
            <span>+</span>
            <span>Import New Knob Style</span>
          </button>

          {/* Styles List */}
          {knobStyles.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No knob styles yet. Import one to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {knobStyles.map((style) => {
                const usage = getStyleUsage(style.id)
                const isEditing = editingId === style.id

                return (
                  <div
                    key={style.id}
                    className="flex items-center gap-3 bg-gray-700 p-3 rounded"
                  >
                    {/* Preview thumbnail */}
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-900 rounded">
                      <SafeSVG
                        content={style.svgContent}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>

                    {/* Name and info */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename()
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          onBlur={handleSaveRename}
                          autoFocus
                          className="bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm w-full"
                        />
                      ) : (
                        <div className="font-medium text-white truncate">{style.name}</div>
                      )}
                      <div className="text-xs text-gray-400">
                        {style.maxAngle - style.minAngle}° range
                        {usage > 0 && ` • Used by ${usage} knob${usage > 1 ? 's' : ''}`}
                      </div>
                    </div>

                    {/* Actions */}
                    {!isEditing && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleStartRename(style.id, style.name)}
                          className="text-blue-400 hover:text-blue-300 text-sm px-2 py-1"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => setRemapStyleId(style.id)}
                          className="text-green-400 hover:text-green-300 text-sm px-2 py-1"
                        >
                          Re-map
                        </button>
                        <button
                          onClick={() => handleDelete(style.id, style.name)}
                          className="text-red-400 hover:text-red-300 text-sm px-2 py-1"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white rounded px-4 py-2"
          >
            Close
          </button>
        </div>
      </div>

      {/* Import/Re-map dialog (nested) */}
      <LayerMappingDialog
        isOpen={showImport || remapStyleId !== null}
        onClose={() => {
          setShowImport(false)
          setRemapStyleId(null)
        }}
        existingStyle={remapStyleId ? knobStyles.find(s => s.id === remapStyleId) : undefined}
      />
    </>
  )
}
