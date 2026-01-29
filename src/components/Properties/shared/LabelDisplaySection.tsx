import { NumberInput, ColorInput, PropertySection, TextInput } from '../'
import { PositionSelect } from './PositionSelect'
import { FontFamilySelect } from './FontFamilySelect'
import { FontWeightSelect } from './FontWeightSelect'

interface LabelDisplaySectionProps {
  showLabel: boolean
  labelText: string
  labelPosition: string
  labelDistance?: number
  labelFontSize: number
  labelColor: string
  onShowLabelChange: (show: boolean) => void
  onLabelTextChange: (text: string) => void
  onLabelPositionChange: (position: string) => void
  onLabelDistanceChange?: (distance: number) => void
  onLabelFontSizeChange: (size: number) => void
  onLabelColorChange: (color: string) => void
  // Optional font family and weight props (only SliderProperties uses these)
  labelFontFamily?: string
  labelFontWeight?: string
  onLabelFontFamilyChange?: (family: string) => void
  onLabelFontWeightChange?: (weight: string) => void
}

export function LabelDisplaySection({
  showLabel,
  labelText,
  labelPosition,
  labelDistance,
  labelFontSize,
  labelColor,
  onShowLabelChange,
  onLabelTextChange,
  onLabelPositionChange,
  onLabelDistanceChange,
  onLabelFontSizeChange,
  onLabelColorChange,
  labelFontFamily,
  labelFontWeight,
  onLabelFontFamilyChange,
  onLabelFontWeightChange,
}: LabelDisplaySectionProps) {
  const hasFullFontControls =
    labelFontFamily !== undefined &&
    labelFontWeight !== undefined &&
    onLabelFontFamilyChange !== undefined &&
    onLabelFontWeightChange !== undefined

  return (
    <PropertySection title="Label">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={showLabel}
          onChange={(e) => onShowLabelChange(e.target.checked)}
          className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
        />
        <span className="text-sm text-gray-300">Show Label</span>
      </label>
      {showLabel && (
        <>
          <TextInput label="Label Text" value={labelText} onChange={onLabelTextChange} />
          <PositionSelect value={labelPosition} onChange={onLabelPositionChange} />
          {hasFullFontControls && (
            <>
              <FontFamilySelect value={labelFontFamily!} onChange={onLabelFontFamilyChange!} />
              <FontWeightSelect
                value={labelFontWeight!}
                onChange={(val) => onLabelFontWeightChange!(val as string)}
                variant="compact"
                valueType="string"
                fontFamily={labelFontFamily}
              />
            </>
          )}
          <div className="grid grid-cols-2 gap-3">
            <NumberInput
              label="Font Size"
              value={labelFontSize}
              onChange={onLabelFontSizeChange}
              min={8}
              max={32}
            />
            {onLabelDistanceChange && (
              <NumberInput
                label="Distance"
                value={labelDistance ?? 4}
                onChange={onLabelDistanceChange}
                min={-20}
                max={50}
                step={0.1}
              />
            )}
          </div>
          <ColorInput label="Color" value={labelColor} onChange={onLabelColorChange} />
        </>
      )}
    </PropertySection>
  )
}
