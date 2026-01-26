import { SvgGraphicElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'
import { SafeSVG } from '../../../SafeSVG'

interface SvgGraphicRendererProps {
  config: SvgGraphicElementConfig
}

/**
 * Build CSS transform string for flip transforms
 * Note: rotation is handled by BaseElement wrapper, not here
 */
function buildTransformStyle(config: SvgGraphicElementConfig): string {
  const parts: string[] = []
  if (config.flipH) {
    parts.push('scaleX(-1)')
  }
  if (config.flipV) {
    parts.push('scaleY(-1)')
  }
  return parts.length > 0 ? parts.join(' ') : 'none'
}

export function SvgGraphicRenderer({ config }: SvgGraphicRendererProps) {
  const getAsset = useStore((state) => state.getAsset)

  // State 1: Unassigned placeholder (assetId is undefined)
  if (!config.assetId) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed #4b5563',
          backgroundColor: '#374151',
          color: '#9ca3af',
          fontSize: '12px',
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>📁</div>
        <span>Select Asset</span>
      </div>
    )
  }

  const asset = getAsset(config.assetId)

  // State 3: Missing asset (assetId exists but asset not found)
  if (!asset) {
    return (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid #ef4444',
          backgroundColor: '#7f1d1d',
          color: '#fca5a5',
          fontSize: '12px',
        }}
      >
        <div style={{ fontSize: '24px', marginBottom: '8px' }}>⚠️</div>
        <span>Asset not found</span>
      </div>
    )
  }

  // State 2: Valid asset - render with transforms
  const transformStyle = buildTransformStyle(config)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        transform: transformStyle !== 'none' ? transformStyle : undefined,
        transformOrigin: 'center center',
        opacity: config.opacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <SafeSVG
        content={asset.svgContent}
        style={{
          maxWidth: '100%',
          maxHeight: '100%',
          objectFit: 'contain',
        }}
      />
    </div>
  )
}
