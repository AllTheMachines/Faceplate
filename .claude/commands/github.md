# GitHub Issues Integration

Manage GitHub Issues as the single source of truth for bugs, features, and milestones.

## Prerequisites

- GitHub CLI (`gh`) must be installed and authenticated
- Run `gh auth status` to verify authentication

## Commands

Route based on $ARGUMENTS:

- `sync` or empty → Sync issues to planning backlog
- `create [title]` → Create issue from current context
- `close [#number...]` → Close issue(s) after approval
- `milestone [name]` → Create GitHub milestone from roadmap phase

---

## Command: sync

**Trigger:** `/github sync` or `/github`

Pull all open GitHub issues into `.planning/BACKLOG.md` for planning.

### Process

1. Fetch open issues:
```bash
gh issue list --state open --json number,title,body,labels,milestone --limit 100
```

2. Parse and categorize by labels:
   - `bug` → Bugs section
   - `enhancement` / `feature` → Features section
   - `documentation` → Docs section
   - No label → Uncategorized

3. Write/update `.planning/BACKLOG.md`:
```markdown
# Backlog

*Synced from GitHub Issues: {timestamp}*

## Bugs

- [ ] #{number}: {title} [{labels}]
  {first 100 chars of body}...

## Features

- [ ] #{number}: {title} [{labels}]

## Uncategorized

- [ ] #{number}: {title}

---
*Run `/github sync` to refresh*
```

4. Report summary:
   - Total issues synced
   - By category count
   - Any issues already in active phases (cross-reference with ROADMAP.md)

---

## Command: create

**Trigger:** `/github create [optional title]`

Create a GitHub issue from current conversation context.

### Process

1. If title provided in $ARGUMENTS, use it
2. Otherwise, infer from recent context:
   - Bug found during development → use error/issue description
   - Feature request discussed → use feature name
   - UAT failure → use test name and failure description

3. Build issue body:
```markdown
## Description
{Inferred or ask user}

## Context
- Found during: {phase/task if applicable}
- Related files: {list any files mentioned}

## Suggested Fix
{If root cause known}

## Severity
{blocker/major/minor/cosmetic}

---
*Created via /github create*
```

4. Prompt for labels:
   - Suggest based on context (bug, enhancement, etc.)
   - Let user confirm or modify

5. Create issue:
```bash
gh issue create --title "{title}" --body "{body}" --label "{labels}"
```

6. Report: Issue #{number} created: {url}

---

## Command: close

**Trigger:** `/github close #1 #2 #3` or `/github close 1 2 3`

Close issues after UAT approval.

### Process

1. Parse issue numbers from $ARGUMENTS

2. For each issue:
   - Fetch issue details: `gh issue view {number} --json title,state`
   - Verify it's open
   - Show title to user for confirmation

3. Ask for close reason (or use default):
   - "Verified and approved via UAT"
   - Custom message

4. Close issues:
```bash
gh issue close {number} --comment "Closed: {reason}"
```

5. Update `.planning/BACKLOG.md`:
   - Remove closed issues or mark as [x] completed

6. Report summary:
   - Issues closed: {list}
   - Any failures

---

## Command: milestone

**Trigger:** `/github milestone [phase-number or name]`

Create a GitHub milestone from a roadmap phase, linking relevant issues.

### Process

1. If no argument, show available phases from ROADMAP.md

2. Read phase details from `.planning/ROADMAP.md`:
   - Phase name and goal
   - Success criteria
   - Related bugs/features (from phase planning)

3. Check if milestone exists:
```bash
gh api repos/{owner}/{repo}/milestones --jq '.[] | select(.title == "{name}")'
```

4. Create milestone if not exists:
```bash
gh api repos/{owner}/{repo}/milestones --method POST --field title="{Phase X: Name}" --field description="{Goal}" --field due_on="{optional date}"
```

5. Link issues to milestone:
   - Find issues mentioned in phase plans
   - Find issues matching phase keywords
   - Assign them to milestone:
```bash
gh issue edit {number} --milestone "{milestone-name}"
```

6. Report:
   - Milestone created/updated: {name}
   - Issues linked: {count}
   - URL: {milestone url}

---

## Integration with GSD

### After `/gsd:verify-work` with issues found:

When UAT finds issues, automatically offer:
```
Issues found during UAT. Create GitHub issues?
- yes → Run /github create for each gap
- no → Skip
```

### After UAT "approved":

When all tests pass or user approves:
```
UAT approved. Close related GitHub issues?
{list issues that were in this phase}
- yes → Run /github close for listed issues
- no → Skip
```

### During `/gsd:new-milestone`:

Offer to sync from GitHub:
```
Sync open GitHub issues into this milestone?
- yes → Run /github sync, then let user select issues
- no → Continue with manual planning
```

---

## Error Handling

- **gh not installed:** Show install instructions (https://cli.github.com/)
- **Not authenticated:** Run `gh auth login`
- **Rate limited:** Wait and retry, or show manual instructions
- **No repo:** Check if in git repo with GitHub remote

---

## Windows PATH Issue

On Windows, `gh` may not be in the shell PATH even after installation. If `gh` command is not found:

1. Check if installed:
```bash
powershell -Command "Test-Path 'C:\Program Files\GitHub CLI\gh.exe'"
```

2. Use full path via PowerShell:
```bash
powershell -Command "& 'C:\Program Files\GitHub CLI\gh.exe' issue list --state open --json number,title,body,labels,milestone --limit 100"
```

3. For all gh commands, wrap with:
```bash
powershell -Command "& 'C:\Program Files\GitHub CLI\gh.exe' {command} {args}"
```

This bypasses PATH issues by calling gh.exe directly through PowerShell.

---

## Example Workflow

```
# Start new milestone, sync issues
/github sync
/gsd:new-milestone

# During development, find a bug
/github create "Color picker resets on element switch"

# After completing work, run UAT
/gsd:verify-work 40

# User approves all tests
> approved

# Close the issues that were fixed
/github close 15 16 17
```

---

$ARGUMENTS
