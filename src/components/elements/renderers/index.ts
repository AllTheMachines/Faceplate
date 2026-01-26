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
