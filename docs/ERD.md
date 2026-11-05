# Entity Relationship Diagram (ERD) & Database Specification — FocusFlow

**Phiên bản:** 1.2  
**Trạng thái:** Chốt thiết kế (Approved for Implementation)  
**Tác giả:** Database Architect  
**Căn cứ đặc tả:** `docs/PRD.md` (v1.2.1) & `docs/ARCHITECTURE.md` (v1.1)  
**Tệp migration đính kèm:** `supabase/migrations/20261105000000_init_schema.sql`  

---

## 1. Tổng quan và Sơ đồ ERD (Mermaid Diagram)

Hệ thống cơ sở dữ liệu của FocusFlow được xây dựng trên nền tảng **PostgreSQL 15+** quản lý bởi Supabase BaaS, tích hợp chặt chẽ với dịch vụ xác thực `auth.users`. Toàn bộ dữ liệu người dùng được cô lập triệt để thông qua cơ chế **Row Level Security (RLS)** và quyền hạn gán tường minh theo vai trò (`authenticated`, `anon`).

### Sơ đồ Quan hệ Thực thể (Entity Relationship Diagram)

```mermaid
erDiagram
    users ||--o| user_settings : "cấu hình (1-1, upsert onConflict user_id)"
    users ||--o{ tasks : "quản lý (1-N, max 100)"
    users ||--o| notes : "ghi chú nhanh (1-1, upsert onConflict user_id)"
    users ||--o{ focus_sessions : "ghi nhận phiên (1-N)"
    users ||--o{ user_wallpapers : "lưu ảnh tải lên (1-N, max 3)"
    users ||--o{ saved_themes : "lưu theme cá nhân (1-N, max 10)"
    tasks ||--o{ focus_sessions : "gán mục tiêu (1-N, SET NULL on delete)"

    users {
        uuid id PK "auth.users identifier"
        string email "RFC 5322 email"
        timestamptz created_at "Creation timestamp"
    }

    user_settings {
        uuid id PK "gen_random_uuid()"
        uuid user_id FK "REFERENCES auth.users(id) ON DELETE CASCADE, UNIQUE"
        integer focus_duration "Thời lượng focus (giây, 60-10800)"
        integer short_break_duration "Thời lượng nghỉ ngắn (giây, 60-10800)"
        integer long_break_duration "Thời lượng nghỉ dài (giây, 60-10800)"
        integer long_break_interval "Chu kỳ nghỉ dài (1-24)"
        boolean auto_start_breaks "Tự động bắt đầu nghỉ"
        boolean auto_start_focus "Tự động bắt đầu focus"
        text clock_visual_mode "minimal | circular_ring | retro_flip"
        text clock_position "center | mini_corner | zen"
        text active_wallpaper_id "ID ảnh nền đang chọn"
        numeric volume_rain "Âm lượng mưa (0.00 - 1.00)"
        numeric volume_brown_noise "Âm lượng brown noise (0.00 - 1.00)"
        numeric volume_campfire numeric "Âm lượng lửa trại (0.00 - 1.00)"
        numeric volume_master numeric "Âm lượng tổng (0.00 - 1.00)"
        boolean is_migrated "Đã migrate từ guest"
        jsonb active_theme "Tokens theme CSS (octet_length <= 8192)"
        timestamptz created_at "now()"
        timestamptz updated_at "LWW managed"
    }

    tasks {
        uuid id PK "gen_random_uuid()"
        uuid user_id FK "REFERENCES auth.users(id) ON DELETE CASCADE"
        text title "Tiêu đề công việc (1-120 ký tự)"
        boolean is_completed "Trạng thái hoàn thành"
        text priority "none | low | medium | high"
        timestamptz due_date "Hạn chót công việc (nullable)"
        text_array labels "Tối đa 5 nhãn, mỗi nhãn 1-24 ký tự"
        timestamptz created_at "now()"
        timestamptz updated_at "LWW managed"
    }

    notes {
        uuid id PK "gen_random_uuid()"
        uuid user_id FK "REFERENCES auth.users(id) ON DELETE CASCADE, UNIQUE"
        text content "Nội dung ghi chú (tối đa 50000 ký tự)"
        timestamptz created_at "now()"
        timestamptz updated_at "LWW managed"
    }

    focus_sessions {
        uuid id PK "gen_random_uuid()"
        uuid user_id FK "REFERENCES auth.users(id) ON DELETE CASCADE"
        integer duration_minutes "Số phút phiên tập trung (1-1440)"
        text intent_title "Mục tiêu tập trung (tối đa 80 ký tự, nullable)"
        uuid task_id FK "REFERENCES tasks(id) ON DELETE SET NULL, nullable"
        timestamptz completed_at "Thời điểm kết thúc phiên"
        timestamptz created_at "now()"
        timestamptz updated_at "LWW managed"
    }

    user_wallpapers {
        uuid id PK "gen_random_uuid()"
        uuid user_id FK "REFERENCES auth.users(id) ON DELETE CASCADE"
        text storage_path "Đường dẫn storage (user_id/..., max 3)"
        integer file_size "Kích thước tệp (bytes, max 5242880)"
        numeric luminance "Độ sáng tương đối 32x32 (0.000 - 1.000)"
        timestamptz created_at "now()"
        timestamptz updated_at "LWW managed"
    }

    saved_themes {
        uuid id PK "gen_random_uuid()"
        uuid user_id FK "REFERENCES auth.users(id) ON DELETE CASCADE"
        text name "Tên theme lưu trữ (1-50 ký tự)"
        jsonb config "Tokens theme CSS (octet_length <= 8192, max 10)"
        timestamptz created_at "now()"
        timestamptz updated_at "LWW managed"
    }
```

---

## 2. Từ điển dữ liệu (Data Dictionary)

### 2.1 Bảng `public.user_settings` (1 dòng/user)
* **Mục đích:** Lưu trữ cấu hình cá nhân hóa timer, giao diện, âm lượng và theme đang áp dụng.
* **Truy vết PRD:** FR-01, FR-02, FR-04, FR-05, FR-09, FR-10, FR-11, FR-12, FR-16, FR-24, FR-25.
* **Quy tắc Khởi tạo & Upsert 1-1:** Bản ghi được tạo lần đầu bởi client khi người dùng đăng nhập lần đầu (không dùng trigger trên `auth.users`). Mọi thao tác cập nhật sử dụng lệnh `upsert` với tùy chọn `onConflict: 'user_id'`.

| Tên cột | Kiểu dữ liệu | Nullable | Mặc định | Ràng buộc / Validation | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | `PRIMARY KEY` | Khóa chính bản ghi cấu hình |
| `user_id` | `uuid` | NO | None | `REFERENCES auth.users(id) ON DELETE CASCADE, UNIQUE` | Định danh tài khoản sở hữu (1-1) |
| `focus_duration` | `integer` | NO | `1500` | `CHECK (focus_duration BETWEEN 60 AND 10800)` | Thời lượng làm việc (giây, 1-180 phút) |
| `short_break_duration` | `integer` | NO | `300` | `CHECK (short_break_duration BETWEEN 60 AND 10800)` | Thời lượng nghỉ ngắn (giây, 1-180 phút) |
| `long_break_duration` | `integer` | NO | `900` | `CHECK (long_break_duration BETWEEN 60 AND 10800)` | Thời lượng nghỉ dài (giây, 1-180 phút) |
| `long_break_interval` | `integer` | NO | `4` | `CHECK (long_break_interval BETWEEN 1 AND 24)` | Số phiên focus hoàn thành trước khi nghỉ dài |
| `auto_start_breaks` | `boolean` | NO | `false` | None | Tự động đếm giờ khi vào phiên nghỉ |
| `auto_start_focus` | `boolean` | NO | `false` | None | Tự động đếm giờ khi vào phiên làm việc |
| `clock_visual_mode` | `text` | NO | `'minimal'` | `CHECK (clock_visual_mode IN ('minimal', 'circular_ring', 'retro_flip'))` | Phong cách hiển thị của đồng hồ |
| `clock_position` | `text` | NO | `'center'` | `CHECK (clock_position IN ('center', 'mini_corner', 'zen'))` | Vị trí neo viên nang đồng hồ trên giao diện |
| `active_wallpaper_id` | `text` | NO | `'preset-lofi-cafe'` | None | Mã ID của hình nền đang hiển thị (preset hoặc path) |
| `volume_rain` | `numeric(3,2)` | NO | `0.50` | `CHECK (volume_rain BETWEEN 0.00 AND 1.00)` | Âm lượng kênh tiếng mưa Web Audio |
| `volume_brown_noise`| `numeric(3,2)` | NO | `0.00` | `CHECK (volume_brown_noise BETWEEN 0.00 AND 1.00)` | Âm lượng kênh tiếng ồn nâu Web Audio |
| `volume_campfire` | `numeric(3,2)` | NO | `0.00` | `CHECK (volume_campfire BETWEEN 0.00 AND 1.00)` | Âm lượng kênh tiếng lửa trại Web Audio |
| `volume_master` | `numeric(3,2)` | NO | `0.80` | `CHECK (volume_master BETWEEN 0.00 AND 1.00)` | Âm lượng tổng toàn ứng dụng |
| `is_migrated` | `boolean` | NO | `false` | None | Cờ đánh dấu đã chuyển dữ liệu guest lên cloud |
| `active_theme` | `jsonb` | NO | `'{}'::jsonb` | `CHECK (octet_length(active_theme::text) <= 8192)` | Tokens CSS variables đang dùng (`{}` = dùng mặc định) |
| `created_at` | `timestamptz` | NO | `now()` | None | Thời điểm khởi tạo bản ghi |
| `updated_at` | `timestamptz` | NO | `now()` | Managed by LWW Trigger | Thời điểm cập nhật cuối (hỗ trợ offline sync) |

---

### 2.2 Bảng `public.tasks`
* **Mục đích:** Quản lý danh sách tác vụ tập trung kèm độ ưu tiên, hạn chót và nhãn phân loại.
* **Truy vết PRD:** FR-19 (Core CRUD & Advanced).
* **Giới hạn số lượng:** Tối đa 100 tasks per user (được thực thi bởi trigger `enforce_tasks_limit`).

| Tên cột | Kiểu dữ liệu | Nullable | Mặc định | Ràng buộc / Validation | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | `PRIMARY KEY` | Khóa chính task (client sinh UUID v4) |
| `user_id` | `uuid` | NO | None | `REFERENCES auth.users(id) ON DELETE CASCADE` | Người dùng sở hữu công việc |
| `title` | `text` | NO | None | `CHECK (char_length(trim(title)) > 0 AND char_length(title) <= 120)` | Tiêu đề công việc (1-120 ký tự) |
| `is_completed` | `boolean` | NO | `false` | None | Trạng thái đã hoàn thành hay chưa |
| `priority` | `text` | NO | `'none'` | `CHECK (priority IN ('none', 'low', 'medium', 'high'))` | Mức độ ưu tiên |
| `due_date` | `timestamptz` | YES | `NULL` | None | Ngày giờ hạn chót (tùy chọn) |
| `labels` | `text[]` | NO | `'{}'::text[]`| `CHECK (validate_task_labels(labels))` | Mảng nhãn (tối đa 5 nhãn, mỗi nhãn $\le 24$ ký tự) |
| `created_at` | `timestamptz` | NO | `now()` | None | Thời điểm tạo task |
| `updated_at` | `timestamptz` | NO | `now()` | Managed by LWW Trigger | Thời điểm cập nhật cuối |

---

### 2.3 Bảng `public.notes` (1 dòng/user)
* **Mục đích:** Sổ ghi chép nhanh (Scratchpad) lưu lại ý tưởng tức thời.
* **Truy vết PRD:** FR-20.
* **Quy tắc Khởi tạo & Upsert 1-1:** Bản ghi được tạo lần đầu bởi client khi người dùng đăng nhập lần đầu (không dùng trigger trên `auth.users`). Mọi thao tác cập nhật sử dụng lệnh `upsert` với tùy chọn `onConflict: 'user_id'`.

| Tên cột | Kiểu dữ liệu | Nullable | Mặc định | Ràng buộc / Validation | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | `PRIMARY KEY` | Khóa chính sổ tay |
| `user_id` | `uuid` | NO | None | `REFERENCES auth.users(id) ON DELETE CASCADE, UNIQUE` | Người dùng sở hữu (1-1) |
| `content` | `text` | NO | `''` | `CHECK (char_length(content) <= 50000)` | Nội dung ghi chú (tối đa 50,000 ký tự) |
| `created_at` | `timestamptz` | NO | `now()` | None | Thời điểm tạo ghi chú |
| `updated_at` | `timestamptz` | NO | `now()` | Managed by LWW Trigger | Thời điểm lưu tự động (debounce 500ms) |

---

### 2.4 Bảng `public.focus_sessions`
* **Mục đích:** Ghi nhận lịch sử hoàn thành các phiên tập trung, phục vụ Focus Analytics và tính toán chuỗi ngày streak.
* **Truy vết PRD:** FR-06, FR-21, FR-29.

| Tên cột | Kiểu dữ liệu | Nullable | Mặc định | Ràng buộc / Validation | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | `PRIMARY KEY` | Khóa chính phiên tập trung |
| `user_id` | `uuid` | NO | None | `REFERENCES auth.users(id) ON DELETE CASCADE` | Người dùng hoàn thành phiên |
| `duration_minutes` | `integer` | NO | None | `CHECK (duration_minutes > 0 AND duration_minutes <= 1440)` | Thời lượng phiên tính bằng phút |
| `intent_title` | `text` | YES | `NULL` | `CHECK (intent_title IS NULL OR (char_length(trim(intent_title)) > 0 AND char_length(intent_title) <= 80))` | Mục tiêu tập trung đã gán (tối đa 80 ký tự) |
| `task_id` | `uuid` | YES | `NULL` | `REFERENCES public.tasks(id) ON DELETE SET NULL` | ID task liên kết (nếu có) |
| `completed_at` | `timestamptz` | NO | `now()` | None | Thời điểm đếm giờ kết thúc |
| `created_at` | `timestamptz` | NO | `now()` | None | Thời điểm ghi nhận bản ghi |
| `updated_at` | `timestamptz` | NO | `now()` | Managed by LWW Trigger | Thời điểm cập nhật |

---

### 2.5 Bảng `public.user_wallpapers`
* **Mục đích:** Quản lý metadata các tệp ảnh/GIF hình nền người dùng tải lên Supabase Storage.
* **Truy vết PRD:** FR-14, FR-15.
* **Giới hạn số lượng:** Tối đa 3 custom wallpapers per user (thực thi bởi DB trigger và Storage RLS).

| Tên cột | Kiểu dữ liệu | Nullable | Mặc định | Ràng buộc / Validation | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | `PRIMARY KEY` | Khóa chính metadata hình nền |
| `user_id` | `uuid` | NO | None | `REFERENCES auth.users(id) ON DELETE CASCADE` | Người dùng tải lên |
| `storage_path` | `text` | NO | None | `CHECK (char_length(trim(storage_path)) > 0 AND storage_path LIKE user_id::text \|\| '/%')` | Đường dẫn file bắt buộc nằm trong thư mục `{user_id}/` |
| `file_size` | `integer` | NO | None | `CHECK (file_size > 0 AND file_size <= 5242880)` | Dung lượng tệp (bytes, tối đa 5MB) |
| `luminance` | `numeric(4,3)` | NO | None | `CHECK (luminance >= 0.000 AND luminance <= 1.000)` | Độ sáng tương đối tính 1 lần lúc upload |
| `created_at` | `timestamptz` | NO | `now()` | None | Thời điểm tải lên |
| `updated_at` | `timestamptz` | NO | `now()` | Managed by LWW Trigger | Thời điểm cập nhật |

---

### 2.6 Bảng `public.saved_themes`
* **Mục đích:** Lưu trữ các giao diện tùy biến cá nhân do người dùng thiết kế.
* **Truy vết PRD:** FR-24, FR-25, FR-27.
* **Giới hạn số lượng:** Tối đa 10 saved themes per user (thực thi bởi trigger `enforce_saved_themes_limit`).

| Tên cột | Kiểu dữ liệu | Nullable | Mặc định | Ràng buộc / Validation | Ý nghĩa nghiệp vụ |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `id` | `uuid` | NO | `gen_random_uuid()` | `PRIMARY KEY` | Khóa chính theme lưu trữ |
| `user_id` | `uuid` | NO | None | `REFERENCES auth.users(id) ON DELETE CASCADE` | Người dùng sở hữu theme |
| `name` | `text` | NO | None | `CHECK (char_length(trim(name)) > 0 AND char_length(name) <= 50)` | Tên theme đặt bởi người dùng (1-50 ký tự) |
| `config` | `jsonb` | NO | `'{}'::jsonb` | `CHECK (octet_length(config::text) <= 8192)` | Dữ liệu cấu hình tokens (tối đa 8KB) |
| `created_at` | `timestamptz` | NO | `now()` | None | Thời điểm lưu theme |
| `updated_at` | `timestamptz` | NO | `now()` | Managed by LWW Trigger | Thời điểm sửa theme |

---

## 3. Quan hệ Thực thể & Quy tắc Xóa (Foreign Keys & Delete Rules)

1. **Quy tắc `ON DELETE CASCADE` với `auth.users(id)`:**
   * Áp dụng cho: `user_settings.user_id`, `tasks.user_id`, `notes.user_id`, `focus_sessions.user_id`, `user_wallpapers.user_id`, `saved_themes.user_id`.
   * **Lý do chọn:** Tuân thủ quyền riêng tư dữ liệu (Right to be Forgotten). Khi người dùng xóa tài khoản trên hệ thống Supabase Auth, toàn bộ thông tin cá nhân, công việc, sổ tay, lịch sử tập trung và hình nền cá nhân của họ sẽ được tự động xóa sạch khỏi cơ sở dữ liệu ngay lập tức.
2. **Quy tắc `ON DELETE SET NULL` với `focus_sessions.task_id`:**
   * Áp dụng cho: `focus_sessions.task_id REFERENCES public.tasks(id) ON DELETE SET NULL`.
   * **Lý do chọn:** Đáp ứng đúng yêu cầu của **FR-29**: Khi người dùng xóa một task khỏi Task Manager, lịch sử thời gian tập trung trong quá khứ không được phép biến mất khỏi biểu đồ Analytics. Trường `task_id` chuyển về `NULL` trong khi trường `intent_title` (tiêu đề nhiệm vụ lưu dưới dạng text) vẫn được bảo toàn nguyên vẹn.

---

## 4. Mục Index (Chỉ mục Tối ưu Hiệu năng)

Hệ thống thiết lập các chỉ mục phục vụ chính xác các mẫu truy vấn nghiệp vụ thường xuyên nhất:

| Tên Index | Bảng & Định nghĩa Cột | Loại Index | Truy vấn phục vụ & FR liên quan |
| :--- | :--- | :--- | :--- |
| `idx_tasks_user_status_due` | `tasks (user_id, is_completed, due_date)` | B-Tree composite | Phục vụ tải danh sách task của user lọc theo trạng thái hoàn thành và sắp xếp theo hạn chót (FR-19). |
| `idx_tasks_labels_gin` | `tasks USING gin (labels)` | GIN (Generalized Inverted) | Phục vụ lọc task theo nhãn bằng toán tử mảng contains `@> ARRAY['label']` (FR-19). |
| `idx_tasks_user_priority` | `tasks (user_id, priority)` | B-Tree composite | Phục vụ lọc danh sách task theo độ ưu tiên None / Low / Medium / High (FR-19). |
| `idx_focus_sessions_user_completed` | `focus_sessions (user_id, completed_at DESC)` | B-Tree composite | Phục vụ vẽ biểu đồ tập trung theo ngày/tuần và thuật toán tính streak liên tục (FR-21). |
| `idx_focus_sessions_user_task` | `focus_sessions (user_id, task_id)` | B-Tree | Phục vụ thống kê tổng số giờ tập trung theo từng task/intent (FR-29). |
| `idx_saved_themes_user` | `saved_themes (user_id)` | B-Tree | Phục vụ tải danh sách tối đa 10 custom theme của người dùng (FR-27). |
| `idx_user_wallpapers_user` | `user_wallpapers (user_id)` | B-Tree | Phục vụ kiểm tra quota và hiển thị tối đa 3 hình nền của người dùng (FR-14). |

---

## 5. Bảo mật Đa Tầng: RLS và Phân Quyền (GRANTs)

Dự án kích hoạt tính năng **Automatic RLS** và **Tắt tự động công khai bảng mới (Automatically expose new tables is OFF)** của Supabase.

### 5.1 Bảng Ma trận Quyền hạn theo Vai trò (Permissions Matrix)

| Bảng dữ liệu | Quyền `anon` | Quyền `authenticated` | Phạm vi RLS Enforcement |
| :--- | :--- | :--- | :--- |
| `public.user_settings` | `NONE` (Revoked) | `SELECT, INSERT, UPDATE, DELETE` | `(SELECT auth.uid()) = user_id` |
| `public.tasks` | `NONE` (Revoked) | `SELECT, INSERT, UPDATE, DELETE` | `(SELECT auth.uid()) = user_id` |
| `public.notes` | `NONE` (Revoked) | `SELECT, INSERT, UPDATE, DELETE` | `(SELECT auth.uid()) = user_id` |
| `public.focus_sessions`| `NONE` (Revoked) | `SELECT, INSERT, UPDATE, DELETE` | `(SELECT auth.uid()) = user_id` |
| `public.user_wallpapers`| `NONE` (Revoked) | `SELECT, INSERT, UPDATE, DELETE` | `(SELECT auth.uid()) = user_id` |
| `public.saved_themes` | `NONE` (Revoked) | `SELECT, INSERT, UPDATE, DELETE` | `(SELECT auth.uid()) = user_id` |
| `public.ping()` | `EXECUTE` | `EXECUTE` | Hàm STABLE trả về `1` |
| `public.validate_task_labels()` | `NONE` | `EXECUTE` | Hàm helper kiểm tra mảng labels |

> [!IMPORTANT]
> Tất cả các chính sách RLS sử dụng cú pháp tối ưu `(SELECT auth.uid()) = user_id` thay vì gọi trực tiếp `auth.uid() = user_id` để query optimizer evaluate hàm xác thực JWT một lần duy nhất cho toàn bộ câu lệnh, nâng cao hiệu năng khi bảng dữ liệu lớn.

---

## 6. Triggers và Hàm Cơ sở dữ liệu (Functions & Triggers)

### 6.1 Giải quyết Xung đột Ngoại tuyến Last-Write-Wins (FR-23)
* **Hàm `public.handle_last_write_wins()`:**
  * Được gắn làm trigger `BEFORE UPDATE` trên cả 6 bảng dữ liệu, cấu hình `SET search_path = ''` và gọi `pg_catalog.clock_timestamp()`.
  * Nếu bản ghi cập nhật gửi từ client mang `NEW.updated_at < OLD.updated_at` (do thiết bị offline đồng bộ muộn hơn bản ghi mới trên server), trigger sẽ trả về `OLD`, giữ nguyên trạng thái hiện có trên server.
  * **Lưu ý quan trọng cho Client:** Khi trigger trả về `OLD`, phản hồi của câu lệnh `upsert` từ Supabase PostgREST vẫn trả về bản ghi hiện tại trên server. Client **PHẢI** kiểm tra so sánh trường `updated_at` trả về và cập nhật lại cache cục bộ theo bản ghi của server nếu bản ghi cục bộ bị từ chối.
  * Nếu client không truyền hoặc truyền `updated_at` bằng với bản ghi cũ, server tự động tăng mốc thời gian bằng `pg_catalog.clock_timestamp()`.

### 6.2 Giới hạn Số lượng ở Tầng Cơ sở dữ liệu (Quota Triggers)
Ngăn chặn hoàn toàn việc người dùng cố tình gửi request API vượt quá hạn mức miễn phí. Các hàm trigger chạy dưới quyền **Invoker** (bỏ `SECURITY DEFINER`) vì chính sách RLS đã cho phép người dùng tự đếm dòng của chính họ (`WHERE user_id = NEW.user_id`), đồng thời thiết lập `SET search_path = ''` với tiền tố schema tường minh (`public.`, `pg_catalog.`) để triệt tiêu hoàn toàn rủi ro Search Path Hijacking:
* **Hàm `public.enforce_tasks_limit()`:**
  * Gắn trigger `BEFORE INSERT` trên bảng `public.tasks`.
  * Nếu số lượng task của `NEW.user_id` $\ge 100$, trigger phát sinh lỗi: `TASK_LIMIT_EXCEEDED: Maximum 100 tasks allowed per user.` với mã lỗi SQL `check_violation`.
* **Hàm `public.enforce_saved_themes_limit()`:**
  * Gắn trigger `BEFORE INSERT` trên bảng `public.saved_themes`.
  * Nếu số lượng theme của `NEW.user_id` $\ge 10$, trigger phát sinh lỗi: `SAVED_THEME_LIMIT_EXCEEDED: Maximum 10 saved themes allowed per user.` với mã lỗi SQL `check_violation`.
* **Hàm `public.enforce_user_wallpapers_limit()`:**
  * Gắn trigger `BEFORE INSERT` trên bảng `public.user_wallpapers`.
  * Nếu số lượng hình nền của `NEW.user_id` $\ge 3$, trigger phát sinh lỗi: `WALLPAPER_LIMIT_EXCEEDED: Maximum 3 custom wallpapers allowed per user.` với mã lỗi SQL `check_violation`.

### 6.3 Hàm Duy trì Hoạt động Tránh Auto-pause (NFR-5.4)
* **Hàm `public.ping()`:** Khai báo `RETURNS integer LANGUAGE sql STABLE SECURITY INVOKER SET search_path = ''`. Phục vụ GitHub Actions cron job ping định kỳ mỗi 3 ngày, giữ cho Supabase Free Tier luôn ở trạng thái Active.

---

## 7. Cấu hình Supabase Storage & Policy

Hệ thống khởi tạo bucket `user-wallpapers` dùng riêng cho tính năng tải ảnh nền tùy biến cá nhân:

### 7.1 Thông số Bucket
* **Bucket ID:** `user-wallpapers`
* **Công khai (Public Read):** `true`
* **Giới hạn dung lượng tệp (File Size Limit):** `5,242,880 bytes` ($5\text{MB}$)
* **MIME Types cho phép:** `image/png`, `image/jpeg`, `image/webp`, `image/gif`

### 7.2 Các Chính sách RLS trên `storage.objects`
1. **Public Read Policy (SELECT):**
   * Cho phép mọi đối tượng (kể cả `anon` và `authenticated`) tải hình ảnh qua CDN nếu biết URL: `bucket_id = 'user-wallpapers'`.
2. **Strict User Folder Upload Policy với Quota < 3 (INSERT):**
   * Người dùng chỉ được ghi tệp vào thư mục con mang chính `user_id` của mình VÀ số tệp hiện tại trong thư mục của họ phải $< 3$:
     ```sql
     bucket_id = 'user-wallpapers'
     AND (SELECT auth.uid())::text = (storage.foldername(name))[1]
     AND (
         SELECT count(*)
         FROM storage.objects
         WHERE bucket_id = 'user-wallpapers'
           AND (storage.foldername(name))[1] = (SELECT auth.uid())::text
     ) < 3
     ```
3. **Owner Update & Delete Policies (UPDATE / DELETE):**
   * Chỉ cho phép sửa hoặc xóa tệp nằm trong thư mục cá nhân `{auth.uid()}/...`.

---

## 8. Quy tắc Đồng bộ Dữ liệu (Sync & Migration Rules)

Để đảm bảo tính toàn vẹn quan hệ ngoại khóa khi đồng bộ ngoại tuyến (FR-23) và di chuyển dữ liệu khách (FR-02):
1. **Hàng đợi FIFO (First-In, First-Out):** Các thay đổi ngoại tuyến được sắp xếp và gửi lên server tuần tự theo thời gian phát sinh `updated_at`.
2. **Thứ tự ưu tiên phụ thuộc khóa ngoại:**
   * Luôn đồng bộ dữ liệu bảng `tasks` **TRƯỚC** khi đồng bộ bảng `focus_sessions`.
   * Luôn di chuyển dữ liệu Guest theo thứ tự: `user_settings` $\rightarrow$ `tasks` $\rightarrow$ `notes` $\rightarrow$ `focus_sessions`.
3. **Cơ chế xử lý lỗi ngoại khóa (`foreign_key_violation` — 23503):**
   * Nếu quá trình đồng bộ một bản ghi `focus_sessions` gặp lỗi mã `23503` (do `task_id` liên kết đã bị xóa trên server hoặc chưa đồng bộ kịp), client **bắt buộc** thực hiện fallback: gán `task_id = null`, giữ nguyên `intent_title`, và gửi lại bản ghi để phiên tập trung không bị mất.

---

## 9. Ánh xạ Hợp đồng DataRepository (Contracts Mapping)

Bảng đối chiếu giữa các TypeScript Interface trong `src/shared/types/contracts.ts` (camelCase) và các bảng/cột cơ sở dữ liệu PostgreSQL (snake_case):

### 9.1 Ánh xạ `UserSettings` ↔ `public.user_settings`
| Thuộc tính TypeScript (`contracts.ts`) | Cột Database (`user_settings`) | Kiểu chuyển đổi |
| :--- | :--- | :--- |
| `userId` | `user_id` | `uuid` |
| `timerDurations.focus` | `focus_duration` | `integer` (giây) |
| `timerDurations.shortBreak` | `short_break_duration` | `integer` (giây) |
| `timerDurations.longBreak` | `long_break_duration` | `integer` (giây) |
| `longBreakInterval` | `long_break_interval` | `integer` |
| `autoStartBreaks` | `auto_start_breaks` | `boolean` |
| `autoStartFocus` | `auto_start_focus` | `boolean` |
| `clockVisualMode` | `clock_visual_mode` | `text` |
| `clockPosition` | `clock_position` | `text` |
| `activeWallpaperId` | `active_wallpaper_id` | `text` |
| `ambientVolumes.rain` | `volume_rain` | `numeric(3,2)` |
| `ambientVolumes.brownNoise` | `volume_brown_noise` | `numeric(3,2)` |
| `ambientVolumes.campfire` | `volume_campfire` | `numeric(3,2)` |
| `ambientVolumes.master` | `volume_master` | `numeric(3,2)` |
| `isMigrated` | `is_migrated` | `boolean` |
| `activeTheme` | `active_theme` | `jsonb` (tối đa 8KB) |
| `updatedAt` | `updated_at` | `timestamptz` (ISO string) |

### 9.2 Ánh xạ `TaskItem` ↔ `public.tasks`
| Thuộc tính TypeScript (`contracts.ts`) | Cột Database (`tasks`) | Kiểu chuyển đổi |
| :--- | :--- | :--- |
| `id` | `id` | `uuid` |
| `userId` | `user_id` | `uuid` |
| `title` | `title` | `text` (tối đa 120 ký tự) |
| `isCompleted` | `is_completed` | `boolean` |
| `priority` | `priority` | `text` (`none`, `low`, `medium`, `high`) |
| `dueDate` | `due_date` | `timestamptz` (hoặc `null`) |
| `labels` | `labels` | `text[]` (Array tối đa 5 phần tử) |
| `createdAt` | `created_at` | `timestamptz` |
| `updatedAt` | `updated_at` | `timestamptz` |

### 9.3 Ánh xạ `NoteItem` ↔ `public.notes`
| Thuộc tính TypeScript (`contracts.ts`) | Cột Database (`notes`) | Kiểu chuyển đổi |
| :--- | :--- | :--- |
| `id` | `id` | `uuid` |
| `userId` | `user_id` | `uuid` |
| `content` | `content` | `text` (tối đa 50,000 ký tự) |
| `createdAt` | `created_at` | `timestamptz` |
| `updatedAt` | `updated_at` | `timestamptz` |

### 9.4 Ánh xạ `WallpaperMetadata` ↔ `public.user_wallpapers`
| Thuộc tính TypeScript (`contracts.ts`) | Cột Database (`user_wallpapers`) | Kiểu chuyển đổi |
| :--- | :--- | :--- |
| `id` | `id` | `uuid` |
| `userId` | `user_id` | `uuid` |
| `storagePath` | `storage_path` | `text` (`{user_id}/...`) |
| `fileSize` | `file_size` | `integer` (bytes, $\le 5\text{MB}$) |
| `luminance` | `luminance` | `numeric(4,3)` (0.000 - 1.000) |
| `createdAt` | `created_at` | `timestamptz` |
| `updatedAt` | `updated_at` | `timestamptz` |

### 9.5 Ánh xạ `SavedTheme` ↔ `public.saved_themes`
| Thuộc tính TypeScript (`contracts.ts`) | Cột Database (`saved_themes`) | Kiểu chuyển đổi |
| :--- | :--- | :--- |
| `id` | `id` | `uuid` |
| `userId` | `user_id` | `uuid` |
| `name` | `name` | `text` (1-50 ký tự) |
| `config` | `config` | `jsonb` (tối đa 8KB) |
| `createdAt` | `created_at` | `timestamptz` |
| `updatedAt` | `updated_at` | `timestamptz` |

### 9.6 Ánh xạ `FocusSessionRecord` ↔ `public.focus_sessions`
| Thuộc tính TypeScript (`contracts.ts`) | Cột Database (`focus_sessions`) | Kiểu chuyển đổi |
| :--- | :--- | :--- |
| `id` | `id` | `uuid` |
| `userId` | `user_id` | `uuid` |
| `durationMinutes` | `duration_minutes` | `integer` (1-1440) |
| `intentTitle` | `intent_title` | `text` (tối đa 80 ký tự hoặc `null`) |
| `taskId` | `task_id` | `uuid` (hoặc `null`) |
| `completedAt` | `completed_at` | `timestamptz` |

---

## 10. Hướng dẫn Chạy Migration & Rollback

### 10.1 Triển khai Migration

#### Cách 1: Sử dụng Supabase CLI (Khuyên dùng cho CI/CD)
```bash
# Đăng nhập vào Supabase CLI
npx supabase login

# Liên kết project
npx supabase link --project-ref your-project-id

# Đẩy migration lên database
npx supabase db push
```

#### Cách 2: Sử dụng Supabase Dashboard (SQL Editor)
1. Truy cập vào trang quản trị Supabase Project: `https://supabase.com/dashboard/project/<your-project-id>`.
2. Chọn biểu tượng **SQL Editor** trên thanh menu bên trái.
3. Tạo truy vấn mới (New Query), dán toàn bộ nội dung tệp `supabase/migrations/20261105000000_init_schema.sql`.
4. Nhấn nút **Run** (Ctrl + Enter). Kết quả báo `Success. No rows returned` xác nhận hệ thống đã khởi tạo hoàn tất và an toàn.

### 10.2 Kịch bản Rollback (Khi cần hoàn tác sạch)

> [!WARNING]
> Supabase ngăn chặn câu lệnh `DELETE FROM storage.buckets` trực tiếp bằng SQL vì lý do an toàn hệ thống. Để rollback sạch sẽ:
> 1. Truy cập vào Supabase Dashboard $\rightarrow$ **Storage** $\rightarrow$ chọn bucket `user-wallpapers` $\rightarrow$ xóa toàn bộ tệp bên trong rồi chọn Delete Bucket.
> 2. Sau đó, chạy đoạn script SQL sau trong SQL Editor để xóa chính sách và các bảng dữ liệu:

```sql
BEGIN;

-- 1. Xóa Storage Policies
DROP POLICY IF EXISTS "Allow authenticated delete from user-wallpapers folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update to user-wallpapers folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert to user-wallpapers folder" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read on user-wallpapers" ON storage.objects;

-- 2. Xóa các Bảng theo đúng thứ tự phụ thuộc ngoại khóa
DROP TABLE IF EXISTS public.focus_sessions CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.notes CASCADE;
DROP TABLE IF EXISTS public.user_wallpapers CASCADE;
DROP TABLE IF EXISTS public.saved_themes CASCADE;
DROP TABLE IF EXISTS public.user_settings CASCADE;

-- 3. Xóa các Hàm & Triggers
DROP FUNCTION IF EXISTS public.handle_last_write_wins() CASCADE;
DROP FUNCTION IF EXISTS public.enforce_tasks_limit() CASCADE;
DROP FUNCTION IF EXISTS public.enforce_saved_themes_limit() CASCADE;
DROP FUNCTION IF EXISTS public.enforce_user_wallpapers_limit() CASCADE;
DROP FUNCTION IF EXISTS public.validate_task_labels(text[]) CASCADE;
DROP FUNCTION IF EXISTS public.ping() CASCADE;

COMMIT;
```

---

## 11. Kiểm thử Kiểm chứng RLS & Ràng buộc (RLS Verification Script)

Đoạn mã SQL dưới đây được thiết kế để **chạy trực tiếp thành công trong Supabase SQL Editor** nhằm kiểm chứng toàn bộ ma trận phân quyền RLS, cơ chế Last-Write-Wins và các hạn mức Quota ở tầng database:

> [!NOTE]
> Phần kiểm thử Storage 3-file quota không thể chạy trực tiếp trong SQL Editor do Storage nằm ngoài Postgres schema của project (test qua API/frontend).

```sql
-- =============================================================================
-- TEST SUITE: RLS, Quotas, Check Constraints & Last-Write-Wins Verification
-- =============================================================================
-- Ghi chú: Phần kiểm thử Storage 3-file quota không thể chạy trực tiếp trong 
-- SQL Editor do Storage nằm ngoài Postgres schema của project (test qua API/frontend).
-- =============================================================================

BEGIN;

-- -----------------------------------------------------------------------------
-- 0. TẠO 2 USER GIẢ LẬP TRONG auth.users KHI CÒN LÀ ROLE postgres
-- -----------------------------------------------------------------------------
INSERT INTO auth.users (id, aud, role, email)
VALUES 
    ('11111111-1111-1111-1111-111111111111'::uuid, 'authenticated', 'authenticated', 'user_a@focusflow.test'),
    ('22222222-2222-2222-2222-222222222222'::uuid, 'authenticated', 'authenticated', 'user_b@focusflow.test')
ON CONFLICT (id) DO NOTHING;

DO $$
DECLARE
    user_a uuid := '11111111-1111-1111-1111-111111111111';
    user_b uuid := '22222222-2222-2222-2222-222222222222';
    task_a_id uuid := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    t_row record;
    rows_affected integer;
    v_count integer;
    huge_json text;
BEGIN
    -- -------------------------------------------------------------------------
    -- TEST 1: user_a INSERT tasks thành công
    -- -------------------------------------------------------------------------
    RESET ROLE;
    SET LOCAL ROLE authenticated;
    PERFORM set_config('request.jwt.claims', json_build_object('sub', user_a::text, 'role', 'authenticated')::text, true);

    INSERT INTO public.tasks (id, user_id, title, priority, labels)
    VALUES (task_a_id, user_a, 'Task of User A', 'high', ARRAY['work', 'urgent']);

    SELECT count(*) INTO v_count FROM public.tasks WHERE id = task_a_id;
    IF v_count = 1 THEN
        RAISE NOTICE 'TEST 1 PASSED: user_a INSERT tasks successfully.';
    ELSE
        RAISE EXCEPTION 'TEST 1 FAILED: user_a could not read own inserted task.';
    END IF;

    -- -------------------------------------------------------------------------
    -- TEST 2: user_b SELECT tasks của user_a -> 0 dòng
    -- -------------------------------------------------------------------------
    RESET ROLE;
    SET LOCAL ROLE authenticated;
    PERFORM set_config('request.jwt.claims', json_build_object('sub', user_b::text, 'role', 'authenticated')::text, true);

    SELECT count(*) INTO v_count FROM public.tasks WHERE id = task_a_id;
    IF v_count = 0 THEN
        RAISE NOTICE 'TEST 2 PASSED: user_b SELECT tasks of user_a returned 0 rows.';
    ELSE
        RAISE EXCEPTION 'TEST 2 FAILED: user_b saw user_a task! (rows: %)', v_count;
    END IF;

    -- -------------------------------------------------------------------------
    -- TEST 3: user_b UPDATE/DELETE tasks của user_a -> 0 dòng bị tác động
    -- -------------------------------------------------------------------------
    -- Vẫn đang ở role user_b
    UPDATE public.tasks SET title = 'Hacked by B' WHERE id = task_a_id;
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    IF rows_affected > 0 THEN
        RAISE EXCEPTION 'TEST 3 FAILED: user_b successfully updated user_a task!';
    END IF;

    DELETE FROM public.tasks WHERE id = task_a_id;
    GET DIAGNOSTICS rows_affected = ROW_COUNT;
    IF rows_affected > 0 THEN
        RAISE EXCEPTION 'TEST 3 FAILED: user_b successfully deleted user_a task!';
    END IF;

    -- Chuyển lại user_a để kiểm tra task vẫn nguyên vẹn
    RESET ROLE;
    SET LOCAL ROLE authenticated;
    PERFORM set_config('request.jwt.claims', json_build_object('sub', user_a::text, 'role', 'authenticated')::text, true);

    SELECT * INTO t_row FROM public.tasks WHERE id = task_a_id;
    IF t_row.title = 'Task of User A' THEN
        RAISE NOTICE 'TEST 3 PASSED: user_b UPDATE/DELETE tasks of user_a affected 0 rows (task intact).';
    ELSE
        RAISE EXCEPTION 'TEST 3 FAILED: user_a task was corrupted by user_b attack!';
    END IF;

    -- -------------------------------------------------------------------------
    -- TEST 4: Quota tasks: user_a INSERT dòng thứ 101 -> văng exception TASK_LIMIT_EXCEEDED
    -- -------------------------------------------------------------------------
    -- Đang là user_a, đã có 1 task (task_a_id). Insert thêm 99 tasks để đạt 100
    FOR i IN 2..100 LOOP
        INSERT INTO public.tasks (user_id, title)
        VALUES (user_a, 'Bulk Task ' || i);
    END LOOP;

    BEGIN
        INSERT INTO public.tasks (user_id, title)
        VALUES (user_a, 'Task 101 (Overflow)');
        RAISE EXCEPTION 'TEST 4 FAILED: 101st task should have been blocked.';
    EXCEPTION WHEN check_violation THEN
        IF SQLERRM LIKE '%TASK_LIMIT_EXCEEDED%' THEN
            RAISE NOTICE 'TEST 4 PASSED: Quota tasks 101st row threw TASK_LIMIT_EXCEEDED.';
        ELSE
            RAISE EXCEPTION 'TEST 4 FAILED: Unexpected error message: %', SQLERRM;
        END IF;
    END;

    -- -------------------------------------------------------------------------
    -- TEST 5: Quota user_wallpapers: user_a INSERT dòng thứ 4 -> văng exception WALLPAPER_LIMIT_EXCEEDED
    -- -------------------------------------------------------------------------
    -- Insert 3 wallpapers hợp lệ
    FOR i IN 1..3 LOOP
        INSERT INTO public.user_wallpapers (user_id, storage_path, file_size, luminance)
        VALUES (user_a, user_a::text || '/wall_' || i || '.png', 1024000, 0.450);
    END LOOP;

    -- Thử insert wallpaper thứ 4
    BEGIN
        INSERT INTO public.user_wallpapers (user_id, storage_path, file_size, luminance)
        VALUES (user_a, user_a::text || '/wall_4.png', 1024000, 0.450);
        RAISE EXCEPTION 'TEST 5 FAILED: 4th wallpaper should have been blocked.';
    EXCEPTION WHEN check_violation THEN
        IF SQLERRM LIKE '%WALLPAPER_LIMIT_EXCEEDED%' THEN
            RAISE NOTICE 'TEST 5 PASSED: Quota user_wallpapers 4th row threw WALLPAPER_LIMIT_EXCEEDED.';
        ELSE
            RAISE EXCEPTION 'TEST 5 FAILED: Unexpected error message: %', SQLERRM;
        END IF;
    END;

    -- -------------------------------------------------------------------------
    -- TEST 6: Quota saved_themes: user_a INSERT dòng thứ 11 -> văng exception SAVED_THEME_LIMIT_EXCEEDED
    -- -------------------------------------------------------------------------
    FOR i IN 1..10 LOOP
        INSERT INTO public.saved_themes (user_id, name, config)
        VALUES (user_a, 'Theme ' || i, '{"accent": "#ffffff"}'::jsonb);
    END LOOP;

    BEGIN
        INSERT INTO public.saved_themes (user_id, name, config)
        VALUES (user_a, 'Theme 11 (Overflow)', '{"accent": "#ffffff"}'::jsonb);
        RAISE EXCEPTION 'TEST 6 FAILED: 11th theme should have been blocked.';
    EXCEPTION WHEN check_violation THEN
        IF SQLERRM LIKE '%SAVED_THEME_LIMIT_EXCEEDED%' THEN
            RAISE NOTICE 'TEST 6 PASSED: Quota saved_themes 11th row threw SAVED_THEME_LIMIT_EXCEEDED.';
        ELSE
            RAISE EXCEPTION 'TEST 6 FAILED: Unexpected error message: %', SQLERRM;
        END IF;
    END;

    -- -------------------------------------------------------------------------
    -- TEST 7: Last-write-wins: UPDATE với client_updated_at cũ hơn updated_at hiện tại -> không cập nhật dòng nào
    -- -------------------------------------------------------------------------
    UPDATE public.tasks 
    SET title = 'Stale Update Overwrite',
        updated_at = now() - interval '1 hour'
    WHERE id = task_a_id;

    SELECT * INTO t_row FROM public.tasks WHERE id = task_a_id;
    IF t_row.title = 'Task of User A' THEN
        RAISE NOTICE 'TEST 7 PASSED: Stale update safely ignored by LWW trigger (data preserved).';
    ELSE
        RAISE EXCEPTION 'TEST 7 FAILED: Stale update overwrote newer data! Title is: %', t_row.title;
    END IF;

    -- -------------------------------------------------------------------------
    -- TEST 8: Anon không đọc được tasks/notes/focus_sessions/wallpapers/themes
    -- -------------------------------------------------------------------------
    RESET ROLE;
    SET LOCAL ROLE anon;
    PERFORM set_config('request.jwt.claims', '', true);

    -- 8.1 tasks
    BEGIN
        PERFORM count(*) FROM public.tasks;
        RAISE EXCEPTION 'TEST 8.1 FAILED: Anon read public.tasks.';
    EXCEPTION WHEN insufficient_privilege THEN
        NULL;
    END;

    -- 8.2 notes
    BEGIN
        PERFORM count(*) FROM public.notes;
        RAISE EXCEPTION 'TEST 8.2 FAILED: Anon read public.notes.';
    EXCEPTION WHEN insufficient_privilege THEN
        NULL;
    END;

    -- 8.3 focus_sessions
    BEGIN
        PERFORM count(*) FROM public.focus_sessions;
        RAISE EXCEPTION 'TEST 8.3 FAILED: Anon read public.focus_sessions.';
    EXCEPTION WHEN insufficient_privilege THEN
        NULL;
    END;

    -- 8.4 user_wallpapers
    BEGIN
        PERFORM count(*) FROM public.user_wallpapers;
        RAISE EXCEPTION 'TEST 8.4 FAILED: Anon read public.user_wallpapers.';
    EXCEPTION WHEN insufficient_privilege THEN
        NULL;
    END;

    -- 8.5 saved_themes
    BEGIN
        PERFORM count(*) FROM public.saved_themes;
        RAISE EXCEPTION 'TEST 8.5 FAILED: Anon read public.saved_themes.';
    EXCEPTION WHEN insufficient_privilege THEN
        NULL;
    END;

    -- 8.6 anon vẫn execute được ping()
    IF public.ping() = 1 THEN
        RAISE NOTICE 'TEST 8 PASSED: Anon blocked from all tables (tasks, notes, focus_sessions, wallpapers, themes) and can execute public.ping().';
    ELSE
        RAISE EXCEPTION 'TEST 8 FAILED: Anon cannot execute public.ping().';
    END IF;

    RAISE NOTICE 'ALL DATABASE & SECURITY TESTS PASSED WITH 100%% SUCCESS.';
END $$;

ROLLBACK; -- Luôn rollback để không để lại dữ liệu thử nghiệm
```

---

## 12. Open Decisions & Giả định Thiết kế

1. **Khởi tạo Dòng 1-1 bằng Client lúc Đăng nhập (No Auth Triggers):**
   * *Quyết định:* Bản ghi ban đầu của `user_settings` và `notes` được tạo trực tiếp bởi client qua thao tác `upsert` (`onConflict: 'user_id'`) trong lần đăng nhập đầu tiên, không dùng trigger trên bảng `auth.users`.
   * *Lý do:* Tránh lỗi tiềm ẩn làm sập luồng đăng ký của Supabase Auth nếu trigger gặp ngoại lệ, đồng thời cho phép client nạp ngay các cài đặt từ Guest Mode chuyển lên mà không bị ghi đè.
2. **Rủi ro Lệch Đồng hồ Thiết bị (Clock Skew) trong Last-Write-Wins:**
   * *Quyết định:* LWW sử dụng timestamp `updated_at` do client gửi lên.
   * *Rủi ro & Giảm thiểu:* Nếu đồng hồ thiết bị người dùng bị chỉnh sai giờ về quá khứ quá xa, các thay đổi offline có thể bị server từ chối. Ngược lại nếu chỉnh về tương lai, thay đổi sẽ ghi đè các cập nhật khác. Giải pháp: Client luôn kiểm tra response của lệnh upsert; nếu server trả về bản ghi có `updated_at` khác, client tự động đồng bộ lại cache cục bộ theo server.
3. **Rủi ro Lạm dụng khi Tắt "Confirm Email" & Sử dụng Public Key:**
   * *Rủi ro:* Kẻ xấu có thể tạo hàng loạt tài khoản rác tự động để làm đầy cơ sở dữ liệu.
   * *Biện pháp phòng ngừa:* Hệ thống đã thiết lập hạn mức cứng ở tầng database: tối đa 100 tasks, 10 saved themes, 3 custom wallpapers (tối đa 5MB/file) cho mỗi tài khoản. Đề xuất bật tính năng CAPTCHA tại *Supabase Dashboard $\rightarrow$ Authentication $\rightarrow$ Attack Protection* trong môi trường Production.
4. **Trường `active_wallpaper_id` Không Có Khóa Ngoại (Foreign Key):**
   * *Quyết định:* `active_wallpaper_id` có thể lưu mã preset mặc định (ví dụ `'preset-lofi-cafe'`) hoặc storage path của ảnh user upload.
   * *Xử lý khi xóa ảnh:* Nếu người dùng xóa một ảnh tùy biến đang được đặt làm hình nền, client chịu trách nhiệm tự động fallback về preset mặc định (`preset-lofi-cafe`) mà không làm sập giao diện.
5. **Đánh đổi của Storage Bucket Public-read (`user-wallpapers`):**
   * *Quyết định:* Thiết lập bucket ở chế độ `public: true` để client nạp ảnh trực tiếp qua CDN tốc độ cao không cần Signed URL.
   * *Phòng ngừa:* Tệp tải lên được lưu với tên ngẫu nhiên UUID v4 (`{user_id}/{gen_random_uuid()}.png`), chống brute-force URL; RLS Storage khóa cứng quyền ghi và giới hạn $< 3$ tệp trong thư mục `{auth.uid()}/`.
6. **Khai thác Kiểu mảng `text[]` cho Labels thay vì Bảng phụ (Junction Table):**
   * *Quyết định:* Lưu trữ các nhãn công việc trực tiếp trong cột `text[]` của bảng `tasks` kết hợp chỉ mục GIN `idx_tasks_labels_gin`.
   * *Lý do:* Theo FR-19, mỗi task chỉ có tối đa 5 nhãn ngắn và người dùng chỉ dùng tối đa 20 nhãn. Việc dùng native array giúp truy vấn cực nhanh trong 1 query duy nhất, không cần JOIN nhiều bảng, tiết kiệm dung lượng lưu trữ trên Free Tier.
7. **Ràng buộc Khóa ngoại `focus_sessions.task_id` (Same-owner Assumption):**
   * *Quyết định:* `focus_sessions.task_id` chỉ kiểm tra tồn tại (FK), không ràng buộc task phải thuộc cùng user; rủi ro cực thấp (UUID v4 khó đoán, không lộ nội dung task), chấp nhận cho phiên bản này.
