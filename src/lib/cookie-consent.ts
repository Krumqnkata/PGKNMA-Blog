export const CONSENT_COOKIE_NAME = 'cookieConsent';

/** Fired on window after the visitor picks a cookie option, so other prompts can wait for it. */
export const COOKIE_CONSENT_EVENT = 'pgknma:cookie-consent';

export type ConsentStatus = 'INFORMED' | 'ACCEPTED' | 'REJECTED';

export interface StoredConsent {
  status: ConsentStatus;
  policyVersion: string;
}

export const readConsentCookie = (): StoredConsent | null => {
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
