import { useState, useMemo, useEffect } from 'react'
import { useStore } from '../../store'
import { DEFAULT_CATEGORIES, Asset } from '../../types/asset'
import { AssetSearch } from './AssetSearch'
import { CategorySection } from './CategorySection'
import { AssetThumbnail } from './AssetThumbnail'
import { ImportAssetDialog } from './ImportAssetDialog'
import { DeleteAssetDialog } from './DeleteAssetDialog'
import { ElementLayerMappingDialog } from '../dialogs'

export function AssetLibraryPanel() {
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set([...DEFAULT_CATEGORIES]) // All categories expanded by default
  )
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null)
  const [importDialogOpen, setImportDialogOpen] = useState(false)
  const [deleteDialogAsset, setDeleteDialogAsset] = useState<Asset | null>(null)
  const [showStyleImport, setShowStyleImport] = useState(false)

  const assets = useStore((state) => state.assets)
  const customCategories = useStore((state) => state.customCategories)
  const updateAsset = useStore((state) => state.updateAsset)
  const removeAsset = useStore((state) => state.removeAsset)

  // Filter assets by search term (case-insensitive name match)
  const filteredAssets = useMemo(() => {
    if (!searchTerm.trim()) return assets

    const lowerSearch = searchTerm.toLowerCase()
    return assets.filter((asset) =>
      asset.name.toLowerCase().includes(lowerSearch)
    )
  }, [assets, searchTerm])

  // Group filtered assets by category
  const assetsByCategory = useMemo(() => {
    const groups: Record<string, typeof filteredAssets> = {}

    // Initialize all categories
    const allCategories = [...DEFAULT_CATEGORIES, ...customCategories]
    allCategories.forEach((category) => {
      groups[category] = []
    })

    // Group assets (asset can appear in multiple categories)
    filteredAssets.forEach((asset) => {
      asset.categories.forEach((category) => {
        if (groups[category]) {
          groups[category].push(asset)
        }
      })
    })

    return groups
  }, [filteredAssets, customCategories])

  // Get uncategorized assets (assets with empty categories array)
  const uncategorizedAssets = useMemo(() => {
    return filteredAssets.filter((asset) => asset.categories.length === 0)
  }, [filteredAssets])

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const handleAssetClick = (assetId: string) => {
    setSelectedAssetId(assetId === selectedAssetId ? null : assetId)
  }

  const handleRename = (assetId: string, newName: string) => {
    updateAsset(assetId, { name: newName })
  }

  const handleDeleteClick = (asset: Asset) => {
    setDeleteDialogAsset(asset)
  }

  const handleDeleteConfirm = () => {
    if (deleteDialogAsset) {
      removeAsset(deleteDialogAsset.id)
      if (selectedAssetId === deleteDialogAsset.id) {
        setSelectedAssetId(null)
      }
    }
  }

  // Keyboard listener for Delete key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' && selectedAssetId) {
        const asset = assets.find((a) => a.id === selectedAssetId)
        if (asset) {
          handleDeleteClick(asset)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedAssetId, assets])

  // All categories to display
  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories]

  // Check if we have any assets at all
  const hasAssets = assets.length > 0
  const hasFilteredAssets = filteredAssets.length > 0

  return (
    <div className="flex flex-col h-full">
      {/* Import buttons at top */}
      <div className="p-3 border-b border-gray-700 space-y-2">
        <button
          onClick={() => setImportDialogOpen(true)}
          className="w-full py-2 px-3 bg-blue-600 text-white rounded text-sm hover:bg-blue-500 flex items-center justify-center gap-2 font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span>Import SVG</span>
        </button>
        <button
          onClick={() => setShowStyleImport(true)}
          className="w-full py-2 px-3 bg-purple-600 text-white rounded text-sm hover:bg-purple-500 flex items-center justify-center gap-2 font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
            />
          </svg>
          <span>Import Element Style</span>
        </button>
      </div>

      {/* Search box */}
      <div className="p-3 border-b border-gray-700">
        <AssetSearch onSearch={setSearchTerm} />
      </div>

      {/* Asset categories or empty state */}
      <div className="flex-1 overflow-y-auto">
        {!hasAssets ? (
          // Empty state - no assets yet
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-gray-600 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-gray-400 text-sm">No assets yet.</p>
              <p className="text-gray-500 text-xs mt-1">
                Click 'Import SVG' to add your first asset.
              </p>
            </div>
          </div>
        ) : !hasFilteredAssets ? (
          // Empty state - search returned no results
          <div className="flex items-center justify-center h-full p-6">
            <div className="text-center">
              <svg
                className="w-12 h-12 text-gray-600 mx-auto mb-3"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
              <p className="text-gray-400 text-sm">No assets found.</p>
              <p className="text-gray-500 text-xs mt-1">
                Try a different search term.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Category sections - only show if has assets */}
            {allCategories.map((category) => {
              const categoryAssets = assetsByCategory[category] || []
              if (categoryAssets.length === 0) return null

              return (
                <CategorySection
                  key={category}
                  name={category.charAt(0).toUpperCase() + category.slice(1)}
                  isExpanded={expandedCategories.has(category)}
                  onToggle={() => toggleCategory(category)}
                >
                  {categoryAssets.map((asset) => (
                    <AssetThumbnail
                      key={asset.id}
                      asset={asset}
                      isSelected={selectedAssetId === asset.id}
                      onClick={() => handleAssetClick(asset.id)}
                      onRename={(newName) => handleRename(asset.id, newName)}
                      onDeleteClick={() => handleDeleteClick(asset)}
                    />
                  ))}
                </CategorySection>
              )
            })}

            {/* Uncategorized section */}
            {uncategorizedAssets.length > 0 && (
              <CategorySection
                name="Uncategorized"
                isExpanded={expandedCategories.has('uncategorized')}
                onToggle={() => toggleCategory('uncategorized')}
              >
                {uncategorizedAssets.map((asset) => (
                  <AssetThumbnail
                    key={asset.id}
                    asset={asset}
                    isSelected={selectedAssetId === asset.id}
                    onClick={() => handleAssetClick(asset.id)}
                    onRename={(newName) => handleRename(asset.id, newName)}
                    onDeleteClick={() => handleDeleteClick(asset)}
                  />
                ))}
              </CategorySection>
            )}
          </>
        )}
      </div>

      {/* Import Asset Dialog */}
      <ImportAssetDialog
        isOpen={importDialogOpen}
        onClose={() => setImportDialogOpen(false)}
      />

      {/* Delete Asset Dialog */}
      <DeleteAssetDialog
        asset={deleteDialogAsset}
        isOpen={deleteDialogAsset !== null}
        onClose={() => setDeleteDialogAsset(null)}
        onConfirm={handleDeleteConfirm}
      />

      {/* Import Element Style Dialog */}
      <ElementLayerMappingDialog
        isOpen={showStyleImport}
        onClose={() => setShowStyleImport(false)}
        category={null}
      />
    </div>
  )
}
