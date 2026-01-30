import { AsciiSliderElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'

const FONT_WEIGHTS = [
  { value: 100, label: 'Thin' },
  { value: 200, label: 'Extra Light' },
  { value: 300, label: 'Light' },
  { value: 400, label: 'Regular' },
  { value: 500, label: 'Medium' },
  { value: 600, label: 'Semi Bold' },
  { value: 700, label: 'Bold' },
  { value: 800, label: 'Extra Bold' },
  { value: 900, label: 'Black' },
] as const

const MONOSPACE_FONTS = [
  { value: 'Courier New, Consolas, monospace', label: 'Courier New' },
  { value: 'Consolas, Monaco, monospace', label: 'Consolas' },
  { value: 'Monaco, Courier New, monospace', label: 'Monaco' },
  { value: '"Lucida Console", Monaco, monospace', label: 'Lucida Console' },
  { value: '"Source Code Pro", monospace', label: 'Source Code Pro' },
  { value: '"Fira Code", monospace', label: 'Fira Code' },
  { value: '"JetBrains Mono", monospace', label: 'JetBrains Mono' },
  { value: 'monospace', label: 'System Monospace' },
] as const

const VALUE_POSITIONS = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
  { value: 'above', label: 'Above' },
  { value: 'below', label: 'Below' },
  { value: 'inside', label: 'Inside Bar' },
] as const

const VALUE_FORMATS = [
  { value: 'percentage', label: 'Percentage' },
  { value: 'numeric', label: 'Numeric' },
  { value: 'custom', label: 'Custom' },
] as const

const TEXT_ALIGNMENTS = [
  { value: 'left', label: 'Left' },
  { value: 'center', label: 'Center' },
  { value: 'right', label: 'Right' },
] as const

const LABEL_POSITIONS = [
  { value: 'left', label: 'Left' },
  { value: 'right', label: 'Right' },
] as const

interface AsciiSliderPropertiesProps {
  element: AsciiSliderElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function AsciiSliderProperties({ element, onUpdate }: AsciiSliderPropertiesProps) {
  // Calculate preview
  const range = element.max - element.min
  const normalizedValue = range > 0 ? (element.value - element.min) / range : 0
  const filledCount = Math.round(normalizedValue * element.barWidth)
  const emptyCount = element.barWidth - filledCount
  const bar = `${element.leftBracket}${element.filledChar.repeat(filledCount)}${element.emptyChar.repeat(emptyCount)}${element.rightBracket}`

  return (
    <>
      {/* Value */}
      <PropertySection title="Value">
        <NumberInput
          label="Current Value"
          value={element.value}
          onChange={(value) => onUpdate({ value })}
          min={element.min}
          max={element.max}
          step={0.01}
        />
        <NumberInput
          label="Min"
          value={element.min}
          onChange={(min) => onUpdate({ min })}
        />
        <NumberInput
          label="Max"
          value={element.max}
          onChange={(max) => onUpdate({ max })}
        />
      </PropertySection>

      {/* Label */}
      <PropertySection title="Label">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showLabel"
            checked={element.showLabel}
            onChange={(e) => onUpdate({ showLabel: e.target.checked })}
            className="rounded bg-gray-700 border-gray-600"
          />
          <label htmlFor="showLabel" className="text-xs text-gray-400">
            Show Label
          </label>
        </div>
        {element.showLabel && (
          <>
            <TextInput
              label="Label Text"
              value={element.labelText}
              onChange={(labelText) => onUpdate({ labelText })}
            />
            <div>
              <label className="block text-xs text-gray-400 mb-1">Label Position</label>
              <select
                value={element.labelPosition}
                onChange={(e) =>
                  onUpdate({ labelPosition: e.target.value as AsciiSliderElementConfig['labelPosition'] })
                }
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
              >
                {LABEL_POSITIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </PropertySection>

      {/* Bar Characters */}
      <PropertySection title="Bar Characters">
        <NumberInput
          label="Bar Width (chars)"
          value={element.barWidth}
          onChange={(barWidth) => onUpdate({ barWidth })}
          min={5}
          max={50}
        />
        <TextInput
          label="Filled Character"
          value={element.filledChar}
          onChange={(filledChar) => onUpdate({ filledChar: filledChar.slice(0, 1) || '#' })}
        />
        <TextInput
          label="Empty Character"
          value={element.emptyChar}
          onChange={(emptyChar) => onUpdate({ emptyChar: emptyChar.slice(0, 1) || '-' })}
        />
        <TextInput
          label="Left Bracket"
          value={element.leftBracket}
          onChange={(leftBracket) => onUpdate({ leftBracket: leftBracket.slice(0, 1) || '[' })}
        />
        <TextInput
          label="Right Bracket"
          value={element.rightBracket}
          onChange={(rightBracket) => onUpdate({ rightBracket: rightBracket.slice(0, 1) || ']' })}
        />
      </PropertySection>

      {/* Labels */}
      <PropertySection title="Labels">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showMinMax"
            checked={element.showMinMax}
            onChange={(e) => onUpdate({ showMinMax: e.target.checked })}
            className="rounded bg-gray-700 border-gray-600"
          />
          <label htmlFor="showMinMax" className="text-xs text-gray-400">
            Show Min/Max Labels
          </label>
        </div>
        {element.showMinMax && (
          <>
            <TextInput
              label="Min Label"
              value={element.minLabel}
              onChange={(minLabel) => onUpdate({ minLabel })}
            />
            <TextInput
              label="Max Label"
              value={element.maxLabel}
              onChange={(maxLabel) => onUpdate({ maxLabel })}
            />
          </>
        )}
      </PropertySection>

      {/* Value Display */}
      <PropertySection title="Value Display">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="showValue"
            checked={element.showValue}
            onChange={(e) => onUpdate({ showValue: e.target.checked })}
            className="rounded bg-gray-700 border-gray-600"
          />
          <label htmlFor="showValue" className="text-xs text-gray-400">
            Show Value
          </label>
        </div>
        {element.showValue && (
          <>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Value Position</label>
              <select
                value={element.valuePosition}
                onChange={(e) =>
                  onUpdate({ valuePosition: e.target.value as AsciiSliderElementConfig['valuePosition'] })
                }
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
              >
                {VALUE_POSITIONS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-400 mb-1">Value Format</label>
              <select
                value={element.valueFormat}
                onChange={(e) =>
                  onUpdate({ valueFormat: e.target.value as AsciiSliderElementConfig['valueFormat'] })
                }
                className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
              >
                {VALUE_FORMATS.map(({ value, label }) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            {element.valueFormat === 'custom' && (
              <TextInput
                label="Value Suffix"
                value={element.valueSuffix}
                onChange={(valueSuffix) => onUpdate({ valueSuffix })}
              />
            )}
            {element.valueFormat !== 'percentage' && (
              <NumberInput
                label="Decimal Places"
                value={element.valueDecimalPlaces}
                onChange={(valueDecimalPlaces) => onUpdate({ valueDecimalPlaces })}
                min={0}
                max={6}
              />
            )}
          </>
        )}
      </PropertySection>

      {/* Typography */}
      <PropertySection title="Typography">
        <NumberInput
          label="Font Size"
          value={element.fontSize}
          onChange={(fontSize) => onUpdate({ fontSize })}
          min={8}
          max={48}
        />
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Family</label>
          <select
            value={element.fontFamily}
            onChange={(e) => onUpdate({ fontFamily: e.target.value })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {MONOSPACE_FONTS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-gray-400 mb-1">Font Weight</label>
          <select
            value={element.fontWeight}
            onChange={(e) => onUpdate({ fontWeight: Number(e.target.value) })}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {FONT_WEIGHTS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <ColorInput
          label="Text Color"
          value={element.textColor}
          onChange={(textColor) => onUpdate({ textColor })}
        />
      </PropertySection>

      {/* Container */}
      <PropertySection title="Container">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Text Alignment</label>
          <select
            value={element.textAlign || 'left'}
            onChange={(e) =>
              onUpdate({ textAlign: e.target.value as AsciiSliderElementConfig['textAlign'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            {TEXT_ALIGNMENTS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <NumberInput
          label="Padding"
          value={element.padding}
          onChange={(padding) => onUpdate({ padding })}
          min={0}
          max={50}
        />
        <NumberInput
          label="Border Radius"
          value={element.borderRadius}
          onChange={(borderRadius) => onUpdate({ borderRadius })}
          min={0}
          max={20}
        />
        <NumberInput
          label="Border Width"
          value={element.borderWidth}
          onChange={(borderWidth) => onUpdate({ borderWidth })}
          min={0}
          max={10}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
      </PropertySection>

      {/* Interaction */}
      <PropertySection title="Interaction">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={element.selectable ?? false}
            onChange={(e) => onUpdate({ selectable: e.target.checked })}
            className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-300">Allow text selection</span>
        </label>
      </PropertySection>

      {/* Preview */}
      <PropertySection title="Preview">
        <div
          className="w-full border border-gray-600 rounded p-2"
          style={{
            fontFamily: element.fontFamily,
            fontSize: `${element.fontSize}px`,
            fontWeight: element.fontWeight,
            color: element.textColor,
            backgroundColor: element.backgroundColor === 'transparent' ? '#1f2937' : element.backgroundColor,
            whiteSpace: 'pre',
            textAlign: element.textAlign || 'left',
          }}
        >
          {element.showLabel && element.labelPosition === 'left' && `${element.labelText} `}
          {element.showMinMax && `${element.minLabel} `}
          {element.showValue && element.valuePosition === 'left' && `${Math.round(normalizedValue * 100)}% `}
          {bar}
          {element.showValue && element.valuePosition === 'right' && ` ${Math.round(normalizedValue * 100)}%`}
          {element.showMinMax && ` ${element.maxLabel}`}
          {element.showLabel && element.labelPosition === 'right' && ` ${element.labelText}`}
        </div>
      </PropertySection>
    </>
  )
}
