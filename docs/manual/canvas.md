# Canvas

The canvas is your main design surface where you build plugin UIs. This guide covers every way you can interact with elements on the canvas -- from adding and selecting to positioning, editing, and navigating.

## Adding Elements

Add elements to your design by dragging them from the **Element Palette** onto the canvas.

1. Open the **Elements** tab in the left panel
2. Find the element you want (browse categories or use search)
3. Click and drag the element from the palette onto the canvas
4. Release to place the element at the drop position
5. The element appears at its default size and can be repositioned immediately

If snap grid is enabled (see [Canvas Settings](#snap-grid) below), the element snaps to the nearest grid point when placed.

![Dragging an element from the palette onto the canvas](../images/canvas-drag-drop.png)

## Selecting Elements

Select elements to edit their properties, move them, or apply actions like copy and paste.

### Click to Select

1. Click any element on the canvas to select it
2. Blue resize handles appear at corners and edges
3. The **Properties** panel on the right updates to show the element's settings

### Multi-Select with Ctrl/Cmd+Click

1. Click the first element to select it
2. Hold **Ctrl** (Windows/Linux) or **Cmd** (Mac) and click additional elements
3. All selected elements show resize handles
4. Drag any selected element to move the entire group

### Marquee Selection (Drag Rectangle)

1. Click on an empty area of the canvas (not on any element)
2. Drag to draw a selection rectangle
3. Release to select all elements within the rectangle

The marquee activates after dragging at least 5 pixels to prevent accidental selections.

### Clear Selection

Press **Escape** to deselect all elements.

![Multiple elements selected with resize handles visible](../images/canvas-selection.png)

## Positioning Elements

Move and resize elements to build your layout.

### Drag to Move

1. Click and hold a selected element
2. Drag it to the desired position
3. Release to place it
4. If snap grid is enabled, the element snaps to the nearest grid point

### Resize with Handles

1. Select an element to show its resize handles
2. Click and drag any corner or edge handle to resize
3. Corner handles resize in both directions at once
4. Edge handles resize in one direction only

### Arrow Key Nudging

- Press **Arrow keys** to nudge selected elements by 1 pixel
- Hold **Shift** and press **Arrow keys** to nudge by 10 pixels
- Nudging respects snap grid when enabled

### Layer Order (Z-Order)

Control which elements appear in front of or behind other elements:

- **Ctrl+Shift+]** (or **Cmd+Shift+]** on Mac) -- Bring to Front
- **Ctrl+Shift+[** (or **Cmd+Shift+[** on Mac) -- Send to Back
- **Ctrl+]** (or **Cmd+]** on Mac) -- Bring Forward one level
- **Ctrl+[** (or **Cmd+[** on Mac) -- Send Backward one level

![Repositioning elements with drag and resize handles](../images/canvas-positioning.png)

## Editing & History

Copy, paste, duplicate, delete elements, and undo or redo changes.

### Copy and Paste

1. Select one or more elements
2. Press **Ctrl+C** (or **Cmd+C** on Mac) to copy
3. Press **Ctrl+V** (or **Cmd+V** on Mac) to paste
4. Pasted elements appear offset 20 pixels down and to the right from the original position

### Duplicate

1. Select one or more elements
2. Press **Ctrl+D** (or **Cmd+D** on Mac) to duplicate
3. The duplicate appears offset 20 pixels down and to the right

Duplicating is faster than copy-paste when you want an immediate copy -- it skips the clipboard.

### Delete

- Select elements and press **Delete** or **Backspace** to remove them from the canvas

### Undo and Redo

- Press **Ctrl+Z** (or **Cmd+Z** on Mac) to undo the last action
- Press **Ctrl+Y** or **Ctrl+Shift+Z** (or **Cmd+Shift+Z** on Mac) to redo
- The undo/redo buttons are also available in the left panel header
- Dragging an element creates a single undo entry for the entire drag operation (not one per pixel moved)

## Element Locking

Lock elements to prevent accidental moves or edits while working on other parts of your layout.

### Lock Individual Elements

1. Select the element you want to lock
2. Toggle the lock in the **Properties** panel or **Layers** panel
3. Locked elements cannot be moved, resized, or deleted until unlocked
4. Locked elements can still be selected to view their properties

### Lock All Elements (Global Mode)

1. Toggle the lock-all mode from the canvas toolbar
2. When active, all elements on the canvas are locked regardless of their individual lock setting
3. Toggle off to return to normal editing

Locking is useful when building complex layouts -- lock your background and container elements so you can freely position controls without accidentally moving the underlying structure.

## Canvas Settings

### Snap Grid

The snap grid helps you align elements precisely by snapping their positions to a regular grid.

- Press **Ctrl+G** (or **Cmd+G** on Mac) to toggle the snap grid on or off
- When enabled, a dotted grid overlay appears on the canvas
- Elements snap to the nearest grid point when placed, moved, or resized
- The default grid size is `10` pixels -- you can adjust this in the canvas settings
- You can also change the grid color (default is white)

![Canvas with snap grid enabled showing grid lines](../images/canvas-snap-grid.png)

### Background Configuration

Configure the canvas background to match your plugin's design.

**Solid color:**

1. With no elements selected, the **Properties** panel shows window settings
2. Find the **Background** section
3. Select **Color** as the background type
4. Use the color picker to choose your background color

**Gradient:**

1. Select **Gradient** as the background type
2. Choose the start and end colors
3. Adjust the angle to control the gradient direction

Background settings apply to the current window. In multi-window projects, each window can have its own background configuration.

![Background configuration options in the properties panel](../images/canvas-background-options.png)

### Pan & Zoom

Navigate around the canvas, especially useful for large or complex layouts.

- **Scroll wheel** -- Zoom in/out (5% per scroll step, centered on cursor position)
- **Space + drag** -- Pan the canvas (cursor changes to a hand icon)
- **Zoom limits** -- 10% (0.1x) minimum to 1000% (10x) maximum
- **Zoom indicator** -- Shown in the bottom-right corner of the canvas; click it to type a specific zoom level, double-click to reset to 100%

![Zoom indicator in the bottom-right corner of the canvas](../images/canvas-zoom-controls.png)

## Keyboard Shortcuts

Quick reference table for all canvas keyboard shortcuts.

| Action | Windows / Linux | Mac |
|--------|-----------------|-----|
| Undo | Ctrl+Z | Cmd+Z |
| Redo | Ctrl+Y or Ctrl+Shift+Z | Cmd+Shift+Z |
| Copy | Ctrl+C | Cmd+C |
| Paste | Ctrl+V | Cmd+V |
| Duplicate | Ctrl+D | Cmd+D |
| Delete | Delete or Backspace | Delete or Backspace |
| Clear selection | Escape | Escape |
| Toggle snap grid | Ctrl+G | Cmd+G |
| Nudge 1px | Arrow keys | Arrow keys |
| Nudge 10px | Shift+Arrow keys | Shift+Arrow keys |
| Bring to Front | Ctrl+Shift+] | Cmd+Shift+] |
| Send to Back | Ctrl+Shift+[ | Cmd+Shift+[ |
| Bring Forward | Ctrl+] | Cmd+] |
| Send Backward | Ctrl+[ | Cmd+[ |
| Pan canvas | Space+drag | Space+drag |

---

**Back to [User Manual](README.md)**

**See also:** [Element Palette](palette.md) | [Properties Panel](properties.md)
