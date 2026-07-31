# AGENTS.md

Shared rules for **every** coding agent working in this repo  
(OpenClaw, Claude Code, Codex, Cursor, etc.).

If you are an agent: read this file before editing.

## Purpose of this repo
Personal website (Next.js).

## Source of truth
- **Code:** this repo
- **Priorities / board:** `keeda-s/Mission-Control` (or `Empire-Strategy/mission-control` until moved)
- **Personal ops memory:** OpenClaw workspace (not here)

## Working rules
1. One Issue → one branch → one PR. Use worktrees for parallel agents.
2. Never commit secrets, tokens, `.env`, credential material.
3. Prefer smallest change that ships the Issue acceptance criteria.
4. Update `STATUS.md` if Now/Next/Blocked changed.
5. Do not dump strategy essays, idea vaults, or unrelated projects here.
6. Before merge: follow quality bar in `AGENTS.md` + Mission-Control `agents/PR_QUALITY.md`.
7. If unsure, leave `VERIFY` notes — do not silently guess APIs/paths.

## Commands
```bash
# install / run / test — fill per repo
```

## Repo-specific invariants
<!-- things that must not break -->

## Lessons learned (read before you "help")
See `LESSONS.md` in this repo. When you discover a new footgun:
1. Add a short entry to `LESSONS.md` in the same PR
2. If it is global process (all repos), also propose update to Mission-Control lessons

## PR verdict language
`APPROVE | APPROVE-WITH-NITS | VERIFY | BLOCK`
