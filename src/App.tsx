import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { lazy, Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import MaintenancePage from "./pages/MaintenancePage";
import { Loader2, LoaderPinwheel } from "lucide-react";
import { SettingsProvider } from "@/contexts/SettingsContext";
import { useSettings } from "@/hooks/use-settings";
import FeatureDisabledPage from "./pages/FeatureDisabledPage";
import CustomCursor from "./components/CustomCursor";
import { useDisableInspect } from "./hooks/use-disable-inspect";
import ScrollToTop from "./components/ScrollToTop";
import FloatingFAQ from "./components/FloatingFAQ";
import PwaInstallBanner from "@/components/PwaInstallBanner";
import OfflineStatusToast from "@/components/OfflineStatusToast";
import SEOManager from "@/components/SEOManager";
import SiteLayout from "@/components/SiteLayout";
import PageErrorBoundary from "@/components/PageErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessibilityProvider } from "@/contexts/AccessibilityProvider";
import AccessibilityColorFilters from "@/components/accessibility/AccessibilityColorFilters";
import ReadingGuide from "@/components/accessibility/ReadingGuide";
import SelectionReader from "@/components/accessibility/SelectionReader";
import SkipToContent from "@/components/accessibility/SkipToContent";

const Index = lazy(() => import("@/pages/Index"));
const News = lazy(() => import("@/pages/News"));
const SchoolCalendar = lazy(() => import("@/pages/SchoolCalendar"));
const BellSuggest = lazy(() => import("@/pages/BellSuggest"));
const WeeklyPoll = lazy(() => import("@/pages/WeeklyPoll"));
const MemeOfTheWeek = lazy(() => import("@/pages/MemeOfTheWeek"));
const NotFound = lazy(() => import("@/pages/NotFound"));
const Contact = lazy(() => import("@/pages/Contact"));
const PrivacyPolicy = lazy(() => import("@/pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("@/pages/TermsOfService"));
const Developers = lazy(() => import("@/pages/Developers"));
const Post = lazy(() => import("@/pages/Post"));
const Program = lazy(() => import("@/pages/Program"));
const MyProfilePage = lazy(() => import("@/pages/MyProfilePage"));
const ProtectedRoute = lazy(() => import("@/components/ProtectedRoute"));
const Changelog = lazy(() => import("@/pages/Changelog"));
const TVScreen = lazy(() => import("@/pages/TVScreen"));
const FAQ = lazy(() => import("@/pages/FAQ"));
const EmailVerification = lazy(() => import("@/pages/EmailVerification"));
const EasterEgg = lazy(() => import("@/pages/EasterEgg"));

const AppLoadingScreen = () => (
  <div id="main-content" tabIndex={-1} className="flex min-h-screen flex-col items-center justify-center gap-6 bg-background px-6 text-foreground outline-none" role="status" aria-live="polite">
    <div className="relative">
      <LoaderPinwheel className="h-14 w-14 animate-spin text-primary motion-reduce:animate-none" />
      <div className="absolute inset-0 rounded-full border border-primary/30 animate-ping-slow motion-reduce:animate-none" />
    </div>
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin text-primary motion-reduce:animate-none" />
      <span>Зареждане...</span>
    </div>
    <div className="w-full max-w-md space-y-3" aria-hidden="true">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
    </div>
  </div>
);

const AppContent = () => {
  // Disable inspect tools (right click, F12, etc.)
  useDisableInspect();

  const { settings: settingsData, isLoading, error } = useSettings();
  const isTVRoute = window.location.pathname === "/tv";

  // Show loading screen if any critical data is still loading
  if (isLoading && !isTVRoute) {
    return <AppLoadingScreen />;
  }

  // Show maintenance page if in maintenance mode or a critical error occurred
  if (!isTVRoute && (settingsData?.maintenance_mode || error)) {
    return <div id="main-content" tabIndex={-1} className="outline-none"><MaintenancePage isBackendError={Boolean(error)} /></div>;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <CustomCursor />
      <PwaInstallBanner />
      <OfflineStatusToast />
      <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <ScrollToTop />
                <FloatingFAQ />
                <SEOManager />
              <Suspense fallback={<AppLoadingScreen />}>
                <Routes>
                  <Route element={<SiteLayout />}>
                  <Route path="/" element={<Index />} />
                  <Route path="/news" element={<News />} />
                  <Route path="/post/:id" element={<Post />} />
                  <Route path="/events" element={<SchoolCalendar />} />
                  <Route path="/program" element={<Program />} />
                  <Route path="/bell-suggest" element={settingsData?.enable_bell_suggestions ? <BellSuggest /> : <FeatureDisabledPage />} />
                  <Route path="/weekly-poll" element={settingsData?.enable_weekly_poll ? <WeeklyPoll /> : <FeatureDisabledPage />} />
                  <Route path="/meme-of-the-week" element={settingsData?.enable_meme_of_the_week ? <MemeOfTheWeek /> : <FeatureDisabledPage />} />
                  <Route path="/changelog" element={<Changelog />} />
                  <Route path="/profile" element={<ProtectedRoute><MyProfilePage /></ProtectedRoute>} />

                  <Route path="/contact" element={<Contact />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                  <Route path="/terms-of-service" element={<TermsOfService />} />
                  <Route path="/developers" element={<Developers />} />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/verify-email" element={<EmailVerification />} />
                  <Route path="/easter-egg" element={<EasterEgg />} />
                  <Route path="*" element={<NotFound />} />
                  </Route>
                  <Route path="/tv" element={<PageErrorBoundary resetKey="tv-screen" variant="tv"><TVScreen /></PageErrorBoundary>} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <SettingsProvider>
      <AccessibilityProvider>
        <SkipToContent />
        <AccessibilityColorFilters />
        <ReadingGuide />
        <SelectionReader />
        <AppContent />
      </AccessibilityProvider>
    </SettingsProvider>
  );
};

export default App;
