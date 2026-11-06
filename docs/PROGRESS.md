# Báo Cáo Tiến Độ Dự Án — FocusFlow

Tài liệu này tổng hợp toàn bộ hiện trạng kỹ thuật, tài liệu, cơ sở dữ liệu, mã nguồn và kế hoạch triển khai của dự án **FocusFlow** tính đến thời điểm hiện tại, phục vụ việc nắm bắt bối cảnh tức thì cho các phiên làm việc tiếp theo.

---

## 1. Tổng quan Dự án

* **Tên dự án:** FocusFlow
* **Mục tiêu:** Ứng dụng web Custom Focus Timer & Aesthetic Workspace (lấy cảm hứng từ Flocus và phong cách thẩm mỹ tối giản), phục vụ sinh viên và dân văn phòng cần không gian làm việc tập trung, cá nhân hóa cao, chạy mượt mà trên cả PC và thiết bị di động.
* **Stack công nghệ chính:** React 18, TypeScript 5 (chế độ `strict: true`), Vite 5, Tailwind CSS 3, Zustand, Supabase BaaS (Auth, PostgreSQL 15+ RLS, Storage), Vitest + React Testing Library; triển khai trên Vercel Edge Network theo triết lý vận hành $0 Operating Cost (không có máy chủ backend riêng).

---

## 2. Trạng thái 5 Tài liệu Nền tảng

Toàn bộ hệ thống tài liệu đặc tả kỹ thuật cốt lõi đã hoàn thành việc biên soạn và đồng bộ hóa đa chiều:

| Tên Tài liệu | Đường dẫn | Phiên bản | Tình trạng | Ghi chú & Phạm vi |
| :--- | :--- | :--- | :--- | :--- |
| **PRD** | [`docs/PRD.md`](PRD.md) | `v1.2.1` | **Đã chốt** (Ready for Implementation) | 31 Yêu cầu chức năng (FR-01 đến FR-31), tiêu chuẩn UX/UI đơn sắc tối giản, ma trận AC Given/When/Then, NFRs. |
| **Architecture** | [`docs/ARCHITECTURE.md`](ARCHITECTURE.md) | `v1.2.1` | **Đã chốt** (Approved for Implementation) | Kiến trúc SPA, slot-based UI composition, ranh giới ESLint overrides, state machine timer, phân kỳ 4 Phase. |
| **ERD** | [`docs/ERD.md`](ERD.md) | `v1.2` | **Đã chốt** (Approved for Implementation) | Schema 6 bảng PostgreSQL, quan hệ thực thể, hàm trigger quota/LWW, phân quyền RLS, kịch bản test SQL. |
| **API Docs** | [`docs/API_DOCS.md`](API_DOCS.md) | `v1.1` | **Đã chốt** (Approved for Implementation) | Hợp đồng DataRepository, Supabase PostgREST 6 bảng, Auth, Storage bucket, RPC keep-alive `ping`, mô hình lỗi `AppError`. |
| **Agent Rules** | [`AGENTS.md`](../AGENTS.md) / [`CLAUDE.md`](../CLAUDE.md) | `v1.0` | **Đã chốt và đã commit** | Quy chuẩn vận hành kỹ thuật, quy tắc an toàn 4.7 Safety, TDD, Conventional Commits, Universal DoD. |

---

## 3. Trạng thái Cơ sở Dữ liệu (Database & Storage)

* **Tệp Migration:** Tệp migration khởi tạo toàn diện tại `supabase/migrations/20261105000000_init_schema.sql` (tạo ngày 05/11/2026, 516 dòng SQL) đã được hoàn thiện, commit và push lên nhánh `main`.
* **Tình trạng thực thi trên Supabase Cloud:** **ĐÃ CHẠY THÀNH CÔNG trên Supabase Cloud**:
  - Đã tạo đầy đủ 6 bảng dữ liệu: `user_settings`, `tasks`, `notes`, `focus_sessions`, `user_wallpapers`, `saved_themes`.
  - Toàn bộ hàm, triggers (`validate_task_labels`, `handle_last_write_wins`, 3 hàm quota `tasks`/`saved_themes`/`user_wallpapers`, `ping`) đã hoạt động.
  - Phân quyền Row Level Security (RLS) đã bật 100% trên cả 6 bảng.
  - Supabase Storage bucket `user-wallpapers` đã được tạo kèm các policies kiểm soát quota và MIME/dung lượng.
* **Tình trạng kiểm thử RLS & Bảo mật:**
  - Kịch bản kiểm thử RLS đa tầng tại Mục 11 của `docs/ERD.md` **đã chạy đạt 100%** trong Supabase SQL Editor.
  - Supabase Security Advisor: **0 cảnh báo (no warnings)**.
* **Cấu hình Supabase Auth:**
  - Đã tắt tính năng **Confirm email** (cho phép người dùng trải nghiệm ngay không cần chờ xác thực email).
  - Redirect URLs gồm `http://localhost:5173/**`, `http://localhost:5180/**` (cổng dev cố định của dự án) và domain Vercel.
  - Độ dài mật khẩu tối thiểu đặt là **6** (theo PRD AC-01.1).
* **Trạng thái biến môi trường workspace:**
  - `.env.local` (đã nằm trong `.gitignore`) chứa `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY`; thiếu hai biến này app vẫn chạy ở chế độ Guest.

---

## 4. Trạng thái Kho Lưu Trữ (Git & GitHub)

* **Remote:** `https://github.com/kitalikedev/FocusFlow.git`
* **`main`:** commit gần nhất `3d69b6b` (squash merge PR #6, Phase 2), trước đó `f718df3` (PR #5, Phase 1) và `8b723b5` (PR #1, Phase 0). Cổng dev cố định: `5180`.
* **Bảo vệ `main`:** Ruleset "Main Protection" (PR bắt buộc, 1 approval, chỉ Squash, linear history, chặn force push và xóa; admin bypass khi merge PR). Cần xác nhận ruleset đang Active và đã thêm status check `ci`.
* **Dependabot:** các PR đề xuất nâng `vitest` và `@vitest/coverage-v8` lên 5.x trong khi `vite` giữ 5.x chưa merge; xử lý trong PR chore nâng toolchain riêng.
* **Keep-alive:** workflow `.github/workflows/keep-alive.yml` đã có trên `main`; cần tạo 2 secret `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` rồi chạy tay một lần (kết quả đúng là `ping() returned: 1`).

---

## 5. Trạng thái Mã Nguồn (Codebase Status)

| Phân vùng | Trạng thái |
| :--- | :--- |
| Cấu hình (`package.json`, tsconfig, Vite, Vitest, Tailwind, ESLint, Prettier, `vercel.json`, CI, keep-alive) | Hoàn tất |
| `src/app/` (App, layout, providers, 11 slot trong `slots.tsx`) | Hoàn tất |
| `src/core/theme`, `src/core/ui` (Zustand stores, Toast) | Hoàn tất |
| `src/core/data` (LocalRepository, SupabaseRepository, migrateGuestData, settings / sessions / sync status stores) | Hoàn tất (Phase 1, 2) |
| `src/core/auth` (đăng ký, đăng nhập, đăng xuất, Gộp/Hủy dữ liệu guest) | Hoàn tất (Phase 1) |
| `src/core/timer` (Web Worker, drift-free `Date.now()`, 5 chế độ, nghỉ dài, chuông, ghi `focus_sessions`) | Hoàn tất (Phase 2) |
| `src/core/shortcuts` (Space, R, F, Shift+F, M) | Hoàn tất (Phase 2) |
| `src/core/hud` (cycle dots, phiên hôm nay, streak, sync, Fullscreen, menu tài khoản) | Hoàn tất (Phase 2) |
| `src/shared/lib` (supabase, errors, messages, web-audio) | Hoàn tất |
| `src/features/*` | **Stub** (chờ Phase 3); `clock-modes` có đồng hồ tối thiểu để dùng thử, gói 3A thay thế |

Chỉ số sau Phase 2: lint 0/0, typecheck sạch, 34 file / 355 test xanh, branch coverage `src/core` ≥ 85%, initial JS khoảng 127 KB gzip (ngưỡng 200 KB).

---

## 6. Trạng thái Từng Phase

* **Phase 0:** Hoàn tất (PR #1).
* **Phase 1 (Data, Auth, Guest migration):** Hoàn tất (PR #5). Đã kiểm tay với Supabase thật: đăng ký + migrate, đăng nhập sai mật khẩu, Gộp, Hủy, đăng xuất. Kịch bản mất mạng chưa kiểm tay (có unit test).
* **Phase 2 (Timer, phím tắt, âm báo, HUD):** Hoàn tất (PR #6), đã kiểm tay (chuông, notification, HUD, `focus_sessions`).
* **Phase 3 (3A `clock-modes`, 3B `theme-wallpaper`, 3C `audio`, 3D `productivity`):** Đã lập plan (`docs/plans/phase-3.md`); mỗi gói làm trên nhánh `feature/<module>` riêng.
* **P2 (syncQueue, Google OAuth, PiP...) và E2E Playwright:** Chưa bắt đầu.

---

## 7. Việc Đang Dang Dở

1. Xác nhận ruleset Active và đã bật Require status checks `ci`.
2. Tạo secret GitHub cho keep-alive và chạy thử workflow.
3. Import repo vào Vercel (Node 22.x, 2 biến `VITE_*`), kiểm tra lỗi CSP trên preview (Worker cần `worker-src 'self' blob:`).
4. Rà soát cài đặt GitHub (Squash only, auto delete head branches, secret scanning), thêm LICENSE, điền About/topics.

---

## 8. Việc Cần Làm Tiếp Theo

1. Triển khai Phase 3 theo `docs/plans/phase-3.md` (3A trước), mỗi gói một PR.
2. PR chore riêng: nâng toolchain (vite, vitest, ESLint 9, typescript-eslint 8) và xử lý Dependabot.
3. Về sau: `syncQueue` (FR-23), Google OAuth (FR-03), E2E Playwright.

---

## 9. Rủi ro & Lưu ý

1. Streak chỉ tính trên 90 ngày dữ liệu gần nhất (giới hạn của `getFocusSessions`).
2. Chưa có `syncQueue`: người dùng đã đăng nhập mà mất mạng sẽ bị báo lỗi khi lưu, chưa có hàng đợi; tooltip Offline dùng đúng chuỗi của AC-30.2.
3. CSP trong `vercel.json` chỉ kiểm chứng được trên Vercel preview.
4. devDependencies còn lỗ hổng audit (production = 0), xử lý bằng PR nâng toolchain.
5. Docs còn LaTeX trong ARCHITECTURE và README (thẩm mỹ).
6. Hai lần `useSettingsStore.update()` chạy song song có thể ghi đè nhau (`LocalRepository.saveSettings` đọc rồi ghi); cần sửa ở core trước gói 3B/3C.

---

*Cập nhật lần cuối: 2026-11-07*
