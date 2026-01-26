/**
 * Element Renderer Registry
 *
 * Maps element types to their renderer components for O(1) lookup.
 * Adding new element types requires only adding an entry here.
 */

import React from 'react'
import type { ElementConfig } from '../../../types/elements'

// Import all renderers
import { KnobRenderer } from './KnobRenderer'
import { SliderRenderer } from './SliderRenderer'
import { ButtonRenderer } from './ButtonRenderer'
import { LabelRenderer } from './LabelRenderer'
import { MeterRenderer } from './MeterRenderer'
import { ImageRenderer } from './ImageRenderer'
import { DropdownRenderer } from './DropdownRenderer'
import { CheckboxRenderer } from './CheckboxRenderer'
import { RadioGroupRenderer } from './RadioGroupRenderer'
import { ModulationMatrixRenderer } from './ModulationMatrixRenderer'
import { RangeSliderRenderer } from './RangeSliderRenderer'
import { RectangleRenderer } from './RectangleRenderer'
import { LineRenderer } from './LineRenderer'
import { PanelRenderer } from './PanelRenderer'
import { FrameRenderer } from './FrameRenderer'
import { GroupBoxRenderer } from './GroupBoxRenderer'
import { DbDisplayRenderer } from './DbDisplayRenderer'
import { FrequencyDisplayRenderer } from './FrequencyDisplayRenderer'
import { GainReductionMeterRenderer } from './GainReductionMeterRenderer'
import { PresetBrowserRenderer } from './PresetBrowserRenderer'
import { WaveformRenderer } from './WaveformRenderer'
import { OscilloscopeRenderer } from './OscilloscopeRenderer'
import { TextFieldRenderer } from './TextFieldRenderer'
import { CollapsibleRenderer } from './CollapsibleRenderer'
import { SvgGraphicRenderer } from './SvgGraphicRenderer'

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
export { KnobRenderer } from './KnobRenderer'
export { SliderRenderer } from './SliderRenderer'
export { ButtonRenderer } from './ButtonRenderer'
export { LabelRenderer } from './LabelRenderer'
export { MeterRenderer } from './MeterRenderer'
export { ImageRenderer } from './ImageRenderer'
export { DropdownRenderer } from './DropdownRenderer'
export { CheckboxRenderer } from './CheckboxRenderer'
export { RadioGroupRenderer } from './RadioGroupRenderer'
export { ModulationMatrixRenderer } from './ModulationMatrixRenderer'
export { RangeSliderRenderer } from './RangeSliderRenderer'
export { RectangleRenderer } from './RectangleRenderer'
export { LineRenderer } from './LineRenderer'
export { PanelRenderer } from './PanelRenderer'
export { FrameRenderer } from './FrameRenderer'
export { GroupBoxRenderer } from './GroupBoxRenderer'
export { DbDisplayRenderer } from './DbDisplayRenderer'
export { FrequencyDisplayRenderer } from './FrequencyDisplayRenderer'
export { GainReductionMeterRenderer } from './GainReductionMeterRenderer'
export { PresetBrowserRenderer } from './PresetBrowserRenderer'
export { WaveformRenderer } from './WaveformRenderer'
export { OscilloscopeRenderer } from './OscilloscopeRenderer'
export { TextFieldRenderer } from './TextFieldRenderer'
export { CollapsibleRenderer } from './CollapsibleRenderer'
export { SvgGraphicRenderer } from './SvgGraphicRenderer'
