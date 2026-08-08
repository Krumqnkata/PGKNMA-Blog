import Hero from "@/components/Hero";
import NewsGrid from "@/components/NewsGrid";
import Events from "@/components/Events";
import ParticlesComponent from "@/components/Particles";
import { useTheme } from "next-themes";

const Index = () => {
  const { theme } = useTheme();

  return (
    <div className="w-full">
      <ParticlesComponent id="tsparticles" key={theme} theme={theme} />
      <main className="relative z-10">
        <Hero />
        <NewsGrid />
        <Events />
      </main>
    </div>
  );
};

export default Index;
