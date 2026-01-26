import React from 'react'
import { SharedMeterProperties } from './SharedMeterProperties'
import type { LUFSMomentaryMonoElementConfig, LUFSMomentaryStereoElementConfig } from '../../../types/elements/displays'

interface Props {
  element: LUFSMomentaryMonoElementConfig | LUFSMomentaryStereoElementConfig
  onUpdate: (updates: Partial<any>) => void
}

export function LUFSMomentaryProperties({ element }: Props) {
  const isStereo = element.type === 'lufsmomostereo'

  return (
    <SharedMeterProperties
      elementId={element.id}
      config={element}
      meterLabel="LUFS Momentary (400ms)"
      showOrientation={true}
      showChannelLabels={isStereo}
      stereoChannelLabels={isStereo}
    />
  )
}
