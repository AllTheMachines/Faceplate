import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { TooltipElementConfig } from '../../../../types/elements'

interface TooltipRendererProps {
  config: TooltipElementConfig
}

/**
 * Tooltip Renderer - DOM overlay tooltip with hover detection
 *
 * Designer mode: Shows dashed trigger area outline
 * Runtime mode: Shows tooltip overlay after configured hover delay
 */
export function TooltipRenderer({ config }: TooltipRendererProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showTooltip, setShowTooltip] = useState(false)
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 })
  const triggerRef = useRef<HTMLDivElement>(null)
  const hoverTimerRef = useRef<NodeJS.Timeout>()

  // Handle mouse enter - start hover delay timer
  const handleMouseEnter = () => {
    setIsHovered(true)

    // Clear any existing timer
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
    }

    // Start new timer for configured delay
    hoverTimerRef.current = setTimeout(() => {
      setShowTooltip(true)
      calculateTooltipPosition()
    }, config.hoverDelay)
  }

  // Handle mouse leave - cancel timer and hide tooltip
  const handleMouseLeave = () => {
    setIsHovered(false)
    setShowTooltip(false)

    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current)
      hoverTimerRef.current = undefined
    }
  }

  // Calculate tooltip position based on trigger element and config.position
  const calculateTooltipPosition = () => {
    if (!triggerRef.current) return

    const rect = triggerRef.current.getBoundingClientRect()
    let x = 0
    let y = 0

    switch (config.position) {
      case 'top':
        x = rect.left + rect.width / 2
        y = rect.top - config.offset
        break
      case 'bottom':
        x = rect.left + rect.width / 2
        y = rect.bottom + config.offset
        break
      case 'left':
        x = rect.left - config.offset
        y = rect.top + rect.height / 2
        break
      case 'right':
        x = rect.right + config.offset
        y = rect.top + rect.height / 2
        break
    }

    setTooltipPosition({ x, y })
  }

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (hoverTimerRef.current) {
        clearTimeout(hoverTimerRef.current)
      }
    }
  }, [])

  // Trigger area style (dashed outline for designer visibility)
  const triggerStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    border: '2px dashed rgba(59, 130, 246, 0.5)', // Blue dashed border
    borderRadius: '4px',
    cursor: 'help',
    backgroundColor: isHovered ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
    transition: 'background-color 0.2s ease',
  }

  // Tooltip overlay styles
  const getTooltipTransform = () => {
    switch (config.position) {
      case 'top':
        return 'translate(-50%, -100%)'
      case 'bottom':
        return 'translate(-50%, 0)'
      case 'left':
        return 'translate(-100%, -50%)'
      case 'right':
        return 'translate(0, -50%)'
      default:
        return 'translate(-50%, -100%)'
    }
  }

  const tooltipStyle: React.CSSProperties = {
    position: 'fixed',
    left: `${tooltipPosition.x}px`,
    top: `${tooltipPosition.y}px`,
    transform: getTooltipTransform(),
    backgroundColor: config.backgroundColor,
    color: config.textColor,
    fontSize: `${config.fontSize}px`,
    fontFamily: config.fontFamily,
    fontWeight: config.fontWeight,
    padding: `${config.padding}px`,
    borderRadius: `${config.borderRadius}px`,
    maxWidth: `${config.maxWidth}px`,
    zIndex: config.zIndex,
    pointerEvents: 'none', // Don't block mouse events
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
    opacity: showTooltip ? 1 : 0,
    transition: 'opacity 0.15s ease-out',
  }

  // Arrow styles (positioned based on tooltip position)
  const getArrowStyle = (): React.CSSProperties => {
    const arrowSize = 6
    const baseStyle: React.CSSProperties = {
      position: 'absolute',
      width: 0,
      height: 0,
      borderStyle: 'solid',
    }

    switch (config.position) {
      case 'top':
        return {
          ...baseStyle,
          left: '50%',
          bottom: `-${arrowSize}px`,
          transform: 'translateX(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px 0 ${arrowSize}px`,
          borderColor: `${config.backgroundColor} transparent transparent transparent`,
        }
      case 'bottom':
        return {
          ...baseStyle,
          left: '50%',
          top: `-${arrowSize}px`,
          transform: 'translateX(-50%)',
          borderWidth: `0 ${arrowSize}px ${arrowSize}px ${arrowSize}px`,
          borderColor: `transparent transparent ${config.backgroundColor} transparent`,
        }
      case 'left':
        return {
          ...baseStyle,
          top: '50%',
          right: `-${arrowSize}px`,
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px 0 ${arrowSize}px ${arrowSize}px`,
          borderColor: `transparent transparent transparent ${config.backgroundColor}`,
        }
      case 'right':
        return {
          ...baseStyle,
          top: '50%',
          left: `-${arrowSize}px`,
          transform: 'translateY(-50%)',
          borderWidth: `${arrowSize}px ${arrowSize}px ${arrowSize}px 0`,
          borderColor: `transparent ${config.backgroundColor} transparent transparent`,
        }
      default:
        return baseStyle
    }
  }

  // Render tooltip overlay as portal (DOM overlay)
  const tooltipOverlay = showTooltip && createPortal(
    <div style={tooltipStyle}>
      {config.showArrow && <div style={getArrowStyle()} />}
      <div
        dangerouslySetInnerHTML={{ __html: config.content }}
        style={{ lineHeight: 1.4 }}
      />
    </div>,
    document.body
  )

  return (
    <>
      <div
        ref={triggerRef}
        style={triggerStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      />
      {tooltipOverlay}
    </>
  )
}
