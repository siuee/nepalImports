import { ChartsSection } from "@/components/home/ChartsSection";
import { Counters } from "@/components/home/Counters";
import { Hero } from "@/components/home/Hero";
import { LiveSourcesStrip } from "@/components/home/LiveSourcesStrip";
import { MarketSection } from "@/components/home/MarketSection";
import { NepalMapSection } from "@/components/home/NepalMapSection";
import { OpportunitySection } from "@/components/home/OpportunitySection";
import { ProductGridSection } from "@/components/home/ProductGridSection";
import { Ticker } from "@/components/home/Ticker";

export default function HomePage() {
  return (
    <>
      <Hero />
      <Ticker />
      <LiveSourcesStrip />
      <MarketSection />
      <Counters />
      <NepalMapSection />
      <ProductGridSection />
      <ChartsSection />
      <OpportunitySection />
    </>
  );
}
