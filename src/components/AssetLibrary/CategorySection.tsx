interface CategorySectionProps {
  name: string
  isExpanded: boolean
  onToggle: () => void
  children: React.ReactNode
}

export function CategorySection({ name, isExpanded, onToggle, children }: CategorySectionProps) {
  return (
    <div className="border-b border-gray-700">
      {/* Category header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 bg-gray-800 hover:bg-gray-750 transition-colors text-left"
      >
        <span className="text-sm font-medium text-gray-300">{name}</span>
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
          {children}
        </div>
      )}
    </div>
  )
}
