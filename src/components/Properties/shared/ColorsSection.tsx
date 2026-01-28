import { ColorInput, PropertySection } from '../'

interface ColorsSectionProps {
  textColor: string
  backgroundColor: string
  borderColor?: string
  onTextColorChange: (color: string) => void
  onBackgroundColorChange: (color: string) => void
  onBorderColorChange?: (color: string) => void
  title?: string
}

export function ColorsSection({
  textColor,
  backgroundColor,
  borderColor,
  onTextColorChange,
  onBackgroundColorChange,
  onBorderColorChange,
  title = 'Colors',
}: ColorsSectionProps) {
  return (
    <PropertySection title={title}>
      <ColorInput label="Text Color" value={textColor} onChange={onTextColorChange} />
      <ColorInput
        label="Background Color"
        value={backgroundColor}
        onChange={onBackgroundColorChange}
      />
      {borderColor !== undefined && onBorderColorChange && (
        <ColorInput label="Border Color" value={borderColor} onChange={onBorderColorChange} />
      )}
    </PropertySection>
  )
}
