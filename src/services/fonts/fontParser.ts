/**
 * Font metadata extraction using opentype.js
 * Parses TTF, OTF, WOFF, and WOFF2 files to extract font names and metadata
 */

import { parse } from 'opentype.js'

export interface FontMetadata {
  family: string           // CSS font-family name (from name table)
  fullName: string         // Full font name
  postScriptName: string   // PostScript name
  version?: string         // Font version
  format: 'ttf' | 'otf' | 'woff' | 'woff2'
  fileName: string         // Original file name
}

/**
 * Detect font format from file extension
 */
function detectFontFormat(fileName: string): 'ttf' | 'otf' | 'woff' | 'woff2' {
  const ext = fileName.toLowerCase().split('.').pop() || ''

  if (ext === 'ttf') return 'ttf'
  if (ext === 'otf') return 'otf'
  if (ext === 'woff') return 'woff'
  if (ext === 'woff2') return 'woff2'

  // Default to ttf if unknown
  return 'ttf'
}

/**
 * Parse font metadata from a font file using opentype.js
 * Returns null if the font cannot be parsed
 */
export async function parseFontMetadata(file: File): Promise<FontMetadata | null> {
  try {
    // Read file as ArrayBuffer
    const arrayBuffer = await file.arrayBuffer()

    // Parse font using opentype.js
    const font = parse(arrayBuffer)

    // Extract names from the font's name table
    const names = font.names

    // Get family name from fontFamily
    const family = names.fontFamily?.en || 'Unknown Font'

    // Get full name
    const fullName = names.fullName?.en || family

    // Get PostScript name
    const postScriptName = names.postScriptName?.en || family.replace(/\s+/g, '')

    // Get version (optional)
    const version = names.version?.en

    // Detect format from file extension
    const format = detectFontFormat(file.name)

    return {
      family,
      fullName,
      postScriptName,
      version,
      format,
      fileName: file.name,
    }
  } catch (error) {
    console.warn(`Failed to parse font "${file.name}":`, error)
    return null
  }
}
