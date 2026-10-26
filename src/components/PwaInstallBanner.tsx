import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, X, Sparkles } from "lucide-react";
import { COOKIE_CONSENT_EVENT, readConsentCookie } from "@/lib/cookie-consent";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export const PwaInstallBanner: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  // Wait for the cookie banner to be answered so the two never overlap.
  const [cookieChoiceMade, setCookieChoiceMade] = useState(() => readConsentCookie() !== null);

  useEffect(() => {
    if (cookieChoiceMade) return undefined;
    const handleConsent = () => setCookieChoiceMade(true);
    window.addEventListener(COOKIE_CONSENT_EVENT, handleConsent);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, handleConsent);
  }, [cookieChoiceMade]);

  useEffect(() => {
    // Check if the app is already installed and running standalone
    const isStandalone = window.matchMedia("(display-mode: standalone)").matches 
      || (window.navigator as Navigator & { standalone?: boolean }).standalone;

    if (isStandalone) {
      return;
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Show the install banner
      setIsVisible(true);
      console.log("[PWA] beforeinstallprompt event was fired.");
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    // Also show after 30 seconds as a fallback if prompt is available but already stashed
    const timer = setTimeout(() => {
      if (deferredPrompt) {
        setIsVisible(true);
      }
    }, 15000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      clearTimeout(timer);
    };
  }, [deferredPrompt]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`[PWA] User response to the install prompt: ${outcome}`);

    // We've used the prompt, and can't use it again
    setDeferredPrompt(null);
    setIsVisible(false);
  };

  const handleClose = () => {
    setIsVisible(false);
    // Stash in session storage so we don't annoy the user in this session
    sessionStorage.setItem("pwa-banner-dismissed", "true");
  };

  // Do not show if dismissed in this session
  if (!isVisible || !cookieChoiceMade || sessionStorage.getItem("pwa-banner-dismissed") === "true") {
    return null;
  }

  return (
    <div className="fixed bottom-[calc(var(--site-bottom-clearance)+1rem)] left-3 right-3 z-40 mx-auto max-w-md animate-in fade-in slide-in-from-bottom-8 duration-500 md:left-6 md:right-6">
      <Card className="relative overflow-hidden border-primary/20 bg-card/90 shadow-2xl backdrop-blur-md">
        <div className="absolute top-0 left-0 h-full w-1.5 bg-primary" />
        <CardContent className="p-5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="space-y-0.5">
              <h4 className="text-sm font-bold tracking-tight text-foreground">Инсталирай приложението</h4>
              <p className="text-xs text-muted-foreground leading-snug">
                Добави ПГКНМА на началния екран за бърз и лесен достъп.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button size="sm" onClick={handleInstallClick} className="gap-1.5 h-8 font-semibold shadow-md shadow-primary/10">
              <Download className="h-3.5 w-3.5" />
              Инсталиране
            </Button>
            <Button size="icon" variant="ghost" onClick={handleClose} aria-label="Затвори" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PwaInstallBanner;
