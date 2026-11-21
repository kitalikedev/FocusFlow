# Self-report: Võ Xuân Phú (24090006)

| Mục | Nội dung |
| :--- | :--- |
| Họ tên | Võ Xuân Phú |
| MSSV | 24090006 |
| GitHub | [vxphuswe](https://github.com/vxphuswe) |
| Vai trò | Frontend Developer, QA hiệu năng |
| Dự án | FocusFlow, nhóm 1, lớp 24SE1, môn Web Basic (CSB25022) |

## Lời mở đầu

Mình là Phú, phụ trách phần giao diện âm thanh và kiểm tra hiệu năng của nhóm. FocusFlow là dự án đầu tiên mình làm việc nhóm theo quy trình khá đầy đủ: chia nhánh, pull request, CI, đánh giá chéo và đo điểm Lighthouse.

**Cách làm việc của mình:** phần code của mình do mình tìm hiểu trên mạng và tự code. Ngoài ra mình dùng AI như một trợ lý để giải thích khái niệm chưa quen, gợi ý hướng làm và giúp đọc lỗi. Mình luôn tự đọc, hiểu và chạy thử trước khi đưa code vào dự án, vì người chịu trách nhiệm cho pull request là mình chứ không phải công cụ. Cách làm này giúp mình học nhanh hơn mà vẫn nắm được code mình nộp.

---

## Sprint 1: Đặc tả và nền tảng (05/11 – 06/11/2026)

### 1. Việc đã làm

- Tham gia họp chốt đề tài FocusFlow cùng cả nhóm.
- Đề xuất thêm âm thanh nền kiểu lofi để tạo không khí tập trung. Mình đề xuất vì khi tự làm bài, nhạc nhẹ giúp mình vào trạng thái tập trung nhanh hơn, và một ứng dụng Pomodoro nên giúp người dùng làm được điều đó. Nhóm đưa ý tưởng vào kế hoạch tính năng âm thanh, và đây là cơ sở cho phần lofi radio ở Sprint 2. 
- Đọc tài liệu đặc tả (PRD, Architecture, ERD) và cài môi trường phát triển.

### 2. Khó khăn và cách giải quyết

- Khó khăn: làm quen với cấu trúc dự án. Mỗi tính năng nằm trong một thư mục riêng ở `src/features` và gắn vào giao diện qua slot, khác với cách mình quen là để mọi thứ trong vài component lớn.
- Cách giải quyết: mình chủ động tự tìm hiểu, đọc tài liệu kiến trúc trong `docs/`, đọc cấu hình ESLint để hiểu vì sao các tính năng không được import lẫn nhau, và hỏi AI về lý do tách module. Sau đó mình tự thiết kế và viết phần của mình theo quy ước đó. Mình hiểu cách chia này giúp nhiều người làm song song mà không đụng file nhau, và có thể dùng lại cách tổ chức này cho các dự án sau.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 5
- Nhận xét: Mình góp ý tưởng âm thanh nền và chuẩn bị môi trường; phần nền tảng kỹ thuật do Nam làm. Sprint này mình dùng để hiểu kiến trúc, tạo nền cho các sprint sau.

---

## Sprint 2: Tính năng workspace (07/11 – 10/11/2026)

### 1. Việc đã làm

| Việc | Pull request / nơi lưu |
| :--- | :--- |
| Lofi radio trong bảng âm thanh, tối ưu trích dẫn, theme mặc định | [#13](https://github.com/kitalikedev/FocusFlow/pull/13), [#16](https://github.com/kitalikedev/FocusFlow/pull/16) |

Đây là sprint mình bắt đầu viết code thật cho dự án.

- Lofi radio (PR #13): thêm radio lofi phát từ YouTube vào bảng âm thanh, đặt cạnh các âm thanh nền tạo bằng code, để người dùng vừa nghe tiếng mưa hoặc tiếng ồn trắng vừa bật được nhạc lofi. Đây là tính năng mình đề xuất từ Sprint 1 nên mình đặc biệt muốn nó chạy mượt.
- Trích dẫn và theme mặc định (PR #16): làm cách hiển thị trích dẫn gọn hơn và chọn theme mặc định, để người mới mở app thấy ngay một giao diện dễ nhìn mà không phải tự chỉnh.
- Cùng cả nhóm duyệt wireframe workspace của Thảo Anh (bố cục đồng hồ ở giữa, công cụ ở hai góc) trước khi code.

### 2. Khó khăn và cách giải quyết

- Khó khăn: nhiều người cùng sửa giao diện dễ đụng file của nhau; riêng phần nhúng YouTube mình chưa từng làm.
- Cách giải quyết: mình làm trọn trong `src/features/audio` theo quy ước nhóm đặt ra (mỗi tính năng một thư mục, ESLint kiểm tra trên CI), nên không ảnh hưởng phần của bạn khác. Với YouTube, mình đọc tài liệu trình phát nhúng, hỏi AI những chỗ chưa rõ về cách điều khiển phát, tạm dừng, đổi bài, rồi tự viết và thử trên nhiều trường hợp. _[Thêm khó khăn cụ thể nếu có]_

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 5
- Nhận xét: Hoàn thành đúng tính năng lofi radio và hai cải tiến về trích dẫn, theme mặc định; cả hai pull request đều được merge. Mình học được cách làm một tính năng độc lập nhưng vẫn khớp với giao diện chung.

---

## Sprint 3: Website nhiều trang (13/11 – 17/11/2026)

### 1. Việc đã làm

- Tham gia họp nhóm và góp ý khi đối chiếu barem.
- Kiểm thử các trang mới (Home, Themes, Analytics, About) trên máy tính và điện thoại, báo lỗi giao diện cho nhóm.
- Kiểm tra nhạc vẫn phát liên tục khi chuyển trang, vì workspace được thiết kế chạy nền.
- Theo dõi Issue và Milestone để nắm phần việc sẽ nhận ở sprint sau (báo cáo Lighthouse).

### 2. Khó khăn và cách giải quyết

- Khó khăn: khi chuyển sang trang khác, timer và nhạc bị dừng.
- Cách giải quyết: nhóm để workspace luôn chạy nền và chỉ ẩn đi khi xem các trang website. Vì nhạc thuộc phần mình, mình kiểm tra lại để chắc nhạc phát liên tục khi đổi trang và tắt đúng khi cần.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 5
- Nhận xét: Sprint này mình không nộp code; đóng góp chủ yếu là kiểm thử và góp ý. Mình nhận đây là sprint đóng góp ít nhất và đã bù lại ở hai sprint sau.

---

## Sprint 4: Giám sát, hiệu năng, dữ liệu mẫu, giao diện mới (18/11 – 20/11/2026)

### 1. Việc đã làm

| Việc | Pull request / nơi lưu |
| :--- | :--- |
| Báo cáo Lighthouse lần 1 cho 3 trang, mobile và desktop ([#30](https://github.com/kitalikedev/FocusFlow/issues/30)) | [#35](https://github.com/kitalikedev/FocusFlow/pull/35) |

- Mình nhận phần đo hiệu năng cho cả nhóm: chạy Lighthouse cho 3 trang trên cả mobile và desktop, ghi lại điểm Performance, Accessibility, Best Practices, SEO và các mục Lighthouse chỉ ra.
- Đề xuất đo trên bản production và trong cửa sổ trình duyệt sạch, vì dữ liệu cũ và extension làm điểm sai lệch; nhóm dùng cách này làm chuẩn đo cho cả hai lần báo cáo.
- Chuyển danh sách mục cần sửa cho Nam để cải thiện hiệu năng.

### 2. Khó khăn và cách giải quyết

- Khó khăn: điểm Performance trang chủ trên mobile chỉ khoảng 80, và số đo giữa các lần chạy lệch nhau.
- Cách giải quyết: mình tổng hợp các mục bị báo thành danh sách ưu tiên cho Nam sửa, đo trong cửa sổ ẩn danh và đo nhiều lần để lấy kết quả ổn định. Mình hiểu rằng đo hiệu năng cần quy trình nhất quán, một con số riêng lẻ không đáng tin.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 5
- Nhận xét: Hoàn thành báo cáo Lighthouse đầy đủ cho 3 trang và 2 thiết bị, đồng thời chỉ ra hướng sửa giúp nhóm cải thiện điểm. Mình học được cách đọc báo cáo Lighthouse và biến nó thành việc cụ thể.

---

## Sprint 5: Hoàn thiện và nộp bài (21/11 – 26/11/2026)

### 1. Việc đã làm

| Việc | Pull request / nơi lưu |
| :--- | :--- |
| Báo cáo Lighthouse lần 2 theo từng trang ([#30](https://github.com/kitalikedev/FocusFlow/issues/30)) | [#45](https://github.com/kitalikedev/FocusFlow/pull/45) |

- Đo lại Lighthouse sau khi Nam sửa, theo từng trang và từng thiết bị, ghi rõ cách tái hiện số liệu để người khác đo lại ra kết quả tương tự. Trên bản production, Performance đạt 94 – 100, còn Accessibility, Best Practices và SEO đều 100 ở cả 3 trang.
- Trên nhánh `feature/peer-feedback`, áp dụng các chỉnh sửa cho tính năng âm thanh: thêm `MiniPlayer`, cập nhật `MusicController`, `SoundPanel`, `YouTubeHost`, `useAudioStore`, và bổ sung test (`miniPlayer.test.tsx`, `pressEffect.test.ts`). Mình xem `git diff` để chắc thay đổi nhỏ và đúng chỗ, rồi chạy test trước khi commit.
- Cùng nhóm kiểm thử các chức năng Nam hoàn thiện và tham gia đánh giá chéo UI/UX. 

### 2. Khó khăn và cách giải quyết

- Khó khăn 1: điểm Lighthouse lần trước thấp do đo trong cửa sổ có sẵn dữ liệu và extension. Mình đo lại bằng Lighthouse CLI trong trình duyệt sạch và ghi cách làm vào báo cáo.
- Khó khăn 2: ổ đĩa C: đầy, `npm ci` báo `ENOSPC: no space left on device` và copy một file nhỏ cũng lỗi. Mình kiểm tra bằng `Get-PSDrive C`, xóa `node_modules` dang dở, cache npm và file tạm, hỏi AI các lệnh dọn rồi cài lại thành công. Bài học là kiểm tra môi trường trước khi nghi ngờ code.
- Khó khăn 3: Git cảnh báo LF/CRLF khi đưa file ngoài vào. Mình đặt `core.autocrlf true` để Git tự xử lý khi commit, tránh diff toàn file.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 5
- Nhận xét: Hoàn thành báo cáo Lighthouse lần 2 đúng hạn và xử lý các thay đổi cho tính năng âm thanh sau đánh giá chéo. Phần video demo và đánh giá UI/UX cuối cùng sẽ hoàn tất cùng nhóm. 

---

## Tổng kết cá nhân

Qua 5 sprint, mình học được ba điều chính:

- **Làm việc nhóm bằng Git:** tách nhánh, mở pull request, đọc diff và xử lý cảnh báo kiểu xuống dòng.
- **Xem hiệu năng và khả năng truy cập là một phần của sản phẩm:** đo bằng số liệu và quy trình nhất quán, không bằng cảm giác.
- **Dùng AI đúng cách:** để hiểu nhanh và kiểm tra lại, còn việc quyết định và viết code là của mình, vì người chịu trách nhiệm cho phần code nộp vẫn là mình.

Mình tự đánh giá mình mạnh ở phần âm thanh và đo hiệu năng. Điều cần cải thiện là chủ động nhận việc , thảo luận và góp ý các tính năng cùng với các thành viên trong nhóm
