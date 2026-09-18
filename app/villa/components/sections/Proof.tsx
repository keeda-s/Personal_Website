import Reveal from "../Reveal";
import { siteConfig } from "../../site-config";

const principles = [
  "Answers only from your guidebook — nothing else.",
  "Escalate, don't resolve: sensitive messages become a ping with a suggested reply.",
  "Guests see one WhatsApp number for the villa; your personal number never appears.",
  "AI and affiliate links are disclosed in the first message.",
  "In your transcript view, the original language sits beside the English gloss.",
];

export default function Proof() {
  return (
    <section aria-labelledby="proof-heading" className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
      <div className="grid gap-10 md:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <h2 id="proof-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
            Why we built this
          </h2>
          <p className="mt-4 leading-relaxed text-[var(--v-ink-soft)]">
            We know villa owners who manage their own places because they care about how guests
            are treated — and who are drowning in guest messages because of it. This is being
            built for them, in that order: get the comms right first, then everything else.
          </p>
          <p className="mt-4 leading-relaxed text-[var(--v-ink-soft)]">
            No testimonials, no logos, no case studies yet — the pilot hasn&apos;t run. What
            follows is what the product is being held to.
          </p>
        </Reveal>

        <Reveal delayMs={100}>
          <div className="rounded-2xl border border-[var(--v-line)] bg-[var(--v-surface)] p-6 md:p-8">
            <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--v-ink-soft)]">
              Design principles
            </h3>
            <ul className="mt-4 space-y-3">
              {principles.map((principle) => (
                <li key={principle} className="flex gap-3 leading-relaxed">
                  <span aria-hidden="true" className="mt-1 text-[var(--v-green)]">
                    ✓
                  </span>
                  <span>{principle}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-xl bg-[var(--v-green-soft)] p-4">
              <p className="text-sm leading-relaxed text-[var(--v-ink)]">
                {siteConfig.processClaim}
              </p>
            </div>
            <p className="mt-6 text-sm font-medium text-[var(--v-ink-soft)]">
              {siteConfig.launch.line}
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
