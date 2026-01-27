import { useState, useEffect, useRef } from 'react'
import { ComboBoxElementConfig } from '../../../../types/elements'
import { DEFAULT_SCROLLBAR_CONFIG } from '../../../../types/elements/containers'

interface ComboBoxRendererProps {
  config: ComboBoxElementConfig
}

export function ComboBoxRenderer({ config }: ComboBoxRendererProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [inputValue, setInputValue] = useState(config.selectedValue)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const comboBoxRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scrollbar config with defaults for CSS styling
  const scrollbarWidth = config.scrollbarWidth ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarWidth
  const scrollbarThumbColor = config.scrollbarThumbColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbColor
  const scrollbarThumbHoverColor = config.scrollbarThumbHoverColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbHoverColor
  const scrollbarTrackColor = config.scrollbarTrackColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarTrackColor
  const scrollbarBorderRadius = config.scrollbarBorderRadius ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarBorderRadius

  // Unique class for scoped scrollbar styling
  const dropdownClass = `combobox-dropdown-${config.id?.replace(/-/g, '') || 'default'}`

  // Filter options based on input
  const filteredOptions = config.options.filter((option) =>
    option.toLowerCase().includes(inputValue.toLowerCase())
  )

  // Click-outside handling
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (comboBoxRef.current && !comboBoxRef.current.contains(event.target as Node)) {
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
      if (!isOpen) {
        // Open dropdown on ArrowDown when closed
        if (event.key === 'ArrowDown') {
          event.preventDefault()
          setIsOpen(true)
        }
        return
      }

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault()
          setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length)
          break
        case 'ArrowUp':
          event.preventDefault()
          setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length)
          break
        case 'Enter':
          event.preventDefault()
          if (filteredOptions.length > 0) {
            selectOption(filteredOptions[highlightedIndex])
          }
          break
        case 'Escape':
          event.preventDefault()
          setIsOpen(false)
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, highlightedIndex, filteredOptions])

  function selectOption(option: string) {
    setInputValue(option)
    setIsOpen(false)
  }

  // Reset highlighted index when filtered options change
  useEffect(() => {
    setHighlightedIndex(0)
  }, [filteredOptions.length])

  return (
    <div
      ref={comboBoxRef}
      className="combobox-element"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        fontFamily: config.fontFamily,
      }}
    >
      {/* Input field */}
      <input
        ref={inputRef}
        type="text"
        value={inputValue}
        onChange={(e) => {
          setInputValue(e.target.value)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        placeholder={config.placeholder}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          border: `1px solid ${config.borderColor}`,
          borderRadius: `${config.borderRadius}px`,
          padding: '0 32px 0 8px',
          fontSize: `${config.fontSize}px`,
          fontWeight: config.fontWeight,
          outline: 'none',
          transition: 'none',
        }}
      />

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

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className={dropdownClass}
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '2px',
            backgroundColor: config.backgroundColor,
            border: `1px solid ${config.borderColor}`,
            borderRadius: `${config.borderRadius}px`,
            maxHeight: `${config.dropdownMaxHeight}px`,
            overflowY: 'auto',
            zIndex: 1000,
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)',
            opacity: isOpen ? 1 : 0,
            transition: isOpen ? 'opacity 100ms ease-out' : 'opacity 150ms ease-in',
          }}
        >
          {filteredOptions.length === 0 ? (
            <div
              style={{
                padding: '8px 12px',
                color: 'rgba(255, 255, 255, 0.5)',
                fontStyle: 'italic',
              }}
            >
              No matching options
            </div>
          ) : (
            filteredOptions.map((option, index) => {
              const isHighlighted = highlightedIndex === index

              return (
                <div
                  key={index}
                  onClick={() => selectOption(option)}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  style={{
                    padding: '8px 12px',
                    cursor: 'pointer',
                    backgroundColor: isHighlighted ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                    color: config.textColor,
                    transition: 'none',
                  }}
                >
                  {option}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* CSS scrollbar styling for dropdown */}
      <style>{`
        .${dropdownClass}::-webkit-scrollbar {
          width: ${scrollbarWidth}px;
        }
        .${dropdownClass}::-webkit-scrollbar-track {
          background: ${scrollbarTrackColor};
          border-radius: ${scrollbarBorderRadius}px;
        }
        .${dropdownClass}::-webkit-scrollbar-thumb {
          background: ${scrollbarThumbColor};
          border-radius: ${scrollbarBorderRadius}px;
        }
        .${dropdownClass}::-webkit-scrollbar-thumb:hover {
          background: ${scrollbarThumbHoverColor};
        }
        .${dropdownClass} {
          scrollbar-width: thin;
          scrollbar-color: ${scrollbarThumbColor} ${scrollbarTrackColor};
        }
      `}</style>
    </div>
  )
}
