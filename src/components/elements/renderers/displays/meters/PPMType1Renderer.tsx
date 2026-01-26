import React from 'react'
import type { PPMType1MonoElementConfig, PPMType1StereoElementConfig } from '../../../../../types/elements/displays'
import { SegmentedMeter } from './SegmentedMeter'
import { MeterScale } from './MeterScale'

interface MonoProps {
  config: PPMType1MonoElementConfig
}

export function PPMType1MonoRenderer({ config }: MonoProps) {
  const { width, height, orientation, scalePosition, showMajorTicks, showMinorTicks } = config
  const isVertical = orientation === 'vertical'
  const scaleWidth = scalePosition !== 'none' ? 30 : 0
  const meterWidth = isVertical ? width - (scalePosition === 'outside' ? scaleWidth : 0) : width
  const meterHeight = isVertical ? height : height - (scalePosition === 'outside' ? 20 : 0)

  return (
    <div style={{ display: 'flex', flexDirection: isVertical ? 'row' : 'column', width, height }}>
      {scalePosition === 'outside' && isVertical && (
        <MeterScale
          minDb={config.minDb}
          maxDb={config.maxDb}
          orientation={orientation}
          position="outside"
          showMajorTicks={showMajorTicks}
          showMinorTicks={showMinorTicks}
          width={scaleWidth}
          height={meterHeight}
        />
      )}
      <SegmentedMeter
        value={config.value}
        segmentCount={config.segmentCount}
        orientation={orientation}
        segmentGap={config.segmentGap}
        minDb={config.minDb}
        maxDb={config.maxDb}
        colorZones={config.colorZones}
        showPeakHold={config.showPeakHold}
        peakHoldPosition={config.value}
        peakHoldStyle={config.peakHoldStyle}
        width={meterWidth}
        height={meterHeight}
      />
      {scalePosition === 'outside' && !isVertical && (
        <MeterScale
          minDb={config.minDb}
          maxDb={config.maxDb}
          orientation={orientation}
          position="outside"
          showMajorTicks={showMajorTicks}
          showMinorTicks={showMinorTicks}
          width={width}
          height={20}
        />
      )}
    </div>
  )
}

interface StereoProps {
  config: PPMType1StereoElementConfig
}

export function PPMType1StereoRenderer({ config }: StereoProps) {
  const { width, height, orientation, scalePosition, showMajorTicks, showMinorTicks, showChannelLabels } = config
  const isVertical = orientation === 'vertical'
  const scaleWidth = scalePosition !== 'none' ? 30 : 0
  const channelGap = 8
  const labelHeight = showChannelLabels ? 16 : 0

  // For stereo vertical: scale | L meter | R meter
  const meterWidth = isVertical
    ? (width - (scalePosition === 'outside' ? scaleWidth : 0) - channelGap) / 2
    : width
  const meterHeight = isVertical
    ? height - labelHeight
    : (height - (scalePosition === 'outside' ? 20 : 0) - channelGap) / 2

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width, height }}>
      <div style={{ display: 'flex', flexDirection: isVertical ? 'row' : 'column', flex: 1 }}>
        {scalePosition === 'outside' && isVertical && (
          <MeterScale
            minDb={config.minDb}
            maxDb={config.maxDb}
            orientation={orientation}
            position="outside"
            showMajorTicks={showMajorTicks}
            showMinorTicks={showMinorTicks}
            width={scaleWidth}
            height={meterHeight}
          />
        )}
        <SegmentedMeter
          value={config.valueL}
          segmentCount={config.segmentCount}
          orientation={orientation}
          segmentGap={config.segmentGap}
          minDb={config.minDb}
          maxDb={config.maxDb}
          colorZones={config.colorZones}
          showPeakHold={config.showPeakHold}
          peakHoldPosition={config.valueL}
          peakHoldStyle={config.peakHoldStyle}
          width={meterWidth}
          height={meterHeight}
        />
        <div style={{ width: isVertical ? channelGap : undefined, height: isVertical ? undefined : channelGap }} />
        <SegmentedMeter
          value={config.valueR}
          segmentCount={config.segmentCount}
          orientation={orientation}
          segmentGap={config.segmentGap}
          minDb={config.minDb}
          maxDb={config.maxDb}
          colorZones={config.colorZones}
          showPeakHold={config.showPeakHold}
          peakHoldPosition={config.valueR}
          peakHoldStyle={config.peakHoldStyle}
          width={meterWidth}
          height={meterHeight}
        />
      </div>
      {showChannelLabels && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-around',
          paddingLeft: scalePosition === 'outside' && isVertical ? scaleWidth : 0,
          fontSize: 10,
          color: '#999',
        }}>
          <span>L</span>
          <span>R</span>
        </div>
      )}
    </div>
  )
}
