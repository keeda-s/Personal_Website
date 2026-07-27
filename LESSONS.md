# LESSONS.md

Living list of footguns. Agents must read and extend this.

Format:
```
### YYYY-MM-DD — short title
- **Mistake:** 
- **Why it hurt:** 
- **Rule:** 
- **Detection:** how future agents notice
```

## Lessons

### 2026-07-27 — Meta docs bloating product repos
- **Mistake:** Mixing strategy/ops essays into product code repos
- **Why it hurt:** Hard to find the real project; agents get wrong context
- **Rule:** Product repos stay lean (code + STATUS + AGENTS + LESSONS + PR template). Ops live in Mission-Control
- **Detection:** Files that don't help run/build/test the product

### 2026-07-27 — Looksy truth lived only in n8n UI
- **Mistake:** Empty git repo while Railway n8n was production
- **Why it hurt:** Agents couldn't review reality; drift inevitable
- **Rule:** Export active workflows to `n8n/` after changes; git is review surface
- **Detection:** Repo missing workflow JSON while n8n active

### 2026-07-27 — Hallucinated merge readiness
- **Mistake:** Claiming CI/PR status without fetching GitHub
- **Why it hurt:** Bad merges / fake confidence
- **Rule:** Live API/CLI only; else say unknown
- **Detection:** Status statements without links/command proof
