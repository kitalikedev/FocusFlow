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
  - Đã thêm `http://localhost:5173` vào danh sách **Redirect URLs**.
* **Trạng thái biến môi trường workspace:**
  - Workspace cục bộ hiện tại chưa có file `.env`.
  - Tại Phase 1, file `.env.local` (đã được cấu hình trong `.gitignore`) sẽ được tạo chứa `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY`.

---

## 4. Trạng thái Kho Lưu Trữ (Git & GitHub)

* **Remote:** `https://github.com/kitalikedev/FocusFlow.git`
* **`main`:** commit gần nhất `8b723b5 chore: scaffold phase 0 foundation (#1)` (squash merge PR #1, CI `ci` xanh).
* **Bảo vệ `main`:** Ruleset "Main Protection" đang hoạt động (PR bắt buộc, linear history, chặn force push và xóa). Chưa bật Require status checks (`ci`).
* **Dependabot:** nhánh `dependabot/npm_and_yarn/multi-*` đề xuất nâng `vitest` và `@vitest/coverage-v8` lên 5.x trong khi `vite` giữ 5.x. Chưa merge; xử lý trong PR chore nâng cấp toolchain riêng.

---

## 5. Trạng thái Mã Nguồn (Codebase Status)

Phase 0 đã có trên `main`:

| Phân vùng | Trạng thái |
| :--- | :--- |
| Cấu hình (`package.json`, tsconfig, Vite, Vitest, Tailwind, ESLint, Prettier, `vercel.json`, `.env.example`, `.nvmrc` Node 22, CI) | Hoàn tất |
| `src/app/` (App, layout, providers, 11 slot trong `slots.tsx`) | Hoàn tất (stub) |
| `src/core/theme`, `src/core/ui`, `src/core/hud` (stub) | Hoàn tất |
| `src/features/*` (4 stub) | Hoàn tất (stub) |
| `src/shared/types/contracts.ts`, `src/shared/lib/supabase.ts` (lazy) | Hoàn tất |
| `src/core/timer`, `auth`, `data`, `shortcuts` | Chưa có |

Chỉ số: lint 0/0, typecheck sạch, 5 file test / 14 test xanh, coverage `src/core` 100%, initial JS gzip khoảng 51 KB (ngưỡng 200 KB).

---

## 6. Trạng thái Từng Phase

* **Phase 0:** **Hoàn tất**, đã merge (PR #1).
* **Phase 1 (Data, Auth, Guest migration):** Chưa bắt đầu; cần `.env.local` với `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY`. Bước tiếp theo là lập plan.
* **Phase 2 (Timer, phím tắt, âm báo, HUD):** Chưa bắt đầu.
* **Phase 3 (3A `clock-modes`, 3B `theme-wallpaper`, 3C `audio`, 3D `productivity`):** Chưa bắt đầu; bắt đầu sau Phase 2.
* **P2 và E2E Playwright:** Chưa bắt đầu.

---

## 7. Việc Đang Dang Dở

1. Bật Require status checks (`ci`) trong ruleset.
2. Import repo vào Vercel (Node 22.x, 2 biến `VITE_*`), kiểm tra lỗi CSP trên preview.
3. Mời 4 thành viên, rà soát cài đặt GitHub (Squash only, auto delete head branches, secret scanning), thêm LICENSE, điền About/topics.

---

## 8. Việc Cần Làm Tiếp Theo

1. Lập plan Phase 1 (Planning only) tại `docs/plans/phase-1.md`, người dùng duyệt rồi mới code.
2. Thực thi Phase 1, rồi Phase 2.
3. Chuẩn bị 4 nhánh `feature/<module>` có code sẵn cho thành viên (Phase 3).
4. PR chore riêng: nâng toolchain (vite, vitest, ESLint 9, typescript-eslint 8).

---

## 9. Rủi ro & Lưu ý

1. ARCHITECTURE ghi 10 slot nhưng `slots.tsx` có 11; cần chỉnh docs.
2. Docs còn LaTeX (ARCHITECTURE, README), mang tính thẩm mỹ.
3. CSP trong `vercel.json` chỉ kiểm chứng được trên Vercel preview.
4. Thêm supabase-js ở Phase 1 làm bundle tăng khoảng 40–50 KB gzip, vẫn trong ngưỡng.
5. devDependencies còn 12 lỗ hổng audit (production = 0), xử lý bằng PR nâng toolchain.

---

*Cập nhật lần cuối: 2026-11-06*
