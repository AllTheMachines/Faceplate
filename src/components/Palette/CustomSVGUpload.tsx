import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { parseSVGFile, svgToDataUrl, ParsedSVG } from '../../utils/svgImport';
import { useStore } from '../../store';
import { createImage } from '../../types/elements';

export function CustomSVGUpload() {
  const [parsedSVG, setParsedSVG] = useState<ParsedSVG | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const addElement = useStore((state) => state.addElement);
  const scale = useStore((state) => state.scale);
  const offsetX = useStore((state) => state.offsetX);
  const offsetY = useStore((state) => state.offsetY);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    try {
      const svgString = await file.text();
      const result = await parseSVGFile(svgString);
      setParsedSVG(result);
      setError(null);
    } catch (err) {
      setError('Failed to parse SVG file');
      console.error(err);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/svg+xml': ['.svg'],
    },
    maxFiles: 1,
  });

  const handleAddToCanvas = () => {
    if (!parsedSVG) return;

    // Get the canvas viewport element dimensions
    const canvasViewport = document.querySelector('.canvas-viewport');
    const viewportWidth = canvasViewport?.clientWidth || 800;
    const viewportHeight = canvasViewport?.clientHeight || 600;

    // Calculate center of viewport in canvas coordinates
    // Screen center: (viewportWidth / 2, viewportHeight / 2)
    // Canvas coords: (screenX - offsetX) / scale
    const centerCanvasX = (viewportWidth / 2 - offsetX) / scale;
    const centerCanvasY = (viewportHeight / 2 - offsetY) / scale;

    // Center the SVG on this point (subtract half its dimensions)
    const svgX = centerCanvasX - parsedSVG.width / 2;
    const svgY = centerCanvasY - parsedSVG.height / 2;

    // Create image element with SVG as data URL
    const dataUrl = svgToDataUrl(parsedSVG.svgString);
    const element = createImage({
      x: svgX,
      y: svgY,
      width: parsedSVG.width,
      height: parsedSVG.height,
      src: dataUrl,
      name: 'Custom SVG',
    });

    addElement(element);
    setParsedSVG(null);
    setIsOpen(false);
  };

  const handleCancel = () => {
    setParsedSVG(null);
    setError(null);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full mt-4 px-4 py-2 border border-dashed border-gray-600 rounded text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-colors"
      >
        + Import Custom SVG
      </button>
    );
  }

  return (
    <div className="mt-4 p-4 bg-gray-750 rounded border border-gray-700">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-medium text-gray-200">Import Custom SVG</h3>
        <button
          onClick={handleCancel}
          className="text-gray-400 hover:text-gray-300"
        >
          ×
        </button>
      </div>

      {!parsedSVG ? (
        <div
          {...getRootProps()}
          className={`
            border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            ${isDragActive ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'}
          `}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p className="text-sm text-blue-400">Drop SVG file here...</p>
          ) : (
            <p className="text-sm text-gray-400">Drag SVG file here or click to browse</p>
          )}
        </div>
      ) : (
        <div>
          {/* Preview */}
          <div className="mb-3 flex justify-center">
            <img
              src={svgToDataUrl(parsedSVG.svgString)}
              alt="SVG Preview"
              className="max-w-full max-h-24 border border-gray-600 rounded"
            />
          </div>

          {/* Dimensions */}
          <p className="text-xs text-gray-400 mb-2">
            Size: {parsedSVG.width} × {parsedSVG.height}
          </p>

          {/* Detected Layers */}
          {parsedSVG.layers.length > 0 ? (
            <div className="mb-3">
              <p className="text-xs font-medium text-gray-300 mb-1">Detected Layers:</p>
              <ul className="text-xs text-gray-400 space-y-1">
                {parsedSVG.layers.map((layer, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className={`
                      px-1.5 py-0.5 rounded text-xs
                      ${layer.type === 'indicator' ? 'bg-blue-900 text-blue-300' : ''}
                      ${layer.type === 'thumb' ? 'bg-green-900 text-green-300' : ''}
                      ${layer.type === 'track' ? 'bg-gray-600 text-gray-300' : ''}
                      ${layer.type === 'fill' ? 'bg-purple-900 text-purple-300' : ''}
                      ${layer.type === 'glow' ? 'bg-yellow-900 text-yellow-300' : ''}
                    `}>
                      {layer.type}
                    </span>
                    <span>{layer.name}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-xs text-gray-500 mb-3">
              No named layers detected. SVG will be added as static image.
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleAddToCanvas}
              className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
            >
              Add to Canvas
            </button>
            <button
              onClick={handleCancel}
              className="px-3 py-1.5 text-gray-400 hover:text-gray-300 text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
    </div>
  );
}
