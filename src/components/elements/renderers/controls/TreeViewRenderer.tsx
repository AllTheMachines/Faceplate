/**
 * TreeViewRenderer - Hierarchical tree view using react-arborist
 *
 * Interaction pattern (per CONTEXT.md):
 * - Click arrow: expand/collapse (does NOT select)
 * - Click row: selects (does NOT toggle expand/collapse)
 */

import React, { useRef } from 'react'
import { Tree, NodeRendererProps } from 'react-arborist'
import { TreeViewElementConfig, TreeNode } from '../../../../types/elements/controls'

interface TreeViewRendererProps {
  element: TreeViewElementConfig
  onUpdate?: (updates: Partial<TreeViewElementConfig>) => void
  designMode?: boolean
}

/**
 * Custom node renderer with separate arrow and row click handlers
 */
function CustomNode({ node, style, tree }: NodeRendererProps<TreeNode>) {
  const isSelected = node.isSelected
  const hasChildren = node.children && node.children.length > 0

  const handleArrowClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    // Arrow click toggles expand/collapse (does NOT select)
    node.toggle()
  }

  const handleRowClick = () => {
    // Row click selects (does NOT toggle expand/collapse)
    if (!isSelected) {
      tree.selectOnly(node.id)
    }
  }

  return (
    <div
      style={style}
      onClick={handleRowClick}
      data-node-id={node.id}
      className={`tree-node ${isSelected ? 'selected' : ''}`}
    >
      <div className="tree-node-content">
        {/* Arrow for expand/collapse */}
        {hasChildren ? (
          <button
            onClick={handleArrowClick}
            className="tree-arrow"
            style={{
              transform: node.isOpen ? 'rotate(90deg)' : 'rotate(0deg)',
              transition: 'transform 100ms ease',
            }}
          >
            ▶
          </button>
        ) : (
          <div className="tree-arrow-spacer" />
        )}

        {/* Node label */}
        <span className="tree-label">{node.data.name}</span>
      </div>
    </div>
  )
}

export function TreeViewRenderer({ element, onUpdate, designMode = false }: TreeViewRendererProps) {
  const treeRef = useRef<any>(null)

  // Convert TreeNode[] to format expected by react-arborist
  const treeData = element.data

  const handleSelectionChange = (selectedIds: string[]) => {
    if (onUpdate && selectedIds.length > 0) {
      onUpdate({ selectedId: selectedIds[0] })
    } else if (onUpdate && selectedIds.length === 0) {
      onUpdate({ selectedId: undefined })
    }
  }

  const handleOpenChange = (openIds: string[]) => {
    if (onUpdate) {
      onUpdate({ expandedIds: openIds })
    }
  }

  return (
    <div
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        backgroundColor: element.backgroundColor,
        overflow: 'hidden',
        fontSize: element.fontSize,
        color: element.textColor,
      }}
      data-selected-id={element.selectedId}
    >
      <Tree
        ref={treeRef}
        data={treeData}
        openByDefault={false}
        initialOpenState={Object.fromEntries(element.expandedIds.map(id => [id, true]))}
        selection={element.selectedId}
        disableEdit={element.disableEdit}
        disableDrag={element.disableDrag}
        disableDrop={true}
        rowHeight={element.rowHeight}
        indent={element.indent}
        onSelect={(nodes) => handleSelectionChange(nodes.map(n => n.id as string))}
        onToggle={(nodeId) => {
          // Track open state
          const tree = treeRef.current
          if (tree) {
            const openIds = Array.from(tree.openIds || []) as string[]
            handleOpenChange(openIds)
          }
        }}
        // Custom renderer
        children={CustomNode}
      >
        {CustomNode}
      </Tree>

      <style>{`
        .tree-node {
          cursor: pointer;
          padding: 0;
          transition: none;
        }

        .tree-node:hover {
          background-color: ${element.hoverBackgroundColor};
        }

        .tree-node.selected {
          background-color: ${element.selectedBackgroundColor};
          color: ${element.selectedTextColor};
        }

        .tree-node-content {
          display: flex;
          align-items: center;
          height: ${element.rowHeight}px;
          padding: 0 8px;
        }

        .tree-arrow {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 0;
          margin-right: 4px;
          width: 16px;
          height: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
        }

        .tree-arrow-spacer {
          width: 20px;
          flex-shrink: 0;
        }

        .tree-label {
          flex: 1;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>
    </div>
  )
}
