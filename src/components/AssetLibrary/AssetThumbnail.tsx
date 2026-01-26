import { useDraggable } from '@dnd-kit/core'
import { Asset } from '../../types/asset'
import { SafeSVG } from '../SafeSVG'
import { InlineEditName } from './InlineEditName'

interface AssetThumbnailProps {
  asset: Asset
  isSelected?: boolean
  onClick?: () => void
  onRename?: (newName: string) => void
  onDeleteClick?: () => void
}

export function AssetThumbnail({
  asset,
  isSelected = false,
  onClick,
  onRename,
  onDeleteClick,
}: AssetThumbnailProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `asset-${asset.id}`,
    data: {
      type: 'library-asset',
      assetId: asset.id,
    },
  })

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onDeleteClick) {
      onDeleteClick()
    }
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      onClick={onClick}
      onContextMenu={handleContextMenu}
      className={`flex flex-col items-center gap-1 p-2 rounded hover:bg-gray-750 transition-colors cursor-pointer ${
        isSelected ? 'ring-2 ring-blue-500 bg-gray-750' : ''
      } ${isDragging ? 'opacity-50' : ''}`}
    >
      {/* 96px square thumbnail container */}
      <div className="w-24 h-24 bg-gray-700 rounded flex items-center justify-center overflow-hidden">
        <SafeSVG
          content={asset.svgContent}
          className="max-w-full max-h-full"
          style={{ objectFit: 'contain' }}
        />
      </div>
      {/* Asset name (inline editable) */}
      <div className="w-full" onClick={(e) => e.stopPropagation()}>
        <InlineEditName
          value={asset.name}
          onSave={(newName) => onRename?.(newName)}
        />
      </div>
    </div>
  )
}
