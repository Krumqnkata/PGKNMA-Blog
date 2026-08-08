import { Outlet, useLocation } from "react-router-dom";

import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

const SiteLayout = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <div className="flex-1">
        <div key={location.pathname} className="animate-in fade-in duration-300 motion-reduce:animate-none">
          <Outlet />
        </div>
      </div>
      <Footer />
      <BackToTop />
      <CookieConsent />
    </div>
  );
};

export default SiteLayout;
