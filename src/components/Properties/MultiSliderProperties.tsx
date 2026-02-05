import { MultiSliderElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'
import { ElementStyleSection } from './shared'
import { SELECT_CLASSNAME } from './constants'
import { useStore } from '../../store'
import { useLicense } from '../../hooks/useLicense'
import { LinearLayers } from '../../types/elementStyle'

interface MultiSliderPropertiesProps {
  element: MultiSliderElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

// Preset band counts for common EQ configurations
const BAND_PRESETS = [
  { value: 3, label: '3 Bands' },
  { value: 4, label: '4 Bands' },
  { value: 5, label: '5 Bands' },
  { value: 7, label: '7 Bands' },
  { value: 10, label: '10 Bands' },
  { value: 31, label: '31 Bands' },
]

export function MultiSliderProperties({ element, onUpdate }: MultiSliderPropertiesProps) {
  const { isPro } = useLicense()
  const getStylesByCategory = useStore((state) => state.getStylesByCategory)
  const getElementStyle = useStore((state) => state.getElementStyle)
  const linearStyles = getStylesByCategory('linear')

  const isPresetBandCount = BAND_PRESETS.some(p => p.value === element.bandCount)

  // Update band count and resize bandValues array accordingly
  const handleBandCountChange = (newCount: number) => {
    const clampedCount = Math.max(1, Math.min(32, newCount))
    const currentValues = element.bandValues || []
    let newValues: number[]

    if (clampedCount > currentValues.length) {
      // Add new bands with default value 0.5
      newValues = [...currentValues, ...Array(clampedCount - currentValues.length).fill(0.5)]
    } else {
      // Remove excess bands
      newValues = currentValues.slice(0, clampedCount)
    }

    onUpdate({
      bandCount: clampedCount,
      bandValues: newValues,
    })
  }

  return (
    <>
      {/* Style Section */}
      <PropertySection title="Style">
        <div>
          <label className="block text-xs text-gray-400 mb-1">SVG Style (shared by all bands)</label>
          <ElementStyleSection
            category="linear"
            currentStyleId={element.styleId}
            styles={linearStyles}
            onStyleChange={(styleId) => onUpdate({
              styleId,
              colorOverrides: styleId ? element.colorOverrides : undefined
            })}
            isPro={isPro}
          />
        </div>
      </PropertySection>

      {/* Color Overrides - only when SVG style selected */}
      {isPro && element.styleId && (() => {
        const style = getElementStyle(element.styleId)
        if (!style || style.category !== 'linear') return null

        const layerNames: Array<keyof LinearLayers> = ['thumb', 'track', 'fill']
        const existingLayers = layerNames.filter((layerName) => style.layers[layerName])

        if (existingLayers.length === 0) return null

        return (
          <PropertySection title="Color Overrides">
            <p className="text-xs text-gray-500 mb-2">Applied to all bands</p>
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

      {/* Band Configuration */}
      <PropertySection title="Band Configuration">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Band Count Preset</label>
          <select
            value={isPresetBandCount ? element.bandCount : 'custom'}
            onChange={(e) => {
              const value = e.target.value
              if (value !== 'custom') {
                handleBandCountChange(parseInt(value, 10))
              }
            }}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {BAND_PRESETS.map(preset => (
              <option key={preset.value} value={preset.value}>{preset.label}</option>
            ))}
            <option value="custom">Custom</option>
          </select>
        </div>

        {!isPresetBandCount && (
          <NumberInput
            label="Custom Band Count"
            value={element.bandCount}
            onChange={handleBandCountChange}
            min={1}
            max={32}
          />
        )}

        <NumberInput
          label="Band Gap (px)"
          value={element.bandGap}
          onChange={(bandGap) => onUpdate({ bandGap })}
          min={0}
          max={10}
        />
      </PropertySection>

      {/* Label Style */}
      <PropertySection title="Labels">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Label Style</label>
          <select
            value={element.labelStyle}
            onChange={(e) =>
              onUpdate({
                labelStyle: e.target.value as MultiSliderElementConfig['labelStyle'],
              })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="index">Index Numbers (1, 2, 3...)</option>
            <option value="frequency">Frequency Labels</option>
            <option value="hidden">Hidden</option>
          </select>
        </div>

        {element.labelStyle !== 'hidden' && (
          <>
            <ColorInput
              label="Label Color"
              value={element.labelColor}
              onChange={(labelColor) => onUpdate({ labelColor })}
            />
            <NumberInput
              label="Label Font Size"
              value={element.labelFontSize}
              onChange={(labelFontSize) => onUpdate({ labelFontSize })}
              min={8}
              max={16}
            />
          </>
        )}
      </PropertySection>

      {/* Link Mode */}
      <PropertySection title="Link Mode">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Band Linking</label>
          <select
            value={element.linkMode}
            onChange={(e) =>
              onUpdate({
                linkMode: e.target.value as MultiSliderElementConfig['linkMode'],
              })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="independent">Independent</option>
            <option value="modifier-linked">Modifier Linked (Alt/Option)</option>
            <option value="always-linked">Always Linked</option>
          </select>
        </div>
        <p className="text-xs text-gray-500 mt-1">
          Link mode defines runtime behavior in the plugin
        </p>
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Track Color"
          value={element.trackColor}
          onChange={(trackColor) => onUpdate({ trackColor })}
        />
        <ColorInput
          label="Fill Color"
          value={element.fillColor}
          onChange={(fillColor) => onUpdate({ fillColor })}
        />
        <ColorInput
          label="Thumb Color"
          value={element.thumbColor}
          onChange={(thumbColor) => onUpdate({ thumbColor })}
        />
      </PropertySection>

      {/* Value Range */}
      <PropertySection title="Value Range">
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Min"
            value={element.min}
            onChange={(min) => onUpdate({ min })}
            step={0.01}
          />
          <NumberInput
            label="Max"
            value={element.max}
            onChange={(max) => onUpdate({ max })}
            step={0.01}
          />
        </div>
      </PropertySection>

      {/* Band Info (read-only summary) */}
      <PropertySection title="Band Values">
        <div className="text-sm text-gray-400">
          <p>Bands: {element.bandCount}</p>
          <p className="text-xs mt-1 text-gray-500">
            Values are set via interaction at runtime
          </p>
        </div>
      </PropertySection>
    </>
  )
}
