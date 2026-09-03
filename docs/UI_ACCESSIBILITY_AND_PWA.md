# UI, accessibility, SEO и PWA

## Дизайн система

UI използва Tailwind utility classes, shadcn/Radix primitives и site theme
tokens. Вътрешните pages следват `InteriorPage` / `InteriorPageHero` /
`InteriorSection`, cards с последователни radius/shadow/border и responsive
spacing. Преди нов component първо потърси reusable primitive в
`src/components/ui/`.

Интерактивните елементи трябва да имат visible hover, active и
`focus-visible` state. Цветът не е единствено средство за status/error.

## Accessibility subsystem

`AccessibilityProvider` съхранява preference-и в localStorage и ги прилага
чрез root data attributes/CSS variables, така че не се налага глобално
пренаписване на layout.

Поддържани инструменти включват:

- font scale reset/increase/decrease;
- high contrast, monochrome и color-vision filters;
- reduced motion;
- dyslexia/readability spacing;
- highlighted links и enhanced focus ring;
- reading guide/ruler и large cursor;
- skip-to-main-content link;
- Web Speech selection reader/AudioReader, когато browser API е налично.

### Правила за нов UI

1. Не премахвай outline без равностоен keyboard focus indicator.
2. Добави semantic button/link, не clickable `div`.
3. Dialog има `DialogTitle`, description при нужда и return focus.
4. SVG/icon-only control има accessible label.
5. Анимация уважава `prefers-reduced-motion` и site accessibility setting.
6. Проверявай desktop, narrow mobile и keyboard-only flow.

## Error handling

- `PageErrorBoundary` изолира page failures.
- TV route има special boundary + resilient query behavior; не заменяй whole
  screen с generic error при паднал weather/news/schedule module.
- Form errors са persistent inline errors, не toast-only.
- API loading/errors трябва да са четими от screen reader (`role/status`,
  `aria-live` когато е подходящо).

## SEO и social sharing

`SEOManager` управлява page titles/descriptions за client routes.
За post social preview server-side `/post/<id>` трябва да връща Open Graph
metadata, защото Facebook/Viber crawlers не изпълняват React SPA достатъчно.
`ShareDropdown` споделя canonical public URL; не използвай localhost/API URL.

При нова route добави SEO mapping и помисли дали sitemap backend static mapping
трябва да се обнови. Public post preview image трябва да остане достъпно без
auth за social crawler, докато private media не бива да изтича.

## PWA/offline

`PwaInstallBanner` предлага install само при подходящ browser event.
`OfflineStatusToast` показва connection status. Service worker е нужен за push
и може да има cache; не assume-вай, че offline app има актуални server data.
При release с промени по static assets проверявай hard refresh/update behavior,
особено video loop и service-worker cache.

## External content/privacy

Трети страни като Google OAuth, Turnstile, OpenStreetMap embed, social embeds
и push provider-и се зареждат само когато са нужни. Нов Facebook/Instagram
iframe/plugin трябва да се разглежда за:

- consent/cookie privacy effect;
- lazy loading;
- mobile overflow и CSP;
- fallback, ако third-party е blocked;
- това дали важно съдържание остава достъпно без външната услуга.
