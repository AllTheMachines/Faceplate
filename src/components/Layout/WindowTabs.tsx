import { useState, useRef, useEffect, useCallback } from 'react'
import { useStore } from '../../store'
import type { UIWindow, WindowType } from '../../store/windowsSlice'

interface ContextMenuState {
  visible: boolean
  x: number
  y: number
  windowId: string | null
}

export function WindowTabs() {
  const windows = useStore((state) => state.windows)
  const activeWindowId = useStore((state) => state.activeWindowId)
  const addWindow = useStore((state) => state.addWindow)
  const removeWindow = useStore((state) => state.removeWindow)
  const updateWindow = useStore((state) => state.updateWindow)
  const setActiveWindow = useStore((state) => state.setActiveWindow)
  const duplicateWindow = useStore((state) => state.duplicateWindow)
  const saveWindowViewport = useStore((state) => state.saveWindowViewport)
  const restoreWindowViewport = useStore((state) => state.restoreWindowViewport)
  const clearSelection = useStore((state) => state.clearSelection)

  // Editing state
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingName, setEditingName] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  // Context menu state
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    visible: false,
    x: 0,
    y: 0,
    windowId: null,
  })

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClick = () => setContextMenu((prev) => ({ ...prev, visible: false }))
    if (contextMenu.visible) {
      document.addEventListener('click', handleClick)
      return () => document.removeEventListener('click', handleClick)
    }
  }, [contextMenu.visible])

  // Focus input when editing starts
  useEffect(() => {
    if (editingId && inputRef.current) {
      inputRef.current.focus()
      inputRef.current.select()
    }
  }, [editingId])

  const handleTabClick = useCallback((windowId: string) => {
    if (windowId === activeWindowId) return

    // Save current viewport before switching
    if (activeWindowId) {
      saveWindowViewport(activeWindowId)
    }

    // Clear selection when switching windows
    clearSelection()

    // Switch to new window
    setActiveWindow(windowId)

    // Restore viewport for new window
    restoreWindowViewport(windowId)
  }, [activeWindowId, saveWindowViewport, clearSelection, setActiveWindow, restoreWindowViewport])

  const handleDoubleClick = useCallback((window: UIWindow) => {
    setEditingId(window.id)
    setEditingName(window.name)
  }, [])

  const handleRenameSubmit = useCallback(() => {
    if (editingId && editingName.trim()) {
      updateWindow(editingId, { name: editingName.trim() })
    }
    setEditingId(null)
    setEditingName('')
  }, [editingId, editingName, updateWindow])

  const handleRenameKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleRenameSubmit()
    } else if (e.key === 'Escape') {
      setEditingId(null)
      setEditingName('')
    }
  }, [handleRenameSubmit])

  const handleContextMenu = useCallback((e: React.MouseEvent, windowId: string) => {
    e.preventDefault()
    setContextMenu({
      visible: true,
      x: e.clientX,
      y: e.clientY,
      windowId,
    })
  }, [])

  const handleAddWindow = useCallback(() => {
    addWindow({
      name: `Window ${windows.length + 1}`,
      type: 'release',
    })
  }, [addWindow, windows.length])

  const handleDelete = useCallback(() => {
    if (contextMenu.windowId) {
      removeWindow(contextMenu.windowId)
    }
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }, [contextMenu.windowId, removeWindow])

  const handleDuplicate = useCallback(() => {
    if (contextMenu.windowId) {
      duplicateWindow(contextMenu.windowId)
    }
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }, [contextMenu.windowId, duplicateWindow])

  const handleRename = useCallback(() => {
    if (contextMenu.windowId) {
      const window = windows.find((w) => w.id === contextMenu.windowId)
      if (window) {
        setEditingId(window.id)
        setEditingName(window.name)
      }
    }
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }, [contextMenu.windowId, windows])

  const handleChangeType = useCallback((type: WindowType) => {
    if (contextMenu.windowId) {
      updateWindow(contextMenu.windowId, { type })
    }
    setContextMenu((prev) => ({ ...prev, visible: false }))
  }, [contextMenu.windowId, updateWindow])

  const contextWindow = contextMenu.windowId
    ? windows.find((w) => w.id === contextMenu.windowId)
    : null

  return (
    <div className="flex items-center bg-gray-800 border-t border-gray-700 px-2 h-9 gap-1">
      {/* Window tabs */}
      {windows.map((window) => {
        const isActive = window.id === activeWindowId
        const isEditing = editingId === window.id

        return (
          <div
            key={window.id}
            className={`
              flex items-center gap-1.5 px-3 py-1 rounded-t cursor-pointer select-none
              transition-colors text-sm
              ${isActive
                ? 'bg-gray-700 text-white'
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-700/50'
              }
            `}
            onClick={() => handleTabClick(window.id)}
            onDoubleClick={() => handleDoubleClick(window)}
            onContextMenu={(e) => handleContextMenu(e, window.id)}
          >
            {isEditing ? (
              <input
                ref={inputRef}
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={handleRenameSubmit}
                onKeyDown={handleRenameKeyDown}
                onClick={(e) => e.stopPropagation()}
                className="bg-gray-600 text-white px-1 py-0.5 rounded text-sm w-24 outline-none border border-blue-500"
              />
            ) : (
              <>
                <span className="truncate max-w-[120px]">{window.name}</span>
                {window.type === 'developer' && (
                  <span className="text-[10px] px-1 py-0.5 bg-amber-600/80 text-amber-100 rounded font-medium">
                    DEV
                  </span>
                )}
              </>
            )}
          </div>
        )
      })}

      {/* Add window button */}
      <button
        onClick={handleAddWindow}
        className="flex items-center justify-center w-7 h-7 text-gray-400 hover:text-white hover:bg-gray-700 rounded transition-colors"
        title="Add new window"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Context menu */}
      {contextMenu.visible && contextWindow && (
        <div
          className="fixed bg-gray-800 border border-gray-600 rounded shadow-lg py-1 z-50 min-w-[160px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={handleRename}
            className="w-full px-3 py-1.5 text-left text-sm text-gray-200 hover:bg-gray-700"
          >
            Rename
          </button>
          <button
            onClick={handleDuplicate}
            className="w-full px-3 py-1.5 text-left text-sm text-gray-200 hover:bg-gray-700"
          >
            Duplicate
          </button>
          <div className="border-t border-gray-700 my-1" />
          <div className="px-3 py-1 text-xs text-gray-500 uppercase">Window Type</div>
          <button
            onClick={() => handleChangeType('release')}
            className={`w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 ${
              contextWindow.type === 'release'
                ? 'text-blue-400 bg-blue-900/30'
                : 'text-gray-200 hover:bg-gray-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Release
          </button>
          <button
            onClick={() => handleChangeType('developer')}
            className={`w-full px-3 py-1.5 text-left text-sm flex items-center gap-2 ${
              contextWindow.type === 'developer'
                ? 'text-blue-400 bg-blue-900/30'
                : 'text-gray-200 hover:bg-gray-700'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Developer
          </button>
          {windows.length > 1 && (
            <>
              <div className="border-t border-gray-700 my-1" />
              <button
                onClick={handleDelete}
                className="w-full px-3 py-1.5 text-left text-sm text-red-400 hover:bg-red-900/30"
              >
                Delete
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
