import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Check, ChevronDown, Cookie, Info, X } from "lucide-react";
import { Link } from "react-router-dom";
import { CookieArt } from "@/components/CookieArt";
import { recordConsent, getLatestPrivacyPolicyVersion } from '@/lib/api'; // Import getLatestPrivacyPolicyVersion
import {
  CONSENT_COOKIE_NAME,
  COOKIE_CONSENT_EVENT,
  readConsentCookie,
  type ConsentStatus,
} from '@/lib/cookie-consent';

const CONSENT_MAX_AGE_SECONDS = 90 * 24 * 60 * 60;

// Must match what the site really does and section 9 of the privacy policy.
// tests/e2e/site-smoke.spec.ts checks the cookie list on a fresh visit.
const cookieDetails = [
  {
    title: "Какво ползваме",
    icon: Check,
    iconClassName: "bg-primary/10 text-primary",
    points: [
      "Бисквитката cookieConsent помни избора ти от този прозорец за 90 дни.",
      "Бисквитка за вход в раздела за валентинки, само ако влезеш там.",
      "Входът в профила, темата и настройките за достъпност се пазят локално в браузъра, не като бисквитки.",
    ],
  },
  {
    title: "Какво не ползваме",
    icon: X,
    iconClassName: "bg-muted text-foreground",
    points: [
      "Нямаме бисквитки за аналитика.",
      "Нямаме бисквитки за реклама и не ползваме Google Analytics.",
    ],
  },
  {
    title: "Какво броим без бисквитки",
    icon: Info,
    iconClassName: "bg-muted text-foreground",
    points: [
      "Броим прегледите на страниците на нашия сървър, за да виждаме кое се чете. Това не ползва бисквитки и не пази IP адрес, а записите се изтриват след 90 дни.",
    ],
  },
  {
    title: "Външни услуги",
    icon: Info,
    iconClassName: "bg-muted text-foreground",
    points: [
      "Google и Cloudflare могат да ползват свои бисквитки, когато отвориш вход или форма. YouTube и Spotify могат да го правят при вградените клипове.",
    ],
  },
];

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
  const [detailsOpen, setDetailsOpen] = useState(false);

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
      <CookieArt className="pointer-events-none absolute -top-5 right-5 h-9 w-9 rotate-12 drop-shadow-md sm:-top-6 sm:h-11 sm:w-11" />
      <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-5">
        <div className="flex min-w-0 items-start gap-3">
          <CookieArt bitten className="art-wiggle mt-0.5 h-11 w-11 sm:h-14 sm:w-14" />
          <div className="min-w-0">
            <p className="text-sm leading-snug text-muted-foreground">
              {policyVersion === 'error_fetching_version' ? (
                <>Настройките за бисквитки не се заредиха. Проверете връзката си и опитайте отново.</>
              ) : (
                <>Ползваме само бисквитки, нужни за работата на сайта. Нямаме бисквитки за аналитика.</>
              )}
            </p>
            {policyVersion !== 'error_fetching_version' && (
              <button
                type="button"
                aria-expanded={detailsOpen}
                aria-controls="cookie-details"
                onClick={() => setDetailsOpen((open) => !open)}
                className="mt-1 inline-flex min-h-8 items-center gap-1 rounded text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                За какво са бисквитките?
                <ChevronDown className={`h-4 w-4 transition-transform motion-reduce:transition-none ${detailsOpen ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
            )}
          </div>
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
      {detailsOpen && policyVersion !== 'error_fetching_version' && (
        <div id="cookie-details" className="mt-3 max-h-[45dvh] sm:max-h-[60dvh] overflow-y-auto overscroll-contain border-t border-border pt-3 text-sm">
          <div className="grid gap-3 sm:grid-cols-2">
            {cookieDetails.map(({ title, icon: Icon, iconClassName, points }) => (
              <section key={title} aria-label={title}>
                <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${iconClassName}`}>
                    <Icon className="h-3.5 w-3.5" aria-hidden="true" />
                  </span>
                  {title}
                </h2>
                <ul className="mt-1.5 space-y-1 pl-7 leading-snug text-muted-foreground">
                  {points.map((point) => <li key={point}>{point}</li>)}
                </ul>
              </section>
            ))}
          </div>
          <p className="mt-3 leading-snug text-muted-foreground">
            Понеже нямаме незадължителни бисквитки, сайтът работи еднакво при всеки от трите избора. Записваме избора ти заедно с IP адреса за отчетност и го пазим до 90 дни.{' '}
            <Link to='/privacy-policy' className="font-medium text-primary underline underline-offset-4 hover:no-underline">Политика за поверителност</Link>
          </p>
        </div>
      )}
    </div>
  );
};

export default CookieConsent;
