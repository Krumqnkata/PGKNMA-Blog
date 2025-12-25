import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "./contexts/AuthContext";
import { NotificationProvider } from "./contexts/NotificationContext";
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

// New imports
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getSiteStatus } from "./lib/api";
import MaintenancePage from "./pages/MaintenancePage";
import { Loader2, LoaderPinwheel } from "lucide-react";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext"; // Import SettingsProvider and useSettings
import FeatureDisabledPage from "./pages/FeatureDisabledPage"; // Import FeatureDisabledPage


const AppContent = () => { // Renamed App to AppContent
  const { data: siteStatus, isLoading: isSiteStatusLoading } = useQuery({
    queryKey: ['siteStatus'],
    queryFn: getSiteStatus,
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const maintenanceMode = siteStatus?.maintenance_mode ?? false;

  // Use useSettings here to access feature flags
  const { settings, isLoading: isSettingsLoading } = useSettings(); // Get settings from context

  // Set initial dark theme for loading screen
  useEffect(() => {
    // Always set dark theme during loading
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  }, []);

  if (isSiteStatusLoading || isSettingsLoading) { // Check both loading states
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
        <div className="relative">
          <LoaderPinwheel className="h-16 w-16 text-blue-400 animate-pulse animate-spin" />
          {/* Orbiting elements around the sun */}
          <div className="absolute inset-0 rounded-full border border-blue-400/30 animate-ping-slow"></div>
        </div>
        <div className="mt-8 flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
          <span className="text-lg">Зареждане...</span>
        </div>
      </div>
    );
  }

  if (maintenanceMode) {
    return <MaintenancePage />;
  }
  
  // After loading, let the ThemeProvider handle the saved theme
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/news" element={<News />} />
                <Route path="/post/:id" element={<Post />} />
                <Route path="/events" element={<SchoolCalendar />} />

                {/* Conditional Routes */}
                <Route path="/bell-suggest" element={settings?.enable_bell_suggestions ? <BellSuggest /> : <FeatureDisabledPage />} />
                <Route path="/weekly-poll" element={settings?.enable_weekly_poll ? <WeeklyPoll /> : <FeatureDisabledPage />} />
                <Route path="/meme-of-the-week" element={settings?.enable_meme_of_the_week ? <MemeOfTheWeek /> : <FeatureDisabledPage />} />

                <Route path="/contact" element={<Contact />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/developers" element={<Developers />} />
                <Route path="/test" element={<Test/>}/>
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

// Main App component for providers
const App = () => (
  <SettingsProvider> {/* Wrap with SettingsProvider */}
    <AppContent />
  </SettingsProvider>
);

export default App;
