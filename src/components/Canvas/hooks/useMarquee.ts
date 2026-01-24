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
  didDrag: boolean // True if mouse moved significantly during marquee
}

export function useMarquee(canvasRef: RefObject<HTMLDivElement>) {
  const [marquee, setMarquee] = useState<MarqueeState | null>(null)
  const [justFinishedDrag, setJustFinishedDrag] = useState(false)
  const { active } = useDndContext()
  const isDraggingElement = active?.data.current?.sourceType === 'element'
  const elements = useStore((state) => state.elements)
  const selectMultiple = useStore((state) => state.selectMultiple)
  const isPanning = useStore((state) => state.isPanning)
  const scale = useStore((state) => state.scale)

  // Convert screen coordinates to canvas coordinates
  const screenToCanvas = useCallback(
    (screenX: number, screenY: number) => {
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return { x: 0, y: 0 }

      // Get position relative to the canvas background (getBoundingClientRect already includes transform)
      const relX = screenX - rect.left
      const relY = screenY - rect.top

      // Only divide by scale - the rect already accounts for translation
      const canvasX = relX / scale
      const canvasY = relY / scale

      return { x: canvasX, y: canvasY }
    },
    [scale, canvasRef]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only start marquee on left click, and not during pan mode or element drag
      if (e.button !== 0 || isPanning || isDraggingElement) return

      // Reset the justFinishedDrag flag when starting a new potential drag
      setJustFinishedDrag(false)

      const { x, y } = screenToCanvas(e.clientX, e.clientY)
      setMarquee({
        isActive: true,
        startX: x,
        startY: y,
        currentX: x,
        currentY: y,
        didDrag: false,
      })
    },
    [screenToCanvas, isPanning, isDraggingElement]
  )

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      if (!marquee?.isActive) return

      const { x, y } = screenToCanvas(e.clientX, e.clientY)

      // Check if mouse moved enough to count as a drag (5px threshold)
      const dx = Math.abs(x - marquee.startX)
      const dy = Math.abs(y - marquee.startY)
      const didDrag = dx > 5 || dy > 5

      setMarquee((prev) => (prev ? { ...prev, currentX: x, currentY: y, didDrag: prev.didDrag || didDrag } : null))

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
      if (intersecting.length > 0) {
        selectMultiple(intersecting.map((el) => el.id))
      }
    },
    [marquee, screenToCanvas, elements, selectMultiple]
  )

  const handleMouseUp = useCallback(() => {
    // If we did a real drag (not just a click), set the flag to prevent click from clearing selection
    if (marquee?.didDrag) {
      setJustFinishedDrag(true)
      // Reset the flag after a short delay (after the click event fires)
      setTimeout(() => setJustFinishedDrag(false), 0)
    }
    setMarquee(null)
  }, [marquee?.didDrag])

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
    justFinishedDrag,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
      onMouseLeave: handleMouseUp,
    },
  }
}
