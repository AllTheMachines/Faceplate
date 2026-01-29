/**
 * Help Service
 * Manages help window creation, content rendering, and cleanup
 */

import type { HelpContent } from '../content/help/types'
import { HELP_WINDOW_STYLES } from '../content/help/styles'

/**
 * Escape HTML entities to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Generate complete HTML document for help window
 */
function generateHelpHTML(content: HelpContent): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(content.title)} - Help</title>
        <style>${HELP_WINDOW_STYLES}</style>
      </head>
      <body>
        <h1>${escapeHtml(content.title)}</h1>
        <p>${escapeHtml(content.description)}</p>

        ${content.examples?.length ? `
          <h2>Examples</h2>
          ${content.examples.map(ex => `
            <div class="example">
              <div class="example-label">${escapeHtml(ex.label)}</div>
              ${ex.code ? `<pre><code>${escapeHtml(ex.code)}</code></pre>` : ''}
              <p>${escapeHtml(ex.explanation)}</p>
            </div>
          `).join('')}
        ` : ''}

        ${content.relatedTopics?.length ? `
          <div class="related-topics">
            <h3>Related Topics</h3>
            <ul>
              ${content.relatedTopics.map(topic => `<li>${escapeHtml(topic)}</li>`).join('')}
            </ul>
          </div>
        ` : ''}
      </body>
    </html>
  `
}

// Track open help windows to prevent duplicates
const openWindows = new Map<string, Window>()

/**
 * Open a help window with the given content
 *
 * IMPORTANT: Must be called synchronously from a user event handler
 * to avoid popup blocker issues.
 */
export function openHelpWindow(content: HelpContent): void {
  const windowKey = `help-${content.title}`

  // Focus existing window if already open
  const existingWindow = openWindows.get(windowKey)
  if (existingWindow && !existingWindow.closed) {
    existingWindow.focus()
    return
  }

  const html = generateHelpHTML(content)
  const blob = new Blob([html], { type: 'text/html' })
  const url = URL.createObjectURL(blob)

  // Open window with specific dimensions and features
  const helpWindow = window.open(
    url,
    windowKey,
    'width=700,height=800,scrollbars=yes,resizable=yes,menubar=no,toolbar=no,location=no'
  )

  if (helpWindow) {
    openWindows.set(windowKey, helpWindow)

    // Clean up blob URL after window loads
    helpWindow.addEventListener('load', () => {
      URL.revokeObjectURL(url)
    })

    // Remove from tracking when window closes
    const checkClosed = setInterval(() => {
      if (helpWindow.closed) {
        openWindows.delete(windowKey)
        clearInterval(checkClosed)
      }
    }, 500)
  } else {
    // Popup was blocked
    URL.revokeObjectURL(url)
    console.warn('Help window was blocked by popup blocker')
    alert('Please allow popups for this site to view help documentation')
  }
}
