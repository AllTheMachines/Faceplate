import { PropertySection } from './PropertySection'
import { NumberInput } from './NumberInput'
import { ColorInput } from './ColorInput'
import { ScrollbarStyleSection } from './shared/ScrollbarStyleSection'
import { AVAILABLE_FONTS } from '../../services/fonts/fontRegistry'
import type { PresetBrowserElementConfig, ElementConfig } from '../../types/elements'

interface PresetBrowserPropertiesProps {
  element: PresetBrowserElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function PresetBrowserProperties({ element, onUpdate }: PresetBrowserPropertiesProps) {
  const handlePresetsChange = (text: string) => {
    const presets = text.split('\n').filter(line => line.trim() !== '')
    onUpdate({ presets })
  }

  return (
    <>
      <PropertySection title="Presets">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Presets (one per line, use Folder/Name for hierarchy)</label>
          <textarea
            value={element.presets.join('\n')}
            onChange={(e) => handlePresetsChange(e.target.value)}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
            rows={6}
            placeholder="Factory/Init&#10;Factory/Bass&#10;User/My Preset"
          />
        </div>
        <NumberInput
          label="Selected Index"
          value={element.selectedIndex}
          onChange={(selectedIndex) => onUpdate({ selectedIndex })}
          min={0}
          max={Math.max(0, element.presets.length - 1)}
        />
      </PropertySection>

      <PropertySection title="Display">
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={element.showFolders}
            onChange={(e) => onUpdate({ showFolders: e.target.checked })}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-gray-300">Show Folders</span>
        </label>
        <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
          <input
            type="checkbox"
            checked={element.showSearch}
            onChange={(e) => onUpdate({ showSearch: e.target.checked })}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-gray-300">Show Search Bar</span>
        </label>
      </PropertySection>

      <PropertySection title="Item Styling">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Family</label>
          <select
            value={element.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {AVAILABLE_FONTS.map((font) => (
              <option key={font.family} value={font.family}>
                {font.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Weight</label>
          <select
            value={element.fontWeight}
            onChange={(e) => onUpdate({ fontWeight: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="300">Light (300)</option>
            <option value="400">Regular (400)</option>
            <option value="500">Medium (500)</option>
            <option value="600">Semi-Bold (600)</option>
            <option value="700">Bold (700)</option>
          </select>
        </div>
        <NumberInput
          label="Font Size"
          value={element.fontSize}
          onChange={(fontSize) => onUpdate({ fontSize })}
          min={10}
          max={18}
        />
        <NumberInput
          label="Item Height"
          value={element.itemHeight}
          onChange={(itemHeight) => onUpdate({ itemHeight })}
          min={20}
          max={40}
        />
        <ColorInput
          label="Text Color"
          value={element.textColor}
          onChange={(textColor) => onUpdate({ textColor })}
        />
        <ColorInput
          label="Selected Color"
          value={element.selectedColor}
          onChange={(selectedColor) => onUpdate({ selectedColor })}
        />
        <ColorInput
          label="Selected Text"
          value={element.selectedTextColor}
          onChange={(selectedTextColor) => onUpdate({ selectedTextColor })}
        />
      </PropertySection>

      <PropertySection title="Appearance">
        <ColorInput
          label="Background"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
        <NumberInput
          label="Border Radius"
          value={element.borderRadius}
          onChange={(borderRadius) => onUpdate({ borderRadius })}
          min={0}
          max={16}
        />
      </PropertySection>

      <ScrollbarStyleSection config={element} onUpdate={onUpdate} />
    </>
  )
}
