import { Suspense } from "react";
import { Outlet, useLocation } from "react-router-dom";

import AIAssistant from "@/components/AIAssistant";
import AppLoadingScreen from "@/components/AppLoadingScreen";
import BackToTop from "@/components/BackToTop";
import CookieConsent from "@/components/CookieConsent";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import BottomNavigation from "@/components/BottomNavigation";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import PushOptInPrompt from "@/components/PushOptInPrompt";
import { useSettings } from "@/hooks/use-settings";

const SiteLayout = () => {
  const location = useLocation();
  const { settings } = useSettings();

  return (
    <div className="flex min-h-screen flex-col bg-background pb-[var(--site-bottom-clearance)]">
      <Header />
      <BottomNavigation />
      <div id="main-content" tabIndex={-1} className="flex-1 outline-none">
        <PageErrorBoundary resetKey={location.pathname}>
          {/* Keep the header and navigation on screen while a page's code downloads. */}
          <Suspense fallback={<AppLoadingScreen fullScreen={false} />}>
            <div key={location.pathname} className="animate-in fade-in duration-300 motion-reduce:animate-none">
              <Outlet />
            </div>
          </Suspense>
        </PageErrorBoundary>
      </div>
      <Footer />
      <BackToTop />
      {settings?.ai_assistant_enabled ? <AIAssistant /> : null}
      <CookieConsent />
      <PushOptInPrompt />
    </div>
  );
};

export default SiteLayout;
