import { useState } from 'react'

interface ShortcutItem {
  keys: string
  action: string
}

interface ShortcutCategory {
  name: string
  shortcuts: ShortcutItem[]
}

const shortcutCategories: ShortcutCategory[] = [
  {
    name: 'Selection',
    shortcuts: [
      { keys: 'Click', action: 'Select element' },
      { keys: 'Shift + Click', action: 'Add to selection' },
      { keys: 'Ctrl/Cmd + Click', action: 'Toggle selection' },
      { keys: 'Drag on canvas', action: 'Marquee select' },
      { keys: 'Escape', action: 'Clear selection' },
    ],
  },
  {
    name: 'Edit',
    shortcuts: [
      { keys: 'Ctrl/Cmd + C', action: 'Copy selected elements' },
      { keys: 'Ctrl/Cmd + V', action: 'Paste elements' },
      { keys: 'Delete / Backspace', action: 'Delete selected elements' },
      { keys: 'Ctrl/Cmd + Z', action: 'Undo' },
      { keys: 'Ctrl/Cmd + Y', action: 'Redo' },
      { keys: 'Ctrl/Cmd + Shift + Z', action: 'Redo (Mac)' },
    ],
  },
  {
    name: 'Z-Order',
    shortcuts: [
      { keys: 'Ctrl/Cmd + ]', action: 'Bring forward' },
      { keys: 'Ctrl/Cmd + [', action: 'Send backward' },
      { keys: 'Ctrl/Cmd + Shift + ]', action: 'Bring to front' },
      { keys: 'Ctrl/Cmd + Shift + [', action: 'Send to back' },
    ],
  },
  {
    name: 'Transform',
    shortcuts: [
      { keys: 'Arrow keys', action: 'Nudge 1px' },
      { keys: 'Shift + Arrow keys', action: 'Nudge 10px' },
    ],
  },
  {
    name: 'View',
    shortcuts: [
      { keys: 'Spacebar + Drag', action: 'Pan canvas' },
      { keys: 'Scroll wheel', action: 'Zoom in/out' },
    ],
  },
]

function ShortcutSection({ category }: { category: ShortcutCategory }) {
  return (
    <div>
      <h4 className="text-xs font-medium text-gray-400 mb-2">{category.name}</h4>
      <div className="space-y-1.5">
        {category.shortcuts.map((shortcut, index) => (
          <div key={index} className="flex items-start gap-2 text-xs">
            <kbd className="bg-gray-700 text-gray-200 rounded px-1.5 py-0.5 font-mono text-xs shrink-0">
              {shortcut.keys}
            </kbd>
            <span className="text-gray-300">{shortcut.action}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ChevronIcon({ expanded }: { expanded: boolean }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? 'rotate-180' : ''}`}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  )
}

function getReportBugUrl() {
  const title = encodeURIComponent('[Bug] ')
  const body = encodeURIComponent(`## Description
Describe the bug here...

## Steps to Reproduce
1.
2.
3.

## Expected Behavior


## Actual Behavior


## Environment
- Browser: ${navigator.userAgent.split(' ').slice(-2).join(' ')}
- URL: ${window.location.href}
- Timestamp: ${new Date().toISOString()}
`)
  return `https://github.com/AllTheMachines/Faceplate/issues/new?title=${title}&body=${body}&labels=bug`
}

export function HelpPanel() {
  const [expanded, setExpanded] = useState(false)

  const handleReportBug = () => {
    window.open(getReportBugUrl(), '_blank')
  }

  return (
    <div className="border-t border-gray-700">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-3 hover:bg-gray-700/50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-200">Keyboard Shortcuts</span>
        <ChevronIcon expanded={expanded} />
      </button>
      {expanded && (
        <div className="p-3 pt-0 space-y-4">
          {shortcutCategories.map((category) => (
            <ShortcutSection key={category.name} category={category} />
          ))}

          {/* Report Bug Link */}
          <div className="pt-3 border-t border-gray-700">
            <button
              onClick={handleReportBug}
              className="flex items-center gap-2 text-sm text-red-400 hover:text-red-300 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Report a Bug
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
