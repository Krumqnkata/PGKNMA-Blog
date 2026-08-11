import Hero from "@/components/Hero";
import NewsGrid from "@/components/NewsGrid";
import Events from "@/components/Events";
import ParticlesComponent from "@/components/Particles";
import { useTheme } from "next-themes";
import HomeQuickLinks from "@/components/HomeQuickLinks";
import RevealOnScroll from "@/components/RevealOnScroll";
import { useAccessibility } from "@/hooks/use-accessibility";

const Index = () => {
  const { theme, resolvedTheme } = useTheme();
  const { reduceMotion } = useAccessibility();

  return (
    <div className="w-full">
      {!reduceMotion && <ParticlesComponent id="tsparticles" key={`${theme}-${resolvedTheme}`} theme={theme} resolvedTheme={resolvedTheme} />}
      <main className="relative z-10">
        <Hero />
        <RevealOnScroll><HomeQuickLinks /></RevealOnScroll>
        <RevealOnScroll><NewsGrid /></RevealOnScroll>
        <RevealOnScroll><Events /></RevealOnScroll>
      </main>
    </div>
  );
};

export default Index;
