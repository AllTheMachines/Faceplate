import React from 'react'
import type {
  K12MeterMonoElementConfig,
  K12MeterStereoElementConfig,
  K14MeterMonoElementConfig,
  K14MeterStereoElementConfig,
  K20MeterMonoElementConfig,
  K20MeterStereoElementConfig,
} from '../../../../../types/elements/displays'
import { SegmentedMeter } from './SegmentedMeter'
import { MeterScale } from './MeterScale'
import { PeakHoldIndicator } from './PeakHoldIndicator'

// K-12 Mono Renderer
export function K12MeterMonoRenderer({ config }: { config: K12MeterMonoElementConfig }) {
  const { width, height, orientation, scalePosition } = config

  const scaleWidth = scalePosition !== 'none' ? 30 : 0
  const meterWidth = scalePosition === 'outside' ? width - scaleWidth : width

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'row', position: 'relative' }}>
      <SegmentedMeter config={config} width={meterWidth} height={height} />
      
      {config.showPeakHold && (
        <PeakHoldIndicator 
          peakValue={config.value} 
          minDb={config.minDb}
          maxDb={config.maxDb}
          orientation={orientation}
          width={meterWidth}
          height={height}
          style={config.peakHoldStyle}
        />
      )}

      {scalePosition !== 'none' && (
        <MeterScale
          minDb={config.minDb}
          maxDb={config.maxDb}
          orientation={orientation}
          position={scalePosition}
          showMajorTicks={config.showMajorTicks}
          showMinorTicks={config.showMinorTicks}
          width={scaleWidth}
          height={height}
        />
      )}
    </div>
  )
}

// K-12 Stereo Renderer
export function K12MeterStereoRenderer({ config }: { config: K12MeterStereoElementConfig }) {
  const { width, height, orientation, scalePosition, valueL, valueR, showChannelLabels } = config

  const scaleWidth = scalePosition !== 'none' ? 30 : 0
  const labelHeight = showChannelLabels ? 16 : 0
  const meterHeight = height - labelHeight
  const meterWidth = (width - scaleWidth) / 2

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column' }}>
      {showChannelLabels && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          fontSize: 10, 
          color: '#999',
          height: labelHeight,
        }}>
          <span>L</span>
          <span>R</span>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, position: 'relative' }}>
        <SegmentedMeter 
          config={{ ...config, value: valueL }} 
          width={meterWidth} 
          height={meterHeight} 
        />
        
        {config.showPeakHold && (
          <PeakHoldIndicator 
            peakValue={valueL} 
            minDb={config.minDb}
            maxDb={config.maxDb}
            orientation={orientation}
            width={meterWidth}
            height={meterHeight}
            style={config.peakHoldStyle}
          />
        )}

        <SegmentedMeter 
          config={{ ...config, value: valueR }} 
          width={meterWidth} 
          height={meterHeight} 
        />
        
        {config.showPeakHold && (
          <PeakHoldIndicator 
            peakValue={valueR} 
            minDb={config.minDb}
            maxDb={config.maxDb}
            orientation={orientation}
            width={meterWidth}
            height={meterHeight}
            style={config.peakHoldStyle}
          />
        )}

        {scalePosition !== 'none' && (
          <MeterScale
            minDb={config.minDb}
            maxDb={config.maxDb}
            orientation={orientation}
            position={scalePosition}
            showMajorTicks={config.showMajorTicks}
            showMinorTicks={config.showMinorTicks}
            width={scaleWidth}
            height={meterHeight}
          />
        )}
      </div>
    </div>
  )
}

// K-14 Mono Renderer
export function K14MeterMonoRenderer({ config }: { config: K14MeterMonoElementConfig }) {
  const { width, height, orientation, scalePosition } = config

  const scaleWidth = scalePosition !== 'none' ? 30 : 0
  const meterWidth = scalePosition === 'outside' ? width - scaleWidth : width

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'row', position: 'relative' }}>
      <SegmentedMeter config={config} width={meterWidth} height={height} />
      
      {config.showPeakHold && (
        <PeakHoldIndicator 
          peakValue={config.value} 
          minDb={config.minDb}
          maxDb={config.maxDb}
          orientation={orientation}
          width={meterWidth}
          height={height}
          style={config.peakHoldStyle}
        />
      )}

      {scalePosition !== 'none' && (
        <MeterScale
          minDb={config.minDb}
          maxDb={config.maxDb}
          orientation={orientation}
          position={scalePosition}
          showMajorTicks={config.showMajorTicks}
          showMinorTicks={config.showMinorTicks}
          width={scaleWidth}
          height={height}
        />
      )}
    </div>
  )
}

// K-14 Stereo Renderer
export function K14MeterStereoRenderer({ config }: { config: K14MeterStereoElementConfig }) {
  const { width, height, orientation, scalePosition, valueL, valueR, showChannelLabels } = config

  const scaleWidth = scalePosition !== 'none' ? 30 : 0
  const labelHeight = showChannelLabels ? 16 : 0
  const meterHeight = height - labelHeight
  const meterWidth = (width - scaleWidth) / 2

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column' }}>
      {showChannelLabels && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          fontSize: 10, 
          color: '#999',
          height: labelHeight,
        }}>
          <span>L</span>
          <span>R</span>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, position: 'relative' }}>
        <SegmentedMeter 
          config={{ ...config, value: valueL }} 
          width={meterWidth} 
          height={meterHeight} 
        />
        
        {config.showPeakHold && (
          <PeakHoldIndicator 
            peakValue={valueL} 
            minDb={config.minDb}
            maxDb={config.maxDb}
            orientation={orientation}
            width={meterWidth}
            height={meterHeight}
            style={config.peakHoldStyle}
          />
        )}

        <SegmentedMeter 
          config={{ ...config, value: valueR }} 
          width={meterWidth} 
          height={meterHeight} 
        />
        
        {config.showPeakHold && (
          <PeakHoldIndicator 
            peakValue={valueR} 
            minDb={config.minDb}
            maxDb={config.maxDb}
            orientation={orientation}
            width={meterWidth}
            height={meterHeight}
            style={config.peakHoldStyle}
          />
        )}

        {scalePosition !== 'none' && (
          <MeterScale
            minDb={config.minDb}
            maxDb={config.maxDb}
            orientation={orientation}
            position={scalePosition}
            showMajorTicks={config.showMajorTicks}
            showMinorTicks={config.showMinorTicks}
            width={scaleWidth}
            height={meterHeight}
          />
        )}
      </div>
    </div>
  )
}

// K-20 Mono Renderer
export function K20MeterMonoRenderer({ config }: { config: K20MeterMonoElementConfig }) {
  const { width, height, orientation, scalePosition } = config

  const scaleWidth = scalePosition !== 'none' ? 30 : 0
  const meterWidth = scalePosition === 'outside' ? width - scaleWidth : width

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'row', position: 'relative' }}>
      <SegmentedMeter config={config} width={meterWidth} height={height} />
      
      {config.showPeakHold && (
        <PeakHoldIndicator 
          peakValue={config.value} 
          minDb={config.minDb}
          maxDb={config.maxDb}
          orientation={orientation}
          width={meterWidth}
          height={height}
          style={config.peakHoldStyle}
        />
      )}

      {scalePosition !== 'none' && (
        <MeterScale
          minDb={config.minDb}
          maxDb={config.maxDb}
          orientation={orientation}
          position={scalePosition}
          showMajorTicks={config.showMajorTicks}
          showMinorTicks={config.showMinorTicks}
          width={scaleWidth}
          height={height}
        />
      )}
    </div>
  )
}

// K-20 Stereo Renderer
export function K20MeterStereoRenderer({ config }: { config: K20MeterStereoElementConfig }) {
  const { width, height, orientation, scalePosition, valueL, valueR, showChannelLabels } = config

  const scaleWidth = scalePosition !== 'none' ? 30 : 0
  const labelHeight = showChannelLabels ? 16 : 0
  const meterHeight = height - labelHeight
  const meterWidth = (width - scaleWidth) / 2

  return (
    <div style={{ width, height, display: 'flex', flexDirection: 'column' }}>
      {showChannelLabels && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          fontSize: 10, 
          color: '#999',
          height: labelHeight,
        }}>
          <span>L</span>
          <span>R</span>
        </div>
      )}
      
      <div style={{ display: 'flex', flexDirection: 'row', flex: 1, position: 'relative' }}>
        <SegmentedMeter 
          config={{ ...config, value: valueL }} 
          width={meterWidth} 
          height={meterHeight} 
        />
        
        {config.showPeakHold && (
          <PeakHoldIndicator 
            peakValue={valueL} 
            minDb={config.minDb}
            maxDb={config.maxDb}
            orientation={orientation}
            width={meterWidth}
            height={meterHeight}
            style={config.peakHoldStyle}
          />
        )}

        <SegmentedMeter 
          config={{ ...config, value: valueR }} 
          width={meterWidth} 
          height={meterHeight} 
        />
        
        {config.showPeakHold && (
          <PeakHoldIndicator 
            peakValue={valueR} 
            minDb={config.minDb}
            maxDb={config.maxDb}
            orientation={orientation}
            width={meterWidth}
            height={meterHeight}
            style={config.peakHoldStyle}
          />
        )}

        {scalePosition !== 'none' && (
          <MeterScale
            minDb={config.minDb}
            maxDb={config.maxDb}
            orientation={orientation}
            position={scalePosition}
            showMajorTicks={config.showMajorTicks}
            showMinorTicks={config.showMinorTicks}
            width={scaleWidth}
            height={meterHeight}
          />
        )}
      </div>
    </div>
  )
}
