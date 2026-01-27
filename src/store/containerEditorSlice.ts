import { StateCreator } from 'zustand'
import { ElementConfig } from '../types/elements'
import { isEditableContainer, EditableContainer } from '../types/elements/containers'

export interface ContainerEditorSlice {
  // State
  /** ID of container currently being edited (null if not editing) */
  editingContainerId: string | null
  /** Stack of container IDs for nested editing (breadcrumb) */
  containerEditStack: string[]

  // Actions
  /** Start editing a container's contents */
  startEditingContainer: (containerId: string) => void
  /** Stop editing and return to parent (or main canvas if at root) */
  stopEditingContainer: () => void
  /** Stop all container editing and return to main canvas */
  closeContainerEditor: () => void
  /** Add a child element to a container */
  addChildToContainer: (containerId: string, child: ElementConfig) => void
  /** Remove a child element from a container */
  removeChildFromContainer: (containerId: string, childId: string) => void
  /** Get all children of a container */
  getContainerChildren: (containerId: string) => ElementConfig[]
  /** Check if an element is a child of a container */
  isChildOfContainer: (elementId: string, containerId: string) => boolean
}

// Store type that includes elements - will be passed in via middleware
interface StoreWithElements {
  elements: ElementConfig[]
  addElement: (element: ElementConfig) => void
  removeElement: (id: string) => void
  updateElement: (id: string, updates: Partial<ElementConfig>) => void
  getElement: (id: string) => ElementConfig | undefined
}

export const createContainerEditorSlice: StateCreator<
  ContainerEditorSlice & StoreWithElements,
  [],
  [],
  ContainerEditorSlice
> = (set, get) => ({
  // Default state
  editingContainerId: null,
  containerEditStack: [],

  // Actions
  startEditingContainer: (containerId: string) => {
    const element = get().getElement(containerId)
    if (!element || !isEditableContainer(element)) {
      console.warn('Cannot edit non-container element:', containerId)
      return
    }

    set((state) => {
      const newStack = state.editingContainerId
        ? [...state.containerEditStack, state.editingContainerId]
        : []
      return {
        editingContainerId: containerId,
        containerEditStack: newStack,
      }
    })
  },

  stopEditingContainer: () => {
    set((state) => {
      if (state.containerEditStack.length === 0) {
        // At root level, close editor
        return {
          editingContainerId: null,
          containerEditStack: [],
        }
      }
      // Pop from stack and edit parent
      const newStack = [...state.containerEditStack]
      const parentId = newStack.pop()!
      return {
        editingContainerId: parentId,
        containerEditStack: newStack,
      }
    })
  },

  closeContainerEditor: () => {
    set({
      editingContainerId: null,
      containerEditStack: [],
    })
  },

  addChildToContainer: (containerId: string, child: ElementConfig) => {
    const container = get().getElement(containerId)
    if (!container || !isEditableContainer(container)) {
      console.warn('Cannot add child to non-container:', containerId)
      return
    }

    // Set the child's parentId
    const childWithParent = { ...child, parentId: containerId }

    // Add the child element to the store
    get().addElement(childWithParent)

    // Update the container's children array
    const currentChildren = (container as EditableContainer).children || []
    get().updateElement(containerId, {
      children: [...currentChildren, child.id],
    } as Partial<ElementConfig>)
  },

  removeChildFromContainer: (containerId: string, childId: string) => {
    const container = get().getElement(containerId)
    if (!container || !isEditableContainer(container)) {
      console.warn('Cannot remove child from non-container:', containerId)
      return
    }

    // Remove from container's children array
    const currentChildren = (container as EditableContainer).children || []
    get().updateElement(containerId, {
      children: currentChildren.filter((id) => id !== childId),
    } as Partial<ElementConfig>)

    // Remove the child element itself
    get().removeElement(childId)
  },

  getContainerChildren: (containerId: string) => {
    const container = get().getElement(containerId)
    if (!container || !isEditableContainer(container)) {
      return []
    }

    const childIds = (container as EditableContainer).children || []
    return childIds
      .map((id) => get().getElement(id))
      .filter((el): el is ElementConfig => el !== undefined)
  },

  isChildOfContainer: (elementId: string, containerId: string) => {
    const container = get().getElement(containerId)
    if (!container || !isEditableContainer(container)) {
      return false
    }

    const childIds = (container as EditableContainer).children || []
    return childIds.includes(elementId)
  },
})
