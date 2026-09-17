import Link from "next/link";
import Reveal from "../Reveal";
import { siteConfig } from "../../site-config";

const faqs = [
  {
    q: "Is it really AI?",
    a: "Yes. Guests are told exactly that in the first message — the concierge introduces itself as an AI assistant before anything else.",
  },
  {
    q: "Will my guests know?",
    a: "They see one WhatsApp number for the villa, and the first message carries the AI disclosure (plus the affiliate disclosure, since some recommendations go through partner links).",
  },
  {
    q: "What if it can't answer?",
    a: "It escalates to you with a suggested reply. It never free-wings an answer outside your approved guidebook.",
  },
  {
    q: "What about money questions?",
    a: "It never quotes prices or takes payments. Anything that touches money or booking changes comes to you as a ping with a suggested reply.",
  },
  {
    q: "What if a stranger messages the number?",
    a: "Nothing. It only replies to guests bound to an active stay — everyone else passes through unanswered.",
  },
  {
    q: "Where are you launching?",
    a: "Western Australia's South West, with a 3-villa pilot.",
  },
  {
    q: "What about privacy?",
    a: "We hold only a first name and a WhatsApp number, and chat data is purged 30 days after checkout.",
  },
];

export default function FaqCta() {
  return (
    <section aria-labelledby="faq-heading" className="mx-auto w-full max-w-4xl px-6 py-16 md:py-20">
      <Reveal>
        <h2 id="faq-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
          Questions
        </h2>
      </Reveal>

      <Reveal className="mt-8" delayMs={60}>
        <div className="divide-y divide-[var(--v-line)] rounded-2xl border border-[var(--v-line)] bg-[var(--v-surface)]">
          {faqs.map((faq) => (
            <details key={faq.q} className="group px-6 py-4">
              <summary className="cursor-pointer list-none text-base font-semibold marker:hidden">
                <span aria-hidden="true" className="mr-2 text-[var(--v-green)]">
                  +
                </span>
                {faq.q}
              </summary>
              <p className="mt-2 pl-6 leading-relaxed text-[var(--v-ink-soft)]">{faq.a}</p>
            </details>
          ))}
        </div>
      </Reveal>

      <Reveal className="mt-12" delayMs={80}>
        <div className="rounded-3xl bg-[var(--v-green)] px-8 py-10 text-center text-white">
          <h3 className="text-2xl font-bold md:text-3xl">Set up your villa in three steps</h3>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-white/85">
            The walkthrough is a labelled demo: nothing is created, nothing connects, no guest is
            messaged. It exists so you can see the shape of the product before the pilot.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/villa/onboarding"
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-[var(--v-green)] transition hover:bg-white/90"
            >
              {siteConfig.hero.primaryCta}
            </Link>
            {/* VERIFY(site-config): placeholder email — set Keeda's real address before deploy. */}
            <a
              href={`mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent(
                `${siteConfig.productName} — villa pilot`,
              )}`}
              className="rounded-full border border-white/50 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Talk to us
            </a>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
