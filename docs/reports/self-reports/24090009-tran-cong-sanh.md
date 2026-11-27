# Self-report: Trần Công Sanh (24090009)

| Mục | Nội dung |
| :--- | :--- |
| Họ tên | Trần Công Sanh |
| MSSV | 24090009 |
| GitHub | [sanh2k6-sec](https://github.com/sanh2k6-sec) |
| Vai trò | Backend/Frontend Developer |
| Dự án | FocusFlow, nhóm 1, lớp 24SE1, môn Web Basic (CSB25022) |

---

## Sprint 1: Đặc tả và nền tảng (05/11 – 06/11/2026)

### 1. Việc đã làm

Sprint này mình chưa có pull request nào. Mình theo dõi nhóm chốt đề tài, chia vai và nghe lý do chọn Supabase thay vì tự viết server. Sau đó mình ngồi đọc đặc tả Nam viết (PRD, Architecture, ERD, API docs). Thú thật là lúc đầu mình hơi ngợp vì tài liệu khá dài và có nhiều thứ mới như Row Level Security hay trigger, nhưng đọc xong mình hiểu app sẽ chạy như thế nào và biết mình có thể đứng ở đâu trong dự án.

### 2. Khó khăn và cách giải quyết

Mình chưa nhận phần code nên chưa gặp khó khăn kỹ thuật cụ thể. Khó khăn lớn nhất của mình lúc này là chưa biết bắt đầu từ đâu để đóng góp. Mình chọn cách đọc kỹ tài liệu trước để sau này nhận việc thì làm được ngay.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 1
- Nhận xét: Mình chưa có sản phẩm nào, nhưng đã đọc đặc tả và hiểu database để chuẩn bị. Mình thấy hơi tiếc vì chưa chủ động nhận việc sớm hơn.

---

## Sprint 2: Tính năng workspace (07/11 – 10/11/2026)

### 1. Việc đã làm

Trong sprint này mình thêm và chỉnh phần trích dẫn (quotes) cho workspace; phần này mình không có pull request riêng. Ngoài ra mình xem wireframe workspace của Thảo Anh, thấy bố cục đồng hồ ở giữa và công cụ ở hai góc dưới nhìn gọn và dễ dùng. Mình cũng đọc code của các bạn, nhất là cách chia mỗi tính năng vào một thư mục trong `src/features`, và dành thời gian xem phần `audio` vì biết sau này mình sẽ phải đụng vào đó.

### 2. Khó khăn và cách giải quyết

Phần trích dẫn là lần đầu mình sửa vào code chung của dự án nên lúc đầu mình hơi lo làm ảnh hưởng tới phần của bạn khác. Nhờ mỗi tính năng nằm trong thư mục riêng (`src/features/quotes`) và có test, mình yên tâm sửa hơn. Nhìn các bạn lần lượt đưa timer, tasks, notes, theme vào app, mình cũng thấy áp lực và cố đọc code kỹ để theo kịp.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 3
- Nhận xét: Mình đóng góp được ở phần trích dẫn dù chưa có pull request riêng, đồng thời làm quen được với cấu trúc dự án, đặc biệt là phần audio.

---

## Sprint 3: Website nhiều trang (13/11 – 17/11/2026)

### 1. Việc đã làm

Sprint này mình phải nhập viện điều trị nên không tham gia code được và không có pull request nào.

### 2. Khó khăn và cách giải quyết

Khó khăn lớn nhất của mình trong sprint này là sức khỏe, nên mình không thể làm việc cùng nhóm trong lúc điều trị. Mình thấy tiếc vì đúng lúc nhóm đang tách app thành website nhiều trang mà mình lại vắng mặt. Khi sức khỏe ổn hơn, mình nhận lại hai việc ở Sprint 4 (dữ liệu mẫu và nhạc YouTube) để theo kịp nhóm.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 1
- Nhận xét: Mình không tham gia được sprint này vì phải nhập viện điều trị.

---

## Sprint 4: Giám sát, hiệu năng, dữ liệu mẫu, giao diện mới (18/11 – 20/11/2026)

### 1. Việc đã làm

| Việc | Pull request / nơi lưu |
| :--- | :--- |
| Dữ liệu mẫu cho database ([#20](https://github.com/kitalikedev/FocusFlow/issues/20)) và trình điều khiển nhạc YouTube ([#37](https://github.com/kitalikedev/FocusFlow/issues/37)) | [#38](https://github.com/kitalikedev/FocusFlow/pull/38), [#41](https://github.com/kitalikedev/FocusFlow/pull/41) |

Sau sprint phải nghỉ để điều trị, đây là lúc mình quay lại làm việc, và mình khá vui vì cuối cùng cũng có sản phẩm của riêng mình.

- **Dữ liệu mẫu (PR #38, `supabase/seed.sql`):** mình viết file SQL điền dữ liệu cho một tài khoản demo gồm 10 task (có việc đã xong, chưa xong, có mức ưu tiên, hạn và nhãn), 1 ghi chú, 23 phiên tập trung trong 14 ngày và 3 theme đã lưu. Mình cố làm cho dữ liệu giống người thật dùng, ví dụ có một ngày nghỉ giữa chừng để streak hiển thị hợp lý. Lúc chạy xong và thấy trang Analytics có số liệu, mình thấy rất đã, vì nhìn trang web "có hồn" hẳn so với lúc trống trơn.
- **Trình điều khiển nhạc YouTube (PR #41):** mình làm component `MusicController` trên thanh điều khiển phía dưới workspace, gồm ảnh bìa, tên bài, nút bài trước, phát/tạm dừng, bài sau, thanh tua và thanh chỉnh âm lượng nhạc. Mình bổ sung vào kho âm thanh phần theo dõi vị trí phát và yêu cầu tua, rồi viết thêm 2 file test (`musicController.test.tsx`, `youtubeHost.test.tsx`).

### 2. Khó khăn và cách giải quyết

Nhóm gặp lỗi push thẳng lên `main` bị từ chối và hook Git LFS trong Codespace chặn push. Lúc đó mình khá bực vì code xong mà không đẩy lên được. Cuối cùng mình làm trên nhánh riêng rồi mở pull request, và gỡ các hook Git LFS không dùng. Ở phần dữ liệu mẫu, mình viết để chạy lại nhiều lần vẫn an toàn (dòng nào đã có thì bỏ qua, không sửa dữ liệu cũ) và nếu có lỗi thì không lưu gì cả. Mình làm vậy vì sợ lỡ tay chạy hai lần trước buổi demo làm hỏng database. Với nhạc YouTube, phần khó nhất là xử lý khi chưa có bài hoặc video không có độ dài, nên mình cho thanh tua tắt đi trong các trường hợp đó.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 4
- Nhận xét: Mình hoàn thành cả hai việc được giao bằng hai pull request, và dữ liệu mẫu giúp nhóm demo được hai trang động. Mình thấy mình làm nghiêm túc ở sprint này, nhưng cũng biết đóng góp rõ ràng của mình mới bắt đầu từ đây.

---

## Sprint 5: Hoàn thiện và nộp bài (21/11 – 26/11/2026)

### 1. Việc đã làm

Sprint này mình không có pull request mới. Phần việc của mình đã xong ở Sprint 4 nên mình theo dõi tiến độ README, biên bản họp, đánh giá chéo UI/UX và video demo của nhóm. Nhìn các bạn xử lý những việc cuối như Lighthouse, README, mình học được cách một dự án được gom lại để nộp.

### 2. Khó khăn và cách giải quyết

Mình không được giao phần việc mới nên chưa gặp khó khăn kỹ thuật cụ thể. Cái mình tự nhận ra là nếu chủ động hỏi nhóm còn việc gì cần đỡ, mình đã có thể đóng góp nhiều hơn ở những ngày cuối.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 1
- Nhận xét: Phần việc của mình đã xong ở Sprint 4, sprint này mình theo dõi tiến độ chung. Lần sau mình sẽ chủ động hỏi việc sớm hơn thay vì chờ được giao.

---

## Sprint 6: Sửa theo bản chấm thử (26/11 – 27/11/2026)

### 1. Việc đã làm

| Việc | Pull request / nơi lưu |
| :--- | :--- |
| Đánh giá UI/UX nhóm Let's Talk và đăng thành issue trên repo của nhóm đó ([#65](https://github.com/kitalikedev/FocusFlow/issues/65)) | [Let's Talk #71](https://github.com/nguyenbaphat59-del/Let-s-Talk-project/issues/71) |
| Dự họp rà soát lược đồ cơ sở dữ liệu tối 26/11 trên Discord (đủ 5 người) | Buổi 7 trong `docs/MEETING_NOTES.md` |

_(Bổ sung việc không có pull request: review, thử nghiệm, hỗ trợ bạn khác, trao đổi với các nhóm khác... Xóa dòng này khi viết xong.)_

### 2. Khó khăn và cách giải quyết

_(Viết vấn đề bạn gặp trong sprint này và cách bạn xử lý, bằng lời của bạn.)_

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): _(điền số)_
- Nhận xét: _(viết 1 – 2 câu bằng lời của bạn)_
