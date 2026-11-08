# Frontend архитектура

## Stack

- React 18 + TypeScript, Vite 5 и SWC React plugin.
- React Router 6 за SPA navigation.
- TanStack Query 5 за server state/cache/mutations.
- Tailwind CSS + shadcn/Radix primitives + Lucide icons.
- React Hook Form + Zod за form UX validation.
- next-themes за theme attribute, Recharts, PDF viewer, Markdown, particles и
  image/lightbox компоненти според page need.

## Bootstrap

`src/main.tsx` е entry point:

1. зарежда global CSS;
2. създава един `QueryClient`;
3. рендерира `App`.

`GoogleOAuthProvider` не е тук, а в `components/auth/GoogleLoginButton.tsx`,
защото зарежда скрипта на Google при показване. Политиката за поверителност
обещава, че Google участва само когато посетителят избере вход с Google.

`src/App.tsx` композира providers в този ред:

```text
SettingsProvider
  AccessibilityProvider
    SkipToContent / SVG color filters / ReadingGuide / SelectionReader
      ThemeProvider
        visual/PWA helpers
          AuthProvider
            Tooltip + toast providers + BrowserRouter
              tracking/SEO/scroll + lazy routes
```

Този ред е важен: `AuthProvider` използва Query Client, а accessibility helpers
трябва да са налични и преди layout/page content.

## Routing

Повечето pages са `lazy()` imports в `App.tsx`; Suspense fallback е
`AppLoadingScreen`. `SiteLayout` обгръща стандартните public/authenticated
routes; `/tv` е отделен route с `PageErrorBoundary`, за да не срине целия сайт
при външна API грешка.

| Route | Page/цел |
| --- | --- |
| `/` | `Index` — landing/home. |
| `/news`, `/post/:id` | News list и post detail. |
| `/events`, `/program` | Calendar и schedule. |
| `/bell-suggest`, `/weekly-poll`, `/meme-of-the-week` | Community modules; feature-flag guarded. |
| `/changelog` | Public change history. |
| `/profile` | Protected profile/account/gamification page. |
| `/users/:username` | Public profile. |
| `/notification/:id` | Safe notification target resolver. |
| `/contact`, `/faq`, `/developers` | Informational/contact pages. |
| `/privacy-policy`, `/terms-of-service` | Server-managed policy content. |
| `/verify-email` | Email verification UI. |
| `/tv` | Resilient TV display; independent error boundary. |
| `*` | `NotFound`. |

Когато добавяш page:

1. създай `src/pages/Name.tsx`;
2. избери дали трябва lazy import;
3. добави route и, ако е user-only, `ProtectedRoute`;
4. добави `SEOManager` title/description mapping;
5. добави Header/Footer/SearchDialog link само ако route трябва да е откриваем;
6. направи loading/error/empty/mobile states;
7. обнови документацията и добави test при interaction/state logic.

## Layout и shared components

| Компонент | Роля |
| --- | --- |
| `SiteLayout` / `MainLayout` | Стандартна page shell, header/footer/content boundary. |
| `Header`, `UserDropdown`, `NotificationBell` | Navigation, account actions, admin link според permission, notification UI. |
| `InteriorPage` | Consistent hero/section pattern за вътрешни pages. |
| `ProtectedRoute` | Редирект/guard за profile-only routes. |
| `PageErrorBoundary` | Изолира render failures; TV има специален variant. |
| `SEOManager`, `PageViewTracker` | Client title/meta и anonymous page-view tracking. |
| `CookieConsent`, `PwaInstallBanner`, `OfflineStatusToast` | Privacy/install/offline UX. |
| `ShareDropdown` | Web share/social link workflow; не съдържа server-side social publishing. |

`components/ui/` са reusable shadcn/Radix primitives. Не копирай техни styles
във всяка page; разширявай variants/component wrapper, когато pattern се
повтаря.

## Page/component групи

- Content: `NewsGrid`, `Comments`, `MarkdownRenderer`, `PDFViewer*`,
  `AuthenticatedImage`.
- Profile: `AccountSettings`, avatar, sessions, export, notification/push
  settings, archived notifications, user content lists.
- Community: song form/voting/media, memes, polls и statistics.
- PDF с jsPDF: вградените шрифтове на jsPDF нямат кирилица, затова
  `lib/pdf-fonts.ts` (`addSiteFont`) вгражда Sofia Sans от
  `assets/fonts/sofia-sans/` (статични TTF от github.com/lettersoup/Sofia-Sans,
  лиценз OFL). Ползва го PDF-ът с предложените песни в `SongVoting`.
- Home: `components/home/*`, hero/quick links/final CTA/reveal effects.
- Accessibility: `components/accessibility/*`, `AccessibilityWidget` и
  `AccessibilityProvider`.

## Styling

- Global baseline: `src/index.css` и `src/App.css`.
- Tailwind config съдържа colors, typography и plugin-и.
- Theme state се прилага чрез `data-theme` на root от `ThemeProvider`;
  `SITE_THEME_NAMES` е разрешеният набор.
- Използвай `@/` alias вместо дълги relative imports.
- Следвай съществуващите rounded cards, focus-visible, responsive padding и
  `motion-reduce:` patterns. Нова анимация винаги има reduced-motion fallback.

## Feature flags и maintenance

`SettingsProvider` взима site status/settings. `AppContent` не заменя целия
сайт при transient error; maintenance screen се показва само ако успешен или
cached response explicitly има `maintenance_mode`. Feature routes за song/poll/
meme показват `FeatureDisabledPage`, когато backend flag е изключен.
