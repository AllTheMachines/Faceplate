import { useDraggable } from '@dnd-kit/core'
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
  ElementConfig,
} from '../../types/elements'
import { KnobRenderer } from '../elements/renderers/KnobRenderer'
import { SliderRenderer } from '../elements/renderers/SliderRenderer'
import { ButtonRenderer } from '../elements/renderers/ButtonRenderer'
import { LabelRenderer } from '../elements/renderers/LabelRenderer'
import { MeterRenderer } from '../elements/renderers/MeterRenderer'
import { ModulationMatrixRenderer } from '../elements/renderers/ModulationMatrixRenderer'
import { RectangleRenderer } from '../elements/renderers/RectangleRenderer'
import { LineRenderer } from '../elements/renderers/LineRenderer'
import { DbDisplayRenderer } from '../elements/renderers/DbDisplayRenderer'
import { FrequencyDisplayRenderer } from '../elements/renderers/FrequencyDisplayRenderer'
import { GainReductionMeterRenderer } from '../elements/renderers/GainReductionMeterRenderer'
import { PanelRenderer } from '../elements/renderers/PanelRenderer'
import { FrameRenderer } from '../elements/renderers/FrameRenderer'
import { GroupBoxRenderer } from '../elements/renderers/GroupBoxRenderer'
import { CollapsibleRenderer } from '../elements/renderers/CollapsibleRenderer'

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
          ...variant, // variant contains { style: 'arc' } for arc knobs
        })
      case 'slider':
        return createSlider({
          ...baseOverrides,
          width: variant?.orientation === 'horizontal' ? 60 : 20,
          height: variant?.orientation === 'horizontal' ? 20 : 60,
          thumbWidth: 12,
          thumbHeight: 12,
          ...variant, // variant contains { orientation: 'vertical' | 'horizontal' }
        })
      case 'button':
        return createButton({
          ...baseOverrides,
          width: 60,
          height: 30,
          label: variant?.mode === 'toggle' ? 'TGL' : 'BTN',
          ...variant, // variant contains { mode: 'momentary' | 'toggle' }
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
      case 'meter':
        return createMeter({
          ...baseOverrides,
          width: 16,
          height: 60,
          ...variant, // variant contains { orientation: 'vertical' }
        })
      case 'image':
        return createImage({
          ...baseOverrides,
          width: 50,
          height: 50,
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
      case 'modulationmatrix':
        return (
          <div style={containerStyle}>
            <ModulationMatrixRenderer config={previewElement} />
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
