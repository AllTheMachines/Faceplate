import { useStore } from '../../store'

export function ZOrderPanel() {
  const selectedIds = useStore((state) => state.selectedIds)
  const moveToFront = useStore((state) => state.moveToFront)
  const moveToBack = useStore((state) => state.moveToBack)
  const moveForward = useStore((state) => state.moveForward)
  const moveBackward = useStore((state) => state.moveBackward)

  // Only show when single element selected
  if (selectedIds.length !== 1) {
    return null
  }

  const elementId = selectedIds[0]
  if (!elementId) {
    return null
  }

  const buttons = [
    {
      label: 'Bring to Front',
      shortcut: 'Ctrl+Shift+]',
      action: () => moveToFront(elementId),
    },
    {
      label: 'Bring Forward',
      shortcut: 'Ctrl+]',
      action: () => moveForward(elementId),
    },
    {
      label: 'Send Backward',
      shortcut: 'Ctrl+[',
      action: () => moveBackward(elementId),
    },
    {
      label: 'Send to Back',
      shortcut: 'Ctrl+Shift+[',
      action: () => moveToBack(elementId),
    },
  ]

  return (
    <div className="p-4 border-t border-gray-700">
      <h3 className="text-sm font-medium text-gray-300 mb-3">Layer Order</h3>
      <div className="space-y-1">
        {buttons.map((btn) => (
          <button
            key={btn.label}
            onClick={btn.action}
            className="w-full flex justify-between items-center px-3 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded transition-colors"
          >
            <span>{btn.label}</span>
            <span className="text-xs text-gray-500">{btn.shortcut}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
