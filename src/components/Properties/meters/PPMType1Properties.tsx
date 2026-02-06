import { SharedMeterProperties } from './SharedMeterProperties'
import type { PPMType1MonoElementConfig, PPMType1StereoElementConfig } from '../../../types/elements/displays'

interface Props {
  element: PPMType1MonoElementConfig | PPMType1StereoElementConfig
  onUpdate: (updates: Partial<any>) => void
}

export function PPMType1Properties({ element }: Props) {
  const isStereo = element.type === 'ppmtype1stereo'

  return (
    <SharedMeterProperties
      elementId={element.id}
      config={element}
      meterLabel="PPM Type I (DIN)"
      showOrientation={true}
      showChannelLabels={isStereo}
      stereoChannelLabels={isStereo}
    />
  )
}
