"use client";

import { useEffect, useRef, useState } from "react";

type RevealState = "pending" | "shown";

/**
 * Scroll-reveal wrapper.
 *
 * NO-JS SAFE BY DESIGN: content is rendered visible. The hidden state is only
 * applied through the CSS rule `html.villa-js [data-reveal="pending"]`, and the
 * `villa-js` class on <html> is added by a tiny inline script in the villa
 * layout. Without JavaScript that class never appears, so every section stays
 * readable. In-view elements reveal on the first IntersectionObserver tick.
 */
export default function Reveal({
  children,
  className = "",
  delayMs = 0,
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  as?: "div" | "section" | "li";
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [state, setState] = useState<RevealState>("pending");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (typeof IntersectionObserver === "undefined") {
      setState("shown");
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setState("shown");
            observer.disconnect();
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Tag
      // @ts-expect-error — polymorphic ref across div/section/li
      ref={ref}
      data-reveal={state}
      className={className}
      style={state === "shown" && delayMs ? { transitionDelay: `${delayMs}ms` } : undefined}
    >
      {children}
    </Tag>
  );
}
