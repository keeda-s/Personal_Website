"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import InboxDemo from "../components/InboxDemo";
import Reveal from "../components/Reveal";
import { firstMessageDisclosure, owner, villa } from "../demo-data";
import { siteConfig } from "../site-config";

const TOTAL_STEPS = 3;

const stepTitles = [
  "Create your concierge agent",
  "Connect WhatsApp",
  "Meet your owner inbox",
] as const;

/** Both WhatsApp paths are simulated in this demo; these are the real future choices. */
const whatsappOptions = [
  {
    id: "dedicated",
    title: "A dedicated villa number in your own WhatsApp Business",
    body: "Recommended. The villa gets its own number and profile; guests message “the villa”, and your personal number never appears. Guided setup takes roughly 5–8 minutes.",
    badge: "Demo — live connection is pending WhatsApp Business verification",
    tag: "Recommended",
  },
  {
    id: "coexist",
    title: "Coexist with your current number",
    body: "Keep using the number you already have for the villa. Setup is quicker, but guest history and the villa's identity stay on your personal account.",
    badge: "Demo — live connection is pending WhatsApp Business verification",
    tag: "",
  },
] as const;

export default function OnboardingPage() {
  const [step, setStep] = useState(1);
  const [villaName, setVillaName] = useState<string>(villa.name);
  const [agentName, setAgentName] = useState<string>(siteConfig.productName);

  // ?step=N deep-link. Read from location on mount so this stays a static page.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requested = Number.parseInt(params.get("step") ?? "", 10);
    if (requested >= 1 && requested <= TOTAL_STEPS) {
      setStep(requested);
    } else {
      window.history.replaceState(null, "", `/villa/onboarding/?step=${step}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the URL in sync so each step is shareable.
  useEffect(() => {
    if (typeof window !== "undefined" && !window.location.search.includes(`step=${step}`)) {
      window.history.replaceState(null, "", `/villa/onboarding/?step=${step}`);
    }
  }, [step]);

  const disclosure = firstMessageDisclosure(villaName, owner.firstName);

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-14 md:py-20">
      <p className="text-sm font-semibold uppercase tracking-wide text-[var(--v-ink-soft)]">
        <Link href="/villa/" className="underline decoration-[var(--v-line)] hover:decoration-[var(--v-green)]">
          Villa Concierge
        </Link>{" "}
        · onboarding demo
      </p>

      <Reveal>
        <h1 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
          {stepTitles[step - 1]}
        </h1>
        <p className="mt-3 text-[var(--v-ink-soft)]">
          A labelled walkthrough. Nothing is created, nothing connects, no guest is messaged —
          every step below is simulated fixture content.
        </p>
      </Reveal>

      {/* Progress dots */}
      <Reveal>
        <ol className="mt-8 flex items-center gap-3" aria-label={`Step ${step} of ${TOTAL_STEPS}`}>
          {stepTitles.map((title, index) => {
            const position = index + 1;
            const isDone = position < step;
            const isCurrent = position === step;
            return (
              <li key={title} className="flex items-center gap-2">
                <span
                  aria-current={isCurrent ? "step" : undefined}
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold ${
                    isCurrent
                      ? "bg-[var(--v-green)] text-white"
                      : isDone
                        ? "bg-[var(--v-green-soft)] text-[var(--v-green)]"
                        : "border border-[var(--v-line)] bg-[var(--v-surface)] text-[var(--v-ink-soft)]"
                  }`}
                >
                  {isDone ? "✓" : position}
                </span>
                <span className="hidden text-xs text-[var(--v-ink-soft)] md:inline">{title}</span>
                {position < TOTAL_STEPS ? (
                  <span aria-hidden="true" className="text-[var(--v-line)]">
                    —
                  </span>
                ) : null}
              </li>
            );
          })}
        </ol>
      </Reveal>

      <div className="mt-8 rounded-3xl border border-[var(--v-line)] bg-[var(--v-surface)] p-6 md:p-8">
        {step === 1 ? (
          <Reveal>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label htmlFor="villa-name" className="block text-sm font-semibold">
                  Villa name
                </label>
                <input
                  id="villa-name"
                  type="text"
                  value={villaName}
                  onChange={(event) => setVillaName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[var(--v-line)] bg-[var(--v-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--v-green)]"
                />
                <label htmlFor="agent-name" className="mt-4 block text-sm font-semibold">
                  Agent name
                </label>
                <input
                  id="agent-name"
                  type="text"
                  value={agentName}
                  onChange={(event) => setAgentName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[var(--v-line)] bg-[var(--v-bg)] px-3 py-2 text-sm outline-none focus:border-[var(--v-green)]"
                />
                <p className="mt-3 text-xs leading-relaxed text-[var(--v-ink-soft)]">
                  This is a preview only. No agent is created by this demo.
                </p>
              </div>

              <div className="rounded-2xl border border-[var(--v-line)] bg-[#d9fdd3] p-4">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-[#075e54]">
                    Guest&apos;s first message · sent as {agentName.trim() || siteConfig.productName}
                  </span>
                  <span className="rounded-full border border-[#075e54]/30 bg-white/60 px-2 py-px text-[9px] font-bold uppercase tracking-wide text-[#075e54]">
                    Demo
                  </span>
                </div>
                <p className="text-[13px] leading-relaxed">{disclosure}</p>
                <p className="mt-3 text-[11px] text-[#0b1f14]/70">
                  Shown as the guest would receive it: one WhatsApp number for the villa, AI and
                  affiliate disclosure up front.
                </p>
              </div>
            </div>
          </Reveal>
        ) : null}

        {step === 2 ? (
          <Reveal>
            <div className="grid gap-4 md:grid-cols-2">
              {whatsappOptions.map((option) => (
                <div
                  key={option.id}
                  className="flex flex-col rounded-2xl border border-[var(--v-line)] bg-[var(--v-bg)] p-5"
                >
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--v-ink-soft)]">
                      {option.tag || "Option"}
                    </span>
                    <span className="rounded-full border border-[var(--v-amber)]/40 bg-[var(--v-amber-soft)] px-2 py-px text-[9px] font-bold uppercase tracking-wide text-[var(--v-amber)]">
                      Demo
                    </span>
                  </div>
                  <h2 className="text-base font-semibold leading-snug">{option.title}</h2>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--v-ink-soft)]">
                    {option.body}
                  </p>
                  <p className="mt-3 text-[11px] font-medium text-[var(--v-amber)]">
                    {option.badge}
                  </p>
                </div>
              ))}
            </div>
            <p className="mt-5 rounded-xl bg-[var(--v-surface-2)] px-4 py-3 text-sm text-[var(--v-ink-soft)]">
              Real connection requires WhatsApp Business verification — not part of this demo.
            </p>
          </Reveal>
        ) : null}

        {step === 3 ? (
          <Reveal>
            <InboxDemo badge="Prototype — simulated stay, demo data" />
          </Reveal>
        ) : null}

        {/* Back / next */}
        <div className="mt-8 flex items-center justify-between border-t border-[var(--v-line)] pt-5">
          <button
            type="button"
            onClick={() => setStep((current) => Math.max(1, current - 1))}
            disabled={step === 1}
            className="rounded-full border border-[var(--v-line)] px-5 py-2 text-sm font-semibold text-[var(--v-ink-soft)] transition enabled:cursor-pointer enabled:hover:bg-[var(--v-surface-2)] disabled:opacity-40"
          >
            Back
          </button>
          {step < TOTAL_STEPS ? (
            <button
              type="button"
              onClick={() => setStep((current) => Math.min(TOTAL_STEPS, current + 1))}
              className="cursor-pointer rounded-full bg-[var(--v-green)] px-6 py-2 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Next
            </button>
          ) : (
            <Link
              href="/villa/"
              className="rounded-full border border-[var(--v-green)]/40 px-6 py-2 text-sm font-semibold text-[var(--v-green)] transition hover:bg-[var(--v-green-soft)]"
            >
              Back to the overview
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}
