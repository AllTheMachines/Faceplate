import { useEffect, useCallback } from 'react'
import { KonvaEventObject } from 'konva/lib/Node'
import { useStore } from '../../../store'

export function usePan() {
  const isPanning = useStore((state) => state.isPanning)
  const setPanning = useStore((state) => state.setPanning)
  const dragStart = useStore((state) => state.dragStart)
  const setDragStart = useStore((state) => state.setDragStart)
  const scale = useStore((state) => state.scale)
  const offsetX = useStore((state) => state.offsetX)
  const offsetY = useStore((state) => state.offsetY)
  const setViewport = useStore((state) => state.setViewport)

  // Track spacebar state with keyboard event listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isPanning) {
        e.preventDefault() // Prevent page scroll
        setPanning(true)
      }
    }

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setPanning(false)
        setDragStart(null)
      }
    }

    // Add event listeners to window for consistent behavior
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    // Clean up event listeners
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [isPanning, setPanning, setDragStart])

  const handleMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!isPanning) return

      const stage = e.target.getStage()
      if (!stage) return

      const pointer = stage.getPointerPosition()
      if (!pointer) return

      // Calculate dragStart: pointer position minus current offset
      setDragStart({
        x: pointer.x - offsetX,
        y: pointer.y - offsetY,
      })
    },
    [isPanning, offsetX, offsetY, setDragStart]
  )

  const handleMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!isPanning || !dragStart) return

      const stage = e.target.getStage()
      if (!stage) return

      const pointer = stage.getPointerPosition()
      if (!pointer) return

      // Calculate new offset: pointer position minus dragStart
      const newOffsetX = pointer.x - dragStart.x
      const newOffsetY = pointer.y - dragStart.y

      setViewport(scale, newOffsetX, newOffsetY)
    },
    [isPanning, dragStart, scale, setViewport]
  )

  const handleMouseUp = useCallback(() => {
    // Clear dragStart (but keep isPanning true if spacebar still held)
    setDragStart(null)
  }, [setDragStart])

  return {
    isPanning,
    handlers: {
      onMouseDown: handleMouseDown,
      onMouseMove: handleMouseMove,
      onMouseUp: handleMouseUp,
    },
  }
}
