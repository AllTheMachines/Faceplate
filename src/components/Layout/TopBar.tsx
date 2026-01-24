import { useState } from 'react'
import { NewProjectDialog } from '../dialogs/NewProjectDialog'

export const TopBar = () => {
  const [showNewProjectDialog, setShowNewProjectDialog] = useState(false)
  
  return (
    <div className="top-bar flex items-center gap-4 p-4">
      {/* Existing buttons */}
      
      <button
        onClick={() => setShowNewProjectDialog(true)}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium"
      >
        New Project
      </button>
      
      {/* Other buttons */}
      
      <NewProjectDialog
        isOpen={showNewProjectDialog}
        onClose={() => setShowNewProjectDialog(false)}
      />
    </div>
  )
}