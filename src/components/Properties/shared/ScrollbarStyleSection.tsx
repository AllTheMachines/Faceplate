import { NumberInput, ColorInput, PropertySection } from '../'
import { ScrollbarConfig, DEFAULT_SCROLLBAR_CONFIG } from '../../../types/elements/containers'

interface ScrollbarStyleSectionProps {
  config: ScrollbarConfig
  onUpdate: (updates: Partial<ScrollbarConfig>) => void
}

export function ScrollbarStyleSection({ config, onUpdate }: ScrollbarStyleSectionProps) {
  return (
    <PropertySection title="Scrollbar Style">
      <NumberInput
        label="Width"
        value={config.scrollbarWidth ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarWidth}
        onChange={(scrollbarWidth) => onUpdate({ scrollbarWidth })}
        min={6}
        max={20}
      />
      <ColorInput
        label="Thumb Color"
        value={config.scrollbarThumbColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbColor}
        onChange={(scrollbarThumbColor) => onUpdate({ scrollbarThumbColor })}
      />
      <ColorInput
        label="Thumb Hover Color"
        value={config.scrollbarThumbHoverColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbHoverColor}
        onChange={(scrollbarThumbHoverColor) => onUpdate({ scrollbarThumbHoverColor })}
      />
      <ColorInput
        label="Track Color"
        value={config.scrollbarTrackColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarTrackColor}
        onChange={(scrollbarTrackColor) => onUpdate({ scrollbarTrackColor })}
      />
      <NumberInput
        label="Border Radius"
        value={config.scrollbarBorderRadius ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarBorderRadius}
        onChange={(scrollbarBorderRadius) => onUpdate({ scrollbarBorderRadius })}
        min={0}
        max={12}
      />
      <NumberInput
        label="Thumb Border"
        value={config.scrollbarThumbBorder ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbBorder}
        onChange={(scrollbarThumbBorder) => onUpdate({ scrollbarThumbBorder })}
        min={0}
        max={4}
      />
    </PropertySection>
  )
}
