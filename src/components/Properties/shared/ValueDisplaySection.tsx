import { NumberInput, ColorInput, PropertySection, TextInput } from '../'
import { PositionSelect } from './PositionSelect'
import { FontFamilySelect } from './FontFamilySelect'
import { FontWeightSelect } from './FontWeightSelect'
import { VALUE_FORMAT_OPTIONS, SELECT_CLASSNAME } from '../constants'

interface ValueDisplaySectionProps {
  showValue: boolean
  valuePosition: string
  valueDistance?: number
  valueFormat: string
  valueSuffix?: string
  valueDecimalPlaces: number
  valueFontSize: number
  valueColor: string
  onShowValueChange: (show: boolean) => void
  onValuePositionChange: (position: string) => void
  onValueDistanceChange?: (distance: number) => void
  onValueFormatChange: (format: string) => void
  onValueSuffixChange?: (suffix: string) => void
  onValueDecimalPlacesChange: (places: number) => void
  onValueFontSizeChange: (size: number) => void
  onValueColorChange: (color: string) => void
  // Optional font family and weight props (only SliderProperties uses these)
  valueFontFamily?: string
  valueFontWeight?: string
  onValueFontFamilyChange?: (family: string) => void
  onValueFontWeightChange?: (weight: string) => void
}

export function ValueDisplaySection({
  showValue,
  valuePosition,
  valueDistance,
  valueFormat,
  valueSuffix = '',
  valueDecimalPlaces,
  valueFontSize,
  valueColor,
  onShowValueChange,
  onValuePositionChange,
  onValueDistanceChange,
  onValueFormatChange,
  onValueSuffixChange,
  onValueDecimalPlacesChange,
  onValueFontSizeChange,
  onValueColorChange,
  valueFontFamily,
  valueFontWeight,
  onValueFontFamilyChange,
  onValueFontWeightChange,
}: ValueDisplaySectionProps) {
  const hasFullFontControls =
    valueFontFamily !== undefined &&
    valueFontWeight !== undefined &&
    onValueFontFamilyChange !== undefined &&
    onValueFontWeightChange !== undefined

  return (
    <PropertySection title="Value Display">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showValue}
          onChange={(e) => onShowValueChange(e.target.checked)}
          className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-300">Show Value</span>
      </label>
      {showValue && (
        <>
          <PositionSelect value={valuePosition} onChange={onValuePositionChange} />
          <div>
            <label className="block text-xs text-gray-400 mb-1">Format</label>
            <select
              value={valueFormat}
              onChange={(e) => onValueFormatChange(e.target.value)}
              className={SELECT_CLASSNAME}
            >
              {VALUE_FORMAT_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          {valueFormat === 'custom' && onValueSuffixChange && (
            <TextInput label="Suffix" value={valueSuffix} onChange={onValueSuffixChange} />
          )}
          {hasFullFontControls && (
            <>
              <FontFamilySelect value={valueFontFamily!} onChange={onValueFontFamilyChange!} />
              <FontWeightSelect
                value={valueFontWeight!}
                onChange={(val) => onValueFontWeightChange!(val as string)}
                variant="compact"
                valueType="string"
              />
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="Decimal Places"
              value={valueDecimalPlaces}
              onChange={onValueDecimalPlacesChange}
              min={0}
              max={4}
            />
            <NumberInput
              label="Font Size"
              value={valueFontSize}
              onChange={onValueFontSizeChange}
              min={8}
              max={32}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            {onValueDistanceChange && (
              <NumberInput
                label="Distance"
                value={valueDistance ?? 4}
                onChange={onValueDistanceChange}
                min={0}
                max={50}
              />
            )}
            <ColorInput label="Color" value={valueColor} onChange={onValueColorChange} />
          </div>
        </>
      )}
    </PropertySection>
  )
}
