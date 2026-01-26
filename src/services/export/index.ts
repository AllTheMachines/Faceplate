/**
 * Export service for code generation
 * Produces JUCE WebView2 bundles and HTML preview packages
 */

// Main export functions
export { exportJUCEBundle, exportHTMLPreview } from './codeGenerator'
export type { ExportOptions, ExportResult } from './codeGenerator'

// Browser preview
export { previewHTMLExport } from './previewExport'
export type { PreviewOptions } from './previewExport'

// Validation
export { validateForExport } from './validators'
export type { ExportValidationResult, ExportError } from './validators'

// Documentation
export * from './documentationGenerator'
export * from './knownIssues'

// Utilities (exposed for potential future use)
export { toKebabCase, toCamelCase, escapeHTML } from './utils'
