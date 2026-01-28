import { PianoKeyboardElementConfig } from '../../../../types/elements'

interface PianoKeyboardRendererProps {
  config: PianoKeyboardElementConfig
}

// MIDI note to key type
function isBlackKey(note: number): boolean {
  const noteInOctave = note % 12
  return [1, 3, 6, 8, 10].includes(noteInOctave)
}

// Get note name
function getNoteName(note: number): string {
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
  const octave = Math.floor(note / 12) - 1
  return `${names[note % 12]}${octave}`
}

export function PianoKeyboardRenderer({ config }: PianoKeyboardRendererProps) {
  const {
    startNote,
    endNote,
    showNoteLabels,
    labelOctavesOnly,
    whiteKeyColor,
    blackKeyColor,
    activeKeyColor,
    labelColor,
    whiteKeyWidth,
    blackKeyWidthRatio,
    fontSize,
    fontFamily,
    fontWeight,
    activeNotes,
    width,
    height,
  } = config

  // Count white keys in range
  const whiteKeys: number[] = []
  const blackKeys: number[] = []
  for (let note = startNote; note <= endNote; note++) {
    if (isBlackKey(note)) {
      blackKeys.push(note)
    } else {
      whiteKeys.push(note)
    }
  }

  const actualWhiteKeyWidth = width / whiteKeys.length
  const blackKeyWidth = actualWhiteKeyWidth * blackKeyWidthRatio
  const blackKeyHeight = height * 0.6

  // Get x position for a white key by its index
  const getWhiteKeyX = (index: number) => index * actualWhiteKeyWidth

  // Get x position for a black key (positioned relative to white keys)
  const getBlackKeyX = (note: number) => {
    // Find which white key this black key is after
    let whiteKeyIndex = 0
    for (let n = startNote; n < note; n++) {
      if (!isBlackKey(n)) whiteKeyIndex++
    }
    // Position black key between white keys
    return whiteKeyIndex * actualWhiteKeyWidth - blackKeyWidth / 2
  }

  return (
    <svg
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} ${height}`}
      style={{ overflow: 'visible' }}
    >
      {/* White keys */}
      {whiteKeys.map((note, index) => {
        const isActive = activeNotes.includes(note)
        const x = getWhiteKeyX(index)
        const showLabel = showNoteLabels && (!labelOctavesOnly || note % 12 === 0)

        return (
          <g key={note}>
            <rect
              x={x}
              y={0}
              width={actualWhiteKeyWidth - 1}
              height={height}
              fill={isActive ? activeKeyColor : whiteKeyColor}
              stroke="#333"
              strokeWidth={1}
              rx={2}
            />
            {showLabel && (
              <text
                x={x + actualWhiteKeyWidth / 2}
                y={height - 8}
                textAnchor="middle"
                fill={labelColor}
                fontSize={fontSize}
                fontFamily={fontFamily}
                fontWeight={fontWeight}
              >
                {labelOctavesOnly ? `C${Math.floor(note / 12) - 1}` : getNoteName(note)}
              </text>
            )}
          </g>
        )
      })}

      {/* Black keys (rendered on top) */}
      {blackKeys.map((note) => {
        const isActive = activeNotes.includes(note)
        const x = getBlackKeyX(note)

        return (
          <rect
            key={note}
            x={x}
            y={0}
            width={blackKeyWidth}
            height={blackKeyHeight}
            fill={isActive ? activeKeyColor : blackKeyColor}
            rx={2}
          />
        )
      })}
    </svg>
  )
}
