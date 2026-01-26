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
import { TooltipProperties } from './TooltipProperties'
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
import { IconButtonProperties } from './IconButtonProperties'
import { KickButtonProperties } from './KickButtonProperties'
import { ToggleSwitchProperties } from './ToggleSwitchProperties'
import { PowerButtonProperties } from './PowerButtonProperties'
import { RockerSwitchProperties } from './RockerSwitchProperties'
import { RotarySwitchProperties } from './RotarySwitchProperties'
import { SegmentButtonProperties } from './SegmentButtonProperties'
import { NumericDisplayProperties } from './NumericDisplayProperties'
import { TimeDisplayProperties } from './TimeDisplayProperties'
import { PercentageDisplayProperties } from './PercentageDisplayProperties'
import { RatioDisplayProperties } from './RatioDisplayProperties'
import { NoteDisplayProperties } from './NoteDisplayProperties'
import { BpmDisplayProperties } from './BpmDisplayProperties'
import { EditableDisplayProperties } from './EditableDisplayProperties'
import { MultiValueDisplayProperties } from './MultiValueDisplayProperties'
import { SingleLEDProperties } from './SingleLEDProperties'
import { BiColorLEDProperties } from './BiColorLEDProperties'
import { TriColorLEDProperties } from './TriColorLEDProperties'
import { LEDArrayProperties } from './LEDArrayProperties'
import { LEDRingProperties } from './LEDRingProperties'
import { LEDMatrixProperties } from './LEDMatrixProperties'
import {
  RMSMeterProperties,
  VUMeterProperties,
  PPMType1Properties,
  PPMType2Properties,
  TruePeakMeterProperties,
  LUFSMomentaryProperties,
  LUFSShorttermProperties,
  LUFSIntegratedProperties,
  KMeterProperties,
  CorrelationMeterProperties,
  StereoWidthMeterProperties,
} from './meters'
import { StepperProperties } from './StepperProperties'
import { BreadcrumbProperties } from './BreadcrumbProperties'
import { MultiSelectDropdownProperties } from './MultiSelectDropdownProperties'
import { ComboBoxProperties } from './ComboBoxProperties'
import { MenuButtonProperties } from './MenuButtonProperties'
import { TabBarProperties } from './TabBarProperties'
import { TagSelectorProperties } from './TagSelectorProperties'
import { TreeViewProperties } from './TreeViewProperties'
import {
  ScrollingWaveformProperties,
  SpectrumAnalyzerProperties,
  SpectrogramProperties,
  GoniometerProperties,
  VectorscopeProperties,
} from './visualizations'
import {
  EQCurveProperties,
  CompressorCurveProperties,
  EnvelopeDisplayProperties,
  LFODisplayProperties,
  FilterResponseProperties,
} from './curves'

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
export { TooltipProperties } from './TooltipProperties'
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
export { IconButtonProperties } from './IconButtonProperties'
export { KickButtonProperties } from './KickButtonProperties'
export { ToggleSwitchProperties } from './ToggleSwitchProperties'
export { PowerButtonProperties } from './PowerButtonProperties'
export { RockerSwitchProperties } from './RockerSwitchProperties'
export { RotarySwitchProperties } from './RotarySwitchProperties'
export { SegmentButtonProperties } from './SegmentButtonProperties'
export { NumericDisplayProperties } from './NumericDisplayProperties'
export { TimeDisplayProperties } from './TimeDisplayProperties'
export { PercentageDisplayProperties } from './PercentageDisplayProperties'
export { RatioDisplayProperties } from './RatioDisplayProperties'
export { NoteDisplayProperties } from './NoteDisplayProperties'
export { BpmDisplayProperties } from './BpmDisplayProperties'
export { EditableDisplayProperties } from './EditableDisplayProperties'
export { MultiValueDisplayProperties } from './MultiValueDisplayProperties'
export { SingleLEDProperties } from './SingleLEDProperties'
export { BiColorLEDProperties } from './BiColorLEDProperties'
export { TriColorLEDProperties } from './TriColorLEDProperties'
export { LEDArrayProperties } from './LEDArrayProperties'
export { LEDRingProperties } from './LEDRingProperties'
export { LEDMatrixProperties } from './LEDMatrixProperties'
export {
  RMSMeterProperties,
  VUMeterProperties,
  PPMType1Properties,
  PPMType2Properties,
  TruePeakMeterProperties,
  LUFSMomentaryProperties,
  LUFSShorttermProperties,
  LUFSIntegratedProperties,
  KMeterProperties,
  CorrelationMeterProperties,
  StereoWidthMeterProperties,
} from './meters'
export { StepperProperties } from './StepperProperties'
export { BreadcrumbProperties } from './BreadcrumbProperties'
export { MultiSelectDropdownProperties } from './MultiSelectDropdownProperties'
export { ComboBoxProperties } from './ComboBoxProperties'
export { MenuButtonProperties } from './MenuButtonProperties'
export { TabBarProperties } from './TabBarProperties'
export { TagSelectorProperties } from './TagSelectorProperties'
export { TreeViewProperties } from './TreeViewProperties'
export {
  ScrollingWaveformProperties,
  SpectrumAnalyzerProperties,
  SpectrogramProperties,
  GoniometerProperties,
  VectorscopeProperties,
} from './visualizations'
export {
  EQCurveProperties,
  CompressorCurveProperties,
  EnvelopeDisplayProperties,
  LFODisplayProperties,
  FilterResponseProperties,
} from './curves'

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
  ['iconbutton', IconButtonProperties],
  ['kickbutton', KickButtonProperties],
  ['toggleswitch', ToggleSwitchProperties],
  ['powerbutton', PowerButtonProperties],
  ['rockerswitch', RockerSwitchProperties],
  ['rotaryswitch', RotarySwitchProperties],
  ['segmentbutton', SegmentButtonProperties],

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
  ['numericdisplay', NumericDisplayProperties],
  ['timedisplay', TimeDisplayProperties],
  ['percentagedisplay', PercentageDisplayProperties],
  ['ratiodisplay', RatioDisplayProperties],
  ['notedisplay', NoteDisplayProperties],
  ['bpmdisplay', BpmDisplayProperties],
  ['editabledisplay', EditableDisplayProperties],
  ['multivaluedisplay', MultiValueDisplayProperties],
  ['singleled', SingleLEDProperties],
  ['bicolorled', BiColorLEDProperties],
  ['tricolorled', TriColorLEDProperties],
  ['ledarray', LEDArrayProperties],
  ['ledring', LEDRingProperties],
  ['ledmatrix', LEDMatrixProperties],

  // Professional Meters
  ['rmsmetermo', RMSMeterProperties],
  ['rmsmeterstereo', RMSMeterProperties],
  ['vumetermono', VUMeterProperties],
  ['vumeterstereo', VUMeterProperties],
  ['ppmtype1mono', PPMType1Properties],
  ['ppmtype1stereo', PPMType1Properties],
  ['ppmtype2mono', PPMType2Properties],
  ['ppmtype2stereo', PPMType2Properties],
  ['truepeakmetermono', TruePeakMeterProperties],
  ['truepeakmeterstereo', TruePeakMeterProperties],
  ['lufsmomomo', LUFSMomentaryProperties],
  ['lufsmomostereo', LUFSMomentaryProperties],
  ['lufsshortmono', LUFSShorttermProperties],
  ['lufsshortstereo', LUFSShorttermProperties],
  ['lufsintmono', LUFSIntegratedProperties],
  ['lufsintstereo', LUFSIntegratedProperties],
  ['k12metermono', KMeterProperties],
  ['k12meterstereo', KMeterProperties],
  ['k14metermono', KMeterProperties],
  ['k14meterstereo', KMeterProperties],
  ['k20metermono', KMeterProperties],
  ['k20meterstereo', KMeterProperties],
  ['correlationmeter', CorrelationMeterProperties],
  ['stereowidthmeter', StereoWidthMeterProperties],

  // Navigation & Selection
  ['stepper', StepperProperties],
  ['breadcrumb', BreadcrumbProperties],
  ['multiselectdropdown', MultiSelectDropdownProperties],
  ['combobox', ComboBoxProperties],
  ['menubutton', MenuButtonProperties],
  ['tabbar', TabBarProperties],
  ['tagselector', TagSelectorProperties],
  ['treeview', TreeViewProperties],

  // Visualizations
  ['scrollingwaveform', ScrollingWaveformProperties],
  ['spectrumanalyzer', SpectrumAnalyzerProperties],
  ['spectrogram', SpectrogramProperties],
  ['goniometer', GoniometerProperties],
  ['vectorscope', VectorscopeProperties],

  // Curve Displays
  ['eqcurve', EQCurveProperties],
  ['compressorcurve', CompressorCurveProperties],
  ['envelopedisplay', EnvelopeDisplayProperties],
  ['lfodisplay', LFODisplayProperties],
  ['filterresponse', FilterResponseProperties],

  // Containers
  ['panel', PanelProperties],
  ['frame', FrameProperties],
  ['groupbox', GroupBoxProperties],
  ['collapsible', CollapsibleProperties],
  ['tooltip', TooltipProperties],

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
