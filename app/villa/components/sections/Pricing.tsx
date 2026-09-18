import Reveal from "../Reveal";
import { siteConfig } from "../../site-config";

const inclusions = [
  "24/7 post-booking guest comms, in the guest's own language",
  "Answers drawn only from your owner-approved guidebook — facts like the WiFi password pass through untouched",
  "Curated local partner recommendations, with the affiliate link disclosed in the chat",
  "Escalation with a suggested reply for anything sensitive — approve with one tap",
  "A weekly report: what guests asked, what was escalated, what to fix",
  "One WhatsApp number for the villa — your personal number never appears",
];

export default function Pricing() {
  const { pricing } = siteConfig;

  return (
    <section
      aria-labelledby="pricing-heading"
      className="border-y border-[var(--v-line)] bg-[var(--v-surface-2)]"
    >
      <div className="mx-auto w-full max-w-4xl px-6 py-16 md:py-20">
        <Reveal className="text-center">
          <h2 id="pricing-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
            Pricing
          </h2>
          <p className="mt-3 inline-flex items-center gap-2 rounded-full border border-[var(--v-green)]/30 bg-[var(--v-green-soft)] px-3 py-1 text-xs font-semibold text-[var(--v-green)]">
            {pricing.badge}
          </p>
        </Reveal>

        <Reveal className="mt-10" delayMs={80}>
          <div className="rounded-3xl border border-[var(--v-line)] bg-[var(--v-surface)] p-8 md:p-10">
            <p className="text-2xl font-bold leading-snug md:text-3xl">{pricing.cardHeading}</p>

            <ul className="mt-8 grid gap-3 md:grid-cols-2">
              {inclusions.map((item) => (
                <li key={item} className="flex gap-3 leading-relaxed text-[var(--v-ink-soft)]">
                  <span aria-hidden="true" className="mt-0.5 text-[var(--v-green)]">
                    ✓
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-8 space-y-2 border-t border-[var(--v-line)] pt-6 text-[var(--v-ink-soft)]">
              <p>
                One-off onboarding:{" "}
                <span className="font-semibold text-[var(--v-ink)]">
                  ${pricing.onboarding.min}–{pricing.onboarding.max}
                </span>{" "}
                ({pricing.onboarding.unit}).
              </p>
              <p>
                Property managers: white-label from{" "}
                <span className="font-semibold text-[var(--v-ink)]">
                  ${pricing.pmWhiteLabel.min}–{pricing.pmWhiteLabel.max}/{pricing.pmWhiteLabel.unit}
                </span>{" "}
                — talk to us.
              </p>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
