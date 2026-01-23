import { ImageElementConfig, ElementConfig } from '../../types/elements'
import { TextInput, PropertySection } from './'

interface ImagePropertiesProps {
  element: ImageElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function ImageProperties({ element, onUpdate }: ImagePropertiesProps) {
  const isBase64 = element.src.startsWith('data:')

  return (
    <>
      {/* Source */}
      <PropertySection title="Source">
        {isBase64 ? (
          <div className="text-xs text-gray-400">
            <p>Base64 image embedded</p>
            <p className="mt-1 text-gray-500">
              {element.src.substring(0, 50)}...
            </p>
          </div>
        ) : (
          <TextInput
            label="Image URL"
            value={element.src}
            onChange={(src) => onUpdate({ src })}
            placeholder="https://example.com/image.png"
          />
        )}
      </PropertySection>

      {/* Fit */}
      <PropertySection title="Fit">
        <div>
          <label className="block text-xs text-gray-400 mb-1">Object Fit</label>
          <select
            value={element.fit}
            onChange={(e) =>
              onUpdate({ fit: e.target.value as ImageElementConfig['fit'] })
            }
            className="w-full bg-gray-700 border border-gray-600 text-white rounded px-2 py-1.5 text-sm"
          >
            <option value="contain">Contain</option>
            <option value="cover">Cover</option>
            <option value="fill">Fill</option>
            <option value="none">None</option>
          </select>
        </div>
      </PropertySection>
    </>
  )
}
