import { useState } from 'react'
import { ElementCategory } from '../../../types/elementStyle'
import { ManageElementStylesDialog } from '../../dialogs'
import { SafeSVG } from '../../SafeSVG'
import { useStore } from '../../../store'

interface ElementStyleSectionProps {
  category: ElementCategory
  currentStyleId: string | undefined
  onStyleChange: (styleId: string | undefined) => void
}

/**
 * Reusable section for element style selection with manage dialog integration.
 *
 * Features:
 * - Style dropdown with "No style" option
 * - "Manage styles..." button to open style manager
 * - Thumbnail preview when style selected
 * - Opens ManageElementStylesDialog for style management
 *
 * Used by all property panels for elements that support SVG styling.
 * SVG styling is available to all users (free feature).
 */
export function ElementStyleSection({
  category,
  currentStyleId,
  onStyleChange
}: ElementStyleSectionProps) {
  const [showManageDialog, setShowManageDialog] = useState(false)

  // Fetch styles reactively from store - filter in selector for proper reactivity
  const elementStyles = useStore((state) => state.elementStyles)
  const styles = (elementStyles || []).filter(s => s.category === category)
  const currentStyle = currentStyleId ? styles.find(s => s.id === currentStyleId) : undefined

  return (
    <>
      {/* Style dropdown */}
      <select
        value={currentStyleId || ''}
        onChange={(e) => onStyleChange(e.target.value || undefined)}
        className="w-full bg-gray-700 text-white rounded px-2 py-1 text-sm"
      >
        <option value="">No style</option>
        {styles.map(style => (
          <option key={style.id} value={style.id}>{style.name}</option>
        ))}
      </select>

      {/* Manage styles button */}
      <button
        onClick={() => setShowManageDialog(true)}
        className="w-full text-left text-sm text-blue-400 hover:text-blue-300 mt-1"
      >
        Manage styles...
      </button>

      {/* Thumbnail preview when style selected */}
      {currentStyle && (
        <div className="mt-2 p-2 bg-gray-900 rounded">
          <div className="w-16 h-16 mx-auto">
            <SafeSVG
              content={currentStyle.svgContent}
              style={{ width: '100%', height: '100%' }}
            />
          </div>
          <p className="text-xs text-gray-400 text-center mt-1">{currentStyle.name}</p>
        </div>
      )}

      {/* Manage dialog */}
      <ManageElementStylesDialog
        isOpen={showManageDialog}
        onClose={() => setShowManageDialog(false)}
        category={category}
      />
    </>
  )
}
