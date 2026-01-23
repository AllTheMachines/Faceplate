import { useState } from 'react'
import { PaletteCategory } from './PaletteCategory'
import { CustomSVGUpload } from './CustomSVGUpload'

// Define palette categories and items
const paletteCategories = [
  {
    name: 'Rotary Controls',
    items: [
      { id: 'knob-standard', type: 'knob', name: 'Knob' },
      { id: 'knob-arc', type: 'knob-arc', name: 'Arc Knob' },
    ],
  },
  {
    name: 'Linear Controls',
    items: [
      { id: 'slider-vertical', type: 'slider-vertical', name: 'V Slider' },
      { id: 'slider-horizontal', type: 'slider-horizontal', name: 'H Slider' },
    ],
  },
  {
    name: 'Buttons & Switches',
    items: [
      { id: 'button-momentary', type: 'button-momentary', name: 'Momentary' },
      { id: 'button-toggle', type: 'button-toggle', name: 'Toggle' },
    ],
  },
  {
    name: 'Value Displays',
    items: [{ id: 'label', type: 'label', name: 'Label' }],
  },
  {
    name: 'Meters',
    items: [{ id: 'meter-vertical', type: 'meter-vertical', name: 'Meter' }],
  },
  {
    name: 'Images & Decorative',
    items: [{ id: 'image', type: 'image', name: 'Image' }],
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
