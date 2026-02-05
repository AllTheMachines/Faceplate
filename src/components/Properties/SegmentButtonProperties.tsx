import { useCallback } from 'react'
import {
  SegmentButtonElementConfig,
  SegmentConfig,
  ElementConfig,
} from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'
import { ElementStyleSection } from './shared'
import { BuiltInIcon } from '../../utils/builtInIcons'
import { useStore } from '../../store'
import { useLicense } from '../../hooks/useLicense'
import { ButtonLayers } from '../../types/elementStyle'

interface SegmentButtonPropertiesProps {
  element: SegmentButtonElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

// Group icons by category for the dropdown
const iconCategories = {
  Transport: [
    BuiltInIcon.Play,
    BuiltInIcon.Pause,
    BuiltInIcon.Stop,
    BuiltInIcon.Record,
    BuiltInIcon.Loop,
    BuiltInIcon.SkipForward,
    BuiltInIcon.SkipBackward,
  ],
  Common: [
    BuiltInIcon.Mute,
    BuiltInIcon.Solo,
    BuiltInIcon.Bypass,
    BuiltInIcon.Power,
    BuiltInIcon.Settings,
    BuiltInIcon.Reset,
    BuiltInIcon.Save,
    BuiltInIcon.Load,
  ],
  Audio: [
    BuiltInIcon.Waveform,
    BuiltInIcon.Spectrum,
    BuiltInIcon.Midi,
    BuiltInIcon.Sync,
    BuiltInIcon.Link,
    BuiltInIcon.EQ,
    BuiltInIcon.Compressor,
    BuiltInIcon.Reverb,
    BuiltInIcon.Delay,
    BuiltInIcon.Filter,
  ],
  Additional: [
    BuiltInIcon.Add,
    BuiltInIcon.Remove,
    BuiltInIcon.Edit,
    BuiltInIcon.Copy,
    BuiltInIcon.Paste,
    BuiltInIcon.Undo,
    BuiltInIcon.Redo,
    BuiltInIcon.Help,
    BuiltInIcon.Info,
    BuiltInIcon.Warning,
  ],
}

// Format icon name for display
function formatIconName(icon: BuiltInIcon): string {
  return icon
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function SegmentButtonProperties({
  element,
  onUpdate,
}: SegmentButtonPropertiesProps) {
  const { isPro } = useLicense()
  const assets = useStore((state) => state.assets)
  const getStylesByCategory = useStore((state) => state.getStylesByCategory)
  const getElementStyle = useStore((state) => state.getElementStyle)
  const buttonStyles = getStylesByCategory('button')
  const svgAssets = assets.filter(
    (asset) => asset.categories.includes('icon') || asset.categories.includes('decoration')
  )

  // Handle segment count change
  const handleSegmentCountChange = useCallback(
    (newCount: number) => {
      const currentSegments = [...element.segments]
      let newSegments: SegmentConfig[]

      if (newCount > currentSegments.length) {
        // Add new segments with default config
        newSegments = [...currentSegments]
        for (let i = currentSegments.length; i < newCount; i++) {
          newSegments.push({ displayMode: 'text', text: `${i + 1}` })
        }
      } else {
        // Remove segments from end
        newSegments = currentSegments.slice(0, newCount)
      }

      // Also update selectedIndices to remove any out-of-bounds selections
      const newSelectedIndices = element.selectedIndices.filter((i) => i < newCount)
      if (newSelectedIndices.length === 0 && element.selectionMode === 'single') {
        newSelectedIndices.push(0)
      }

      onUpdate({
        segmentCount: newCount,
        segments: newSegments,
        selectedIndices: newSelectedIndices,
      })
    },
    [element.segments, element.selectedIndices, element.selectionMode, onUpdate]
  )

  // Update a single segment
  const updateSegment = useCallback(
    (index: number, updates: Partial<SegmentConfig>) => {
      const newSegments = element.segments.map((seg, i) =>
        i === index ? { ...seg, ...updates } : seg
      )
      onUpdate({ segments: newSegments })
    },
    [element.segments, onUpdate]
  )

  // Toggle segment selection
  const toggleSegmentSelection = useCallback(
    (index: number) => {
      let newSelectedIndices: number[]

      if (element.selectionMode === 'single') {
        newSelectedIndices = [index]
      } else {
        // Multi-select
        if (element.selectedIndices.includes(index)) {
          newSelectedIndices = element.selectedIndices.filter((i) => i !== index)
        } else {
          newSelectedIndices = [...element.selectedIndices, index]
        }
      }

      onUpdate({ selectedIndices: newSelectedIndices })
    },
    [element.selectionMode, element.selectedIndices, onUpdate]
  )

  return (
    <>
      {/* Style Section */}
      <PropertySection title="Style">
        <ElementStyleSection
          category="button"
          currentStyleId={element.styleId}
          styles={buttonStyles}
          onStyleChange={(styleId) => onUpdate({
            styleId,
            colorOverrides: styleId ? element.colorOverrides : undefined
          })}
          isPro={isPro}
        />
      </PropertySection>

      {/* Color Overrides - only when SVG style selected */}
      {isPro && element.styleId && (() => {
        const style = getElementStyle(element.styleId)
        if (!style || style.category !== 'button') return null

        const layerNames: Array<keyof ButtonLayers> = ['base', 'highlight']
        const existingLayers = layerNames.filter((layerName) => style.layers[layerName])

        if (existingLayers.length === 0) return null

        return (
          <PropertySection title="Color Overrides">
            {existingLayers.map((layerName) => (
              <ColorInput
                key={layerName}
                label={layerName.charAt(0).toUpperCase() + layerName.slice(1)}
                value={element.colorOverrides?.[layerName] || ''}
                onChange={(color) => {
                  const newOverrides = { ...element.colorOverrides }
                  if (color) {
                    newOverrides[layerName] = color
                  } else {
                    delete newOverrides[layerName]
                  }
                  onUpdate({ colorOverrides: newOverrides })
                }}
              />
            ))}
            <button
              onClick={() => onUpdate({ colorOverrides: undefined })}
              className="w-full text-left text-sm text-red-400 hover:text-red-300 mt-1"
            >
              Reset to Original Colors
            </button>
          </PropertySection>
        )
      })()}

      {/* Segment Count */}
      <PropertySection title="Segment Count">
        <NumberInput
          label="Number of Segments"
          value={element.segmentCount}
          onChange={handleSegmentCountChange}
          min={2}
          max={8}
        />
      </PropertySection>

      {/* Selection */}
      <PropertySection title="Selection">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Selection Mode</label>
          <select
            value={element.selectionMode}
            onChange={(e) =>
              onUpdate({
                selectionMode: e.target.value as SegmentButtonElementConfig['selectionMode'],
              })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="single">Single</option>
            <option value="multi">Multi</option>
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Selected</label>
          <div className="text-sm text-gray-300">
            {element.selectedIndices.length > 0
              ? element.selectedIndices.map((i) => i + 1).join(', ')
              : 'None'}
          </div>
        </div>
      </PropertySection>

      {/* Orientation */}
      <PropertySection title="Orientation">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Layout</label>
          <select
            value={element.orientation}
            onChange={(e) =>
              onUpdate({
                orientation: e.target.value as SegmentButtonElementConfig['orientation'],
              })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </div>
      </PropertySection>

      {/* Segments */}
      <PropertySection title="Segments">
        {element.segments.map((segment, index) => (
          <div key={index} className="border border-gray-600 rounded p-2 mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-300">Segment {index + 1}</span>
              <label className="flex items-center gap-1 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={element.selectedIndices.includes(index)}
                  onChange={() => toggleSegmentSelection(index)}
                  className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
                />
                <span className="text-xs text-gray-400">Selected</span>
              </label>
            </div>

            <div className="space-y-2">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Display Mode</label>
                <select
                  value={segment.displayMode}
                  onChange={(e) =>
                    updateSegment(index, {
                      displayMode: e.target.value as SegmentConfig['displayMode'],
                    })
                  }
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
                >
                  <option value="icon">Icon Only</option>
                  <option value="text">Text Only</option>
                  <option value="icon-text">Icon + Text</option>
                </select>
              </div>

              {(segment.displayMode === 'icon' || segment.displayMode === 'icon-text') && (
                <>
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Icon Source</label>
                    <select
                      value={segment.iconSource || 'builtin'}
                      onChange={(e) =>
                        updateSegment(index, {
                          iconSource: e.target.value as SegmentConfig['iconSource'],
                        })
                      }
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
                    >
                      <option value="builtin">Built-In</option>
                      <option value="asset">Asset Library</option>
                    </select>
                  </div>

                  {segment.iconSource !== 'asset' && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Built-In Icon</label>
                      <select
                        value={segment.builtInIcon || BuiltInIcon.Play}
                        onChange={(e) =>
                          updateSegment(index, { builtInIcon: e.target.value })
                        }
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
                      >
                        {Object.entries(iconCategories).map(([category, icons]) => (
                          <optgroup key={category} label={category}>
                            {icons.map((icon) => (
                              <option key={icon} value={icon}>
                                {formatIconName(icon)}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  )}

                  {segment.iconSource === 'asset' && (
                    <div>
                      <label className="block text-xs text-gray-400 mb-1">Asset</label>
                      <select
                        value={segment.assetId || ''}
                        onChange={(e) => updateSegment(index, { assetId: e.target.value })}
                        className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
                      >
                        <option value="">Select an asset...</option>
                        {svgAssets.map((asset) => (
                          <option key={asset.id} value={asset.id}>
                            {asset.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </>
              )}

              {(segment.displayMode === 'text' || segment.displayMode === 'icon-text') && (
                <TextInput
                  label="Text"
                  value={segment.text || ''}
                  onChange={(text) => updateSegment(index, { text })}
                />
              )}
            </div>
          </div>
        ))}
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Selected Color"
          value={element.selectedColor}
          onChange={(selectedColor) => onUpdate({ selectedColor })}
        />
        <ColorInput
          label="Text Color"
          value={element.textColor}
          onChange={(textColor) => onUpdate({ textColor })}
        />
        <ColorInput
          label="Selected Text Color"
          value={element.selectedTextColor}
          onChange={(selectedTextColor) => onUpdate({ selectedTextColor })}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
      </PropertySection>

      {/* Icon Style */}
      <PropertySection title="Icon Style">
        <NumberInput
          label="Icon Size"
          value={element.iconSize ?? 16}
          onChange={(iconSize) => onUpdate({ iconSize })}
          min={8}
          max={48}
          step={1}
        />
        <ColorInput
          label="Icon Color"
          value={element.iconColor ?? '#888888'}
          onChange={(iconColor) => onUpdate({ iconColor })}
        />
        <ColorInput
          label="Selected Icon Color"
          value={element.selectedIconColor ?? '#ffffff'}
          onChange={(selectedIconColor) => onUpdate({ selectedIconColor })}
        />
      </PropertySection>
    </>
  )
}
