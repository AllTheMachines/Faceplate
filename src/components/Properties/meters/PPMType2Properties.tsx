import { SharedMeterProperties } from './SharedMeterProperties'
import type { PPMType2MonoElementConfig, PPMType2StereoElementConfig } from '../../../types/elements/displays'

interface Props {
  element: PPMType2MonoElementConfig | PPMType2StereoElementConfig
  onUpdate: (updates: Partial<any>) => void
}

export function PPMType2Properties({ element }: Props) {
  const isStereo = element.type === 'ppmtype2stereo'

  return (
    <SharedMeterProperties
      elementId={element.id}
      config={element}
      meterLabel="PPM Type II (BBC)"
      showOrientation={true}
      showChannelLabels={isStereo}
      stereoChannelLabels={isStereo}
    />
  )
}
