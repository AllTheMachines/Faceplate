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
import { ProjectSchemaV2, type ProjectData, type ProjectDataV1, type UIWindowData } from '../schemas/project'
import type { ElementConfig } from '../types/elements'
import type { UIWindow } from '../store/windowsSlice'
import type { Asset } from '../types/asset'
import type { KnobStyle } from '../types/knobStyle'
import { sanitizeSVG } from '../lib/svg-sanitizer'

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
}

/**
 * Serialize project state to JSON string (v2.0.0 format)
 * Excludes viewport state (scale, offsetX, offsetY) - camera position is not document state
 * Includes selectedIds - selection is meaningful state to restore
 */
export function serializeProject(state: SerializationInput): string {
  const projectData: ProjectData = {
    version: '2.0.0',
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
  const migrated = migrateProject(parsed)

  // Validate against v2 schema (migrated data should always be v2)
  const result = ProjectSchemaV2.safeParse(migrated)

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
 * Migrate v1.x project to v2.0.0 format
 * Creates a single "Main Window" with all elements
 */
function migrateV1ToV2(data: ProjectDataV1): ProjectData {
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
    selectedIds: data.selectedIds,
    snapToGrid: data.canvas.snapToGrid,
    gridSize: data.canvas.gridSize,
    lastModified: data.lastModified,
  }
}

/**
 * Migrate project data between versions
 * v1.x -> v2.0.0: Convert single canvas to multi-window format
 */
function migrateProject(data: unknown): unknown {
  // Check if this is v1.x format and needs migration
  if (isV1Format(data)) {
    console.log('[Serialization] Migrating v1.x project to v2.0.0 format')
    return migrateV1ToV2(data)
  }

  // Already v2.0.0 or newer format
  return data
}
