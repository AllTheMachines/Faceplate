import { TooltipElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, TextInput, PropertySection } from './'

interface TooltipPropertiesProps {
  element: TooltipElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function TooltipProperties({ element, onUpdate }: TooltipPropertiesProps) {
  return (
    <>
      {/* Content */}
      <PropertySection title="Content">
        <div className="space-y-2">
          <label className="block text-sm text-gray-300">Tooltip Text (HTML)</label>
          <textarea
            value={element.content}
            onChange={(e) => onUpdate({ content: e.target.value })}
            className="w-full px-2 py-1 text-sm bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={3}
            placeholder="<p>Tooltip text</p>"
          />
          <p className="text-xs text-gray-500">Supports HTML tags (e.g., &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;)</p>
        </div>
      </PropertySection>

      {/* Trigger & Timing */}
      <PropertySection title="Trigger & Timing">
        <NumberInput
          label="Hover Delay (ms)"
          value={element.hoverDelay}
          onChange={(hoverDelay) => onUpdate({ hoverDelay })}
          min={100}
          max={2000}
          step={50}
        />
      </PropertySection>

      {/* Position */}
      <PropertySection title="Position">
        <div className="space-y-2">
          <label className="block text-sm text-gray-300">Position</label>
          <select
            value={element.position}
            onChange={(e) => onUpdate({ position: e.target.value as TooltipElementConfig['position'] })}
            className="w-full px-2 py-1 text-sm bg-gray-700 text-gray-100 border border-gray-600 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="top">Top</option>
            <option value="bottom">Bottom</option>
            <option value="left">Left</option>
            <option value="right">Right</option>
          </select>
        </div>

        <NumberInput
          label="Offset (px)"
          value={element.offset}
          onChange={(offset) => onUpdate({ offset })}
          min={0}
          max={50}
        />

        <div className="space-y-2">
          <label className="flex items-center text-sm text-gray-300">
            <input
              type="checkbox"
              checked={element.showArrow}
              onChange={(e) => onUpdate({ showArrow: e.target.checked })}
              className="mr-2"
            />
            Show Arrow
          </label>
        </div>
      </PropertySection>

      {/* Styling */}
      <PropertySection title="Styling">
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Text Color"
          value={element.textColor}
          onChange={(textColor) => onUpdate({ textColor })}
        />
        <NumberInput
          label="Font Size"
          value={element.fontSize}
          onChange={(fontSize) => onUpdate({ fontSize })}
          min={8}
          max={24}
        />
        <NumberInput
          label="Padding"
          value={element.padding}
          onChange={(padding) => onUpdate({ padding })}
          min={0}
          max={30}
        />
        <NumberInput
          label="Border Radius"
          value={element.borderRadius}
          onChange={(borderRadius) => onUpdate({ borderRadius })}
          min={0}
          max={20}
        />
        <NumberInput
          label="Max Width"
          value={element.maxWidth}
          onChange={(maxWidth) => onUpdate({ maxWidth })}
          min={100}
          max={500}
        />
      </PropertySection>
    </>
  )
}
