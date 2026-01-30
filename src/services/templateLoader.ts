/**
 * Template Loader Service
 * Loads built-in starter templates from the templates/ directory
 */

import { ElementConfig } from '../types/elements'

export interface TemplateDefinition {
  version: string
  name: string
  description: string
  category: 'effect' | 'instrument' | 'test'
  metadata: {
    canvasWidth: number
    canvasHeight: number
    backgroundColor: string
    created?: string
    author?: string
  }
  elements: ElementConfig[]
}

export interface BuiltInTemplate {
  id: string
  name: string
  description: string
  category: 'effect' | 'instrument' | 'test'
}

// Registry of built-in templates
export const BUILT_IN_TEMPLATES: BuiltInTemplate[] = [
  {
    id: 'effect-starter',
    name: 'Effect Starter',
    description: 'Basic effect with volume control and output meter',
    category: 'effect',
  },
  {
    id: 'instrument-starter',
    name: 'Instrument Starter',
    description: 'Instrument with ADSR envelope and gain control',
    category: 'instrument',
  },
  {
    id: 'test-template',
    name: 'Test Template',
    description: 'All element types for testing (controls, meters, visualizations)',
    category: 'test',
  },
]

/**
 * Load a built-in template by ID
 */
export async function loadBuiltInTemplate(templateId: string): Promise<TemplateDefinition> {
  const template = BUILT_IN_TEMPLATES.find((t) => t.id === templateId)
  if (!template) {
    throw new Error(`Unknown template: ${templateId}`)
  }

  // Dynamic import of template JSON
  const templateModule = await import(`../../templates/${templateId}.json`)
  return templateModule.default as TemplateDefinition
}
