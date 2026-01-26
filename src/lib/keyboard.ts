/**
 * Keyboard Layout Detection
 *
 * Detects physical keyboard layout (QWERTY vs QWERTZ) for correct
 * shortcut display. Uses experimental Keyboard API with fallback.
 *
 * Note: react-hotkeys-hook uses KeyboardEvent.key or KeyboardEvent.code,
 * so Ctrl+Z works the same on QWERTZ because it's the same physical key.
 * Layout detection is primarily for displaying correct labels in tooltips.
 */

// TypeScript definitions for experimental Keyboard API
interface NavigatorKeyboard extends Navigator {
  keyboard?: {
    getLayoutMap: () => Promise<Map<string, string>>
  }
}

export type KeyboardLayout = 'QWERTY' | 'QWERTZ' | 'unknown'

// Cache detected layout
let detectedLayout: KeyboardLayout | null = null

/**
 * Detect keyboard layout using the experimental Keyboard API.
 * Returns cached result after first detection.
 *
 * QWERTZ detection: On QWERTZ keyboards, the physical 'Z' key produces 'y'
 * because Y and Z are swapped compared to QWERTY.
 */
export async function detectKeyboardLayout(): Promise<KeyboardLayout> {
  // Return cached result if available
  if (detectedLayout !== null) {
    return detectedLayout
  }

  // Check if Keyboard API is available (Chromium browsers only)
  const nav = navigator as NavigatorKeyboard
  if (!('keyboard' in nav) || !nav.keyboard?.getLayoutMap) {
    detectedLayout = 'unknown'
    return detectedLayout
  }

  try {
    const layoutMap = await nav.keyboard.getLayoutMap()

    // Check what character the physical 'Z' key produces
    const keyZ = layoutMap.get('KeyZ')

    if (keyZ === 'y') {
      // Physical Z produces 'y' -> QWERTZ layout (Y and Z swapped)
      detectedLayout = 'QWERTZ'
    } else if (keyZ === 'z') {
      // Physical Z produces 'z' -> QWERTY layout
      detectedLayout = 'QWERTY'
    } else {
      // Unknown mapping
      detectedLayout = 'unknown'
    }
  } catch (error) {
    console.warn('Keyboard layout detection failed:', error)
    detectedLayout = 'unknown'
  }

  return detectedLayout
}

/**
 * Get the display label for undo shortcut based on layout.
 * Note: The actual Ctrl+Z shortcut works on both layouts because
 * react-hotkeys-hook uses key codes, not characters.
 */
export function getUndoShortcutLabel(_layout: KeyboardLayout): string {
  // On all platforms, the shortcut is Ctrl+Z (or Cmd+Z on Mac)
  // The label should reflect what the user sees on their keyboard
  const isMac = typeof navigator !== 'undefined' && navigator.platform?.includes('Mac')
  const modifier = isMac ? '\u2318' : 'Ctrl+'

  // Ctrl+Z works the same on QWERTY and QWERTZ
  // because it's the same physical key position
  return `${modifier}Z`
}

/**
 * Get the display label for redo shortcut based on layout.
 */
export function getRedoShortcutLabel(_layout: KeyboardLayout): string {
  const isMac = typeof navigator !== 'undefined' && navigator.platform?.includes('Mac')
  const modifier = isMac ? '\u2318' : 'Ctrl+'

  if (isMac) {
    return `${modifier}Shift+Z`
  }

  // Windows/Linux: Ctrl+Y or Ctrl+Shift+Z both work
  return `${modifier}Y`
}

/**
 * Check if current environment likely has a QWERTZ keyboard.
 * Uses browser language as a hint (German, Czech, etc. use QWERTZ).
 */
export function isLikelyQWERTZ(): boolean {
  if (typeof navigator === 'undefined') return false

  const lang = navigator.language?.toLowerCase() || ''

  // Countries that commonly use QWERTZ
  return (
    lang.startsWith('de') || // German
    lang.startsWith('cs') || // Czech
    lang.startsWith('sk') || // Slovak
    lang.startsWith('hu') || // Hungarian
    lang.startsWith('sl') || // Slovenian
    lang.startsWith('hr')    // Croatian
  )
}
