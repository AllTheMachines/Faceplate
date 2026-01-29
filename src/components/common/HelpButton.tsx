/**
 * HelpButton Component
 * Reusable (?) button that opens contextual help windows
 */

import { openHelpWindow } from '../../services/helpService'
import type { HelpContent } from '../../content/help/types'

interface HelpButtonProps {
  content: HelpContent
  className?: string
}

export function HelpButton({ content, className = '' }: HelpButtonProps) {
  return (
    <button
      onClick={() => openHelpWindow(content)}
      className={`text-gray-400 hover:text-gray-200 transition-colors ${className}`}
      title="Show help"
      aria-label={`Help for ${content.title}`}
    >
      <svg
        className="w-4 h-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </button>
  )
}
