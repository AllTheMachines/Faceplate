import { useState, useCallback, useEffect, useRef } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { useStore } from '../../store'
import { validateSVGContent } from '../../lib/svg-validator'
import { sanitizeSVG } from '../../lib/svg-sanitizer'
import { detectKnobLayers, getSuggestedLayers, DetectedLayers } from '../../services/knobLayers'
import { KnobStyleLayers, KnobStyle } from '../../types/knobStyle'
import { SafeSVG } from '../SafeSVG'

// Validation summary for user feedback
interface ValidationSummary {
  matchedCount: number
  unmappedCount: number
  hasIndicator: boolean
}

interface LayerMappingDialogProps {
  isOpen: boolean
  onClose: () => void
  existingStyle?: KnobStyle  // For re-mapping
}

type LayerRole = 'indicator' | 'track' | 'arc' | 'glow' | 'shadow' | 'exclude'

export function LayerMappingDialog({ isOpen, onClose, existingStyle }: LayerMappingDialogProps) {
  const addKnobStyle = useStore((state) => state.addKnobStyle)
  const updateKnobStyle = useStore((state) => state.updateKnobStyle)

  // Dialog state
  const [step, setStep] = useState<'upload' | 'mapping' | 'config'>('upload')
  const [svgContent, setSvgContent] = useState<string>('')
  const [styleName, setStyleName] = useState<string>('')
  const [detected, setDetected] = useState<DetectedLayers | null>(null)
  const [mappings, setMappings] = useState<Record<string, LayerRole>>({})
  const [minAngle, setMinAngle] = useState(-135)
  const [maxAngle, setMaxAngle] = useState(135)
  const [hoveredLayer, setHoveredLayer] = useState<string | null>(null)
  const svgContainerRef = useRef<HTMLDivElement>(null)

  // Reset state when dialog opens/closes, or pre-populate for re-mapping
  useEffect(() => {
    if (!isOpen) {
      setStep('upload')
      setSvgContent('')
      setStyleName('')
      setDetected(null)
      setMappings({})
      setMinAngle(-135)
      setMaxAngle(135)
      setHoveredLayer(null)
    } else if (existingStyle) {
      // Pre-populate for re-mapping
      setSvgContent(existingStyle.svgContent)
      setStyleName(existingStyle.name)
      setMinAngle(existingStyle.minAngle)
      setMaxAngle(existingStyle.maxAngle)

      // Detect layers from existing SVG
      const detectedLayers = detectKnobLayers(existingStyle.svgContent)
      setDetected(detectedLayers)

      // Build mappings from existing layers
      const initialMappings: Record<string, LayerRole> = {}
      const allIdentifiers = [
        ...detectedLayers.indicator,
        ...detectedLayers.track,
        ...detectedLayers.arc,
        ...detectedLayers.glow,
        ...detectedLayers.shadow,
        ...detectedLayers.unmapped,
      ]

      // First set all to exclude
      allIdentifiers.forEach((id) => {
        initialMappings[id] = 'exclude'
      })

      // Then map from existing style layers
      if (existingStyle.layers) {
        Object.entries(existingStyle.layers).forEach(([role, identifier]) => {
          if (identifier && allIdentifiers.includes(identifier)) {
            initialMappings[identifier] = role as LayerRole
          }
        })
      }

      setMappings(initialMappings)
      setStep('mapping')
    }
  }, [isOpen, existingStyle])

  // SVG layer hover highlighting
  useEffect(() => {
    if (!svgContainerRef.current || !hoveredLayer) return

    const svg = svgContainerRef.current.querySelector('svg')
    if (!svg) return

    // Find the hovered element by id or class
    let hoveredEl = svg.querySelector(`#${CSS.escape(hoveredLayer)}`)
    if (!hoveredEl) {
      hoveredEl = svg.querySelector(`.${CSS.escape(hoveredLayer)}`)
    }

    if (!hoveredEl) return

    // Add highlight effect - bright outline + glow
    const svgEl = hoveredEl as SVGElement
    const originalStroke = svgEl.style.stroke
    const originalStrokeWidth = svgEl.style.strokeWidth
    const originalFilter = svgEl.style.filter

    svgEl.style.stroke = '#00ff00'
    svgEl.style.strokeWidth = '3'
    svgEl.style.filter = 'drop-shadow(0 0 6px #00ff00)'

    // Dim other layers
    const allLayers = Array.from(svg.querySelectorAll('[id], [class]'))
    allLayers.forEach((el) => {
      if (el !== hoveredEl) {
        ;(el as HTMLElement).style.opacity = '0.3'
      }
    })

    return () => {
      svgEl.style.stroke = originalStroke
      svgEl.style.strokeWidth = originalStrokeWidth
      svgEl.style.filter = originalFilter
      allLayers.forEach((el) => {
        ;(el as HTMLElement).style.opacity = '1'
      })
    }
  }, [hoveredLayer])

  // File upload handling
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (!file) return

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

      // Detect layers
      const detectedLayers = detectKnobLayers(sanitized)
      // getSuggestedLayers auto-assigns based on detection
      getSuggestedLayers(detectedLayers)

      // Initialize mappings from suggestions
      const initialMappings: Record<string, LayerRole> = {}
      const allIdentifiers = [
        ...detectedLayers.indicator,
        ...detectedLayers.track,
        ...detectedLayers.arc,
        ...detectedLayers.glow,
        ...detectedLayers.shadow,
        ...detectedLayers.unmapped,
      ]

      allIdentifiers.forEach((id) => {
        if (detectedLayers.indicator.includes(id)) initialMappings[id] = 'indicator'
        else if (detectedLayers.track.includes(id)) initialMappings[id] = 'track'
        else if (detectedLayers.arc.includes(id)) initialMappings[id] = 'arc'
        else if (detectedLayers.glow.includes(id)) initialMappings[id] = 'glow'
        else if (detectedLayers.shadow.includes(id)) initialMappings[id] = 'shadow'
        else initialMappings[id] = 'exclude'
      })

      setSvgContent(sanitized)
      setDetected(detectedLayers)
      setMappings(initialMappings)
      setStyleName(file.name.replace(/\.svg$/i, ''))

      // Show detection summary toast
      const autoMatched = allIdentifiers.length - detectedLayers.unmapped.length
      if (autoMatched > 0) {
        toast.success(`Auto-detected ${autoMatched} layer${autoMatched !== 1 ? 's' : ''} from naming conventions`, { duration: 3000 })
      } else if (allIdentifiers.length > 0) {
        toast(`Found ${allIdentifiers.length} layer${allIdentifiers.length !== 1 ? 's' : ''} - please map them manually`, { icon: '📋', duration: 3000 })
      }

      setStep('mapping')
    } catch (error) {
      toast.error('Failed to read SVG file')
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/svg+xml': ['.svg'] },
    multiple: false,
  })

  // Handle mapping change
  const handleMappingChange = (identifier: string, role: LayerRole) => {
    setMappings((prev) => ({ ...prev, [identifier]: role }))
  }

  // Build KnobStyleLayers from mappings
  const buildLayers = (): KnobStyleLayers => {
    const layers: KnobStyleLayers = {}
    Object.entries(mappings).forEach(([id, role]) => {
      if (role !== 'exclude' && !layers[role]) {
        layers[role] = id
      }
    })
    return layers
  }

  // Validation: must have at least indicator mapped
  const hasIndicator = Object.values(mappings).includes('indicator')

  // Compute validation summary for feedback
  const getValidationSummary = (): ValidationSummary => {
    const roles = Object.values(mappings)
    const matchedCount = roles.filter(r => r !== 'exclude').length
    const unmappedCount = roles.filter(r => r === 'exclude').length
    return {
      matchedCount,
      unmappedCount,
      hasIndicator: roles.includes('indicator')
    }
  }

  const validationSummary = detected ? getValidationSummary() : null

  // Handle create or update style
  const handleCreate = () => {
    if (!styleName.trim()) {
      toast.error('Please enter a style name')
      return
    }

    if (!hasIndicator) {
      toast.error('At least one layer must be mapped as Indicator')
      return
    }

    const layers = buildLayers()

    if (existingStyle) {
      // Update existing style
      updateKnobStyle(existingStyle.id, {
        name: styleName.trim(),
        svgContent,
        layers,
        minAngle,
        maxAngle,
      })
      toast.success(`Knob style "${styleName}" updated`)
    } else {
      // Create new style
      addKnobStyle({
        name: styleName.trim(),
        svgContent,
        layers,
        minAngle,
        maxAngle,
      })
      toast.success(`Knob style "${styleName}" created`)
    }

    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {step === 'upload' && 'Import Knob Design'}
          {step === 'mapping' && (existingStyle ? 'Re-map Layers' : 'Map Layers')}
          {step === 'config' && (existingStyle ? 'Update Style' : 'Configure Style')}
        </h2>

        {/* Step 1: Upload */}
        {step === 'upload' && (
          <div
            {...getRootProps()}
            className={`
              border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
              transition-colors
              ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}
            `}
          >
            <input {...getInputProps()} />
            <div className="text-gray-400">
              <p className="mb-2">Drag & drop an SVG file here</p>
              <p className="text-sm">or click to browse</p>
            </div>
          </div>
        )}

        {/* Step 2: Layer Mapping */}
        {step === 'mapping' && detected && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Preview */}
              <div className="bg-gray-900 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Preview</p>
                <div className="w-32 h-32 mx-auto" ref={svgContainerRef}>
                  <SafeSVG content={svgContent} style={{ width: '100%', height: '100%' }} />
                </div>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  Hover a layer to highlight
                </p>
              </div>

              {/* Layer List */}
              <div>
                <p className="text-sm text-gray-400 mb-2">Detected Layers</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {Object.keys(mappings).map((id) => {
                    const isAutoDetected = !detected.unmapped.includes(id)
                    const currentMapping = mappings[id]
                    const isHovered = hoveredLayer === id
                    return (
                    <div
                      key={id}
                      className={`flex items-center gap-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                        isHovered ? 'bg-green-900/50' : 'hover:bg-gray-700/50'
                      }`}
                      onMouseEnter={() => setHoveredLayer(id)}
                      onMouseLeave={() => setHoveredLayer(null)}
                    >
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
                        className={`bg-gray-700 border text-white rounded px-2 py-1 text-sm ${
                          currentMapping === 'exclude' ? 'border-gray-600 text-gray-400' : 'border-gray-500'
                        }`}
                      >
                        <option value="indicator">Indicator</option>
                        <option value="track">Track</option>
                        <option value="arc">Arc</option>
                        <option value="glow">Glow</option>
                        <option value="shadow">Shadow</option>
                        <option value="exclude">Exclude</option>
                      </select>
                    </div>
                    )
                  })}
                </div>
                {/* Legend */}
                <div className="flex gap-3 mt-2 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-green-500" /> Auto-detected
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500" /> Manual
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-600" /> Excluded
                  </span>
                </div>
              </div>
            </div>

            {/* Validation Summary */}
            {validationSummary && (
              <div className={`p-3 rounded mb-4 ${validationSummary.hasIndicator ? 'bg-green-900/30 border border-green-700' : 'bg-amber-900/30 border border-amber-700'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className={validationSummary.hasIndicator ? 'text-green-400' : 'text-amber-400'}>
                    {validationSummary.hasIndicator ? '✓' : '⚠'}
                  </span>
                  <span className="text-sm font-medium text-gray-200">
                    {validationSummary.matchedCount} layer{validationSummary.matchedCount !== 1 ? 's' : ''} mapped
                    {validationSummary.unmappedCount > 0 && (
                      <span className="text-gray-400"> • {validationSummary.unmappedCount} excluded</span>
                    )}
                  </span>
                </div>
                {!validationSummary.hasIndicator && (
                  <p className="text-sm text-amber-400">
                    At least one layer must be mapped as Indicator
                  </p>
                )}
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
                onClick={() => setStep('config')}
                disabled={!hasIndicator}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded px-4 py-2"
              >
                Next
              </button>
            </div>
          </>
        )}

        {/* Step 3: Configuration */}
        {step === 'config' && (
          <>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Style Name</label>
                <input
                  type="text"
                  value={styleName}
                  onChange={(e) => setStyleName(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 text-white rounded px-3 py-2"
                  placeholder="My Knob Style"
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
