# JUCE Communication Pattern

Technical reference for the dynamic function wrapper pattern used in Faceplate's JUCE WebView2 integration.

## Pattern Overview

Faceplate uses a **dynamic function wrapper pattern** to communicate between JavaScript (UI) and C++ (audio processor). This pattern was discovered and refined through testing in January 2026 and is now the proven, production-ready approach.

### Key Characteristics

| Feature | Implementation |
|---------|----------------|
| **Wrapper Type** | Dynamic (discovers registered functions at runtime) |
| **Result ID** | Sequential integer (not `Math.random()`) |
| **Initialization** | Polling (waits for JUCE bridge to be ready) |
| **Error Handling** | Fire-and-forget with `.catch(() => {})` |
| **Timeout** | 1 second per call, 5 seconds for initialization |

### Why This Pattern?

Previous approaches using static function calls or random IDs proved unreliable:

- **Static calls** failed when JUCE hadn't registered functions yet
- **Random IDs** occasionally collided, causing missed responses
- **No error handling** caused unhandled promise rejections

The dynamic wrapper pattern solves all these issues.

---

## JavaScript Implementation

### Creating Function Wrappers

```javascript
let bridge = null;
let nextResultId = 1;  // Sequential integer - CRITICAL

/**
 * Create dynamic function wrappers for all registered JUCE native functions.
 * This pattern adapts to whatever functions JUCE has registered.
 */
function createJUCEFunctionWrappers() {
  // Get list of registered functions from JUCE initialization data
  const functions = window.__JUCE__.initialisationData.__juce__functions || [];

  const wrappers = {};
  const pendingResults = new Map();

  // Listen for completion events from JUCE C++
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

  // Create a wrapper function for EACH registered native function
  for (const funcName of functions) {
    wrappers[funcName] = function(...args) {
      return new Promise((resolve) => {
        const resultId = nextResultId++;  // Sequential, not random!
        pendingResults.set(resultId, resolve);

        // Emit invocation event to JUCE backend
        window.__JUCE__.backend.emitEvent('__juce__invoke', {
          name: funcName,
          params: args,
          resultId: resultId
        });

        // Timeout after 1 second (prevents memory leak from stuck promises)
        setTimeout(() => {
          if (pendingResults.has(resultId)) {
            pendingResults.delete(resultId);
            resolve(undefined);
          }
        }, 1000);
      });
    };
  }

  return wrappers;
}
```

### Polling Initialization

```javascript
/**
 * Initialize JUCE bridge with polling.
 * CRITICAL: Waits for functions.length > 0 before setting up UI.
 */
async function initializeJUCEBridge() {
  console.log('[JUCEBridge] Starting initialization...');

  // Poll up to 100 times (5 seconds total)
  for (let i = 0; i < 100; i++) {
    const juce = window.__JUCE__;

    if (juce?.backend && juce?.initialisationData) {
      const functions = juce.initialisationData.__juce__functions || [];

      // CRITICAL: Only proceed when functions are actually registered
      if (functions.length > 0) {
        console.log('[JUCEBridge] JUCE available with functions:', functions);
        bridge = createJUCEFunctionWrappers();

        // NOW it's safe to set up UI interactions
        setupAllInteractions();
        return;
      }
    }

    // Wait 50ms before next attempt
    await new Promise(r => setTimeout(r, 50));
  }

  // Timeout - create mock bridge for standalone preview
  console.warn('[JUCEBridge] Initialization timeout - running in standalone mode');
  bridge = createMockBridge();
}
```

### Element Interaction Setup

```javascript
/**
 * Setup knob interaction with parameter binding.
 * Uses fire-and-forget pattern with .catch() for reliability.
 */
function setupKnobInteraction(knobId, paramId, defaultValue = 0.5) {
  const knob = document.getElementById(knobId);
  if (!knob) return;

  let isDragging = false;
  let startY = 0;
  let startValue = defaultValue;
  let currentValue = defaultValue;

  // Initialize visual state
  updateKnobVisual(knobId, defaultValue);

  // Mouse down - start drag gesture
  knob.addEventListener('mousedown', (e) => {
    isDragging = true;
    startY = e.clientY;
    startValue = currentValue;

    // Get current value from JUCE (fire and forget)
    bridge.getParameter(paramId).then(v => {
      if (v !== undefined) startValue = v;
    }).catch(() => {});  // <-- Error suppression is intentional

    // Begin automation gesture
    bridge.beginGesture(paramId).catch(() => {});
  });

  // Mouse move - update value while dragging
  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;

    const delta = startY - e.clientY;
    const sensitivity = 0.005;  // Pixels to normalized value
    const newValue = Math.max(0, Math.min(1, startValue + delta * sensitivity));

    currentValue = newValue;

    // Send to JUCE (fire and forget)
    bridge.setParameter(paramId, newValue).catch(() => {});

    // Update visual
    updateKnobVisual(knobId, newValue);
  });

  // Mouse up - end drag gesture
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
```

---

## C++ Implementation

### Native Function Registration

```cpp
juce::WebBrowserComponent browser {
    juce::WebBrowserComponent::Options()
        .withBackend(juce::WebBrowserComponent::Options::Backend::webview2)
        .withResourceProvider([this](const auto& url) {
            return getResource(url);
        })
        // Register the 4 standard native functions
        .withNativeFunction("setParameter", [this](auto& args, auto complete) {
            if (args.size() >= 2) {
                auto paramId = args[0].toString();
                auto value = static_cast<float>(args[1]);

                if (auto* param = processor.apvts.getParameter(paramId))
                    param->setValueNotifyingHost(value);
            }
            complete({});
        })
        .withNativeFunction("getParameter", [this](auto& args, auto complete) {
            if (args.size() >= 1) {
                auto paramId = args[0].toString();

                if (auto* param = processor.apvts.getParameter(paramId)) {
                    complete(param->getValue());
                    return;
                }
            }
            complete(0.5f);
        })
        .withNativeFunction("beginGesture", [this](auto& args, auto complete) {
            if (args.size() >= 1) {
                auto paramId = args[0].toString();

                if (auto* param = processor.apvts.getParameter(paramId))
                    param->beginChangeGesture();
            }
            complete({});
        })
        .withNativeFunction("endGesture", [this](auto& args, auto complete) {
            if (args.size() >= 1) {
                auto paramId = args[0].toString();

                if (auto* param = processor.apvts.getParameter(paramId))
                    param->endChangeGesture();
            }
            complete({});
        })
};
```

### Standard Functions Reference

| Function | Arguments | Return | Purpose |
|----------|-----------|--------|---------|
| `setParameter` | `(paramId, value)` | `void` | Set normalized value (0-1) |
| `getParameter` | `(paramId)` | `float` | Get current normalized value |
| `beginGesture` | `(paramId)` | `void` | Start automation recording |
| `endGesture` | `(paramId)` | `void` | End automation recording |

---

## Event Flow

```
                    USER INTERACTION
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    JAVASCRIPT (UI)                          │
│                                                             │
│  User drags knob                                           │
│       │                                                     │
│       ▼                                                     │
│  Calculate new normalized value (0-1)                      │
│       │                                                     │
│       ▼                                                     │
│  bridge.setParameter('paramId', value).catch(() => {})     │
│       │                                                     │
│       ▼                                                     │
│  Emit '__juce__invoke' event:                              │
│  {                                                          │
│    name: 'setParameter',                                   │
│    params: ['paramId', 0.75],                              │
│    resultId: 42                                            │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   JUCE WebView Bridge                       │
│                                                             │
│  Receives '__juce__invoke' event                           │
│       │                                                     │
│       ▼                                                     │
│  Looks up registered native function by name               │
│       │                                                     │
│       ▼                                                     │
│  Calls lambda with args and completion callback            │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                      C++ (Backend)                          │
│                                                             │
│  Native function executes:                                 │
│       │                                                     │
│       ▼                                                     │
│  param->setValueNotifyingHost(value)                       │
│       │                                                     │
│       ▼                                                     │
│  APVTS updates internal state                              │
│       │                                                     │
│       ▼                                                     │
│  complete({}) called                                       │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   JUCE WebView Bridge                       │
│                                                             │
│  Emits '__juce__complete' event:                           │
│  {                                                          │
│    resultId: 42,                                           │
│    result: undefined                                       │
│  }                                                          │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    JAVASCRIPT (UI)                          │
│                                                             │
│  Event listener receives '__juce__complete'                │
│       │                                                     │
│       ▼                                                     │
│  Looks up pending callback by resultId (42)                │
│       │                                                     │
│       ▼                                                     │
│  Resolves Promise (or ignored if .catch() swallowed it)    │
└─────────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   AUDIO PROCESSING                          │
│                                                             │
│  processBlock() reads new parameter value from APVTS       │
│       │                                                     │
│       ▼                                                     │
│  Audio output affected by new value                        │
└─────────────────────────────────────────────────────────────┘
```

---

## Why This Pattern Works

### 1. Dynamic Function Discovery

The wrapper doesn't hard-code function names. It reads `__juce__functions` from initialization data and creates wrappers for whatever functions JUCE has registered:

```javascript
const functions = window.__JUCE__.initialisationData.__juce__functions || [];
for (const funcName of functions) {
  wrappers[funcName] = function(...args) { /* ... */ };
}
```

This means:
- Works with any set of native functions
- No JavaScript changes needed when C++ functions change
- Graceful handling of missing functions

### 2. Integer Result IDs

Using sequential integers instead of `Math.random()`:

```javascript
let nextResultId = 1;
// ...
const resultId = nextResultId++;
```

Benefits:
- **No collisions** - each ID is unique within the session
- **Predictable** - easier to debug
- **Lightweight** - no random number generation overhead

### 3. Polling Initialization

The bridge waits for JUCE to be ready before setting up UI:

```javascript
for (let i = 0; i < 100; i++) {
  if (functions.length > 0) {
    // JUCE is ready, proceed
    break;
  }
  await sleep(50);
}
```

This handles:
- **Race conditions** - JavaScript may run before JUCE initializes
- **Async loading** - WebView2 initialization is asynchronous
- **Timeout fallback** - Standalone mode if JUCE never responds

### 4. Fire-and-Forget Error Handling

All calls use `.catch(() => {})`:

```javascript
bridge.setParameter(paramId, value).catch(() => {});
```

This ensures:
- **No unhandled rejections** - browser console stays clean
- **Smooth UI** - errors don't break interaction flow
- **Graceful degradation** - partial functionality if some calls fail

---

## Mock Bridge for Standalone Mode

When running outside JUCE (browser preview), a mock bridge provides basic functionality:

```javascript
function createMockBridge() {
  const mockParameters = new Map();

  return {
    setParameter: (paramId, value) => {
      mockParameters.set(paramId, value);
      console.log(`[MockJUCE] setParameter('${paramId}', ${value})`);
      return Promise.resolve();
    },

    getParameter: (paramId) => {
      const value = mockParameters.get(paramId) ?? 0.5;
      console.log(`[MockJUCE] getParameter('${paramId}') -> ${value}`);
      return Promise.resolve(value);
    },

    beginGesture: (paramId) => {
      console.log(`[MockJUCE] beginGesture('${paramId}')`);
      return Promise.resolve();
    },

    endGesture: (paramId) => {
      console.log(`[MockJUCE] endGesture('${paramId}')`);
      return Promise.resolve();
    }
  };
}
```

This enables:
- **Design preview** without JUCE
- **Interaction testing** in browser
- **Console logging** for debugging

---

## Discovery & Testing History

This pattern was discovered and refined through testing in the EFXvst3 and INSTvst3 template projects:

| Date | Discovery |
|------|-----------|
| Jan 24, 2026 | Initial static pattern found unreliable |
| Jan 24, 2026 | Dynamic wrapper approach prototyped |
| Jan 25, 2026 | Integer resultIds replaced Math.random() |
| Jan 25, 2026 | Polling initialization added |
| Jan 25, 2026 | Fire-and-forget .catch() pattern finalized |
| Jan 25, 2026 | Pattern verified in both EFXvst3 and INSTvst3 |

---

## Related Documentation

- [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md) - Complete integration walkthrough
- [EXPORT_FORMAT.md](./EXPORT_FORMAT.md) - Generated file details
- [ELEMENT_REFERENCE.md](./ELEMENT_REFERENCE.md) - All available elements
- [BEST_PRACTICES.md](./BEST_PRACTICES.md) - Design guidelines

---

*Last updated: 28 January 2026*
