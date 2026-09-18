"use client";

import { useState } from "react";
import {
  agent,
  guest,
  inboxCaption,
  inboxPrototypeBadge,
  PRE_STEER_COUNT,
  thread,
  villa,
  type Message,
} from "../demo-data";

const directionStyles: Record<Message["direction"], string> = {
  guest: "self-start bg-white text-[var(--v-ink)] rounded-2xl rounded-bl-sm",
  agent: "self-end bg-[#d9fdd3] text-[#0b1f14] rounded-2xl rounded-br-sm",
  steer: "self-end bg-[#d9fdd3] text-[#0b1f14] rounded-2xl rounded-br-sm",
};

function directionLabel(direction: Message["direction"]): string {
  if (direction === "guest") return `${guest.firstName} · guest`;
  if (direction === "steer") return `${agent.displayName} (steered reply)`;
  return agent.displayName;
}

function MessageRow({ message }: { message: Message }) {
  const isGuestNonEn = message.direction === "guest" && message.lang !== "en";
  return (
    <li className="flex flex-col gap-1">
      <div
        className={`${directionStyles[message.direction]} max-w-[92%] px-3 py-2 text-[13px] leading-snug shadow-sm`}
      >
        <div className="mb-1 flex items-center gap-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--v-ink-soft)]">
            {directionLabel(message.direction)}
          </span>
          <span className="rounded-full border border-[var(--v-line)] bg-white/70 px-1.5 py-px text-[9px] font-semibold uppercase tracking-wide text-[var(--v-ink-soft)]">
            {message.lang.toUpperCase()}
          </span>
        </div>
        <p>{message.text}</p>
      </div>
      {isGuestNonEn && message.enGloss ? (
        <div className="max-w-[92%] self-start rounded-xl border border-dashed border-[var(--v-line)] bg-[var(--v-surface-2)] px-3 py-2 text-[12px] leading-snug">
          <span className="mr-1.5 text-[9px] font-semibold uppercase tracking-wide text-[var(--v-amber)]">
            EN gloss
          </span>
          <p className="text-[var(--v-ink-soft)]">{message.enGloss}</p>
        </div>
      ) : null}
    </li>
  );
}

/**
 * The owner-inbox demo: a read-only synthetic transcript in a CSS phone frame,
 * the escalation card, and exactly one Steer action.
 *
 * Honesty contract: this is a PROTOTYPE of badged fixtures — no transcript is
 * fetched, no message is sent, no agent is running. The owner view shows the
 * original text beside its English gloss for non-English rows.
 */
export default function InboxDemo({ badge = inboxPrototypeBadge }: { badge?: string }) {
  const [steered, setSteered] = useState(false);

  const visible = steered ? thread : thread.slice(0, PRE_STEER_COUNT);

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <p className="inline-flex items-center gap-2 rounded-full border border-[var(--v-amber)]/40 bg-[var(--v-amber-soft)] px-3 py-1 text-xs font-semibold text-[var(--v-amber)]">
        <span aria-hidden="true">▣</span> {badge}
      </p>

      <div className="w-full max-w-sm rounded-[2.25rem] border-[10px] border-[#123327] bg-[#ece5dd] shadow-2xl">
        {/* WhatsApp chat header — the only number a guest ever sees. */}
        <div className="flex items-center justify-between rounded-t-[1.6rem] bg-[var(--v-wa-ink)] px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white/15 text-sm"
            >
              🏠
            </span>
            <div className="leading-tight">
              <p className="text-sm font-semibold text-white">{villa.name}</p>
              <p className="text-[11px] text-white/80">WhatsApp · {agent.phone}</p>
            </div>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-white/70">
            owner view
          </span>
        </div>

        {/* Thread */}
        <ul className="flex min-h-[22rem] flex-col gap-2.5 px-3 py-4">
          {visible.map((item) =>
            item.kind === "message" ? (
              <MessageRow key={item.id} message={item} />
            ) : (
              <li key={item.id} className="my-1">
                <div className="rounded-2xl border border-[var(--v-amber)]/40 bg-[var(--v-amber-soft)] p-3 shadow-sm">
                  <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="rounded-full bg-[var(--v-amber)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                      Escalation ping
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-[var(--v-amber)]">
                      {item.trigger}
                    </span>
                  </div>
                  <p className="text-[12px] leading-snug text-[var(--v-ink)]">{item.reason}</p>
                  <div className="mt-2 rounded-xl border border-[var(--v-line)] bg-white px-3 py-2">
                    <span className="text-[9px] font-semibold uppercase tracking-wide text-[var(--v-ink-soft)]">
                      Suggested reply (no price quoted)
                    </span>
                    <p className="mt-0.5 text-[12px] leading-snug">{item.suggestedReply}</p>
                  </div>

                  {steered ? (
                    <p className="mt-2 rounded-xl bg-[var(--v-green-soft)] px-3 py-2 text-[12px] font-medium text-[var(--v-green)]">
                      Sent in the agent&apos;s voice — you stayed invisible.
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSteered(true)}
                      className="mt-2 w-full cursor-pointer rounded-xl bg-[var(--v-green)] px-3 py-2 text-left text-[12px] font-semibold text-white transition hover:opacity-90"
                    >
                      <span aria-hidden="true" className="mr-1">
                        ✓
                      </span>
                      Approve &amp; send — {item.steerLabel}
                    </button>
                  )}
                </div>
              </li>
            ),
          )}
        </ul>

        <p className="px-4 pb-3 text-center text-[10px] text-[var(--v-ink-soft)]">
          Prototype — simulated stay, demo data. No message is sent.
        </p>
      </div>

      <p className="max-w-md text-center text-xs leading-relaxed text-[var(--v-ink-soft)]">
        {inboxCaption}
      </p>
    </div>
  );
}
