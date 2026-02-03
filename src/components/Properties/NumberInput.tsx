import { useState, useEffect } from 'react'

interface NumberInputProps {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
}

export function NumberInput({
  label,
  value,
  onChange,
  min = -Infinity,
  max = Infinity,
  step = 1,
}: NumberInputProps) {
  // Local state for intermediate typing (allows typing "10" without resetting to "1")
  const [localValue, setLocalValue] = useState(String(value))

  // Sync local state with prop value
  useEffect(() => {
    setLocalValue(String(value))
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value

    // Allow empty, minus sign, or valid number patterns (including intermediate states like "-", "-.", ".")
    // This regex allows: optional minus, digits, optional decimal point, more digits
    if (inputValue === '' || inputValue === '-' || inputValue === '.' || inputValue === '-.' || /^-?\d*\.?\d*$/.test(inputValue)) {
      setLocalValue(inputValue)

      // Only call onChange if it's a complete valid number (not intermediate state)
      const num = parseFloat(inputValue)
      if (!isNaN(num)) {
        onChange(num)
      }
    }
  }

  const handleBlur = () => {
    const num = parseFloat(localValue)

    // Handle NaN or incomplete input by reverting to prop value
    if (isNaN(num) || localValue === '-' || localValue === '.' || localValue === '-.') {
      setLocalValue(String(value))
      return
    }

    // Clamp value to min/max range
    const clamped = Math.max(min, Math.min(max, num))
    if (clamped !== num) {
      onChange(clamped)
      setLocalValue(String(clamped))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Handle arrow keys for increment/decrement
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault()
      const currentNum = parseFloat(localValue) || 0
      const delta = e.key === 'ArrowUp' ? step : -step
      const newValue = Math.max(min, Math.min(max, currentNum + delta))
      setLocalValue(String(newValue))
      onChange(newValue)
    }
  }

  return (
    <div className="mb-3">
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type="text"
        inputMode="decimal"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
  )
}
