import { useCallback } from 'react'
import { TabBarElementConfig, TabConfig, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'
import { BuiltInIcon } from '../../utils/builtInIcons'

interface TabBarPropertiesProps {
  element: TabBarElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

// Group icons by category for the dropdown
const iconCategories = {
  Transport: [
    BuiltInIcon.Play,
    BuiltInIcon.Pause,
    BuiltInIcon.Stop,
    BuiltInIcon.Record,
    BuiltInIcon.Loop,
    BuiltInIcon.SkipForward,
    BuiltInIcon.SkipBackward,
  ],
  Common: [
    BuiltInIcon.Mute,
    BuiltInIcon.Solo,
    BuiltInIcon.Bypass,
    BuiltInIcon.Power,
    BuiltInIcon.Settings,
    BuiltInIcon.Reset,
    BuiltInIcon.Save,
    BuiltInIcon.Load,
  ],
  Audio: [
    BuiltInIcon.Waveform,
    BuiltInIcon.Spectrum,
    BuiltInIcon.Midi,
    BuiltInIcon.Sync,
    BuiltInIcon.Link,
    BuiltInIcon.EQ,
    BuiltInIcon.Compressor,
    BuiltInIcon.Reverb,
    BuiltInIcon.Delay,
    BuiltInIcon.Filter,
  ],
  Additional: [
    BuiltInIcon.Add,
    BuiltInIcon.Remove,
    BuiltInIcon.Edit,
    BuiltInIcon.Copy,
    BuiltInIcon.Paste,
    BuiltInIcon.Undo,
    BuiltInIcon.Redo,
    BuiltInIcon.Help,
    BuiltInIcon.Info,
    BuiltInIcon.Warning,
  ],
}

// Format icon name for display
function formatIconName(icon: BuiltInIcon): string {
  return icon
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

export function TabBarProperties({ element, onUpdate }: TabBarPropertiesProps) {
  // Add new tab
  const addTab = useCallback(() => {
    const newTabs = [
      ...element.tabs,
      {
        id: `tab-${Date.now()}`,
        label: `Tab ${element.tabs.length + 1}`,
        showLabel: true,
        showIcon: false,
      },
    ]
    onUpdate({ tabs: newTabs })
  }, [element.tabs, onUpdate])

  // Remove tab
  const removeTab = useCallback(
    (index: number) => {
      if (element.tabs.length <= 1) return
      const newTabs = element.tabs.filter((_, i) => i !== index)
      // Adjust active tab index if needed
      let newActiveTabIndex = element.activeTabIndex
      if (element.activeTabIndex >= newTabs.length) {
        newActiveTabIndex = newTabs.length - 1
      }
      onUpdate({ tabs: newTabs, activeTabIndex: newActiveTabIndex })
    },
    [element.tabs, element.activeTabIndex, onUpdate]
  )

  // Update tab
  const updateTab = useCallback(
    (index: number, updates: Partial<TabConfig>) => {
      const newTabs = element.tabs.map((tab, i) => (i === index ? { ...tab, ...updates } : tab))
      onUpdate({ tabs: newTabs })
    },
    [element.tabs, onUpdate]
  )

  // Set active tab
  const setActiveTab = useCallback(
    (index: number) => {
      onUpdate({ activeTabIndex: index })
    },
    [onUpdate]
  )

  return (
    <>
      {/* Tabs */}
      <PropertySection title="Tabs">
        <div className="space-y-2">
          {element.tabs.map((tab, index) => (
            <div
              key={tab.id}
              className={`border rounded p-2 ${
                element.activeTabIndex === index ? 'border-blue-500' : 'border-gray-600'
              }`}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-gray-300">Tab {index + 1}</span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab(index)}
                    className={`text-xs px-2 py-1 rounded ${
                      element.activeTabIndex === index
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                    }`}
                  >
                    {element.activeTabIndex === index ? 'Active' : 'Set Active'}
                  </button>
                  <button
                    onClick={() => removeTab(index)}
                    disabled={element.tabs.length <= 1}
                    className={`text-xs px-2 py-1 rounded ${
                      element.tabs.length <= 1
                        ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 hover:bg-red-700 text-white'
                    }`}
                  >
                    Remove
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label
                  htmlFor={`tab-showlabel-${index}`}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    id={`tab-showlabel-${index}`}
                    checked={tab.showLabel}
                    onChange={(e) => updateTab(index, { showLabel: e.target.checked })}
                    className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-300">Show Label</span>
                </label>
                {tab.showLabel && (
                  <TextInput
                    label="Label"
                    value={tab.label || ''}
                    onChange={(label) => updateTab(index, { label })}
                  />
                )}
                <label
                  htmlFor={`tab-showicon-${index}`}
                  className="flex items-center gap-2 cursor-pointer select-none"
                >
                  <input
                    type="checkbox"
                    id={`tab-showicon-${index}`}
                    checked={tab.showIcon}
                    onChange={(e) => updateTab(index, { showIcon: e.target.checked })}
                    className="bg-gray-700 border border-gray-600 rounded cursor-pointer"
                  />
                  <span className="text-sm text-gray-300">Show Icon</span>
                </label>
                {tab.showIcon && (
                  <div>
                    <label className="block text-xs text-gray-400 mb-1">Icon</label>
                    <select
                      value={tab.icon || BuiltInIcon.Settings}
                      onChange={(e) => updateTab(index, { icon: e.target.value as BuiltInIcon })}
                      className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
                    >
                      {Object.entries(iconCategories).map(([category, icons]) => (
                        <optgroup key={category} label={category}>
                          {icons.map((icon) => (
                            <option key={icon} value={icon}>
                              {formatIconName(icon)}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            </div>
          ))}
          <button
            onClick={addTab}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded"
          >
            Add Tab
          </button>
        </div>
      </PropertySection>

      {/* Layout */}
      <PropertySection title="Layout">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Orientation</label>
          <select
            value={element.orientation}
            onChange={(e) =>
              onUpdate({ orientation: e.target.value as TabBarElementConfig['orientation'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="horizontal">Horizontal</option>
            <option value="vertical">Vertical</option>
          </select>
        </div>
        <NumberInput
          label="Tab Height"
          value={element.tabHeight}
          onChange={(tabHeight) => onUpdate({ tabHeight })}
          min={24}
          max={80}
        />
      </PropertySection>

      {/* Indicator */}
      <PropertySection title="Indicator">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Style</label>
          <select
            value={element.indicatorStyle}
            onChange={(e) =>
              onUpdate({
                indicatorStyle: e.target.value as TabBarElementConfig['indicatorStyle'],
              })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="background">Background</option>
            <option value="underline">Underline</option>
            <option value="accent-bar">Accent Bar</option>
          </select>
        </div>
        <ColorInput
          label="Indicator Color"
          value={element.indicatorColor}
          onChange={(indicatorColor) => onUpdate({ indicatorColor })}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Text Color"
          value={element.textColor}
          onChange={(textColor) => onUpdate({ textColor })}
        />
        <ColorInput
          label="Active Text Color"
          value={element.activeTextColor}
          onChange={(activeTextColor) => onUpdate({ activeTextColor })}
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
