import { useState, useRef, useEffect } from 'react'

interface AssetSearchProps {
  onSearch: (term: string) => void
}

export function AssetSearch({ onSearch }: AssetSearchProps) {
  const [inputValue, setInputValue] = useState('')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Clear timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleInputChange = (value: string) => {
    setInputValue(value)

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set new debounced timeout (300ms standard)
    timeoutRef.current = setTimeout(() => {
      onSearch(value)
    }, 300)
  }

  const handleClear = () => {
    setInputValue('')
    onSearch('')
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => handleInputChange(e.target.value)}
        placeholder="Search assets..."
        className="w-full px-3 py-2 pl-9 pr-9 bg-gray-700 border border-gray-600 rounded text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      {/* Search icon */}
      <svg
        className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
        />
      </svg>
      {/* Clear button */}
      {inputValue && (
        <button
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
