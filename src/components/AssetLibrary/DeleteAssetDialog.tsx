import { useMemo } from 'react'
import { Asset } from '../../types/asset'
import { useStore } from '../../store'
import { ImageElementConfig } from '../../types/elements'

interface DeleteAssetDialogProps {
  asset: Asset | null
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

function useAssetUsage(assetId: string | undefined) {
  const elements = useStore((state) => state.elements)

  const usedByElements = useMemo(() => {
    if (!assetId) return []
    return elements.filter((el) => {
      return el.type === 'image' && (el as ImageElementConfig).assetId === assetId
    })
  }, [elements, assetId])

  return {
    usageCount: usedByElements.length,
    elementNames: usedByElements.map((el) => el.name || el.id),
  }
}

export function DeleteAssetDialog({ asset, isOpen, onClose, onConfirm }: DeleteAssetDialogProps) {
  const { usageCount, elementNames } = useAssetUsage(asset?.id)

  if (!isOpen || !asset) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Dialog */}
      <div className="relative bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 border border-gray-700">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Delete Asset?</h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4">
          {usageCount === 0 ? (
            <p className="text-gray-300 text-sm">
              Are you sure you want to delete <span className="font-semibold text-white">{asset.name}</span>?
            </p>
          ) : (
            <div className="space-y-3">
              <p className="text-yellow-400 text-sm font-medium">
                This asset is used by {usageCount} element{usageCount > 1 ? 's' : ''}:
              </p>
              <ul className="list-disc list-inside text-gray-300 text-sm space-y-1 ml-2">
                {elementNames.map((name, index) => (
                  <li key={index}>{name}</li>
                ))}
              </ul>
              <p className="text-gray-300 text-sm">
                These elements will lose their SVG content. Delete anyway?
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white transition-colors rounded hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="px-4 py-2 text-sm bg-red-600 text-white rounded hover:bg-red-500 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
