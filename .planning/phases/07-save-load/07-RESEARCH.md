# Phase 7: Save/Load - Research

**Researched:** 2026-01-23
**Domain:** JSON serialization, file system interaction, schema validation, versioning
**Confidence:** HIGH

## Summary

This phase implements project persistence through JSON serialization with validation and versioning. The standard approach uses **Zod** for TypeScript-first schema validation, **browser-fs-access** for cross-browser file system operations with automatic fallback, and **semantic versioning** embedded in the JSON document for future migration support.

The existing codebase already has react-dropzone installed for file uploads. The Zustand store structure is well-suited for serialization, though care must be taken to exclude non-serializable viewport state (which is already handled by the temporal middleware's partialize configuration).

**Primary recommendation:** Use Zod discriminated unions to validate the existing ElementConfig types, browser-fs-access for file save/load with automatic legacy fallback, and implement migration-on-read pattern for future schema changes.

## Standard Stack

The established libraries/tools for JSON persistence in browser applications:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Zod | 3.x | TypeScript-first schema validation | Zero dependencies, automatic type inference, 2kb gzipped, optimal DX/performance balance for most apps |
| browser-fs-access | 0.35+ | File System Access API with fallback | Automatic progressive enhancement, used by Excalidraw and SVGcode, handles legacy browsers |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod-error | 2.x+ | Format Zod validation errors | Transform ZodError into user-friendly messages |
| react-dropzone | 14.x | Drag-and-drop file upload | Already installed in project, HTML5-compliant drag'n'drop |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Zod | AJV | AJV is 5-18x faster but worse DX; only needed for >1000 validations/sec (server-side APIs) |
| Zod | TypeBox | Similar to Zod but generates JSON Schema directly; unnecessary complexity for this use case |
| browser-fs-access | Manual File System Access API | More control but requires implementing fallback logic manually |
| Semantic versioning | SchemaVer (MODEL-REVISION-ADDITION) | SchemaVer better for data schemas but adds complexity; SemVer sufficient for v1 |

**Installation:**
```bash
npm install zod browser-fs-access zod-error
# react-dropzone already installed
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── schemas/
│   ├── project.ts           # Zod schemas for project structure
│   └── validation.ts        # Validation utilities, error formatting
├── services/
│   ├── serialization.ts     # Serialize/deserialize Zustand state
│   └── fileSystem.ts        # Save/load file operations
└── store/
    └── actions/
        ├── saveProject.ts   # Save action
        └── loadProject.ts   # Load action
```

### Pattern 1: Discriminated Union Validation with Zod
**What:** Mirror existing TypeScript discriminated unions in Zod schemas for runtime validation
**When to use:** Validating complex union types like ElementConfig
**Example:**
```typescript
// Source: https://zod.dev/api (Discriminated Unions section)
import { z } from 'zod';

// Base element schema
const baseElementSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  x: z.number(),
  y: z.number(),
  width: z.number(),
  height: z.number(),
  rotation: z.number(),
  zIndex: z.number(),
  locked: z.boolean(),
  visible: z.boolean(),
  parameterId: z.string().optional(),
});

// Knob element schema
const knobElementSchema = baseElementSchema.extend({
  type: z.literal('knob'),
  diameter: z.number(),
  value: z.number(),
  min: z.number(),
  max: z.number(),
  startAngle: z.number(),
  endAngle: z.number(),
  style: z.enum(['arc', 'filled', 'dot', 'line']),
  trackColor: z.string(),
  fillColor: z.string(),
  indicatorColor: z.string(),
  trackWidth: z.number(),
});

// ... other element schemas (slider, button, label, meter, image)

// Discriminated union - Zod uses 'type' field for O(1) lookup
const elementConfigSchema = z.discriminatedUnion('type', [
  knobElementSchema,
  sliderElementSchema,
  buttonElementSchema,
  labelElementSchema,
  meterElementSchema,
  imageElementSchema,
]);

// Array of nested objects (e.g., meter color stops)
const colorStopSchema = z.object({
  position: z.number().min(0).max(1),
  color: z.string(),
});

const meterElementSchema = baseElementSchema.extend({
  type: z.literal('meter'),
  colorStops: z.array(colorStopSchema),
  // ... other fields
});
```

### Pattern 2: Versioned JSON Schema with Migration-on-Read
**What:** Embed version field in JSON, migrate old schemas only when loaded
**When to use:** Future-proofing schema changes without breaking old files
**Example:**
```typescript
// Source: https://bool.dev/blog/detail/data-versioning-patterns
const projectSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/), // SemVer format
  elements: z.array(elementConfigSchema),
  canvas: z.object({
    canvasWidth: z.number(),
    canvasHeight: z.number(),
    backgroundColor: z.string(),
    backgroundType: z.enum(['color', 'gradient', 'image']),
    gradientConfig: z.object({
      type: z.enum(['linear', 'radial']),
      colors: z.array(z.string()),
      angle: z.number().optional(),
    }).optional(),
    imageUrl: z.string().optional(),
    snapToGrid: z.boolean(),
    gridSize: z.number(),
  }),
  viewport: z.object({
    scale: z.number(),
    offsetX: z.number(),
    offsetY: z.number(),
  }),
});

// Migration-on-read pattern
function migrateProject(raw: unknown): ProjectData {
  const parsed = projectSchema.safeParse(raw);

  if (!parsed.success) {
    // Check version and migrate if needed
    const versionCheck = z.object({ version: z.string() }).safeParse(raw);

    if (versionCheck.success) {
      const [major, minor] = versionCheck.data.version.split('.').map(Number);

      // Example: migrate from 1.0.0 to 1.1.0
      if (major === 1 && minor === 0) {
        // Apply migrations...
        return migrateFrom1_0_0(raw);
      }
    }

    // If no version or unknown version, throw validation error
    throw new ValidationError(formatZodError(parsed.error));
  }

  return parsed.data;
}
```

### Pattern 3: File System API with Progressive Enhancement
**What:** Use modern File System Access API with automatic fallback to legacy methods
**When to use:** Browser-based file save/load operations
**Example:**
```typescript
// Source: https://github.com/GoogleChromeLabs/browser-fs-access
import { fileOpen, fileSave, supported } from 'browser-fs-access';

// Save project
async function saveProject(projectData: ProjectData, fileName?: string) {
  const jsonString = JSON.stringify(projectData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });

  await fileSave(blob, {
    fileName: fileName || 'project.vst3ui.json',
    extensions: ['.json', '.vst3ui.json'],
    description: 'VST3 UI Designer Project',
  });

  // browser-fs-access automatically uses:
  // - showSaveFilePicker() on modern browsers
  // - <a download> fallback on legacy browsers
}

// Load project
async function loadProject() {
  const blob = await fileOpen({
    mimeTypes: ['application/json'],
    extensions: ['.json', '.vst3ui.json'],
    description: 'VST3 UI Designer Project',
  });

  const text = await blob.text();
  return JSON.parse(text); // Then validate with Zod
}
```

### Pattern 4: Safe JSON Parsing with Validation
**What:** Wrap JSON.parse in try-catch, validate with Zod, provide user-friendly errors
**When to use:** Loading user-provided JSON files
**Example:**
```typescript
// Source: https://dev.to/maafaishal/safely-use-jsonparse-in-typescript-12e7
import { generateErrorMessage } from 'zod-error';

function loadAndValidateProject(fileContent: string): Result<ProjectData> {
  // Step 1: Parse JSON safely
  let rawData: unknown;
  try {
    rawData = JSON.parse(fileContent);
  } catch (error) {
    return {
      success: false,
      error: 'Invalid JSON file: The file is not properly formatted.',
    };
  }

  // Step 2: Validate with Zod
  const result = projectSchema.safeParse(rawData);

  if (!result.success) {
    // Format user-friendly error message
    const errorMessage = generateErrorMessage(result.error.issues, {
      maxErrors: 5,
      delimiter: { error: '\n• ' },
      path: { enabled: true, label: 'Field' },
      code: { enabled: false },
    });

    return {
      success: false,
      error: `Project file validation failed:\n• ${errorMessage}`,
    };
  }

  return {
    success: true,
    data: result.data,
  };
}

type Result<T> =
  | { success: true; data: T }
  | { success: false; error: string };
```

### Pattern 5: Zustand State Serialization (Selective)
**What:** Serialize only persisted state, exclude temporal/viewport state
**When to use:** Converting Zustand store to/from JSON
**Example:**
```typescript
// Source: Current codebase (store/index.ts)
// The temporal middleware already excludes viewport state via partialize
import { useStore, Store } from './store';

// Serialize current state to JSON
function serializeState(): ProjectData {
  const state = useStore.getState();

  return {
    version: '1.0.0',
    elements: state.elements,
    canvas: {
      canvasWidth: state.canvasWidth,
      canvasHeight: state.canvasHeight,
      backgroundColor: state.backgroundColor,
      backgroundType: state.backgroundType,
      gradientConfig: state.gradientConfig,
      imageUrl: state.imageUrl,
      snapToGrid: state.snapToGrid,
      gridSize: state.gridSize,
    },
    viewport: {
      scale: state.scale,
      offsetX: state.offsetX,
      offsetY: state.offsetY,
    },
  };
}

// Deserialize JSON to state
function deserializeState(data: ProjectData) {
  const { setState } = useStore;

  // Clear undo history when loading new project
  useStore.temporal.getState().clear();

  setState({
    elements: data.elements,
    selectedIds: [], // Reset selection
    lastSelectedId: null,
    canvasWidth: data.canvas.canvasWidth,
    canvasHeight: data.canvas.canvasHeight,
    backgroundColor: data.canvas.backgroundColor,
    backgroundType: data.canvas.backgroundType,
    gradientConfig: data.canvas.gradientConfig,
    imageUrl: data.canvas.imageUrl,
    snapToGrid: data.canvas.snapToGrid,
    gridSize: data.canvas.gridSize,
    scale: data.viewport.scale,
    offsetX: data.viewport.offsetX,
    offsetY: data.viewport.offsetY,
  });
}
```

### Anti-Patterns to Avoid
- **Using JSON.stringify/parse without validation:** Always validate with Zod before trusting loaded data
- **Storing non-serializable data:** Don't include Date, Map, Set, functions in state; convert to serializable forms
- **Mutating during deserialization:** Use setState to trigger proper subscriptions and re-renders
- **Ignoring version field:** Always include version for future migrations even if unused in v1
- **Exposing stack traces in errors:** Strip internal exception details, show user-friendly messages only

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| File save dialog | Custom modal with download button | browser-fs-access | Handles File System Access API + legacy fallback automatically, works across all browsers |
| JSON validation | Manual type checking with if/else | Zod schemas | Runtime validation matches TypeScript types, catches edge cases, provides error paths |
| Error message formatting | String concatenation of errors | zod-error's generateErrorMessage | User-friendly formatting, prevents verbose/scary error dumps |
| Schema versioning | Custom migration framework | Embedded version + migration-on-read | Industry-standard pattern, lazy migration is cost-effective |
| Discriminated unions | z.union() with manual checking | z.discriminatedUnion() | O(1) lookup vs O(n) sequential validation, better performance |
| File type filtering | Manual file extension checking | react-dropzone accept prop | HTML5-compliant, validates MIME types + extensions |
| Blob URL creation | String manipulation | URL.createObjectURL() | Handles memory management, revokes URLs properly |

**Key insight:** JSON serialization has many edge cases (circular references, non-serializable types, malformed input). Established libraries handle these cases and provide better error messages than custom solutions.

## Common Pitfalls

### Pitfall 1: Loss of Type Information on Deserialization
**What goes wrong:** JSON.parse returns `any` type, objects lose methods and prototype chain
**Why it happens:** JSON only supports primitive types (string, number, boolean, null) plus arrays and objects - no Date, Map, Set, or class instances
**How to avoid:**
- Store only plain data in Zustand state (already doing this)
- Validate with Zod immediately after parsing to restore TypeScript types
- Don't store Date objects; use ISO strings (e.g., `createdAt: string`)
**Warning signs:** TypeScript errors after loading, missing methods on objects, Date objects becoming strings

### Pitfall 2: Non-Serializable Data in State
**What goes wrong:** JSON.stringify silently drops functions, converts Date to string, serializes Map/Set as `{}`
**Why it happens:** These types aren't JSON-compatible; JSON.stringify has specific rules for each
**How to avoid:**
- Keep functions out of state (already doing this with Zustand actions)
- Exclude temporal middleware state (already done via partialize)
- If using Map/Set in future, convert with Array.from() before serialization
**Warning signs:** Empty objects in JSON for Maps/Sets, dates lose timezone info, functions disappear

### Pitfall 3: Validation Errors Scare Users
**What goes wrong:** Raw ZodError shows technical paths like `elements[3].colorStops[1].position`, confusing users
**Why it happens:** Default Zod errors are developer-focused, not user-focused
**How to avoid:**
- Use zod-error to format messages: "Color stop position must be between 0 and 1"
- Provide context: "The file appears to be corrupted or from a newer version"
- Never expose stack traces in production
- Show actionable guidance: "Try re-saving the file" not just "validation failed"
**Warning signs:** Users reporting "scary error messages", support requests asking what "issues[0].path" means

### Pitfall 4: File Corruption Goes Undetected
**What goes wrong:** Partial file writes due to browser crash/tab close, user sees no error on save but file is truncated
**Why it happens:** File System Access API write streams may not flush to disk immediately
**How to avoid:**
- Validate saved file can be re-loaded immediately after save (optional verification step)
- Use `writableStream.close()` and await it (browser-fs-access handles this)
- For critical data, consider checksums (overkill for v1 but useful for future)
**Warning signs:** User reports "file won't load" after crash, JSON parse errors on corrupted files

### Pitfall 5: Version Field Not Future-Proof
**What goes wrong:** Version field added but never used, future migrations have no version to check against
**Why it happens:** Developers add version "for future use" but don't plan migration strategy
**How to avoid:**
- Include version in schema validation (required field)
- Document version bump rules in comments: major = breaking, minor = new fields, patch = bugs
- Plan migration function signature now even if empty: `function migrateFrom1_0_0(old: unknown): ProjectData`
- Test version parsing before implementing migrations
**Warning signs:** Version field exists but no code checks it, migrations don't know which version they're upgrading from

### Pitfall 6: Undo History Included in Save
**What goes wrong:** Saving includes zundo's pastStates/futureStates, file size explodes (1MB becomes 50MB with 50 undo steps)
**Why it happens:** Developers serialize entire store including temporal middleware state
**How to avoid:**
- Only serialize domain state (elements, canvas settings, viewport)
- Clear undo history on load: `useStore.temporal.getState().clear()`
- Temporal middleware's partialize already excludes viewport state from undo
**Warning signs:** JSON files are huge (>1MB for simple projects), slow save/load performance

### Pitfall 7: Missing Browser Compatibility for File System API
**What goes wrong:** Save/load works in Chrome but fails silently in Firefox/Safari older versions
**Why it happens:** File System Access API is relatively new (Chrome 86+, Firefox 111+, Safari 16+)
**How to avoid:**
- Use browser-fs-access which automatically falls back to `<a download>` and `<input type="file">`
- Test in multiple browsers during development
- Check `supported` flag from browser-fs-access for debugging
**Warning signs:** Feature works in dev (modern Chrome) but users report "nothing happens" on Safari 15

## Code Examples

Verified patterns from official sources:

### Zod Schema for Complete Project
```typescript
// Source: https://zod.dev/api (Object, Discriminated Union sections)
import { z } from 'zod';

// Element schemas (mirroring types/elements.ts)
const baseElementSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  x: z.number(),
  y: z.number(),
  width: z.number().positive(),
  height: z.number().positive(),
  rotation: z.number(),
  zIndex: z.number().int(),
  locked: z.boolean(),
  visible: z.boolean(),
  parameterId: z.string().optional(),
});

const knobElementSchema = baseElementSchema.extend({
  type: z.literal('knob'),
  diameter: z.number().positive(),
  value: z.number(),
  min: z.number(),
  max: z.number(),
  startAngle: z.number(),
  endAngle: z.number(),
  style: z.enum(['arc', 'filled', 'dot', 'line']),
  trackColor: z.string(),
  fillColor: z.string(),
  indicatorColor: z.string(),
  trackWidth: z.number().positive(),
});

const sliderElementSchema = baseElementSchema.extend({
  type: z.literal('slider'),
  orientation: z.enum(['vertical', 'horizontal']),
  value: z.number(),
  min: z.number(),
  max: z.number(),
  trackColor: z.string(),
  trackFillColor: z.string(),
  thumbColor: z.string(),
  thumbWidth: z.number().positive(),
  thumbHeight: z.number().positive(),
});

const buttonElementSchema = baseElementSchema.extend({
  type: z.literal('button'),
  mode: z.enum(['momentary', 'toggle']),
  label: z.string(),
  pressed: z.boolean(),
  backgroundColor: z.string(),
  textColor: z.string(),
  borderColor: z.string(),
  borderRadius: z.number().nonnegative(),
});

const labelElementSchema = baseElementSchema.extend({
  type: z.literal('label'),
  text: z.string(),
  fontSize: z.number().positive(),
  fontFamily: z.string(),
  fontWeight: z.number().int(),
  color: z.string(),
  textAlign: z.enum(['left', 'center', 'right']),
});

const colorStopSchema = z.object({
  position: z.number().min(0).max(1),
  color: z.string(),
});

const meterElementSchema = baseElementSchema.extend({
  type: z.literal('meter'),
  orientation: z.enum(['vertical', 'horizontal']),
  value: z.number(),
  min: z.number(),
  max: z.number(),
  colorStops: z.array(colorStopSchema).min(1),
  backgroundColor: z.string(),
  showPeakHold: z.boolean(),
});

const imageElementSchema = baseElementSchema.extend({
  type: z.literal('image'),
  src: z.string(),
  fit: z.enum(['contain', 'cover', 'fill', 'none']),
});

const elementConfigSchema = z.discriminatedUnion('type', [
  knobElementSchema,
  sliderElementSchema,
  buttonElementSchema,
  labelElementSchema,
  meterElementSchema,
  imageElementSchema,
]);

const gradientConfigSchema = z.object({
  type: z.enum(['linear', 'radial']),
  colors: z.array(z.string()).min(2),
  angle: z.number().optional(),
});

const projectSchema = z.object({
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in SemVer format (e.g., 1.0.0)'),
  elements: z.array(elementConfigSchema),
  canvas: z.object({
    canvasWidth: z.number().int().positive(),
    canvasHeight: z.number().int().positive(),
    backgroundColor: z.string(),
    backgroundType: z.enum(['color', 'gradient', 'image']),
    gradientConfig: gradientConfigSchema.optional(),
    imageUrl: z.string().optional(),
    snapToGrid: z.boolean(),
    gridSize: z.number().int().positive(),
  }),
  viewport: z.object({
    scale: z.number().positive(),
    offsetX: z.number(),
    offsetY: z.number(),
  }),
});

export type ProjectData = z.infer<typeof projectSchema>;
```

### Complete Save/Load Service
```typescript
// Source: https://github.com/GoogleChromeLabs/browser-fs-access (README examples)
import { fileOpen, fileSave } from 'browser-fs-access';
import { generateErrorMessage } from 'zod-error';
import { projectSchema, ProjectData } from '../schemas/project';
import { useStore } from '../store';

export class ProjectFileService {
  private static FILE_EXTENSION = '.vst3ui.json';
  private static DEFAULT_FILENAME = 'project.vst3ui.json';
  private static CURRENT_VERSION = '1.0.0';

  /**
   * Save current project to file
   */
  static async saveProject(customFileName?: string): Promise<void> {
    const state = useStore.getState();

    // Serialize state
    const projectData: ProjectData = {
      version: this.CURRENT_VERSION,
      elements: state.elements,
      canvas: {
        canvasWidth: state.canvasWidth,
        canvasHeight: state.canvasHeight,
        backgroundColor: state.backgroundColor,
        backgroundType: state.backgroundType,
        gradientConfig: state.gradientConfig,
        imageUrl: state.imageUrl,
        snapToGrid: state.snapToGrid,
        gridSize: state.gridSize,
      },
      viewport: {
        scale: state.scale,
        offsetX: state.offsetX,
        offsetY: state.offsetY,
      },
    };

    // Validate before saving (sanity check)
    const validation = projectSchema.safeParse(projectData);
    if (!validation.success) {
      throw new Error('Internal error: Invalid project data');
    }

    // Convert to JSON string with formatting
    const jsonString = JSON.stringify(projectData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });

    // Save file (with automatic fallback for older browsers)
    try {
      await fileSave(blob, {
        fileName: customFileName || this.DEFAULT_FILENAME,
        extensions: ['.json', this.FILE_EXTENSION],
        description: 'VST3 UI Designer Project',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // User cancelled - not an error
        return;
      }
      throw new Error('Failed to save project file');
    }
  }

  /**
   * Load project from file
   */
  static async loadProject(): Promise<ProjectData> {
    // Open file picker
    let blob: Blob;
    try {
      blob = await fileOpen({
        mimeTypes: ['application/json'],
        extensions: ['.json', this.FILE_EXTENSION],
        description: 'VST3 UI Designer Project',
      });
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('CANCELLED'); // Special case for UI
      }
      throw new Error('Failed to open project file');
    }

    // Read file content
    const text = await blob.text();

    // Parse JSON safely
    let rawData: unknown;
    try {
      rawData = JSON.parse(text);
    } catch (error) {
      throw new Error(
        'Invalid project file: The file is not valid JSON. It may be corrupted.'
      );
    }

    // Validate with Zod
    const result = projectSchema.safeParse(rawData);

    if (!result.success) {
      // Format user-friendly error
      const errorMessage = generateErrorMessage(result.error.issues, {
        maxErrors: 3,
        delimiter: { error: '\n  • ' },
        path: { enabled: true, label: '' },
        code: { enabled: false },
      });

      throw new Error(
        `Project file validation failed:\n\n${errorMessage}\n\nThe file may be corrupted or from a newer version of the application.`
      );
    }

    return result.data;
  }

  /**
   * Apply loaded project data to store
   */
  static applyProjectToStore(data: ProjectData): void {
    const { setState } = useStore;

    // Clear undo/redo history
    useStore.temporal.getState().clear();

    // Apply state
    setState({
      // Elements
      elements: data.elements,
      selectedIds: [],
      lastSelectedId: null,

      // Canvas
      canvasWidth: data.canvas.canvasWidth,
      canvasHeight: data.canvas.canvasHeight,
      backgroundColor: data.canvas.backgroundColor,
      backgroundType: data.canvas.backgroundType,
      gradientConfig: data.canvas.gradientConfig,
      imageUrl: data.canvas.imageUrl,
      snapToGrid: data.canvas.snapToGrid,
      gridSize: data.canvas.gridSize,

      // Viewport
      scale: data.viewport.scale,
      offsetX: data.viewport.offsetX,
      offsetY: data.viewport.offsetY,
    });
  }
}
```

### User-Friendly Error Display Component
```typescript
// Source: https://treblle.com/blog/rest-api-error-handling (user-friendly errors)
import React from 'react';

interface LoadErrorDialogProps {
  error: Error;
  onClose: () => void;
  onRetry: () => void;
}

export function LoadErrorDialog({ error, onClose, onRetry }: LoadErrorDialogProps) {
  const isCancelled = error.message === 'CANCELLED';

  if (isCancelled) {
    return null; // User cancelled - don't show error
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-md">
        <h2 className="text-xl font-bold text-red-400 mb-4">
          Failed to Load Project
        </h2>

        <div className="bg-gray-900 rounded p-4 mb-4 font-mono text-sm text-gray-300 whitespace-pre-wrap">
          {error.message}
        </div>

        <div className="text-sm text-gray-400 mb-4">
          <p className="font-semibold mb-2">What you can try:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Check if the file is corrupted</li>
            <li>Try re-exporting from the original source</li>
            <li>Verify the file extension is .json</li>
            <li>Make sure it's a VST3 UI Designer project file</li>
          </ul>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onRetry}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded"
          >
            Try Another File
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual JSON.parse type assertions | Zod runtime validation | 2020-2021 | Type safety at runtime, catch malformed data before it crashes app |
| Custom file download via `<a>` tag | File System Access API + fallback | 2020+ (Chrome 86+) | Native save dialogs, remember save locations, overwrite files |
| Redux persist middleware | Zustand temporal + manual serialization | 2021+ | Simpler API, better TypeScript inference, explicit control over what persists |
| Class-based serialization (class-transformer) | Plain objects + Zod validation | 2022+ | No class instances in state, better JSON compatibility, simpler mental model |
| z.union() for type variants | z.discriminatedUnion() | Zod 3.11+ (2022) | O(1) vs O(n) validation performance, better error messages |
| Manual error formatting | zod-error library | 2023+ | Consistent user-friendly messages, localization support |

**Deprecated/outdated:**
- **FileReader API for saves**: Use File System Access API (with fallback) instead of forcing downloads
- **localStorage for project state**: Too limited (5-10MB), use file-based persistence instead
- **JSON Schema + ajv for TypeScript projects**: Zod provides better DX with type inference
- **Custom version migration frameworks**: Migration-on-read pattern is now industry standard

## Open Questions

Things that couldn't be fully resolved:

1. **Should we support importing from older/future versions?**
   - What we know: SemVer 1.0.0 is sufficient for initial release
   - What's unclear: How to handle files from future versions (e.g., user opens 2.0 file in 1.0 app)
   - Recommendation: Detect version mismatch, show clear error: "This file requires version X.Y or newer"

2. **Should we validate element IDs are unique on load?**
   - What we know: IDs should be UUIDs and unique, but corrupt files might have duplicates
   - What's unclear: Should validation fail or should we re-generate IDs?
   - Recommendation: Fail validation with clear message, don't silently fix (data integrity)

3. **Should we implement file corruption detection (checksums)?**
   - What we know: File System Access API doesn't guarantee write integrity on crashes
   - What's unclear: Is this overkill for v1? How often do crashes during save happen?
   - Recommendation: Skip for v1, add in Phase 8+ if users report corruption issues

4. **Should loaded viewport (zoom/pan) be restored?**
   - What we know: Viewport state is excluded from undo history (ephemeral)
   - What's unclear: Should loading a file restore the saved viewport, or start at default (1.0 scale, centered)?
   - Recommendation: Restore viewport for consistency, but add "Reset View" button if needed

5. **How to handle missing optional fields (gradientConfig, imageUrl)?**
   - What we know: Zod marks them optional, JSON might omit them
   - What's unclear: Should missing fields use schema defaults or store defaults?
   - Recommendation: Use Zod's .default() to match factory function defaults from types/elements.ts

## Sources

### Primary (HIGH confidence)
- [Zod Official Documentation](https://zod.dev/) - Schema definition, discriminated unions, validation
- [File System API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/File_System_API) - Browser file system operations
- [browser-fs-access - GitHub](https://github.com/GoogleChromeLabs/browser-fs-access) - Progressive enhancement for file operations
- [Zustand Official Docs - Persist Middleware](https://zustand.docs.pmnd.rs/middlewares/persist) - State serialization patterns
- [zod-error - npm](https://www.npmjs.com/package/zod-error) - Error message formatting

### Secondary (MEDIUM confidence)
- [Data Versioning and Schema Evolution Patterns](https://bool.dev/blog/detail/data-versioning-patterns) - Migration-on-read pattern
- [Semantic Versioning 2.0.0](https://semver.org/) - Version field format
- [TypeBox vs Zod - Better Stack](https://betterstack.com/community/guides/scaling-nodejs/typebox-vs-zod/) - Library comparison and tradeoffs
- [File Save Pattern - web.dev](https://web.dev/patterns/files/save-a-file) - Updated 2026-01-14, current best practices
- [JSON Serialization in TypeScript - LogRocket](https://blog.logrocket.com/understanding-typescript-object-serialization/) - Common pitfalls

### Tertiary (LOW confidence)
- [React Download Button Implementations](https://plainenglish.io/blog/how-to-download-files-on-button-click-reactjs-f7257e55a26b) - General patterns, not library-specific
- [REST API Error Handling - Treblle](https://treblle.com/blog/rest-api-error-handling) - User-friendly error message principles
- WebSearch results for validation libraries comparison (ajv, yup, joi) - Dated but still relevant for tradeoffs

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Zod and browser-fs-access are well-documented, actively maintained, used in production apps like Excalidraw
- Architecture: HIGH - Patterns verified against official documentation, match existing codebase structure
- Pitfalls: MEDIUM - Based on community experience and blog posts; serialization pitfalls are well-known but error handling is context-specific

**Research date:** 2026-01-23
**Valid until:** ~30 days (stable ecosystem, unlikely to change rapidly)

**Notes:**
- react-dropzone already installed (version 14.3.8) - no additional installation needed for file upload UI
- Existing Zustand store structure is serialization-friendly (plain objects, no functions in state)
- Temporal middleware's partialize already excludes viewport ephemeral state (isPanning, dragStart)
- Element types already use discriminated unions matching Zod's discriminatedUnion pattern
