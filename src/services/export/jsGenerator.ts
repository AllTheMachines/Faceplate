/**
 * JavaScript code generator for JUCE WebView2 bindings
 * Generates bindings.js, components.js, and mock JUCE backend
 */

import type { ElementConfig, AsciiArtElementConfig } from '../../types/elements'
import { toKebabCase } from './utils'

// ============================================================================
// Types
// ============================================================================

export interface JSGeneratorOptions {
  isPreviewMode: boolean // true = include mock, false = expect real JUCE
  windowMapping?: Record<string, string> // Map windowId -> relative path (e.g., '../settings-window/index.html')
}

// ============================================================================
// Bindings Generator
// ============================================================================

/**
 * Generate bindings.js content
 * Creates JUCE event-based parameter bindings for interactive elements (knob, slider, button)
 *
 * JUCE native functions use an event-based invocation system:
 * - Functions registered with .withNativeFunction() in C++
 * - Available in window.__JUCE__.initialisationData.__juce__functions
 * - Invoked via window.__JUCE__.backend.emitEvent('__juce__invoke', ...)
 * - Results return via window.__JUCE__.backend.addEventListener('__juce__complete', ...)
 *
 * CRITICAL: This uses the proven working pattern with:
 * - Dynamic function wrappers from __juce__functions
 * - Polling initialization that waits for functions.length > 0
 * - Integer resultId (not Math.random())
 * - .catch() for fire-and-forget calls
 *
 * @param elements - Array of element configurations
 * @param options - Generation options (preview mode, etc.)
 * @returns JavaScript code as string
 */
export function generateBindingsJS(
  elements: ElementConfig[],
  _options: JSGeneratorOptions
): string {
  // Get ALL interactive elements (not just those with parameter bindings)
  // This allows preview/standalone mode to work even without parameter IDs
  // Include all knob variants (knob, steppedknob, centerdetentknob, dotindicatorknob)
  const knobTypes = ['knob', 'steppedknob', 'centerdetentknob', 'dotindicatorknob']
  const knobs = elements.filter((el) => knobTypes.includes(el.type))
  // Include all slider variants (slider, bipolarslider, notchedslider, arcslider, crossfadeslider)
  const sliderTypes = ['slider', 'bipolarslider', 'notchedslider', 'crossfadeslider']
  const sliders = elements.filter((el) => sliderTypes.includes(el.type))
  // Arc sliders need special SVG-based handling
  const arcsliders = elements.filter((el) => el.type === 'arcslider')
  const asciisliders = elements.filter((el) => el.type === 'asciislider')
  const asciibuttons = elements.filter((el) => el.type === 'asciibutton')
  const rangesliders = elements.filter((el) => el.type === 'rangeslider')
  const multisliders = elements.filter((el) => el.type === 'multislider')
  // Include all button types
  const buttonTypes = ['button', 'iconbutton', 'toggleswitch', 'powerbutton']
  const buttons = elements.filter((el) => buttonTypes.includes(el.type))
  // Collapsible containers
  const collapsibles = elements.filter((el) => el.type === 'collapsible')
  // Modulation matrices
  const modMatrices = elements.filter((el) => el.type === 'modulationmatrix')
  // Navigation elements
  const steppers = elements.filter((el) => el.type === 'stepper')
  const tabbars = elements.filter((el) => el.type === 'tabbar')
  const dropdowns = elements.filter((el) => el.type === 'dropdown' || el.type === 'multiselectdropdown' || el.type === 'combobox')
  const segmentButtons = elements.filter((el) => el.type === 'segmentbutton')
  const rotarySwitches = elements.filter((el) => el.type === 'rotaryswitch')
  const rockerSwitches = elements.filter((el) => el.type === 'rockerswitch')
  const multiSelectDropdowns = elements.filter((el) => el.type === 'multiselectdropdown')
  const comboBoxes = elements.filter((el) => el.type === 'combobox')
  const menuButtons = elements.filter((el) => el.type === 'menubutton')
  const breadcrumbs = elements.filter((el) => el.type === 'breadcrumb')
  const treeViews = elements.filter((el) => el.type === 'treeview')
  // Specialized audio elements
  const stepSequencers = elements.filter((el) => el.type === 'stepsequencer')
  const xyPads = elements.filter((el) => el.type === 'xypad')
  const loopPoints = elements.filter((el) => el.type === 'looppoints')
  const harmonicEditors = elements.filter((el) => el.type === 'harmoniceditor')
  // ASCII art noise elements
  const asciiNoiseElements = elements.filter(
    (el) => el.type === 'asciiart' && (el as AsciiArtElementConfig).contentType === 'noise'
  ) as AsciiArtElementConfig[]

  // Generate setup calls for each element type with default values
  // Use parameterId if set, otherwise use element name as fallback ID
  const knobSetups = knobs
    .map((knob) => {
      // All knob types have a 'value' property - cast to access it
      const knobWithValue = knob as { value?: number; min?: number; max?: number }
      const value = knobWithValue.value ?? 0.5
      const min = knobWithValue.min ?? 0
      const max = knobWithValue.max ?? 1
      // Normalize to 0-1 range for the binding system
      const defaultValue = max !== min ? (value - min) / (max - min) : 0.5
      const paramId = knob.parameterId || toKebabCase(knob.name)
      return `    setupKnobInteraction('${toKebabCase(knob.name)}', '${paramId}', ${defaultValue});`
    })
    .join('\n')

  const sliderSetups = sliders
    .map((slider) => {
      // All slider types have a 'value' property - cast to access it
      const sliderWithValue = slider as { value?: number; min?: number; max?: number }
      const value = sliderWithValue.value ?? 0.5
      const min = sliderWithValue.min ?? 0
      const max = sliderWithValue.max ?? 1
      // Normalize to 0-1 range for the binding system
      const defaultValue = max !== min ? (value - min) / (max - min) : 0.5
      const paramId = slider.parameterId || toKebabCase(slider.name)
      return `    setupSliderInteraction('${toKebabCase(slider.name)}', '${paramId}', ${defaultValue});`
    })
    .join('\n')

  const arcSliderSetups = arcsliders
    .map((slider) => {
      const sliderWithValue = slider as { value?: number; min?: number; max?: number; startAngle?: number; endAngle?: number }
      const value = sliderWithValue.value ?? 0.5
      const min = sliderWithValue.min ?? 0
      const max = sliderWithValue.max ?? 1
      const defaultValue = max !== min ? (value - min) / (max - min) : 0.5
      const paramId = slider.parameterId || toKebabCase(slider.name)
      return `    setupArcSliderInteraction('${toKebabCase(slider.name)}', '${paramId}', ${defaultValue});`
    })
    .join('\n')

  const asciiSliderSetups = asciisliders
    .map((slider) => {
      const sliderWithValue = slider as { value?: number; min?: number; max?: number }
      const value = sliderWithValue.value ?? 0.5
      const min = sliderWithValue.min ?? 0
      const max = sliderWithValue.max ?? 1
      const defaultValue = max !== min ? (value - min) / (max - min) : 0.5
      const paramId = slider.parameterId || toKebabCase(slider.name)
      return `    setupAsciiSliderInteraction('${toKebabCase(slider.name)}', '${paramId}', ${defaultValue});`
    })
    .join('\n')

  const asciiButtonSetups = asciibuttons
    .map((button) => {
      const buttonConfig = button as { pressed?: boolean; mode?: string }
      const defaultPressed = buttonConfig.pressed ?? false
      const paramId = button.parameterId || toKebabCase(button.name)
      return `    setupAsciiButtonInteraction('${toKebabCase(button.name)}', '${paramId}', ${defaultPressed});`
    })
    .join('\n')

  const rangeSliderSetups = rangesliders
    .map((rangeslider) => {
      const defaultMin = rangeslider.type === 'rangeslider' ? rangeslider.minValue : 0.25
      const defaultMax = rangeslider.type === 'rangeslider' ? rangeslider.maxValue : 0.75
      const paramId = rangeslider.parameterId || toKebabCase(rangeslider.name)
      return `    setupRangeSliderInteraction('${toKebabCase(rangeslider.name)}', '${paramId}', ${defaultMin}, ${defaultMax});`
    })
    .join('\n')

  const multiSliderSetups = multisliders
    .map((slider) => {
      const paramId = slider.parameterId || toKebabCase(slider.name)
      return `    setupMultiSliderInteraction('${toKebabCase(slider.name)}', '${paramId}');`
    })
    .join('\n')

  const buttonSetups = buttons
    .map((button) => {
      const paramId = button.parameterId || toKebabCase(button.name)
      return `    setupButtonInteraction('${toKebabCase(button.name)}', '${paramId}');`
    })
    .join('\n')

  const collapsibleSetups = collapsibles
    .map((collapsible) => {
      return `    setupCollapsibleInteraction('${toKebabCase(collapsible.name)}');`
    })
    .join('\n')

  const modMatrixSetups = modMatrices
    .map((matrix) => {
      return `    setupModMatrixInteraction('${toKebabCase(matrix.name)}');`
    })
    .join('\n')

  const stepperSetups = steppers
    .map((stepper) => {
      const paramId = stepper.parameterId || toKebabCase(stepper.name)
      return `    setupStepperInteraction('${toKebabCase(stepper.name)}', '${paramId}');`
    })
    .join('\n')

  const tabbarSetups = tabbars
    .map((tabbar) => {
      const paramId = tabbar.parameterId || toKebabCase(tabbar.name)
      return `    setupTabBarInteraction('${toKebabCase(tabbar.name)}', '${paramId}');`
    })
    .join('\n')

  const dropdownSetups = dropdowns
    .map((dropdown) => {
      const paramId = dropdown.parameterId || toKebabCase(dropdown.name)
      return `    setupDropdownInteraction('${toKebabCase(dropdown.name)}', '${paramId}');`
    })
    .join('\n')

  const segmentButtonSetups = segmentButtons
    .map((segment) => {
      const paramId = segment.parameterId || toKebabCase(segment.name)
      return `    setupSegmentButtonInteraction('${toKebabCase(segment.name)}', '${paramId}');`
    })
    .join('\n')

  const rotarySwitchSetups = rotarySwitches
    .map((rotary) => {
      const paramId = rotary.parameterId || toKebabCase(rotary.name)
      return `    setupRotarySwitchInteraction('${toKebabCase(rotary.name)}', '${paramId}');`
    })
    .join('\n')

  const rockerSwitchSetups = rockerSwitches
    .map((rocker) => {
      const paramId = rocker.parameterId || toKebabCase(rocker.name)
      return `    setupRockerSwitchInteraction('${toKebabCase(rocker.name)}', '${paramId}');`
    })
    .join('\n')

  const multiSelectDropdownSetups = multiSelectDropdowns
    .map((dropdown) => {
      const paramId = dropdown.parameterId || toKebabCase(dropdown.name)
      return `    setupMultiSelectDropdownInteraction('${toKebabCase(dropdown.name)}', '${paramId}');`
    })
    .join('\n')

  const comboBoxSetups = comboBoxes
    .map((combobox) => {
      const paramId = combobox.parameterId || toKebabCase(combobox.name)
      return `    setupComboBoxInteraction('${toKebabCase(combobox.name)}', '${paramId}');`
    })
    .join('\n')

  const menuButtonSetups = menuButtons
    .map((menubutton) => {
      return `    setupMenuButtonInteraction('${toKebabCase(menubutton.name)}');`
    })
    .join('\n')

  const breadcrumbSetups = breadcrumbs
    .map((breadcrumb) => {
      return `    setupBreadcrumbInteraction('${toKebabCase(breadcrumb.name)}');`
    })
    .join('\n')

  const treeViewSetups = treeViews
    .map((treeview) => {
      return `    setupTreeViewInteraction('${toKebabCase(treeview.name)}');`
    })
    .join('\n')

  // Specialized audio element setups
  const stepSequencerSetups = stepSequencers
    .map((seq) => {
      return `    setupStepSequencerInteraction('${toKebabCase(seq.name)}');`
    })
    .join('\n')

  const xyPadSetups = xyPads
    .map((pad) => {
      return `    setupXYPadInteraction('${toKebabCase(pad.name)}');`
    })
    .join('\n')

  const loopPointsSetups = loopPoints
    .map((lp) => {
      return `    setupLoopPointsInteraction('${toKebabCase(lp.name)}');`
    })
    .join('\n')

  const harmonicEditorSetups = harmonicEditors
    .map((he) => {
      return `    setupHarmonicEditorInteraction('${toKebabCase(he.name)}');`
    })
    .join('\n')

  // ASCII Art noise setups
  const asciiNoiseSetups = asciiNoiseElements
    .map((el) => {
      return `    setupAsciiNoiseAnimation('${toKebabCase(el.name)}');`
    })
    .join('\n')

  // Generate window mapping if provided
  const windowMappingJS = _options.windowMapping
    ? `// Window navigation mapping (for multi-window projects)
window.__WINDOW_MAPPING__ = ${JSON.stringify(_options.windowMapping, null, 2)};

`
    : ''

  return `// AUTO-GENERATED by vst3-webview-ui-designer
// JUCE WebView2 Event-Based Parameter Bindings
// Uses proven working pattern with dynamic function wrappers and polling initialization
//
// PARAMETER SYNC:
// When the plugin editor opens, C++ should call:
//   browser.emitEvent("__juce__paramSync", { params: [...] })
// to push all current parameter values to JavaScript.
// See JUCE_INTEGRATION.md for C++ implementation.

${windowMappingJS}// ============================================================================
// JUCE Bridge - Dynamic Function Wrapper System
// ============================================================================

let bridge = null;
let nextResultId = 1;  // INTEGER, not Math.random() - critical for JUCE compatibility

/**
 * Create dynamic function wrappers for all registered JUCE native functions.
 * This pattern works reliably with JUCE WebView2.
 */
function createJUCEFunctionWrappers() {
  const functions = window.__JUCE__.initialisationData.__juce__functions || [];

  const wrappers = {};
  const pendingResults = new Map();

  // Listen for completion events from JUCE
  window.__JUCE__.backend.addEventListener('__juce__complete', (event) => {
    // Handle various event formats JUCE might send
    const resultId = event?.resultId ?? event?.detail?.resultId ?? event?.[0]?.resultId;
    const result = event?.result ?? event?.detail?.result ?? event?.[0]?.result;

    const callback = pendingResults.get(resultId);
    if (callback) {
      pendingResults.delete(resultId);
      callback(result);
    }
  });

  // Create wrapper for EACH registered function
  for (const funcName of functions) {
    wrappers[funcName] = function(...args) {
      return new Promise((resolve) => {
        const resultId = nextResultId++;
        pendingResults.set(resultId, resolve);

        window.__JUCE__.backend.emitEvent('__juce__invoke', {
          name: funcName,
          params: args,
          resultId: resultId
        });

        // Timeout after 1 second - resolve undefined on timeout
        setTimeout(() => {
          if (pendingResults.has(resultId)) {
            pendingResults.delete(resultId);
            resolve(undefined);
          }
        }, 1000);
      });
    };
  }

  console.log('[JUCEBridge] Created wrappers for:', functions);
  return wrappers;
}

// ============================================================================
// Parameter Sync - C++ to JavaScript state synchronization
// ============================================================================

/**
 * Setup parameter sync listener for C++ -> JavaScript state updates.
 * Called after JUCE bridge initialization.
 *
 * When the plugin editor opens (after preset load, DAW session restore),
 * C++ calls emitEvent('__juce__paramSync', { params: [...] }) to push
 * all current parameter values to JavaScript.
 *
 * This function:
 * 1. Listens for '__juce__paramSync' events from C++
 * 2. Updates visual state (updateKnobVisual, updateSliderVisual, etc.)
 * 3. Updates internal tracking state (prevents first-drag jump)
 */
function setupParameterSyncListener() {
  if (!window.__JUCE__?.backend) {
    console.warn('[ParamSync] JUCE backend not available - sync disabled');
    return;
  }

  window.__JUCE__.backend.addEventListener('__juce__paramSync', (event) => {
    // Handle various event formats JUCE might send
    const params = event?.params ?? event?.detail?.params ?? event?.[0]?.params;

    if (!params || !Array.isArray(params)) {
      console.warn('[ParamSync] Invalid sync event format:', event);
      return;
    }

    console.log('[ParamSync] Received ' + params.length + ' parameter states from C++');
    let syncedCount = 0;

    for (const { id, value } of params) {
      // Find element by data-parameter-id attribute
      const element = document.querySelector('[data-parameter-id="' + id + '"]');
      if (!element) continue;

      const elementId = element.id;
      const elementType = element.dataset.type;

      // Update based on element type
      if (elementType === 'knob' || elementType === 'steppedknob' ||
          elementType === 'centerdetentknob' || elementType === 'dotindicatorknob') {
        updateKnobVisual(elementId, value);
        // CRITICAL: Update internal state to prevent drag jump
        if (element._knobValue !== undefined) element._knobValue = value;
        syncedCount++;
      }
      else if (elementType === 'slider' || elementType === 'bipolarslider' ||
               elementType === 'notchedslider' || elementType === 'crossfadeslider') {
        updateSliderVisual(elementId, value);
        if (element._sliderValue !== undefined) element._sliderValue = value;
        syncedCount++;
      }
      else if (elementType === 'arcslider') {
        updateArcSliderVisual(elementId, value);
        if (element._arcValue !== undefined) element._arcValue = value;
        syncedCount++;
      }
      else if (elementType === 'asciislider') {
        updateAsciiSliderVisual(elementId, value);
        if (element._asciiValue !== undefined) element._asciiValue = value;
        syncedCount++;
      }
      else if (elementType === 'asciibutton') {
        const isPressed = value > 0.5;
        updateAsciiButtonVisual(elementId, isPressed);
        if (element._asciiPressed !== undefined) element._asciiPressed = isPressed;
        syncedCount++;
      }
      else if (elementType === 'button' || elementType === 'iconbutton') {
        const isPressed = value > 0.5;
        element.classList.toggle('pressed', isPressed);
        syncedCount++;
      }
      else if (elementType === 'toggleswitch' || elementType === 'powerbutton') {
        const isOn = value > 0.5;
        element.dataset.on = isOn.toString();
        element.classList.toggle('on', isOn);
        syncedCount++;
      }
      else if (elementType === 'rockerswitch') {
        // Rocker has 3 positions: 0=down, 0.5=center, 1=up
        const position = value < 0.33 ? 'down' : (value > 0.66 ? 'up' : 'center');
        element.dataset.position = position;
        syncedCount++;
      }
      else if (elementType === 'rotaryswitch' || elementType === 'segmentbutton') {
        // Discrete selection - value is normalized index
        const count = parseInt(element.dataset.count || '4');
        const index = Math.round(value * (count - 1));
        element.dataset.selected = index.toString();
        syncedCount++;
      }

      // Also check for ASCII noise elements with noise parameter binding
      // (handled by noise animation setup, but update internal state here too)
      const noiseElements = document.querySelectorAll('[data-noise-param="' + id + '"]');
      noiseElements.forEach(noiseEl => {
        if (noiseEl._noiseIntensity !== undefined) {
          noiseEl._noiseIntensity = Math.max(0, Math.min(1, value));
        }
      });
    }

    console.log('[ParamSync] Synced ' + syncedCount + ' of ' + params.length + ' parameters');
  });

  console.log('[ParamSync] Listener registered for __juce__paramSync events');
}

/**
 * Initialize JUCE bridge with polling.
 * CRITICAL: Waits for functions.length > 0 before initializing UI.
 */
async function initializeJUCEBridge() {
  console.log('[JUCEBridge] Starting initialization...');

  for (let i = 0; i < 100; i++) {
    const juce = window.__JUCE__;

    if (juce?.backend && juce?.initialisationData) {
      const functions = juce.initialisationData.__juce__functions || [];

      // CRITICAL: Wait for functions to be registered
      if (functions.length > 0) {
        console.log('[JUCEBridge] JUCE available with functions:', functions);
        bridge = createJUCEFunctionWrappers();

        // Setup parameter sync listener for C++ -> JS updates
        setupParameterSyncListener();

        // Update status indicator
        const statusEl = document.getElementById('status');
        if (statusEl) {
          statusEl.textContent = 'Connected';
          statusEl.style.color = '#10b981';
        }

        // NOW initialize all UI elements
${knobSetups || '        // No knobs with parameter bindings'}
${sliderSetups || '        // No sliders with parameter bindings'}
${arcSliderSetups || '        // No arc sliders with parameter bindings'}
${asciiSliderSetups || '        // No ASCII sliders with parameter bindings'}
${asciiButtonSetups || '        // No ASCII buttons with parameter bindings'}
${rangeSliderSetups || '        // No range sliders with parameter bindings'}
${multiSliderSetups || '        // No multi sliders with parameter bindings'}
${buttonSetups || '        // No buttons with parameter bindings'}
${collapsibleSetups || '        // No collapsible containers'}
${modMatrixSetups || '        // No modulation matrices'}
${stepperSetups || '        // No steppers'}
${tabbarSetups || '        // No tab bars'}
${dropdownSetups || '        // No dropdowns'}
${segmentButtonSetups || '        // No segment buttons'}
${rotarySwitchSetups || '        // No rotary switches'}
${rockerSwitchSetups || '        // No rocker switches'}
${multiSelectDropdownSetups || '        // No multi-select dropdowns'}
${comboBoxSetups || '        // No combo boxes'}
${menuButtonSetups || '        // No menu buttons'}
${breadcrumbSetups || '        // No breadcrumbs'}
${treeViewSetups || '        // No tree views'}
${stepSequencerSetups || '        // No step sequencers'}
${xyPadSetups || '        // No XY pads'}
${loopPointsSetups || '        // No loop points'}
${harmonicEditorSetups || '        // No harmonic editors'}
${asciiNoiseSetups || '        // No ASCII art noise elements'}

        // Request parameter sync from C++ now that UI is fully ready
        if (bridge.requestParamSync) {
          try {
            await bridge.requestParamSync();
            console.log('[JUCEBridge] Parameter sync requested from C++');
          } catch (e) {
            console.warn('[JUCEBridge] requestParamSync failed:', e);
          }
        } else {
          console.log('[JUCEBridge] requestParamSync not available (C++ may use timer-based sync)');
        }

        console.log('[JUCEBridge] Initialization complete');
        return;
      }
    }

    await new Promise(r => setTimeout(r, 50));
  }

  // Timeout - running in standalone mode
  console.warn('[JUCEBridge] Initialization timeout - running in standalone mode');
  const statusEl = document.getElementById('status');
  if (statusEl) {
    statusEl.textContent = 'Standalone Mode';
    statusEl.style.color = '#f59e0b';
  }

  // Create mock bridge for standalone testing
  bridge = {
    setParameter: (paramId, value) => Promise.resolve(),
    getParameter: (paramId) => Promise.resolve(0.5),
    beginGesture: (paramId) => Promise.resolve(),
    endGesture: (paramId) => Promise.resolve()
  };

  // Initialize UI elements in standalone mode too
${knobSetups || '  // No knobs with parameter bindings'}
${sliderSetups || '  // No sliders with parameter bindings'}
${arcSliderSetups || '  // No arc sliders with parameter bindings'}
${asciiSliderSetups || '  // No ASCII sliders with parameter bindings'}
${asciiButtonSetups || '  // No ASCII buttons with parameter bindings'}
${rangeSliderSetups || '  // No range sliders with parameter bindings'}
${multiSliderSetups || '  // No multi sliders with parameter bindings'}
${buttonSetups || '  // No buttons with parameter bindings'}
${collapsibleSetups || '  // No collapsible containers'}
${modMatrixSetups || '  // No modulation matrices'}
${stepperSetups || '  // No steppers'}
${tabbarSetups || '  // No tab bars'}
${dropdownSetups || '  // No dropdowns'}
${segmentButtonSetups || '  // No segment buttons'}
${rotarySwitchSetups || '  // No rotary switches'}
${rockerSwitchSetups || '  // No rocker switches'}
${multiSelectDropdownSetups || '  // No multi-select dropdowns'}
${comboBoxSetups || '  // No combo boxes'}
${menuButtonSetups || '  // No menu buttons'}
${breadcrumbSetups || '  // No breadcrumbs'}
${treeViewSetups || '  // No tree views'}
${stepSequencerSetups || '  // No step sequencers'}
${xyPadSetups || '  // No XY pads'}
${loopPointsSetups || '  // No loop points'}
${harmonicEditorSetups || '  // No harmonic editors'}
${asciiNoiseSetups || '  // No ASCII art noise elements'}

  console.log('[JUCEBridge] Standalone mode initialized');
}

// ============================================================================
// UI Interaction Setup Functions
// ============================================================================

/**
 * Setup knob interaction with parameter binding
 * @param {string} knobId - HTML element ID
 * @param {string} paramId - Parameter ID for JUCE binding
 * @param {number} defaultValue - Default normalized value (0-1)
 */
function setupKnobInteraction(knobId, paramId, defaultValue = 0.5) {
  const knob = document.getElementById(knobId);
  if (!knob) {
    console.error(\`Knob element not found: \${knobId}\`);
    return;
  }

  let isDragging = false;
  let startY = 0;
  let startValue = defaultValue;
  let currentValue = defaultValue;

  // Initialize visual
  updateKnobVisual(knobId, defaultValue);

  // Mousedown - start drag
  knob.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    startValue = currentValue;

    // Fire and forget with .catch() - proven pattern
    bridge.getParameter(paramId).then(v => {
      if (v !== undefined) startValue = v;
    }).catch(() => {});

    bridge.beginGesture(paramId).catch(() => {});

    e.preventDefault();
    e.stopPropagation();
  });

  // Mousemove - drag to update value
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaY = startY - e.clientY;  // Inverted (up = increase)
    const sensitivity = 0.005;
    let newValue = startValue + deltaY * sensitivity;
    newValue = Math.max(0, Math.min(1, newValue));
    currentValue = newValue;

    // Fire-and-forget with .catch()
    bridge.setParameter(paramId, newValue).catch(() => {});
    updateKnobVisual(knobId, newValue);
  });

  // Mouseup - end drag
  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      bridge.endGesture(paramId).catch(() => {});
    }
  });

  // Double-click - reset to default
  knob.addEventListener('dblclick', () => {
    currentValue = defaultValue;
    bridge.setParameter(paramId, defaultValue).catch(() => {});
    updateKnobVisual(knobId, defaultValue);
  });
}

/**
 * Setup slider interaction with parameter binding
 * @param {string} sliderId - HTML element ID
 * @param {string} paramId - Parameter ID for JUCE binding
 * @param {number} defaultValue - Default normalized value (0-1)
 */
function setupSliderInteraction(sliderId, paramId, defaultValue = 0.5) {
  const slider = document.getElementById(sliderId);
  if (!slider) {
    console.error(\`Slider element not found: \${sliderId}\`);
    return;
  }

  let isDragging = false;
  let startPos = 0;
  let startValue = defaultValue;
  let currentValue = defaultValue;
  const isVertical = slider.classList.contains('vertical');

  // Initialize visual
  updateSliderVisual(sliderId, defaultValue);

  slider.addEventListener('mousedown', (e) => {
    isDragging = true;
    startPos = isVertical ? e.clientY : e.clientX;
    startValue = currentValue;

    bridge.getParameter(paramId).then(v => {
      if (v !== undefined) startValue = v;
    }).catch(() => {});

    bridge.beginGesture(paramId).catch(() => {});
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const currentPos = isVertical ? e.clientY : e.clientX;
    const delta = isVertical ? startPos - currentPos : currentPos - startPos;
    const sensitivity = 0.005;
    let newValue = startValue + delta * sensitivity;
    newValue = Math.max(0, Math.min(1, newValue));
    currentValue = newValue;

    bridge.setParameter(paramId, newValue).catch(() => {});
    updateSliderVisual(sliderId, newValue);
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      bridge.endGesture(paramId).catch(() => {});
    }
  });

  slider.addEventListener('dblclick', () => {
    currentValue = defaultValue;
    bridge.setParameter(paramId, defaultValue).catch(() => {});
    updateSliderVisual(sliderId, defaultValue);
  });
}

/**
 * Setup range slider interaction with dual-thumb parameter binding
 * @param {string} rangeSliderId - HTML element ID
 * @param {string} paramId - Parameter ID for JUCE binding (stores min-max as two params)
 * @param {number} defaultMin - Default minimum normalized value (0-1)
 * @param {number} defaultMax - Default maximum normalized value (0-1)
 */
function setupRangeSliderInteraction(rangeSliderId, paramId, defaultMin = 0.25, defaultMax = 0.75) {
  const rangeSlider = document.getElementById(rangeSliderId);
  if (!rangeSlider) {
    console.error(\`Range slider element not found: \${rangeSliderId}\`);
    return;
  }

  let isDragging = false;
  let activeThumb = null; // 'min' or 'max'
  let startPos = 0;
  let startMinValue = defaultMin;
  let startMaxValue = defaultMax;
  let currentMinValue = defaultMin;
  let currentMaxValue = defaultMax;
  const isVertical = rangeSlider.classList.contains('vertical');

  const minThumb = rangeSlider.querySelector('.rangeslider-thumb-min');
  const maxThumb = rangeSlider.querySelector('.rangeslider-thumb-max');

  if (!minThumb || !maxThumb) {
    console.error(\`Range slider thumbs not found for: \${rangeSliderId}\`);
    return;
  }

  // Initialize visual
  updateRangeSliderVisual(rangeSliderId, defaultMin, defaultMax);

  const startDrag = (e, thumb) => {
    isDragging = true;
    activeThumb = thumb;
    startPos = isVertical ? e.clientY : e.clientX;
    startMinValue = currentMinValue;
    startMaxValue = currentMaxValue;

    const minParamId = \`\${paramId}_min\`;
    const maxParamId = \`\${paramId}_max\`;
    bridge.beginGesture(thumb === 'min' ? minParamId : maxParamId).catch(() => {});
    e.preventDefault();
  };

  minThumb.addEventListener('mousedown', (e) => startDrag(e, 'min'));
  maxThumb.addEventListener('mousedown', (e) => startDrag(e, 'max'));

  document.addEventListener('mousemove', (e) => {
    if (!isDragging || !activeThumb) return;

    const currentPos = isVertical ? e.clientY : e.clientX;
    const delta = isVertical ? startPos - currentPos : currentPos - startPos;
    const sensitivity = 0.005;

    if (activeThumb === 'min') {
      let newMin = startMinValue + delta * sensitivity;
      newMin = Math.max(0, Math.min(newMin, currentMaxValue)); // Cannot exceed max
      currentMinValue = newMin;
      
      const minParamId = \`\${paramId}_min\`;
      bridge.setParameter(minParamId, newMin).catch(() => {});
    } else if (activeThumb === 'max') {
      let newMax = startMaxValue + delta * sensitivity;
      newMax = Math.min(1, Math.max(newMax, currentMinValue)); // Cannot go below min
      currentMaxValue = newMax;
      
      const maxParamId = \`\${paramId}_max\`;
      bridge.setParameter(maxParamId, newMax).catch(() => {});
    }

    updateRangeSliderVisual(rangeSliderId, currentMinValue, currentMaxValue);
  });

  document.addEventListener('mouseup', () => {
    if (isDragging && activeThumb) {
      const minParamId = \`\${paramId}_min\`;
      const maxParamId = \`\${paramId}_max\`;
      bridge.endGesture(activeThumb === 'min' ? minParamId : maxParamId).catch(() => {});
      isDragging = false;
      activeThumb = null;
    }
  });

  // Double-click - reset to defaults
  rangeSlider.addEventListener('dblclick', () => {
    currentMinValue = defaultMin;
    currentMaxValue = defaultMax;
    const minParamId = \`\${paramId}_min\`;
    const maxParamId = \`\${paramId}_max\`;
    bridge.setParameter(minParamId, defaultMin).catch(() => {});
    bridge.setParameter(maxParamId, defaultMax).catch(() => {});
    updateRangeSliderVisual(rangeSliderId, defaultMin, defaultMax);
  });
}

/**
 * Setup button interaction with parameter binding
 * @param {string} buttonId - HTML element ID
 * @param {string} paramId - Parameter ID for JUCE binding
 */
function setupButtonInteraction(buttonId, paramId) {
  const button = document.getElementById(buttonId);
  if (!button) {
    console.error(\`Button element not found: \${buttonId}\`);
    return;
  }

  // Check for navigation action
  const buttonAction = button.dataset.action;
  const targetWindowId = button.dataset.targetWindow;

  if (buttonAction === 'navigate-window' && targetWindowId && window.__WINDOW_MAPPING__) {
    const targetPath = window.__WINDOW_MAPPING__[targetWindowId];
    if (targetPath) {
      button.addEventListener('click', () => {
        window.location.href = targetPath;
      });
      return; // Navigation buttons don't need parameter binding
    } else {
      console.warn(\`Target window not found for navigation: \${targetWindowId}\`);
    }
  }

  const buttonType = button.dataset.type;

  // Handle different button types
  if (buttonType === 'toggleswitch') {
    // Toggle switch uses data-on attribute
    let isOn = button.dataset.on === 'true';
    updateToggleSwitchVisual(button, isOn);

    button.addEventListener('click', () => {
      isOn = !isOn;
      button.dataset.on = isOn.toString();
      bridge.setParameter(paramId, isOn ? 1.0 : 0.0).catch(() => {});
      updateToggleSwitchVisual(button, isOn);
    });
    return;
  }

  if (buttonType === 'powerbutton') {
    // Power button uses data-on attribute
    let isOn = button.dataset.on === 'true';
    updatePowerButtonVisual(button, isOn);

    button.addEventListener('click', () => {
      isOn = !isOn;
      button.dataset.on = isOn.toString();
      bridge.setParameter(paramId, isOn ? 1.0 : 0.0).catch(() => {});
      updatePowerButtonVisual(button, isOn);
    });
    return;
  }

  // Regular button and iconbutton - check mode
  const isMomentary = button.dataset.mode === 'momentary';
  let isPressed = false;

  if (isMomentary) {
    // Momentary button - on while held
    button.addEventListener('mousedown', () => {
      isPressed = true;
      bridge.setParameter(paramId, 1.0).catch(() => {});
      button.classList.add('pressed');
      if (button.dataset.pressed !== undefined) button.dataset.pressed = 'true';
    });

    document.addEventListener('mouseup', () => {
      if (isPressed) {
        isPressed = false;
        bridge.setParameter(paramId, 0.0).catch(() => {});
        button.classList.remove('pressed');
        if (button.dataset.pressed !== undefined) button.dataset.pressed = 'false';
      }
    });
  } else {
    // Toggle button - click to toggle
    let toggleState = button.dataset.pressed === 'true';
    if (toggleState) button.classList.add('pressed');

    button.addEventListener('click', () => {
      toggleState = !toggleState;
      const newValue = toggleState ? 1.0 : 0.0;
      bridge.setParameter(paramId, newValue).catch(() => {});
      button.classList.toggle('pressed', toggleState);
      if (button.dataset.pressed !== undefined) button.dataset.pressed = toggleState.toString();
    });
  }
}

/**
 * Update toggle switch visual state
 * Note: CSS handles thumb positioning via [data-on="true/false"] selectors
 * We just need to update the data attribute and class
 */
function updateToggleSwitchVisual(button, isOn) {
  // CSS handles the thumb position based on data-on attribute
  // No need to manually set transform - CSS already defines left position
  button.classList.toggle('on', isOn);
}

/**
 * Update power button visual state
 */
function updatePowerButtonVisual(button, isOn) {
  const led = button.querySelector('.led');
  if (led) {
    led.classList.toggle('lit', isOn);
  }
  button.classList.toggle('on', isOn);
}

/**
 * Setup arc slider interaction (SVG-based circular slider)
 * @param {string} sliderId - HTML element ID
 * @param {string} paramId - Parameter ID for JUCE binding
 * @param {number} defaultValue - Default normalized value (0-1)
 */
function setupArcSliderInteraction(sliderId, paramId, defaultValue = 0.5) {
  const slider = document.getElementById(sliderId);
  if (!slider) {
    console.error(\`Arc slider element not found: \${sliderId}\`);
    return;
  }

  let isDragging = false;
  let startY = 0;
  let startValue = defaultValue;
  let currentValue = defaultValue;

  // Initialize visual
  updateArcSliderVisual(sliderId, defaultValue);

  slider.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    startValue = currentValue;

    bridge.getParameter(paramId).then(v => {
      if (v !== undefined) startValue = v;
    }).catch(() => {});

    bridge.beginGesture(paramId).catch(() => {});
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaY = startY - e.clientY;  // Inverted (up = increase)
    const sensitivity = 0.005;
    let newValue = startValue + deltaY * sensitivity;
    newValue = Math.max(0, Math.min(1, newValue));
    currentValue = newValue;

    bridge.setParameter(paramId, newValue).catch(() => {});
    updateArcSliderVisual(sliderId, newValue);
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      bridge.endGesture(paramId).catch(() => {});
    }
  });

  slider.addEventListener('dblclick', () => {
    currentValue = defaultValue;
    bridge.setParameter(paramId, defaultValue).catch(() => {});
    updateArcSliderVisual(sliderId, defaultValue);
  });
}

/**
 * Setup ASCII slider interaction (text-based progress bar)
 * @param {string} sliderId - HTML element ID
 * @param {string} paramId - Parameter ID for JUCE binding
 * @param {number} defaultValue - Default normalized value (0-1)
 */
function setupAsciiSliderInteraction(sliderId, paramId, defaultValue = 0.5) {
  const slider = document.getElementById(sliderId);
  if (!slider) {
    console.error(\`ASCII slider element not found: \${sliderId}\`);
    return;
  }

  let isDragging = false;
  let startX = 0;
  let startValue = defaultValue;
  let currentValue = defaultValue;

  // Initialize visual
  updateAsciiSliderVisual(sliderId, defaultValue);

  slider.addEventListener('mousedown', (e) => {
    // Calculate click position within element for click-to-jump behavior
    const rect = slider.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickRatio = Math.max(0, Math.min(1, clickX / rect.width));

    // Jump to clicked position immediately
    currentValue = clickRatio;
    bridge.setParameter(paramId, clickRatio).catch(() => {});
    updateAsciiSliderVisual(sliderId, clickRatio);

    // Setup for drag from this new position
    isDragging = true;
    startX = e.clientX;
    startValue = clickRatio;

    bridge.beginGesture(paramId).catch(() => {});
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaX = e.clientX - startX;  // Right = increase
    const sensitivity = 0.005;
    let newValue = startValue + deltaX * sensitivity;
    newValue = Math.max(0, Math.min(1, newValue));
    currentValue = newValue;

    bridge.setParameter(paramId, newValue).catch(() => {});
    updateAsciiSliderVisual(sliderId, newValue);
  });

  document.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      bridge.endGesture(paramId).catch(() => {});
    }
  });

  slider.addEventListener('dblclick', () => {
    currentValue = defaultValue;
    bridge.setParameter(paramId, defaultValue).catch(() => {});
    updateAsciiSliderVisual(sliderId, defaultValue);
  });
}

/**
 * Setup ASCII button interaction (text-based toggle/momentary button)
 * @param {string} buttonId - HTML element ID
 * @param {string} paramId - Parameter ID for JUCE binding
 * @param {boolean} defaultPressed - Default pressed state
 */
function setupAsciiButtonInteraction(buttonId, paramId, defaultPressed = false) {
  const button = document.getElementById(buttonId);
  if (!button) {
    console.error(\`ASCII button element not found: \${buttonId}\`);
    return;
  }

  let isPressed = defaultPressed;
  const mode = button.dataset.mode || 'toggle';

  // Initialize visual
  updateAsciiButtonVisual(buttonId, isPressed);

  if (mode === 'toggle') {
    button.addEventListener('click', () => {
      isPressed = !isPressed;
      bridge.setParameter(paramId, isPressed ? 1 : 0).catch(() => {});
      updateAsciiButtonVisual(buttonId, isPressed);
    });
  } else {
    // Momentary mode
    button.addEventListener('mousedown', (e) => {
      isPressed = true;
      bridge.beginGesture(paramId).catch(() => {});
      bridge.setParameter(paramId, 1).catch(() => {});
      updateAsciiButtonVisual(buttonId, true);
      e.preventDefault();
    });

    const release = () => {
      if (isPressed) {
        isPressed = false;
        bridge.setParameter(paramId, 0).catch(() => {});
        bridge.endGesture(paramId).catch(() => {});
        updateAsciiButtonVisual(buttonId, false);
      }
    };

    button.addEventListener('mouseup', release);
    button.addEventListener('mouseleave', release);
  }
}

/**
 * Setup multi-slider interaction (multiple band sliders)
 * @param {string} sliderId - HTML element ID
 * @param {string} paramId - Parameter ID base for JUCE binding
 */
function setupMultiSliderInteraction(sliderId, paramId) {
  const slider = document.getElementById(sliderId);
  if (!slider) {
    console.error(\`Multi-slider element not found: \${sliderId}\`);
    return;
  }

  const bands = slider.querySelectorAll('.multislider-band');
  if (!bands.length) {
    console.error(\`Multi-slider bands not found for: \${sliderId}\`);
    return;
  }

  bands.forEach((band, index) => {
    let isDragging = false;
    let startY = 0;
    let startValue = 0.5;
    let currentValue = 0.5;
    const bandParamId = \`\${paramId}_band\${index}\`;

    band.addEventListener('mousedown', (e) => {
      isDragging = true;
      startY = e.clientY;
      startValue = currentValue;

      bridge.beginGesture(bandParamId).catch(() => {});
      e.preventDefault();
      e.stopPropagation();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const deltaY = startY - e.clientY;  // Inverted (up = increase)
      const sensitivity = 0.005;
      let newValue = startValue + deltaY * sensitivity;
      newValue = Math.max(0, Math.min(1, newValue));
      currentValue = newValue;

      bridge.setParameter(bandParamId, newValue).catch(() => {});

      // Update this band's visual
      const fill = band.querySelector('.multislider-fill');
      const thumb = band.querySelector('.multislider-thumb');
      if (fill) fill.style.height = \`\${newValue * 100}%\`;
      if (thumb) thumb.style.bottom = \`\${newValue * 100}%\`;
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        bridge.endGesture(bandParamId).catch(() => {});
      }
    });
  });
}

/**
 * Setup collapsible container interaction
 * @param {string} collapsibleId - HTML element ID
 */
function setupCollapsibleInteraction(collapsibleId) {
  const collapsible = document.getElementById(collapsibleId);
  if (!collapsible) {
    console.error(\`Collapsible element not found: \${collapsibleId}\`);
    return;
  }

  const header = collapsible.querySelector('.collapsible-header');
  const content = collapsible.querySelector('.collapsible-content');
  const arrow = collapsible.querySelector('.collapsible-arrow');

  if (!header || !content) return;

  // Initialize state from data attribute
  let isCollapsed = collapsible.dataset.collapsed === 'true';

  // Store original container height for expanding
  const originalHeight = collapsible.offsetHeight;
  const headerHeight = header.offsetHeight || 32;

  header.style.cursor = 'pointer';
  header.addEventListener('click', () => {
    isCollapsed = !isCollapsed;
    collapsible.dataset.collapsed = isCollapsed.toString();
    updateCollapsibleVisual();
  });

  function updateCollapsibleVisual() {
    if (isCollapsed) {
      // Collapse: hide content and shrink container to header height only
      content.style.display = 'none';
      content.style.maxHeight = '0px';
      content.style.opacity = '0';
      content.style.overflow = 'hidden';

      // Shrink the container to just the header height
      collapsible.style.height = headerHeight + 'px';
      collapsible.style.minHeight = headerHeight + 'px';

      if (arrow) {
        arrow.textContent = '\u25B6'; // Right-pointing triangle
      }
      collapsible.classList.add('collapsed');
    } else {
      // Expand: show content and restore container height
      content.style.display = 'block';
      content.style.maxHeight = '';
      content.style.opacity = '1';
      content.style.overflow = '';

      // Restore the container height
      collapsible.style.height = originalHeight + 'px';
      collapsible.style.minHeight = '';

      if (arrow) {
        arrow.textContent = '\u25BC'; // Down-pointing triangle
      }
      collapsible.classList.remove('collapsed');
    }
  }

  // Initialize visual state
  updateCollapsibleVisual();
}

/**
 * Setup modulation matrix interaction
 * @param {string} matrixId - HTML element ID
 */
function setupModMatrixInteraction(matrixId) {
  const matrix = document.getElementById(matrixId);
  if (!matrix) {
    console.error(\`Modulation matrix element not found: \${matrixId}\`);
    return;
  }

  // Use .matrix-cell to match HTML generator output
  const cells = matrix.querySelectorAll('.matrix-cell');

  // Get column count from destinations data attribute
  let colCount = 1;
  try {
    const destinations = JSON.parse(matrix.dataset.destinations || '[]');
    colCount = destinations.length || 1;
  } catch (e) {
    // Fallback: count cells in first row
    const firstRow = matrix.querySelector('tbody tr');
    if (firstRow) {
      colCount = firstRow.querySelectorAll('.matrix-cell').length;
    }
  }

  cells.forEach((cell, index) => {
    const row = Math.floor(index / colCount);
    const col = index % colCount;

    // Initialize with current value
    let value = parseFloat(cell.dataset.value) || 0;

    let isDragging = false;
    let startY = 0;
    let startValue = 0;

    cell.style.cursor = 'ns-resize';

    cell.addEventListener('mousedown', (e) => {
      isDragging = true;
      startY = e.clientY;
      startValue = value;
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;

      const deltaY = startY - e.clientY;
      const sensitivity = 0.01;
      value = Math.max(-1, Math.min(1, startValue + deltaY * sensitivity));

      updateModCellVisual(cell, value);
      cell.dataset.value = value.toString();
    });

    document.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
      }
    });

    // Double-click to reset
    cell.addEventListener('dblclick', () => {
      value = 0;
      cell.dataset.value = '0';
      updateModCellVisual(cell, 0);
    });
  });
}

function updateModCellVisual(cell, value) {
  // Update cell background based on value (-1 to 1)
  const intensity = Math.abs(value);
  const hue = value >= 0 ? 200 : 0; // Blue for positive, red for negative
  cell.style.backgroundColor = \`hsla(\${hue}, 70%, 50%, \${intensity * 0.8})\`;

  // Update text content
  const displayValue = (value * 100).toFixed(0);
  cell.textContent = value !== 0 ? displayValue : '';
}

/**
 * Setup stepper interaction (increment/decrement)
 * @param {string} stepperId - HTML element ID
 * @param {string} paramId - Parameter ID for JUCE binding
 */
function setupStepperInteraction(stepperId, paramId) {
  const stepper = document.getElementById(stepperId);
  if (!stepper) return;

  const decrementBtn = stepper.querySelector('.stepper-button.decrement');
  const incrementBtn = stepper.querySelector('.stepper-button.increment');
  const valueDisplay = stepper.querySelector('.stepper-value');

  const min = parseInt(stepper.dataset.min) || 0;
  const max = parseInt(stepper.dataset.max) || 10;
  const step = parseInt(stepper.dataset.step) || 1;
  let value = parseInt(stepper.dataset.value) || min;

  function updateDisplay() {
    if (valueDisplay) valueDisplay.textContent = value.toString();
    const normalized = (value - min) / (max - min);
    bridge.setParameter(paramId, normalized).catch(() => {});
  }

  if (decrementBtn) {
    decrementBtn.addEventListener('click', () => {
      if (value > min) {
        value -= step;
        updateDisplay();
      }
    });
  }

  if (incrementBtn) {
    incrementBtn.addEventListener('click', () => {
      if (value < max) {
        value += step;
        updateDisplay();
      }
    });
  }
}

/**
 * Setup tab bar interaction
 * @param {string} tabbarId - HTML element ID
 * @param {string} paramId - Parameter ID for JUCE binding
 */
function setupTabBarInteraction(tabbarId, paramId) {
  const tabbar = document.getElementById(tabbarId);
  if (!tabbar) return;

  const tabs = tabbar.querySelectorAll('.tab');
  // HTML uses data-active-tab which becomes dataset.activeTab in JS
  let activeIndex = parseInt(tabbar.dataset.activeTab) || 0;

  // Initialize: set aria-selected on active tab
  tabs.forEach((tab, index) => {
    tab.style.cursor = 'pointer';
    if (index === activeIndex) {
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
    }
  });

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => {
      // Update all tabs
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      // Set active tab
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');
      activeIndex = index;
      tabbar.dataset.activeTab = index.toString();

      const normalized = tabs.length > 1 ? index / (tabs.length - 1) : 0;
      bridge.setParameter(paramId, normalized).catch(() => {});
    });
  });
}

/**
 * Setup dropdown interaction
 * @param {string} dropdownId - HTML element ID
 * @param {string} paramId - Parameter ID for JUCE binding
 */
function setupDropdownInteraction(dropdownId, paramId) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  // Handle native <select> elements
  if (dropdown.tagName === 'SELECT') {
    dropdown.addEventListener('change', (e) => {
      const selectedIndex = dropdown.selectedIndex;
      const optionCount = dropdown.options.length;
      const normalized = optionCount > 1 ? selectedIndex / (optionCount - 1) : 0;
      bridge.setParameter(paramId, normalized).catch(() => {});
    });
    return;
  }

  // Handle custom dropdown structure
  const display = dropdown.querySelector('.dropdown-display');
  const optionsList = dropdown.querySelector('.dropdown-options');
  const options = dropdown.querySelectorAll('.dropdown-option');

  if (!display || !optionsList) return;

  let isOpen = false;
  let selectedIndex = parseInt(dropdown.dataset.selectedIndex) || 0;

  display.style.cursor = 'pointer';
  optionsList.style.display = 'none';

  display.addEventListener('click', () => {
    isOpen = !isOpen;
    optionsList.style.display = isOpen ? 'block' : 'none';
  });

  options.forEach((option, index) => {
    option.style.cursor = 'pointer';
    option.addEventListener('click', () => {
      selectedIndex = index;
      dropdown.dataset.selectedIndex = index.toString();
      display.textContent = option.textContent;
      isOpen = false;
      optionsList.style.display = 'none';

      const normalized = options.length > 1 ? index / (options.length - 1) : 0;
      bridge.setParameter(paramId, normalized).catch(() => {});
    });
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && isOpen) {
      isOpen = false;
      optionsList.style.display = 'none';
    }
  });
}

/**
 * Setup segment button interaction
 * @param {string} segmentId - HTML element ID
 * @param {string} paramId - Parameter ID for JUCE binding
 */
function setupSegmentButtonInteraction(segmentId, paramId) {
  const segment = document.getElementById(segmentId);
  if (!segment) return;

  const buttons = segment.querySelectorAll('.segment');

  // Find initially selected segment from data-selected attribute
  let activeIndex = 0;
  buttons.forEach((btn, index) => {
    if (btn.dataset.selected === 'true') {
      activeIndex = index;
      btn.classList.add('active');
    }
  });

  buttons.forEach((btn, index) => {
    btn.style.cursor = 'pointer';

    btn.addEventListener('click', () => {
      // Update visual state
      buttons.forEach(b => {
        b.classList.remove('active');
        b.dataset.selected = 'false';
      });
      btn.classList.add('active');
      btn.dataset.selected = 'true';
      activeIndex = index;

      const normalized = buttons.length > 1 ? index / (buttons.length - 1) : 0;
      bridge.setParameter(paramId, normalized).catch(() => {});
    });
  });
}

/**
 * Setup rotary switch interaction
 * @param {string} switchId - HTML element ID
 * @param {string} paramId - Parameter ID for JUCE binding
 */
function setupRotarySwitchInteraction(switchId, paramId) {
  const rotary = document.getElementById(switchId);
  if (!rotary) return;

  // HTML uses data-count and data-position (dataset.count and dataset.position)
  const positions = parseInt(rotary.dataset.count) || 8;
  let currentPosition = parseInt(rotary.dataset.position) || 0;

  let isDragging = false;
  let startY = 0;
  let startPosition = 0;

  rotary.style.cursor = 'pointer';

  rotary.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    startPosition = currentPosition;
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const deltaY = startY - e.clientY;
    const positionDelta = Math.round(deltaY / 20); // 20px per position
    let newPosition = startPosition + positionDelta;
    newPosition = Math.max(0, Math.min(positions - 1, newPosition));

    if (newPosition !== currentPosition) {
      currentPosition = newPosition;
      rotary.dataset.position = currentPosition.toString();
      updateRotarySwitchVisual(switchId, currentPosition, positions);

      const normalized = positions > 1 ? currentPosition / (positions - 1) : 0;
      bridge.setParameter(paramId, normalized).catch(() => {});
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });

  // Click to cycle
  rotary.addEventListener('click', () => {
    if (!isDragging) {
      currentPosition = (currentPosition + 1) % positions;
      rotary.dataset.position = currentPosition.toString();
      updateRotarySwitchVisual(switchId, currentPosition, positions);

      const normalized = positions > 1 ? currentPosition / (positions - 1) : 0;
      bridge.setParameter(paramId, normalized).catch(() => {});
    }
  });

  // Initialize visual
  updateRotarySwitchVisual(switchId, currentPosition, positions);
}

function updateRotarySwitchVisual(switchId, position, totalPositions) {
  const rotary = document.getElementById(switchId);
  if (!rotary) return;

  const svg = rotary.querySelector('svg');
  if (!svg) return;

  // Get SVG dimensions
  const viewBox = svg.getAttribute('viewBox');
  const [, , vbSize] = viewBox ? viewBox.split(' ').map(Number) : [0, 0, 100];
  const size = vbSize || 100;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.35;
  const pointerLength = radius * 0.7;

  // Read rotation angle from data or use default
  const rotationAngle = 270; // Default rotation angle
  const anglePerPosition = totalPositions > 1 ? rotationAngle / (totalPositions - 1) : 0;
  const startAngle = -rotationAngle / 2;
  const currentAngle = startAngle + position * anglePerPosition;

  // Convert to radians
  const rad = (currentAngle * Math.PI) / 180;

  // Calculate new pointer end position
  const pointerEndX = centerX + pointerLength * Math.sin(rad);
  const pointerEndY = centerY - pointerLength * Math.cos(rad);

  // Update the pointer line (the line element after the position marks)
  const lines = svg.querySelectorAll('line');
  // Find the pointer line (stroke-width="3" and rounded caps)
  lines.forEach(line => {
    if (line.getAttribute('stroke-linecap') === 'round' && parseFloat(line.getAttribute('stroke-width')) === 3) {
      line.setAttribute('x2', pointerEndX);
      line.setAttribute('y2', pointerEndY);
    }
  });

  // Update position indicator marks (highlight active one)
  const posMarks = [];
  lines.forEach(line => {
    if (line.getAttribute('stroke-linecap') === 'round' && parseFloat(line.getAttribute('stroke-width')) === 2) {
      posMarks.push(line);
    }
  });

  // Get colors from existing elements
  const pointerColor = svg.querySelector('circle:nth-of-type(2)')?.getAttribute('fill') || '#ffffff';
  const borderColor = svg.querySelector('circle')?.getAttribute('stroke') || '#6b7280';

  posMarks.forEach((mark, i) => {
    mark.setAttribute('stroke', i === position ? pointerColor : borderColor);
  });

  // Update legend labels active state
  const labels = rotary.querySelectorAll('.labels-legend .label');
  labels.forEach((label, i) => {
    label.dataset.active = (i === position).toString();
  });
}

/**
 * Setup rocker switch interaction
 * @param {string} switchId - HTML element ID
 * @param {string} paramId - Parameter ID for JUCE binding
 */
function setupRockerSwitchInteraction(switchId, paramId) {
  const rocker = document.getElementById(switchId);
  if (!rocker) return;

  const mode = rocker.dataset.mode || 'momentary'; // 'momentary' or 'latching'
  let currentPosition = parseInt(rocker.dataset.position) || 1; // 0=down, 1=center, 2=up

  const paddle = rocker.querySelector('.paddle');
  if (!paddle) return;

  // Position symbols matching the HTML generator
  const positionSymbols = {
    2: '\u2191', // up arrow
    1: '\u2500', // horizontal line (center)
    0: '\u2193'  // down arrow
  };

  function updateVisual() {
    rocker.dataset.position = currentPosition.toString();
    paddle.textContent = positionSymbols[currentPosition];
  }

  if (mode === 'momentary') {
    // Click top half = up (2), click bottom half = down (0), release = center (1)
    let isPressed = false;

    rocker.addEventListener('mousedown', (e) => {
      isPressed = true;
      const rect = rocker.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const midPoint = rect.height / 2;

      currentPosition = clickY < midPoint ? 2 : 0;
      updateVisual();

      const normalized = currentPosition / 2; // 0, 0.5, or 1
      bridge.setParameter(paramId, normalized).catch(() => {});
    });

    document.addEventListener('mouseup', () => {
      if (isPressed) {
        isPressed = false;
        currentPosition = 1; // Return to center
        updateVisual();
        bridge.setParameter(paramId, 0.5).catch(() => {});
      }
    });
  } else {
    // Latching mode - click to cycle through positions
    rocker.style.cursor = 'pointer';

    rocker.addEventListener('click', (e) => {
      const rect = rocker.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const midPoint = rect.height / 2;

      // Click top half = up, bottom half = down
      currentPosition = clickY < midPoint ? 2 : 0;
      updateVisual();

      const normalized = currentPosition / 2; // 0, 0.5, or 1
      bridge.setParameter(paramId, normalized).catch(() => {});
    });
  }

  // Initialize visual
  updateVisual();
}

/**
 * Setup multi-select dropdown interaction
 * @param {string} dropdownId - HTML element ID
 * @param {string} paramId - Parameter ID for JUCE binding
 */
function setupMultiSelectDropdownInteraction(dropdownId, paramId) {
  const dropdown = document.getElementById(dropdownId);
  if (!dropdown) return;

  const container = dropdown.querySelector('.dropdown-container');
  const selectedText = dropdown.querySelector('.selected-text');
  const menu = dropdown.querySelector('.dropdown-menu');
  const items = dropdown.querySelectorAll('.dropdown-item');

  if (!container || !selectedText || !menu) return;

  let isOpen = false;
  const maxSelections = parseInt(dropdown.dataset.maxSelections) || 0;

  // Toggle dropdown on click
  selectedText.style.cursor = 'pointer';
  selectedText.addEventListener('click', (e) => {
    e.stopPropagation();
    isOpen = !isOpen;
    menu.style.display = isOpen ? 'block' : 'none';
    dropdown.classList.toggle('open', isOpen);
    dropdown.setAttribute('aria-expanded', isOpen.toString());
  });

  // Handle item selection
  items.forEach((item) => {
    item.style.cursor = 'pointer';
    const checkbox = item.querySelector('input[type="checkbox"]');

    item.addEventListener('click', (e) => {
      e.stopPropagation();

      if (checkbox) {
        // Toggle checkbox if not clicking directly on it
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }

        // Enforce max selections
        if (maxSelections > 0) {
          const checkedItems = menu.querySelectorAll('input[type="checkbox"]:checked');
          if (checkedItems.length > maxSelections) {
            checkbox.checked = false;
            return;
          }
        }

        // Update display text
        updateSelectedText();
      }
    });
  });

  function updateSelectedText() {
    const selectedLabels = [];
    items.forEach((item, index) => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && checkbox.checked) {
        const label = item.querySelector('span');
        if (label) selectedLabels.push(label.textContent);
      }
    });

    selectedText.textContent = selectedLabels.length > 0
      ? selectedLabels.join(', ')
      : 'Select options...';

    // Send selected indices to JUCE
    const selectedIndices = [];
    items.forEach((item, index) => {
      const checkbox = item.querySelector('input[type="checkbox"]');
      if (checkbox && checkbox.checked) {
        selectedIndices.push(index);
      }
    });
    // Encode as comma-separated string in parameter
    bridge.setParameter(paramId, selectedIndices.join(',')).catch(() => {});
  }

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && isOpen) {
      isOpen = false;
      menu.style.display = 'none';
      dropdown.classList.remove('open');
      dropdown.setAttribute('aria-expanded', 'false');
    }
  });

  // Initialize menu as closed
  menu.style.display = 'none';
  dropdown.classList.remove('open');
}

/**
 * Setup combo box interaction (editable dropdown with autocomplete)
 * @param {string} comboboxId - HTML element ID
 * @param {string} paramId - Parameter ID for JUCE binding
 */
function setupComboBoxInteraction(comboboxId, paramId) {
  const combobox = document.getElementById(comboboxId);
  if (!combobox) return;

  const input = combobox.querySelector('input');
  const menu = combobox.querySelector('.dropdown-menu');
  const items = combobox.querySelectorAll('.dropdown-item');
  const emptyState = combobox.querySelector('.empty-state');

  if (!input || !menu) return;

  let isOpen = false;

  // Show dropdown on input focus
  input.addEventListener('focus', () => {
    isOpen = true;
    menu.style.display = 'block';
    combobox.classList.add('open');
    combobox.setAttribute('aria-expanded', 'true');
    filterItems(input.value);
  });

  // Filter items as user types
  input.addEventListener('input', () => {
    filterItems(input.value);
  });

  function filterItems(filter) {
    const lowerFilter = filter.toLowerCase();
    let visibleCount = 0;

    items.forEach((item) => {
      const text = item.textContent.toLowerCase();
      const matches = !filter || text.includes(lowerFilter);
      item.style.display = matches ? 'block' : 'none';
      if (matches) visibleCount++;
    });

    if (emptyState) {
      emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
    }
  }

  // Handle item selection
  items.forEach((item, index) => {
    item.style.cursor = 'pointer';

    item.addEventListener('click', () => {
      input.value = item.textContent;
      isOpen = false;
      menu.style.display = 'none';
      combobox.classList.remove('open');
      combobox.setAttribute('aria-expanded', 'false');

      // Send selected index to JUCE
      const normalized = items.length > 1 ? index / (items.length - 1) : 0;
      bridge.setParameter(paramId, normalized).catch(() => {});
    });
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!combobox.contains(e.target) && isOpen) {
      isOpen = false;
      menu.style.display = 'none';
      combobox.classList.remove('open');
      combobox.setAttribute('aria-expanded', 'false');
    }
  });

  // Initialize menu as closed
  menu.style.display = 'none';
  combobox.classList.remove('open');
}

/**
 * Setup menu button interaction
 * @param {string} buttonId - HTML element ID
 */
function setupMenuButtonInteraction(buttonId) {
  const button = document.getElementById(buttonId);
  if (!button) return;

  const menu = button.querySelector('.dropdown-menu');
  const items = button.querySelectorAll('.dropdown-item:not(.disabled)');

  if (!menu) return;

  let isOpen = false;

  // Handle menu item selection first (before button click handler)
  items.forEach((item) => {
    item.style.cursor = 'pointer';

    item.addEventListener('click', (e) => {
      e.stopPropagation();
      e.preventDefault();

      const itemId = item.dataset.itemId;
      console.log(\`[MenuButton] Selected: \${itemId}\`);

      // Close menu
      isOpen = false;
      menu.style.display = 'none';
      button.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');

      // Dispatch custom event for JUCE to handle
      button.dispatchEvent(new CustomEvent('menuitemselect', {
        detail: { itemId: itemId },
        bubbles: true
      }));
    });
  });

  // Toggle menu on button click (exclude clicks on dropdown-item which handle themselves)
  button.addEventListener('click', (e) => {
    // If clicking directly on a menu item, let the item handler deal with it
    if (e.target.closest('.dropdown-item')) return;

    isOpen = !isOpen;
    menu.style.display = isOpen ? 'block' : 'none';
    button.classList.toggle('open', isOpen);
    button.setAttribute('aria-expanded', isOpen.toString());
    e.stopPropagation();
  });

  // Close on click outside
  document.addEventListener('click', (e) => {
    if (!button.contains(e.target) && isOpen) {
      isOpen = false;
      menu.style.display = 'none';
      button.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    }
  });

  // Initialize menu as closed
  menu.style.display = 'none';
  button.classList.remove('open');
}

/**
 * Setup breadcrumb interaction
 * @param {string} breadcrumbId - HTML element ID
 */
function setupBreadcrumbInteraction(breadcrumbId) {
  const breadcrumb = document.getElementById(breadcrumbId);
  if (!breadcrumb) {
    console.error(\`Breadcrumb element not found: \${breadcrumbId}\`);
    return;
  }

  // Get the ol element that contains all list items
  const ol = breadcrumb.querySelector('ol');
  if (!ol) return;

  // Setup click handlers on all list items
  function setupClickHandlers() {
    const items = ol.querySelectorAll('li');

    items.forEach((li, index) => {
      const link = li.querySelector('a[data-item-id]');
      if (!link) return; // Skip if this is the current (span) item

      link.style.cursor = 'pointer';
      link.style.pointerEvents = 'auto';

      // Remove existing listeners by cloning
      const newLink = link.cloneNode(true);
      link.parentNode.replaceChild(newLink, link);

      newLink.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const itemId = newLink.dataset.itemId;
        const itemLabel = newLink.textContent;
        console.log(\`[Breadcrumb] Navigated to: \${itemId} (\${itemLabel})\`);

        // Get all items to rebuild the breadcrumb up to and including clicked item
        const allItems = ol.querySelectorAll('li');

        // Remove items after the clicked one
        for (let i = allItems.length - 1; i > index; i--) {
          allItems[i].remove();
        }

        // Convert clicked link to current (span)
        const clickedLi = allItems[index];
        const separator = clickedLi.querySelector('.breadcrumb-separator');
        if (separator) separator.remove();

        // Replace link with span for current item
        const currentSpan = document.createElement('span');
        currentSpan.className = 'breadcrumb-current';
        currentSpan.textContent = itemLabel;
        newLink.parentNode.replaceChild(currentSpan, newLink);

        // Dispatch custom event for JUCE to handle navigation
        breadcrumb.dispatchEvent(new CustomEvent('breadcrumbnavigate', {
          detail: { itemId: itemId },
          bubbles: true
        }));
      });
    });
  }

  setupClickHandlers();
  console.log(\`[Breadcrumb] Setup complete for \${breadcrumbId}\`);
}

/**
 * Setup tree view interaction
 * @param {string} treeviewId - HTML element ID
 */
function setupTreeViewInteraction(treeviewId) {
  const treeview = document.getElementById(treeviewId);
  if (!treeview) return;

  const nodes = treeview.querySelectorAll('.tree-node');

  nodes.forEach((node) => {
    const arrow = node.querySelector('.tree-arrow');
    const nodeName = node.querySelector('.tree-node-name');
    const nodeId = node.dataset.nodeId;
    const level = parseInt(node.dataset.level) || 0;

    // Check if node has children (next sibling with higher level)
    const nextSibling = node.nextElementSibling;
    const hasChildren = nextSibling &&
      parseInt(nextSibling.dataset.level) > level;

    if (hasChildren && arrow) {
      arrow.classList.add('has-children');
      arrow.textContent = '\u25BC'; // Down arrow (expanded)
      arrow.style.cursor = 'pointer';

      let isExpanded = true;

      arrow.addEventListener('click', (e) => {
        e.stopPropagation();
        isExpanded = !isExpanded;
        arrow.textContent = isExpanded ? '\u25BC' : '\u25B6';

        // Toggle visibility of child nodes
        toggleChildNodes(node, level, isExpanded);
      });
    }

    // Handle node selection
    if (nodeName) {
      nodeName.style.cursor = 'pointer';

      nodeName.addEventListener('click', () => {
        // Deselect all nodes
        nodes.forEach(n => n.dataset.selected = 'false');
        // Select this node
        node.dataset.selected = 'true';
        treeview.dataset.selectedId = nodeId;

        console.log(\`[TreeView] Selected: \${nodeId}\`);

        // Dispatch custom event
        treeview.dispatchEvent(new CustomEvent('nodeselect', {
          detail: { nodeId: nodeId },
          bubbles: true
        }));
      });
    }
  });

  function toggleChildNodes(parentNode, parentLevel, show) {
    let sibling = parentNode.nextElementSibling;

    while (sibling && parseInt(sibling.dataset.level) > parentLevel) {
      sibling.style.display = show ? 'flex' : 'none';
      sibling = sibling.nextElementSibling;
    }
  }
}

// ============================================================================
// Specialized Audio Element Setup Functions
// ============================================================================

/**
 * Setup step sequencer interaction (click to toggle steps)
 * @param {string} sequencerId - HTML element ID
 */
function setupStepSequencerInteraction(sequencerId) {
  const sequencer = document.getElementById(sequencerId);
  if (!sequencer) return;

  const svg = sequencer.querySelector('svg');
  if (!svg) return;

  const steps = svg.querySelectorAll('.step');

  steps.forEach((step) => {
    step.style.cursor = 'pointer';

    step.addEventListener('click', (e) => {
      e.stopPropagation();
      const isActive = step.dataset.active === 'true';
      step.dataset.active = (!isActive).toString();

      // Update visual - toggle opacity
      step.style.opacity = isActive ? '0.5' : '1';

      // Update fill color based on state
      const onColor = sequencer.dataset.stepOnColor || '#3b82f6';
      const offColor = sequencer.dataset.stepOffColor || '#374151';
      step.setAttribute('fill', isActive ? offColor : onColor);
    });
  });
}

/**
 * Setup XY pad interaction (drag to move cursor)
 * @param {string} padId - HTML element ID
 */
function setupXYPadInteraction(padId) {
  const pad = document.getElementById(padId);
  if (!pad) return;

  let isDragging = false;

  const updatePosition = (clientX, clientY) => {
    const rect = pad.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, 1 - (clientY - rect.top) / rect.height));

    pad.dataset.xValue = x.toFixed(3);
    pad.dataset.yValue = y.toFixed(3);

    // Update cursor position
    const svg = pad.querySelector('svg');
    if (!svg) return;

    const cursor = svg.querySelector('.xypad-cursor');
    const crosshairV = svg.querySelector('.xypad-crosshair-v');
    const crosshairH = svg.querySelector('.xypad-crosshair-h');

    const width = parseFloat(svg.getAttribute('viewBox').split(' ')[2]) || pad.offsetWidth;
    const height = parseFloat(svg.getAttribute('viewBox').split(' ')[3]) || pad.offsetHeight;

    const cursorX = x * width;
    const cursorY = (1 - y) * height;

    if (cursor) {
      cursor.setAttribute('cx', cursorX);
      cursor.setAttribute('cy', cursorY);
    }
    if (crosshairV) {
      crosshairV.setAttribute('x1', cursorX);
      crosshairV.setAttribute('x2', cursorX);
    }
    if (crosshairH) {
      crosshairH.setAttribute('y1', cursorY);
      crosshairH.setAttribute('y2', cursorY);
    }
  };

  pad.style.cursor = 'crosshair';

  pad.addEventListener('mousedown', (e) => {
    isDragging = true;
    updatePosition(e.clientX, e.clientY);
    e.preventDefault();
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      updatePosition(e.clientX, e.clientY);
    }
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
  });
}

/**
 * Setup loop points interaction (drag markers)
 * @param {string} loopId - HTML element ID
 */
function setupLoopPointsInteraction(loopId) {
  const loop = document.getElementById(loopId);
  if (!loop) return;

  const svg = loop.querySelector('svg');
  if (!svg) return;

  let draggingMarker = null;

  const startMarker = svg.querySelector('.looppoints-start-marker');
  const endMarker = svg.querySelector('.looppoints-end-marker');

  const updateMarkerPosition = (clientX, marker) => {
    const rect = svg.getBoundingClientRect();
    const width = parseFloat(svg.getAttribute('viewBox').split(' ')[2]) || loop.offsetWidth;
    let normalizedX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));

    const loopStart = parseFloat(loop.dataset.loopStart) || 0.25;
    const loopEnd = parseFloat(loop.dataset.loopEnd) || 0.75;

    if (marker === 'start') {
      normalizedX = Math.min(normalizedX, loopEnd - 0.01);
      loop.dataset.loopStart = normalizedX.toFixed(3);

      // Update visual
      const line = startMarker.querySelector('line');
      const handle = startMarker.querySelector('rect');
      const x = normalizedX * width;
      if (line) {
        line.setAttribute('x1', x);
        line.setAttribute('x2', x);
      }
      if (handle) {
        handle.setAttribute('x', x - 5);
      }
    } else {
      normalizedX = Math.max(normalizedX, loopStart + 0.01);
      loop.dataset.loopEnd = normalizedX.toFixed(3);

      // Update visual
      const line = endMarker.querySelector('line');
      const handle = endMarker.querySelector('rect');
      const x = normalizedX * width;
      if (line) {
        line.setAttribute('x1', x);
        line.setAttribute('x2', x);
      }
      if (handle) {
        handle.setAttribute('x', x - 5);
      }
    }

    // Update loop region
    const loopRegion = svg.querySelector('.looppoints-region');
    if (loopRegion) {
      const newStart = parseFloat(loop.dataset.loopStart) || 0.25;
      const newEnd = parseFloat(loop.dataset.loopEnd) || 0.75;
      loopRegion.setAttribute('x', newStart * width);
      loopRegion.setAttribute('width', (newEnd - newStart) * width);
    }
  };

  if (startMarker) {
    startMarker.style.cursor = 'ew-resize';
    startMarker.addEventListener('mousedown', (e) => {
      draggingMarker = 'start';
      e.preventDefault();
      e.stopPropagation();
    });
  }

  if (endMarker) {
    endMarker.style.cursor = 'ew-resize';
    endMarker.addEventListener('mousedown', (e) => {
      draggingMarker = 'end';
      e.preventDefault();
      e.stopPropagation();
    });
  }

  document.addEventListener('mousemove', (e) => {
    if (draggingMarker) {
      updateMarkerPosition(e.clientX, draggingMarker);
    }
  });

  document.addEventListener('mouseup', () => {
    draggingMarker = null;
  });
}

/**
 * Setup harmonic editor interaction (drag to adjust harmonics)
 * @param {string} editorId - HTML element ID
 */
function setupHarmonicEditorInteraction(editorId) {
  const editor = document.getElementById(editorId);
  if (!editor) return;

  const svg = editor.querySelector('svg');
  if (!svg) return;

  let draggingBar = null;

  const bars = svg.querySelectorAll('.harmonic-bar');
  const hitAreas = svg.querySelectorAll('.harmonic-hit-area');

  const updateBarValue = (clientY, barIndex) => {
    const rect = svg.getBoundingClientRect();
    const height = parseFloat(svg.getAttribute('viewBox').split(' ')[3]) || editor.offsetHeight;
    const labelHeight = 16; // Account for labels
    const chartHeight = height - labelHeight;

    const relativeY = clientY - rect.top;
    const normalizedY = 1 - Math.max(0, Math.min(1, relativeY / chartHeight));

    // Update bar visual
    const bar = bars[barIndex];
    if (bar) {
      const barHeight = normalizedY * chartHeight;
      bar.setAttribute('height', barHeight);
      bar.setAttribute('y', chartHeight - barHeight);
    }

    // Store value
    let values = (editor.dataset.harmonicValues || '').split(',').map(Number);
    while (values.length <= barIndex) values.push(0);
    values[barIndex] = normalizedY;
    editor.dataset.harmonicValues = values.join(',');
  };

  hitAreas.forEach((hitArea, index) => {
    hitArea.style.cursor = 'ns-resize';

    hitArea.addEventListener('mousedown', (e) => {
      draggingBar = index;
      updateBarValue(e.clientY, index);
      e.preventDefault();
      e.stopPropagation();
    });
  });

  // Fallback: make bars interactive if no hit areas
  if (hitAreas.length === 0) {
    bars.forEach((bar, index) => {
      bar.style.cursor = 'ns-resize';

      bar.addEventListener('mousedown', (e) => {
        draggingBar = index;
        updateBarValue(e.clientY, index);
        e.preventDefault();
        e.stopPropagation();
      });
    });
  }

  document.addEventListener('mousemove', (e) => {
    if (draggingBar !== null) {
      updateBarValue(e.clientY, draggingBar);
    }
  });

  document.addEventListener('mouseup', () => {
    draggingBar = null;
  });
}

/**
 * Setup ASCII art procedural noise animation
 * Reads configuration from data attributes and starts setInterval animation
 * @param {string} elementId - HTML element ID
 */
function setupAsciiNoiseAnimation(elementId) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error(\`ASCII noise element not found: \${elementId}\`);
    return;
  }

  // Read configuration from data attributes
  const chars = element.dataset.noiseChars || '.:!*#$@%&';
  let intensity = parseFloat(element.dataset.noiseIntensity) || 0.5;
  const width = parseInt(element.dataset.noiseWidth, 10) || 40;
  const height = parseInt(element.dataset.noiseHeight, 10) || 20;
  const refreshRate = parseInt(element.dataset.noiseRefresh, 10) || 100;
  const paramId = element.dataset.noiseParam || '';

  // Store intensity for parameter binding updates
  element._noiseIntensity = intensity;

  /**
   * Generate random noise text
   */
  function generateNoise() {
    const currentIntensity = element._noiseIntensity;
    let output = '';
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        output += Math.random() < currentIntensity
          ? chars[Math.floor(Math.random() * chars.length)]
          : ' ';
      }
      if (y < height - 1) output += '\\n';
    }
    element.textContent = output;
  }

  // Generate initial noise and start animation
  generateNoise();
  const intervalId = setInterval(generateNoise, refreshRate);

  // Store interval for potential cleanup
  element._noiseIntervalId = intervalId;

  // Setup parameter binding for intensity if configured
  if (paramId && window.__JUCE__?.backend) {
    window.__JUCE__.backend.addEventListener('__juce__paramSync', (event) => {
      const params = event?.params ?? event?.detail?.params ?? event?.[0]?.params;
      if (!params || !Array.isArray(params)) return;

      for (const { id, value } of params) {
        if (id === paramId) {
          element._noiseIntensity = Math.max(0, Math.min(1, value));
        }
      }
    });
  }

  console.log(\`[AsciiNoise] Started animation for \${elementId} (rate: \${refreshRate}ms, param: \${paramId || 'none'})\`);
}

// ============================================================================
// Visual Update Functions
// ============================================================================

/**
 * Update knob visual representation
 * @param {string} knobId - HTML element ID
 * @param {number} value - Normalized value (0-1)
 */
function updateKnobVisual(knobId, value) {
  const element = document.getElementById(knobId);
  if (!element) return;

  // Read angles from data attributes (set by HTML generator)
  const startAngle = parseFloat(element.dataset.startAngle) || -135;
  const endAngle = parseFloat(element.dataset.endAngle) || 135;

  // Get SVG dimensions from viewBox
  const svg = element.querySelector('svg');
  if (!svg) return;
  const viewBox = svg.getAttribute('viewBox');
  const [, , vbWidth] = viewBox ? viewBox.split(' ').map(Number) : [0, 0, 100];
  const diameter = vbWidth || 100;

  // Get track width from the track path stroke-width
  const trackPath = element.querySelector('.knob-arc-track');
  const trackWidth = trackPath ? parseFloat(trackPath.getAttribute('stroke-width')) || 4 : 4;

  // Calculate dimensions (same as HTML generator)
  const cx = diameter / 2;
  const cy = diameter / 2;
  const r = (diameter - trackWidth) / 2;

  // Calculate value angle
  const valueAngle = startAngle + (value * (endAngle - startAngle));

  // Update arc fill for arc-style knobs
  const arcFill = element.querySelector('.knob-arc-fill');
  if (arcFill) {
    if (value > 0.001) {
      // Use same describeArc logic as HTML generator (counterclockwise, swap start/end)
      const path = describeArcPath(cx, cy, r, startAngle, valueAngle);
      arcFill.setAttribute('d', path);
    } else {
      arcFill.setAttribute('d', '');
    }
  }

  // Update indicator position (for line/dot style knobs)
  const indicator = element.querySelector('.knob-indicator');
  if (indicator) {
    if (indicator.tagName === 'line') {
      // Line indicator - update endpoints
      const innerR = r * 0.4;
      const outerR = r * 0.9;
      const rad = (valueAngle - 90) * Math.PI / 180;
      indicator.setAttribute('x1', cx + innerR * Math.cos(rad));
      indicator.setAttribute('y1', cy + innerR * Math.sin(rad));
      indicator.setAttribute('x2', cx + outerR * Math.cos(rad));
      indicator.setAttribute('y2', cy + outerR * Math.sin(rad));
    } else if (indicator.tagName === 'circle') {
      // Dot indicator - update position
      const outerR = r * 0.9;
      const rad = (valueAngle - 90) * Math.PI / 180;
      indicator.setAttribute('cx', cx + outerR * Math.cos(rad));
      indicator.setAttribute('cy', cy + outerR * Math.sin(rad));
    }
  }

  // Update data attribute
  element.setAttribute('data-value', value);
}

/**
 * Calculate arc path (same algorithm as HTML generator)
 * Uses counterclockwise sweep, swaps start/end for proper direction
 */
function describeArcPath(cx, cy, r, startAngle, endAngle) {
  // Convert to radians, offset by -90 to make 0° = top
  const startRad = (endAngle - 90) * Math.PI / 180;
  const endRad = (startAngle - 90) * Math.PI / 180;

  // Calculate start and end points (note: swapped for counterclockwise)
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);

  // Large arc flag: 1 if angle span > 180°
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;

  // Sweep flag 0 = counterclockwise (matches HTML generator)
  return \`M \${x1} \${y1} A \${r} \${r} 0 \${largeArc} 0 \${x2} \${y2}\`;
}

/**
 * Update slider visual representation
 * Handles standard, bipolar, crossfade, and notched sliders
 * @param {string} sliderId - HTML element ID
 * @param {number} value - Normalized value (0-1)
 */
function updateSliderVisual(sliderId, value) {
  const element = document.getElementById(sliderId);
  if (!element) return;

  const isVertical = element.classList.contains('vertical');
  const isBipolar = element.classList.contains('bipolarslider-element');
  const isCrossfade = element.classList.contains('crossfadeslider-element');
  const thumb = element.querySelector('.slider-thumb');
  const fill = element.querySelector('.slider-fill');

  if (isBipolar || isCrossfade) {
    // Bipolar and crossfade sliders: fill extends from center (0.5) to value
    const centerValue = 0.5;
    const fillStart = Math.min(centerValue, value) * 100;
    const fillEnd = Math.max(centerValue, value) * 100;
    const fillSize = fillEnd - fillStart;

    if (isVertical) {
      if (thumb) thumb.style.bottom = \`\${value * 100}%\`;
      if (fill) {
        fill.style.bottom = \`\${fillStart}%\`;
        fill.style.height = \`\${fillSize}%\`;
      }
    } else {
      if (thumb) thumb.style.left = \`\${value * 100}%\`;
      if (fill) {
        fill.style.left = \`\${fillStart}%\`;
        fill.style.width = \`\${fillSize}%\`;
      }
    }
  } else {
    // Standard slider: fill from start to value
    if (isVertical) {
      if (thumb) thumb.style.bottom = \`\${value * 100}%\`;
      if (fill) fill.style.height = \`\${value * 100}%\`;
    } else {
      if (thumb) thumb.style.left = \`\${value * 100}%\`;
      if (fill) fill.style.width = \`\${value * 100}%\`;
    }
  }

  // Update data attribute
  element.setAttribute('data-value', value);
}

/**
 * Update arc slider visual representation (SVG-based)
 * @param {string} sliderId - HTML element ID
 * @param {number} value - Normalized value (0-1)
 */
function updateArcSliderVisual(sliderId, value) {
  const element = document.getElementById(sliderId);
  if (!element) return;

  // Read angles from data attributes
  const startAngle = parseFloat(element.dataset.startAngle) || 135;
  const endAngle = parseFloat(element.dataset.endAngle) || 45;

  // Get SVG dimensions from viewBox
  const svg = element.querySelector('svg');
  if (!svg) return;
  const viewBox = svg.getAttribute('viewBox');
  const [, , vbWidth] = viewBox ? viewBox.split(' ').map(Number) : [0, 0, 100];
  const diameter = vbWidth || 100;

  // Get track info
  const trackPath = element.querySelector('.arcslider-track');
  const trackWidth = trackPath ? parseFloat(trackPath.getAttribute('stroke-width')) || 4 : 4;

  // Get thumb radius from existing thumb
  const thumbCircle = element.querySelector('.arcslider-thumb');
  const thumbRadius = thumbCircle ? parseFloat(thumbCircle.getAttribute('r')) || 8 : 8;

  // Calculate dimensions
  const cx = diameter / 2;
  const cy = diameter / 2;
  const radius = (diameter - trackWidth) / 2 - thumbRadius;

  // Calculate sweep angle (handling wrap-around for arc that goes through bottom)
  let sweepAngle = endAngle - startAngle;
  if (sweepAngle < 0) {
    sweepAngle += 360;
  }

  // Value angle interpolates from startAngle toward endAngle
  const valueAngle = startAngle + value * sweepAngle;

  // Update arc fill path
  const arcFill = element.querySelector('.arcslider-fill');
  if (arcFill) {
    if (value > 0.001) {
      const path = describeArcSliderPath(cx, cy, radius, startAngle, valueAngle);
      arcFill.setAttribute('d', path);
    } else {
      arcFill.setAttribute('d', '');
    }
  }

  // Update thumb position
  if (thumbCircle) {
    const pos = polarToCartesianArc(cx, cy, radius, valueAngle);
    thumbCircle.setAttribute('cx', pos.x);
    thumbCircle.setAttribute('cy', pos.y);
  }

  // Update data attribute
  element.setAttribute('data-value', value);
}

/**
 * Calculate arc path for arc slider (clockwise from startAngle)
 */
function describeArcSliderPath(cx, cy, radius, startAngle, endAngle) {
  let sweepAngle = endAngle - startAngle;
  if (sweepAngle < 0) {
    sweepAngle += 360;
  }

  const start = polarToCartesianArc(cx, cy, radius, startAngle);
  const end = polarToCartesianArc(cx, cy, radius, endAngle);
  const largeArcFlag = sweepAngle > 180 ? '1' : '0';

  return \`M \${start.x} \${start.y} A \${radius} \${radius} 0 \${largeArcFlag} 1 \${end.x} \${end.y}\`;
}

/**
 * Convert polar coordinates to cartesian for arc slider
 */
function polarToCartesianArc(cx, cy, radius, angleInDegrees) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians)
  };
}

/**
 * Update ASCII slider visual representation
 * @param {string} sliderId - HTML element ID
 * @param {number} value - Normalized value (0-1)
 */
function updateAsciiSliderVisual(sliderId, value) {
  const element = document.getElementById(sliderId);
  if (!element) return;

  // Read config from data attributes
  const barWidth = parseInt(element.dataset.barWidth) || 20;
  const filledChar = element.dataset.filledChar || '#';
  const emptyChar = element.dataset.emptyChar || '-';
  const leftBracket = element.dataset.leftBracket || '[';
  const rightBracket = element.dataset.rightBracket || ']';
  const showValue = element.dataset.showValue === 'true';
  const valuePosition = element.dataset.valuePosition || 'right';
  const valueFormat = element.dataset.valueFormat || 'percentage';
  const minVal = parseFloat(element.dataset.min) || 0;
  const maxVal = parseFloat(element.dataset.max) || 1;
  const showLabel = element.dataset.showLabel === 'true';
  const labelText = element.dataset.labelText || '';
  const labelPosition = element.dataset.labelPosition || 'left';

  // Calculate filled/empty counts
  const filledCount = Math.round(value * barWidth);
  const emptyCount = barWidth - filledCount;

  // Build the bar string
  const bar = leftBracket + filledChar.repeat(filledCount) + emptyChar.repeat(emptyCount) + rightBracket;

  // Format value display
  let valueText = '';
  if (showValue) {
    const actualValue = minVal + value * (maxVal - minVal);
    if (valueFormat === 'percentage') {
      valueText = Math.round(value * 100) + '%';
    } else {
      valueText = actualValue.toFixed(2);
    }
  }

  // Find the bar display element
  const barDisplay = element.querySelector('.asciislider-bar');
  if (barDisplay) {
    const parts = [];
    if (showLabel && labelPosition === 'left') parts.push(labelText);
    if (showValue && valuePosition === 'left') parts.push(valueText);
    parts.push(bar);
    if (showValue && valuePosition === 'right') parts.push(valueText);
    if (showLabel && labelPosition === 'right') parts.push(labelText);
    barDisplay.textContent = parts.join(' ');
  }

  // Update data attribute
  element.setAttribute('data-value', value);
  element._asciiValue = value;
}

/**
 * Update ASCII button visual representation
 * @param {string} buttonId - HTML element ID
 * @param {boolean} isPressed - Whether button is pressed
 */
function updateAsciiButtonVisual(buttonId, isPressed) {
  const element = document.getElementById(buttonId);
  if (!element) return;

  // Read config from data attributes
  const normalArt = element.dataset.normalArt || '';
  const pressedArt = element.dataset.pressedArt || '';
  const normalColor = element.dataset.normalColor || '#00ff00';
  const pressedColor = element.dataset.pressedColor || '#00ffff';
  const normalBg = element.dataset.normalBg || 'transparent';
  const pressedBg = element.dataset.pressedBg || 'transparent';

  // Update visual state
  const artDisplay = element.querySelector('.asciibutton-art');
  if (artDisplay) {
    artDisplay.textContent = isPressed ? pressedArt : normalArt;
  }

  // Update colors
  element.style.color = isPressed ? pressedColor : normalColor;
  element.style.backgroundColor = isPressed ? pressedBg : normalBg;

  // Update data attribute
  element.setAttribute('data-pressed', isPressed);
  element._asciiPressed = isPressed;
}

/**
 * Update range slider visual representation
 * @param {string} rangeSliderId - HTML element ID
 * @param {number} minValue - Normalized minimum value (0-1)
 * @param {number} maxValue - Normalized maximum value (0-1)
 */
function updateRangeSliderVisual(rangeSliderId, minValue, maxValue) {
  const element = document.getElementById(rangeSliderId);
  if (!element) return;

  const isVertical = element.classList.contains('vertical');
  const minThumb = element.querySelector('.rangeslider-thumb-min');
  const maxThumb = element.querySelector('.rangeslider-thumb-max');
  const fill = element.querySelector('.rangeslider-fill');

  if (isVertical) {
    if (minThumb) minThumb.style.bottom = \`\${minValue * 100}%\`;
    if (maxThumb) maxThumb.style.bottom = \`\${maxValue * 100}%\`;
    if (fill) {
      fill.style.bottom = \`\${minValue * 100}%\`;
      fill.style.height = \`\${(maxValue - minValue) * 100}%\`;
    }
  } else {
    if (minThumb) minThumb.style.left = \`\${minValue * 100}%\`;
    if (maxThumb) maxThumb.style.left = \`\${maxValue * 100}%\`;
    if (fill) {
      fill.style.left = \`\${minValue * 100}%\`;
      fill.style.width = \`\${(maxValue - minValue) * 100}%\`;
    }
  }

  // Update data attributes
  element.setAttribute('data-min-value', minValue);
  element.setAttribute('data-max-value', maxValue);
}

// ============================================================================
// Start Initialization
// ============================================================================

// Wait for fonts to load before initializing, to ensure correct rendering
async function initializeWhenReady() {
  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    await new Promise(resolve => {
      document.addEventListener('DOMContentLoaded', resolve);
    });
  }

  // Wait for all fonts to be loaded (important for custom fonts)
  try {
    await document.fonts.ready;
  } catch (error) {
    console.warn('Font loading check failed:', error);
  }

  // Initialize after fonts are ready
  initializeJUCEBridge();
}

// Start initialization
initializeWhenReady();
`
}

// ============================================================================
// Components Generator
// ============================================================================

/**
 * Generate components.js content
 * Creates UI update functions for elements
 *
 * @param elements - Array of element configurations
 * @returns JavaScript code as string
 *
 * @example
 * const componentsJS = generateComponentsJS(elements)
 * // Generates updateElementValue and updateElementPressed functions
 */
export function generateComponentsJS(_elements: ElementConfig[]): string {
  return `// ============================================================================
// UI Component Update Functions
// Generated by VST3 WebView UI Designer
// For JUCE->UI callbacks (parameter changes from C++ side)
// ============================================================================

/**
 * Store knob configuration for visual updates
 * Call this during initialization to set up knob config
 * @param {string} id - Element ID
 * @param {object} config - Knob configuration {startAngle, endAngle, ...}
 */
function initializeKnob(id, config) {
  const element = document.getElementById(id);
  if (!element) return;

  // CRITICAL: Store config for updateKnobVisual
  element._knobConfig = config;
}

/**
 * Store slider configuration for visual updates
 * @param {string} id - Element ID
 * @param {object} config - Slider configuration
 */
function initializeSlider(id, config) {
  const element = document.getElementById(id);
  if (!element) return;

  element._sliderConfig = config;
}

/**
 * Update element value display (knob, slider, meter)
 * Called by JUCE when parameter values change
 * @param {string} id - Element ID (kebab-case)
 * @param {number} value - Normalized value (0-1)
 */
function updateElementValue(id, value) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(\`Element not found: \${id}\`);
    return;
  }

  // Update data attribute for CSS/JS access
  element.setAttribute('data-value', value);

  // Type-specific updates - use ID-based functions for consistency
  if (element.classList.contains('knob')) {
    updateKnobVisualById(id, value);
  } else if (element.classList.contains('slider')) {
    updateSliderVisualById(id, value);
  } else if (element.classList.contains('meter')) {
    updateMeterVisualById(id, value);
  }
}

/**
 * Update button pressed state
 * Called by JUCE when button state changes
 * @param {string} id - Element ID (kebab-case)
 * @param {boolean} pressed - Whether button is pressed
 */
function updateElementPressed(id, pressed) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(\`Element not found: \${id}\`);
    return;
  }

  if (pressed) {
    element.classList.add('pressed');
  } else {
    element.classList.remove('pressed');
  }
}

// ============================================================================
// ID-Based Visual Update Helpers (use stored config)
// ============================================================================

function updateKnobVisualById(id, value) {
  const element = document.getElementById(id);
  if (!element) return;

  // Read angles from data attributes (set by HTML generator)
  const startAngle = parseFloat(element.dataset.startAngle) || -135;
  const endAngle = parseFloat(element.dataset.endAngle) || 135;

  // Get SVG dimensions from viewBox
  const svg = element.querySelector('svg');
  if (!svg) return;
  const viewBox = svg.getAttribute('viewBox');
  const [, , vbWidth] = viewBox ? viewBox.split(' ').map(Number) : [0, 0, 100];
  const diameter = vbWidth || 100;

  // Get track width from the track path stroke-width
  const trackPath = element.querySelector('.knob-arc-track');
  const trackWidth = trackPath ? parseFloat(trackPath.getAttribute('stroke-width')) || 4 : 4;

  // Calculate dimensions (same as HTML generator)
  const cx = diameter / 2;
  const cy = diameter / 2;
  const r = (diameter - trackWidth) / 2;

  // Calculate value angle
  const valueAngle = startAngle + (value * (endAngle - startAngle));

  // Update arc fill for arc-style knobs
  const arcFill = element.querySelector('.knob-arc-fill');
  if (arcFill) {
    if (value > 0.001) {
      // Use same describeArc logic as HTML generator (counterclockwise, swap start/end)
      const path = describeArcPathById(cx, cy, r, startAngle, valueAngle);
      arcFill.setAttribute('d', path);
    } else {
      arcFill.setAttribute('d', '');
    }
  }

  // Update indicator position (for line/dot style knobs)
  const indicator = element.querySelector('.knob-indicator');
  if (indicator) {
    if (indicator.tagName === 'line') {
      const innerR = r * 0.4;
      const outerR = r * 0.9;
      const rad = (valueAngle - 90) * Math.PI / 180;
      indicator.setAttribute('x1', cx + innerR * Math.cos(rad));
      indicator.setAttribute('y1', cy + innerR * Math.sin(rad));
      indicator.setAttribute('x2', cx + outerR * Math.cos(rad));
      indicator.setAttribute('y2', cy + outerR * Math.sin(rad));
    } else if (indicator.tagName === 'circle') {
      const outerR = r * 0.9;
      const rad = (valueAngle - 90) * Math.PI / 180;
      indicator.setAttribute('cx', cx + outerR * Math.cos(rad));
      indicator.setAttribute('cy', cy + outerR * Math.sin(rad));
    }
  }

  element.setAttribute('data-value', value);
}

function describeArcPathById(cx, cy, r, startAngle, endAngle) {
  const startRad = (endAngle - 90) * Math.PI / 180;
  const endRad = (startAngle - 90) * Math.PI / 180;
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);
  const largeArc = Math.abs(endAngle - startAngle) > 180 ? 1 : 0;
  return \`M \${x1} \${y1} A \${r} \${r} 0 \${largeArc} 0 \${x2} \${y2}\`;
}

function updateSliderVisualById(id, value) {
  const element = document.getElementById(id);
  if (!element) return;

  const isVertical = element.classList.contains('vertical');
  const thumb = element.querySelector('.slider-thumb');
  const fill = element.querySelector('.slider-fill');

  if (isVertical) {
    if (thumb) thumb.style.bottom = \`\${value * 100}%\`;
    if (fill) fill.style.height = \`\${value * 100}%\`;
  } else {
    if (thumb) thumb.style.left = \`\${value * 100}%\`;
    if (fill) fill.style.width = \`\${value * 100}%\`;
  }

  element.setAttribute('data-value', value);
}

function updateMeterVisualById(id, value) {
  const element = document.getElementById(id);
  if (!element) return;

  const fill = element.querySelector('.meter-fill');
  const isVertical = element.classList.contains('vertical');

  if (isVertical) {
    if (fill) fill.style.height = \`\${value * 100}%\`;
  } else {
    if (fill) fill.style.width = \`\${value * 100}%\`;
  }

  element.setAttribute('data-value', value);
}
`
}

// ============================================================================
// Mock JUCE Backend Generator
// ============================================================================

/**
 * Generate mock JUCE backend for HTML preview mode
 * Allows standalone testing without JUCE runtime
 *
 * @returns JavaScript code as string
 *
 * @example
 * const mockJS = generateMockJUCE()
 * // Include in <script> tag for HTML preview
 */
export function generateMockJUCE(): string {
  return `// ============================================================================
// Mock JUCE Backend for Standalone Preview
// DO NOT include this in JUCE WebView2 plugin - only for HTML preview
// Implements the event-based native function pattern
// ============================================================================

if (typeof window.__JUCE__ === 'undefined') {
  console.log('[MockJUCE] Initializing mock JUCE backend (preview mode)');

  // Mock parameter storage
  const mockParameters = new Map();
  const eventListeners = new Map();

  window.__JUCE__ = {
    // Initialization data - includes registered functions
    initialisationData: {
      __juce__functions: ['setParameter', 'getParameter', 'beginGesture', 'endGesture']
    },

    backend: {
      /**
       * Emit event to JUCE backend (mock implementation)
       * Handles __juce__invoke events for native function calls
       */
      emitEvent: (eventName, data) => {
        if (eventName === '__juce__invoke') {
          const { name, params, resultId } = data;

          // Mock function implementations
          let result = undefined;

          switch (name) {
            case 'setParameter':
              const [paramId, value] = params;
              mockParameters.set(paramId, value);
              console.log(\`[MockJUCE] setParameter('\${paramId}', \${value})\`);

              // Emit paramSync event to notify listeners (e.g., ASCII noise)
              setTimeout(() => {
                const syncListeners = eventListeners.get('__juce__paramSync') || [];
                syncListeners.forEach(listener => {
                  listener({ params: [{ id: paramId, value }] });
                });
              }, 0);

              result = true;
              break;

            case 'getParameter':
              result = mockParameters.get(params[0]) ?? 0.5;
              console.log(\`[MockJUCE] getParameter('\${params[0]}') -> \${result}\`);
              break;

            case 'beginGesture':
              console.log(\`[MockJUCE] beginGesture('\${params[0]}')\`);
              result = true;
              break;

            case 'endGesture':
              console.log(\`[MockJUCE] endGesture('\${params[0]}')\`);
              result = true;
              break;

            default:
              console.warn(\`[MockJUCE] Unknown function: \${name}\`);
          }

          // Dispatch completion event
          setTimeout(() => {
            const listeners = eventListeners.get('__juce__complete') || [];
            listeners.forEach(listener => {
              listener({ resultId, result });
            });
          }, 10);
        }
      },

      /**
       * Add event listener for JUCE events
       */
      addEventListener: (eventName, callback) => {
        if (!eventListeners.has(eventName)) {
          eventListeners.set(eventName, []);
        }
        eventListeners.get(eventName).push(callback);
      },

      /**
       * Remove event listener
       */
      removeEventListener: (eventName, callback) => {
        const listeners = eventListeners.get(eventName) || [];
        const index = listeners.indexOf(callback);
        if (index > -1) {
          listeners.splice(index, 1);
        }
      }
    }
  };

  // Add test controls for interactive preview
  window.addEventListener('DOMContentLoaded', () => {
    console.log('[MockJUCE] Mock JUCE backend ready');
    console.log('[MockJUCE] Available functions:', window.__JUCE__.initialisationData.__juce__functions);
  });
}
`
}

// ============================================================================
// Responsive Scaling Generator
// ============================================================================

/**
 * Generate responsive scaling JavaScript for exported HTML
 * Maintains aspect ratio with min/max limits when plugin window resizes
 * For preview mode, maxScale defaults to 1.0 to show at original size
 *
 * @param canvasWidth - Original canvas width in pixels
 * @param canvasHeight - Original canvas height in pixels
 * @param minScale - Minimum scale factor (default 0.25)
 * @param maxScale - Maximum scale factor (default 1.0 for preview, 2.0 for export)
 * @returns JavaScript code as string
 *
 * @example
 * const scaleJS = generateResponsiveScaleJS(800, 600)
 * // Generates updateScale function with resize listener
 */
export function generateResponsiveScaleJS(
  canvasWidth: number,
  canvasHeight: number,
  minScale: number = 0.25,
  maxScale: number = 1.0
): string {
  return `// Responsive scaling for plugin window resize
(function() {
  const CANVAS_WIDTH = ${canvasWidth};
  const CANVAS_HEIGHT = ${canvasHeight};
  const MIN_SCALE = ${minScale};
  const MAX_SCALE = ${maxScale};

  function updateScale() {
    const container = document.getElementById('plugin-container');
    const wrapper = document.getElementById('plugin-wrapper');
    if (!container || !wrapper) return;

    const scaleX = wrapper.clientWidth / CANVAS_WIDTH;
    const scaleY = wrapper.clientHeight / CANVAS_HEIGHT;

    // Maintain aspect ratio - use smaller scale
    let scale = Math.min(scaleX, scaleY);

    // Apply min/max limits - cap at 1.0 for preview to show actual size
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale));

    container.style.transform = \`scale(\${scale})\`;
  }

  window.addEventListener('resize', updateScale);
  window.addEventListener('load', updateScale);
  updateScale();
})();
`
}

// ============================================================================
// Custom Scrollbar Generator
// ============================================================================

/**
 * Generate custom scrollbar JavaScript for exported HTML
 * Creates div-based scrollbars with arrows that replicate the designer's custom scrollbar
 *
 * @returns JavaScript code as string
 */
export function generateCustomScrollbarJS(): string {
  return `// ============================================================================
// Custom Scrollbar Implementation
// Replicates the designer's custom scrollbar with arrows
// Auto-detects vertical and horizontal overflow
// ============================================================================

(function() {
  /**
   * Create a single scrollbar (vertical or horizontal)
   */
  function createScrollbar(scrollContainer, config, isVertical, cornerSize) {
    const {
      width = 12,
      thumbColor = '#4a4a4a',
      thumbHoverColor = '#5a5a5a',
      trackColor = '#1a1a1a',
      borderRadius = 0,
      thumbBorder = 2
    } = config;

    const arrowSize = width;
    let thumbPosition = 0;
    let thumbSize = 50;
    let isDragging = false;
    let dragStart = { mousePos: 0, scrollPos: 0 };

    // Create scrollbar container
    const scrollbarEl = document.createElement('div');
    scrollbarEl.className = 'custom-scrollbar-' + (isVertical ? 'vertical' : 'horizontal');
    scrollbarEl.style.cssText = isVertical
      ? \`position: absolute; right: 0; top: 0; width: \${width}px; height: calc(100% - \${cornerSize}px); display: flex; flex-direction: column; background-color: \${trackColor}; z-index: 10;\`
      : \`position: absolute; left: 0; bottom: 0; height: \${width}px; width: calc(100% - \${cornerSize}px); display: flex; flex-direction: row; background-color: \${trackColor}; z-index: 10;\`;

    // Create arrow SVG
    function createArrowSVG(direction) {
      const size = width;
      const pad = Math.floor(size * 0.3);
      const mid = size / 2;
      const arrowLength = size - pad * 2;

      let path;
      switch (direction) {
        case 'up': path = \`M\${pad},\${mid + arrowLength / 4} L\${mid},\${pad} L\${size - pad},\${mid + arrowLength / 4}\`; break;
        case 'down': path = \`M\${pad},\${mid - arrowLength / 4} L\${mid},\${size - pad} L\${size - pad},\${mid - arrowLength / 4}\`; break;
        case 'left': path = \`M\${mid + arrowLength / 4},\${pad} L\${pad},\${mid} L\${mid + arrowLength / 4},\${size - pad}\`; break;
        case 'right': path = \`M\${mid - arrowLength / 4},\${pad} L\${size - pad},\${mid} L\${mid - arrowLength / 4},\${size - pad}\`; break;
      }
      return \`<svg width="\${size}" height="\${size}" viewBox="0 0 \${size} \${size}"><path d="\${path}" fill="none" stroke="\${thumbColor}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>\`;
    }

    // Create arrow button
    function createArrowButton(direction) {
      const btn = document.createElement('div');
      btn.innerHTML = createArrowSVG(direction);
      btn.style.cssText = \`width: \${arrowSize}px; height: \${arrowSize}px; background-color: \${trackColor}; display: flex; align-items: center; justify-content: center; cursor: pointer; flex-shrink: 0; border-radius: \${borderRadius}px;\`;

      btn.addEventListener('mouseenter', () => btn.querySelector('path').setAttribute('stroke', thumbHoverColor));
      btn.addEventListener('mouseleave', () => btn.querySelector('path').setAttribute('stroke', thumbColor));
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const amount = (direction === 'up' || direction === 'left') ? -30 : 30;
        console.log('[Scrollbar] Arrow click:', direction, 'amount:', amount, 'scrollTop before:', scrollContainer.scrollTop, 'scrollHeight:', scrollContainer.scrollHeight, 'clientHeight:', scrollContainer.clientHeight);
        if (isVertical) {
          scrollContainer.scrollTop += amount;
          console.log('[Scrollbar] scrollTop after:', scrollContainer.scrollTop);
        } else {
          scrollContainer.scrollLeft += amount;
          console.log('[Scrollbar] scrollLeft after:', scrollContainer.scrollLeft);
        }
      });
      return btn;
    }

    // Create track and thumb
    const trackEl = document.createElement('div');
    trackEl.style.cssText = 'flex: 1; position: relative; cursor: pointer;';

    const thumbEl = document.createElement('div');
    const thumbWidth = width - thumbBorder * 2;
    thumbEl.style.cssText = \`position: absolute; \${isVertical ? 'left' : 'top'}: \${thumbBorder}px; \${isVertical ? 'width' : 'height'}: \${thumbWidth}px; background-color: \${thumbColor}; border-radius: \${borderRadius}px; cursor: grab; transition: background-color 0.15s ease;\`;

    // Update scrollbar
    function update() {
      const clientSize = isVertical ? scrollContainer.clientHeight : scrollContainer.clientWidth;
      const scrollSize = isVertical ? scrollContainer.scrollHeight : scrollContainer.scrollWidth;
      const scrollPos = isVertical ? scrollContainer.scrollTop : scrollContainer.scrollLeft;

      const needsScrollbar = scrollSize > clientSize + 1;
      scrollbarEl.style.display = 'flex'; // Always show track

      if (!needsScrollbar) {
        thumbEl.style.display = 'none';
        return;
      }
      thumbEl.style.display = 'block';

      // Use actual track element size for accurate thumb positioning
      const availableTrackSize = isVertical ? trackEl.clientHeight : trackEl.clientWidth;
      const ratio = clientSize / scrollSize;
      thumbSize = Math.max(30, availableTrackSize * ratio);
      thumbEl.style[isVertical ? 'height' : 'width'] = thumbSize + 'px';

      const maxScroll = scrollSize - clientSize;
      const maxThumbPos = availableTrackSize - thumbSize;
      thumbPosition = maxScroll > 0 ? (scrollPos / maxScroll) * maxThumbPos : 0;
      thumbEl.style[isVertical ? 'top' : 'left'] = thumbPosition + 'px';
    }

    // Thumb drag
    thumbEl.addEventListener('mousedown', (e) => {
      e.preventDefault();
      e.stopPropagation();
      isDragging = true;
      thumbEl.style.cursor = 'grabbing';
      thumbEl.style.transition = 'none';
      dragStart = { mousePos: isVertical ? e.clientY : e.clientX, scrollPos: isVertical ? scrollContainer.scrollTop : scrollContainer.scrollLeft };

      function onMove(e) {
        const delta = (isVertical ? e.clientY : e.clientX) - dragStart.mousePos;
        const clientSize = isVertical ? scrollContainer.clientHeight : scrollContainer.clientWidth;
        const scrollSize = isVertical ? scrollContainer.scrollHeight : scrollContainer.scrollWidth;
        const availableTrackSize = isVertical ? trackEl.clientHeight : trackEl.clientWidth;
        const scrollRatio = (scrollSize - clientSize) / (availableTrackSize - thumbSize);
        if (isVertical) scrollContainer.scrollTop = dragStart.scrollPos + delta * scrollRatio;
        else scrollContainer.scrollLeft = dragStart.scrollPos + delta * scrollRatio;
      }

      function onUp() {
        isDragging = false;
        thumbEl.style.cursor = 'grab';
        thumbEl.style.transition = 'background-color 0.15s ease';
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
      }

      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onUp);
    });

    thumbEl.addEventListener('mouseenter', () => { if (!isDragging) thumbEl.style.backgroundColor = thumbHoverColor; });
    thumbEl.addEventListener('mouseleave', () => { if (!isDragging) thumbEl.style.backgroundColor = thumbColor; });

    // Track click
    trackEl.addEventListener('click', (e) => {
      if (e.target === thumbEl) return;
      const rect = trackEl.getBoundingClientRect();
      const clickPos = (isVertical ? e.clientY - rect.top : e.clientX - rect.left) - thumbSize / 2;
      const clientSize = isVertical ? scrollContainer.clientHeight : scrollContainer.clientWidth;
      const scrollSize = isVertical ? scrollContainer.scrollHeight : scrollContainer.scrollWidth;
      const availableTrackSize = isVertical ? trackEl.clientHeight : trackEl.clientWidth;
      const scrollRatio = (scrollSize - clientSize) / (availableTrackSize - thumbSize);
      if (isVertical) scrollContainer.scrollTop = Math.max(0, clickPos * scrollRatio);
      else scrollContainer.scrollLeft = Math.max(0, clickPos * scrollRatio);
    });

    // Assemble
    trackEl.appendChild(thumbEl);
    scrollbarEl.appendChild(createArrowButton(isVertical ? 'up' : 'left'));
    scrollbarEl.appendChild(trackEl);
    scrollbarEl.appendChild(createArrowButton(isVertical ? 'down' : 'right'));

    return { element: scrollbarEl, update };
  }

  /**
   * Initialize custom scrollbars for an element (both vertical and horizontal)
   */
  function initCustomScrollbar(scrollContainer, config) {
    const width = config.width || 12;
    const trackColor = config.trackColor || '#1a1a1a';
    const parent = scrollContainer.parentElement;

    console.log('[Scrollbar] Init for:', scrollContainer);
    console.log('[Scrollbar] Parent:', parent);
    console.log('[Scrollbar] scrollHeight:', scrollContainer.scrollHeight, 'clientHeight:', scrollContainer.clientHeight);
    console.log('[Scrollbar] scrollWidth:', scrollContainer.scrollWidth, 'clientWidth:', scrollContainer.clientWidth);
    console.log('[Scrollbar] overflow style:', getComputedStyle(scrollContainer).overflow);

    parent.style.position = 'relative';

    // Check which scrollbars are needed
    let needsV = scrollContainer.scrollHeight > scrollContainer.clientHeight + 1;
    let needsH = scrollContainer.scrollWidth > scrollContainer.clientWidth + 1;
    console.log('[Scrollbar] needsV:', needsV, 'needsH:', needsH);
    const cornerSize = (needsV && needsH) ? width : 0;

    // Create scrollbars
    const vScrollbar = createScrollbar(scrollContainer, config, true, cornerSize);
    const hScrollbar = createScrollbar(scrollContainer, config, false, cornerSize);

    parent.appendChild(vScrollbar.element);
    parent.appendChild(hScrollbar.element);

    // Corner piece
    const corner = document.createElement('div');
    corner.style.cssText = \`position: absolute; right: 0; bottom: 0; width: \${width}px; height: \${width}px; background-color: \${trackColor}; z-index: 10; display: none;\`;
    parent.appendChild(corner);

    // Update function
    function updateAll() {
      needsV = scrollContainer.scrollHeight > scrollContainer.clientHeight + 1;
      needsH = scrollContainer.scrollWidth > scrollContainer.clientWidth + 1;
      corner.style.display = (needsV && needsH) ? 'block' : 'none';
      vScrollbar.update();
      hScrollbar.update();
    }

    scrollContainer.addEventListener('scroll', updateAll);
    new ResizeObserver(updateAll).observe(scrollContainer);
    new MutationObserver(updateAll).observe(scrollContainer, { childList: true, subtree: true });
    updateAll();
  }

  // Initialize all
  function initAllScrollbars() {
    document.querySelectorAll('[data-custom-scrollbar]').forEach(el => {
      try {
        const config = JSON.parse(el.dataset.customScrollbar);
        initCustomScrollbar(el, config);
      } catch (e) {
        console.warn('[CustomScrollbar] Failed:', el, e);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllScrollbars);
  } else {
    initAllScrollbars();
  }
})();
`
}
