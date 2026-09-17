import FaqCta from "./components/sections/FaqCta";
import Hero from "./components/sections/Hero";
import HowItWorks from "./components/sections/HowItWorks";
import InboxDemoSection from "./components/sections/InboxDemoSection";
import Pain from "./components/sections/Pain";
import Pricing from "./components/sections/Pricing";
import Proof from "./components/sections/Proof";

/**
 * /villa landing — the 7 sections of the spec's page outline, in order:
 * 1 Hero · 2 The pain · 3 How it works · 4 The owner inbox (embedded demo)
 * 5 Proof · 6 Pricing · 7 FAQ + CTA
 */
export default function VillaPage() {
  return (
    <main>
      <Hero />
      <Pain />
      <HowItWorks />
      <InboxDemoSection />
      <Proof />
      <Pricing />
      <FaqCta />
    </main>
  );
}
