/**
 * JUCE WebView2 Bridge
 * Auto-discovers parameters from HTML data attributes and connects to C++ backend
 */

const JuceBridge = {
    bridge: null,
    ready: false,
    knobs: new Map(),
    pollInterval: null,

    /**
     * Initialize the bridge - polls for JUCE backend availability
     */
    async init() {
        console.log('[Bridge] Initializing...');
        this.updateStatus('connecting', 'Connecting...');

        // Poll for JUCE backend (max 5 seconds)
        for (let i = 0; i < 100; i++) {
            if (window.__JUCE__?.backend && window.__JUCE__?.initialisationData?.__juce__functions) {
                await this.setupBridge();
                return;
            }
            await this.sleep(50);
        }

        console.warn('[Bridge] JUCE backend not available, running in standalone mode');
        this.updateStatus('standalone', 'Standalone Mode');
        this.setupStandaloneMode();
    },

    /**
     * Setup the bridge with native functions
     */
    async setupBridge() {
        console.log('[Bridge] JUCE backend detected');

        const functions = window.__JUCE__.initialisationData.__juce__functions || [];
        console.log('[Bridge] Available functions:', functions);

        // Create wrapper functions
        this.bridge = {};
        for (const name of functions) {
            this.bridge[name] = (...args) => this.callNative(name, args);
        }

        this.ready = true;
        this.updateStatus('ready', 'Connected');

        // Auto-discover and setup parameters
        await this.discoverParameters();

        // Start parameter polling for DAW automation sync
        this.startPolling();
    },

    /**
     * Call a native function via JUCE bridge
     */
    callNative(name, args) {
        return new Promise((resolve, reject) => {
            if (!window.__JUCE__?.backend) {
                reject(new Error('JUCE backend not available'));
                return;
            }

            const resultId = `result_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

            // Listen for result
            const handler = (event) => {
                if (event.detail?.resultId === resultId) {
                    window.removeEventListener('__juce__complete', handler);
                    resolve(event.detail.result);
                }
            };
            window.addEventListener('__juce__complete', handler);

            // Timeout after 1 second
            setTimeout(() => {
                window.removeEventListener('__juce__complete', handler);
                reject(new Error(`Timeout calling ${name}`));
            }, 1000);

            // Emit the call
            window.__JUCE__.backend.emitEvent('__juce__invoke', {
                name,
                params: args,
                resultId
            });
        });
    },

    /**
     * Auto-discover parameters from HTML elements with data-param attribute
     */
    async discoverParameters() {
        console.log('[Bridge] Discovering parameters...');

        // Find all elements with data-param attribute
        const paramElements = document.querySelectorAll('[data-param]');

        for (const element of paramElements) {
            const paramId = element.dataset.param;
            const type = element.dataset.type || 'knob';
            const defaultValue = parseFloat(element.dataset.default) || 0.5;

            console.log(`[Bridge] Found parameter: ${paramId} (${type})`);

            if (type === 'knob') {
                await this.setupKnob(element.id, paramId, defaultValue);
            } else if (type === 'meter') {
                this.setupMeter(element.id, paramId);
            }
        }
    },

    /**
     * Setup a knob with parameter binding
     */
    async setupKnob(elementId, paramId, defaultValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        // Get initial value from C++
        let initialValue = defaultValue;
        if (this.ready && this.bridge.getParameter) {
            try {
                initialValue = await this.bridge.getParameter(paramId);
            } catch (e) {
                console.warn(`[Bridge] Failed to get initial value for ${paramId}:`, e);
            }
        }

        // Initialize knob visual if not already done
        if (!element._knobConfig && window.Components) {
            const diameter = parseInt(element.dataset.diameter) || 70;
            const fillColor = element.dataset.color || '#00d4ff';

            window.Components.initializeKnob(elementId, {
                diameter,
                value: initialValue,
                fillColor
            });
        } else if (window.Components) {
            window.Components.updateKnobVisual(elementId, initialValue);
        }

        // Store knob info
        this.knobs.set(elementId, {
            paramId,
            defaultValue,
            element
        });

        // Setup interaction
        this.setupKnobInteraction(elementId, paramId, defaultValue);
    },

    /**
     * Setup knob mouse/touch interaction
     */
    setupKnobInteraction(elementId, paramId, defaultValue) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let isDragging = false;
        let startY = 0;
        let startValue = 0;
        const sensitivity = 0.005;

        const onStart = async (e) => {
            e.preventDefault();
            isDragging = true;
            startY = e.clientY || e.touches?.[0]?.clientY || 0;

            // Get current value
            if (this.ready && this.bridge.getParameter) {
                try {
                    startValue = await this.bridge.getParameter(paramId);
                } catch {
                    startValue = element._knobConfig?.value || defaultValue;
                }
            } else {
                startValue = element._knobConfig?.value || defaultValue;
            }

            // Begin automation gesture
            if (this.ready && this.bridge.beginGesture) {
                this.bridge.beginGesture(paramId).catch(() => {});
            }

            element.style.cursor = 'grabbing';
            document.body.style.cursor = 'grabbing';
        };

        const onMove = (e) => {
            if (!isDragging) return;
            e.preventDefault();

            const currentY = e.clientY || e.touches?.[0]?.clientY || 0;
            const delta = (startY - currentY) * sensitivity;
            const newValue = Math.max(0, Math.min(1, startValue + delta));

            // Update visual immediately for responsiveness
            if (window.Components) {
                window.Components.updateKnobVisual(elementId, newValue);
            }

            // Send to C++ (fire-and-forget)
            if (this.ready && this.bridge.setParameter) {
                this.bridge.setParameter(paramId, newValue).catch(() => {});
            }

            // Update value label if present
            this.updateValueLabel(elementId, newValue);
        };

        const onEnd = () => {
            if (!isDragging) return;
            isDragging = false;

            // End automation gesture
            if (this.ready && this.bridge.endGesture) {
                this.bridge.endGesture(paramId).catch(() => {});
            }

            element.style.cursor = '';
            document.body.style.cursor = '';
        };

        // Double-click to reset
        const onDoubleClick = (e) => {
            e.preventDefault();

            if (window.Components) {
                window.Components.updateKnobVisual(elementId, defaultValue);
            }

            if (this.ready && this.bridge.setParameter) {
                if (this.bridge.beginGesture) this.bridge.beginGesture(paramId).catch(() => {});
                this.bridge.setParameter(paramId, defaultValue).catch(() => {});
                if (this.bridge.endGesture) this.bridge.endGesture(paramId).catch(() => {});
            }

            this.updateValueLabel(elementId, defaultValue);
        };

        // Attach listeners
        element.addEventListener('mousedown', onStart);
        element.addEventListener('touchstart', onStart, { passive: false });
        document.addEventListener('mousemove', onMove);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('mouseup', onEnd);
        document.addEventListener('touchend', onEnd);
        element.addEventListener('dblclick', onDoubleClick);
    },

    /**
     * Setup a meter with parameter binding
     */
    setupMeter(elementId, paramId) {
        // Meters are typically updated via polling or C++ push
        // Store reference for potential updates
        this.knobs.set(elementId, {
            paramId,
            type: 'meter',
            element: document.getElementById(elementId)
        });
    },

    /**
     * Update value label associated with a knob
     */
    updateValueLabel(knobId, value) {
        // Look for associated label element
        const label = document.querySelector(`[data-label-for="${knobId}"]`);
        if (label) {
            // Format based on data-format attribute
            const format = label.dataset.format || 'percent';
            let text;

            switch (format) {
                case 'percent':
                    text = `${Math.round(value * 100)}%`;
                    break;
                case 'db':
                    if (value < 0.01) {
                        text = '-inf dB';
                    } else {
                        const db = 20 * Math.log10(value);
                        text = `${db.toFixed(1)} dB`;
                    }
                    break;
                case 'raw':
                    text = value.toFixed(2);
                    break;
                default:
                    text = `${Math.round(value * 100)}%`;
            }

            label.textContent = text;
        }
    },

    /**
     * Start polling for parameter changes (DAW automation sync)
     */
    startPolling() {
        if (this.pollInterval) return;

        this.pollInterval = setInterval(async () => {
            if (!this.ready) return;

            for (const [elementId, info] of this.knobs) {
                if (info.type === 'meter') continue;

                try {
                    const value = await this.bridge.getParameter(info.paramId);
                    const element = document.getElementById(elementId);

                    // Only update if value changed significantly
                    if (element?._knobConfig && Math.abs(element._knobConfig.value - value) > 0.001) {
                        if (window.Components) {
                            window.Components.updateKnobVisual(elementId, value);
                        }
                        this.updateValueLabel(elementId, value);
                    }
                } catch (e) {
                    // Ignore polling errors
                }
            }
        }, 100); // 10Hz polling for DAW automation
    },

    /**
     * Setup standalone mode (no C++ backend)
     */
    setupStandaloneMode() {
        // Still discover and setup parameters for visual testing
        const paramElements = document.querySelectorAll('[data-param]');

        for (const element of paramElements) {
            const type = element.dataset.type || 'knob';
            const defaultValue = parseFloat(element.dataset.default) || 0.5;

            if (type === 'knob' && window.Components) {
                const diameter = parseInt(element.dataset.diameter) || 70;
                const fillColor = element.dataset.color || '#00d4ff';

                window.Components.initializeKnob(element.id, {
                    diameter,
                    value: defaultValue,
                    fillColor
                });

                // Setup interaction without C++ calls
                this.setupKnobInteraction(element.id, element.dataset.param, defaultValue);
            }
        }
    },

    /**
     * Update status display
     */
    updateStatus(state, text) {
        const statusEl = document.getElementById('status');
        if (statusEl) {
            statusEl.textContent = text;
            statusEl.className = `status ${state}`;
        }
    },

    /**
     * Sleep helper
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => JuceBridge.init());
} else {
    JuceBridge.init();
}

// Export for external access
window.JuceBridge = JuceBridge;
