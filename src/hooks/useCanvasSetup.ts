/**
 * Canvas setup hook with HiDPI scaling
 *
 * Handles Canvas element creation, HiDPI scaling, and context management.
 * Uses useLayoutEffect (not useEffect) to prevent timing issues per RESEARCH.md.
 */

import { useRef, useLayoutEffect, useState } from 'react'

/**
 * Setup Canvas with HiDPI scaling support
 *
 * @param width Display width in CSS pixels
 * @param height Display height in CSS pixels
 * @param scale Optional scale factor (defaults to window.devicePixelRatio)
 * @returns Canvas ref and 2D rendering context
 */
export function useCanvasSetup(
  width: number,
  height: number,
  scale?: number
) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    // Get device pixel ratio (or use provided scale)
    const dpr = scale || window.devicePixelRatio || 1

    // Set canvas internal size (scaled for device pixel ratio)
    canvas.width = width * dpr
    canvas.height = height * dpr

    // Set canvas display size (CSS pixels)
    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`

    // Get 2D context and scale all drawing operations
    const context = canvas.getContext('2d')
    if (context) {
      context.scale(dpr, dpr)
      setCtx(context)
    }
  }, [width, height, scale])

  return { canvasRef, ctx }
}
