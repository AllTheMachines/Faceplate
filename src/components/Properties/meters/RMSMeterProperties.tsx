import { SharedMeterProperties } from './SharedMeterProperties'
import type { RMSMeterMonoElementConfig, RMSMeterStereoElementConfig } from '../../../types/elements/displays'

interface Props {
  element: RMSMeterMonoElementConfig | RMSMeterStereoElementConfig
  onUpdate: (updates: Partial<any>) => void
}

export function RMSMeterProperties({ element }: Props) {
  const isStereo = element.type === 'rmsmeterstereo'

  return (
    <SharedMeterProperties
      elementId={element.id}
      config={element}
      meterLabel="RMS Meter"
      showOrientation={true}
      showChannelLabels={isStereo}
      stereoChannelLabels={isStereo}
    />
  )
}
