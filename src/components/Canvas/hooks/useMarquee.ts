import { useState, useCallback, RefObject } from 'react'
import { useDndContext } from '@dnd-kit/core'
import { useStore } from '../../../store'
import { intersectRect, Rect } from '../../../utils/intersection'

interface MarqueeState {
  isActive: boolean
  startX: number // Canvas-relative start position
  startY: number
  currentX: number // Canvas-relative current position
  currentY: number
}

export function useMarquee(canvasRef: RefObject<HTMLDivElement>) {
  const [marquee, setMarquee] = useState<MarqueeState | null>(null)
  const { active } = useDndContext()
  const isDraggingElement = active?.data.current?.sourceType === 'element'
  const elements = useStore((state) => state.elements)
  const selectMultiple = useStore((state) => state.selectMultiple)
  const isPanning = useStore((state) => state.isPanning)
  const scale = useStore((state) => state.scale)
  const offsetX = useStore((state) => state.offsetX)
  const offsetY = useStore((state) => state.offsetY)

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return { x: 0, y: 0 }

      // Get position relative to viewport container
      const relX = screenX - rect.left
      const relY = screenY - rect.top

      // Reverse the transform: first un-offset, then un-scale
      const canvasX = (relX - offsetX) / scale
      const canvasY = (relY - offsetY) / scale

      return { x: canvasX, y: canvasY }
    },
    [scale, offsetX, offsetY, canvasRef]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only start marquee on left click, and not during pan mode or element drag
      if (e.button !== 0 || isPanning || isDraggingElement) return

      const { x, y } = screenToCanvas(e.clientX, e.clientY)
      setMarquee({
        isActive: true,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
      })
    },
    [screenToCanvas, isPanning, isDraggingElement]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!marquee?.isActive) return

      const { x, y } = screenToCanvas(e.clientX, e.clientY)
      setMarquee((prev) => (prev ? { ...prev, currentX: x, currentY: y } : null))

      // Calculate marquee rect (handle negative dimensions)
      const marqueeRect: Rect = {
        left: Math.min(marquee.startX, x),
        top: Math.min(marquee.startY, y),
        right: Math.max(marquee.startX, x),
        bottom: Math.max(marquee.startY, y),
      }

      // Find intersecting elements
      const intersecting = elements.filter((el) => {
        const elRect: Rect = {
          left: el.x,
          top: el.y,
          right: el.x + el.width,
          bottom: el.y + el.height,
        }
        return intersectRect(marqueeRect, elRect)
      })

      // Update selection with intersecting element IDs
      // Only clear selection on background click, not during marquee drag
      if (intersecting.length > 0) {
        selectMultiple(intersecting.map((el) => el.id))
      }
    },
    [marquee, screenToCanvas, elements, selectMultiple]
  )

  const handleMouseUp = useCallback(() => {
    setMarquee(null)
  }, [])

  // Calculate marquee rect for rendering (in canvas coordinates)
  const marqueeRect = marquee
    ? {
        x: Math.min(marquee.startX, marquee.currentX),
        y: Math.min(marquee.startY, marquee.currentY),
        width: Math.abs(marquee.currentX - marquee.startX),
        height: Math.abs(marquee.currentY - marquee.startY),
      }
    : null

  return {
    marqueeRect,
    isActive: marquee?.isActive ?? false,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
    },
  }
}
