import { useStore } from './store'

function App() {
  const canvasWidth = useStore((state) => state.canvasWidth)
  const canvasHeight = useStore((state) => state.canvasHeight)
  const scale = useStore((state) => state.scale)
  const setCanvasDimensions = useStore((state) => state.setCanvasDimensions)

  return (
    <div className="dark min-h-screen p-8">
      <h1 className="text-3xl font-bold text-gray-100 mb-4">VST3 WebView UI Designer</h1>

      <div className="text-gray-300 space-y-2">
        <p>Canvas: {canvasWidth}x{canvasHeight}</p>
        <p>Scale: {scale}</p>

        <button
          onClick={() => setCanvasDimensions(1024, 768)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
        >
          Change Canvas to 1024x768
        </button>
      </div>
    </div>
  )
}

export default App
