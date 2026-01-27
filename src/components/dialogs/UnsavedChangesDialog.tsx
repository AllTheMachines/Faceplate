import React from 'react'

interface UnsavedChangesDialogProps {
  isOpen: boolean
  onSave: () => void      // User chose to save first
  onDiscard: () => void   // User chose to continue without saving
  onCancel: () => void    // User cancelled the action
  actionDescription?: string  // e.g., "loading a new project"
}

export const UnsavedChangesDialog: React.FC<UnsavedChangesDialogProps> = ({
  isOpen,
  onSave,
  onDiscard,
  onCancel,
  actionDescription = 'continuing',
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-[400px]">
        <h2 className="text-xl font-bold mb-4 text-white">Unsaved Changes</h2>
        <p className="text-gray-300 text-sm mb-6">
          You have unsaved changes. Save before {actionDescription}?
        </p>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onDiscard}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded text-white text-sm"
          >
            Don't Save
          </button>
          <button
            onClick={onSave}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white text-sm font-medium"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}
