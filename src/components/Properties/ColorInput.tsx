import { useState, useRef, useEffect } from 'react'
import { HexColorPicker } from 'react-colorful'

interface ColorInputProps {
  label: string
  value: string
  onChange: (value: string) => void
}

export function ColorInput({ label, value, onChange }: ColorInputProps) {
  const [showPicker, setShowPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  // Close picker when clicking outside
  useEffect(() => {
    if (!showPicker) return

    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowPicker(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showPicker])

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  return (
    <div className="mb-3 relative">
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <div className="flex gap-2">
        {/* Color swatch button */}
        <button
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="w-12 h-8 rounded border border-gray-600 cursor-pointer hover:border-gray-500 transition-colors flex-shrink-0"
          style={{ backgroundColor: value }}
          aria-label={`Pick ${label}`}
        />
        {/* Hex text input */}
        <input
          type="text"
          value={value}
          onChange={handleTextChange}
          placeholder="#000000"
          className="flex-1 bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm font-mono uppercase focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Popup picker */}
      {showPicker && (
        <div ref={pickerRef} className="absolute z-50 mt-2 left-0">
          <div className="bg-gray-800 p-3 rounded shadow-xl border border-gray-700">
            <HexColorPicker color={value} onChange={onChange} />
          </div>
        </div>
      )}
    </div>
  )
}
