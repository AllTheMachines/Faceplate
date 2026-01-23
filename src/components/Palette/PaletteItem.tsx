import { useDraggable } from '@dnd-kit/core'
import {
  createKnob,
  createSlider,
  createButton,
  createLabel,
  createMeter,
  createImage,
  ElementConfig,
} from '../../types/elements'
import { KnobRenderer } from '../elements/renderers/KnobRenderer'
import { SliderRenderer } from '../elements/renderers/SliderRenderer'
import { ButtonRenderer } from '../elements/renderers/ButtonRenderer'
import { LabelRenderer } from '../elements/renderers/LabelRenderer'
import { MeterRenderer } from '../elements/renderers/MeterRenderer'

interface PaletteItemProps {
  id: string
  elementType: string
  name: string
  variant?: Record<string, unknown>
}

export function PaletteItem({ id, elementType, name, variant }: PaletteItemProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `palette-${id}`,
    data: { elementType, variant },
  })

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
      case 'knob-arc':
        return createKnob({
          ...baseOverrides,
          diameter: 40,
          width: 40,
          height: 40,
          style: 'arc',
          ...variant,
        })
      case 'slider-vertical':
        return createSlider({
          ...baseOverrides,
          width: 20,
          height: 60,
          orientation: 'vertical',
          thumbWidth: 12,
          thumbHeight: 12,
          ...variant,
        })
      case 'slider-horizontal':
        return createSlider({
          ...baseOverrides,
          width: 60,
          height: 20,
          orientation: 'horizontal',
          thumbWidth: 12,
          thumbHeight: 12,
          ...variant,
        })
      case 'button-momentary':
        return createButton({
          ...baseOverrides,
          width: 60,
          height: 30,
          mode: 'momentary',
          label: 'BTN',
          ...variant,
        })
      case 'button-toggle':
        return createButton({
          ...baseOverrides,
          width: 60,
          height: 30,
          mode: 'toggle',
          label: 'TGL',
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
      case 'meter-vertical':
        return createMeter({
          ...baseOverrides,
          width: 16,
          height: 60,
          orientation: 'vertical',
          ...variant,
        })
      case 'image':
        return createImage({
          ...baseOverrides,
          width: 50,
          height: 50,
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

    // Container for preview at 50% scale
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
      case 'slider':
        return (
          <div style={containerStyle}>
            <SliderRenderer config={previewElement} />
          </div>
        )
      case 'button':
        return (
          <div style={containerStyle}>
            <ButtonRenderer config={previewElement} />
          </div>
        )
      case 'label':
        return (
          <div style={containerStyle}>
            <LabelRenderer config={previewElement} />
          </div>
        )
      case 'meter':
        return (
          <div style={containerStyle}>
            <MeterRenderer config={previewElement} />
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
      default:
        return null
    }
  }

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        flex flex-col items-center gap-1 p-2
        border border-gray-700 rounded
        cursor-grab active:cursor-grabbing
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
