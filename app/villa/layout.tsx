import type { Metadata } from "next";
import type React from "react";
import { siteConfig } from "./site-config";

export const metadata: Metadata = {
  title: `${siteConfig.productName} — your villa's guest chat, answered`,
  description: siteConfig.description,
  robots: { index: true, follow: true },
};

/**
 * Villa layout. Wraps the /villa subtree in the light, warm `.villa-scope`
 * palette so the repo's dark theme can never flip the demo phone frames.
 * The inline script adds `villa-js` to <html> before paint so the scroll-reveal
 * hidden state applies without a flash — and never applies when JS is off.
 * The root layout (app/layout.tsx) is untouched.
 */
export default function VillaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="villa-scope min-h-screen">
      <script
        dangerouslySetInnerHTML={{
          __html: "document.documentElement.classList.add('villa-js');",
        }}
      />
      {children}
    </div>
  );
}
