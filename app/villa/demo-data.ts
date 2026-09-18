/**
 * Synthetic fixture module — the demo's single source of truth.
 *
 * HONESTY NOTE
 * ------------
 * Every person, villa, partner and phone number below is invented. No real
 * guest data, addresses or partner rates appear here (villa-concierge
 * AGENTS.md). Phone numbers use reserved fake ranges only:
 *   +61 400 000 000 (guest) and +61 499 999 999 (villa number).
 *
 * The French guest reply contains the WiFi literal `Shorebird!26`
 * byte-identical to the English gloss (research 08 §5 literal-parity rule): a
 * fact passes through untouched, in the guest's language, and the owner view
 * shows the original beside its English gloss.
 *
 * When the agent-core fixtures (SPEC-s1) exist, sync this file from them rather
 * than editing it in parallel.
 */

export type Lang = "en" | "fr";

/** guest = inbound from the traveller; agent = concierge voice; steer = owner-approved reply sent in the agent voice. */
export type Direction = "guest" | "agent" | "steer";

export interface Message {
  kind: "message";
  id: number;
  direction: Direction;
  lang: Lang;
  /** Original text, exactly as sent (French for the guest in this fixture). */
  text: string;
  /** English gloss for non-English rows — the owner view shows it side by side. */
  enGloss?: string;
  time: string;
}

export interface Escalation {
  kind: "escalation";
  id: number;
  /** What tripped the escalate-don't-resolve rule. */
  trigger: string;
  reason: string;
  /** Templated suggested reply. Quotes no price, commits to nothing. */
  suggestedReply: string;
  /** Label rendered on the Approve / Steer control. */
  steerLabel: string;
}

export type ThreadItem = Message | Escalation;

export const villa = {
  name: "Willow Bay Retreat",
  /** Synthetic place name in the WA South West. */
  region: "Western Australia's South West",
  synthetic: true,
} as const;

export const owner = {
  firstName: "Sarah",
  synthetic: true,
} as const;

export const guest = {
  firstName: "Camille",
  phone: "+61 400 000 000",
  lang: "fr" as Lang,
  synthetic: true,
} as const;

export const agent = {
  displayName: "Villa Concierge",
  /** The villa's dedicated WhatsApp number — the only number a guest ever sees. */
  phone: "+61 499 999 999",
} as const;

export const partner = {
  name: "Margaret Eco Cruises",
  synthetic: true,
} as const;

const msg = (
  id: number,
  direction: Direction,
  lang: Lang,
  time: string,
  text: string,
  enGloss?: string,
): Message => ({ kind: "message", id, direction, lang, time, text, enGloss });

/* ------------------------------------------------------------------------- */
/* The 8-item in-stay thread (research-08 conversation shape)                 */
/* ------------------------------------------------------------------------- */

/** 1 — Camille, in French: the WiFi has stopped working; asks for the password. */
const m1 = msg(
  1,
  "guest",
  "fr",
  "07:12",
  "Bonjour, le wifi ne marche plus dans la villa. Quel est le mot de passe ? Merci !",
  "Hello, the wifi has stopped working in the villa. What is the password? Thank you!",
);

/**
 * 2 — The concierge replies in French. This is the guest's FIRST message from
 * the agent, so it carries both disclosures (AI + affiliate) and passes the
 * WiFi fact through untouched.
 */
const m2 = msg(
  2,
  "agent",
  "fr",
  "07:12",
  "Bonjour Camille ! Je suis l'assistant IA de Willow Bay Retreat, pas une personne. Si je vous recommande une sortie, elle passe parfois par un lien partenaire. Votre mot de passe wifi est : Shorebird!26 — recopiez-le exactement, majuscule et point d'exclamation compris. Si ça ne fonctionne toujours pas, dites-le-moi et je préviens Sarah.",
  "Hello Camille! I'm the AI assistant for Willow Bay Retreat, not a person. If I recommend an outing, it sometimes goes through a partner link. Your wifi password is: Shorebird!26 — copy it exactly, capital letter and exclamation mark included. If it still doesn't work, tell me and I'll let Sarah know.",
);

/** 3 — Camille asks about a boat trip tomorrow. */
const m3 = msg(
  3,
  "guest",
  "fr",
  "09:41",
  "Nous aimerions faire une sortie en bateau demain matin. Que recommandez-vous ?",
  "We'd like to do a boat trip tomorrow morning. What do you recommend?",
);

/** 4 — One curated partner recommendation; the affiliate disclosure stands from message 2. */
const m4 = msg(
  4,
  "agent",
  "fr",
  "09:41",
  "Vous êtes à quelques minutes du quai de Margaret Eco Cruises — ils font une sortie en bateau le matin, départ 8 h. Je vous envoie leur lien de réservation ; c'est un partenaire local. Je ne fixe pas les prix — ils sont sur leur site.",
  "You're a few minutes from the Margaret Eco Cruises jetty — they run a morning boat trip, departing 8am. I'll send their booking link; it's a local partner. I don't set prices — those are on their site.",
);

/** 5 — Camille's flight is delayed; she asks for a late checkout and offers to pay. */
const m5 = msg(
  5,
  "guest",
  "fr",
  "18:03",
  "Notre vol est retardé, nous ne pourrons pas partir avant 16 h. Est-ce possible de garder la villa plus tard ? Nous pouvons payer un supplément.",
  "Our flight is delayed, we can't leave before 4pm. Is it possible to keep the villa later? We can pay an extra charge.",
);

/**
 * 6 — Escalation card (prototype rendering of the S3 ping design).
 * Tripwire: money + booking change. The agent never quotes a price; it hands
 * the decision to the owner with a suggested reply.
 */
export const escalation: Escalation = {
  kind: "escalation",
  id: 6,
  trigger: "Money + booking change",
  reason:
    "The guest offered to pay for a late checkout. The agent never moves money or agrees to booking changes — so this became a ping to Sarah instead of a reply.",
  suggestedReply:
    "Thanks for letting me know about the delay. I'm checking with the owner about keeping the villa a little later today and will confirm the details shortly.",
  steerLabel: "Steer: the agent replies in its own voice — you stay invisible",
};

/** 7 — Owner taps Approve: the reply goes out in the agent voice (prototype). */
const m7 = msg(
  7,
  "steer",
  "en",
  "18:09",
  "Good news — the owner has approved a later checkout for you. You're welcome to stay until 2pm today. Have a safe trip home!",
);

/** 8 — Camille thanks the villa. */
const m8 = msg(
  8,
  "guest",
  "fr",
  "18:10",
  "Merci beaucoup ! C'est très gentil.",
  "Thank you very much! That's very kind.",
);

/** The full 8-item thread. Index 5 is the escalation card. */
export const thread: ThreadItem[] = [m1, m2, m3, m4, m5, escalation, m7, m8];

/** How many items are visible before the owner steers (messages 1–5 + the escalation card). */
export const PRE_STEER_COUNT = 6;

/** The honest caption used under every rendering of the demo. */
export const inboxCaption =
  "Design preview of the owner inbox — simulated stay, demo data. Live guest chat and takeover arrive with the pilot.";

/** Badge for the prototype transcript surface. */
export const inboxPrototypeBadge = "Prototype — simulated stay, demo data";

/**
 * First-message disclosure, parameterised for the wizard's step-1 preview.
 * Mirrors the real first guest message (AI + affiliate disclosed).
 */
export function firstMessageDisclosure(villaName: string, ownerName: string): string {
  const villaLabel = villaName.trim() || villa.name;
  const ownerLabel = ownerName.trim() || owner.firstName;
  return `Hi! You're chatting with the concierge for ${villaLabel} — an AI assistant, not a person. If I recommend an outing it sometimes goes through a partner link. I only answer from what ${ownerLabel} has approved, and I'll pass anything sensitive straight to them.`;
}
