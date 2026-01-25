# Feature Landscape: SVG Import System (v1.1)

**Domain:** Visual design tools — SVG import and asset management
**Researched:** 2026-01-25
**Project:** VST3 WebView UI Designer v1.1 Milestone
**Confidence:** HIGH (based on design tool patterns + existing v1.0 codebase analysis)

---

## Context: Building on v1.0

This research extends the v1.0 feature landscape (see below for original research) with **specific focus on SVG Import System features** for the v1.1 milestone.

**v1.0 Shipped Features:**
- Basic SVG import with layer detection (naming conventions)
- "Design Mode" dialog for layer assignment
- Image element with base64 embedding
- Save/load JSON projects
- Export to JUCE WebView2

**v1.1 Focus:**
- Interactive SVG knobs (rotation mapping)
- Static SVG graphics (logos, decorative elements)
- Asset library management
- Resizable UI support for SVG elements

---

## Executive Summary

SVG import in design tools falls into two distinct feature categories:

1. **Static SVG Graphics** — Import any SVG as a decorative/visual element (logos, icons, dividers)
2. **Interactive SVG Controls** — Import SVG with layered structure for UI controls (knobs, sliders)

The v1.0 system already handles basic SVG import with layer detection (naming conventions: indicator, thumb, track, fill, glow) and "Design Mode" for layer assignment. v1.1 needs to expand this foundation with asset management and proper rendering of interactive controls.

**Key Finding:** Audio plugin developers expect **filmstrip-style rotation for knobs** (pre-rendered frames), but SVG rotation is superior for perfect scaling. The challenge is mapping SVG layers to interactive states.

---

## Table Stakes Features

Features users expect from any SVG import system. Missing these = incomplete feature.

| Feature | Why Expected | Complexity | Notes | Existing in v1.0? |
|---------|--------------|------------|-------|-------------------|
| **Drag-drop SVG files** | Standard file import UX in all design tools | Low | v1.0 uses react-dropzone | ✓ YES (CustomSVGUpload) |
| **Preview before import** | Users need to see what they're importing | Low | Shows thumbnail + dimensions | ✓ YES (CustomSVGUpload) |
| **Preserve aspect ratio** | SVGs must not distort on resize | Medium | viewBox + preserveAspectRatio handling required | ⚠ PARTIAL (needs viewBox validation) |
| **Scale to any size** | Core benefit of vector graphics | Medium | Must handle viewBox, fixed units, missing dimensions | ⚠ PARTIAL (basic scaling works) |
| **Import as static image** | Simplest use case for decorative graphics | Low | Convert to data URL, place on canvas | ✓ YES (image element) |
| **Duplicate imported assets** | Reuse same graphic multiple times | Low | Standard copy/paste works | ✓ YES (general copy/paste) |
| **Export SVG in output** | Maintain vector quality in final code | Medium | Embed as data URL or inline SVG | ✓ YES (data URL in images) |
| **Undo/redo import actions** | Integration with history system | Medium | Must work with existing undo stack | ✓ YES (integrated) |

### Dependency on Existing v1.0 Features

All table stakes build on v1.0 foundation:
- Drag-drop system uses `react-dropzone` (already integrated)
- Preview uses `svgson` parser (already integrated)
- Import creates Image elements (already supported)
- Undo/redo uses existing history system (already complete)

**v1.1 Gaps:**
- ViewBox validation and normalization (NEW)
- preserveAspectRatio edge case handling (NEW)

---

## Differentiators

Features that make SVG import better than using raster images. These justify using SVG over PNG.

| Feature | Value Proposition | Complexity | Notes | Implementation Strategy |
|---------|-------------------|------------|-------|-------------------------|
| **Layer detection from naming** | Designers already name layers in Figma/Illustrator | Medium | v1.0 has naming conventions (indicator, thumb, track, fill, glow) | ENHANCE (expand conventions) |
| **Interactive layer assignment** | Fix misdetected layers without re-exporting | Medium | v1.0 has "Design Mode" dialog | ENHANCE (better UX) |
| **Asset library management** | Reuse custom knobs/graphics across projects | High | Central panel for browsing saved assets | ✱ NEW (core v1.1 feature) |
| **Knob rotation mapping** | SVG layers animate on parameter change | High | Map indicator layer to rotation transform | ✱ NEW (core v1.1 feature) |
| **Slider fill animation** | SVG fill layer grows with slider value | Medium | Map fill layer to clip-path or scale | DEFER to v1.2 |
| **Multi-state button graphics** | Different SVG layers for normal/hover/active | Medium | Map layers to button states | DEFER to v1.2 |
| **Optimization on import** | Auto-cleanup with SVGO (remove metadata, simplify paths) | Medium | Reduces file size, improves performance | ✱ NEW (optional preprocessing) |
| **Stroke-to-path conversion** | Ensures consistent rendering across browsers | Medium | Convert strokes to fills for webfont compatibility | ✱ NEW (warning only, not auto-convert) |
| **Asset categories** | Organize by type (knobs, sliders, decorative) | Low | Tag system + filtering in asset panel | ✱ NEW (library organization) |
| **Asset preview thumbnails** | Quick visual browsing in library | Medium | Generate PNG previews for fast rendering | ✱ NEW (library UX) |
| **Export asset library** | Share custom assets between projects | Low | Save library as separate JSON file | ✱ NEW (library portability) |

### Why These Differentiate

**vs. Figma/Sketch:** Those tools import SVG for design, but don't map layers to interactive behavior. We connect SVG layers directly to control properties (rotation, fill, state).

**vs. Hand-coding:** Developer imports knob once, uses it for all parameters. No manual CSS animation per knob.

**vs. Filmstrips:** SVG scales perfectly at any resolution. Filmstrips are memory-intensive and fixed-resolution.

---

## Anti-Features

Features to deliberately NOT build in v1.1. Common mistakes or premature optimization.

| Anti-Feature | Why Avoid | What to Do Instead | Priority |
|--------------|-----------|-------------------|----------|
| **SVG editing tools** | Out of scope — users have Figma/Illustrator | Keep import-only workflow, no in-app editing | CRITICAL |
| **Automated stroke expansion** | Can break designs, should be user's choice | Warn if strokes detected, link to external tools | HIGH |
| **SVG animation timeline** | Too complex for v1.1, niche use case | Focus on static + interactive controls only | HIGH |
| **Gradient editor** | Design-time concern, handle in source tool | Import gradients as-is from SVG | MEDIUM |
| **Path simplification UI** | Adds complexity, questionable value | Auto-simplify on import (SVGO), no manual controls | MEDIUM |
| **Multi-page SVG support** | SVGs rarely have pages, adds complexity | Import first/root SVG only | LOW |
| **Font subsetting** | Only relevant if text in SVG, rare for controls | Convert text to paths in source tool | LOW |
| **Bitmap embedding** | Defeats purpose of vector import | Warn if bitmap detected, suggest pure vector | LOW |
| **Real-time SVG rendering** | Performance risk for complex SVGs | Pre-render thumbnails, lazy-load in library | MEDIUM |

### Critical Anti-Feature: No In-App SVG Editing

Research shows design tools have two models:

1. **Import-Edit Model** (Figma, Illustrator) — Import SVG, then edit paths/shapes in-app
2. **Import-Only Model** (Asset libraries, design systems) — Import SVG, use as-is

**Our Model:** Import-Only with Layer Mapping

**Rationale:**
- Users already have Figma/Illustrator for SVG creation
- Editing tools are massive scope (path manipulation, bezier handles, boolean ops)
- Our value is connecting SVG layers to control behavior, not SVG creation
- Keep tool focused: design tool for layout, not vector editor

**User Workflow:**
1. Design SVG in Figma/Illustrator (export with named layers)
2. Import to our tool
3. Map layers to control parts (indicator, track, etc.)
4. Use across multiple controls

---

## Feature Dependencies

### Dependency Graph

```
Static SVG Import (v1.0) ✓
  └── Import as Image ✓
  └── Drag-drop upload ✓
  └── Preview + dimensions ✓

Interactive SVG Controls (v1.1) — Core Focus
  ├── Layer Detection (v1.0) ✓
  │   └── Naming conventions ✓
  │   └── Design Mode dialog ✓
  ├── Layer-to-Property Mapping (NEW) ✱
  │   ├── Knob rotation → indicator layer
  │   ├── Slider value → fill layer (defer v1.2)
  │   └── Button state → layer visibility (defer v1.2)
  └── Rendering System (NEW) ✱
      ├── CSS transform for rotation
      ├── clip-path for fills (defer v1.2)
      └── display:none for states (defer v1.2)

Asset Library (v1.1) — Core Focus ✱
  ├── Storage (NEW) ✱
  │   ├── Save assets to library
  │   └── Load from library
  ├── Organization (NEW) ✱
  │   ├── Categories (knobs/sliders/decorative)
  │   └── Search/filter
  └── Export/Import (NEW) ✱
      ├── Export library JSON
      └── Import library JSON

Optimization Pipeline (v1.1 - Optional)
  ├── SVGO integration (NEW) ✱
  ├── Stroke-to-path warning (NEW) ✱
  └── ViewBox normalization (NEW) ✱
```

### Critical Path for v1.1

Must have in order:

1. **Asset Library Storage** — Can't reuse assets without persistence
2. **Knob Rotation Mapping** — Core use case for interactive SVG
3. **Asset Library UI** — Access point for saved assets
4. **Category System** — Organize knobs vs decorative graphics

Can defer to v1.2:

- Slider fill animation (less common than knobs)
- Button multi-state (buttons usually simple)
- Advanced optimization pipeline (nice-to-have)

---

## Audio Plugin Domain Specifics

### Knob Design Patterns

Based on audio plugin UI research:

**Traditional Approach: Filmstrips**
- PNG sequence with 64-128 frames (0° to 280° rotation)
- Large file sizes (250px × 128 frames = 32,000px tall image)
- Memory-intensive, but proven workflow
- Photoshop workflow: render 3D → composite frames

**Modern Approach: SVG Rotation**
- Single SVG with layers (track, arc, indicator)
- CSS transform: rotate(θdeg) on indicator layer
- Perfect scaling at any resolution
- Smaller file size, but requires layer structure

**User Expectation:** Audio developers expect filmstrip workflow BUT prefer SVG if tool makes it easy.

**Our Value Proposition:** Make SVG rotation as easy as filmstrips used to be.

### Common SVG Layer Structures

From ecosystem research and existing v1.0 naming conventions:

| Element Type | Expected Layers | Purpose | v1.1 Support |
|-------------|-----------------|---------|--------------|
| **Knob** | track, arc, indicator, glow | track = background circle, arc = value arc, indicator = pointer/dot, glow = highlight | ✓ YES (core feature) |
| **Slider** | track, thumb, fill | track = rail, thumb = handle, fill = progress bar | DEFER v1.2 |
| **Button** | normal, hover, active, disabled | State-based layer visibility | DEFER v1.2 |
| **Meter** | background, fill, peak-hold, clip | fill = current level, peak-hold = max indicator | DEFER v1.2 |
| **Logo/Icon** | (single layer or none) | Static decorative graphic | ✓ YES (image element) |

### Naming Convention Extensions

**v1.0 detects:** indicator, thumb, track, fill, glow, background, pointer, needle, handle, grip, progress, value, highlight, hover

**v1.1 additions:**
- `arc` — value arc on knobs (common in audio UIs)
- `normal` / `hover` / `active` / `disabled` — button states (defer v1.2)
- `peak` / `clip` — meter states (defer v1.2)
- `decoration` / `ornament` — non-interactive layers

---

## MVP Recommendation for v1.1

Focus: **Asset Library + Interactive Knobs**

### Must Have (Core Value)

1. **Asset Library Panel** (new UI component)
   - Save imported SVG assets with names/categories
   - Browse saved assets with thumbnails
   - Drag from library to canvas
   - Delete assets from library
   - **Complexity:** High (new system)
   - **Value:** Core v1.1 feature

2. **Interactive Knob Rendering** (extends existing knob renderer)
   - Map indicator layer to rotation transform
   - CSS: `transform: rotate(calc(value * 280deg - 140deg))`
   - Preview rotation in property panel
   - **Complexity:** High (new rendering mode)
   - **Value:** Core v1.1 feature

3. **Asset Categories** (organization)
   - Tag assets as: Knobs, Sliders, Buttons, Decorative
   - Filter library by category
   - Auto-suggest category from detected layers
   - **Complexity:** Low (metadata system)
   - **Value:** Essential for usability

4. **Library Persistence** (storage)
   - Save library to localStorage
   - Export library as JSON file
   - Import library from JSON file
   - **Complexity:** Medium (file I/O)
   - **Value:** Essential for asset reuse

### Should Have (Better UX)

5. **Improved Layer Detection** (enhance v1.0)
   - Add `arc`, `normal`, `hover`, `active` to conventions
   - Show confidence score for auto-detection
   - Quick-assign buttons in Design Mode
   - **Complexity:** Low (extend existing system)
   - **Value:** Reduces manual layer assignment

6. **ViewBox Validation** (quality)
   - Warn if SVG has no viewBox
   - Auto-add viewBox from width/height
   - Handle preserveAspectRatio edge cases
   - **Complexity:** Medium (SVG parsing edge cases)
   - **Value:** Prevents scaling issues

7. **Asset Duplication** (workflow)
   - Duplicate asset in library (create variant)
   - Rename asset in library
   - Update all instances when asset modified
   - **Complexity:** Medium (reference tracking)
   - **Value:** Variant management

### Could Have (Polish)

8. **SVGO Optimization** (performance)
   - Run on import (optional toggle)
   - Show before/after file size
   - Preserve critical IDs for layer detection
   - **Complexity:** Low (library integration)
   - **Value:** Nice-to-have optimization

9. **Stroke Detection Warning** (quality)
   - Detect if SVG uses strokes
   - Warn that strokes may render inconsistently
   - Link to stroke-to-path conversion tools
   - **Complexity:** Low (SVG analysis)
   - **Value:** Prevents rendering issues

10. **Asset Search** (large libraries)
    - Text search by asset name
    - Filter by multiple categories
    - Sort by date added / name
    - **Complexity:** Low (string filtering)
    - **Value:** Useful for large libraries (50+ assets)

### Won't Have (v1.2+)

- Slider fill animation (defer to v1.2)
- Button multi-state graphics (defer to v1.2)
- Meter animation system (defer to v1.2)
- In-app SVG editing (out of scope forever)
- Gradient editor (out of scope)
- SVG animation timeline (out of scope)

---

## Feature Comparison Matrix

How does our v1.1 system compare to design tool SVG import?

| Feature | Figma | Sketch | Illustrator | Our v1.1 | Notes |
|---------|-------|--------|-------------|----------|-------|
| Drag-drop SVG import | ✓ | ✓ | ✓ | ✓ | Table stakes |
| Preserve layers/groups | ✓ | ✓ | ✓ | ✓ | Via naming conventions |
| Flatten on import | ✓ | ✓ | ✓ | ✓ | "Add as Image" option |
| Edit after import | ✓ | ✓ | ✓ | ✗ | Anti-feature (out of scope) |
| Asset library | ✓ | ✓ | ✓ | ✓ | New in v1.1 |
| Interactive controls | ✗ | ✗ | ✗ | ✓ | **Differentiator** |
| Rotation mapping | ✗ | ✗ | ✗ | ✓ | **Differentiator** |
| Audio plugin export | ✗ | ✗ | ✗ | ✓ | **Differentiator** |
| SVGO optimization | Plugin | Plugin | ✗ | ✓ | Planned |
| Stroke-to-path convert | ✓ | ✓ | ✓ | ✗ | External tools |

---

## User Stories

### Static SVG Graphics

**As a plugin developer**, I want to import my company logo as SVG so it scales perfectly at any plugin window size.

**Workflow:**
1. Drag logo.svg onto Import area
2. Preview shows logo + dimensions
3. Click "Add as Image"
4. Logo appears on canvas, resize to fit header
5. Export → logo embedded as data URL in HTML

**Existing Support:** ✓ Full (v1.0)

---

**As a plugin developer**, I want to save decorative divider graphics to reuse across projects so I maintain consistent branding.

**Workflow:**
1. Import divider.svg
2. Click "Save to Library"
3. Name it "Brand Divider", tag as "Decorative"
4. In future projects, open Asset Library → drag "Brand Divider" to canvas

**Existing Support:** ✱ NEW (v1.1 feature)

---

### Interactive SVG Knobs

**As a plugin developer**, I want to import a custom knob design from my designer so my plugin UI matches my brand.

**Workflow:**
1. Designer exports knob.svg from Figma with layers: "track", "arc", "indicator"
2. Drag knob.svg onto Import area
3. Design Mode opens, shows detected layers with correct types
4. Click "Save as Knob"
5. Name it "Brand Knob", saved to library under "Knobs" category
6. Drag from library to canvas → creates interactive knob element
7. Indicator layer rotates on parameter value change

**Existing Support:** ⚠ PARTIAL (layer detection exists, rotation mapping missing)

---

**As a plugin developer**, I want to use the same custom knob for multiple parameters so my UI has consistent styling.

**Workflow:**
1. Import + save "Brand Knob" (see above)
2. Drag from library to canvas 5 times
3. Configure each instance with different parameter ID
4. All knobs use same SVG, different values

**Existing Support:** ⚠ PARTIAL (can duplicate image elements, but not interactive knobs)

---

### Asset Library Management

**As a plugin developer**, I want to organize my custom UI assets by type so I can quickly find the right graphic.

**Workflow:**
1. Import 10 SVG files (knobs, sliders, logos)
2. Each gets tagged: 3 "Knobs", 2 "Sliders", 5 "Decorative"
3. Open Asset Library panel
4. Filter to "Knobs" → see only knob designs
5. Click thumbnail to preview full size

**Existing Support:** ✱ NEW (v1.1 feature)

---

**As a plugin developer**, I want to export my asset library so I can share it with other developers on my team.

**Workflow:**
1. Build library with 15 custom assets
2. Click "Export Library" → saves assets.json
3. Teammate imports assets.json → instantly has all 15 assets
4. Can use in their own projects

**Existing Support:** ✱ NEW (v1.1 feature)

---

## Technical Considerations

### SVG Rendering Challenges

| Challenge | Solution | Complexity | v1.1 Priority |
|-----------|----------|------------|---------------|
| **Missing viewBox** | Auto-generate from width/height attrs | Low | Must Have |
| **Fixed units (px, pt)** | Strip units, use viewBox for scaling | Medium | Should Have |
| **Embedded bitmaps** | Warn user, support but discourage | Low | Could Have |
| **Strokes vs fills** | Warn if strokes detected, import as-is | Low | Could Have |
| **Complex paths** | SVGO simplification (optional) | Medium | Could Have |
| **Nested transforms** | Flatten on import (preserve visual) | High | Defer v1.2 |
| **CSS in `<style>`** | Extract to inline styles | Medium | Defer v1.2 |
| **External resources** | Warn, require self-contained SVG | Low | Should Have |

### Performance Considerations

| Concern | At 10 assets | At 100 assets | At 1000 assets |
|---------|--------------|---------------|----------------|
| **Library load time** | Instant | <100ms | <500ms (lazy load) |
| **Thumbnail generation** | Real-time | Real-time | Pre-generate + cache |
| **Canvas rendering** | No impact | No impact | No impact (only active elements) |
| **Export size** | Negligible | +50KB | +500KB (acceptable for desktop) |

### Storage Strategy

**localStorage** for library persistence:

- Key: `vst3-designer-asset-library`
- Value: JSON array of assets
- Structure:
  ```json
  {
    "id": "uuid",
    "name": "Brand Knob",
    "category": "knobs",
    "svg": "<svg>...</svg>",
    "layers": { "indicator": "<g>...</g>", "track": "<circle>..." },
    "thumbnail": "data:image/png;base64,...",
    "width": 100,
    "height": 100,
    "created": "2026-01-25T12:00:00Z"
  }
  ```

**Limits:**
- localStorage typically 5-10MB
- 1 SVG asset ≈ 5-50KB
- Safe limit: ~100 assets (5MB)
- Warn at 50 assets, block at 100

**Export/Import:**
- JSON file for portability
- No size limit (user's file system)
- Can share across team

### Integration with v1.0 Codebase

**Existing strengths to leverage:**

1. **SVG layer detection** (`svgLayerExtractor.ts`)
   - Already detects: indicator, thumb, track, fill, glow
   - ✱ Extend with: arc, normal, hover, active, peak, clip

2. **Design Mode dialog** (`SVGDesignMode.tsx`)
   - Already has layer assignment UI
   - ✱ Enhance with: category selection, save-to-library button

3. **Element renderers** (`KnobRenderer.tsx`, `SliderRenderer.tsx`)
   - Already render SVG arcs procedurally
   - ✱ Extend with: render imported SVG layers with transforms

4. **Zustand store** (state management)
   - ✱ Add `assetLibrary` slice with actions: add, remove, update, import, export

5. **@dnd-kit** (drag-drop)
   - ✱ Extend palette to include library panel
   - ✱ Drag from library → canvas uses existing drop logic

**Gaps to fill:**

1. ✱ Asset library UI component (new)
2. ✱ Layer-to-property mapping system (new)
3. ✱ SVG layer rendering in element components (extend existing)
4. ✱ Library persistence (localStorage + JSON export) (new)
5. ✱ Thumbnail generation (new — use canvas API)

---

## Implementation Complexity

### Low Complexity (1-2 days)

- Asset library storage (Zustand slice + localStorage)
- Category tagging system
- Export/import library JSON
- Extend naming conventions (add arc, normal, hover, active)
- ViewBox validation + auto-generation

### Medium Complexity (3-5 days)

- Asset library UI panel (list, thumbnails, filter, search)
- Thumbnail generation (render SVG to canvas, extract PNG data URL)
- Drag from library to canvas (integrate with @dnd-kit)
- Enhanced Design Mode UX (quick-assign buttons, category select)
- SVGO integration (optional optimization toggle)

### High Complexity (5-10 days)

- Knob rotation mapping (transform indicator layer based on value)
- SVG layer rendering in KnobRenderer (replace procedural arc with imported SVG)
- Multi-layer element system (generalize beyond knobs to sliders/buttons)
- Nested transform flattening (handle complex SVG structures)
- Real-time rotation preview in property panel

---

## Sources

### Design Tool Patterns
- [Improved SVG Import: Compound Paths](https://www.shapertools.com/en-us/blog/compound-paths) — SVG fill-rule handling
- [Tips for Creating and Exporting Better SVGs for the Web](https://www.sarasoueidan.com/blog/svg-tips-for-designers/) — Best practices
- [Best Practices for Working with SVGs](https://www.bitovi.com/blog/best-practices-for-working-with-svgs) — Optimization techniques
- [A Practical Guide To SVG And Design Tools — Smashing Magazine](https://www.smashingmagazine.com/2019/05/svg-design-tools-practical-guide/) — Design tool comparison

### Figma/Sketch SVG Import
- [How to import optimized SVG files to Figma with one click using Convertify](https://www.hypermatic.com/tutorials/how-to-import-optimized-svg-files-to-figma-with-one-click-using-convertify/) — Plugin-based optimization
- [Copy assets between design tools – Figma Learn](https://help.figma.com/hc/en-us/articles/360040030374-Copy-assets-between-design-tools) — Cross-tool workflows
- [How to Import Files Into Figma](https://www.oreateai.com/blog/how-to-import-files-into-figma/6e5990bc69d69e8458489c9b821c1807) — Import patterns

### Audio Plugin UI Design
- [AudioKnobs — Beautiful SVG audio knobs with mouse and touch control](https://github.com/Megaemce/AudioKnobs) — SVG knob library
- [Vector graphics gui's and knob/slider design - JUCE Forum](https://forum.juce.com/t/vector-graphics-guis-and-knob-slider-design/13524) — Community discussion
- [Ui Design Tutorials? - KVR Audio](https://www.kvraudio.com/forum/viewtopic.php?t=541318) — Design approaches (flat vs skeuomorphic)
- [Free HISE Filmstrips! Analog Knob-Kit 01](https://forum.hise.audio/topic/6427/free-hise-filmstrips-analog-knob-kit-01-by-noisehead) — Filmstrip workflow
- [Procedural User Interface Design – Audio Damage](https://www.audiodamage.com/blogs/news/procedures) — Procedural vs image-based

### SVG Technical Details
- [SVG viewBox Explained: The Complete Guide](https://www.svggenie.com/blog/svg-viewbox-guide) — Scaling behavior
- [Understanding SVG Coordinate Systems and Transformations](https://www.sarasoueidan.com/blog/svg-coordinate-systems/) — viewport, viewBox, preserveAspectRatio
- [preserveAspectRatio - SVG | MDN](https://developer.mozilla.org/en-US/docs/Web/SVG/Reference/Attribute/preserveAspectRatio) — Official docs
- [How to Scale SVG | CSS-Tricks](https://css-tricks.com/scale-svg/) — Practical scaling techniques

### SVG Layer Management
- [Preserve Layers When Opening an SVG File](https://alpha.inkscape.org/vectors/www.inkscapeforum.com/viewtopic5a60.html?t=1272) — Layer preservation challenges
- [GitHub: svg-flatten](https://github.com/stadline/svg-flatten) — Convert shapes to paths, merge groups
- [The Illustrator-to-Figma Pipeline: A Guide to Clean, Editable SVGs](https://medium.com/@King_Marquant/the-illustrator-to-figma-pipeline-a-guide-to-clean-editable-svgs-cb71ba3d31d9) — Workflow optimization

### SVG Optimization
- [SVGO - Node.js tool for optimizing SVG files](https://github.com/svg/svgo) — Industry-standard optimizer
- [SVGOMG - SVGO's Missing GUI](https://jakearchibald.github.io/svgomg/) — Online tool with visual preview
- [Three Ways of Decreasing SVG File Size with SVGO](https://www.sitepoint.com/three-ways-decreasing-svg-file-size-svgo/) — Optimization strategies
- [A Developer's Guide to SVG Optimization | Cloudinary](https://cloudinary.com/guides/image-formats/a-developers-guide-to-svg-optimization) — Comprehensive guide

### Asset Management Patterns
- [SVG Asset Library for Building Automation](https://watkinswebdesign.co.uk/case-studies/svg-asset-library-for-building-automation) — Award-winning library (1,857 assets)
- [Creating your custom SVG Icon library in React](https://medium.com/@mateuszpalka/creating-your-custom-svg-icon-library-in-react-a5ff1c4c704a) — Component patterns
- [Transform SVGs into React Components with SVGR](https://www.ivstudio.com/blog/svg-icon-library-in-react) — Build-time optimization
- [9 New Design System Examples to Scale Brands in 2026](https://www.superside.com/blog/design-systems-examples) — Enterprise asset management

### SVG Path Conversion
- [Convert SVGs from Stroke to Path](https://dev.to/saulodias/convert-svgs-from-stroke-to-path-420j) — Stroke conversion techniques
- [SVG Stroke to Fill Converter Online](https://10015.io/tools/svg-stroke-to-fill-converter) — Online conversion tool
- [GitHub: svg-stroke-to-path](https://github.com/leifgehrmann/svg-stroke-to-path) — Inkscape CLI automation

---

## Confidence Assessment

| Category | Confidence | Notes |
|----------|-----------|-------|
| **Table stakes features** | HIGH | Validated against Figma, Sketch, Illustrator patterns + v1.0 codebase |
| **Differentiators** | HIGH | Audio plugin domain research + v1.0 SVG system analysis |
| **Anti-features** | HIGH | Based on design tool scope boundaries + v1.0 lessons |
| **Implementation complexity** | HIGH | Direct analysis of existing v1.0 code + library ecosystem |
| **Storage strategy** | HIGH | localStorage limits well-documented, JSON export standard |
| **Audio plugin patterns** | MEDIUM | Based on forum discussions and example projects, not user interviews |

---

## Next Steps

This research informs:
1. **REQUIREMENTS.md** — Convert features to testable requirements
2. **ROADMAP.md** — Phase structure for v1.1 implementation
3. **ARCHITECTURE.md** — Component design for asset library + rotation system
4. **PITFALLS.md** — SVG import gotchas and edge cases

---

*Research completed: 2026-01-25*
*Ready for requirements definition phase*
