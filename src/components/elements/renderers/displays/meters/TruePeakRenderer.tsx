import React from 'react'
import type { TruePeakMeterMonoElementConfig, TruePeakMeterStereoElementConfig } from '../../../../../types/elements/displays'
import { SegmentedMeter } from './SegmentedMeter'
import { MeterScale } from './MeterScale'
import { StyledMeterRenderer } from './StyledMeterRenderer'

interface MonoProps {
  config: TruePeakMeterMonoElementConfig
}

function DefaultTruePeakMeterMonoRenderer({ config }: MonoProps) {
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

export function TruePeakMeterMonoRenderer({ config }: MonoProps) {
  if (config.styleId) {
    return <StyledMeterRenderer config={config} />
  }
  return <DefaultTruePeakMeterMonoRenderer config={config} />
}

interface StereoProps {
  config: TruePeakMeterStereoElementConfig
}

function DefaultTruePeakMeterStereoRenderer({ config }: StereoProps) {
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

export function TruePeakMeterStereoRenderer({ config }: StereoProps) {
  if (config.styleId) {
    const { width, height, orientation, showChannelLabels } = config
    const isVertical = orientation === 'vertical'
    const channelGap = 8
    const labelHeight = showChannelLabels ? 16 : 0
    const meterWidth = isVertical ? (width - channelGap) / 2 : width
    const meterHeight = isVertical ? height - labelHeight : (height - channelGap) / 2

    return (
      <div style={{ display: 'flex', flexDirection: 'column', width, height }}>
        <div style={{ display: 'flex', flexDirection: isVertical ? 'row' : 'column', flex: 1 }}>
          <div style={{ width: isVertical ? meterWidth : '100%', height: isVertical ? '100%' : meterHeight }}>
            <StyledMeterRenderer config={{ ...config, value: config.valueL, width: meterWidth, height: meterHeight }} />
          </div>
          <div style={{ width: isVertical ? channelGap : undefined, height: isVertical ? undefined : channelGap }} />
          <div style={{ width: isVertical ? meterWidth : '100%', height: isVertical ? '100%' : meterHeight }}>
            <StyledMeterRenderer config={{ ...config, value: config.valueR, width: meterWidth, height: meterHeight }} />
          </div>
        </div>
        {showChannelLabels && (
          <div style={{ display: 'flex', justifyContent: 'space-around', fontSize: 10, color: '#999' }}>
            <span>L</span>
            <span>R</span>
          </div>
        )}
      </div>
    )
  }
  return <DefaultTruePeakMeterStereoRenderer config={config} />
}
