import { useRef } from 'react'
import type { PresetBrowserElementConfig } from '../../../../types/elements'
import { DEFAULT_SCROLLBAR_CONFIG } from '../../../../types/elements/containers'
import { CustomScrollbar } from '../containers/CustomScrollbar'

interface PresetBrowserRendererProps {
  config: PresetBrowserElementConfig
}

interface PresetItem {
  name: string
  folder?: string
  isFolder: boolean
  depth: number
}

export function PresetBrowserRenderer({ config }: PresetBrowserRendererProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  // Scrollbar config with defaults
  const scrollbarConfig = {
    width: config.scrollbarWidth ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarWidth,
    thumbColor: config.scrollbarThumbColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbColor,
    thumbHoverColor: config.scrollbarThumbHoverColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbHoverColor,
    trackColor: config.scrollbarTrackColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarTrackColor,
    borderRadius: config.scrollbarBorderRadius ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarBorderRadius,
    thumbBorder: config.scrollbarThumbBorder ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbBorder,
  }

  // Parse presets into structured list
  const parsePresets = (): PresetItem[] => {
    if (!config.showFolders) {
      // Flat list - just show preset names
      return config.presets.map(p => ({
        name: p.includes('/') ? p.split('/').pop()! : p,
        isFolder: false,
        depth: 0,
      }))
    }

    // Group by folder
    const folders = new Map<string, string[]>()
    const rootPresets: string[] = []

    config.presets.forEach(preset => {
      if (preset.includes('/')) {
        const [folder, ...rest] = preset.split('/')
        const name = rest.join('/') || preset
        if (folder && !folders.has(folder)) {
          folders.set(folder, [])
        }
        if (folder) folders.get(folder)!.push(name)
      } else {
        rootPresets.push(preset)
      }
    })

    const items: PresetItem[] = []

    // Add folders with their presets
    folders.forEach((presets, folderName) => {
      items.push({ name: folderName, isFolder: true, depth: 0 })
      presets.forEach(preset => {
        items.push({ name: preset, folder: folderName, isFolder: false, depth: 1 })
      })
    })

    // Add root presets
    rootPresets.forEach(preset => {
      items.push({ name: preset, isFolder: false, depth: 0 })
    })

    return items
  }

  const items = parsePresets()

  // Find selected item index in parsed list
  const getSelectedItemIndex = () => {
    if (config.selectedIndex < 0 || config.selectedIndex >= config.presets.length) return -1
    const selectedPreset = config.presets[config.selectedIndex]
    return items.findIndex(item =>
      !item.isFolder && (
        (item.folder ? `${item.folder}/${item.name}` : item.name) === selectedPreset
      )
    )
  }

  const selectedItemIndex = getSelectedItemIndex()

  return (
    <div
      className="presetbrowser-element"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: `${config.borderRadius}px`,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      {/* Search bar placeholder */}
      {config.showSearch && (
        <div
          style={{
            padding: '8px',
            borderBottom: `1px solid ${config.borderColor}`,
          }}
        >
          <div
            style={{
              backgroundColor: '#111827',
              border: `1px solid ${config.borderColor}`,
              borderRadius: 0,
              padding: '6px 10px',
              fontSize: '12px',
              color: '#6b7280',
            }}
          >
            Search presets...
          </div>
        </div>
      )}

      {/* Preset list container */}
      <div
        style={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Scrollable content */}
        <div
          ref={contentRef}
          className={`presetbrowser-content-${config.id?.replace(/-/g, '') || 'default'}`}
          style={{
            width: `calc(100% - ${scrollbarConfig.width}px)`,
            height: '100%',
            overflow: 'auto',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
        >
          {items.map((item, idx) => {
            const isSelected = idx === selectedItemIndex

            return (
              <div
                key={idx}
                style={{
                  height: `${config.itemHeight}px`,
                  display: 'flex',
                  alignItems: 'center',
                  paddingLeft: `${8 + item.depth * 16}px`,
                  paddingRight: '8px',
                  backgroundColor: isSelected ? config.selectedColor : config.itemColor,
                  color: isSelected ? config.selectedTextColor : config.textColor,
                  fontSize: `${config.fontSize}px`,
                  fontFamily: config.fontFamily,
                  fontWeight: config.fontWeight,
                  cursor: 'pointer',
                  userSelect: 'none',
                }}
              >
                {item.isFolder && (
                  <span style={{ marginRight: '6px', opacity: 0.7 }}>📁</span>
                )}
                {!item.isFolder && item.depth > 0 && (
                  <span style={{ marginRight: '6px', opacity: 0.5 }}>♪</span>
                )}
                {item.name}
              </div>
            )
          })}
        </div>

        {/* Custom scrollbar */}
        <CustomScrollbar
          contentRef={contentRef}
          config={scrollbarConfig}
          orientation="vertical"
        />

        {/* Hide webkit scrollbar */}
        <style>{`
          .presetbrowser-content-${config.id?.replace(/-/g, '') || 'default'}::-webkit-scrollbar {
            display: none;
            width: 0;
            height: 0;
          }
        `}</style>
      </div>
    </div>
  )
}
