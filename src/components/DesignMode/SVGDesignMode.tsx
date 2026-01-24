import { useState, useCallback } from 'react'
import { SVGLayer, SVGLayerType, SVGDesignResult } from '../../types/svg'
import { extractSVGLayers, getSVGDimensions } from '../../services/import/svgLayerExtractor'
import { LayerAssignment } from './LayerAssignment'

interface SVGDesignModeProps {
  svgContent: string
  onComplete: (result: SVGDesignResult) => void
  onCancel: () => void
}

export function SVGDesignMode({ svgContent, onComplete, onCancel }: SVGDesignModeProps) {
  const [layers, setLayers] = useState<SVGLayer[]>([])
  const [elementType, setElementType] = useState<'knob' | 'slider' | 'button' | 'custom'>('knob')
  const [dimensions, setDimensions] = useState({ width: 100, height: 100 })
  const [isLoading, setIsLoading] = useState(true)

  // Extract layers on mount
  useState(() => {
    const load = async () => {
      try {
        const extractedLayers = await extractSVGLayers(svgContent)
        const dims = await getSVGDimensions(svgContent)
        setLayers(extractedLayers)
        setDimensions(dims)
      } catch (err) {
        console.error('Failed to extract layers:', err)
      } finally {
        setIsLoading(false)
      }
    }
    load()
  })

  const handleAssign = useCallback((layerId: string, type: SVGLayerType) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, assignedType: type } : layer
      )
    )
  }, [])

  const handleComplete = useCallback(() => {
    const layerMap: Record<SVGLayerType, string | undefined> = {
      indicator: undefined,
      track: undefined,
      thumb: undefined,
      fill: undefined,
      glow: undefined,
      background: undefined,
      unknown: undefined,
    }

    layers.forEach((layer) => {
      const type = layer.assignedType || layer.suggestedType
      if (type !== 'unknown') {
        layerMap[type] = layer.svgContent
      }
    })

    onComplete({
      elementType,
      layers: layerMap,
      originalSvg: svgContent,
      width: dimensions.width,
      height: dimensions.height,
    })
  }, [layers, elementType, svgContent, dimensions, onComplete])

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-4 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">SVG Design Mode</h2>
          <p className="text-sm text-gray-400 mt-1">
            Assign SVG layers to element parts
          </p>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-gray-400">
            Loading layers...
          </div>
        ) : (
          <div className="p-4 grid grid-cols-2 gap-4">
            {/* Preview */}
            <div className="bg-gray-800 rounded p-4">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Preview</h3>
              <div
                className="bg-gray-700 rounded aspect-square flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: svgContent }}
              />
              <p className="text-xs text-gray-500 mt-2">
                {dimensions.width} x {dimensions.height}
              </p>
            </div>

            {/* Settings */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Element Type
                </label>
                <select
                  value={elementType}
                  onChange={(e) => setElementType(e.target.value as any)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value="knob">Knob</option>
                  <option value="slider">Slider</option>
                  <option value="button">Button</option>
                  <option value="custom">Custom</option>
                </select>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-300 mb-2">
                  Layers ({layers.length})
                </h3>
                {layers.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    No named groups found. SVG must use &lt;g id="..."&gt; for layers.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {layers.map((layer) => (
                      <LayerAssignment
                        key={layer.id}
                        layer={layer}
                        onAssign={handleAssign}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="p-4 border-t border-gray-700 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            onClick={handleComplete}
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Create Element
          </button>
        </div>
      </div>
    </div>
  )
}
