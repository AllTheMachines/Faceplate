import { SharedMeterProperties } from './SharedMeterProperties'
import type {
  K12MeterMonoElementConfig, K12MeterStereoElementConfig,
  K14MeterMonoElementConfig, K14MeterStereoElementConfig,
  K20MeterMonoElementConfig, K20MeterStereoElementConfig
} from '../../../types/elements/displays'

interface Props {
  element:
    | K12MeterMonoElementConfig | K12MeterStereoElementConfig
    | K14MeterMonoElementConfig | K14MeterStereoElementConfig
    | K20MeterMonoElementConfig | K20MeterStereoElementConfig
  onUpdate: (updates: Partial<any>) => void
}

export function KMeterProperties({ element }: Props) {
  const isStereo = element.type.includes('stereo')
  const kType = (element as any).kType as 'K-12' | 'K-14' | 'K-20'

  return (
    <SharedMeterProperties
      elementId={element.id}
      config={element}
      meterLabel={`${kType} Meter - Bob Katz Standard`}
      showOrientation={true}
      showChannelLabels={isStereo}
      stereoChannelLabels={isStereo}
    />
  )
}
