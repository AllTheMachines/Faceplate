import { useState, useCallback, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { useStore } from '../../store'
import { validateSVGContent } from '../../lib/svg-validator'
import { sanitizeSVG } from '../../lib/svg-sanitizer'
import { detectElementLayers } from '../../services/elementLayers'
import { ElementCategory, ElementStyle } from '../../types/elementStyle'
import { SafeSVG } from '../SafeSVG'

interface ElementLayerMappingDialogProps {
  isOpen: boolean
  onClose: () => void
  category: ElementCategory | null // null = user selects category first
  existingStyle?: ElementStyle // For re-mapping
}

// Category display names
const CATEGORY_NAMES: Record<ElementCategory, string> = {
  rotary: 'Rotary',
  linear: 'Linear',
  arc: 'Arc',
  button: 'Button',
  meter: 'Meter',
}

/**
 * Get layer roles for a category
 */
function getLayerRoles(category: ElementCategory): string[] {
  switch (category) {
    case 'rotary':
      return ['indicator', 'track', 'arc', 'glow', 'shadow']
    case 'linear':
      return ['thumb', 'track', 'fill']
    case 'arc':
      return ['thumb', 'track', 'fill', 'arc']
    case 'button':
      return [
        'normal',
        'pressed',
        'icon',
        'label',
        'on',
        'off',
        'indicator',
        'led',
        'position-0',
        'position-1',
        'position-2',
        'base',
        'selector',
        'highlight',
      ]
    case 'meter':
      return ['body', 'fill', 'fill-green', 'fill-yellow', 'fill-red', 'scale', 'peak']
  }
}

/**
 * Get required roles (must be mapped before save)
 */
function getRequiredRoles(category: ElementCategory): string[] {
  switch (category) {
    case 'rotary':
      return ['indicator']
    case 'linear':
      return ['thumb']
    case 'arc':
      return ['thumb']
    case 'button':
      return ['normal']
    case 'meter':
      return ['body']
  }
}

export function ElementLayerMappingDialog({
  isOpen,
  onClose,
  category: initialCategory,
  existingStyle,
}: ElementLayerMappingDialogProps) {
  const addElementStyle = useStore((state) => state.addElementStyle)
  const updateElementStyle = useStore((state) => state.updateElementStyle)

  // Dialog state
  const [step, setStep] = useState<'upload' | 'mapping' | 'config'>('upload')
  const [category, setCategory] = useState<ElementCategory | null>(initialCategory)
  const [svgContent, setSvgContent] = useState<string>('')
  const [styleName, setStyleName] = useState<string>('')
  const [mappings, setMappings] = useState<Record<string, string>>({}) // layerId -> role
  const [availableLayers, setAvailableLayers] = useState<string[]>([])
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null)
  const svgContainerRef = useRef<HTMLDivElement>(null)

  // Category-specific config (angles for rotary/arc)
  const [minAngle, setMinAngle] = useState(-135)
  const [maxAngle, setMaxAngle] = useState(135)
  const [arcRadius, setArcRadius] = useState(50)

  // Reset state when dialog opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStep('upload')
      setCategory(initialCategory)
      setSvgContent('')
      setStyleName('')
      setMappings({})
      setAvailableLayers([])
      setHoveredLayer(null)
      setMinAngle(-135)
      setMaxAngle(135)
      setArcRadius(50)
    } else if (existingStyle) {
      // Pre-populate for re-mapping
      setCategory(existingStyle.category)
      setSvgContent(existingStyle.svgContent)
      setStyleName(existingStyle.name)

      // Build mappings from existing layers
      const initialMappings: Record<string, string> = {}
      Object.entries(existingStyle.layers).forEach(([role, identifier]) => {
        if (identifier) {
          initialMappings[identifier] = role
        }
      })
      setMappings(initialMappings)
      setAvailableLayers(Object.keys(initialMappings))

      // Set angles if rotary/arc
      if (existingStyle.category === 'rotary' || existingStyle.category === 'arc') {
        setMinAngle(existingStyle.minAngle)
        setMaxAngle(existingStyle.maxAngle)
      }
      if (existingStyle.category === 'arc') {
        setArcRadius(existingStyle.arcRadius)
      }

      setStep('mapping')
    }
  }, [isOpen, initialCategory, existingStyle])

  // File upload handling
  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
      if (!file) return

      if (!category) {
        toast.error('Please select a category first')
        return
      }

      try {
        const content = await file.text()

        // Validate SVG
        const validationResult = validateSVGContent(content)
        if (!validationResult.valid) {
          toast.error(`Invalid SVG: ${validationResult.error}`)
          return
        }

        // Sanitize SVG
        const sanitized = sanitizeSVG(content)

        // Detect layers for this category
        const detectedLayers = detectElementLayers(sanitized, category)

        // Build initial mappings from auto-detection
        const initialMappings: Record<string, string> = {}
        const allLayerIds: string[] = []

        Object.entries(detectedLayers).forEach(([role, identifiers]) => {
          identifiers.forEach((id: string) => {
            if (!allLayerIds.includes(id)) {
              allLayerIds.push(id)
            }
            // Auto-assign first detected identifier for each role
            if (!initialMappings[id]) {
              initialMappings[id] = role
            }
          })
        })

        setSvgContent(sanitized)
        setMappings(initialMappings)
        setAvailableLayers(allLayerIds)
        setStyleName(file.name.replace(/\.svg$/i, ''))

        // Show detection summary
        const matchedCount = Object.keys(initialMappings).length
        if (matchedCount > 0) {
          toast.success(
            `Auto-detected ${matchedCount} layer${matchedCount !== 1 ? 's' : ''}`,
            { duration: 3000 }
          )
        } else if (allLayerIds.length > 0) {
          toast(
            `Found ${allLayerIds.length} layer${allLayerIds.length !== 1 ? 's' : ''} - please map them manually`,
            { icon: '📋', duration: 3000 }
          )
        }

        setStep('mapping')
      } catch (error) {
        toast.error('Failed to read SVG file')
      }
    },
    [category]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/svg+xml': ['.svg'] },
    multiple: false,
  })

  // Validation: all required roles must be mapped
  const hasAllRequired = category
    ? getRequiredRoles(category).every((role) => Object.values(mappings).includes(role))
    : false

  // Handle mapping change
  const handleMappingChange = (role: string, layerId: string) => {
    const newMappings = { ...mappings }

    // Remove old mapping for this role
    Object.keys(newMappings).forEach((key) => {
      if (newMappings[key] === role) {
        delete newMappings[key]
      }
    })

    // Add new mapping if not (none)
    if (layerId) {
      newMappings[layerId] = role
    }

    setMappings(newMappings)
  }

  // Build layers object from mappings (role -> identifier)
  const buildLayers = (): Record<string, string> => {
    const layers: Record<string, string> = {}
    Object.entries(mappings).forEach(([identifier, role]) => {
      if (!layers[role]) {
        layers[role] = identifier
      }
    })
    return layers
  }

  // Handle save
  const handleCreate = () => {
    if (!category) {
      toast.error('Please select a category')
      return
    }

    if (!styleName.trim()) {
      toast.error('Please enter a style name')
      return
    }

    if (!hasAllRequired) {
      const requiredRoles = getRequiredRoles(category)
      toast.error(`All required roles must be mapped: ${requiredRoles.join(', ')}`)
      return
    }

    const layers = buildLayers()

    // Build style object based on category
    const baseStyle = {
      name: styleName.trim(),
      svgContent,
      layers,
    }

    if (existingStyle) {
      // Update existing style
      updateElementStyle(existingStyle.id, baseStyle)
      toast.success(`Style "${styleName}" updated`)
    } else {
      // Create new style
      if (category === 'rotary') {
        addElementStyle({ ...baseStyle, category, minAngle, maxAngle })
      } else if (category === 'arc') {
        addElementStyle({ ...baseStyle, category, minAngle, maxAngle, arcRadius })
      } else {
        addElementStyle({ ...baseStyle, category })
      }
      toast.success(`${CATEGORY_NAMES[category]} style "${styleName}" created`)
    }

    onClose()
  }

  // SVG layer hover highlighting (dim others approach)
  useEffect(() => {
    if (!svgContainerRef.current || !hoveredLayer) return

    const svg = svgContainerRef.current.querySelector('svg')
    if (!svg) return

    // Get all elements with id or class
    const allLayers = Array.from(svg.querySelectorAll('[id], [class]'))

    // Dim all except hovered
    allLayers.forEach((el) => {
      const isHovered = el.id === hoveredLayer || el.classList.contains(hoveredLayer)
      ;(el as HTMLElement).style.opacity = isHovered ? '1' : '0.3'
    })

    return () => {
      // Cleanup: reset all to full opacity
      allLayers.forEach((el) => {
        ;(el as HTMLElement).style.opacity = '1'
      })
    }
  }, [hoveredLayer])

  if (!isOpen) return null

  const layerRoles = category ? getLayerRoles(category) : []
  const requiredRoles = category ? getRequiredRoles(category) : []
  const categoryName = category ? CATEGORY_NAMES[category] : ''

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-60">
      <div className="bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {step === 'upload' && `Import ${categoryName || 'Element'} Design`}
          {step === 'mapping' && 'Map Layers'}
          {step === 'config' && 'Configure Style'}
        </h2>

        {/* Step 1: Upload (with category selection if needed) */}
        {step === 'upload' && (
          <>
            {!initialCategory && (
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">Element Category</label>
                <select
                  value={category || ''}
                  onChange={(e) => setCategory(e.target.value as ElementCategory)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2"
                >
                  <option value="">Select category...</option>
                  <option value="rotary">Rotary (Knobs)</option>
                  <option value="linear">Linear (Sliders)</option>
                  <option value="arc">Arc (Arc Sliders)</option>
                  <option value="button">Button (Buttons, Switches)</option>
                  <option value="meter">Meter (Level Meters)</option>
                </select>
              </div>
            )}

            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
                transition-colors
                ${
                  isDragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }
                ${!category ? 'opacity-50 pointer-events-none' : ''}
              `}
            >
              <input {...getInputProps()} />
              <div className="text-gray-400">
                <p className="mb-2">
                  {category
                    ? 'Drag & drop an SVG file here'
                    : 'Select a category first'}
                </p>
                {category && <p className="text-sm">or click to browse</p>}
              </div>
            </div>
          </>
        )}

        {/* Step 2: Layer Mapping */}
        {step === 'mapping' && category && (
          <>
            <div className="grid grid-cols-2 gap-6 mb-4">
              {/* Left: SVG Preview with hover highlight */}
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Preview</p>
                <div className="w-full aspect-square relative" ref={svgContainerRef}>
                  <SafeSVG
                    content={svgContent}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Hover a role to highlight its layer
                </p>
              </div>

              {/* Right: Layer Mapping Table */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Layer Assignments</p>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 text-gray-400 font-normal">Role</th>
                        <th className="text-left py-2 text-gray-400 font-normal">Layer</th>
                      </tr>
                    </thead>
                    <tbody>
                      {layerRoles.map((role) => {
                        const isRequired = requiredRoles.includes(role)
                        const assignedLayer =
                          Object.entries(mappings).find(([_, r]) => r === role)?.[0] || ''

                        return (
                          <tr
                            key={role}
                            className="border-b border-gray-700 hover:bg-gray-700/50 transition-colors cursor-pointer"
                            onMouseEnter={() => assignedLayer && setHoveredLayer(assignedLayer)}
                            onMouseLeave={() => setHoveredLayer(null)}
                          >
                            <td className="py-2">
                              <span className="capitalize">{role}</span>
                              {isRequired && (
                                <span className="text-red-400 ml-1" title="Required">
                                  *
                                </span>
                              )}
                            </td>
                            <td className="py-2">
                              <select
                                value={assignedLayer}
                                onChange={(e) => handleMappingChange(role, e.target.value)}
                                className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm w-full"
                              >
                                <option value="">(none)</option>
                                {availableLayers.map((id) => (
                                  <option key={id} value={id}>
                                    {id}
                                  </option>
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
                  <span className="text-red-400">*</span> Required roles must be assigned
                </p>
              </div>
            </div>

            {/* Validation feedback */}
            {!hasAllRequired && (
              <div className="p-3 rounded mb-4 bg-amber-900/30 border border-amber-700">
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">⚠</span>
                  <span className="text-sm text-amber-400">
                    Required roles must be mapped: {requiredRoles.join(', ')}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              {!existingStyle && (
                <button
                  onClick={() => setStep('upload')}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded px-4 py-2"
                >
                  Back
                </button>
              )}
              <button
                onClick={() => {
                  if (category === 'rotary' || category === 'arc') {
                    setStep('config')
                  } else {
                    handleCreate()
                  }
                }}
                disabled={!hasAllRequired}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded px-4 py-2"
              >
                {category === 'rotary' || category === 'arc' ? 'Next' : 'Save'}
              </button>
            </div>
          </>
        )}

        {/* Step 3: Configuration (for rotary/arc only) */}
        {step === 'config' && (category === 'rotary' || category === 'arc') && (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Style Name</label>
                <input
                  type="text"
                  value={styleName}
                  onChange={(e) => setStyleName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2"
                  placeholder={`My ${categoryName} Style`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Min Angle (°)</label>
                  <input
                    type="number"
                    value={minAngle}
                    onChange={(e) => setMinAngle(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Max Angle (°)</label>
                  <input
                    type="number"
                    value={maxAngle}
                    onChange={(e) => setMaxAngle(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2"
                  />
                </div>
              </div>

              {category === 'arc' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Arc Radius</label>
                  <input
                    type="number"
                    value={arcRadius}
                    onChange={(e) => setArcRadius(Number(e.target.value))}
                    className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2"
                  />
                </div>
              )}

              <p className="text-sm text-gray-500">
                Rotation range: {maxAngle - minAngle}° (Default: 270° from -135° to +135°)
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep('mapping')}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white rounded px-4 py-2"
              >
                Back
              </button>
              <button
                onClick={handleCreate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded px-4 py-2"
              >
                {existingStyle ? 'Update Style' : 'Create Style'}
              </button>
            </div>
          </>
        )}

        {/* Cancel button */}
        <button
          onClick={onClose}
          className="w-full mt-4 bg-gray-700 hover:bg-gray-600 text-white rounded px-4 py-2"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
