/**
 * Browser preview for exported HTML
 * Opens a new tab with the exported HTML using blob URL
 */

import type { ElementConfig } from '../../types/elements';
import { generateHTML } from './htmlGenerator';
import { generateCSS } from './cssGenerator';
import { generateBindingsJS, generateComponentsJS, generateMockJUCE, generateResponsiveScaleJS } from './jsGenerator';

export interface PreviewOptions {
  elements: ElementConfig[];
  canvasWidth: number;
  canvasHeight: number;
  backgroundColor: string;
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

    // Generate HTML structure
    const html = generateHTML(elements, {
      canvasWidth,
      canvasHeight,
      backgroundColor,
      isPreviewMode: true,
    });

    // Generate CSS
    const css = generateCSS(elements, {
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

    // Build standalone HTML with all assets inline
    const standaloneHTML = buildStandaloneHTML({
      html,
      css,
      bindingsJS,
      componentsJS,
      mockJUCE,
      responsiveJS,
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
}): string {
  const { html, css, bindingsJS, componentsJS, mockJUCE, responsiveJS } = parts;

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

  standaloneHTML = standaloneHTML.replace(
    '<script src="bindings.js"></script>',
    `<script>\n${bindingsJS}\n</script>${responsiveJS ? `\n<script>\n${responsiveJS}\n</script>` : ''}`
  );

  return standaloneHTML;
}
