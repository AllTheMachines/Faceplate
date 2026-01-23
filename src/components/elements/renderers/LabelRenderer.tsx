import { LabelElementConfig } from '../../../types/elements'

interface LabelRendererProps {
  config: LabelElementConfig
}

export function LabelRenderer({ config }: LabelRendererProps) {
  // Determine if text contains newlines for multi-line rendering
  const hasNewlines = config.text.includes('\n')

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        fontSize: `${config.fontSize}px`,
        fontFamily: config.fontFamily,
        fontWeight: config.fontWeight,
        color: config.color,
      }}
    >
      <span
        style={{
          width: '100%',
          textAlign: config.textAlign,
          whiteSpace: hasNewlines ? 'pre-wrap' : 'nowrap',
          textOverflow: 'ellipsis',
          overflow: 'hidden',
          lineHeight: 1.2,
        }}
      >
        {config.text}
      </span>
    </div>
  )
}
