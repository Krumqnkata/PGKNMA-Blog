import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Cookie } from "lucide-react";
import { Link } from "react-router-dom";
import { recordConsent, getLatestPrivacyPolicyVersion } from '@/lib/api'; // Import getLatestPrivacyPolicyVersion
import {
  CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_EVENT,
  readConsentCookie,
  type ConsentStatus,
} from '@/lib/cookie-consent';

const CONSENT_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

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

  const fetchPolicyVersion = async () => {
    setPolicyVersion(null);
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

  useEffect(() => {
    void fetchPolicyVersion();
  }, []);

  const handleConsent = async (status: ConsentStatus) => {
    if (!policyVersion || policyVersion === 'error_fetching_version') {
        console.warn("Версията на политиката не е заредена или е възникнала грешка, съгласието не е записано.");
        return;
    }
    writeConsentCookie(status, policyVersion);
    setIsVisible(false);
    window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT));
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
      <div className="fixed bottom-[var(--site-bottom-clearance)] left-0 right-0 z-40 p-4 bg-card/80 backdrop-blur-sm border-t border-border shadow-lg">
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
    <div
      role="region"
      aria-label="Бисквитки"
      className="fixed bottom-[calc(var(--site-bottom-clearance)+0.75rem)] left-3 right-3 z-40 mx-auto max-w-3xl rounded-2xl border border-border bg-card/95 p-3 shadow-2xl shadow-slate-950/20 backdrop-blur-md motion-safe:animate-in motion-safe:slide-in-from-bottom-4 sm:p-4"
    >
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <div className="flex min-w-0 items-start gap-3">
          <Cookie className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
          <p className="text-sm leading-snug text-muted-foreground">
            {policyVersion === 'error_fetching_version' ? (
              <>Настройките за бисквитки не се заредиха. Проверете връзката си и опитайте отново.</>
            ) : (
              <>Използваме бисквитки, за да работи сайтът.{' '}
                <Link to='/privacy-policy' className="font-medium text-primary underline underline-offset-4 hover:no-underline">Научи повече</Link>
              </>
            )}
          </p>
        </div>
        {policyVersion === 'error_fetching_version' ? (
          <div className="flex w-full shrink-0 gap-2 sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setIsVisible(false)}>Затвори засега</Button>
            <Button className="flex-1 sm:flex-none" onClick={() => void fetchPolicyVersion()}>Опитайте отново</Button>
          </div>
        ) : (
          // Rejecting must stay as visible and as easy as accepting.
          <div className="grid w-full shrink-0 grid-cols-2 gap-2 sm:flex sm:w-auto">
            <Button className="col-span-2 sm:col-auto" size="sm" variant="outline" onClick={() => handleConsent('INFORMED')}>Само необходимите</Button>
            <Button size="sm" variant="outline" onClick={() => handleConsent('REJECTED')}>Отказвам</Button>
            <Button size="sm" onClick={() => handleConsent('ACCEPTED')}>Приемам</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieConsent;
