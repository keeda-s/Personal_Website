import InboxDemo from "../InboxDemo";
import Reveal from "../Reveal";

export default function InboxDemoSection() {
  return (
    <section
      id="inbox"
      aria-labelledby="inbox-heading"
      className="border-y border-[var(--v-line)] bg-[var(--v-surface-2)]"
    >
      <div className="mx-auto w-full max-w-6xl px-6 py-16 md:py-24">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 id="inbox-heading" className="text-3xl font-bold tracking-tight md:text-5xl">
            See it from your side.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-[var(--v-ink-soft)]">
            This is the view you would open when your phone stays quiet: the full transcript,
            the original language beside the English gloss, and only the decisions that are
            actually yours.
          </p>
        </Reveal>

        <Reveal className="mt-12" delayMs={100}>
          <InboxDemo />
        </Reveal>
      </div>
    </section>
  );
}
