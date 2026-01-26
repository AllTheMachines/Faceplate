import { useState } from 'react'
import type { EditableDisplayElementConfig } from '../../../../types/elements'

interface EditableDisplayRendererProps {
  config: EditableDisplayElementConfig
}

export function EditableDisplayRenderer({ config }: EditableDisplayRendererProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Calculate actual value from normalized
  const actual = config.min + config.value * (config.max - config.min)

  // Format based on format type
  const formatValue = (val: number): string => {
    switch (config.format) {
      case 'percentage':
        return `${(val * 100).toFixed(config.decimalPlaces)}%`
      case 'db':
        return `${val.toFixed(config.decimalPlaces)} dB`
      case 'numeric':
      default:
        return val.toFixed(config.decimalPlaces)
    }
  }

  const displayText = formatValue(actual)

  // Determine text color (negative values in red)
  const textColor = actual < 0 ? '#ff4444' : config.textColor

  const handleDoubleClick = () => {
    setIsEditing(true)
    setEditValue(actual.toString())
    setErrorMessage('')
  }

  const handleBlur = () => {
    validateAndCommit()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      validateAndCommit()
    } else if (e.key === 'Escape') {
      setIsEditing(false)
      setErrorMessage('')
    }
  }

  const validateAndCommit = () => {
    const parsed = parseFloat(editValue)

    if (isNaN(parsed)) {
      setErrorMessage('Invalid number')
      setTimeout(() => setErrorMessage(''), 2000)
      return
    }

    if (parsed < config.min || parsed > config.max) {
      setErrorMessage(`Value must be ${config.min}-${config.max}`)
      setTimeout(() => setErrorMessage(''), 2000)
      return
    }

    // Successfully validated - exit edit mode
    setIsEditing(false)
    setErrorMessage('')
  }

  return (
    <div
      className="editabledisplay-element"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        padding: `0 ${config.padding}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: config.fontFamily,
        fontSize: `${config.fontSize}px`,
        color: textColor,
        border: `1px solid ${config.borderColor}`,
        borderRadius: 0,
        boxSizing: 'border-box',
        position: 'relative',
        cursor: isEditing ? 'text' : 'pointer',
      }}
      onDoubleClick={handleDoubleClick}
    >
      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: config.fontFamily,
            fontSize: `${config.fontSize}px`,
            color: config.textColor,
            textAlign: 'center',
          }}
        />
      ) : (
        <span>{displayText}</span>
      )}
      {errorMessage && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: 0,
            backgroundColor: '#ef4444',
            color: '#ffffff',
            padding: '4px 8px',
            fontSize: `${config.fontSize * 0.7}px`,
            borderRadius: 4,
            whiteSpace: 'nowrap',
            marginBottom: 4,
          }}
        >
          {errorMessage}
        </div>
      )}
    </div>
  )
}
