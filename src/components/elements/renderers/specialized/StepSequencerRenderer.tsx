import React from 'react'
import { StepSequencerElementConfig } from '../../../../types/elements'
import { useStore } from '../../../../store'

interface StepSequencerRendererProps {
  config: StepSequencerElementConfig
}

export function StepSequencerRenderer({ config }: StepSequencerRendererProps) {
  const updateElement = useStore((state) => state.updateElement)

  const handleStepClick = (row: number, step: number, e: React.MouseEvent) => {
    e.stopPropagation()
    const index = row * config.stepCount + step
    const newSteps = [...config.steps]
    const currentStep = newSteps[index]
    if (currentStep) {
      newSteps[index] = {
        ...currentStep,
        active: !currentStep.active,
      }
      updateElement(config.id, { steps: newSteps })
    }
  }

  const {
    stepCount,
    rowCount,
    steps,
    currentStep,
    stepOffColor,
    stepOnColor,
    stepActiveColor,
    gridLineColor,
    backgroundColor,
    beatsPerMeasure,
    highlightDownbeats,
    downbeatColor,
    showVelocity,
    velocityHeight,
    width,
    height,
  } = config

  const mainHeight = showVelocity ? height - velocityHeight : height
  const stepWidth = width / stepCount
  const rowHeight = mainHeight / rowCount
  const padding = 2

  const stepElements = []
  const velocityBars = []

  for (let row = 0; row < rowCount; row++) {
    for (let step = 0; step < stepCount; step++) {
      const index = row * stepCount + step
      const stepData = steps[index] || { active: false, velocity: 0.75 }
      const isDownbeat = highlightDownbeats && step % beatsPerMeasure === 0
      const isCurrent = step === currentStep

      // Determine step color
      let color = stepOffColor
      if (stepData.active) {
        color = isCurrent ? stepActiveColor : stepOnColor
      } else if (isDownbeat) {
        color = downbeatColor
      }

      stepElements.push(
        <rect
          key={`step-${row}-${step}`}
          x={step * stepWidth + padding}
          y={row * rowHeight + padding}
          width={stepWidth - padding * 2}
          height={rowHeight - padding * 2}
          fill={color}
          opacity={stepData.active ? 1 : 0.5}
          style={{ cursor: 'pointer' }}
          onClick={(e) => handleStepClick(row, step, e)}
        />
      )

      // Velocity bars (only for first row)
      if (showVelocity && row === 0) {
        const barHeight = stepData.active ? stepData.velocity * (velocityHeight - 4) : 0
        velocityBars.push(
          <rect
            key={`vel-${step}`}
            x={step * stepWidth + padding}
            y={mainHeight + velocityHeight - barHeight - 2}
            width={stepWidth - padding * 2}
            height={barHeight}
            fill={stepOnColor}
          />
        )
      }
    }
  }

  // Grid lines
  const gridLines = []
  for (let i = 0; i <= stepCount; i++) {
    if (i % beatsPerMeasure === 0) {
      gridLines.push(
        <line
          key={`grid-${i}`}
          x1={i * stepWidth}
          y1={0}
          x2={i * stepWidth}
          y2={mainHeight}
          stroke={gridLineColor}
          strokeWidth={1}
        />
      )
    }
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ backgroundColor }}
    >
      {/* Grid lines */}
      {gridLines}

      {/* Steps */}
      {stepElements}

      {/* Velocity bars */}
      {showVelocity && (
        <>
          <line
            x1={0}
            y1={mainHeight}
            x2={width}
            y2={mainHeight}
            stroke={gridLineColor}
            strokeWidth={1}
          />
          {velocityBars}
        </>
      )}

      {/* Current step indicator */}
      {currentStep >= 0 && (
        <rect
          x={currentStep * stepWidth}
          y={0}
          width={stepWidth}
          height={mainHeight}
          fill="rgba(255,255,255,0.1)"
        />
      )}
    </svg>
  )
}
