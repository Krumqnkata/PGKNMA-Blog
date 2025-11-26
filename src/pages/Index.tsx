import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import NewsGrid from "@/components/NewsGrid";
import Events from "@/components/Events";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

const Index = () => {
  return (
    <div className="min-h-screen w-full">
      <Header />
      <main>
        <Hero />
        <Features />
        <NewsGrid />
        <Events />
      </main>
      <Footer />
      <BackToTop />
    </div>
  );
};

export default Index;
