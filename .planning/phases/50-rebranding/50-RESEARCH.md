# Phase 50: Rebranding - Research

**Researched:** 2026-02-03
**Domain:** Software project rebranding, text replacement across codebase
**Confidence:** HIGH

## Summary

Rebranding a software project involves systematically finding and replacing all references to old branding across multiple file types and locations. The project has already partially completed the rebrand (package.json, index.html, git remote URL updated via commit 149811f), but many references remain in documentation, source code, and planning files.

This phase requires careful search-and-replace operations across the codebase, with special attention to URLs (GitHub org/repo names), file paths, package names, and documentation. The standard approach is to use ripgrep for searching and sed for replacement, with verification steps to ensure completeness.

**Key finding:** Git remote URL and package.json have already been updated. Remaining work focuses on documentation files, source code URLs (issue reporting), planning documents, and package-lock.json consistency.

**Primary recommendation:** Use ripgrep to locate all instances, manually verify sensitive files (package-lock.json, git config), then use sed for bulk replacement with case-insensitive matching where appropriate.

## Standard Stack

### Core Tools

| Tool | Version | Purpose | Why Standard |
|------|---------|---------|--------------|
| ripgrep (rg) | Latest | Case-insensitive text search | Fast, respects .gitignore, Unicode support |
| sed | System default | In-place text replacement | Unix standard for stream editing |
| git | 2.x+ | Version control | Track changes, verify with git diff |

### Supporting Tools

| Tool | Version | Purpose | When to Use |
|------|---------|---------|-------------|
| npm | 10.x+ | Update package-lock.json | After package.json name changes |
| xargs | System default | Pipe filenames to sed | Bridge ripgrep search to sed replace |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| ripgrep + sed | fastmod (Facebook) | More ergonomic but additional dependency |
| ripgrep + sed | sd (Rust tool) | Simpler syntax but less widespread |
| Manual search | VS Code find/replace | Works but misses binary files, less verifiable |

**Installation:**
```bash
# ripgrep usually pre-installed on modern systems
# Check with: rg --version
# If missing: choco install ripgrep (Windows)
```

## Architecture Patterns

### Recommended Approach

1. **Search Phase** - Identify all occurrences
2. **Categorize Phase** - Group by file type and sensitivity
3. **Verify Phase** - Check for false positives
4. **Replace Phase** - Bulk replace with verification
5. **Test Phase** - Ensure package integrity (npm install)
6. **Commit Phase** - Single atomic commit with all changes

### Pattern 1: Case-Insensitive Search and Replace

**What:** Find all variations of brand name (allthecode, AllTheCode, ALLTHECODE) and replace with correct casing
**When to use:** Brand names that may appear in different cases across documentation and code

**Example:**
```bash
# Search phase - case insensitive
rg -i "allthecode" --files-with-matches

# Replace phase - case insensitive sed
rg -i "allthecode" --files-with-matches -0 | xargs -0 sed -i 's/allthecode/AllTheMachines/Ig'
```

**Note:** The `I` flag in sed makes the pattern match case-insensitive, but preserves original text casing in non-matched parts.

### Pattern 2: Exact Case-Sensitive Replace

**What:** Replace exact strings where casing matters (URLs, file paths, package names)
**When to use:** GitHub URLs, package.json name field, git remote URLs

**Example:**
```bash
# Search exact match
rg "vst3-webview-ui-designer" --files-with-matches

# Replace exact match
rg "vst3-webview-ui-designer" --files-with-matches -0 | xargs -0 sed -i 's/vst3-webview-ui-designer/Faceplate/g'
```

### Pattern 3: Manual Verification for Sensitive Files

**What:** Some files should be manually verified before automated replacement
**When to use:** package-lock.json, .git/config, generated files

**Sensitive files list:**
- `package-lock.json` - Should auto-update via `npm install`, not manual sed
- `.git/config` - Already updated in commit 149811f, verify only
- `package.json` - Already updated in commit 149811f, verify only
- Binary or compiled files - Exclude from sed operations

### Pattern 4: Verification Workflow

**What:** Verify changes before committing
**When to use:** After every replace operation

**Example:**
```bash
# After sed replace, verify with git
git diff --stat
git diff

# Count remaining instances
rg -i "allthecode" | wc -l
rg "vst3-webview-ui-designer" | wc -l

# Should both return 0
```

### Anti-Patterns to Avoid

- **Don't use find/replace on package-lock.json manually** - Run `npm install` instead to regenerate it properly
- **Don't skip verification step** - Always git diff before committing
- **Don't replace in node_modules** - These are dependencies, not project code (ripgrep excludes by default)
- **Don't replace binary files** - Can corrupt them (ripgrep excludes by default)
- **Don't use separate commits per file** - One atomic commit for entire rebrand ensures consistency

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Text search in files | Custom Node script | ripgrep | Respects .gitignore, fast, Unicode-aware |
| In-place file editing | Custom JS/TS file reader/writer | sed with xargs | Unix standard, atomic operations, well-tested |
| Case-insensitive replace | Manual RegEx per file | sed with `I` flag | Handles all edge cases, consistent |
| package-lock.json sync | Manual sed on lockfile | `npm install` | npm knows the correct format and structure |

**Key insight:** Text replacement across codebases is a solved problem. Standard Unix tools (ripgrep, sed) handle edge cases like binary files, .gitignore, Unicode, symlinks, etc. Custom scripts introduce bugs.

## Common Pitfalls

### Pitfall 1: Forgetting Case Variations

**What goes wrong:** Brand name appears in multiple cases (allthecode, AllTheCode, ALLTHECODE) but only one case is replaced
**Why it happens:** Using case-sensitive search when brand can appear in different casings
**How to avoid:** Use `-i` flag with ripgrep and `I` flag with sed for brand names
**Warning signs:** Success criteria fails - grep still finds instances after replacement

### Pitfall 2: Breaking URLs with Partial Matches

**What goes wrong:** Replacing "vst3-webview-ui-designer" in URL without updating entire path structure
**Why it happens:** GitHub org name and repo name both changed, but only repo replaced
**How to avoid:**
- Search for full URL patterns: `github.com/allthecodeDev/vst3-webview-ui-designer`
- Replace both org and repo together: `github.com/AllTheMachines/Faceplate`
**Warning signs:** Broken links in documentation, 404s when clicking GitHub URLs

### Pitfall 3: Corrupting package-lock.json

**What goes wrong:** Using sed on package-lock.json breaks npm install
**Why it happens:** package-lock.json has complex nested structure with checksums, versions, metadata
**How to avoid:**
- NEVER manually edit package-lock.json with sed
- Update package.json name field first
- Run `npm install` to regenerate package-lock.json automatically
- Verify with `npm install --dry-run` before committing
**Warning signs:** `npm install` fails after commit, lockfile format errors

### Pitfall 4: Missing Directory Name in Absolute Paths

**What goes wrong:** Planning docs contain absolute paths with old directory name (e.g., `/workspaces/vst3-webview-ui-designer/`)
**Why it happens:** Directory not renamed, or paths hardcoded in documentation
**How to avoid:**
- Search for directory name in paths: `rg "/vst3-webview-ui-designer/"`
- Replace in documentation only (not actual filesystem unless renaming directory)
- Consider leaving these as-is if they're historical references (planning docs)
**Warning signs:** Paths in docs don't match actual filesystem

### Pitfall 5: Git Remote URL Already Updated

**What goes wrong:** Attempting to update .git/config when it's already correct
**Why it happens:** Previous partial rebrand already updated some files
**How to avoid:**
- Verify current state first: `git remote -v`
- Check commit history: `git log --oneline | grep -i rebrand`
- Don't re-update already correct files
**Warning signs:** Git commands fail, duplicate operations

### Pitfall 6: False Positives in Search Results

**What goes wrong:** Replacing text in generated files, test data, or third-party content
**Why it happens:** Search tool finds all instances without context
**How to avoid:**
- Review file list before bulk replace: `rg "pattern" --files-with-matches`
- Exclude known safe directories: `--glob '!.planning/*'` (if planning docs are historical)
- Check git diff for unexpected changes
**Warning signs:** Changes in node_modules, dist/, or other generated directories

## Code Examples

Verified patterns from official sources:

### Complete Rebrand Workflow

```bash
# 1. SEARCH PHASE - Locate all instances
echo "Searching for 'allthecode' (case-insensitive)..."
rg -i "allthecode" --files-with-matches

echo "Searching for 'vst3-webview-ui-designer' (case-sensitive)..."
rg "vst3-webview-ui-designer" --files-with-matches

# 2. VERIFY CURRENT STATE
echo "Checking git remote URL..."
git remote -v

echo "Checking package.json name..."
grep '"name":' package.json

echo "Checking package-lock.json name..."
grep '"name":' package-lock.json | head -5

# 3. REPLACE PHASE - Case-insensitive for brand names
echo "Replacing 'allthecode' variants with 'AllTheMachines'..."
rg -i "allthecode" --files-with-matches -0 | xargs -0 sed -i 's/allthecodeDev/AllTheMachines/g'
rg -i "allthecode" --files-with-matches -0 | xargs -0 sed -i 's/allthecode/AllTheMachines/Ig'

# 4. REPLACE PHASE - Case-sensitive for technical names
echo "Replacing 'vst3-webview-ui-designer' with 'Faceplate'..."
rg "vst3-webview-ui-designer" --files-with-matches -0 | xargs -0 sed -i 's/vst3-webview-ui-designer/Faceplate/g'

# 5. UPDATE PACKAGE-LOCK.JSON
echo "Regenerating package-lock.json..."
npm install

# 6. VERIFICATION PHASE
echo "Verifying no instances remain..."
ALLTHECODE_COUNT=$(rg -i "allthecode" 2>/dev/null | wc -l)
VST3_COUNT=$(rg "vst3-webview-ui-designer" 2>/dev/null | wc -l)

echo "Remaining 'allthecode' instances: $ALLTHECODE_COUNT (should be 0)"
echo "Remaining 'vst3-webview-ui-designer' instances: $VST3_COUNT (should be 0)"

# 7. REVIEW CHANGES
git diff --stat
git diff
```

### Case-Insensitive Search with ripgrep
Source: [BurntSushi/ripgrep documentation](https://github.com/BurntSushi/ripgrep/discussions/2444)

```bash
# Basic case-insensitive search
rg -i "allthecode"

# Case-insensitive, show only filenames
rg -i "allthecode" -l

# Smart case (case-sensitive if pattern has uppercase)
rg -S "AllTheCode"  # case-sensitive
rg -S "allthecode"  # case-insensitive
```

### Case-Insensitive Replace with sed
Source: [nixCraft - sed case insensitive](https://www.cyberciti.biz/faq/unixlinux-sed-case-insensitive-search-replace-matching/)

```bash
# Case-insensitive search, replace with exact casing
sed -i 's/allthecode/AllTheMachines/Ig' file.txt

# The 'I' flag makes pattern matching case-insensitive
# The 'g' flag replaces all occurrences per line
```

### Safe Filename Piping with Whitespace
Source: [learnbyexample.github.io - substitution with ripgrep](https://learnbyexample.github.io/substitution-with-ripgrep/)

```bash
# Use NUL terminators for files with spaces in names
rg "pattern" --files-with-matches -0 | xargs -0 sed -i 's/old/new/g'

# -0 tells ripgrep to use NUL separator
# -0 tells xargs to expect NUL separator
# Prevents issues with spaces in filenames
```

### Verify Search Results Before Replace

```bash
# Preview changes before applying
rg "vst3-webview-ui-designer" -C 2

# Count total matches
rg "vst3-webview-ui-designer" | wc -l

# List unique files
rg "vst3-webview-ui-designer" --files-with-matches | wc -l
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Manual find/replace in editor | ripgrep + sed pipeline | ripgrep released 2016 | Faster, respects .gitignore, handles Unicode |
| ag (The Silver Searcher) | ripgrep | 2016-2026 | 2-3x faster, better defaults |
| grep -r | ripgrep | 2016-2026 | Respects .gitignore by default, faster |
| Custom Node.js scripts | Unix tools (rg + sed) | Established practice | Less code, more reliable |

**Deprecated/outdated:**
- **ack** (Perl-based grep alternative) - Slower than ripgrep, replaced for most use cases
- **ag/The Silver Searcher** - Still used but ripgrep is faster
- **grep -r** - Basic functionality but no .gitignore support, slower

## GitHub Repository Rename Impact

### GitHub Redirect Behavior
Source: [GitHub Docs - Renaming a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)

**What gets redirected:**
- All git clone, git fetch, git push operations to old URL redirect to new URL
- Release assets redirect to new location
- Web URLs redirect indefinitely (unless new repo created at old location)

**What does NOT redirect:**
- GitHub Actions - Workflows fail with "repository not found" if they reference old name
- GitHub Pages - Returns 404, no automatic redirect

**Redirect persistence:**
Source: [GitHub Community Discussion #22669](https://github.com/orgs/community/discussions/22669)
- Redirects persist indefinitely unless:
  1. Owner requests removal from GitHub support
  2. A new repository is created with the old name
- Even if username/org is claimed by someone else, redirects continue as long as no repo with same name is created

**Impact for this project:**
- Git remote URL already updated to `https://github.com/AllTheMachines/Faceplate.git`
- Old URL `https://github.com/allthecodeDev/vst3-webview-ui-designer` will redirect automatically
- Documentation URLs should be updated to new canonical URL for clarity
- No risk of broken git operations, but best practice to update all references

## 2026 Rebranding Best Practices

Source: [Zest City - Rebranding Checklist 2026](https://zestcity.com/the-checklist-for-rebrands-without-disruption-in-2026/)

### SEO and AI Discoverability

**AI-Era Considerations:**
- Update schema markup and structured content so AI systems understand the rebrand
- Maintain consistent brand signals across platforms where AI pulls training data
- A rebrand in 2026 that ignores AI discoverability is like 2012 ignoring mobile optimization

**SEO Protection (Critical):**
- 301 redirects for every changed URL (GitHub handles this automatically)
- Preserve metadata structure in documentation
- Update internal links systematically

### Silent Rebrand Approach
Source: [Medium - How to Rebrand in 2026](https://medium.com/@davidbrier/how-to-rebrand-in-2026-top-24-questions-to-ask-before-you-start-ccd4cdbdc6c3)

**Best practice:** Execute transition seamlessly without confusing audience or creating period where half materials look old and half look new.

**Solution for this project:** Single atomic commit that updates all references at once.

## Open Questions

1. **Should directory name be renamed?**
   - What we know: Current directory is `vst3-webview-ui-designer`, git remote is `Faceplate`
   - What's unclear: Whether local directory should match repo name
   - Recommendation: Leave directory name as-is (user's local filesystem, doesn't affect functionality). Update only references in code/docs.

2. **Should planning docs preserve historical references?**
   - What we know: `.planning/` contains many old references for historical context
   - What's unclear: Whether to update historical commit messages, debug logs, etc.
   - Recommendation: Update all, but note that historical paths in debug logs are acceptable context.

3. **Should README.md title be updated?**
   - What we know: README.md title is currently "VST3 WebView UI Designer"
   - What's unclear: Whether this should become "Faceplate" or remain descriptive
   - Recommendation: Update to "Faceplate" as primary title, with descriptive subtitle.

## Sources

### Primary (HIGH confidence)
- [ripgrep documentation - Case insensitive search](https://github.com/BurntSushi/ripgrep/discussions/2444)
- [ripgrep FAQ - Replace in files](https://github.com/BurntSushi/ripgrep/blob/master/FAQ.md)
- [GitHub Docs - Renaming a repository](https://docs.github.com/en/repositories/creating-and-managing-repositories/renaming-a-repository)
- [GitHub Community - Redirect persistence](https://github.com/orgs/community/discussions/22669)
- [npm Docs - package-lock.json](https://docs.npmjs.com/cli/v10/configuring-npm/package-lock-json/)

### Secondary (MEDIUM confidence)
- [nixCraft - sed case insensitive](https://www.cyberciti.biz/faq/unixlinux-sed-case-insensitive-search-replace-matching/)
- [learnbyexample.github.io - Substitution with ripgrep](https://learnbyexample.github.io/substitution-with-ripgrep/)
- [Zest City - 2026 Rebranding Checklist](https://zestcity.com/the-checklist-for-rebrands-without-disruption-in-2026/)
- [Medium - How to Rebrand in 2026](https://medium.com/@davidbrier/how-to-rebrand-in-2026-top-24-questions-to-ask-before-you-start-ccd4cdbdc6c3)

### Tertiary (LOW confidence)
- Various Stack Overflow discussions (not directly cited, used for pattern validation)

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - ripgrep and sed are established Unix tools with official documentation
- Architecture: HIGH - Search-and-replace workflow is well-documented and proven
- Pitfalls: HIGH - Identified from codebase analysis and official tool documentation
- GitHub redirects: HIGH - Official GitHub documentation confirms behavior
- package-lock.json behavior: HIGH - Official npm documentation confirms regeneration via install

**Research date:** 2026-02-03
**Valid until:** 2026-03-03 (30 days - stable tools and practices)
