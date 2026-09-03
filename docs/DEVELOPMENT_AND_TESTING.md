# Frontend разработка и тестове

## Environment

Копирай `.env.example` към `.env` и настрой само public Vite variables:

| Variable | Роля |
| --- | --- |
| `VITE_API_BASE_URL` | Absolute API origin при отделен frontend deployment; празно/same-origin за production SPA. |
| `VITE_DEV_BACKEND_URL` | Vite dev proxy target, normalно `http://127.0.0.1:8000`. |
| `VITE_GOOGLE_CLIENT_ID` | Public OAuth client ID; не е client secret. |
| `VITE_TURNSTILE_SITE_KEY` | Public Turnstile site key; secret остава в backend. |

Всичко с `VITE_` е видимо в browser bundle. Никога не добавяй password,
private API key, VAPID private key или database credential.

## Команди

```bash
npm install
npm run dev          # Vite + HMR on 5173
npm run typecheck    # TypeScript app + node config
npm run lint         # ESLint
npm run test         # Vitest
npm run test:a11y    # accessibility test suite
npm run test:e2e     # Playwright, ако environment е конфигуриран
npm run build        # production dist/
npm run preview      # local static build preview
```

`npm run build:dev` е development-mode bundle за debugging. `npm run test:all`
комбинира unit и e2e tests.

## Преди да предадеш change

1. `npm run typecheck`.
2. `npm run lint`.
3. Relevant Vitest files, после `npm run test` при по-широк change.
4. `npm run test:a11y` при UI/component changes.
5. `npm run build` за route/import/env/config changes.
6. Ръчно провери narrow mobile, keyboard navigation, light/dark/custom theme,
   reduced motion и unauthenticated/authenticated state.
7. Ако API се е променило, пусни backend tests и обнови двата docs repo-а.

## Test conventions

- Existing tests са `*.spec.tsx`, например notification target, home, bell и
  preferences/accessibility.
- Ползвай Testing Library: тествай user behavior, не private implementation.
- Mock-вай `api.tsx` boundary или `fetch`, не React Query internals.
- За accessibility използвай vitest-axe и тествай dialog, keyboard, labels,
  error text и focus behavior.
- E2E не трябва да използва production account/secret и не бива да праща
  реални push/email заявки.

## Build/release handoff

`npm run build` произвежда `dist/`. Production Apache DocumentRoot трябва да
сочи към deployed `dist`, а server rewrite трябва да връща `index.html` за
нефайлови React routes. API/static exclusions са Apache responsibility.

След deployment провери директно от incognito: `/`, `/news`, `/post/<id>`,
`/profile` login redirect, refresh на nested route, post share preview и
network requests без localhost URL.
