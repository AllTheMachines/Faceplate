import { useCallback, useState } from 'react'
import { TreeViewElementConfig, TreeNode, ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, ColorInput, PropertySection } from './'
import { ScrollbarStyleSection } from './shared/ScrollbarStyleSection'

interface TreeViewPropertiesProps {
  element: TreeViewElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function TreeViewProperties({ element, onUpdate }: TreeViewPropertiesProps) {
  // Track expanded nodes in the tree editor
  const [expandedNodeIds, setExpandedNodeIds] = useState<string[]>([])

  // Add root node
  const addRootNode = useCallback(() => {
    const newNode: TreeNode = {
      id: `node-${Date.now()}`,
      name: `Node ${element.data.length + 1}`,
      children: [],
    }
    const newData = [...element.data, newNode]
    onUpdate({ data: newData })
  }, [element.data, onUpdate])

  // Add child node to a parent
  const addChildNode = useCallback(
    (parentPath: number[]) => {
      const newNode: TreeNode = {
        id: `node-${Date.now()}`,
        name: 'New Child',
        children: [],
      }

      const newData = [...element.data]
      let current: TreeNode[] = newData
      for (let i = 0; i < parentPath.length - 1; i++) {
        const pathIndex = parentPath[i]
        if (pathIndex === undefined) continue
        const node = current[pathIndex]
        if (!node) continue
        if (!node.children) node.children = []
        current = node.children
      }
      const lastPathIndex = parentPath[parentPath.length - 1]
      if (lastPathIndex === undefined) return
      const parentNode = current[lastPathIndex]
      if (!parentNode) return
      if (!parentNode.children) parentNode.children = []
      parentNode.children.push(newNode)

      // FIX NAV-01: Auto-expand parent so child is immediately visible
      setExpandedNodeIds((prev) =>
        prev.includes(parentNode.id) ? prev : [...prev, parentNode.id]
      )

      onUpdate({ data: newData })
    },
    [element.data, onUpdate]
  )

  // Remove node
  const removeNode = useCallback(
    (path: number[]) => {
      const newData = [...element.data]
      const firstIndex = path[0]
      if (firstIndex === undefined) return
      if (path.length === 1) {
        // Remove root node
        newData.splice(firstIndex, 1)
      } else {
        // Remove child node
        let current: TreeNode[] = newData
        for (let i = 0; i < path.length - 1; i++) {
          const pathIndex = path[i]
          if (pathIndex === undefined) continue
          const node = current[pathIndex]
          if (!node) continue
          current = node.children || []
        }
        const lastIndex = path[path.length - 1]
        if (lastIndex !== undefined) {
          current.splice(lastIndex, 1)
        }
      }
      onUpdate({ data: newData })
    },
    [element.data, onUpdate]
  )

  // Update node name
  const updateNodeName = useCallback(
    (path: number[], name: string) => {
      const newData = [...element.data]
      let current: TreeNode[] = newData
      for (let i = 0; i < path.length - 1; i++) {
        const pathIndex = path[i]
        if (pathIndex === undefined) continue
        const node = current[pathIndex]
        if (!node) continue
        current = node.children || []
      }
      const lastIndex = path[path.length - 1]
      if (lastIndex !== undefined && current[lastIndex]) {
        current[lastIndex].name = name
      }
      onUpdate({ data: newData })
    },
    [element.data, onUpdate]
  )

  // Toggle node expansion in editor
  const toggleNodeExpansion = useCallback((nodeId: string) => {
    setExpandedNodeIds((prev) =>
      prev.includes(nodeId) ? prev.filter((id) => id !== nodeId) : [...prev, nodeId]
    )
  }, [])

  // Render tree node recursively
  const renderNode = (node: TreeNode, path: number[], depth: number = 0): React.ReactNode => {
    const hasChildren = node.children && node.children.length > 0
    const isExpanded = expandedNodeIds.includes(node.id)

    return (
      <div key={node.id} className="mb-2">
        <div className="border border-gray-600 rounded p-2">
          <div className="flex items-center gap-2 mb-2">
            {hasChildren && (
              <button
                onClick={() => toggleNodeExpansion(node.id)}
                className="text-xs text-gray-400 hover:text-white w-4"
              >
                {isExpanded ? '▼' : '▶'}
              </button>
            )}
            {!hasChildren && <div className="w-4" />}
            <span className="text-xs text-gray-400">
              {depth === 0 ? 'Root' : 'Child'} {(path[path.length - 1] ?? 0) + 1}
            </span>
            <button
              onClick={() => removeNode(path)}
              className="ml-auto text-xs px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white"
            >
              Remove
            </button>
          </div>
          <TextInput
            label="Name"
            value={node.name}
            onChange={(name) => updateNodeName(path, name)}
          />
          <button
            onClick={() => addChildNode(path)}
            className="w-full mt-2 bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1.5 rounded"
          >
            Add Child
          </button>
        </div>
        {hasChildren && isExpanded && (
          <div className="ml-4 mt-2 border-l border-gray-700 pl-2">
            {node.children!.map((child, index) =>
              renderNode(child, [...path, index], depth + 1)
            )}
          </div>
        )}
      </div>
    )
  }

  return (
    <>
      {/* Tree Data */}
      <PropertySection title="Tree Data">
        <div className="space-y-2">
          {element.data.length === 0 ? (
            <p className="text-sm text-gray-500">No nodes yet</p>
          ) : (
            element.data.map((node, index) => renderNode(node, [index]))
          )}
          <button
            onClick={addRootNode}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm px-3 py-2 rounded"
          >
            Add Root Node
          </button>
        </div>
      </PropertySection>

      {/* Selection */}
      <PropertySection title="Selection">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Selected Node ID</label>
          <div className="text-sm text-gray-300">{element.selectedId || 'None'}</div>
        </div>
      </PropertySection>

      {/* Layout */}
      <PropertySection title="Layout">
        <NumberInput
          label="Row Height"
          value={element.rowHeight}
          onChange={(rowHeight) => onUpdate({ rowHeight })}
          min={20}
          max={60}
        />
        <NumberInput
          label="Indent (px)"
          value={element.indent}
          onChange={(indent) => onUpdate({ indent })}
          min={10}
          max={40}
        />
      </PropertySection>

      {/* Colors */}
      <PropertySection title="Colors">
        <ColorInput
          label="Background Color"
          value={element.backgroundColor}
          onChange={(backgroundColor) => onUpdate({ backgroundColor })}
        />
        <ColorInput
          label="Text Color"
          value={element.textColor}
          onChange={(textColor) => onUpdate({ textColor })}
        />
        <ColorInput
          label="Selected Background"
          value={element.selectedBackgroundColor}
          onChange={(selectedBackgroundColor) => onUpdate({ selectedBackgroundColor })}
        />
        <ColorInput
          label="Selected Text"
          value={element.selectedTextColor}
          onChange={(selectedTextColor) => onUpdate({ selectedTextColor })}
        />
      </PropertySection>

      <ScrollbarStyleSection config={element} onUpdate={onUpdate} />
    </>
  )
}
