/**
 * Font metadata extraction using opentype.js
 * Parses TTF, OTF, WOFF, and WOFF2 files to extract font names and metadata
 */

import { parse } from 'opentype.js'

export interface FontMetadata {
  family: string           // CSS font-family name (from name table)
  fullName: string         // Full font name
  postScriptName: string   // PostScript name
  subfamily?: string       // Font subfamily (e.g., "Light", "Medium", "Bold")
  weight?: number          // Numeric weight value (100-900)
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
 * Map font subfamily name to numeric weight value
 */
function getWeightFromSubfamily(subfamily: string): number {
  const normalized = subfamily.toLowerCase().trim()

  const weightMap: Record<string, number> = {
    'thin': 100,
    'hairline': 100,
    'extralight': 200,
    'extra light': 200,
    'ultralight': 200,
    'ultra light': 200,
    'light': 300,
    'regular': 400,
    'normal': 400,
    'book': 400,
    'medium': 500,
    'semibold': 600,
    'semi bold': 600,
    'semi-bold': 600,
    'demibold': 600,
    'demi bold': 600,
    'demi-bold': 600,
    'bold': 700,
    'extrabold': 800,
    'extra bold': 800,
    'extra-bold': 800,
    'ultrabold': 800,
    'ultra bold': 800,
    'ultra-bold': 800,
    'black': 900,
    'heavy': 900,
    'ultra': 900,
  }

  // Try direct match
  if (weightMap[normalized]) {
    return weightMap[normalized]
  }

  // Try partial match for cases like "Inter Light" or "Roboto Medium"
  for (const [key, weight] of Object.entries(weightMap)) {
    if (normalized.includes(key)) {
      return weight
    }
  }

  // Default to regular if no match
  return 400
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

    // Get subfamily (weight name like "Light", "Medium", "Bold")
    const subfamily = names.fontSubfamily?.en

    // Calculate numeric weight from subfamily
    const weight = subfamily ? getWeightFromSubfamily(subfamily) : 400

    // Get version (optional)
    const version = names.version?.en

    // Detect format from file extension
    const format = detectFontFormat(file.name)

    return {
      family,
      fullName,
      postScriptName,
      subfamily,
      weight,
      version,
      format,
      fileName: file.name,
    }
  } catch (error) {
    console.warn(`Failed to parse font "${file.name}":`, error)
    return null
  }
}
