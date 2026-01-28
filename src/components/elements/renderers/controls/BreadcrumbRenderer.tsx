import { BreadcrumbElementConfig, BreadcrumbItem } from '../../../../types/elements'

interface BreadcrumbRendererProps {
  config: BreadcrumbElementConfig
}

export function BreadcrumbRenderer({ config }: BreadcrumbRendererProps) {
  // Determine visible items based on maxVisibleItems
  let visibleItems: (BreadcrumbItem | { id: 'ellipsis'; label: '...' })[] = config.items

  if (config.maxVisibleItems > 0 && config.items.length > config.maxVisibleItems) {
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
              style={{
                color: isLast ? config.currentColor : config.linkColor,
                cursor: isLast || isEllipsis ? 'default' : 'pointer',
                textDecoration: 'none',
                transition: 'none',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                fontWeight: isLast ? 600 : 400,
              }}
              data-breadcrumb-id={item.id}
              data-clickable={!isLast && !isEllipsis}
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
