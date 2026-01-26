import { useState, useRef, useEffect } from 'react'

interface InlineEditNameProps {
  value: string
  onSave: (newValue: string) => void
}

export function InlineEditName({ value, onSave }: InlineEditNameProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editValue, setEditValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  // Update editValue when prop value changes
  useEffect(() => {
    setEditValue(value)
  }, [value])

  // Auto-focus and select all text when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [isEditing])

  const handleSave = () => {
    const trimmedValue = editValue.trim()
    // Prevent saving empty names - revert to original
    if (trimmedValue === '') {
      setEditValue(value)
    } else if (trimmedValue !== value) {
      onSave(trimmedValue)
    }
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditValue(value)
    setIsEditing(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSave()
    } else if (e.key === 'Escape') {
      e.preventDefault()
      handleCancel()
    }
  }

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleSave}
        className="text-xs text-white bg-gray-700 rounded px-1 py-0.5 w-full text-center border border-blue-500 focus:outline-none"
      />
    )
  }

  return (
    <span
      onClick={() => setIsEditing(true)}
      className="text-xs text-gray-300 text-center line-clamp-2 w-full cursor-pointer hover:underline"
      title="Click to rename"
    >
      {value}
    </span>
  )
}
