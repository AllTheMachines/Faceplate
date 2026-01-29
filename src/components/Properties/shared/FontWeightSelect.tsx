import { FONT_WEIGHTS_FULL, FONT_WEIGHTS_COMPACT, SELECT_CLASSNAME } from '../constants'
import { useStore } from '../../../store'

interface FontWeightSelectProps {
  value: number | string
  onChange: (value: number | string) => void
  label?: string
  variant?: 'full' | 'compact'
  valueType?: 'number' | 'string'
  fontFamily?: string  // Optional: to look up actual weight names
}

export function FontWeightSelect({
  value,
  onChange,
  label = 'Font Weight',
  variant = 'full',
  valueType = 'number',
  fontFamily,
}: FontWeightSelectProps) {
  const customFonts = useStore((state) => state.customFonts)

  // Base weights from constants
  const baseWeights = variant === 'full' ? FONT_WEIGHTS_FULL : FONT_WEIGHTS_COMPACT

  // Look up custom font to get actual weight names
  const fontInfo = fontFamily ? customFonts.find(f => f.family === fontFamily) : undefined

  // Build display weights with actual names when available
  const displayWeights = baseWeights.map(w => {
    const weightValue = typeof w.value === 'number' ? w.value : Number(w.value)
    const actualWeightInfo = fontInfo?.weights?.find(fw => fw.value === weightValue)

    if (actualWeightInfo) {
      // Show actual name from font metadata
      return {
        value: w.value,
        label: `${actualWeightInfo.actualName} (${weightValue})`,
      }
    }

    // Fall back to generic name
    return w
  })

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value
    onChange(valueType === 'number' ? Number(newValue) : newValue)
  }

  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <select value={value} onChange={handleChange} className={SELECT_CLASSNAME}>
        {displayWeights.map(({ value: optValue, label: optLabel }) => (
          <option key={optValue} value={optValue}>
            {optLabel}
          </option>
        ))}
      </select>
    </div>
  )
}
