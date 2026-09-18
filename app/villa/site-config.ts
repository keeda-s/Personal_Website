/**
 * Single source of truth for the /villa marketing subtree.
 *
 * Every claim here is drawn from the Villa Concierge claim whitelist
 * (prospectus §1/§3, AGENT_ARCHITECTURE §2.4–2.5). If a sentence cannot be
 * traced to a source doc, it does not belong here. Working name only —
 * the real brand is decided after G0.
 */

export const siteConfig = {
  /** Working product name (Decisions #1: shipped until the real brand lands). */
  productName: "Villa Concierge",

  /** One-sentence description (also used for the /villa metadata description). */
  description:
    "A WhatsApp-first AI concierge for self-managing villa owners: guests get instant answers 24/7 in their own language, and you are pinged only for the messages that need your judgment.",

  /** Hero (section 1). */
  hero: {
    h1: "Your villa's guest chat, answered. You only hear about what matters.",
    sub: "A WhatsApp-first AI concierge for self-managing villa owners. Guests get instant answers 24/7, in their own language. You get pinged only for the few messages that need a human.",
    primaryCta: "Create your concierge agent",
    secondaryCta: "See the owner inbox",
    secondaryHref: "#inbox",
    demoBadge: "Interactive demo — simulated conversation",
  },

  /** Labels for simulated surfaces (honesty rules are hard limits). */
  badges: {
    demo: "Demo",
    prototype: "Prototype",
  },

  /** Pricing (prospectus §1). All figures are pilot-stage. */
  pricing: {
    monthly: { min: 99, max: 149, unit: "per property / month" },
    onboarding: { min: 99, max: 199, unit: "one-off" },
    pmWhiteLabel: { min: 10, max: 25, unit: "property/month" },
    badge: "Pilot pricing — WA South West first.",
    cardHeading: "Flat $99–149/property/month — priced per property, not per message.",
  },

  /** Launch posture (GTM Phase 1). */
  launch: {
    region: "Western Australia's South West",
    line: "Launching first in Western Australia's South West — a 3-villa pilot.",
  },

  /** Process claim (SPEC-s1 rubric): stated as a gate, never as a result. */
  processClaim:
    "Before a single guest talks to it, the agent must pass a scripted test suite — 90%+ correct across answer / refuse / escalate scenarios.",

  /**
   * VERIFY (needs Keeda, before deploy): replace with the real address.
   * The placeholder must not be the visible final state.
   */
  contactEmail: "hello@example.com",
} as const;

export type SiteConfig = typeof siteConfig;
