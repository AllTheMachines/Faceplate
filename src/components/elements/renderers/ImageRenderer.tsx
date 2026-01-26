import React from 'react'
import { ImageElementConfig } from '../../../types/elements'
import { useStore } from '../../../store'
import { SafeSVG } from '../../SafeSVG'

interface ImageRendererProps {
  config: ImageElementConfig
}

export function ImageRenderer({ config }: ImageRendererProps) {
  const [hasError, setHasError] = React.useState(false)
  const getAsset = useStore((state) => state.getAsset)

  // Reset error state when src changes
  React.useEffect(() => {
    setHasError(false)
  }, [config.src])

  // Check for assetId first (asset library SVG)
  if (config.assetId) {
    const asset = getAsset(config.assetId)
    if (asset) {
      return (
        <SafeSVG
          content={asset.svgContent}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      )
    }
    // Asset not found - fall through to "No image" placeholder
  }

  if (!config.src || hasError) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#374151',
          color: '#9ca3af',
          fontSize: '12px',
          border: '2px dashed #4b5563',
        }}
      >
        No image
      </div>
    )
  }

  return (
    <img
      src={config.src}
      alt=""
      draggable={false}
      onError={() => setHasError(true)}
      style={{
        width: '100%',
        height: '100%',
        objectFit: config.fit,
        display: 'block',
      }}
    />
  )
}
