# /generate-vst - VST3 Project Generator

Generate a new VST3 plugin project from the base template.

## Usage

```
/generate-vst <FolderName> [--output <path>]
```

## Arguments

- `FolderName` - Name for the project folder (e.g., `Reverb`, `MySynth`)
- `--output <path>` - Parent directory (default: `D:\___ATM\`)

## Examples

```
/generate-vst Reverb
/generate-vst MySynth --output D:\Projects
```

---

## What This Skill Does

1. Creates project folder at `<output>/<FolderName>`
2. Copies all template files from `templates/vst-base/`
3. Creates `docs/` folder and copies FACEPLATE documentation
4. Initializes git repository
5. Adds JUCE 8.0.1 as submodule

## After Generation

The user must:
1. Edit `plugin.config` with their plugin details
2. Edit `ui/index.html` to customize the UI title
3. Edit `ui/style.css` if changing window size
4. Run `build.bat` or `rebuild.bat`

---

## Generation Process

### Step 1: Parse Arguments

- `folderName`: The folder name from arguments
- `outputPath`: Parent directory (default `D:\___ATM\`)
- Full path: `<outputPath>/<folderName>`

### Step 2: Validate

- Folder name is valid (alphanumeric, underscores, hyphens)
- Target folder does not already exist

### Step 3: Create Project

```bash
# Create folders
mkdir -p <fullPath>/src <fullPath>/ui <fullPath>/docs

# Copy template files (root)
cp templates/vst-base/CMakeLists.txt <fullPath>/
cp templates/vst-base/plugin.config <fullPath>/
cp templates/vst-base/README.md <fullPath>/
cp templates/vst-base/CLAUDE.md <fullPath>/
cp templates/vst-base/.gitignore <fullPath>/
cp templates/vst-base/.claudeignore <fullPath>/
cp templates/vst-base/build.bat <fullPath>/
cp templates/vst-base/rebuild.bat <fullPath>/

# Copy src files
cp templates/vst-base/src/* <fullPath>/src/

# Copy ui files
cp templates/vst-base/ui/* <fullPath>/ui/

# Copy documentation from UI Designer project
cp docs/FACEPLATE_DOCUMENTATION.md <fullPath>/docs/
cp docs/FACEPLATE_SYNC_GUIDE.md <fullPath>/docs/ 2>/dev/null || true
cp docs/EXPORT_FORMAT.md <fullPath>/docs/ 2>/dev/null || true
```

### Step 4: Initialize Git

```bash
cd <fullPath>
git init
git submodule add https://github.com/juce-framework/JUCE.git JUCE
cd JUCE && git checkout 8.0.1 && cd ..
git add .
git commit -m "Initial commit: VST3 plugin from template"
```

### Step 5: Report Results

```
Created VST3 project at: <fullPath>

Files copied:
- Template files (CLAUDE.md, plugin.config, build scripts, src/, ui/)
- Documentation (docs/FACEPLATE_DOCUMENTATION.md)

Next steps:
1. Edit plugin.config with your plugin details:
   - PLUGIN_NAME, PLUGIN_DISPLAY_NAME
   - PLUGIN_CODE (4 chars, unique)
   - COMPANY_NAME, MANUFACTURER_CODE

2. Edit ui/index.html - change "MY PLUGIN" title

3. Build:
   - build.bat     (quick build, keeps build folder)
   - rebuild.bat   (full rebuild, use when UI changes)

The plugin will install to: C:/Program Files/Common Files/VST3/

IMPORTANT: Do not edit ui/ files manually - use FACEPLATE to export new UI files.
See docs/FACEPLATE_DOCUMENTATION.md for UI design workflow.
```

---

## Template Location

`D:\___ATM\vst3-webview-ui-designer\templates\vst-base\`

## Documentation Source

`D:\___ATM\vst3-webview-ui-designer\docs\` (copied at generation time to ensure latest version)

## Files Copied

| Source | Destination | Description |
|--------|-------------|-------------|
| `templates/vst-base/plugin.config` | `plugin.config` | Plugin metadata (user edits) |
| `templates/vst-base/CMakeLists.txt` | `CMakeLists.txt` | Build config |
| `templates/vst-base/build.bat` | `build.bat` | Quick build script |
| `templates/vst-base/rebuild.bat` | `rebuild.bat` | Full rebuild script |
| `templates/vst-base/.claudeignore` | `.claudeignore` | Ignores JUCE/ and build/ |
| `templates/vst-base/.gitignore` | `.gitignore` | Git ignores |
| `templates/vst-base/src/*` | `src/` | C++ source files |
| `templates/vst-base/ui/*` | `ui/` | UI files (FACEPLATE-generated) |
| `templates/vst-base/README.md` | `README.md` | Project documentation |
| `templates/vst-base/CLAUDE.md` | `CLAUDE.md` | Claude instructions |
| `docs/FACEPLATE_DOCUMENTATION.md` | `docs/` | Full UI designer docs |
| `docs/FACEPLATE_SYNC_GUIDE.md` | `docs/` | Parameter sync guide |
| `docs/EXPORT_FORMAT.md` | `docs/` | Export format reference |
