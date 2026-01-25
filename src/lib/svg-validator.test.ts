import { describe, it, expect } from 'vitest';
import { validateSVGFile, validateSVGContent } from './svg-validator';

describe('validateSVGFile', () => {
  it('should pass for files under 1MB', () => {
    const file = new File(['<svg></svg>'], 'test.svg', {
      type: 'image/svg+xml',
    });
    Object.defineProperty(file, 'size', { value: 500 * 1024 }); // 500KB

    const result = validateSVGFile(file);

    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it('should reject files over 1MB with formatted size', () => {
    const file = new File(['<svg></svg>'], 'large.svg', {
      type: 'image/svg+xml',
    });
    Object.defineProperty(file, 'size', { value: 1.5 * 1024 * 1024 }); // 1.5MB

    const result = validateSVGFile(file);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/File too large \(1\.50MB\)\. Maximum is 1MB\./);
  });

  it('should reject files exactly at 1MB boundary + 1 byte', () => {
    const file = new File(['<svg></svg>'], 'boundary.svg', {
      type: 'image/svg+xml',
    });
    Object.defineProperty(file, 'size', { value: 1024 * 1024 + 1 }); // 1MB + 1 byte

    const result = validateSVGFile(file);

    expect(result.valid).toBe(false);
    expect(result.error).toContain('File too large');
  });
});

describe('validateSVGContent', () => {
  it('should pass for valid minimal SVG with metadata', () => {
    const validSVG = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"/></svg>';

    const result = validateSVGContent(validSVG);

    expect(result.valid).toBe(true);
    expect(result.metadata).toBeDefined();
    expect(result.metadata?.elementCount).toBeGreaterThan(0);
    expect(result.metadata?.size).toBeGreaterThan(0);
  });

  it('should reject SVG with DOCTYPE declaration (case-insensitive)', () => {
    const svgWithDoctype = '<!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"><svg></svg>';

    const result = validateSVGContent(svgWithDoctype);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/DOCTYPE not allowed/i);
  });

  it('should reject SVG with lowercase DOCTYPE', () => {
    const svgWithDoctype = '<!doctype svg><svg></svg>';

    const result = validateSVGContent(svgWithDoctype);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/DOCTYPE not allowed/i);
  });

  it('should reject malformed XML', () => {
    const malformedSVG = '<svg><circle></svg>'; // Unclosed circle tag

    const result = validateSVGContent(malformedSVG);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Invalid SVG format/i);
  });

  it('should reject SVG with too many elements (over 5000)', () => {
    // Generate SVG with 6000 circle elements
    const circles = Array(6000).fill('<circle cx="10" cy="10" r="5"/>').join('');
    const largeSVG = `<svg xmlns="http://www.w3.org/2000/svg">${circles}</svg>`;

    const result = validateSVGContent(largeSVG);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Too many elements \(6001\)\. Maximum is 5000\./);
  });

  it('should reject SVG with script tag', () => {
    const svgWithScript = '<svg xmlns="http://www.w3.org/2000/svg"><script>alert("xss")</script><circle cx="50" cy="50" r="40"/></svg>';

    const result = validateSVGContent(svgWithScript);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Rejected: SVG contains dangerous elements/i);
    expect(result.error).toContain('<script>');
  });

  it('should reject SVG with foreignObject tag', () => {
    const svgWithForeignObject = '<svg xmlns="http://www.w3.org/2000/svg"><foreignObject width="100" height="100"><div>HTML</div></foreignObject></svg>';

    const result = validateSVGContent(svgWithForeignObject);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Rejected: SVG contains dangerous elements/i);
    expect(result.error).toContain('<foreignObject>');
  });

  it('should reject SVG with animate tag', () => {
    const svgWithAnimate = '<svg xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="40"><animate attributeName="r" from="40" to="50" dur="1s"/></circle></svg>';

    const result = validateSVGContent(svgWithAnimate);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Rejected: SVG contains dangerous elements/i);
    expect(result.error).toContain('<animate>');
  });

  it('should reject SVG with animateTransform tag', () => {
    const svgWithAnimateTransform = '<svg xmlns="http://www.w3.org/2000/svg"><rect width="100" height="100"><animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="2s"/></rect></svg>';

    const result = validateSVGContent(svgWithAnimateTransform);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Rejected: SVG contains dangerous elements/i);
    expect(result.error).toContain('<animateTransform>');
  });

  it('should reject SVG with multiple dangerous elements and count them', () => {
    const svgWithMultipleDangerous = `<svg xmlns="http://www.w3.org/2000/svg">
      <script>alert(1)</script>
      <animate attributeName="x" from="0" to="100"/>
      <animate attributeName="y" from="0" to="100"/>
      <foreignObject width="100" height="100"><div>test</div></foreignObject>
    </svg>`;

    const result = validateSVGContent(svgWithMultipleDangerous);

    expect(result.valid).toBe(false);
    expect(result.error).toMatch(/Rejected: SVG contains dangerous elements/i);
    expect(result.error).toContain('<script> (1)');
    expect(result.error).toContain('<animate> (2)');
    expect(result.error).toContain('<foreignObject> (1)');
  });

  it('should pass for SVG with exactly 5000 elements', () => {
    const circles = Array(4999).fill('<circle cx="10" cy="10" r="5"/>').join('');
    const svgAt5000 = `<svg xmlns="http://www.w3.org/2000/svg">${circles}</svg>`;

    const result = validateSVGContent(svgAt5000);

    expect(result.valid).toBe(true);
    expect(result.metadata?.elementCount).toBe(5000);
  });
});
