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
})

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
})

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
})

const LabelElementSchema = BaseElementSchema.extend({
  type: z.literal('label'),

  // Text
  text: z.string(),
  fontSize: z.number(),
  fontFamily: z.string(),
  fontWeight: z.number(),
  color: z.string(),
  textAlign: z.enum(['left', 'center', 'right']),
})

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
})

const ImageElementSchema = BaseElementSchema.extend({
  type: z.literal('image'),

  // Source (either src URL or assetId reference)
  src: z.string(),
  assetId: z.string().optional(), // Reference to asset library

  // Fit
  fit: z.enum(['contain', 'cover', 'fill', 'none']),
})

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
// Canvas Configuration Schema
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
// Project Schema (Top-Level)
// ============================================================================

export const ProjectSchema = z.object({
  version: z.string(),
  canvas: CanvasConfigSchema,
  elements: z.array(ElementConfigSchema),
  assets: z.array(SVGAssetSchema).optional().default([]), // New field
  selectedIds: z.array(z.string()).optional(),
})

// ============================================================================
// Exported Types
// ============================================================================

export type ProjectData = z.infer<typeof ProjectSchema>
export type CanvasConfig = z.infer<typeof CanvasConfigSchema>
export type ElementConfig = z.infer<typeof ElementConfigSchema>
export type GradientConfig = z.infer<typeof GradientConfigSchema>

export type KnobElement = z.infer<typeof KnobElementSchema>
export type SliderElement = z.infer<typeof SliderElementSchema>
export type ButtonElement = z.infer<typeof ButtonElementSchema>
export type LabelElement = z.infer<typeof LabelElementSchema>
export type MeterElement = z.infer<typeof MeterElementSchema>
export type ImageElement = z.infer<typeof ImageElementSchema>
