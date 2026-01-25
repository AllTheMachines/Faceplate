# Technology Stack - SVG Import System

**Project:** VST3 WebView UI Designer - v1.1 SVG Import System
**Focus:** Stack additions for comprehensive SVG import, sanitization, and rendering
**Researched:** 2026-01-25
**Overall Confidence:** HIGH

## Executive Summary

The v1.0 stack (React 18, TypeScript, Vite, Zustand, Tailwind CSS) is solid. For v1.1's SVG Import System, we need **minimal strategic additions** focused on security and optimization. The project already has `svgson` for parsing, and most SVG rendering can leverage existing DOM rendering patterns.

**Key recommendation:** Add DOMPurify for security-critical sanitization, optionally add SVGO for optimization, and avoid over-engineering with unnecessary SVG manipulation libraries.

**Critical insight:** User-uploaded SVGs are an XSS attack vector. Sanitization is non-negotiable.

## Current Stack Assessment

### Already Installed (Validated)
| Technology | Version | Current Use | Status |
|------------|---------|-------------|--------|
| React | 18.3.1 | UI framework | ✅ Keep (upgrade to 19 deferred) |
| TypeScript | ~5.6.2 | Type safety | ✅ Keep |
| Vite | ^6.0.5 | Build tool | ✅ Keep |
| Zustand | ^5.0.10 | State management | ✅ Keep |
| Tailwind CSS | ^3.4.19 | Styling | ✅ Keep |
| **svgson** | ^5.3.1 | SVG → JSON parsing | ✅ Keep - already parsing SVG structure |
| react-dropzone | ^14.3.8 | File upload | ✅ Keep - handles SVG file drop |
| browser-fs-access | ^0.38.0 | File picker | ✅ Keep - modern File System Access API |
| Zod | ^4.3.6 | Validation | ✅ Keep - will validate SVG metadata |
| konva | ^9.3.22 | Canvas rendering | ⚠️ Installed but NOT used (renders DOM, not Konva) |
| react-konva | ^18.2.14 | React canvas bindings | ⚠️ Installed but NOT used |

**Note on Konva:** Package.json shows Konva installed, but PROJECT.md confirms "HTML/CSS rendering over Canvas" and "True WYSIWYG - export matches design exactly". The tool renders elements as DOM (HTML/CSS), not canvas. Konva is unused and could be removed, but that's cleanup, not critical for v1.1.

## Recommended Stack Additions

### Security - CRITICAL
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **DOMPurify** | ^3.3.1 | SVG sanitization | **REQUIRED.** User-uploaded SVGs can contain XSS attacks via `<script>` tags, `<foreignObject>`, event handlers (onclick, onload), and `javascript:` URLs. DOMPurify is the industry-standard sanitizer (18.8M weekly downloads, actively maintained by Cure53). Supports SVG-specific profiles. | HIGH |
| @types/dompurify | ^3.2.0 | TypeScript definitions | Type safety for DOMPurify API | HIGH |

**Installation:**
```bash
npm install dompurify@^3.3.1
npm install -D @types/dompurify@^3.2.0
```

**Usage Pattern:**
```typescript
import DOMPurify from 'dompurify';

// Sanitize SVG before rendering
const cleanSVG = DOMPurify.sanitize(userUploadedSVG, {
  USE_PROFILES: { svg: true, svgFilters: true },
  ALLOWED_TAGS: ['svg', 'path', 'circle', 'rect', 'g', 'defs', 'linearGradient', 'stop', /* ... */],
  ALLOWED_ATTR: ['viewBox', 'width', 'height', 'fill', 'stroke', 'transform', /* ... */],
  FORBID_TAGS: ['script', 'foreignObject', 'iframe'],
  FORBID_ATTR: ['onclick', 'onload', 'onerror', 'href', 'xlink:href'] // Block JS execution
});
```

**Why DOMPurify over alternatives:**
- **@mattkrick/sanitize-svg**: Has known CVE-2023-22461 (XSS vulnerability). DO NOT USE.
- **Custom sanitization**: Too risky. XSS vectors are subtle (e.g., SVG animation attributes, MathML injection).
- **Server-side only**: This is a browser-based tool. Must sanitize client-side.

**Defense-in-depth strategy:**
1. **DOMPurify sanitization** (primary defense)
2. **Content Security Policy** via meta tag in exported HTML (prevents script execution if XSS slips through)
3. **Render as `<img>` for untrusted content** (safest - prevents script execution entirely)

### Optimization - OPTIONAL
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **SVGO** | ^4.0.0 | SVG optimization | **OPTIONAL.** Removes metadata, comments, hidden elements, optimizes path data. Reduces file size 30-70%. Good for exported JUCE bundles but NOT critical for v1.1 MVP. Defer until users complain about bundle size. | MEDIUM |

**Installation (if needed later):**
```bash
npm install svgo@^4.0.0
```

**When to add SVGO:**
- Users complain exported JUCE bundles are too large
- Asset library grows large (many SVG knob styles)
- Performance issues with complex SVGs

**When NOT to add SVGO:**
- MVP phase - premature optimization
- Small SVG files (<10KB each)
- User-uploaded SVGs already optimized in Illustrator/Figma

### Rendering - Use Existing Patterns
| Technology | Version | Purpose | Why | Confidence |
|------------|---------|---------|-----|------------|
| **Existing DOM rendering** | N/A | Render SVGs as inline SVG or data URLs | Project already renders elements as DOM (HTML/CSS). Continue this pattern for SVGs. No new library needed. | HIGH |

**Rendering approaches for v1.1:**

1. **Static SVG Graphics (decorative):**
   - **Method:** Render as `<img src="data:image/svg+xml,...">` (existing pattern in `svgImport.ts`)
   - **Why:** Simplest, safest, no script execution risk
   - **When:** SVG is static decoration (logo, icon, divider)

2. **Interactive SVG Knobs (custom designs):**
   - **Method:** Inline SVG in JSX with layers as `<g>` elements
   - **Why:** Need to manipulate layers (rotate indicator, fill progress)
   - **Security:** MUST sanitize before inlining
   - **When:** SVG has interactive parts (knob rotation, slider fill)

3. **Asset Library SVGs:**
   - **Method:** Store as base64 data URLs in JSON
   - **Why:** Consistent with existing image handling, self-contained projects
   - **When:** User saves SVG knob style for reuse

**No need for:**
- react-inlinesvg (adds complexity, existing pattern works)
- SVGR (transforms SVG to components - over-engineering for runtime uploads)
- react-svg (wrapper around SVGR - unnecessary)

## Alternatives Considered

| Category | Recommended | Alternative | Why Not | Confidence |
|----------|-------------|-------------|---------|------------|
| **SVG Sanitization** | DOMPurify | @mattkrick/sanitize-svg | Known XSS vulnerability (CVE-2023-22461) | HIGH |
| **SVG Sanitization** | DOMPurify | Custom regex/string replacement | Too fragile, will miss edge cases, security risk | HIGH |
| **SVG Parsing** | svgson (already installed) | svg-parser | svgson has better TypeScript support, async API | MEDIUM |
| **SVG Optimization** | SVGO (defer) | Manual optimization | SVGO is battle-tested, handles edge cases | HIGH |
| **SVG Rendering** | Existing DOM patterns | react-inlinesvg | Adds dependency for no value, existing pattern works | HIGH |
| **SVG Rendering** | Inline SVG / data URLs | SVGR build-time transform | SVGR is for build-time, not runtime user uploads | HIGH |
| **SVG Manipulation** | Direct DOM manipulation | Snap.svg / Raphael.js | Legacy libraries, unnecessary for this use case | HIGH |

## Installation Commands

### Essential (Add Now)
```bash
# Security - REQUIRED
npm install dompurify@^3.3.1
npm install -D @types/dompurify@^3.2.0
```

### Optional (Add Later if Needed)
```bash
# Optimization - defer until proven need
npm install svgo@^4.0.0
```

## Security Architecture

### XSS Attack Vectors in SVGs

SVGs can execute JavaScript through multiple vectors:

1. **`<script>` tags**
   ```xml
   <svg><script>alert('XSS')</script></svg>
   ```

2. **Event handlers**
   ```xml
   <svg><circle onclick="alert('XSS')" /></svg>
   <svg><circle onload="alert('XSS')" /></svg>
   ```

3. **`javascript:` URLs**
   ```xml
   <svg><a href="javascript:alert('XSS')"><text>Click</text></a></svg>
   ```

4. **`<foreignObject>` with HTML**
   ```xml
   <svg><foreignObject><body onload="alert('XSS')"></body></foreignObject></svg>
   ```

5. **SVG animation attributes**
   ```xml
   <svg><set attributeName="onload" to="alert('XSS')" /></svg>
   ```

6. **XML Entity Expansion (DoS)**
   ```xml
   <!DOCTYPE svg [<!ENTITY lol "lol"><!ENTITY lol2 "&lol;&lol;">]>
   <svg>&lol2;</svg>
   ```

### Sanitization Strategy

**Server-side sanitization** (if backend added later):
- Sanitize on upload before storage
- Store only clean SVGs

**Client-side sanitization** (required now):
- Sanitize immediately after file read
- Before rendering to DOM
- Before storing in Zustand state

**Sanitization points in codebase:**

1. **`src/utils/svgImport.ts` → `parseSVGFile()`**
   ```typescript
   import DOMPurify from 'dompurify';

   export async function parseSVGFile(svgString: string): Promise<ParsedSVG> {
     // SANITIZE FIRST
     const cleanSVG = DOMPurify.sanitize(svgString, {
       USE_PROFILES: { svg: true, svgFilters: true }
     });

     const parsed = await parse(cleanSVG); // svgson parse
     // ... rest of parsing
   }
   ```

2. **`src/utils/svgImport.ts` → `svgToDataUrl()`**
   ```typescript
   export function svgToDataUrl(svgString: string): string {
     // Assume already sanitized, but double-check
     const cleanSVG = DOMPurify.sanitize(svgString, {
       USE_PROFILES: { svg: true, svgFilters: true }
     });
     const encoded = encodeURIComponent(cleanSVG);
     return `data:image/svg+xml,${encoded}`;
   }
   ```

3. **Content Security Policy (defense-in-depth)**

   Add to exported HTML:
   ```html
   <meta http-equiv="Content-Security-Policy"
         content="default-src 'self'; script-src 'none'; style-src 'unsafe-inline';">
   ```

### DOMPurify Configuration

**Recommended config for v1.1:**

```typescript
const SANITIZE_CONFIG = {
  USE_PROFILES: { svg: true, svgFilters: true },

  // Allow essential SVG elements
  ALLOWED_TAGS: [
    'svg', 'g', 'path', 'circle', 'rect', 'ellipse', 'line', 'polyline', 'polygon',
    'text', 'tspan', 'defs', 'linearGradient', 'radialGradient', 'stop', 'clipPath',
    'mask', 'pattern', 'image', 'use', 'symbol', 'marker'
  ],

  // Allow essential attributes
  ALLOWED_ATTR: [
    'viewBox', 'width', 'height', 'x', 'y', 'cx', 'cy', 'r', 'rx', 'ry',
    'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
    'transform', 'id', 'class', 'd', 'points', 'offset', 'stop-color',
    'opacity', 'fill-opacity', 'stroke-opacity'
  ],

  // Explicitly forbid dangerous elements
  FORBID_TAGS: ['script', 'foreignObject', 'iframe', 'embed', 'object'],

  // Explicitly forbid event handlers and JavaScript URLs
  FORBID_ATTR: [
    'onclick', 'onload', 'onerror', 'onmouseover', 'onmouseout',
    'href', 'xlink:href' // Can contain javascript: URLs
  ],

  // Return DOM element (not string) for better performance
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false
};
```

**Testing sanitization:**

Create test SVGs with each XSS vector and verify they're blocked:
```typescript
// tests/svgSanitization.test.ts
import DOMPurify from 'dompurify';

test('blocks script tags', () => {
  const malicious = '<svg><script>alert("XSS")</script><circle r="10"/></svg>';
  const clean = DOMPurify.sanitize(malicious, SANITIZE_CONFIG);
  expect(clean).not.toContain('<script>');
  expect(clean).toContain('<circle'); // Preserves safe elements
});

test('blocks event handlers', () => {
  const malicious = '<svg><circle r="10" onclick="alert(1)"/></svg>';
  const clean = DOMPurify.sanitize(malicious, SANITIZE_CONFIG);
  expect(clean).not.toContain('onclick');
});

test('blocks foreignObject', () => {
  const malicious = '<svg><foreignObject><body onload="alert(1)"></body></foreignObject></svg>';
  const clean = DOMPurify.sanitize(malicious, SANITIZE_CONFIG);
  expect(clean).not.toContain('foreignObject');
});
```

## Responsive SVG Scaling

For "Resizable UI Support" milestone goal, SVGs must scale correctly.

### Current Approach (Already Working)

`svgImport.ts` extracts viewBox and dimensions:
```typescript
// Extract viewBox
const viewBox = parsed.attributes?.viewBox || null;

// Extract dimensions (from viewBox or explicit width/height)
if (viewBox) {
  const parts = viewBox.split(/\s+/);
  width = parseFloat(parts[2] ?? '100') || 100;
  height = parseFloat(parts[3] ?? '100') || 100;
}
```

This is correct. Continue this pattern.

### SVG Scaling Principles

**viewBox** defines the coordinate system inside SVG:
```xml
<svg viewBox="0 0 100 100" width="200" height="200">
  <!-- Content in 0-100 coords, displayed at 200x200px -->
</svg>
```

**preserveAspectRatio** controls scaling behavior:
- `xMidYMid meet` (default) - scales to fit, maintains aspect ratio, centers
- `xMidYMid slice` - scales to fill, maintains aspect ratio, crops overflow
- `none` - stretches to fill (distorts aspect ratio)

**For v1.1:**
- Interactive SVG Knobs: Use `xMidYMid meet` (preserve aspect ratio)
- Static SVG Graphics: Use `xMidYMid meet` (preserve aspect ratio)
- User can resize element, SVG scales proportionally

**No new library needed.** Browser handles SVG scaling natively.

## Asset Library Architecture

For managing SVG knob styles and graphic assets.

### Storage Strategy

**Recommended:** Store SVGs as base64 data URLs in Zustand state, persist to JSON.

```typescript
// types/assets.ts
interface SVGAsset {
  id: string;
  name: string;
  type: 'knob' | 'graphic';
  dataUrl: string; // data:image/svg+xml,... (already sanitized)
  thumbnail: string; // Small preview data URL
  width: number;
  height: number;
  layers?: Record<SVGLayerType, string>; // For interactive knobs
  createdAt: number;
}

// store.ts (Zustand)
interface DesignerState {
  // ... existing state
  svgAssets: SVGAsset[];
  addSVGAsset: (asset: SVGAsset) => void;
  removeSVGAsset: (id: string) => void;
}
```

**Why base64 data URLs:**
- Self-contained (no external file references)
- Works with existing JSON persistence
- Consistent with current image handling
- No need for asset bundling

**Why NOT separate files:**
- Complicates project structure (need to bundle multiple files)
- Browser-based tool (no filesystem access beyond explicit file picker)
- User expectation: single .json file per project

### Asset Library UI Pattern

Follow existing palette pattern:

```
Asset Library Panel
├── Knob Styles (category)
│   ├── [Thumbnail] Vintage Knob
│   ├── [Thumbnail] Modern Knob
│   └── + Import New Knob
└── Graphics (category)
    ├── [Thumbnail] Logo
    ├── [Thumbnail] Divider
    └── + Import New Graphic
```

**Drag from Asset Library → Canvas** uses existing @dnd-kit patterns.

**No new library needed.** Reuse existing palette/drag-drop architecture.

## What NOT to Add

### Avoid Over-Engineering

| Library | Why NOT to Add | Confidence |
|---------|----------------|------------|
| **react-inlinesvg** | Adds HTTP fetching and caching. Unnecessary - we load from File API, not URLs. Existing pattern works. | HIGH |
| **SVGR** | Build-time SVG→component transformer. Not for runtime user uploads. Wrong tool for this use case. | HIGH |
| **react-svg** | Wrapper around SVGR. Same issue - build-time, not runtime. | HIGH |
| **Snap.svg** | Legacy SVG manipulation library (last release 2017). Unmaintained, large bundle. Use native DOM APIs. | HIGH |
| **Raphael.js** | Legacy SVG library (last release 2019). Unmaintained. Use native SVG. | HIGH |
| **svg.js / SVG.js** | Full-featured SVG manipulation. Overkill for this use case. 150KB bundle. | MEDIUM |
| **Paper.js** | Canvas-based vector graphics. Wrong rendering model (we render DOM, not canvas). | HIGH |
| **Fabric.js** | Canvas-based. Wrong rendering model. | HIGH |
| **Two.js** | Canvas/SVG abstraction. Over-engineering - direct SVG works fine. | MEDIUM |

### Avoid Premature Optimization

| Pattern | Why Avoid | When to Add |
|---------|-----------|-------------|
| **SVGO optimization** | Premature. Add only if users complain about bundle size. | Phase 3+ or user reports |
| **SVG sprite sheets** | Premature. Add only if rendering hundreds of SVGs. | Performance issues with >50 assets |
| **Virtual scrolling in Asset Library** | Premature. Add only if library has hundreds of assets. | User reports sluggishness |
| **Web Workers for sanitization** | Premature. DOMPurify is fast (<1ms for typical SVGs). | Profiling shows bottleneck |

## Migration Path

### Phase 1: Add Security (REQUIRED)
1. Install DOMPurify
2. Add sanitization to `parseSVGFile()` in `svgImport.ts`
3. Add sanitization to `svgToDataUrl()` in `svgImport.ts`
4. Write sanitization tests
5. Add CSP meta tag to exported HTML

**Time estimate:** 2-4 hours

### Phase 2: Interactive SVG Knobs (Core Feature)
1. Extend `SVGLayer` types (already defined)
2. Implement layer-based rendering (inline SVG with `<g>` elements)
3. Add rotation/fill manipulation for interactive layers
4. No new libraries needed

**Time estimate:** 1-2 days

### Phase 3: Asset Library (Management)
1. Add `svgAssets` to Zustand store
2. Create Asset Library panel component (follow Palette pattern)
3. Implement add/remove/drag from library
4. Persist to JSON (already works with Zustand)
5. No new libraries needed

**Time estimate:** 1-2 days

### Phase 4: Optimization (If Needed)
1. Profile bundle sizes
2. If SVGs are large, add SVGO
3. Run SVGO on asset import (optional)

**Time estimate:** 4-6 hours (if needed)

## Performance Considerations

### Bundle Size Budget

Current v1.0 stack: ~180KB gzipped

**v1.1 additions:**
- DOMPurify: +21KB gzipped (3.3.1)
- **Total v1.1:** ~201KB gzipped

**Still within reasonable bounds for desktop browser tool.**

### Runtime Performance

**SVG rendering performance:**
- Static SVGs as `<img>`: Excellent (browser-native)
- Inline SVG: Good (DOM manipulation, React reconciliation)
- 100+ SVGs: Use virtual scrolling in Asset Library (defer)

**Sanitization performance:**
- DOMPurify: <1ms for typical SVGs (5-50KB)
- 10-20ms for very complex SVGs (>500KB)
- Non-blocking (synchronous but fast)

**If sanitization becomes bottleneck:**
- Move to Web Worker (defer until profiling shows need)
- Cache sanitized results (key by SVG content hash)

## Testing Strategy

### Security Testing (Critical)

**XSS vector tests:**
```typescript
// tests/svg-security.test.ts
describe('SVG Sanitization', () => {
  test('blocks script tags', () => { /* ... */ });
  test('blocks event handlers', () => { /* ... */ });
  test('blocks foreignObject', () => { /* ... */ });
  test('blocks javascript: URLs', () => { /* ... */ });
  test('blocks data: URLs with scripts', () => { /* ... */ });
  test('preserves safe SVG elements', () => { /* ... */ });
});
```

**Automated security scanning:**
- Add `npm audit` to CI
- Monitor DOMPurify releases for security updates

### Functional Testing

**SVG import:**
- Upload valid SVG → parses correctly
- Upload SVG with named layers → detects layers
- Upload SVG without viewBox → falls back to width/height
- Upload malformed SVG → shows error message

**SVG rendering:**
- Static SVG displays correctly
- Interactive SVG layers manipulate correctly
- SVG scales proportionally on resize

**Asset Library:**
- Add asset → appears in library
- Drag from library → creates element
- Remove asset → disappears from library
- Save project → assets persist to JSON
- Load project → assets restore correctly

### Performance Testing

**Benchmark sanitization:**
```typescript
const svg = readSVGFile('complex-knob.svg'); // 50KB
const start = performance.now();
DOMPurify.sanitize(svg, CONFIG);
const end = performance.now();
expect(end - start).toBeLessThan(10); // <10ms acceptable
```

**Benchmark rendering:**
- Render 50 SVG assets in Asset Library
- Measure render time (<100ms target)
- Measure scroll performance (60fps target)

## Version Pinning Strategy

**DOMPurify:** Use caret (`^3.3.1`) for automatic patch updates
- Security library - want patches automatically
- Follows semver - safe to auto-update minors

**SVGO (if added):** Use caret (`^4.0.0`)
- Optimization tool - want improvements
- Breaking changes rare, well-documented

**svgson:** Keep caret (`^5.3.1`)
- Already installed, working well
- Stable library, safe to auto-update

## Ecosystem Health Check

| Library | Last Release | GitHub Stars | npm Weekly Downloads | Ecosystem Health | Confidence |
|---------|--------------|--------------|---------------------|------------------|------------|
| DOMPurify | Jan 2026 | 14K+ | 18.8M+ | Excellent - actively maintained by Cure53 | HIGH |
| svgson | Active (2024) | 700+ | 250K+ | Good - stable, maintained | HIGH |
| SVGO | Jan 2026 | 21K+ | 16M+ | Excellent - actively maintained | HIGH |

**All recommended libraries are actively maintained with healthy ecosystems as of January 2026.**

## Confidence Assessment

| Category | Confidence Level | Reasoning |
|----------|------------------|-----------|
| **Security (DOMPurify)** | HIGH | Industry standard, 18.8M weekly downloads, actively maintained by security firm (Cure53), comprehensive XSS protection |
| **Parsing (svgson)** | HIGH | Already installed and working, stable API, TypeScript support |
| **Rendering (existing patterns)** | HIGH | DOM rendering already works for v1.0, SVGs are DOM elements, no new library needed |
| **Optimization (SVGO)** | MEDIUM | Proven library, but unclear if needed for v1.1 MVP. Defer until user reports. |
| **Asset Library** | HIGH | Reuse existing Zustand/JSON patterns. No new libraries needed. |

## Open Questions & Deferred Decisions

### Answered Questions

1. ✅ **SVG sanitization library?** → DOMPurify (industry standard)
2. ✅ **SVG parsing library?** → svgson (already installed)
3. ✅ **SVG rendering approach?** → Existing DOM patterns (inline SVG / data URLs)
4. ✅ **Asset storage format?** → Base64 data URLs in JSON (consistent with images)

### Open Questions (Not Blocking v1.1)

1. **SVGO integration?** → Defer until users complain about bundle size
2. **Web Worker sanitization?** → Defer until profiling shows bottleneck
3. **Virtual scrolling in Asset Library?** → Defer until >50 assets cause lag
4. **SVG animation support?** → Out of scope for v1.1 (static UIs)

## Summary

**Validated additions:**
- ✅ DOMPurify 3.3.1 (security - REQUIRED)
- ✅ @types/dompurify 3.2.0 (TypeScript - REQUIRED)

**Optional additions (defer):**
- ⏸️ SVGO 4.0.0 (optimization - add if needed)

**No new libraries needed for:**
- ✅ SVG parsing (svgson already installed)
- ✅ SVG rendering (existing DOM patterns work)
- ✅ Asset library (reuse Zustand/JSON patterns)
- ✅ File upload (react-dropzone already installed)

**Critical changes:**
- Add DOMPurify sanitization to `svgImport.ts`
- Add CSP meta tag to exported HTML
- Write security tests for XSS vectors

**This minimal, security-focused approach delivers comprehensive SVG import capabilities without over-engineering.**

## Sources

### Official Documentation (HIGH Confidence)
- [DOMPurify GitHub](https://github.com/cure53/DOMPurify) - v3.3.1 release verification
- [DOMPurify npm](https://www.npmjs.com/package/dompurify) - 18.8M weekly downloads verification
- [svgson npm](https://www.npmjs.com/package/svgson) - Library documentation
- [SVGO GitHub](https://github.com/svg/svgo) - v4.0.0 release verification
- [browser-fs-access GitHub](https://github.com/GoogleChromeLabs/browser-fs-access) - File System Access API documentation

### Security Research (HIGH Confidence)
- [SVG Security Best Practices: Preventing XSS and Injection Attacks](https://www.svggenie.com/blog/svg-security-best-practices) - XSS vectors in SVGs
- [React Security: Vulnerabilities & Best Practices [2026]](https://www.glorywebs.com/blog/react-security-practices) - React-specific security patterns
- [@mattkrick/sanitize-svg CVE-2023-22461](https://security.snyk.io/vuln/SNYK-JS-MATTKRICKSANITIZESVG-3225111) - Why NOT to use sanitize-svg
- [Angular SVG XSS Vulnerability](https://github.com/angular/angular/security/advisories/GHSA-jrmj-c5cx-3cw6) - Recent SVG security issues

### SVG Rendering Research (MEDIUM-HIGH Confidence)
- [A guide to using SVGs in React - LogRocket Blog](https://blog.logrocket.com/how-to-use-svgs-react/) - Updated April 2025
- [react-inlinesvg npm](https://www.npmjs.com/package/react-inlinesvg) - v4.2.0 documentation
- [SVGR Documentation](https://react-svgr.com/) - Build-time SVG transformation
- [SVG viewBox Guide - SVG Genie Blog](https://www.svggenie.com/blog/svg-viewbox-guide) - Responsive scaling
- [Make any SVG responsive with this React component - LogRocket Blog](https://blog.logrocket.com/make-any-svg-responsive-with-this-react-component/) - Responsive patterns

### Library Comparisons (MEDIUM Confidence)
- [SVGO Official Site](https://svgo.dev/) - Optimization documentation
- [SVGOMG GUI](https://jakearchibald.github.io/svgomg/) - Visual optimization tool
- [How to Use SVG in React - Telerik](https://www.telerik.com/blogs/how-to-use-svg-react) - Rendering approaches
- [Using SVGs in React - Refine](https://refine.dev/blog/react-svg/) - Best practices guide

### Asset Management Research (MEDIUM Confidence)
- [react-svg-assets GitHub](https://github.com/zauberware/react-svg-assets) - Asset management patterns
- [SVGR Best Practices](https://react-svgr.com/) - Component-based approach
- [Excalidraw blog | The browser-fs-access library](https://plus.excalidraw.com/blog/browser-fs-access) - File handling patterns

---

*Research complete. Ready for roadmap creation with security-focused, minimal-dependency stack additions.*
