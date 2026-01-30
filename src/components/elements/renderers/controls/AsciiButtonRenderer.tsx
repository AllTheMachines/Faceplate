import { useState } from 'react'
import { AsciiButtonElementConfig } from '../../../../types/elements'

interface AsciiButtonRendererProps {
  config: AsciiButtonElementConfig
}

export function AsciiButtonRenderer({ config }: AsciiButtonRendererProps) {
  const [isPressed, setIsPressed] = useState(config.pressed)

  // Determine which art to show based on pressed state
  const currentArt = isPressed ? config.pressedArt : config.normalArt
  const currentColor = isPressed ? config.pressedTextColor : config.textColor
  const currentBg = isPressed ? config.pressedBackgroundColor : config.backgroundColor

  // Map textAlign to flexbox
  const justifyMap = {
    left: 'flex-start',
    center: 'center',
    right: 'flex-end',
  }
  const justifyContent = justifyMap[config.textAlign || 'center']

  const handleMouseDown = () => {
    if (config.mode === 'momentary') {
      setIsPressed(true)
    }
  }

  const handleMouseUp = () => {
    if (config.mode === 'momentary') {
      setIsPressed(false)
    }
  }

  const handleClick = () => {
    if (config.mode === 'toggle') {
      setIsPressed(!isPressed)
    }
  }

  return (
    <div
      className="w-full h-full flex items-center"
      style={{
        fontFamily: config.fontFamily,
        fontSize: `${config.fontSize}px`,
        fontWeight: config.fontWeight,
        color: currentColor,
        lineHeight: config.lineHeight,
        backgroundColor: currentBg,
        padding: `${config.padding}px`,
        borderRadius: `${config.borderRadius}px`,
        border:
          config.borderWidth > 0
            ? `${config.borderWidth}px solid ${config.borderColor}`
            : 'none',
        boxSizing: 'border-box',
        whiteSpace: 'pre',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
        cursor: 'pointer',
        justifyContent,
      }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onClick={handleClick}
    >
      {currentArt}
    </div>
  )
}
