import React, { useState } from 'react'
import { ElementCategory, ElementStyle } from '../../../types/elementStyle'
import { ManageElementStylesDialog } from '../../dialogs'
import { SafeSVG } from '../../SafeSVG'

interface ElementStyleSectionProps {
  category: ElementCategory
  currentStyleId: string | undefined
  styles: ElementStyle[]
  onStyleChange: (styleId: string | undefined) => void
  isPro: boolean
}

/**
 * Reusable section for element style selection with manage dialog integration.
 *
 * Features:
 * - Style dropdown with "No style" option
 * - "Manage styles..." button (Pro only)
 * - Thumbnail preview when style selected
 * - Opens ManageElementStylesDialog for style management
 *
 * Used by all property panels for elements that support SVG styling.
 */
export function ElementStyleSection({
  category,
  currentStyleId,
  styles,
  onStyleChange,
  isPro
}: ElementStyleSectionProps) {
  const [showManageDialog, setShowManageDialog] = useState(false)
  const currentStyle = styles.find(s => s.id === currentStyleId)

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

      {/* Manage styles button - only for Pro */}
      {isPro && (
        <button
          onClick={() => setShowManageDialog(true)}
          className="w-full text-left text-sm text-blue-400 hover:text-blue-300 mt-1"
        >
          Manage styles...
        </button>
      )}

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
