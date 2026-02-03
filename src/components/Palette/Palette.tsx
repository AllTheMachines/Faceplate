import { useState, useRef, useEffect, useMemo } from 'react'
import { PaletteCategory } from './PaletteCategory'
import { CustomSVGUpload } from './CustomSVGUpload'
import { isProElement } from '../../services/proElements'

interface PaletteCategoryItem {
  id: string
  type: string
  name: string
  variant?: Record<string, unknown>
}

interface PaletteCategoryData {
  name: string
  items: PaletteCategoryItem[]
}

// Define palette categories and items
const paletteCategories: PaletteCategoryData[] = [
  {
    name: 'Rotary Controls',
    items: [
      { id: 'knob-standard', type: 'knob', name: 'Knob' },
      { id: 'knob-arc', type: 'knob', name: 'Arc Knob', variant: { style: 'arc' } },
      { id: 'steppedknob', type: 'steppedknob', name: 'Stepped Knob' },
      { id: 'centerdetentknob', type: 'centerdetentknob', name: 'Center Detent' },
      { id: 'dotindicatorknob', type: 'dotindicatorknob', name: 'Dot Indicator' },
    ],
  },
  {
    name: 'Linear Controls',
    items: [
      { id: 'slider', type: 'slider', name: 'Slider', variant: { orientation: 'vertical' } },
      { id: 'rangeslider', type: 'rangeslider', name: 'Range Slider' },
      { id: 'multislider', type: 'multislider', name: 'Multi-Slider' },
      { id: 'bipolarslider', type: 'bipolarslider', name: 'Bipolar Slider' },
      { id: 'crossfadeslider', type: 'crossfadeslider', name: 'Crossfade' },
      { id: 'notchedslider', type: 'notchedslider', name: 'Notched Slider' },
      { id: 'arcslider', type: 'arcslider', name: 'Arc Slider' },
      { id: 'asciislider', type: 'asciislider', name: 'ASCII Slider' },
    ],
  },
  {
    name: 'Buttons',
    items: [
      { id: 'button', type: 'button', name: 'Button', variant: { mode: 'momentary' } },
      { id: 'iconbutton', type: 'iconbutton', name: 'Icon Button' },
      { id: 'toggleswitch', type: 'toggleswitch', name: 'Toggle Switch' },
      { id: 'powerbutton', type: 'powerbutton', name: 'Power Button' },
      { id: 'rockerswitch', type: 'rockerswitch', name: 'Rocker Switch' },
      { id: 'rotaryswitch', type: 'rotaryswitch', name: 'Rotary Switch' },
      { id: 'segmentbutton', type: 'segmentbutton', name: 'Segment Button' },
      { id: 'asciibutton', type: 'asciibutton', name: 'ASCII Button' },
    ],
  },
  {
    name: 'Value Displays',
    items: [
      { id: 'label', type: 'label', name: 'Label' },
      { id: 'numericdisplay', type: 'numericdisplay', name: 'Numeric Display' },
      { id: 'timedisplay', type: 'timedisplay', name: 'Time Display' },
      { id: 'percentagedisplay', type: 'percentagedisplay', name: 'Percentage Display' },
      { id: 'ratiodisplay', type: 'ratiodisplay', name: 'Ratio Display' },
      { id: 'notedisplay', type: 'notedisplay', name: 'Note Display' },
      { id: 'bpmdisplay', type: 'bpmdisplay', name: 'BPM Display' },
      { id: 'editabledisplay', type: 'editabledisplay', name: 'Editable Display' },
      { id: 'multivaluedisplay', type: 'multivaluedisplay', name: 'Multi-Value Display' },
    ],
  },
  {
    name: 'Meters',
    items: [
      // Legacy meter (keep for backward compatibility)
      { id: 'meter-vertical', type: 'meter', name: 'Meter', variant: { orientation: 'vertical' } },

      // Level Meters
      { id: 'rmsmetermo', type: 'rmsmetermo', name: 'RMS Meter' },
      { id: 'rmsmeterstereo', type: 'rmsmeterstereo', name: 'RMS Meter (Stereo)' },
      { id: 'vumetermono', type: 'vumetermono', name: 'VU Meter' },
      { id: 'vumeterstereo', type: 'vumeterstereo', name: 'VU Meter (Stereo)' },
      { id: 'ppmtype1mono', type: 'ppmtype1mono', name: 'PPM Type I' },
      { id: 'ppmtype1stereo', type: 'ppmtype1stereo', name: 'PPM Type I (Stereo)' },
      { id: 'ppmtype2mono', type: 'ppmtype2mono', name: 'PPM Type II' },
      { id: 'ppmtype2stereo', type: 'ppmtype2stereo', name: 'PPM Type II (Stereo)' },
      { id: 'truepeakmetermono', type: 'truepeakmetermono', name: 'True Peak' },
      { id: 'truepeakmeterstereo', type: 'truepeakmeterstereo', name: 'True Peak (Stereo)' },

      // LUFS Meters
      { id: 'lufsmomomo', type: 'lufsmomomo', name: 'LUFS Momentary' },
      { id: 'lufsmomostereo', type: 'lufsmomostereo', name: 'LUFS Momentary (Stereo)' },
      { id: 'lufsshortmono', type: 'lufsshortmono', name: 'LUFS Short-term' },
      { id: 'lufsshortstereo', type: 'lufsshortstereo', name: 'LUFS Short-term (Stereo)' },
      { id: 'lufsintmono', type: 'lufsintmono', name: 'LUFS Integrated' },
      { id: 'lufsintstereo', type: 'lufsintstereo', name: 'LUFS Integrated (Stereo)' },

      // K-System
      { id: 'k12metermono', type: 'k12metermono', name: 'K-12 Meter' },
      { id: 'k12meterstereo', type: 'k12meterstereo', name: 'K-12 Meter (Stereo)' },
      { id: 'k14metermono', type: 'k14metermono', name: 'K-14 Meter' },
      { id: 'k14meterstereo', type: 'k14meterstereo', name: 'K-14 Meter (Stereo)' },
      { id: 'k20metermono', type: 'k20metermono', name: 'K-20 Meter' },
      { id: 'k20meterstereo', type: 'k20meterstereo', name: 'K-20 Meter (Stereo)' },

      // Analysis
      { id: 'correlationmeter', type: 'correlationmeter', name: 'Correlation Meter' },
      { id: 'stereowidthmeter', type: 'stereowidthmeter', name: 'Stereo Width Meter' },
    ],
  },
  {
    name: 'Audio Displays',
    items: [
      { id: 'dbdisplay', type: 'dbdisplay', name: 'dB Display' },
      { id: 'frequencydisplay', type: 'frequencydisplay', name: 'Frequency Display' },
      { id: 'gainreductionmeter', type: 'gainreductionmeter', name: 'GR Meter' },
      { id: 'waveform', type: 'waveform', name: 'Waveform' },
      { id: 'oscilloscope', type: 'oscilloscope', name: 'Oscilloscope' },
    ],
  },
  {
    name: 'Visualizations',
    items: [
      { id: 'scrollingwaveform', type: 'scrollingwaveform', name: 'Scrolling Waveform' },
      { id: 'spectrumanalyzer', type: 'spectrumanalyzer', name: 'Spectrum Analyzer' },
      { id: 'spectrogram', type: 'spectrogram', name: 'Spectrogram' },
      { id: 'goniometer', type: 'goniometer', name: 'Goniometer' },
      { id: 'vectorscope', type: 'vectorscope', name: 'Vectorscope' },
    ],
  },
  {
    name: 'Curves',
    items: [
      { id: 'eqcurve', type: 'eqcurve', name: 'EQ Curve' },
      { id: 'compressorcurve', type: 'compressorcurve', name: 'Compressor Curve' },
      { id: 'envelopedisplay', type: 'envelopedisplay', name: 'Envelope Display' },
      { id: 'lfodisplay', type: 'lfodisplay', name: 'LFO Display' },
      { id: 'filterresponse', type: 'filterresponse', name: 'Filter Response' },
    ],
  },
  {
    name: 'Form Controls',
    items: [
      { id: 'dropdown', type: 'dropdown', name: 'Dropdown' },
      { id: 'checkbox', type: 'checkbox', name: 'Checkbox' },
      { id: 'radiogroup', type: 'radiogroup', name: 'Radio Group' },
      { id: 'textfield', type: 'textfield', name: 'Text Field' },
    ],
  },
  {
    name: 'Navigation & Selection',
    items: [
      { id: 'stepper', type: 'stepper', name: 'Stepper' },
      { id: 'breadcrumb', type: 'breadcrumb', name: 'Breadcrumb' },
      { id: 'multiselectdropdown', type: 'multiselectdropdown', name: 'Multi-Select Dropdown' },
      { id: 'combobox', type: 'combobox', name: 'Combo Box' },
      { id: 'menubutton', type: 'menubutton', name: 'Menu Button' },
      { id: 'tabbar', type: 'tabbar', name: 'Tab Bar' },
      { id: 'tagselector', type: 'tagselector', name: 'Tag Selector' },
      { id: 'treeview', type: 'treeview', name: 'Tree View' },
    ],
  },
  {
    name: 'Images & Decorative',
    items: [
      { id: 'image', type: 'image', name: 'Image' },
      { id: 'svggraphic', type: 'svggraphic', name: 'SVG Graphic' },
      { id: 'rectangle', type: 'rectangle', name: 'Rectangle' },
      { id: 'line', type: 'line', name: 'Line' },
      { id: 'asciiart', type: 'asciiart', name: 'ASCII Art' },
    ],
  },
  {
    name: 'Containers',
    items: [
      { id: 'panel', type: 'panel', name: 'Panel' },
      { id: 'frame', type: 'frame', name: 'Frame' },
      { id: 'groupbox', type: 'groupbox', name: 'Group Box' },
      { id: 'collapsible', type: 'collapsible', name: 'Collapsible' },
      { id: 'tooltip', type: 'tooltip', name: 'Tooltip' },
      { id: 'horizontalspacer', type: 'horizontalspacer', name: 'Horizontal Spacer' },
      { id: 'verticalspacer', type: 'verticalspacer', name: 'Vertical Spacer' },
      { id: 'windowchrome', type: 'windowchrome', name: 'Window Chrome' },
    ],
  },
  {
    name: 'Complex Widgets',
    items: [
      { id: 'modulationmatrix', type: 'modulationmatrix', name: 'Mod Matrix' },
      { id: 'presetbrowser', type: 'presetbrowser', name: 'Preset Browser' },
    ],
  },
  {
    name: 'Specialized Audio',
    items: [
      { id: 'pianokeyboard', type: 'pianokeyboard', name: 'Piano Keyboard' },
      { id: 'drumpad', type: 'drumpad', name: 'Drum Pad' },
      { id: 'padgrid', type: 'padgrid', name: 'Pad Grid' },
      { id: 'stepsequencer', type: 'stepsequencer', name: 'Step Sequencer' },
      { id: 'xypad', type: 'xypad', name: 'XY Pad' },
      { id: 'wavetabledisplay', type: 'wavetabledisplay', name: 'Wavetable' },
      { id: 'harmoniceditor', type: 'harmoniceditor', name: 'Harmonic Editor' },
      { id: 'looppoints', type: 'looppoints', name: 'Loop Points' },
      { id: 'envelopeeditor', type: 'envelopeeditor', name: 'Envelope Editor' },
      { id: 'sampledisplay', type: 'sampledisplay', name: 'Sample Display' },
      { id: 'patchbay', type: 'patchbay', name: 'Patch Bay' },
      { id: 'signalflow', type: 'signalflow', name: 'Signal Flow' },
    ],
  },
]

export function Palette() {
  // Track expanded categories (first 3 expanded by default)
  const [expandedCategories, setExpandedCategories] = useState<Set<number>>(
    new Set([0, 1, 2])
  )
  const [searchTerm, setSearchTerm] = useState('')
  const [inputValue, setInputValue] = useState('')
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [hideProElements, setHideProElements] = useState(() => {
    // Initialize from localStorage (default: hide Pro elements for new users)
    const stored = localStorage.getItem('palette-hide-pro')
    return stored === null ? true : stored === 'true'
  })

  // Clear timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const handleInputChange = (value: string) => {
    setInputValue(value)

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Debounce search (200ms for responsive feel)
    timeoutRef.current = setTimeout(() => {
      setSearchTerm(value.toLowerCase().trim())
    }, 200)
  }

  const handleClear = () => {
    setInputValue('')
    setSearchTerm('')
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const handleToggleHidePro = () => {
    setHideProElements(prev => {
      const newValue = !prev
      localStorage.setItem('palette-hide-pro', String(newValue))
      return newValue
    })
  }

  // Filter categories and items based on search and Pro toggle
  const filteredCategories = useMemo(() => {
    let categories = paletteCategories

    // Sort items within each category: Free first, Pro last
    categories = categories.map((category) => ({
      ...category,
      items: [...category.items].sort((a, b) => {
        const aIsPro = isProElement(a.type)
        const bIsPro = isProElement(b.type)
        if (aIsPro === bIsPro) return 0
        return aIsPro ? 1 : -1  // Pro items go to end
      }),
    }))

    // Filter by search term
    if (searchTerm) {
      categories = categories
        .map((category) => ({
          ...category,
          items: category.items.filter(
            (item) =>
              item.name.toLowerCase().includes(searchTerm) ||
              item.type.toLowerCase().includes(searchTerm)
          ),
        }))
        .filter((category) => category.items.length > 0)
    }

    // Filter out Pro elements if toggle is on
    if (hideProElements) {
      categories = categories
        .map((category) => ({
          ...category,
          items: category.items.filter((item) => !isProElement(item.type)),
        }))
        .filter((category) => category.items.length > 0)
    }

    return categories
  }, [searchTerm, hideProElements])

  // When searching, determine which categories to show expanded
  const getIsExpanded = (index: number, categoryName: string) => {
    if (searchTerm) {
      // When searching, expand all matching categories
      return filteredCategories.some((c) => c.name === categoryName)
    }
    return expandedCategories.has(index)
  }

  const toggleCategory = (index: number) => {
    if (searchTerm) return // Don't toggle during search
    setExpandedCategories((prev) => {
      const next = new Set(prev)
      if (next.has(index)) {
        next.delete(index)
      } else {
        next.add(index)
      }
      return next
    })
  }

  // Get original index for a filtered category
  const getOriginalIndex = (categoryName: string) => {
    return paletteCategories.findIndex((c) => c.name === categoryName)
  }

  return (
    <div className="flex flex-col">
      {/* Search bar */}
      <div className="p-2 border-b border-gray-700">
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Search elements..."
            className="w-full px-3 py-1.5 pl-8 pr-8 bg-gray-700 border border-gray-600 rounded text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {/* Search icon */}
          <svg
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {/* Clear button */}
          {inputValue && (
            <button
              onClick={handleClear}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-200"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
        {/* Search results count */}
        {searchTerm && (
          <div className="mt-1 text-xs text-gray-500">
            {filteredCategories.reduce((acc, c) => acc + c.items.length, 0)} element
            {filteredCategories.reduce((acc, c) => acc + c.items.length, 0) !== 1 ? 's' : ''} found
          </div>
        )}
      </div>

      {/* Hide Pro elements toggle */}
      <div className="px-2 py-1.5 border-b border-gray-700 flex items-center justify-between">
        <span className="text-xs text-gray-400">Hide Pro elements</span>
        <button
          onClick={handleToggleHidePro}
          className={`
            relative w-8 h-4 rounded-full transition-colors
            ${hideProElements ? 'bg-violet-500' : 'bg-gray-600'}
          `}
        >
          <div
            className={`
              absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform
              ${hideProElements ? 'left-4' : 'left-0.5'}
            `}
          />
        </button>
      </div>

      {/* Categories */}
      {filteredCategories.map((category) => {
        const originalIndex = getOriginalIndex(category.name)
        return (
          <PaletteCategory
            key={category.name}
            category={category}
            isExpanded={getIsExpanded(originalIndex, category.name)}
            onToggle={() => toggleCategory(originalIndex)}
          />
        )
      })}

      {/* No results message */}
      {searchTerm && filteredCategories.length === 0 && (
        <div className="p-4 text-center text-gray-500 text-sm">
          No elements found for "{inputValue}"
        </div>
      )}

      {!searchTerm && <CustomSVGUpload />}
    </div>
  )
}
