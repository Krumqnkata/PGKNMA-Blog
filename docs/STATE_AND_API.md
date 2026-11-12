# State, authentication и API интеграция

## Видове state

| Вид | Място | Примери |
| --- | --- | --- |
| Server state | TanStack Query | Posts, events, notifications, profile, settings. |
| Auth state | `AuthContext` | `user`, access token, loading, login dialog. |
| Site state | `SettingsContext` | Feature flags, maintenance status. |
| Accessibility state | `AccessibilityProvider` | Font size, contrast, motion, filters, reading guide. |
| Local browser state | `localStorage`/cookies | JWTs, cached user, theme/accessibility/push preferences, consent. |
| Form state | React Hook Form + Zod | Contact, auth, settings, submissions. |

Не слагай API response в повече от едно custom context, ако React Query вече
е source of truth. Използвай query invalidation след mutation вместо ръчно
дублиране на списъци.

## API client

`src/lib/api.tsx` съдържа typed API functions/interfaces за pages/components.
`src/lib/api_auth.ts` е shared low-level transport:

1. `apiUrl()` решава `VITE_API_BASE_URL` или same-origin URL.
2. `apiRequest()` извиква `authFetch()`.
3. `authFetch()` добавя Bearer access token и JSON content type при JSON body.
4. При 401 само един refresh request изпълнява `/api/auth/token/refresh/`.
5. Едновременните failed requests чакат обща refresh queue, после се retry-ват.
6. При failed refresh local auth се изчиства и се dispatch-ва session-ended
   event за `AuthProvider`.

Не използвай raw `fetch('/api/...')` за authenticated data, освен ако има
конкретна причина и същите auth/error правила са приложени.

ИИ полета и endpoint-и:

- `Post.ai_summary?: string` — резюмето „Накратко“; `withResolvedPostMedia`
  го нормализира до `''`, ако backend-ът не го връща.
- `SiteStatus.ai_summaries_enabled?` и `ai_assistant_enabled?` — по подразбиране
  `false` в `SAFE_DEFAULT_SETTINGS`.
- `askAssistant()` → `POST /api/ai/assistant/`. Хвърля `ApiResponseError` с
  `code` (`turnstile_required`, `turnstile_failed`, `ai_daily_limit`,
  `ai_disabled`, `ai_unavailable`). Отговорът се показва като обикновен текст,
  не като HTML/Markdown.

## Authentication lifecycle

1. Login/register/Google result се пази като `accessToken`, `refreshToken` и
   minimal `user` cache в localStorage.
2. При startup `AuthProvider` извиква `getCurrentProfile()` за authoritative
   server sync. Local cached user е само временно UI удобство.
3. Login/logout/session-ended invalidира relevant React Query notification/
   user queries и sync-ва/откача browser push subscription.
4. `ProtectedRoute` изчаква initial auth loading, след което не допуска
   unauthenticated user до profile route.

### Последствия за security

JWT в localStorage изисква много внимателно XSS отношение. Не добавяй unsafe
HTML, arbitrary script injection, token в URL или third-party script без
privacy/security review. Backend остава единствената authority за роли и
permissions; `user.can_access_admin` е само UI hint.

## React Query правила

- Query keys трябва да включват параметрите, които променят response-а.
- Mutation success invalidира точния query key/keys.
- Показвай `isLoading`, `isFetching`, error и empty state според UX контекста.
- Не retry-вай безкрайно mutation с destructive effect.
- За TV ползвай `use-resilient-tv-query`: cached/fallback content е по-добър
  от бял екран.
- При navigation/async effect ползвай cancellation/ignore flag, когато стар
  response би могъл да запише stale state.

## Типове и contract промени

Frontend types не валидират response runtime. При backend API change:

1. обнови backend serializer/schema;
2. обнови frontend interface и mapper/function в `api.tsx`;
3. прегледай всички `rg` usages на засегнатата функция/type;
4. добави fallback за optional field, ако backend/frontend могат да се deploy-нат
   в различен момент;
5. добави/обнови unit test.

Избягвай `as SomeType` на API boundary. Съществуващите casts са technical debt
от relaxed TypeScript config; нов код трябва да предпочита explicit narrow/guard.

## Push integration

`src/lib/push-notifications.ts`:

- проверява service worker, PushManager и Notification support;
- взима public VAPID key от `/api/push/config/`;
- subscribe-ва само след user gesture/permission;
- изпраща endpoint/keys към `/api/push/subscription/`;
- пази management token за anonymous device management;
- при auth state change attach/detach-ва current device.

UI: `BrowserPushSettings`, `DevicePushSettingsDialog`, `PushOptInPrompt`.
Не показвай native permission popup автоматично; потребителят трябва да натисне
изричен бутон. Не показвай opt-in prompt на TV route или вече subscribed device.
