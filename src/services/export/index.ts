/**
 * Export service for code generation
 * Produces JUCE WebView2 bundles and HTML preview packages
 */

// Main export functions
export { exportJUCEBundle, exportHTMLPreview, exportMultiWindowBundle, exportMultiWindowToFolder } from './codeGenerator'
export type { ExportOptions, ExportResult, MultiWindowExportOptions, WindowExportData } from './codeGenerator'

// Browser preview
export { previewHTMLExport, previewMultiWindowExport } from './previewExport'
export type { PreviewOptions, MultiWindowPreviewOptions } from './previewExport'

// Validation
export { validateForExport } from './validators'
export type { ExportValidationResult, ExportError } from './validators'

// Documentation
export * from './documentationGenerator'
export * from './knownIssues'

// Utilities (exposed for potential future use)
export { toKebabCase, toCamelCase, escapeHTML } from './utils'
