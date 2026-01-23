import { useState, useEffect, useRef, useCallback } from 'react'
import { useStore } from '../../../store'

type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

interface UseResizeReturn {
  isResizing: boolean
  startResize: (e: React.MouseEvent, position: HandlePosition, elementId: string) => void
}

export function useResize(): UseResizeReturn {
  const [isResizing, setIsResizing] = useState(false)
  const [activeHandle, setActiveHandle] = useState<HandlePosition | null>(null)
  const [elementId, setElementId] = useState<string | null>(null)

  const startPos = useRef({ x: 0, y: 0 })
  const startBounds = useRef({ x: 0, y: 0, width: 0, height: 0 })

  const scale = useStore((state) => state.scale)
  const getElement = useStore((state) => state.getElement)
  const updateElement = useStore((state) => state.updateElement)

  const startResize = useCallback((e: React.MouseEvent, position: HandlePosition, id: string) => {
    e.stopPropagation()
    e.preventDefault()

    const element = getElement(id)
    if (!element) return

    setIsResizing(true)
    setActiveHandle(position)
    setElementId(id)

    startPos.current = { x: e.clientX, y: e.clientY }
    startBounds.current = {
      x: element.x,
      y: element.y,
      width: element.width,
      height: element.height,
    }
  }, [getElement])

  useEffect(() => {
    if (!isResizing || !activeHandle || !elementId) return

    const handleMouseMove = (e: MouseEvent) => {
      // Calculate delta in canvas space (divide by scale)
      const deltaX = (e.clientX - startPos.current.x) / scale
      const deltaY = (e.clientY - startPos.current.y) / scale

      const MIN_SIZE = 20
      let updates: Partial<{ x: number; y: number; width: number; height: number }> = {}

      // Calculate new bounds based on handle position
      switch (activeHandle) {
        case 'se': // Bottom-right: only change size
          updates = {
            width: Math.max(MIN_SIZE, startBounds.current.width + deltaX),
            height: Math.max(MIN_SIZE, startBounds.current.height + deltaY),
          }
          break
        case 'sw': // Bottom-left: change x, width, height
          const newWidthSW = Math.max(MIN_SIZE, startBounds.current.width - deltaX)
          updates = {
            x: startBounds.current.x + startBounds.current.width - newWidthSW,
            width: newWidthSW,
            height: Math.max(MIN_SIZE, startBounds.current.height + deltaY),
          }
          break
        case 'ne': // Top-right: change y, width, height
          const newHeightNE = Math.max(MIN_SIZE, startBounds.current.height - deltaY)
          updates = {
            y: startBounds.current.y + startBounds.current.height - newHeightNE,
            width: Math.max(MIN_SIZE, startBounds.current.width + deltaX),
            height: newHeightNE,
          }
          break
        case 'nw': // Top-left: change x, y, width, height
          const newWidthNW = Math.max(MIN_SIZE, startBounds.current.width - deltaX)
          const newHeightNW = Math.max(MIN_SIZE, startBounds.current.height - deltaY)
          updates = {
            x: startBounds.current.x + startBounds.current.width - newWidthNW,
            y: startBounds.current.y + startBounds.current.height - newHeightNW,
            width: newWidthNW,
            height: newHeightNW,
          }
          break
        case 'n': // Top edge: only change y and height
          const newHeightN = Math.max(MIN_SIZE, startBounds.current.height - deltaY)
          updates = {
            y: startBounds.current.y + startBounds.current.height - newHeightN,
            height: newHeightN,
          }
          break
        case 's': // Bottom edge: only change height
          updates = {
            height: Math.max(MIN_SIZE, startBounds.current.height + deltaY),
          }
          break
        case 'e': // Right edge: only change width
          updates = {
            width: Math.max(MIN_SIZE, startBounds.current.width + deltaX),
          }
          break
        case 'w': // Left edge: change x and width
          const newWidthW = Math.max(MIN_SIZE, startBounds.current.width - deltaX)
          updates = {
            x: startBounds.current.x + startBounds.current.width - newWidthW,
            width: newWidthW,
          }
          break
      }

      updateElement(elementId, updates)
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setActiveHandle(null)
      setElementId(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, activeHandle, elementId, scale, updateElement])

  return { isResizing, startResize }
}

export function getResizeCursor(position: HandlePosition): string {
  switch (position) {
    case 'nw':
    case 'se':
      return 'nwse-resize'
    case 'ne':
    case 'sw':
      return 'nesw-resize'
    case 'n':
    case 's':
      return 'ns-resize'
    case 'e':
    case 'w':
      return 'ew-resize'
    default:
      return 'default'
  }
}
