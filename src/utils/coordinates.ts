import type { ScreenCoord, CanvasCoord } from '../types/coordinates'
import { asScreenX, asScreenY, asCanvasX, asCanvasY } from '../types/coordinates'

export interface ViewportTransform {
  scale: number
  offsetX: number
  offsetY: number
}

/**
 * Convert screen coordinates to canvas coordinates
 * Formula: canvas = (screen - offset) / scale
 */
export function screenToCanvas(
  screen: ScreenCoord,
  viewport: ViewportTransform
): CanvasCoord {
  return {
    x: asCanvasX((screen.x - viewport.offsetX) / viewport.scale),
    y: asCanvasY((screen.y - viewport.offsetY) / viewport.scale),
  }
}

/**
 * Convert canvas coordinates to screen coordinates
 * Formula: screen = canvas * scale + offset
 */
export function canvasToScreen(
  canvas: CanvasCoord,
  viewport: ViewportTransform
): ScreenCoord {
  return {
    x: asScreenX(canvas.x * viewport.scale + viewport.offsetX),
    y: asScreenY(canvas.y * viewport.scale + viewport.offsetY),
  }
}
