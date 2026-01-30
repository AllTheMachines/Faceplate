import {
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { useState, useRef, useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import { ThreePanelLayout } from './components/Layout'
import { CanvasStage } from './components/Canvas'
import { HistoryPanel } from './components/History'
import { ContainerEditorLayout } from './components/ContainerEditor'
import { useHistoryPanel } from './hooks/useHistoryPanel'
import { useBeforeUnload } from './hooks/useBeforeUnload'
import { useHelpShortcut } from './hooks/useHelpShortcut'
import { useStore } from './store'
import { snapValue } from './store/canvasSlice'
import { getSVGNaturalSize } from './services/svg'
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
  createKickButton,
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
} from './types/elements'

function DragPreview({
  elementType,
  variant: _variant
}: {
  elementType: string
  variant?: Record<string, unknown>
}) {
  return (
    <div
      className="bg-gray-700 border border-blue-500 rounded px-3 py-2 shadow-lg"
      style={{
        opacity: 0.9,
        pointerEvents: 'none',
      }}
    >
      <span className="text-sm text-white capitalize">{elementType}</span>
    </div>
  )
}

function App() {
  // History panel visibility controlled by Ctrl+Shift+H
  const { isPanelVisible } = useHistoryPanel()

  // Dirty state tracking for unsaved changes warning
  // Subscribe to state that isDirty depends on, then compute
  const savedStateSnapshot = useStore((state) => state.savedStateSnapshot)
  const elements = useStore((state) => state.elements)
  const windows = useStore((state) => state.windows)
  const snapToGridState = useStore((state) => state.snapToGrid)
  const gridSizeState = useStore((state) => state.gridSize)
  const assets = useStore((state) => state.assets)
  const knobStyles = useStore((state) => state.knobStyles)

  // Compute isDirty from subscribed state
  const isDirty = (() => {
    if (savedStateSnapshot === null) {
      return elements.length > 0
    }
    const currentSnapshot = JSON.stringify({
      elements,
      windows,
      snapToGrid: snapToGridState,
      gridSize: gridSizeState,
      assets,
      knobStyles,
    })
    return currentSnapshot !== savedStateSnapshot
  })()

  // Install beforeunload warning when project has unsaved changes
  useBeforeUnload(isDirty)

  // Update document title with asterisk when dirty
  useEffect(() => {
    const baseTitle = 'Faceplate - VST3 UI Designer'
    document.title = isDirty ? `* ${baseTitle}` : baseTitle
  }, [isDirty])

  // F1 help shortcut - opens contextual or general help
  useHelpShortcut()

  // Configure sensors with activation constraint to prevent accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px drag threshold prevents accidental drags
      },
    })
  )

  // Get store state for drag-drop handling
  const scale = useStore((state) => state.scale)
  const offsetX = useStore((state) => state.offsetX)
  const offsetY = useStore((state) => state.offsetY)
  const addElement = useStore((state) => state.addElement)
  const updateElement = useStore((state) => state.updateElement)
  const snapToGrid = useStore((state) => state.snapToGrid)
  const gridSize = useStore((state) => state.gridSize)
  const setLiveDragValues = useStore((state) => state.setLiveDragValues)
  const getElement = useStore((state) => state.getElement)
  const getAsset = useStore((state) => state.getAsset)
  const addElementToWindow = useStore((state) => state.addElementToWindow)
  const selectedLayerId = useStore((state) => state.selectedLayerId)

  // Track active drag data for preview overlay
  const [activeDragData, setActiveDragData] = useState<{
    elementType: string
    variant?: Record<string, unknown>
  } | null>(null)

  // Track last pointer position for accurate drop placement using refs for real-time updates
  const lastPointerPositionRef = useRef<{ x: number; y: number } | null>(null)

  // Global mousemove listener to track actual pointer position during drag
  useEffect(() => {
    if (!activeDragData) {
      lastPointerPositionRef.current = null
      return
    }

    const handleMouseMove = (e: MouseEvent) => {
      lastPointerPositionRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [activeDragData])

  // Handle drag start - capture drag data for preview overlay
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const sourceType = active.data.current?.sourceType
    const dragType = active.data.current?.type

    // Handle library-asset drag
    if (dragType === 'library-asset') {
      const assetId = active.data.current?.assetId
      const asset = getAsset(assetId)
      if (asset) {
        setActiveDragData({ elementType: 'image', variant: { name: asset.name } })
      }
      return
    }

    // Only show overlay for palette drags, not element moves
    if (sourceType !== 'element') {
      const { elementType, variant } = active.data.current || {}
      if (elementType) {
        setActiveDragData({ elementType, variant })
      }
    }
  }

  // Handle drag move - broadcast live position values for all selected elements
  const handleDragMove = (event: DragMoveEvent) => {
    const { active, delta } = event

    // Only track element drags, not palette drags
    const sourceType = active.data.current?.sourceType
    if (sourceType === 'element') {
      // Convert screen delta to canvas delta (divide by scale)
      const canvasDeltaX = delta.x / scale
      const canvasDeltaY = delta.y / scale

      // IMPORTANT: Read selectedIds from store directly to avoid stale closure values
      const currentSelectedIds = useStore.getState().selectedIds

      // Calculate live positions for ALL selected elements
      const liveValues: Record<string, { x: number; y: number; width: number; height: number }> = {}
      currentSelectedIds.forEach((id) => {
        const el = getElement(id)
        if (el && !el.locked) {
          liveValues[id] = {
            x: el.x + canvasDeltaX,
            y: el.y + canvasDeltaY,
            width: el.width,
            height: el.height,
          }
        }
      })

      // Broadcast live values for property panel
      setLiveDragValues(liveValues)
    }
  }

  // Handle drag end - create element at drop position or move existing element
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event

    // Check if this is an element move (dragging existing element)
    const sourceType = active.data.current?.sourceType
    if (sourceType === 'element') {
      // Convert screen delta to canvas delta (divide by scale)
      const canvasDeltaX = delta.x / scale
      const canvasDeltaY = delta.y / scale

      // IMPORTANT: Read selectedIds from store directly to avoid stale closure values
      const currentSelectedIds = useStore.getState().selectedIds

      // Move ALL selected elements together (not just the one being dragged)
      currentSelectedIds.forEach((id) => {
        const el = getElement(id)
        if (!el || el.locked) return

        // Calculate new position
        const newX = el.x + canvasDeltaX
        const newY = el.y + canvasDeltaY

        // Apply snap-to-grid if enabled
        const finalX = snapToGrid ? snapValue(newX, gridSize) : newX
        const finalY = snapToGrid ? snapValue(newY, gridSize) : newY

        // Update element position
        updateElement(id, { x: finalX, y: finalY })
      })

      // Clear live values after drag completes
      setLiveDragValues(null)
      return
    }

    // Check for library-asset drag
    const dragType = active.data.current?.type
    if (dragType === 'library-asset') {
      // Only handle drops over canvas
      if (!over || over.id !== 'canvas-droppable') {
        setActiveDragData(null)
        return
      }

      const assetId = active.data.current?.assetId
      if (!assetId) return

      const asset = getAsset(assetId)
      if (!asset) return

      // Get the canvas viewport element to calculate offset
      const canvasViewport = document.querySelector('.canvas-viewport')
      if (!canvasViewport) return
      const viewportRect = canvasViewport.getBoundingClientRect()

      // Get drop position from tracked mouse position
      let finalX: number, finalY: number
      const trackedPosition = lastPointerPositionRef.current
      if (trackedPosition) {
        finalX = trackedPosition.x
        finalY = trackedPosition.y
      } else {
        const pointerEvent = event.activatorEvent as PointerEvent
        finalX = pointerEvent.clientX + (event.delta?.x || 0)
        finalY = pointerEvent.clientY + (event.delta?.y || 0)
      }

      // Transform screen coordinates to canvas coordinates
      const canvasX = (finalX - viewportRect.left - offsetX) / scale
      const canvasY = (finalY - viewportRect.top - offsetY) / scale

      // Create SvgGraphic element with asset reference and natural size
      const naturalSize = getSVGNaturalSize(asset.svgContent) || { width: 100, height: 100 }
      const newElement = createSvgGraphic({
        x: canvasX,
        y: canvasY,
        assetId: assetId,
        name: asset.name,
        width: naturalSize.width,
        height: naturalSize.height,
      })

      // Center element on drop position
      newElement.x = canvasX - newElement.width / 2
      newElement.y = canvasY - newElement.height / 2

      // Assign to selected layer (or default)
      newElement.layerId = selectedLayerId || 'default'

      addElement(newElement)
      addElementToWindow(newElement.id)
      setActiveDragData(null)
      return
    }

    // Palette drop - create new element at drop position
    // Only handle drops over canvas
    if (!over || over.id !== 'canvas-droppable') {
      setActiveDragData(null)
      return
    }

    // Get element type and variant from draggable data
    const { elementType, variant } = active.data.current || {}
    if (!elementType) return

    // Get the canvas viewport element to calculate offset
    const canvasViewport = document.querySelector('.canvas-viewport')
    if (!canvasViewport) return
    const viewportRect = canvasViewport.getBoundingClientRect()

    // Get drop position from tracked mouse position (more accurate than activatorEvent + delta)
    // The tracked position is the actual pointer location during drag
    let finalX: number
    let finalY: number

    const trackedPosition = lastPointerPositionRef.current
    if (trackedPosition) {
      finalX = trackedPosition.x
      finalY = trackedPosition.y
    } else {
      // Fallback to old method if no tracked position (shouldn't happen in normal use)
      const pointerEvent = event.activatorEvent as PointerEvent
      finalX = pointerEvent.clientX + (event.delta?.x || 0)
      finalY = pointerEvent.clientY + (event.delta?.y || 0)
    }

    // Transform screen coordinates to canvas coordinates:
    // 1. Subtract viewport offset to get relative position in viewport
    // 2. Subtract offsetX/Y to account for pan
    // 3. Divide by scale to account for zoom
    const canvasX = (finalX - viewportRect.left - offsetX) / scale
    const canvasY = (finalY - viewportRect.top - offsetY) / scale

    // Create element using factory function based on type
    let newElement
    switch (elementType) {
      case 'knob':
        newElement = createKnob({ x: canvasX, y: canvasY, ...variant })
        break
      case 'slider':
        newElement = createSlider({ x: canvasX, y: canvasY, ...variant })
        break
      case 'button':
        newElement = createButton({ x: canvasX, y: canvasY, ...variant })
        break
      case 'label':
        newElement = createLabel({ x: canvasX, y: canvasY, ...variant })
        break
      case 'meter':
        newElement = createMeter({ x: canvasX, y: canvasY, ...variant })
        break
      case 'image':
        newElement = createImage({ x: canvasX, y: canvasY, ...variant })
        break
      case 'dropdown':
        newElement = createDropdown({ x: canvasX, y: canvasY, ...variant })
        break
      case 'checkbox':
        newElement = createCheckbox({ x: canvasX, y: canvasY, ...variant })
        break
      case 'radiogroup':
        newElement = createRadioGroup({ x: canvasX, y: canvasY, ...variant })
        break
      case 'rangeslider':
        newElement = createRangeSlider({ x: canvasX, y: canvasY, ...variant })
        break
      case 'modulationmatrix':
        newElement = createModulationMatrix({ x: canvasX, y: canvasY, ...variant })
        break
      case 'rectangle':
        newElement = createRectangle({ x: canvasX, y: canvasY, ...variant })
        break
      case 'line':
        newElement = createLine({ x: canvasX, y: canvasY, ...variant })
        break
      case 'asciiart':
        newElement = createAsciiArt({ x: canvasX, y: canvasY, ...variant })
        break
      case 'dbdisplay':
        newElement = createDbDisplay({ x: canvasX, y: canvasY, ...variant })
        break
      case 'frequencydisplay':
        newElement = createFrequencyDisplay({ x: canvasX, y: canvasY, ...variant })
        break
      case 'gainreductionmeter':
        newElement = createGainReductionMeter({ x: canvasX, y: canvasY, ...variant })
        break
      case 'panel':
        newElement = createPanel({ x: canvasX, y: canvasY, ...variant })
        break
      case 'frame':
        newElement = createFrame({ x: canvasX, y: canvasY, ...variant })
        break
      case 'groupbox':
        newElement = createGroupBox({ x: canvasX, y: canvasY, ...variant })
        break
      case 'collapsible':
        newElement = createCollapsible({ x: canvasX, y: canvasY, ...variant })
        break
      case 'tooltip':
        newElement = createTooltip({ x: canvasX, y: canvasY, ...variant })
        break
      case 'windowchrome':
        newElement = createWindowChrome({ x: canvasX, y: canvasY, ...variant })
        break
      case 'horizontalspacer':
        newElement = createHorizontalSpacer({ x: canvasX, y: canvasY, ...variant })
        break
      case 'verticalspacer':
        newElement = createVerticalSpacer({ x: canvasX, y: canvasY, ...variant })
        break
      case 'textfield':
        newElement = createTextField({ x: canvasX, y: canvasY, ...variant })
        break
      case 'waveform':
        newElement = createWaveform({ x: canvasX, y: canvasY, ...variant })
        break
      case 'oscilloscope':
        newElement = createOscilloscope({ x: canvasX, y: canvasY, ...variant })
        break
      case 'presetbrowser':
        newElement = createPresetBrowser({ x: canvasX, y: canvasY, ...variant })
        break
      case 'svggraphic':
        newElement = createSvgGraphic({ x: canvasX, y: canvasY, ...variant })
        break
      case 'eqcurve':
        newElement = createEQCurve({ x: canvasX, y: canvasY, ...variant })
        break
      case 'compressorcurve':
        newElement = createCompressorCurve({ x: canvasX, y: canvasY, ...variant })
        break
      case 'envelopedisplay':
        newElement = createEnvelopeDisplay({ x: canvasX, y: canvasY, ...variant })
        break
      case 'lfodisplay':
        newElement = createLFODisplay({ x: canvasX, y: canvasY, ...variant })
        break
      case 'filterresponse':
        newElement = createFilterResponse({ x: canvasX, y: canvasY, ...variant })
        break
      // Additional rotary controls
      case 'steppedknob':
        newElement = createSteppedKnob({ x: canvasX, y: canvasY, ...variant })
        break
      case 'centerdetentknob':
        newElement = createCenterDetentKnob({ x: canvasX, y: canvasY, ...variant })
        break
      case 'dotindicatorknob':
        newElement = createDotIndicatorKnob({ x: canvasX, y: canvasY, ...variant })
        break
      // Additional linear controls
      case 'multislider':
        newElement = createMultiSlider({ x: canvasX, y: canvasY, ...variant })
        break
      case 'bipolarslider':
        newElement = createBipolarSlider({ x: canvasX, y: canvasY, ...variant })
        break
      case 'crossfadeslider':
        newElement = createCrossfadeSlider({ x: canvasX, y: canvasY, ...variant })
        break
      case 'notchedslider':
        newElement = createNotchedSlider({ x: canvasX, y: canvasY, ...variant })
        break
      case 'arcslider':
        newElement = createArcSlider({ x: canvasX, y: canvasY, ...variant })
        break
      case 'asciislider':
        newElement = createAsciiSlider({ x: canvasX, y: canvasY, ...variant })
        break
      case 'asciibutton':
        newElement = createAsciiButton({ x: canvasX, y: canvasY, ...variant })
        break
      // Additional buttons
      case 'iconbutton':
        newElement = createIconButton({ x: canvasX, y: canvasY, ...variant })
        break
      case 'kickbutton':
        newElement = createKickButton({ x: canvasX, y: canvasY, ...variant })
        break
      case 'toggleswitch':
        newElement = createToggleSwitch({ x: canvasX, y: canvasY, ...variant })
        break
      case 'powerbutton':
        newElement = createPowerButton({ x: canvasX, y: canvasY, ...variant })
        break
      case 'rockerswitch':
        newElement = createRockerSwitch({ x: canvasX, y: canvasY, ...variant })
        break
      case 'rotaryswitch':
        newElement = createRotarySwitch({ x: canvasX, y: canvasY, ...variant })
        break
      case 'segmentbutton':
        newElement = createSegmentButton({ x: canvasX, y: canvasY, ...variant })
        break
      // Navigation controls
      case 'stepper':
        newElement = createStepper({ x: canvasX, y: canvasY, ...variant })
        break
      case 'breadcrumb':
        newElement = createBreadcrumb({ x: canvasX, y: canvasY, ...variant })
        break
      case 'multiselectdropdown':
        newElement = createMultiSelectDropdown({ x: canvasX, y: canvasY, ...variant })
        break
      case 'combobox':
        newElement = createComboBox({ x: canvasX, y: canvasY, ...variant })
        break
      case 'menubutton':
        newElement = createMenuButton({ x: canvasX, y: canvasY, ...variant })
        break
      case 'tabbar':
        newElement = createTabBar({ x: canvasX, y: canvasY, ...variant })
        break
      case 'tagselector':
        newElement = createTagSelector({ x: canvasX, y: canvasY, ...variant })
        break
      case 'treeview':
        newElement = createTreeView({ x: canvasX, y: canvasY, ...variant })
        break
      // Value displays
      case 'numericdisplay':
        newElement = createNumericDisplay({ x: canvasX, y: canvasY, ...variant })
        break
      case 'timedisplay':
        newElement = createTimeDisplay({ x: canvasX, y: canvasY, ...variant })
        break
      case 'percentagedisplay':
        newElement = createPercentageDisplay({ x: canvasX, y: canvasY, ...variant })
        break
      case 'ratiodisplay':
        newElement = createRatioDisplay({ x: canvasX, y: canvasY, ...variant })
        break
      case 'notedisplay':
        newElement = createNoteDisplay({ x: canvasX, y: canvasY, ...variant })
        break
      case 'bpmdisplay':
        newElement = createBpmDisplay({ x: canvasX, y: canvasY, ...variant })
        break
      case 'editabledisplay':
        newElement = createEditableDisplay({ x: canvasX, y: canvasY, ...variant })
        break
      case 'multivaluedisplay':
        newElement = createMultiValueDisplay({ x: canvasX, y: canvasY, ...variant })
        break
      // LEDs
      case 'singleled':
        newElement = createSingleLED({ x: canvasX, y: canvasY, ...variant })
        break
      case 'bicolorled':
        newElement = createBiColorLED({ x: canvasX, y: canvasY, ...variant })
        break
      case 'tricolorled':
        newElement = createTriColorLED({ x: canvasX, y: canvasY, ...variant })
        break
      case 'ledarray':
        newElement = createLEDArray({ x: canvasX, y: canvasY, ...variant })
        break
      case 'ledring':
        newElement = createLEDRing({ x: canvasX, y: canvasY, ...variant })
        break
      case 'ledmatrix':
        newElement = createLEDMatrix({ x: canvasX, y: canvasY, ...variant })
        break
      // Professional meters - RMS
      case 'rmsmetermo':
        newElement = createRMSMeterMono({ x: canvasX, y: canvasY, ...variant })
        break
      case 'rmsmeterstereo':
        newElement = createRMSMeterStereo({ x: canvasX, y: canvasY, ...variant })
        break
      // Professional meters - VU
      case 'vumetermono':
        newElement = createVUMeterMono({ x: canvasX, y: canvasY, ...variant })
        break
      case 'vumeterstereo':
        newElement = createVUMeterStereo({ x: canvasX, y: canvasY, ...variant })
        break
      // Professional meters - PPM
      case 'ppmtype1mono':
        newElement = createPPMType1Mono({ x: canvasX, y: canvasY, ...variant })
        break
      case 'ppmtype1stereo':
        newElement = createPPMType1Stereo({ x: canvasX, y: canvasY, ...variant })
        break
      case 'ppmtype2mono':
        newElement = createPPMType2Mono({ x: canvasX, y: canvasY, ...variant })
        break
      case 'ppmtype2stereo':
        newElement = createPPMType2Stereo({ x: canvasX, y: canvasY, ...variant })
        break
      // Professional meters - True Peak
      case 'truepeakmetermono':
        newElement = createTruePeakMeterMono({ x: canvasX, y: canvasY, ...variant })
        break
      case 'truepeakmeterstereo':
        newElement = createTruePeakMeterStereo({ x: canvasX, y: canvasY, ...variant })
        break
      // Professional meters - LUFS
      case 'lufsmomomo':
        newElement = createLUFSMomentaryMono({ x: canvasX, y: canvasY, ...variant })
        break
      case 'lufsmomostereo':
        newElement = createLUFSMomentaryStereo({ x: canvasX, y: canvasY, ...variant })
        break
      case 'lufsshortmono':
        newElement = createLUFSShorttermMono({ x: canvasX, y: canvasY, ...variant })
        break
      case 'lufsshortstereo':
        newElement = createLUFSShorttermStereo({ x: canvasX, y: canvasY, ...variant })
        break
      case 'lufsintmono':
        newElement = createLUFSIntegratedMono({ x: canvasX, y: canvasY, ...variant })
        break
      case 'lufsintstereo':
        newElement = createLUFSIntegratedStereo({ x: canvasX, y: canvasY, ...variant })
        break
      // Professional meters - K-System
      case 'k12metermono':
        newElement = createK12MeterMono({ x: canvasX, y: canvasY, ...variant })
        break
      case 'k12meterstereo':
        newElement = createK12MeterStereo({ x: canvasX, y: canvasY, ...variant })
        break
      case 'k14metermono':
        newElement = createK14MeterMono({ x: canvasX, y: canvasY, ...variant })
        break
      case 'k14meterstereo':
        newElement = createK14MeterStereo({ x: canvasX, y: canvasY, ...variant })
        break
      case 'k20metermono':
        newElement = createK20MeterMono({ x: canvasX, y: canvasY, ...variant })
        break
      case 'k20meterstereo':
        newElement = createK20MeterStereo({ x: canvasX, y: canvasY, ...variant })
        break
      // Professional meters - Analysis
      case 'correlationmeter':
        newElement = createCorrelationMeter({ x: canvasX, y: canvasY, ...variant })
        break
      case 'stereowidthmeter':
        newElement = createStereoWidthMeter({ x: canvasX, y: canvasY, ...variant })
        break
      // Visualizations
      case 'scrollingwaveform':
        newElement = createScrollingWaveform({ x: canvasX, y: canvasY, ...variant })
        break
      case 'spectrumanalyzer':
        newElement = createSpectrumAnalyzer({ x: canvasX, y: canvasY, ...variant })
        break
      case 'spectrogram':
        newElement = createSpectrogram({ x: canvasX, y: canvasY, ...variant })
        break
      case 'goniometer':
        newElement = createGoniometer({ x: canvasX, y: canvasY, ...variant })
        break
      case 'vectorscope':
        newElement = createVectorscope({ x: canvasX, y: canvasY, ...variant })
        break
      // Specialized Audio
      case 'pianokeyboard':
        newElement = createPianoKeyboard({ x: canvasX, y: canvasY, ...variant })
        break
      case 'drumpad':
        newElement = createDrumPad({ x: canvasX, y: canvasY, ...variant })
        break
      case 'padgrid':
        newElement = createPadGrid({ x: canvasX, y: canvasY, ...variant })
        break
      case 'stepsequencer':
        newElement = createStepSequencer({ x: canvasX, y: canvasY, ...variant })
        break
      case 'xypad':
        newElement = createXYPad({ x: canvasX, y: canvasY, ...variant })
        break
      case 'wavetabledisplay':
        newElement = createWavetableDisplay({ x: canvasX, y: canvasY, ...variant })
        break
      case 'harmoniceditor':
        newElement = createHarmonicEditor({ x: canvasX, y: canvasY, ...variant })
        break
      case 'looppoints':
        newElement = createLoopPoints({ x: canvasX, y: canvasY, ...variant })
        break
      case 'envelopeeditor':
        newElement = createEnvelopeEditor({ x: canvasX, y: canvasY, ...variant })
        break
      case 'sampledisplay':
        newElement = createSampleDisplay({ x: canvasX, y: canvasY, ...variant })
        break
      case 'patchbay':
        newElement = createPatchBay({ x: canvasX, y: canvasY, ...variant })
        break
      case 'signalflow':
        newElement = createSignalFlow({ x: canvasX, y: canvasY, ...variant })
        break
      default:
        return
    }

    // Center element on drop position (not top-left corner)
    if (newElement) {
      newElement.x = canvasX - newElement.width / 2
      newElement.y = canvasY - newElement.height / 2
      // Assign to selected layer (or default)
      newElement.layerId = selectedLayerId || 'default'
    }

    addElement(newElement)
    addElementToWindow(newElement.id)

    // Clear drag state
    setActiveDragData(null)
  }

  // Demo elements removed - users add elements via palette drag-drop

  return (
    <>
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
      >
        <ThreePanelLayout
          bottomPanel={<HistoryPanel />}
          showBottomPanel={isPanelVisible}
        >
          <CanvasStage />
        </ThreePanelLayout>
        <DragOverlay dropAnimation={null}>
          {activeDragData && (
            <DragPreview
              elementType={activeDragData.elementType}
              variant={activeDragData.variant}
            />
          )}
        </DragOverlay>
      </DndContext>

      <Toaster
        position="top-right"
        toastOptions={{
          // Default styling to match dark theme
          style: {
            background: '#1f2937', // gray-800
            color: '#f3f4f6', // gray-100
          },
          // Error toasts are red
          error: {
            style: {
              background: '#7f1d1d', // red-900
              color: '#fecaca', // red-200
            },
          },
          // Success toasts are green
          success: {
            style: {
              background: '#14532d', // green-900
              color: '#bbf7d0', // green-200
            },
          },
        }}
      />

      {/* Container Editor Layout - full-screen editor when editing container contents */}
      <ContainerEditorLayout />
    </>
  )
}

export default App
