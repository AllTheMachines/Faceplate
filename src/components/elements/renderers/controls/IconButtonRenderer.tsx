import { IconButtonElementConfig } from '../../../../types/elements'
import { builtInIconSVG, BuiltInIcon } from '../../../../utils/builtInIcons'
import { useStore } from '../../../../store'

interface IconButtonRendererProps {
  config: IconButtonElementConfig
}

export function IconButtonRenderer({ config }: IconButtonRendererProps) {
  const getAsset = useStore((state) => state.getAsset)

  // Get icon SVG content
  let iconContent: string | null = null

  if (config.iconSource === 'builtin' && config.builtInIcon) {
    iconContent = builtInIconSVG[config.builtInIcon]
  } else if (config.iconSource === 'asset' && config.assetId) {
    const asset = getAsset(config.assetId)
    if (asset?.svgContent) {
      iconContent = asset.svgContent
    }
  }

  // Fallback to Play icon if no icon found
  if (!iconContent) {
    iconContent = builtInIconSVG[BuiltInIcon.Play]
  }

  // Calculate icon size (70% of container)
  const iconSize = Math.min(config.width, config.height) * 0.7

  return (
    <div
      className="icon-button-element"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: config.backgroundColor,
        borderRadius: `${config.borderRadius}px`,
        border: `2px solid ${config.borderColor}`,
        userSelect: 'none',
        cursor: 'pointer',
        transition: 'none',
        // Pressed state: darken
        filter: config.pressed ? 'brightness(0.85)' : 'brightness(1)',
        boxShadow: config.pressed
          ? 'inset 0 2px 4px rgba(0,0,0,0.3)'
          : '0 1px 2px rgba(0,0,0,0.2)',
      }}
    >
      <div
        style={{
          width: iconSize,
          height: iconSize,
          color: config.iconColor,
        }}
        dangerouslySetInnerHTML={{ __html: iconContent }}
      />
    </div>
  )
}
