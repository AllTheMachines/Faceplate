import React from 'react'
import { SharedMeterProperties } from './SharedMeterProperties'
import type { LUFSIntegratedMonoElementConfig, LUFSIntegratedStereoElementConfig } from '../../../types/elements/displays'

interface Props {
  element: LUFSIntegratedMonoElementConfig | LUFSIntegratedStereoElementConfig
  onUpdate: (updates: Partial<any>) => void
}

export function LUFSIntegratedProperties({ element }: Props) {
  const isStereo = element.type === 'lufsintstereo'

  return (
    <SharedMeterProperties
      elementId={element.id}
      config={element}
      meterLabel="LUFS Integrated"
      showOrientation={true}
      showChannelLabels={isStereo}
      stereoChannelLabels={isStereo}
    />
  )
}
