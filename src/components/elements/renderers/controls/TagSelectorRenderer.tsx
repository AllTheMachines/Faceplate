import { TagSelectorElementConfig } from '../../../../types/elements'
import { useState, useRef, useEffect } from 'react'
import { DEFAULT_SCROLLBAR_CONFIG } from '../../../../types/elements/containers'
import { CustomScrollbar } from '../containers/CustomScrollbar'

interface TagSelectorRendererProps {
  config: TagSelectorElementConfig
}

/**
 * TagSelectorRenderer
 *
 * Renders a tag selector with chips that can be removed via X button.
 * Features:
 * - Selected tags displayed as chips with X button
 * - Input field with dropdown to add tags from available options
 * - Click-outside handling to close dropdown
 */
export function TagSelectorRenderer({ config }: TagSelectorRendererProps) {
  const {
    selectedTags,
    availableTags,
    showInput,
    inputPlaceholder,
    inputBackgroundColor,
    inputTextColor,
    inputBorderColor,
    chipBackgroundColor,
    chipTextColor,
    chipRemoveColor,
    chipBorderRadius,
    dropdownBackgroundColor,
    dropdownTextColor,
    dropdownHoverColor,
  } = config

  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [filterText, setFilterText] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  // Scrollbar config with defaults
  const scrollbarConfig = {
    width: config.scrollbarWidth ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarWidth,
    thumbColor: config.scrollbarThumbColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbColor,
    thumbHoverColor: config.scrollbarThumbHoverColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbHoverColor,
    trackColor: config.scrollbarTrackColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarTrackColor,
    borderRadius: config.scrollbarBorderRadius ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarBorderRadius,
    thumbBorder: config.scrollbarThumbBorder ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbBorder,
  }

  // Unique class for scoped dropdown scrollbar styling
  const dropdownClass = `tagselector-dropdown-${config.id?.replace(/-/g, '') || 'default'}`

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
        setFilterText('')
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
      }
    }
  }, [dropdownOpen])

  // Filter available tags (exclude already selected)
  const selectedIds = new Set(selectedTags.map((t) => t.id))
  const filteredAvailable = availableTags.filter((tag) => {
    if (selectedIds.has(tag.id)) return false
    if (filterText) {
      return tag.label.toLowerCase().includes(filterText.toLowerCase())
    }
    return true
  })

  return (
    <div
      className="tagselector-element"
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        backgroundColor: inputBackgroundColor,
        border: `1px solid ${inputBorderColor}`,
        borderRadius: '4px',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Scrollable content */}
      <div
        ref={contentRef}
        className={`tagselector-content-${config.id?.replace(/-/g, '') || 'default'}`}
        style={{
          width: `calc(100% - ${scrollbarConfig.width}px)`,
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          padding: '8px',
          overflow: 'auto',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
      {/* Selected tags as chips */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
        }}
      >
        {selectedTags.map((tag) => (
          <div
            key={tag.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 8px',
              backgroundColor: chipBackgroundColor,
              color: chipTextColor,
              borderRadius: `${chipBorderRadius}px`,
              fontSize: `${config.fontSize}px`,
              fontFamily: config.fontFamily,
              fontWeight: config.fontWeight,
              whiteSpace: 'nowrap',
            }}
          >
            <span>{tag.label}</span>
            <button
              style={{
                width: '16px',
                height: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'transparent',
                border: 'none',
                color: chipRemoveColor,
                cursor: 'pointer',
                padding: 0,
                fontSize: '14px',
                fontWeight: 'bold',
                transition: 'none',
              }}
              aria-label={`Remove ${tag.label}`}
            >
              ×
            </button>
          </div>
        ))}
      </div>

      {/* Input field with dropdown */}
      {showInput && (
        <div
          ref={dropdownRef}
          style={{
            position: 'relative',
          }}
        >
          <input
            type="text"
            placeholder={inputPlaceholder}
            value={filterText}
            onChange={(e) => {
              setFilterText(e.target.value)
              setDropdownOpen(true)
            }}
            onFocus={() => setDropdownOpen(true)}
            style={{
              width: '100%',
              padding: '6px 8px',
              backgroundColor: inputBackgroundColor,
              color: inputTextColor,
              border: `1px solid ${inputBorderColor}`,
              borderRadius: '4px',
              fontSize: `${config.fontSize}px`,
              fontFamily: config.fontFamily,
              fontWeight: config.fontWeight,
              outline: 'none',
              transition: 'none',
            }}
          />

          {/* Dropdown list */}
          {dropdownOpen && (
            <div
              className={dropdownClass}
              style={{
                position: 'absolute',
                top: '100%',
                left: 0,
                right: 0,
                marginTop: '4px',
                backgroundColor: dropdownBackgroundColor,
                border: `1px solid ${inputBorderColor}`,
                borderRadius: '4px',
                maxHeight: '150px',
                overflowY: 'auto',
                zIndex: 1000,
                boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
              }}
            >
              {filteredAvailable.length > 0 ? (
                filteredAvailable.map((tag) => (
                  <div
                    key={tag.id}
                    style={{
                      padding: '8px 12px',
                      color: dropdownTextColor,
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontFamily: 'Inter, system-ui, sans-serif',
                      transition: 'none',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = dropdownHoverColor
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent'
                    }}
                  >
                    {tag.label}
                  </div>
                ))
              ) : filterText ? (
                <div
                  style={{
                    padding: '8px 12px',
                    color: '#6b7280',
                    fontStyle: 'italic',
                    fontSize: '13px',
                    fontFamily: 'Inter, system-ui, sans-serif',
                  }}
                >
                  No matching tags
                </div>
              ) : null}
            </div>
          )}
        </div>
      )}
      </div>

      {/* Custom scrollbar */}
      <CustomScrollbar
        contentRef={contentRef}
        config={scrollbarConfig}
        orientation="vertical"
      />

      {/* Hide webkit scrollbar for main content */}
      <style>{`
        .tagselector-content-${config.id?.replace(/-/g, '') || 'default'}::-webkit-scrollbar {
          display: none;
          width: 0;
          height: 0;
        }
        /* Dropdown scrollbar styling */
        .${dropdownClass}::-webkit-scrollbar {
          width: ${scrollbarConfig.width}px;
        }
        .${dropdownClass}::-webkit-scrollbar-track {
          background: ${scrollbarConfig.trackColor};
          border-radius: ${scrollbarConfig.borderRadius}px;
        }
        .${dropdownClass}::-webkit-scrollbar-thumb {
          background: ${scrollbarConfig.thumbColor};
          border-radius: ${scrollbarConfig.borderRadius}px;
        }
        .${dropdownClass}::-webkit-scrollbar-thumb:hover {
          background: ${scrollbarConfig.thumbHoverColor};
        }
        .${dropdownClass} {
          scrollbar-width: thin;
          scrollbar-color: ${scrollbarConfig.thumbColor} ${scrollbarConfig.trackColor};
        }
      `}</style>
    </div>
  )
}
