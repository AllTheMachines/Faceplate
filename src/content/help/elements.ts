/**
 * Element Help Content
 * Help documentation for all element types in the UI designer
 *
 * Coverage:
 * - Tier 1 (full docs with examples): ~15 core elements
 * - Tier 2 (standard docs): ~70+ specialized elements
 */

import { HelpContent } from './types'

// =============================================================================
// TIER 1: Core Controls (Full Documentation with Examples)
// =============================================================================

const coreControlsHelp: Record<string, HelpContent> = {
  knob: {
    title: 'Knob Element',
    description: 'A rotary control for continuous parameters like gain, frequency, or time values. Rotates from minimum (bottom-left) to maximum (top-right).',
    examples: [
      {
        label: 'Basic Usage',
        explanation: 'Drag from palette, position on canvas. Set min/max values and default position in Properties. Bind to JUCE parameter via Parameter ID.'
      },
      {
        label: 'Custom Appearance',
        explanation: 'Change colors for indicator, track, and fill. Use SVG export to create custom graphics in vector tools, then import back for validation.'
      },
      {
        label: 'Parameter Binding',
        explanation: 'Set Parameter ID to match your JUCE AudioParameter. At runtime, the knob automatically reflects and controls the parameter value.'
      }
    ],
    relatedTopics: [
      'Use SteppedKnob for discrete values with detents',
      'Use CenterDetentKnob for bipolar parameters',
      'Use SVG export for custom control graphics'
    ]
  },

  slider: {
    title: 'Slider Element',
    description: 'A linear control for continuous parameters. Can be horizontal or vertical. Ideal for volume faders, mix amounts, or any ranged value.',
    examples: [
      {
        label: 'Basic Usage',
        explanation: 'Drag from palette to canvas. Set orientation in Properties (horizontal/vertical). Configure min, max, and default values.'
      },
      {
        label: 'Fader Style',
        explanation: 'For mixer-style faders, use vertical orientation with a tall, narrow size. Add a label above for channel identification.'
      },
      {
        label: 'With Value Display',
        explanation: 'Place a NumericDisplay below the slider and bind both to the same Parameter ID. The display shows the current value as the slider moves.'
      }
    ],
    relatedTopics: [
      'Use BipolarSlider for -1 to +1 range with center detent',
      'Use RangeSlider for selecting a value range',
      'Combine with Label for parameter identification'
    ]
  },

  button: {
    title: 'Button Element',
    description: 'A clickable control for triggering actions or toggling states. Can be momentary (action on click) or toggle (switches between on/off).',
    examples: [
      {
        label: 'Momentary Button',
        explanation: 'Use for one-shot actions like triggering samples, resetting values, or opening dialogs. Configure label text and colors in Properties.'
      },
      {
        label: 'Toggle Button',
        explanation: 'Enable toggle mode for on/off states like bypass, mute, or solo. Set distinct colors for on and off states.'
      },
      {
        label: 'Window Navigation',
        explanation: 'Set the Navigate To property to switch windows when clicked. Perfect for Settings, About, or sub-panel buttons in multi-window plugins.'
      }
    ],
    relatedTopics: [
      'Use IconButton for graphic-only buttons',
      'Use PowerButton for bypass/enable controls',
      'Use SegmentButton for mutually exclusive options'
    ]
  },

  label: {
    title: 'Label Element',
    description: 'A text display element for static information like parameter names, section headers, or instructions. Does not interact with parameters.',
    examples: [
      {
        label: 'Parameter Labels',
        explanation: 'Place above or beside controls to identify them. Set font size and weight to match your UI design language.'
      },
      {
        label: 'Section Headers',
        explanation: 'Use larger, bolder text to create visual sections. Combine with Panel or Frame to group related controls.'
      },
      {
        label: 'Styling',
        explanation: 'Adjust font family, size, weight, and color in Properties. Use text alignment to match layout (left for labels, center for headers).'
      }
    ],
    relatedTopics: [
      'Use NumericDisplay to show parameter values',
      'Group related controls with GroupBox',
      'Frame adds a border around content areas'
    ]
  },

  meter: {
    title: 'Meter Element',
    description: 'A visual level indicator for audio signals. Shows real-time amplitude with configurable range, colors, and peak hold.',
    examples: [
      {
        label: 'Basic Level Meter',
        explanation: 'Drag to canvas and bind to a level parameter. Configure dB range (typically -60 to 0 or +6). Set colors for normal, warning, and clip zones.'
      },
      {
        label: 'Stereo Pair',
        explanation: 'Place two meters side-by-side for stereo signals. Bind left and right channels to separate parameters. Use consistent sizing.'
      },
      {
        label: 'Peak Hold',
        explanation: 'Enable peak indicators to show maximum levels. Configure hold time and decay rate for professional metering behavior.'
      }
    ],
    relatedTopics: [
      'Use VUMeter for vintage-style metering',
      'Use PPM meters for broadcast standards',
      'Use LUFS meters for loudness compliance'
    ]
  },

  image: {
    title: 'Image Element',
    description: 'Displays an image file (PNG, JPG, SVG) on the canvas. Use for logos, backgrounds, custom graphics, or decorative elements.',
    examples: [
      {
        label: 'Logo Placement',
        explanation: 'Import your plugin logo as PNG or SVG. Position in corner or header area. Use transparent background for overlay on panels.'
      },
      {
        label: 'Background Graphics',
        explanation: 'Create textured backgrounds in image editors. Import as full-canvas image. Send to back (Layers panel) so controls appear above.'
      },
      {
        label: 'SVG Graphics',
        explanation: 'SVG files scale without quality loss. Ideal for icons and UI graphics. Export elements as SVG to edit in vector tools.'
      }
    ],
    relatedTopics: [
      'Use SVGGraphic for scalable vector images',
      'Place decorative elements in Panels',
      'Lock position in Layers to prevent accidental moves'
    ]
  }
}

// =============================================================================
// TIER 1: Containers (Full Documentation with Examples)
// =============================================================================

const containersHelp: Record<string, HelpContent> = {
  panel: {
    title: 'Panel Element',
    description: 'A container element for grouping related controls. Provides visual separation with background color and optional border. Child elements move and resize with the panel.',
    examples: [
      {
        label: 'Creating Sections',
        explanation: 'Use panels to organize your UI into logical sections (e.g., EQ, Compressor, Output). Drag controls onto the panel to make them children.'
      },
      {
        label: 'Nested Layouts',
        explanation: 'Panels can contain other panels for complex layouts. Create a main panel with sub-panels for each control group.'
      },
      {
        label: 'Styling',
        explanation: 'Set background color for visual separation. Add border radius for rounded corners. Use subtle colors to avoid distracting from controls.'
      }
    ],
    relatedTopics: [
      'Use GroupBox for titled sections',
      'Use Frame for minimal border-only grouping',
      'Use Collapsible for expandable sections'
    ]
  },

  frame: {
    title: 'Frame Element',
    description: 'A lightweight container with a border but no background fill. Use to visually group controls while maintaining the parent background.',
    examples: [
      {
        label: 'Minimal Grouping',
        explanation: 'When you want a visual boundary without solid color. Drag controls inside the frame to group them.'
      },
      {
        label: 'Border Styles',
        explanation: 'Configure border width and color in Properties. Use rounded corners for softer appearance. Match your overall design language.'
      },
      {
        label: 'With Labels',
        explanation: 'Place a Label above or inside the frame to identify the group. Position label to overlap frame border for traditional look.'
      }
    ],
    relatedTopics: [
      'Panel provides background color',
      'GroupBox adds integrated title',
      'Use for inset display areas'
    ]
  },

  groupbox: {
    title: 'GroupBox Element',
    description: 'A container with an integrated title label. Perfect for organizing related controls under a descriptive header.',
    examples: [
      {
        label: 'Titled Sections',
        explanation: 'Set the title property to name the section (e.g., "Filter", "Envelope", "Output"). The title appears in the border.'
      },
      {
        label: 'Organizing Parameters',
        explanation: 'Group all controls for a single feature (knobs, buttons, displays) inside one GroupBox. Users immediately understand what controls are related.'
      },
      {
        label: 'Styling',
        explanation: 'Customize title font and border appearance. Title position can be adjusted. Match colors to your design theme.'
      }
    ],
    relatedTopics: [
      'Panel for untitled grouping',
      'Collapsible for expandable sections',
      'Nest GroupBoxes for sub-categories'
    ]
  },

  collapsible: {
    title: 'Collapsible Element',
    description: 'An expandable/collapsible container with a clickable header. Users can show or hide the content to save space.',
    examples: [
      {
        label: 'Advanced Settings',
        explanation: 'Place rarely-used controls in a Collapsible. Label it "Advanced" or "More Options". Keeps main UI clean while providing access.'
      },
      {
        label: 'Modulation Sections',
        explanation: 'Group modulation controls (LFO, Envelope) in collapsibles. Users expand only what they are working with.'
      },
      {
        label: 'Default State',
        explanation: 'Set expanded property to control initial state. Usually collapsed for advanced options, expanded for frequently-used sections.'
      }
    ],
    relatedTopics: [
      'GroupBox for always-visible titled sections',
      'Panel for basic grouping',
      'Use clear header text for discoverability'
    ]
  }
}

// =============================================================================
// TIER 1: Displays (Full Documentation with Examples)
// =============================================================================

const displaysHelp: Record<string, HelpContent> = {
  numericdisplay: {
    title: 'Numeric Display Element',
    description: 'Shows a parameter value as formatted text. Updates in real-time as the parameter changes. Configurable precision, units, and styling.',
    examples: [
      {
        label: 'Value Readout',
        explanation: 'Place next to a knob or slider to show exact value. Bind to same Parameter ID. Set decimal places appropriate for the parameter type.'
      },
      {
        label: 'With Units',
        explanation: 'Configure suffix property for units (Hz, dB, ms, %). The display automatically appends units to the value.'
      },
      {
        label: 'Editable Values',
        explanation: 'Enable editing to allow direct value entry. Users click to type exact values instead of dragging controls.'
      }
    ],
    relatedTopics: [
      'Use dBDisplay for decibel values with proper formatting',
      'Use TimeDisplay for time values (ms, s)',
      'Use PercentageDisplay for 0-100% values'
    ]
  }
}

// =============================================================================
// TIER 2: Knob Variants
// =============================================================================

const knobVariantsHelp: Record<string, HelpContent> = {
  steppedknob: {
    title: 'Stepped Knob Element',
    description: 'A rotary control that snaps to discrete positions. Ideal for selecting from a fixed set of values like waveform types or algorithm modes.',
    examples: [
      {
        label: 'Waveform Selector',
        explanation: 'Set steps to 4 for Sine/Square/Saw/Triangle selection. Each position maps to a distinct waveform. Add labels around the knob showing waveform names or icons.'
      },
      {
        label: 'Algorithm Mode',
        explanation: 'Use for selecting between synthesis algorithms or effect modes. Set steps to match the number of options. Bind to a choice parameter in JUCE.'
      },
      {
        label: 'Octave Switch',
        explanation: 'Configure with steps for -2, -1, 0, +1, +2 octave offsets. Each detent position represents a musical octave shift.'
      }
    ],
    relatedTopics: [
      'Use regular Knob for continuous values',
      'Set step count to match number of options',
      'Combine with labels showing step values'
    ]
  },

  centerdetentknob: {
    title: 'Center Detent Knob Element',
    description: 'A rotary control with a physical-feeling center detent at the midpoint. Perfect for bipolar parameters like pan, stereo width, or EQ gain.',
    examples: [
      {
        label: 'Pan Control',
        explanation: 'Center position represents center pan (0). Rotate left for L, right for R. The detent provides tactile feedback at the center position for easy reset.'
      },
      {
        label: 'EQ Gain',
        explanation: 'Use for boost/cut EQ bands. Center is 0 dB (no change). Rotate for boost (+dB) or cut (-dB). Visual indicator shows deviation from center.'
      },
      {
        label: 'Stereo Width',
        explanation: 'Center represents normal stereo (100%). Left narrows to mono, right widens beyond stereo. The detent helps return to natural stereo width.'
      }
    ],
    relatedTopics: [
      'Use for parameters with meaningful center (0, unity, center)',
      'BipolarSlider offers linear alternative',
      'Visual indicator shows center position'
    ]
  },

  dotindicatorknob: {
    title: 'Dot Indicator Knob Element',
    description: 'A knob variant with discrete dot indicators around the perimeter showing the current position. Provides visual reference points.',
    examples: [
      {
        label: 'Clock Position Reference',
        explanation: 'Dots mark positions like a clock face (12 dots for hours). Useful for parameters where users think in clock positions like "set to 2 o\'clock".'
      },
      {
        label: 'Preset Positions',
        explanation: 'Place dots at common/useful values. For a drive control, dots might mark subtle, moderate, and aggressive settings.'
      },
      {
        label: 'Step Indicators',
        explanation: 'Combine with a continuous parameter to show recommended positions. Users can set between dots for fine-tuning but have visual reference points.'
      }
    ],
    relatedTopics: [
      'Use for parameters where specific positions matter',
      'Dots can indicate common values or detents',
      'Combine with value display for precision'
    ]
  }
}

// =============================================================================
// TIER 2: Slider Variants
// =============================================================================

const sliderVariantsHelp: Record<string, HelpContent> = {
  bipolarslider: {
    title: 'Bipolar Slider Element',
    description: 'A slider centered at zero with positive and negative ranges. Visual center line marks the neutral position. Ideal for pan, balance, or gain offset.',
    examples: [
      {
        label: 'Pan Control',
        explanation: 'Center position is mono/center. Drag left for L panning, right for R panning. The fill visually shows which direction and how far from center.'
      },
      {
        label: 'Pitch Offset',
        explanation: 'Use for pitch bend or detune controls. Center is no pitch change. Negative values lower pitch, positive raise it. Common range: -12 to +12 semitones.'
      },
      {
        label: 'Gain Trim',
        explanation: 'For fine gain adjustments around unity. Center represents 0 dB (no change). Range might be -6 dB to +6 dB for subtle level matching.'
      }
    ],
    relatedTopics: [
      'Use CenterDetentKnob for rotary equivalent',
      'Fill color shows deviation from center',
      'Snap to center option for precise zero'
    ]
  },

  crossfadeslider: {
    title: 'Crossfade Slider Element',
    description: 'A dual-sided slider for mixing between two signals. Moving left increases A, moving right increases B. Perfect for A/B mixing or wet/dry blend.',
    examples: [
      {
        label: 'Wet/Dry Mix',
        explanation: 'Label A as "Dry" and B as "Wet". Full left is 100% dry signal, full right is 100% wet effect. Center is 50/50 blend.'
      },
      {
        label: 'Parallel Processing',
        explanation: 'Mix between original and processed signal. Full left = unprocessed, full right = fully processed. Useful for parallel compression or saturation.'
      },
      {
        label: 'Oscillator Mix',
        explanation: 'Blend between two oscillators. Full left = OSC A only, full right = OSC B only. Center combines both equally.'
      }
    ],
    relatedTopics: [
      'Label ends with A and B sources',
      'Center position is equal mix',
      'Use for parallel processing blend'
    ]
  },

  notchedslider: {
    title: 'Notched Slider Element',
    description: 'A slider with visual notches at specific positions. The thumb may snap to notches for commonly-used values.',
    examples: [
      {
        label: 'Preset Levels',
        explanation: 'Add notches at common values like 25%, 50%, 75%, 100%. Users can quickly hit these values while still having continuous control between.'
      },
      {
        label: 'Musical Divisions',
        explanation: 'For timing parameters, notches at musical values (1/4, 1/8, 1/16 notes). Helps users dial in rhythmically meaningful values.'
      },
      {
        label: 'dB Increments',
        explanation: 'For volume controls, notches at -6 dB, -12 dB, -18 dB, etc. Provides quick access to standard gain staging values.'
      }
    ],
    relatedTopics: [
      'Use for parameters with meaningful presets',
      'Notches provide visual reference points',
      'Combine with value display'
    ]
  },

  arcslider: {
    title: 'Arc Slider Element',
    description: 'A curved slider following an arc path. Provides a different interaction feel than linear sliders. Useful for specialized interfaces.',
    examples: [
      {
        label: 'Circular Interface',
        explanation: 'Place around a central display or control. The arc shape integrates well with radial UI layouts. Good for synths with circular design language.'
      },
      {
        label: 'Semi-Circular Meter',
        explanation: 'Use as a semi-circular control with integrated level display. The arc visually shows the range from min to max along the curve.'
      },
      {
        label: 'Vintage Style',
        explanation: 'Emulate vintage hardware with arc-shaped controls. Common in classic synthesizer and mixing console designs.'
      }
    ],
    relatedTopics: [
      'Use for visual variety in design',
      'Arc angle configurable in properties',
      'Knob offers similar rotary feel'
    ]
  },

  multislider: {
    title: 'Multi Slider Element',
    description: 'Multiple parallel sliders in a single element. Ideal for multi-band controls, graphic EQ, or any array of related parameters.',
    examples: [
      {
        label: 'Graphic EQ',
        explanation: 'Set bands to 10 or 31 for standard graphic EQ. Each slider controls one frequency band. Provides immediate visual feedback of the EQ curve.'
      },
      {
        label: 'Multiband Dynamics',
        explanation: 'Use 3-5 bands for multiband compressor thresholds or ratios. Each band controls its frequency range independently.'
      },
      {
        label: 'Harmonic Levels',
        explanation: 'Control levels of individual harmonics in additive synthesis. Each slider represents one harmonic partial (fundamental, 2nd, 3rd, etc.).'
      }
    ],
    relatedTopics: [
      'Configure number of bands/sliders',
      'Each slider maps to separate parameter',
      'Use for EQ, multiband dynamics'
    ]
  },

  rangeslider: {
    title: 'Range Slider Element',
    description: 'A dual-handle slider for selecting a range of values (min and max). The two handles define the range boundaries.',
    examples: [
      {
        label: 'Frequency Range',
        explanation: 'Select a frequency band for filtering or analysis. Low handle sets the low cutoff, high handle sets the high cutoff. Useful for bandpass filter controls.'
      },
      {
        label: 'Velocity Range',
        explanation: 'Define MIDI velocity response range. Set minimum and maximum velocities that trigger the sound. Notes outside the range are ignored.'
      },
      {
        label: 'Random Range',
        explanation: 'Set bounds for randomization. The random value will always fall between the two handles. Good for controlled variation in parameters.'
      }
    ],
    relatedTopics: [
      'Use for frequency ranges, time windows',
      'Handles cannot cross each other',
      'Fill shows selected range'
    ]
  }
}

// =============================================================================
// TIER 2: Buttons & Switches
// =============================================================================

const buttonsHelp: Record<string, HelpContent> = {
  iconbutton: {
    title: 'Icon Button Element',
    description: 'A button displaying only an icon/graphic without text label. Compact design for toolbars or when the icon meaning is universal.',
    examples: [
      {
        label: 'Toolbar Actions',
        explanation: 'Use for play/stop/record buttons, copy/paste, or undo/redo. Icons are universally understood, no text needed. Keep buttons same size for alignment.'
      },
      {
        label: 'Navigation',
        explanation: 'Use arrow icons for prev/next navigation in preset browsers. Home icon for returning to main view. Menu icon (hamburger) for opening side panels.'
      },
      {
        label: 'With Tooltip',
        explanation: 'Always add a tooltip describing the action, especially for less common icons. The tooltip appears on hover, maintaining clean UI while providing clarity.'
      }
    ],
    relatedTopics: [
      'Set icon via image property',
      'Use SVG for scalable icons',
      'Add tooltip for accessibility'
    ]
  },

  toggleswitch: {
    title: 'Toggle Switch Element',
    description: 'A physical-style toggle switch for on/off states. More tactile appearance than standard toggle button.',
    examples: [
      {
        label: 'Feature Enable',
        explanation: 'Use for enabling/disabling features like "High Quality Mode", "Oversampling", or "Key Follow". The physical appearance makes the on/off state immediately clear.'
      },
      {
        label: 'A/B Selection',
        explanation: 'Position labels on either side (e.g., "Mono" / "Stereo"). The switch position visually indicates which option is active.'
      },
      {
        label: 'Hardware Emulation',
        explanation: 'Match physical hardware controls in emulations. Toggle switches feel authentic for vintage gear recreations.'
      }
    ],
    relatedTopics: [
      'Use for clear binary choices',
      'Horizontal or vertical orientation',
      'Labels for on/off states'
    ]
  },

  powerbutton: {
    title: 'Power Button Element',
    description: 'A styled power/bypass button typically used for enabling/disabling entire effect sections. Universal power icon styling.',
    examples: [
      {
        label: 'Effect Bypass',
        explanation: 'Place in section header to enable/disable the entire effect. Green lit = active, gray = bypassed. Users expect this control in the top-left or top-right of each section.'
      },
      {
        label: 'Module Enable',
        explanation: 'In modular synth UIs, use to enable/disable individual modules (oscillators, filters, envelopes). Helps reduce CPU when modules are not needed.'
      },
      {
        label: 'Master Power',
        explanation: 'A main power button can enable/disable the entire plugin processing. Useful for A/B comparison against the unprocessed signal.'
      }
    ],
    relatedTopics: [
      'Standard for bypass controls',
      'Place prominently in section headers',
      'Green on, gray off convention'
    ]
  },

  rockerswitch: {
    title: 'Rocker Switch Element',
    description: 'A physical-style rocker switch that tilts between two positions. Provides clear visual state indication.',
    examples: [
      {
        label: 'Mode Selection',
        explanation: 'Use for two-choice selections like "Mono/Stereo", "Pre/Post", or "Internal/External". The physical tilt makes the current selection very obvious.'
      },
      {
        label: 'Polarity Switch',
        explanation: 'For phase/polarity inversion. Label one side "+" and other "-". The rocker style matches physical studio gear conventions.'
      },
      {
        label: 'Filter Type',
        explanation: 'Quick switch between two filter types (e.g., "LP/HP" for lowpass/highpass). Faster than a dropdown for simple binary choices.'
      }
    ],
    relatedTopics: [
      'Use for permanent settings',
      'Clear on/off visual feedback',
      'Alternative to toggle switch'
    ]
  },

  rotaryswitch: {
    title: 'Rotary Switch Element',
    description: 'A multi-position rotary selector switch. Click to cycle through positions or drag to select. For selecting from multiple options.',
    examples: [
      {
        label: 'Waveform Selection',
        explanation: 'Each position selects a waveform (Sine, Saw, Square, etc.). Position indicators show all options. More visual than a dropdown.'
      },
      {
        label: 'Filter Slope',
        explanation: 'Select filter slope: 12 dB/oct, 24 dB/oct, 48 dB/oct. The rotary style suits "switch" parameters that aren\'t continuous.'
      },
      {
        label: 'Input Source',
        explanation: 'Select between input sources (Input 1, Input 2, Sidechain, etc.). The hardware-like appearance is familiar to audio engineers.'
      }
    ],
    relatedTopics: [
      'Use for mode/algorithm selection',
      'Alternative to dropdown',
      'Visual position indicator'
    ]
  },

  segmentbutton: {
    title: 'Segment Button Element',
    description: 'A segmented control where only one segment can be selected at a time. Like radio buttons but in a compact bar format.',
    examples: [
      {
        label: 'View Mode',
        explanation: 'Switch between views: "Waveform | Spectrum | Both". Only one can be active. Segments highlight to show current selection.'
      },
      {
        label: 'Time Division',
        explanation: 'Select note values: "1/4 | 1/8 | 1/16 | 1/32". Common for delay/LFO sync settings. Compact and scannable.'
      },
      {
        label: 'Filter Type',
        explanation: 'Choose filter type: "LP | BP | HP | Notch". All options visible at once, making it faster than a dropdown for small option sets.'
      }
    ],
    relatedTopics: [
      'Use for mutually exclusive options',
      'Horizontal or vertical layout',
      'Alternative to dropdown for few options'
    ]
  }
}

// =============================================================================
// TIER 2: Value Displays
// =============================================================================

const valueDisplaysHelp: Record<string, HelpContent> = {
  timedisplay: {
    title: 'Time Display Element',
    description: 'Shows time values with appropriate units (ms, s, min). Automatically formats based on value magnitude.',
    examples: [
      {
        label: 'Attack/Release Times',
        explanation: 'Display envelope times with auto-formatting: values under 1 second show as "250 ms", larger values as "1.5 s". Bind to attack, decay, release parameters.'
      },
      {
        label: 'Delay Time',
        explanation: 'Show delay times in milliseconds or synced note values. For tempo-synced delays, can display both ms and musical notation.'
      },
      {
        label: 'Lookahead Display',
        explanation: 'For limiters and compressors with lookahead. Typically ranges from 0 to 20 ms. Helps users understand latency trade-offs.'
      }
    ],
    relatedTopics: [
      'Use for delay, attack, release times',
      'Auto-formats ms/s based on range',
      'Bind to time-based parameters'
    ]
  },

  percentagedisplay: {
    title: 'Percentage Display Element',
    description: 'Shows values as percentages (0-100%). Includes % symbol. Perfect for mix, ratio, or saturation amounts.',
    examples: [
      {
        label: 'Mix/Blend Amount',
        explanation: 'Show wet/dry mix as percentage. 0% = fully dry, 100% = fully wet. Natural format for blend controls that users understand intuitively.'
      },
      {
        label: 'Drive/Saturation',
        explanation: 'Display saturation amount as percentage. Clearer than abstract 0-10 scales. Users can easily communicate settings ("set drive to 75%").'
      },
      {
        label: 'Modulation Depth',
        explanation: 'Show how much a modulation source affects a destination. 0% = no modulation, 100% = full range. Negative percentages for inverted modulation.'
      }
    ],
    relatedTopics: [
      'Use for wet/dry mix display',
      'Automatic % suffix',
      'Bind to normalized parameters'
    ]
  },

  ratiodisplay: {
    title: 'Ratio Display Element',
    description: 'Shows compressor-style ratios (e.g., 4:1, inf:1). Standard format for dynamics processor settings.',
    examples: [
      {
        label: 'Compressor Ratio',
        explanation: 'Display classic ratio format: 2:1 for gentle compression, 4:1 for moderate, 10:1+ for heavy. Infinity symbol (∞:1) indicates limiting.'
      },
      {
        label: 'Expander Ratio',
        explanation: 'For expanders/gates, show expansion ratios like 1:2, 1:4. The inverted format indicates signal reduction below threshold.'
      },
      {
        label: 'With Knee Display',
        explanation: 'Pair with knee control to show complete dynamics behavior. Ratio shows "what" happens, knee shows "how" the transition occurs.'
      }
    ],
    relatedTopics: [
      'Use for compressor/gate ratios',
      'Shows infinity symbol for limiting',
      'Pair with compressor controls'
    ]
  },

  notedisplay: {
    title: 'Note Display Element',
    description: 'Shows MIDI note values as musical note names (C4, F#3). Converts between note number and musical notation.',
    examples: [
      {
        label: 'Root Note Selection',
        explanation: 'Display the selected root note for scales or arpeggios. MIDI note 60 shows as "C4". Musicians think in note names, not numbers.'
      },
      {
        label: 'Key Tracking',
        explanation: 'Show the current note being tracked. Useful for pitch followers, autotune displays, or MIDI monitor readouts.'
      },
      {
        label: 'Frequency to Note',
        explanation: 'Convert frequencies to nearest note. A 440 Hz tone displays as "A4". Helps musicians relate Hz values to musical pitch.'
      }
    ],
    relatedTopics: [
      'Use for root note, key selection',
      'Shows sharps/flats appropriately',
      'Octave number included'
    ]
  },

  bpmdisplay: {
    title: 'BPM Display Element',
    description: 'Shows tempo values in beats per minute. Typically includes decimal precision and BPM label.',
    examples: [
      {
        label: 'Tempo Readout',
        explanation: 'Display DAW tempo or internal clock speed. Range typically 40-200 BPM. One decimal place (120.0 BPM) provides enough precision.'
      },
      {
        label: 'LFO Rate',
        explanation: 'Show LFO speed in BPM when synced to tempo. Helps users set rhythmically meaningful modulation rates.'
      },
      {
        label: 'Tap Tempo Result',
        explanation: 'After tapping, display the detected tempo. Usually shows average of last 4 taps. Updates in real-time during tapping.'
      }
    ],
    relatedTopics: [
      'Use for tempo sync parameters',
      'Optional decimal places',
      'Combine with tap tempo button'
    ]
  },

  editabledisplay: {
    title: 'Editable Display Element',
    description: 'A numeric display that accepts direct text input. Click to edit, type value, press Enter to confirm.',
    examples: [
      {
        label: 'Precise Frequency',
        explanation: 'For EQ or filter cutoff, click to type exact frequency (e.g., "1000" for 1 kHz). More precise than dragging a knob for specific values.'
      },
      {
        label: 'Threshold Setting',
        explanation: 'Type exact dB value for compressor threshold. Professional users often know exact values they need (-18 dB, -6 dB, etc.).'
      },
      {
        label: 'With Increment Buttons',
        explanation: 'Combine with stepper buttons for hybrid control: type for exact values, click buttons for fine adjustment.'
      }
    ],
    relatedTopics: [
      'Alternative to slider for precise values',
      'Validation for min/max range',
      'Keyboard-friendly input'
    ]
  },

  multivaluedisplay: {
    title: 'Multi Value Display Element',
    description: 'Shows multiple related values in a single display. Useful for coordinates, ranges, or grouped readouts.',
    examples: [
      {
        label: 'XY Position',
        explanation: 'Show X and Y coordinates for XY pad controls. Format: "X: 0.5, Y: 0.8" or "50%, 80%". Compact readout for two-parameter controls.'
      },
      {
        label: 'Range Display',
        explanation: 'Show min and max of a range slider: "200 Hz - 8 kHz". Single display for two values that define a range.'
      },
      {
        label: 'ADSR Overview',
        explanation: 'Compact display of all envelope values: "A: 10ms D: 50ms S: 70% R: 200ms". Quick reference without needing four separate displays.'
      }
    ],
    relatedTopics: [
      'Use for X/Y coordinates',
      'Show range as min-max',
      'Compact multi-parameter readout'
    ]
  }
}

// =============================================================================
// TIER 2: Professional Meters
// =============================================================================

const professionalMetersHelp: Record<string, HelpContent> = {
  rmsmetermono: {
    title: 'RMS Meter (Mono) Element',
    description: 'Root Mean Square level meter for mono signals. Shows average signal level, more representative of perceived loudness than peak.',
    examples: [
      {
        label: 'Input Level Monitoring',
        explanation: 'Monitor incoming signal level. RMS shows perceived loudness better than peak. Target -18 to -12 dBFS RMS for healthy levels with headroom.'
      },
      {
        label: 'Compression Monitoring',
        explanation: 'Compare RMS before and after compression. Heavy compression brings RMS closer to peak levels. Helps visualize dynamic range reduction.'
      },
      {
        label: 'With Peak Meter',
        explanation: 'Pair RMS with peak meter for complete picture. Peak shows transients, RMS shows body. Large peak-to-RMS gap indicates dynamic material.'
      }
    ],
    relatedTopics: [
      'Use for loudness monitoring',
      'Often paired with peak meter',
      'Slower response than peak'
    ]
  },

  rmsmeterstereo: {
    title: 'RMS Meter (Stereo) Element',
    description: 'Dual RMS meters for stereo signals. Shows left and right channel average levels side by side.',
    examples: [
      {
        label: 'Stereo Balance Check',
        explanation: 'Compare left and right RMS levels. Matched levels indicate centered mix. Consistent imbalance suggests panning or stereo field issues.'
      },
      {
        label: 'Master Bus Metering',
        explanation: 'Monitor final stereo output level. Both channels should read similar for balanced masters. Target consistent RMS for streaming platforms.'
      },
      {
        label: 'Bus/Group Monitoring',
        explanation: 'Monitor submix levels (drums, vocals, etc.). Stereo buses benefit from seeing both channel levels to ensure proper balance.'
      }
    ],
    relatedTopics: [
      'Use for stereo loudness monitoring',
      'Reveals channel imbalance',
      'Standard stereo metering layout'
    ]
  },

  vumetermono: {
    title: 'VU Meter (Mono) Element',
    description: 'Classic analog-style Volume Unit meter for mono signals. Standardized 300ms integration time, -20 to +3 VU range.',
    examples: [
      {
        label: 'Analog Gain Staging',
        explanation: 'Target 0 VU for optimal signal level, matching analog equipment reference. The 300ms ballistics smooth out transients for readable average level.'
      },
      {
        label: 'Vintage Plugin UI',
        explanation: 'Essential for tape machine, console, and vintage gear emulations. The classic needle movement feels authentic and is comfortable for experienced engineers.'
      },
      {
        label: 'Recording Level',
        explanation: 'Monitor recording input levels. VU meters helped engineers hit tape saturation sweet spots. 0 VU typically corresponds to -18 dBFS.'
      }
    ],
    relatedTopics: [
      'Classic studio metering style',
      'Use for vintage aesthetic',
      '0 VU = reference level'
    ]
  },

  vumeterstereo: {
    title: 'VU Meter (Stereo) Element',
    description: 'Dual VU meters for stereo signals with classic analog appearance. Traditional mixing console aesthetic.',
    examples: [
      {
        label: 'Console Emulation',
        explanation: 'Recreate classic mixing console look with paired VU meters. Position side by side for authentic appearance. Needles should move together on centered material.'
      },
      {
        label: 'Master Section',
        explanation: 'Traditional master section metering. Both needles hitting 0 VU indicates proper output level. Red zone (+3 VU) warns of potential overload.'
      },
      {
        label: 'Stereo Bus Insert',
        explanation: 'Monitor stereo processing (compression, EQ, tape saturation). VU meters show how processing affects average level and stereo balance.'
      }
    ],
    relatedTopics: [
      'Console-style metering',
      'Vintage recording aesthetic',
      'Pair for stereo monitoring'
    ]
  },

  ppmtype1mono: {
    title: 'PPM Type I Meter (Mono) Element',
    description: 'Peak Programme Meter Type I (BBC standard) for mono signals. Fast attack, slow decay, -12 to +12 scale.',
    relatedTopics: [
      'BBC broadcast standard',
      'Different scale than VU',
      'Use for broadcast monitoring'
    ]
  },

  ppmtype1stereo: {
    title: 'PPM Type I Meter (Stereo) Element',
    description: 'Dual Peak Programme Meters Type I for stereo broadcast monitoring.',
    relatedTopics: [
      'Stereo broadcast metering',
      'BBC standard implementation',
      'Professional broadcast use'
    ]
  },

  ppmtype2mono: {
    title: 'PPM Type II Meter (Mono) Element',
    description: 'Peak Programme Meter Type II (DIN/EBU standard) for mono signals. European broadcast standard with different scale.',
    relatedTopics: [
      'DIN/EBU broadcast standard',
      'European standard metering',
      'Alternative to Type I'
    ]
  },

  ppmtype2stereo: {
    title: 'PPM Type II Meter (Stereo) Element',
    description: 'Dual Peak Programme Meters Type II for European stereo broadcast monitoring.',
    relatedTopics: [
      'European stereo metering',
      'DIN/EBU compliance',
      'Professional broadcast use'
    ]
  },

  truepeakmetermono: {
    title: 'True Peak Meter (Mono) Element',
    description: 'Measures inter-sample peaks for mono signals. Essential for preventing clipping in digital-to-analog conversion.',
    relatedTopics: [
      'Required for streaming delivery',
      'Shows inter-sample overs',
      'ITU-R BS.1770 standard'
    ]
  },

  truepeakmeterstereo: {
    title: 'True Peak Meter (Stereo) Element',
    description: 'Dual true peak meters for stereo signals. Measures inter-sample peaks on both channels.',
    relatedTopics: [
      'Stereo true peak monitoring',
      'Essential for mastering',
      'Digital delivery standard'
    ]
  },

  lufsmomomo: {
    title: 'LUFS Momentary Meter (Mono) Element',
    description: 'Loudness Units Full Scale momentary meter for mono. 400ms integration window for real-time loudness.',
    relatedTopics: [
      'Real-time loudness monitoring',
      'Fast-responding LUFS',
      'Use during mixing'
    ]
  },

  lufsmomostereo: {
    title: 'LUFS Momentary Meter (Stereo) Element',
    description: 'Stereo LUFS momentary meter with 400ms integration. Real-time loudness monitoring for stereo content.',
    relatedTopics: [
      'Stereo loudness monitoring',
      'Fast LUFS response',
      'Mixing reference'
    ]
  },

  lufsshortmono: {
    title: 'LUFS Short-term Meter (Mono) Element',
    description: 'LUFS short-term meter for mono signals. 3-second integration window for smoothed loudness reading.',
    relatedTopics: [
      'Smoothed loudness reading',
      '3-second averaging',
      'Less reactive than momentary'
    ]
  },

  lufsshortstereo: {
    title: 'LUFS Short-term Meter (Stereo) Element',
    description: 'Stereo LUFS short-term meter with 3-second integration. Smoothed loudness for stereo content.',
    relatedTopics: [
      'Stereo short-term loudness',
      'Section-level monitoring',
      'Standard for broadcast'
    ]
  },

  lufsintmono: {
    title: 'LUFS Integrated Meter (Mono) Element',
    description: 'Integrated loudness meter for mono signals. Measures average loudness from start to end of playback.',
    relatedTopics: [
      'Program loudness measurement',
      'Use for final mix level',
      'Target specific LUFS values'
    ]
  },

  lufsintstereo: {
    title: 'LUFS Integrated Meter (Stereo) Element',
    description: 'Stereo integrated loudness meter. Shows overall program loudness for the entire duration.',
    examples: [
      {
        label: 'Streaming Compliance',
        explanation: 'Target -14 LUFS for Spotify/YouTube, -16 LUFS for Apple Music. Integrated measurement runs from playback start to end for true program loudness.'
      },
      {
        label: 'Broadcast Delivery',
        explanation: 'Broadcast standards require specific LUFS targets (-24 LUFS for EBU R128). Integrated LUFS is the official measurement for compliance.'
      },
      {
        label: 'Album Consistency',
        explanation: 'Match integrated LUFS across tracks for consistent album loudness. Prevents jarring volume changes between songs.'
      }
    ],
    relatedTopics: [
      'Final loudness compliance',
      'Streaming target levels',
      'Master bus metering'
    ]
  },

  k12metermono: {
    title: 'K-12 Meter (Mono) Element',
    description: 'K-System meter with 12dB headroom for mono signals. Bob Katz metering standard for broadcast content.',
    relatedTopics: [
      'K-System metering',
      'Broadcast/streaming standard',
      '12dB headroom reference'
    ]
  },

  k12meterstereo: {
    title: 'K-12 Meter (Stereo) Element',
    description: 'Stereo K-12 meter for broadcast-oriented stereo mixing with 12dB headroom.',
    relatedTopics: [
      'Stereo K-System metering',
      'Broadcast mixing reference',
      'Industry standard'
    ]
  },

  k14metermono: {
    title: 'K-14 Meter (Mono) Element',
    description: 'K-System meter with 14dB headroom for mono signals. Suitable for acoustic and moderately dynamic music.',
    relatedTopics: [
      'Pop/rock mixing reference',
      '14dB dynamic range',
      'K-System standard'
    ]
  },

  k14meterstereo: {
    title: 'K-14 Meter (Stereo) Element',
    description: 'Stereo K-14 meter for mainstream music mixing with 14dB headroom.',
    relatedTopics: [
      'Standard music mixing',
      'Stereo metering reference',
      'Pop/rock production'
    ]
  },

  k20metermono: {
    title: 'K-20 Meter (Mono) Element',
    description: 'K-System meter with 20dB headroom for mono signals. Maximum dynamic range for classical and film.',
    relatedTopics: [
      'Film/classical reference',
      '20dB dynamic range',
      'Maximum headroom'
    ]
  },

  k20meterstereo: {
    title: 'K-20 Meter (Stereo) Element',
    description: 'Stereo K-20 meter for high dynamic range content like classical music and film scores.',
    relatedTopics: [
      'Orchestral/film mixing',
      'Maximum dynamic range',
      'High headroom standard'
    ]
  },

  correlationmeter: {
    title: 'Correlation Meter Element',
    description: 'Displays phase correlation between left and right channels. Shows +1 (mono compatible) to -1 (out of phase).',
    examples: [
      {
        label: 'Mono Compatibility Check',
        explanation: 'Readings near +1 are mono safe. Values dipping toward 0 or negative indicate potential phase cancellation when summed to mono. Critical for radio/club playback.'
      },
      {
        label: 'Stereo Width Analysis',
        explanation: 'Wider stereo = lower correlation. A reading around 0 indicates very wide stereo. Constantly negative readings suggest phase problems to investigate.'
      },
      {
        label: 'Processing Feedback',
        explanation: 'Monitor correlation while adding stereo widening effects. If correlation drops too low, reduce effect amount to maintain mono compatibility.'
      }
    ],
    relatedTopics: [
      'Use Goniometer for visual phase display',
      'Use Vectorscope for stereo field visualization',
      'Use StereoWidthMeter to monitor stereo spread'
    ]
  },

  stereowidthmeter: {
    title: 'Stereo Width Meter Element',
    description: 'Visualizes the stereo width of a signal. Shows how much stereo content vs mono content is present.',
    examples: [
      {
        label: 'Mix Width Overview',
        explanation: 'Monitor overall stereo spread of your mix. Center-heavy mixes show narrow width, wide mixes fill the meter. Compare against reference tracks.'
      },
      {
        label: 'Stereo Enhancement Feedback',
        explanation: 'Watch width meter while adjusting stereo widening tools. Set width enhancement to taste while avoiding over-widening artifacts.'
      },
      {
        label: 'Mid/Side Balance',
        explanation: 'High mid content = narrow meter, high side content = wide meter. Useful for understanding the mono vs stereo balance of your signal.'
      }
    ],
    relatedTopics: [
      'Use Goniometer for stereo image visualization',
      'Use CorrelationMeter to check phase compatibility',
      'Use Vectorscope for circular stereo display'
    ]
  },

  gainreductionmeter: {
    title: 'Gain Reduction Meter Element',
    description: 'Shows the amount of gain reduction applied by a compressor, limiter, or dynamics processor. Typically displays negative dB.',
    examples: [
      {
        label: 'Compression Monitoring',
        explanation: 'Shows how hard the compressor is working. -3 to -6 dB is moderate compression. More than -10 dB indicates heavy compression or limiting.'
      },
      {
        label: 'Limiter Ceiling',
        explanation: 'For limiters, shows how much gain is being removed to prevent clipping. Constant heavy reduction suggests the input is too hot.'
      },
      {
        label: 'Attack/Release Visualization',
        explanation: 'Watch how the meter responds to transients. Fast attack = quick needle movement. Slow release = gradual return. Helps visualize dynamics timing.'
      }
    ],
    relatedTopics: [
      'Use CompressorCurve to visualize compression settings',
      'Pair with RatioDisplay to show compression ratio',
      'Use dBDisplay for threshold readout'
    ]
  }
}

// =============================================================================
// TIER 2: Container Variants
// =============================================================================

const containerVariantsHelp: Record<string, HelpContent> = {
  tooltip: {
    title: 'Tooltip Element',
    description: 'A popup hint that appears when hovering over elements. Provides additional information without cluttering the UI.',
    relatedTopics: [
      'Use Label for visible static text',
      'Use IconButton with tooltip for compact controls',
      'Combine with Knob or Slider for value hints'
    ]
  },

  windowchrome: {
    title: 'Window Chrome Element',
    description: 'The decorative and functional frame around a plugin window. Includes title bar, close button, and resize handles.',
    relatedTopics: [
      'Use Panel for plugin background',
      'Use Label for window title text',
      'Use IconButton for close/minimize buttons'
    ]
  },

  horizontalspacer: {
    title: 'Horizontal Spacer Element',
    description: 'An invisible element that creates horizontal space in layouts. Pushes adjacent elements apart.',
    relatedTopics: [
      'Use VerticalSpacer for vertical spacing',
      'Use Panel for visible spacer with background',
      'Use Frame for bordered spacing'
    ]
  },

  verticalspacer: {
    title: 'Vertical Spacer Element',
    description: 'An invisible element that creates vertical space in layouts. Pushes adjacent elements apart vertically.',
    relatedTopics: [
      'Use HorizontalSpacer for horizontal spacing',
      'Use Panel for visible spacer with background',
      'Use Line for visible divider'
    ]
  }
}

// =============================================================================
// TIER 2: Form Controls
// =============================================================================

const formControlsHelp: Record<string, HelpContent> = {
  dropdown: {
    title: 'Dropdown Element',
    description: 'A collapsible list for selecting one option from many. Compact display that expands when clicked.',
    examples: [
      {
        label: 'Algorithm Selection',
        explanation: 'List available algorithms or modes. Dropdown shows current selection, click to see all options. Good for 5+ choices that would crowd the UI as buttons.'
      },
      {
        label: 'Preset Selection',
        explanation: 'Browse and select presets from a dropdown list. Can include categories and subcategories for organized preset management.'
      },
      {
        label: 'Filter Type',
        explanation: 'Select filter types (Lowpass, Highpass, Bandpass, etc.). Dropdown keeps interface clean while providing many options.'
      }
    ],
    relatedTopics: [
      'Use for many options (5+)',
      'Configure options list',
      'Alternative to rotary switch'
    ]
  },

  checkbox: {
    title: 'Checkbox Element',
    description: 'A toggleable box for binary options. Shows checked or unchecked state with optional label.',
    examples: [
      {
        label: 'Feature Toggle',
        explanation: 'Enable/disable features like "Key Follow", "Velocity Sensitivity", or "MIDI Learn". Label describes what checking enables.'
      },
      {
        label: 'Option Groups',
        explanation: 'Group related checkboxes for multiple independent options. Unlike radio groups, users can select multiple checkboxes.'
      },
      {
        label: 'Settings Panel',
        explanation: 'Ideal for settings and preferences pages. Each checkbox toggles one setting. Clear labels explain each option.'
      }
    ],
    relatedTopics: [
      'Use for enable/disable options',
      'Group related checkboxes',
      'Label text configurable'
    ]
  },

  radiogroup: {
    title: 'Radio Group Element',
    description: 'A set of mutually exclusive radio buttons. Only one option can be selected at a time.',
    examples: [
      {
        label: 'Quality Settings',
        explanation: 'Select quality level: Low / Medium / High / Ultra. Only one can be active. Radio buttons make exclusivity obvious.'
      },
      {
        label: 'Mode Selection',
        explanation: 'Choose operating mode when options are mutually exclusive. Each radio button labeled with its mode name and optional description.'
      },
      {
        label: 'With Descriptions',
        explanation: 'Add descriptive text below each option explaining what it does. More informative than a simple dropdown for important choices.'
      }
    ],
    relatedTopics: [
      'Use for exclusive choices',
      'Alternative to dropdown',
      'Clear visual selection'
    ]
  },

  textfield: {
    title: 'Text Field Element',
    description: 'A text input field for entering strings. Use for names, paths, or text-based parameters.',
    examples: [
      {
        label: 'Preset Name',
        explanation: 'Enter name when saving presets. Text field accepts keyboard input. Can include validation for allowed characters.'
      },
      {
        label: 'File Path',
        explanation: 'Enter or display file paths for samples, impulse responses, etc. Often paired with a browse button.'
      },
      {
        label: 'Custom Labels',
        explanation: 'Let users enter custom text for track names, annotations, or notes. Freeform text input where dropdowns aren\'t appropriate.'
      }
    ],
    relatedTopics: [
      'Use for preset names',
      'Validation available',
      'Configure placeholder text'
    ]
  },

  multiselectdropdown: {
    title: 'Multi-Select Dropdown Element',
    description: 'A dropdown allowing multiple selections. Shows checkmarks for selected items.',
    examples: [
      {
        label: 'Category Filter',
        explanation: 'Select multiple preset categories to browse. Shows checkmarks for selected categories. Header shows count like "3 selected".'
      },
      {
        label: 'Output Routing',
        explanation: 'Select multiple output destinations. A signal can route to several buses simultaneously. Multi-select shows all active routings.'
      },
      {
        label: 'Tag Selection',
        explanation: 'Choose multiple tags or attributes. More compact than showing all checkboxes. Good when there are many possible selections.'
      }
    ],
    relatedTopics: [
      'Use for multiple choices',
      'Shows selection count',
      'Alternative to checkbox group'
    ]
  },

  combobox: {
    title: 'Combo Box Element',
    description: 'Combines text input with dropdown selection. Users can type custom values or select from list.',
    examples: [
      {
        label: 'Preset with Custom',
        explanation: 'Select from preset values or type custom value. Dropdown shows common/preset values, but users can enter anything.'
      },
      {
        label: 'Searchable List',
        explanation: 'Type to filter long lists. Shows matching options as user types. Faster than scrolling through many options.'
      },
      {
        label: 'Recent Values',
        explanation: 'Dropdown shows recently-used values for quick access. User can still type new values that get added to history.'
      }
    ],
    relatedTopics: [
      'Use for preset with custom option',
      'Type or select',
      'Filterable options'
    ]
  },

  menubutton: {
    title: 'Menu Button Element',
    description: 'A button that opens a dropdown menu when clicked. Combines button action with menu selection.',
    examples: [
      {
        label: 'Action Menu',
        explanation: 'Button labeled "Edit" opens menu with Cut, Copy, Paste, Delete options. Compact way to offer multiple related actions.'
      },
      {
        label: 'Export Options',
        explanation: 'Export button opens menu with format choices (WAV, MP3, FLAC). Single button provides multiple export paths.'
      },
      {
        label: 'Preset Actions',
        explanation: 'Menu button for Save, Save As, Rename, Delete preset. Groups preset management actions under one button.'
      }
    ],
    relatedTopics: [
      'Use for action menus',
      'Configure menu items',
      'Icon or text trigger'
    ]
  }
}

// =============================================================================
// TIER 2: Navigation
// =============================================================================

const navigationHelp: Record<string, HelpContent> = {
  stepper: {
    title: 'Stepper Element',
    description: 'Increment/decrement buttons for numeric values. Plus and minus buttons to adjust value by fixed steps.',
    relatedTopics: [
      'Use NumericDisplay to show current value',
      'Use EditableDisplay for typed input',
      'Use Slider for continuous adjustment'
    ]
  },

  breadcrumb: {
    title: 'Breadcrumb Element',
    description: 'Navigation path showing current location in hierarchy. Clickable segments to navigate back.',
    relatedTopics: [
      'Use TreeView for full hierarchy view',
      'Use PresetBrowser for preset navigation',
      'Use Label for static path display'
    ]
  },

  tabbar: {
    title: 'Tab Bar Element',
    description: 'Horizontal tabs for switching between views or sections. Only one tab active at a time.',
    relatedTopics: [
      'Use SegmentButton for similar inline selection',
      'Use Panel for tab content containers',
      'Use Collapsible for expandable sections'
    ]
  },

  tagselector: {
    title: 'Tag Selector Element',
    description: 'Multi-select tag/chip interface for filtering or categorization. Toggle tags on/off.',
    relatedTopics: [
      'Use MultiSelectDropdown for compact multi-select',
      'Use PresetBrowser with tag filtering',
      'Use Checkbox for individual toggle options'
    ]
  },

  treeview: {
    title: 'Tree View Element',
    description: 'Hierarchical list with expandable/collapsible nodes. For navigating nested structures like preset banks.',
    relatedTopics: [
      'Use PresetBrowser for full preset management',
      'Use Breadcrumb for path display',
      'Use Dropdown for flat list selection'
    ]
  }
}

// =============================================================================
// TIER 2: Visualizations
// =============================================================================

const visualizationsHelp: Record<string, HelpContent> = {
  scrollingwaveform: {
    title: 'Scrolling Waveform Element',
    description: 'Real-time audio waveform display that scrolls horizontally. Shows recent audio history as it plays.',
    examples: [
      {
        label: 'Input Monitor',
        explanation: 'Display incoming audio as a continuous scrolling view. Users can see recent signal history and visually identify transients, noise, or dropouts.'
      },
      {
        label: 'Recording Preview',
        explanation: 'Show what\'s being recorded in real-time. Helps users monitor levels visually while recording. Waveform height indicates signal level.'
      },
      {
        label: 'Trigger/Gate Visualization',
        explanation: 'Visualize when gates or triggers are active. The waveform shows where transients occur and how the dynamics processor responds.'
      }
    ],
    relatedTopics: [
      'Use Oscilloscope for triggered waveform display',
      'Use SpectrumAnalyzer for frequency content',
      'Use Meter for level monitoring'
    ]
  },

  spectrumanalyzer: {
    title: 'Spectrum Analyzer Element',
    description: 'Real-time frequency spectrum display. Shows frequency content as bar graph or continuous line.',
    examples: [
      {
        label: 'EQ Visualization',
        explanation: 'Show frequency content while EQing. Identify problematic frequencies visually. Bar or line display shows energy distribution across the spectrum.'
      },
      {
        label: 'Frequency Comparison',
        explanation: 'Compare before/after processing. Many analyzers can overlay original and processed spectrums to visualize EQ changes.'
      },
      {
        label: 'Mixing Reference',
        explanation: 'Check mix balance across frequency ranges. Compare against reference tracks. Look for missing frequencies or excessive buildup.'
      }
    ],
    relatedTopics: [
      'Use Spectrogram for time-based frequency view',
      'Use EQCurve to display filter response',
      'Use FilterResponse for filter visualization'
    ]
  },

  spectrogram: {
    title: 'Spectrogram Element',
    description: 'Time vs frequency display with color-coded amplitude. Shows frequency evolution over time.',
    examples: [
      {
        label: 'Detailed Frequency Analysis',
        explanation: 'See how frequencies change over time. Vertical axis is frequency, horizontal is time, color is amplitude. Great for identifying resonances and harmonics.'
      },
      {
        label: 'Noise Identification',
        explanation: 'Spot noise, hum, or interference as consistent horizontal lines. Clicks and pops appear as vertical lines. Essential for audio restoration.'
      },
      {
        label: 'Harmonic Structure',
        explanation: 'Visualize harmonic content of instruments. See fundamental and overtones clearly. Useful for sound design and synthesis analysis.'
      }
    ],
    relatedTopics: [
      'Use SpectrumAnalyzer for frequency bars display',
      'Use EQCurve for interactive frequency editing',
      'Use ScrollingWaveform for time-domain view'
    ]
  },

  goniometer: {
    title: 'Goniometer Element',
    description: 'Stereo phase/balance visualization. Shows L/R relationship as Lissajous pattern.',
    examples: [
      {
        label: 'Phase Correlation',
        explanation: 'Vertical line = mono, diagonal line = stereo, horizontal line = phase issues. The shape reveals stereo width and mono compatibility at a glance.'
      },
      {
        label: 'Stereo Balance',
        explanation: 'Centered pattern = balanced mix, tilted pattern = panning bias. Monitor while mixing to maintain stereo balance.'
      },
      {
        label: 'Stereo Widening Feedback',
        explanation: 'Watch pattern expand when applying stereo widening. If pattern becomes too horizontal, you\'re risking phase problems.'
      }
    ],
    relatedTopics: [
      'Use Vectorscope for circular stereo display',
      'Use CorrelationMeter for numeric phase reading',
      'Use StereoWidthMeter for width monitoring'
    ]
  },

  vectorscope: {
    title: 'Vectorscope Element',
    description: 'Circular stereo field visualization. Shows stereo width and balance as vector display.',
    examples: [
      {
        label: 'Stereo Image',
        explanation: 'Dots near center = mono, dots spread out = stereo. Shows the stereo field as a circular display. M/S and L/R information visible.'
      },
      {
        label: 'Balance Monitoring',
        explanation: 'Pattern should be centered for balanced mixes. Consistent pull to one side indicates panning or gain imbalance.'
      },
      {
        label: 'Phase Problems',
        explanation: 'Pattern extending past the sides indicates out-of-phase content. Use to verify stereo processing isn\'t creating phase issues.'
      }
    ],
    relatedTopics: [
      'Use Goniometer for Lissajous pattern display',
      'Use CorrelationMeter for phase correlation',
      'Use StereoWidthMeter for width analysis'
    ]
  },

  waveform: {
    title: 'Waveform Element',
    description: 'Static waveform display for loaded audio files. Shows complete waveform overview.',
    examples: [
      {
        label: 'Sample Preview',
        explanation: 'Display loaded samples in samplers or drum machines. Shows waveform shape, helping users identify sounds visually.'
      },
      {
        label: 'Edit Point Selection',
        explanation: 'Use with markers to show loop points, slice markers, or crossfade regions. The waveform provides visual context for edit decisions.'
      },
      {
        label: 'Zoom Navigation',
        explanation: 'Zoom for detailed editing, zoom out for overview. Click and drag to scroll through longer files. Selection highlighting shows ranges.'
      }
    ],
    relatedTopics: [
      'Use SampleDisplay for editable sample view',
      'Use LoopPoints for loop region markers',
      'Use Oscilloscope for real-time waveform'
    ]
  },

  oscilloscope: {
    title: 'Oscilloscope Element',
    description: 'Real-time waveform display showing audio cycles. Triggered display for stable visualization.',
    examples: [
      {
        label: 'Waveform Shape',
        explanation: 'View the actual wave shape of your sound. See sine, square, saw, and complex waveforms clearly. Essential for synth sound design.'
      },
      {
        label: 'LFO Visualization',
        explanation: 'Display LFO waveform and rate. Users can see the modulation shape and speed. Useful for understanding modulation effects.'
      },
      {
        label: 'Distortion Analysis',
        explanation: 'Watch how distortion affects waveform shape. Clean sine becomes increasingly complex as distortion adds harmonics.'
      }
    ],
    relatedTopics: [
      'Use ScrollingWaveform for continuous display',
      'Use LFODisplay for modulation waveforms',
      'Use SpectrumAnalyzer for frequency content'
    ]
  }
}

// =============================================================================
// TIER 2: Curves
// =============================================================================

const curvesHelp: Record<string, HelpContent> = {
  eqcurve: {
    title: 'EQ Curve Element',
    description: 'Frequency response visualization for EQ settings. Shows filter shapes and overall response curve.',
    examples: [
      {
        label: 'Visual EQ Feedback',
        explanation: 'See the combined EQ curve as you adjust bands. Individual band shapes (bell, shelf, highpass) combine into overall response curve.'
      },
      {
        label: 'Interactive Editing',
        explanation: 'Click and drag nodes directly on the curve. Horizontal movement adjusts frequency, vertical adjusts gain. More intuitive than knob-only control.'
      },
      {
        label: 'Analyzer Overlay',
        explanation: 'Combine with spectrum analyzer for visual EQ matching. See the input spectrum behind the EQ curve to identify frequencies to adjust.'
      }
    ],
    relatedTopics: [
      'Use SpectrumAnalyzer for frequency analysis overlay',
      'Use FilterResponse for single filter visualization',
      'Combine with Knob controls for EQ bands'
    ]
  },

  compressorcurve: {
    title: 'Compressor Curve Element',
    description: 'Input/output transfer curve for dynamics processors. Shows threshold, ratio, knee as visual curve.',
    examples: [
      {
        label: 'Threshold Visualization',
        explanation: 'The knee point shows where compression begins. Signal below threshold follows 1:1 line (no compression). Above threshold, the curve flattens based on ratio.'
      },
      {
        label: 'Ratio Understanding',
        explanation: 'Steeper curve = higher ratio. 1:1 is diagonal line (no compression). As ratio increases toward limiting, the curve approaches horizontal.'
      },
      {
        label: 'Knee Type',
        explanation: 'Hard knee shows sharp angle at threshold. Soft knee shows gradual curve. Visual representation helps users understand compression character.'
      }
    ],
    relatedTopics: [
      'Use GainReductionMeter to show compression amount',
      'Use RatioDisplay for numeric ratio readout',
      'Use dBDisplay for threshold value'
    ]
  },

  envelopedisplay: {
    title: 'Envelope Display Element',
    description: 'ADSR or multi-stage envelope visualization. Shows envelope shape over time.',
    examples: [
      {
        label: 'ADSR Shape',
        explanation: 'See envelope shape at a glance. Attack slope, decay curve, sustain level, and release time all visible. Changes to controls update display in real-time.'
      },
      {
        label: 'Complex Envelopes',
        explanation: 'Multi-stage envelopes show all segments. Useful for complex modulation envelopes with hold, delay, or multiple decay stages.'
      },
      {
        label: 'Amplitude vs Modulation',
        explanation: 'For amp envelopes, the shape directly shows volume over time. For mod envelopes, shape shows how the modulation amount changes.'
      }
    ],
    relatedTopics: [
      'Use EnvelopeEditor for interactive envelope editing',
      'Use TimeDisplay for attack/release readouts',
      'Use Slider for envelope parameter controls'
    ]
  },

  lfodisplay: {
    title: 'LFO Display Element',
    description: 'Low-frequency oscillator waveform display. Shows LFO shape, rate, and modulation.',
    examples: [
      {
        label: 'Waveform Preview',
        explanation: 'See sine, triangle, saw, square, and random waveforms visually. Helps users understand what modulation shape they\'re applying.'
      },
      {
        label: 'Rate Visualization',
        explanation: 'Faster rates show more cycles in the display. Helps visualize the modulation speed and timing. Sync to tempo shows beat-aligned cycles.'
      },
      {
        label: 'Phase Position',
        explanation: 'Optional playhead or marker shows current position in cycle. Useful for understanding where the LFO is in real-time.'
      }
    ],
    relatedTopics: [
      'Use Oscilloscope to see LFO output',
      'Use BPMDisplay for tempo-synced rate',
      'Use SteppedKnob for waveform selection'
    ]
  },

  filterresponse: {
    title: 'Filter Response Element',
    description: 'Frequency response curve for filter settings. Shows cutoff, resonance, and filter slope.',
    examples: [
      {
        label: 'Filter Shape',
        explanation: 'See the filter cutoff point and slope visually. Lowpass rolls off highs, highpass rolls off lows. The steepness shows filter slope (12dB, 24dB, etc.).'
      },
      {
        label: 'Resonance Peak',
        explanation: 'Resonance appears as a peak at the cutoff frequency. Higher resonance = taller, narrower peak. Self-oscillation shows as extreme peak.'
      },
      {
        label: 'Filter Type Comparison',
        explanation: 'Switching filter types (LP/HP/BP/Notch) shows immediate visual change. Helps users understand the sonic difference between filter types.'
      }
    ],
    relatedTopics: [
      'Use EQCurve for multi-band EQ display',
      'Use FrequencyDisplay for cutoff readout',
      'Use Knob for cutoff and resonance controls'
    ]
  }
}

// =============================================================================
// TIER 2: Specialized Audio
// =============================================================================

const specializedAudioHelp: Record<string, HelpContent> = {
  pianokeyboard: {
    title: 'Piano Keyboard Element',
    description: 'Interactive piano keyboard for note input and display. Supports click/drag playing and MIDI visualization.',
    examples: [
      {
        label: 'Note Input',
        explanation: 'Click keys to trigger notes. Useful for testing sounds without external MIDI controller. Drag across keys for glissando effect.'
      },
      {
        label: 'MIDI Visualization',
        explanation: 'Incoming MIDI notes light up corresponding keys. Helps users see what notes are playing, useful for learning and debugging MIDI routing.'
      },
      {
        label: 'Range Selection',
        explanation: 'Configure visible octave range (2-7 octaves typical). Smaller keyboards save space, larger keyboards provide more range for playing.'
      }
    ],
    relatedTopics: [
      'Use NoteDisplay to show current note',
      'Use DrumPad for individual trigger pads',
      'Use StepSequencer for pattern programming'
    ]
  },

  drumpad: {
    title: 'Drum Pad Element',
    description: 'Single pressure-sensitive trigger pad. Typically used in groups for drum machine interfaces.',
    examples: [
      {
        label: 'Sample Trigger',
        explanation: 'Click to trigger assigned sample. Hold for sustaining sounds. Velocity sensitivity based on click position or mouse button.'
      },
      {
        label: 'Visual Feedback',
        explanation: 'Pad lights up on trigger, dims on release. Color can indicate sample type, group membership, or mute/solo state.'
      },
      {
        label: 'Pad Assignment',
        explanation: 'Assign samples, MIDI notes, or plugin actions to individual pads. Each pad can trigger different content.'
      }
    ],
    relatedTopics: [
      'Use PadGrid for organized pad layouts',
      'Use StepSequencer for pattern programming',
      'Use Meter for velocity display'
    ]
  },

  padgrid: {
    title: 'Pad Grid Element',
    description: 'Grid of drum pads in typical 4x4 or 8x8 layouts. For sample triggering and step programming.',
    examples: [
      {
        label: 'Drum Machine',
        explanation: 'Classic 4x4 grid for 16 samples/sounds. Maps to standard drum machine layout. Each pad triggers a different sound.'
      },
      {
        label: 'Clip Launcher',
        explanation: 'Larger grids (8x8) work like Ableton Push or Launchpad. Launch clips, trigger samples, or control scenes.'
      },
      {
        label: 'Pattern Banks',
        explanation: 'Use pages to access more sounds than visible pads. Bank A/B/C/D each provide 16 more pads for 64+ sound access.'
      }
    ],
    relatedTopics: [
      'Use DrumPad for individual pad elements',
      'Use StepSequencer for pattern editing',
      'Use SegmentButton for bank selection'
    ]
  },

  stepsequencer: {
    title: 'Step Sequencer Element',
    description: 'Grid-based pattern editor for rhythmic programming. Steps on horizontal axis, parts on vertical.',
    examples: [
      {
        label: 'Drum Pattern',
        explanation: '16-step grid with rows for kick, snare, hat, etc. Click steps to toggle notes. Classic TR-style drum programming interface.'
      },
      {
        label: 'Melodic Sequences',
        explanation: 'Steps trigger notes at different pitches. Vertical position or note value per step creates melodic patterns. Ideal for synth basslines and arpeggios.'
      },
      {
        label: 'Parameter Automation',
        explanation: 'Beyond notes, sequence parameter changes. Each step can set filter cutoff, pan, or other parameter values for evolving patterns.'
      }
    ],
    relatedTopics: [
      'Use PadGrid for drum machine style',
      'Use PianoKeyboard for melodic input',
      'Use BPMDisplay for tempo readout'
    ]
  },

  xypad: {
    title: 'XY Pad Element',
    description: 'Two-dimensional control surface. X and Y axes map to different parameters for expressive control.',
    examples: [
      {
        label: 'Filter Control',
        explanation: 'X axis controls cutoff frequency, Y axis controls resonance. Single gesture adjusts both parameters simultaneously for expressive filter sweeps.'
      },
      {
        label: 'Effects Mix',
        explanation: 'X axis controls delay mix, Y axis controls reverb mix. Allows quick navigation between dry, delayed, reverbed, and combined sounds.'
      },
      {
        label: 'Performance Control',
        explanation: 'Record XY movements as automation. Perfect for live performance and sound design. Touch-screen friendly for iPad/tablet use.'
      }
    ],
    relatedTopics: [
      'Use MultiValueDisplay for X/Y readout',
      'Use Slider for individual axis control',
      'Use FilterResponse for filter XY mapping'
    ]
  },

  wavetabledisplay: {
    title: 'Wavetable Display Element',
    description: 'Visualization for wavetable synthesizer. Shows waveform and position within wavetable.',
    relatedTopics: [
      'Use Slider for wavetable position control',
      'Use Oscilloscope for waveform preview',
      'Use Knob for morphing control'
    ]
  },

  harmoniceditor: {
    title: 'Harmonic Editor Element',
    description: 'Bar graph editor for harmonic/partial levels. For additive synthesis or harmonic shaping.',
    relatedTopics: [
      'Use MultiSlider for similar bar editing',
      'Use SpectrumAnalyzer to view result',
      'Use Oscilloscope to see waveform'
    ]
  },

  envelopeeditor: {
    title: 'Envelope Editor Element',
    description: 'Interactive envelope curve editor with draggable nodes. Full ADSR or multi-segment editing.',
    relatedTopics: [
      'Use EnvelopeDisplay for non-interactive view',
      'Use TimeDisplay for segment time readouts',
      'Use Knob for envelope parameter controls'
    ]
  },

  sampledisplay: {
    title: 'Sample Display Element',
    description: 'Waveform display with sample editing features. Shows start, end, and loop points.',
    relatedTopics: [
      'Use LoopPoints for loop region markers',
      'Use Waveform for basic waveform view',
      'Use TimeDisplay for position readout'
    ]
  },

  looppoints: {
    title: 'Loop Points Element',
    description: 'Visual loop point markers on waveform. Draggable start and end loop positions.',
    relatedTopics: [
      'Use SampleDisplay for waveform context',
      'Use RangeSlider for numeric loop range',
      'Use TimeDisplay for loop time readout'
    ]
  },

  patchbay: {
    title: 'Patch Bay Element',
    description: 'Visual patching interface for routing connections. Drag cables between inputs and outputs.',
    relatedTopics: [
      'Use ModulationMatrix for grid-based routing',
      'Use SignalFlow for processing chain view',
      'Use Dropdown for source/dest selection'
    ]
  },

  signalflow: {
    title: 'Signal Flow Element',
    description: 'Block diagram showing audio signal path. Visual representation of processing chain.',
    relatedTopics: [
      'Use PatchBay for interactive routing',
      'Use ModulationMatrix for modulation routing',
      'Use Label for block labels'
    ]
  },

  modulationmatrix: {
    title: 'Modulation Matrix Element',
    description: 'Grid showing modulation source/destination connections and amounts. For complex modulation routing.',
    relatedTopics: [
      'Use PatchBay for cable-style routing',
      'Use Dropdown for source/dest selection',
      'Use Slider for modulation amount'
    ]
  },

  presetbrowser: {
    title: 'Preset Browser Element',
    description: 'Interface for browsing, loading, and managing presets. Includes search, categories, and favorites.',
    relatedTopics: [
      'Use TreeView for hierarchical preset navigation',
      'Use TagSelector for preset filtering',
      'Use TextField for preset search'
    ]
  }
}

// =============================================================================
// TIER 2: Decorative
// =============================================================================

const decorativeHelp: Record<string, HelpContent> = {
  rectangle: {
    title: 'Rectangle Element',
    description: 'A basic rectangular shape. Use for backgrounds, dividers, or decorative purposes.',
    relatedTopics: [
      'Use Panel for interactive container',
      'Use Frame for bordered shapes',
      'Use Line for thin dividers'
    ]
  },

  line: {
    title: 'Line Element',
    description: 'A simple line from point A to point B. Use for dividers or visual connections.',
    relatedTopics: [
      'Use Rectangle for filled dividers',
      'Use Frame for bordered sections',
      'Use HorizontalSpacer for invisible spacing'
    ]
  },

  svggraphic: {
    title: 'SVG Graphic Element',
    description: 'Displays an SVG vector graphic. Scales without quality loss. Ideal for custom graphics.',
    relatedTopics: [
      'Use Image for raster graphics (PNG/JPG)',
      'Use IconButton for clickable icons',
      'Export element as SVG for custom editing'
    ]
  },

  dbdisplay: {
    title: 'dB Display Element',
    description: 'Specialized display for decibel values. Shows dB suffix and appropriate formatting.',
    relatedTopics: [
      'Use Meter for visual level display',
      'Use NumericDisplay for generic values',
      'Use GainReductionMeter for compression'
    ]
  },

  frequencydisplay: {
    title: 'Frequency Display Element',
    description: 'Specialized display for frequency values. Shows Hz or kHz with appropriate unit scaling.',
    relatedTopics: [
      'Use FilterResponse for frequency visualization',
      'Use EQCurve for multi-band EQ visualization',
      'Use Knob for frequency control'
    ]
  }
}

// =============================================================================
// Merge all help content
// =============================================================================

export const elementHelp: Record<string, HelpContent> = {
  // Tier 1: Core controls
  ...coreControlsHelp,

  // Tier 1: Containers
  ...containersHelp,

  // Tier 1: Displays
  ...displaysHelp,

  // Tier 2: Knob variants
  ...knobVariantsHelp,

  // Tier 2: Slider variants
  ...sliderVariantsHelp,

  // Tier 2: Buttons & switches
  ...buttonsHelp,

  // Tier 2: Value displays
  ...valueDisplaysHelp,

  // Tier 2: Professional meters
  ...professionalMetersHelp,

  // Tier 2: Container variants
  ...containerVariantsHelp,

  // Tier 2: Form controls
  ...formControlsHelp,

  // Tier 2: Navigation
  ...navigationHelp,

  // Tier 2: Visualizations
  ...visualizationsHelp,

  // Tier 2: Curves
  ...curvesHelp,

  // Tier 2: Specialized audio
  ...specializedAudioHelp,

  // Tier 2: Decorative
  ...decorativeHelp
}

/**
 * Get help content for an element type
 * Returns the specific help if available, or generic fallback content
 */
export function getElementHelp(elementType: string): HelpContent {
  const normalizedType = elementType.toLowerCase().replace(/[^a-z0-9]/g, '')

  if (elementHelp[normalizedType]) {
    return elementHelp[normalizedType]
  }

  // Fallback for unknown types
  return {
    title: `${elementType} Element`,
    description: `A ${elementType} element. Select and press F1 for help, or check the Properties panel sections.`,
    relatedTopics: [
      'Position & Size properties',
      'Identity properties',
      'Lock to prevent changes'
    ]
  }
}
