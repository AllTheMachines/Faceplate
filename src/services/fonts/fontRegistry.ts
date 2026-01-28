/**
 * Font registry for embedded fonts
 * These fonts are downloaded from google-webfonts-helper and stored in public/fonts/
 */

export interface FontDefinition {
  name: string
  family: string // CSS font-family value
  file: string // filename in public/fonts/
  category: 'sans-serif' | 'serif' | 'monospace' | 'display'
}

export const AVAILABLE_FONTS: FontDefinition[] = [
  {
    name: 'Inter',
    family: 'Inter',
    file: 'Inter-Regular.woff2',
    category: 'sans-serif',
  },
  {
    name: 'Roboto',
    family: 'Roboto',
    file: 'Roboto-Regular.woff2',
    category: 'sans-serif',
  },
  {
    name: 'Roboto Mono',
    family: 'Roboto Mono',
    file: 'RobotoMono-Regular.woff2',
    category: 'monospace',
  },
  {
    name: 'Arial',
    family: 'Arial, sans-serif',
    file: '', // System font
    category: 'sans-serif',
  },
  {
    name: 'Helvetica',
    family: 'Helvetica, Arial, sans-serif',
    file: '', // System font
    category: 'sans-serif',
  },
  {
    name: 'Verdana',
    family: 'Verdana, sans-serif',
    file: '', // System font
    category: 'sans-serif',
  },
  {
    name: 'Tahoma',
    family: 'Tahoma, sans-serif',
    file: '', // System font
    category: 'sans-serif',
  },
  {
    name: 'Georgia',
    family: 'Georgia, serif',
    file: '', // System font
    category: 'serif',
  },
  {
    name: 'Times New Roman',
    family: 'Times New Roman, serif',
    file: '', // System font
    category: 'serif',
  },
  {
    name: 'Courier New',
    family: 'Courier New, monospace',
    file: '', // System font
    category: 'monospace',
  },
  {
    name: 'Monaco',
    family: 'Monaco, monospace',
    file: '', // System font
    category: 'monospace',
  },
  {
    name: 'Consolas',
    family: 'Consolas, monospace',
    file: '', // System font
    category: 'monospace',
  },
  {
    name: 'System Default',
    family: 'system-ui, -apple-system, sans-serif',
    file: '', // No file - uses system fonts
    category: 'sans-serif',
  },
]

export function getFontByFamily(family: string): FontDefinition | undefined {
  return AVAILABLE_FONTS.find(f => f.family === family || family.includes(f.family))
}

export function getDefaultFont(): FontDefinition {
  return AVAILABLE_FONTS[0]! // Inter
}
