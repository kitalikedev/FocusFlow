# Self-report: Lê Nguyễn Thảo Anh (24090028)

| Mục | Nội dung |
| :--- | :--- |
| Họ tên | Lê Nguyễn Thảo Anh |
| MSSV | 24090028 |
| GitHub | [AnhTe0301](https://github.com/AnhTe0301) |
| Vai trò | UI/UX Designer, Frontend Developer |
| Dự án | FocusFlow, nhóm 1, lớp 24SE1, môn Web Basic (CSB25022) |

---

## Sprint 1: Đặc tả và nền tảng (05/11 – 06/11/2026)

### 1. Việc đã làm

- Tham gia họp chốt đề tài và phân vai trong nhóm (biên bản họp [Issue #23](https://github.com/kitalikedev/FocusFlow/issues/23)).
- Đóng góp ý tưởng định hướng giao diện cho sản phẩm: thiết kế giao diện trực quan, có hình nền và thư viện theme để người dùng tự do lựa chọn không gian làm việc phù hợp (ý tưởng này được nhóm chốt làm hướng phát triển chính và mở rộng thành 12 theme ở các sprint sau).
- Tìm hiểu tài liệu đặc tả dự án (`PRD`, `Architecture`, `ERD`) và chuẩn bị môi trường làm việc.

### 2. Khó khăn và cách giải quyết

- Khó khăn lúc đầu là còn chưa thống nhất chủ đề, sau khi được thầy nhận xét cả nhóm đã chốt được chủ đề cho cả nhóm

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 5
- Nhận xét: Tham gia đầy đủ các buổi họp định hướng, đóng góp được ý tưởng 
---

## Sprint 2: Tính năng workspace (07/11 – 10/11/2026)

### 1. Việc đã làm

| Việc | Pull request / nơi lưu |
| :--- | :--- |
| Wireframe workspace (máy tính và điện thoại), theme Pixel Cyberpunk | [#14](https://github.com/kitalikedev/FocusFlow/pull/14), `docs/wireframes/` |

- Đề xuất bố cục tổng thể cho workspace: đặt đồng hồ ở trung tâm, gom các công cụ ở hai góc dưới màn hình trên máy tính; tối ưu trải nghiệm di động bằng cách chuyển các công cụ thành dạng bảng trượt từ dưới lên (bottom sheet). Được cả nhóm duyệt và triển khai theo wireframe.
- Đề xuất và trực tiếp thiết kế, lập trình theme **Pixel Cyberpunk** để đa dạng hóa phong cách cho thư viện theme của ứng dụng.

### 2. Khó khăn và cách giải quyết

- Khó khăn: Nhiều thành viên code giao diện song song dễ đụng file; bố cục cần hiển thị tốt trên cả desktop và mobile.
- Cách giải quyết: Chia module độc lập trong `src/features` theo quy tắc ESLint của nhóm và vẽ wireframe chi tiết cho từng loại màn hình trước khi code.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 5
- Nhận xét: Hoàn thành đúng tiến độ bộ wireframe cho 2 phiên bản pc và mobile, hiện thực thành công theme Pixel Cyberpunk.

---

## Sprint 3: Website nhiều trang (13/11 – 17/11/2026)

### 1. Việc đã làm

- Tham gia thảo luận cùng nhóm để chuyển đổi ứng dụng thành website nhiều trang (tách workspace sang `/app` và bổ sung các trang Home, Themes, Analytics, Tracking, About) nhằm đáp ứng tiêu chí của barem môn học.
- Đề xuất phương án thiết kế thanh điều hướng (menu) gọn gàng, tối ưu trải nghiệm trên thiết bị di động bằng menu 3 gạch (hamburger menu) — phương án này được áp dụng vào [PR #27](https://github.com/kitalikedev/FocusFlow/pull/27).

### 2. Khó khăn và cách giải quyết

- Khó khăn: Chuyển từ app một màn hình sang website nhiều trang dễ làm thanh điều hướng bị rối trên màn hình điện thoại nhỏ.
- Cách giải quyết: Tách riêng workspace sang `/app` và đề xuất gom gọn menu thành dạng 3 gạch (hamburger menu) trên mobile.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 5
- Nhận xét: Tích cực đóng góp ý tưởng cấu trúc website theo barem và đề xuất giải pháp điều hướng gọn gàng cho giao diện di động.

---

## Sprint 4: Giám sát, hiệu năng, dữ liệu mẫu, giao diện mới (18/11 – 20/11/2026)

### 1. Việc đã làm

| Việc | Pull request / nơi lưu |
| :--- | :--- |
| Wireframe các trang website ([#22](https://github.com/kitalikedev/FocusFlow/issues/22)) và lập trình giao diện website mới ([#34](https://github.com/kitalikedev/FocusFlow/issues/34)) | [#39](https://github.com/kitalikedev/FocusFlow/pull/39), [#42](https://github.com/kitalikedev/FocusFlow/pull/42) |

- Đề xuất và thực hiện vẽ lại wireframe cho toàn bộ các trang website; bổ sung các thành phần tăng tính tương tác ở trang chủ gồm: nút chuyển đổi giao diện sáng/tối, tính năng dùng thử timer trực tiếp và mục liên hệ.
- Lập trình giao diện website mới dựa trên bản wireframe đã thống nhất, đảm bảo giao diện đồng bộ và thay đổi linh hoạt theo theme người dùng lựa chọn.

### 2. Khó khăn và cách giải quyết

- Khó khăn: Repo chặn push thẳng lên `main` và hook Git LFS trong Codespace chặn lệnh push.
- Cách giải quyết: Tạo nhánh riêng, mở Pull Request để merge và gỡ bỏ các hook Git LFS không dùng.

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): 5
- Nhận xét: Đảm nhận khối lượng công việc lớn từ khâu lên ý tưởng, thiết kế wireframe đến trực tiếp lập trình giao diện mới cho toàn bộ website, giúp nâng cao tính thẩm mỹ và trải nghiệm tương tác của sản phẩm.

---

## Sprint 5: Hoàn thiện và nộp bài (21/11 – 26/11/2026)

### 1. Việc đã làm


### 2. Khó khăn và cách giải quyết


### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5):
- Nhận xét: 

---

## Sprint 6: Sửa theo bản chấm thử (26/11 – 27/11/2026)

### 1. Việc đã làm

| Việc | Pull request / nơi lưu |
| :--- | :--- |
| Đánh giá UI/UX nhóm PawPass và đăng thành issue trên repo của nhóm đó ([#65](https://github.com/kitalikedev/FocusFlow/issues/65)) | [PawPass #23](https://github.com/iceruychi-netizen/PawPass-Hosothucung/issues/23) |
| Dự họp rà soát lược đồ cơ sở dữ liệu tối 26/11 trên Discord (đủ 5 người) | Buổi 7 trong `docs/MEETING_NOTES.md` |

_(Bổ sung việc không có pull request: review, thử nghiệm, hỗ trợ bạn khác, trao đổi với các nhóm khác... Xóa dòng này khi viết xong.)_

### 2. Khó khăn và cách giải quyết

_(Viết vấn đề bạn gặp trong sprint này và cách bạn xử lý, bằng lời của bạn.)_

### 3. Tự đánh giá đóng góp

- Mức độ đóng góp (1 – 5): _(điền số)_
- Nhận xét: _(viết 1 – 2 câu bằng lời của bạn)_
