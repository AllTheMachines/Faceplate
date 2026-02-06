/**
 * SVG Component Rendering Library
 * Generic SVG knob/meter rendering for VST plugin UIs
 */

const Components = {
    /**
     * Initialize a knob with SVG rendering
     * @param {string} id - Element ID
     * @param {Object} config - Knob configuration
     */
    initializeKnob(id, config = {}) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Knob element not found: ${id}`);
            return;
        }

        // Default configuration
        const settings = {
            diameter: config.diameter || 70,
            value: config.value || 0.5,
            startAngle: config.startAngle || -135,
            endAngle: config.endAngle || 135,
            trackColor: config.trackColor || '#374151',
            fillColor: config.fillColor || '#00d4ff',
            indicatorColor: config.indicatorColor || '#ffffff',
            trackWidth: config.trackWidth || 4,
            ...config
        };

        // Store config on element for later updates
        element._knobConfig = settings;

        // Create SVG
        const size = settings.diameter;
        const center = size / 2;
        const radius = (size / 2) - (settings.trackWidth / 2) - 2;

        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', size);
        svg.setAttribute('height', size);
        svg.setAttribute('viewBox', `0 0 ${size} ${size}`);
        svg.style.display = 'block';

        // Background track (full arc)
        const trackPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        trackPath.setAttribute('d', this.describeArc(center, center, radius, settings.startAngle, settings.endAngle));
        trackPath.setAttribute('fill', 'none');
        trackPath.setAttribute('stroke', settings.trackColor);
        trackPath.setAttribute('stroke-width', settings.trackWidth);
        trackPath.setAttribute('stroke-linecap', 'round');
        svg.appendChild(trackPath);

        // Value fill arc
        const fillPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        fillPath.setAttribute('class', 'knob-fill');
        fillPath.setAttribute('fill', 'none');
        fillPath.setAttribute('stroke', settings.fillColor);
        fillPath.setAttribute('stroke-width', settings.trackWidth);
        fillPath.setAttribute('stroke-linecap', 'round');
        svg.appendChild(fillPath);

        // Indicator line
        const indicator = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        indicator.setAttribute('class', 'knob-indicator');
        indicator.setAttribute('stroke', settings.indicatorColor);
        indicator.setAttribute('stroke-width', '2');
        indicator.setAttribute('stroke-linecap', 'round');
        svg.appendChild(indicator);

        // Clear existing content and add SVG
        element.innerHTML = '';
        element.appendChild(svg);

        // Initial visual update
        this.updateKnobVisual(id, settings.value);
    },

    /**
     * Update knob visual to reflect current value
     * @param {string} id - Element ID
     * @param {number} value - Normalized value (0-1)
     */
    updateKnobVisual(id, value) {
        const element = document.getElementById(id);
        if (!element || !element._knobConfig) return;

        const config = element._knobConfig;
        const svg = element.querySelector('svg');
        if (!svg) return;

        const size = config.diameter;
        const center = size / 2;
        const radius = (size / 2) - (config.trackWidth / 2) - 2;
        const indicatorRadius = radius - 8;

        // Clamp value
        value = Math.max(0, Math.min(1, value));

        // Calculate current angle
        const angleRange = config.endAngle - config.startAngle;
        const currentAngle = config.startAngle + (value * angleRange);

        // Update fill arc
        const fillPath = svg.querySelector('.knob-fill');
        if (fillPath) {
            if (value > 0.001) {
                fillPath.setAttribute('d', this.describeArc(center, center, radius, config.startAngle, currentAngle));
            } else {
                fillPath.setAttribute('d', '');
            }
        }

        // Update indicator
        const indicator = svg.querySelector('.knob-indicator');
        if (indicator) {
            const indicatorEnd = this.polarToCartesian(center, center, indicatorRadius, currentAngle);
            const indicatorStart = this.polarToCartesian(center, center, indicatorRadius - 10, currentAngle);
            indicator.setAttribute('x1', indicatorStart.x);
            indicator.setAttribute('y1', indicatorStart.y);
            indicator.setAttribute('x2', indicatorEnd.x);
            indicator.setAttribute('y2', indicatorEnd.y);
        }

        // Store current value
        element._knobConfig.value = value;
    },

    /**
     * Convert polar coordinates to cartesian
     */
    polarToCartesian(centerX, centerY, radius, angleInDegrees) {
        const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    },

    /**
     * Generate SVG arc path
     */
    describeArc(x, y, radius, startAngle, endAngle) {
        const start = this.polarToCartesian(x, y, radius, endAngle);
        const end = this.polarToCartesian(x, y, radius, startAngle);
        const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';

        return [
            'M', start.x, start.y,
            'A', radius, radius, 0, largeArcFlag, 0, end.x, end.y
        ].join(' ');
    },

    /**
     * Initialize a VU meter
     * @param {string} id - Element ID
     * @param {Object} config - Meter configuration
     */
    initializeMeter(id, config = {}) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Meter element not found: ${id}`);
            return;
        }

        const settings = {
            width: config.width || 20,
            height: config.height || 100,
            segments: config.segments || 20,
            value: config.value || 0,
            peakHoldTime: config.peakHoldTime || 1000,
            colors: config.colors || {
                low: '#00ff00',
                mid: '#ffff00',
                high: '#ff0000',
                background: '#1a1a2e'
            },
            ...config
        };

        element._meterConfig = settings;
        element._peakValue = 0;
        element._peakTime = 0;

        // Create meter segments
        const segmentHeight = (settings.height - (settings.segments - 1)) / settings.segments;
        let html = `<div class="meter-container" style="width:${settings.width}px;height:${settings.height}px;background:${settings.colors.background};display:flex;flex-direction:column-reverse;gap:1px;">`;

        for (let i = 0; i < settings.segments; i++) {
            const ratio = i / settings.segments;
            let color;
            if (ratio < 0.6) color = settings.colors.low;
            else if (ratio < 0.85) color = settings.colors.mid;
            else color = settings.colors.high;

            html += `<div class="meter-segment" data-index="${i}" style="height:${segmentHeight}px;background:${color};opacity:0.2;"></div>`;
        }

        html += '</div>';
        element.innerHTML = html;

        this.updateMeterVisual(id, settings.value);
    },

    /**
     * Update meter visual
     * @param {string} id - Element ID
     * @param {number} value - Normalized value (0-1)
     */
    updateMeterVisual(id, value) {
        const element = document.getElementById(id);
        if (!element || !element._meterConfig) return;

        const config = element._meterConfig;
        const segments = element.querySelectorAll('.meter-segment');

        value = Math.max(0, Math.min(1, value));
        const activeSegments = Math.floor(value * config.segments);

        // Update peak hold
        const now = Date.now();
        if (value >= element._peakValue) {
            element._peakValue = value;
            element._peakTime = now;
        } else if (now - element._peakTime > config.peakHoldTime) {
            element._peakValue = Math.max(value, element._peakValue - 0.02);
        }

        const peakSegment = Math.floor(element._peakValue * config.segments);

        segments.forEach((seg, i) => {
            if (i < activeSegments) {
                seg.style.opacity = '1';
            } else if (i === peakSegment && element._peakValue > 0) {
                seg.style.opacity = '1';
            } else {
                seg.style.opacity = '0.2';
            }
        });
    }
};

// Export for use in bindings.js
window.Components = Components;
