import React from 'react'
import { ElementConfig } from '../../types/elements'
import { BaseElement } from './BaseElement'
import { KnobRenderer } from './renderers/KnobRenderer'
import { SliderRenderer } from './renderers/SliderRenderer'
import { ButtonRenderer } from './renderers/ButtonRenderer'
import { LabelRenderer } from './renderers/LabelRenderer'

interface ElementProps {
  element: ElementConfig
}

function ElementComponent({ element }: ElementProps) {
  const renderContent = () => {
    switch (element.type) {
      case 'knob':
        return <KnobRenderer config={element} />
      case 'slider':
        return <SliderRenderer config={element} />
      case 'button':
        return <ButtonRenderer config={element} />
      case 'label':
        return <LabelRenderer config={element} />
      case 'meter':
        // Placeholder for now (Phase 2 Plan 03)
        return <div>Meter</div>
      case 'image':
        // Placeholder for now (Phase 2 Plan 03)
        return <div>Image</div>
      default:
        // TypeScript exhaustive check
        const _exhaustive: never = element
        return null
    }
  }

  return <BaseElement element={element}>{renderContent()}</BaseElement>
}

// Memoize to prevent re-renders when other elements change
export const Element = React.memo(ElementComponent)
