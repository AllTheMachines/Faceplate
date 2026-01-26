import React, { useMemo } from 'react';
import { sanitizeSVG } from '../lib/svg-sanitizer';

interface SafeSVGProps {
  content: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * SafeSVG - Safe SVG Rendering Component
 *
 * This component is the single point through which ALL SVG content must be rendered.
 * It implements defense-in-depth by re-sanitizing content before every render,
 * even if the content was previously sanitized and stored.
 *
 * Security rationale:
 * - Stored content could be tampered with (database compromise, file system access)
 * - Re-sanitization adds minimal overhead with useMemo
 * - Defense-in-depth is critical for security-sensitive operations
 *
 * Usage:
 * ```tsx
 * <SafeSVG content={svgString} className="w-full h-full" />
 * ```
 *
 * @implements SEC-08 (SafeSVG component requirement)
 * @implements SEC-03 (re-sanitize before render - prepared for Phase 16 canvas integration)
 */
export const SafeSVG: React.FC<SafeSVGProps> = ({ content, className, style }) => {
  // Always re-sanitize, even if content was sanitized before
  // This is defense-in-depth - stored content could be tampered with
  const sanitized = useMemo(() => {
    return sanitizeSVG(content);
  }, [content]);

  // Wrapper ensures SVG scales to fit container regardless of SVG's native dimensions
  // The [&>svg] selector targets the direct SVG child
  return (
    <div
      className={`${className || ''} [&>svg]:max-w-full [&>svg]:max-h-full [&>svg]:w-auto [&>svg]:h-auto`}
      style={{
        ...style,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      dangerouslySetInnerHTML={{ __html: sanitized }}
    />
  );
};
