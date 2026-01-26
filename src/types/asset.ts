/**
 * Asset type for SVG asset library
 * Phase 15-01: Asset Library Storage & UI
 */

export interface Asset {
  id: string                    // crypto.randomUUID()
  name: string                  // User-editable name
  svgContent: string            // Sanitized SVG markup
  categories: string[]          // Multi-category tags (e.g., ["logo", "icon"])
  fileSize: number              // In bytes
  elementCount: number          // Number of SVG child elements
  createdAt: number             // Timestamp (Date.now())
}

export const DEFAULT_CATEGORIES = ['logo', 'icon', 'decoration', 'background'] as const
export type DefaultCategory = typeof DEFAULT_CATEGORIES[number]
