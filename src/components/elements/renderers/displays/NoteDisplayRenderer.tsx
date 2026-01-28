import type { NoteDisplayElementConfig } from '../../../../types/elements'
import { formatDisplayValue } from '../../../../utils/valueFormatters'

interface NoteDisplayRendererProps {
  config: NoteDisplayElementConfig
}

export function NoteDisplayRenderer({ config }: NoteDisplayRendererProps) {
  const formattedValue = formatDisplayValue(
    config.value,
    config.min,
    config.max,
    'note',
    { preferSharps: config.preferSharps }
  )

  // Calculate MIDI number for optional display
  const midiNumber = Math.round(config.min + config.value * (config.max - config.min))

  // Apply bezel style
  const bezelStyle = config.bezelStyle === 'inset'
    ? { boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3)' }
    : config.bezelStyle === 'flat'
    ? { border: `1px solid ${config.borderColor}` }
    : {}

  return (
    <div
      className="notedisplay-element"
      style={{
        width: '100%',
        height: '100%',
        backgroundColor: config.backgroundColor,
        padding: `${config.padding}px`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: config.fontFamily,
        fontSize: `${config.fontSize}px`,
        fontWeight: config.fontWeight,
        color: config.textColor,
        borderRadius: 0,
        boxSizing: 'border-box',
        ...bezelStyle,
      }}
    >
      <div>{formattedValue}</div>
      {config.showMidiNumber && (
        <div style={{ fontSize: `${config.fontSize * 0.6}px`, opacity: 0.7, marginTop: 2 }}>
          {midiNumber}
        </div>
      )}
    </div>
  )
}
