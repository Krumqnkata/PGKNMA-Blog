import Header from "@/components/Header";
import Hero from "@/components/Hero";
import NewsGrid from "@/components/NewsGrid";
import Events from "@/components/Events";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import ParticlesComponent from "@/components/Particles";
import { useTheme } from "next-themes";

const Index = () => {
  const { theme } = useTheme();

  return (
    <div className="min-h-screen w-full">
      <ParticlesComponent id="tsparticles" key={theme} theme={theme} />
      <Header />
      <main className="relative z-10">
        <Hero />
        <NewsGrid />
        <Events />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
