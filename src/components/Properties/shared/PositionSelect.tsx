import { POSITION_OPTIONS, SELECT_CLASSNAME } from '../constants'

interface PositionSelectProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function PositionSelect({ value, onChange, label = 'Position' }: PositionSelectProps) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={SELECT_CLASSNAME}
      >
        {POSITION_OPTIONS.map(({ value: optValue, label: optLabel }) => (
          <option key={optValue} value={optValue}>
            {optLabel}
          </option>
        ))}
      </select>
    </div>
  )
}
