import { useState, useRef, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (value: string) => void
}

/**
 * Compact color picker for use in color override sections.
 * Similar to ColorInput but with smaller spacing for list contexts.
 */
export function ColorPicker({ label, value, onChange }: ColorPickerProps) {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)
  const isPickingRef = useRef(false)

  // Close picker when clicking outside
  useEffect(() => {
    if (!showPicker) return

    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        isPickingRef.current = false
        setShowPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPicker])

  return (
    <div className="flex items-center gap-2 relative">
      <span className="text-xs text-gray-400 w-16">{label}</span>
      <button
        type="button"
        onClick={() => {
          if (showPicker) {
            isPickingRef.current = false
          }
          setShowPicker(!showPicker)
        }}
        className="w-8 h-6 rounded border border-gray-600 cursor-pointer hover:border-gray-500 transition-colors flex-shrink-0"
        style={{ backgroundColor: value || '#666666' }}
        aria-label={`Pick ${label} color`}
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="#000000"
        className="flex-1 bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-xs font-mono uppercase focus:outline-none focus:border-blue-500"
      />

      {showPicker && (
        <div
          ref={pickerRef}
          className="absolute z-50 top-8 left-16"
          onMouseDown={(e) => e.stopPropagation()}
        >
          <div className="bg-gray-800 p-3 rounded shadow-xl border border-gray-700">
            <HexColorPicker
              color={value || '#666666'}
              onChange={(newColor) => {
                isPickingRef.current = true
                onChange(newColor)
                setTimeout(() => {
                  isPickingRef.current = false
                }, 100)
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
