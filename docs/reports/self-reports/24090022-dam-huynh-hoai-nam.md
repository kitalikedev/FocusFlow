# Self-report: Đàm Huỳnh Hoài Nam (24090022)

| Mục | Nội dung |
| :--- | :--- |
| Họ tên | Đàm Huỳnh Hoài Nam |
| MSSV | 24090022 |
| GitHub | [kitalikedev](https://github.com/kitalikedev) |
| Vai trò | Nhóm trưởng, Tech Lead |
| Dự án | FocusFlow, nhóm 1, lớp 24SE1, môn Web Basic (CSB25022) |


## Vai trò và đóng góp chung

Mình là nhóm trưởng và là **người làm chính** của dự án FocusFlow. Tính đến lúc nộp, mình có **24 trên 42 pull request đã merge** (khoảng 57 %), và phần lớn số dòng code của repo là của mình. Mình làm kiến trúc, database, CI/CD, phần lớn tính năng của workspace, toàn bộ website nhiều trang, Google Analytics và Sentry, phần lớn các bản sửa Lighthouse và tài liệu. Ngoài việc tự làm, mình còn **lên kế hoạch cho cả nhóm ở từng sprint**: chọn việc, chia task theo Issue và Milestone, giao từng người một phần việc riêng, hướng dẫn cách làm việc trên GitHub, review và merge mọi pull request của các bạn.

**Hạ tầng và các dịch vụ ngoài do mình làm chính:** mình tạo tài khoản, cấu hình và vận hành **Supabase** (database, đăng nhập, Storage), **Vercel** (triển khai và biến môi trường), **Sentry** (ghi lỗi), **Google Analytics 4** (theo dõi người dùng) và **GitHub Actions** (CI và job giữ Supabase không bị tạm dừng). Các bạn khác không cần đụng vào khóa hay cấu hình của các dịch vụ này; mình giữ chúng để tránh lộ khóa và để mọi thứ chạy đồng nhất.

Khó khăn lớn nhất xuyên suốt dự án là **nhóm khá đông (5 người)**: việc tập hợp đủ mọi người để họp và việc chia task cho đều rất khó, vì mỗi bạn có trình độ, thời gian rảnh và mảng quen thuộc khác nhau. Cách mình xử lý: chia việc theo từng thư mục tính năng riêng để làm song song không đụng nhau, giao cho mỗi bạn phần vừa sức và gần với sở thích của bạn đó, ghi mọi việc thành Issue có người nhận và Milestone có hạn, và tự nhận những phần nặng hoặc phần bị kẹt để cả nhóm kịp hạn.

---

## Sprint 1: Đặc tả và nền tảng (05/11 – 06/11/2026)

### 1. Việc đã làm

| Việc | Pull request / nơi lưu |
| :--- | :--- |
| Đặc tả dự án (PRD, Architecture, ERD, API docs) và thiết kế database: 6 bảng, ràng buộc, trigger, Row Level Security, Storage | `docs/`, `supabase/migrations/` |
| Khung dự án (Vite, TypeScript, Tailwind, ESLint, CI), lớp dữ liệu, đăng nhập, chuyển dữ liệu khách sang tài khoản | [#1](https://github.com/kitalikedev/FocusFlow/pull/1), [#4](https://github.com/kitalikedev/FocusFlow/pull/4), [#5](https://github.com/kitalikedev/FocusFlow/pull/5) |

Ngoài các PR trên:

- Chủ trì buổi họp khởi động, cùng cả nhóm chọn đề tài FocusFlow và phân vai.
- Chọn công nghệ cho nhóm: React, TypeScript, Tailwind, Zustand và Supabase thay cho việc tự viết server, vì Supabase có sẵn PostgreSQL, đăng nhập, Row Level Security và Storage.
- Cấu hình repo: ruleset bảo vệ `main` (bắt buộc PR, 1 approval, squash merge, CI phải xanh), kết nối Vercel để tự triển khai.
- Tạo project Supabase, chạy migration để có 6 bảng, Row Level Security và bucket Storage; đặt biến môi trường của Supabase trên Vercel.

**Kế hoạch và giao việc cho team:**

| Người | Việc | Kết quả |
| :--- | :--- | :--- |
| Cả nhóm | Họp khởi động, chọn đề tài FocusFlow, phân vai (nhóm trưởng, nhóm phó và reporter, frontend, UI/UX, backend) | Có đề tài, vai trò và quy trình làm việc |
| Dũng | Ghi biên bản họp, theo dõi tiến độ | Biên bản các buổi họp |
| Phú, Thảo Anh, Sanh | Đọc đặc tả, cài môi trường GitHub Codespaces, chọn phần tính năng muốn nhận cho sprint sau | Sẵn sàng làm tính năng từ sprint 2 |

### 2. Khó khăn và cách giải quyết

- **Khó khăn chung của nhóm:** tập hợp đủ 5 người cho buổi họp đầu và chốt vai trò, vì lịch mỗi người khác nhau; chưa ai biết quy trình GitHub nên mình tự dựng nền tảng trước.
- Dữ liệu sửa khi mất mạng có thể ghi đè bản mới hơn khi đồng bộ; người dùng dùng app khi chưa đăng nhập sẽ mất dữ liệu khi tạo tài khoản.
- Cách giải quyết: họp ngắn có ghi biên bản, mình dựng khung dự án, CI và database trước để các bạn có chỗ làm; viết trigger `handle_last_write_wins()` để so sánh `updated_at` và bỏ qua bản cũ hơn; thêm bước hỏi người dùng có muốn chuyển dữ liệu khách vào tài khoản mới không.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 5
- Nhận xét: Mình dựng toàn bộ nền tảng (đặc tả, database, khung dự án, đăng nhập) và dẫn dắt nhóm làm quen quy trình; đây là phần việc nặng nhất của sprint.

---

## Sprint 2: Tính năng workspace (07/11 – 10/11/2026)

### 1. Việc đã làm

| Việc | Pull request / nơi lưu |
| :--- | :--- |
| Tính năng workspace: timer và âm báo, âm thanh nền, tasks, notes, analytics, thư viện theme, trích dẫn, tối ưu âm thanh | [#6](https://github.com/kitalikedev/FocusFlow/pull/6), [#10](https://github.com/kitalikedev/FocusFlow/pull/10), [#11](https://github.com/kitalikedev/FocusFlow/pull/11), [#15](https://github.com/kitalikedev/FocusFlow/pull/15) |
| Kế hoạch từng phase, cập nhật tiến độ, dọn tài liệu và chia task cho thành viên | [#7](https://github.com/kitalikedev/FocusFlow/pull/7), [#8](https://github.com/kitalikedev/FocusFlow/pull/8), [#12](https://github.com/kitalikedev/FocusFlow/pull/12) |

Ngoài các PR trên:

- Chủ trì buổi họp chia task, duyệt wireframe workspace của Thảo Anh rồi chia mỗi người một thư mục tính năng.
- Viết quy ước kiến trúc để các bạn làm song song không đụng file nhau (mỗi tính năng một thư mục, gắn vào giao diện qua slot).
- Tự làm phần lớn tính năng của workspace (timer, âm thanh, tasks, notes, analytics, thư viện theme, trích dẫn); review PR của Dũng, Phú và Thảo Anh.

**Kế hoạch và giao việc cho team:**

| Người | Việc | Kết quả |
| :--- | :--- | :--- |
| Dũng | Chế độ đồng hồ: vòng tròn, lật kiểu retro, bảng cài đặt | PR #9 |
| Phú | Lofi radio, tối ưu trích dẫn, theme mặc định | PR #13, #16 |
| Thảo Anh | Wireframe workspace, theme Pixel Cyberpunk | PR #14 |

### 2. Khó khăn và cách giải quyết

- **Khó khăn chung của nhóm:** chia task cho đều rất khó vì mỗi bạn có trình độ và thời gian khác nhau; có bạn nhận việc nhẹ, mình nhận phần nặng.
- Nhiều người cùng làm một giao diện dễ sửa trùng file; timer phải chạy đúng giờ kể cả khi tab nằm nền; hai lần đổi cài đặt liên tiếp có thể ghi đè nhau.
- Cách giải quyết: chia theo thư mục tính năng và dùng ESLint cấm import lẫn nhau; giao cho mỗi bạn một phần vừa sức (đồng hồ, lofi, theme); dùng Web Worker với `Date.now()` cho timer; xếp hàng các lần lưu cài đặt để chạy lần lượt.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 5
- Nhận xét: Mình làm phần lớn tính năng chính của workspace, viết quy ước kiến trúc, chia task cho cả nhóm và review PR của từng bạn.

---

## Sprint 3: Website nhiều trang (13/11 – 17/11/2026)

### 1. Việc đã làm

| Việc | Pull request / nơi lưu |
| :--- | :--- |
| Tạo 5 Milestone và các Issue theo barem | GitHub ([#19](https://github.com/kitalikedev/FocusFlow/issues/19) – [#23](https://github.com/kitalikedev/FocusFlow/issues/23)) |
| Website nhiều trang: Analytics, About, landing page, menu cho điện thoại, trang xem trước theme | [#24](https://github.com/kitalikedev/FocusFlow/pull/24), [#27](https://github.com/kitalikedev/FocusFlow/pull/27), [#28](https://github.com/kitalikedev/FocusFlow/pull/28) |

Ngoài các PR trên:

- Đối chiếu barem của môn với app hiện tại, thấy chỉ có một màn hình nên quyết định tách thành website nhiều trang; tự làm toàn bộ phần website.
- Tạo 5 Milestone và các Issue, giao việc cho từng bạn; hướng dẫn các bạn dùng GitHub Codespaces, tạo nhánh riêng và mở PR có `Closes #số`.
- Review và merge PR README của Dũng (#18).

**Kế hoạch và giao việc cho team:**

| Người | Việc | Kết quả |
| :--- | :--- | :--- |
| Dũng | Cập nhật README (tính năng, cài đặt, thành viên) | PR #18 |

### 2. Khó khăn và cách giải quyết

- **Khó khăn chung của nhóm:** nhóm đông nên khó theo sát từng người; có phần việc phải tự làm để kịp hạn Milestone 1.
- Khi đổi sang trang khác thì timer và nhạc bị dừng; phím tắt của timer vẫn chạy khi đang xem trang website.
- Cách giải quyết: ghi mọi việc thành Issue có người nhận và Milestone có hạn để cả nhóm thấy rõ ai làm gì; giữ workspace luôn chạy nền và chỉ ẩn đi khi xem trang website; cho phím tắt chỉ hoạt động ở `/app`.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 5
- Nhận xét: Mình tự làm website nhiều trang, tạo Milestone và Issue, giao việc và hướng dẫn cả nhóm dùng GitHub.

---

## Sprint 4: Giám sát, hiệu năng, dữ liệu mẫu, giao diện mới (18/11 – 20/11/2026)

### 1. Việc đã làm

| Việc | Pull request / nơi lưu |
| :--- | :--- |
| Google Analytics 4 và Sentry ([#21](https://github.com/kitalikedev/FocusFlow/issues/21)) | [#29](https://github.com/kitalikedev/FocusFlow/pull/29) |
| Sửa lỗi Lighthouse trang chủ, sửa test tiêu đề không ổn định | [#33](https://github.com/kitalikedev/FocusFlow/pull/33), [#36](https://github.com/kitalikedev/FocusFlow/pull/36) |
| Website dùng theme đã chọn, ảnh chụp workspace, carousel ảnh demo | [#43](https://github.com/kitalikedev/FocusFlow/pull/43), [#44](https://github.com/kitalikedev/FocusFlow/pull/44) |

Ngoài các PR trên:

- Tạo thuộc tính Google Analytics 4 và project Sentry, đặt `VITE_GA_MEASUREMENT_ID` và `VITE_SENTRY_DSN` trên Vercel, kiểm tra lượt truy cập hiện trong báo cáo Realtime và lỗi hiện trong Sentry; thêm hai secret cho job giữ Supabase không bị tạm dừng và chạy thử job đó.
- Review và merge PR của cả nhóm: Lighthouse lần 1 của Phú, dữ liệu mẫu và nhạc YouTube của Sanh, wireframe và giao diện mới của Thảo Anh và Dũng.
- Chạy `seed.sql` trên Supabase với tài khoản của mình và kiểm tra trang Analytics và Themes có số liệu thật.
- Gỡ vướng khi Thảo Anh push bị chặn: hướng dẫn gỡ hook Git LFS và mở PR thay vì push thẳng lên `main`.

**Kế hoạch và giao việc cho team:**

| Người | Việc | Kết quả |
| :--- | :--- | :--- |
| Phú | Báo cáo Lighthouse lần 1 cho 3 trang | PR #35 |
| Sanh | Dữ liệu mẫu cho database và trình điều khiển nhạc YouTube | PR #38, #41 |
| Thảo Anh | Wireframe các trang website và lập trình giao diện mới | PR #39, #42 |
| Dũng | Thiết kế lại giao diện các trang website | PR #40 |

### 2. Khó khăn và cách giải quyết

- **Khó khăn chung của nhóm:** nhiều việc dồn vào cuối (GA, Sentry, Lighthouse, dữ liệu mẫu, giao diện mới) nên khó chia đều; Thảo Anh làm trong Codespaces gặp lỗi push nên mình phải hướng dẫn.
- Google Analytics và Sentry phải không thu thập dữ liệu cá nhân và không làm chậm trang; test tiêu đề trang lúc đạt lúc không; Performance trang chủ trên mobile chỉ 80 điểm.
- Cách giải quyết: gỡ hook Git LFS và làm trên nhánh riêng; GA nạp sau khi trang tải xong, Sentry chỉ gửi lỗi (xóa cookie, nội dung gõ và tên công việc trước khi gửi) và mở CSP cho hai dịch vụ; viết lại test cho ổn định; tự sửa các mục Lighthouse báo cho trang chủ.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 5
- Nhận xét: Mình làm GA, Sentry, phần website và các bản sửa Lighthouse, đồng thời review nhiều PR và gỡ lỗi push cho các bạn.

---

## Sprint 5: Hoàn thiện và nộp bài (21/11 – 26/11/2026)

### 1. Việc đã làm

| Việc | Pull request / nơi lưu |
| :--- | :--- |
| Sửa lofi radio, tách nhạc và âm thanh nền, làm mượt Zen, hiện Live cho stream, sửa ô mục tiêu, cải thiện Lighthouse | [#46](https://github.com/kitalikedev/FocusFlow/pull/46), [#47](https://github.com/kitalikedev/FocusFlow/pull/47) |

Ngoài các PR trên:

- Đo lại Lighthouse bằng Lighthouse CLI trong trình duyệt sạch, cập nhật báo cáo và bảng điểm trong README.
- Viết lại README theo đúng mẫu nộp bài, tách phần chi tiết sang các file trong `docs/`, vẽ sơ đồ ERD và các sơ đồ kiến trúc, cập nhật tiến độ và kế hoạch.
- Nhận 6 góp ý của nhóm Đạt, phân loại, tìm ra nguyên nhân chung của hai lỗi nút nhảy khi bấm, rồi giao Phú làm PR sửa; review và merge các PR self-report của các bạn.

**Kế hoạch và giao việc cho team:**

| Người | Việc | Kết quả |
| :--- | :--- | :--- |
| Phú | Báo cáo Lighthouse lần 2 theo từng trang; làm PR sửa theo góp ý của nhóm Đạt | PR #45, #51 |
| Dũng | README theo mẫu nộp bài, biên bản họp | PR #52, #57 |
| Thảo Anh, Sanh, Phú, Dũng | Mỗi người tự viết self-report của mình | PR #52, #54, #55, #56 |
| Cả nhóm | Đánh giá 2 nhóm khác, quay video demo | Đang thực hiện |

### 2. Khó khăn và cách giải quyết

- **Khó khăn chung của nhóm:** hạn nộp gần, việc nhiều (README, biên bản, đánh giá chéo, self-report, video) mà các bạn bận lịch khác nhau nên mình chia việc rất kỹ và tự làm phần sửa lỗi gấp.
- YouTube chặn nhúng các link lofi cũ nên lofi radio không phát; stream trực tiếp hiện thời lượng là tổng số giờ đã phát; nút Exit Zen và nút carousel bị tụt khi bấm.
- Cách giải quyết: đổi sang link mới và tự chuyển link cũ trong hàng chờ đã lưu; nhận ra stream trực tiếp để hiện chữ Live; tìm ra nguyên nhân chung là quy tắc CSS `transform: scale()` khi bấm làm mất phần canh giữa của nút; giao Phú làm PR sửa theo góp ý để mọi người đều có phần.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 5
- Nhận xét: Mình sửa lỗi lofi và Zen, viết README, tổng hợp góp ý đánh giá chéo, chia việc cuối cùng cho cả nhóm và review mọi PR còn lại.
