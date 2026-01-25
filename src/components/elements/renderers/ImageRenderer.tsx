import React from 'react'
import { ImageElementConfig } from '../../../types/elements'

interface ImageRendererProps {
  config: ImageElementConfig
}

export function ImageRenderer({ config }: ImageRendererProps) {
  const [hasError, setHasError] = React.useState(false)

  // Reset error state when src changes
  React.useEffect(() => {
    setHasError(false)
  }, [config.src])

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
