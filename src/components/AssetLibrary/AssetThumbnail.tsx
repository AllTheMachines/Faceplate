import { Asset } from '../../types/asset'
import { SafeSVG } from '../SafeSVG'

interface AssetThumbnailProps {
  asset: Asset
  isSelected?: boolean
  onClick?: () => void
}

export function AssetThumbnail({ asset, isSelected = false, onClick }: AssetThumbnailProps) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-750 transition-colors ${
        isSelected ? 'ring-2 ring-blue-500 bg-gray-750' : ''
      }`}
    >
      {/* 96px square thumbnail container */}
      <div className="w-24 h-24 bg-gray-700 rounded flex items-center justify-center overflow-hidden">
        <SafeSVG
          content={asset.svgContent}
          className="max-w-full max-h-full"
          style={{ objectFit: 'contain' }}
        />
      </div>
      {/* Asset name (truncate if long) */}
      <span className="text-xs text-gray-300 text-center line-clamp-2 w-full">
        {asset.name}
      </span>
    </button>
  )
}
