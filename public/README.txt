=============================================
 FACEPLATE UI DESIGNER
 Visual UI Designer for VST3 Plugins
=============================================


QUICK START
-----------

  Windows:  Double-click "start-windows.bat"

  Mac:      Double-click "start-mac.command"
            (First time: right-click > Open)

  Linux:    python3 -m http.server 8000
            Open: http://localhost:8000


REQUIREMENTS
------------

  Python OR Node.js must be installed:

  - Python:  https://www.python.org/downloads/
  - Node.js: https://nodejs.org/


DOCUMENTATION
-------------

  All Documentation:
  https://github.com/AllTheMachines/Faceplate/tree/main/docs
    → Browse all guides, references, and manuals

  User Manual (start here):
  https://github.com/AllTheMachines/Faceplate/blob/main/docs/manual/README.md
    → Step-by-step guide from installation to export

  Element Reference:
  https://github.com/AllTheMachines/Faceplate/blob/main/docs/ELEMENT_REFERENCE.md
    → All available UI elements (knobs, sliders, buttons, meters, etc.)

  JUCE Integration:
  https://github.com/AllTheMachines/Faceplate/blob/main/docs/JUCE_INTEGRATION.md
    → Step-by-step guide to integrate exported UI with your JUCE plugin

  Export Format:
  https://github.com/AllTheMachines/Faceplate/blob/main/docs/EXPORT_FORMAT.md
    → Details on the exported HTML/CSS/JS structure and bindings

  Custom Styles:
  https://github.com/AllTheMachines/Faceplate/blob/main/docs/STYLE_CREATION_MANUAL.md
    → Create your own SVG knob and control styles


COMMUNITY
---------

  GitHub:        https://github.com/AllTheMachines/Faceplate


FEATURES
--------

  - Drag & drop UI elements (knobs, sliders, buttons, meters, etc.)
  - Multi-window support (main UI, settings, about screens)
  - Custom SVG styles for knobs and controls
  - Real-time preview with mock JUCE backend
  - Export to HTML/CSS/JS for JUCE WebView integration
  - Import/export project files (.faceplate)
  - Grid snapping and alignment tools
  - Layer management


WORKFLOW
--------

  1. Design your UI using the visual editor
  2. Configure element properties (colors, ranges, labels)
  3. Preview with the built-in mock backend
  4. Export to HTML/CSS/JS
  5. Integrate with your JUCE plugin


KEYBOARD SHORTCUTS
------------------

  Ctrl+S        Save project
  Ctrl+O        Open project
  Ctrl+Z        Undo
  Ctrl+Y        Redo
  Ctrl+C        Copy
  Ctrl+V        Paste
  Delete        Delete selected
  Ctrl+A        Select all
  Ctrl+D        Duplicate
  Arrow keys    Nudge selection
  Shift+Arrows  Nudge by 10px


SUPPORT
-------

  Issues:    https://github.com/AllTheMachines/Faceplate/issues
  Email:     support@all-the-machines.com


TROUBLESHOOTING
---------------

  "Nothing happens when I double-click the launcher"
    → Make sure Python or Node.js is installed
    → Try running from command prompt/terminal

  "Page is blank or shows errors"
    → Wait a few seconds for loading
    → Press F12 to check browser console
    → Try Chrome, Firefox, or Edge

  "Server won't start"
    → Check if port 8000 is already in use
    → Try: python -m http.server 8080


LICENSE
-------

  Faceplate is open source software.
  See LICENSE file for details.

  https://github.com/AllTheMachines/Faceplate


=============================================
 Made with ♥ by All The Machines
 http://all-the-machines.com
=============================================
