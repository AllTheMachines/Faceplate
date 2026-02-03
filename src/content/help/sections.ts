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
      'Use Lock to prevent accidental movement',
      'See Keyboard shortcuts for nudge controls',
      'Use Layers panel to control z-order (stacking)',
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
      'ID binding to VST3 params occurs at export',
      'Use Layers panel for quick element navigation',
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
      'Locked elements show a lock icon in Layers panel',
      'Use Panel containers to group locked elements',
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
      {
        label: 'Custom Knob Graphics',
        explanation:
          'To create branded knobs: 1) Export a knob element to get the layer template, 2) In your vector editor, replace the basic shapes with custom artwork (metal texture, branded cap, custom indicator), 3) Keep layer names intact, 4) Import back to validate. The knob will use your custom graphics while maintaining rotation behavior.',
      },
      {
        label: 'Custom Slider Graphics',
        explanation:
          'For branded sliders: Export to get track, thumb, and fill layers. Replace with custom rail textures, styled handles, or LED-style fills. The slider will use your graphics while maintaining drag interaction.',
      },
    ],
    relatedTopics: [
      'Layer names must match exactly - case matters',
      'Check browser console for detailed validation messages',
      'Unsupported layers are ignored but logged as warnings',
      'Use Knob element for rotary controls with custom graphics',
    ],
  },

  // General UI feature help topics (for linking from related topics)
  'layers': {
    title: 'Layers Panel',
    description:
      'The Layers panel shows all elements in your design organized by z-order (stacking). Use it to select, reorder, lock, hide, and organize elements into groups.',
    examples: [
      {
        label: 'Z-Order Control',
        explanation:
          'Drag layers up or down to change stacking order. Elements higher in the list appear on top. Use Ctrl+] and Ctrl+[ shortcuts for quick reordering.',
      },
      {
        label: 'Lock and Hide',
        explanation:
          'Click the lock icon to prevent accidental edits. Click the eye icon to hide elements while designing. Hidden elements still export.',
      },
      {
        label: 'Selection',
        explanation:
          'Click a layer to select its element on canvas. Shift-click to add to selection. The Layers panel is especially useful for selecting elements that are behind others.',
      },
    ],
    relatedTopics: [
      'Use Lock to protect finalized elements',
      'Hidden elements are still included in export',
      'Ctrl+Shift+] brings element to front',
    ],
  },

  'keyboard': {
    title: 'Keyboard Shortcuts',
    description:
      'Speed up your workflow with keyboard shortcuts for common actions like selection, editing, navigation, and view controls.',
    examples: [
      {
        label: 'Selection',
        explanation:
          'Click to select, Shift+Click to add, Ctrl+Click to toggle. Escape clears selection. Drag on empty canvas for marquee select.',
      },
      {
        label: 'Editing',
        explanation:
          'Ctrl+C/V: Copy/Paste | Ctrl+Z: Undo | Ctrl+Y: Redo | Delete: Remove | Arrow keys: Nudge 1px | Shift+Arrow: Nudge 10px',
      },
      {
        label: 'View',
        explanation:
          'Ctrl+G: Toggle grid | Spacebar+Drag: Pan canvas | Scroll wheel: Zoom | F1: Context help | Ctrl+Shift+P: Preview',
      },
    ],
    relatedTopics: [
      'Shift+Arrow nudges by 10px for faster positioning',
      'Ctrl+] and Ctrl+[ change z-order',
    ],
  },

  'grid': {
    title: 'Grid & Snapping',
    description:
      'Use the grid for precise alignment and consistent spacing. Enable snap-to-grid to automatically align elements to grid intersections.',
    examples: [
      {
        label: 'Show Grid',
        explanation:
          'Toggle grid visibility with Ctrl+G or in the Properties panel when nothing is selected. Grid helps visualize alignment without affecting export.',
      },
      {
        label: 'Snap to Grid',
        explanation:
          'When enabled, element positions snap to grid intersections during drag and resize. Disable temporarily by holding Alt while dragging.',
      },
      {
        label: 'Grid Size',
        explanation:
          'Choose from 5px, 10px, 20px, or 50px grid sizes. Smaller grids for precise work, larger for quick layout.',
      },
    ],
    relatedTopics: [
      'Hold Alt while dragging to temporarily disable snap',
      'Grid is visual only - not exported',
    ],
  },
}
