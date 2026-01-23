import { useCallback } from 'react'
import { KonvaEventObject } from 'konva/lib/Node'
import { useStore } from '../../../store'

const MIN_SCALE = 0.1
const MAX_SCALE = 10

export function useZoom() {
  const scale = useStore((state) => state.scale)
  const offsetX = useStore((state) => state.offsetX)
  const offsetY = useStore((state) => state.offsetY)
  const setViewport = useStore((state) => state.setViewport)

  const handleWheel = useCallback(
    (e: KonvaEventObject<WheelEvent>) => {
      // Prevent default browser scroll
      e.evt.preventDefault()

      const stage = e.target.getStage()
      if (!stage) return

      const pointer = stage.getPointerPosition()
      if (!pointer) return

      // Determine zoom direction
      // For trackpad pinch (ctrlKey is true): use -deltaY
      // For scroll wheel: use deltaY
      // Positive = zoom out, negative = zoom in
      const deltaY = e.evt.ctrlKey ? -e.evt.deltaY : e.evt.deltaY

      // Calculate scale factor: 1.05 for zoom in, 0.95 for zoom out (5% per step)
      const scaleFactor = deltaY < 0 ? 1.05 : 0.95

      // Calculate new scale: clamp between MIN_SCALE and MAX_SCALE
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale * scaleFactor))

      // Calculate point under cursor BEFORE zoom: (pointer - offset) / currentScale
      const pointX = (pointer.x - offsetX) / scale
      const pointY = (pointer.y - offsetY) / scale

      // Calculate new offset to keep point stationary: pointer - (point * newScale)
      const newOffsetX = pointer.x - pointX * newScale
      const newOffsetY = pointer.y - pointY * newScale

      setViewport(newScale, newOffsetX, newOffsetY)
    },
    [scale, offsetX, offsetY, setViewport]
  )

  return {
    handleWheel,
  }
}
