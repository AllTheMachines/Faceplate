import { useDraggable } from '@dnd-kit/core'
import { useStore } from '../../store'
import { createElementFromType } from '../../services/elementFactory'
import {
  createKnob,
  createSlider,
  createButton,
  createLabel,
  createMeter,
  createImage,
  createModulationMatrix,
  createRectangle,
  createLine,
  createDbDisplay,
  createFrequencyDisplay,
  createGainReductionMeter,
  createPanel,
  createFrame,
  createGroupBox,
  createCollapsible,
  createRangeSlider,
  createDropdown,
  createCheckbox,
  createRadioGroup,
  createTextField,
  createWaveform,
  createOscilloscope,
  createPresetBrowser,
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
  createAsciiArt,
  createIconButton,
  createToggleSwitch,
  createPowerButton,
  createRockerSwitch,
  createRotarySwitch,
  createSegmentButton,
  createNumericDisplay,
  createTimeDisplay,
  createPercentageDisplay,
  createRatioDisplay,
  createNoteDisplay,
  createBpmDisplay,
  createEditableDisplay,
  createMultiValueDisplay,
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
  createScrollingWaveform,
  createSpectrumAnalyzer,
  createSpectrogram,
  createGoniometer,
  createVectorscope,
  createEQCurve,
  createCompressorCurve,
  createEnvelopeDisplay,
  createLFODisplay,
  createFilterResponse,
  createStepper,
  createBreadcrumb,
  createMultiSelectDropdown,
  createComboBox,
  createMenuButton,
  createTabBar,
  createTagSelector,
  createTreeView,
  createSvgGraphic,
  createTooltip,
  createHorizontalSpacer,
  createVerticalSpacer,
  createWindowChrome,
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
} from '../../types/elements'
import {
  KnobRenderer,
  SliderRenderer,
  ButtonRenderer,
  LabelRenderer,
  MeterRenderer,
  ModulationMatrixRenderer,
  RectangleRenderer,
  LineRenderer,
  DbDisplayRenderer,
  FrequencyDisplayRenderer,
  GainReductionMeterRenderer,
  PanelRenderer,
  FrameRenderer,
  GroupBoxRenderer,
  CollapsibleRenderer,
  RangeSliderRenderer,
  DropdownRenderer,
  CheckboxRenderer,
  RadioGroupRenderer,
  TextFieldRenderer,
  WaveformRenderer,
  OscilloscopeRenderer,
  PresetBrowserRenderer,
  SteppedKnobRenderer,
  CenterDetentKnobRenderer,
  DotIndicatorKnobRenderer,
  MultiSliderRenderer,
  BipolarSliderRenderer,
  CrossfadeSliderRenderer,
  NotchedSliderRenderer,
  ArcSliderRenderer,
  AsciiSliderRenderer,
  AsciiButtonRenderer,
  AsciiArtRenderer,
  IconButtonRenderer,
  ToggleSwitchRenderer,
  PowerButtonRenderer,
  RockerSwitchRenderer,
  RotarySwitchRenderer,
  SegmentButtonRenderer,
  NumericDisplayRenderer,
  TimeDisplayRenderer,
  PercentageDisplayRenderer,
  RatioDisplayRenderer,
  NoteDisplayRenderer,
  BpmDisplayRenderer,
  EditableDisplayRenderer,
  MultiValueDisplayRenderer,
  RMSMeterMonoRenderer,
  RMSMeterStereoRenderer,
  VUMeterMonoRenderer,
  VUMeterStereoRenderer,
  PPMType1MonoRenderer,
  PPMType1StereoRenderer,
  PPMType2MonoRenderer,
  PPMType2StereoRenderer,
  TruePeakMeterMonoRenderer,
  TruePeakMeterStereoRenderer,
  LUFSMomentaryMonoRenderer,
  LUFSMomentaryStereoRenderer,
  LUFSShorttermMonoRenderer,
  LUFSShorttermStereoRenderer,
  LUFSIntegratedMonoRenderer,
  LUFSIntegratedStereoRenderer,
  K12MeterMonoRenderer,
  K12MeterStereoRenderer,
  K14MeterMonoRenderer,
  K14MeterStereoRenderer,
  K20MeterMonoRenderer,
  K20MeterStereoRenderer,
  CorrelationMeterRenderer,
  StereoWidthMeterRenderer,
  ScrollingWaveformRenderer,
  SpectrumAnalyzerRenderer,
  SpectrogramRenderer,
  GoniometerRenderer,
  VectorscopeRenderer,
  EQCurveRenderer,
  CompressorCurveRenderer,
  EnvelopeDisplayRenderer,
  LFODisplayRenderer,
  FilterResponseRenderer,
  StepperRenderer,
  BreadcrumbRenderer,
  MultiSelectDropdownRenderer,
  ComboBoxRenderer,
  MenuButtonRenderer,
  TabBarRenderer,
  TagSelectorRenderer,
  TreeViewRenderer,
  SvgGraphicRenderer,
  TooltipRenderer,
  HorizontalSpacerRenderer,
  VerticalSpacerRenderer,
  WindowChromeRenderer,
  PianoKeyboardRenderer,
  DrumPadRenderer,
  PadGridRenderer,
  StepSequencerRenderer,
  XYPadRenderer,
  WavetableDisplayRenderer,
  HarmonicEditorRenderer,
  LoopPointsRenderer,
  EnvelopeEditorRenderer,
  SampleDisplayRenderer,
  PatchBayRenderer,
  SignalFlowRenderer,
} from '../elements/renderers'

interface PaletteItemProps {
  id: string
  elementType: string
  name: string
  variant?: Record<string, unknown>
}

export function PaletteItem({ id, elementType, name, variant }: PaletteItemProps) {
  const editingContainerId = useStore((state) => state.editingContainerId)
  const addChildToContainer = useStore((state) => state.addChildToContainer)

  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${id}`,
    data: { elementType, variant },
  })

  // Handle click to add element when in container editing mode
  const handleClick = () => {
    if (editingContainerId) {
      // Get current children count to offset new element position
      const container = useStore.getState().elements.find(el => el.id === editingContainerId)
      const childCount = (container as { children?: string[] })?.children?.length || 0

      // Spiral/grid placement for new elements
      const offsetX = (childCount % 5) * 30 + 20
      const offsetY = Math.floor(childCount / 5) * 30 + 20

      // Create element and add to container
      const element = createElementFromType(elementType, { x: offsetX, y: offsetY, ...variant })
      if (element) {
        addChildToContainer(editingContainerId, element)
      }
    }
  }

  // Create preview element with small dimensions
  const createPreviewElement = (): ElementConfig | null => {
    const baseOverrides = {
      id: `preview-${id}`,
      name: 'Preview',
      x: 0,
      y: 0,
    }

    switch (elementType) {
      case 'knob':
        return createKnob({
          ...baseOverrides,
          diameter: 40,
          width: 40,
          height: 40,
          ...variant,
        })
      case 'steppedknob':
        return createSteppedKnob({
          ...baseOverrides,
          diameter: 40,
          width: 40,
          height: 40,
          ...variant,
        })
      case 'centerdetentknob':
        return createCenterDetentKnob({
          ...baseOverrides,
          diameter: 40,
          width: 40,
          height: 40,
          ...variant,
        })
      case 'dotindicatorknob':
        return createDotIndicatorKnob({
          ...baseOverrides,
          diameter: 40,
          width: 40,
          height: 40,
          ...variant,
        })
      case 'slider':
        return createSlider({
          ...baseOverrides,
          width: variant?.orientation === 'horizontal' ? 60 : 20,
          height: variant?.orientation === 'horizontal' ? 20 : 60,
          thumbWidth: 12,
          thumbHeight: 12,
          ...variant,
        })
      case 'rangeslider':
        return createRangeSlider({
          ...baseOverrides,
          width: 60,
          height: 20,
          thumbWidth: 8,
          thumbHeight: 8,
          ...variant,
        })
      case 'multislider':
        return createMultiSlider({
          ...baseOverrides,
          width: 60,
          height: 40,
          sliderCount: 4,
          sliderWidth: 10,
          ...variant,
        })
      case 'bipolarslider':
        return createBipolarSlider({
          ...baseOverrides,
          width: 20,
          height: 60,
          thumbWidth: 12,
          thumbHeight: 12,
          ...variant,
        })
      case 'crossfadeslider':
        return createCrossfadeSlider({
          ...baseOverrides,
          width: 60,
          height: 20,
          thumbWidth: 12,
          thumbHeight: 12,
          ...variant,
        })
      case 'notchedslider':
        return createNotchedSlider({
          ...baseOverrides,
          width: 60,
          height: 20,
          thumbWidth: 12,
          thumbHeight: 12,
          notchCount: 5,
          ...variant,
        })
      case 'arcslider':
        return createArcSlider({
          ...baseOverrides,
          width: 50,
          height: 50,
          ...variant,
        })
      case 'asciislider':
        return createAsciiSlider({
          ...baseOverrides,
          width: 70,
          height: 20,
          barWidth: 8,
          fontSize: 10,
          showValue: false,
          showMinMax: false,
          ...variant,
        })
      case 'asciiart':
        return createAsciiArt({
          ...baseOverrides,
          width: 60,
          height: 40,
          content: '+-+\n|#|\n+-+',
          fontSize: 8,
          ...variant,
        })
      case 'asciibutton':
        return createAsciiButton({
          ...baseOverrides,
          width: 55,
          height: 40,
          fontSize: 8,
          normalArt: '┌───┐\n│BTN│\n└───┘',
          pressedArt: '╔═══╗\n║BTN║\n╚═══╝',
          ...variant,
        })
      case 'button':
        return createButton({
          ...baseOverrides,
          width: 60,
          height: 30,
          label: variant?.mode === 'toggle' ? 'TGL' : 'BTN',
          ...variant,
        })
      case 'iconbutton':
        return createIconButton({
          ...baseOverrides,
          width: 32,
          height: 32,
          ...variant,
        })
      case 'toggleswitch':
        return createToggleSwitch({
          ...baseOverrides,
          width: 50,
          height: 26,
          ...variant,
        })
      case 'powerbutton':
        return createPowerButton({
          ...baseOverrides,
          width: 40,
          height: 40,
          ...variant,
        })
      case 'rockerswitch':
        return createRockerSwitch({
          ...baseOverrides,
          width: 40,
          height: 50,
          ...variant,
        })
      case 'rotaryswitch':
        return createRotarySwitch({
          ...baseOverrides,
          width: 50,
          height: 50,
          ...variant,
        })
      case 'segmentbutton':
        return createSegmentButton({
          ...baseOverrides,
          width: 60,
          height: 24,
          segments: ['A', 'B', 'C'],
          ...variant,
        })
      case 'label':
        return createLabel({
          ...baseOverrides,
          width: 60,
          height: 24,
          text: 'Aa',
          fontSize: 12,
          ...variant,
        })
      case 'numericdisplay':
        return createNumericDisplay({
          ...baseOverrides,
          width: 50,
          height: 20,
          fontSize: 10,
          ...variant,
        })
      case 'timedisplay':
        return createTimeDisplay({
          ...baseOverrides,
          width: 60,
          height: 20,
          fontSize: 10,
          ...variant,
        })
      case 'percentagedisplay':
        return createPercentageDisplay({
          ...baseOverrides,
          width: 50,
          height: 20,
          fontSize: 10,
          ...variant,
        })
      case 'ratiodisplay':
        return createRatioDisplay({
          ...baseOverrides,
          width: 50,
          height: 20,
          fontSize: 10,
          ...variant,
        })
      case 'notedisplay':
        return createNoteDisplay({
          ...baseOverrides,
          width: 50,
          height: 20,
          fontSize: 10,
          ...variant,
        })
      case 'bpmdisplay':
        return createBpmDisplay({
          ...baseOverrides,
          width: 50,
          height: 20,
          fontSize: 10,
          ...variant,
        })
      case 'editabledisplay':
        return createEditableDisplay({
          ...baseOverrides,
          width: 50,
          height: 20,
          fontSize: 10,
          ...variant,
        })
      case 'multivaluedisplay':
        return createMultiValueDisplay({
          ...baseOverrides,
          width: 60,
          height: 50,
          fontSize: 8,
          padding: 4,
          values: [
            { value: 0.5, min: 0, max: 100, format: 'numeric', label: 'V1', decimalPlaces: 0 },
            { value: 0.75, min: 0, max: 100, format: 'numeric', label: 'V2', decimalPlaces: 0 },
          ],
          ...variant,
        })
      case 'meter':
        return createMeter({
          ...baseOverrides,
          width: 16,
          height: 60,
          ...variant,
        })
      case 'rmsmetermo':
        return createRMSMeterMono({
          ...baseOverrides,
          width: 16,
          height: 60,
          ...variant,
        })
      case 'rmsmeterstereo':
        return createRMSMeterStereo({
          ...baseOverrides,
          width: 32,
          height: 60,
          ...variant,
        })
      case 'vumetermono':
        return createVUMeterMono({
          ...baseOverrides,
          width: 16,
          height: 60,
          ...variant,
        })
      case 'vumeterstereo':
        return createVUMeterStereo({
          ...baseOverrides,
          width: 32,
          height: 60,
          ...variant,
        })
      case 'ppmtype1mono':
        return createPPMType1Mono({
          ...baseOverrides,
          width: 16,
          height: 60,
          ...variant,
        })
      case 'ppmtype1stereo':
        return createPPMType1Stereo({
          ...baseOverrides,
          width: 32,
          height: 60,
          ...variant,
        })
      case 'ppmtype2mono':
        return createPPMType2Mono({
          ...baseOverrides,
          width: 16,
          height: 60,
          ...variant,
        })
      case 'ppmtype2stereo':
        return createPPMType2Stereo({
          ...baseOverrides,
          width: 32,
          height: 60,
          ...variant,
        })
      case 'truepeakmetermono':
        return createTruePeakMeterMono({
          ...baseOverrides,
          width: 16,
          height: 60,
          ...variant,
        })
      case 'truepeakmeterstereo':
        return createTruePeakMeterStereo({
          ...baseOverrides,
          width: 32,
          height: 60,
          ...variant,
        })
      case 'lufsmomomo':
        return createLUFSMomentaryMono({
          ...baseOverrides,
          width: 16,
          height: 60,
          ...variant,
        })
      case 'lufsmomostereo':
        return createLUFSMomentaryStereo({
          ...baseOverrides,
          width: 32,
          height: 60,
          ...variant,
        })
      case 'lufsshortmono':
        return createLUFSShorttermMono({
          ...baseOverrides,
          width: 16,
          height: 60,
          ...variant,
        })
      case 'lufsshortstereo':
        return createLUFSShorttermStereo({
          ...baseOverrides,
          width: 32,
          height: 60,
          ...variant,
        })
      case 'lufsintmono':
        return createLUFSIntegratedMono({
          ...baseOverrides,
          width: 16,
          height: 60,
          ...variant,
        })
      case 'lufsintstereo':
        return createLUFSIntegratedStereo({
          ...baseOverrides,
          width: 32,
          height: 60,
          ...variant,
        })
      case 'k12metermono':
        return createK12MeterMono({
          ...baseOverrides,
          width: 16,
          height: 60,
          ...variant,
        })
      case 'k12meterstereo':
        return createK12MeterStereo({
          ...baseOverrides,
          width: 32,
          height: 60,
          ...variant,
        })
      case 'k14metermono':
        return createK14MeterMono({
          ...baseOverrides,
          width: 16,
          height: 60,
          ...variant,
        })
      case 'k14meterstereo':
        return createK14MeterStereo({
          ...baseOverrides,
          width: 32,
          height: 60,
          ...variant,
        })
      case 'k20metermono':
        return createK20MeterMono({
          ...baseOverrides,
          width: 16,
          height: 60,
          ...variant,
        })
      case 'k20meterstereo':
        return createK20MeterStereo({
          ...baseOverrides,
          width: 32,
          height: 60,
          ...variant,
        })
      case 'correlationmeter':
        return createCorrelationMeter({
          ...baseOverrides,
          width: 60,
          height: 16,
          ...variant,
        })
      case 'stereowidthmeter':
        return createStereoWidthMeter({
          ...baseOverrides,
          width: 60,
          height: 16,
          ...variant,
        })
      case 'dbdisplay':
        return createDbDisplay({
          ...baseOverrides,
          width: 50,
          height: 20,
          fontSize: 10,
          padding: 4,
          ...variant,
        })
      case 'frequencydisplay':
        return createFrequencyDisplay({
          ...baseOverrides,
          width: 60,
          height: 20,
          fontSize: 10,
          padding: 4,
          ...variant,
        })
      case 'gainreductionmeter':
        return createGainReductionMeter({
          ...baseOverrides,
          width: 16,
          height: 60,
          fontSize: 8,
          showValue: false,
          ...variant,
        })
      case 'waveform':
        return createWaveform({
          ...baseOverrides,
          width: 60,
          height: 40,
          showGrid: false,
          ...variant,
        })
      case 'oscilloscope':
        return createOscilloscope({
          ...baseOverrides,
          width: 60,
          height: 40,
          showGrid: true,
          gridDivisions: 4,
          ...variant,
        })
      case 'scrollingwaveform':
        return createScrollingWaveform({
          ...baseOverrides,
          width: 60,
          height: 40,
          ...variant,
        })
      case 'spectrumanalyzer':
        return createSpectrumAnalyzer({
          ...baseOverrides,
          width: 60,
          height: 40,
          ...variant,
        })
      case 'spectrogram':
        return createSpectrogram({
          ...baseOverrides,
          width: 60,
          height: 40,
          ...variant,
        })
      case 'goniometer':
        return createGoniometer({
          ...baseOverrides,
          width: 50,
          height: 50,
          ...variant,
        })
      case 'vectorscope':
        return createVectorscope({
          ...baseOverrides,
          width: 50,
          height: 50,
          ...variant,
        })
      case 'eqcurve':
        return createEQCurve({
          ...baseOverrides,
          width: 60,
          height: 40,
          ...variant,
        })
      case 'compressorcurve':
        return createCompressorCurve({
          ...baseOverrides,
          width: 50,
          height: 50,
          ...variant,
        })
      case 'envelopedisplay':
        return createEnvelopeDisplay({
          ...baseOverrides,
          width: 60,
          height: 40,
          ...variant,
        })
      case 'lfodisplay':
        return createLFODisplay({
          ...baseOverrides,
          width: 60,
          height: 40,
          ...variant,
        })
      case 'filterresponse':
        return createFilterResponse({
          ...baseOverrides,
          width: 60,
          height: 40,
          ...variant,
        })
      case 'dropdown':
        return createDropdown({
          ...baseOverrides,
          width: 60,
          height: 24,
          options: ['Option 1', 'Option 2'],
          ...variant,
        })
      case 'checkbox':
        return createCheckbox({
          ...baseOverrides,
          width: 60,
          height: 20,
          label: 'Check',
          ...variant,
        })
      case 'radiogroup':
        return createRadioGroup({
          ...baseOverrides,
          width: 60,
          height: 50,
          options: ['A', 'B'],
          spacing: 4,
          ...variant,
        })
      case 'textfield':
        return createTextField({
          ...baseOverrides,
          width: 60,
          height: 24,
          placeholder: 'Text',
          ...variant,
        })
      case 'stepper':
        return createStepper({
          ...baseOverrides,
          width: 60,
          height: 24,
          ...variant,
        })
      case 'breadcrumb':
        return createBreadcrumb({
          ...baseOverrides,
          width: 60,
          height: 20,
          items: [{ label: 'A' }, { label: 'B' }],
          fontSize: 8,
          ...variant,
        })
      case 'multiselectdropdown':
        return createMultiSelectDropdown({
          ...baseOverrides,
          width: 60,
          height: 24,
          options: ['A', 'B', 'C'],
          ...variant,
        })
      case 'combobox':
        return createComboBox({
          ...baseOverrides,
          width: 60,
          height: 24,
          options: ['A', 'B', 'C'],
          ...variant,
        })
      case 'menubutton':
        return createMenuButton({
          ...baseOverrides,
          width: 60,
          height: 24,
          label: 'Menu',
          menuItems: [{ id: '1', label: 'Item' }],
          ...variant,
        })
      case 'tabbar':
        return createTabBar({
          ...baseOverrides,
          width: 60,
          height: 24,
          tabs: [
            { id: '1', label: 'A', showLabel: true, showIcon: false },
            { id: '2', label: 'B', showLabel: true, showIcon: false },
          ],
          tabHeight: 20,
          ...variant,
        })
      case 'tagselector':
        return createTagSelector({
          ...baseOverrides,
          width: 60,
          height: 30,
          availableTags: [{ id: '1', label: 'Tag' }],
          selectedTags: [],
          ...variant,
        })
      case 'treeview':
        return createTreeView({
          ...baseOverrides,
          width: 60,
          height: 50,
          data: [{ id: '1', name: 'Item', children: [] }],
          fontSize: 8,
          ...variant,
        })
      case 'image':
        return createImage({
          ...baseOverrides,
          width: 50,
          height: 50,
          ...variant,
        })
      case 'svggraphic':
        return createSvgGraphic({
          ...baseOverrides,
          width: 50,
          height: 50,
          ...variant,
        })
      case 'rectangle':
        return createRectangle({
          ...baseOverrides,
          width: 50,
          height: 30,
          ...variant,
        })
      case 'line':
        return createLine({
          ...baseOverrides,
          width: 50,
          height: 2,
          ...variant,
        })
      case 'panel':
        return createPanel({
          ...baseOverrides,
          width: 50,
          height: 40,
          ...variant,
        })
      case 'frame':
        return createFrame({
          ...baseOverrides,
          width: 50,
          height: 40,
          ...variant,
        })
      case 'groupbox':
        return createGroupBox({
          ...baseOverrides,
          width: 50,
          height: 40,
          headerFontSize: 8,
          headerText: 'Group',
          ...variant,
        })
      case 'collapsible':
        return createCollapsible({
          ...baseOverrides,
          width: 50,
          height: 50,
          headerFontSize: 8,
          headerHeight: 16,
          headerText: 'Collapsible',
          maxContentHeight: 30,
          ...variant,
        })
      case 'modulationmatrix':
        return createModulationMatrix({
          ...baseOverrides,
          width: 60,
          height: 50,
          cellSize: 8,
          headerFontSize: 6,
          sources: ['S1', 'S2', 'S3'],
          destinations: ['D1', 'D2', 'D3'],
          ...variant,
        })
      case 'presetbrowser':
        return createPresetBrowser({
          ...baseOverrides,
          width: 60,
          height: 50,
          presets: ['Init'],
          ...variant,
        })
      case 'tooltip':
        return createTooltip({
          ...baseOverrides,
          width: 50,
          height: 30,
          ...variant,
        })
      case 'horizontalspacer':
        return createHorizontalSpacer({
          ...baseOverrides,
          width: 60,
          height: 20,
          ...variant,
        })
      case 'verticalspacer':
        return createVerticalSpacer({
          ...baseOverrides,
          width: 20,
          height: 60,
          ...variant,
        })
      case 'windowchrome':
        return createWindowChrome({
          ...baseOverrides,
          width: 60,
          height: 24,
          ...variant,
        })
      case 'pianokeyboard':
        return createPianoKeyboard({
          ...baseOverrides,
          width: 60,
          height: 30,
          startNote: 48,
          endNote: 60,
          whiteKeyWidth: 8,
          showNoteLabels: false,
          ...variant,
        })
      case 'drumpad':
        return createDrumPad({
          ...baseOverrides,
          width: 40,
          height: 40,
          label: 'PAD',
          ...variant,
        })
      case 'padgrid':
        return createPadGrid({
          ...baseOverrides,
          width: 50,
          height: 50,
          rows: 2,
          columns: 2,
          gridGap: 2,
          ...variant,
        })
      case 'stepsequencer':
        return createStepSequencer({
          ...baseOverrides,
          width: 60,
          height: 30,
          stepCount: 8,
          rowCount: 1,
          showVelocity: false,
          ...variant,
        })
      case 'xypad':
        return createXYPad({
          ...baseOverrides,
          width: 50,
          height: 50,
          showLabels: false,
          gridDivisions: 2,
          ...variant,
        })
      case 'wavetabledisplay':
        return createWavetableDisplay({
          ...baseOverrides,
          width: 60,
          height: 40,
          frameCount: 8,
          ...variant,
        })
      case 'harmoniceditor':
        return createHarmonicEditor({
          ...baseOverrides,
          width: 60,
          height: 35,
          harmonicCount: 8,
          showHarmonicNumbers: false,
          ...variant,
        })
      case 'looppoints':
        return createLoopPoints({
          ...baseOverrides,
          width: 60,
          height: 30,
          showTimeRuler: false,
          ...variant,
        })
      case 'envelopeeditor':
        return createEnvelopeEditor({
          ...baseOverrides,
          width: 60,
          height: 35,
          showLabels: false,
          showValues: false,
          ...variant,
        })
      case 'sampledisplay':
        return createSampleDisplay({
          ...baseOverrides,
          width: 60,
          height: 35,
          showTimeRuler: false,
          ...variant,
        })
      case 'patchbay':
        return createPatchBay({
          ...baseOverrides,
          width: 60,
          height: 50,
          rows: 2,
          columns: 2,
          showLabels: false,
          ...variant,
        })
      case 'signalflow':
        return createSignalFlow({
          ...baseOverrides,
          width: 60,
          height: 35,
          gridCellSize: 20,
          gridRows: 2,
          gridColumns: 3,
          showLabels: false,
          blocks: [
            { id: 'in', label: 'In', x: 0, y: 0.5, width: 1, height: 1, type: 'input' },
            { id: 'out', label: 'Out', x: 2, y: 0.5, width: 1, height: 1, type: 'output' },
          ],
          connections: [
            { id: 'c1', fromBlockId: 'in', toBlockId: 'out', fromPort: 'right', toPort: 'left' },
          ],
          ...variant,
        })
      default:
        return null
    }
  }

  const previewElement = createPreviewElement()

  // Render visual preview based on element type
  const renderPreview = () => {
    if (!previewElement) {
      return (
        <div className="w-12 h-12 bg-gray-600 rounded flex items-center justify-center">
          <span className="text-xs text-gray-400">?</span>
        </div>
      )
    }

    // Container for preview
    const containerStyle = {
      width: `${previewElement.width}px`,
      height: `${previewElement.height}px`,
      position: 'relative' as const,
    }

    switch (previewElement.type) {
      case 'knob':
        return (
          <div style={containerStyle}>
            <KnobRenderer config={previewElement} />
          </div>
        )
      case 'steppedknob':
        return (
          <div style={containerStyle}>
            <SteppedKnobRenderer config={previewElement} />
          </div>
        )
      case 'centerdetentknob':
        return (
          <div style={containerStyle}>
            <CenterDetentKnobRenderer config={previewElement} />
          </div>
        )
      case 'dotindicatorknob':
        return (
          <div style={containerStyle}>
            <DotIndicatorKnobRenderer config={previewElement} />
          </div>
        )
      case 'slider':
        return (
          <div style={containerStyle}>
            <SliderRenderer config={previewElement} />
          </div>
        )
      case 'rangeslider':
        return (
          <div style={containerStyle}>
            <RangeSliderRenderer config={previewElement} />
          </div>
        )
      case 'multislider':
        return (
          <div style={containerStyle}>
            <MultiSliderRenderer config={previewElement} />
          </div>
        )
      case 'bipolarslider':
        return (
          <div style={containerStyle}>
            <BipolarSliderRenderer config={previewElement} />
          </div>
        )
      case 'crossfadeslider':
        return (
          <div style={containerStyle}>
            <CrossfadeSliderRenderer config={previewElement} />
          </div>
        )
      case 'notchedslider':
        return (
          <div style={containerStyle}>
            <NotchedSliderRenderer config={previewElement} />
          </div>
        )
      case 'arcslider':
        return (
          <div style={containerStyle}>
            <ArcSliderRenderer config={previewElement} />
          </div>
        )
      case 'asciislider':
        return (
          <div style={containerStyle}>
            <AsciiSliderRenderer config={previewElement} isPreview={true} />
          </div>
        )
      case 'asciiart':
        return (
          <div style={containerStyle}>
            <AsciiArtRenderer config={previewElement} />
          </div>
        )
      case 'asciibutton':
        return (
          <div style={containerStyle}>
            <AsciiButtonRenderer config={previewElement} />
          </div>
        )
      case 'button':
        return (
          <div style={containerStyle}>
            <ButtonRenderer config={previewElement} />
          </div>
        )
      case 'iconbutton':
        return (
          <div style={containerStyle}>
            <IconButtonRenderer config={previewElement} />
          </div>
        )
      case 'toggleswitch':
        return (
          <div style={containerStyle}>
            <ToggleSwitchRenderer config={previewElement} />
          </div>
        )
      case 'powerbutton':
        return (
          <div style={containerStyle}>
            <PowerButtonRenderer config={previewElement} />
          </div>
        )
      case 'rockerswitch':
        return (
          <div style={containerStyle}>
            <RockerSwitchRenderer config={previewElement} />
          </div>
        )
      case 'rotaryswitch':
        return (
          <div style={containerStyle}>
            <RotarySwitchRenderer config={previewElement} />
          </div>
        )
      case 'segmentbutton':
        return (
          <div style={containerStyle}>
            <SegmentButtonRenderer config={previewElement} />
          </div>
        )
      case 'label':
        return (
          <div style={containerStyle}>
            <LabelRenderer config={previewElement} />
          </div>
        )
      case 'numericdisplay':
        return (
          <div style={containerStyle}>
            <NumericDisplayRenderer config={previewElement} />
          </div>
        )
      case 'timedisplay':
        return (
          <div style={containerStyle}>
            <TimeDisplayRenderer config={previewElement} />
          </div>
        )
      case 'percentagedisplay':
        return (
          <div style={containerStyle}>
            <PercentageDisplayRenderer config={previewElement} />
          </div>
        )
      case 'ratiodisplay':
        return (
          <div style={containerStyle}>
            <RatioDisplayRenderer config={previewElement} />
          </div>
        )
      case 'notedisplay':
        return (
          <div style={containerStyle}>
            <NoteDisplayRenderer config={previewElement} />
          </div>
        )
      case 'bpmdisplay':
        return (
          <div style={containerStyle}>
            <BpmDisplayRenderer config={previewElement} />
          </div>
        )
      case 'editabledisplay':
        return (
          <div style={containerStyle}>
            <EditableDisplayRenderer config={previewElement} />
          </div>
        )
      case 'multivaluedisplay':
        return (
          <div style={containerStyle}>
            <MultiValueDisplayRenderer config={previewElement} />
          </div>
        )
      case 'meter':
        return (
          <div style={containerStyle}>
            <MeterRenderer config={previewElement} />
          </div>
        )
      case 'rmsmetermo':
        return (
          <div style={containerStyle}>
            <RMSMeterMonoRenderer config={previewElement} />
          </div>
        )
      case 'rmsmeterstereo':
        return (
          <div style={containerStyle}>
            <RMSMeterStereoRenderer config={previewElement} />
          </div>
        )
      case 'vumetermono':
        return (
          <div style={containerStyle}>
            <VUMeterMonoRenderer config={previewElement} />
          </div>
        )
      case 'vumeterstereo':
        return (
          <div style={containerStyle}>
            <VUMeterStereoRenderer config={previewElement} />
          </div>
        )
      case 'ppmtype1mono':
        return (
          <div style={containerStyle}>
            <PPMType1MonoRenderer config={previewElement} />
          </div>
        )
      case 'ppmtype1stereo':
        return (
          <div style={containerStyle}>
            <PPMType1StereoRenderer config={previewElement} />
          </div>
        )
      case 'ppmtype2mono':
        return (
          <div style={containerStyle}>
            <PPMType2MonoRenderer config={previewElement} />
          </div>
        )
      case 'ppmtype2stereo':
        return (
          <div style={containerStyle}>
            <PPMType2StereoRenderer config={previewElement} />
          </div>
        )
      case 'truepeakmetermono':
        return (
          <div style={containerStyle}>
            <TruePeakMeterMonoRenderer config={previewElement} />
          </div>
        )
      case 'truepeakmeterstereo':
        return (
          <div style={containerStyle}>
            <TruePeakMeterStereoRenderer config={previewElement} />
          </div>
        )
      case 'lufsmomomo':
        return (
          <div style={containerStyle}>
            <LUFSMomentaryMonoRenderer config={previewElement} />
          </div>
        )
      case 'lufsmomostereo':
        return (
          <div style={containerStyle}>
            <LUFSMomentaryStereoRenderer config={previewElement} />
          </div>
        )
      case 'lufsshortmono':
        return (
          <div style={containerStyle}>
            <LUFSShorttermMonoRenderer config={previewElement} />
          </div>
        )
      case 'lufsshortstereo':
        return (
          <div style={containerStyle}>
            <LUFSShorttermStereoRenderer config={previewElement} />
          </div>
        )
      case 'lufsintmono':
        return (
          <div style={containerStyle}>
            <LUFSIntegratedMonoRenderer config={previewElement} />
          </div>
        )
      case 'lufsintstereo':
        return (
          <div style={containerStyle}>
            <LUFSIntegratedStereoRenderer config={previewElement} />
          </div>
        )
      case 'k12metermono':
        return (
          <div style={containerStyle}>
            <K12MeterMonoRenderer config={previewElement} />
          </div>
        )
      case 'k12meterstereo':
        return (
          <div style={containerStyle}>
            <K12MeterStereoRenderer config={previewElement} />
          </div>
        )
      case 'k14metermono':
        return (
          <div style={containerStyle}>
            <K14MeterMonoRenderer config={previewElement} />
          </div>
        )
      case 'k14meterstereo':
        return (
          <div style={containerStyle}>
            <K14MeterStereoRenderer config={previewElement} />
          </div>
        )
      case 'k20metermono':
        return (
          <div style={containerStyle}>
            <K20MeterMonoRenderer config={previewElement} />
          </div>
        )
      case 'k20meterstereo':
        return (
          <div style={containerStyle}>
            <K20MeterStereoRenderer config={previewElement} />
          </div>
        )
      case 'correlationmeter':
        return (
          <div style={containerStyle}>
            <CorrelationMeterRenderer config={previewElement} />
          </div>
        )
      case 'stereowidthmeter':
        return (
          <div style={containerStyle}>
            <StereoWidthMeterRenderer config={previewElement} />
          </div>
        )
      case 'dbdisplay':
        return (
          <div style={containerStyle}>
            <DbDisplayRenderer config={previewElement} />
          </div>
        )
      case 'frequencydisplay':
        return (
          <div style={containerStyle}>
            <FrequencyDisplayRenderer config={previewElement} />
          </div>
        )
      case 'gainreductionmeter':
        return (
          <div style={containerStyle}>
            <GainReductionMeterRenderer config={previewElement} />
          </div>
        )
      case 'waveform':
        return (
          <div style={containerStyle}>
            <WaveformRenderer config={previewElement} />
          </div>
        )
      case 'oscilloscope':
        return (
          <div style={containerStyle}>
            <OscilloscopeRenderer config={previewElement} />
          </div>
        )
      case 'scrollingwaveform':
        return (
          <div style={containerStyle}>
            <ScrollingWaveformRenderer config={previewElement} />
          </div>
        )
      case 'spectrumanalyzer':
        return (
          <div style={containerStyle}>
            <SpectrumAnalyzerRenderer config={previewElement} />
          </div>
        )
      case 'spectrogram':
        return (
          <div style={containerStyle}>
            <SpectrogramRenderer config={previewElement} />
          </div>
        )
      case 'goniometer':
        return (
          <div style={containerStyle}>
            <GoniometerRenderer config={previewElement} />
          </div>
        )
      case 'vectorscope':
        return (
          <div style={containerStyle}>
            <VectorscopeRenderer config={previewElement} />
          </div>
        )
      case 'eqcurve':
        return (
          <div style={containerStyle}>
            <EQCurveRenderer config={previewElement} />
          </div>
        )
      case 'compressorcurve':
        return (
          <div style={containerStyle}>
            <CompressorCurveRenderer config={previewElement} />
          </div>
        )
      case 'envelopedisplay':
        return (
          <div style={containerStyle}>
            <EnvelopeDisplayRenderer config={previewElement} />
          </div>
        )
      case 'lfodisplay':
        return (
          <div style={containerStyle}>
            <LFODisplayRenderer config={previewElement} />
          </div>
        )
      case 'filterresponse':
        return (
          <div style={containerStyle}>
            <FilterResponseRenderer config={previewElement} />
          </div>
        )
      case 'dropdown':
        return (
          <div style={containerStyle}>
            <DropdownRenderer config={previewElement} />
          </div>
        )
      case 'checkbox':
        return (
          <div style={containerStyle}>
            <CheckboxRenderer config={previewElement} />
          </div>
        )
      case 'radiogroup':
        return (
          <div style={containerStyle}>
            <RadioGroupRenderer config={previewElement} />
          </div>
        )
      case 'textfield':
        return (
          <div style={containerStyle}>
            <TextFieldRenderer config={previewElement} />
          </div>
        )
      case 'stepper':
        return (
          <div style={containerStyle}>
            <StepperRenderer config={previewElement} />
          </div>
        )
      case 'breadcrumb':
        return (
          <div style={containerStyle}>
            <BreadcrumbRenderer config={previewElement} />
          </div>
        )
      case 'multiselectdropdown':
        return (
          <div style={containerStyle}>
            <MultiSelectDropdownRenderer config={previewElement} />
          </div>
        )
      case 'combobox':
        return (
          <div style={containerStyle}>
            <ComboBoxRenderer config={previewElement} />
          </div>
        )
      case 'menubutton':
        return (
          <div style={containerStyle}>
            <MenuButtonRenderer config={previewElement} />
          </div>
        )
      case 'tabbar':
        return (
          <div style={containerStyle}>
            <TabBarRenderer config={previewElement} />
          </div>
        )
      case 'tagselector':
        return (
          <div style={containerStyle}>
            <TagSelectorRenderer config={previewElement} />
          </div>
        )
      case 'treeview':
        return (
          <div style={containerStyle}>
            <TreeViewRenderer config={previewElement} />
          </div>
        )
      case 'image':
        return (
          <div style={containerStyle}>
            <div className="w-full h-full bg-gray-600 rounded flex items-center justify-center">
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                className="text-gray-400"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" />
                <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor" />
                <polyline points="21 15 16 10 5 21" strokeWidth="2" />
              </svg>
            </div>
          </div>
        )
      case 'svggraphic':
        return (
          <div style={containerStyle}>
            <SvgGraphicRenderer config={previewElement} />
          </div>
        )
      case 'rectangle':
        return (
          <div style={containerStyle}>
            <RectangleRenderer config={previewElement} />
          </div>
        )
      case 'line':
        return (
          <div style={containerStyle}>
            <LineRenderer config={previewElement} />
          </div>
        )
      case 'panel':
        return (
          <div style={containerStyle}>
            <PanelRenderer config={previewElement} />
          </div>
        )
      case 'frame':
        return (
          <div style={containerStyle}>
            <FrameRenderer config={previewElement} />
          </div>
        )
      case 'groupbox':
        return (
          <div style={containerStyle}>
            <GroupBoxRenderer config={previewElement} />
          </div>
        )
      case 'collapsible':
        return (
          <div style={containerStyle}>
            <CollapsibleRenderer config={previewElement} />
          </div>
        )
      case 'modulationmatrix':
        return (
          <div style={containerStyle}>
            <ModulationMatrixRenderer config={previewElement} />
          </div>
        )
      case 'presetbrowser':
        return (
          <div style={containerStyle}>
            <PresetBrowserRenderer config={previewElement} />
          </div>
        )
      case 'tooltip':
        return (
          <div style={containerStyle}>
            <TooltipRenderer config={previewElement} />
          </div>
        )
      case 'horizontalspacer':
        return (
          <div style={containerStyle}>
            <HorizontalSpacerRenderer config={previewElement} />
          </div>
        )
      case 'verticalspacer':
        return (
          <div style={containerStyle}>
            <VerticalSpacerRenderer config={previewElement} />
          </div>
        )
      case 'windowchrome':
        return (
          <div style={containerStyle}>
            <WindowChromeRenderer config={previewElement} />
          </div>
        )
      case 'pianokeyboard':
        return (
          <div style={containerStyle}>
            <PianoKeyboardRenderer config={previewElement} />
          </div>
        )
      case 'drumpad':
        return (
          <div style={containerStyle}>
            <DrumPadRenderer config={previewElement} />
          </div>
        )
      case 'padgrid':
        return (
          <div style={containerStyle}>
            <PadGridRenderer config={previewElement} />
          </div>
        )
      case 'stepsequencer':
        return (
          <div style={containerStyle}>
            <StepSequencerRenderer config={previewElement} />
          </div>
        )
      case 'xypad':
        return (
          <div style={containerStyle}>
            <XYPadRenderer config={previewElement} />
          </div>
        )
      case 'wavetabledisplay':
        return (
          <div style={containerStyle}>
            <WavetableDisplayRenderer config={previewElement} />
          </div>
        )
      case 'harmoniceditor':
        return (
          <div style={containerStyle}>
            <HarmonicEditorRenderer config={previewElement} />
          </div>
        )
      case 'looppoints':
        return (
          <div style={containerStyle}>
            <LoopPointsRenderer config={previewElement} />
          </div>
        )
      case 'envelopeeditor':
        return (
          <div style={containerStyle}>
            <EnvelopeEditorRenderer config={previewElement} />
          </div>
        )
      case 'sampledisplay':
        return (
          <div style={containerStyle}>
            <SampleDisplayRenderer config={previewElement} />
          </div>
        )
      case 'patchbay':
        return (
          <div style={containerStyle}>
            <PatchBayRenderer config={previewElement} />
          </div>
        )
      case 'signalflow':
        return (
          <div style={containerStyle}>
            <SignalFlowRenderer config={previewElement} />
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className={`
        flex flex-col items-center gap-1 p-2
        border border-gray-700 rounded
        ${editingContainerId ? 'cursor-pointer' : 'cursor-grab active:cursor-grabbing'}
        hover:bg-gray-700 hover:border-gray-600
        transition-colors
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <div className="flex items-center justify-center min-h-16">
        {renderPreview()}
      </div>
      <span className="text-xs text-gray-300 text-center">{name}</span>
    </div>
  )
}
