import { SvgGraphicElementConfig, ElementConfig } from '../../types/elements'
import { PropertySection, NumberInput } from './'
import { useStore } from '../../store'
import { getSVGNaturalSize } from '../../services/svg'

interface SvgGraphicPropertiesProps {
  element: SvgGraphicElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function SvgGraphicProperties({ element, onUpdate }: SvgGraphicPropertiesProps) {
  const assets = useStore((state) => state.assets)
  const getAsset = useStore((state) => state.getAsset)

  const handleAssetChange = (newAssetId: string | undefined) => {
    if (newAssetId) {
      const asset = getAsset(newAssetId)
      if (asset) {
        // Get natural size and apply it
        const naturalSize = getSVGNaturalSize(asset.svgContent)
        if (naturalSize) {
          onUpdate({
            assetId: newAssetId,
            width: naturalSize.width,
            height: naturalSize.height,
          })
          return
        }
      }
    }
    onUpdate({ assetId: newAssetId })
  }

  const handleResetToNaturalSize = () => {
    if (!element.assetId) return
    const asset = getAsset(element.assetId)
    if (!asset) return

    const naturalSize = getSVGNaturalSize(asset.svgContent)
    if (naturalSize) {
      onUpdate({
        width: naturalSize.width,
        height: naturalSize.height,
      })
    }
  }

  return (
    <>
      {/* Asset Selection */}
      <PropertySection title="Asset">
        <div>
          <label className="block text-xs text-gray-400 mb-1">SVG Asset</label>
          <select
            value={element.assetId || ''}
            onChange={(e) => handleAssetChange(e.target.value || undefined)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="">None (placeholder)</option>
            {assets.map((asset) => (
              <option key={asset.id} value={asset.id}>
                {asset.name}
              </option>
            ))}
          </select>
        </div>

        {element.assetId && (
          <button
            onClick={handleResetToNaturalSize}
            className="w-full mt-2 bg-gray-700 hover:bg-gray-600 text-white rounded px-3 py-2 text-sm transition-colors"
          >
            Reset to Natural Size
          </button>
        )}
      </PropertySection>

      {/* Transform */}
      <PropertySection title="Transform">
        <div className="flex gap-4 mb-3">
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={element.flipH}
              onChange={(e) => onUpdate({ flipH: e.target.checked })}
              className="rounded border-gray-600 bg-gray-700 text-blue-500"
            />
            <span className="text-gray-300">Flip H</span>
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={element.flipV}
              onChange={(e) => onUpdate({ flipV: e.target.checked })}
              className="rounded border-gray-600 bg-gray-700 text-blue-500"
            />
            <span className="text-gray-300">Flip V</span>
          </label>
        </div>

        <NumberInput
          label="Opacity"
          value={Math.round(element.opacity * 100)}
          onChange={(val) => onUpdate({ opacity: val / 100 })}
          min={0}
          max={100}
          step={5}
          suffix="%"
        />
      </PropertySection>
    </>
  )
}
