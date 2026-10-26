import Events from "@/components/Events";
import Hero from "@/components/Hero";
import NewsGrid from "@/components/NewsGrid";
import RevealOnScroll from "@/components/RevealOnScroll";
import HomeBenefits from "@/components/home/HomeBenefits";
import HomeFinalCTA from "@/components/home/HomeFinalCTA";
import HomeGallery from "@/components/home/HomeGallery";

const Index = () => (
  <main className="relative isolate overflow-hidden bg-background">
    <Hero />
    {/* Real content first; the platform pitch follows for visitors who keep scrolling. */}
    <RevealOnScroll>
      <NewsGrid />
    </RevealOnScroll>
    <RevealOnScroll>
      <Events />
    </RevealOnScroll>
    <RevealOnScroll>
      <HomeGallery />
    </RevealOnScroll>
    <RevealOnScroll>
      <HomeBenefits />
    </RevealOnScroll>
    <RevealOnScroll>
      <HomeFinalCTA />
    </RevealOnScroll>
  </main>
);

export default Index;
