import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { Link } from "react-router-dom";
import { recordConsent, getLatestPrivacyPolicyVersion } from '@/lib/api'; // Import getLatestPrivacyPolicyVersion

const CONSENT_COOKIE_NAME = 'cookieConsent';
const CONSENT_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

type ConsentStatus = 'INFORMED' | 'ACCEPTED' | 'REJECTED';

interface StoredConsent {
  status: ConsentStatus;
  policyVersion: string;
}

const readConsentCookie = (): StoredConsent | null => {
  const prefix = `${CONSENT_COOKIE_NAME}=`;
  const rawValue = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
  if (!rawValue) return null;

  try {
    const parsed = JSON.parse(decodeURIComponent(rawValue)) as StoredConsent;
    if (
      !['INFORMED', 'ACCEPTED', 'REJECTED'].includes(parsed.status)
      || typeof parsed.policyVersion !== 'string'
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writeConsentCookie = (status: ConsentStatus, policyVersion: string) => {
  const value = encodeURIComponent(JSON.stringify({ status, policyVersion }));
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = (
    `${CONSENT_COOKIE_NAME}=${value}; Max-Age=${CONSENT_MAX_AGE_SECONDS}; `
    + `Path=/; SameSite=Lax${secure}`
  );
};

const clearConsentCookie = () => {
  document.cookie = `${CONSENT_COOKIE_NAME}=; Max-Age=0; Path=/; SameSite=Lax`;
};

const CookieConsent = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [policyVersion, setPolicyVersion] = useState<string | null>(null); // New state for dynamic policy version

  useEffect(() => {
    const fetchPolicyVersion = async () => {
      try {
        const latestVersion = await getLatestPrivacyPolicyVersion();
        if (!latestVersion) {
          throw new Error('Липсва публикувана версия на политиката.');
        }
        setPolicyVersion(latestVersion);
        // Remove the old, non-expiring implementation during migration.
        localStorage.removeItem(CONSENT_COOKIE_NAME);
        const consent = readConsentCookie();
        if (!consent || consent.policyVersion !== latestVersion) {
          clearConsentCookie();
          setIsVisible(true);
        }
      } catch (error) {
        console.error("Неуспешно извличане на последната версия на политиката за поверителност:", error);
        setPolicyVersion('error_fetching_version'); // Fallback in case of error
        setIsVisible(true);
      }
    };
    fetchPolicyVersion();
  }, []);

  const handleConsent = async (status: ConsentStatus) => {
    if (!policyVersion || policyVersion === 'error_fetching_version') {
        console.warn("Версията на политиката не е заредена или е възникнала грешка, съгласието не е записано.");
        return;
    }
    writeConsentCookie(status, policyVersion);
    setIsVisible(false);
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
