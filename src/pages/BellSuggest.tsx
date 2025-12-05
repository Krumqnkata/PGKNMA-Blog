import Header from "@/components/Header";
import BellSongForm from "@/components/BellSongForm";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
const BellSuggest = () => {
  return (
    <div className="min-h-screen w-full">
      <Header />
      <main>
        <BellSongForm />
      </main>
      <Footer />
      <BackToTop />
      <CookieConsent/>
    </div>
    
  );
};

export default BellSuggest;
