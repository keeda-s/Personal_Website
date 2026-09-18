import Reveal from "../Reveal";

const rows = [
  {
    label: "Full-service property management",
    detail: "10–20% commission on every booking, for someone else to run the whole thing.",
  },
  {
    label: "Message-automation SaaS",
    detail: "$38–56/month that auto-replies on template — no judgment about which message actually matters.",
  },
  {
    label: "AI concierge suites",
    detail: "$120–899/month, with WhatsApp as an afterthought rather than the front door.",
  },
];

export default function Pain() {
  return (
    <section aria-labelledby="pain-heading" className="border-y border-[var(--v-line)] bg-[var(--v-surface-2)]">
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
        <Reveal>
          <h2 id="pain-heading" className="max-w-3xl text-3xl font-bold leading-tight tracking-tight md:text-4xl">
            Running a villa is 60–240 guest messages a month. Most are the same ten questions.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[var(--v-ink-soft)]">
            Your phone buzzes at 11pm about the wifi. Again. You translate a parking question,
            forward a jetty recommendation, and explain — politely — that checkout is at 10am.
            The messages are never hard. They are just endless, and they arrive at dinner.
          </p>
        </Reveal>

        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {rows.map((row, index) => (
            <Reveal as="li" key={row.label} delayMs={index * 90}>
              <div className="h-full rounded-2xl border border-[var(--v-line)] bg-[var(--v-surface)] p-6">
                <p className="text-sm font-semibold uppercase tracking-wide text-[var(--v-ink-soft)]">
                  {row.label}
                </p>
                <p className="mt-3 text-[var(--v-ink)]">{row.detail}</p>
              </div>
            </Reveal>
          ))}
        </ul>

        <Reveal delayMs={120}>
          <p className="mt-10 text-center text-xl font-semibold text-[var(--v-green)] md:text-2xl">
            The layer you actually need — comms + concierge, one flat price.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
