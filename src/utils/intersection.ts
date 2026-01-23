/**
 * Axis-Aligned Bounding Box (AABB) intersection utilities for marquee selection.
 *
 * @example
 * const rect1 = { left: 0, top: 0, right: 100, bottom: 100 }
 * const rect2 = { left: 50, top: 50, right: 150, bottom: 150 }
 * intersectRect(rect1, rect2) // true - overlapping
 *
 * const rect3 = { left: 200, top: 200, right: 300, bottom: 300 }
 * intersectRect(rect1, rect3) // false - separated
 */

export interface Rect {
  left: number
  top: number
  right: number
  bottom: number
}

/**
 * Check if two rectangles intersect using AABB algorithm.
 * Returns true if rectangles overlap, false if separated.
 *
 * Algorithm:
 * 1. Check horizontal separation: if rect1 is entirely left or right of rect2
 * 2. Check vertical separation: if rect1 is entirely above or below rect2
 * 3. If no separation on either axis, rectangles must intersect
 *
 * @param rect1 - First rectangle
 * @param rect2 - Second rectangle
 * @returns true if rectangles overlap, false if separated
 */
export function intersectRect(rect1: Rect, rect2: Rect): boolean {
  // Check horizontal separation
  if (rect1.right < rect2.left || rect2.right < rect1.left) {
    return false
  }

  // Check vertical separation
  if (rect1.bottom < rect2.top || rect2.bottom < rect1.top) {
    return false
  }

  // No separation means intersection
  return true
}

/**
 * Convert DOMRect to Rect interface.
 * Useful for converting getBoundingClientRect() results to AABB format.
 *
 * @param domRect - DOMRect from getBoundingClientRect() or similar
 * @returns Rect interface with left/top/right/bottom properties
 */
export function domRectToRect(domRect: DOMRect): Rect {
  return {
    left: domRect.left,
    top: domRect.top,
    right: domRect.right,
    bottom: domRect.bottom,
  }
}
