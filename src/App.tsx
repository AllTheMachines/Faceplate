import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { ThreePanelLayout } from './components/Layout'
import { CanvasStage } from './components/Canvas'
import { useStore } from './store'
import {
  createKnob,
  createSlider,
  createButton,
  createLabel,
  createMeter,
  createImage,
} from './types/elements'

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

  // Handle drag end - create element at drop position
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

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
      default:
        return
    }

    addElement(newElement)
  }

  // Demo elements removed - users add elements via palette drag-drop

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <ThreePanelLayout>
        <CanvasStage />
      </ThreePanelLayout>
    </DndContext>
  )
}

export default App
