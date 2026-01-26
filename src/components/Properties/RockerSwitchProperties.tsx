import { RockerSwitchElementConfig, ElementConfig } from '../../types/elements'
import { TextInput, ColorInput, PropertySection } from './'

interface RockerSwitchPropertiesProps {
  element: RockerSwitchElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function RockerSwitchProperties({ element, onUpdate }: RockerSwitchPropertiesProps) {
  return (
    <>
      {/* State */}
      <PropertySection title="State">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Position</label>
          <select
            value={element.position}
            onChange={(e) =>
              onUpdate({ position: Number(e.target.value) as RockerSwitchElementConfig['position'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value={2}>Up (2)</option>
            <option value={1}>Center (1)</option>
            <option value={0}>Down (0)</option>
          </select>
        </div>
      </PropertySection>

      {/* Behavior */}
      <PropertySection title="Behavior">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Mode</label>
          <select
            value={element.mode}
            onChange={(e) =>
              onUpdate({ mode: e.target.value as RockerSwitchElementConfig['mode'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="spring-to-center">Spring to Center</option>
            <option value="latch-all-positions">Latch All Positions</option>
          </select>
        </div>
      </PropertySection>

      {/* Labels */}
      <PropertySection title="Labels">
        <label
          htmlFor="rockerswitch-showlabels"
          className="flex items-center gap-2 cursor-pointer select-none"
        >
          <input
            type="checkbox"
            id="rockerswitch-showlabels"
            checked={element.showLabels}
            onChange={(e) => onUpdate({ showLabels: e.target.checked })}
            className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
          />
          <span className="text-sm text-gray-300">Show Labels</span>
        </label>
        {element.showLabels && (
          <>
            <TextInput
              label="Up Label"
              value={element.upLabel}
              onChange={(upLabel) => onUpdate({ upLabel })}
            />
            <TextInput
              label="Down Label"
              value={element.downLabel}
              onChange={(downLabel) => onUpdate({ downLabel })}
            />
            <ColorInput
              label="Label Color"
              value={element.labelColor}
              onChange={(labelColor) => onUpdate({ labelColor })}
            />
          </>
        )}
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Switch Color"
          value={element.switchColor}
          onChange={(switchColor) => onUpdate({ switchColor })}
        />
        <ColorInput
          label="Border Color"
          value={element.borderColor}
          onChange={(borderColor) => onUpdate({ borderColor })}
        />
      </PropertySection>
    </>
  )
}
