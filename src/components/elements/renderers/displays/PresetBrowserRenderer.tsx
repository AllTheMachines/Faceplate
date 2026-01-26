import type { PresetBrowserElementConfig } from '../../../types/elements'

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

      {/* Preset list */}
      <div
        style={{
          flex: 1,
          overflow: 'auto',
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
    </div>
  )
}
