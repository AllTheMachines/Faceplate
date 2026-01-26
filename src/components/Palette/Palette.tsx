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
      { id: 'steppedknob', type: 'steppedknob', name: 'Stepped Knob' },
      { id: 'centerdetentknob', type: 'centerdetentknob', name: 'Center Detent' },
      { id: 'dotindicatorknob', type: 'dotindicatorknob', name: 'Dot Indicator' },
    ],
  },
  {
    name: 'Linear Controls',
    items: [
      { id: 'slider', type: 'slider', name: 'Slider', variant: { orientation: 'vertical' } },
      { id: 'rangeslider', type: 'rangeslider', name: 'Range Slider' },
      { id: 'multislider', type: 'multislider', name: 'Multi-Slider' },
      { id: 'bipolarslider', type: 'bipolarslider', name: 'Bipolar Slider' },
      { id: 'crossfadeslider', type: 'crossfadeslider', name: 'Crossfade' },
      { id: 'notchedslider', type: 'notchedslider', name: 'Notched Slider' },
      { id: 'arcslider', type: 'arcslider', name: 'Arc Slider' },
    ],
  },
  {
    name: 'Buttons',
    items: [
      { id: 'button', type: 'button', name: 'Button', variant: { mode: 'momentary' } },
      { id: 'iconbutton', type: 'iconbutton', name: 'Icon Button' },
      { id: 'kickbutton', type: 'kickbutton', name: 'Kick Button' },
      { id: 'toggleswitch', type: 'toggleswitch', name: 'Toggle Switch' },
      { id: 'powerbutton', type: 'powerbutton', name: 'Power Button' },
      { id: 'rockerswitch', type: 'rockerswitch', name: 'Rocker Switch' },
      { id: 'rotaryswitch', type: 'rotaryswitch', name: 'Rotary Switch' },
      { id: 'segmentbutton', type: 'segmentbutton', name: 'Segment Button' },
    ],
  },
  {
    name: 'Value Displays',
    items: [
      { id: 'label', type: 'label', name: 'Label' },
      { id: 'numericdisplay', type: 'numericdisplay', name: 'Numeric Display' },
      { id: 'timedisplay', type: 'timedisplay', name: 'Time Display' },
      { id: 'percentagedisplay', type: 'percentagedisplay', name: 'Percentage Display' },
      { id: 'ratiodisplay', type: 'ratiodisplay', name: 'Ratio Display' },
      { id: 'notedisplay', type: 'notedisplay', name: 'Note Display' },
      { id: 'bpmdisplay', type: 'bpmdisplay', name: 'BPM Display' },
      { id: 'editabledisplay', type: 'editabledisplay', name: 'Editable Display' },
      { id: 'multivaluedisplay', type: 'multivaluedisplay', name: 'Multi-Value Display' },
    ],
  },
  {
    name: 'LED Indicators',
    items: [
      { id: 'singleled', type: 'singleled', name: 'Single LED' },
      { id: 'bicolorled', type: 'bicolorled', name: 'Bi-Color LED' },
      { id: 'tricolorled', type: 'tricolorled', name: 'Tri-Color LED' },
      { id: 'ledarray', type: 'ledarray', name: 'LED Array' },
      { id: 'ledring', type: 'ledring', name: 'LED Ring' },
      { id: 'ledmatrix', type: 'ledmatrix', name: 'LED Matrix' },
    ],
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
      { id: 'svggraphic', type: 'svggraphic', name: 'SVG Graphic' },
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
