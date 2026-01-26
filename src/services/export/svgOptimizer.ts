/**
 * SVGO wrapper with safe optimization settings
 *
 * Optimizes SVG content before export without breaking:
 * - Visual appearance (preserves viewBox for scalability)
 * - Interactive functionality (preserves IDs for rotation transforms)
 * - Accessibility (preserves descriptions)
 *
 * Based on SVGO v4.0.0+ preset-default with conservative overrides
 * Research: .planning/phases/18-export-polish/18-RESEARCH.md Pattern 1
 */

import { optimize } from 'svgo';

/**
 * Result of SVG optimization with size metrics
 */
export interface OptimizationResult {
  optimizedSvg: string;
  originalSize: number;
  optimizedSize: number;
  savingsPercent: number;
}

/**
 * Combined optimization results for multiple SVGs
 */
export interface MultipleOptimizationResult {
  optimizedSvgs: string[];
  totalOriginalSize: number;
  totalOptimizedSize: number;
  savingsPercent: number;
}

/**
 * Optimize a single SVG with safe settings
 *
 * Safe overrides prevent:
 * - removeViewBox: false → keeps scalability
 * - cleanupIds: false → preserves ID references for knob rotation
 * - removeDesc: false → keeps accessibility
 * - convertShapeToPath: false → preserves shapes that may have event handlers
 * - convertTransform precision: 7 → safe precision prevents visual shifts
 *
 * @param svgContent - Raw SVG string to optimize
 * @returns Optimization result with size metrics
 */
export function optimizeSVG(svgContent: string): OptimizationResult {
  const originalSize = new Blob([svgContent]).size;

  const result = optimize(svgContent, {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            // Disable plugins that can cause visual or functional issues
            removeViewBox: false,      // Keep viewBox for scalability
            cleanupIds: false,         // Prevent ID conflicts when SVGs are combined
            removeDesc: false,         // Keep descriptions for accessibility
            convertShapeToPath: false, // Don't convert shapes (can affect styling)
            convertTransform: {        // Use safe precision for transforms
              transformPrecision: 7    // Higher precision prevents visual shifts
            }
          }
        }
      }
    ]
  });

  const optimizedSvg = result.data;
  const optimizedSize = new Blob([optimizedSvg]).size;
  const savingsPercent = ((originalSize - optimizedSize) / originalSize * 100);

  return {
    optimizedSvg,
    originalSize,
    optimizedSize,
    savingsPercent
  };
}

/**
 * Optimize multiple SVG strings in batch
 *
 * Used when optimizing multiple assets in export (SVG Graphics + Knob Styles)
 *
 * @param svgContents - Array of raw SVG strings to optimize
 * @returns Combined optimization result with total size metrics
 */
export function optimizeMultipleSVGs(svgContents: string[]): MultipleOptimizationResult {
  let totalOriginalSize = 0;
  let totalOptimizedSize = 0;
  const optimizedSvgs: string[] = [];

  for (const svg of svgContents) {
    const result = optimizeSVG(svg);
    optimizedSvgs.push(result.optimizedSvg);
    totalOriginalSize += result.originalSize;
    totalOptimizedSize += result.optimizedSize;
  }

  const savingsPercent = totalOriginalSize > 0
    ? ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100)
    : 0;

  return {
    optimizedSvgs,
    totalOriginalSize,
    totalOptimizedSize,
    savingsPercent
  };
}
