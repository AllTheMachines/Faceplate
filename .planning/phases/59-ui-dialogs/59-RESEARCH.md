# Phase 59: UI Dialogs - Research

**Researched:** 2026-02-05
**Domain:** Dialog UI components for style management, layer mapping, property panel integration
**Confidence:** HIGH

## Summary

Phase 59 implements three UI workflows for managing SVG element styles through dialogs and PropertyPanel integration. The codebase already has proven patterns from Phase 53's knob style implementation: ManageKnobStylesDialog for style library management and LayerMappingDialog for SVG layer assignment. These existing components provide the exact architecture to extend across all element categories (linear, arc, button, meter).

User decisions from CONTEXT.md lock the workflow: three entry points for style import (asset sidebar, PropertyPanel dropdown, element-specific button), ManageElementStylesDialog with rename/delete/re-map actions, LayerMappingDialog with auto-detection and SVG preview, and PropertyPanel integration following the knob style dropdown pattern.

The existing implementation demonstrates:
- Dialog component pattern with z-index 50, fixed inset-0 backdrop, max-w-2xl centered containers
- Layer mapping UI with side-by-side preview and table layout
- Style dropdown in PropertyPanel with conditional color override controls
- Thumbnail generation via SafeSVG component (48x48px)
- Inline edit pattern with Enter/Escape keyboard handling
- Confirmation dialogs using window.confirm for destructive actions

**Primary recommendation:** Extend ManageKnobStylesDialog to ManageElementStylesDialog with category filtering. Generalize LayerMappingDialog to accept ElementCategory parameter for different layer sets. Add style dropdown to all element PropertyPanel components using the KnobProperties pattern (lines 23-52, 56-91). Implement SVG preview hover highlighting with CSS filter or opacity effects. Use existing SafeSVG component for thumbnails and previews.

## Standard Stack

The established tools are already in use:

### Core Components
| Component | Location | Purpose | Why Standard |
|-----------|----------|---------|--------------|
| React | 18.3+ | UI framework | Component-based dialog architecture |
| TypeScript | ~5.6.2 | Type safety | ElementStyle discriminated unions |
| Zustand | ^5.0.2 | State management | elementStyles slice, getStylesByCategory |
| react-hot-toast | ^2.4.1 | User feedback | Success/error notifications |
| SafeSVG | components/SafeSVG | SVG rendering | Sanitized preview display |

### Dialog Patterns
| Pattern | Source | Purpose | When to Use |
|---------|--------|---------|-------------|
| ManageKnobStylesDialog | dialogs/ManageKnobStylesDialog.tsx | Style library management | Rename, delete, re-map actions |
| LayerMappingDialog | dialogs/LayerMappingDialog.tsx | SVG layer assignment | Import with auto-detection |
| UnsavedChangesDialog | dialogs/UnsavedChangesDialog.tsx | Confirmation pattern | Destructive actions |
| InlineEditName | AssetLibrary/InlineEditName.tsx | Inline rename UI | Edit in place |

### Store Integration
| Slice | Actions | Purpose | Phase Created |
|-------|---------|---------|---------------|
| elementStylesSlice | addElementStyle, removeElementStyle, updateElementStyle | Style CRUD | Phase 53 |
| elementStylesSlice | getElementStyle, getStylesByCategory | Style queries | Phase 53 |
| knobStylesSlice | (legacy) | Backward compatibility | Phase 53 |

### UI Utilities
| Utility | Location | Purpose | Performance |
|---------|----------|---------|-------------|
| SafeSVG | components/SafeSVG.tsx | Sanitized SVG display | DOMPurify wrapper |
| sanitizeSVG | lib/svg-sanitizer.ts | XSS prevention | DOMPurify 3.x |
| detectLayersForType | services/svgLayerDetection.ts | Auto-detection | Pattern matching |
| extractElementLayer | services/elementLayers.ts | Layer extraction | DOM manipulation |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| window.confirm | Custom modal | window.confirm is instant, accessible, consistent with OS, no extra component |
| Category tabs | Search/filter | Tabs require more vertical space, filter is more flexible for large style libraries |
| Hover → highlight SVG | Click → highlight | Hover provides instant feedback, no state management, less cognitive load |
| SafeSVG thumbnails | Canvas-rendered images | SafeSVG keeps vector quality at all sizes, no pre-generation needed |
| Inline edit name | Modal input | Inline edit is faster, fewer clicks, matches AssetLibrary pattern |

**Installation:**
No new dependencies required. All infrastructure from Phase 53 style system.

## Architecture Patterns

### Recommended Component Structure
```
src/
├── components/
│   ├── dialogs/
│   │   ├── ManageKnobStylesDialog.tsx          # EXISTING: Model for style management
│   │   ├── ManageElementStylesDialog.tsx       # NEW: Generalized with category filter
│   │   ├── LayerMappingDialog.tsx              # UPDATE: Accept ElementCategory parameter
│   │   └── ElementLayerMappingDialog.tsx       # NEW: Category-specific layer mapping
│   └── Properties/
│       ├── KnobProperties.tsx                  # EXISTING: Model for style dropdown
│       ├── SliderProperties.tsx                # UPDATE: Add style dropdown
│       ├── ButtonProperties.tsx                # UPDATE: Add style dropdown
│       ├── MeterProperties.tsx                 # UPDATE: Add style dropdown
│       └── shared/
│           └── ElementStyleSection.tsx         # NEW: Reusable style dropdown component
```

### Pattern 1: ManageElementStylesDialog (Category Filtering)
**What:** Generalized style management dialog with category-based filtering
**When to use:** "Manage..." option in any element's style dropdown
**Example:**
```typescript
// Source: ManageKnobStylesDialog.tsx (lines 1-164) + category filtering
// Extends to: All element categories (rotary, linear, arc, button, meter)

interface ManageElementStylesDialogProps {
  isOpen: boolean
  onClose: () => void
  category: ElementCategory  // Filter styles by category
}

export function ManageElementStylesDialog({ isOpen, onClose, category }: ManageElementStylesDialogProps) {
  const elementStyles = useStore((state) => state.elementStyles)
  const elements = useStore((state) => state.elements)
  const removeElementStyle = useStore((state) => state.removeElementStyle)
  const updateElementStyle = useStore((state) => state.updateElementStyle)

  const [showImport, setShowImport] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  // Filter styles by category (rotary, linear, arc, button, meter)
  const categoryStyles = elementStyles.filter((style) => style.category === category)

  // Count how many elements use a style
  const getStyleUsage = (styleId: string): number => {
    return elements.filter(
      (el) => 'styleId' in el && el.styleId === styleId
    ).length
  }

  // Handle delete with usage check and confirmation
  const handleDelete = (styleId: string, styleName: string) => {
    const usage = getStyleUsage(styleId)
    const confirmMsg = usage > 0
      ? `"${styleName}" is used by ${usage} element${usage > 1 ? 's' : ''}. Delete anyway? Elements will revert to default style.`
      : `Delete style "${styleName}"?`

    if (!window.confirm(confirmMsg)) return

    removeElementStyle(styleId)
    toast.success(`Deleted style "${styleName}"`)
  }

  // Inline rename pattern (Enter to save, Escape to cancel)
  const handleStartRename = (styleId: string, currentName: string) => {
    setEditingId(styleId)
    setEditName(currentName)
  }

  const handleSaveRename = () => {
    if (editingId && editName.trim()) {
      updateElementStyle(editingId, { name: editName.trim() })
      toast.success('Style renamed')
    }
    setEditingId(null)
    setEditName('')
  }

  // Re-map layers: opens LayerMappingDialog with existing style data
  const handleRemapLayers = (styleId: string) => {
    // Implementation: Open ElementLayerMappingDialog with pre-populated data
    toast('Re-mapping layers...', { icon: '🔄' })
  }

  if (!isOpen) return null

  return (
    <>
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Manage {category.charAt(0).toUpperCase() + category.slice(1)} Styles</h2>

          {/* Import New Style Button */}
          <button
            onClick={() => setShowImport(true)}
            className="w-full mb-4 bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2 flex items-center justify-center gap-2"
          >
            <span>+</span>
            <span>Import New {category.charAt(0).toUpperCase() + category.slice(1)} Style</span>
          </button>

          {/* Styles List (compact with thumbnails) */}
          {categoryStyles.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No {category} styles yet. Import one to get started.
            </p>
          ) : (
            <div className="space-y-2">
              {categoryStyles.map((style) => {
                const usage = getStyleUsage(style.id)
                const isEditing = editingId === style.id

                return (
                  <div key={style.id} className="flex items-center gap-3 bg-gray-700 p-3 rounded">
                    {/* Thumbnail preview (48x48) */}
                    <div className="w-12 h-12 flex-shrink-0 bg-gray-900 rounded">
                      <SafeSVG
                        content={style.svgContent}
                        style={{ width: '100%', height: '100%' }}
                      />
                    </div>

                    {/* Name and info */}
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSaveRename()
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          onBlur={handleSaveRename}
                          autoFocus
                          className="bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm w-full"
                        />
                      ) : (
                        <div className="font-medium text-white truncate">{style.name}</div>
                      )}
                      <div className="text-xs text-gray-400">
                        {usage > 0 && `Used by ${usage} element${usage > 1 ? 's' : ''}`}
                        {usage === 0 && 'Not in use'}
                      </div>
                    </div>

                    {/* Actions */}
                    {!isEditing && (
                      <div className="flex gap-2 flex-shrink-0">
                        <button
                          onClick={() => handleStartRename(style.id, style.name)}
                          className="text-blue-400 hover:text-blue-300 text-sm px-2 py-1"
                          title="Rename style"
                        >
                          Rename
                        </button>
                        <button
                          onClick={() => handleRemapLayers(style.id)}
                          className="text-purple-400 hover:text-purple-300 text-sm px-2 py-1"
                          title="Re-map SVG layers"
                        >
                          Re-map
                        </button>
                        <button
                          onClick={() => handleDelete(style.id, style.name)}
                          className="text-red-400 hover:text-red-300 text-sm px-2 py-1"
                          title="Delete style"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white rounded px-4 py-2"
          >
            Close
          </button>
        </div>
      </div>

      {/* Import dialog (nested) */}
      <ElementLayerMappingDialog
        isOpen={showImport}
        onClose={() => setShowImport(false)}
        category={category}
      />
    </>
  )
}
```

### Pattern 2: ElementLayerMappingDialog (Category-Specific Layers)
**What:** SVG layer mapping dialog with auto-detection, table + preview layout, hover highlighting
**When to use:** Import SVG for any element category
**Example:**
```typescript
// Source: LayerMappingDialog.tsx (lines 1-379) + category-specific layer roles
// Extends to: All element categories with their specific layer roles

interface ElementLayerMappingDialogProps {
  isOpen: boolean
  onClose: () => void
  category: ElementCategory
  existingStyle?: ElementStyle  // For re-mapping
}

export function ElementLayerMappingDialog({ isOpen, onClose, category, existingStyle }: ElementLayerMappingDialogProps) {
  const addElementStyle = useStore((state) => state.addElementStyle)

  const [step, setStep] = useState<'upload' | 'mapping' | 'config'>('upload')
  const [svgContent, setSvgContent] = useState<string>('')
  const [styleName, setStyleName] = useState<string>('')
  const [mappings, setMappings] = useState<Record<string, string>>({})
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null)

  // Category-specific configuration (angles for rotary/arc)
  const [minAngle, setMinAngle] = useState(-135)
  const [maxAngle, setMaxAngle] = useState(135)

  // Get layer roles for category
  const getLayerRoles = (cat: ElementCategory): string[] => {
    switch (cat) {
      case 'rotary': return ['indicator', 'track', 'arc', 'glow', 'shadow']
      case 'linear': return ['thumb', 'track', 'fill']
      case 'arc': return ['thumb', 'track', 'fill', 'arc']
      case 'button': return ['normal', 'pressed', 'icon', 'label', 'on', 'off', 'indicator', 'led', 'position-0', 'position-1', 'position-2', 'base', 'selector', 'highlight']
      case 'meter': return ['body', 'fill', 'fill-green', 'fill-yellow', 'fill-red', 'scale', 'peak']
      default: return []
    }
  }

  // Get required roles (must be mapped to save)
  const getRequiredRoles = (cat: ElementCategory): string[] => {
    switch (cat) {
      case 'rotary': return ['indicator']
      case 'linear': return ['thumb']
      case 'arc': return ['thumb']
      case 'button': return ['normal']  // At minimum, normal state
      case 'meter': return ['body']      // At minimum, body
      default: return []
    }
  }

  const layerRoles = getLayerRoles(category)
  const requiredRoles = getRequiredRoles(category)

  // Auto-detect layers from SVG
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

    try {
      const content = await file.text()
      const validationResult = validateSVGContent(content)
      if (!validationResult.valid) {
        toast.error(`Invalid SVG: ${validationResult.error}`)
        return
      }

      const sanitized = sanitizeSVG(content)
      const detectedLayers = detectLayersForType(sanitized, category)

      // Initialize mappings from auto-detection
      const initialMappings: Record<string, string> = {}
      Object.entries(detectedLayers.matched).forEach(([role, identifier]) => {
        initialMappings[identifier] = role
      })

      setSvgContent(sanitized)
      setMappings(initialMappings)
      setStyleName(file.name.replace(/\.svg$/i, ''))

      const matchedCount = Object.keys(detectedLayers.matched).length
      if (matchedCount > 0) {
        toast.success(`Auto-detected ${matchedCount} layer${matchedCount !== 1 ? 's' : ''}`, { duration: 3000 })
      }

      setStep('mapping')
    } catch (error) {
      toast.error('Failed to read SVG file')
    }
  }, [category])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/svg+xml': ['.svg'] },
    multiple: false,
  })

  // Validation: all required roles must be mapped
  const hasAllRequired = requiredRoles.every((role) =>
    Object.values(mappings).includes(role)
  )

  // Handle save
  const handleCreate = () => {
    if (!styleName.trim()) {
      toast.error('Please enter a style name')
      return
    }

    if (!hasAllRequired) {
      toast.error(`All required roles must be mapped: ${requiredRoles.join(', ')}`)
      return
    }

    // Build layers object from mappings
    const layers: Record<string, string> = {}
    Object.entries(mappings).forEach(([identifier, role]) => {
      if (!layers[role]) {
        layers[role] = identifier
      }
    })

    // Add style based on category
    const baseStyle = {
      name: styleName.trim(),
      svgContent,
      layers,
    }

    if (category === 'rotary' || category === 'arc') {
      addElementStyle({ ...baseStyle, category, minAngle, maxAngle })
    } else {
      addElementStyle({ ...baseStyle, category })
    }

    toast.success(`${category} style "${styleName}" created`)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {step === 'upload' && `Import ${category.charAt(0).toUpperCase() + category.slice(1)} Design`}
          {step === 'mapping' && 'Map Layers'}
          {step === 'config' && 'Configure Style'}
        </h2>

        {/* Step 1: Upload (same as LayerMappingDialog) */}
        {step === 'upload' && (
          <div {...getRootProps()} className={/* dropzone styles */}>
            <input {...getInputProps()} />
            <p>Drag & drop SVG file or click to browse</p>
          </div>
        )}

        {/* Step 2: Layer Mapping with Hover Highlighting */}
        {step === 'mapping' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Left: SVG Preview with hover highlight */}
            <div className="bg-gray-900 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Preview</p>
              <div className="w-full aspect-square relative">
                <SafeSVG
                  content={svgContent}
                  style={{
                    width: '100%',
                    height: '100%',
                    filter: hoveredLayer ? `drop-shadow(0 0 4px rgba(59, 130, 246, 0.6))` : 'none'
                  }}
                />
                {/* Highlight layer on hover (implemented via CSS or JS manipulation) */}
              </div>
            </div>

            {/* Right: Layer Mapping Table */}
            <div>
              <p className="text-sm text-gray-400 mb-2">Layer Assignments</p>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-2 text-gray-400">Role</th>
                      <th className="text-left py-2 text-gray-400">Detected Layer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {layerRoles.map((role) => {
                      const isRequired = requiredRoles.includes(role)
                      const assignedLayer = Object.entries(mappings).find(
                        ([_, r]) => r === role
                      )?.[0] || ''

                      return (
                        <tr
                          key={role}
                          className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors"
                          onMouseEnter={() => setHoveredLayer(assignedLayer)}
                          onMouseLeave={() => setHoveredLayer(null)}
                        >
                          <td className="py-2">
                            <span className="capitalize">{role}</span>
                            {isRequired && <span className="text-red-400 ml-1">*</span>}
                          </td>
                          <td className="py-2">
                            <select
                              value={assignedLayer}
                              onChange={(e) => {
                                const newMappings = { ...mappings }
                                // Remove old mapping for this role
                                Object.keys(newMappings).forEach((key) => {
                                  if (newMappings[key] === role) delete newMappings[key]
                                })
                                // Add new mapping
                                if (e.target.value) {
                                  newMappings[e.target.value] = role
                                }
                                setMappings(newMappings)
                              }}
                              className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm w-full"
                            >
                              <option value="">(none)</option>
                              {/* List all identifiers from SVG */}
                              {Object.keys(mappings).map((id) => (
                                <option key={id} value={id}>{id}</option>
                              ))}
                            </select>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                <span className="text-red-400">*</span> Required roles
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex gap-2 mt-4">
          <button onClick={onClose} className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded px-4 py-2">
            Cancel
          </button>
          {step === 'mapping' && (
            <button
              onClick={() => setStep('config')}
              disabled={!hasAllRequired}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded px-4 py-2"
            >
              Next
            </button>
          )}
          {step === 'config' && (
            <button
              onClick={handleCreate}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
            >
              Create Style
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
```

### Pattern 3: PropertyPanel Style Dropdown with Thumbnails
**What:** Style dropdown showing thumbnail + name, color override controls below
**When to use:** All element PropertyPanel components for styled categories
**Example:**
```typescript
// Source: KnobProperties.tsx (lines 23-52, 56-91)
// Reusable component pattern for all element types

interface ElementStyleSectionProps {
  element: ElementConfig & { styleId?: string; colorOverrides?: ColorOverrides }
  category: ElementCategory
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function ElementStyleSection({ element, category, onUpdate }: ElementStyleSectionProps) {
  const [showManageDialog, setShowManageDialog] = useState(false)
  const getStylesByCategory = useStore((state) => state.getStylesByCategory)
  const getElementStyle = useStore((state) => state.getElementStyle)
  const { isPro } = useLicense()

  const categoryStyles = getStylesByCategory(category)
  const selectedStyle = element.styleId ? getElementStyle(element.styleId) : null

  if (!isPro) return null

  return (
    <>
      <PropertySection title={`${category.charAt(0).toUpperCase() + category.slice(1)} Style`}>
        {/* Style Dropdown with Thumbnails */}
        <div>
          <label className="block text-xs text-gray-400 mb-1">Style</label>
          <select
            value={element.styleId || ''}
            onChange={(e) => {
              const value = e.target.value
              onUpdate({
                styleId: value === '' ? undefined : value,
                colorOverrides: undefined  // Reset overrides when changing style
              })
            }}
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="">Default</option>
            {categoryStyles.map((style) => (
              <option key={style.id} value={style.id}>
                {style.name}
              </option>
            ))}
          </select>
        </div>

        {/* Manage Button */}
        <button
          onClick={() => setShowManageDialog(true)}
          className="w-full text-left text-sm text-blue-400 hover:text-blue-300 mt-1"
        >
          Manage styles...
        </button>

        {/* Thumbnail Preview (when style selected) */}
        {selectedStyle && (
          <div className="mt-2 p-2 bg-gray-900 rounded">
            <div className="w-16 h-16 mx-auto">
              <SafeSVG
                content={selectedStyle.svgContent}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
            <p className="text-xs text-gray-400 text-center mt-1">{selectedStyle.name}</p>
          </div>
        )}
      </PropertySection>

      {/* Color Overrides (only when style selected) */}
      {element.styleId && selectedStyle && (() => {
        const layerRoles = Object.keys(selectedStyle.layers)
        if (layerRoles.length === 0) return null

        return (
          <PropertySection title="Color Overrides">
            {layerRoles.map((role) => (
              <ColorInput
                key={role}
                label={role.charAt(0).toUpperCase() + role.slice(1)}
                value={element.colorOverrides?.[role] || ''}
                onChange={(color) => {
                  const newOverrides = { ...element.colorOverrides }
                  if (color) {
                    newOverrides[role] = color
                  } else {
                    delete newOverrides[role]
                  }
                  onUpdate({ colorOverrides: newOverrides })
                }}
              />
            ))}
            <button
              onClick={() => onUpdate({ colorOverrides: undefined })}
              className="w-full text-left text-sm text-red-400 hover:text-red-300 mt-1"
            >
              Reset to Original Colors
            </button>
          </PropertySection>
        )
      })()}

      {/* Manage Dialog */}
      <ManageElementStylesDialog
        isOpen={showManageDialog}
        onClose={() => setShowManageDialog(false)}
        category={category}
      />
    </>
  )
}
```

### Pattern 4: SVG Layer Hover Highlighting
**What:** Visual feedback highlighting SVG layer when hovering table row
**When to use:** LayerMappingDialog table row hover
**Example:**
```typescript
// Approach 1: CSS filter on entire SVG (simple, less precise)
<SafeSVG
  content={svgContent}
  style={{
    filter: hoveredLayer ? 'brightness(1.2) drop-shadow(0 0 4px rgba(59, 130, 246, 0.6))' : 'none',
    transition: 'filter 0.15s ease-out'
  }}
/>

// Approach 2: DOM manipulation to highlight specific layer (more precise)
useEffect(() => {
  if (!hoveredLayer || !svgRef.current) return

  const svgEl = svgRef.current.querySelector('svg')
  if (!svgEl) return

  // Find layer by id or class
  const layerEl = svgEl.querySelector(`#${hoveredLayer}, .${hoveredLayer}`)
  if (layerEl) {
    // Store original opacity
    const originalOpacity = layerEl.style.opacity || '1'

    // Highlight: increase opacity and add glow
    layerEl.style.opacity = '1'
    layerEl.style.filter = 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.8))'

    return () => {
      // Restore on unhover
      layerEl.style.opacity = originalOpacity
      layerEl.style.filter = 'none'
    }
  }
}, [hoveredLayer])

// Approach 3: Dim all other layers (highest contrast)
useEffect(() => {
  if (!hoveredLayer || !svgRef.current) return

  const svgEl = svgRef.current.querySelector('svg')
  if (!svgEl) return

  const allLayers = Array.from(svgEl.querySelectorAll('[id], [class]'))
  allLayers.forEach((layer) => {
    const isHovered = layer.id === hoveredLayer || layer.classList.contains(hoveredLayer)
    layer.style.opacity = isHovered ? '1' : '0.3'
  })

  return () => {
    allLayers.forEach((layer) => {
      layer.style.opacity = '1'
    })
  }
}, [hoveredLayer])
```

### Anti-Patterns to Avoid
- **Custom dropdown with thumbnails in options:** HTML `<option>` doesn't support images, use text-only dropdown with preview below
- **Modal inside modal without z-index management:** Nested modals need z-50 for parent, z-60 for child, or use React Portal
- **Deleting style without usage check:** Always check element usage before delete, show count in confirmation
- **Forgetting to reset colorOverrides when changing style:** Overrides from previous style don't apply to new style
- **Layer hover highlighting all elements:** Only highlight the specific SVG layer identifier, not entire SVG
- **Missing required role validation:** Can't save until all required roles have layer assignments

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Dialog backdrop overlay | Custom div with onClick | Fixed inset-0 with bg-black/50 | Standard pattern, accessibility |
| SVG thumbnail rendering | Canvas API rasterization | SafeSVG component | Vector quality, already sanitized |
| Inline edit keyboard handling | Custom hooks | Enter/Escape pattern from InlineEditName | Consistent UX |
| Style category filtering | Client-side search | getStylesByCategory selector | Zustand memoization, efficient |
| Delete confirmation UI | Custom modal | window.confirm | Instant, accessible, OS-native |
| Layer auto-detection | Regex layer parsing | detectLayersForType service | Handles all conventions |
| Color override UI | Custom color picker | ColorInput component | Consistent with existing properties |
| Dropdown option rendering | Custom select with images | Text + thumbnail preview below | HTML limitations, simpler |

**Key insight:** Phase 53 established the dialog and style management patterns for knobs. Extend these exact patterns to other categories rather than inventing new UI flows. The ManageKnobStylesDialog and LayerMappingDialog provide the complete architecture - just add category filtering and generalize layer role handling.

## Common Pitfalls

### Pitfall 1: Missing Category Validation in ManageDialog
**What goes wrong:** Dialog shows styles from wrong category (e.g., button styles in slider dialog)
**Why it happens:** Not filtering elementStyles by category parameter
**How to avoid:**
```typescript
const categoryStyles = elementStyles.filter((style) => style.category === category)
```
**Warning signs:** Seeing "knob" styles in slider manage dialog, wrong layer roles shown

### Pitfall 2: Color Override Not Cleared When Changing Style
**What goes wrong:** Color overrides from previous style persist, cause errors or wrong colors
**Why it happens:** Not resetting colorOverrides on styleId change
**How to avoid:**
```typescript
onUpdate({
  styleId: value === '' ? undefined : value,
  colorOverrides: undefined  // Always reset
})
```
**Warning signs:** TypeScript errors accessing undefined layer roles, colors don't match new style

### Pitfall 3: Delete Without Usage Confirmation
**What goes wrong:** User deletes style in use, elements unexpectedly revert to default
**Why it happens:** No usage check before deletion
**How to avoid:**
```typescript
const usage = getStyleUsage(styleId)
if (usage > 0) {
  const confirmed = window.confirm(
    `"${styleName}" is used by ${usage} element${usage > 1 ? 's' : ''}. Delete anyway?`
  )
  if (!confirmed) return
}
```
**Warning signs:** Elements change appearance after style deletion, no warning given

### Pitfall 4: Layer Mapping Allows Saving Without Required Roles
**What goes wrong:** Style saved with missing indicator/thumb/etc, causes render errors
**Why it happens:** No validation that required roles are mapped
**How to avoid:**
```typescript
const requiredRoles = getRequiredRoles(category)
const hasAllRequired = requiredRoles.every((role) =>
  Object.values(mappings).includes(role)
)
// Disable save button when !hasAllRequired
```
**Warning signs:** Styled element doesn't render, missing key layer errors

### Pitfall 5: Nested Dialog Z-Index Conflicts
**What goes wrong:** Import dialog appears behind manage dialog
**Why it happens:** Both dialogs use same z-index (z-50)
**How to avoid:**
```typescript
// Parent dialog: z-50
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

// Child dialog (if nested): z-60 or use React Portal
<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
```
**Warning signs:** Can't interact with nested dialog, backdrop appears above dialog content

### Pitfall 6: Hover Highlight Affects All SVG Elements
**What goes wrong:** Hovering one row highlights entire SVG, not specific layer
**Why it happens:** Applying filter/opacity to entire SafeSVG component
**How to avoid:**
```typescript
// Query specific layer by identifier
const layerEl = svgEl.querySelector(`#${hoveredLayer}, .${hoveredLayer}`)
if (layerEl) {
  layerEl.style.filter = 'drop-shadow(0 0 2px rgba(59, 130, 246, 0.8))'
}
```
**Warning signs:** Whole SVG glows instead of individual layer, poor visual feedback

### Pitfall 7: Thumbnail Doesn't Update After Re-mapping
**What goes wrong:** Style thumbnail shows old layer configuration after re-map
**Why it happens:** SVG content cached, not re-rendered
**How to avoid:** Update style.svgContent when re-mapping layers, trigger re-render via state change
**Warning signs:** Thumbnail shows wrong layers, out of sync with actual mapping

### Pitfall 8: Import Button Opens Dialog for Wrong Category
**What goes wrong:** Importing slider style opens knob layer mapping
**Why it happens:** Not passing category parameter to LayerMappingDialog
**How to avoid:**
```typescript
<ElementLayerMappingDialog
  isOpen={showImport}
  onClose={() => setShowImport(false)}
  category={category}  // MUST pass category
/>
```
**Warning signs:** Wrong layer roles shown in mapping table, auto-detection finds wrong layers

### Pitfall 9: PropertyPanel Style Section Shows for Non-Styled Elements
**What goes wrong:** Style dropdown appears for decorative elements (rectangle, line)
**Why it happens:** Not checking if element type has a category mapping
**How to avoid:**
```typescript
const category = getCategoryForType(element.type)
if (!category) return null  // Don't show style section

// Or check in property component
{isPro && category && <ElementStyleSection ... />}
```
**Warning signs:** Style dropdown on elements that shouldn't have it, confusion

### Pitfall 10: Color Override Input Shows Deleted Layers
**What goes wrong:** Color input for "glow" layer appears even though glow was removed
**Why it happens:** Iterating all possible layer roles, not actual style layers
**How to avoid:**
```typescript
const existingLayers = Object.keys(style.layers)
// Only show color inputs for layers that exist in this style
{existingLayers.map((role) => <ColorInput ... />)}
```
**Warning signs:** Extra color inputs that don't affect anything, confusing UI

## Code Examples

Verified patterns from codebase:

### Style Dropdown in PropertyPanel
```typescript
// Source: KnobProperties.tsx (lines 23-52)
// Applies to: All styled element categories

<PropertySection title="Style">
  <div>
    <label className="block text-xs text-gray-400 mb-1">Style</label>
    <select
      value={element.styleId || ''}
      onChange={(e) => {
        const value = e.target.value
        onUpdate({
          styleId: value === '' ? undefined : value,
          colorOverrides: undefined  // Reset overrides
        })
      }}
      className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
    >
      <option value="">Default</option>
      {categoryStyles.map((style) => (
        <option key={style.id} value={style.id}>
          {style.name}
        </option>
      ))}
    </select>
  </div>
  <button
    onClick={() => setShowManageDialog(true)}
    className="w-full text-left text-sm text-blue-400 hover:text-blue-300 mt-1"
  >
    Manage styles...
  </button>
</PropertySection>
```

### Color Override Section
```typescript
// Source: KnobProperties.tsx (lines 56-91)
// Dynamic based on style's actual layers

{element.styleId && (() => {
  const style = getElementStyle(element.styleId)
  if (!style) return null

  const layerRoles = Object.keys(style.layers)
  if (layerRoles.length === 0) return null

  return (
    <PropertySection title="Color Overrides">
      {layerRoles.map((role) => (
        <ColorInput
          key={role}
          label={role.charAt(0).toUpperCase() + role.slice(1)}
          value={element.colorOverrides?.[role] || ''}
          onChange={(color) => {
            const newOverrides = { ...element.colorOverrides }
            if (color) {
              newOverrides[role] = color
            } else {
              delete newOverrides[role]
            }
            onUpdate({ colorOverrides: newOverrides })
          }}
        />
      ))}
      <button
        onClick={() => onUpdate({ colorOverrides: undefined })}
        className="w-full text-left text-sm text-red-400 hover:text-red-300 mt-1"
      >
        Reset to Original Colors
      </button>
    </PropertySection>
  )
})()}
```

### ManageDialog with Usage Check
```typescript
// Source: ManageKnobStylesDialog.tsx (lines 23-42)
// Counts elements using style before delete

const getStyleUsage = (styleId: string): number => {
  return elements.filter(
    (el) => 'styleId' in el && el.styleId === styleId
  ).length
}

const handleDelete = (styleId: string, styleName: string) => {
  const usage = getStyleUsage(styleId)
  if (usage > 0) {
    const confirmed = window.confirm(
      `"${styleName}" is used by ${usage} element${usage > 1 ? 's' : ''}. ` +
      `Delete anyway? Elements will revert to default style.`
    )
    if (!confirmed) return
  }

  removeElementStyle(styleId)
  toast.success(`Deleted style "${styleName}"`)
}
```

### Inline Edit with Keyboard Handling
```typescript
// Source: ManageKnobStylesDialog.tsx (lines 102-114)
// Enter saves, Escape cancels, blur saves

{isEditing ? (
  <input
    type="text"
    value={editName}
    onChange={(e) => setEditName(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === 'Enter') handleSaveRename()
      if (e.key === 'Escape') setEditingId(null)
    }}
    onBlur={handleSaveRename}
    autoFocus
    className="bg-gray-600 border border-gray-500 text-white rounded px-2 py-1 text-sm w-full"
  />
) : (
  <div className="font-medium text-white truncate">{style.name}</div>
)}
```

### Layer Mapping Table with Auto-Detection Indicator
```typescript
// Source: LayerMappingDialog.tsx (lines 220-254)
// Color-coded dots show auto-detected vs manual

{Object.keys(mappings).map((id) => {
  const isAutoDetected = !detected.unmapped.includes(id)
  const currentMapping = mappings[id]

  return (
    <div key={id} className="flex items-center gap-2">
      <span
        className={`w-2 h-2 rounded-full flex-shrink-0 ${
          currentMapping === 'exclude'
            ? 'bg-gray-600'
            : isAutoDetected
              ? 'bg-green-500'
              : 'bg-blue-500'
        }`}
        title={isAutoDetected ? 'Auto-detected' : 'Manually mapped'}
      />
      <span className="text-sm text-gray-300 flex-1 truncate" title={id}>
        {id}
      </span>
      <select
        value={currentMapping}
        onChange={(e) => handleMappingChange(id, e.target.value as LayerRole)}
        className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm"
      >
        {/* Layer role options */}
      </select>
    </div>
  )
})}
```

### Dialog Layout Pattern
```typescript
// Source: ManageKnobStylesDialog.tsx, LayerMappingDialog.tsx
// Standard z-50 backdrop, max-w-2xl container, max-h-[80vh] scroll

<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
  <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
    <h2 className="text-xl font-bold mb-4">Dialog Title</h2>

    {/* Content */}

    <button
      onClick={onClose}
      className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white rounded px-4 py-2"
    >
      Close
    </button>
  </div>
</div>
```

### Thumbnail Preview in List
```typescript
// Source: ManageKnobStylesDialog.tsx (lines 93-98)
// 48x48 thumbnail with SafeSVG

<div className="w-12 h-12 flex-shrink-0 bg-gray-900 rounded">
  <SafeSVG
    content={style.svgContent}
    style={{ width: '100%', height: '100%' }}
  />
</div>
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Knob-specific style system | Multi-category ElementStyle | Phase 53 | Unified style management across element types |
| Manual layer assignment only | Auto-detection with manual override | Phase 53 | Faster import workflow, fewer errors |
| No style preview in dropdown | Thumbnail + name preview | Phase 59 (current) | Easier style selection |
| Separate style managers per category | Unified ManageElementStylesDialog | Phase 59 (current) | Consistent UX, less code duplication |
| No layer hover feedback | Hover highlights layer in preview | Phase 59 (current) | Clearer visual mapping |

**Deprecated/outdated:**
- KnobStyle type separate from ElementStyle: Use ElementStyle with category: 'rotary'
- Knob-specific dialog components: Use generalized ElementLayerMappingDialog with category param
- Hard-coded knob layer roles in LayerMappingDialog: Pass layer roles based on category

## Open Questions

Things that couldn't be fully resolved:

1. **Thumbnail Rendering at Different States**
   - What we know: Static preview at default state (0% for sliders, center for knobs)
   - What's unclear: Should thumbnails show range of motion (animated GIF) or single state?
   - Recommendation: Single static state (center/0%). Animated thumbnails add complexity without clear UX benefit. Users can preview on canvas.
   - Flag for user: If animated thumbnails desired, consider SVG animation or pre-rendered sprite sheet

2. **Layer Hover Highlight Implementation**
   - What we know: Hovering table row should highlight layer in SVG preview
   - What's unclear: Best approach - CSS filter whole SVG, DOM manipulation, or dim others?
   - Recommendation: Dim all other layers (approach 3 in Pattern 4). Highest contrast, most intuitive. Falls back gracefully if layer not found.
   - Flag for research: Test with complex SVGs (many layers, nested groups)

3. **Re-map Layers Workflow**
   - What we know: "Re-map" button should allow changing layer assignments without re-importing
   - What's unclear: Open LayerMappingDialog with existing data, or inline edit in ManageDialog?
   - Recommendation: Open ElementLayerMappingDialog with existingStyle prop pre-populated. Reuses existing UI, consistent with import flow.
   - Flag for planning: Determine if style.svgContent should be updatable or immutable

4. **Entry Point 3: Element-Specific Import Button**
   - What we know: Three import paths, one is "element-specific import button in left sidebar properties"
   - What's unclear: Where exactly? PropertyPanel already has dropdown. Left sidebar = Palette?
   - Recommendation: Add import button in PropertyPanel when no styles exist for category. Shows "Import first style..." instead of dropdown.
   - Flag for discussion: Confirm "left sidebar properties" = PropertyPanel, not Palette

5. **Style Dropdown with Thumbnails in `<option>`**
   - What we know: User wants thumbnail + name in dropdown
   - What's unclear: HTML `<option>` doesn't support images
   - Recommendation: Text-only dropdown with thumbnail preview below (as shown in Pattern 3). Alternative: Custom dropdown component (react-select with custom option renderer).
   - Flag for decision: Accept text-only + preview below, or invest in custom dropdown component?

## Sources

### Primary (HIGH confidence)
- src/components/dialogs/ManageKnobStylesDialog.tsx - Complete style management pattern
- src/components/dialogs/LayerMappingDialog.tsx - Layer mapping with auto-detection
- src/components/Properties/KnobProperties.tsx - Style dropdown and color overrides in PropertyPanel
- src/types/elementStyle.ts - ElementCategory, ElementStyle discriminated unions
- src/store/elementStylesSlice.ts - State management actions and selectors
- src/components/SafeSVG.tsx - SVG rendering component
- .planning/phases/59-ui-dialogs/59-CONTEXT.md - User decisions for UI workflows
- .planning/phases/53-foundation/53-RESEARCH.md - ElementStyle architecture foundation

### Secondary (MEDIUM confidence)
- [PrimeReact Dropdown Documentation](https://primereact.org/dropdown/) - Dropdown with custom templates
- [React Grid: Row Styles | AG Grid](https://www.ag-grid.com/react-data-grid/row-styles/) - Table row hover patterns
- [Building an Accessible Modal Dialog in React](https://clhenrick.io/blog/react-a11y-modal-dialog/) - Dialog accessibility best practices
- [Dialog - Headless UI](https://headlessui.com/react/dialog) - Native HTML dialog element support
- [CSS Filters with SVGs - LogRocket](https://blog.logrocket.com/complete-guide-using-css-filters-svgs/) - SVG layer highlighting techniques
- [Highlight table row & column on hover - CodeSandbox](https://codesandbox.io/s/pwj791xkv7) - Hover highlight patterns

### Tertiary (LOW confidence)
- [React Modal Dialog Libraries 2026 | Croct Blog](https://blog.croct.com/post/best-react-modal-dialog-libraries) - Alternative libraries (not needed, existing patterns sufficient)
- [10 Best Dropdown Components For React 2026](https://reactscript.com/best-dropdown/) - Custom dropdown libraries (HTML select + preview simpler)

## Metadata

**Confidence breakdown:**
- Dialog patterns: HIGH - Existing ManageKnobStylesDialog and LayerMappingDialog provide complete patterns
- PropertyPanel integration: HIGH - KnobProperties shows exact style dropdown and color override pattern
- Store integration: HIGH - elementStylesSlice already implements all needed actions
- Layer highlighting: MEDIUM - Multiple approaches possible, need to test with real SVGs
- Thumbnail generation: HIGH - SafeSVG component already used throughout codebase

**Research date:** 2026-02-05
**Valid until:** 2026-03-05 (30 days - stable UI patterns)
