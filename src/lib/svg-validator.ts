// SVG validation functions for security checks
// Implements SEC-05 (DOCTYPE rejection), SEC-06 (size limit), SEC-07 (element limit)

export interface SVGValidationResult {
  valid: boolean;
  error?: string;
  metadata?: {
    size: number;
    elementCount: number;
  };
}

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_ELEMENT_COUNT = 5000;
const DANGEROUS_TAGS = [
  'script',
  'foreignObject',
  'animate',
  'animateTransform',
  'animateMotion',
  'set',
];

/**
 * Validates SVG file size (SEC-06)
 * Rejects files larger than 1MB with formatted error message
 */
export function validateSVGFile(file: File): SVGValidationResult {
  if (file.size > MAX_FILE_SIZE) {
    const sizeMB = (file.size / 1024 / 1024).toFixed(2);
    return {
      valid: false,
      error: `File too large (${sizeMB}MB). Maximum is 1MB.`,
    };
  }

  return { valid: true };
}

/**
 * Validates SVG content for security issues (SEC-05, SEC-07)
 * Checks for: DOCTYPE, parse errors, element count, dangerous elements
 */
export function validateSVGContent(content: string): SVGValidationResult {
  // SEC-05: Reject DOCTYPE declarations (XML bomb prevention)
  if (content.toUpperCase().includes('<!DOCTYPE')) {
    return {
      valid: false,
      error: 'DOCTYPE not allowed. Remove <!DOCTYPE> declaration and try again.',
    };
  }

  // Parse SVG content
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, 'image/svg+xml');

  // Check for parse errors
  const parseError = doc.querySelector('parsererror');
  if (parseError) {
    return {
      valid: false,
      error: 'Invalid SVG format. File could not be parsed.',
    };
  }

  // SEC-07: Count elements and check limit
  const elements = doc.querySelectorAll('*');
  const elementCount = elements.length;

  if (elementCount > MAX_ELEMENT_COUNT) {
    return {
      valid: false,
      error: `Too many elements (${elementCount}). Maximum is ${MAX_ELEMENT_COUNT}.`,
    };
  }

  // Check for dangerous elements
  const foundDangerous: Array<{ tag: string; count: number }> = [];

  DANGEROUS_TAGS.forEach((tag) => {
    const tagElements = doc.getElementsByTagName(tag);
    if (tagElements.length > 0) {
      foundDangerous.push({ tag, count: tagElements.length });
    }
  });

  if (foundDangerous.length > 0) {
    const dangerousList = foundDangerous
      .map(({ tag, count }) => `<${tag}> (${count})`)
      .join(', ');

    return {
      valid: false,
      error: `Rejected: SVG contains dangerous elements that cannot be sanitized: ${dangerousList}`,
    };
  }

  // Valid SVG - return with metadata
  return {
    valid: true,
    metadata: {
      size: content.length,
      elementCount,
    },
  };
}
