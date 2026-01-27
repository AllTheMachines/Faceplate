import { useMemo } from 'react'
import { useStore } from '../../store'
import { isEditableContainer } from '../../types/elements/containers'
import { ContainerEditorLeftPanel } from './ContainerEditorLeftPanel'
import { ContainerEditorRightPanel } from './ContainerEditorRightPanel'
import { ContainerEditorCanvas } from './ContainerEditorCanvas'
import { ContainerBreadcrumb } from './ContainerBreadcrumb'

/**
 * Full-screen container editor layout
 * Mirrors the main UI designer with dark red color scheme
 */
export function ContainerEditorLayout() {
  const editingContainerId = useStore((state) => state.editingContainerId)
  const containerEditStack = useStore((state) => state.containerEditStack)
  const closeContainerEditor = useStore((state) => state.closeContainerEditor)
  const elements = useStore((state) => state.elements)

  // Get container reactively
  const container = useMemo(() =>
    editingContainerId ? elements.find((el) => el.id === editingContainerId) : null,
    [elements, editingContainerId]
  )

  // Don't render if not editing
  if (!editingContainerId) return null
  if (!container || !isEditableContainer(container)) return null

  // Use full container dimensions (not content area)
  const containerWidth = container.width
  const containerHeight = container.height

  return (
    <div
      className="fixed inset-0 z-50 text-gray-100"
      style={{
        display: 'grid',
        gridTemplateColumns: '250px 1fr 300px',
        gridTemplateRows: 'auto 1fr',
        backgroundColor: '#1a0a0a' // Very dark red background
      }}
    >
      {/* Top bar spanning all columns */}
      <div
        className="col-span-3 px-4 py-2 border-b flex items-center justify-between"
        style={{
          backgroundColor: '#2d1515',
          borderColor: '#4a2020'
        }}
      >
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold text-red-100">Container Editor</h2>
          <ContainerBreadcrumb
            currentContainerId={editingContainerId}
            containerStack={containerEditStack}
          />
          <span className="text-red-300/60 text-sm">
            {container.name} ({containerWidth} x {containerHeight}px)
          </span>
        </div>
        <div className="flex items-center gap-2 text-sm text-red-300/60">
          <span>Press Escape or click OK to exit</span>
        </div>
      </div>

      {/* Left Panel */}
      <ContainerEditorLeftPanel containerId={editingContainerId} />

      {/* Canvas Area */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: '#120808' }}
      >
        <ContainerEditorCanvas
          containerId={editingContainerId}
          contentWidth={containerWidth}
          contentHeight={containerHeight}
          onClose={closeContainerEditor}
        />
      </div>

      {/* Right Panel */}
      <ContainerEditorRightPanel containerId={editingContainerId} />
    </div>
  )
}
