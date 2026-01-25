import { useState } from 'react'
import { PaletteCategory } from './PaletteCategory'
import { CustomSVGUpload } from './CustomSVGUpload'

// Define palette categories and items
const paletteCategories = [
  {
    name: 'Rotary Controls',
    items: [
      { id: 'knob-standard', type: 'knob', name: 'Knob' },
      { id: 'knob-arc', type: 'knob', name: 'Arc Knob', variant: { style: 'arc' } },
    ],
  },
  {
    name: 'Linear Controls',
    items: [
      { id: 'slider', type: 'slider', name: 'Slider', variant: { orientation: 'vertical' } },
    ],
  },
  {
    name: 'Buttons',
    items: [
      { id: 'button', type: 'button', name: 'Button', variant: { mode: 'momentary' } },
    ],
  },
  {
    name: 'Value Displays',
    items: [{ id: 'label', type: 'label', name: 'Label' }],
  },
  {
    name: 'Meters',
    items: [{ id: 'meter-vertical', type: 'meter', name: 'Meter', variant: { orientation: 'vertical' } }],
  },
  {
    name: 'Audio Displays',
    items: [
      { id: 'dbdisplay', type: 'dbdisplay', name: 'dB Display' },
      { id: 'frequencydisplay', type: 'frequencydisplay', name: 'Frequency Display' },
      { id: 'gainreductionmeter', type: 'gainreductionmeter', name: 'GR Meter' },
      { id: 'waveform', type: 'waveform', name: 'Waveform' },
      { id: 'oscilloscope', type: 'oscilloscope', name: 'Oscilloscope' },
    ],
  },
  {
    name: 'Form Controls',
    items: [
      { id: 'dropdown', type: 'dropdown', name: 'Dropdown' },
      { id: 'checkbox', type: 'checkbox', name: 'Checkbox' },
      { id: 'radiogroup', type: 'radiogroup', name: 'Radio Group' },
      { id: 'textfield', type: 'textfield', name: 'Text Field' },
    ],
  },
  {
    name: 'Images & Decorative',
    items: [
      { id: 'image', type: 'image', name: 'Image' },
      { id: 'rectangle', type: 'rectangle', name: 'Rectangle' },
      { id: 'line', type: 'line', name: 'Line' },
    ],
  },
  {
    name: 'Containers',
    items: [
      { id: 'panel', type: 'panel', name: 'Panel' },
      { id: 'frame', type: 'frame', name: 'Frame' },
      { id: 'groupbox', type: 'groupbox', name: 'Group Box' },
      { id: 'collapsible', type: 'collapsible', name: 'Collapsible' },
    ],
  },
  {
    name: 'Complex Widgets',
    items: [
      { id: 'modulationmatrix', type: 'modulationmatrix', name: 'Mod Matrix' },
      { id: 'presetbrowser', type: 'presetbrowser', name: 'Preset Browser' },
    ],
  },
]

export function Palette() {
  // Track expanded categories (first 3 expanded by default)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set([0, 1, 2])
  )

  const toggleCategory = (index: number) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  return (
    <div className="flex flex-col">
      {paletteCategories.map((category, index) => (
        <PaletteCategory
          key={category.name}
          category={category}
          isExpanded={expandedCategories.has(index)}
          onToggle={() => toggleCategory(index)}
        />
      ))}
      <CustomSVGUpload />
    </div>
  )
}
