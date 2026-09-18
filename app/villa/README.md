# /villa — Villa Concierge shell site

Owner-facing marketing page + labelled onboarding demo for the Villa Concierge
offer, served at `keeda-s.github.io/villa/`. Spec:
`villa-concierge/docs/specs/SPEC-shell-site-onboarding.md` (Conductor
amendments 1–4 apply: conditional export only, PR deliverable, screenshots
required).

## Provenance — every fixture is synthetic

Everything in `demo-data.ts` is invented:

- Villa **Willow Bay Retreat** — synthetic property, WA South West.
- Owner persona **Sarah**, guest persona **Camille** — synthetic people.
- Guest number **+61 400 000 000** and villa number **+61 499 999 999** —
  reserved fake ranges, chosen so no real subscriber can be dialed.
- Curated partner **Margaret Eco Cruises** — synthetic business, no rates.
- The WiFi literal `Shorebird!26` appears **byte-identical** in the French
  agent reply and in its English gloss (research 08 §5 literal-parity rule):
  facts pass through untouched. The owner view shows original + English gloss
  side by side.

When the agent-core fixtures (SPEC-s1) exist, sync `demo-data.ts` from them —
do not fork the content in parallel.

## Honesty table (this IS the demo contract)

| Surface | Status |
| --- | --- |
| Landing page content | LIVE (static) |
| Wizard step 1 (create agent) | LIVE UI, SIMULATED outcome — no agent is created; badged "Demo" |
| Wizard step 2 (connect WhatsApp) | SIMULATED — shows the real future choice (dedicated villa number in your own WhatsApp Business, ≈5–8 min guided setup, vs coexist with your current number), each badged "Demo — live connection is pending WhatsApp Business verification" |
| Wizard step 3 / owner inbox | PROTOTYPE — read-only synthetic transcript, badged "Prototype — simulated stay, demo data" |
| Steer action | PROTOTYPE — one scripted approve-and-send, rendered in agent voice, labelled "Steer: the agent replies in its own voice — you stay invisible" |
| Escalation ping card | PROTOTYPE rendering of the S3 ping design |
| French/English message pair | REAL fixture content obeying the literal-parity rule; rendering simulated (no live model) |
| Pricing / launch claims | LIVE copy from the claim whitelist, marked pilot-stage |

Hard limits honoured here:

- Every simulated surface carries a visible **Demo** or **Prototype** badge.
- Performance numbers appear only as design/test targets, never as results.
- No testimonials, no logos, no case studies, no invented results.
- The site makes **zero network calls beyond its own static assets** — no live
  LLM calls, no backend, no analytics added by this subtree.
- Scroll reveal is no-JS safe: content is visible by default; the hidden state
  is applied only when the `villa-js` class is present on `<html>` (added by an
  inline script in the villa layout).

## Files

- `site-config.ts` — single source of truth: name, tagline, prices, contact
  email, badge strings.
- `demo-data.ts` — the typed synthetic fixture module (thread, escalation,
  first-message disclosure).
- `page.tsx` — the 7 landing sections in the spec's order.
- `onboarding/page.tsx` — 3-step wizard with `?step=N` deep-link.
- `components/InboxDemo.tsx` — shared owner-inbox demo (section 4 + step 3).
- `components/Reveal.tsx` — IntersectionObserver reveal wrapper.

## Build / export

`next.config.ts` sets `output: "export"`, `trailingSlash: true` and
`images: { unoptimized: true }` **only when `NEXT_EXPORT` is set**, so the
default build is unchanged. It also narrows `pageExtensions` to `tsx`/`jsx` in
export mode, because the personal homepage's `app/api/*/route.ts` handlers are
not statically exportable and would otherwise fail the Pages build; they are a
Vercel feature, not part of /villa. `.github/workflows/deploy-pages.yml` is the
only place that sets `NEXT_EXPORT=1`.

## VERIFY (needs Keeda, not the builder)

- Replace the placeholder contact email `hello@example.com` in
  `site-config.ts` with the real address before deploy.
- Enable GitHub Pages (Settings → Pages → Source: GitHub Actions) and merge the
  PR; the first deploy serves `/villa/`. Do not claim deployed before this.
