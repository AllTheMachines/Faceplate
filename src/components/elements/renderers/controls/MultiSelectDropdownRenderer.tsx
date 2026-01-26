import { useState, useEffect, useRef } from 'react'
import { MultiSelectDropdownElementConfig } from '../../../../types/elements'

interface MultiSelectDropdownRendererProps {
  config: MultiSelectDropdownElementConfig
}

export function MultiSelectDropdownRenderer({ config }: MultiSelectDropdownRendererProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndices, setSelectedIndices] = useState<number[]>(config.selectedIndices)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Click-outside handling
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
          setHighlightedIndex((prev) => (prev + 1) % config.options.length)
          break
        case 'ArrowUp':
          event.preventDefault()
          setHighlightedIndex((prev) => (prev - 1 + config.options.length) % config.options.length)
          break
        case 'Enter':
          event.preventDefault()
          toggleSelection(highlightedIndex)
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
  }, [isOpen, highlightedIndex, config.options.length])

  function toggleSelection(index: number) {
    setSelectedIndices((prev) => {
      const isSelected = prev.includes(index)
      if (isSelected) {
        return prev.filter((i) => i !== index)
      } else {
        // Check max selection limit
        if (config.maxSelections > 0 && prev.length >= config.maxSelections) {
          return prev
        }
        return [...prev, index]
      }
    })
  }

  const selectedLabels = selectedIndices
    .sort((a, b) => a - b)
    .map((i) => config.options[i])
    .join(', ')

  const displayText = selectedLabels || 'Select options...'

  return (
    <div
      ref={dropdownRef}
      className="multiselectdropdown-element"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        fontFamily: 'Inter, system-ui, sans-serif',
      }}
    >
      {/* Closed state button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          height: '100%',
          backgroundColor: config.backgroundColor,
          color: config.textColor,
          border: `1px solid ${config.borderColor}`,
          borderRadius: `${config.borderRadius}px`,
          padding: '0 32px 0 8px',
          fontSize: '14px',
          cursor: 'pointer',
          textAlign: 'left',
          outline: 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          transition: 'none',
        }}
      >
        {displayText}
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

      {/* Dropdown menu */}
      {isOpen && (
        <div
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
          {config.options.map((option, index) => {
            const isSelected = selectedIndices.includes(index)
            const isHighlighted = highlightedIndex === index

            return (
              <div
                key={index}
                onClick={() => toggleSelection(index)}
                onMouseEnter={() => setHighlightedIndex(index)}
                style={{
                  padding: '8px 12px 8px 32px',
                  cursor: 'pointer',
                  backgroundColor: isHighlighted ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                  color: config.textColor,
                  position: 'relative',
                  transition: 'none',
                }}
              >
                {/* Checkbox */}
                <div
                  style={{
                    position: 'absolute',
                    left: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '16px',
                    height: '16px',
                    border: `1px solid ${config.borderColor}`,
                    borderRadius: '2px',
                    backgroundColor: isSelected ? config.textColor : 'transparent',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'none',
                  }}
                >
                  {isSelected && (
                    <div
                      style={{
                        width: '10px',
                        height: '10px',
                        backgroundColor: config.backgroundColor,
                        clipPath: 'polygon(14% 44%, 0 65%, 50% 100%, 100% 16%, 80% 0%, 43% 62%)',
                        transition: 'none',
                      }}
                    />
                  )}
                </div>
                {option}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
