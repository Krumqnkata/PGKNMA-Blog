import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import Index from "./pages/Index";
import News from "./pages/News";
import SchoolCalendar from "./pages/SchoolCalendar";
import BellSuggest from "./pages/BellSuggest";
import WeeklyPoll from "./pages/WeeklyPoll";
import MemeOfTheWeek from "./pages/MemeOfTheWeek";
import NotFound from "./pages/NotFound";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";
import Developers from "./pages/Developers";
import Test from "./pages/Test";
import Post from "./pages/Post";
import Program from "./pages/Program";
import MyProfilePage from "./pages/MyProfilePage";
import ProtectedRoute from "./components/ProtectedRoute";
import Changelog from "./pages/Changelog";


// New imports
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSiteStatus } from "./lib/api";
import MaintenancePage from "./pages/MaintenancePage";
import { Loader2, LoaderPinwheel } from "lucide-react";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext"; // Import SettingsProvider and useSettings
import FeatureDisabledPage from "./pages/FeatureDisabledPage";
import { GlobalStateProvider } from "./contexts/GlobalStateContext"; // Import global state context


const AppContent = () => {
  // Get site status from useQuery (this remains local for now)
  const { data: siteStatus, isLoading: isSiteStatusLoading, isError: isSiteStatusError } = useQuery({
    queryKey: ['siteStatus'],
    queryFn: getSiteStatus,
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const maintenanceMode = siteStatus?.maintenance_mode ?? false;

  // Use useSettings here to access feature flags
  const { settings: settingsData, isLoading: isSettingsLoading } = useSettings(); // Get settings from context

  // Set initial dark theme for loading screen
  useEffect(() => {
    // Always set dark theme during loading
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

  // Show loading screen if any critical data is still loading
  if (isSiteStatusLoading || isSettingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="relative">
          <LoaderPinwheel className="h-16 w-16 text-blue-400 animate-pulse animate-spin" />
          <div className="absolute inset-0 rounded-full border border-blue-400/30 animate-ping-slow"></div>
        </div>
        <div className="mt-8 flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          <span className="text-lg">Зареждане...</span>
        </div>
      </div>
    );
  }

  // Show maintenance page if in maintenance mode or a critical error occurred
  if (maintenanceMode || isSiteStatusError) {
    return <MaintenancePage isBackendError={isSiteStatusError} />;
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
                <Routes>
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
                  <Route path="/test" element={<Test/>}/>
                  <Route path="*" element={<NotFound />} />
                </Routes>
            </BrowserRouter>
          </TooltipProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <SettingsProvider>
      <GlobalStateProvider>
        <AppContent />
      </GlobalStateProvider>
    </SettingsProvider>
  );
};

export default App;