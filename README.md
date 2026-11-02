# 🏫 ПГКНМА Дигитална Платформа - Фронтенд

[![CI](https://github.com/Krumqnkata/PGKNMA-Blog/actions/workflows/ci.yml/badge.svg)](https://github.com/Krumqnkata/PGKNMA-Blog/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Krumqnkata/PGKNMA-Blog/actions/workflows/codeql.yml/badge.svg)](https://github.com/Krumqnkata/PGKNMA-Blog/actions/workflows/codeql.yml)
[![License: AGPL-3.0-or-later](https://img.shields.io/badge/license-AGPL--3.0--or--later-blue.svg)](LICENSE)
![React 18](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)

![Project Banner](public/logo-light.png#gh-light-mode-only)
![Project Banner](public/logo-dark.png#gh-dark-mode-only)

> Backend (Django REST API + admin): [Krumqnkata/pgknma-valentine](https://github.com/Krumqnkata/pgknma-valentine)

## 📝 Общ преглед

Това е фронтенд приложението на дигиталната платформа на **Професионална гимназия по компютърно моделиране и компютърни анализи "Проф. Минко Балкански" (ПГКНМА)**. Проектът е изграден с цел да предостави на учениците и учителите модерна, бърза и интерактивна среда за достъп до училищна информация и забавления.

Приложението е разработено с **React 18**, **TypeScript** и **Vite**, като се фокусира върху отлична производителност, достъпност и модерен дизайн.

---

## 📚 Техническа документация

Подробната и поддържана документация за frontend-а е в [docs/README.md](docs/README.md):

- [Архитектура, routing и компоненти](docs/FRONTEND.md)
- [State, JWT и API интеграция](docs/STATE_AND_API.md)
- [UI, accessibility, SEO и PWA](docs/UI_ACCESSIBILITY_AND_PWA.md)
- [Разработка, тестове и build](docs/DEVELOPMENT_AND_TESTING.md)

Backend/API/deployment документацията е в отделния
[backend repository](https://github.com/Krumqnkata/pgknma-valentine), в
неговата папка `docs/`.

---

## 🛠️ Технологичен стек (Deep Dive)

### Ядро (Core)
- **React 18**: Компонентно-базирана архитектура с Hooks.
- **TypeScript**: Типова проверка за по-стабилен код; виж `docs/STATE_AND_API.md` за текущите настройки и ограничения.
- **Vite**: Ултра бърз инструмент за разработка и компилация.

### Потребителски интерфейс (UI/UX)
- **Tailwind CSS**: Системен дизайн чрез utility класове.
- **Shadcn UI**: Премиум компоненти (базирани на Radix UI).
- **Lucide React**: Библиотека с векторни икони.
- **Tailwind animations & tsParticles**: За плавни преходи, scroll ефекти и интерактивни частици.
- **Next Themes**: Автоматична синхронизация на Dark/Light режим.

### Управление на данни
- **TanStack Query (React Query) v5**: Мощно управление на състоянията на сървъра (кеширане, рефетчване).
- **Context API**: За лека глобална държава (auth, settings).
- **React Hook Form & Zod**: За валидация на форми и схеми на данни.

---

## 📂 Изчерпателна структура на проекта

```text
├── public/                     # Статични ресурси
│   ├── Landscape/              # Галерия с изображения на училищния двор
│   ├── bell.pdf                # График на учебните часове
│   ├── program.csv             # Сурови данни за учебната програма
│   ├── front-page-loop.webm    # Видео фон за началната страница
│   ├── favicon.ico             # Икона на сайта
│   └── robots.txt              # Инструкции за търсачки
├── src/
│   ├── components/             # React компоненти (Градивните елементи)
│   │   ├── ui/                 # Базови Shadcn компоненти (40+ компонента)
│   │   │   ├── button.tsx, input.tsx, card.tsx, dialog.tsx...
│   │   │   ├── chart.tsx       # Визуализация на статистически данни
│   │   │   ├── sidebar.tsx     # Навигационен панел (мобилен/десктоп)
│   │   │   └── carousel.tsx    # Слайдер за изображения
│   │   ├── AccountSettings.tsx # Настройки на потребителския профил
│   │   ├── BellSongForm.tsx    # Форма за предложения за музика
│   │   ├── Comments.tsx        # Система за коментари под новините
│   │   ├── CustomCursor.tsx    # Стилизиран персонализиран курсор
│   │   ├── Header.tsx          # Главна навигация и лого
│   │   ├── Footer.tsx          # Информационен блок в края на страницата
│   │   ├── Hero.tsx            # Първата визуална секция на началната страница
│   │   ├── NewsGrid.tsx        # Сетка за визуализация на новини
│   │   ├── PollStatistics.tsx  # Визуализация на резултатите от анкети
│   │   ├── ProtectedRoute.tsx  # Компонент за ограничаване на достъпа
│   │   └── SearchDialog.tsx    # Търсачка в реално време
│   ├── contexts/               # Управление на състоянието (Providers)
│   │   ├── AuthContext.tsx     # Автентикация, JWT сесии и потребителски роли
│   │   ├── SettingsContext.tsx # Динамични настройки и Feature Flags
│   │   └── GlobalStateContext.tsx # Глобални състояния на интерфейса
│   ├── hooks/                  # Персонализирани Hooks
│   │   ├── use-disable-inspect.ts # Защита срещу F12 и десен бутон
│   │   ├── use-mobile.tsx      # Детекция на типа устройство
│   │   └── use-toast.ts        # Система за изскачащи известия
│   ├── lib/                    # Логика и комуникация (SDK)
│   │   ├── api.tsx             # Всички API заявки (новини, анкети, статус)
│   │   ├── api_auth.tsx        # Логика за логин, регистрация и профил
│   │   └── utils.ts            # Помощни функции за Tailwind и Shadcn
│   ├── pages/                  # Маршрути (Routes)
│   │   ├── Index.tsx           # Начална страница (Dashboard)
│   │   ├── News.tsx            # Пълен списък с новини и филтри
│   │   ├── Post.tsx            # Детайлен изглед на единична новина
│   │   ├── SchoolCalendar.tsx  # Календар със събития (20k+ линии логика)
│   │   ├── TVScreen.tsx        # Дигитален борд за училищни екрани
│   │   ├── WeeklyPoll.tsx      # Страница за гласуване в анкети
│   │   ├── MemeOfTheWeek.tsx   # Платформа за училищни мемета
│   │   ├── BellSuggest.tsx     # Гласуване за музикален фон
│   │   ├── MyProfilePage.tsx   # Личен панел на ученика
│   │   ├── MaintenancePage.tsx # Страница при техническа профилактика
│   │   └── ...                 # Правни страници (Privacy, Terms)
│   ├── styles/                 # CSS конфигурации
│   │   ├── index.css           # Глобални Tailwind стилове
│   │   └── atom-one-dark.css   # Тема за Code Highlighting
│   ├── App.tsx                 # Централен рутер и конфигурация
│   └── main.tsx                # Стартова точка (DOM Rendering)
├── .env.example                # Конфигурационен шаблон
├── tailwind.config.ts          # Дефиниции на теми, цветове и анимации
└── package.json                # Пълен списък със зависимости (deps)
```

---

## 🚀 Детайлни функционалности

### 🎨 Интерфейс и Потребителско изживяване
- **Адаптивен дизайн (Mobile First)**: Сайтът изглежда перфектно на смартфони, таблети и компютри.
- **Тъмна и Светла тема**: Автоматично превключване спрямо настройките на операционната система.
- **Интерактивни елементи**: Използване на частици (`tsparticles`), паралакс ефекти и плавни преходи между страниците.

### 📰 Динамично съдържание
- **Markdown Rendering**: Новините поддържат заглавия, списъци, таблици и код, което позволява на учителите да публикуват богато съдържание.
- **Коментари в реално време**: Учениците могат да дискутират под всяка новина.

### 🗳️ Ангажираност на учениците
- **Седмични Анкети**: Модул с графики (Recharts), показващи общественото мнение.
- **Предложения за Звънец**: Интеграция с YouTube/Spotify линкове за предложения на музика.

### 🏢 Училищна администрация (Backend Sync)
- **Feature Flags**: Дистанционно включване/изключване на модули (например изключване на меметата по време на изпити).
- **Maintenance Mode**: Възможност за спиране на сайта при профилактика директно от административния панел.

---

## 🔧 Технически инструкции

### Инсталиране на проекта

1. **Клониране**:
   ```bash
   git clone https://github.com/Krumqnkata/PGKNMA-Blog.git
   ```
2. **Зависимости**:
   Препоръчително е използването на `bun` за по-бърза инсталация:
   ```bash
   bun install
   # или
   npm install
   ```
3. **Конфигурация**:
   ```bash
   cp .env.example .env
   # Отворете .env и задайте VITE_API_BASE_URL
   ```
   `.env` не се качва в git. Всичко с `VITE_` влиза в browser bundle-а, затова
   там никога не слагай пароли или частни ключове.

### Команди за разработка

| Команда | Описание |
| :--- | :--- |
| `npm run dev` | Стартира Vite сървър с HMR (Hot Module Replacement) |
| `npm run build` | Създава оптимизиран `dist/` пакет за продукция |
| `npm run typecheck` | TypeScript проверка на app и node конфигурацията |
| `npm run lint` | Изпълнява ESLint проверка за грешки в кода |
| `npm run test` | Vitest unit и accessibility тестове |
| `npm run test:e2e` | Playwright end-to-end тестове |
| `npm run preview` | Стартира локален сървър за преглед на build-а |

Същите проверки (typecheck, lint, test, build) се пускат автоматично в
GitHub Actions при всеки push и pull request.

---

## 🔒 Сигурност

Проектът включва няколко нива на защита:
- **Cloudflare Turnstile**: Защита срещу автоматизирани атаки (spam) във формите.
- **JWT Authentication**: Сигурно управление на сесиите чрез токени.
- **Content Sanitization**: Предотвратяване на XSS атаки при рендване на Markdown и коментари.

Ако откриеш уязвимост, не отваряй публичен issue — виж [SECURITY.md](SECURITY.md).

---

## 👥 Автори

- [Krumqnkata](https://github.com/Krumqnkata)
- [ythef0](https://github.com/ythef0)
- [lkbonev72](https://github.com/lkbonev72)

Проектът е създаден за ПГКНМА „Проф. Минко Балкански“ с цел иновация и
модернизация на училищния живот.

## 📄 Лиценз

Кодът е © 2025–2026 Krumqnkata, ythef0 и lkbonev72 и е лицензиран под
[GNU AGPL v3.0 или по-нова версия](LICENSE). Ако го ползваш или пуснеш като
сайт, трябва да запазиш авторството и да публикуваш промените си под същия лиценз.

Името, логата, снимките, видеата и документите на ПГКНМА са собственост на
училището и **не са** част от лиценза. Подробности: [NOTICE.md](NOTICE.md).
