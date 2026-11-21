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
| **PRD** | [`docs/PRD.md`](PRD.md) | `v1.2.2` | **Đã chốt** (Ready for Implementation) | 31 Yêu cầu chức năng (FR-01 đến FR-31), tiêu chuẩn UX/UI đơn sắc tối giản, ma trận AC Given/When/Then, NFRs. |
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
* **`main`:** commit gần nhất `c005cac` (báo cáo dự án trong README, báo cáo sprint, self-report và ghi chú đánh giá chéo). Các mốc chính: PR #1 (Phase 0), #5 (Phase 1), #6 (Phase 2), #9 đến #16 (Phase 3 và hoàn thiện giao diện), #17 (chặn file env, dọn mã), #24 và #27 và #28 (website nhiều trang), #29 (Google Analytics và Sentry), #33 (sửa test tiêu đề trang chạy không ổn định), #35 (báo cáo Lighthouse lần đo trước), #36 (sửa lỗi Lighthouse ở trang chủ), #38 (dữ liệu mẫu `seed.sql`), #39 (wireframe), #41 (điều khiển nhạc YouTube), #42 (giao diện mới cho các trang website), #43 (website mặc theme và ảnh workspace), #44 (carousel ảnh demo, chấm chọn theme mới, ảnh theme trên trang Themes), #45 (báo cáo Lighthouse v2), #46 (sửa lofi radio, tách nhạc khỏi ambient, Zen không giật và tùy chọn chỉ còn thời gian, sửa Lighthouse), #47 (hiện Live cho stream trực tiếp, ô mục tiêu đủ rộng khi đồng hồ ở góc). Chưa merge: nhánh `docs/report-update` (README rút gọn, tách chi tiết sang `docs/FEATURES.md`, `SYSTEM_DESIGN.md`, `PROJECT_MANAGEMENT.md`, `MONITORING.md`, gộp báo cáo sprint thành `docs/reports/sprints.md`, thêm file self-report từng người) và nhánh `fix/peer-feedback` (sửa theo góp ý của nhóm Đạt, xem `docs/PEER_REVIEW.md`). Cổng dev cố định: `5180`. Production: https://focus-flow-two-wheat.vercel.app.
* **Quản lý công việc:** mỗi việc là một Issue gắn Milestone và người nhận; PR ghi `Closes #số` để Issue tự đóng khi merge. Milestone 1 (Multi-page routing, hạn 20/11/2026), 2 (Tracking and logging, đã xong), 3 (Seed data and README), 4 (Lighthouse), 5 (Peer review, hạn 26/11/2026). Các PR từ #24 trở đi đã liên kết Issue (#19, #20, #21, #22, #26, #34), các PR trước đó chưa có Issue.
* **Bảo vệ `main`:** Ruleset "Main Protection" (PR bắt buộc, 1 approval, chỉ Squash, linear history, chặn force push và xóa; admin bypass khi merge PR). Cần xác nhận ruleset đang Active và đã thêm status check `ci`.
* **Dependabot:** các PR nâng `vite`, `vitest`, `@vitest/coverage-v8` (#2, #3) đang đỏ vì bước nhảy phiên bản lớn, và PR nâng `react-router` lên bản 7 chưa được thử; xử lý trong PR chore nâng toolchain riêng.
* **Keep-alive:** workflow `.github/workflows/keep-alive.yml` đã có 2 secret `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` và chạy thành công (lần chạy tay ngày 18/11/2026), lịch chạy định kỳ 3 ngày một lần.
* **CI:** chạy trên mỗi PR và trên `main`: kiểm tra bí mật, ESLint, TypeScript strict, test kèm coverage và build; hiện xanh trên `main`.
* **Theo dõi và ghi lỗi:** Google Analytics 4 (đã thấy lượt truy cập trong báo cáo Realtime) và Sentry đã được cấu hình qua biến môi trường `VITE_GA_MEASUREMENT_ID`, `VITE_SENTRY_DSN` trên Vercel. Mở `/?sentry_test` để gửi một tin nhắn thử lên Sentry.

---

## 5. Trạng thái Mã Nguồn (Codebase Status)

| Phân vùng | Trạng thái |
| :--- | :--- |
| Cấu hình (`package.json`, tsconfig, Vite, Vitest, Tailwind, ESLint, Prettier, `vercel.json`, CI, keep-alive) | Hoàn tất |
| `src/app/` (App, layout, providers, slot trong `slots.tsx`, `PageTracker`) | Hoàn tất |
| Website nhiều trang (`react-router-dom`): `/` giới thiệu, `/app` workspace, `/themes` xem trước 12 theme và theme đã lưu, `/analytics` thống kê từ `focus_sessions`, `/tracking` (Coming soon), `/about` | Hoàn tất; menu cạnh logo, menu 3 gạch trên điện thoại; workspace luôn giữ chạy nền khi chuyển trang nên timer và nhạc không ngắt; địa chỉ không tồn tại (kể cả `/tasks` cũ) về trang chủ |
| Giao diện website (`src/app/site`, `src/app/pages`) | Website "mặc" một trong 12 theme: chọn chấm màu ở trang chủ hoặc ô ở `/themes` thì màu, font đồng hồ và ảnh workspace của cả website đổi theo (lan màu hình tròn, lưu ở `focusflow-site-preset`, không đổi theme trong workspace). Có light/dark, đồng hồ thử ở trang chủ, ảnh chụp workspace dạng carousel (xem trước hai bên, nút mũi tên, vuốt, tự chuyển mỗi 5 giây) (`public/images/home`, WebP 1440 và 720 px), khối giới thiệu dùng ảnh hoặc GIF riêng làm hình nền, các khối hiện dần khi cuộn; mọi animation tắt khi bật giảm chuyển động |
| `src/core/theme`, `src/core/ui` (Zustand stores, Toast) | Hoàn tất; `zen.ts` cho các thanh điều khiển mờ đi trong Zen mà vẫn giữ chỗ, nên đồng hồ không nhảy khi vào hoặc thoát Zen |
| `src/core/data` (LocalRepository, SupabaseRepository, migrateGuestData, settings / sessions / sync status stores) | Hoàn tất (Phase 1, 2) |
| `src/core/auth` (đăng ký, đăng nhập, đăng xuất, Gộp/Hủy dữ liệu guest) | Hoàn tất (Phase 1) |
| `src/core/timer` (Web Worker, drift-free `Date.now()`, 5 chế độ, nghỉ dài, chuông, ghi `focus_sessions`) | Hoàn tất (Phase 2) |
| `src/core/shortcuts` (Space, R, F, Shift+F, M) | Hoàn tất (Phase 2) |
| `src/core/hud` (cycle dots, phiên hôm nay, streak, sync, Fullscreen, menu tài khoản) | Hoàn tất (Phase 2) |
| `src/shared/lib` (supabase, errors, messages, web-audio, `analytics`, `monitoring`) | Hoàn tất; GA4 và Sentry tự tắt khi thiếu biến môi trường hoặc trình duyệt bật Do Not Track, không gửi email, tên task, mục tiêu hay nội dung ghi chú |
| `src/features/clock-modes` | Hoàn tất: 5 chế độ, 3 kiểu đồng hồ, vị trí Mini Corner, popover cài đặt; mục "Zen mode" chọn giữ cả khung đồng hồ hoặc chỉ còn thời gian (lưu trên thiết bị, `focusflow_zen_time_only`) |
| `src/features/theme-wallpaper` | Hoàn tất: 12 theme (mặc định Nebula), thư viện nền, Customize, hiệu ứng (mưa, tuyết, đom đóm, grain, vignette, scanlines, glow), theme riêng, ảnh tải lên |
| `src/features/audio` | Hoàn tất: 4 kênh Web Audio (Rain, Brown Noise, Campfire, Lofi), YouTube ẩn có hàng đợi, âm lượng tổng, fade mượt; điều khiển nhạc YouTube có thanh vị trí bài và thanh Music chỉnh riêng âm lượng YouTube (PR #41); Lofi radio 4 đài, link stream cũ tự đổi sang link mới; nhạc và ambient bật tắt độc lập, "pause all" chỉ phát lại đúng thứ nó đã dừng |
| `src/features/productivity` | Hoàn tất: Tasks và Notepad (panel trong workspace), Focus Intent, trang Analytics |
| `src/features/quotes` | Hoàn tất: danh ngôn kiểu credits cuộn, mặc định tắt |
| Bảo mật repo | Hook `.githooks/pre-commit` và `npm run check:secrets` (chạy cả trên CI) chặn file `.env` và khóa bí mật |

Chỉ số hiện tại: lint 0/0, typecheck sạch, 60 file / 640 test xanh (nhánh `fix/peer-feedback`: 62 file / 653 test), build xanh; file JS chính `index` khoảng 65 KB gzip (ngưỡng 200 KB); thư viện Sentry nạp riêng sau khi trang chạy. Coverage chưa đo lại sau giao diện website mới.

---

## 6. Trạng thái Từng Phase

* **Phase 0:** Hoàn tất (PR #1).
* **Phase 1 (Data, Auth, Guest migration):** Hoàn tất (PR #5). Đã kiểm tay với Supabase thật: đăng ký + migrate, đăng nhập sai mật khẩu, Gộp, Hủy, đăng xuất. Kịch bản mất mạng chưa kiểm tay (có unit test).
* **Phase 2 (Timer, phím tắt, âm báo, HUD):** Hoàn tất (PR #6), đã kiểm tay (chuông, notification, HUD, `focus_sessions`).
* **Phase 3 (clock-modes, theme-wallpaper, audio, productivity, quotes):** Hoàn tất, đã merge (PR #9 đến #16) và đã lên production.
* **Phase 4 (hoàn thiện giao diện, âm thanh, hiệu ứng):** Phần lớn đã xong (PR #10 đến #16); chi tiết trong `docs/plans/phase-4-polish.md`.
* **Website nhiều trang, theo dõi và ghi lỗi (Milestone 1 và 2):** Phần code đã xong và lên production (PR #24, #27, #28, #29), wireframe đã có (PR #39). Còn biên bản họp (Issue #23).
* **Giao diện website:** Bản thiết kế lại đầu tiên đã merge (PR #42). Bản website mặc theme, ảnh workspace và animation đã merge (PR #43). Carousel, chấm theme và ảnh trên trang Themes đã merge (PR #44).
* **Sửa âm thanh, Zen và Lighthouse:** đang ở nhánh `fix/audio-zen-lighthouse`; chi tiết trong `docs/plans/phase-4-polish.md` mục 8.
* **P2 (syncQueue, Google OAuth, PiP...) và E2E Playwright:** Chưa bắt đầu.

---

## 7. Việc Đang Dang Dở

Các Issue đang mở, theo Milestone:

| Milestone | Issue | Việc | Người nhận |
| :--- | :--- | :--- | :--- |
| 1 - Multi-page routing (hạn 20/11/2026) | #23 | Biên bản họp và phân vai của 5 thành viên. Đã soạn bản nháp 6 buổi họp theo 5 sprint; còn điền ngày, hình thức họp, người vắng và dán vào Issue rồi đóng | Nguyễn Anh Dũng |
| 3 - Seed data and README | #31 | Báo cáo trong README. Đã merge bản đầu (`c005cac`); bản rút gọn kèm 4 file docs chi tiết nằm ở nhánh `docs/report-update`, chờ PR. Còn: dòng link video demo ("coming soon"), ảnh Analytics và Themes chụp ở 67 % nếu muốn | Nguyễn Anh Dũng |
| 4 - Lighthouse | #30 | Báo cáo trước và sau đã đủ (PR #35, #36, #45, #46). Còn: đo lại Lighthouse trên production rồi cập nhật bảng trong README, đóng Issue | Võ Xuân Phú |

Milestone 5 (Peer review, hạn 26/11/2026), chưa có Issue:

| Việc | Trạng thái |
| :--- | :--- |
| Góp ý nhận được (Task 5b) | Nhóm Đạt (ứng dụng quản lý chi tiêu) gửi 6 góp ý ngày 21/11. Quyết định: làm 4 (nút nhảy khi bấm ở carousel và Exit Zen, hiện thời gian đã nghe cho stream trực tiếp, thanh nhạc nhỏ ở trang website), không làm tốc độ lofi và danh sách yêu thích (lý do trong `docs/PEER_REVIEW.md`). Code đã xong ở nhánh `fix/peer-feedback` (62 file, 653 test đạt), chờ commit và PR; sau đó điền số PR vào `docs/PEER_REVIEW.md` |
| Đánh giá cho nhóm khác (Task 5a) | Chưa làm: cả nhóm đánh giá UI/UX của ít nhất 2 nhóm khác và điền Phần A của `docs/PEER_REVIEW.md` |
| Self-report 5 sprint | Mỗi thành viên có sẵn một file trong `docs/reports/self-reports/` (tên gồm mã số sinh viên) và tự viết; thiếu hoặc trễ bị trừ 10 % điểm nhóm |
| Video demo (tối đa 10 phút, 720p) | Chưa quay |

Việc còn lại ngoài Issue:

1. Kiểm tay trang `/analytics` và `/themes` với tài khoản demo đã chạy `supabase/seed.sql`: đã xem được số liệu seed trên production (7h 24m, streak 6 ngày, 3 theme đã lưu).
2. Kiểm tay chế độ đăng nhập trên production (đồng bộ, upload nền, lưu theme, task/note, analytics, gộp dữ liệu guest).
3. Sentry đã nhận lỗi thật từ production (lỗi tải một file script của trang Themes sau khi có bản triển khai mới, vô hại); có thể đánh dấu Resolved.

---

## 8. Việc Cần Làm Tiếp Theo

1. Commit nhánh `fix/peer-feedback` và mở PR (ghi vào `docs/PEER_REVIEW.md` số PR), bổ sung PRD cho thanh nhạc ở trang website.
2. Mở PR cho nhánh `docs/report-update` (ghi `Refs #31`), merge.
3. Đo lại Lighthouse trên production theo `docs/Lighthouse_v2_report.md` mục 11.1, cập nhật bảng trong README và đóng Issue #30.
4. Dán biên bản họp vào Issue #23 và đóng Issue.
5. Đánh giá UI/UX cho 2 nhóm khác (Phần A của `docs/PEER_REVIEW.md`), mỗi thành viên viết self-report, quay video demo rồi thay dòng "coming soon" trong README.
6. Cập nhật PRD, ARCHITECTURE, API_DOCS theo bố cục và tính năng hiện tại (website nhiều trang, theo dõi và ghi lỗi, thanh nhạc ở trang website).
7. Cài Node 22 (khớp `.nvmrc` và CI), rồi PR chore nâng toolchain (vite, vitest, ESLint 9, typescript-eslint 8) và xử lý các PR Dependabot; chưa merge PR nâng `react-router` lên bản 7 trước khi nộp.
8. Về sau: `syncQueue` (FR-23), Google OAuth (FR-03), xuất/nhập theme JSON, PiP (FR-28), E2E Playwright; hướng phát triển từ góp ý đánh giá chéo: chỉnh tốc độ phát và danh sách yêu thích đồng bộ cho nhạc.

---

## 9. Rủi ro & Lưu ý

1. Streak chỉ tính trên 90 ngày dữ liệu gần nhất (giới hạn của `getFocusSessions`).
2. Chưa có `syncQueue`: người dùng đã đăng nhập mà mất mạng sẽ bị báo lỗi khi lưu, chưa có hàng đợi; tooltip Offline dùng đúng chuỗi của AC-30.2.
3. CSP trong `vercel.json` chỉ kiểm chứng được trên Vercel (preview hoặc production).
4. devDependencies còn lỗ hổng audit (production = 0), xử lý bằng PR nâng toolchain.
5. Docs còn LaTeX trong ARCHITECTURE và README (thẩm mỹ).
6. Việc lưu cài đặt đã được xếp hàng chạy lần lượt nên không còn ghi đè nhau.
7. Các test kiểm tra tiêu đề trang đã đổi sang kiểu chờ (PR #33) vì effect đặt tiêu đề có thể chạy chậm một nhịp trên CI.
8. Ảnh trong `public/images/home` là ảnh chụp workspace thật; khi đổi giao diện workspace cần chụp lại cho khớp. Hiệu ứng lan màu khi đổi theme dùng View Transitions API, trình duyệt chưa hỗ trợ thì đổi ngay không có hiệu ứng.
9. Stream 24/7 trên YouTube đổi link mỗi khi kênh khởi động lại; khi một đài trong Lofi radio báo lỗi "cannot be played", thay link trong `src/features/audio/lib/lofiRadio.ts` và thêm id cũ vào `RETIRED_STREAMS`.

---

*Cập nhật lần cuối: 2026-11-21*
