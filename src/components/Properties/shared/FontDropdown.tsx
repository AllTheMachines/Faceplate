import { useState, useRef, useEffect } from 'react'
import { AVAILABLE_FONTS } from '../../../services/fonts/fontRegistry'
import { useStore } from '../../../store'

interface FontDropdownProps {
  value: string                    // Current font-family value
  onChange: (family: string) => void
  label?: string
}

export function FontDropdown({
  value,
  onChange,
  label = 'Font Family',
}: FontDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const customFonts = useStore((state) => state.customFonts)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Find display name for current value
  const getDisplayName = (family: string): string => {
    const builtIn = AVAILABLE_FONTS.find((f) => f.family === family)
    if (builtIn) return builtIn.name

    const custom = customFonts.find((f) => f.family === family)
    if (custom) return custom.name

    return family
  }

  const currentDisplayName = getDisplayName(value)

  return (
    <div ref={dropdownRef} className="relative">
      <label className="block text-xs text-gray-400 mb-1">{label}</label>

      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm text-left hover:bg-gray-650 transition-colors flex items-center justify-between"
        style={{ fontFamily: value }}
      >
        <span>{currentDisplayName}</span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-gray-700 border border-gray-600 rounded shadow-lg max-h-64 overflow-y-auto">
          {/* Built-in Fonts Section */}
          <div className="py-1">
            <div className="px-2 py-1 text-xs text-gray-400 font-semibold">Built-in Fonts</div>
            {AVAILABLE_FONTS.map((font) => {
              const isSelected = value === font.family
              return (
                <button
                  key={font.family}
                  type="button"
                  onClick={() => {
                    onChange(font.family)
                    setIsOpen(false)
                  }}
                  className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-600 transition-colors ${
                    isSelected ? 'bg-blue-500/20 text-blue-300' : 'text-white'
                  }`}
                  style={{ fontFamily: font.family }}
                >
                  {font.name}
                </button>
              )
            })}
          </div>

          {/* Custom Fonts Section (if any) */}
          {customFonts.length > 0 && (
            <div className="border-t border-gray-600 py-1">
              <div className="px-2 py-1 text-xs text-gray-400 font-semibold">Custom Fonts</div>
              {customFonts.map((font) => {
                const isSelected = value === font.family
                return (
                  <button
                    key={font.family}
                    type="button"
                    onClick={() => {
                      onChange(font.family)
                      setIsOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-600 transition-colors ${
                      isSelected ? 'bg-blue-500/20 text-blue-300' : 'text-white'
                    }`}
                    style={{ fontFamily: font.family }}
                  >
                    {font.name}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
