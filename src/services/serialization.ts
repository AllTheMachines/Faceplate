/**
 * Serialization service for project persistence
 * Converts Zustand state to versioned JSON with validation
 *
 * v2.0.0: Multi-window support
 * - Projects now contain multiple windows
 * - Each window has its own dimensions and background
 * - Elements are stored globally, referenced by window elementIds
 */

import { generateErrorMessage } from 'zod-error'
import { ProjectSchemaV2, ProjectSchemaV3, type ProjectData, type ProjectDataV1, type ProjectDataV2, type UIWindowData } from '../schemas/project'
import type { ElementConfig } from '../types/elements'
import type { UIWindow } from '../store/windowsSlice'
import type { Asset } from '../types/asset'
import type { KnobStyle } from '../types/knobStyle'
import type { ElementStyle } from '../types/elementStyle'
import { sanitizeSVG } from '../lib/svg-sanitizer'
import { isProElement } from './proElements'

// Current application version
export const CURRENT_VERSION = '3.0.0'

// Supported versions for migration
const SUPPORTED_VERSIONS = ['1.0.0', '1.0', '2.0.0', '3.0.0']

// ============================================================================
// Serialization
// ============================================================================

export interface SerializationInput {
  elements: ElementConfig[]
  windows: UIWindow[]
  snapToGrid: boolean
  gridSize: number
  showGrid: boolean
  gridColor: string
  selectedIds: string[]
  assets: Asset[]
  knobStyles: KnobStyle[]
  elementStyles: import('../types/elementStyle').ElementStyle[]
  layers: import('../types/layer').Layer[]
}

/**
 * Serialize project state to JSON string (v3.0.0 format)
 * Excludes viewport state (scale, offsetX, offsetY) - camera position is not document state
 * Includes selectedIds - selection is meaningful state to restore
 */
export function serializeProject(state: SerializationInput): string {
  const projectData: ProjectData = {
    version: '3.0.0',
    windows: state.windows.map((w): UIWindowData => ({
      id: w.id,
      name: w.name,
      type: w.type,
      width: w.width,
      height: w.height,
      backgroundColor: w.backgroundColor,
      backgroundType: w.backgroundType,
      gradientConfig: w.gradientConfig,
      elementIds: w.elementIds,
      createdAt: w.createdAt,
    })),
    // Cast needed: TypeScript ElementConfig is wider than Zod ProjectData schema
    elements: state.elements as ProjectData['elements'],
    selectedIds: state.selectedIds,
    assets: state.assets,
    knobStyles: state.knobStyles,
    elementStyles: state.elementStyles,
    layers: state.layers,
    snapToGrid: state.snapToGrid,
    gridSize: state.gridSize,
    showGrid: state.showGrid,
    gridColor: state.gridColor,
    // Set timestamp when saving
    lastModified: Date.now(),
  }

  // JSON.stringify with 2-space indent for human readability
  return JSON.stringify(projectData, null, 2)
}

// ============================================================================
// Deserialization
// ============================================================================

export type DeserializeResult =
  | {
      success: true
      data: ProjectData
    }
  | {
      success: false
      error: string
    }

/**
 * Deserialize JSON string to project data with validation
 * Returns typed result with success/error discriminated union
 * Automatically migrates v1.x projects to v2.0.0 format
 */
export function deserializeProject(json: string): DeserializeResult {
  // Parse JSON syntax
  let parsed: unknown
  try {
    parsed = JSON.parse(json)
  } catch (error) {
    return {
      success: false,
      error: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`,
    }
  }

  // Apply version migrations (if needed)
  const migrationResult = migrateProject(parsed)

  // Check for migration errors (incompatible versions)
  if (!migrationResult.success) {
    return {
      success: false,
      error: migrationResult.error,
    }
  }

  const migrated = migrationResult.data

  // Validate against v3 schema (migrated data should always be v3)
  const result = ProjectSchemaV3.safeParse(migrated)

  if (!result.success) {
    // Use zod-error for user-friendly error messages
    const errorMessage = generateErrorMessage(result.error.issues, {
      delimiter: {
        error: '\n',
      },
      path: {
        enabled: true,
        type: 'objectNotation',
        label: 'Field',
      },
      code: {
        enabled: true,
        label: 'Error',
      },
      message: {
        enabled: true,
        label: '',
      },
    })

    return {
      success: false,
      error: `Invalid project file:\n${errorMessage}`,
    }
  }

  const data = result.data

  // Re-sanitize all SVG assets (SEC-02: tampering protection)
  if (data.assets && data.assets.length > 0) {
    data.assets = data.assets.map(asset => {
      const resanitized = sanitizeSVG(asset.svgContent)
      // Log if content changed during re-sanitization (possible tampering)
      if (resanitized !== asset.svgContent) {
        console.warn(`Asset "${asset.name}" was modified during re-sanitization (possible tampering)`)
      }
      return {
        ...asset,
        svgContent: resanitized
      }
    })
  }

  // Re-sanitize all knob style SVGs (SEC-02: tampering protection)
  if (data.knobStyles && data.knobStyles.length > 0) {
    data.knobStyles = data.knobStyles.map(style => {
      const resanitized = sanitizeSVG(style.svgContent)
      // Log if content changed during re-sanitization (possible tampering)
      if (resanitized !== style.svgContent) {
        console.warn(`Knob style "${style.name}" was modified during re-sanitization (possible tampering)`)
      }
      return {
        ...style,
        svgContent: resanitized
      }
    })
  }

  // Re-sanitize all element style SVGs (SEC-02: tampering protection)
  if (data.elementStyles && data.elementStyles.length > 0) {
    data.elementStyles = data.elementStyles.map(style => {
      const resanitized = sanitizeSVG(style.svgContent)
      // Log if content changed during re-sanitization (possible tampering)
      if (resanitized !== style.svgContent) {
        console.warn(`Element style "${style.name}" was modified during re-sanitization`)
      }
      return {
        ...style,
        svgContent: resanitized
      }
    })
  }

  // Populate isPro field on all elements based on registry
  // This ensures elements loaded from project files (which may not have isPro saved)
  // get the correct isPro value based on the current PRO_ELEMENTS registry
  if (data.elements && data.elements.length > 0) {
    data.elements = data.elements.map(el => ({
      ...el,
      isPro: isProElement(el.type) || undefined, // Only set if true
    }))
  }

  return {
    success: true,
    data,
  }
}

// ============================================================================
// Version Migration
// ============================================================================

/**
 * Check if data is v1.x format (has canvas property, no windows)
 */
function isV1Format(data: unknown): data is ProjectDataV1 {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  return 'canvas' in obj && !('windows' in obj)
}

/**
 * Check if data is v2.x format (has windows but no elementStyles)
 */
function isV2Format(data: unknown): data is ProjectDataV2 {
  if (typeof data !== 'object' || data === null) return false
  const obj = data as Record<string, unknown>
  // Has windows (v2+) but no elementStyles or version is 2.x
  if ('windows' in obj) {
    if (!('elementStyles' in obj)) return true
    if (typeof obj.version === 'string' && obj.version.startsWith('2.')) return true
  }
  return false
}

/**
 * Migrate v1.x project to v2.0.0 format
 * Creates a single "Main Window" with all elements
 */
function migrateV1ToV2(data: ProjectDataV1): ProjectDataV2 {
  const windowId = crypto.randomUUID()

  // Create single window from v1 canvas settings
  const mainWindow: UIWindowData = {
    id: windowId,
    name: 'Main Window',
    type: 'release',
    width: data.canvas.canvasWidth,
    height: data.canvas.canvasHeight,
    backgroundColor: data.canvas.backgroundColor,
    backgroundType: data.canvas.backgroundType,
    gradientConfig: data.canvas.gradientConfig,
    elementIds: data.elements.map(el => el.id),
    createdAt: data.lastModified || Date.now(),
  }

  return {
    version: '2.0.0',
    windows: [mainWindow],
    elements: data.elements,
    assets: data.assets || [],
    knobStyles: data.knobStyles || [],
    layers: data.layers || [],
    selectedIds: data.selectedIds,
    snapToGrid: data.canvas.snapToGrid,
    gridSize: data.canvas.gridSize,
    lastModified: data.lastModified,
  }
}

/**
 * Migrate v2.x project to v3.0.0 format
 * Auto-migrate knobStyles to elementStyles (additive - keep knobStyles)
 */
function migrateV2ToV3(data: ProjectDataV2): ProjectData {
  // Auto-migrate knobStyles to elementStyles (additive)
  const migratedElementStyles: ElementStyle[] = (data.knobStyles || []).map(ks => ({
    category: 'rotary' as const,
    id: ks.id,
    name: ks.name,
    svgContent: ks.svgContent,
    layers: {
      indicator: ks.layers.indicator,
      track: ks.layers.track,
      arc: ks.layers.arc,
      glow: ks.layers.glow,
      shadow: ks.layers.shadow,
    },
    minAngle: ks.minAngle,
    maxAngle: ks.maxAngle,
    createdAt: ks.createdAt,
  }))

  return {
    ...data,
    version: '3.0.0',
    elementStyles: migratedElementStyles,
    // Keep knobStyles for backward compat (don't delete)
    knobStyles: data.knobStyles || [],
  }
}

/**
 * Check if a version string is newer than the current version
 */
function isVersionNewer(version: string, current: string): boolean {
  const vParts = version.split('.').map(Number)
  const cParts = current.split('.').map(Number)

  for (let i = 0; i < Math.max(vParts.length, cParts.length); i++) {
    const v = vParts[i] || 0
    const c = cParts[i] || 0
    if (v > c) return true
    if (v < c) return false
  }
  return false
}

type MigrationResult =
  | { success: true; data: unknown }
  | { success: false; error: string }

/**
 * Migrate project data between versions
 * v1.x -> v2.0.0: Convert single canvas to multi-window format
 * v2.x -> v3.0.0: Add elementStyles (migrate knobStyles)
 * Returns error for incompatible/future versions
 */
function migrateProject(data: unknown): MigrationResult {
  // Check if this is v1.x format and needs migration
  if (isV1Format(data)) {
    return { success: true, data: migrateV1ToV2(data) }
  }

  // Check if this is v2.x format and needs migration
  if (isV2Format(data)) {
    return { success: true, data: migrateV2ToV3(data) }
  }

  // Check if data is an object
  if (typeof data !== 'object' || data === null) {
    return {
      success: false,
      error: 'Invalid project file: expected JSON object'
    }
  }

  const obj = data as Record<string, unknown>

  // Handle missing version field
  if (!('version' in obj)) {
    // If has windows array, assume v2.0.0 (missing version in saved file)
    if ('windows' in obj && Array.isArray(obj.windows)) {
      return {
        success: true,
        data: { ...obj, version: '2.0.0' }
      }
    }

    // If no windows and no canvas, this is invalid
    if (!('canvas' in obj)) {
      return {
        success: false,
        error: 'Invalid project file: missing version information and no recognizable format'
      }
    }

    // Has canvas but no version, treat as v1.0.0
    return { success: true, data: migrateV1ToV2(obj as ProjectDataV1) }
  }

  // Check version for v2+ format
  const version = obj.version
  if (typeof version === 'string') {
    // Check if version is from the future
    if (isVersionNewer(version, CURRENT_VERSION)) {
      return {
        success: false,
        error: `This project was created with a newer version of the application (v${version}). Please update to the latest version to open this file. Your current version is v${CURRENT_VERSION}.`
      }
    }

    // Check for unsupported versions (not v1.x, v2.x, or v3.x)
    const majorVersion = parseInt(version.split('.')[0] || '0')
    if (majorVersion < 1 || majorVersion > 3) {
      return {
        success: false,
        error: `Unsupported project version (v${version}). This application supports versions 1.x, 2.x, and 3.x.`
      }
    }
  }

  // Already v2.0.0 format
  return { success: true, data }
}
