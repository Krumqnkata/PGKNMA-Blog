import Header from "@/components/Header";
import BellSongForm from "@/components/BellSongForm";
import { SongVoting } from "@/components/SongVoting";
import Footer from "@/components/Footer";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
const BellSuggest = () => {
  return (
    <div className="min-h-screen w-full">
      <Header />
      <main>
        <BellSongForm />
        <div>
          <SongVoting />
        </div>
      </main>
      <Footer />
      <BackToTop />
      <CookieConsent/>
    </div>
    
  );
};

export default BellSuggest;
