// Branded types for type-safe coordinate systems
declare const screenXBrand: unique symbol
declare const screenYBrand: unique symbol
declare const canvasXBrand: unique symbol
declare const canvasYBrand: unique symbol

export type ScreenX = number & { readonly [screenXBrand]: typeof screenXBrand }
export type ScreenY = number & { readonly [screenYBrand]: typeof screenYBrand }
export type CanvasX = number & { readonly [canvasXBrand]: typeof canvasXBrand }
export type CanvasY = number & { readonly [canvasYBrand]: typeof canvasYBrand }

export interface ScreenCoord {
  x: ScreenX
  y: ScreenY
}

export interface CanvasCoord {
  x: CanvasX
  y: CanvasY
}

// Helper functions to create branded values
export const asScreenX = (n: number): ScreenX => n as ScreenX
export const asScreenY = (n: number): ScreenY => n as ScreenY
export const asCanvasX = (n: number): CanvasX => n as CanvasX
export const asCanvasY = (n: number): CanvasY => n as CanvasY
