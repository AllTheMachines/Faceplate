import { useEffect, RefObject } from 'react'
import { useStore } from '../../../store'

const MIN_SCALE = 0.1
const MAX_SCALE = 10

export function useZoom(viewportRef: RefObject<HTMLDivElement>) {
  const scale = useStore((state) => state.scale)
  const offsetX = useStore((state) => state.offsetX)
  const offsetY = useStore((state) => state.offsetY)
  const setViewport = useStore((state) => state.setViewport)

  useEffect(() => {
    const element = viewportRef.current
    if (!element) return

    const handleWheel = (e: WheelEvent) => {
      // Prevent default browser scroll
      e.preventDefault()

      // Get viewport bounds
      const rect = element.getBoundingClientRect()

      // Calculate pointer position relative to viewport
      const pointer = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      }

      // Determine zoom direction
      // For trackpad pinch (ctrlKey is true): use -deltaY
      // For scroll wheel: use deltaY
      // Positive = zoom out, negative = zoom in
      const deltaY = e.ctrlKey ? -e.deltaY : e.deltaY

      // Calculate scale factor: 1.05 for zoom in, 0.95 for zoom out (5% per step)
      const scaleFactor = deltaY < 0 ? 1.05 : 0.95

      // Get current state values
      const currentScale = useStore.getState().scale
      const currentOffsetX = useStore.getState().offsetX
      const currentOffsetY = useStore.getState().offsetY

      // Calculate new scale: clamp between MIN_SCALE and MAX_SCALE
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, currentScale * scaleFactor))

      // Calculate point under cursor BEFORE zoom: (pointer - offset) / currentScale
      const pointX = (pointer.x - currentOffsetX) / currentScale
      const pointY = (pointer.y - currentOffsetY) / currentScale

      // Calculate new offset to keep point stationary: pointer - (point * newScale)
      const newOffsetX = pointer.x - pointX * newScale
      const newOffsetY = pointer.y - pointY * newScale

      useStore.getState().setViewport(newScale, newOffsetX, newOffsetY)
    }

    // Add event listener with { passive: false } to allow preventDefault
    element.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      element.removeEventListener('wheel', handleWheel)
    }
  }, [viewportRef, scale, offsetX, offsetY, setViewport])
}
