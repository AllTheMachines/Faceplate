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
import { StyledMeterRenderer } from './StyledMeterRenderer'

// ============================================================================
// K-12 Meter Renderers
// ============================================================================

function DefaultK12MeterMonoRenderer({ config }: { config: K12MeterMonoElementConfig }) {
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

export function K12MeterMonoRenderer({ config }: { config: K12MeterMonoElementConfig }) {
  if (config.styleId) {
    return <StyledMeterRenderer config={config} />
  }
  return <DefaultK12MeterMonoRenderer config={config} />
}

function DefaultK12MeterStereoRenderer({ config }: { config: K12MeterStereoElementConfig }) {
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

export function K12MeterStereoRenderer({ config }: { config: K12MeterStereoElementConfig }) {
  if (config.styleId) {
    const { width, height, orientation, showChannelLabels, valueL, valueR } = config
    const isVertical = orientation === 'vertical'
    const channelGap = 8
    const labelHeight = showChannelLabels ? 16 : 0
    const meterWidth = isVertical ? (width - channelGap) / 2 : width
    const meterHeight = isVertical ? height - labelHeight : (height - channelGap) / 2

    return (
      <div style={{ display: 'flex', flexDirection: 'column', width, height }}>
        <div style={{ display: 'flex', flexDirection: isVertical ? 'row' : 'column', flex: 1 }}>
          <div style={{ width: isVertical ? meterWidth : '100%', height: isVertical ? '100%' : meterHeight }}>
            <StyledMeterRenderer config={{ ...config, value: valueL, width: meterWidth, height: meterHeight }} />
          </div>
          <div style={{ width: isVertical ? channelGap : undefined, height: isVertical ? undefined : channelGap }} />
          <div style={{ width: isVertical ? meterWidth : '100%', height: isVertical ? '100%' : meterHeight }}>
            <StyledMeterRenderer config={{ ...config, value: valueR, width: meterWidth, height: meterHeight }} />
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
  return <DefaultK12MeterStereoRenderer config={config} />
}

// ============================================================================
// K-14 Meter Renderers
// ============================================================================

function DefaultK14MeterMonoRenderer({ config }: { config: K14MeterMonoElementConfig }) {
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

export function K14MeterMonoRenderer({ config }: { config: K14MeterMonoElementConfig }) {
  if (config.styleId) {
    return <StyledMeterRenderer config={config} />
  }
  return <DefaultK14MeterMonoRenderer config={config} />
}

function DefaultK14MeterStereoRenderer({ config }: { config: K14MeterStereoElementConfig }) {
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

export function K14MeterStereoRenderer({ config }: { config: K14MeterStereoElementConfig }) {
  if (config.styleId) {
    const { width, height, orientation, showChannelLabels, valueL, valueR } = config
    const isVertical = orientation === 'vertical'
    const channelGap = 8
    const labelHeight = showChannelLabels ? 16 : 0
    const meterWidth = isVertical ? (width - channelGap) / 2 : width
    const meterHeight = isVertical ? height - labelHeight : (height - channelGap) / 2

    return (
      <div style={{ display: 'flex', flexDirection: 'column', width, height }}>
        <div style={{ display: 'flex', flexDirection: isVertical ? 'row' : 'column', flex: 1 }}>
          <div style={{ width: isVertical ? meterWidth : '100%', height: isVertical ? '100%' : meterHeight }}>
            <StyledMeterRenderer config={{ ...config, value: valueL, width: meterWidth, height: meterHeight }} />
          </div>
          <div style={{ width: isVertical ? channelGap : undefined, height: isVertical ? undefined : channelGap }} />
          <div style={{ width: isVertical ? meterWidth : '100%', height: isVertical ? '100%' : meterHeight }}>
            <StyledMeterRenderer config={{ ...config, value: valueR, width: meterWidth, height: meterHeight }} />
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
  return <DefaultK14MeterStereoRenderer config={config} />
}

// ============================================================================
// K-20 Meter Renderers
// ============================================================================

function DefaultK20MeterMonoRenderer({ config }: { config: K20MeterMonoElementConfig }) {
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

export function K20MeterMonoRenderer({ config }: { config: K20MeterMonoElementConfig }) {
  if (config.styleId) {
    return <StyledMeterRenderer config={config} />
  }
  return <DefaultK20MeterMonoRenderer config={config} />
}

function DefaultK20MeterStereoRenderer({ config }: { config: K20MeterStereoElementConfig }) {
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

export function K20MeterStereoRenderer({ config }: { config: K20MeterStereoElementConfig }) {
  if (config.styleId) {
    const { width, height, orientation, showChannelLabels, valueL, valueR } = config
    const isVertical = orientation === 'vertical'
    const channelGap = 8
    const labelHeight = showChannelLabels ? 16 : 0
    const meterWidth = isVertical ? (width - channelGap) / 2 : width
    const meterHeight = isVertical ? height - labelHeight : (height - channelGap) / 2

    return (
      <div style={{ display: 'flex', flexDirection: 'column', width, height }}>
        <div style={{ display: 'flex', flexDirection: isVertical ? 'row' : 'column', flex: 1 }}>
          <div style={{ width: isVertical ? meterWidth : '100%', height: isVertical ? '100%' : meterHeight }}>
            <StyledMeterRenderer config={{ ...config, value: valueL, width: meterWidth, height: meterHeight }} />
          </div>
          <div style={{ width: isVertical ? channelGap : undefined, height: isVertical ? undefined : channelGap }} />
          <div style={{ width: isVertical ? meterWidth : '100%', height: isVertical ? '100%' : meterHeight }}>
            <StyledMeterRenderer config={{ ...config, value: valueR, width: meterWidth, height: meterHeight }} />
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
  return <DefaultK20MeterStereoRenderer config={config} />
}
