# Claude Code Branching Strategy

**Last Updated:** November 1, 2025

## Current Situation

Claude Code creates session-specific branches for security. Each session gets a unique branch name with a session ID:
- Example: `claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V`
- Example: `claude/continue-work-011CUgMLQttSG6rB5qBGKeDJ`

**Problem:** Each new session creates a new branch, making continuity difficult.

## Solution: Stable Main Branch

**Primary Development Branch:**
```
claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V
```

This is your **main Claude development branch**. All work should ultimately be merged here.

## Workflow for Claude Sessions

### When Starting a New Session:

1. **Claude will create a session-specific branch** (e.g., `claude/continue-work-XXXXX`)
2. **Claude will work on that branch** and push commits there
3. **User will merge via Pull Request** when ready

### User's Workflow (You):

**Option 1: Pull Request (Recommended)**
```bash
# After Claude completes work on session branch
gh pr create --base claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V \
             --head claude/continue-work-XXXXX \
             --title "Continue work from session XXXXX"

# Or use GitHub UI to create PR and merge
```

**Option 2: Manual Merge**
```bash
git checkout claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V
git pull origin claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V
git merge claude/continue-work-XXXXX
git push origin claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V
```

**Option 3: Fast-Forward (If no conflicts)**
```bash
git checkout claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V
git pull origin claude/continue-work-XXXXX
git push origin claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V
```

## Resolving Conflicts

### Package Lock Conflicts
```bash
# Discard local package-lock.json changes (safe)
git checkout -- russell-mental-health/package-lock.json
git pull origin claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V

# Or regenerate
cd russell-mental-health
rm package-lock.json
npm install
```

### Other Conflicts
```bash
# Stash local changes
git stash
git pull origin claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V
git stash pop  # Resolve any conflicts
git add .
git commit -m "Resolve merge conflicts"
```

## Branch Cleanup

After merging session branches, you can delete them:
```bash
# Delete local branch
git branch -d claude/continue-work-XXXXX

# Delete remote branch
git push origin --delete claude/continue-work-XXXXX
```

## Rules for Claude

1. **ALWAYS use session-specific branch** (Claude Code requirement for security)
2. **Document the session branch** name in commit messages or communication
3. **Never force-push** to the main development branch
4. **Always pull** latest from main branch before starting work if possible

## Rules for User

1. **ALWAYS merge** session branches into `claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V`
2. **Pull from main branch** before starting local work
3. **Use Pull Requests** for transparency and review
4. **Keep main branch stable** - test before merging

## Current Branch State

**Main Development Branch:**
- `claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V`
- Latest commit: `8d69876` (Merge PR #1)
- Status: ✅ Up to date

**Active Session Branch:**
- `claude/continue-work-011CUgMLQttSG6rB5qBGKeDJ`
- Status: ✅ Merged via PR #1
- Can be deleted

**Merged Session Branches (can be deleted):**
- `claude/continue-work-011CUgMLQttSG6rB5qBGKeDJ`

## Quick Reference

**Pull Latest Work:**
```bash
git pull origin claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V
```

**Check Current Branch:**
```bash
git branch --show-current
```

**List All Branches:**
```bash
git branch -a | grep claude
```

**Safe Reset to Remote:**
```bash
git fetch origin claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V
git reset --hard origin/claude/therapynotes-platform-planning-011CUdbcjuxDKk4oBeqePW5V
```

---

**Remember:** Session branches are temporary. Always merge to main development branch!
