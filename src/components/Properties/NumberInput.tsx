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
    setLocalValue(inputValue)

    // Parse and call onChange if valid number
    const num = Number(inputValue)
    if (!isNaN(num)) {
      onChange(num)
    }
  }

  const handleBlur = () => {
    const num = Number(localValue)

    // Handle NaN by reverting to prop value
    if (isNaN(num)) {
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

  return (
    <div className="mb-3">
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <input
        type="number"
        value={localValue}
        onChange={handleChange}
        onBlur={handleBlur}
        min={min}
        max={max}
        step={step}
        className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm focus:outline-none focus:border-blue-500"
      />
    </div>
  )
}
