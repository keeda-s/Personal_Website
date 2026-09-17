import Reveal from "../Reveal";

const steps = [
  {
    title: "One dedicated WhatsApp number for the villa",
    body: 'Guests message "the villa" — a single number that stays with the property. Your personal number never appears.',
  },
  {
    title: "The concierge answers from your approved guidebook",
    body: "In the guest's language, 24/7. Facts like WiFi passwords pass through untouched — the agent never improves on what you approved.",
  },
  {
    title: "Anything sensitive is escalated to you",
    body: "Money, complaints, booking changes — it pings you with a suggested reply. You approve with one tap, and the reply goes out in the agent's voice.",
  },
];

const nevers = [
  "never quotes prices",
  "never negotiates",
  "never moves money",
  "never handles emergencies itself",
  "never texts guests first",
];

export default function HowItWorks() {
  return (
    <section aria-labelledby="how-heading" className="mx-auto w-full max-w-6xl px-6 py-16 md:py-20">
      <Reveal>
        <h2 id="how-heading" className="text-3xl font-bold tracking-tight md:text-4xl">
          How it works
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-[var(--v-ink-soft)]">
          Three steps — the same loop that would run on your villa from day one of the pilot.
        </p>
      </Reveal>

      <ol className="mt-10 grid gap-6 md:grid-cols-3">
        {steps.map((step, index) => (
          <Reveal as="li" key={step.title} delayMs={index * 90}>
            <div className="h-full rounded-2xl border border-[var(--v-line)] bg-[var(--v-surface)] p-6">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--v-green)] text-sm font-bold text-white"
              >
                {index + 1}
              </span>
              <h3 className="mt-4 text-lg font-semibold leading-snug">{step.title}</h3>
              <p className="mt-2 leading-relaxed text-[var(--v-ink-soft)]">{step.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal delayMs={100}>
        <div className="mt-10 rounded-2xl border border-[var(--v-green)]/25 bg-[var(--v-green-soft)] p-6">
          <h3 className="text-sm font-bold uppercase tracking-wide text-[var(--v-green)]">
            What it will never do
          </h3>
          <p className="mt-2 text-[var(--v-ink-soft)]">
            Honesty is the feature, not the footnote: {nevers.join("; ")}.
          </p>
        </div>
      </Reveal>
    </section>
  );
}
