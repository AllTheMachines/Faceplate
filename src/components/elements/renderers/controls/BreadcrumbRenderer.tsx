import { useState } from 'react'
import { BreadcrumbElementConfig, BreadcrumbItem } from '../../../../types/elements'

interface BreadcrumbRendererProps {
  config: BreadcrumbElementConfig
}

export function BreadcrumbRenderer({ config }: BreadcrumbRendererProps) {
  // FIX NAV-04: Track whether ellipsis has been expanded
  const [isExpanded, setIsExpanded] = useState(false)

  // Determine visible items based on maxVisibleItems
  let visibleItems: (BreadcrumbItem | { id: 'ellipsis'; label: '...' })[] = config.items

  // Only collapse if maxVisibleItems is set AND not expanded
  if (!isExpanded && config.maxVisibleItems > 0 && config.items.length > config.maxVisibleItems) {
    // Show first item, ellipsis, and last (maxVisibleItems - 2) items
    const firstItem = config.items[0]
    const lastItems = config.items.slice(-(config.maxVisibleItems - 2))
    visibleItems = [firstItem, { id: 'ellipsis', label: '...' }, ...lastItems]
  }

  const lastIndex = visibleItems.length - 1

  return (
    <div
      className="breadcrumb-element"
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        userSelect: 'none',
        overflow: 'hidden',
        fontSize: `${config.fontSize}px`,
        fontFamily: config.fontFamily,
        fontWeight: config.fontWeight,
      }}
      data-element-type="breadcrumb"
    >
      {visibleItems.map((item, index) => {
        const isLast = index === lastIndex
        const isEllipsis = item.id === 'ellipsis'

        return (
          <div
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flex: isLast ? 1 : '0 0 auto',
              minWidth: 0,
            }}
          >
            {/* Item label */}
            <span
              className={isLast ? 'breadcrumb-current' : 'breadcrumb-link'}
              onClick={() => {
                // FIX NAV-04: Handle clicks on ellipsis and navigation items
                if (isEllipsis) {
                  // Expand to show all items
                  setIsExpanded(true)
                  console.log('Breadcrumb: Expanded to show all items')
                } else if (!isLast) {
                  // Navigation click - in designer mode, log for debugging
                  // In exported runtime, this would trigger actual navigation
                  console.log(`Breadcrumb: Navigate to ${item.id}`)
                }
              }}
              style={{
                color: isLast ? config.currentColor : config.linkColor,
                cursor: isLast ? 'default' : 'pointer',
                textDecoration: 'none',
                transition: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: isLast ? 600 : 400,
              }}
              title={isEllipsis ? 'Click to show all items' : undefined}
              data-breadcrumb-id={item.id}
              data-clickable={!isLast}
            >
              {item.label}
            </span>

            {/* Separator (not after last item) */}
            {!isLast && (
              <span
                className="breadcrumb-separator"
                style={{
                  color: config.separatorColor,
                  userSelect: 'none',
                  flexShrink: 0,
                }}
              >
                {config.separator}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
