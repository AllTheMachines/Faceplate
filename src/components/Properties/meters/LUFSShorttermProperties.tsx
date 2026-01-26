import React from 'react'
import { SharedMeterProperties } from './SharedMeterProperties'
import type { LUFSShorttermMonoElementConfig, LUFSShorttermStereoElementConfig } from '../../../types/elements/displays'

interface Props {
  element: LUFSShorttermMonoElementConfig | LUFSShorttermStereoElementConfig
  onUpdate: (updates: Partial<any>) => void
}

export function LUFSShorttermProperties({ element }: Props) {
  const isStereo = element.type === 'lufsshortstereo'

  return (
    <SharedMeterProperties
      elementId={element.id}
      config={element}
      meterLabel="LUFS Short-term (3s)"
      showOrientation={true}
      showChannelLabels={isStereo}
      stereoChannelLabels={isStereo}
    />
  )
}
