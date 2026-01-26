import React from 'react'
import { SharedMeterProperties } from './SharedMeterProperties'
import type { TruePeakMeterMonoElementConfig, TruePeakMeterStereoElementConfig } from '../../../types/elements/displays'

interface Props {
  element: TruePeakMeterMonoElementConfig | TruePeakMeterStereoElementConfig
  onUpdate: (updates: Partial<any>) => void
}

export function TruePeakMeterProperties({ element }: Props) {
  const isStereo = element.type === 'truepeakmeterstereo'

  return (
    <SharedMeterProperties
      elementId={element.id}
      config={element}
      meterLabel="True Peak - ITU-R BS.1770-5"
      showOrientation={true}
      showChannelLabels={isStereo}
      stereoChannelLabels={isStereo}
    />
  )
}
