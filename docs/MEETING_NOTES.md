# Biên bản họp nhóm FocusFlow (Issue #23)

## Buổi 1: Khởi động dự án và phân vai (mở Sprint 1)

- **Ngày:** 05/11/2026
- **Hình thức:** Discord và gặp trực tiếp
- **Chủ trì:** Đàm Huỳnh Hoài Nam. **Ghi biên bản:** Nguyễn Anh Dũng
- **Thành phần:** Hoài Nam, Anh Dũng, Xuân Phú, Thảo Anh, Công Sanh. **Vắng:** không

### Thảo luận

1. **Chọn đề tài.**
   - Nhóm cân nhắc vài ý tưởng web có dữ liệu người dùng và chọn **FocusFlow**: ứng dụng hẹn giờ tập trung kiểu Pomodoro kết hợp không gian làm việc có theme, âm thanh nền, danh sách công việc và thống kê.
   - **Thảo Anh** đề xuất làm giao diện đẹp, có hình nền và theme để người dùng tự chọn không khí làm việc. **Phú** đề xuất thêm âm thanh nền kiểu lofi để tạo không khí tập trung. Cả nhóm đồng ý đưa hai ý này vào sản phẩm.
   - Lý do: đủ trang để làm website nhiều trang, có dữ liệu riêng của từng người để làm trang động, và có nhiều phần giao diện để chia cho 5 người.
2. **Chọn công nghệ.**
   - React 18, TypeScript, Vite, Tailwind CSS (đề yêu cầu Tailwind), Zustand.
   - **Nam** đề xuất dùng Supabase thay cho tự viết server. Backend dùng Supabase: PostgreSQL thuộc nhóm database đề cho phép, có sẵn đăng nhập, REST API, Row Level Security và Storage, và miễn phí.
   - Triển khai trên Vercel, test bằng Vitest, CI bằng GitHub Actions.
3. **Cho phép dùng không cần tài khoản.** Khách dùng được mọi tính năng, dữ liệu lưu trong trình duyệt. Đăng nhập thì đồng bộ lên database.
4. **Quy trình làm việc.**
   - Mỗi việc là một GitHub Issue có người nhận.
   - Làm trên nhánh riêng, mở Pull Request, CI xanh và có 1 người duyệt mới squash merge vào `main`.
   - Mọi người dùng GitHub Codespaces để có cùng môi trường.

### Phân vai

| Thành viên         | Vai trò                                   | Trách nhiệm                                                                 |
| :----------------- | :---------------------------------------- | :-------------------------------------------------------------------------- |
| Đàm Huỳnh Hoài Nam | Nhóm trưởng, Tech Lead                    | Kiến trúc, tài liệu đặc tả, database, CI/CD, triển khai, review và merge PR |
| Nguyễn Anh Dũng    | Nhóm phó, Reporter, Frontend, UI Designer | Theo dõi và báo cáo tiến độ, lên lịch, ghi biên bản, README                 |
| Võ Xuân Phú        | Frontend, QA hiệu năng                    | Tính năng âm thanh, trích dẫn, đo Lighthouse                                |
| Lê Nguyễn Thảo Anh | UI/UX Designer, Frontend                  | Wireframe, theme, giao diện website                                         |
| Trần Công Sanh     | Backend/Frontend                          | Dữ liệu mẫu cho database, tính năng nhạc YouTube                            |

### Việc cần làm (Sprint 1: 05/11 – 06/11)

| Việc                                                                | Người   | Kết quả                |
| :------------------------------------------------------------------ | :------ | :--------------------- |
| Viết đặc tả: PRD, Architecture, ERD, API docs                       | Nam     | Có trong `docs/`       |
| Viết migration database có RLS                                      | Nam     | `supabase/migrations/` |
| Dựng khung dự án: Vite, TypeScript, Tailwind, ESLint, CI            | Nam     | PR #1                  |
| Lớp dữ liệu, đăng nhập, chuyển dữ liệu khách lên tài khoản          | Nam     | PR #5                  |
| Tìm hiểu đặc tả, chuẩn bị Codespaces, chọn phần tính năng muốn nhận | Cả nhóm |                        |

---

## Buổi 2: Tổng kết Sprint 1, duyệt wireframe, chia task tính năng (mở Sprint 2)

- **Ngày:** 07/11/2026
- **Thành phần:** cả nhóm. **Vắng:** không

### Tổng kết Sprint 1

- Đã có đặc tả, migration, khung dự án, đăng nhập và lớp dữ liệu. Timer engine và âm báo xong sớm (PR #6).
- CI đã chạy cho mọi PR.

### Thảo luận

1. **Duyệt wireframe workspace bản máy tính và điện thoại** do Thảo Anh vẽ:
   - Đồng hồ ở giữa màn hình, phía trên là ô "What do you want to focus on?".
   - Thanh trên có số phiên hôm nay và streak.
   - Dock dưới trái mở Tasks, Notepad, Sounds; dock dưới phải mở Themes, Analytics, Zen.
   - Trên điện thoại, các công cụ mở dạng bảng trượt từ dưới lên.
   - Nhóm chốt bố cục này. (Ảnh wireframe được đưa lên repo sau, trong PR #39.)
2. **Ý tưởng bổ sung.** **Thảo Anh** đề xuất thêm theme Pixel Cyberpunk để thư viện theme có phong cách riêng. **Phú** đề xuất thêm lofi radio từ YouTube bên cạnh âm thanh tạo bằng code, và cách hiển thị trích dẫn gọn hơn cùng một theme mặc định cho người mới.
3. **Chia task theo tính năng.** Mỗi người một thư mục riêng trong `src/features` để tránh sửa trùng file. Các tính năng gắn vào giao diện qua "slot".

### Việc cần làm (Sprint 2: 07/11 – 10/11)

| Việc                                                                               | Người    | Kết quả                   |
| :--------------------------------------------------------------------------------- | :------- | :------------------------ |
| Âm thanh nền, tasks, notes, analytics, thư viện theme; tối ưu âm thanh và hiệu ứng | Nam      | PR #10, #11               |
| Tính năng trích dẫn                                                                | Nam      | PR #15                    |
| Chế độ đồng hồ: vòng tròn, lật kiểu retro, bảng cài đặt                            | Dũng     | PR #9                     |
| Kênh lofi và lofi radio; tối ưu trích dẫn, theme mặc định                          | Phú      | PR #13, #16               |
| Theme Pixel Cyberpunk                                                              | Thảo Anh | PR #14                    |
| Wireframe workspace bản máy tính và điện thoại                                     | Thảo Anh | Đưa lên repo trong PR #39 |

---

## Buổi 3: Tổng kết Sprint 2, đối chiếu barem, lên kế hoạch website (mở Sprint 3)

- **Ngày:** 13/11/2026
- **Thành phần:** cả nhóm. **Vắng:** không

### Tổng kết Sprint 2

- Workspace đã đủ tính năng chính: timer, 3 kiểu đồng hồ, âm thanh nền và lofi radio, tasks, notes, analytics, 12 theme, trích dẫn.

### Thảo luận

1. **Đối chiếu barem.** Barem yêu cầu website có ít nhất 3 trang, trong khi app hiện chỉ có một màn hình workspace. Nhóm quyết định:
   - Tách thành website nhiều trang: Home, Themes, Analytics, About (Nam đề xuất, cả nhóm đồng ý).
   - **Thảo Anh** đề xuất menu điều hướng gọn, dùng menu 3 gạch trên điện thoại.
   - Workspace chuyển sang `/app`, luôn chạy nền để timer và nhạc không bị ngắt khi chuyển trang.
2. **Trang động.** Analytics đọc bảng `focus_sessions`; Themes đọc bảng `saved_themes`. Đủ yêu cầu 2 trang lấy dữ liệu từ database.
3. **Quản lý việc trên GitHub.** Tạo 5 Milestone theo phần barem, mỗi việc một Issue có người nhận.

| Milestone               | Nội dung                                                   |
| :---------------------- | :--------------------------------------------------------- |
| 1. Multi-page routing   | Website nhiều trang, landing page, wireframe, biên bản họp |
| 2. Tracking and logging | Google Analytics, Sentry                                   |
| 3. Seed data and README | Dữ liệu mẫu, báo cáo README                                |
| 4. Lighthouse           | Đo và sửa điểm Lighthouse                                  |
| 5. Peer review          | Đánh giá 2 nhóm khác, sửa theo góp ý                       |

### Việc cần làm (Sprint 3: 13/11 – 17/11)

| Việc                                            | Người | Kết quả         |
| :---------------------------------------------- | :---- | :-------------- |
| Cập nhật README: tính năng, cài đặt, thành viên | Dũng  | PR #18          |
| Các trang Analytics, About (Issue #19)          | Nam   | PR #24          |
| Landing page và menu website (Issue #26)        | Nam   | PR #27          |
| Thay trang Tasks bằng trang xem trước theme     | Nam   | PR #28          |
| Tạo Milestone và Issue cho các phần còn lại     | Nam   | Issue #19 – #23 |

---

## Buổi 4: Tổng kết Sprint 3, chia việc theo barem (mở Sprint 4)

- **Ngày:** 18/11/2026
- **Thành phần:** cả nhóm. **Vắng:** không

### Tổng kết Sprint 3

- Website đã có trang chủ, Themes, Analytics, Tracking (coming soon), About, có menu cho điện thoại.

### Thảo luận

1. **Giám sát:** cần Google Analytics để theo dõi người dùng và Sentry để ghi lỗi (Task 4b).
2. **Hiệu năng:** đo Lighthouse trên production, sửa các mục điểm thấp (Task 4a). **Phú** đề xuất đo trong cửa sổ sạch vì dữ liệu cũ và extension làm sai điểm.
3. **Dữ liệu demo:** cần một file seed để 2 trang động có dữ liệu khi giảng viên xem và khi quay video.
4. **Giao diện website:** nhóm thấy trang chủ còn đơn giản. **Thảo Anh** đề xuất vẽ lại wireframe cho từng trang và thêm nút sáng/tối, timer thử, mục liên hệ ở trang chủ. Dũng và Thảo Anh làm lại giao diện theo wireframe đó.
5. **Push nhánh bị chặn:** có thành viên push không được vì `main` được bảo vệ và vì hook Git LFS trong Codespace. Nhóm thống nhất luôn làm trên nhánh riêng và mở PR.

### Việc cần làm (Sprint 4: 18/11 – 20/11)

| Việc                                            | Người          | Kết quả     |
| :---------------------------------------------- | :------------- | :---------- |
| Google Analytics và Sentry (Issue #21)          | Nam            | PR #29      |
| Sửa test tiêu đề trang chạy không ổn định       | Nam            | PR #33      |
| Báo cáo Lighthouse lần 1 (Issue #30)            | Phú            | PR #35      |
| Sửa lỗi Lighthouse trên trang chủ               | Nam            | PR #36      |
| Dữ liệu mẫu cho database (Issue #20)            | Sanh           | PR #38      |
| Trình điều khiển nhạc YouTube (Issue #37)       | Sanh           | PR #41      |
| Wireframe các trang website (Issue #22)         | Thảo Anh       | PR #39      |
| Giao diện mới cho các trang website (Issue #34) | Dũng, Thảo Anh | PR #40, #42 |
| Website dùng theme đã chọn, carousel ảnh demo   | Nam            | PR #43, #44 |

---

## Buổi 5: Tổng kết Sprint 4, chuẩn bị nộp bài (mở Sprint 5)

- **Ngày:** 21/11/2026
- **Thành phần:** cả nhóm. **Vắng:** không

### Tổng kết Sprint 4

- Đủ GA, Sentry, dữ liệu mẫu, nhạc YouTube, wireframe và giao diện mới.
- Lighthouse lần 1 có trang dưới 90 điểm Performance, đã sửa một phần.

### Thảo luận

1. **Lighthouse lần 2:** đo lại trong cửa sổ sạch, sửa nốt các mục còn lại. **Phú** đề xuất báo cáo chia theo từng trang và từng thiết bị, ghi rõ cách tái hiện số liệu.
2. **Lỗi người dùng báo:** lofi radio không phát được (YouTube chặn nhúng link cũ), thanh nhạc hiện thời lượng sai với stream trực tiếp, ô mục tiêu bị hẹp khi đồng hồ ở góc. Nhóm sửa trước khi nộp.
3. **Hồ sơ nộp bài:** README theo đúng 5 mục đề yêu cầu (cách chạy, tổng quan, tính năng và ảnh, ERD, thông tin thêm), video demo dưới 10 phút, self-report 5 sprint của từng người.
4. **Đánh giá chéo:** mỗi nhóm đánh giá UI/UX của ít nhất 2 nhóm khác theo 3 tiêu chí của đề, rồi sửa theo góp ý nhận được.

### Việc cần làm (Sprint 5: từ 21/11)

| Việc                                                          | Người           | Kết quả                      |
| :------------------------------------------------------------ | :-------------- | :--------------------------- |
| Báo cáo Lighthouse lần 2                                      | Phú             | PR #45                       |
| Sửa lofi radio, Zen, Lighthouse; Live cho stream, ô mục tiêu  | Nam             | PR #46, #47                  |
| Báo cáo README (Issue #31)                                    | Dũng, Nam duyệt | PR #48, #50                  |
| Biên bản họp (Issue #23)                                      | Dũng            | Biên bản này                 |
| Đánh giá UI/UX cho 2 nhóm khác, ghi vào `docs/PEER_REVIEW.md` | Cả nhóm         | \_\_\_\_                     |
| Sửa theo góp ý nhận được                                      | Cả nhóm         | PR #51                       |
| Quay video demo                                               | \_\_\_\_        | \_\_\_\_                     |
| Self-report 5 sprint                                          | Từng người      | `docs/reports/self-reports/` |

---

## Buổi 6 (sau khi có góp ý): Tổng kết dự án

- **Ngày:** 21/11/2026
- **Hình thức:** Discord
- **Thành phần:** cả nhóm. **Vắng:** không

### 1. Góp ý nhận được và quyết định xử lý

**Từ nhóm 6 của Đạt (xử lý trong PR #51 – Phú):**

| #   | Góp ý                                                                                    | Quyết định        | Cách xử lý / Lý do                                                                                                                                            |
| :-- | :--------------------------------------------------------------------------------------- | :---------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| 1   | Nhấn mũi tên trái/phải của carousel ở trang chủ bị "đi xuống", lệch chuột không bấm được | Đã làm            | Đổi sang dùng thuộc tính `scale` riêng thay cho `transform: scale(0.95)` để không làm mất `translate` canh giữa nút.                                          |
| 2   | Mở nhạc lofi không biết đã chạy được bao lâu, thanh `0:00 ... Live` chỉ để làm cảnh      | Đã làm            | Hiển thị chữ `Live` kèm **thời gian đã nghe** (đếm từ lúc bấm phát, dừng khi tạm dừng); ẩn thanh tua vì là stream trực tiếp; thêm ảnh bìa vào danh sách phát. |
| 3   | Bật Zen (phím `F`) rồi bấm nút `Exit Zen` không thoát được, nút nhảy liên tục            | Đã làm            | Dùng chung phương án CSS `scale` (như góp ý 1) để không làm mất `-translate-x-1/2` canh giữa nút khi nhấn, kèm thêm test.                                     |
| 4   | Sang trang khác vẫn nghe tiếng nhạc nhưng chưa có nút điều khiển                         | Đã làm            | Thêm thanh nhạc mini ở góc dưới các trang website (tạm dừng/phát, bài trước/sau, âm lượng, tên bài) khi có bài đang phát.                                     |
| 5   | Nên có chỉnh tốc độ âm thanh cho lofi                                                    | Không làm lúc này | Stream trực tiếp của YouTube không đổi tốc độ được và âm Lofi Web Audio là vòng lặp cố định; ngoài phạm vi PRD, ghi vào hướng phát triển.                     |
| 6   | Danh sách link YouTube yêu thích/đã lưu và ảnh bìa thumbnail                             | Làm một phần      | Đã thêm ảnh bìa vào danh sách phát; riêng danh sách yêu thích đồng bộ nhiều thiết bị cần thêm bảng database và sửa PRD nên để vào hướng phát triển.           |

**Từ nhóm 4 của Triết:**

- **Nội dung góp ý:** Giao diện trang chủ đẹp, chuẩn cấu trúc, web mượt mà và chức năng ổn; tuy nhiên giao diện phần app (`/app`) chưa tốt ("kiểu high tech nhưng mà chưa tới"), đặc biệt phần theme chưa được đẹp.
- **Quyết định:** Không làm lúc này, ghi nhận để cập nhật thêm bộ theme đa dạng hơn ở giai đoạn phát triển tiếp theo (coming soon).

### 2. Điều nhóm làm tốt

- Tinh thần teamwork tốt, các thành viên chủ động hỗ trợ và giúp đỡ lẫn nhau trong quá trình thực hiện.
- Sản phẩm đầu ra bám sát kế hoạch (plan) và lộ trình mà nhóm đã đề ra từ đầu.

### 3. Điều cần cải thiện nếu làm lại

- Phân chia công việc hợp lý và cân đối hơn ngay từ đầu.
- Ghi nhận đầy đủ ý kiến của từng thành viên trong quá trình thảo luận để hạn chế bất đồng quan điểm.
- Chọn thời điểm họp phù hợp hơn dựa trên lịch trình rảnh của tất cả mọi người nhằm tránh delay lịch họp.

---

## Buổi 7 (sau khi giảng viên chấm thử): Rà soát lược đồ cơ sở dữ liệu

- **Ngày:** tối 26/11/2026
- **Hình thức:** Discord
- **Chủ trì:** Đàm Huỳnh Hoài Nam. **Ghi biên bản:** Nguyễn Anh Dũng
- **Thành phần:** Hoài Nam, Anh Dũng, Xuân Phú, Thảo Anh, Công Sanh. **Vắng:** không
- **Theo dõi tại:** [Issue #63](https://github.com/kitalikedev/FocusFlow/issues/63)

### Lý do họp

Giảng viên nhận xét lược đồ chỉ được viết một lần trong migration ngày 06/11, chưa có buổi họp hay PR nào để cả nhóm cùng xem lại. Buổi này cả nhóm đọc lại `docs/ERD.md` (sơ đồ, từ điển dữ liệu, khóa ngoại, chỉ mục, các quyết định thiết kế ở mục 12) và quyết định chỗ nào cần sửa.

### Thảo luận

1. **Nam trình bày lược đồ:** 6 bảng (`profiles`, `tasks`, `focus_sessions`, `saved_themes`, `user_settings`, `user_wallpapers`), 7 khóa ngoại, quy tắc xóa, RLS theo `user_id`, trigger Last-Write-Wins và trigger giới hạn số lượng.
2. **Đối chiếu với PRD:** Không thấy thiếu bảng, thiếu cột hay cột thừa so với các chức năng trong PRD.
3. **Biểu quyết từng đề xuất:**

| #   | Đề xuất                                                              | Quyết định              | Lý do / cách làm                                                                                                                                                                                                                                            |
| :-- | :------------------------------------------------------------------- | :---------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Thêm mô tả cho 6 bảng và các cột                                     | Duyệt                   | Migration mới với `COMMENT ON TABLE` và `COMMENT ON COLUMN`, không đổi dữ liệu và code.                                                                                                                                                                     |
| 2   | Khóa ngoại `focus_sessions.task_id` phải cùng chủ với phiên          | Duyệt có điều kiện      | Khóa ngoại ghép `(task_id, user_id)` tới `tasks(id, user_id)`, thêm `UNIQUE (id, user_id)` trên `tasks`. Chỉ áp dụng khi câu kiểm tra trên dữ liệu thật không trả về dòng nào và chạy thử trong `BEGIN … ROLLBACK` thành công; nếu không thì hoãn và ghi lý do vào ERD. |
| 3   | Theme trùng tên trong một tài khoản                                  | Giữ nguyên              | Thêm ràng buộc duy nhất có thể làm hỏng lúc gộp dữ liệu khách vào tài khoản; ghi lý do vào ERD.                                                                                                                                                             |
| 4   | Giới hạn 100 task, 10 theme, 3 hình nền kiểm tra bằng đếm rồi chèn  | Ghi là rủi ro chấp nhận | Chỉ xảy ra khi một người chèn nhiều dòng cùng lúc; ghi vào ERD.                                                                                                                                                                                             |
| 5   | Nhãn task dạng `text[]`, cấu hình theme dạng `jsonb`                 | Giữ nguyên              | Lý do ở ERD mục 12 vẫn đúng.                                                                                                                                                                                                                                |
| 6   | Chỉ mục                                                              | Giữ nguyên              | 7 chỉ mục là đủ, mỗi người tối đa 100 task.                                                                                                                                                                                                                 |
| 7   | CI kiểm thử migration và RLS trên PostgreSQL thật                    | Duyệt                   | Job CI mới dựng PostgreSQL, chạy migration, seed và bộ kiểm thử ở ERD mục 11.                                                                                                                                                                               |
| 8   | Ý kiến khác                                                          | Không có                    | Không                                                                                                                                                                                                                                                       |

### Việc cần làm (hạn 27/11/2026)

| Việc                                                                                 | Người           | Kết quả             |
| :----------------------------------------------------------------------------------- | :-------------- | :------------------ |
| Migration cho điểm 1 và 2, cập nhật `docs/ERD.md` (điểm 2, 3, 4) và README mục 6     | Dũng, Nam duyệt | PR đóng Issue #63   |
| Job CI chạy migration và kiểm thử RLS trên PostgreSQL thật (điểm 7)                  | Dũng, Nam duyệt | PR đóng Issue #63   |
