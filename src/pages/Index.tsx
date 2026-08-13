import Events from "@/components/Events";
import Hero from "@/components/Hero";
import NewsGrid from "@/components/NewsGrid";
import RevealOnScroll from "@/components/RevealOnScroll";
import HomeBenefits from "@/components/home/HomeBenefits";
import HomeFinalCTA from "@/components/home/HomeFinalCTA";

const Index = () => (
  <main className="relative isolate overflow-hidden bg-background">
    <Hero />
    <RevealOnScroll>
      <HomeBenefits />
    </RevealOnScroll>
    <RevealOnScroll>
      <NewsGrid />
    </RevealOnScroll>
    <RevealOnScroll>
      <Events />
    </RevealOnScroll>
    <RevealOnScroll>
      <HomeFinalCTA />
    </RevealOnScroll>
  </main>
);

export default Index;
