# ПГКНМА Блог — frontend документация

Тази папка описва React/Vite приложението. Backend и production operations са
в sibling repository `../backend backup 27.07.2026/cms/docs/`.

## Откъде да започнеш

| Документ | Съдържание |
| --- | --- |
| [FRONTEND.md](FRONTEND.md) | Bootstrap, routing, layout, pages, component groups и styles. |
| [STATE_AND_API.md](STATE_AND_API.md) | React Query, contexts, JWT refresh, API client и error rules. |
| [UI_ACCESSIBILITY_AND_PWA.md](UI_ACCESSIBILITY_AND_PWA.md) | Теми, accessibility widget, SEO, push, service worker и responsive UI. |
| [DEVELOPMENT_AND_TESTING.md](DEVELOPMENT_AND_TESTING.md) | Environment, commands, tests, build и release handoff. |

## Бързи команди

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run test
npm run build
```

## Важно

- Това е отделен Git repository; документирай frontend change тук, а backend
  API/deployment change в backend repo документацията.
- `VITE_*` променливите се вграждат в browser build. Никога не поставяй secret
  в тях.
- При разминаване между документ и код source of truth са `src/`, tests и
  backend API schema.
