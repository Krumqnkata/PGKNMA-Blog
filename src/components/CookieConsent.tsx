import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { Link } from "react-router-dom";
import { recordConsent, getLatestPrivacyPolicyVersion } from '@/lib/api'; // Import getLatestPrivacyPolicyVersion

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [policyVersion, setPolicyVersion] = useState<string | null>(null); // New state for dynamic policy version

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent");
    if (!consent) {
      setIsVisible(true);
    }

    // Fetch policy version dynamically
    const fetchPolicyVersion = async () => {
      try {
        const latestVersion = await getLatestPrivacyPolicyVersion();
        setPolicyVersion(latestVersion);
      } catch (error) {
        console.error("Failed to fetch latest privacy policy version:", error);
        setPolicyVersion('error_fetching_version'); // Fallback in case of error
      }
    };
    fetchPolicyVersion();
  }, []);

  const handleAccept = async () => {
    localStorage.setItem("cookieConsent", "accepted");
    setIsVisible(false);
    if (!policyVersion || policyVersion === 'error_fetching_version') { 
        console.warn("Policy version not loaded or error occurred, consent not recorded to backend.");
        return;
    }
    try {
        await recordConsent({ 
            consent_status: 'ACCEPTED', 
            policy_version: policyVersion,
        });
    } catch (error) {
        console.error("Failed to record cookie consent (ACCEPT) to backend:", error);
    }
  };

  if (!isVisible) return null;

  if (policyVersion === null) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card/80 backdrop-blur-sm border-t border-border shadow-lg">
        <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
                <Cookie className="h-6 w-6 text-primary flex-shrink-0" />
                <p className="text-sm text-muted-foreground">Зареждане на информация за бисквитки...</p>
            </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-card/80 backdrop-blur-sm border-t border-border shadow-lg">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Cookie className="h-6 w-6 text-primary flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
  В съответствие с изискванията на GDPR, ние използваме само строго необходими бисквитки.
  Не се използват проследяващи, аналитични или рекламни бисквитки. Потвърдете, че сте информирани, или научете повече в  
  
  <Link to='/privacy-policy' className="text-primary hover:underline ml-1">
      Политиката ни за поверителност.
  </Link>
  {/* Уверете се, че в App.js имате Route path="/privacy-policy" */}
</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button size="sm" onClick={handleAccept}>
            Приемам
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
