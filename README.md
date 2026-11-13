# FocusFlow

**Aesthetic Workspace & Custom Focus Timer** — a web app for focused work: an accurate Pomodoro timer, a workspace you can restyle with themes, generated background sounds, task management and focus statistics.

Live demo: **https://focus-flow-two-wheat.vercel.app**

![Home screen with the default Nebula theme](docs/images/home.jpg)

## Table of contents

1. [Overview](#overview)
2. [Features](#features)
3. [Keyboard shortcuts](#keyboard-shortcuts)
4. [Tech stack](#tech-stack)
5. [Project structure](#project-structure)
6. [Getting started](#getting-started)
7. [Security](#security)
8. [Testing and CI/CD](#testing-and-cicd)
9. [Documentation](#documentation)
10. [Team](#team)

## Overview

FocusFlow is inspired by Flocus and a minimal visual style. The app runs entirely in the browser, is deployed on Vercel and uses Supabase (Auth, PostgreSQL with Row Level Security, Storage) as its backend, so no dedicated server is needed.

- **Use it right away without an account:** in guest mode, data is stored in the browser (localStorage, IndexedDB).
- **Sign in to sync:** email and password accounts store data in Supabase; when you sign in, you are asked whether to merge the guest session's data into the account.
- **Works on desktop and mobile.**

## Features

### Clock and timer

- 5 modes: Pomodoro (25/5), 52/17, Deep Work (90 minutes), Custom and Stopwatch.
- Accurate counting with a Web Worker and `Date.now()`, with no drift while the tab runs in the background.
- Long break after N sessions, automatic session switching, a synthesized end-of-session chime (Web Audio) and a browser notification.
- 3 clock styles: Minimal, Circular Ring, Retro Flip; 2 positions: centered and Mini Corner.
- Zen mode hides everything except the clock; fullscreen mode.

|                   Circular Ring                    |                   Retro Flip                    |             Zen mode             |
| :------------------------------------------------: | :---------------------------------------------: | :------------------------------: |
| ![Circular Ring clock](docs/images/clock-ring.jpg) | ![Retro Flip clock](docs/images/clock-flip.jpg) | ![Zen mode](docs/images/zen.jpg) |

### Themes and wallpapers

- 12 built-in themes; the default theme is Nebula.
- A wallpaper library split into groups: gradients, abstract, animated, Pixel and Cyberpunk (drawn with CSS and SVG, no external images); upload your own image or GIF (up to 5 MB; 1 image for guests, 3 for accounts).
- The Customize tab edits every setting with live preview and Apply / Revert buttons: accent color, frosted glass capsule (color, opacity, blur, corner radius, border), 6 self-hosted clock fonts, text size and weight, and background dim, blur and brightness.
- Effects: rain, snow, fireflies, film grain, vignette, CRT scanlines and a glowing clock.
- Readability is enforced automatically: the capsule always stays dark, its opacity has a 50 % minimum on bright backgrounds, and the accent color is adjusted to reach a 4.5:1 contrast ratio.
- Save your own themes (3 for guests, 10 for accounts), rename and delete them.

|                  Theme library                  |                   Theme customizer                    |
| :---------------------------------------------: | :---------------------------------------------------: |
| ![Theme library](docs/images/theme-library.jpg) | ![Theme customizer](docs/images/theme-customizer.jpg) |

**The 12 built-in themes:**

|                                                                           |                                                                              |                                                            |
| :-----------------------------------------------------------------------: | :--------------------------------------------------------------------------: | :--------------------------------------------------------: |
|              ![Nebula](docs/images/theme-nebula.jpg) Nebula               | ![Obsidian Minimal](docs/images/theme-obsidian-minimal.jpg) Obsidian Minimal |  ![Tokyo Fog](docs/images/theme-tokyo-fog.jpg) Tokyo Fog   |
| ![Midnight Indigo](docs/images/theme-midnight-indigo.jpg) Midnight Indigo |       ![Matcha Slate](docs/images/theme-matcha-slate.jpg) Matcha Slate       | ![Amber Wood](docs/images/theme-amber-wood.jpg) Amber Wood |
|     ![Nordic Night](docs/images/theme-nordic-night.jpg) Nordic Night      |    ![Cyberpunk Neon](docs/images/theme-cyberpunk-neon.jpg) Cyberpunk Neon    |  ![Synthwave](docs/images/theme-synthwave.jpg) Synthwave   |
|       ![Pixel Night](docs/images/theme-pixel-night.jpg) Pixel Night       |    ![Retro Terminal](docs/images/theme-retro-terminal.jpg) Retro Terminal    |  ![Vaporwave](docs/images/theme-vaporwave.jpg) Vaporwave   |

### Sound

- 4 background sound channels generated directly with Web Audio, with no files to download: Rain, Brown Noise, Campfire and Lofi (an electric piano chord loop, bass, soft drums and vinyl noise). Each channel has its own volume slider and fades in and out smoothly.
- A hidden YouTube player: paste a link to add it to the queue (up to 20 tracks), titles are fetched automatically, the next track plays on its own; a ready-made lofi radio list is included.
- Master volume, pause everything, and mute with the `M` key.

### Work tools

- **Tasks:** add, edit, delete and complete tasks; priority, due date and labels; search, filter and sort.
- **Notepad:** saves automatically 500 ms after you stop typing.
- **Focus Intent:** write the goal of a session or pick a task; a completed session is recorded together with its goal.
- **Focus Analytics:** a chart of focus minutes per week, the daily streak, time per goal and a session history.

![Tasks, Notepad and Sounds open together](docs/images/tools.jpg)

|                Focus Analytics                |              Quotes               |
| :-------------------------------------------: | :-------------------------------: |
| ![Focus Analytics](docs/images/analytics.jpg) | ![Quotes](docs/images/quotes.jpg) |

### Quotes

Off by default. When turned on, quotes roll up the screen like film end credits, with a random pause of 20 to 45 seconds between two quotes; they are fully hidden in Zen mode.

### Mobile layout

The tools open as sheets sliding up from the bottom, keeping the full feature set of the desktop layout.

|                               Home screen                               |                                   Tasks                                    |
| :---------------------------------------------------------------------: | :------------------------------------------------------------------------: |
| <img src="docs/images/mobile-home.jpg" alt="Mobile layout" width="260"> | <img src="docs/images/mobile-tasks.jpg" alt="Tasks on mobile" width="260"> |

## Keyboard shortcuts

| Key         | Action          |
| :---------- | :-------------- |
| `Space`     | Start / pause   |
| `R`         | Reset the timer |
| `F`         | Toggle Zen mode |
| `Shift + F` | Fullscreen      |
| `M`         | Mute / unmute   |

Shortcuts are ignored while you type in an input field.

## Tech stack

| Area             | Technology                                                    |
| :--------------- | :------------------------------------------------------------ |
| UI               | React 18, TypeScript (strict), Vite 5, Tailwind CSS 3, Lucide |
| State management | Zustand                                                       |
| Backend          | Supabase: Auth, PostgreSQL with Row Level Security, Storage   |
| Audio            | Web Audio API, YouTube IFrame API                             |
| Testing          | Vitest, React Testing Library                                 |
| Deployment       | Vercel, GitHub Actions                                        |

## Project structure

```text
src/
  app/        Screen layout and the "slots" that plug features in
  core/       Shared core: timer, data, auth, theme, HUD, UI
  features/   One independent folder per feature
    clock-modes/      Clock, settings popover
    theme-wallpaper/  Themes, wallpapers, effects
    audio/            Background sounds, YouTube
    productivity/     Tasks, Notepad, Focus Intent, Analytics
    quotes/           Quotes
  shared/     Types (contracts), Supabase client, Web Audio
supabase/migrations/  Database schema, RLS, triggers
docs/                 Specification documents
```

ESLint blocks imports between features and blocks `core` from depending back on `features`, so each feature can be developed and tested on its own.

## Getting started

Requirements: Node.js 22 (see `.nvmrc`) and npm.

```bash
git clone https://github.com/kitalikedev/FocusFlow.git
cd FocusFlow
npm ci
npm run dev
```

Open http://localhost:5180. Without any further setup the app runs in guest mode. To enable sign-in and sync, copy `.env.example` to `.env.local` and fill in the URL and publishable key of your Supabase project.

| Command                 | Purpose                                             |
| :---------------------- | :-------------------------------------------------- |
| `npm run dev`           | Start the development server (port 5180)            |
| `npm run lint`          | ESLint, including module boundary checks            |
| `npm run typecheck`     | TypeScript type check                               |
| `npm run test`          | Run the whole test suite                            |
| `npm run build`         | Production build                                    |
| `npm run check:secrets` | Scan tracked files for `.env` files and secret keys |

## Security

- **No environment files in git:** `.gitignore` blocks every `.env*` file (except `.env.example`) as well as key and certificate files.
- **Check before every commit:** `npm install` enables the `.githooks/pre-commit` hook, which runs `scripts/check-secrets.mjs` and rejects the commit if it contains a `.env` file or a secret key (Supabase key, JWT, private key, GitHub token, AWS key).
- **Check on CI:** the first step of the GitHub Actions workflow runs the same check on the whole repository.
- **User data:** every table has Row Level Security enabled, so each user can only read and write their own data; the app only uses the publishable key and never the service role key.
- **Browser:** Vercel serves a Content Security Policy that only allows the sources the app needs (Supabase, YouTube, noembed), together with the HSTS, X-Frame-Options and X-Content-Type-Options headers.

## Testing and CI/CD

- Unit and integration tests with Vitest and React Testing Library, with coverage measured for the core.
- Every pull request to `main` runs: the secret check, ESLint, the type check, tests with coverage and the build. `main` is protected: changes must go through a pull request, need 1 approval and the `ci` check must pass.
- Vercel deploys a preview for each pull request and the production site when changes are merged into `main`.

## Documentation

| Document                                       | Content                                                                      |
| :--------------------------------------------- | :--------------------------------------------------------------------------- |
| [`docs/PRD.md`](docs/PRD.md)                   | Product requirements (FR-01 to FR-31), acceptance criteria, UI specification |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Architecture, slot mechanism, module boundaries, data flow                   |
| [`docs/ERD.md`](docs/ERD.md)                   | Database diagram, constraints, RLS                                           |
| [`docs/API_DOCS.md`](docs/API_DOCS.md)         | Data contracts, Supabase API, error model                                    |
| [`docs/plans/`](docs/plans/)                   | Implementation plans for each phase                                          |

## Team

Group 1, class 24SE1.

| No. | Student ID | Full name          | GitHub                                        |
| :-: | :--------- | :----------------- | :-------------------------------------------- |
|  1  | 24090022   | Đàm Huỳnh Hoài Nam | [kitalikedev](https://github.com/kitalikedev) |
|  2  | 24090009   | Trần Công Sanh     | [sanh2k6-sec](https://github.com/sanh2k6-sec) |
|  3  | 24090021   | Nguyễn Anh Dũng    | [Nad1406](https://github.com/Nad1406)         |
|  4  | 24090006   | Võ Xuân Phú        | [vxphuswe](https://github.com/vxphuswe)       |
|  5  | 24090028   | Lê Nguyễn Thảo Anh | [AnhTe0301](https://github.com/AnhTe0301)     |
