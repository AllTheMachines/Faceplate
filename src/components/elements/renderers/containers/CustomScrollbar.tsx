import React, { useRef, useState, useEffect, useCallback } from 'react'

export interface CustomScrollbarConfig {
  width: number
  thumbColor: string
  thumbHoverColor: string
  trackColor: string
  borderRadius: number
  thumbBorder: number
}

interface CustomScrollbarProps {
  contentRef: React.RefObject<HTMLDivElement>
  config: CustomScrollbarConfig
  orientation?: 'vertical' | 'horizontal'
}

// Arrow button component
function ScrollArrow({
  direction,
  config,
  onClick,
  isHovered,
  onMouseEnter,
  onMouseLeave,
}: {
  direction: 'up' | 'down' | 'left' | 'right'
  config: CustomScrollbarConfig
  onClick: () => void
  isHovered: boolean
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  const size = config.width

  // Arrow paths for each direction
  const getArrowPath = () => {
    const pad = Math.floor(size * 0.3)
    const mid = size / 2
    const arrowSize = size - pad * 2

    switch (direction) {
      case 'up':
        return `M${pad},${mid + arrowSize / 4} L${mid},${pad} L${size - pad},${mid + arrowSize / 4}`
      case 'down':
        return `M${pad},${mid - arrowSize / 4} L${mid},${size - pad} L${size - pad},${mid - arrowSize / 4}`
      case 'left':
        return `M${mid + arrowSize / 4},${pad} L${pad},${mid} L${mid + arrowSize / 4},${size - pad}`
      case 'right':
        return `M${mid - arrowSize / 4},${pad} L${size - pad},${mid} L${mid - arrowSize / 4},${size - pad}`
    }
  }

  return (
    <div
      style={{
        width: size,
        height: size,
        backgroundColor: config.trackColor,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        flexShrink: 0,
        borderRadius: config.borderRadius,
      }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <path
          d={getArrowPath()}
          fill="none"
          stroke={isHovered ? config.thumbHoverColor : config.thumbColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  )
}

export function CustomScrollbar({ contentRef, config, orientation = 'vertical' }: CustomScrollbarProps) {
  const [thumbPosition, setThumbPosition] = useState(0)
  const [thumbSize, setThumbSize] = useState(50)
  const [isThumbHovered, setIsThumbHovered] = useState(false)
  const [isArrowHovered, setIsArrowHovered] = useState<'start' | 'end' | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ mousePos: 0, scrollPos: 0 })
  const scrollIntervalRef = useRef<number | null>(null)

  const isVertical = orientation === 'vertical'
  const arrowSize = config.width

  // Calculate thumb size and position based on content
  const updateScrollbar = useCallback(() => {
    const content = contentRef.current
    const track = trackRef.current
    if (!content) return

    const clientSize = isVertical ? content.clientHeight : content.clientWidth
    const scrollSize = isVertical ? content.scrollHeight : content.scrollWidth
    const scrollPos = isVertical ? content.scrollTop : content.scrollLeft

    // Check if scrollbar is needed
    const needsScrollbar = scrollSize > clientSize
    setIsVisible(needsScrollbar)

    if (!needsScrollbar) return

    // Use actual track element size if available, otherwise estimate
    const trackSize = track
      ? (isVertical ? track.clientHeight : track.clientWidth)
      : clientSize - arrowSize * 2

    // Calculate thumb size (proportional to visible area)
    const ratio = clientSize / scrollSize
    const minThumbSize = 30
    const calculatedThumbSize = Math.max(minThumbSize, trackSize * ratio)
    setThumbSize(calculatedThumbSize)

    // Calculate thumb position within track area
    const maxScroll = scrollSize - clientSize
    const maxThumbPos = trackSize - calculatedThumbSize
    const thumbPos = maxScroll > 0 ? (scrollPos / maxScroll) * maxThumbPos : 0
    setThumbPosition(thumbPos)
  }, [contentRef, isVertical, arrowSize])

  // Listen to scroll events and size changes
  useEffect(() => {
    const content = contentRef.current
    if (!content) return

    updateScrollbar()

    content.addEventListener('scroll', updateScrollbar)
    const resizeObserver = new ResizeObserver(updateScrollbar)
    resizeObserver.observe(content)

    return () => {
      content.removeEventListener('scroll', updateScrollbar)
      resizeObserver.disconnect()
    }
  }, [contentRef, updateScrollbar])

  // Re-calculate after track element is rendered
  useEffect(() => {
    if (isVisible && trackRef.current) {
      // Use requestAnimationFrame to ensure DOM has updated
      const rafId = requestAnimationFrame(updateScrollbar)
      return () => cancelAnimationFrame(rafId)
    }
  }, [isVisible, updateScrollbar])

  // Arrow scroll handlers
  const scrollByAmount = (amount: number) => {
    const content = contentRef.current
    if (!content) return

    if (isVertical) {
      content.scrollTop += amount
    } else {
      content.scrollLeft += amount
    }
  }

  // startContinuousScroll available for future arrow hold-to-scroll feature
  // const startContinuousScroll = (amount: number) => {
  //   scrollByAmount(amount)
  //   scrollIntervalRef.current = window.setInterval(() => scrollByAmount(amount), 50)
  // }

  const stopContinuousScroll = () => {
    if (scrollIntervalRef.current) {
      clearInterval(scrollIntervalRef.current)
      scrollIntervalRef.current = null
    }
  }

  useEffect(() => {
    return () => stopContinuousScroll()
  }, [])

  // Handle thumb drag
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

      const currentMousePos = isVertical ? e.clientY : e.clientX
      const delta = currentMousePos - dragStartRef.current.mousePos

      const clientSize = isVertical ? content.clientHeight : content.clientWidth
      const scrollSize = isVertical ? content.scrollHeight : content.scrollWidth
      const trackSize = clientSize - arrowSize * 2

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

  // Handle track click (jump to position)
  const handleTrackClick = (e: React.MouseEvent) => {
    const content = contentRef.current
    const track = trackRef.current
    if (!content || !track) return

    // Don't handle if clicking on thumb
    if ((e.target as HTMLElement).dataset.thumb === 'true') return

    const rect = track.getBoundingClientRect()
    const clickPos = isVertical
      ? e.clientY - rect.top - thumbSize / 2
      : e.clientX - rect.left - thumbSize / 2

    const clientSize = isVertical ? content.clientHeight : content.clientWidth
    const scrollSize = isVertical ? content.scrollHeight : content.scrollWidth
    const trackSize = clientSize - arrowSize * 2

    const scrollRatio = (scrollSize - clientSize) / (trackSize - thumbSize)
    const newScrollPos = clickPos * scrollRatio

    if (isVertical) {
      content.scrollTop = Math.max(0, newScrollPos)
    } else {
      content.scrollLeft = Math.max(0, newScrollPos)
    }
  }

  if (!isVisible) return null

  // Calculate thumb dimensions accounting for border
  const thumbTrackWidth = config.width
  const thumbBorder = config.thumbBorder
  const thumbWidth = thumbTrackWidth - thumbBorder * 2

  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    [isVertical ? 'right' : 'bottom']: 0,
    [isVertical ? 'top' : 'left']: 0,
    [isVertical ? 'width' : 'height']: config.width,
    [isVertical ? 'height' : 'width']: '100%',
    display: 'flex',
    flexDirection: isVertical ? 'column' : 'row',
    backgroundColor: config.trackColor,
    zIndex: 10,
  }

  const trackStyle: React.CSSProperties = {
    flex: 1,
    position: 'relative',
    cursor: 'pointer',
  }

  const thumbStyle: React.CSSProperties = {
    position: 'absolute',
    [isVertical ? 'top' : 'left']: thumbPosition,
    [isVertical ? 'left' : 'top']: thumbBorder,
    [isVertical ? 'width' : 'height']: thumbWidth,
    [isVertical ? 'height' : 'width']: thumbSize,
    backgroundColor: isThumbHovered || isDragging ? config.thumbHoverColor : config.thumbColor,
    borderRadius: config.borderRadius,
    cursor: isDragging ? 'grabbing' : 'grab',
    transition: isDragging ? 'none' : 'background-color 0.15s ease',
    boxSizing: 'border-box',
  }

  return (
    <div style={containerStyle}>
      <ScrollArrow
        direction={isVertical ? 'up' : 'left'}
        config={config}
        onClick={() => scrollByAmount(-30)}
        isHovered={isArrowHovered === 'start'}
        onMouseEnter={() => setIsArrowHovered('start')}
        onMouseLeave={() => setIsArrowHovered(null)}
      />
      <div
        ref={trackRef}
        style={trackStyle}
        onClick={handleTrackClick}
      >
        <div
          data-thumb="true"
          style={thumbStyle}
          onMouseDown={handleMouseDown}
          onMouseEnter={() => setIsThumbHovered(true)}
          onMouseLeave={() => !isDragging && setIsThumbHovered(false)}
        />
      </div>
      <ScrollArrow
        direction={isVertical ? 'down' : 'right'}
        config={config}
        onClick={() => scrollByAmount(30)}
        isHovered={isArrowHovered === 'end'}
        onMouseEnter={() => setIsArrowHovered('end')}
        onMouseLeave={() => setIsArrowHovered(null)}
      />
    </div>
  )
}
