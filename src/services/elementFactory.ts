/**
 * Element Factory Service
 * Creates elements from type strings with optional overrides
 */

import {
  createKnob,
  createSlider,
  createButton,
  createLabel,
  createMeter,
  createImage,
  createDropdown,
  createCheckbox,
  createRadioGroup,
  createRangeSlider,
  createModulationMatrix,
  createRectangle,
  createLine,
  createAsciiArt,
  createDbDisplay,
  createFrequencyDisplay,
  createGainReductionMeter,
  createPanel,
  createFrame,
  createGroupBox,
  createCollapsible,
  createTooltip,
  createWindowChrome,
  createHorizontalSpacer,
  createVerticalSpacer,
  createTextField,
  createWaveform,
  createOscilloscope,
  createPresetBrowser,
  createSvgGraphic,
  createEQCurve,
  createCompressorCurve,
  createEnvelopeDisplay,
  createLFODisplay,
  createFilterResponse,
  // Additional controls
  createSteppedKnob,
  createCenterDetentKnob,
  createDotIndicatorKnob,
  createMultiSlider,
  createBipolarSlider,
  createCrossfadeSlider,
  createNotchedSlider,
  createArcSlider,
  createAsciiSlider,
  createAsciiButton,
  createIconButton,
  createToggleSwitch,
  createPowerButton,
  createRockerSwitch,
  createRotarySwitch,
  createSegmentButton,
  createStepper,
  createBreadcrumb,
  createMultiSelectDropdown,
  createComboBox,
  createMenuButton,
  createTabBar,
  createTagSelector,
  createTreeView,
  // Value displays
  createNumericDisplay,
  createTimeDisplay,
  createPercentageDisplay,
  createRatioDisplay,
  createNoteDisplay,
  createBpmDisplay,
  createEditableDisplay,
  createMultiValueDisplay,
  // LEDs
  createSingleLED,
  createBiColorLED,
  createTriColorLED,
  createLEDArray,
  createLEDRing,
  createLEDMatrix,
  // Professional meters
  createRMSMeterMono,
  createRMSMeterStereo,
  createVUMeterMono,
  createVUMeterStereo,
  createPPMType1Mono,
  createPPMType1Stereo,
  createPPMType2Mono,
  createPPMType2Stereo,
  createTruePeakMeterMono,
  createTruePeakMeterStereo,
  createLUFSMomentaryMono,
  createLUFSMomentaryStereo,
  createLUFSShorttermMono,
  createLUFSShorttermStereo,
  createLUFSIntegratedMono,
  createLUFSIntegratedStereo,
  createK12MeterMono,
  createK12MeterStereo,
  createK14MeterMono,
  createK14MeterStereo,
  createK20MeterMono,
  createK20MeterStereo,
  createCorrelationMeter,
  createStereoWidthMeter,
  // Visualizations
  createScrollingWaveform,
  createSpectrumAnalyzer,
  createSpectrogram,
  createGoniometer,
  createVectorscope,
  // Specialized Audio
  createPianoKeyboard,
  createDrumPad,
  createPadGrid,
  createStepSequencer,
  createXYPad,
  createWavetableDisplay,
  createHarmonicEditor,
  createLoopPoints,
  createEnvelopeEditor,
  createSampleDisplay,
  createPatchBay,
  createSignalFlow,
  ElementConfig,
} from '../types/elements'

// Base overrides that apply to all element types
interface BaseOverrides {
  id?: string
  x?: number
  y?: number
  width?: number
  height?: number
  name?: string
  parentId?: string
  [key: string]: unknown
}

/**
 * Create an element from a type string
 * Returns null if the type is not recognized
 */
export function createElementFromType(
  elementType: string,
  overrides?: BaseOverrides
): ElementConfig | null {
  const base = {
    id: overrides?.id || crypto.randomUUID(),
    x: overrides?.x ?? 0,
    y: overrides?.y ?? 0,
    ...(overrides?.name && { name: overrides.name }),
    ...(overrides?.parentId && { parentId: overrides.parentId }),
  }

  switch (elementType.toLowerCase()) {
    // Basic controls
    case 'knob':
      return createKnob({ ...base, width: overrides?.width ?? 60, height: overrides?.height ?? 60 })
    case 'steppedknob':
      return createSteppedKnob({ ...base, width: overrides?.width ?? 60, height: overrides?.height ?? 60 })
    case 'centerdetentknob':
      return createCenterDetentKnob({ ...base, width: overrides?.width ?? 60, height: overrides?.height ?? 60 })
    case 'dotindicatorknob':
      return createDotIndicatorKnob({ ...base, width: overrides?.width ?? 60, height: overrides?.height ?? 60 })
    case 'slider':
      return createSlider({ ...base, width: overrides?.width ?? 30, height: overrides?.height ?? 120 })
    case 'rangeslider':
      return createRangeSlider({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 30 })
    case 'multislider':
      return createMultiSlider({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 100 })
    case 'bipolarslider':
      return createBipolarSlider({ ...base, width: overrides?.width ?? 30, height: overrides?.height ?? 120 })
    case 'crossfadeslider':
      return createCrossfadeSlider({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 30 })
    case 'notchedslider':
      return createNotchedSlider({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 30 })
    case 'arcslider':
      return createArcSlider({ ...base, width: overrides?.width ?? 100, height: overrides?.height ?? 100 })
    case 'asciislider':
      return createAsciiSlider({ ...base, width: overrides?.width ?? 280, height: overrides?.height ?? 24 })
    case 'asciibutton':
      return createAsciiButton({ ...base, width: overrides?.width ?? 100, height: overrides?.height ?? 60 })

    // Buttons
    case 'button':
      return createButton({ ...base, width: overrides?.width ?? 80, height: overrides?.height ?? 30 })
    case 'iconbutton':
      return createIconButton({ ...base, width: overrides?.width ?? 40, height: overrides?.height ?? 40 })
    case 'powerbutton':
      return createPowerButton({ ...base, width: overrides?.width ?? 40, height: overrides?.height ?? 40 })

    // Switches
    case 'toggleswitch':
      return createToggleSwitch({ ...base, width: overrides?.width ?? 50, height: overrides?.height ?? 26 })
    case 'rockerswitch':
      return createRockerSwitch({ ...base, width: overrides?.width ?? 40, height: overrides?.height ?? 60 })
    case 'rotaryswitch':
      return createRotarySwitch({ ...base, width: overrides?.width ?? 60, height: overrides?.height ?? 60 })
    case 'segmentbutton':
      return createSegmentButton({ ...base, width: overrides?.width ?? 150, height: overrides?.height ?? 30 })

    // Selection controls
    case 'checkbox':
      return createCheckbox({ ...base, width: overrides?.width ?? 100, height: overrides?.height ?? 24 })
    case 'radiogroup':
      return createRadioGroup({ ...base, width: overrides?.width ?? 120, height: overrides?.height ?? 80 })
    case 'dropdown':
      return createDropdown({ ...base, width: overrides?.width ?? 120, height: overrides?.height ?? 30 })
    case 'multiselectdropdown':
      return createMultiSelectDropdown({ ...base, width: overrides?.width ?? 150, height: overrides?.height ?? 30 })
    case 'combobox':
      return createComboBox({ ...base, width: overrides?.width ?? 150, height: overrides?.height ?? 30 })
    case 'menubutton':
      return createMenuButton({ ...base, width: overrides?.width ?? 100, height: overrides?.height ?? 30 })

    // Navigation
    case 'tabbar':
      return createTabBar({ ...base, width: overrides?.width ?? 300, height: overrides?.height ?? 40 })
    case 'breadcrumb':
      return createBreadcrumb({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 30 })
    case 'stepper':
      return createStepper({ ...base, width: overrides?.width ?? 100, height: overrides?.height ?? 30 })
    case 'tagselector':
      return createTagSelector({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 60 })
    case 'treeview':
      return createTreeView({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 150 })

    // Text
    case 'label':
      return createLabel({ ...base, width: overrides?.width ?? 100, height: overrides?.height ?? 24 })
    case 'textfield':
      return createTextField({ ...base, width: overrides?.width ?? 150, height: overrides?.height ?? 30 })

    // Value displays
    case 'numericdisplay':
      return createNumericDisplay({ ...base, width: overrides?.width ?? 80, height: overrides?.height ?? 30 })
    case 'dbdisplay':
      return createDbDisplay({ ...base, width: overrides?.width ?? 80, height: overrides?.height ?? 30 })
    case 'frequencydisplay':
      return createFrequencyDisplay({ ...base, width: overrides?.width ?? 100, height: overrides?.height ?? 30 })
    case 'timedisplay':
      return createTimeDisplay({ ...base, width: overrides?.width ?? 100, height: overrides?.height ?? 30 })
    case 'percentagedisplay':
      return createPercentageDisplay({ ...base, width: overrides?.width ?? 80, height: overrides?.height ?? 30 })
    case 'ratiodisplay':
      return createRatioDisplay({ ...base, width: overrides?.width ?? 80, height: overrides?.height ?? 30 })
    case 'notedisplay':
      return createNoteDisplay({ ...base, width: overrides?.width ?? 60, height: overrides?.height ?? 30 })
    case 'bpmdisplay':
      return createBpmDisplay({ ...base, width: overrides?.width ?? 80, height: overrides?.height ?? 30 })
    case 'editabledisplay':
      return createEditableDisplay({ ...base, width: overrides?.width ?? 80, height: overrides?.height ?? 30 })
    case 'multivaluedisplay':
      return createMultiValueDisplay({ ...base, width: overrides?.width ?? 120, height: overrides?.height ?? 80 })

    // LEDs
    case 'singleled':
      return createSingleLED({ ...base, width: overrides?.width ?? 16, height: overrides?.height ?? 16 })
    case 'bicolorled':
      return createBiColorLED({ ...base, width: overrides?.width ?? 16, height: overrides?.height ?? 16 })
    case 'tricolorled':
      return createTriColorLED({ ...base, width: overrides?.width ?? 16, height: overrides?.height ?? 16 })
    case 'ledarray':
      return createLEDArray({ ...base, width: overrides?.width ?? 100, height: overrides?.height ?? 16 })
    case 'ledring':
      return createLEDRing({ ...base, width: overrides?.width ?? 60, height: overrides?.height ?? 60 })
    case 'ledmatrix':
      return createLEDMatrix({ ...base, width: overrides?.width ?? 100, height: overrides?.height ?? 60 })

    // Meters - Basic
    case 'meter':
      return createMeter({ ...base, width: overrides?.width ?? 20, height: overrides?.height ?? 100 })
    case 'gainreductionmeter':
      return createGainReductionMeter({ ...base, width: overrides?.width ?? 20, height: overrides?.height ?? 100 })

    // Meters - RMS
    case 'rmsmetermo':
      return createRMSMeterMono({ ...base, width: overrides?.width ?? 20, height: overrides?.height ?? 100 })
    case 'rmsmeterstereo':
      return createRMSMeterStereo({ ...base, width: overrides?.width ?? 40, height: overrides?.height ?? 100 })

    // Meters - VU
    case 'vumetermono':
      return createVUMeterMono({ ...base, width: overrides?.width ?? 20, height: overrides?.height ?? 100 })
    case 'vumeterstereo':
      return createVUMeterStereo({ ...base, width: overrides?.width ?? 40, height: overrides?.height ?? 100 })

    // Meters - PPM
    case 'ppmtype1mono':
      return createPPMType1Mono({ ...base, width: overrides?.width ?? 20, height: overrides?.height ?? 100 })
    case 'ppmtype1stereo':
      return createPPMType1Stereo({ ...base, width: overrides?.width ?? 40, height: overrides?.height ?? 100 })
    case 'ppmtype2mono':
      return createPPMType2Mono({ ...base, width: overrides?.width ?? 20, height: overrides?.height ?? 100 })
    case 'ppmtype2stereo':
      return createPPMType2Stereo({ ...base, width: overrides?.width ?? 40, height: overrides?.height ?? 100 })

    // Meters - True Peak
    case 'truepeakmetermono':
      return createTruePeakMeterMono({ ...base, width: overrides?.width ?? 20, height: overrides?.height ?? 100 })
    case 'truepeakmeterstereo':
      return createTruePeakMeterStereo({ ...base, width: overrides?.width ?? 40, height: overrides?.height ?? 100 })

    // Meters - LUFS
    case 'lufsmomomo':
      return createLUFSMomentaryMono({ ...base, width: overrides?.width ?? 20, height: overrides?.height ?? 100 })
    case 'lufsmomostereo':
      return createLUFSMomentaryStereo({ ...base, width: overrides?.width ?? 40, height: overrides?.height ?? 100 })
    case 'lufsshortmono':
      return createLUFSShorttermMono({ ...base, width: overrides?.width ?? 20, height: overrides?.height ?? 100 })
    case 'lufsshortstereo':
      return createLUFSShorttermStereo({ ...base, width: overrides?.width ?? 40, height: overrides?.height ?? 100 })
    case 'lufsintmono':
      return createLUFSIntegratedMono({ ...base, width: overrides?.width ?? 20, height: overrides?.height ?? 100 })
    case 'lufsintstereo':
      return createLUFSIntegratedStereo({ ...base, width: overrides?.width ?? 40, height: overrides?.height ?? 100 })

    // Meters - K-System
    case 'k12metermono':
      return createK12MeterMono({ ...base, width: overrides?.width ?? 20, height: overrides?.height ?? 100 })
    case 'k12meterstereo':
      return createK12MeterStereo({ ...base, width: overrides?.width ?? 40, height: overrides?.height ?? 100 })
    case 'k14metermono':
      return createK14MeterMono({ ...base, width: overrides?.width ?? 20, height: overrides?.height ?? 100 })
    case 'k14meterstereo':
      return createK14MeterStereo({ ...base, width: overrides?.width ?? 40, height: overrides?.height ?? 100 })
    case 'k20metermono':
      return createK20MeterMono({ ...base, width: overrides?.width ?? 20, height: overrides?.height ?? 100 })
    case 'k20meterstereo':
      return createK20MeterStereo({ ...base, width: overrides?.width ?? 40, height: overrides?.height ?? 100 })

    // Meters - Analysis
    case 'correlationmeter':
      return createCorrelationMeter({ ...base, width: overrides?.width ?? 150, height: overrides?.height ?? 20 })
    case 'stereowidthmeter':
      return createStereoWidthMeter({ ...base, width: overrides?.width ?? 150, height: overrides?.height ?? 20 })

    // Visualizations
    case 'waveform':
      return createWaveform({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 80 })
    case 'oscilloscope':
      return createOscilloscope({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 150 })
    case 'scrollingwaveform':
      return createScrollingWaveform({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 80 })
    case 'spectrumanalyzer':
      return createSpectrumAnalyzer({ ...base, width: overrides?.width ?? 250, height: overrides?.height ?? 150 })
    case 'spectrogram':
      return createSpectrogram({ ...base, width: overrides?.width ?? 250, height: overrides?.height ?? 150 })
    case 'goniometer':
      return createGoniometer({ ...base, width: overrides?.width ?? 150, height: overrides?.height ?? 150 })
    case 'vectorscope':
      return createVectorscope({ ...base, width: overrides?.width ?? 150, height: overrides?.height ?? 150 })

    // DSP Visualizations
    case 'eqcurve':
      return createEQCurve({ ...base, width: overrides?.width ?? 300, height: overrides?.height ?? 150 })
    case 'compressorcurve':
      return createCompressorCurve({ ...base, width: overrides?.width ?? 150, height: overrides?.height ?? 150 })
    case 'envelopedisplay':
      return createEnvelopeDisplay({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 100 })
    case 'lfodisplay':
      return createLFODisplay({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 100 })
    case 'filterresponse':
      return createFilterResponse({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 100 })

    // Containers
    case 'panel':
      return createPanel({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 150 })
    case 'frame':
      return createFrame({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 150 })
    case 'groupbox':
      return createGroupBox({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 150 })
    case 'collapsible':
      return createCollapsible({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 200 })
    case 'tooltip':
      return createTooltip({ ...base, width: overrides?.width ?? 150, height: overrides?.height ?? 60 })
    case 'windowchrome':
      return createWindowChrome({ ...base, width: overrides?.width ?? 400, height: overrides?.height ?? 300 })

    // Layout
    case 'horizontalspacer':
      return createHorizontalSpacer({ ...base, width: overrides?.width ?? 40, height: overrides?.height ?? 20 })
    case 'verticalspacer':
      return createVerticalSpacer({ ...base, width: overrides?.width ?? 20, height: overrides?.height ?? 40 })

    // Graphics
    case 'image':
      return createImage({ ...base, width: overrides?.width ?? 100, height: overrides?.height ?? 100 })
    case 'svggraphic':
      return createSvgGraphic({ ...base, width: overrides?.width ?? 100, height: overrides?.height ?? 100 })
    case 'rectangle':
      return createRectangle({ ...base, width: overrides?.width ?? 100, height: overrides?.height ?? 60 })
    case 'line':
      return createLine({ ...base, width: overrides?.width ?? 100, height: overrides?.height ?? 2 })
    case 'asciiart':
      return createAsciiArt({ ...base, width: overrides?.width ?? 300, height: overrides?.height ?? 200 })

    // Complex components
    case 'modulationmatrix':
      return createModulationMatrix({ ...base, width: overrides?.width ?? 300, height: overrides?.height ?? 200 })
    case 'presetbrowser':
      return createPresetBrowser({ ...base, width: overrides?.width ?? 250, height: overrides?.height ?? 200 })

    // Specialized Audio
    case 'pianokeyboard':
      return createPianoKeyboard({ ...base, width: overrides?.width ?? 300, height: overrides?.height ?? 80 })
    case 'drumpad':
      return createDrumPad({ ...base, width: overrides?.width ?? 60, height: overrides?.height ?? 60 })
    case 'padgrid':
      return createPadGrid({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 200 })
    case 'stepsequencer':
      return createStepSequencer({ ...base, width: overrides?.width ?? 400, height: overrides?.height ?? 100 })
    case 'xypad':
      return createXYPad({ ...base, width: overrides?.width ?? 150, height: overrides?.height ?? 150 })
    case 'wavetabledisplay':
      return createWavetableDisplay({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 120 })
    case 'harmoniceditor':
      return createHarmonicEditor({ ...base, width: overrides?.width ?? 250, height: overrides?.height ?? 100 })
    case 'looppoints':
      return createLoopPoints({ ...base, width: overrides?.width ?? 300, height: overrides?.height ?? 80 })
    case 'envelopeeditor':
      return createEnvelopeEditor({ ...base, width: overrides?.width ?? 300, height: overrides?.height ?? 150 })
    case 'sampledisplay':
      return createSampleDisplay({ ...base, width: overrides?.width ?? 300, height: overrides?.height ?? 100 })
    case 'patchbay':
      return createPatchBay({ ...base, width: overrides?.width ?? 200, height: overrides?.height ?? 150 })
    case 'signalflow':
      return createSignalFlow({ ...base, width: overrides?.width ?? 300, height: overrides?.height ?? 150 })

    default:
      console.warn(`Unknown element type: ${elementType}`)
      return null
  }
}
