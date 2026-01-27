import { useMemo } from 'react'
import { useStore } from '../../store'

interface ContainerBreadcrumbProps {
  currentContainerId: string
  containerStack: string[]
}

/**
 * Breadcrumb navigation for nested container editing
 * Shows the path from root to current container
 */
export function ContainerBreadcrumb({ currentContainerId, containerStack }: ContainerBreadcrumbProps) {
  const elements = useStore((state) => state.elements)
  const startEditingContainer = useStore((state) => state.startEditingContainer)
  const closeContainerEditor = useStore((state) => state.closeContainerEditor)

  // Build breadcrumb items from stack + current (reactively)
  const items = useMemo(() => [
    ...containerStack.map((id) => {
      const element = elements.find((el) => el.id === id)
      return { id, name: element?.name || 'Container' }
    }),
    {
      id: currentContainerId,
      name: elements.find((el) => el.id === currentContainerId)?.name || 'Container'
    },
  ], [containerStack, currentContainerId, elements])

  // Handle click on breadcrumb item
  const handleClick = (_id: string, index: number) => {
    if (index === items.length - 1) {
      // Clicked on current item, do nothing
      return
    }
    // Navigate to the clicked container
    // This requires resetting the stack and starting fresh
    closeContainerEditor()
    // Small delay to ensure state is cleared
    setTimeout(() => {
      // Re-open at the clicked level by navigating through the stack
      for (let i = 0; i <= index; i++) {
        startEditingContainer(items[i]!.id)
      }
    }, 0)
  }

  if (items.length <= 1) {
    // No breadcrumb needed for single level
    return null
  }

  return (
    <nav className="flex items-center text-sm" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center">
          {index > 0 && (
            <svg
              className="w-4 h-4 text-gray-500 mx-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          )}
          <button
            onClick={() => handleClick(item.id, index)}
            className={`px-2 py-0.5 rounded transition-colors ${
              index === items.length - 1
                ? 'text-white bg-gray-700 cursor-default'
                : 'text-gray-400 hover:text-white hover:bg-gray-700'
            }`}
            disabled={index === items.length - 1}
          >
            {item.name}
          </button>
        </div>
      ))}
    </nav>
  )
}
