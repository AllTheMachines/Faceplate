# Phase 10 - Remaining Issues & Future Work

## Priority 1: Bugs to Fix

### Already Fixed This Session
- [x] Marquee selection position offset
- [x] Element locking UX (selectable but not movable)
- [x] Can't type in Name/ParameterID fields
- [x] Dropdowns not working (Knob type, Meter orientation, etc.)
- [x] Checkbox visual not updating immediately
- [x] Spacebar pan blocking text input
- [x] Multi-select dragging not working
- [x] Marquee selection not persisting after release
- [x] Remove rotation field from Knob

### Still Need to Fix

#### Buttons
- [ ] **Momentary Button**: Can't click "Pressed" checkbox
- [ ] **Toggle Button**: Can't click "Pressed" checkbox

#### Meter
- [ ] **Meter orientation**: Can't change back from Horizontal to Vertical (stays Horizontal)
- [ ] Same issues as Knob (if any remain)

#### Value Display / Labels
- [ ] **Font Weight**: Should show options (Bold, Regular, etc.) not numbers

#### Image Element
- [ ] **Image Source**: Should be able to select images from project/repository or type path to location inside the project

---

## Priority 2: Design/Architecture Improvements

### Element Consolidation (Palette Simplification)
Consider combining elements that are really just property variations:

1. **Slider**: Combine V-Slider and H-Slider into single "Slider" element
   - Orientation (Vertical/Horizontal) is already a property toggle
   - No need for separate palette items

2. **Button**: Combine Momentary Button and Toggle Button into single "Button" element
   - Mode (Momentary/Toggle) is already a property toggle
   - No need for separate palette items

3. **Value Display**: Reconsider if this should be separate
   - All elements with values should come with changeable label and values
   - Could be: static textfield OR dynamic textfield (filled from VST3 engine)
   - May not need to be a separate element type

### Template Import / Workflow

#### Current Issue
- Template import only shows knobs in upper-left corner, no other element types
- Different WebView2 projects have completely different structures

#### Proposed Workflows

**Workflow A: New Project from Scratch**
- Start with VST3 effect/instrument basic functionality templates
- User already building empty VST3 containers
- Need predefined starter templates

**Workflow B: Convert Existing VST3 UI**
- Parse existing VST3 UI HTML/JS/CSS designs
- Extract: canvas size, element positions, approximate element types
- Replicate something similar with our system
- May not be 100% possible for all designs - that's acceptable
- Goal: Get users 70-80% there, then manual refinement

#### Notes
- May not make sense to directly import other WebView2 files (too different)
- Better approach: intelligent parsing + approximation
- User can provide sample code later for analysis

---

## Session Notes
- This session was token-heavy due to debugging multi-select drag
- Root cause was marquee selection overwriting multi-selection during drag start
- Fixed by checking `data-element-id` attribute before starting marquee
