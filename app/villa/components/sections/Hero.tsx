import Link from "next/link";
import Reveal from "../Reveal";
import { agent, guest, thread, villa } from "../../demo-data";
import { siteConfig } from "../../site-config";

/** Compact static rendering of the fixture thread for the hero phone frame. */
function HeroThread() {
  const pre = thread.filter((item): item is Extract<typeof item, { kind: "message" }> =>
    item.kind === "message" ? item.id <= 5 : false,
  );

  return (
    <div className="w-full max-w-xs rounded-[2rem] border-8 border-[#123327] bg-[#ece5dd] shadow-xl">
      <div className="flex items-center justify-between rounded-t-[1.3rem] bg-[var(--v-wa-ink)] px-3 py-2">
        <div className="leading-tight">
          <p className="text-[12px] font-semibold text-white">{villa.name}</p>
          <p className="text-[10px] text-white/80">WhatsApp · {agent.phone}</p>
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-wide text-white/70">
          guest view
        </span>
      </div>
      <ul className="flex flex-col gap-2 px-2.5 py-3">
        {pre.map((message) => (
          <li
            key={message.id}
            className={`max-w-[92%] px-2.5 py-1.5 text-[11px] leading-snug shadow-sm ${
              message.direction === "guest"
                ? "self-start rounded-2xl rounded-bl-sm bg-white text-[var(--v-ink)]"
                : "self-end rounded-2xl rounded-br-sm bg-[#d9fdd3] text-[#0b1f14]"
            }`}
          >
            <p>{message.text}</p>
          </li>
        ))}
        {/* Escalation card slides in on reveal (section 1 visual contract). */}
        <Reveal className="mt-1">
          <div className="rounded-xl border border-[var(--v-amber)]/40 bg-[var(--v-amber-soft)] px-2.5 py-2 text-[10px] leading-snug shadow-sm">
            <span className="mb-1 inline-block rounded-full bg-[var(--v-amber)] px-1.5 py-px text-[8px] font-bold uppercase tracking-wide text-white">
              Escalation ping · money + booking change
            </span>
            <p className="text-[var(--v-ink)]">
              “Our flight is delayed… we can pay an extra charge.” → pinged to you, with a
              suggested reply.
            </p>
          </div>
        </Reveal>
      </ul>
      <p className="px-3 pb-2.5 text-center text-[9px] text-[var(--v-ink-soft)]">
        Guest on {guest.phone} · simulated conversation
      </p>
    </div>
  );
}

export default function Hero() {
  return (
    <header className="mx-auto w-full max-w-6xl px-6 pb-16 pt-14 md:pb-24 md:pt-20">
      <div className="grid items-center gap-12 md:grid-cols-[1.15fr_0.85fr]">
        <Reveal>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--v-green)]/30 bg-[var(--v-green-soft)] px-3 py-1 text-xs font-semibold text-[var(--v-green)]">
            {siteConfig.productName} · pilot-stage
          </p>
          <h1 className="text-balance text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">
            {siteConfig.hero.h1}
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--v-ink-soft)]">
            {siteConfig.hero.sub}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/villa/onboarding"
              className="rounded-full bg-[var(--v-green)] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              {siteConfig.hero.primaryCta}
            </Link>
            <a
              href={siteConfig.hero.secondaryHref}
              className="rounded-full border border-[var(--v-green)]/40 px-6 py-3 text-sm font-semibold text-[var(--v-green)] transition hover:bg-[var(--v-green-soft)]"
            >
              {siteConfig.hero.secondaryCta}
            </a>
          </div>
        </Reveal>

        <Reveal className="flex flex-col items-center gap-3" delayMs={120}>
          <HeroThread />
          <p className="text-xs font-medium text-[var(--v-ink-soft)]">
            {siteConfig.hero.demoBadge}
          </p>
        </Reveal>
      </div>
    </header>
  );
}
