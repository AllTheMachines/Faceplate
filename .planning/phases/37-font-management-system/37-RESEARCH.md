# Phase 37: Font Management System - Research

**Researched:** 2026-01-27
**Domain:** Browser-based font management, File System Access API, font parsing
**Confidence:** MEDIUM

## Summary

Font management in browser environments presents unique challenges due to security constraints. Unlike native applications that can freely access system directories, browser-based apps must use the File System Access API with explicit user permission for each directory access. The research reveals several critical findings:

**Browser Constraints:** Web apps cannot access user home directories or arbitrary file system paths without explicit user permission per session. The concept of a "default fonts folder" like `~/.vst-ui-designer/fonts/` is incompatible with browser security models. Instead, users must manually select their fonts directory using a file picker, and this permission must be re-requested between sessions unless persistent permissions are explicitly granted (Chrome 122+).

**Font Parsing:** The opentype.js library provides comprehensive parsing for TTF, OTF, and WOFF2 formats, extracting metadata like font family names. The simpler `fontname` package offers focused metadata extraction. Both work with ArrayBuffer data from FileReader API.

**Storage Strategy:** Font files should be stored in IndexedDB as Blobs or ArrayBuffers (recommended for better compatibility). The File System Access API provides FileSystemDirectoryHandle and FileSystemFileHandle objects that can be stored in IndexedDB for persistent access, enabling automatic re-permission requests.

**Primary recommendation:** Use browser-fs-access library (already in dependencies) for cross-browser File System Access with legacy fallbacks. Store directory handles in IndexedDB for permission persistence. Use opentype.js for font metadata extraction. Implement custom dropdown for font previews (native select elements don't reliably render font-family per option across browsers).

## Standard Stack

The established libraries/tools for browser-based font management:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| browser-fs-access | 0.38.0 | File System Access with fallbacks | Already in project, provides transparent legacy browser support |
| opentype.js | 1.3.4+ | Font file parsing and metadata | Industry standard, supports TTF/OTF/WOFF2, MIT licensed |
| FontFace API | Native | Dynamic font loading | Built into modern browsers, promise-based font loading |
| IndexedDB | Native | Store font files and handles | Browser-native, supports Blob/ArrayBuffer storage |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| fontname | 1.0.0+ | Lightweight font metadata parser | Alternative to opentype.js if only metadata needed |
| idb | 8.0+ | IndexedDB wrapper | Optional, simplifies IndexedDB API if complexity becomes unwieldy |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| opentype.js | fontname | Lighter weight but less feature-rich, sufficient for metadata extraction |
| IndexedDB native | localForage/idb | Easier API but adds dependency when native API is adequate |
| browser-fs-access | Native File System Access API | No legacy fallback, fails silently in unsupported browsers |

**Installation:**
```bash
npm install opentype.js
# browser-fs-access already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── services/
│   └── fonts/
│       ├── fontRegistry.ts           # Existing: font definitions
│       ├── fontManager.ts            # NEW: orchestrates font operations
│       ├── fontScanner.ts            # NEW: scans directory for fonts
│       ├── fontParser.ts             # NEW: parses font metadata with opentype.js
│       └── fontStorage.ts            # NEW: IndexedDB persistence
├── store/
│   └── fontsSlice.ts                 # NEW: Zustand slice for font state
└── components/
    └── Settings/
        └── FontSettings.tsx          # NEW: Settings UI for font folder
```

### Pattern 1: Permission-Based Directory Access
**What:** Use File System Access API with persistent permission tracking
**When to use:** User selects fonts directory once, app remembers choice
**Example:**
```typescript
// Source: https://developer.chrome.com/docs/capabilities/web-apis/file-system-access
import { directoryOpen } from 'browser-fs-access'

// Request directory access
const directoryHandle = await directoryOpen({ recursive: true })

// Store handle in IndexedDB for re-permission requests
await storeDirectoryHandle(directoryHandle)

// On next app load, retrieve and re-request permission
const handle = await getStoredDirectoryHandle()
const permission = await handle.requestPermission({ mode: 'read' })
if (permission === 'granted') {
  // Access directory without showing picker
}
```

### Pattern 2: Font Metadata Extraction
**What:** Parse font files to extract family name and metadata
**When to use:** After reading font file from File System Access API
**Example:**
```typescript
// Source: https://opentype.js.org/
import opentype from 'opentype.js'

async function parseFontMetadata(file: File) {
  const arrayBuffer = await file.arrayBuffer()
  const font = opentype.parse(arrayBuffer)

  return {
    family: font.names.fontFamily.en || font.names.fullName.en,
    fullName: font.names.fullName.en,
    postScriptName: font.names.postScriptName.en,
    version: font.names.version?.en,
    format: detectFormat(file.name), // .ttf, .otf, .woff2
  }
}
```

### Pattern 3: Dynamic Font Loading with FontFace API
**What:** Load fonts dynamically without blocking page render
**When to use:** After scanning fonts, load them for use in dropdowns
**Example:**
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API
async function loadFont(fontData: ArrayBuffer, fontFamily: string) {
  const fontFace = new FontFace(fontFamily, fontData)
  await fontFace.load()
  document.fonts.add(fontFace)

  return fontFace
}

// Usage in React with state management
const [fontsLoaded, setFontsLoaded] = useState(false)

useEffect(() => {
  loadFontsFromStorage().then(() => setFontsLoaded(true))
}, [])
```

### Pattern 4: Custom Font Preview Dropdown
**What:** Build custom dropdown component that displays fonts in their typeface
**When to use:** Font selection UI (native select doesn't support per-option fonts reliably)
**Example:**
```typescript
// Custom dropdown approach (native select is unreliable)
// Source: https://bugzilla.mozilla.org/show_bug.cgi?id=1536148
function FontDropdown({ fonts, value, onChange }) {
  return (
    <div className="font-dropdown">
      {fonts.map(font => (
        <button
          key={font.family}
          onClick={() => onChange(font.family)}
          style={{ fontFamily: font.family }}
          className={value === font.family ? 'selected' : ''}
        >
          {font.name}
        </button>
      ))}
    </div>
  )
}
```

### Pattern 5: Export Only Used Fonts
**What:** Scan project elements, collect used fonts, bundle only those
**When to use:** Export generation phase
**Example:**
```typescript
// Already exists in cssGenerator.ts, extend for custom fonts
function collectUsedFonts(elements: ElementConfig[]): Set<string> {
  const usedFonts = new Set<string>()

  elements.forEach(el => {
    if (el.type === 'label' && el.fontFamily) {
      usedFonts.add(el.fontFamily)
    }
    // Check other element types with font properties
  })

  return usedFonts
}

// Convert to base64 for embedding
async function embedFontsInCSS(fonts: FontData[]): Promise<string> {
  const fontFaces = await Promise.all(
    fonts.map(async font => {
      const base64 = arrayBufferToBase64(font.data)
      const mimeType = getMimeType(font.format)
      return `@font-face {
  font-family: '${font.family}';
  src: url(data:${mimeType};base64,${base64}) format('${font.format}');
}`
    })
  )
  return fontFaces.join('\n\n')
}
```

### Anti-Patterns to Avoid
- **Assuming persistent directory access:** File System Access API permissions are session-based by default. Store handles and re-request permission gracefully
- **Loading all fonts on startup:** Large font collections cause memory issues. Load metadata only, defer font data loading until needed
- **Using native select for font preview:** Browser support is inconsistent (Firefox doesn't honor font-family per option). Use custom component
- **Hardcoding user directory paths:** Browsers cannot access `~/` paths. Always use file picker dialog
- **Forgetting to clean up FontFace objects:** Fonts added to document.fonts persist. Clean up when removing fonts from registry

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File System Access with fallbacks | Custom picker with browser detection | browser-fs-access (already installed) | Handles fallback to input[type=file], tested across browsers, 284 commits of edge cases |
| Font file parsing | Custom binary parser | opentype.js | Handles complex font table structures, WOFF2 decompression, glyph data, kerning |
| Font format validation | Regex on file extension | opentype.js parse with error handling | Extensions lie, file signatures don't. Parser validates structure |
| Base64 encoding | Manual implementation | Browser native btoa() or ArrayBuffer methods | Optimized native implementation, handles binary data correctly |
| IndexedDB operations | Raw IndexedDB API | Native API is adequate for this use case | Font storage is simple key-value, native API sufficient |
| Directory watching | Polling File System Access | Not possible in browsers | No native directory watch API exists, manual rescan only option |

**Key insight:** Font file parsing is deceptively complex. TTF/OTF files have intricate binary structures with multiple tables, platform-specific encoding, and compression. opentype.js handles years of edge cases.

## Common Pitfalls

### Pitfall 1: Permission Loss Between Sessions
**What goes wrong:** User selects fonts folder, app works great. Next session, all fonts are gone
**Why it happens:** File System Access API permissions are not persistent by default. Stored FileSystemHandle objects exist but permission must be re-requested
**How to avoid:**
- Store directory handle in IndexedDB on first selection
- On app startup, retrieve handle and call `handle.requestPermission({ mode: 'read' })`
- If permission is 'prompt', user must click to re-grant (no file picker needed)
- If permission is 'denied', fallback to showing file picker again
**Warning signs:** Fonts disappear after browser restart, users report "having to select folder again"

### Pitfall 2: Memory Leaks from FontFace Objects
**What goes wrong:** App gets slower over time, especially after rescanning fonts multiple times
**Why it happens:** FontFace objects added to document.fonts are not garbage collected automatically. Re-scanning adds duplicate fonts
**How to avoid:**
```typescript
// Clean up before adding new fonts
function clearCustomFonts(fontFamilies: string[]) {
  fontFamilies.forEach(family => {
    const existingFonts = Array.from(document.fonts).filter(
      font => font.family === family
    )
    existingFonts.forEach(font => document.fonts.delete(font))
  })
}
```
**Warning signs:** Developer console shows increasing memory usage, UI becomes sluggish after multiple rescans

### Pitfall 3: Large Font Files Blocking UI
**What goes wrong:** Scanning a folder with 50MB+ of fonts freezes the app
**Why it happens:** FileReader.readAsArrayBuffer() and font parsing are synchronous operations on the main thread
**How to avoid:**
- Scan files in batches with requestIdleCallback or setTimeout
- Show progress indicator during scan
- Parse metadata only initially, defer full font loading
- Consider lazy-loading fonts on demand rather than all at once
**Warning signs:** App freezes during font scanning, browser "page unresponsive" warnings

### Pitfall 4: Font Family Name Conflicts
**What goes wrong:** Multiple fonts with same family name, only first loads, or wrong one appears in exports
**Why it happens:** CSS @font-face uses family name as key. Multiple fonts with "MyFont" collide
**How to avoid:**
- Track full file path or unique ID alongside family name
- When conflict detected, offer user choice or append disambiguator
- In export, ensure unique font-family declarations per file
**Warning signs:** User reports "wrong font appears in export", fonts mysteriously swap after rescanning

### Pitfall 5: Invalid Font Files Crashing Parser
**What goes wrong:** App crashes or shows error when scanning folder with corrupted fonts
**Why it happens:** opentype.js throws errors on invalid font data
**How to avoid:**
```typescript
async function parseFont(file: File): Promise<FontMetadata | null> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const font = opentype.parse(arrayBuffer)
    return extractMetadata(font)
  } catch (error) {
    console.warn(`Failed to parse font ${file.name}:`, error)
    return null // Skip invalid fonts gracefully
  }
}
```
**Warning signs:** App crashes when scanning certain folders, error stack traces mentioning opentype.parse

### Pitfall 6: Base64 Encoding Performance
**What goes wrong:** Export hangs or fails when bundling multiple large fonts
**Why it happens:** Base64 encoding large ArrayBuffers is CPU-intensive and increases file size by ~33%
**How to avoid:**
- Only bundle fonts actually used (already planned)
- Consider embedding as separate font files instead of base64 for large fonts
- Show progress indicator during export
- Warn if total embedded font size exceeds reasonable threshold (e.g., 2MB)
**Warning signs:** Export takes very long, exported HTML is unexpectedly large, browser memory spikes

## Code Examples

Verified patterns from official sources:

### Directory Access with Persistence
```typescript
// Source: https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api
import { directoryOpen } from 'browser-fs-access'

async function selectFontsDirectory(): Promise<FileSystemDirectoryHandle> {
  const handle = await directoryOpen({
    id: 'vst-ui-fonts',
    mode: 'read',
    recursive: true,
  })

  // Store in IndexedDB
  const db = await openDB('font-settings')
  await db.put('handles', handle, 'fonts-directory')

  return handle
}

async function restoreDirectoryAccess(): Promise<FileSystemDirectoryHandle | null> {
  const db = await openDB('font-settings')
  const handle = await db.get('handles', 'fonts-directory')

  if (!handle) return null

  // Check current permission status
  const permission = await handle.queryPermission({ mode: 'read' })

  if (permission === 'granted') {
    return handle
  }

  // Request permission (may prompt user)
  const newPermission = await handle.requestPermission({ mode: 'read' })

  if (newPermission === 'granted') {
    return handle
  }

  return null
}
```

### Font File Scanning
```typescript
// Source: https://developer.chrome.com/docs/capabilities/web-apis/file-system-access
async function scanFontsDirectory(dirHandle: FileSystemDirectoryHandle) {
  const fontExtensions = ['.ttf', '.otf', '.woff', '.woff2']
  const fonts: File[] = []

  async function* getFilesRecursively(dirHandle: FileSystemDirectoryHandle): AsyncGenerator<FileSystemFileHandle> {
    for await (const entry of dirHandle.values()) {
      if (entry.kind === 'file') {
        yield entry
      } else if (entry.kind === 'directory') {
        yield* getFilesRecursively(entry)
      }
    }
  }

  for await (const fileHandle of getFilesRecursively(dirHandle)) {
    if (fontExtensions.some(ext => fileHandle.name.endsWith(ext))) {
      const file = await fileHandle.getFile()
      fonts.push(file)
    }
  }

  return fonts
}
```

### Font Metadata Extraction
```typescript
// Source: https://opentype.js.org/
import opentype from 'opentype.js'

interface FontMetadata {
  family: string
  fullName: string
  postScriptName: string
  version?: string
  format: 'ttf' | 'otf' | 'woff' | 'woff2'
  fileName: string
}

async function extractFontMetadata(file: File): Promise<FontMetadata | null> {
  try {
    const arrayBuffer = await file.arrayBuffer()
    const font = opentype.parse(arrayBuffer)

    // Extract name table entries (English preferred)
    const names = font.names
    const family = names.fontFamily?.en || names.preferredFamily?.en || 'Unknown'
    const fullName = names.fullName?.en || family
    const postScriptName = names.postScriptName?.en || family.replace(/\s/g, '')
    const version = names.version?.en

    // Detect format from file extension
    const format = detectFontFormat(file.name)

    return {
      family,
      fullName,
      postScriptName,
      version,
      format,
      fileName: file.name,
    }
  } catch (error) {
    console.warn(`Failed to parse font ${file.name}:`, error)
    return null
  }
}

function detectFontFormat(fileName: string): 'ttf' | 'otf' | 'woff' | 'woff2' {
  const ext = fileName.toLowerCase().split('.').pop()
  if (ext === 'ttf') return 'ttf'
  if (ext === 'otf') return 'otf'
  if (ext === 'woff') return 'woff'
  if (ext === 'woff2') return 'woff2'
  return 'ttf' // fallback
}
```

### Font Storage in IndexedDB
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API
interface StoredFont {
  family: string
  data: ArrayBuffer
  metadata: FontMetadata
}

async function openFontsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('vst-ui-fonts', 1)

    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result

      // Create fonts object store
      if (!db.objectStoreNames.contains('fonts')) {
        const store = db.createObjectStore('fonts', { keyPath: 'family' })
        store.createIndex('format', 'metadata.format', { unique: false })
      }

      // Create handles object store
      if (!db.objectStoreNames.contains('handles')) {
        db.createObjectStore('handles')
      }
    }
  })
}

async function storeFont(font: StoredFont): Promise<void> {
  const db = await openFontsDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('fonts', 'readwrite')
    const store = tx.objectStore('fonts')
    const request = store.put(font)

    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

async function getAllFonts(): Promise<StoredFont[]> {
  const db = await openFontsDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('fonts', 'readonly')
    const store = tx.objectStore('fonts')
    const request = store.getAll()

    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}
```

### Dynamic Font Loading
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API
async function loadFontIntoDocument(fontData: ArrayBuffer, family: string, format: string) {
  // Create FontFace object
  const fontFace = new FontFace(family, fontData, {
    display: 'swap', // Prevent invisible text during loading
  })

  // Load the font
  await fontFace.load()

  // Add to document
  document.fonts.add(fontFace)

  return fontFace
}

// Batch loading with React
function useFontLoader() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'loaded' | 'error'>('idle')

  const loadFonts = useCallback(async (fonts: StoredFont[]) => {
    setStatus('loading')
    try {
      await Promise.all(
        fonts.map(font =>
          loadFontIntoDocument(font.data, font.family, font.metadata.format)
        )
      )
      setStatus('loaded')
    } catch (error) {
      console.error('Font loading failed:', error)
      setStatus('error')
    }
  }, [])

  return { status, loadFonts }
}
```

### Base64 Font Embedding for Export
```typescript
// Source: https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i])
  }
  return btoa(binary)
}

function getFontMimeType(format: string): string {
  const mimeTypes = {
    'ttf': 'font/ttf',
    'otf': 'font/otf',
    'woff': 'font/woff',
    'woff2': 'font/woff2',
  }
  return mimeTypes[format as keyof typeof mimeTypes] || 'font/ttf'
}

async function generateEmbeddedFontFace(font: StoredFont): Promise<string> {
  const base64 = arrayBufferToBase64(font.data)
  const mimeType = getFontMimeType(font.metadata.format)

  return `@font-face {
  font-family: '${font.family}';
  src: url(data:${mimeType};base64,${base64}) format('${font.metadata.format}');
  font-display: swap;
  font-weight: normal;
  font-style: normal;
}`
}

// Only bundle fonts used in project
async function generateFontCSS(elements: ElementConfig[]): Promise<string> {
  const usedFamilies = collectUsedFonts(elements)
  const allFonts = await getAllFonts()
  const usedFonts = allFonts.filter(font => usedFamilies.has(font.family))

  const fontFaces = await Promise.all(
    usedFonts.map(font => generateEmbeddedFontFace(font))
  )

  return fontFaces.join('\n\n')
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Google Fonts CDN URLs | Embedded fonts as base64 or files | Current in project | Eliminates external dependencies, works offline |
| Static font list | Dynamic font discovery | Phase 37 | Users can add custom fonts without code changes |
| Input[type=file] | File System Access API with persistent permissions | Chrome 122 (Feb 2024) | Better UX, no re-selection needed |
| FileReader callbacks | Async/await with File.arrayBuffer() | Modern browsers (2020+) | Cleaner code, promise-based |
| webfontloader library | Native FontFace API | Widely supported (2018+) | Removes dependency, better control |

**Deprecated/outdated:**
- `@font-face` with `local()` fallback: Still works but limited to user-installed system fonts, can't access arbitrary font files
- Synchronous FileReader methods: Never widely supported, use async versions
- FontFace `format('truetype')`: Deprecated, use `format('ttf')` instead

## Open Questions

Things that couldn't be fully resolved:

1. **Directory watching/auto-rescan**
   - What we know: No native directory watching API exists in browsers
   - What's unclear: Best UX for manual rescan trigger (button, automatic on settings open, background polling?)
   - Recommendation: Provide manual "Rescan Fonts" button in settings, consider periodic rescan on app focus if performance acceptable

2. **Font file size limits**
   - What we know: IndexedDB has generous limits (typically 50MB-1GB+), base64 increases size by 33%
   - What's unclear: Practical size limit before export performance degrades unacceptably
   - Recommendation: Warn if single font exceeds 5MB or total embedded fonts exceed 10MB, suggest external font files for export

3. **Font variations/weights**
   - What we know: Modern fonts can include multiple weights/styles in single file or as separate files
   - What's unclear: How to handle font families with Regular, Bold, Italic variants? Single family or multiple entries?
   - Recommendation: Start with single weight support (Regular), defer multi-weight to future phase based on user feedback

4. **Browser compatibility floor**
   - What we know: File System Access API supported in Chrome 86+, Edge 86+, not Safari/Firefox (as of Jan 2026)
   - What's unclear: Is browser-fs-access fallback acceptable, or should Safari/Firefox users see disabled feature?
   - Recommendation: Test browser-fs-access fallback thoroughly, provide clear messaging if limited functionality

5. **"Open Fonts Folder" cross-platform**
   - What we know: Browser apps can't invoke file explorer to reveal directories
   - What's unclear: Can we show the path and provide copy button, or is this feature not possible in browsers?
   - Recommendation: Display selected folder path with copy button, explain limitation compared to native apps

## Sources

### Primary (HIGH confidence)
- File System Access API - [Chrome Developers Guide](https://developer.chrome.com/docs/capabilities/web-apis/file-system-access)
- Persistent Permissions - [Chrome Blog](https://developer.chrome.com/blog/persistent-permissions-for-the-file-system-access-api)
- File System API - [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API)
- CSS Font Loading API - [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/CSS_Font_Loading_API)
- @font-face - [MDN CSS Reference](https://developer.mozilla.org/en-US/docs/Web/CSS/@font-face)
- IndexedDB API - [MDN Documentation](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- opentype.js - [Official Documentation](https://opentype.js.org/)
- browser-fs-access - [GitHub Repository](https://github.com/GoogleChromeLabs/browser-fs-access)

### Secondary (MEDIUM confidence)
- Font formats comparison - [Snapfont Guide](https://getsnapfont.com/posts/understanding-font-file-formats-ttf-otf-woff-etc)
- WOFF2 Specification - [W3C TR](https://www.w3.org/TR/WOFF2/)
- Base64 font embedding - [Woff2Base Tool](https://hellogreg.github.io/woff2base/)
- Font Aliasing - [Zach Leatherman Article](https://www.zachleat.com/web/rename-font/)
- Web font performance - [web.dev Guide](https://web.dev/articles/font-best-practices)

### Tertiary (LOW confidence)
- Firefox font-family bug - [Bugzilla #1536148](https://bugzilla.mozilla.org/show_bug.cgi?id=1536148)
- Dynamic font loading patterns - [Medium Articles](https://medium.com/@wfercanas/load-fonts-on-demand-with-react-206ce12174c0)
- Memory leak patterns - [Various WebSearch sources](https://medium.com/@isinghprince/memory-leaks-in-web-applications-causes-consequences-and-solutions-1ab12544c707)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries verified against official documentation and npm registry
- Architecture: MEDIUM - File System Access API patterns verified, but browser app constraints limit some features (home directory, watching)
- Pitfalls: MEDIUM - Permission handling verified from official docs, memory leaks inferred from general web best practices
- Code examples: HIGH - All examples derived from official MDN/Chrome docs or library documentation

**Research date:** 2026-01-27
**Valid until:** 2026-02-27 (30 days - File System Access API is stable spec)

**Critical constraints discovered:**
- Browser security model prevents "default fonts folder" concept - users MUST select directory via picker
- No directory watching API - manual rescan only
- "Open Fonts Folder" button cannot invoke file explorer in browser
- Permission persistence requires IndexedDB handle storage + re-request flow
- Font preview in native select is unreliable - custom component required
