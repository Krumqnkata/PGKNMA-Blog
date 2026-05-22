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
        console.error("Неуспешно извличане на последната версия на политиката за поверителност:", error);
        setPolicyVersion('error_fetching_version'); // Fallback in case of error
      }
    };
    fetchPolicyVersion();
  }, []);

  const handleConsent = async (status: 'INFORMED' | 'ACCEPTED' | 'REJECTED') => {
    localStorage.setItem("cookieConsent", status);
    setIsVisible(false);
    if (!policyVersion || policyVersion === 'error_fetching_version') {
        console.warn("Версията на политиката не е заредена или е възникнала грешка, съгласието не е записано в бекенда.");
        return;
    }
    try {
        await recordConsent({ 
            consent_status: status, 
            policy_version: policyVersion,
        });
    } catch (error) {
        console.error(`Неуспешно записване на съгласие (${status}) в бекенда:`, error);
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
            Управлявайте предпочитанията си за бисквитки. Повече информация можете да намерите в
            <Link to='/privacy-policy' className="text-primary hover:underline ml-1">
              Политиката ни за поверителност.
            </Link>
          </p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <Button size="sm" variant="outline" onClick={() => handleConsent('INFORMED')}>
            Само необходими
          </Button>
          <Button size="sm" variant="destructive" onClick={() => handleConsent('REJECTED')}>
            Отказвам
          </Button>
          <Button size="sm" onClick={() => handleConsent('ACCEPTED')}>
            Приемам
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CookieConsent;
