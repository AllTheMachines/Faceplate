import { Palette } from '../Palette'

interface ContainerEditorLeftPanelProps {
  containerId: string
}

/**
 * Left panel for container editor
 * Contains the full palette with red color scheme
 */
export function ContainerEditorLeftPanel({ containerId: _containerId }: ContainerEditorLeftPanelProps) {
  return (
    <div
      className="overflow-y-auto flex flex-col border-r"
      style={{
        backgroundColor: '#2d1515',
        borderColor: '#4a2020'
      }}
    >
      <div className="p-4 border-b" style={{ borderColor: '#4a2020' }}>
        <h1 className="text-xl font-bold text-red-100 tracking-tight">Elements</h1>
        <span className="text-xs text-red-300/50">Click or drag to add</span>
      </div>

      {/* Full Palette */}
      <div className="flex-1 overflow-y-auto container-editor-palette">
        <Palette />
      </div>

      <style>{`
        .container-editor-palette [class*="bg-gray-700"] {
          background-color: #3d1f1f !important;
        }
        .container-editor-palette [class*="bg-gray-800"] {
          background-color: #2d1515 !important;
        }
        .container-editor-palette [class*="hover:bg-gray-600"]:hover {
          background-color: #4d2525 !important;
        }
        .container-editor-palette [class*="hover:bg-gray-700"]:hover {
          background-color: #3d1f1f !important;
        }
        .container-editor-palette [class*="border-gray-600"] {
          border-color: #4a2020 !important;
        }
        .container-editor-palette [class*="border-gray-700"] {
          border-color: #3a1818 !important;
        }
      `}</style>
    </div>
  )
}
