import { useMemo } from 'react'
import { useStore } from '../../store'
import { PropertyPanel } from '../Properties'
import { isEditableContainer, EditableContainer } from '../../types/elements/containers'

interface ContainerEditorRightPanelProps {
  containerId: string
}

/**
 * Right panel for container editor
 * Shows properties for selected child elements
 */
export function ContainerEditorRightPanel({ containerId }: ContainerEditorRightPanelProps) {
  const elements = useStore((state) => state.elements)
  const selectedIds = useStore((state) => state.selectedIds)

  // Get container and count children
  const container = useMemo(() =>
    elements.find((el) => el.id === containerId),
    [elements, containerId]
  )

  const childCount = useMemo(() => {
    if (!container || !isEditableContainer(container)) return 0
    return (container as EditableContainer).children?.length || 0
  }, [container])

  const hasSelection = selectedIds.length > 0

  return (
    <div
      className="overflow-y-auto flex flex-col border-l"
      style={{
        backgroundColor: '#2d1515',
        borderColor: '#4a2020'
      }}
    >
      <div className="p-4 flex-1 overflow-y-auto container-editor-properties">
        <h2 className="text-lg font-semibold text-red-100 mb-4">Properties</h2>

        {hasSelection ? (
          <PropertyPanel />
        ) : (
          <div className="space-y-4">
            <div
              className="p-3 rounded text-sm"
              style={{ backgroundColor: '#3d1f1f' }}
            >
              <p className="text-red-200/70">Select an element to edit its properties</p>
            </div>

            <div className="space-y-2">
              <h3 className="text-sm font-medium text-red-200/80">Container Info</h3>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-red-300/50">Name:</span>
                  <span className="text-red-100">{container?.name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-300/50">Type:</span>
                  <span className="text-red-100">{container?.type || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-300/50">Children:</span>
                  <span className="text-red-100">{childCount}</span>
                </div>
              </div>
            </div>

            <div
              className="p-3 rounded text-xs space-y-1"
              style={{ backgroundColor: '#251010' }}
            >
              <p className="text-red-300/60 font-medium">Tips:</p>
              <ul className="text-red-300/50 space-y-0.5 list-disc list-inside">
                <li>Drag elements from the palette</li>
                <li>Click to select, drag to move</li>
                <li>Delete key removes selected</li>
                <li>Double-click nested containers to edit</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .container-editor-properties [class*="bg-gray-700"] {
          background-color: #3d1f1f !important;
        }
        .container-editor-properties [class*="bg-gray-800"] {
          background-color: #2d1515 !important;
        }
        .container-editor-properties [class*="hover:bg-gray-600"]:hover {
          background-color: #4d2525 !important;
        }
        .container-editor-properties [class*="hover:bg-gray-700"]:hover {
          background-color: #3d1f1f !important;
        }
        .container-editor-properties [class*="border-gray-600"] {
          border-color: #4a2020 !important;
        }
        .container-editor-properties [class*="border-gray-700"] {
          border-color: #3a1818 !important;
        }
        .container-editor-properties input,
        .container-editor-properties select {
          background-color: #3d1f1f !important;
          border-color: #4a2020 !important;
        }
      `}</style>
    </div>
  )
}
