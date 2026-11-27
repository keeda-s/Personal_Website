import type { Metadata } from "next"
import { TidesView } from "./tides-view"

// Keeda's private moon, tide, swell and wind view. Unlisted: not linked from
// the site and hidden from search engines.
export const metadata: Metadata = {
  title: "Tides",
  robots: { index: false, follow: false },
}

export default function TidesPage() {
  return <TidesView />
}
