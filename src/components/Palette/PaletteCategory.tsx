import { PaletteItem } from './PaletteItem'

interface PaletteCategoryItem {
  id: string
  type: string
  name: string
  variant?: Record<string, unknown>
}

interface PaletteCategoryProps {
  category: {
    name: string
    items: PaletteCategoryItem[]
  }
  isExpanded: boolean
  onToggle: () => void
}

export function PaletteCategory({ category, isExpanded, onToggle }: PaletteCategoryProps) {
  return (
    <div className="border-b border-gray-700">
      {/* Category header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-750 transition-colors text-left"
      >
        <span className="text-sm font-medium text-gray-300">{category.name}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
        >
          <path
            d="M6 4L10 8L6 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Category items grid */}
      {isExpanded && (
        <div className="grid grid-cols-2 gap-2 p-2 bg-gray-850">
          {category.items.map((item) => (
            <PaletteItem
              key={item.id}
              id={item.id}
              elementType={item.type}
              name={item.name}
              variant={item.variant}
            />
          ))}
        </div>
      )}
    </div>
  )
}
