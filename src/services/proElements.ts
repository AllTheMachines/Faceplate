/**
 * Pro Elements Registry
 *
 * Single source of truth for which element types require a Pro license.
 * This registry is checked during:
 * - Element creation from palette (App.tsx)
 * - Project load/deserialization (serialization.ts)
 * - Palette display for Pro badges (Plan 02)
 *
 * Total: 51 Pro element types
 * - ASCII: 3
 * - Advanced Meters: 24 (mono/stereo variants)
 * - Visualizations: 5
 * - Curves: 5
 * - Navigation: 1 (breadcrumb)
 * - SVG: 1 (svggraphic)
 * - Specialized Audio: 12
 */

export const PRO_ELEMENTS = {
  // ============================================================================
  // ASCII (3)
  // ============================================================================
  asciislider: true,
  asciibutton: true,
  asciiart: true,

  // ============================================================================
  // Advanced Meters (24)
  // RMS, VU, PPM, True Peak, LUFS, K-System, Analysis
  // ============================================================================
  // RMS
  rmsmetermo: true,
  rmsmeterstereo: true,
  // VU
  vumetermono: true,
  vumeterstereo: true,
  // PPM Type 1
  ppmtype1mono: true,
  ppmtype1stereo: true,
  // PPM Type 2
  ppmtype2mono: true,
  ppmtype2stereo: true,
  // True Peak
  truepeakmetermono: true,
  truepeakmeterstereo: true,
  // LUFS Momentary
  lufsmomomo: true,
  lufsmomostereo: true,
  // LUFS Short-term
  lufsshortmono: true,
  lufsshortstereo: true,
  // LUFS Integrated
  lufsintmono: true,
  lufsintstereo: true,
  // K-12
  k12metermono: true,
  k12meterstereo: true,
  // K-14
  k14metermono: true,
  k14meterstereo: true,
  // K-20
  k20metermono: true,
  k20meterstereo: true,
  // Analysis
  correlationmeter: true,
  stereowidthmeter: true,

  // ============================================================================
  // Visualizations (5)
  // ============================================================================
  scrollingwaveform: true,
  spectrumanalyzer: true,
  spectrogram: true,
  goniometer: true,
  vectorscope: true,

  // ============================================================================
  // Curves (5)
  // ============================================================================
  eqcurve: true,
  compressorcurve: true,
  envelopedisplay: true,
  lfodisplay: true,
  filterresponse: true,

  // ============================================================================
  // Navigation (1)
  // ============================================================================
  breadcrumb: true,

  // ============================================================================
  // SVG (1)
  // ============================================================================
  svggraphic: true,

  // ============================================================================
  // Specialized Audio (12)
  // ============================================================================
  pianokeyboard: true,
  drumpad: true,
  padgrid: true,
  stepsequencer: true,
  xypad: true,
  wavetabledisplay: true,
  harmoniceditor: true,
  looppoints: true,
  envelopeeditor: true,
  sampledisplay: true,
  patchbay: true,
  signalflow: true,
} as const

/**
 * Type representing all Pro element type strings
 */
export type ProElementType = keyof typeof PRO_ELEMENTS

/**
 * Check if an element type is a Pro element
 * @param elementType - The element type string to check
 * @returns true if the element requires a Pro license
 */
export function isProElement(elementType: string): boolean {
  return elementType in PRO_ELEMENTS
}
