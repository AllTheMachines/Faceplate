import { FONT_WEIGHTS_FULL, FONT_WEIGHTS_COMPACT, SELECT_CLASSNAME } from '../constants'

interface FontWeightSelectProps {
  value: number | string
  onChange: (value: number | string) => void
  label?: string
  variant?: 'full' | 'compact'
  valueType?: 'number' | 'string'
}

export function FontWeightSelect({
  value,
  onChange,
  label = 'Font Weight',
  variant = 'full',
  valueType = 'number',
}: FontWeightSelectProps) {
  const weights = variant === 'full' ? FONT_WEIGHTS_FULL : FONT_WEIGHTS_COMPACT

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value
    onChange(valueType === 'number' ? Number(newValue) : newValue)
  }

  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <select value={value} onChange={handleChange} className={SELECT_CLASSNAME}>
        {weights.map(({ value: optValue, label: optLabel }) => (
          <option key={optValue} value={optValue}>
            {optLabel}
          </option>
        ))}
      </select>
    </div>
  )
}
