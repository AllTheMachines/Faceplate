import { useEffect } from 'react'
import { ThreePanelLayout } from './components/Layout'
import { CanvasStage } from './components/Canvas'
import { useStore } from './store'
import {
  createKnob,
  createSlider,
  createButton,
  createLabel,
  createMeter,
  createImage,
} from './types/elements'

function App() {
  useEffect(() => {
    const store = useStore.getState()

    // Only add demo elements if canvas is empty
    // (This is for demo/testing - can be removed once property panel is built)
    if (store.elements.length === 0) {
      // Row 1: Knobs
      store.addElement(
        createKnob({
          x: 50,
          y: 50,
          name: 'Gain',
          value: 0.75,
        })
      )
      store.addElement(
        createKnob({
          x: 150,
          y: 50,
          name: 'Pan',
          value: 0.5,
          fillColor: '#10b981', // emerald
        })
      )

      // Row 2: Sliders
      store.addElement(
        createSlider({
          x: 280,
          y: 30,
          name: 'Volume',
          orientation: 'vertical',
          value: 0.6,
          height: 120,
          width: 40,
        })
      )
      store.addElement(
        createSlider({
          x: 340,
          y: 80,
          name: 'Cutoff',
          orientation: 'horizontal',
          value: 0.3,
          width: 120,
          height: 30,
        })
      )

      // Row 3: Buttons
      store.addElement(
        createButton({
          x: 50,
          y: 180,
          name: 'Play',
          label: 'Play',
          width: 80,
          height: 36,
        })
      )
      store.addElement(
        createButton({
          x: 140,
          y: 180,
          name: 'Bypass',
          label: 'Bypass',
          mode: 'toggle',
          pressed: true,
          width: 80,
          height: 36,
          backgroundColor: '#ef4444', // red when active
        })
      )

      // Row 4: Labels
      store.addElement(
        createLabel({
          x: 50,
          y: 240,
          name: 'Title',
          text: 'My Plugin',
          fontSize: 24,
          fontWeight: 700,
          width: 200,
          height: 36,
        })
      )
      store.addElement(
        createLabel({
          x: 50,
          y: 280,
          name: 'Subtitle',
          text: 'v1.0.0',
          fontSize: 12,
          color: '#9ca3af',
          width: 100,
          height: 20,
        })
      )

      // Meters
      store.addElement(
        createMeter({
          x: 500,
          y: 30,
          name: 'Level L',
          value: 0.7,
          width: 20,
          height: 140,
        })
      )
      store.addElement(
        createMeter({
          x: 530,
          y: 30,
          name: 'Level R',
          value: 0.55,
          width: 20,
          height: 140,
        })
      )

      // Image placeholder
      store.addElement(
        createImage({
          x: 600,
          y: 30,
          name: 'Logo',
          width: 100,
          height: 100,
          // No src - will show placeholder
        })
      )
    }
  }, [])

  return (
    <ThreePanelLayout>
      <CanvasStage />
    </ThreePanelLayout>
  )
}

export default App
