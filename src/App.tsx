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
import { useState } from 'react'
import { ThreePanelLayout } from './components/Layout'
import { CanvasStage } from './components/Canvas'
import { useStore } from './store'
import { snapValue } from './store/canvasSlice'
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
  createDbDisplay,
  createFrequencyDisplay,
  createGainReductionMeter,
  createPanel,
  createFrame,
  createGroupBox,
  createCollapsible,
  createTextField,
  createWaveform,
  createOscilloscope,
  createPresetBrowser,
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

  // Track active drag data for preview overlay
  const [activeDragData, setActiveDragData] = useState<{
    elementType: string
    variant?: Record<string, unknown>
  } | null>(null)

  // Handle drag start - capture drag data for preview overlay
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    const sourceType = active.data.current?.sourceType

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

    // Palette drop - create new element at drop position
    // Only handle drops over canvas
    if (!over || over.id !== 'canvas-droppable') {
      return
    }

    // Get element type and variant from draggable data
    const { elementType, variant } = active.data.current || {}
    if (!elementType) return

    // Get the canvas viewport element to calculate offset
    const canvasViewport = document.querySelector('.canvas-viewport')
    if (!canvasViewport) return
    const viewportRect = canvasViewport.getBoundingClientRect()

    // Get drop position from the pointer event
    // Use delta to calculate final position from initial pointer position
    const pointerEvent = event.activatorEvent as PointerEvent
    const finalX = pointerEvent.clientX + (event.delta?.x || 0)
    const finalY = pointerEvent.clientY + (event.delta?.y || 0)

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
      default:
        return
    }

    // Center element on drop position (not top-left corner)
    if (newElement) {
      newElement.x = canvasX - newElement.width / 2
      newElement.y = canvasY - newElement.height / 2
    }

    addElement(newElement)

    // Clear drag state
    setActiveDragData(null)
  }

  // Demo elements removed - users add elements via palette drag-drop

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragEnd={handleDragEnd}
    >
      <ThreePanelLayout>
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
  )
}

export default App
