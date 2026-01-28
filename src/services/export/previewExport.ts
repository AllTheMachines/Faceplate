/**
 * Browser preview for exported HTML
 * Opens a new tab with the exported HTML using blob URL
 */

import type { ElementConfig } from '../../types/elements';
import { generateHTML } from './htmlGenerator';
import { generateCSS } from './cssGenerator';
import { generateBindingsJS, generateComponentsJS, generateMockJUCE, generateResponsiveScaleJS, generateCustomScrollbarJS } from './jsGenerator';

export interface PreviewOptions {
  elements: ElementConfig[];
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
  enableResponsiveScaling?: boolean;
}

export interface MultiWindowPreviewOptions {
  windows: {
    id: string;
    name: string;
    elements: ElementConfig[];
    width: number;
    height: number;
    backgroundColor: string;
  }[];
  activeWindowId: string;
  enableResponsiveScaling?: boolean;
}

/**
 * Generate and open preview HTML in new browser tab
 * Uses blob URL for instant preview without download
 * Includes mock JUCE backend for interactivity testing
 */
export async function previewHTMLExport(options: PreviewOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const { elements, canvasWidth, canvasHeight, backgroundColor, enableResponsiveScaling = true } = options;

    // Debug: Log elements being exported
    console.log('[Preview] Exporting elements:', elements.length);
    elements.forEach((el, i) => {
      console.log(`  [${i}] ${el.type}: "${el.name}" at (${el.x}, ${el.y})`);
    });

    // Generate HTML structure
    const html = generateHTML(elements, {
      canvasWidth,
      canvasHeight,
      backgroundColor,
      isPreviewMode: true,
    });

    // Generate CSS
    const css = await generateCSS(elements, {
      canvasWidth,
      canvasHeight,
      backgroundColor,
    });

    // Generate JavaScript
    const bindingsJS = generateBindingsJS(elements, { isPreviewMode: true });
    const componentsJS = generateComponentsJS(elements);
    const mockJUCE = generateMockJUCE();
    const responsiveJS = enableResponsiveScaling
      ? generateResponsiveScaleJS(canvasWidth, canvasHeight)
      : '';
    const scrollbarJS = generateCustomScrollbarJS();

    // Build standalone HTML with all assets inline
    const standaloneHTML = buildStandaloneHTML({
      html,
      css,
      bindingsJS,
      componentsJS,
      mockJUCE,
      responsiveJS,
      scrollbarJS,
    });

    // Create blob and open in new tab
    const blob = new Blob([standaloneHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const previewWindow = window.open(url, '_blank');

    if (!previewWindow) {
      return {
        success: false,
        error: 'Popup blocked. Please allow popups for preview.',
      };
    }

    // Clean up blob URL after window loads (give it time)
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Preview failed',
    };
  }
}

/**
 * Build standalone HTML with all CSS/JS inline
 */
function buildStandaloneHTML(parts: {
  html: string;
  css: string;
  bindingsJS: string;
  componentsJS: string;
  mockJUCE: string;
  responsiveJS: string;
  scrollbarJS: string;
}): string {
  const { html, css, bindingsJS, componentsJS, mockJUCE, responsiveJS, scrollbarJS } = parts;

  // Replace external CSS/JS references with inline content
  // Original HTML has: <link rel="stylesheet" href="style.css">
  // and <script src="...">

  let standaloneHTML = html;

  // Replace CSS link with inline style
  standaloneHTML = standaloneHTML.replace(
    '<link rel="stylesheet" href="style.css">',
    `<style>\n${css}\n</style>`
  );

  // Replace script tags with inline scripts
  // Add mock JUCE first (must initialize before bindings)
  standaloneHTML = standaloneHTML.replace(
    '<script src="components.js"></script>',
    `<script>\n${mockJUCE}\n</script>\n<script>\n${componentsJS}\n</script>`
  );

  // Add responsive JS and custom scrollbar JS
  const additionalScripts = [responsiveJS, scrollbarJS].filter(Boolean).map(js => `<script>\n${js}\n</script>`).join('\n');

  standaloneHTML = standaloneHTML.replace(
    '<script src="bindings.js"></script>',
    `<script>\n${bindingsJS}\n</script>${additionalScripts ? `\n${additionalScripts}` : ''}`
  );

  return standaloneHTML;
}

/**
 * Generate and open multi-window preview in new browser tab
 * All windows are rendered in one page with tab navigation
 */
export async function previewMultiWindowExport(options: MultiWindowPreviewOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const { windows, activeWindowId, enableResponsiveScaling = true } = options;

    if (windows.length === 0) {
      return { success: false, error: 'No windows to preview' };
    }

    // Find the largest window dimensions for the container
    const maxWidth = Math.max(...windows.map(w => w.width));
    const maxHeight = Math.max(...windows.map(w => w.height));

    // Generate content for each window
    const windowsContent: { id: string; name: string; html: string; css: string; bindingsJS: string; width: number; height: number; backgroundColor: string }[] = [];

    for (const window of windows) {
      const html = generateHTML(window.elements, {
        canvasWidth: window.width,
        canvasHeight: window.height,
        backgroundColor: window.backgroundColor,
        isPreviewMode: true,
      });

      const css = await generateCSS(window.elements, {
        canvasWidth: window.width,
        canvasHeight: window.height,
        backgroundColor: window.backgroundColor,
      });

      // Build window mapping for navigation (preview uses window IDs directly)
      const windowMapping: Record<string, string> = {};
      for (const w of windows) {
        if (w.id !== window.id) {
          windowMapping[w.id] = w.id; // In preview, we use IDs for show/hide
        }
      }

      const bindingsJS = generateBindingsJS(window.elements, {
        isPreviewMode: true,
        windowMapping: Object.keys(windowMapping).length > 0 ? windowMapping : undefined,
      });

      windowsContent.push({
        id: window.id,
        name: window.name,
        html,
        css,
        bindingsJS,
        width: window.width,
        height: window.height,
        backgroundColor: window.backgroundColor,
      });
    }

    // Generate combined HTML
    const combinedHTML = buildMultiWindowPreviewHTML({
      windows: windowsContent,
      activeWindowId,
      maxWidth,
      maxHeight,
      enableResponsiveScaling,
    });

    // Create blob and open in new tab
    const blob = new Blob([combinedHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);

    const previewWindow = window.open(url, '_blank');

    if (!previewWindow) {
      return {
        success: false,
        error: 'Popup blocked. Please allow popups for preview.',
      };
    }

    // Clean up blob URL after window loads
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 5000);

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Preview failed',
    };
  }
}

/**
 * Build combined HTML for multi-window preview with tab navigation
 */
function buildMultiWindowPreviewHTML(options: {
  windows: { id: string; name: string; html: string; css: string; bindingsJS: string; width: number; height: number; backgroundColor: string }[];
  activeWindowId: string;
  maxWidth: number;
  maxHeight: number;
  enableResponsiveScaling: boolean;
}): string {
  const { windows, activeWindowId, maxWidth, maxHeight, enableResponsiveScaling } = options;

  // Generate mock JUCE and common scripts
  const mockJUCE = generateMockJUCE();
  const componentsJS = generateComponentsJS(windows.flatMap(w => [])); // Empty - we'll generate per window
  const responsiveJS = enableResponsiveScaling ? generateResponsiveScaleJS(maxWidth, maxHeight) : '';
  const scrollbarJS = generateCustomScrollbarJS();

  // Extract body content from each window's HTML
  const windowBodies = windows.map(w => {
    // Extract content between <body> tags
    const bodyMatch = w.html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    const bodyContent = bodyMatch ? bodyMatch[1] : '';
    return { ...w, bodyContent };
  });

  // Combine all CSS with window-specific prefixes
  const combinedCSS = windows.map(w => {
    // Prefix all CSS selectors with the window container ID
    return w.css.replace(/([^\r\n,{}]+)(,(?=[^}]*{)|\s*{)/g, (match, selector, suffix) => {
      // Don't prefix keyframes, media queries, or comments
      if (selector.trim().startsWith('@') || selector.trim().startsWith('/*')) {
        return match;
      }
      // Add window-specific prefix
      return `#window-${w.id} ${selector.trim()}${suffix}`;
    });
  }).join('\n\n');

  // Generate tab bar HTML
  const tabBarHTML = `
    <div id="window-tabs" style="
      display: flex;
      gap: 2px;
      padding: 8px;
      background: #1a1a1a;
      border-bottom: 1px solid #333;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 10000;
    ">
      ${windows.map(w => `
        <button
          class="window-tab ${w.id === activeWindowId ? 'active' : ''}"
          data-window-id="${w.id}"
          style="
            padding: 6px 16px;
            border: none;
            border-radius: 4px;
            background: ${w.id === activeWindowId ? '#3b82f6' : '#333'};
            color: white;
            cursor: pointer;
            font-size: 13px;
            transition: background 0.2s;
          "
        >${w.name}</button>
      `).join('')}
    </div>
  `;

  // Generate window containers
  const windowContainersHTML = windowBodies.map(w => `
    <div
      id="window-${w.id}"
      class="window-container"
      data-window-id="${w.id}"
      style="
        display: ${w.id === activeWindowId ? 'block' : 'none'};
        width: ${w.width}px;
        height: ${w.height}px;
        background: ${w.backgroundColor};
        position: relative;
        margin: 0 auto;
      "
    >
      ${w.bodyContent}
    </div>
  `).join('\n');

  // Navigation script that handles tab switching and button navigation
  const navigationScript = `
    // Window navigation for preview
    window.__WINDOW_MAPPING__ = ${JSON.stringify(Object.fromEntries(windows.map(w => [w.id, w.id])))};

    function switchToWindow(windowId) {
      // Hide all windows
      document.querySelectorAll('.window-container').forEach(el => {
        el.style.display = 'none';
      });
      // Show target window
      const targetWindow = document.getElementById('window-' + windowId);
      if (targetWindow) {
        targetWindow.style.display = 'block';
      }
      // Update tab styles
      document.querySelectorAll('.window-tab').forEach(tab => {
        if (tab.dataset.windowId === windowId) {
          tab.style.background = '#3b82f6';
          tab.classList.add('active');
        } else {
          tab.style.background = '#333';
          tab.classList.remove('active');
        }
      });
    }

    // Tab click handlers
    document.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('.window-tab').forEach(tab => {
        tab.addEventListener('click', () => {
          switchToWindow(tab.dataset.windowId);
        });
      });
    });

    // Override window.location.href for navigation buttons
    const originalLocationDescriptor = Object.getOwnPropertyDescriptor(window, 'location');
    // We can't override location.href directly, so we intercept button clicks
    document.addEventListener('click', (e) => {
      const button = e.target.closest('button[data-action="navigate-window"]');
      if (button) {
        const targetId = button.dataset.targetWindow;
        if (targetId && window.__WINDOW_MAPPING__[targetId]) {
          e.preventDefault();
          e.stopPropagation();
          switchToWindow(targetId);
        }
      }
    }, true);
  `;

  // Combine all bindings JS
  const allBindingsJS = windows.map(w => `
    // Bindings for window: ${w.name}
    (function() {
      const originalGetElementById = document.getElementById.bind(document);
      // Scope element lookups to current window container during init
      ${w.bindingsJS}
    })();
  `).join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Multi-Window Preview</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      background: #0a0a0a;
      padding-top: 50px; /* Space for tab bar */
      min-height: 100vh;
    }
    .window-tab:hover {
      background: #4b5563 !important;
    }
    .window-tab.active:hover {
      background: #2563eb !important;
    }
    ${combinedCSS}
  </style>
</head>
<body>
  ${tabBarHTML}
  <div id="windows-container" style="padding: 20px;">
    ${windowContainersHTML}
  </div>

  <script>${mockJUCE}</script>
  <script>${navigationScript}</script>
  <script>${allBindingsJS}</script>
  ${responsiveJS ? `<script>${responsiveJS}</script>` : ''}
  ${scrollbarJS ? `<script>${scrollbarJS}</script>` : ''}
</body>
</html>`;
}
