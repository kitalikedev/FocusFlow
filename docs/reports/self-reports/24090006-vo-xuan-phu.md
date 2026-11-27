# Self-report: Võ Xuân Phú (24090006)

| Mục | Nội dung |
|---|---|
| Họ tên | Võ Xuân Phú |
| MSSV | 24090006 |
| GitHub | vxphuswe |
| Vai trò | Frontend Developer (phần âm thanh), QA hiệu năng |
| Dự án | FocusFlow, nhóm 1, lớp 24SE1, môn Web Basic (CSB25022) |

## Tổng quan đóng góp

| Sprint | Thời gian | Trọng tâm của mình | Pull request / nơi lưu | Tự đánh giá |
|---|---|---|---|---|
| 1. Đặc tả và nền tảng | 05/11 – 06/11 | Đề xuất làm âm thanh, âm thanh nền lofi, tìm hiểu kiến trúc | Họp nhóm, tài liệu trong `docs/` | 5 |
| 2. Tính năng workspace | 07/11 – 10/11 | Lofi radio, trích dẫn, theme mặc định | #13, #16 | 5 |
| 3. Website nhiều trang | 13/11 – 17/11 | Kiểm thử các trang, kiểm tra nhạc chạy nền | Không có pull request | 3,5 |
| 4. Giám sát, hiệu năng | 18/11 – 20/11 | Báo cáo Lighthouse lần 1 | #35 (Issue #30) | 5 |
| 5. Hoàn thiện và nộp bài | 21/11 – 26/11 | Báo cáo Lighthouse lần 2, sửa theo đánh giá chéo | #45, #51 | 5 |
| 6. Sửa theo bản chấm thử | 26/11 – 27/11 | Đo lại Lighthouse trên Next.js, báo cáo lần 3 | Nhánh `docs/lighthouse-v3-report` (Issue #66) | 5 |

Trung bình tự đánh giá: **4,75 / 5**.

## Lời mở đầu

Mình là Phú, phụ trách phần giao diện âm thanh và kiểm tra hiệu năng của nhóm. FocusFlow là dự án đầu tiên mình làm việc nhóm theo quy trình khá đầy đủ: chia nhánh, pull request, CI, đánh giá chéo và đo điểm Lighthouse.

Cách làm việc của mình: phần code của mình do mình tìm hiểu trên mạng và tự code. Mình dùng AI như một trợ lý để giải thích khái niệm chưa quen, gợi ý hướng làm và giúp đọc lỗi. Mình luôn tự đọc, hiểu và chạy thử trước khi đưa code vào dự án, vì người chịu trách nhiệm cho pull request là mình chứ không phải công cụ. Cách làm này giúp mình học nhanh hơn mà vẫn nắm được code mình nộp.

## Sprint 1: Đặc tả và nền tảng (05/11 – 06/11/2026)

### 1. Việc đã làm
- Tham gia họp chốt đề tài FocusFlow cùng cả nhóm.
- Đề xuất làm âm thanh và thêm âm thanh nền kiểu lofi để tạo không khí tập trung. Mình đề xuất vì khi tự làm bài, nhạc nhẹ giúp mình vào trạng thái tập trung nhanh hơn, và một ứng dụng Pomodoro nên giúp người dùng làm được điều đó. Nhóm đưa ý tưởng vào kế hoạch tính năng âm thanh, và đây là cơ sở cho phần lofi radio ở Sprint 2.
- Đọc tài liệu đặc tả (PRD, Architecture, ERD) và cài môi trường phát triển.

### 2. Khó khăn và cách giải quyết
- **Khó khăn:** làm quen với cấu trúc dự án. Mỗi tính năng nằm trong một thư mục riêng ở `src/features` và gắn vào giao diện qua slot, khác với cách mình quen là để mọi thứ trong vài component lớn.
- **Cách giải quyết:** mình chủ động đọc tài liệu kiến trúc trong `docs/`, đọc cấu hình ESLint để hiểu vì sao các tính năng không được import lẫn nhau, và hỏi AI về lý do tách module. Sau đó mình tự thiết kế và viết phần của mình theo quy ước đó. Mình hiểu cách chia này giúp nhiều người làm song song mà không đụng file nhau, và có thể dùng lại cách tổ chức này cho các dự án sau.

### 3. Tự đánh giá đóng góp
- **Mức độ đóng góp (1 – 5):** 5
- **Nhận xét:** Mình góp ý tưởng âm thanh nền và chuẩn bị môi trường; phần nền tảng kỹ thuật do Nam làm. Sprint này mình dùng để hiểu kiến trúc, tạo nền cho các sprint sau.

## Sprint 2: Tính năng workspace (07/11 – 10/11/2026)

### 1. Việc đã làm

| Việc | Pull request |
|---|---|
| Lofi radio trong bảng âm thanh | #13 |
| Tối ưu cách hiển thị trích dẫn, chọn theme mặc định | #16 |

- **Lofi radio (PR #13):** thêm radio lofi phát từ YouTube vào bảng âm thanh, đặt cạnh các âm thanh nền tạo bằng code, để người dùng vừa nghe tiếng mưa hoặc tiếng ồn trắng vừa bật được nhạc lofi. Đây là tính năng mình đề xuất từ Sprint 1 nên mình đặc biệt muốn nó chạy mượt.
- **Trích dẫn và theme mặc định (PR #16):** làm cách hiển thị trích dẫn gọn hơn và chọn theme mặc định, để người mới mở app thấy ngay một giao diện dễ nhìn mà không phải tự chỉnh.
- Cùng cả nhóm duyệt wireframe workspace của Thảo Anh (bố cục đồng hồ ở giữa, công cụ ở hai góc) trước khi code.

### 2. Khó khăn và cách giải quyết
- **Khó khăn:** nhiều người cùng sửa giao diện dễ đụng file của nhau. Riêng phần nhúng YouTube mình chưa từng làm nên chưa biết cách điều khiển trình phát từ code.
- **Cách giải quyết:** mình làm trọn trong `src/features/audio` theo quy ước nhóm đặt ra (mỗi tính năng một thư mục, ESLint kiểm tra trên CI), nên không ảnh hưởng phần của bạn khác. Với YouTube, mình đọc tài liệu trình phát nhúng, hỏi AI những chỗ chưa rõ về cách phát, tạm dừng, đổi bài, rồi tự viết và thử trên nhiều trường hợp.

### 3. Tự đánh giá đóng góp
- **Mức độ đóng góp (1 – 5):** 5
- **Nhận xét:** Hoàn thành đúng tính năng lofi radio và hai cải tiến về trích dẫn, theme mặc định; cả hai pull request đều được merge. Mình học được cách làm một tính năng độc lập nhưng vẫn khớp với giao diện chung.

## Sprint 3: Website nhiều trang (13/11 – 17/11/2026)

### 1. Việc đã làm
- Tham gia họp nhóm và góp ý khi đối chiếu barem.
- Kiểm thử các trang mới (Home, Themes, Analytics, About) trên máy tính và điện thoại, báo lỗi giao diện cho nhóm.
- Kiểm tra nhạc vẫn phát liên tục khi chuyển trang, vì workspace được thiết kế chạy nền.
- Theo dõi Issue và Milestone để nắm phần việc sẽ nhận ở sprint sau (báo cáo Lighthouse).

### 2. Khó khăn và cách giải quyết
- **Khó khăn:** khi chuyển sang trang khác, timer và nhạc bị dừng.
- **Cách giải quyết:** nhóm để workspace luôn chạy nền và chỉ ẩn đi khi xem các trang website. Vì nhạc thuộc phần mình, mình kiểm tra lại để chắc nhạc phát liên tục khi đổi trang và tắt đúng khi cần.

### 3. Tự đánh giá đóng góp
- **Mức độ đóng góp (1 – 5):** 3,5
- **Nhận xét:** Sprint này mình không nộp code; đóng góp chủ yếu là kiểm thử và góp ý. Mình nhận đây là sprint đóng góp ít nhất và đã bù lại ở các sprint sau.

## Sprint 4: Giám sát, hiệu năng, dữ liệu mẫu, giao diện mới (18/11 – 20/11/2026)

### 1. Việc đã làm

| Việc | Pull request / nơi lưu |
|---|---|
| Báo cáo Lighthouse lần 1 cho 3 trang, mobile và desktop (Issue #30) | #35, `docs/lighthouse-report.md` |

- Nhận phần đo hiệu năng cho cả nhóm: chạy Lighthouse cho 3 trang trên cả mobile và desktop, ghi lại điểm Performance, Accessibility, Best Practices, SEO và các mục Lighthouse chỉ ra.
- Đề xuất đo trên bản production trong cửa sổ trình duyệt sạch, vì dữ liệu cũ và extension làm điểm sai lệch; nhóm dùng cách này làm chuẩn đo cho các báo cáo sau.
- Tổng hợp các mục cần sửa thành danh sách ưu tiên (viewport chặn phóng to, `robots.txt` không hợp lệ, ảnh chưa tối ưu, JavaScript chưa dùng) và chuyển cho Nam để cải thiện hiệu năng.

### 2. Khó khăn và cách giải quyết
- **Khó khăn:** bản build chạy local cho điểm Performance trang chủ mobile là 95, nhưng trên bản production chỉ khoảng 80. Hai số khác xa nhau nên mình không thể dùng số local để báo cáo.
- **Cách giải quyết:** mình chuyển sang đo trực tiếp trên bản production, ghi rõ điều kiện đo trong báo cáo và đính kèm ảnh chụp để người duyệt đối chiếu. Mình hiểu rằng đo hiệu năng cần quy trình nhất quán, một con số riêng lẻ không đáng tin.

### 3. Tự đánh giá đóng góp
- **Mức độ đóng góp (1 – 5):** 5
- **Nhận xét:** Hoàn thành báo cáo Lighthouse đầy đủ cho 3 trang và 2 thiết bị, đồng thời chỉ ra hướng sửa giúp nhóm cải thiện điểm. Mình học được cách đọc báo cáo Lighthouse và biến nó thành việc cụ thể.

## Sprint 5: Hoàn thiện và nộp bài (21/11 – 26/11/2026)

### 1. Việc đã làm

| Việc | Pull request / nơi lưu |
|---|---|
| Báo cáo Lighthouse lần 2 theo từng trang (Issue #30) | #45, `docs/Lighthouse_v2_report.md` |
| Sửa theo góp ý đánh giá chéo của nhóm Đạt: nút không nhảy khi bấm, thời gian đã nghe cho stream trực tiếp, thanh nhạc nhỏ ở trang website | #51 |

- **Lighthouse lần 2:** đo lại sau khi Nam sửa, theo từng trang và từng thiết bị, ghi rõ cách tái hiện số liệu để người khác đo lại ra kết quả tương tự. Trên bản production, Best Practices và SEO đạt 100 ở cả 3 trang, Accessibility đạt 96 đến 100 (tăng từ 91–94 ở lần 1), Performance đạt 86 đến 90. Báo cáo cũng ghi rõ các giới hạn của số liệu (mỗi lượt đo một lần, cảnh báo IndexedDB).
- **Sửa theo đánh giá chéo:** trên nhánh `feature/peer-feedback`, áp dụng các chỉnh sửa cho tính năng âm thanh: thêm MiniPlayer, cập nhật MusicController, SoundPanel, YouTubeHost, useAudioStore, và bổ sung test (`miniPlayer.test.tsx`, `pressEffect.test.ts`). Mình xem `git diff` để chắc thay đổi nhỏ và đúng chỗ, rồi chạy test trước khi commit.
- Cùng nhóm kiểm thử các chức năng Nam hoàn thiện và tham gia đánh giá chéo UI/UX.

### 2. Khó khăn và cách giải quyết
- **Khó khăn 1: đo Lighthouse không ổn định.** Điểm lần trước bị lệch vì đo trong cửa sổ có sẵn dữ liệu IndexedDB và extension. Mình thử viết script chạy Lighthouse tự động cho cả 6 lượt đo nhưng trang bị tự tải lại giữa chừng. Mình chuyển sang đo bằng tab Lighthouse của Chrome DevTools trong cửa sổ ẩn danh, xóa dữ liệu trang trước mỗi lần đo, rồi ghi quy trình này vào báo cáo để người khác làm lại được.
- **Khó khăn 2: ổ đĩa C: đầy.** `npm ci` báo `ENOSPC: no space left on device` và copy một file nhỏ cũng lỗi. Mình kiểm tra bằng `Get-PSDrive C`, xóa `node_modules` dang dở, cache npm và file tạm, hỏi AI các lệnh dọn rồi cài lại thành công. Bài học là kiểm tra môi trường trước khi nghi ngờ code.
- **Khó khăn 3: cảnh báo xuống dòng LF/CRLF.** Git cảnh báo LF/CRLF khi đưa file ngoài vào. Mình hiểu đây là khác biệt ký tự xuống dòng giữa Windows và Linux, đặt `core.autocrlf true` để Git tự xử lý khi commit, tránh diff toàn file.

### 3. Tự đánh giá đóng góp
- **Mức độ đóng góp (1 – 5):** 5
- **Nhận xét:** Hoàn thành báo cáo Lighthouse lần 2 đúng hạn và xử lý các thay đổi cho tính năng âm thanh sau đánh giá chéo. Phần video demo và đánh giá UI/UX cuối cùng sẽ hoàn tất cùng nhóm.

## Sprint 6: Sửa theo bản chấm thử (26/11 – 27/11/2026)

### 1. Việc đã làm

| Việc | Pull request / nơi lưu |
|---|---|
| Đo lại Lighthouse trên Next.js cho các trang chính (Issue #66) | Nhánh `docs/lighthouse-v3-report`, `docs/Lighthouse_v3_report.md` |
| Dự họp rà soát lược đồ cơ sở dữ liệu tối 26/11 trên Discord (đủ 5 người) | Buổi 7 trong `docs/MEETING_NOTES.md` |

- **Đo lại trên Next.js (Issue #66):** đo 4 trang chính (Trang chủ, Themes, App, Analytics) × 2 thiết bị (Mobile, Desktop) = 8 lượt đo trên bản production sau khi nhóm refactor sang Next.js. Lần này mình thêm trang Themes so với hai báo cáo trước.
- **Báo cáo lần 3:** viết `docs/Lighthouse_v3_report.md` với tóm tắt dễ hiểu cho người không chuyên, bảng điểm, 8 ảnh chụp (`docs/images/lighthouse-v3/`), so sánh với lần 1 và lần 2, phân tích từng trang, các hạn chế của số liệu và kế hoạch cải thiện.
- **Kết quả chính:** Accessibility, Best Practices và SEO đạt 100 ở cả 8 lượt đo. Performance Desktop đạt 95 đến 100. Performance Mobile còn thấp hơn: Analytics 87, Trang chủ 89, Themes và App đúng ngưỡng 90. Mình ghi các điểm này thành việc cần làm tiếp thay vì chỉ báo cáo con số.
- Dự họp rà soát lược đồ cơ sở dữ liệu tối 26/11 trên Discord cùng cả nhóm (đủ 5 người).

### 2. Khó khăn và cách giải quyết
- **Khó khăn 1: điểm lệch giữa các lần đo trong cùng ngày.** Khi đo lại 4 lượt, điểm Performance thay đổi tới 7 điểm (Themes Mobile từ 83 lên 90, Trang chủ Desktop từ 88 lên 95), và Accessibility của Trang chủ Desktop đổi từ 96 lên 100. Mình không chọn lấy số đẹp mà ghi cả lần đo đầu lẫn lần đo lại vào một mục riêng trong báo cáo, nói rõ chưa xác định được nguyên nhân (dao động của Lighthouse, bộ nhớ đệm hay bản deploy thay đổi), và đề xuất đo ít nhất 3 lần rồi lấy trung vị.
- **Khó khăn 2: nhánh Git bị lẫn commit cũ.** Lần push đầu gửi tới 992 object trong khi commit của mình chỉ thêm tài liệu, nên mình nghi ngờ. Mình chạy `git log origin/main..HEAD` và `git diff --stat origin/main...HEAD` và thấy nhánh còn chứa commit báo cáo lần 2, commit này sẽ ghi đè các ảnh `before-*` đang có trên `main`. Mình tạo nhánh mới `docs/lighthouse-v3-report` từ `origin/main` và chỉ lấy đúng 9 file của báo cáo lần 3 (báo cáo và 8 ảnh), nên pull request chỉ có một commit sạch.
- **Khó khăn 3: gắn nhầm số issue.** Ban đầu mình gắn báo cáo lần 3 vào Issue #30 như hai lần trước. Sau khi mở issue trên GitHub, mình thấy việc này thuộc Issue #66, nên sửa lại tiêu đề báo cáo, thông điệp commit và dòng `Closes #66` trong mô tả pull request.

### 3. Tự đánh giá đóng góp
- **Mức độ đóng góp (1 – 5):** 5
- **Nhận xét:** Hoàn thành báo cáo Lighthouse lần 3 cho 4 trang và 2 thiết bị, ghi trung thực cả biến động giữa các lần đo, và giữ pull request gọn, đúng phạm vi. Mình rút ra rằng báo cáo hiệu năng chỉ có giá trị khi người khác kiểm chứng và làm lại được.

## Tổng kết cá nhân

Qua 6 sprint, mình học được ba điều chính:

1. **Làm việc nhóm bằng Git:** tách nhánh, mở pull request, đọc diff để chắc pull request chỉ chứa đúng thay đổi cần thiết, và xử lý cảnh báo kiểu xuống dòng.
2. **Xem hiệu năng và khả năng truy cập là một phần của sản phẩm:** đo bằng số liệu và quy trình nhất quán, không bằng cảm giác. Qua ba lần đo, mình thấy SEO tăng từ 91–92 lên 100 và Accessibility tăng từ 91–94 lên 100, còn Performance trên mobile là phần cần làm tiếp.
3. **Dùng AI đúng cách:** để hiểu nhanh và kiểm tra lại, còn việc quyết định và viết code là của mình, vì người chịu trách nhiệm cho phần code nộp vẫn là mình.

Mình tự đánh giá mình mạnh ở phần âm thanh và đo hiệu năng. Điều cần cải thiện là chủ động hơn: nhận việc sớm ngay từ đầu sprint, phát biểu và góp ý các tính năng cùng các thành viên trong nhóm nhiều hơn, và review pull request của bạn khác thay vì chủ yếu làm phần của mình.
