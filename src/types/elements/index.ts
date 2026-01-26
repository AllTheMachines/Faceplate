/**
 * Element type system - Unified exports
 *
 * Re-exports all element types from category modules for backward compatibility.
 * Import from this file to get all element types, type guards, and factory functions.
 */

// Re-export base
export * from './base'

// Re-export all category types
export * from './controls'
export * from './displays'
export * from './containers'
export * from './decorative'
export * from './visualizations'

// Import category unions for ElementConfig composition
import { ControlElement } from './controls'
import { DisplayElement } from './displays'
import { ContainerElement } from './containers'
import { DecorativeElement } from './decorative'
import { VisualizationElement } from './visualizations'

// ============================================================================
// Unified ElementConfig Union
// ============================================================================

export type ElementConfig =
  | ControlElement
  | DisplayElement
  | ContainerElement
  | DecorativeElement
  | VisualizationElement

// Re-export category type aliases for registry use
export type { ControlElement, DisplayElement, ContainerElement, DecorativeElement, VisualizationElement }
