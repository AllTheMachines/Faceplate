import { describe, it, expect } from 'vitest';
import { sanitizeSVG, SANITIZE_CONFIG } from './svg-sanitizer';

describe('SVG Sanitizer', () => {
  describe('Configuration', () => {
    it('should export SANITIZE_CONFIG', () => {
      expect(SANITIZE_CONFIG).toBeDefined();
      expect(SANITIZE_CONFIG.ALLOWED_TAGS).toBeDefined();
      expect(SANITIZE_CONFIG.ALLOWED_ATTR).toBeDefined();
    });
  });

  describe('Script Injection Prevention', () => {
    it('should remove script tags from SVG content', () => {
      const maliciousSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <script>alert('XSS')</script>
          <circle cx="50" cy="50" r="40" fill="blue"/>
        </svg>
      `;

      const sanitized = sanitizeSVG(maliciousSVG);

      expect(sanitized).not.toContain('<script');
      expect(sanitized).not.toContain('alert');
      expect(sanitized).toContain('<circle');
      expect(sanitized).toContain('fill="blue"');
    });

    it('should remove nested script tags', () => {
      const maliciousSVG = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <g>
            <script>console.log('evil')</script>
            <path d="M10 10 L20 20"/>
          </g>
        </svg>
      `;

      const sanitized = sanitizeSVG(maliciousSVG);

      expect(sanitized).not.toContain('<script');
      expect(sanitized).toContain('<g');
      expect(sanitized).toContain('<path');
    });
  });

  describe('ForeignObject Prevention', () => {
    it('should remove foreignObject elements', () => {
      const maliciousSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <foreignObject width="100" height="100">
            <div xmlns="http://www.w3.org/1999/xhtml">
              <script>alert('XSS')</script>
            </div>
          </foreignObject>
          <rect x="10" y="10" width="80" height="80" fill="red"/>
        </svg>
      `;

      const sanitized = sanitizeSVG(maliciousSVG);

      expect(sanitized).not.toContain('foreignObject');
      expect(sanitized).not.toContain('<div');
      expect(sanitized).toContain('<rect');
    });
  });

  describe('SMIL Animation Prevention', () => {
    it('should remove animate elements', () => {
      const svgWithAnimation = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40">
            <animate attributeName="r" from="40" to="0" dur="1s"/>
          </circle>
        </svg>
      `;

      const sanitized = sanitizeSVG(svgWithAnimation);

      expect(sanitized).not.toContain('<animate');
      expect(sanitized).toContain('<circle');
    });

    it('should remove animateTransform elements', () => {
      const svgWithAnimation = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <rect width="100" height="100">
            <animateTransform attributeName="transform" type="rotate"/>
          </rect>
        </svg>
      `;

      const sanitized = sanitizeSVG(svgWithAnimation);

      expect(sanitized).not.toContain('animateTransform');
      expect(sanitized).toContain('<rect');
    });
  });

  describe('External URL Prevention', () => {
    it('should block external xlink:href URLs', () => {
      const svgWithExternalRef = `
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <image xlink:href="http://evil.com/malicious.svg" width="100" height="100"/>
          <rect x="0" y="0" width="50" height="50" fill="green"/>
        </svg>
      `;

      const sanitized = sanitizeSVG(svgWithExternalRef);

      expect(sanitized).not.toContain('http://evil.com');
      expect(sanitized).toContain('<rect');
    });

    it('should block javascript: URLs in href', () => {
      const svgWithJavaScript = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <a href="javascript:alert('XSS')">
            <circle cx="50" cy="50" r="40"/>
          </a>
        </svg>
      `;

      const sanitized = sanitizeSVG(svgWithJavaScript);

      expect(sanitized).not.toContain('javascript:');
      expect(sanitized).toContain('<circle');
    });

    it('should allow fragment references (internal IDs)', () => {
      const svgWithFragment = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1">
              <stop offset="0%" stop-color="red"/>
              <stop offset="100%" stop-color="blue"/>
            </linearGradient>
          </defs>
          <rect fill="url(#grad1)" width="100" height="100"/>
        </svg>
      `;

      const sanitized = sanitizeSVG(svgWithFragment);

      expect(sanitized).toContain('#grad1');
      expect(sanitized).toContain('linearGradient');
      expect(sanitized).toContain('stop');
    });
  });

  describe('Safe SVG Element Preservation', () => {
    it('should preserve path elements', () => {
      const validSVG = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
          <path d="M10 10 L90 90 L10 90 Z" fill="purple"/>
        </svg>
      `;

      const sanitized = sanitizeSVG(validSVG);

      expect(sanitized).toContain('<path');
      expect(sanitized).toContain('d="M10 10 L90 90 L10 90 Z"');
      expect(sanitized).toContain('fill="purple"');
    });

    it('should preserve circle, rect, and ellipse elements', () => {
      const validSVG = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="40" fill="red"/>
          <rect x="10" y="10" width="30" height="30" fill="green"/>
          <ellipse cx="50" cy="50" rx="40" ry="20" fill="blue"/>
        </svg>
      `;

      const sanitized = sanitizeSVG(validSVG);

      expect(sanitized).toContain('<circle');
      expect(sanitized).toContain('<rect');
      expect(sanitized).toContain('<ellipse');
    });

    it('should preserve line, polyline, and polygon elements', () => {
      const validSVG = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <line x1="0" y1="0" x2="100" y2="100" stroke="black"/>
          <polyline points="0,0 50,25 100,0" stroke="red" fill="none"/>
          <polygon points="50,0 100,100 0,100" fill="yellow"/>
        </svg>
      `;

      const sanitized = sanitizeSVG(validSVG);

      expect(sanitized).toContain('<line');
      expect(sanitized).toContain('<polyline');
      expect(sanitized).toContain('<polygon');
    });

    it('should preserve text elements', () => {
      const validSVG = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <text x="10" y="20" font-size="14" fill="black">Hello World</text>
          <text x="10" y="40">
            <tspan>Multi</tspan>
            <tspan x="10" dy="20">Line</tspan>
          </text>
        </svg>
      `;

      const sanitized = sanitizeSVG(validSVG);

      expect(sanitized).toContain('<text');
      expect(sanitized).toContain('<tspan');
      expect(sanitized).toContain('Hello World');
    });
  });

  describe('Gradient Preservation', () => {
    it('should preserve gradients and stops', () => {
      const svgWithGradient = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" style="stop-color:rgb(255,255,0);stop-opacity:1"/>
              <stop offset="100%" style="stop-color:rgb(255,0,0);stop-opacity:1"/>
            </linearGradient>
            <radialGradient id="grad2">
              <stop offset="0%" stop-color="white"/>
              <stop offset="100%" stop-color="black"/>
            </radialGradient>
          </defs>
          <rect fill="url(#grad1)" width="100" height="50"/>
          <circle fill="url(#grad2)" cx="50" cy="75" r="25"/>
        </svg>
      `;

      const sanitized = sanitizeSVG(svgWithGradient);

      expect(sanitized).toContain('linearGradient');
      expect(sanitized).toContain('radialGradient');
      expect(sanitized).toContain('<stop');
      expect(sanitized).toContain('stop-color');
    });
  });

  describe('Transform Preservation', () => {
    it('should preserve transform attributes', () => {
      const svgWithTransform = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(50, 50) rotate(45)">
            <rect width="50" height="50" fill="orange"/>
          </g>
        </svg>
      `;

      const sanitized = sanitizeSVG(svgWithTransform);

      expect(sanitized).toContain('transform');
      expect(sanitized).toContain('translate');
      expect(sanitized).toContain('rotate');
    });
  });

  describe('Clipping and Masking Preservation', () => {
    it('should preserve clipPath elements', () => {
      const svgWithClip = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <defs>
            <clipPath id="clip1">
              <circle cx="50" cy="50" r="40"/>
            </clipPath>
          </defs>
          <rect clip-path="url(#clip1)" width="100" height="100" fill="blue"/>
        </svg>
      `;

      const sanitized = sanitizeSVG(svgWithClip);

      expect(sanitized).toContain('clipPath');
      expect(sanitized).toContain('clip-path');
    });

    it('should preserve mask elements', () => {
      const svgWithMask = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="mask1">
              <rect width="100" height="100" fill="white"/>
            </mask>
          </defs>
          <rect mask="url(#mask1)" width="100" height="100" fill="red"/>
        </svg>
      `;

      const sanitized = sanitizeSVG(svgWithMask);

      expect(sanitized).toContain('<mask');
      expect(sanitized).toContain('mask="url(#mask1)"');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty SVG', () => {
      const emptySVG = '<svg xmlns="http://www.w3.org/2000/svg"></svg>';

      const sanitized = sanitizeSVG(emptySVG);

      expect(sanitized).toContain('<svg');
      // Accept both self-closing (<svg/>) and explicit closing (</svg>) formats
      expect(sanitized.match(/<svg[^>]*\/?>/) || sanitized.includes('</svg>')).toBeTruthy();
    });

    it('should handle SVG with only dangerous content', () => {
      const dangerousSVG = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <script>alert('evil')</script>
          <foreignObject><div>bad</div></foreignObject>
        </svg>
      `;

      const sanitized = sanitizeSVG(dangerousSVG);

      expect(sanitized).not.toContain('<script');
      expect(sanitized).not.toContain('foreignObject');
      expect(sanitized).not.toContain('<div');
      expect(sanitized).toContain('<svg');
    });

    it('should handle mixed safe and dangerous content', () => {
      const mixedSVG = `
        <svg xmlns="http://www.w3.org/2000/svg">
          <g>
            <circle cx="25" cy="25" r="20" fill="blue"/>
            <script>alert('XSS')</script>
            <rect x="50" y="50" width="30" height="30" fill="red"/>
            <foreignObject><iframe src="evil.com"/></foreignObject>
          </g>
        </svg>
      `;

      const sanitized = sanitizeSVG(mixedSVG);

      expect(sanitized).toContain('<circle');
      expect(sanitized).toContain('<rect');
      expect(sanitized).toContain('<g');
      expect(sanitized).not.toContain('<script');
      expect(sanitized).not.toContain('foreignObject');
      expect(sanitized).not.toContain('iframe');
    });
  });
});
