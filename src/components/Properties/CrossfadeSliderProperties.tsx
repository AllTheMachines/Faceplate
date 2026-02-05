import { CrossfadeSliderElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection, TextInput } from './'
import { FontFamilySelect, FontWeightSelect, ElementStyleSection } from './shared'
import { SELECT_CLASSNAME } from './constants'
import { useStore } from '../../store'
import { useLicense } from '../../hooks/useLicense'
import { LinearLayers } from '../../types/elementStyle'

interface CrossfadeSliderPropertiesProps {
  element: CrossfadeSliderElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function CrossfadeSliderProperties({ element, onUpdate }: CrossfadeSliderPropertiesProps) {
  const { isPro } = useLicense()
  const getElementStyle = useStore((state) => state.getElementStyle)

  return (
    <>
      {/* Style Section */}
      <PropertySection title="Style">
        <ElementStyleSection
          category="linear"
          currentStyleId={element.styleId}
          
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
        if (!style || style.category !== 'linear') return null

        const layerNames: Array<keyof LinearLayers> = ['thumb', 'track', 'fill']
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

      {/* A/B Labels */}
      <PropertySection title="A/B Labels">
        <div className="grid grid-cols-2 gap-3">
          <TextInput
            label="Label A"
            value={element.labelA}
            onChange={(labelA) => onUpdate({ labelA })}
          />
          <TextInput
            label="Label B"
            value={element.labelB}
            onChange={(labelB) => onUpdate({ labelB })}
          />
        </div>
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
          max={24}
        />
        <FontFamilySelect
          label="Label Font Family"
          value={element.labelFontFamily}
          onChange={(labelFontFamily) => onUpdate({ labelFontFamily })}
        />
        <FontWeightSelect
          label="Label Font Weight"
          value={element.labelFontWeight}
          onChange={(labelFontWeight) => onUpdate({ labelFontWeight: labelFontWeight as string })}
          valueType="string"
          fontFamily={element.labelFontFamily}
        />
      </PropertySection>

      {/* Value */}
      <PropertySection title="Value">
        <NumberInput
          label="Value"
          value={element.value}
          onChange={(value) => onUpdate({ value })}
          min={0}
          max={1}
          step={0.01}
        />
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

      {/* Track */}
      <PropertySection title="Track">
        <ColorInput
          label="Track Color"
          value={element.trackColor}
          onChange={(trackColor) => onUpdate({ trackColor })}
        />
        <ColorInput
          label="Track Fill Color"
          value={element.trackFillColor}
          onChange={(trackFillColor) => onUpdate({ trackFillColor })}
        />
      </PropertySection>

      {/* Thumb */}
      <PropertySection title="Thumb">
        <ColorInput
          label="Thumb Color"
          value={element.thumbColor}
          onChange={(thumbColor) => onUpdate({ thumbColor })}
        />
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Thumb Width"
            value={element.thumbWidth}
            onChange={(thumbWidth) => onUpdate({ thumbWidth })}
            min={10}
            max={50}
          />
          <NumberInput
            label="Thumb Height"
            value={element.thumbHeight}
            onChange={(thumbHeight) => onUpdate({ thumbHeight })}
            min={10}
            max={50}
          />
        </div>
      </PropertySection>
    </>
  )
}
