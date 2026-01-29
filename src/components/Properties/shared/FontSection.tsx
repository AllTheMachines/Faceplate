import { NumberInput, PropertySection } from '../'
import { FontFamilySelect } from './FontFamilySelect'
import { FontWeightSelect } from './FontWeightSelect'

interface FontSectionProps {
  fontSize: number
  fontFamily: string
  fontWeight: number
  padding: number
  onFontSizeChange: (size: number) => void
  onFontFamilyChange: (family: string) => void
  onFontWeightChange: (weight: number) => void
  onPaddingChange: (padding: number) => void
  title?: string
}

export function FontSection({
  fontSize,
  fontFamily,
  fontWeight,
  padding,
  onFontSizeChange,
  onFontFamilyChange,
  onFontWeightChange,
  onPaddingChange,
  title = 'Font',
}: FontSectionProps) {
  return (
    <PropertySection title={title}>
      <NumberInput
        label="Font Size"
        value={fontSize}
        onChange={onFontSizeChange}
        min={8}
        max={72}
        step={1}
      />
      <FontFamilySelect value={fontFamily} onChange={onFontFamilyChange} />
      <FontWeightSelect
        value={fontWeight}
        onChange={(val) => onFontWeightChange(val as number)}
        variant="full"
        valueType="number"
        fontFamily={fontFamily}
      />
      <NumberInput
        label="Padding"
        value={padding}
        onChange={onPaddingChange}
        min={0}
        max={50}
        step={1}
      />
    </PropertySection>
  )
}
