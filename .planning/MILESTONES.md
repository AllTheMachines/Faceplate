# Project Milestones: VST3 WebView UI Designer

## v1.9 Layers & Help System (Shipped: 2026-01-29)

**Delivered:** Layers system for element organization with visibility/lock/z-order control, contextual help system with dark-themed documentation windows.

**Phases completed:** 41-43 (11 plans total)

**Key accomplishments:**
- User-created layers with custom names and colors for element organization
- Layer visibility toggle - hidden layers' elements don't render on canvas
- Layer lock toggle - locked elements can't be moved or resized
- Drag-to-reorder layers with z-order control on canvas
- Context menu "Move to Layer" for reassigning elements between layers
- Help buttons on every Properties Panel section with dark-themed popup windows
- F1 keyboard shortcut for contextual help based on current selection
- 102 element types documented with comprehensive help content
- Fixed: Single-window folder export now writes directly (no subfolder)
- Fixed: Container editor multi-select drag moves all selected elements together

**Stats:**
- 53 files modified
- +8,590 lines of TypeScript
- 3 phases, 11 plans, 26 truths verified
- 1 day from start to ship (2026-01-29)

**Git range:** `feat(41-01)` -> `docs(43): complete Help System phase`

**What's next:** v2.0 or next milestone

---

## v1.8 Bug Fixes & UI Improvements (Shipped: 2026-01-29)

**Delivered:** Critical bug fixes and quality-of-life improvements including folder export, container editor enhancements, and UI polish.

**Phases completed:** 40 (8 plans total)

**Key accomplishments:**
- Version inference from structure for backward compatibility
- Window-scoped name validation and multi-window duplicate fix
- Button borderWidth property with full round-trip support
- Color picker state sync and label/value distance controls
- Folder export via File System Access API (Chrome/Edge)
- Container editor: grid support, copy/paste/duplicate, context menu
- Alt/Ctrl+click deselection for multi-select workflow
- Font weight display showing actual subfamily names

**Stats:**
- 1 phase, 8 plans, 43 commits
- ~70,500 lines of TypeScript
- 1 day from start to ship (2026-01-29)

**Deferred to v1.9:**
- GitHub #2: Folder export subfolder for single-window (minor)
- GitHub #3: Container multi-select drag (major)

**Git range:** `feat(40-01)` → `docs(40): complete Bug Fixes & UI Improvements phase`

**What's next:** v1.9 — Address deferred issues and new features

---

## v1.7 Parameter Sync (Shipped: 2026-01-28)

**Delivered:** Parameter synchronization ensuring WebView UI reflects actual C++ parameter values when editor opens.

**Phases completed:** 39 (1 phase, 1 plan)

**Key accomplishments:**
- Export generates `setupParameterSyncListener()` in bindings.js
- Listener handles `__juce__paramSync` event from C++ backend
- All parameter-bound elements update visual and internal state
- JUCE_INTEGRATION.md includes C++ implementation examples

**Stats:**
- 1 phase, 1 plan
- 1 day from start to ship (2026-01-28)

**Git range:** `feat(39)` — Parameter Sync

**What's next:** v1.8 Bug Fixes & UI Improvements

---

## v1.6 Multi-Window System (Shipped: 2026-01-28)

**Delivered:** Multi-window project architecture with independent windows, navigation between windows, and separate export folders.

**Phases completed:** 38 (1 phase, direct implementation)

**Key accomplishments:**
- Multiple windows per project with independent dimensions and backgrounds
- Window types: 'release' (always exported) and 'developer' (optional in export)
- Window tabs UI with context menu (rename, delete, duplicate, type toggle)
- Window properties panel in RightPanel (name, type, width, height, background)
- Copy/paste elements between windows with proper element-to-window association
- Button navigation action property for switching between windows
- Multi-window browser preview with tab bar navigation
- Multi-window export bundle with separate folders per window
- Project serialization v2.0.0 format with windows array
- Automatic migration from v1.x single-canvas projects to v2.0.0 multi-window format
- Per-window viewport state preservation when switching windows

**Stats:**
- 15+ files created/modified
- WindowsSlice, WindowTabs, multi-window preview, multi-window export
- 1 phase, 10 requirements (100% satisfied)
- 1 day from start to ship (2026-01-28)

**Git range:** `feat(38)` — Multi-window system

**What's next:** v1.7 — Future enhancements

---

## v1.5 Export & Asset Management (Shipped: 2026-01-27)

**Delivered:** SVG export with named layers for re-import workflow, plus centralized font management with user directory selection and export bundling.

**Phases completed:** 36-37 (6 plans total)

**Key accomplishments:**
- SVG export with meaningful layer names for element re-import workflow
- Consistent layer naming conventions documented (LAYER_CONVENTIONS)
- Auto-match layers on import with validation and error/warning feedback
- User-selected fonts folder via File System Access API with IndexedDB persistence
- Custom font dropdown with preview (fonts shown in their typeface)
- Export bundles only used fonts with base64 embedding for custom fonts

**Stats:**
- 48 files created/modified
- +5,943 / -167 lines changed
- 2 phases, 6 plans, 13 requirements (100% satisfied)
- 1 day from start to ship (2026-01-27)

**Git range:** `feat(36)` → `docs(37): complete Font Management System phase`

**What's next:** v2.0 — Next major version with enhanced features

---

## v1.4 Container Editing System (Shipped: 2026-01-27)

**Delivered:** Full container editing system with dedicated interior editing interface, nested container support, and scrollbar system.

**Phases completed:** 34-35 (2 plans total)

**Key accomplishments:**
- Container Element Editor with full-screen dark red theme
- "Edit Contents" button for all 5 editable container types
- Container-in-container support with breadcrumb navigation
- Custom scrollbar system with 6 configurable style options

**Stats:**
- 2 phases, 2 plans
- 1 day from start to ship (2026-01-27)

**Git range:** `feat(34)` → `feat(35)`

**What's next:** v1.5 Export & Asset Management

---

## v1.3 Workflow & Protection (Shipped: 2026-01-27)

**Delivered:** Enhanced workflow features including undo/redo history panel, unsaved changes protection, and adjustable snap grid.

**Phases completed:** 31-33 (5 plans total)

**Key accomplishments:**
- Undo/Redo History Panel with visual state distinction and time-travel navigation
- Unsaved changes protection with browser beforeunload warning
- Adjustable snap grid with keyboard toggle and zoom-aware rendering
- Document title asterisk and "Last saved: X ago" indicator

**Stats:**
- 3 phases, 5 plans
- 1 day from start to ship (2026-01-27)

**Git range:** `feat(31)` → `feat(33)`

**What's next:** v1.4 Container Editing System

---

## v1.2 Complete Element Taxonomy (Shipped: 2026-01-27)

**Delivered:** Complete implementation of all 78 remaining UI elements from the specification plus UX improvements.

**Phases completed:** 19-30 + 27.1 (54 plans total)

**Key accomplishments:**
- 78 new element types across 10 categories (rotary, linear, buttons, displays, LEDs, meters, visualizations, curves, navigation, containers)
- Architecture refactoring with registry pattern for scalable element management
- 24 professional audio meters with standards-compliant ballistics
- 5 Canvas visualizations and 5 interactive curve editors
- Built-in icon system with 35 audio plugin icons

**Stats:**
- 12 phases, 54 plans, 78 requirements (100% satisfied)
- 2 days from start to ship (2026-01-26 → 2026-01-27)

**Git range:** `feat(19)` → `docs(30)`

**What's next:** v1.3 Workflow & Protection

---

## v1.1 SVG Import System (Shipped: 2026-01-26)

**Delivered:** Comprehensive SVG import system for custom UI assets with defense-in-depth security, central asset library, static graphics, and interactive knob designs.

**Phases completed:** 14-18 (26 plans total)

**Key accomplishments:**
- Defense-in-depth SVG security with 4-point sanitization (upload, load, render, export)
- Central asset library for importing, organizing, and browsing SVG assets
- SVG Graphics element type for scalable decorative elements
- Interactive SVG knobs with layer mapping and per-instance color overrides
- Professional export with SVGO optimization, responsive scaling, and JUCE README

**Stats:**
- 118 files created/modified
- +22,442 / -534 lines changed
- 5 phases, 26 plans, 38 requirements (100% satisfied)
- 2 days from start to ship (2026-01-25 → 2026-01-26)

**Git range:** `feat(14-01)` → `docs(18): v1.1 SHIPPED`

**What's next:** v1.2 enhancements — Extended SVG controls (sliders, buttons, meters), asset management improvements

---

## v1.0 MVP (Shipped: 2026-01-25)

**Delivered:** A browser-based visual design tool for audio plugin UIs with working JUCE WebView2 code export.

**Phases completed:** 1-13 (62 plans total)

**Key accomplishments:**
- Complete three-panel visual design tool (palette, canvas, properties)
- 22 element types: knobs, sliders, buttons, meters, containers, form controls, audio displays
- Full canvas manipulation with pan/zoom, drag-drop, resize handles, nudge, snap-to-grid
- Working JUCE WebView2 export with dynamic bridge pattern and C++ snippets
- JSON project persistence with Zod validation and round-trip integrity
- Extended audio widgets: modulation matrix, preset browser, waveform/oscilloscope placeholders

**Stats:**
- 420 files created/modified
- ~99,000 lines of TypeScript
- 13 phases, 62 plans, ~250 tasks
- 3 days from start to ship (2026-01-23 → 2026-01-25)

**Git range:** `feat(01-01)` → `feat(13-16)`

**What's next:** v1.1 enhancements based on user feedback (see `.planning/ISSUES-v1.1.md`)

---
