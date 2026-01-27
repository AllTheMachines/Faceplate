import { useStore } from '../../store'
import { isEditableContainer, EditableContainer } from '../../types/elements/containers'
import { PropertySection } from './'

interface EditContentsButtonProps {
  element: EditableContainer
}

/**
 * Button to open container editor for editing child elements
 * Shows in property panel for all editable containers
 */
export function EditContentsButton({ element }: EditContentsButtonProps) {
  const startEditingContainer = useStore((state) => state.startEditingContainer)
  const childCount = element.children?.length || 0

  if (!isEditableContainer(element)) {
    return null
  }

  return (
    <PropertySection title="Contents">
      <button
        onClick={() => startEditingContainer(element.id)}
        className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium flex items-center justify-center gap-2 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
        Edit Contents
        {childCount > 0 && (
          <span className="bg-blue-500 px-1.5 py-0.5 rounded text-xs">
            {childCount}
          </span>
        )}
      </button>
      {childCount === 0 && (
        <p className="text-xs text-gray-500 mt-2">
          Add elements inside this container
        </p>
      )}
      {childCount > 0 && (
        <p className="text-xs text-gray-500 mt-2">
          {childCount} element{childCount !== 1 ? 's' : ''} inside
        </p>
      )}
    </PropertySection>
  )
}
