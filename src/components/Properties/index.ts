import { ElementConfig } from '../../types/elements'

// Shared input components
export { NumberInput } from './NumberInput'
export { TextInput } from './TextInput'
export { ColorInput } from './ColorInput'
export { PropertySection } from './PropertySection'
export { PropertyPanel } from './PropertyPanel'

// Import all property components
import { KnobProperties } from './KnobProperties'
import { SliderProperties } from './SliderProperties'
import { ButtonProperties } from './ButtonProperties'
import { LabelProperties } from './LabelProperties'
import { MeterProperties } from './MeterProperties'
import { ImageProperties } from './ImageProperties'
import { PanelProperties } from './PanelProperties'
import { FrameProperties } from './FrameProperties'
import { GroupBoxProperties } from './GroupBoxProperties'
import { RectangleProperties } from './RectangleProperties'
import { LineProperties } from './LineProperties'
import { DbDisplayProperties } from './DbDisplayProperties'
import { FrequencyDisplayProperties } from './FrequencyDisplayProperties'
import { GainReductionMeterProperties } from './GainReductionMeterProperties'
import { PresetBrowserProperties } from './PresetBrowserProperties'
import { WaveformProperties } from './WaveformProperties'
import { OscilloscopeProperties } from './OscilloscopeProperties'
import { DropdownProperties } from './DropdownProperties'
import { CheckboxProperties } from './CheckboxProperties'
import { RadioGroupProperties } from './RadioGroupProperties'
import { TextFieldProperties } from './TextFieldProperties'
import { CollapsibleProperties } from './CollapsibleProperties'
import { RangeSliderProperties } from './RangeSliderProperties'
import { ModulationMatrixProperties } from './ModulationMatrixProperties'
import { SvgGraphicProperties } from './SvgGraphicProperties'
import { MultiSliderProperties } from './MultiSliderProperties'
import { SteppedKnobProperties } from './SteppedKnobProperties'
import { CenterDetentKnobProperties } from './CenterDetentKnobProperties'
import { DotIndicatorKnobProperties } from './DotIndicatorKnobProperties'
import { BipolarSliderProperties } from './BipolarSliderProperties'
import { CrossfadeSliderProperties } from './CrossfadeSliderProperties'
import { NotchedSliderProperties } from './NotchedSliderProperties'
import { ArcSliderProperties } from './ArcSliderProperties'

// Re-export all property components
export { KnobProperties } from './KnobProperties'
export { SliderProperties } from './SliderProperties'
export { ButtonProperties } from './ButtonProperties'
export { LabelProperties } from './LabelProperties'
export { MeterProperties } from './MeterProperties'
export { ImageProperties } from './ImageProperties'
export { PanelProperties } from './PanelProperties'
export { FrameProperties } from './FrameProperties'
export { GroupBoxProperties } from './GroupBoxProperties'
export { RectangleProperties } from './RectangleProperties'
export { LineProperties } from './LineProperties'
export { DbDisplayProperties } from './DbDisplayProperties'
export { FrequencyDisplayProperties } from './FrequencyDisplayProperties'
export { GainReductionMeterProperties } from './GainReductionMeterProperties'
export { PresetBrowserProperties } from './PresetBrowserProperties'
export { WaveformProperties } from './WaveformProperties'
export { OscilloscopeProperties } from './OscilloscopeProperties'
export { DropdownProperties } from './DropdownProperties'
export { CheckboxProperties } from './CheckboxProperties'
export { RadioGroupProperties } from './RadioGroupProperties'
export { TextFieldProperties } from './TextFieldProperties'
export { CollapsibleProperties } from './CollapsibleProperties'
export { RangeSliderProperties } from './RangeSliderProperties'
export { ModulationMatrixProperties } from './ModulationMatrixProperties'
export { SvgGraphicProperties } from './SvgGraphicProperties'
export { MultiSliderProperties } from './MultiSliderProperties'
export { SteppedKnobProperties } from './SteppedKnobProperties'
export { CenterDetentKnobProperties } from './CenterDetentKnobProperties'
export { DotIndicatorKnobProperties } from './DotIndicatorKnobProperties'
export { BipolarSliderProperties } from './BipolarSliderProperties'
export { CrossfadeSliderProperties } from './CrossfadeSliderProperties'
export { NotchedSliderProperties } from './NotchedSliderProperties'
export { ArcSliderProperties } from './ArcSliderProperties'

// Property component props interface
export interface PropertyComponentProps {
  element: ElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

// Property component type (using any for flexibility with specific element types)
type PropertyComponent = React.ComponentType<any>

// Property component registry Map
export const propertyRegistry = new Map<string, PropertyComponent>([
  // Controls
  ['knob', KnobProperties],
  ['slider', SliderProperties],
  ['button', ButtonProperties],
  ['rangeslider', RangeSliderProperties],
  ['dropdown', DropdownProperties],
  ['checkbox', CheckboxProperties],
  ['radiogroup', RadioGroupProperties],
  ['textfield', TextFieldProperties],
  ['multislider', MultiSliderProperties],
  ['steppedknob', SteppedKnobProperties],
  ['centerdetentknob', CenterDetentKnobProperties],
  ['dotindicatorknob', DotIndicatorKnobProperties],
  ['bipolarslider', BipolarSliderProperties],
  ['crossfadeslider', CrossfadeSliderProperties],
  ['notchedslider', NotchedSliderProperties],
  ['arcslider', ArcSliderProperties],

  // Displays
  ['label', LabelProperties],
  ['meter', MeterProperties],
  ['dbdisplay', DbDisplayProperties],
  ['frequencydisplay', FrequencyDisplayProperties],
  ['gainreductionmeter', GainReductionMeterProperties],
  ['presetbrowser', PresetBrowserProperties],
  ['waveform', WaveformProperties],
  ['oscilloscope', OscilloscopeProperties],
  ['modulationmatrix', ModulationMatrixProperties],

  // Containers
  ['panel', PanelProperties],
  ['frame', FrameProperties],
  ['groupbox', GroupBoxProperties],
  ['collapsible', CollapsibleProperties],

  // Decorative
  ['image', ImageProperties],
  ['svggraphic', SvgGraphicProperties],
  ['rectangle', RectangleProperties],
  ['line', LineProperties],
])

// Type-safe lookup function
export function getPropertyComponent(type: string): PropertyComponent | undefined {
  return propertyRegistry.get(type)
}
