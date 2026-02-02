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
      'Export SVG to create branded knob designs'
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
    relatedTopics: [
      'Use regular Knob for continuous values',
      'Set step count to match number of options',
      'Combine with labels showing step values'
    ]
  },

  centerdetentknob: {
    title: 'Center Detent Knob Element',
    description: 'A rotary control with a physical-feeling center detent at the midpoint. Perfect for bipolar parameters like pan, stereo width, or EQ gain.',
    relatedTopics: [
      'Use for parameters with meaningful center (0, unity, center)',
      'BipolarSlider offers linear alternative',
      'Visual indicator shows center position'
    ]
  },

  dotindicatorknob: {
    title: 'Dot Indicator Knob Element',
    description: 'A knob variant with discrete dot indicators around the perimeter showing the current position. Provides visual reference points.',
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
    relatedTopics: [
      'Use CenterDetentKnob for rotary equivalent',
      'Fill color shows deviation from center',
      'Snap to center option for precise zero'
    ]
  },

  crossfadeslider: {
    title: 'Crossfade Slider Element',
    description: 'A dual-sided slider for mixing between two signals. Moving left increases A, moving right increases B. Perfect for A/B mixing or wet/dry blend.',
    relatedTopics: [
      'Label ends with A and B sources',
      'Center position is equal mix',
      'Use for parallel processing blend'
    ]
  },

  notchedslider: {
    title: 'Notched Slider Element',
    description: 'A slider with visual notches at specific positions. The thumb may snap to notches for commonly-used values.',
    relatedTopics: [
      'Use for parameters with meaningful presets',
      'Notches provide visual reference points',
      'Combine with value display'
    ]
  },

  arcslider: {
    title: 'Arc Slider Element',
    description: 'A curved slider following an arc path. Provides a different interaction feel than linear sliders. Useful for specialized interfaces.',
    relatedTopics: [
      'Use for visual variety in design',
      'Arc angle configurable in properties',
      'Knob offers similar rotary feel'
    ]
  },

  multislider: {
    title: 'Multi Slider Element',
    description: 'Multiple parallel sliders in a single element. Ideal for multi-band controls, graphic EQ, or any array of related parameters.',
    relatedTopics: [
      'Configure number of bands/sliders',
      'Each slider maps to separate parameter',
      'Use for EQ, multiband dynamics'
    ]
  },

  rangeslider: {
    title: 'Range Slider Element',
    description: 'A dual-handle slider for selecting a range of values (min and max). The two handles define the range boundaries.',
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
    relatedTopics: [
      'Set icon via image property',
      'Use SVG for scalable icons',
      'Add tooltip for accessibility'
    ]
  },

  toggleswitch: {
    title: 'Toggle Switch Element',
    description: 'A physical-style toggle switch for on/off states. More tactile appearance than standard toggle button.',
    relatedTopics: [
      'Use for clear binary choices',
      'Horizontal or vertical orientation',
      'Labels for on/off states'
    ]
  },

  powerbutton: {
    title: 'Power Button Element',
    description: 'A styled power/bypass button typically used for enabling/disabling entire effect sections. Universal power icon styling.',
    relatedTopics: [
      'Standard for bypass controls',
      'Place prominently in section headers',
      'Green on, gray off convention'
    ]
  },

  rockerswitch: {
    title: 'Rocker Switch Element',
    description: 'A physical-style rocker switch that tilts between two positions. Provides clear visual state indication.',
    relatedTopics: [
      'Use for permanent settings',
      'Clear on/off visual feedback',
      'Alternative to toggle switch'
    ]
  },

  rotaryswitch: {
    title: 'Rotary Switch Element',
    description: 'A multi-position rotary selector switch. Click to cycle through positions or drag to select. For selecting from multiple options.',
    relatedTopics: [
      'Use for mode/algorithm selection',
      'Alternative to dropdown',
      'Visual position indicator'
    ]
  },

  segmentbutton: {
    title: 'Segment Button Element',
    description: 'A segmented control where only one segment can be selected at a time. Like radio buttons but in a compact bar format.',
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
    relatedTopics: [
      'Use for delay, attack, release times',
      'Auto-formats ms/s based on range',
      'Bind to time-based parameters'
    ]
  },

  percentagedisplay: {
    title: 'Percentage Display Element',
    description: 'Shows values as percentages (0-100%). Includes % symbol. Perfect for mix, ratio, or saturation amounts.',
    relatedTopics: [
      'Use for wet/dry mix display',
      'Automatic % suffix',
      'Bind to normalized parameters'
    ]
  },

  ratiodisplay: {
    title: 'Ratio Display Element',
    description: 'Shows compressor-style ratios (e.g., 4:1, inf:1). Standard format for dynamics processor settings.',
    relatedTopics: [
      'Use for compressor/gate ratios',
      'Shows infinity symbol for limiting',
      'Pair with compressor controls'
    ]
  },

  notedisplay: {
    title: 'Note Display Element',
    description: 'Shows MIDI note values as musical note names (C4, F#3). Converts between note number and musical notation.',
    relatedTopics: [
      'Use for root note, key selection',
      'Shows sharps/flats appropriately',
      'Octave number included'
    ]
  },

  bpmdisplay: {
    title: 'BPM Display Element',
    description: 'Shows tempo values in beats per minute. Typically includes decimal precision and BPM label.',
    relatedTopics: [
      'Use for tempo sync parameters',
      'Optional decimal places',
      'Combine with tap tempo button'
    ]
  },

  editabledisplay: {
    title: 'Editable Display Element',
    description: 'A numeric display that accepts direct text input. Click to edit, type value, press Enter to confirm.',
    relatedTopics: [
      'Alternative to slider for precise values',
      'Validation for min/max range',
      'Keyboard-friendly input'
    ]
  },

  multivaluedisplay: {
    title: 'Multi Value Display Element',
    description: 'Shows multiple related values in a single display. Useful for coordinates, ranges, or grouped readouts.',
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
    relatedTopics: [
      'Use for loudness monitoring',
      'Often paired with peak meter',
      'Slower response than peak'
    ]
  },

  rmsmeterstereo: {
    title: 'RMS Meter (Stereo) Element',
    description: 'Dual RMS meters for stereo signals. Shows left and right channel average levels side by side.',
    relatedTopics: [
      'Use for stereo loudness monitoring',
      'Reveals channel imbalance',
      'Standard stereo metering layout'
    ]
  },

  vumetermono: {
    title: 'VU Meter (Mono) Element',
    description: 'Classic analog-style Volume Unit meter for mono signals. Standardized 300ms integration time, -20 to +3 VU range.',
    relatedTopics: [
      'Classic studio metering style',
      'Use for vintage aesthetic',
      '0 VU = reference level'
    ]
  },

  vumeterstereo: {
    title: 'VU Meter (Stereo) Element',
    description: 'Dual VU meters for stereo signals with classic analog appearance. Traditional mixing console aesthetic.',
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
    relatedTopics: [
      'Check mono compatibility',
      'Detect phase issues',
      'Essential for stereo mixing'
    ]
  },

  stereowidthmeter: {
    title: 'Stereo Width Meter Element',
    description: 'Visualizes the stereo width of a signal. Shows how much stereo content vs mono content is present.',
    relatedTopics: [
      'Monitor stereo image',
      'Detect narrow mixes',
      'Use with width controls'
    ]
  },

  gainreductionmeter: {
    title: 'Gain Reduction Meter Element',
    description: 'Shows the amount of gain reduction applied by a compressor, limiter, or dynamics processor. Typically displays negative dB.',
    relatedTopics: [
      'Essential for compression',
      'Monitor limiting amount',
      'Usually inverted scale'
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
      'Use for parameter explanations',
      'Configure show delay',
      'Keep text concise'
    ]
  },

  windowchrome: {
    title: 'Window Chrome Element',
    description: 'The decorative and functional frame around a plugin window. Includes title bar, close button, and resize handles.',
    relatedTopics: [
      'Customize window appearance',
      'Configure title and buttons',
      'Match overall design'
    ]
  },

  horizontalspacer: {
    title: 'Horizontal Spacer Element',
    description: 'An invisible element that creates horizontal space in layouts. Pushes adjacent elements apart.',
    relatedTopics: [
      'Use for layout spacing',
      'Flexible width option',
      'Invisible in final UI'
    ]
  },

  verticalspacer: {
    title: 'Vertical Spacer Element',
    description: 'An invisible element that creates vertical space in layouts. Pushes adjacent elements apart vertically.',
    relatedTopics: [
      'Use for layout spacing',
      'Flexible height option',
      'Invisible in final UI'
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
    relatedTopics: [
      'Use for many options (5+)',
      'Configure options list',
      'Alternative to rotary switch'
    ]
  },

  checkbox: {
    title: 'Checkbox Element',
    description: 'A toggleable box for binary options. Shows checked or unchecked state with optional label.',
    relatedTopics: [
      'Use for enable/disable options',
      'Group related checkboxes',
      'Label text configurable'
    ]
  },

  radiogroup: {
    title: 'Radio Group Element',
    description: 'A set of mutually exclusive radio buttons. Only one option can be selected at a time.',
    relatedTopics: [
      'Use for exclusive choices',
      'Alternative to dropdown',
      'Clear visual selection'
    ]
  },

  textfield: {
    title: 'Text Field Element',
    description: 'A text input field for entering strings. Use for names, paths, or text-based parameters.',
    relatedTopics: [
      'Use for preset names',
      'Validation available',
      'Configure placeholder text'
    ]
  },

  multiselectdropdown: {
    title: 'Multi-Select Dropdown Element',
    description: 'A dropdown allowing multiple selections. Shows checkmarks for selected items.',
    relatedTopics: [
      'Use for multiple choices',
      'Shows selection count',
      'Alternative to checkbox group'
    ]
  },

  combobox: {
    title: 'Combo Box Element',
    description: 'Combines text input with dropdown selection. Users can type custom values or select from list.',
    relatedTopics: [
      'Use for preset with custom option',
      'Type or select',
      'Filterable options'
    ]
  },

  menubutton: {
    title: 'Menu Button Element',
    description: 'A button that opens a dropdown menu when clicked. Combines button action with menu selection.',
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
      'Use for integer values',
      'Configure step size',
      'Combine with display'
    ]
  },

  breadcrumb: {
    title: 'Breadcrumb Element',
    description: 'Navigation path showing current location in hierarchy. Clickable segments to navigate back.',
    relatedTopics: [
      'Use for preset navigation',
      'Shows folder path',
      'Click to navigate'
    ]
  },

  tabbar: {
    title: 'Tab Bar Element',
    description: 'Horizontal tabs for switching between views or sections. Only one tab active at a time.',
    relatedTopics: [
      'Use for major sections',
      'Configure tab labels',
      'Bind to panel visibility'
    ]
  },

  tagselector: {
    title: 'Tag Selector Element',
    description: 'Multi-select tag/chip interface for filtering or categorization. Toggle tags on/off.',
    relatedTopics: [
      'Use for preset filtering',
      'Multiple selection allowed',
      'Clear all option'
    ]
  },

  treeview: {
    title: 'Tree View Element',
    description: 'Hierarchical list with expandable/collapsible nodes. For navigating nested structures like preset banks.',
    relatedTopics: [
      'Use for preset banks',
      'Expand/collapse nodes',
      'Selection highlighting'
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
    relatedTopics: [
      'Use for input monitoring',
      'Configurable scroll speed',
      'Color zones for levels'
    ]
  },

  spectrumanalyzer: {
    title: 'Spectrum Analyzer Element',
    description: 'Real-time frequency spectrum display. Shows frequency content as bar graph or continuous line.',
    relatedTopics: [
      'Use for frequency monitoring',
      'FFT size configurable',
      'Peak hold option'
    ]
  },

  spectrogram: {
    title: 'Spectrogram Element',
    description: 'Time vs frequency display with color-coded amplitude. Shows frequency evolution over time.',
    relatedTopics: [
      'Use for detailed frequency analysis',
      'Color represents amplitude',
      'Time scrolls horizontally'
    ]
  },

  goniometer: {
    title: 'Goniometer Element',
    description: 'Stereo phase/balance visualization. Shows L/R relationship as Lissajous pattern.',
    relatedTopics: [
      'Monitor stereo image',
      'Detect phase issues',
      'Classic studio tool'
    ]
  },

  vectorscope: {
    title: 'Vectorscope Element',
    description: 'Circular stereo field visualization. Shows stereo width and balance as vector display.',
    relatedTopics: [
      'Alternative to goniometer',
      'Stereo field display',
      'Phase correlation visible'
    ]
  },

  waveform: {
    title: 'Waveform Element',
    description: 'Static waveform display for loaded audio files. Shows complete waveform overview.',
    relatedTopics: [
      'Use for sample display',
      'Zoom and scroll options',
      'Selection highlighting'
    ]
  },

  oscilloscope: {
    title: 'Oscilloscope Element',
    description: 'Real-time waveform display showing audio cycles. Triggered display for stable visualization.',
    relatedTopics: [
      'Use for waveform monitoring',
      'Trigger sync options',
      'Time scale adjustable'
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
    relatedTopics: [
      'Displays EQ frequency response',
      'Interactive node editing',
      'Shows filter shapes'
    ]
  },

  compressorcurve: {
    title: 'Compressor Curve Element',
    description: 'Input/output transfer curve for dynamics processors. Shows threshold, ratio, knee as visual curve.',
    relatedTopics: [
      'Visualize compression settings',
      'Shows threshold and ratio',
      'Knee curve visible'
    ]
  },

  envelopedisplay: {
    title: 'Envelope Display Element',
    description: 'ADSR or multi-stage envelope visualization. Shows envelope shape over time.',
    relatedTopics: [
      'Displays envelope shape',
      'A/D/S/R stages visible',
      'Interactive editing option'
    ]
  },

  lfodisplay: {
    title: 'LFO Display Element',
    description: 'Low-frequency oscillator waveform display. Shows LFO shape, rate, and modulation.',
    relatedTopics: [
      'Shows LFO waveform',
      'Rate visualization',
      'Waveform type display'
    ]
  },

  filterresponse: {
    title: 'Filter Response Element',
    description: 'Frequency response curve for filter settings. Shows cutoff, resonance, and filter slope.',
    relatedTopics: [
      'Displays filter shape',
      'Cutoff and Q visible',
      'Multiple filter types'
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
    relatedTopics: [
      'MIDI note visualization',
      'Configurable octave range',
      'Click to trigger notes'
    ]
  },

  drumpad: {
    title: 'Drum Pad Element',
    description: 'Single pressure-sensitive trigger pad. Typically used in groups for drum machine interfaces.',
    relatedTopics: [
      'Use in PadGrid groups',
      'Velocity sensitive',
      'Visual feedback on trigger'
    ]
  },

  padgrid: {
    title: 'Pad Grid Element',
    description: 'Grid of drum pads in typical 4x4 or 8x8 layouts. For sample triggering and step programming.',
    relatedTopics: [
      'Drum machine style interface',
      'Configurable grid size',
      'Page switching option'
    ]
  },

  stepsequencer: {
    title: 'Step Sequencer Element',
    description: 'Grid-based pattern editor for rhythmic programming. Steps on horizontal axis, parts on vertical.',
    relatedTopics: [
      'Pattern programming',
      'Step count configurable',
      'Multiple rows for parts'
    ]
  },

  xypad: {
    title: 'XY Pad Element',
    description: 'Two-dimensional control surface. X and Y axes map to different parameters for expressive control.',
    relatedTopics: [
      'Two-parameter control',
      'Configurable X/Y params',
      'Touch-friendly interaction'
    ]
  },

  wavetabledisplay: {
    title: 'Wavetable Display Element',
    description: 'Visualization for wavetable synthesizer. Shows waveform and position within wavetable.',
    relatedTopics: [
      'Wavetable visualization',
      'Position indicator',
      '3D and 2D views'
    ]
  },

  harmoniceditor: {
    title: 'Harmonic Editor Element',
    description: 'Bar graph editor for harmonic/partial levels. For additive synthesis or harmonic shaping.',
    relatedTopics: [
      'Additive synthesis editing',
      'Drag harmonic levels',
      'Partial amplitude control'
    ]
  },

  envelopeeditor: {
    title: 'Envelope Editor Element',
    description: 'Interactive envelope curve editor with draggable nodes. Full ADSR or multi-segment editing.',
    relatedTopics: [
      'Interactive envelope design',
      'Draggable breakpoints',
      'Curve type options'
    ]
  },

  sampledisplay: {
    title: 'Sample Display Element',
    description: 'Waveform display with sample editing features. Shows start, end, and loop points.',
    relatedTopics: [
      'Sample waveform view',
      'Edit points visible',
      'Zoom and scroll'
    ]
  },

  looppoints: {
    title: 'Loop Points Element',
    description: 'Visual loop point markers on waveform. Draggable start and end loop positions.',
    relatedTopics: [
      'Loop region editing',
      'Draggable markers',
      'Use with SampleDisplay'
    ]
  },

  patchbay: {
    title: 'Patch Bay Element',
    description: 'Visual patching interface for routing connections. Drag cables between inputs and outputs.',
    relatedTopics: [
      'Modular routing interface',
      'Visual cable connections',
      'Matrix alternative'
    ]
  },

  signalflow: {
    title: 'Signal Flow Element',
    description: 'Block diagram showing audio signal path. Visual representation of processing chain.',
    relatedTopics: [
      'Processing chain display',
      'Block routing visualization',
      'Informational display'
    ]
  },

  modulationmatrix: {
    title: 'Modulation Matrix Element',
    description: 'Grid showing modulation source/destination connections and amounts. For complex modulation routing.',
    relatedTopics: [
      'Mod routing display',
      'Source/dest grid',
      'Amount adjustment'
    ]
  },

  presetbrowser: {
    title: 'Preset Browser Element',
    description: 'Interface for browsing, loading, and managing presets. Includes search, categories, and favorites.',
    relatedTopics: [
      'Preset management UI',
      'Category filtering',
      'Search functionality'
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
      'Basic shape element',
      'Configurable fill/stroke',
      'Use for visual design'
    ]
  },

  line: {
    title: 'Line Element',
    description: 'A simple line from point A to point B. Use for dividers or visual connections.',
    relatedTopics: [
      'Visual divider',
      'Configurable thickness',
      'Start/end points'
    ]
  },

  svggraphic: {
    title: 'SVG Graphic Element',
    description: 'Displays an SVG vector graphic. Scales without quality loss. Ideal for custom graphics.',
    relatedTopics: [
      'Vector graphic display',
      'Scalable without loss',
      'Custom icons and graphics'
    ]
  },

  dbdisplay: {
    title: 'dB Display Element',
    description: 'Specialized display for decibel values. Shows dB suffix and appropriate formatting.',
    relatedTopics: [
      'Decibel value display',
      'Auto dB suffix',
      'Use for level readouts'
    ]
  },

  frequencydisplay: {
    title: 'Frequency Display Element',
    description: 'Specialized display for frequency values. Shows Hz or kHz with appropriate unit scaling.',
    relatedTopics: [
      'Frequency value display',
      'Auto Hz/kHz formatting',
      'Use with filter controls'
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
