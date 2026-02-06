import { HorizontalSpacerElementConfig, VerticalSpacerElementConfig, ElementConfig } from '../../types/elements'
import { NumberInput, ColorInput, PropertySection } from './'

interface SpacerPropertiesProps {
  element: HorizontalSpacerElementConfig | VerticalSpacerElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

/**
 * Shared property panel for both Horizontal and Vertical Spacer elements
 * Supports fixed and flexible sizing modes
 */
export function SpacerProperties({ element, onUpdate }: SpacerPropertiesProps) {
  const isHorizontal = element.type === 'horizontalspacer'
  const isVertical = element.type === 'verticalspacer'

  const handleSizingModeChange = (mode: 'fixed' | 'flexible') => {
    onUpdate({ sizingMode: mode })
  }

  return (
    <>
      {/* Sizing Mode */}
      <PropertySection title="Sizing Mode">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => handleSizingModeChange('fixed')}
            className={`flex-1 px-3 py-1.5 text-xs rounded ${
              element.sizingMode === 'fixed'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Fixed
          </button>
          <button
            onClick={() => handleSizingModeChange('flexible')}
            className={`flex-1 px-3 py-1.5 text-xs rounded ${
              element.sizingMode === 'flexible'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Flexible
          </button>
        </div>

        {element.sizingMode === 'fixed' && (
          <>
            {isHorizontal && 'fixedWidth' in element && (
              <NumberInput
                label="Fixed Width"
                value={element.fixedWidth}
                onChange={(fixedWidth) => onUpdate({ fixedWidth })}
                min={0}
                max={1000}
                step={1}
              />
            )}
            {isVertical && 'fixedHeight' in element && (
              <NumberInput
                label="Fixed Height"
                value={element.fixedHeight}
                onChange={(fixedHeight) => onUpdate({ fixedHeight })}
                min={0}
                max={1000}
                step={1}
              />
            )}
          </>
        )}

        {element.sizingMode === 'flexible' && (
          <>
            <NumberInput
              label="Flex Grow"
              value={element.flexGrow}
              onChange={(flexGrow) => onUpdate({ flexGrow })}
              min={0}
              max={10}
              step={0.1}
            />
            {isHorizontal && (
              <>
                <NumberInput
                  label="Min Width"
                  value={element.minWidth}
                  onChange={(minWidth) => onUpdate({ minWidth })}
                  min={0}
                  max={1000}
                  step={1}
                />
                <NumberInput
                  label="Max Width"
                  value={element.maxWidth}
                  onChange={(maxWidth) => onUpdate({ maxWidth })}
                  min={0}
                  max={9999}
                  step={1}
                />
              </>
            )}
            {isVertical && (
              <>
                <NumberInput
                  label="Min Height"
                  value={element.minHeight}
                  onChange={(minHeight) => onUpdate({ minHeight })}
                  min={0}
                  max={1000}
                  step={1}
                />
                <NumberInput
                  label="Max Height"
                  value={element.maxHeight}
                  onChange={(maxHeight) => onUpdate({ maxHeight })}
                  min={0}
                  max={9999}
                  step={1}
                />
              </>
            )}
          </>
        )}
      </PropertySection>

      {/* Visual Indicator */}
      <PropertySection title="Visual Indicator">
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="showIndicator"
            checked={element.showIndicator}
            onChange={(e) => onUpdate({ showIndicator: e.target.checked })}
            className="w-4 h-4 rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="showIndicator" className="text-sm text-gray-300">
            Show indicator in designer
          </label>
        </div>

        {element.showIndicator && (
          <ColorInput
            label="Indicator Color"
            value={element.indicatorColor}
            onChange={(indicatorColor) => onUpdate({ indicatorColor })}
          />
        )}
      </PropertySection>
    </>
  )
}
