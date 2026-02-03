# Resume Work from Handoff

You are resuming work after a context clear. A previous session saved context to help you continue seamlessly.

## Your Task

1. **Read the handoff file**:
   ```
   .claude/HANDOFF.md
   ```

2. **Verify current state**:
   - Run `git status` to see current file states
   - Check if the files mentioned in handoff still have the expected changes

3. **Summarize to the user**:
   - Briefly confirm what task we're continuing
   - State where we left off
   - Confirm the next step

4. **Continue the work**:
   - Pick up exactly where the handoff says we left off
   - If the next step is clear, start executing it
   - If clarification is needed, ask the user

## Important

- Don't re-explain the entire history - just confirm and continue
- If HANDOFF.md doesn't exist, tell the user no handoff was found and ask what they'd like to work on
- Be action-oriented - the goal is to seamlessly continue, not to discuss the handoff
