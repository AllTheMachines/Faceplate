import { TabBarElementConfig, TabConfig } from '../../../../types/elements'
import { getBuiltInIconSVG } from '../../../../utils/builtInIcons'
import { useEffect, useRef } from 'react'

interface TabBarRendererProps {
  config: TabBarElementConfig
}

/**
 * TabBarRenderer
 *
 * Renders a tab bar with configurable tabs (icon, text, or both per tab).
 * Features:
 * - Arrow key navigation (Left/Right for horizontal, Up/Down for vertical)
 * - data-active-tab attribute for JUCE integration
 * - Three indicator styles: background, underline, accent-bar
 */
export function TabBarRenderer({ config }: TabBarRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const {
    tabs,
    activeTabIndex,
    orientation,
    tabHeight,
    indicatorStyle,
    indicatorColor,
    backgroundColor,
    textColor,
    activeTextColor,
    borderColor,
  } = config

  const isHorizontal = orientation === 'horizontal'

  // Set data-active-tab attribute for JUCE integration
  useEffect(() => {
    if (containerRef.current) {
      const activeTab = tabs[activeTabIndex]
      if (activeTab) {
        containerRef.current.setAttribute('data-active-tab', activeTab.id)
      }
    }
  }, [activeTabIndex, tabs])

  return (
    <div
      ref={containerRef}
      className="tabbar-element"
      tabIndex={0}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: isHorizontal ? 'row' : 'column',
        backgroundColor,
        border: `1px solid ${borderColor}`,
        userSelect: 'none',
        outline: 'none',
      }}
    >
      {tabs.map((tab, index) => {
        const isActive = index === activeTabIndex

        return (
          <div
            key={tab.id}
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '4px',
              padding: '8px',
              height: isHorizontal ? '100%' : `${tabHeight}px`,
              width: isHorizontal ? undefined : '100%',
              color: isActive ? activeTextColor : textColor,
              cursor: 'pointer',
              transition: 'none',
              position: 'relative',
              backgroundColor:
                indicatorStyle === 'background' && isActive
                  ? indicatorColor
                  : 'transparent',
            }}
          >
            {/* Tab content */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
              }}
            >
              {renderTabContent(tab)}
            </div>

            {/* Indicator (underline or accent-bar) */}
            {isActive && indicatorStyle !== 'background' && (
              <div
                style={{
                  position: 'absolute',
                  backgroundColor: indicatorColor,
                  ...(isHorizontal
                    ? {
                        // Horizontal: underline or accent bar at bottom
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height:
                          indicatorStyle === 'accent-bar' ? '4px' : '2px',
                      }
                    : {
                        // Vertical: underline or accent bar at right
                        right: 0,
                        top: 0,
                        bottom: 0,
                        width:
                          indicatorStyle === 'accent-bar' ? '4px' : '2px',
                      }),
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

/**
 * Render tab content based on showIcon and showLabel settings
 */
function renderTabContent(tab: TabConfig) {
  const iconSize = 18

  const iconElement =
    tab.showIcon && tab.icon ? (
      <div
        style={{
          width: iconSize,
          height: iconSize,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'currentColor',
        }}
        dangerouslySetInnerHTML={{ __html: getBuiltInIconSVG(tab.icon) }}
      />
    ) : null

  const labelElement =
    tab.showLabel && tab.label ? (
      <span
        style={{
          fontSize: '13px',
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 500,
          whiteSpace: 'nowrap',
        }}
      >
        {tab.label}
      </span>
    ) : null

  return (
    <>
      {iconElement}
      {labelElement}
    </>
  )
}
