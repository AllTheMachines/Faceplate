import { Palette } from '../Palette'

export function LeftPanel() {
  return (
    <div className="bg-gray-800 border-r border-gray-700 overflow-y-auto">
      <div className="p-3 border-b border-gray-700">
        <h2 className="text-sm font-semibold text-gray-100">Components</h2>
      </div>
      <Palette />
    </div>
  )
}
