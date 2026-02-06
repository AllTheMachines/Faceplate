# Phase 62: Properties Panel & Layers - Context

**Gathered:** 2026-02-06
**Status:** Ready for planning

<domain>
## Phase Boundary

Document the properties panel (configuring element properties) and layers system (organizing elements into layers with visibility/lock/z-order). This is a documentation-only phase — no code changes. Two topic files for the user manual.

</domain>

<decisions>
## Implementation Decisions

### Properties panel structure
- Reference-only format — no walkthrough intro (canvas docs already cover element selection)
- Common properties (position, size, name, parameterId, colors) documented once at the top in a dedicated section
- Element-specific properties organized by category (controls, displays, meters, etc.) with tables
- Category tables use three columns: property name, type, brief description (e.g., `steps | number | Number of discrete positions (2-128)`)
- No cross-references or reminders about common props in each category section

### Parameter binding
- Conceptual explanation of what parameterId IS — the bridge between UI element and JUCE audio processing
- Concrete example (e.g., volume slider → gain parameter)
- Brief JUCE-side C++ code snippet showing how exported HTML connects to AudioParameterFloat
- parameterId documented as freeform string field that must match the JUCE parameter name — no prescriptive naming conventions
- Text-based flow diagram: Faceplate element → parameterId → exported JS → JUCE WebView2 → AudioProcessor
- Screenshot placeholder for the parameterId field in the properties panel

### Layers documentation
- Step-by-step tutorial format for each operation (create, rename, delete, visibility toggle, lock toggle, z-order reorder)
- "Moving elements between layers" gets its own dedicated subsection (multi-step action)
- Z-order explained with text only — layers higher in the panel render on top, drag to reorder
- No best practices or workflow tips — just document the mechanics

### Help system
- Brief subsection within the properties panel doc (not its own major section)
- Document the mechanism only: click (?) for contextual help, press F1 with element selected
- Mention Related Topics navigation links briefly
- Don't list which sections have help content — users discover naturally
- Screenshot placeholder showing the help panel open with content and Related Topics visible

</decisions>

<specifics>
## Specific Ideas

No specific requirements — open to standard approaches matching the existing manual format established in Phase 60-61.

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 62-properties-layers*
*Context gathered: 2026-02-06*
