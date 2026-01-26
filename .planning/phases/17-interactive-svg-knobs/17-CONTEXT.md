# Phase 17: Interactive SVG Knobs - Context

**Gathered:** 2026-01-26
**Status:** Ready for planning

<domain>
## Phase Boundary

Import custom SVG knob designs, create reusable "Knob Styles" stored in project state, and apply styles to existing knob elements. Knobs with SVG styles render with rotation animation based on parameter value. Multiple knobs can share the same style. Users can override colors per knob instance.

</domain>

<decisions>
## Implementation Decisions

### Layer Mapping
- **Hybrid approach**: Auto-detect layers by naming convention (indicator, track, arc, glow, shadow), then show confirmation dialog for user to adjust mappings
- **5 layer roles supported**: indicator, track, arc, glow, shadow
- **All layers must be mapped**: User must assign or explicitly exclude every layer — no unmapped layers render
- **Flat SVG handling**: Claude's discretion on whether to reject or treat as single indicator

### Animation Style
- **Indicator animation**: Rotation + position offset (some knobs have indicators that also move radially)
- **Rotation range**: Configurable per style (user sets min/max angles when creating style) — supports 270° standard, 360° continuous, or custom
- **Arc animation**: Claude's discretion based on common knob patterns (fill from start to value is typical)
- **Glow/shadow animation**: Intensity changes by value (glow gets brighter as value increases)

### Style Application
- **Apply via dropdown**: Property panel dropdown to select from available knob styles — matches existing element pattern
- **Text-only dropdown**: Style names without thumbnail previews (simpler, faster)
- **No style = default CSS knob**: Existing gradient knob rendering preserved when no style applied (backward compatible)
- **Style management**: "Manage styles..." link in property panel opens dialog (not Asset Library)

### Color Overrides
- **All mapped layers colorable**: User can override indicator, track, arc, glow, shadow colors per instance
- **SVG attribute replacement**: Replace fill/stroke attributes in SVG content (not CSS vars)
- **Color swatches UI**: Click swatch to open color picker — consistent with existing property panel patterns
- **No override = original colors**: Colors from imported SVG preserved unless explicitly overridden

### Claude's Discretion
- Flat SVG handling (reject vs treat as single indicator)
- Arc animation behavior (fill, visibility, or static)
- Technical implementation of rotation + position offset
- Style dialog layout and workflow

</decisions>

<specifics>
## Specific Ideas

- Rotation range should default to 270° (-135° to +135°) as that's standard for audio plugins
- Glow intensity feedback is important for visual responsiveness — users like seeing knobs "light up"
- Style management from property panel keeps workflow focused (don't need to switch to Asset Library)

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 17-interactive-svg-knobs*
*Context gathered: 2026-01-26*
