import React from 'react'
import { TextFieldElementConfig } from '../../../types/elements'

interface TextFieldRendererProps {
  config: TextFieldElementConfig
}

export function TextFieldRenderer({ config }: TextFieldRendererProps) {
  const inputStyles: React.CSSProperties = {
    width: '100%',
    height: '100%',
    fontSize: `${config.fontSize}px`,
    fontFamily: config.fontFamily,
    color: config.textColor,
    textAlign: config.textAlign,
    backgroundColor: config.backgroundColor,
    padding: `${config.padding}px`,
    border: `${config.borderWidth}px solid ${config.borderColor}`,
    borderRadius: `${config.borderRadius}px`,
    outline: 'none',
    boxSizing: 'border-box',
    // Designer mode - prevent interaction
    pointerEvents: 'none',
  }

  // Show placeholder or value
  const displayValue = config.value || config.placeholder

  return (
    <input
      type="text"
      value={displayValue}
      placeholder={config.placeholder}
      readOnly
      maxLength={config.maxLength > 0 ? config.maxLength : undefined}
      style={inputStyles}
    />
  )
}
