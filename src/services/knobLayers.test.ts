import { describe, it, expect } from 'vitest'
import {
  detectKnobLayers,
  extractLayer,
  applyColorOverride,
  applyAllColorOverrides,
  hasDetectableLayers,
  getSuggestedLayers,
} from './knobLayers'

// Sample SVG for testing
const sampleKnobSVG = `
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
  <circle id="track" cx="50" cy="50" r="45" fill="#333" />
  <path id="arc" d="M 50 10 A 40 40 0 1 1 50 90" fill="none" stroke="#666" />
  <line id="indicator" x1="50" y1="50" x2="50" y2="15" stroke="#fff" />
  <circle class="glow" cx="50" cy="50" r="48" fill="none" stroke="rgba(255,255,255,0.3)" />
  <circle id="unmapped-element" cx="50" cy="50" r="5" fill="#ff0000" />
</svg>
`

const flatSVG = `
<svg viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg">
  <circle cx="25" cy="25" r="20" fill="blue" />
</svg>
`

describe('detectKnobLayers', () => {
  it('should detect layers by naming convention', () => {
    const detected = detectKnobLayers(sampleKnobSVG)

    expect(detected.indicator).toContain('indicator')
    expect(detected.track).toContain('track')
    expect(detected.arc).toContain('arc')
    expect(detected.glow).toContain('glow')
    expect(detected.unmapped).toContain('unmapped-element')
  })

  it('should return empty arrays for SVG without named layers', () => {
    const detected = detectKnobLayers(flatSVG)

    expect(detected.indicator).toHaveLength(0)
    expect(detected.track).toHaveLength(0)
    expect(detected.arc).toHaveLength(0)
    expect(detected.glow).toHaveLength(0)
    expect(detected.shadow).toHaveLength(0)
  })

  it('should throw on invalid SVG', () => {
    expect(() => detectKnobLayers('not valid xml')).toThrow('Invalid SVG file')
  })
})

describe('extractLayer', () => {
  it('should extract layer by id', () => {
    const extracted = extractLayer(sampleKnobSVG, 'indicator')

    expect(extracted).toContain('viewBox="0 0 100 100"')
    expect(extracted).toContain('id="indicator"')
    expect(extracted).not.toContain('id="track"')
  })

  it('should extract layer by class', () => {
    const extracted = extractLayer(sampleKnobSVG, 'glow')

    expect(extracted).toContain('class="glow"')
  })

  it('should return empty string for non-existent layer', () => {
    const extracted = extractLayer(sampleKnobSVG, 'nonexistent')
    expect(extracted).toBe('')
  })
})

describe('applyColorOverride', () => {
  it('should replace fill attribute', () => {
    const result = applyColorOverride(sampleKnobSVG, 'track', '#ff0000')
    expect(result).toContain('fill="#ff0000"')
  })

  it('should replace stroke attribute', () => {
    const result = applyColorOverride(sampleKnobSVG, 'indicator', '#00ff00')
    expect(result).toContain('stroke="#00ff00"')
  })

  it('should preserve fill="none"', () => {
    const result = applyColorOverride(sampleKnobSVG, 'arc', '#ff0000')
    expect(result).toContain('fill="none"')
    expect(result).toContain('stroke="#ff0000"')
  })

  it('should return original SVG if layer not found', () => {
    const result = applyColorOverride(sampleKnobSVG, 'nonexistent', '#ff0000')
    expect(result).toBe(sampleKnobSVG)
  })
})

describe('applyAllColorOverrides', () => {
  it('should apply multiple color overrides', () => {
    const layers = { indicator: 'indicator', track: 'track' }
    const overrides = { indicator: '#ff0000', track: '#00ff00' }

    const result = applyAllColorOverrides(sampleKnobSVG, layers, overrides)

    expect(result).toContain('stroke="#ff0000"') // indicator
    expect(result).toContain('fill="#00ff00"')   // track
  })

  it('should return original if no overrides', () => {
    const result = applyAllColorOverrides(sampleKnobSVG, {}, undefined)
    expect(result).toBe(sampleKnobSVG)
  })
})

describe('hasDetectableLayers', () => {
  it('should return true for SVG with named layers', () => {
    expect(hasDetectableLayers(sampleKnobSVG)).toBe(true)
  })

  it('should return false for flat SVG', () => {
    expect(hasDetectableLayers(flatSVG)).toBe(false)
  })
})

describe('getSuggestedLayers', () => {
  it('should return first detected element for each role', () => {
    const detected = detectKnobLayers(sampleKnobSVG)
    const suggested = getSuggestedLayers(detected)

    expect(suggested.indicator).toBe('indicator')
    expect(suggested.track).toBe('track')
    expect(suggested.arc).toBe('arc')
    expect(suggested.glow).toBe('glow')
    expect(suggested.shadow).toBeUndefined() // No shadow in sample
  })
})
