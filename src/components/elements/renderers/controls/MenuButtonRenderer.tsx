import { useState, useEffect, useRef } from 'react'
import { MenuButtonElementConfig } from '../../../../types/elements'

interface MenuButtonRendererProps {
  config: MenuButtonElementConfig
}

export function MenuButtonRenderer({ config }: MenuButtonRendererProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)

  // Filter out disabled items for keyboard navigation
  const enabledIndices = config.menuItems
    .map((item, index) => (!item.disabled && !item.divider ? index : -1))
    .filter((i) => i !== -1)

  // Click-outside handling
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (!isOpen) return

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setHighlightedIndex((prev) => {
            const currentPos = enabledIndices.indexOf(prev)
            const nextPos = (currentPos + 1) % enabledIndices.length
            return enabledIndices[nextPos] ?? prev
          })
          break
        case 'ArrowUp':
          event.preventDefault()
          setHighlightedIndex((prev) => {
            const currentPos = enabledIndices.indexOf(prev)
            const prevPos = (currentPos - 1 + enabledIndices.length) % enabledIndices.length
            return enabledIndices[prevPos] ?? prev
          })
          break
        case 'Enter':
          event.preventDefault()
          if (enabledIndices.includes(highlightedIndex)) {
            handleItemClick(highlightedIndex)
          }
          break
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          break
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, highlightedIndex, enabledIndices])

  function handleItemClick(index: number) {
    const item = config.menuItems[index]
    if (item && !item.disabled && !item.divider) {
      // In real implementation, would trigger callback here
      setIsOpen(false)
    }
  }

  return (
    <div
      ref={menuRef}
      className="menubutton-element"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        fontFamily: config.fontFamily,
      }}
    >
      {/* Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          border: `1px solid ${config.borderColor}`,
          borderRadius: `${config.borderRadius}px`,
          padding: '0 32px 0 12px',
          fontSize: `${config.fontSize}px`,
          fontWeight: config.fontWeight,
          cursor: 'pointer',
          textAlign: 'left',
          outline: 'none',
          transition: 'none',
        }}
      >
        {config.label}
      </button>

      {/* Dropdown arrow */}
      <div
        style={{
          position: 'absolute',
          right: '8px',
          top: '50%',
          transform: `translateY(-50%) rotate(${isOpen ? 180 : 0}deg)`,
          pointerEvents: 'none',
          width: 0,
          height: 0,
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: `5px solid ${config.textColor}`,
          transition: isOpen ? 'transform 100ms ease-out' : 'transform 150ms ease-in',
        }}
      />

      {/* Context menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            minWidth: '100%',
            marginTop: '2px',
            backgroundColor: config.backgroundColor,
            border: `1px solid ${config.borderColor}`,
            borderRadius: `${config.borderRadius}px`,
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            opacity: isOpen ? 1 : 0,
            transition: isOpen ? 'opacity 100ms ease-out' : 'opacity 150ms ease-in',
          }}
        >
          {config.menuItems.map((item, index) => {
            // Render divider
            if (item.divider) {
              return (
                <div
                  key={index}
                  style={{
                    height: '1px',
                    margin: '4px 0',
                    backgroundColor: config.borderColor,
                  }}
                />
              )
            }

            const isHighlighted = highlightedIndex === index
            const isDisabled = item.disabled

            return (
              <div
                key={index}
                onClick={() => !isDisabled && handleItemClick(index)}
                onMouseEnter={() => !isDisabled && setHighlightedIndex(index)}
                style={{
                  padding: '8px 12px',
                  cursor: isDisabled ? 'not-allowed' : 'pointer',
                  backgroundColor: isHighlighted && !isDisabled ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: isDisabled ? 'rgba(255, 255, 255, 0.4)' : config.textColor,
                  whiteSpace: 'nowrap',
                  transition: 'none',
                }}
              >
                {item.label}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
