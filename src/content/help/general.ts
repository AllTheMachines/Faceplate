/**
 * General App Help Content
 * Shown when F1 is pressed with no element selected
 */

import { HelpContent } from './types'

export const generalHelp: HelpContent = {
  title: 'Faceplate - VST3 UI Designer',
  description: 'Design and export VST3 plugin user interfaces with visual drag-and-drop tools and automatic code generation for JUCE WebView2.',
  examples: [
    {
      label: 'Getting Started',
      explanation: 'Add elements from the left palette by dragging them onto the canvas. Position and resize using drag handles or arrow keys. Customize properties in the right panel. Export to C++ code for JUCE integration.'
    },
    {
      label: 'Keyboard Shortcuts',
      explanation: 'Ctrl/Cmd+C/V: Copy/Paste | Ctrl/Cmd+Z/Y: Undo/Redo | Arrow keys: Nudge 1px | Shift+Arrow: Nudge 10px | Ctrl+G: Toggle grid | Delete: Remove element | F1: Context help | Ctrl+Shift+P: Preview'
    },
    {
      label: 'Workflow',
      explanation: '1. Design UI on canvas with elements from palette\n2. Organize elements using Layers panel\n3. Customize appearance in Properties panel\n4. Preview in browser to test\n5. Export C++ code for JUCE WebView2'
    },
    {
      label: 'Multi-Window Projects',
      explanation: 'Create multiple windows for complex plugins (main UI, settings, about). Use Window tabs to switch between them. Buttons can navigate between windows at runtime.'
    }
  ],
  relatedTopics: [
    'Select an element and press F1 for element-specific help',
    'Each property section has a (?) button for detailed help',
    'Use Layers panel to organize and lock/hide elements',
    'Export to folder for complete JUCE integration bundle'
  ]
}
