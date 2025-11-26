import Header from "@/components/Header";
import UnderHeader from "@/components/UnderHeader";
import Hero from "@/components/Hero";
import NewsGrid from "@/components/NewsGrid";
import Events from "@/components/Events";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";

const Index = () => {
  return (
    <div className="min-h-screen w-full">
      <Header />
      <UnderHeader />
      <main>
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
