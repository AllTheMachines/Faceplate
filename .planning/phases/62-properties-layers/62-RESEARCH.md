# Phase 62: Properties Panel & Layers - Research

**Researched:** 2026-02-06
**Domain:** Technical documentation for existing UI features
**Confidence:** HIGH

## Summary

Phase 62 documents two established features in Faceplate: the properties panel (right panel for configuring element settings) and the layers system (left panel tab for organizing elements). Both features are fully implemented and actively used. This is a documentation-only phase -- no code changes required.

The properties panel provides context-sensitive property editors with common properties (position, size, name, parameterId) plus element-specific properties organized by category. It includes help buttons (?) on each section for contextual assistance. The layers system provides creation, renaming, deletion, visibility toggle, lock toggle, z-order reordering via drag-drop, and element assignment between layers.

The user has already decided the documentation structure (from CONTEXT.md): properties panel as reference-only format with common properties documented once at top, element-specific sections using 3-column tables, and parameter binding explained conceptually. Layers documentation uses step-by-step tutorial format for each operation.

**Primary recommendation:** Follow the established manual format from Phases 60-61 (numbered steps, screenshot placeholders, inline notes, beginner-friendly language) while adhering to user decisions about structure and content organization.

## Standard Stack

The documentation phase uses standard markdown documentation patterns -- no libraries or frameworks involved. The actual features being documented are implemented using:

### Core Documentation Format
| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| Markdown | CommonMark | Documentation format | Universal, version-control friendly, readable as plain text |
| Screenshot placeholders | N/A | Image references for future screenshots | Established in Phase 60 with format `![description](../images/filename.png)` |

### Supporting Conventions
| Convention | Purpose | When to Use |
|-----------|---------|-------------|
| Numbered steps | Tutorial-style instructions | Layer operations (create, rename, delete, reorder) |
| Bold UI names | Highlight interface elements | **Properties** panel, **Layers** tab, **F1** shortcut |
| Backtick values | Code or literal values | `parameterId`, `knob`, `0.5` |
| Inline notes | Edge cases and tips | "If snap grid is enabled..." |
| 3-column tables | Property references | Property name, type, description format |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Markdown | ReStructuredText | More features but less universal support |
| Screenshot placeholders | Actual screenshots | Would require capturing UI state, can become outdated |
| Numbered steps | Bullet lists | Less clear sequencing for multi-step operations |

**Installation:** None required (documentation writing)

## Architecture Patterns

### Recommended Documentation Structure

Based on existing manual files (getting-started.md, canvas.md) and CONTEXT decisions:

```
docs/manual/
├── properties.md          # Properties panel documentation
│   ├── Title + overview
│   ├── Common Properties section (position, size, name, parameterId, rotation)
│   ├── Parameter Binding section (conceptual explanation + JUCE example)
│   ├── Element-Specific Properties (by category with tables)
│   ├── Help System subsection (F1 + ? buttons)
│   └── Footer navigation links
└── layers.md              # Layers documentation
    ├── Title + overview
    ├── Creating Layers (step-by-step)
    ├── Renaming Layers (step-by-step)
    ├── Deleting Layers (step-by-step)
    ├── Layer Visibility (tutorial)
    ├── Layer Lock (tutorial)
    ├── Z-Order Control (text explanation + drag-to-reorder)
    ├── Moving Elements Between Layers (dedicated subsection)
    └── Footer navigation links
```

### Pattern 1: Reference Documentation (Properties Panel)

**What:** Properties panel doc is reference-only, not tutorial. User already knows how to select elements (covered in canvas.md). Focus is "what properties exist and what do they do."

**When to use:** When documenting configuration interfaces where discovery is the goal, not step-by-step guidance.

**Structure:**
```markdown
# Properties Panel

[Overview paragraph explaining panel purpose and location]

## Common Properties

All elements share these properties regardless of type:

[Table with property name | type | description]
- Position (x, y)
- Size (width, height)
- Name
- parameterId
- Rotation

## Parameter Binding

[Conceptual explanation: parameterId is the bridge between UI and JUCE]

[Concrete example: volume slider → gain parameter]

[Text flow diagram: Faceplate element → parameterId → exported JS → JUCE WebView2 → AudioProcessor]

[Brief C++ code snippet showing connection]

[Screenshot placeholder for parameterId field]

## Element-Specific Properties

### Controls

| Property | Type | Description |
|----------|------|-------------|
| min | number | Minimum value |
| max | number | Maximum value |
[... more properties ...]

### Displays

[Similar table for display elements]

### [Other Categories]

[Tables for remaining element categories]

## Help System

[Brief subsection documenting (?) buttons and F1 shortcut]
[Screenshot placeholder showing help panel]
```

**Source:** Established by user decisions in CONTEXT.md

### Pattern 2: Tutorial Documentation (Layers)

**What:** Layers doc is step-by-step for each operation. User learns by following numbered steps.

**When to use:** When documenting workflows where sequence and mechanics matter. Operations like "create layer" or "move element to layer" are actions with specific steps.

**Structure:**
```markdown
# Layers

[Overview explaining layers concept and purpose]

## Creating a Layer

1. Click the **Layers** tab in the left panel
2. Click the **+ New Layer** button
3. Enter a layer name (or leave blank for default "Layer N")
4. Choose a color from the color picker
5. Click **Create**

[Screenshot placeholder]

## Renaming a Layer

1. [Step 1]
2. [Step 2]
...

## Deleting a Layer

[Steps with inline warning about elements moving to default layer]

## Layer Visibility

[Steps to toggle eye icon]
[Effect explanation: hidden elements don't export]

## Layer Lock

[Steps to toggle lock icon]
[Effect explanation: prevents editing]

## Z-Order Control

[Text explanation: layers higher in panel render on top]
[Drag-to-reorder instructions]
[No diagram needed per CONTEXT]

## Moving Elements Between Layers

[Dedicated subsection with multi-step action]
```

**Source:** User decisions specify "step-by-step tutorial format for each operation" (CONTEXT.md)

### Pattern 3: Screenshot Placeholder Convention

**What:** Use descriptive placeholder format established in Phase 60: `![description](../images/filename.png)`

**When to use:** At each major workflow transition or to illustrate a UI state that words can't convey effectively.

**Examples:**
```markdown
![Properties panel showing common properties section](../images/properties-panel-common.png)
![Parameter ID field in the identity section](../images/properties-parameter-id-field.png)
![Layers panel with multiple layers showing visibility and lock icons](../images/layers-panel-overview.png)
![Help panel open with Related Topics navigation visible](../images/properties-help-panel.png)
```

**Source:** Phase 60 plan (60-01-PLAN.md lines 61-62) established convention

### Anti-Patterns to Avoid

**Anti-pattern: Cross-referencing common properties in each category**
- **Why bad:** User decided "no cross-references or reminders about common props in each category section" (CONTEXT.md line 21)
- **Do instead:** Document common properties once at top, then only element-specific properties in category tables

**Anti-pattern: Listing which elements have help content**
- **Why bad:** "Don't list which sections have help content -- users discover naturally" (CONTEXT.md line 40)
- **Do instead:** Just document the mechanism (F1 and ? buttons work) without cataloging availability

**Anti-pattern: Prescriptive naming for parameterId**
- **Why bad:** User decided "parameterId documented as freeform string field that must match JUCE parameter name -- no prescriptive naming conventions" (CONTEXT.md line 27)
- **Do instead:** Explain what it IS and that it must match C++, but don't mandate camelCase or any specific format

## Don't Hand-Roll

Problems that look simple but have existing documentation patterns:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Table formatting for properties | Custom HTML tables | Standard markdown tables | Simpler, version-control friendly, readers can view raw |
| Code examples for JUCE | Generic pseudocode | Actual C++ snippets from integration pattern | Shows real connection, users can copy-paste starting point |
| Parameter binding explanation | Abstract "connects to backend" | Concrete flow diagram and AudioParameterFloat example | Users need to see HOW it works, not just that it works |
| Layer z-order visualization | ASCII art diagram or complex description | "Layers higher in the panel render on top" + drag instruction | User decided text-only, no diagram needed (CONTEXT.md line 34) |

**Key insight:** This project already has established documentation patterns (from Phases 60-61) and user has made specific structural decisions (CONTEXT.md). Following existing patterns prevents inconsistency and reduces cognitive load for readers moving between topics.

## Common Pitfalls

### Pitfall 1: Documenting Implementation Instead of Usage

**What goes wrong:** Documentation describes React components, Zustand store structure, or internal property names instead of user-facing concepts.

**Why it happens:** Writer is familiar with codebase and accidentally exposes implementation details.

**How to avoid:**
- Never mention React, TypeScript, Zustand, Konva.js, or other tech stack
- Use terms users see in the UI: "Properties panel" not "PropertyPanel component"
- Describe what users DO, not how code works: "Click the eye icon to toggle visibility" not "LayersPanel calls toggleLayerVisibility which updates the layer.visible property in the store"

**Warning signs:**
- Any code-level terminology in documentation
- References to files, modules, or internal architecture
- Explaining how it works under the hood rather than how to use it

**Source:** Phase 61 verification checklist (61-01-PLAN.md line 315): "No code references, no React/TypeScript/Zustand mentions"

### Pitfall 2: Tutorial Creep in Reference Sections

**What goes wrong:** Properties panel doc starts teaching "how to select an element" or walks through "first-time use" when it should be pure reference.

**Why it happens:** Writer wants to be helpful and assumes reader needs context.

**How to avoid:**
- Remember user decision: "Reference-only format -- no walkthrough intro (canvas docs already cover element selection)" (CONTEXT.md line 17)
- Link to canvas.md for prerequisite knowledge, don't repeat it
- Keep properties.md focused on "what properties exist" not "how to use the properties panel"

**Warning signs:**
- Numbered steps in the common properties section
- "First, select an element..." introductory tutorial text
- Repeating information already in canvas.md

**Source:** User decision in CONTEXT.md line 17

### Pitfall 3: Over-Categorizing Element Properties

**What goes wrong:** Creating dozens of narrow categories or trying to list every element's unique properties individually.

**Why it happens:** Desire for completeness, fear of missing something.

**How to avoid:**
- Use representative examples, not exhaustive listings (CONTEXT decision: "element-specific sections with representative examples")
- Categories should be: Controls, Displays, Meters, Visualizations, Curves, Containers (match palette structure)
- Tables show property patterns common to category, not every variation
- Link to ELEMENT_REFERENCE.md for complete listings

**Warning signs:**
- Separate table for every element type (109 tables would be unmaintainable)
- Repeating similar properties across many tables
- Documentation longer than 400 lines

**Source:** CONTEXT.md line 19 specifies "representative examples (knob, slider, button, meter)"

### Pitfall 4: Missing the Parameter Binding Purpose

**What goes wrong:** parameterId documented as just "a field you fill in" without explaining WHY it exists or HOW it connects to JUCE.

**Why it happens:** Writer assumes readers understand JUCE/VST workflow already.

**How to avoid:**
- Include conceptual explanation: "the bridge between UI element and JUCE audio processing" (CONTEXT.md line 24)
- Provide concrete example: volume slider → gain parameter
- Show C++ side: AudioParameterFloat snippet demonstrating the connection
- Text flow diagram showing data path

**Warning signs:**
- parameterId mentioned without explanation of purpose
- No JUCE code examples showing the C++ side
- Missing the "why this matters" context

**Source:** User decisions in CONTEXT.md lines 23-28

## Code Examples

Documentation doesn't include executable code, but these patterns show how to present code snippets for reference:

### Markdown Table Format (Element Properties)

```markdown
### Controls

| Property | Type | Description |
|----------|------|-------------|
| min | number | Minimum value (default: 0) |
| max | number | Maximum value (default: 1) |
| value | number | Current normalized value 0-1 (default: 0.5) |
| steps | number | Number of discrete positions for stepped controls (2-128) |
```

**Source:** CONTEXT.md line 20 specifies "three columns: property name, type, brief description"

### C++ JUCE Code Snippet (Parameter Binding)

```markdown
```cpp
// PluginProcessor.cpp - Define audio parameter
params.push_back(std::make_unique<juce::AudioParameterFloat>(
    "gain",           // ← Must match Faceplate's parameterId
    "Gain",
    0.0f, 1.0f, 0.5f
));

// PluginEditor.cpp - Parameter sync
void handleSetParameter(const juce::Array<juce::var>& args, auto complete) {
    auto paramId = args[0].toString();  // "gain" from UI
    auto value = static_cast<float>(args[1]);  // 0.0-1.0 from knob

    if (auto* param = processor.apvts.getParameter(paramId)) {
        param->setValueNotifyingHost(value);
    }
    complete({});
}
```
\```
```

**Source:** User decision for "brief JUCE-side C++ code snippet showing how exported HTML connects to AudioParameterFloat" (CONTEXT.md line 26)

### Text Flow Diagram (Parameter Binding)

```markdown
**Parameter Flow:**

```
Faceplate Element → parameterId → Exported JavaScript → JUCE WebView2 → AudioProcessor
     (UI knob)       ("gain")      (setParameter call)    (native function)  (DSP parameter)
```
\```
```

**Source:** User decision for "text-based flow diagram" (CONTEXT.md line 28)

### Screenshot Placeholder Pattern

```markdown
![Description of what screenshot shows](../images/descriptive-filename.png)
```

**Examples from requirements:**
- `![Properties panel overview with common properties visible](../images/properties-panel-overview.png)`
- `![Parameter ID field in the identity section](../images/properties-parameter-id-field.png)`
- `![Layers panel with multiple layers and visibility/lock icons](../images/layers-panel-overview.png)`
- `![Help panel open showing content and Related Topics links](../images/properties-help-panel-open.png)`

**Source:** Phase 60 manual index (60-01-PLAN.md line 61)

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| No layers system | Layers with visibility, lock, z-order | v1.9 (Jan 2026) | Elements can be organized into groups, visibility toggled per layer, lock prevents accidental edits |
| No help system | F1 contextual help + (?) buttons | v1.9 (Jan 2026) | Users can get instant documentation without leaving the app |
| Manual parameter sync | Timer-based batch sync with change detection | v1.7 (Nov 2025) | More efficient, prevents UI lag with many parameters |
| Simple property panel | Context-sensitive with Pro element read-only mode | v1.x → current | Pro elements show properties but prevent editing for unlicensed users |

**Note on documentation timing:** Layers and help systems are recent additions (v1.9, Jan 2026). This documentation phase happens immediately after feature release, which is ideal -- minimal risk of feature drift, implementation is fresh.

## Open Questions

None. All aspects of the phase are well-defined:

1. **Features to document:** Properties panel and layers system are both fully implemented and stable
2. **Documentation structure:** User provided detailed decisions in CONTEXT.md
3. **Format and style:** Established by Phases 60-61 (getting-started.md, canvas.md)
4. **Screenshot placeholders:** Convention established in Phase 60
5. **Scope boundaries:** User explicitly defined what to include and exclude

The implementation code is accessible for reference, existing manual topics show the writing style, and user decisions constrain the structure appropriately.

## Sources

### Primary (HIGH confidence)
- `.planning/phases/62-properties-layers/62-CONTEXT.md` - User decisions defining documentation structure and content
- `docs/manual/getting-started.md` - Established format, style, and tone for manual topics
- `docs/manual/canvas.md` - Established tutorial patterns (numbered steps, screenshot placement, inline notes)
- `docs/manual/README.md` - Manual index showing topic organization and navigation
- `src/components/Properties/PropertyPanel.tsx` - Implementation reference for properties panel structure
- `src/components/Layers/LayersPanel.tsx` - Implementation reference for layers functionality
- `docs/ELEMENT_REFERENCE.md` - Property table format and element categorization

### Secondary (MEDIUM confidence)
- `docs/FACEPLATE_DOCUMENTATION.md` - Overview of layers system and help system (lines 972-1045)
- Implementation files for specific property components (KnobProperties.tsx, SliderProperties.tsx, etc.) - Show property patterns per element type

### Tertiary (LOW confidence)
- None used. All research based on direct examination of existing documentation and implementation.

## Metadata

**Confidence breakdown:**
- Documentation format and style: HIGH - Established by Phases 60-61, multiple examples to reference
- Properties panel structure: HIGH - User decisions are explicit, implementation is accessible
- Layers system operations: HIGH - Feature is fully implemented with clear UI patterns
- Parameter binding explanation: HIGH - User provided specific guidance on content and examples
- Help system coverage: HIGH - User decided to keep it brief, mechanism-only

**Research date:** 2026-02-06
**Valid until:** 30 days (stable features, unlikely to change significantly)

**Notes:**
- Both features documented are fully implemented and released (v1.9)
- User has provided unusually clear guidance via CONTEXT.md
- No external research needed -- all information available in codebase and existing docs
- Documentation phase is low-risk: no code changes, established patterns to follow
