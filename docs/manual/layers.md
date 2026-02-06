# Layers

Layers let you organize your design elements into groups. Each layer can be independently shown, hidden, locked, or reordered to control which elements appear in front of others.

The **Layers** tab is in the left panel. Every project starts with a **Default** layer that cannot be renamed or deleted. You can create additional layers to organize your design.

![Layers panel showing multiple layers with visibility and lock icons](../images/layers-panel-overview.png)

### Why Use Layers?

Layers help you organize complex designs by grouping related elements together. For example, you might create separate layers for:

- Background graphics and decorative elements
- Main controls (knobs, sliders, buttons)
- Value displays and labels
- Meters and visualizations
- Headers, footers, and branding elements

Each layer can be shown, hidden, or locked independently, making it easier to work on specific parts of your design without affecting other areas.

## Creating a Layer

Add new layers to organize your design elements into logical groups.

1. Click the **Layers** tab in the left panel
2. Click the **+ New Layer** button at the top of the panel (the plus icon)
3. Type a name for the layer in the text field that appears
4. Leave the name blank if you want an auto-generated name like "Layer 1"
5. Choose a color by clicking one of the color swatches -- the color appears as a dot next to the layer name in the layers list
6. Click **Create** to add the layer, or press **Enter**
7. Click **Cancel** or press **Escape** to cancel without creating a layer

New layers appear at the top of the layer list, above existing layers. This means newly created layers render on top of existing layers by default.

![Creating a new layer with name and color selection](../images/layers-create-layer.png)

**Available layer colors:**

The color picker offers eight color options: blue, green, red, yellow, purple, orange, pink, and gray. These colors help you visually distinguish layers in the layers panel but do not affect the appearance of elements on the canvas.

**Auto-generated names:**

If you don't provide a name when creating a layer, the system automatically generates a name like "Layer 1", "Layer 2", etc. You can rename the layer later if needed.

## Renaming a Layer

Change a layer's name to better describe its contents.

1. Double-click the layer name in the layers panel
2. The name becomes an editable text field
3. Type the new name
4. Press **Enter** to save the new name, or click away from the text field to save automatically
5. Press **Escape** to cancel and keep the original name

Note: The **Default** layer cannot be renamed.

![Renaming a layer by double-clicking the layer name](../images/layers-rename-layer.png)

When you double-click a layer name, the text field automatically selects all text, making it easy to type a completely new name without having to clear the existing text first.

## Deleting a Layer

Remove layers you no longer need.

1. Hover over the layer you want to delete in the layers panel
2. A delete icon (trash bin) appears on the right side of the layer row
3. Click the delete icon
4. A confirmation dialog appears showing the layer name and how many elements are in the layer
5. Click **Delete** to confirm deletion, or **Cancel** to keep the layer

**Important:** Deleting a layer also deletes all elements in that layer. This action cannot be undone. If you want to keep the elements, move them to another layer first (see [Moving Elements Between Layers](#moving-elements-between-layers) below).

Note: The **Default** layer cannot be deleted.

![Delete layer confirmation dialog showing element count](../images/layers-delete-confirmation.png)

The confirmation dialog displays:

- The layer name and its color indicator
- The number of elements in the layer
- A warning if the layer contains elements, emphasizing that they will be deleted along with the layer
- **Delete** and **Cancel** buttons

If the layer is empty, the dialog still asks for confirmation but does not show the warning about element deletion.

## Layer Visibility

Control whether a layer's elements are shown on the canvas and in exported output.

1. Click the eye icon on the right side of a layer row
2. When visible (eye open), all elements on that layer are shown on the canvas
3. When hidden (eye closed with a slash), all elements on that layer are hidden from the canvas and the layer row appears dimmed
4. Click the eye icon again to toggle back to visible

**Keyboard shortcut:** Press **H** to toggle visibility of the currently selected layer.

Hidden layers and their elements are not included in exported output. This is useful for hiding guidelines, reference images, or work-in-progress elements without deleting them.

![Layer visibility toggle showing eye icon states](../images/layers-visibility-toggle.png)

When a layer is hidden:

- The eye icon changes to a closed eye with a slash
- The layer row appears dimmed in the layers panel
- All elements on that layer disappear from the canvas
- The elements cannot be selected or interacted with on the canvas
- The layer and its elements are excluded from browser preview and exported code

To work on a specific layer while hiding everything else, you can hide all other layers. This is useful when working on complex, multi-layer designs where background or foreground elements might visually interfere with the layer you're currently editing.

## Layer Lock

Lock layers to prevent accidental changes to their elements.

1. Click the lock icon on the right side of a layer row (next to the eye icon)
2. When locked (lock closed, shown in yellow), elements on that layer cannot be selected, moved, or resized on the canvas
3. When unlocked (lock open), elements behave normally and can be edited freely
4. Click the lock icon again to toggle back to unlocked

Locking a layer prevents interaction on the canvas, but you can still view an element's properties if you select it through other means. This is useful for protecting background elements from accidental changes while working on foreground elements.

![Layer lock toggle showing locked and unlocked states](../images/layers-lock-toggle.png)

**What happens when a layer is locked:**

- Elements on the locked layer cannot be clicked or selected on the canvas
- Elements cannot be moved, resized, or deleted
- The lock icon turns yellow and shows a closed lock
- Elements remain visible on the canvas (locking does not hide elements)
- You can still modify layer settings (visibility, z-order, etc.)

**When to use layer locking:**

Lock layers when you have a stable foundation in your design (like a background graphic or container layout) and want to focus on adding or editing controls without accidentally selecting or moving the background elements.

## Z-Order (Layer Ordering)

Layers control which elements appear in front of others on the canvas. Layers higher in the layers panel render on top of layers lower in the panel.

To change the rendering order of layers:

1. Hover over the layer you want to move in the layers panel
2. A drag handle (six dots) appears on the left side of the layer row
3. Click and hold the drag handle
4. Drag the layer up or down to its new position in the list
5. Release the mouse button to drop the layer in place

Elements on the topmost layer always appear in front of elements on lower layers. Within the same layer, elements follow their individual z-order (controlled by right-click context menu on the canvas -- see [Canvas](canvas.md) for details).

Note: The **Default** layer always stays at the bottom of the list and cannot be reordered.

![Reordering layers by dragging the drag handle](../images/layers-reorder.png)

**How layer z-order works:**

Think of layers as stacked sheets of paper. The topmost sheet (highest in the layers panel) covers sheets below it. When you drag a layer higher in the panel, it moves forward and renders on top of layers below it. When you drag a layer lower in the panel, it moves backward and renders behind layers above it.

**Example:**

If you have three layers in this order from top to bottom: "Controls", "Background Graphics", "Default", then:

- Elements on "Controls" appear in front of everything
- Elements on "Background Graphics" appear behind "Controls" but in front of "Default"
- Elements on "Default" appear behind everything else

The drag handle (six dots) only appears on non-default layers because the **Default** layer always stays at the bottom of the stack.

## Moving Elements Between Layers

Move elements from one layer to another to reorganize your design.

To move an element from one layer to another:

1. Right-click the element on the canvas
2. Hover over **Move to Layer** in the context menu
3. A submenu appears listing all available layers
4. Click the target layer name
5. The element is moved to the selected layer immediately

This works for single elements. To move multiple elements, select them all first (see [Canvas](canvas.md) for selection methods), then right-click any selected element to access the **Move to Layer** option. All selected elements will be moved to the chosen layer together.

![Move to Layer context menu with layer submenu](../images/layers-move-to-layer.png)

**Layer submenu details:**

The submenu shows all available layers with:

- The layer color dot
- The layer name
- A checkmark next to the element's current layer

Layers are listed in the same order as they appear in the layers panel. When you click a layer name in the submenu, the element immediately moves to that layer and the context menu closes.

**Moving multiple elements:**

When multiple elements are selected, you can move them all to a new layer in one action:

1. Select multiple elements using **Ctrl+Click** or marquee selection (see [Canvas](canvas.md))
2. Right-click any of the selected elements
3. Hover over **Move to Layer** in the context menu
4. Click the target layer name
5. All selected elements move to the new layer together

This is useful for reorganizing your design -- for example, moving a group of related controls from the **Default** layer to a new **Main Controls** layer.

---

[Back to User Manual](README.md) | [Canvas](canvas.md) | [Properties Panel](properties.md) | [Element Palette](palette.md)
