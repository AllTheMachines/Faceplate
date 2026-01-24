/**
 * Export utility functions for code generation
 * Provides case conversion and HTML escaping for safe code output
 */

/**
 * Convert element names to kebab-case for HTML/JS IDs
 *
 * @example
 * toKebabCase("Gain Knob") // "gain-knob"
 * toKebabCase("OSC2 Level") // "osc2-level"
 * toKebabCase("masterVolume") // "master-volume"
 * toKebabCase("Master_Volume") // "master-volume"
 *
 * @param str - Element name to convert
 * @returns kebab-case string suitable for HTML IDs
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2') // camelCase to kebab-case
    .replace(/[\s_]+/g, '-') // spaces and underscores to dashes
    .toLowerCase()
}

/**
 * Convert element names to camelCase for C++ variable names
 *
 * @example
 * toCamelCase("Gain Knob") // "gainKnob"
 * toCamelCase("OSC2 Level") // "osc2Level"
 * toCamelCase("master-volume") // "masterVolume"
 * toCamelCase("Master_Volume") // "masterVolume"
 *
 * @param str - Element name to convert
 * @returns camelCase string suitable for variable names
 */
export function toCamelCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-zA-Z0-9]+(.)/g, (_, chr) => chr.toUpperCase())
}

/**
 * Escape special HTML characters to prevent XSS and broken HTML
 *
 * @example
 * escapeHTML("<script>alert('xss')</script>") // "&lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;"
 * escapeHTML('Text with "quotes" & ampersands') // "Text with &quot;quotes&quot; &amp; ampersands"
 *
 * @param str - String containing user content to escape
 * @returns HTML-safe string
 */
export function escapeHTML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Generate C++ relay variable name with type suffix
 * Creates consistent naming for JUCE WebView2 relay pattern
 *
 * @example
 * toRelayVariableName("Gain Knob", "knob") // "gainKnobRelay"
 * toRelayVariableName("Master Volume", "slider") // "masterVolumeRelay"
 * toRelayVariableName("OSC2 Level", "slider") // "osc2LevelRelay"
 *
 * @param name - Element name
 * @param type - Element type (knob, slider, button, etc.)
 * @returns C++ variable name with "Relay" suffix
 */
export function toRelayVariableName(name: string, type: string): string {
  return `${toCamelCase(name)}Relay`
}
