import { SVGLayer, SVGLayerType } from '../../types/svg'

interface LayerAssignmentProps {
  layer: SVGLayer
  onAssign: (layerId: string, type: SVGLayerType) => void
}

const LAYER_TYPE_OPTIONS: { value: SVGLayerType; label: string }[] = [
  { value: 'indicator', label: 'Indicator (rotates)' },
  { value: 'track', label: 'Track (static)' },
  { value: 'thumb', label: 'Thumb (moves)' },
  { value: 'fill', label: 'Fill (grows)' },
  { value: 'glow', label: 'Glow (highlight)' },
  { value: 'background', label: 'Background' },
  { value: 'unknown', label: 'Unused' },
]

export function LayerAssignment({ layer, onAssign }: LayerAssignmentProps) {
  return (
    <div className="flex items-center gap-3 p-2 bg-gray-800 rounded">
      <div
        className="w-12 h-12 bg-gray-700 rounded flex-shrink-0"
        dangerouslySetInnerHTML={{
          __html: `<svg viewBox="0 0 100 100" class="w-full h-full">${layer.svgContent}</svg>`,
        }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white truncate">{layer.name}</p>
        <p className="text-xs text-gray-400">ID: {layer.id}</p>
      </div>
      <select
        value={layer.assignedType || layer.suggestedType}
        onChange={(e) => onAssign(layer.id, e.target.value as SVGLayerType)}
        className="px-2 py-1 bg-gray-700 border border-gray-600 rounded text-sm text-white"
      >
        {LAYER_TYPE_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}
