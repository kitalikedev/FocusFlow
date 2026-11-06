# Kế hoạch Triển khai Chi tiết: Phase 1 — Tầng Dữ liệu, Xác thực & Di chuyển Dữ liệu Khách

**Phiên bản:** 1.0 (bản dự thảo, chờ duyệt)
**Tài liệu căn cứ:** `AGENTS.md`, `docs/PRD.md` (v1.2.1), `docs/ARCHITECTURE.md` (v1.2.1, Mục 4, 5, 7, 10, 12, 13.2, 14, 15), `docs/ERD.md` (v1.2), `docs/API_DOCS.md` (v1.1), `supabase/migrations/20261105000000_init_schema.sql`
**Nền tảng:** `main` tại commit `6653656` (Phase 0 đã merge)
**Trạng thái:** Đã duyệt (Q1–Q12 theo đề xuất), đã triển khai trên nhánh `feature/core-data-auth`, chờ nghiệm thu thủ công (Mục 9).

---

## Lịch sử Thay đổi

* **Phiên bản 1.0 (06/11/2026):** Bản dự thảo đầu tiên. Liệt kê 12 điểm mâu thuẫn hoặc chưa rõ giữa các tài liệu kèm đề xuất (Mục 3).

---

## 1. Mục tiêu & Phạm vi

### 1.1. Mục tiêu
Hoàn thiện tầng dữ liệu và xác thực để mọi phase sau chỉ cần gọi `useDataRepository()` mà không quan tâm người dùng là khách hay đã đăng nhập:
* Khách (guest) dùng đầy đủ app, dữ liệu nằm trong `localStorage` (và IndexedDB cho 1 ảnh nền).
* Người dùng đăng ký, đăng nhập, đăng xuất bằng email và mật khẩu qua Supabase Auth.
* Dữ liệu khách được chuyển lên Supabase khi đăng ký (tự động) hoặc khi đăng nhập (hỏi Gộp/Hủy).
* Cài đặt người dùng (`user_settings`) được tải và áp dụng sau khi đăng nhập (FR-09).

### 1.2. Truy vết FR/AC
| FR | AC | Nội dung trong Phase 1 |
| :--- | :--- | :--- |
| FR-01 | AC-01.1, AC-01.2, AC-01.3 | Đăng ký nhận session ngay, báo lỗi đăng nhập, đăng xuất về Guest |
| FR-02 | AC-02.1, AC-02.2, AC-02.3 | Lưu dữ liệu guest, migrate khi đăng ký, Gộp/Hủy khi đăng nhập |
| FR-09 | AC-09.1 | Tải `user_settings` từ cloud và áp dụng theme trong 1500 ms sau đăng nhập |
| NFR-5.3 | | RLS (đã kiểm chứng ở DB), chỉ dùng publishable key |
| NFR-5.4 | | Workflow keep-alive gọi RPC `ping()` mỗi 3 ngày |

### 1.3. Trong phạm vi
* `src/shared/lib/supabase.ts` (bổ sung cấu hình), `src/shared/lib/errors.ts` (mới).
* `src/core/data/`: `LocalRepository`, `SupabaseRepository`, bộ ánh xạ (mapper), `migrateGuestData`, `useDataRepository`, `useSettingsStore`, adapter IndexedDB.
* `src/core/auth/`: `useAuthStore`, `AuthModal`, `GuestMergeDialog`.
* `src/core/ui/`: hệ thống Toast tối giản (`useToastStore`, `ToastViewport`).
* `src/core/hud/`: thêm nút Login/Profile và menu Log Out (theo wireframe PRD Mục 4.1).
* `src/app/`: gắn khởi tạo auth vào `providers.tsx`, gắn modal và toast vào `layout.tsx`.
* `.github/workflows/keep-alive.yml` (ARCHITECTURE Mục 13.2).

### 1.4. Ngoài phạm vi (không làm ở Phase 1)
* Hàng đợi ngoại tuyến `syncQueue` và auto-sync (FR-23, P2). Phase 1 chỉ ghi trực tiếp khi online; mất mạng thì báo lỗi `NETWORK_DISCONNECTED`.
* Google OAuth (FR-03, P2).
* Mọi UI tính năng (Task Panel, Notepad, Wallpaper Picker, Theme Customizer...). Phase 1 chỉ cung cấp API dữ liệu cho Phase 3.
* Timer, phím tắt, chỉ báo đồng bộ thật trên HUD (Phase 2).
* Không cài thêm dependency mới. Không sửa migration SQL đã chạy. Không sửa `docs/` ngoài file plan này.

---

## 2. Điều kiện Tiên quyết (người dùng xác nhận trước khi code)

| # | Việc | Trạng thái |
| :--- | :--- | :--- |
| 1 | Migration SQL đã chạy trên Supabase Cloud, RLS test đạt, Security Advisor 0 cảnh báo | Đã xong |
| 2 | Tắt "Confirm email" | Đã xong |
| 3 | `.env.local` có `VITE_SUPABASE_URL` và `VITE_SUPABASE_PUBLISHABLE_KEY` | Đã xong |
| 4 | Redirect URLs có `http://localhost:5173/**` và domain Vercel | Đã xong |
| 5 | Độ dài mật khẩu tối thiểu trên Supabase khớp PRD (xem Q9) | Chờ quyết định |
| 6 | Tạo 2 GitHub Actions secrets `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY` cho keep-alive | Làm khi tới Bước 9 |

---

## 3. Mâu thuẫn Tài liệu & Quyết định Cần Duyệt

Theo `AGENTS.md` Mục 2 (Conflict Policy), các điểm dưới đây phải được người dùng chốt trước khi code. Mỗi điểm có đề xuất. Trả lời "duyệt tất cả theo đề xuất" là đủ nếu đồng ý toàn bộ.

| # | Vấn đề | Nguồn mâu thuẫn | Đề xuất |
| :--- | :--- | :--- | :--- |
| Q1 | Tên key `localStorage` của guest | PRD AC-02.1 và ARCHITECTURE 5.2 dùng `focusflow_tasks`, `focusflow_notes`, `focusflow_settings`, `focusflow_saved_themes`. API_DOCS Mục 8 dùng `ff_tasks`, `ff_note`, `ff_settings`, `ff_sessions`, `ff_themes` | Theo PRD (AC là tiêu chí nghiệm thu): `focusflow_tasks`, `focusflow_notes`, `focusflow_settings`, `focusflow_sessions`, `focusflow_saved_themes` |
| Q2 | Hạn mức task của guest | API_DOCS Mục 8 cho guest 500 task; DB trigger chỉ cho 100 task/user | Guest tối đa **100** task, để migrate không bao giờ vượt trigger |
| Q3 | Giới hạn ghi chú của guest | API_DOCS Mục 8: 100 KB; DB: 50.000 ký tự | Guest tối đa **50.000 ký tự**, giống DB |
| Q4 | Hình dạng `WallpaperMetadata` và danh sách preset | `contracts.ts` có `name`, `type`, `url`, `uploadedAt`; ERD 9.4 có `storagePath`, `createdAt`; DB không có cột `name`. API_DOCS Mục 8 nói repository trả về "6 preset + custom", nhưng danh sách preset thuộc gói 3B (core không được import feature) | Giữ nguyên `contracts.ts`. `url` = public URL Storage (user) hoặc object URL từ Blob (guest); `name` = tên file trong `storage_path`; `uploadedAt` = `created_at`. Repository **chỉ trả ảnh custom**; gói 3B tự ghép danh sách preset |
| Q5 | Kiểm thử IndexedDB khi jsdom không có IndexedDB | Cần test guest wallpaper nhưng cấm thêm dependency (`fake-indexeddb`) | Tách IndexedDB vào adapter nhỏ `idbWallpaperStore.ts`; test repository bằng mock adapter. Adapter thật được kiểm tra thủ công trên trình duyệt |
| Q6 | Cấu hình Supabase client | API_DOCS Mục 2 dùng `persistSession`, `autoRefreshToken`, `detectSessionInUrl`, `storageKey: 'sb-focusflow-auth-token'`; ARCHITECTURE 7.1 nói key mặc định `sb-<project-ref>-auth-token`; code Phase 0 không truyền option | Áp dụng option theo API_DOCS (hợp đồng tích hợp), giữ getter lazy `getSupabaseClient()` |
| Q7 | Cách mock Supabase trong test | API_DOCS 11.1 mock biến `supabase`; code thật export `getSupabaseClient()` (quyết định lazy đã chốt ở Phase 0) | Mock `getSupabaseClient` trả về `mockSupabase` tại `src/shared/lib/__mocks__/supabase.ts`; giữ nguyên cấu trúc builder của API_DOCS |
| Q8 | Ngôn ngữ chữ hiển thị trên UI | AC-01.1 và AC-01.2 yêu cầu chữ tiếng Anh ("Account created successfully", "Invalid login credentials"); AC-02.3 yêu cầu câu tiếng Việt; API_DOCS Mục 9 viết thông điệp lỗi tiếng Việt; wireframe PRD toàn tiếng Anh | Giữ **đúng nguyên văn** chữ mà AC yêu cầu. Các thông điệp lỗi khác lấy theo bảng API_DOCS Mục 9 (tiếng Việt). Nhãn nút và tiêu đề theo wireframe (tiếng Anh). Gom toàn bộ chuỗi vào 1 file `messages.ts` để đổi ngôn ngữ sau này chỉ sửa 1 chỗ |
| Q9 | Độ dài mật khẩu tối thiểu | PRD AC-01.1: tối thiểu 6 ký tự. Hướng dẫn cài Supabase trước đó (trong chat) đề nghị 8 | Theo PRD: đặt lại Supabase **Minimum password length = 6**, client kiểm tra 6. Nếu muốn giữ 8 thì phải sửa PRD trước |
| Q10 | "Append note" khi Gộp | AC-02.3 nói thêm nối tiếp note, nhưng `notes` chỉ có 1 dòng/user | Nội dung mới = `cloud + "\n\n" + guest` (bỏ phần nào đang rỗng). Nếu tổng vượt 50.000 ký tự thì **hủy toàn bộ việc gộp trước khi ghi**, báo `NOTE_TOO_LARGE`, giữ nguyên dữ liệu guest |
| Q11 | Gộp vượt hạn mức hoặc lỗi giữa chừng | Không tài liệu nào nói khi cloud có 90 task + guest 20 task, hoặc khi bước 3 lỗi sau khi bước 1–2 đã ghi | (a) **Kiểm tra trước khi ghi**: nếu task cloud + guest > 100 hoặc theme > 10 thì dừng, báo lỗi, không ghi gì, giữ dữ liệu guest. (b) **Chạy lại an toàn**: chỉ chèn những bản ghi guest có `id` chưa tồn tại trên cloud, nên bấm thử lại không tạo trùng. (c) Chỉ xóa dữ liệu guest khi **mọi bước** đã thành công |
| Q12 | `signInWithGoogle` trong hợp đồng `AuthState` | `contracts.ts` bắt buộc có hàm này; FR-03 là P2 | Cài đặt hàm ném `AppError` mã `FEATURE_UNAVAILABLE`, **không** hiển thị nút Google trên UI |

Các quyết định nhỏ đã tự chốt (không mâu thuẫn tài liệu, chỉ cần biết):
* **D1.** Trạng thái mở `AuthModal` và hộp thoại Gộp nằm trong `useAuthStore` (`isAuthModalOpen`, `authModalTab`, `mergePrompt`), **không** sửa `UiState` trong `contracts.ts`.
* **D2.** `active_theme` lưu nguyên `ThemeConfig` theo `contracts.ts`. Ví dụ JSON trong API_DOCS 3.1.1 dùng tên token cũ (`colorBg`, `fontFamily`...) nên **không** theo. Đọc về `{}` hoặc thiếu trường thì gộp với Obsidian Minimal.
* **D3.** `active_wallpaper_id` mặc định là `preset-lofi-cafe` (theo ERD và migration), không phải `preset-obsidian` như ví dụ API_DOCS.
* **D4.** Ảnh nền custom của guest (IndexedDB) **không** được migrate lên cloud (ARCHITECTURE 5.2 không liệt kê). Sau khi đăng nhập, ảnh này vẫn nằm trong máy và chỉ hiện lại khi về Guest.
* **D5.** Thiếu biến môi trường (CI, test, máy chưa có `.env.local`): app chạy Guest bình thường, nút Login hiển thị trạng thái vô hiệu kèm tooltip "Cloud sync unavailable". Không throw lúc tải trang.
* **D6.** Workflow keep-alive chỉ gửi header `apikey`, không gửi `Authorization: Bearer`, vì key của dự án có dạng `sb_publishable_...` (không phải JWT). Đây là phương án dự phòng đã ghi sẵn trong API_DOCS Mục 13, Giả định 6; được xác nhận bằng một lần chạy tay sau khi merge.

---

## 4. Thiết kế Kỹ thuật

### 4.1. Sơ đồ module

```text
src/app/providers.tsx ──> initializeAuth() + bootstrapSettings()
src/app/layout.tsx    ──> <AuthModal/> <GuestMergeDialog/> <ToastViewport/>

core/auth/useAuthStore ──(isGuest)──> core/data/useDataRepository ──> LocalRepository | SupabaseRepository
        │                                                                   │
        └── SIGNED_IN ──> migrateGuestData (signup: tự động | login: hỏi Gộp/Hủy)
                                                                            │
core/data/useSettingsStore ── load sau khi auth ổn định ──> core/theme/useThemeStore.setTokens()
```

### 4.2. Trạng thái Auth
`useAuthStore` mở rộng `AuthState` (contracts) bằng các trường nội bộ:

```typescript
interface AuthStoreState extends AuthState {
  isConfigured: boolean;                 // false khi thiếu biến môi trường (D5)
  authError: AppError | null;            // hiển thị dưới form (AC-01.2)
  isAuthModalOpen: boolean;
  authModalTab: 'signIn' | 'signUp';
  mergePrompt: 'hidden' | 'open' | 'running';
  openAuthModal: (tab?: 'signIn' | 'signUp') => void;
  closeAuthModal: () => void;
  resolveGuestMerge: (choice: 'merge' | 'discard') => Promise<void>;
}
```

Luồng sự kiện (ARCHITECTURE 7.2):
1. Khởi động: `getSession()`. Có session thì `isGuest = false`, không có thì Guest. `isLoading = false` sau khi xong.
2. `onAuthStateChange`:
   * `SIGNED_IN`: cập nhật user. Nếu `hasGuestData()` và chưa thử migrate trong phiên (`migrationAttemptedInSession`), hoãn bằng `setTimeout(..., 0)` rồi gọi `handleAuthMigration()`. **Không** `await` Supabase trong callback.
   * `SIGNED_OUT`: reset cờ, về Guest.
   * `INITIAL_SESSION` có user mà vẫn còn dữ liệu guest (ví dụ người dùng tải lại trang khi hộp thoại Gộp đang mở): xử lý như đăng nhập, mở lại hộp thoại Gộp.
3. Phân biệt đăng ký và đăng nhập: action `signUpWithPassword` đặt `pendingFlow = 'signup'` trước khi gọi SDK. `handleAuthMigration` đọc cờ này: `signup` thì migrate tự động (AC-02.2); còn lại mở hộp thoại Gộp/Hủy (AC-02.3).
4. Đăng xuất (AC-01.3): đặt `user = null`, `isGuest = true` **ngay lập tức** rồi mới gọi `signOut()`, để UI về Guest trong 300 ms kể cả khi mạng chậm. Lỗi `signOut` chỉ log cảnh báo.

### 4.3. Repository
* `useDataRepository()` trả singleton `LocalRepository` khi `isGuest`, ngược lại `SupabaseRepository` (ARCHITECTURE 5.1).
* Mọi bản ghi mới có `id = crypto.randomUUID()` ở client, cho cả hai repository.
* `SupabaseRepository` lấy `userId` từ `getSession()` của client, không nhận từ tham số. Thiếu session thì ném `AUTH_SESSION_EXPIRED`.
* Ánh xạ camelCase ↔ snake_case nằm trong `mappers.ts` (ERD Mục 9), gồm làm phẳng `timerDurations` và `ambientVolumes` của `UserSettings`.
* `getSettings()` khi chưa có dòng `user_settings`: upsert bản mặc định (`onConflict: 'user_id'`) rồi trả về (ERD Mục 12.1). `getNote()` khi chưa có dòng thì trả note rỗng, chỉ tạo dòng khi `saveNote` lần đầu.
* `recordFocusSession`: lỗi `23503` thì gửi lại với `task_id = null`, giữ `intent_title` (API_DOCS 3.4.1).
* `uploadCustomWallpaper`: kiểm tra MIME và 5 MB, upload Storage `{user_id}/{uuid}.{ext}`, chèn DB, lỗi DB thì xóa file vừa upload (API_DOCS 5.1).
* `deleteCustomWallpaper`: xóa dòng DB trước, xóa file Storage sau (API_DOCS 5.2).
* Lỗi `23514` có `SAVED_THEME_LIMIT_EXCEEDED` thì ném `ThemeLimitError` (contracts); các lỗi khác chuẩn hóa thành `AppError`.
* Phản hồi LWW: sau mỗi update/upsert, trả về bản ghi server trả lại (không phải bản client gửi), để cache luôn khớp server (ARCHITECTURE 5.3 quy tắc 5).

### 4.4. Mô hình lỗi (`src/shared/lib/errors.ts`)
* `class AppError extends Error` với `code`, `message`, `status?`, `originalError?`. Lớp này thỏa interface `AppError` của API_DOCS Mục 9 và dùng được với `instanceof`.
* `classifyPostgresError()` theo đúng mã nguồn mẫu API_DOCS Mục 9 (23514, 23503, 23505, 42501, PGRST301).
* `classifyAuthError()` ánh xạ `invalid_credentials` → "Invalid login credentials", `user_already_exists`, `weak_password`, `over_email_send_rate_limit`/429 → `RATE_LIMITED`.
* `TypeError: Failed to fetch` → `NETWORK_DISCONNECTED`.
* Các tên lỗi trong API_DOCS Mục 8 (`NetworkError`, `QuotaExceededError`, `NotFoundError`...) được hiện thực bằng `AppError` với `code` tương ứng, không tạo thêm lớp riêng (trừ `ThemeLimitError` đã có trong contracts).

### 4.5. Di chuyển dữ liệu guest (`migrateGuestData.ts`)
Hàm thuần, nhận `mode: 'signup' | 'merge'`, trả về kết quả từng bước để test dễ.

| Bước | `signup` (AC-02.2) | `merge` (AC-02.3) |
| :--- | :--- | :--- |
| 0. Kiểm tra trước | Đếm task, theme guest; vượt 100/10 thì dừng | Đếm cloud + guest; vượt 100/10, hoặc note gộp > 50.000 ký tự thì dừng |
| 1. `user_settings` | Upsert settings guest, `is_migrated = true` | Giữ settings cloud, chỉ cập nhật `is_migrated = true` (tạo dòng mặc định nếu chưa có) |
| 2. `tasks` | Chèn các task có `id` chưa có trên cloud | Như cột trái (append) |
| 3. `notes` | Upsert nội dung guest | Upsert `cloud + "\n\n" + guest` |
| 4. `saved_themes` | Chèn theme có `id` chưa có | Như cột trái |
| 5. `focus_sessions` | Chèn session có `id` chưa có; lỗi 23503 thì `task_id = null` | Như cột trái |
| 6. Dọn dẹp | Xóa key guest **chỉ khi** bước 1–5 đều thành công | Như cột trái |

Thứ tự 1 → 5 theo ARCHITECTURE 5.2 (`tasks` trước `focus_sessions`). Discard: xóa key guest, không gọi cloud.

### 4.6. Cài đặt người dùng (FR-09)
* `useSettingsStore` (core/data) giữ `settings: UserSettings`, `status: 'idle' | 'loading' | 'ready' | 'error'`, `load()`, `update(partial)`.
* `load()` chạy khi auth ổn định (khởi động, sau đăng nhập không có dữ liệu guest, sau Gộp/Hủy, sau đăng xuất), rồi gọi `useThemeStore.setTokens(settings.activeTheme.tokens)`.
* Phase 1 chỉ áp dụng theme. Kiểu đồng hồ, thời lượng timer, âm lượng sẽ do Phase 2 và 3 đọc từ store này.
* `update()` ghi qua repository; lỗi thì giữ giá trị cũ và báo toast.
* Chống import vòng: `useAuthStore` **không** gọi `useSettingsStore`. `src/app/providers.tsx` subscribe vào `useAuthStore` và gọi `useSettingsStore.getState().load()` mỗi khi `isGuest` hoặc `user.id` đổi, hoặc khi hộp thoại Gộp/Hủy kết thúc.

### 4.7. Toast
* `useToastStore` (core/ui): `toasts[]`, `showToast(message, { variant, durationMs = 3000 })`, `dismissToast(id)`.
* `ToastViewport` hiển thị góc dưới, dùng token màu, có `role="status"`, tôn trọng `prefers-reduced-motion`.

### 4.8. Bundle
`@supabase/supabase-js` bắt đầu nằm trong bundle ban đầu (ước tính thêm 40–50 KB gzip, tổng khoảng 100 KB, dưới ngưỡng 200 KB). `AuthModal` và `GuestMergeDialog` tải lười bằng `React.lazy()` để không tăng bundle khởi động.

---

## 5. Danh sách File

```text
.github/workflows/keep-alive.yml                 # MỚI: cron 3 ngày gọi RPC ping()
src/shared/lib/supabase.ts                       # SỬA: option auth (Q6), isSupabaseConfigured()
src/shared/lib/errors.ts                         # MỚI: AppError, classifyPostgresError, classifyAuthError
src/shared/lib/messages.ts                       # MỚI: toàn bộ chuỗi hiển thị (Q8)
src/shared/lib/__mocks__/supabase.ts             # MỚI: mock builder theo API_DOCS 11.1 (Q7)
src/shared/lib/__tests__/errors.test.ts          # MỚI
src/core/data/storageKeys.ts                     # MỚI: key localStorage (Q1) + hasGuestData/clearGuestData
src/core/data/defaults.ts                        # MỚI: DEFAULT_USER_SETTINGS, hạn mức guest (Q2, Q3)
src/core/data/mappers.ts                         # MỚI: row <-> domain (ERD Mục 9)
src/core/data/idbWallpaperStore.ts               # MỚI: adapter IndexedDB 1 ảnh guest (Q5)
src/core/data/LocalRepository.ts                 # MỚI
src/core/data/SupabaseRepository.ts              # MỚI
src/core/data/migrateGuestData.ts                # MỚI
src/core/data/useDataRepository.ts               # MỚI
src/core/data/useSettingsStore.ts                # MỚI
src/core/data/__tests__/mappers.test.ts
src/core/data/__tests__/LocalRepository.test.ts
src/core/data/__tests__/SupabaseRepository.test.ts
src/core/data/__tests__/migrateGuestData.test.ts
src/core/data/__tests__/useDataRepository.test.ts
src/core/data/__tests__/useSettingsStore.test.ts
src/core/auth/useAuthStore.ts                    # MỚI
src/core/auth/AuthModal.tsx                      # MỚI (lazy)
src/core/auth/GuestMergeDialog.tsx               # MỚI (lazy)
src/core/auth/__tests__/useAuthStore.test.ts
src/core/auth/__tests__/AuthModal.test.tsx
src/core/auth/__tests__/GuestMergeDialog.test.tsx
src/core/ui/useToastStore.ts                     # MỚI
src/core/ui/ToastViewport.tsx                    # MỚI
src/core/ui/__tests__/useToastStore.test.ts
src/core/hud/HudSlot.tsx                         # SỬA: nút Login/Profile + menu Log Out
src/core/hud/__tests__/HudSlot.test.tsx          # SỬA: thêm ca cho nút tài khoản
src/app/providers.tsx                            # SỬA: initializeAuth(), bootstrap settings
src/app/layout.tsx                               # SỬA: gắn AuthModal, GuestMergeDialog, ToastViewport
src/test/setup.ts                                # SỬA (nếu cần): polyfill crypto.randomUUID cho jsdom
docs/plans/phase-1.md                            # File này
```

Không sửa: `src/features/**`, `src/app/slots.tsx`, `src/shared/types/contracts.ts`, `supabase/migrations/**`, các file `docs/` khác, `package.json` (không thêm dependency).

---

## 6. Các Bước Thực hiện (mỗi bước có lệnh kiểm chứng)

TDD: mỗi bước viết test trước hoặc song song với code.

**Bước 1 — Nền tảng lỗi, chuỗi hiển thị, client.**
`errors.ts`, `messages.ts`, sửa `supabase.ts` (option theo Q6, thêm `isSupabaseConfigured()`), tạo mock `__mocks__/supabase.ts`.
Kiểm chứng: `npm run typecheck`, `npm run test -- src/shared`.

**Bước 2 — Hằng số và ánh xạ.**
`storageKeys.ts`, `defaults.ts`, `mappers.ts` cho 6 bảng (gồm làm phẳng settings).
Kiểm chứng: `npm run test -- src/core/data/__tests__/mappers.test.ts`.

**Bước 3 — `LocalRepository`.**
CRUD task (lọc, sắp xếp, tìm kiếm theo `TaskFilterParams`), note, settings, sessions, saved themes (tối đa 3, ném `ThemeLimitError`), wallpaper qua adapter IndexedDB. Dữ liệu `localStorage` hỏng (JSON lỗi) thì về giá trị mặc định, không crash.
Kiểm chứng: test `LocalRepository` xanh.

**Bước 4 — `SupabaseRepository`.**
Đủ 17 phương thức của `DataRepository`, fallback 23503, rollback Storage, `ThemeLimitError`, tạo `user_settings` mặc định.
Kiểm chứng: test `SupabaseRepository` xanh với mock.

**Bước 5 — `useDataRepository` và `useSettingsStore`.**
Kiểm chứng: test chọn đúng repository theo `isGuest`; `load()` gọi `setTokens`.

**Bước 6 — `migrateGuestData`.**
Theo bảng Mục 4.5, gồm kiểm tra trước, chạy lại an toàn, chỉ dọn dẹp khi thành công.
Kiểm chứng: test `migrateGuestData` xanh.

**Bước 7 — `useAuthStore`.**
`initializeAuth()`, 4 action của contract, `openAuthModal`, `resolveGuestMerge`, `setTimeout(0)`, cờ `migrationAttemptedInSession`, xử lý thiếu env (D5).
Kiểm chứng: test `useAuthStore` xanh.

**Bước 8 — UI: Toast, AuthModal, GuestMergeDialog, HUD, gắn vào app.**
* AuthModal: 2 tab Sign In / Sign Up; kiểm tra email và mật khẩu tối thiểu 6 ký tự (Q9); nút submit có spinner và vô hiệu khi đang gửi; lỗi hiển thị dưới form, giữ nguyên email; `aria-label`, focus ring, đóng bằng Esc.
* GuestMergeDialog: câu hỏi nguyên văn AC-02.3, nút "Đồng ý" và "Từ chối"; khi đang chạy thì khóa nút.
* HUD: nút Login (Guest) hoặc avatar email rút gọn (đã đăng nhập) mở menu có "Log Out".
* Toàn bộ màu dùng token hoặc lớp Tailwind đã dùng ở Phase 0; không hex mới.

Kiểm chứng: test RTL xanh, `npm run dev` hiển thị nút Login trên HUD.

**Bước 9 — Workflow keep-alive.**
`.github/workflows/keep-alive.yml` theo ARCHITECTURE 13.2: `schedule: '0 0 */3 * *'`, `workflow_dispatch`, `permissions: contents: read`. Vì key dạng `sb_publishable_...` không phải JWT, gửi **chỉ header `apikey`** (phương án dự phòng đã ghi trong API_DOCS Mục 13, Giả định 6).
Kiểm chứng: sau khi merge, người dùng tạo 2 secret và chạy tay bằng "Run workflow"; job phải xanh.

**Bước 10 — Kiểm tra toàn diện.**
`npm run lint`, `npm run typecheck`, `npm run test -- --coverage`, `npm run build`, rồi checklist thủ công Mục 9. Báo cáo bằng tiếng Việt và **dừng**.

---

## 7. Kế hoạch Kiểm thử Tự động

| File test | Loại | Ca kiểm thử chính | AC |
| :--- | :--- | :--- | :--- |
| `shared/lib/__tests__/errors.test.ts` | Unit | 23514 phân loại đúng 7 trường hợp; 23503, 23505, 42501, PGRST301; lỗi Auth; Failed to fetch | |
| `core/data/__tests__/mappers.test.ts` | Unit | Settings làm phẳng và dựng lại; `is_completed`→`isCompleted`, `due_date`→`dueDate`; `luminance` chuỗi → số; `{}` theme → mặc định | |
| `core/data/__tests__/LocalRepository.test.ts` | Unit | UUID v4 regex; lưu đúng key Q1; F5 (khởi tạo lại repo) vẫn còn 3 task, 1 note, settings; lọc/sắp xếp/tìm; task thứ 101 bị chặn; note > 50.000 bị chặn; theme thứ 4 ném `ThemeLimitError`; JSON hỏng không crash | AC-02.1 |
| `core/data/__tests__/SupabaseRepository.test.ts` | Unit (mock) | Ánh xạ trường; upsert `onConflict: 'user_id'`; tạo settings mặc định khi chưa có dòng; 23503 gửi lại `task_id = null`; 23514 `SAVED_THEME_LIMIT_EXCEEDED` → `ThemeLimitError`; upload lỗi DB thì `remove()` đúng path; thiếu session → `AUTH_SESSION_EXPIRED` | API_DOCS 11.2 (5 ca bắt buộc) |
| `core/data/__tests__/migrateGuestData.test.ts` | Unit (mock) | Thứ tự settings→tasks→notes→themes→sessions; signup ghi settings guest và `is_migrated`; merge giữ settings cloud; note nối đúng; vượt hạn mức dừng trước khi ghi; lỗi bước 3 thì không xóa dữ liệu guest; chạy lại không chèn trùng | AC-02.2, AC-02.3 |
| `core/data/__tests__/useDataRepository.test.ts` | Unit | Guest → Local; đăng nhập → Supabase; trả cùng singleton | |
| `core/data/__tests__/useSettingsStore.test.ts` | Unit | `load()` áp dụng theme qua `setTokens` trong 1500 ms (fake timers); lỗi giữ giá trị cũ | AC-09.1 |
| `core/auth/__tests__/useAuthStore.test.ts` | Integration (mock Auth) | Khôi phục session; signUp → user, `isGuest = false`, đóng modal, toast 3000 ms; sai mật khẩu → `Invalid login credentials`; logout → Guest dưới 300 ms; SIGNED_IN signup + guest data → migrate tự động; login + guest data → mở hộp thoại; không `await` trong callback (`setTimeout`); không migrate 2 lần trong phiên; thiếu env → Guest, `isConfigured = false` | AC-01.1, 01.2, 01.3, 02.2, 02.3 |
| `core/auth/__tests__/AuthModal.test.tsx` | Component | Chuyển tab; email sai định dạng; mật khẩu dưới 6 ký tự; spinner và nút vô hiệu; lỗi hiện dưới form, email giữ nguyên | AC-01.1, AC-01.2 |
| `core/auth/__tests__/GuestMergeDialog.test.tsx` | Component | Câu hỏi đúng nguyên văn; "Đồng ý" gọi merge; "Từ chối" gọi discard; khóa nút khi đang chạy | AC-02.3 |
| `core/ui/__tests__/useToastStore.test.ts` | Unit | Tự ẩn sau 3000 ms; đóng thủ công | AC-01.1 |
| `core/hud/__tests__/HudSlot.test.tsx` | Component | Guest thấy nút Login; đã đăng nhập thấy menu có Log Out | AC-01.3 |
| `src/test/smoke.test.tsx` | Smoke | App vẫn render `25:00` khi không có biến môi trường | D5 |

### 7.1. Ghi chú về test với Supabase thật
Theo ARCHITECTURE 15 Phase 1, DoD 1–2 (migration và RLS trên DB thật) **đã đạt** trước Phase 1. Test tự động trong CI chỉ dùng mock, không gọi mạng, không cần secret.

---

## 8. Definition of Done

Phase 1 hoàn thành khi đạt đủ:
1. `npm run lint`: 0 lỗi, 0 cảnh báo.
2. `npm run typecheck`: 0 lỗi.
3. `npm run test -- --coverage`: 100% ca xanh; branch coverage toàn `src/core` ≥ 85% (ngưỡng trong `vitest.config.ts`), và đọc bảng coverage xác nhận riêng `src/core/data` và `src/core/auth` mỗi thư mục **≥ 85%** (ARCHITECTURE 15, Phase 1 DoD 5).
4. `npm run build` thành công; initial JS ≤ 200 KB gzip (đo từ output build).
5. Checklist thủ công Mục 9 đạt 100% trên `localhost:5173` với Supabase thật.
6. Không file nào ngoài danh sách Mục 5 bị sửa; không lộ secret (quét `git diff` trước khi commit).
7. CI trên PR xanh (check `ci` bắt buộc trong ruleset).

---

## 9. Checklist Kiểm thử Thủ công (Supabase thật, `npm run dev`)

Dùng email thử dạng `test+p1a@<domain-của-bạn>` (không dùng mật khẩu thật của dịch vụ khác).

| # | Kịch bản | Kết quả mong đợi | AC |
| :--- | :--- | :--- | :--- |
| 1 | Guest: dán đoạn lệnh mẫu vào DevTools Console để ghi 3 task, 1 note, settings vào các key `focusflow_*` (chưa có UI task), rồi F5 | Key `focusflow_*` còn nguyên trong Application → Local Storage, app không lỗi | AC-02.1 |
| 2 | Đăng ký tài khoản mới khi đang có dữ liệu guest | Modal đóng, toast "Account created successfully" 3 giây; bảng `tasks`, `notes`, `user_settings` trên Supabase có dữ liệu với `user_id` mới, `is_migrated = true`; key guest đã bị xóa | AC-01.1, AC-02.2 |
| 3 | Đăng nhập sai mật khẩu | Dòng "Invalid login credentials" dưới form trong 1 giây, email vẫn còn | AC-01.2 |
| 4 | Đăng xuất | HUD về nút Login gần như tức thì | AC-01.3 |
| 5 | Tạo lại dữ liệu guest, đăng nhập tài khoản ở bước 2, chọn "Đồng ý" | Task guest được thêm vào, note nối thêm, settings cloud giữ nguyên | AC-02.3 |
| 6 | Lặp bước 5 nhưng chọn "Từ chối" | Dữ liệu cloud không đổi, key guest bị xóa | AC-02.3 |
| 7 | Trong Supabase Table Editor, sửa `active_theme` của tài khoản (ví dụ đổi `bgSolidColor`), rồi đăng nhập tài khoản đó ở cửa sổ ẩn danh | Màu nền đổi theo trong 1,5 giây sau đăng nhập | AC-09.1 |
| 8 | Tắt mạng (DevTools → Offline) rồi tạo task khi đã đăng nhập | Báo lỗi mất kết nối, app không treo | ARCH 5.3 ghi chú |

Bước 1 cần dữ liệu thử khi chưa có UI tính năng: agent cung cấp đoạn lệnh dán vào Console, ghi thẳng vào `localStorage` (không thêm code debug vào app, không commit).

---

## 10. Nhánh & Commit

* Nhánh: `feature/core-data-auth` tạo từ `main` mới nhất.
* Không commit giữa chừng. Khi DoD đạt, agent báo cáo và **dừng**.
* **Người dùng tự commit bằng tay**, 1 commit duy nhất:
  `Add data layer, auth and guest migration` (viết thẳng, không tiền tố feat:/fix:)
  (gồm code, test, workflow và `docs/plans/phase-1.md`). Không thêm dòng `Co-authored-by`.
* Người dùng tự push, mở PR vào `main`, chờ `ci` xanh, squash merge.
* Mô tả PR ghi FR/AC đã làm (Mục 1.2) và lệnh kiểm chứng (Mục 8), theo `AGENTS.md` 3.4.
* Sau merge: tạo 2 GitHub secrets và chạy tay workflow keep-alive (Bước 9).

---

## 11. Rủi ro

| Rủi ro | Ảnh hưởng | Giảm thiểu |
| :--- | :--- | :--- |
| `crypto.randomUUID` không có trong jsdom | Test lỗi | Polyfill trong `src/test/setup.ts` bằng `node:crypto` (chỉ môi trường test) |
| `onAuthStateChange` phát `SIGNED_IN` lặp lại khi đổi tab | Migrate 2 lần | Cờ `migrationAttemptedInSession` và chèn theo `id` chưa tồn tại (Q11) |
| Migrate không có transaction (nhiều request) | Dữ liệu nửa chừng | Chạy lại an toàn và chỉ xóa guest khi thành công (Q11) |
| Coverage `core` giảm khi thêm component UI | CI đỏ | Test component đầy đủ trạng thái; nếu cần, không loại trừ file nào khỏi coverage mà viết thêm test |
| Supabase gói Free tạm dừng sau 7 ngày | App lỗi đăng nhập | Workflow keep-alive (Bước 9) |
| Lỗ hổng devDependencies (vitest 1, vite 5) | Chỉ ảnh hưởng dev | PR nâng toolchain riêng sau Phase 1 hoặc 2 |

---

## 12. Đề xuất Cập nhật Tài liệu (làm sau khi Phase 1 merge, PR `docs/` riêng)

Không sửa trong Phase 1, chỉ ghi lại để đồng bộ:
1. API_DOCS Mục 8: đổi key `ff_*` thành `focusflow_*`, hạn mức guest 100 task và 50.000 ký tự (Q1–Q3); repository chỉ trả ảnh custom (Q4).
2. API_DOCS 3.1.1: thay ví dụ `active_theme` bằng `ThemeConfig` đúng 15 token (D2).
3. API_DOCS 11.1: mẫu mock dùng `getSupabaseClient` (Q7).
4. ARCHITECTURE 7.1: tên `storageKey` (Q6); Mục 4.1: 11 slot thay vì 10.
5. ARCHITECTURE 13.1: ví dụ CI cũ (Node 20, `test:run`) cập nhật theo `ci.yml` thật.
6. PRD: ghi rõ quy tắc ngôn ngữ UI (Q8) và cách nối note khi Gộp (Q10).
7. `docs/PROGRESS.md`: đánh dấu Phase 1 hoàn thành.

---

## 13. Ghi chú Triển khai (Implementation Notes)

1. **File phát sinh ngoài Mục 5** (nhỏ, cùng phạm vi `core/` và `shared/`): `core/data/validators.ts`, `core/data/defaults.ts`, `core/data/storageKeys.ts`, `core/auth/validation.ts`, `core/hud/AccountMenu.tsx` và các test tương ứng (`defaults`, `validators`, `storageKeys`, `idbWallpaperStore`, `validation`, `ToastViewport`, `AccountMenu`).
2. **Bảng `user_settings` và `notes` upsert không gửi `id`:** với `onConflict: 'user_id'`, gửi id mới sẽ đổi khóa chính của dòng đã có. Id lấy từ giá trị mặc định của database (`gen_random_uuid()`), ngoại lệ có chủ đích so với quy tắc id do client sinh (chỉ áp dụng cho 2 bảng 1-1).
3. **Tạo `user_settings` mặc định dùng `ignoreDuplicates: true`:** tránh ghi đè dòng mà tiến trình migrate guest vừa ghi (đăng ký và tải settings chạy gần như đồng thời).
4. **Thông điệp `NETWORK_DISCONNECTED`:** đổi thành "Mất kết nối mạng. Vui lòng kiểm tra kết nối và thử lại." vì Phase 1 chưa có `syncQueue`, nên không hứa "ghi nhận tại máy" như bảng API_DOCS Mục 9.
5. **Sau khi migrate khi đăng ký thất bại:** người dùng vẫn đăng nhập; lần `SIGNED_IN` kế tiếp (đổi tab, tải lại trang) hiện hộp thoại Gộp/Hủy. Phép gộp bỏ qua bản ghi đã tải lên (cùng `id`), nên không tạo trùng.
6. **`hasGuestData()`** chỉ tính task, ghi chú không rỗng, phiên focus và theme. Settings của guest tách riêng (`hasGuestSettings()`): có ý nghĩa khi đăng ký, nhưng không làm hiện hộp thoại Gộp khi đăng nhập.
7. **Kết quả đo:** 23 file test, 199 ca xanh; branch coverage `src/core` 98,71% (`core/data` 98,21%, `core/auth` 100%); initial JS khoảng 122 KB gzip (supabase-js 59 KB nằm trong chunk `vendor-supabase`); `AuthModal` và `GuestMergeDialog` là chunk tải lười (1,5 KB và 0,8 KB gzip).
8. **Mock Supabase trong test:** `vi.mock('@/shared/lib/supabase')` dùng `src/shared/lib/__mocks__/supabase.ts`; test lấy mock qua `getSupabaseClient()`.
9. **Vitest nạp `.env.local`** nên test không giả định biến môi trường trống; smoke test dùng `vi.stubEnv` để mô phỏng máy chưa có cấu hình.
