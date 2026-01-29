import { useRef } from 'react'
import toast from 'react-hot-toast'
import { useStore } from '../../store'
import { ElementConfig } from '../../types/elements'
import { NumberInput, TextInput, PropertySection, getPropertyComponent } from './'
import { downloadElementSVG, getLayerNamesForType } from '../../services/export/svgElementExport'
import { validateSVGForElement, detectLayersForType } from '../../services/svgLayerDetection'
import { sectionHelp } from '../../content/help/sections'

export function PropertyPanel() {
  const selectedIds = useStore((state) => state.selectedIds)
  const elements = useStore((state) => state.elements)
  const updateElement = useStore((state) => state.updateElement)
  const liveDragValues = useStore((state) => state.liveDragValues)

  // File input ref for SVG import
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Get the selected element by finding it in the elements array
  // This ensures the component re-renders when the element changes
  const getElement = (id: string) => elements.find((el) => el.id === id)

  // Handle no selection
  if (selectedIds.length === 0) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p className="text-sm">No element selected</p>
        <p className="text-xs mt-2">Click an element on the canvas to edit its properties</p>
      </div>
    )
  }

  // Handle multi-selection (defer to Phase 6)
  if (selectedIds.length > 1) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p className="text-sm">Multiple elements selected</p>
        <p className="text-xs mt-2">{selectedIds.length} elements</p>
        <p className="text-xs mt-2 text-gray-500">Multi-edit coming in Phase 6</p>
      </div>
    )
  }

  // Single element selected
  const element = getElement(selectedIds[0]!)
  if (!element) {
    return (
      <div className="text-center text-gray-400 py-8">
        <p className="text-sm">Element not found</p>
      </div>
    )
  }

  // Update helper
  const update = (updates: Partial<ElementConfig>) => {
    updateElement(element.id, updates)
  }

  // Merge live values if available (live values take precedence during drag/resize)
  const liveValues = liveDragValues?.[element.id]
  const displayX = liveValues?.x ?? element.x
  const displayY = liveValues?.y ?? element.y
  const displayWidth = liveValues?.width ?? element.width
  const displayHeight = liveValues?.height ?? element.height

  // Handle SVG import with validation
  const handleSVGImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Reset input for re-imports
    e.target.value = ''

    try {
      const svgContent = await file.text()

      // Validate SVG structure
      const parser = new DOMParser()
      const doc = parser.parseFromString(svgContent, 'image/svg+xml')
      if (doc.querySelector('parsererror')) {
        toast.error('Invalid SVG file')
        return
      }

      // Detect and validate layers
      const validation = validateSVGForElement(svgContent, element.type)
      const detection = detectLayersForType(svgContent, element.type)

      // Show results
      if (validation.isValid) {
        const matchedCount = Object.keys(detection.matched).length
        toast.success(
          `SVG validated! ${matchedCount} layer(s) matched for ${element.type}`,
          { duration: 4000 }
        )

        // Log detailed results to console for debugging
        console.log('SVG Import Validation:', {
          elementType: element.type,
          matched: detection.matched,
          missing: detection.missing,
          unmapped: detection.unmapped,
        })

        // Show warnings if any
        validation.warnings.forEach(warning => {
          toast(warning, { icon: '⚠️', duration: 5000 })
        })
      } else {
        // Show errors
        validation.errors.forEach(error => {
          toast.error(error, { duration: 5000 })
        })
      }
    } catch (err) {
      toast.error('Failed to read SVG file')
      console.error('SVG import error:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Position & Size */}
      <PropertySection title="Position & Size" helpContent={sectionHelp['position-size']}>
        <div className="grid grid-cols-2 gap-3">
          <NumberInput
            label="X"
            value={displayX}
            onChange={(x) => update({ x })}
          />
          <NumberInput
            label="Y"
            value={displayY}
            onChange={(y) => update({ y })}
          />
          <NumberInput
            label="Width"
            value={displayWidth}
            onChange={(width) => update({ width })}
            min={20}
          />
          <NumberInput
            label="Height"
            value={displayHeight}
            onChange={(height) => update({ height })}
            min={20}
          />
        </div>
      </PropertySection>

      {/* Identity */}
      <PropertySection title="Identity" helpContent={sectionHelp['identity']}>
        <TextInput
          label="Name"
          value={element.name}
          onChange={(name) => update({ name })}
        />
        <TextInput
          label="Parameter ID"
          value={element.parameterId || ''}
          onChange={(parameterId) =>
            update({ parameterId: parameterId || undefined })
          }
          placeholder="Optional JUCE parameter binding"
        />
      </PropertySection>

      {/* Lock */}
      <PropertySection title="Lock" helpContent={sectionHelp['lock']}>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={element.locked}
            onChange={(e) => update({ locked: e.target.checked })}
            className="rounded border-gray-600 bg-gray-700 text-blue-500 focus:ring-blue-500"
          />
          <span className="text-gray-300">Lock element</span>
        </label>
        <p className="text-xs text-gray-500 mt-1">
          Locked elements cannot be moved or resized
        </p>
      </PropertySection>

      {/* Export / Import */}
      <PropertySection title="SVG" helpContent={sectionHelp['svg']}>
        <div className="flex gap-2">
          <button
            onClick={() => downloadElementSVG(element)}
            className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm flex items-center justify-center gap-2 transition-colors"
            title="Export element as SVG with named layers"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 px-3 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded text-sm flex items-center justify-center gap-2 transition-colors"
            title="Import and validate SVG layers"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m4-8l-4-4m0 0l-4 4m4-4v12" />
            </svg>
            Import
          </button>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".svg,image/svg+xml"
          onChange={handleSVGImport}
          className="hidden"
        />
        <p className="text-xs text-gray-500 mt-2">
          Expected layers: {getLayerNamesForType(element.type).slice(0, 3).join(', ')}...
        </p>
      </PropertySection>

      {/* Type-specific properties */}
      {(() => {
        const TypeSpecificProperties = getPropertyComponent(element.type)
        return TypeSpecificProperties ? (
          <TypeSpecificProperties element={element} onUpdate={update} />
        ) : null
      })()}
    </div>
  )
}
