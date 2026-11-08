# UI, accessibility, SEO и PWA

## Дизайн система

UI използва Tailwind utility classes, shadcn/Radix primitives и site theme
tokens. Вътрешните pages следват `InteriorPage` / `InteriorPageHero` /
`InteriorSection`, cards с последователни radius/shadow/border и responsive
spacing. Преди нов component първо потърси reusable primitive в
`src/components/ui/`.

Интерактивните елементи трябва да имат visible hover, active и
`focus-visible` state. Цветът не е единствено средство за status/error.

### Шрифтове

| Роля | Шрифт | Tailwind |
| --- | --- | --- |
| Заглавия `h1–h6` (задава се глобално в `index.css`) | Commissioner | `font-heading` |
| Текст на статии | Source Serif 4 | `font-reading` |
| Менюта, бутони и всичко останало | Sofia Sans | `font-sans` |

Нов шрифт се добавя само ако показва българските форми на буквите (`locl`
при `lang="bg"`). Провери го през реалната Google Fonts връзка, като сравниш
`lang="bg"` с `lang="ru"`: Inter, Roboto, Noto и Open Sans например не показват
разлика. Елемент с нов собствен шрифт трябва да влезе и в правилото за
дислексия в `index.css`, иначе ще заобиколи OpenDyslexic.

### Рисунки

`components/art/SiteArt.tsx` съдържа нарисуваните предмети на сайта. Те са за
местата, където страницата се представя: заглавия (`InteriorPageHero art="…"`),
празни състояния и грешки (`QueryEmptyState art="…"`), началната страница и
менютата „Още“. В бутоните, основната навигация и плътните контроли остават
простите икони от `lucide-react`, защото там са по-четливи. Цветовете в рисунките
са фиксирани, затова нова рисунка трябва да се вижда добре и на светъл, и на тъмен
фон. Рисунките са декоративни и се скриват от екранните четци.

Шегите са в `lib/playful-messages.ts`. Те само допълват истинската информация и
никога не заменят причината за грешка, спечелените точки или бутона за нов опит.

## Вход и регистрация

Входът и регистрацията са страници: `/login` и `/register`. За да пратиш някого
към вход и да го върнеш обратно след това, ползвай `useGoToLogin()` или
`loginPath(next)` от `lib/auth-paths.ts`. Там `next` се проверява, за да не води
към друг сайт.

Единственият прозорец е `SessionExpiredDialog`. Той се показва, когато сесията
изтече, докато човек е на страница, за да не се загуби написаното. На защитени
страници като `/profile` пренасочването към `/login` е достатъчно и прозорец няма.

## Банер за бисквитки

`CookieConsent` казва на посетителя, че сайтът няма бисквитки за аналитика, и
описва бисквитките в панела „За какво са бисквитките?“. Трите избора остават
задължителни, включително „Отказвам“. Ако добавиш нова бисквитка, обнови
`cookieDetails`, раздел 9 от политиката за поверителност и теста в
`tests/e2e/site-smoke.spec.ts`, който следи какво се задава при първо посещение.

## Печат на статии

Бутонът „Принтирай“ и Ctrl/Cmd+P на `/post/:id` минават през `usePostPrint`.
Хукът показва `PostPrintView`, изчаква снимките и шрифтовете (до 15 сек.) и
вика `window.print()`. Изгледът е portal в `body` и се показва само при печат:
блокът `@media print` в `index.css` скрива всички останали деца на `body` и
презаписва цветовите променливи, така че всяка тема излиза тъмен текст на бяло.

Изгледът се зарежда при първия печат и остава до смяна на статията, защото
някои мобилни браузъри рендират страницата след `afterprint`. Така обикновеното
отваряне на статия не тегли снимките в пълен размер. При печат от менюто на
браузъра няма как да се изчака, затова още неизтеглени снимки може да липсват.

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
