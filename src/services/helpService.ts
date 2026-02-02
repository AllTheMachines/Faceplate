/**
 * Help Service
 * Manages help window creation, content rendering, and cleanup
 */

import type { HelpContent } from '../content/help/types'
import { HELP_WINDOW_STYLES } from '../content/help/styles'
import { elementHelp } from '../content/help/elements'
import { sectionHelp } from '../content/help/sections'

// Combined registry of all help topics
const allHelpTopics: Record<string, HelpContent> = {
  ...elementHelp,
  ...sectionHelp,
}

// List of known element type names for detection in related topics
// Sort by length descending so longer/more specific keys match first
// This prevents "knob" from matching before "steppedknob" in topics like "Use SteppedKnob..."
const knownElementTypes = Object.keys(allHelpTopics).sort((a, b) => b.length - a.length)

/**
 * Escape HTML entities to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div')
  div.textContent = text
  return div.innerHTML
}

/**
 * Find element type key mentioned in topic text
 * Returns the key if found, null otherwise
 */
function findElementKeyInTopic(topic: string): string | null {
  // Normalize topic: remove spaces, lowercase
  const normalizedTopic = topic.toLowerCase().replace(/\s+/g, '')

  // Check each known element type
  for (const key of knownElementTypes) {
    // Direct substring match (handles "SteppedKnob", "Stepped Knob", "stepped knob")
    if (normalizedTopic.includes(key)) {
      return key
    }
  }

  // Also try matching words in the topic against keys
  // This handles cases like "Use Panel for grouping" where "panel" is a standalone word
  const words = topic.toLowerCase().split(/\s+/)
  for (const word of words) {
    // Clean the word of punctuation
    const cleanWord = word.replace(/[^a-z0-9]/g, '')
    if (knownElementTypes.includes(cleanWord)) {
      return cleanWord
    }
  }

  return null
}

/**
 * Render a related topic as HTML, making it a link if it references a known topic
 */
function renderRelatedTopic(topic: string): string {
  const elementKey = findElementKeyInTopic(topic)

  if (elementKey && allHelpTopics[elementKey]) {
    return `<li>
      <a href="#" class="related-topic-link" onclick="navigateToSection('help-${elementKey}'); return false;">
        ${escapeHtml(topic)}
      </a>
    </li>`
  }

  // No link - just plain text
  return `<li>${escapeHtml(topic)}</li>`
}

/**
 * Generate GitHub issue URL for help documentation issues
 */
function getHelpIssueUrl(helpTitle: string): string {
  const title = encodeURIComponent(`[Docs] ${helpTitle}: `)
  const body = encodeURIComponent(`## Help Topic: ${helpTitle}

## What's wrong with the documentation?
- [ ] Information is incorrect
- [ ] Information is missing
- [ ] Example doesn't work
- [ ] Related topics are broken
- [ ] Confusing or unclear

## Description


## Suggested Fix

`)
  return `https://github.com/allthecodeDev/vst3-webview-ui-designer/issues/new?title=${title}&body=${body}&labels=documentation`
}

/**
 * Generate GitHub issue URL for feature/element bugs
 */
function getFeatureBugUrl(helpTitle: string, elementContext?: string): string {
  const contextSuffix = elementContext ? ` (on ${elementContext})` : ''
  const title = encodeURIComponent(`[Bug] ${helpTitle}${contextSuffix}: `)
  const body = encodeURIComponent(`## Feature: ${helpTitle}
${elementContext ? `## Element Type: ${elementContext}\n` : ''}
## Description
Describe the bug here...

## Steps to Reproduce
1.${elementContext ? ` Add a ${elementContext} element to the canvas` : ''}
2.
3.

## Expected Behavior


## Actual Behavior


## Screenshots
If applicable, add screenshots.

`)
  return `https://github.com/allthecodeDev/vst3-webview-ui-designer/issues/new?title=${title}&body=${body}&labels=bug`
}

/**
 * Generate HTML content for a single help section
 */
function generateSectionHTML(content: HelpContent, sectionId: string): string {
  const helpIssueUrl = getHelpIssueUrl(content.title)
  const featureBugUrl = getFeatureBugUrl(content.title, content.elementContext)

  return `
    <div id="${sectionId}" class="help-section">
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
            ${content.relatedTopics.map(topic => renderRelatedTopic(topic)).join('')}
          </ul>
        </div>
      ` : ''}

      <div class="report-section">
        <div class="report-title">Found a problem?</div>
        <div class="report-buttons">
          <a href="${featureBugUrl}" target="_blank" rel="noopener noreferrer" class="report-btn report-btn-bug">
            Report a bug with "${escapeHtml(content.title)}"
          </a>
          <a href="${helpIssueUrl}" target="_blank" rel="noopener noreferrer" class="report-btn report-btn-docs">
            Report an issue with this documentation
          </a>
        </div>
      </div>
    </div>
  `
}

/**
 * Collect all topics that should be included in the HTML document
 * Includes the main topic and all topics referenced in relatedTopics (1 level deep)
 */
function collectRelatedTopics(mainContent: HelpContent, mainKey: string): Map<string, HelpContent> {
  const topics = new Map<string, HelpContent>()

  // Add main topic
  topics.set(mainKey, mainContent)

  // Collect topics from main content's relatedTopics
  if (mainContent.relatedTopics) {
    for (const topic of mainContent.relatedTopics) {
      const elementKey = findElementKeyInTopic(topic)
      if (elementKey && allHelpTopics[elementKey] && !topics.has(elementKey)) {
        topics.set(elementKey, allHelpTopics[elementKey])

        // Also collect 1 level deep (topics referenced by referenced topics)
        const relatedContent = allHelpTopics[elementKey]
        if (relatedContent.relatedTopics) {
          for (const subTopic of relatedContent.relatedTopics) {
            const subKey = findElementKeyInTopic(subTopic)
            if (subKey && allHelpTopics[subKey] && !topics.has(subKey)) {
              topics.set(subKey, allHelpTopics[subKey])
            }
          }
        }
      }
    }
  }

  return topics
}

/**
 * Find the key for a given HelpContent in allHelpTopics
 */
function findTopicKey(content: HelpContent): string {
  for (const [key, value] of Object.entries(allHelpTopics)) {
    if (value === content || (value.title === content.title && value.description === content.description)) {
      return key
    }
  }
  // Fallback: generate a key from the title
  return content.title.toLowerCase().replace(/\s+/g, '-')
}

/**
 * Generate complete HTML document for help window with in-window navigation
 */
function generateHelpHTML(content: HelpContent): string {
  const mainKey = findTopicKey(content)
  const mainSectionId = `help-${mainKey}`

  // Collect all related topics to include
  const allTopics = collectRelatedTopics(content, mainKey)

  // Generate navigation JavaScript
  const navigationScript = `
    let navigationHistory = [];
    let currentSectionId = null;

    function initializeHelp(initialSectionId) {
      currentSectionId = initialSectionId;
      // Show only the initial section
      document.querySelectorAll('.help-section').forEach(el => {
        el.style.display = el.id === initialSectionId ? 'block' : 'none';
      });
      updateBackButton();
    }

    function navigateToSection(sectionId) {
      const element = document.getElementById(sectionId);
      if (!element) {
        console.warn('Help section not found:', sectionId);
        return;
      }

      // Save current position to history
      if (currentSectionId) {
        navigationHistory.push({
          sectionId: currentSectionId,
          scrollY: window.scrollY
        });
      }

      // Hide current section, show new section
      document.querySelectorAll('.help-section').forEach(el => {
        el.style.display = 'none';
      });
      element.style.display = 'block';
      currentSectionId = sectionId;

      // Scroll to top of new section
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Brief highlight
      element.classList.add('highlight-flash');
      setTimeout(() => {
        element.classList.remove('highlight-flash');
      }, 1000);

      updateBackButton();
    }

    function navigateBack() {
      if (navigationHistory.length === 0) return;

      const prev = navigationHistory.pop();

      // Hide current section, show previous section
      document.querySelectorAll('.help-section').forEach(el => {
        el.style.display = 'none';
      });

      const element = document.getElementById(prev.sectionId);
      if (element) {
        element.style.display = 'block';
        currentSectionId = prev.sectionId;
        window.scrollTo({ top: prev.scrollY, behavior: 'smooth' });
      }

      updateBackButton();
    }

    function updateBackButton() {
      const btn = document.getElementById('back-btn');
      if (btn) {
        btn.style.display = navigationHistory.length > 0 ? 'block' : 'none';
      }
    }

    // Initialize on load
    document.addEventListener('DOMContentLoaded', function() {
      initializeHelp('${mainSectionId}');
    });
  `

  // Generate all section HTML
  const sectionsHTML = Array.from(allTopics.entries())
    .map(([key, topicContent]) => generateSectionHTML(topicContent, `help-${key}`))
    .join('\n')

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${escapeHtml(content.title)} - Help</title>
        <style>${HELP_WINDOW_STYLES}</style>
        <script>${navigationScript}</script>
      </head>
      <body>
        <button id="back-btn" class="back-btn" onclick="navigateBack()">
          &larr; Back
        </button>
        ${sectionsHTML}
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
