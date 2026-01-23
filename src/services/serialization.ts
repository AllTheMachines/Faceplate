/**
 * Serialization service for project persistence
 * Converts Zustand state to versioned JSON with validation
 */

import { generateErrorMessage } from 'zod-error'
import { ProjectSchema, type ProjectData } from '../schemas/project'
import type { ElementConfig } from '../types/elements'
import type { GradientConfig } from '../store/canvasSlice'

// ============================================================================
// Serialization
// ============================================================================

export interface SerializationInput {
  elements: ElementConfig[]
  canvasWidth: number
  canvasHeight: number
  backgroundColor: string
  backgroundType: 'color' | 'gradient' | 'image'
  gradientConfig?: GradientConfig
  snapToGrid: boolean
  gridSize: number
  selectedIds: string[]
}

/**
 * Serialize project state to JSON string
 * Excludes viewport state (scale, offsetX, offsetY) - camera position is not document state
 * Includes selectedIds - selection is meaningful state to restore
 */
export function serializeProject(state: SerializationInput): string {
  const projectData: ProjectData = {
    version: '1.0.0',
    canvas: {
      canvasWidth: state.canvasWidth,
      canvasHeight: state.canvasHeight,
      backgroundColor: state.backgroundColor,
      backgroundType: state.backgroundType,
      gradientConfig: state.gradientConfig,
      snapToGrid: state.snapToGrid,
      gridSize: state.gridSize,
    },
    elements: state.elements,
    selectedIds: state.selectedIds,
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

  // Validate against schema
  const result = ProjectSchema.safeParse(migrated)

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

  return {
    success: true,
    data: result.data,
  }
}

// ============================================================================
// Version Migration
// ============================================================================

/**
 * Migrate project data between versions
 * For v1.0.0, no migration needed
 * Future: check version field and apply migrations
 */
function migrateProject(data: unknown): unknown {
  // For v1.0.0, no migration needed
  // Future versions will add migration logic here:
  // if (data.version === '1.0.0') {
  //   return migrateFrom1_0_0to1_1_0(data)
  // }
  return data
}
