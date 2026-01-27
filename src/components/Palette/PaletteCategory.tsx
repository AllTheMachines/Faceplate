import { Component, ErrorInfo, ReactNode } from 'react'
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

// Error boundary for individual palette items
class PaletteItemErrorBoundary extends Component<
  { children: ReactNode; itemName: string },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; itemName: string }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`PaletteItem error for ${this.props.itemName}:`, error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center gap-1 p-2 border border-red-700 rounded opacity-50">
          <div className="w-12 h-12 bg-red-900 rounded flex items-center justify-center">
            <span className="text-xs text-red-400">Error</span>
          </div>
          <span className="text-xs text-red-400 text-center">{this.props.itemName}</span>
        </div>
      )
    }
    return this.props.children
  }
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
            <PaletteItemErrorBoundary key={item.id} itemName={item.name}>
              <PaletteItem
                id={item.id}
                elementType={item.type}
                name={item.name}
                variant={item.variant}
              />
            </PaletteItemErrorBoundary>
          ))}
        </div>
      )}
    </div>
  )
}
