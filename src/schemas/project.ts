/**
 * Zod schemas for project serialization
 * These schemas mirror the TypeScript types in src/types/elements.ts
 */

import { z } from 'zod'

// ============================================================================
// Base Element Schema
// ============================================================================

const BaseElementSchema = z.object({
  // Identity
  id: z.string(),
  name: z.string(),

  // Position & Size
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number(),
  zIndex: z.number(),

  // State
  locked: z.boolean(),
  visible: z.boolean(),

  // JUCE Binding (optional)
  parameterId: z.string().optional(),
})

// ============================================================================
// Element-Specific Schemas
// ============================================================================

const KnobElementSchema = BaseElementSchema.extend({
  type: z.literal('knob'),

  // Dimensions
  diameter: z.number(),

  // Value
  value: z.number(),
  min: z.number(),
  max: z.number(),

  // Arc Geometry
  startAngle: z.number(),
  endAngle: z.number(),

  // Visual Style
  style: z.enum(['arc', 'filled', 'dot', 'line']),
  trackColor: z.string(),
  fillColor: z.string(),
  indicatorColor: z.string(),
  trackWidth: z.number(),

  // SVG Knob Style (optional)
  styleId: z.string().optional(),
  colorOverrides: z.object({
    indicator: z.string().optional(),
    track: z.string().optional(),
    arc: z.string().optional(),
    glow: z.string().optional(),
    shadow: z.string().optional(),
  }).optional(),
}).passthrough()

const SliderElementSchema = BaseElementSchema.extend({
  type: z.literal('slider'),

  // Orientation
  orientation: z.enum(['vertical', 'horizontal']),

  // Value
  value: z.number(),
  min: z.number(),
  max: z.number(),

  // Track
  trackColor: z.string(),
  trackFillColor: z.string(),

  // Thumb
  thumbColor: z.string(),
  thumbWidth: z.number(),
  thumbHeight: z.number(),
}).passthrough()

const ButtonElementSchema = BaseElementSchema.extend({
  type: z.literal('button'),

  // Behavior
  mode: z.enum(['momentary', 'toggle']),
  label: z.string(),
  pressed: z.boolean(),

  // Colors
  backgroundColor: z.string(),
  textColor: z.string(),
  borderColor: z.string(),
  borderRadius: z.number(),
  borderWidth: z.number().optional().default(1),
}).passthrough()

const LabelElementSchema = BaseElementSchema.extend({
  type: z.literal('label'),

  // Text
  text: z.string(),
  fontSize: z.number(),
  fontFamily: z.string(),
  fontWeight: z.number(),
  color: z.string(),
  textAlign: z.enum(['left', 'center', 'right']),
}).passthrough()

const MeterElementSchema = BaseElementSchema.extend({
  type: z.literal('meter'),

  // Orientation
  orientation: z.enum(['vertical', 'horizontal']),

  // Value
  value: z.number(),
  min: z.number(),
  max: z.number(),

  // Colors (gradient stops)
  colorStops: z.array(
    z.object({
      position: z.number(),
      color: z.string(),
    })
  ),
  backgroundColor: z.string(),

  // Peak Hold
  showPeakHold: z.boolean(),
}).passthrough()

const ImageElementSchema = BaseElementSchema.extend({
  type: z.literal('image'),

  // Source (either src URL or assetId reference)
  src: z.string(),
  assetId: z.string().optional(), // Reference to asset library

  // Fit
  fit: z.enum(['contain', 'cover', 'fill', 'none']),
}).passthrough()

// ============================================================================
// SVG Asset Schema
// ============================================================================

export const SVGAssetSchema = z.object({
  id: z.string(),
  name: z.string(),
  svgContent: z.string(), // Sanitized SVG markup
  categories: z.array(z.string()), // Multi-category tags
  fileSize: z.number(),
  elementCount: z.number(),
  createdAt: z.number(),
})

export type SVGAsset = z.infer<typeof SVGAssetSchema>

// ============================================================================
// Knob Style Schema
// ============================================================================

const KnobStyleLayersSchema = z.object({
  indicator: z.string().optional(),
  track: z.string().optional(),
  arc: z.string().optional(),
  glow: z.string().optional(),
  shadow: z.string().optional(),
})

export const KnobStyleSchema = z.object({
  id: z.string(),
  name: z.string(),
  svgContent: z.string(),
  layers: KnobStyleLayersSchema,
  minAngle: z.number(),
  maxAngle: z.number(),
  createdAt: z.number(),
})

export type KnobStyle = z.infer<typeof KnobStyleSchema>

// ============================================================================
// Discriminated Union for Element Types
// ============================================================================

// Using z.discriminatedUnion for O(1) lookup performance
// Phase 13 adds many new element types - use passthrough for extensibility
// Core elements still validated strictly, new elements pass through
const CoreElementSchema = z.discriminatedUnion('type', [
  KnobElementSchema,
  SliderElementSchema,
  ButtonElementSchema,
  LabelElementSchema,
  MeterElementSchema,
  ImageElementSchema,
])

// Allow any element with required base fields (type, id, name, x, y, width, height)
const ExtendedElementSchema = BaseElementSchema.extend({
  type: z.string(),
}).passthrough()

// Accept core elements strictly, or any element with base fields
export const ElementConfigSchema = z.union([
  CoreElementSchema,
  ExtendedElementSchema,
])

// ============================================================================
// Gradient Configuration Schema
// ============================================================================

const GradientConfigSchema = z.object({
  type: z.enum(['linear', 'radial']),
  colors: z.array(z.string()),
  angle: z.number().optional(),
})

// ============================================================================
// Canvas Configuration Schema (v1.x legacy format)
// ============================================================================

export const CanvasConfigSchema = z.object({
  canvasWidth: z.number(),
  canvasHeight: z.number(),
  backgroundColor: z.string(),
  backgroundType: z.enum(['color', 'gradient', 'image']),
  gradientConfig: GradientConfigSchema.optional(),
  snapToGrid: z.boolean(),
  gridSize: z.number(),
})

// ============================================================================
// UI Window Schema (v2.0.0+)
// ============================================================================

export const WindowTypeSchema = z.enum(['release', 'developer'])

export const UIWindowSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: WindowTypeSchema,
  width: z.number(),
  height: z.number(),
  backgroundColor: z.string(),
  backgroundType: z.enum(['color', 'gradient', 'image']),
  gradientConfig: GradientConfigSchema.optional(),
  elementIds: z.array(z.string()),
  createdAt: z.number(),
})

export type UIWindowData = z.infer<typeof UIWindowSchema>
export type WindowType = z.infer<typeof WindowTypeSchema>

// ============================================================================
// Project Schema (Top-Level)
// ============================================================================

// v1.x schema (legacy - single canvas)
export const ProjectSchemaV1 = z.object({
  version: z.string(),
  canvas: CanvasConfigSchema,
  elements: z.array(ElementConfigSchema),
  assets: z.array(SVGAssetSchema).optional().default([]),
  knobStyles: z.array(KnobStyleSchema).optional().default([]),
  selectedIds: z.array(z.string()).optional(),
  lastModified: z.number().optional(),
})

// v2.0.0+ schema (multi-window)
export const ProjectSchemaV2 = z.object({
  version: z.string(),
  windows: z.array(UIWindowSchema),
  elements: z.array(ElementConfigSchema), // All elements across all windows
  assets: z.array(SVGAssetSchema).optional().default([]),
  knobStyles: z.array(KnobStyleSchema).optional().default([]),
  selectedIds: z.array(z.string()).optional(),
  // Global canvas/grid settings (not per-window)
  snapToGrid: z.boolean().optional().default(false),
  gridSize: z.number().optional().default(10),
  showGrid: z.boolean().optional().default(false),
  gridColor: z.string().optional().default('#ffffff'),
  lastModified: z.number().optional(),
})

// Combined schema that accepts both formats
// During parsing, v1 will be migrated to v2 format
export const ProjectSchema = z.union([ProjectSchemaV2, ProjectSchemaV1])

// ============================================================================
// Exported Types
// ============================================================================

export type ProjectDataV1 = z.infer<typeof ProjectSchemaV1>
export type ProjectDataV2 = z.infer<typeof ProjectSchemaV2>
export type ProjectData = ProjectDataV2 // v2 is the canonical format
export type CanvasConfig = z.infer<typeof CanvasConfigSchema>
export type ElementConfig = z.infer<typeof ElementConfigSchema>
export type GradientConfig = z.infer<typeof GradientConfigSchema>

export type KnobElement = z.infer<typeof KnobElementSchema>
export type SliderElement = z.infer<typeof SliderElementSchema>
export type ButtonElement = z.infer<typeof ButtonElementSchema>
export type LabelElement = z.infer<typeof LabelElementSchema>
export type MeterElement = z.infer<typeof MeterElementSchema>
export type ImageElement = z.infer<typeof ImageElementSchema>
