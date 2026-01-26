import React from 'react'
import { SharedMeterProperties } from './SharedMeterProperties'
import type { VUMeterMonoElementConfig, VUMeterStereoElementConfig } from '../../../types/elements/displays'

interface Props {
  element: VUMeterMonoElementConfig | VUMeterStereoElementConfig
  onUpdate: (updates: Partial<any>) => void
}

export function VUMeterProperties({ element }: Props) {
  const isStereo = element.type === 'vumeterstereo'

  return (
    <SharedMeterProperties
      elementId={element.id}
      config={element}
      meterLabel="VU Meter - ANSI C16.5-1942"
      showOrientation={true}
      showChannelLabels={isStereo}
      stereoChannelLabels={isStereo}
    />
  )
}
