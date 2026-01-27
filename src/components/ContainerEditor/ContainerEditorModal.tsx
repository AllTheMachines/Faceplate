import { useCallback, useRef, useMemo } from 'react'
import { useStore } from '../../store'
import { isEditableContainer, getContainerContentOffset, EditableContainer } from '../../types/elements/containers'
import { MiniPalette } from './MiniPalette'
import { ContainerCanvas } from './ContainerCanvas'
import { ContainerBreadcrumb } from './ContainerBreadcrumb'

/**
 * Modal for editing container contents
 * Opens when user clicks "Edit Contents" on a container element
 */
export function ContainerEditorModal() {
  const editingContainerId = useStore((state) => state.editingContainerId)
  const containerEditStack = useStore((state) => state.containerEditStack)
  const closeContainerEditor = useStore((state) => state.closeContainerEditor)
  const elements = useStore((state) => state.elements)

  const modalRef = useRef<HTMLDivElement>(null)

  // Get container reactively
  const container = useMemo(() =>
    editingContainerId ? elements.find((el) => el.id === editingContainerId) : null,
    [elements, editingContainerId]
  )

  // Handle click outside to close
  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    if (e.target === modalRef.current) {
      closeContainerEditor()
    }
  }, [closeContainerEditor])

  // Handle escape key
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeContainerEditor()
    }
  }, [closeContainerEditor])

  // Don't render if not editing
  if (!editingContainerId) return null
  if (!container || !isEditableContainer(container)) return null

  const containerConfig = container as EditableContainer
  const contentOffset = getContainerContentOffset(containerConfig)

  // Calculate content area dimensions
  const contentWidth = container.width - contentOffset.left - contentOffset.right
  const contentHeight = container.height - contentOffset.top - contentOffset.bottom

  return (
    <div
      ref={modalRef}
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="bg-gray-900 rounded-lg shadow-2xl flex flex-col max-w-[90vw] max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-800 px-4 py-3 border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-white">Edit Container</h2>
            <ContainerBreadcrumb
              currentContainerId={editingContainerId}
              containerStack={containerEditStack}
            />
          </div>
          <button
            onClick={closeContainerEditor}
            className="text-gray-400 hover:text-white transition-colors p-1"
            title="Close (Escape)"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Main content area */}
        <div className="flex flex-1 overflow-hidden">
          {/* Mini Palette */}
          <div className="w-48 bg-gray-800 border-r border-gray-700 overflow-y-auto">
            <MiniPalette containerId={editingContainerId} />
          </div>

          {/* Canvas area */}
          <div className="flex-1 flex flex-col min-w-0">
            {/* Container info bar */}
            <div className="bg-gray-800/50 px-4 py-2 border-b border-gray-700 flex items-center gap-4 text-sm">
              <span className="text-gray-400">
                <span className="text-gray-500">Container:</span>{' '}
                <span className="text-white font-medium">{container.name}</span>
              </span>
              <span className="text-gray-400">
                <span className="text-gray-500">Type:</span>{' '}
                <span className="text-blue-400">{container.type}</span>
              </span>
              <span className="text-gray-400">
                <span className="text-gray-500">Content area:</span>{' '}
                <span className="text-white">{Math.round(contentWidth)} x {Math.round(contentHeight)}px</span>
              </span>
              <span className="text-gray-400">
                <span className="text-gray-500">Children:</span>{' '}
                <span className="text-white">{containerConfig.children?.length || 0}</span>
              </span>
            </div>

            {/* Canvas */}
            <div className="flex-1 overflow-auto bg-gray-950 p-4">
              <ContainerCanvas
                containerId={editingContainerId}
                contentWidth={contentWidth}
                contentHeight={contentHeight}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-800 px-4 py-3 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={closeContainerEditor}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded font-medium transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}
