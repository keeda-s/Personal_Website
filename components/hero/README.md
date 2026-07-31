# Hero Architecture

`HeroScene` is the composition boundary for the first-screen experience. The public
`StarryBackground` export remains as a compatibility wrapper for `app/page.tsx`.

## Ownership

- `hero-scene.tsx`: layer order and cross-system composition only.
- `sky/`: stars, Milky Way, flow fields, and the monthly constellation.
- `events/`: dynamic facts, dark-universe object, satellite, and launch events.
- `moon/`: lunar model, coast-data cards, moon rendering, and panel orchestration.
- `character/`: the Rive skeleton and its interaction state.
- `landscape-layers.tsx`: PNG layer order, mist placement, and foreground composition.
- `canvas-utils.ts`: deterministic canvas and CSS-control helpers shared by renderers.

## Styles And Manual Controls

- `app/styles/hero-sky-controls.css`: stars, Milky Way, flow, and sky-event controls.
- `app/styles/hero-moon-controls.css`: moon rendering and coast-panel controls.
- `app/styles/hero-landscape-controls.css`: mist, character, horizon, and parallax controls.
- `app/styles/hero-controls.css`: shared frame geometry only.
- `app/styles/hero-sky.css`: sky, Milky Way, event, and flow presentation.
- `app/styles/hero-moon.css`: moon and coast-panel presentation.
- `app/styles/hero-effects.css`: atmosphere, landscape, keyframes, and reduced motion.

The style files are imported in cascade order by `app/layout.tsx`. Keep that order stable.

## Parallel Worktrees

Assign one domain directory and its matching control/style file to each worktree. Avoid
editing `hero-scene.tsx`, `hero-controls.css`, or `app/layout.tsx` inside specialist
branches unless the task explicitly changes composition. The integration branch owns
layer order, shared controls, and final visual QA.

Every specialist branch should run TypeScript, lint, a production build, and desktop/
mobile visual checks before handoff.
