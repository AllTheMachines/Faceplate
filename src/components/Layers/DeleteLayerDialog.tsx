import { useMemo } from 'react'
import { useStore } from '../../store'
import { Layer, LAYER_COLOR_MAP } from '../../types/layer'

interface DeleteLayerDialogProps {
  layer: Layer | null
  isOpen: boolean
  onClose: () => void
}

export function DeleteLayerDialog({ layer, isOpen, onClose }: DeleteLayerDialogProps) {
  const elements = useStore((state) => state.elements)
  const removeElement = useStore((state) => state.removeElement)
  const removeLayer = useStore((state) => state.removeLayer)

  // Count elements in this layer
  const elementCount = useMemo(() => {
    if (!layer) return 0
    return elements.filter((el) => (el.layerId || 'default') === layer.id).length
  }, [layer, elements])

  // Handle delete - remove all elements in layer first, then remove layer
  const handleDelete = () => {
    if (!layer) return

    // Find and remove all elements in this layer
    const elementsInLayer = elements.filter((el) => (el.layerId || 'default') === layer.id)
    for (const element of elementsInLayer) {
      removeElement(element.id)
    }

    // Remove the layer
    removeLayer(layer.id)

    onClose()
  }

  if (!isOpen || !layer) return null

  const colorHex = LAYER_COLOR_MAP[layer.color]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-gray-800 rounded-lg shadow-xl border border-gray-700 max-w-md w-full mx-4">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            Delete Layer
          </h2>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-4 h-4 rounded-full flex-shrink-0"
              style={{ backgroundColor: colorHex }}
            />
            <span className="text-white font-medium">{layer.name}</span>
          </div>

          {elementCount > 0 ? (
            <div className="bg-red-900/30 border border-red-700 rounded p-3 mb-4">
              <p className="text-red-200 text-sm">
                This layer contains <strong>{elementCount} element{elementCount !== 1 ? 's' : ''}</strong>.
                Deleting this layer will also delete all elements in it.
              </p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm mb-4">
              This layer is empty. Are you sure you want to delete it?
            </p>
          )}

          <p className="text-gray-500 text-sm">
            This action cannot be undone.
          </p>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-300 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 text-white bg-red-600 rounded hover:bg-red-500 transition-colors"
          >
            Delete{elementCount > 0 ? ` (${elementCount} element${elementCount !== 1 ? 's' : ''})` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
