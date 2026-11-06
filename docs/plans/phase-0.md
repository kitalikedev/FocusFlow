# Kế hoạch Triển khai Chi tiết: Phase 0 — Khởi tạo Kiến trúc Nền tảng (Scaffold & Foundation)

**Phiên bản:** 1.3  
**Tài liệu căn cứ:** `AGENTS.md`, `docs/PRD.md` (v1.2.1), `docs/ARCHITECTURE.md` (v1.2.1), `docs/ERD.md` (v1.2), `docs/API_DOCS.md` (v1.1)  
**Trạng thái:** Đã duyệt (Approved) — đang thực thi  

---

## Lịch sử Thay đổi (Change History)

* **Phiên bản 1.3 (06/11/2026):**
  1. *Sửa token giao diện:* Chuẩn hóa token nền thành `--bg-solid-color`, loại bỏ hoàn toàn `--color-bg` để khớp chính xác 15 Design Tokens theo PRD FR-24 và ARCHITECTURE Mục 4.2.
  2. *Nâng cấp Node.js môi trường CI:* Cập nhật workflow CI và tệp `.nvmrc` lên Node.js 22.
  3. *Mục 9 (Ghi chú triển khai):* Bổ sung mục ghi chú chi tiết về đổi tên file test `smoke.test.tsx`, tệp môi trường `src/vite-env.d.ts`, cấu hình `manualChunks` tách vendor, stub `React.createElement`, 11 slot trong `slots.tsx`, và quản lý rủi ro 12 lỗ hổng devDependencies.
* **Phiên bản 1.2 (06/11/2026):**
  1. *Mục 5 (Test Plan):* Đổi tên hàm kiểm thử thành `setTokens()`, bổ sung kiểm thử hàm `resetTheme()` đưa store về đúng preset mặc định Obsidian Minimal.
  2. *Mục 2 (Cây file):* Bổ sung tệp `package-lock.json` bắt buộc tạo bởi `npm install` và theo dõi trong Git.
  3. *Mục 3.2 (devDependencies):* Cập nhật `typescript` thành `~5.5.4` nhằm tương thích dải phiên bản TypeScript được `@typescript-eslint` v7 hỗ trợ ổn định.
  4. *Mục 4 (Bước 1 & Bước 3):* Quy định rõ `tsconfig.json` có `"noEmit": true`; `.eslintrc.cjs` bổ sung `ignorePatterns: ['dist', 'coverage']`.
  5. *Mục 4 (Bước 4) & Mục 6 (DoD 3):* Cấu hình `vitest.config.ts` với `coverage.provider: 'v8'`, `coverage.include: ['src/core/**']`, loại trừ các file kiểm thử, và đặt ngưỡng `thresholds.branches: 85`. Xác lập lệnh kiểm chứng DoD 3 là `npm run test -- --coverage`.
  6. *Mục 4 (Bước 9):* Định nghĩa chi tiết quy cách `ci.yml` (`name: CI`, job id `ci`, trigger `pull_request` và `push` nhánh `main`, Node 22, cache npm, `npm ci`, quyền `contents: read`, chạy tuần tự lint -> typecheck -> test -> build) và `vercel.json` chuẩn hóa theo Mục 10.3 `ARCHITECTURE.md`.
  7. *Mục 7 (Git Strategy):* Bổ sung quy tắc: sau khi DoD hoàn tất, agent báo cáo và DỪNG; chỉ commit `chore: scaffold phase 0 foundation` (kèm `package-lock.json` và plan) khi người dùng nhắn "commit"; chỉ push khi có tin nhắn "push" riêng.
* **Phiên bản 1.1 (06/11/2026):** Khởi tạo lazy `getSupabaseClient()`, di chuyển file kiểm tra ranh giới sang `clock-modes`, bổ sung `@vitest/coverage-v8`, dùng `var(--bg-solid-color)` cho stub, chuẩn hóa JS bundle <= 200 KB gzipped, loại bỏ 100% LaTeX và ký tự dollar.
* **Phiên bản 1.0 (06/11/2026):** Bản dự thảo kế hoạch kỹ thuật Phase 0 ban đầu.

---

## 1. Mục tiêu & Phạm vi (Objectives & Scope)

Theo Mục 15 của `docs/ARCHITECTURE.md`, Phase 0 đóng vai trò dựng khung xương nền tảng bất biến cho toàn bộ dự án, bảo đảm môi trường kiểm soát chất lượng nghiêm ngặt (strict boundary enforcement) trước khi bước vào các phase nghiệp vụ.

### 1.1. Phạm vi Công việc (Scope)
* Khởi tạo bộ khung Vite 5 + React 18 + TypeScript (chế độ `strict: true`).
* Cấu hình Tailwind CSS 3 ánh xạ 100% vào Design Tokens (CSS variables).
* Cấu hình ESLint (`eslint@^8.57.0`) với hệ thống `overrides` theo thư mục bảo vệ ranh giới kiến trúc bất biến giữa Core, Features, Shared và App.
* Thiết lập môi trường kiểm thử tự động Vitest + React Testing Library (RTL) kèm smoke tests và cấu hình đo coverage V8.
* Triển khai hoàn chỉnh module `src/core/theme/`: 15 Design Tokens, hàm `applyTheme()`, Zustand `useThemeStore`, và Theme mặc định Obsidian Minimal.
* Triển khai `src/core/ui/useUiStore.ts` quản lý trạng thái modal, zen mode, mobile drawer tabs.
* Xây dựng `src/core/hud/` stub và `src/app/slots.tsx` kèm **Stub Components** cho 4 feature modules độc lập.
* Tạo hợp đồng interfaces dùng chung `src/shared/types/contracts.ts` và stub lazy `src/shared/lib/supabase.ts`.
* Cấu hình CI GitHub Actions (`.github/workflows/ci.yml`), Vercel deployment (`vercel.json`), và `.env.example`.

### 1.2. Ràng buộc Cốt lõi
* **Phase 0 hoàn toàn không phụ thuộc vào cơ sở dữ liệu Supabase** (chưa cần kết nối mạng hoặc database thật).
* Toàn bộ mã nguồn tuân thủ triết lý vận hành 0 USD Operating Cost, initial JS bundle <= 200 KB gzipped.

### 1.3. Truy vết FR/NFR Liên quan
* **FR liên quan trực tiếp:** `FR-24` (Theme Engine nền tảng), `FR-10` & `FR-15` (Khung Frosted Glass Capsule), `FR-30` (HUD Slot stub).
* **NFR liên quan:** `NFR-5.1` (UI Load Time <= 1.5 s), `NFR-5.3` (Initial JS bundle <= 200 KB gzipped), `NFR-5.5` (TypeScript `strict: true`, 0 ESLint errors/warnings).

---

## 2. Danh sách File & Thư mục Dự kiến Tạo

```text
FocusFlow/
├── .github/
│   └── workflows/
│       └── ci.yml                             # CI kiểm tra lint, typecheck, test, build (Node 22)
├── .env.example                               # Biến môi trường mẫu
├── .eslintrc.cjs                              # Cấu hình ESLint Directory Overrides (Mục 3.3 Architecture)
├── .nvmrc                                     # Cố định phiên bản Node.js 22
├── .prettierrc                                # Quy chuẩn format code
├── .prettierignore                            # Bỏ qua dist, coverage, node_modules
├── index.html                                 # HTML template kèm viewport di động & font preload stub
├── package.json                               # Scripts và danh sách dependencies chuẩn
├── package-lock.json                          # Lockfile cố định chính xác phiên bản dependencies
├── postcss.config.js                          # PostCSS cho Tailwind
├── tailwind.config.ts                         # Mapping Tailwind colors vào CSS variables
├── tsconfig.json                              # TypeScript strict compiler options (noEmit: true) & path alias (@/*)
├── tsconfig.node.json                         # TypeScript config cho Vite/Node scripts
├── vercel.json                                # Cấu hình Header CSP, SPA rewrites, Cache headers (Mục 10.3 Architecture)
├── vite.config.ts                             # Cấu hình Vite, alias `@`, Rollup chunking (manualChunks)
├── vitest.config.ts                           # Cấu hình Vitest, jsdom environment, coverage V8 (core threshold 85%)
├── src/
│   ├── vite-env.d.ts                          # Type definitions cho Vite environment variables
│   ├── test/
│   │   ├── setup.ts                           # Setup RTL matchers (@testing-library/jest-dom)
│   │   └── smoke.test.tsx                     # Integration smoke test render App shell
│   ├── app/
│   │   ├── index.css                          # Định nghĩa :root fallback 15 tokens và Tailwind base
│   │   ├── main.tsx                           # Điểm nhập React DOM (mount vào #root)
│   │   ├── App.tsx                            # Root Component bọc layout shell và providers
│   │   ├── providers.tsx                      # Provider khởi tạo theme ban đầu
│   │   ├── layout.tsx                         # Bố cục 3 tầng (Header HUD, Center Capsule, Dock đáy)
│   │   └── slots.tsx                          # Composition Root: Registry 11 Slots kèm Stub Fallbacks
│   ├── core/
│   │   ├── theme/
│   │   │   ├── tokens.ts                      # Danh mục 15 Design Tokens CSS variables
│   │   │   ├── applyTheme.ts                  # Hàm áp dụng token vào document.documentElement
│   │   │   ├── presets.ts                     # Cấu hình theme mặc định Obsidian Minimal
│   │   │   ├── useThemeStore.ts               # Zustand store quản lý active theme tokens (setTokens, resetTheme)
│   │   │   └── __tests__/
│   │   │       ├── applyTheme.test.ts         # Test hàm applyTheme ghi đúng 15 CSS variables
│   │   │       └── useThemeStore.test.ts      # Test store theme khởi tạo, setTokens và resetTheme
│   │   ├── ui/
│   │   │   ├── useUiStore.ts                  # Zustand store quản lý Zen, modal opens, drawer tabs
│   │   │   └── __tests__/
│   │   │       └── useUiStore.test.ts         # Test bật tắt zen, toggle fullscreen, modal state
│   │   └── hud/
│   │       ├── useHud.ts                      # Stub hook trạng thái HUD
│   │       ├── HudSlot.tsx                    # Component HUD stub (hiển thị cycle dots & fullscreen)
│   │       └── __tests__/
│   │           └── HudSlot.test.tsx           # Test render HUD stub
│   ├── features/                              # 4 Feature Modules Stub (Phase 0 dùng React.createElement)
│   │   ├── clock-modes/
│   │   │   └── index.ts                       # Xuất ClockDisplayStub (25:00 trong capsule), ClockSettingsPopoverStub
│   │   ├── theme-wallpaper/
│   │   │   └── index.ts                       # Xuất WallpaperLayerStub (var(--bg-solid-color)), EffectsLayerStub, ModalStubs
│   │   ├── audio/
│   │   │   └── index.ts                       # Xuất ControlBarStub
│   │   └── productivity/
│   │       └── index.ts                       # Xuất FocusIntentStub, DesktopSidePanelsStub, MobileDrawerTabsStub
│   └── shared/
│       ├── types/
│       │   └── contracts.ts                   # Định nghĩa toàn bộ TypeScript Interfaces (Mục 4.2 Architecture)
│       └── lib/
│           └── supabase.ts                    # Lazy Supabase client getter (nơi duy nhất gọi createClient)
```

---

## 3. Danh sách Dependencies & Scripts Cần Cài đặt

Toàn bộ gói phụ thuộc đều bám sát **Mục 2 Tech Stack** của `ARCHITECTURE.md`. Không bổ sung bất kỳ thư viện ngoài luồng nào.

### 3.1. Production Dependencies (`dependencies`)
| Tên Thư viện | Phiên bản | Mục đích & Lý do Lựa chọn |
| :--- | :--- | :--- |
| `react` | `^18.3.1` | Thư viện UI cốt lõi. |
| `react-dom` | `^18.3.1` | Render React vào DOM trình duyệt. |
| `zustand` | `^4.5.2` | Quản lý trạng thái nhẹ (< 2 KB), selector không gây re-render diện rộng. |
| `@supabase/supabase-js` | `^2.42.7` | SDK chính thức kết nối Supabase (Auth, Postgres, Storage). |
| `lucide-react` | `^0.378.0` | Bộ icon SVG đơn sắc, hỗ trợ tree-shaking tối đa theo từng icon. |

### 3.2. Development Dependencies (`devDependencies`)
| Tên Thư viện | Phiên bản | Mục đích & Lý do Lựa chọn |
| :--- | :--- | :--- |
| `typescript` | `~5.5.4` | Trình biên dịch TypeScript, tương thích dải phiên bản được `@typescript-eslint` v7 hỗ trợ. |
| `@types/react` | `^18.3.1` | Type definitions cho React 18. |
| `@types/react-dom` | `^18.3.0` | Type definitions cho React DOM. |
| `@types/node` | `^20.12.7` | Type definitions cho path và module resolution trong Vite. |
| `vite` | `^5.2.11` | Build tool và bundler siêu nhanh cho SPA. |
| `@vitejs/plugin-react` | `^4.2.1` | Plugin tích hợp Fast Refresh cho React trên Vite. |
| `tailwindcss` | `^3.4.3` | Framework utility CSS, purge CSS tự động < 15 KB. |
| `postcss` | `^8.4.38` | Bộ xử lý CSS cho Tailwind. |
| `autoprefixer` | `^10.4.19` | Tự động thêm tiền tố vendor CSS. |
| `eslint` | `^8.57.0` | Công cụ lint mã nguồn, thực thi ranh giới import (bắt buộc `^8.57` để tương thích `overrides`). |
| `@typescript-eslint/parser` | `^7.8.0` | Parser cho TypeScript trong ESLint. |
| `@typescript-eslint/eslint-plugin` | `^7.8.0` | Bộ rule TypeScript cho ESLint. |
| `prettier` | `^3.2.5` | Công cụ định dạng mã nguồn nhất quán. |
| `vitest` | `^1.6.0` | Framework kiểm thử nhanh gấp 5-10x Jest, tích hợp sẵn với Vite. |
| `@vitest/coverage-v8` | `^1.6.0` | Đo độ phủ mã nguồn Vitest V8, bảo đảm coverage >= 85% theo `AGENTS.md` Mục 3.3. |
| `@testing-library/react` | `^15.0.6` | Tiện ích kiểm thử React components theo hành vi người dùng. |
| `@testing-library/jest-dom` | `^6.4.2` | Bộ matchers mở rộng cho DOM assertions (`toBeInTheDocument`...). |
| `@testing-library/user-event` | `^14.5.2` | Giả lập thao tác người dùng (click, type) chuẩn xác. |
| `jsdom` | `^24.0.0` | Giả lập môi trường DOM trong Node.js cho Vitest. |

### 3.3. Danh sách npm Scripts trong `package.json`
Toàn bộ quy trình xác thực Universal DoD yêu cầu các scripts sau:
* `"dev": "vite"` — Khởi động development server cục bộ.
* `"build": "tsc && vite build"` — Biên dịch TypeScript và đóng gói production artifacts ra `/dist`.
* `"lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0"` — Kiểm tra quy chuẩn mã nguồn với 0 cảnh báo.
* `"typecheck": "tsc --noEmit"` — Kiểm tra hệ thống kiểu tĩnh strict mode mà không xuất file.
* `"test": "vitest run"` — Thực thi toàn bộ test suites với Vitest.

---

## 4. Thứ tự Thực hiện Từng Bước & Lệnh Kiểm chứng (Step-by-Step Execution Plan)

### Bước 1: Khởi tạo Cấu trúc Scaffold & TypeScript Configuration
* Tạo `package.json` với danh mục dependencies và 5 npm scripts đã chốt.
* Tạo `tsconfig.json` với `"strict": true`, `"noImplicitAny": true`, `"noEmit": true`, `"paths": { "@/*": ["./src/*"] }`.
* Tạo `tsconfig.node.json` phục vụ cấu hình Vite.
* Tạo `vite.config.ts` hỗ trợ alias `@` trỏ tới `/src`.
* Chạy cài đặt gói: `npm install` (sinh tệp `package-lock.json`).
* **Lệnh kiểm chứng:** `npm run typecheck` (chạy `tsc --noEmit` không có lỗi).

### Bước 2: Thiết lập Tailwind CSS & Ánh xạ Design Tokens
* Tạo `postcss.config.js` và `tailwind.config.ts`.
* Cấu hình `tailwind.config.ts` ánh xạ 15 biến CSS tokens:
  - Màu nền: `var(--bg-solid-color)`
  - Màu nhấn: `var(--color-accent)`, `var(--color-accent-contrast)`
  - Viên nang: `var(--capsule-bg)`, `var(--capsule-border)`, `var(--capsule-opacity)`, `var(--capsule-radius)`, `var(--capsule-blur)`
* Tạo `src/app/index.css` với các giá trị fallback `:root` cho theme Obsidian Minimal.
* **Lệnh kiểm chứng:** `npm run build` không báo lỗi PostCSS/Tailwind.

### Bước 3: Thiết lập Ranh giới Kiến trúc qua ESLint Overrides (Mục 3.3 Architecture v1.2.1)
* Tạo `.eslintrc.cjs` với `ignorePatterns: ['dist', 'coverage']` và 4 khối overrides theo đúng thứ tự ưu tiên:
  1. `src/app/**`: Cho phép import feature nhưng cấm deep import (`@/features/*/*`).
  2. `src/features/**`: Cấm import chéo lẫn nhau (`@/features/*`), cấm import `@/app/*`.
  3. `src/core/**` và `src/shared/**`: Cấm import từ `@/features/*` và `@/app/*`.
  4. `src/shared/lib/supabase.ts`: Đặt ở vị trí **cuối cùng** mảng `overrides` với `'no-restricted-imports': 'off'`.
* Mọi override 1, 2, 3 đều khai báo lặp lại `paths` cấm `createClient` ngoài `src/shared/lib/supabase.ts`.
* Tạo `.prettierrc` và `.prettierignore`.
* **Quy trình kiểm chứng ranh giới kiến trúc:**
  1. Tạo file vi phạm tạm thời tại `src/features/clock-modes/__boundary_violation__.ts` chứa dòng:
     `import { ControlBar } from '@/features/audio';`
  2. Chạy `npm run lint` để xác nhận ESLint báo lỗi vi phạm import chéo giữa 2 features. Ghi nhận log lỗi.
  3. Xóa file `src/features/clock-modes/__boundary_violation__.ts`.
  4. Chạy lại `npm run lint` xác nhận trả về sạch 0 lỗi, 0 cảnh báo.

### Bước 4: Cấu hình Môi trường Kiểm thử Vitest + React Testing Library
* Tạo `vitest.config.ts` trỏ tới `src/test/setup.ts`, môi trường `jsdom`, cấu hình `coverage`:
  - `provider: 'v8'`
  - `include: ['src/core/**']`
  - Loại trừ các file test `**/*.test.{ts,tsx}`
  - `thresholds: { branches: 85 }`
* Tạo `src/test/setup.ts` nạp `@testing-library/jest-dom/vitest`.
* Viết smoke test mẫu tại `src/test/smoke.test.tsx`.
* **Lệnh kiểm chứng:** `npm run test` chạy xanh 100%.

### Bước 5: Hiện thực hóa Hợp đồng Interfaces (`contracts.ts`) & Stub Lazy Supabase Client
* Tạo `src/shared/types/contracts.ts` chứa đầy đủ:
  - `ThemeTokens`, `ThemeConfig`, `SavedTheme`, `ThemeLimitError`.
  - `TimerDurations`, `TimerState`, `TimerActions`, `InternalClockProps`.
  - `TaskItem`, `TaskPriority`, `TaskFilterParams`, `NoteItem`, `UserSettings`, `FocusSessionRecord`, `WallpaperMetadata`, `DataRepository`.
  - `AmbientSoundType`, `YouTubeTrack`, `AudioService`, `UiState`, `UiActions`.
* Tạo `src/shared/lib/supabase.ts` sử dụng mô hình khởi tạo lazy:
  - Export hàm `getSupabaseClient()` chỉ gọi `createClient` khi được thực thi, kiểm tra biến môi trường và ném lỗi rõ ràng nếu thiếu `VITE_SUPABASE_URL` hoặc `VITE_SUPABASE_PUBLISHABLE_KEY`.
  - Tuyệt đối không throw lỗi ở thời điểm nạp file (module evaluation time) để ứng dụng Phase 0 và hệ thống CI không bị gián đoạn khi chưa có biến môi trường.
  - Phase 0 không có bất kỳ component hay hook nào gọi `getSupabaseClient()`. File này tiếp tục là vị trí duy nhất trong toàn bộ codebase được phép gọi `createClient`.
* **Lệnh kiểm chứng:** `npm run typecheck` vượt qua hoàn toàn.

### Bước 6: Hiện thực hóa `core/theme/` (Theme Engine Nền tảng — FR-24)
* Tạo `src/core/theme/tokens.ts` định nghĩa enum/hằng số đúng 15 CSS variables.
* Tạo `src/core/theme/presets.ts` chứa theme độc bản mặc định `Obsidian Minimal`.
* Tạo `src/core/theme/applyTheme.ts` gán đúng 15 tokens vào `document.documentElement.style`.
* Tạo `src/core/theme/useThemeStore.ts` bằng Zustand lưu trữ active theme tokens và hàm `setTokens()`, `resetTheme()`.
* Viết test:
  - `src/core/theme/__tests__/applyTheme.test.ts`: Kiểm chứng ghi đúng 15 CSS variables, không chứa token nền cũ.
  - `src/core/theme/__tests__/useThemeStore.test.ts`: Kiểm chứng giá trị khởi tạo, cập nhật qua `setTokens()`, và phục hồi theme mặc định qua `resetTheme()`.
* **Lệnh kiểm chứng:** `npm run test` vượt qua 100% các ca test của theme.

### Bước 7: Hiện thực hóa `core/ui/`, `core/hud/` Stub & `app/slots.tsx` kèm Feature Stubs
* Tạo `src/core/ui/useUiStore.ts` quản lý `isZen`, `isFullscreen`, `isMobileDrawerOpen`, v.v. Kèm test tại `src/core/ui/__tests__/useUiStore.test.ts`.
* Tạo `src/core/hud/HudSlot.tsx` hiển thị thanh HUD tối giản (4 dots chu kỳ, streak badge, nút fullscreen). Kèm test tại `src/core/hud/__tests__/HudSlot.test.tsx`.
* Tạo các Stub Components xuất xưởng tại `index.ts` của 4 features:
  - `features/clock-modes`: `ClockDisplay` hiển thị `25:00` trong capsule kính mờ, `ClockSettingsPopover`.
  - `features/theme-wallpaper`: `WallpaperLayer` (sử dụng màu nền `var(--bg-solid-color)` thông qua token CSS; tuyệt đối không hardcode mã hex `#09090b` trong component), `EffectsLayer` (null bọc ErrorBoundary), Modal stubs.
  - `features/audio`: `ControlBar` đáy.
  - `features/productivity`: `FocusIntent` input, `DesktopSidePanels`, `MobileDrawerTabs`.
* Tạo `src/app/slots.tsx` ráp nối 11 Slot Components bọc ErrorBoundary.
* **Lệnh kiểm chứng:** `npm run lint` và `npm run typecheck` đạt 0 lỗi.

### Bước 8: Dựng Layout Shell & Composition Root (`App.tsx`)
* Tạo `src/app/layout.tsx` phân bố Grid/Flex theo Mục 4 PRD: Header HUD, Center Workspace Capsule, Dock bottom.
* Tạo `src/app/providers.tsx` áp dụng theme ban đầu khi ứng dụng khởi chạy.
* Tạo `src/app/App.tsx` ghép nối `providers`, `layout`, và các `slots`.
* Tạo `src/app/main.tsx` và `index.html`.
* **Lệnh kiểm chứng:** `npm run build` xuất thư mục `/dist`. Kích thước initial JS bundle gzipped <= 200 KB theo hạn ngạch Mục 11 Architecture. Cách đo: đối chiếu kích thước gzip của các chunk JS hiển thị trực tiếp trong output của `npm run build`.

### Bước 9: Cấu hình Vercel, CI GitHub Actions & Kiểm tra Toàn diện
* Tạo `.env.example` với `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY`.
* Tạo `vercel.json` chuẩn hóa theo Mục 10.3 `ARCHITECTURE.md` (CSP, header bảo mật, caching immutable và SPA rewrite rule).
* Tạo `.github/workflows/ci.yml`:
  - `name: CI`
  - job id: `ci`
  - Trigger: `pull_request` và `push` vào nhánh `main`
  - `permissions: contents: read`
  - Runner: `ubuntu-latest`, Node.js 22, `actions/setup-node` với cache `npm`
  - Thực thi tuần tự: `npm ci` -> `npm run lint` -> `npm run typecheck` -> `npm run test -- --coverage` -> `npm run build`
* **Lệnh kiểm chứng:** Chạy thử `npm ci` và xác thực toàn bộ Universal DoD.

---

## 5. Kế hoạch Kiểm thử Tự động (Automated Test Plan)

Toàn bộ các bài test ở Phase 0 đều chạy bằng Vitest:

| Tên File Test | Loại Kiểm thử | Mục tiêu Kiểm chứng |
| :--- | :--- | :--- |
| `src/test/smoke.test.tsx` | Integration Smoke Test | Render `<App />` thành công, tìm thấy Frosted Glass Capsule và thời gian mặc định `25:00`. |
| `src/core/theme/__tests__/applyTheme.test.ts` | Unit Test | Hàm `applyTheme(tokens)` gán chính xác 15 thuộc tính CSS variable vào `document.documentElement.style` dưới 50 ms. |
| `src/core/theme/__tests__/useThemeStore.test.ts` | Unit Test | Zustand store khởi tạo với preset Obsidian Minimal; gọi `setTokens()` cập nhật đúng giá trị mới; gọi `resetTheme()` khôi phục preset Obsidian Minimal chuẩn xác. |
| `src/core/ui/__tests__/useUiStore.test.ts` | Unit Test | Bật/tắt `isZen`, `isFullscreen`, mở/đóng modal độc lập, hàm `closeAllModals()` đóng toàn bộ modal. |
| `src/core/hud/__tests__/HudSlot.test.tsx` | Component Test | Component HUD render đúng nút Fullscreen và 4 chấm cycle indicator. |
| `src/features/clock-modes/__boundary_violation__.ts` (Tạm) | Architecture Boundary Check | Tạo file import từ `@/features/audio`; kiểm chứng `npm run lint` bắt buộc báo lỗi; xóa file trước khi kết thúc phase. |

---

## 6. Definition of Done (DoD) của Phase 0

Phase 0 được nghiệm thu HOÀN THÀNH khi và chỉ khi thỏa mãn đầy đủ 7 điều kiện kiểm chứng:
1. `npm run lint` vượt qua với **0 lỗi và 0 cảnh báo** (sử dụng cờ `--max-warnings 0`).
2. `npm run typecheck` (`tsc --noEmit`) vượt qua với **0 lỗi** dưới `strict: true`.
3. `npm run test -- --coverage` vượt qua **100% các ca kiểm thử** và code coverage của các core modules (`src/core/**`) đạt branch coverage >= 85%.
4. `npm run build` xuất ra thư mục `/dist`, tổng kích thước **initial JS bundle <= 200 KB gzipped** theo hạn ngạch Mục 11 Architecture (được đo từ kích thước gzip hiển thị trong output của `npm run build`).
5. Kiểm tra visual trên trình duyệt: Mở trang hiển thị chuẩn xác layout khung với Frosted Glass Capsule bo góc và màu nền tối Obsidian Minimal qua token `var(--bg-solid-color)`.
6. Luật ranh giới kiến trúc hoạt động chuẩn xác: IDE và ESLint báo lỗi tức thì nếu feature import chéo nhau (đã kiểm chứng qua file tạm `__boundary_violation__.ts`).
7. Không có file nào ngoài phạm vi Phase 0 bị sửa đổi; không có secret/token nào bị lộ.

---

## 7. Nhánh Làm việc & Kế hoạch Commit (Git Strategy)

* **Tên nhánh làm việc:** `chore/phase-0-init` (đã checkout từ `main`).
* **Kỷ luật Git:**
  - Thực hiện toàn bộ công việc trên nhánh `chore/phase-0-init`.
  - **KHÔNG commit giữa chừng** trong quá trình thực hiện các bước 1 đến 9.
  - Khi toàn bộ 7 tiêu chuẩn Definition of Done (DoD) đã pass 100%, agent báo cáo chi tiết và **DỪNG LẠI**.
  - **Chỉ khi người dùng gửi tin nhắn "commit"**: Agent mới tạo đúng 1 commit duy nhất:
    `chore: scaffold phase 0 foundation` (bao gồm toàn bộ mã nguồn scaffold, `package-lock.json` và tệp `docs/plans/phase-0.md`).
  - **Chỉ khi người dùng gửi tin nhắn "push" riêng**: Agent mới thực hiện `git push -u origin chore/phase-0-init` và hướng dẫn mở Pull Request vào `main`.
  - Tuyệt đối **KHÔNG git commit --amend** và **KHÔNG commit trực tiếp vào main**.

---

## 8. Rủi ro & Câu hỏi Mở cần Người dùng Xác nhận (Open Questions & Risks)

Trước khi bắt đầu thực thi code của Phase 0, cần làm rõ 2 điểm kỹ thuật nhỏ sau:

1. **Vấn đề Font Chữ Self-hosted (`public/fonts/`):**
   * *Phương án đã chọn:* Ở Phase 0, font-family mặc định của Obsidian Minimal sẽ trỏ về hệ thống font an toàn có sẵn (`Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`). Các tệp WOFF2 tĩnh sẽ được nạp đầy đủ trong Phase 3B khi hoàn thiện Feature Theme & Wallpaper.
2. **Kịch bản Thử nghiệm Lỗi ESLint:**
   * Kịch bản kiểm chứng ranh giới được thực hiện cục bộ bằng file tạm `src/features/clock-modes/__boundary_violation__.ts` import từ `@/features/audio` để chứng minh ESLint chặn lỗi, sau đó xóa file này ngay để đảm bảo working tree sạch sẽ trước khi hoàn tất Phase 0.

---

## 9. Ghi chú Triển khai (Implementation Notes)

1. **Đổi tên smoke test (`src/test/smoke.test.tsx`):**
   * Do tệp kiểm thử chứa cú pháp JSX (`<App />`), trình biên dịch TypeScript và ESLint parser ở chế độ strict bắt buộc tệp phải mang phần mở rộng `.tsx`. Nếu để `.ts` sẽ gây lỗi cú pháp parser (`TS1005: '>' expected`).
2. **Khai báo môi trường TypeScript (`src/vite-env.d.ts`):**
   * Bổ sung tệp định nghĩa kiểu dữ liệu cho `import.meta.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`) giúp lệnh `tsc --noEmit` nhận diện đúng kiểu biến môi trường mà không bị lỗi kiểu.
3. **Phân tách Bundle (`manualChunks` trong `vite.config.ts`):**
   * Áp dụng cấu hình phân chia 4 vendor chunk riêng biệt (`vendor-react`, `vendor-utils`, `vendor-supabase`, `vendor-icons`), giúp nén bundle ban đầu xuống chỉ còn 51.81 KB gzipped (ngưỡng quy định: <= 200 KB gzipped).
4. **Cú pháp Stub Components (`src/features/*/index.ts`):**
   * Để giữ nguyên phần mở rộng `.ts` cho tệp xuất xưởng `index.ts` theo đúng hợp đồng cấu trúc thư mục, các component stub ở Phase 0 được viết bằng `React.createElement` thuần túy. Từ Phase 3, component thật sẽ nằm trong các tệp `.tsx` riêng và `index.ts` chỉ thực hiện nhiệm vụ re-export.
5. **Số lượng Slots thực tế trong `src/app/slots.tsx`:**
   * Hiện thực đầy đủ 11 slots (gồm cả `DrawerTabsSlot` phục vụ Mobile Drawer). Tài liệu Architecture tại Mục 4.1 ghi "10 slot" nhưng bảng ánh xạ chi tiết liệt kê đủ 11 dòng; điểm này sẽ được đồng bộ trong tài liệu ở phase sau.
6. **Chuẩn hóa Token Thiết kế Nền:**
   * Loại bỏ token `--color-bg`, sử dụng thống nhất `--bg-solid-color` cho màu nền đơn sắc, bảo đảm hệ thống có chính xác 15 Design Tokens chuẩn theo PRD FR-24.
7. **Nâng cấp Node.js môi trường CI:**
   * Workflow CI `.github/workflows/ci.yml` và tệp `.nvmrc` được cấu hình sử dụng Node.js 22.
8. **Rủi ro An toàn Phụ thuộc (npm audit):**
   * Phát hiện 12 lỗ hổng (8 moderate, 1 high, 3 critical) nằm hoàn toàn trong `devDependencies` (`tinypool`, `vitest`, `@vitest/coverage-v8`, `vite`, `esbuild`, `@typescript-eslint`). Mã nguồn production (`npm audit --omit=dev`) sạch 100% (0 lỗ hổng). Các cảnh báo này sẽ được xử lý ở PR nâng cấp công cụ riêng để tránh breaking changes trong Phase 0.

---

> [!NOTE]
> **KẾ HOẠCH ĐÃ ĐƯỢC DUYỆT (v1.3):** Kế hoạch Phase 0 phiên bản 1.3 đã được người dùng phê duyệt và đang được thực thi trên nhánh `chore/phase-0-init`. Quá trình thực hiện tuân thủ nghiêm ngặt quy tắc không commit giữa chừng và xác thực đầy đủ 7 tiêu chí Definition of Done trước khi báo cáo.
