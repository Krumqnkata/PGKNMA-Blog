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
import { Construction } from "lucide-react";

const App = () => {
  const { data: siteStatus, isLoading } = useQuery({
    queryKey: ['siteStatus'],
    queryFn: getSiteStatus,
    refetchInterval: 60000, // Refetch every 60 seconds
  });

  const maintenanceMode = siteStatus?.maintenance_mode ?? false;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Construction className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Зареждане...</p>
      </div>
    );
  }

  if (maintenanceMode) {
    return <MaintenancePage />;
  }
  
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
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
                <Route path="/bell-suggest" element={<BellSuggest />} />
                <Route path="/weekly-poll" element={<WeeklyPoll />} />
                <Route path="/meme-of-the-week" element={<MemeOfTheWeek />} />
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

export default App;
