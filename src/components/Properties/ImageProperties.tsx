import { ImageElementConfig, ElementConfig } from '../../types/elements'
import { TextInput, PropertySection } from './'
import { fileOpen } from 'browser-fs-access'

interface ImagePropertiesProps {
  element: ImageElementConfig
  onUpdate: (updates: Partial<ElementConfig>) => void
}

export function ImageProperties({ element, onUpdate }: ImagePropertiesProps) {
  const isBase64 = element.src.startsWith('data:')

  const handleSelectImage = async () => {
    try {
      const file = await fileOpen({
        mimeTypes: ['image/*'],
        extensions: ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp'],
        description: 'Image files',
        multiple: false,
      })

      // Convert to base64 data URL for embedding
      const reader = new FileReader()
      reader.onloadend = () => {
        const base64 = reader.result as string
        onUpdate({ src: base64 })
      }
      reader.readAsDataURL(file)
    } catch (err) {
      // User cancelled the file picker - silently ignore
      console.debug('File picker cancelled')
    }
  }

  return (
    <>
      {/* Source */}
      <PropertySection title="Source">
        <button
          onClick={handleSelectImage}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded px-3 py-2 text-sm font-medium transition-colors"
        >
          Select Image File...
        </button>

        {element.src ? (
          <div className="mt-3 text-xs text-gray-400">
            {isBase64 ? (
              <p className="font-medium text-gray-300">Image loaded (embedded)</p>
            ) : (
              <>
                <p className="font-medium text-gray-300">External URL</p>
                <p className="mt-1 text-gray-500 break-all">{element.src}</p>
              </>
            )}

            {/* Preview thumbnail */}
            <div className="mt-2 border border-gray-600 rounded overflow-hidden bg-gray-800">
              <img
                src={element.src}
                alt="Preview"
                className="w-full h-20 object-contain"
              />
            </div>

            <button
              onClick={() => onUpdate({ src: '' })}
              className="mt-2 text-red-400 hover:text-red-300 text-xs underline"
            >
              Clear image
            </button>
          </div>
        ) : (
          <p className="mt-2 text-xs text-gray-500">No image selected</p>
        )}

        {/* Keep URL input as alternative */}
        <div className="mt-3 pt-3 border-t border-gray-700">
          <TextInput
            label="Or enter URL"
            value={isBase64 ? '' : element.src}
            onChange={(src) => onUpdate({ src })}
            placeholder="https://example.com/image.png"
          />
        </div>
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
