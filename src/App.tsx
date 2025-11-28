import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import Index from "./pages/Index";
import News from "./pages/News";
import SchoolCalendar from "./pages/SchoolCalendar";
import BellSuggest from "./pages/BellSuggest";
import WeeklyPoll from "./pages/WeeklyPoll";
import MemeOfTheWeek from "./pages/MemeOfTheWeek";
import NotFound from "./pages/NotFound";
import Admin from "./pages/Admin";
import Contact from "./pages/Contact";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsOfService from "./pages/TermsOfService";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/news" element={<News />} />
            <Route path="/events" element={<SchoolCalendar />} />
            <Route path="/bell-suggest" element={<BellSuggest />} />
            <Route path="/weekly-poll" element={<WeeklyPoll />} />
            <Route path="/meme-of-the-week" element={<MemeOfTheWeek />} />
            <Route path="/admin" element={<Admin/>}/>
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
