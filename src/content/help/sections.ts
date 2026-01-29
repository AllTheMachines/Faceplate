/**
 * Section Help Content
 * Help content for PropertyPanel sections
 */

import type { HelpContent } from './types'

/**
 * Help content for each PropertyPanel section
 */
export const sectionHelp: Record<string, HelpContent> = {
  'position-size': {
    title: 'Position & Size',
    description:
      'Controls the element\'s location and dimensions on the canvas. Coordinates are measured in pixels from the top-left corner (0, 0). These values define where your element appears in the final exported UI.',
    examples: [
      {
        label: 'Setting Position',
        explanation:
          'X and Y values specify the element\'s top-left corner in pixels. X increases moving right, Y increases moving down. You can use negative values to position elements partially off-canvas, which is useful for edge-aligned designs.',
      },
      {
        label: 'Setting Size',
        explanation:
          'Width and Height define the element\'s bounding box in pixels. Minimum size is 20x20 to ensure elements remain visible and selectable. For knobs and buttons, a 1:1 aspect ratio often works best.',
      },
      {
        label: 'Live Updates',
        explanation:
          'Values update in real-time as you drag or resize elements on the canvas. You can also type exact values for precise positioning. Changes are applied immediately.',
      },
    ],
    relatedTopics: [
      'Lock element to prevent accidental movement',
      'Arrow keys nudge by 1px, Shift+Arrow nudges by 10px',
      'Layers panel controls z-order (stacking)',
    ],
  },

  identity: {
    title: 'Identity',
    description:
      'Defines how the element is identified in the Layers panel and in generated code. The name is for your reference during design, while the Parameter ID connects the element to JUCE audio parameters at runtime.',
    examples: [
      {
        label: 'Element Name',
        explanation:
          'A descriptive label shown in the Layers panel and used in generated code comments. Names don\'t need to be unique - use clear, descriptive names like "Master Volume", "Filter Cutoff", or "LFO Rate" to keep your design organized.',
      },
      {
        label: 'Parameter ID',
        explanation:
          'Optional identifier that binds this element to a JUCE AudioParameter. When set, the generated code will connect this UI control to the specified parameter, enabling real-time value synchronization between UI and audio processing.',
      },
    ],
    relatedTopics: [
      'JUCE parameter binding happens at code generation',
      'Layers panel shows all element names for quick navigation',
    ],
  },

  lock: {
    title: 'Lock',
    description:
      'Prevents accidental modifications to an element while preserving your ability to view its properties. Use locking to protect finalized elements from unintended changes during further design work.',
    examples: [
      {
        label: 'When to Lock',
        explanation:
          'Lock background images, alignment guides, or any element you\'ve finalized. This is especially useful for complex layouts where you might accidentally move or resize elements while working on nearby controls.',
      },
      {
        label: 'Locked Behavior',
        explanation:
          'Locked elements cannot be moved, resized, or deleted. You can still select them to view their properties, which is useful for reference. To make changes, simply uncheck the lock option.',
      },
    ],
    relatedTopics: [
      'Locked elements show a lock icon in the Layers panel',
      'Use locking to create template layouts',
    ],
  },

  svg: {
    title: 'SVG Import/Export',
    description:
      'Export elements as SVG files for editing in vector tools (Illustrator, Inkscape, Figma), then import them back for validation. The exported SVG contains named layers that your vector tool must preserve for compatibility.',
    examples: [
      {
        label: 'Export Workflow',
        explanation:
          'Click Export to download an SVG with named layers (e.g., handle, track, fill). Open this file in your preferred vector editor, customize the appearance while keeping layer names intact, then save.',
      },
      {
        label: 'Import Validation',
        explanation:
          'Click Import and select your edited SVG. The validator checks that required layers exist with correct names, warning about any missing or unexpected layers. This ensures your custom artwork will work correctly at runtime.',
      },
      {
        label: 'Expected Layers',
        explanation:
          'Each element type expects specific layer names (shown below the buttons). Layer names are case-sensitive and must match exactly. Export an element first to see the complete layer structure your edits should follow.',
      },
    ],
    relatedTopics: [
      'Layer names must match exactly - case matters',
      'Check browser console for detailed validation messages',
      'Unsupported layers are ignored but logged as warnings',
    ],
  },
}
