/**
 * Value formatting utilities for display elements
 */

export interface FormatOptions {
  decimals?: number
  bpm?: number // For time format bars calculation
  timeSignature?: number // Beats per bar
  preferSharps?: boolean // For note display
}

/**
 * Format a normalized value (0-1) to a display string based on format type
 */
export function formatDisplayValue(
  value: number,
  min: number,
  max: number,
  format: 'numeric' | 'time' | 'percentage' | 'ratio' | 'note' | 'bpm',
  options: FormatOptions = {}
): string {
  // Calculate actual value from normalized (0-1)
  const actual = min + value * (max - min)
  const decimals = options.decimals ?? 2

  switch (format) {
    case 'numeric':
      return actual.toFixed(decimals)

    case 'time': {
      const ms = actual

      // Auto-switch based on magnitude
      if (ms < 1000) {
        return `${ms.toFixed(0)} ms`
      } else if (ms < 60000) {
        return `${(ms / 1000).toFixed(2)} s`
      } else {
        // Calculate bars from ms
        const bpm = options.bpm ?? 120
        const timeSignature = options.timeSignature ?? 4
        const beatsPerMs = bpm / 60000
        const beats = ms * beatsPerMs
        const bars = beats / timeSignature
        return `${bars.toFixed(2)} bars`
      }
    }

    case 'percentage':
      // Value is already 0-1, display as 0-100%
      return `${(value * 100).toFixed(decimals)}%`

    case 'ratio': {
      const ratio = actual

      // Show infinity symbol for high ratios
      if (ratio >= 20) {
        return '∞:1'
      }

      return `${ratio.toFixed(1)}:1`
    }

    case 'note': {
      // Simple MIDI-to-note conversion (C4 = 60 standard)
      const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
      const midiNumber = Math.round(actual)
      const octave = Math.floor(midiNumber / 12) - 1
      const noteName = noteNames[midiNumber % 12]
      return `${noteName}${octave}`
    }

    case 'bpm':
      return `${actual.toFixed(decimals)} BPM`

    default:
      return actual.toFixed(decimals)
  }
}

/**
 * Truncate text to fit within a maximum width
 * Estimates character width and adds ellipsis if needed
 */
export function truncateValue(text: string, maxWidth: number, fontSize: number): string {
  // Estimate character width as fontSize * 0.6
  const charWidth = fontSize * 0.6
  const maxChars = Math.floor(maxWidth / charWidth)

  if (text.length <= maxChars) {
    return text
  }

  // Truncate with ellipsis
  return text.substring(0, maxChars - 1) + '…'
}
