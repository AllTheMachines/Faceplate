import { AVAILABLE_FONTS } from '../../../services/fonts/fontRegistry'
import { SELECT_CLASSNAME } from '../constants'

interface FontFamilySelectProps {
  value: string
  onChange: (value: string) => void
  label?: string
}

export function FontFamilySelect({
  value,
  onChange,
  label = 'Font Family',
}: FontFamilySelectProps) {
  return (
    <div>
      <label className="block text-xs text-gray-400 mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={SELECT_CLASSNAME}
      >
        {AVAILABLE_FONTS.map((font) => (
          <option key={font.family} value={font.family}>
            {font.name}
          </option>
        ))}
      </select>
    </div>
  )
}
