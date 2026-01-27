import { useState } from 'react'
import { useStore } from '../../store'
import { createElementFromType } from '../../services/elementFactory'

interface MiniPaletteProps {
  containerId: string
}

// Simplified categories for container editing
const MINI_PALETTE_CATEGORIES = [
  {
    name: 'Controls',
    items: [
      { type: 'knob', label: 'Knob' },
      { type: 'slider', label: 'Slider' },
      { type: 'button', label: 'Button' },
      { type: 'checkbox', label: 'Checkbox' },
      { type: 'dropdown', label: 'Dropdown' },
      { type: 'toggleswitch', label: 'Toggle' },
    ],
  },
  {
    name: 'Displays',
    items: [
      { type: 'label', label: 'Label' },
      { type: 'numericdisplay', label: 'Numeric' },
      { type: 'dbdisplay', label: 'dB Display' },
      { type: 'meter', label: 'Meter' },
    ],
  },
  {
    name: 'Containers',
    items: [
      { type: 'panel', label: 'Panel' },
      { type: 'groupbox', label: 'Group Box' },
      { type: 'frame', label: 'Frame' },
    ],
  },
  {
    name: 'Layout',
    items: [
      { type: 'horizontalspacer', label: 'H Spacer' },
      { type: 'verticalspacer', label: 'V Spacer' },
    ],
  },
]

/**
 * Simplified palette for adding elements to containers
 */
export function MiniPalette({ containerId }: MiniPaletteProps) {
  const addChildToContainer = useStore((state) => state.addChildToContainer)
  const [expandedCategory, setExpandedCategory] = useState<string>('Controls')

  const handleAddElement = (elementType: string) => {
    const element = createElementFromType(elementType, { x: 20, y: 20 })
    if (element) {
      addChildToContainer(containerId, element)
    }
  }

  return (
    <div className="p-2">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 px-2">
        Add Element
      </h3>
      <div className="space-y-1">
        {MINI_PALETTE_CATEGORIES.map((category) => (
          <div key={category.name}>
            <button
              onClick={() => setExpandedCategory(
                expandedCategory === category.name ? '' : category.name
              )}
              className="w-full flex items-center justify-between px-2 py-1.5 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors"
            >
              <span>{category.name}</span>
              <svg
                className={`w-4 h-4 transition-transform ${
                  expandedCategory === category.name ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {expandedCategory === category.name && (
              <div className="ml-2 mt-1 space-y-0.5">
                {category.items.map((item) => (
                  <button
                    key={item.type}
                    onClick={() => handleAddElement(item.type)}
                    className="w-full text-left px-2 py-1.5 text-sm text-gray-400 hover:text-white hover:bg-gray-700/50 rounded transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    {item.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
