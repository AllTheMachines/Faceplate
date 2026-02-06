/**
 * Pro Elements Blocking Modal
 *
 * Shown when user tries to export a project containing Pro elements
 * without a Pro license. Lists the Pro elements and offers options
 * to upgrade or remove them.
 */

import { useMemo } from 'react'
import { isProElement } from '../../services/proElements'
import type { ElementConfig } from '../../types/elements'

// Human-readable names for element types
const ELEMENT_DISPLAY_NAMES: Record<string, string> = {
  asciislider: 'ASCII Slider',
  asciibutton: 'ASCII Button',
  asciiart: 'ASCII Art',
  rmsmetermo: 'RMS Meter (Mono)',
  rmsmeterstereo: 'RMS Meter (Stereo)',
  vumetermono: 'VU Meter (Mono)',
  vumeterstereo: 'VU Meter (Stereo)',
  ppmtype1mono: 'PPM Type I (Mono)',
  ppmtype1stereo: 'PPM Type I (Stereo)',
  ppmtype2mono: 'PPM Type II (Mono)',
  ppmtype2stereo: 'PPM Type II (Stereo)',
  truepeakmetermono: 'True Peak Meter (Mono)',
  truepeakmeterstereo: 'True Peak Meter (Stereo)',
  lufsmomomo: 'LUFS Momentary (Mono)',
  lufsmomostereo: 'LUFS Momentary (Stereo)',
  lufsshortmono: 'LUFS Short-term (Mono)',
  lufsshortstereo: 'LUFS Short-term (Stereo)',
  lufsintmono: 'LUFS Integrated (Mono)',
  lufsintstereo: 'LUFS Integrated (Stereo)',
  k12metermono: 'K-12 Meter (Mono)',
  k12meterstereo: 'K-12 Meter (Stereo)',
  k14metermono: 'K-14 Meter (Mono)',
  k14meterstereo: 'K-14 Meter (Stereo)',
  k20metermono: 'K-20 Meter (Mono)',
  k20meterstereo: 'K-20 Meter (Stereo)',
  correlationmeter: 'Correlation Meter',
  stereowidthmeter: 'Stereo Width Meter',
  scrollingwaveform: 'Scrolling Waveform',
  spectrumanalyzer: 'Spectrum Analyzer',
  spectrogram: 'Spectrogram',
  goniometer: 'Goniometer',
  vectorscope: 'Vectorscope',
  eqcurve: 'EQ Curve',
  compressorcurve: 'Compressor Curve',
  envelopedisplay: 'Envelope Display',
  lfodisplay: 'LFO Display',
  filterresponse: 'Filter Response',
  breadcrumb: 'Breadcrumb',
  svggraphic: 'SVG Graphic',
  pianokeyboard: 'Piano Keyboard',
  drumpad: 'Drum Pad',
  padgrid: 'Pad Grid',
  stepsequencer: 'Step Sequencer',
  xypad: 'XY Pad',
  wavetabledisplay: 'Wavetable Display',
  harmoniceditor: 'Harmonic Editor',
  looppoints: 'Loop Points',
  envelopeeditor: 'Envelope Editor',
  sampledisplay: 'Sample Display',
  patchbay: 'Patch Bay',
  signalflow: 'Signal Flow',
}

interface ProElementsBlockingModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
  elements: ElementConfig[]
}

export function ProElementsBlockingModal({
  isOpen,
  onClose,
  onUpgrade,
  elements,
}: ProElementsBlockingModalProps) {
  // Find all Pro elements in the project
  const proElements = useMemo(() => {
    const proEls = elements.filter((el) => isProElement(el.type))

    // Group by type for cleaner display
    const grouped = proEls.reduce((acc, el) => {
      const type = el.type
      if (!acc[type]) {
        acc[type] = []
      }
      acc[type].push(el)
      return acc
    }, {} as Record<string, ElementConfig[]>)

    return Object.entries(grouped).map(([type, els]) => ({
      type,
      displayName: ELEMENT_DISPLAY_NAMES[type] || type,
      count: els.length,
      names: els.map((el) => el.name || el.id).slice(0, 3),
    }))
  }, [elements])

  if (!isOpen) return null

  const totalProElements = proElements.reduce((sum, g) => sum + g.count, 0)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-lg mx-4">
        {/* Header */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-700">
          <div className="p-2 bg-violet-600/20 rounded-full">
            <svg className="w-6 h-6 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-white">Pro License Required</h2>
            <p className="text-sm text-gray-400">This project contains Pro elements</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          <p className="text-sm text-gray-300">
            Your project contains <span className="font-semibold text-violet-400">{totalProElements} Pro element{totalProElements !== 1 ? 's' : ''}</span> that require a Pro license to export:
          </p>

          {/* Pro elements list */}
          <div className="max-h-48 overflow-y-auto bg-gray-900 rounded p-3 space-y-2">
            {proElements.map(({ type, displayName, count, names }) => (
              <div key={type} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-violet-600/30 text-violet-300 rounded text-xs font-medium">
                    PRO
                  </span>
                  <span className="text-gray-300">{displayName}</span>
                </div>
                <span className="text-gray-500">
                  {count > 1 ? `×${count}` : names[0]}
                </span>
              </div>
            ))}
          </div>

          <p className="text-xs text-gray-500">
            Preview in browser works without a license. Only JUCE bundle export requires Pro.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-700">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onUpgrade}
            className="flex-1 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded font-medium transition-colors"
          >
            Get Pro License
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Helper to check if project has Pro elements
 */
export function hasProElements(elements: ElementConfig[]): boolean {
  return elements.some((el) => isProElement(el.type))
}

/**
 * Get list of Pro elements in project
 */
export function getProElements(elements: ElementConfig[]): ElementConfig[] {
  return elements.filter((el) => isProElement(el.type))
}
