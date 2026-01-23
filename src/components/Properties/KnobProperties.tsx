import { KnobElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface KnobPropertiesProps {
  element: KnobElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function KnobProperties({ element, onUpdate }: KnobPropertiesProps) {
  return (
    <>
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

      {/* Arc Geometry */}
      <PropertySection title="Arc Geometry">
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="Start Angle"
            value={element.startAngle}
            onChange={(startAngle) => onUpdate({ startAngle })}
            min={-180}
            max={180}
          />
          <NumberInput
            label="End Angle"
            value={element.endAngle}
            onChange={(endAngle) => onUpdate({ endAngle })}
            min={-180}
            max={180}
          />
        </div>
        <NumberInput
          label="Track Width"
          value={element.trackWidth}
          onChange={(trackWidth) => onUpdate({ trackWidth })}
          min={1}
          max={20}
        />
      </PropertySection>

      {/* Style */}
      <PropertySection title="Style">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Style</label>
          <select
            value={element.style}
            onChange={(e) =>
              onUpdate({ style: e.target.value as KnobElementConfig['style'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="arc">Arc</option>
            <option value="filled">Filled</option>
            <option value="dot">Dot</option>
            <option value="line">Line</option>
          </select>
        </div>
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
          label="Indicator Color"
          value={element.indicatorColor}
          onChange={(indicatorColor) => onUpdate({ indicatorColor })}
        />
      </PropertySection>
    </>
  )
}
