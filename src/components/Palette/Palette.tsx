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
    name: 'Buttons & Switches',
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
