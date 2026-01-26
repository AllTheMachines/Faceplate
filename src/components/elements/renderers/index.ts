/**
 * Element Renderer Registry
 *
 * Maps element types to their renderer components for O(1) lookup.
 * Adding new element types requires only adding an entry here.
 */

import React from 'react'
import type { ElementConfig } from '../../../types/elements'

// Import all renderers from category folders
import {
  KnobRenderer,
  SliderRenderer,
  ButtonRenderer,
  RangeSliderRenderer,
  DropdownRenderer,
  CheckboxRenderer,
  RadioGroupRenderer,
  TextFieldRenderer,
  MultiSliderRenderer,
  SteppedKnobRenderer,
  CenterDetentKnobRenderer,
  DotIndicatorKnobRenderer,
  BipolarSliderRenderer,
  CrossfadeSliderRenderer,
  NotchedSliderRenderer,
  ArcSliderRenderer,
  RockerSwitchRenderer,
  RotarySwitchRenderer,
  SegmentButtonRenderer,
  IconButtonRenderer,
  KickButtonRenderer,
  ToggleSwitchRenderer,
  PowerButtonRenderer,
} from './controls'

import {
  LabelRenderer,
  MeterRenderer,
  DbDisplayRenderer,
  FrequencyDisplayRenderer,
  GainReductionMeterRenderer,
  WaveformRenderer,
  OscilloscopeRenderer,
  PresetBrowserRenderer,
  ModulationMatrixRenderer,
  SingleLEDRenderer,
  BiColorLEDRenderer,
  TriColorLEDRenderer,
  LEDArrayRenderer,
  LEDRingRenderer,
  LEDMatrixRenderer,
  NumericDisplayRenderer,
  TimeDisplayRenderer,
  PercentageDisplayRenderer,
  RatioDisplayRenderer,
  NoteDisplayRenderer,
  BpmDisplayRenderer,
  EditableDisplayRenderer,
  MultiValueDisplayRenderer,
  RMSMeterMonoRenderer,
  RMSMeterStereoRenderer,
  VUMeterMonoRenderer,
  VUMeterStereoRenderer,
  PPMType1MonoRenderer,
  PPMType1StereoRenderer,
  PPMType2MonoRenderer,
  PPMType2StereoRenderer,
  TruePeakMeterMonoRenderer,
  TruePeakMeterStereoRenderer,
  LUFSMomentaryMonoRenderer,
  LUFSMomentaryStereoRenderer,
  LUFSShorttermMonoRenderer,
  LUFSShorttermStereoRenderer,
  LUFSIntegratedMonoRenderer,
  LUFSIntegratedStereoRenderer,
  K12MeterMonoRenderer,
  K12MeterStereoRenderer,
  K14MeterMonoRenderer,
  K14MeterStereoRenderer,
  K20MeterMonoRenderer,
  K20MeterStereoRenderer,
  CorrelationMeterRenderer,
  StereoWidthMeterRenderer,
} from './displays'

import {
  PanelRenderer,
  FrameRenderer,
  GroupBoxRenderer,
  CollapsibleRenderer,
} from './containers'

import {
  ImageRenderer,
  SvgGraphicRenderer,
  RectangleRenderer,
  LineRenderer,
} from './decorative'

// Renderer component type - accepts config prop and renders element
export type RendererComponent = React.ComponentType<{ config: ElementConfig }>

/**
 * Registry mapping element type strings to their renderer components.
 * Use Map for O(1) lookup performance.
 */
export const rendererRegistry = new Map<ElementConfig['type'], RendererComponent>([
  // Controls
  ['knob', KnobRenderer as RendererComponent],
  ['slider', SliderRenderer as RendererComponent],
  ['button', ButtonRenderer as RendererComponent],
  ['rangeslider', RangeSliderRenderer as RendererComponent],
  ['dropdown', DropdownRenderer as RendererComponent],
  ['checkbox', CheckboxRenderer as RendererComponent],
  ['radiogroup', RadioGroupRenderer as RendererComponent],
  ['textfield', TextFieldRenderer as RendererComponent],
  ['multislider', MultiSliderRenderer as RendererComponent],
  ['steppedknob', SteppedKnobRenderer as RendererComponent],
  ['centerdetentknob', CenterDetentKnobRenderer as RendererComponent],
  ['dotindicatorknob', DotIndicatorKnobRenderer as RendererComponent],
  ['bipolarslider', BipolarSliderRenderer as RendererComponent],
  ['crossfadeslider', CrossfadeSliderRenderer as RendererComponent],
  ['notchedslider', NotchedSliderRenderer as RendererComponent],
  ['arcslider', ArcSliderRenderer as RendererComponent],
  ['rockerswitch', RockerSwitchRenderer as RendererComponent],
  ['rotaryswitch', RotarySwitchRenderer as RendererComponent],
  ['segmentbutton', SegmentButtonRenderer as RendererComponent],
  ['iconbutton', IconButtonRenderer as RendererComponent],
  ['kickbutton', KickButtonRenderer as RendererComponent],
  ['toggleswitch', ToggleSwitchRenderer as RendererComponent],
  ['powerbutton', PowerButtonRenderer as RendererComponent],

  // Displays
  ['label', LabelRenderer as RendererComponent],
  ['meter', MeterRenderer as RendererComponent],
  ['dbdisplay', DbDisplayRenderer as RendererComponent],
  ['frequencydisplay', FrequencyDisplayRenderer as RendererComponent],
  ['gainreductionmeter', GainReductionMeterRenderer as RendererComponent],
  ['waveform', WaveformRenderer as RendererComponent],
  ['oscilloscope', OscilloscopeRenderer as RendererComponent],
  ['presetbrowser', PresetBrowserRenderer as RendererComponent],
  ['modulationmatrix', ModulationMatrixRenderer as RendererComponent],

  // LED Indicators
  ['singleled', SingleLEDRenderer as RendererComponent],
  ['bicolorled', BiColorLEDRenderer as RendererComponent],
  ['tricolorled', TriColorLEDRenderer as RendererComponent],
  ['ledarray', LEDArrayRenderer as RendererComponent],
  ['ledring', LEDRingRenderer as RendererComponent],
  ['ledmatrix', LEDMatrixRenderer as RendererComponent],

  // Value Displays
  ['numericdisplay', NumericDisplayRenderer as RendererComponent],
  ['timedisplay', TimeDisplayRenderer as RendererComponent],
  ['percentagedisplay', PercentageDisplayRenderer as RendererComponent],
  ['ratiodisplay', RatioDisplayRenderer as RendererComponent],
  ['notedisplay', NoteDisplayRenderer as RendererComponent],
  ['bpmdisplay', BpmDisplayRenderer as RendererComponent],
  ['editabledisplay', EditableDisplayRenderer as RendererComponent],
  ['multivaluedisplay', MultiValueDisplayRenderer as RendererComponent],

  // Professional Meters
  ['rmsmetermo', RMSMeterMonoRenderer as RendererComponent],
  ['rmsmeterstereo', RMSMeterStereoRenderer as RendererComponent],
  ['vumetermono', VUMeterMonoRenderer as RendererComponent],
  ['vumeterstereo', VUMeterStereoRenderer as RendererComponent],
  ['ppmtype1mono', PPMType1MonoRenderer as RendererComponent],
  ['ppmtype1stereo', PPMType1StereoRenderer as RendererComponent],
  ['ppmtype2mono', PPMType2MonoRenderer as RendererComponent],
  ['ppmtype2stereo', PPMType2StereoRenderer as RendererComponent],
  ['truepeakmetermono', TruePeakMeterMonoRenderer as RendererComponent],
  ['truepeakmeterstereo', TruePeakMeterStereoRenderer as RendererComponent],
  ['lufsmomomo', LUFSMomentaryMonoRenderer as RendererComponent],
  ['lufsmomostereo', LUFSMomentaryStereoRenderer as RendererComponent],
  ['lufsshortmono', LUFSShorttermMonoRenderer as RendererComponent],
  ['lufsshortstereo', LUFSShorttermStereoRenderer as RendererComponent],
  ['lufsintmono', LUFSIntegratedMonoRenderer as RendererComponent],
  ['lufsintstereo', LUFSIntegratedStereoRenderer as RendererComponent],
  ['k12metermono', K12MeterMonoRenderer as RendererComponent],
  ['k12meterstereo', K12MeterStereoRenderer as RendererComponent],
  ['k14metermono', K14MeterMonoRenderer as RendererComponent],
  ['k14meterstereo', K14MeterStereoRenderer as RendererComponent],
  ['k20metermono', K20MeterMonoRenderer as RendererComponent],
  ['k20meterstereo', K20MeterStereoRenderer as RendererComponent],
  ['correlationmeter', CorrelationMeterRenderer as RendererComponent],
  ['stereowidthmeter', StereoWidthMeterRenderer as RendererComponent],

  // Containers
  ['panel', PanelRenderer as RendererComponent],
  ['frame', FrameRenderer as RendererComponent],
  ['groupbox', GroupBoxRenderer as RendererComponent],
  ['collapsible', CollapsibleRenderer as RendererComponent],

  // Decorative
  ['image', ImageRenderer as RendererComponent],
  ['svggraphic', SvgGraphicRenderer as RendererComponent],
  ['rectangle', RectangleRenderer as RendererComponent],
  ['line', LineRenderer as RendererComponent],
])

/**
 * Get renderer for an element type.
 * Returns undefined if type not found (should never happen with proper typing).
 */
export function getRenderer(type: ElementConfig['type']): RendererComponent | undefined {
  return rendererRegistry.get(type)
}

// Re-export all individual renderers for direct import if needed
export {
  // Controls
  KnobRenderer,
  SliderRenderer,
  ButtonRenderer,
  RangeSliderRenderer,
  DropdownRenderer,
  CheckboxRenderer,
  RadioGroupRenderer,
  TextFieldRenderer,
  MultiSliderRenderer,
  SteppedKnobRenderer,
  CenterDetentKnobRenderer,
  DotIndicatorKnobRenderer,
  BipolarSliderRenderer,
  CrossfadeSliderRenderer,
  NotchedSliderRenderer,
  ArcSliderRenderer,
  RockerSwitchRenderer,
  RotarySwitchRenderer,
  SegmentButtonRenderer,
  IconButtonRenderer,
  KickButtonRenderer,
  ToggleSwitchRenderer,
  PowerButtonRenderer,
  // Displays
  LabelRenderer,
  MeterRenderer,
  DbDisplayRenderer,
  FrequencyDisplayRenderer,
  GainReductionMeterRenderer,
  WaveformRenderer,
  OscilloscopeRenderer,
  PresetBrowserRenderer,
  ModulationMatrixRenderer,
  SingleLEDRenderer,
  BiColorLEDRenderer,
  TriColorLEDRenderer,
  LEDArrayRenderer,
  LEDRingRenderer,
  LEDMatrixRenderer,
  NumericDisplayRenderer,
  TimeDisplayRenderer,
  PercentageDisplayRenderer,
  RatioDisplayRenderer,
  NoteDisplayRenderer,
  BpmDisplayRenderer,
  EditableDisplayRenderer,
  MultiValueDisplayRenderer,
  RMSMeterMonoRenderer,
  RMSMeterStereoRenderer,
  VUMeterMonoRenderer,
  VUMeterStereoRenderer,
  PPMType1MonoRenderer,
  PPMType1StereoRenderer,
  PPMType2MonoRenderer,
  PPMType2StereoRenderer,
  TruePeakMeterMonoRenderer,
  TruePeakMeterStereoRenderer,
  LUFSMomentaryMonoRenderer,
  LUFSMomentaryStereoRenderer,
  LUFSShorttermMonoRenderer,
  LUFSShorttermStereoRenderer,
  LUFSIntegratedMonoRenderer,
  LUFSIntegratedStereoRenderer,
  K12MeterMonoRenderer,
  K12MeterStereoRenderer,
  K14MeterMonoRenderer,
  K14MeterStereoRenderer,
  K20MeterMonoRenderer,
  K20MeterStereoRenderer,
  CorrelationMeterRenderer,
  StereoWidthMeterRenderer,
  // Containers
  PanelRenderer,
  FrameRenderer,
  GroupBoxRenderer,
  CollapsibleRenderer,
  // Decorative
  ImageRenderer,
  SvgGraphicRenderer,
  RectangleRenderer,
  LineRenderer,
}
