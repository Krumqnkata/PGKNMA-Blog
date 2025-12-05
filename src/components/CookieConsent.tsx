import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import {Link} from "react-router-dom";

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined");
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card/80 backdrop-blur-sm border-t border-border shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Cookie className="h-6 w-6 text-primary flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
  В съответствие с изискванията на GDPR, ние използваме само строго необходими бисквитки...
  Не се използват проследяващи, аналитични или рекламни бисквитки. Потвърдете, че сте информирани, или научете повече в  
  
  <Link to='/privacy-policy' className="text-primary hover:underline ml-1">
      Политиката ни за Поверителност.
  </Link>
  {/* Уверете се, че в App.js имате Route path="/privacy-policy" */}
</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={handleDecline}>
            Отказвам
          </Button>
          <Button size="sm" onClick={handleAccept}>
            Приемам
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
