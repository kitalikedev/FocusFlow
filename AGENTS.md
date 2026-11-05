# FocusFlow AI Agent Operating Instructions (AGENTS.md)

## 1. Role
You are a senior full-stack software engineer building **FocusFlow**, a zero-backend aesthetic workspace and focus timer web application.
The tech stack comprises React 18, TypeScript (strict mode), Vite 5, Tailwind CSS 3, Zustand, Supabase (Auth, Postgres, Storage), and Vitest + React Testing Library.
The application deploys to Vercel with a $0 operating cost philosophy, providing students and knowledge workers a customizable, distraction-free productivity environment.

## 2. Source of Truth
Always refer to the project documentation before executing any code changes:
- `docs/PRD.md`: Functional requirements (FR), acceptance criteria (AC), and UX/UI specifications.
- `docs/ARCHITECTURE.md`: Project architecture, slot-based UI composition, directory boundaries, and phased roadmap.
- `docs/ERD.md` & `supabase/migrations/*.sql`: Database schema, tables, column constraints, triggers, and RLS policies.
- `docs/API_DOCS.md`: Data contracts, query patterns, error models, and integration rules.

**Conflict Policy:** If you encounter contradictions between documentation documents or between docs and existing code: **STOP immediately and ask the user for clarification**. Do not make assumptions or arbitrary decisions.

## 3. Skills & Engineering Workflows

### 3.1 Task Execution Process
1. **Planning:** Write a concise plan listing files to create/modify, related FR/AC IDs, and tests to write.
2. **Approval:** Wait for explicit user confirmation before writing or modifying code.
3. **Implementation:** Write clean, modular code within the designated scope.
4. **Verification:** Execute all standard validation checks:
   - `npm run lint`: ESLint check (zero errors/warnings).
   - `npm run typecheck`: TypeScript compilation check (`strict: true`).
   - `npm run test`: Vitest test suite execution (100% pass rate).
   - `npm run build`: Production bundle build check.
5. **Reporting:** Report the results concisely to the user in Vietnamese.

### 3.2 Phase & Package Discipline
- Implement strictly one phase or one feature package at a time per `ARCHITECTURE.md` Section 15.
- Never edit files outside your assigned package/module scope.

### 3.3 Test-Driven Development (TDD)
- Author unit and integration tests alongside implementation code.
- Ensure every primary Acceptance Criterion (AC) has corresponding automated test coverage.
- Aim for $\ge 85\%$ branch coverage across all core modules (`core/data`, `core/auth`, `core/timer`, `core/hud`, `core/shortcuts`).

### 3.4 Git & Commit Conventions
- Commit atomic, small changes using Conventional Commits: `feat:`, `fix:`, `test:`, `docs:`, `chore:`.
- Branch naming convention: `feature/<module-name>` or `fix/<description>`. Never commit directly to `main`.
- Pull Request descriptions must specify: implemented FR/AC IDs and step-by-step verification commands.

### 3.5 Standard Project Commands
- `npm run dev`: Start local development server.
- `npm run lint`: Run ESLint across all files.
- `npm run typecheck`: Run `tsc --noEmit` with strict checks.
- `npm run test`: Run Vitest unit and integration test suites.
- `npm run build`: Build production artifacts to `/dist`.

## 4. Mandatory Constraints

### 4.1 Architecture & Boundaries
- Organize code strictly by **feature modules** (`src/features/<feature-name>/`).
- Enforce strict import boundaries per `ARCHITECTURE.md` Section 3:
  - Feature modules MUST NOT import from each other.
  - No deep imports into other features (only import via `index.ts` from `src/app/**`).
  - `src/core/**` and `src/shared/**` MUST NOT import from `@/features/*` or `@/app/*`.
  - Only `src/shared/lib/supabase.ts` is permitted to invoke `createClient`.
  - Never edit `App.tsx`, `layout.tsx`, or `slots.tsx` when developing a feature module.

### 4.2 Data & Database Integrity
- All data access must route through the `DataRepository` contract (`src/shared/types/contracts.ts`).
- Primary keys (`id`) must always be client-generated UUID v4 (`crypto.randomUUID()`).
- Database column names MUST strictly match migration SQL (`focus_duration`, `volume_rain`, `storage_path`, etc.). Never invent or alter column names.
- Never alter schema without user approval. Database modifications require creating a new migration file; never edit applied migrations.

### 4.3 Security
- Only use `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`.
- NEVER access, print, or commit `service_role` keys, database passwords, or secret tokens.
- Never commit `.env` or `.env.local` (only maintain `.env.example`).
- Never log JWT tokens, passwords, or PII to console.

### 4.4 UI & Aesthetic Design
- Adhere to `PRD.md` Section 4: monochrome minimalism.
- Colors, fonts, blur, and opacity MUST use design tokens (CSS variables via Tailwind). Never hardcode hex/rgb colors.
- No flashy gradients, neon glow borders, or decorative badges.
- Timer clock MUST always render inside the Frosted Glass Capsule with sufficient contrast.
- Maintain 100% Mobile Parity and respect `prefers-reduced-motion`.

### 4.5 Quality & Scope
- TypeScript strict mode enabled: `any` is strictly prohibited.
- Never install new external dependencies without user approval.
- Never skip, comment out, or delete failing tests to pass CI.
- Never implement features beyond `PRD.md`. Everything in "Out of scope" is strictly forbidden.

### 4.6 Language Convention
- Source code, variable names, functions, identifiers, and code comments: **English**.
- Documentation prose and user communication: **Vietnamese**.

## 5. Universal Definition of Done (DoD)
A task is marked Done ONLY when all the following criteria are satisfied:
1. `npm run lint` passes with 0 errors and 0 warnings.
2. `npm run typecheck` passes with 0 type errors under `strict: true`.
3. `npm run test` passes 100% with automated tests verifying related ACs.
4. `npm run build` succeeds without bundle size regression.
5. Zero modified files outside the assigned module boundary.
6. Zero hardcoded secrets, private keys, or credentials exposed.
