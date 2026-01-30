import { useState, useEffect, useCallback } from 'react'
import { AsciiArtElementConfig } from '../../../../types/elements'

interface AsciiArtRendererProps {
  config: AsciiArtElementConfig
}

/**
 * Generate noise text based on configuration
 */
function generateNoise(
  characters: string,
  intensity: number,
  width: number,
  height: number
): string {
  const chars = characters || '.:!*#$@%&'
  let output = ''
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      output += Math.random() < intensity
        ? chars[Math.floor(Math.random() * chars.length)]
        : ' '
    }
    if (y < height - 1) output += '\n'
  }
  return output
}

export function AsciiArtRenderer({ config }: AsciiArtRendererProps) {
  const [noiseContent, setNoiseContent] = useState('')

  // Generate noise content for noise mode
  const updateNoise = useCallback(() => {
    if (config.contentType === 'noise') {
      setNoiseContent(
        generateNoise(
          config.noiseCharacters,
          config.noiseIntensity,
          config.noiseWidth,
          config.noiseHeight
        )
      )
    }
  }, [
    config.contentType,
    config.noiseCharacters,
    config.noiseIntensity,
    config.noiseWidth,
    config.noiseHeight,
  ])

  // Set up animation interval for noise mode
  useEffect(() => {
    if (config.contentType !== 'noise') return

    // Generate initial noise
    updateNoise()

    // Set up refresh interval
    const intervalId = setInterval(updateNoise, config.noiseRefreshRate)

    return () => clearInterval(intervalId)
  }, [config.contentType, config.noiseRefreshRate, updateNoise])

  const displayContent = config.contentType === 'noise' ? noiseContent : config.content

  const selectableClass = config.selectable ? 'ascii-art-selectable' : 'ascii-art-not-selectable'

  return (
    <>
      <style>{`
        .ascii-art-selectable {
          user-select: text !important;
          -webkit-user-select: text !important;
          -moz-user-select: text !important;
          -ms-user-select: text !important;
          cursor: text;
        }
        .ascii-art-not-selectable {
          user-select: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          cursor: default;
        }
      `}</style>
      <pre
        className={`w-full h-full m-0 ${selectableClass}`}
        style={{
          fontFamily: config.fontFamily,
          fontSize: `${config.fontSize}px`,
          fontWeight: config.fontWeight,
          color: config.textColor,
          lineHeight: config.lineHeight,
          backgroundColor: config.backgroundColor,
          padding: `${config.padding}px`,
          borderRadius: `${config.borderRadius}px`,
          border: config.borderWidth > 0
            ? `${config.borderWidth}px solid ${config.borderColor}`
            : 'none',
          overflow: config.overflow,
          whiteSpace: 'pre',
          boxSizing: 'border-box',
        }}
      >
        {displayContent}
      </pre>
    </>
  )
}
