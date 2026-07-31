import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import { Analytics } from "@vercel/analytics/next"
import { Suspense } from "react"
import "./globals.css"
import "./styles/hero-controls.css"
import "./styles/hero-sky-controls.css"
import "./styles/hero-moon-controls.css"
import "./styles/hero-landscape-controls.css"
import "./styles/hero-sky.css"
import "./styles/hero-moon.css"
import "./styles/hero-effects.css"

export const metadata: Metadata = {
  title: "Keeda Scully Projects",
  description:
    "Building innovative digital experiences at the intersection of AI, social media, and emerging technologies.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased ${GeistSans.variable} ${GeistMono.variable}`}>
        <Suspense fallback={null}>{children}</Suspense>
        <Analytics />
      </body>
    </html>
  )
}
