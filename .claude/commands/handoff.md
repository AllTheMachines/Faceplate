# Context Handoff - Save Current Work State

You need to create a comprehensive handoff document so work can continue seamlessly after a context clear.

## Your Task

1. **Analyze the current conversation** and identify:
   - What task/feature we're working on
   - Current progress (what's done, what's in progress, what's remaining)
   - Any decisions made or approaches chosen
   - Files that were modified or are relevant
   - Any errors or blockers encountered
   - Next immediate steps

2. **Check for uncommitted changes** by running:
   ```bash
   git status
   git diff --stat
   ```

3. **Write a handoff file** to `.claude/HANDOFF.md` with this structure:

```markdown
# Work Handoff - [Current Date/Time]

## Current Task
[One-line description of what we're working on]

## Context
[2-3 sentences of background/why we're doing this]

## Progress
### Completed
- [List completed items]

### In Progress
- [Current work item and its state]

### Remaining
- [What still needs to be done]

## Key Decisions
- [Any important decisions made during the session]

## Relevant Files
- `path/to/file1.ts` - [why it's relevant]
- `path/to/file2.tsx` - [why it's relevant]

## Git Status
[Paste summary of uncommitted changes if any]

## Next Steps
1. [Immediate next action]
2. [Following action]

## Resume Command
After running `/clear`, run `/resume` to continue.
```

4. **Output to the user**:
   - Confirm the handoff file was written
   - Tell them to run `/clear` then `/resume` to continue seamlessly

## Important

- Be comprehensive but concise
- Focus on actionable information needed to continue
- Include any error messages or blockers verbatim
- If there's a task list active, include the task states
