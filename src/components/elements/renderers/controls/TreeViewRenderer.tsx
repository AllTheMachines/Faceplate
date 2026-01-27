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
import { DEFAULT_SCROLLBAR_CONFIG } from '../../../../types/elements/containers'

interface TreeViewRendererProps {
  config: TreeViewElementConfig
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

export function TreeViewRenderer({ config, onUpdate, designMode = false }: TreeViewRendererProps) {
  const treeRef = useRef<any>(null)

  // Convert TreeNode[] to format expected by react-arborist
  const treeData = config.data

  // Scrollbar config
  const scrollbarWidth = config.scrollbarWidth ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarWidth
  const scrollbarThumbColor = config.scrollbarThumbColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbColor
  const scrollbarThumbHoverColor = config.scrollbarThumbHoverColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbHoverColor
  const scrollbarTrackColor = config.scrollbarTrackColor ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarTrackColor
  const scrollbarBorderRadius = config.scrollbarBorderRadius ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarBorderRadius
  const scrollbarThumbBorder = config.scrollbarThumbBorder ?? DEFAULT_SCROLLBAR_CONFIG.scrollbarThumbBorder
  const treeClass = `treeview-${config.id?.replace(/-/g, '') || 'default'}`

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
      className={treeClass}
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        overflow: 'hidden',
        fontSize: config.fontSize,
        fontFamily: config.fontFamily,
        fontWeight: config.fontWeight,
        color: config.textColor,
        position: 'relative', // Contains react-arborist's absolute positioning
      }}
      data-selected-id={config.selectedId}
    >
      {/* Wrapper to reset react-arborist's absolute positioning to 0,0 */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
        <Tree
          ref={treeRef}
          data={treeData}
          width={config.width}
          height={config.height}
          openByDefault={false}
          initialOpenState={Object.fromEntries(config.expandedIds.map(id => [id, true]))}
          selection={config.selectedId}
          disableEdit={config.disableEdit}
          disableDrag={config.disableDrag}
          disableDrop={true}
          rowHeight={config.rowHeight}
          indent={config.indent}
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
      </div>

      <style>{`
        .tree-node {
          cursor: pointer;
          padding: 0;
          transition: none;
        }

        .tree-node:hover {
          background-color: ${config.hoverBackgroundColor};
        }

        .tree-node.selected {
          background-color: ${config.selectedBackgroundColor};
          color: ${config.selectedTextColor};
        }

        .tree-node-content {
          display: flex;
          align-items: center;
          height: ${config.rowHeight}px;
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

        /* Custom scrollbar styling for react-arborist */
        .${treeClass} ::-webkit-scrollbar {
          width: ${scrollbarWidth}px;
          height: ${scrollbarWidth}px;
        }
        .${treeClass} ::-webkit-scrollbar-track {
          background: ${scrollbarTrackColor};
          border-radius: ${scrollbarBorderRadius}px;
        }
        .${treeClass} ::-webkit-scrollbar-thumb {
          background: ${scrollbarThumbColor};
          border-radius: ${scrollbarBorderRadius}px;
          border: ${scrollbarThumbBorder};
        }
        .${treeClass} ::-webkit-scrollbar-thumb:hover {
          background: ${scrollbarThumbHoverColor};
        }
      `}</style>
    </div>
  )
}
