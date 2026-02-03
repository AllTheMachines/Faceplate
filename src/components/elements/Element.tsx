import React, { Suspense, useMemo, useRef, useState, useEffect, useCallback } from 'react'
import { ElementConfig } from '../../types/elements'
import { ScrollbarConfig, DEFAULT_SCROLLBAR_CONFIG } from '../../types/elements/containers'
import { useStore } from '../../store'
import { BaseElement } from './BaseElement'
import { getRenderer } from './renderers'
import { useLicense } from '../../hooks/useLicense'

// Container types that can have children
const CONTAINER_TYPES = ['panel', 'frame', 'groupbox', 'collapsible', 'windowchrome', 'tooltip']

// Scroll Arrow Component
function ScrollArrow({
  direction,
  size,
  thumbColor,
  thumbHoverColor,
  trackColor,
  borderRadius,
  onClick,
}: {
  direction: 'up' | 'down' | 'left' | 'right'
  size: number
  thumbColor: string
  thumbHoverColor: string
  trackColor: string
  borderRadius: number
  onClick: () => void
}) {
  const [isHovered, setIsHovered] = useState(false)

  const getArrowPath = () => {
    const pad = Math.floor(size * 0.3)
    const mid = size / 2
    const arrowLen = size - pad * 2

    switch (direction) {
      case 'up':
        return `M${pad},${mid + arrowLen / 4} L${mid},${pad} L${size - pad},${mid + arrowLen / 4}`
      case 'down':
        return `M${pad},${mid - arrowLen / 4} L${mid},${size - pad} L${size - pad},${mid - arrowLen / 4}`
      case 'left':
        return `M${mid + arrowLen / 4},${pad} L${pad},${mid} L${mid + arrowLen / 4},${size - pad}`
      case 'right':
        return `M${mid - arrowLen / 4},${pad} L${size - pad},${mid} L${mid - arrowLen / 4},${size - pad}`
    }
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: trackColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        borderRadius: borderRadius,
        pointerEvents: 'auto',
      }}
      onClick={(e) => {
        e.stopPropagation()
        onClick()
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path
          d={getArrowPath()}
          fill="none"
          stroke={isHovered ? thumbHoverColor : thumbColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

// Custom Scrollbar Component with Arrows
interface CustomScrollbarProps {
  contentRef: React.RefObject<HTMLDivElement>
  config: ScrollbarConfig
  orientation: 'vertical' | 'horizontal'
  cornerSize?: number // Size of corner when both scrollbars present
}

function CustomScrollbar({ contentRef, config, orientation, cornerSize = 0 }: CustomScrollbarProps) {
  const [thumbPosition, setThumbPosition] = useState(0)
  const [thumbSize, setThumbSize] = useState(50)
  const [isThumbHovered, setIsThumbHovered] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ mousePos: 0, scrollPos: 0 })

  const sbWidth = config.scrollbarWidth ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarWidth
  const sbThumbColor = config.scrollbarThumbColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbColor
  const sbThumbHoverColor = config.scrollbarThumbHoverColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbHoverColor
  const sbTrackColor = config.scrollbarTrackColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarTrackColor
  const sbBorderRadius = config.scrollbarBorderRadius ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarBorderRadius
  const sbThumbBorder = config.scrollbarThumbBorder ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbBorder

  const isVertical = orientation === 'vertical'
  const arrowSize = sbWidth

  const updateScrollbar = useCallback(() => {
    const content = contentRef.current
    if (!content) return

    const clientSize = isVertical ? content.clientHeight : content.clientWidth
    const scrollSize = isVertical ? content.scrollHeight : content.scrollWidth
    const scrollPos = isVertical ? content.scrollTop : content.scrollLeft

    const needsScrollbar = scrollSize > clientSize + 1 // +1 for rounding
    setIsVisible(needsScrollbar)

    if (!needsScrollbar) return

    // Track area for thumb (excluding arrows and corner)
    const totalHeight = clientSize - cornerSize
    const trackSize = totalHeight - arrowSize * 2

    const ratio = clientSize / scrollSize
    const minThumbSize = 30
    const calculatedThumbSize = Math.max(minThumbSize, trackSize * ratio)
    setThumbSize(calculatedThumbSize)

    const maxScroll = scrollSize - clientSize
    const maxThumbPos = trackSize - calculatedThumbSize
    const thumbPos = maxScroll > 0 ? (scrollPos / maxScroll) * maxThumbPos : 0
    setThumbPosition(thumbPos)
  }, [contentRef, isVertical, cornerSize, arrowSize])

  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    updateScrollbar()
    content.addEventListener('scroll', updateScrollbar)

    const resizeObserver = new ResizeObserver(updateScrollbar)
    resizeObserver.observe(content)

    const mutationObserver = new MutationObserver(updateScrollbar)
    mutationObserver.observe(content, { childList: true, subtree: true })

    return () => {
      content.removeEventListener('scroll', updateScrollbar)
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [contentRef, updateScrollbar])

  const scrollByAmount = (amount: number) => {
    const content = contentRef.current
    if (!content) return

    if (isVertical) {
      content.scrollTop += amount
    } else {
      content.scrollLeft += amount
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    const content = contentRef.current
    if (!content) return

    setIsDragging(true)
    dragStartRef.current = {
      mousePos: isVertical ? e.clientY : e.clientX,
      scrollPos: isVertical ? content.scrollTop : content.scrollLeft,
    }

    const handleMouseMove = (e: MouseEvent) => {
      const content = contentRef.current
      if (!content) return

      const currentPos = isVertical ? e.clientY : e.clientX
      const delta = currentPos - dragStartRef.current.mousePos
      const clientSize = isVertical ? content.clientHeight : content.clientWidth
      const scrollSize = isVertical ? content.scrollHeight : content.scrollWidth
      const totalHeight = clientSize - cornerSize
      const trackSize = totalHeight - arrowSize * 2
      const scrollRatio = (scrollSize - clientSize) / (trackSize - thumbSize)
      const newScrollPos = dragStartRef.current.scrollPos + delta * scrollRatio

      if (isVertical) {
        content.scrollTop = newScrollPos
      } else {
        content.scrollLeft = newScrollPos
      }
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  const handleTrackClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.thumb) return

    const content = contentRef.current
    const track = trackRef.current
    if (!content || !track) return

    const rect = track.getBoundingClientRect()
    const clickPos = isVertical
      ? e.clientY - rect.top - thumbSize / 2
      : e.clientX - rect.left - thumbSize / 2
    const clientSize = isVertical ? content.clientHeight : content.clientWidth
    const scrollSize = isVertical ? content.scrollHeight : content.scrollWidth
    const totalHeight = clientSize - cornerSize
    const trackSize = totalHeight - arrowSize * 2
    const scrollRatio = (scrollSize - clientSize) / (trackSize - thumbSize)
    const newScrollPos = Math.max(0, clickPos * scrollRatio)

    if (isVertical) {
      content.scrollTop = newScrollPos
    } else {
      content.scrollLeft = newScrollPos
    }
  }

  if (!isVisible) return null

  const thumbWidth = sbThumbBorder > 0 ? sbWidth - sbThumbBorder * 2 : sbWidth

  const containerStyle: React.CSSProperties = isVertical
    ? {
        position: 'absolute',
        right: 0,
        top: 0,
        width: sbWidth,
        height: cornerSize > 0 ? `calc(100% - ${cornerSize}px)` : '100%',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: sbTrackColor,
        zIndex: 100,
        pointerEvents: 'auto',
      }
    : {
        position: 'absolute',
        left: 0,
        bottom: 0,
        height: sbWidth,
        width: cornerSize > 0 ? `calc(100% - ${cornerSize}px)` : '100%',
        display: 'flex',
        flexDirection: 'row',
        backgroundColor: sbTrackColor,
        zIndex: 100,
        pointerEvents: 'auto',
      }

  const trackStyle: React.CSSProperties = {
    flex: 1,
    position: 'relative',
    cursor: 'pointer',
  }

  const thumbStyle: React.CSSProperties = isVertical
    ? {
        position: 'absolute',
        top: thumbPosition,
        left: sbThumbBorder,
        width: thumbWidth,
        height: thumbSize,
        backgroundColor: isThumbHovered || isDragging ? sbThumbHoverColor : sbThumbColor,
        borderRadius: sbBorderRadius,
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'background-color 0.15s ease',
        boxSizing: 'border-box',
      }
    : {
        position: 'absolute',
        left: thumbPosition,
        top: sbThumbBorder,
        height: thumbWidth,
        width: thumbSize,
        backgroundColor: isThumbHovered || isDragging ? sbThumbHoverColor : sbThumbColor,
        borderRadius: sbBorderRadius,
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'background-color 0.15s ease',
        boxSizing: 'border-box',
      }

  return (
    <div style={containerStyle}>
      <ScrollArrow
        direction={isVertical ? 'up' : 'left'}
        size={arrowSize}
        thumbColor={sbThumbColor}
        thumbHoverColor={sbThumbHoverColor}
        trackColor={sbTrackColor}
        borderRadius={sbBorderRadius}
        onClick={() => scrollByAmount(-30)}
      />
      <div
        ref={trackRef}
        onClick={handleTrackClick}
        style={trackStyle}
      >
        <div
          data-thumb="true"
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setIsThumbHovered(true)}
          onMouseLeave={() => !isDragging && setIsThumbHovered(false)}
          style={thumbStyle}
        />
      </div>
      <ScrollArrow
        direction={isVertical ? 'down' : 'right'}
        size={arrowSize}
        thumbColor={sbThumbColor}
        thumbHoverColor={sbThumbHoverColor}
        trackColor={sbTrackColor}
        borderRadius={sbBorderRadius}
        onClick={() => scrollByAmount(30)}
      />
    </div>
  )
}

// Corner piece when both scrollbars are visible
function ScrollbarCorner({ config }: { config: ScrollbarConfig }) {
  const sbWidth = config.scrollbarWidth ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarWidth
  const sbTrackColor = config.scrollbarTrackColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarTrackColor
  const sbBorderRadius = config.scrollbarBorderRadius ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarBorderRadius

  return (
    <div
      style={{
        position: 'absolute',
        right: 0,
        bottom: 0,
        width: sbWidth,
        height: sbWidth,
        backgroundColor: sbTrackColor,
        borderRadius: sbBorderRadius,
        zIndex: 100,
        pointerEvents: 'auto',
      }}
    />
  )
}

// Fallback component shown during async renderer loading
function RendererFallback() {
  return (
    <div style={{ padding: '8px', color: '#666' }}>
      Loading...
    </div>
  )
}

interface ElementProps {
  element: ElementConfig
}

function ElementComponent({ element }: ElementProps) {
  const selectElement = useStore((state) => state.selectElement)
  const toggleSelection = useStore((state) => state.toggleSelection)
  const addToSelection = useStore((state) => state.addToSelection)
  const selectedIds = useStore((state) => state.selectedIds)
  const lockAllMode = useStore((state) => state.lockAllMode)
  const elements = useStore((state) => state.elements)
  const childrenRef = useRef<HTMLDivElement>(null)
  const [isHoldingAltCtrl, setIsHoldingAltCtrl] = useState(false)
  const { isPro: userIsPro } = useLicense()
  const showProBadge = element.isPro && !userIsPro

  // Track Alt/Ctrl key state for cursor feedback
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) {
        setIsHoldingAltCtrl(true)
      }
    }
    const handleKeyUp = (e: KeyboardEvent) => {
      if (!e.altKey && !e.ctrlKey && !e.metaKey) {
        setIsHoldingAltCtrl(false)
      }
    }
    const handleBlur = () => setIsHoldingAltCtrl(false)

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('blur', handleBlur)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  const childElements = useMemo(() => {
    if (!CONTAINER_TYPES.includes(element.type)) return []
    const containerConfig = element as ElementConfig & { children?: string[] }
    if (!containerConfig.children || containerConfig.children.length === 0) return []
    return elements.filter((el) => containerConfig.children!.includes(el.id))
  }, [element, elements])

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (lockAllMode) return

    const selectedIds = useStore.getState().selectedIds
    const isAlreadySelected = selectedIds.includes(element.id)
    const isAltOrCtrl = e.altKey || e.ctrlKey || e.metaKey

    if (e.shiftKey) {
      // Shift+click: Add to selection
      addToSelection(element.id)
    } else if (isAltOrCtrl && isAlreadySelected) {
      // Alt/Ctrl+click on selected: Remove from selection
      toggleSelection(element.id)
    } else if (isAltOrCtrl && !isAlreadySelected) {
      // Alt/Ctrl+click on unselected: Add to selection
      addToSelection(element.id)
    } else if (isAlreadySelected && selectedIds.length > 1) {
      // Plain click on already selected: keep selection
    } else {
      // Plain click: Select only this element
      selectElement(element.id)
    }
  }

  const Renderer = getRenderer(element.type)

  if (!Renderer) {
    console.warn(`No renderer found for element type: ${element.type}`)
    return null
  }

  const containerConfig = element as ElementConfig & {
    allowScroll?: boolean
    scrollBehavior?: 'auto' | 'hidden' | 'scroll'
  } & ScrollbarConfig

  const allowScroll = element.type === 'collapsible'
    ? containerConfig.scrollBehavior !== 'hidden'
    : containerConfig.allowScroll ?? false

  const sbWidth = containerConfig.scrollbarWidth ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarWidth

  // Track if we need both scrollbars
  const [needsVScroll, setNeedsVScroll] = useState(false)
  const [needsHScroll, setNeedsHScroll] = useState(false)

  useEffect(() => {
    const content = childrenRef.current
    if (!content || !allowScroll) {
      setNeedsVScroll(false)
      setNeedsHScroll(false)
      return
    }

    const checkScrollbars = () => {
      setNeedsVScroll(content.scrollHeight > content.clientHeight + 1)
      setNeedsHScroll(content.scrollWidth > content.clientWidth + 1)
    }

    checkScrollbars()
    const resizeObserver = new ResizeObserver(checkScrollbars)
    resizeObserver.observe(content)
    const mutationObserver = new MutationObserver(checkScrollbars)
    mutationObserver.observe(content, { childList: true, subtree: true })

    return () => {
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [allowScroll, childElements])

  const bothScrollbars = needsVScroll && needsHScroll

  const isSelected = selectedIds.includes(element.id)

  return (
    <BaseElement element={element} onClick={handleClick} isHoldingAltCtrl={isHoldingAltCtrl && isSelected}>
      <Suspense fallback={<RendererFallback />}>
        <Renderer config={element} />
      </Suspense>
      {/* Pro badge overlay for unlicensed users */}
      {showProBadge && (
        <div
          className="absolute bg-violet-500 text-white font-bold px-2 py-1 rounded pointer-events-none select-none z-50"
          style={{
            fontSize: '10px',
            lineHeight: '12px',
            top: '-4px',
            right: '-4px',
          }}
        >
          PRO
        </div>
      )}
      {/* Render children inside container with custom scrollbar */}
      {childElements.length > 0 && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            overflow: 'hidden',
            pointerEvents: 'none',
          }}
        >
          <div
            ref={childrenRef}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: allowScroll && needsVScroll ? `calc(100% - ${sbWidth}px)` : '100%',
              height: allowScroll && needsHScroll ? `calc(100% - ${sbWidth}px)` : '100%',
              overflow: allowScroll ? 'auto' : 'hidden',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            className="hide-native-scrollbar"
          >
            <style>{`.hide-native-scrollbar::-webkit-scrollbar { display: none; }`}</style>
            {childElements.map((child) => (
              <Element key={child.id} element={child} />
            ))}
          </div>
          {allowScroll && needsVScroll && (
            <CustomScrollbar
              contentRef={childrenRef}
              config={containerConfig}
              orientation="vertical"
              cornerSize={bothScrollbars ? sbWidth : 0}
            />
          )}
          {allowScroll && needsHScroll && (
            <CustomScrollbar
              contentRef={childrenRef}
              config={containerConfig}
              orientation="horizontal"
              cornerSize={bothScrollbars ? sbWidth : 0}
            />
          )}
          {allowScroll && bothScrollbars && (
            <ScrollbarCorner config={containerConfig} />
          )}
        </div>
      )}
    </BaseElement>
  )
}

export const Element = React.memo(ElementComponent)
