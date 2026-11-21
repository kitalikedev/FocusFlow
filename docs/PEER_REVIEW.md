# Đánh giá chéo UI/UX (Peer Review)

Tài liệu này ghi lại Task 5 của đồ án cuối kỳ:

- **Phần A:** các bài đánh giá nhóm chúng tôi viết cho hai nhóm khác (Task 5a).
- **Phần B:** các góp ý nhóm chúng tôi nhận được và cách nhóm xử lý (Task 5b).

Mỗi bài đánh giá dùng ba tiêu chí trong đề bài. Mỗi mục chấm từ 1 (kém) đến 5 (xuất sắc) kèm một nhận xét ngắn giải thích điểm.

| Tiêu chí | Nội dung đánh giá |
| :--- | :--- |
| Tính dễ dùng (Usability) | Đơn giản và rõ ràng, thông tin rõ ràng, điều hướng, phản hồi của hệ thống, hỗ trợ nhiều thiết bị |
| Thẩm mỹ (Aesthetics) | Thiết kế nhất quán, bố cục hợp lý, cách dùng màu sắc và hình ảnh |
| Thân thiện với người dùng (User-friendliness) | Dễ học, tiết kiệm thời gian, khả năng tùy chỉnh |

---

## Phần A. Các bài đánh giá nhóm đã viết

### A.1 Đánh giá nhóm: _tên nhóm_

| Mục | Nội dung |
| :--- | :--- |
| Dự án | _tên dự án và đường dẫn_ |
| Ngày đánh giá | _ngày_ |
| Người đánh giá | _các thành viên của nhóm tham gia_ |
| Thiết bị đã thử | _ví dụ: laptop 1440 px (Chrome), điện thoại 390 px (Safari)_ |

**Điểm số**

| Tiêu chí | Mục | Điểm (1-5) | Nhận xét |
| :--- | :--- | :---: | :--- |
| Dễ dùng | Đơn giản và rõ ràng | | |
| Dễ dùng | Thông tin rõ ràng | | |
| Dễ dùng | Điều hướng giữa các trang | | |
| Dễ dùng | Phản hồi của hệ thống (lỗi, thông báo thành công, đang tải) | | |
| Dễ dùng | Máy tính, máy tính bảng và điện thoại | | |
| Thẩm mỹ | Màu sắc, phông chữ và kiểu dáng nhất quán | | |
| Thẩm mỹ | Bố cục hợp lý, không rối mắt | | |
| Thẩm mỹ | Màu sắc và hình ảnh phù hợp nội dung | | |
| Thân thiện | Người mới hiểu cách dùng nhanh | | |
| Thân thiện | Hoàn thành việc với ít bước | | |
| Thân thiện | Có thể điều chỉnh theo người dùng | | |

**Điểm mạnh**

1. _điều làm tốt, kèm trang hoặc màn hình đã thấy_
2.
3.

**Đề xuất cải thiện**

| # | Vấn đề đã thấy | Ở đâu | Đề xuất | Mức ưu tiên |
| :-: | :--- | :--- | :--- | :---: |
| 1 | | | | Cao / Trung bình / Thấp |
| 2 | | | | |
| 3 | | | | |

**Trao đổi với nhóm được đánh giá**

- Ngày và kênh trao đổi: _ví dụ: 24/11, gọi Discord_
- Nhóm đó phản hồi về các đề xuất của chúng tôi: _tóm tắt_

### A.2 Đánh giá nhóm: _tên nhóm_

_Cấu trúc giống A.1._

---

## Phần B. Góp ý nhóm đã nhận

### B.1 Ai đã đánh giá nhóm chúng tôi

| Nhóm | Người đánh giá | Dự án của nhóm | Thiết bị | Ngày | Đường dẫn bài đánh giá |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Nhóm của Đạt | Đạt | Ứng dụng quản lý chi tiêu | Laptop của bạn Đạt | 21/11/2026 | File `review-sương-sương.pdf` (2 trang, 6 góp ý, kèm ảnh chụp) |
| | | | | | |

### B.2 Quyết định

Cả nhóm đọc từng góp ý cùng nhau và quyết định có thay đổi dự án hay không.

| # | Góp ý | Từ nhóm | Quyết định | Đã thay đổi gì (pull request) hoặc lý do không làm |
| :-: | :--- | :--- | :---: | :--- |
| 1 | Nhấn mũi tên trái/phải của carousel ở trang chủ thì nút "đi xuống", lệch chuột là không bấm được; nên để kiểu nhấp nháy khi nhấn | Nhóm của Đạt | Đã làm | **Nguyên nhân:** mọi nút khi bấm đều bị quy tắc chung `transform: scale(0.95)` thay thế toàn bộ `transform`, làm mất phần `translate` đang giữ nút ở giữa (nút carousel canh giữa theo chiều dọc), nên nút tụt xuống rồi con trỏ rơi ra ngoài nút. **Cách sửa:** dùng thuộc tính `scale` riêng (cùng phương án với góp ý 3) để hiệu ứng co nhẹ khi nhấn không còn đụng vào vị trí nút. Pull request: [#51](https://github.com/kitalikedev/FocusFlow/pull/51) (Phú) |
| 2 | Mở nhạc lofi mà không biết đã chạy được bao lâu; thanh "0:00 … Live" chỉ để làm cảnh | Nhóm của Đạt | Đã làm | **Nguyên nhân:** với stream trực tiếp, YouTube trả về thời lượng là số giờ stream đã phát nên nhóm đã đổi thành "0:00 … Live" (PR #47), nhưng thanh đó không có thông tin gì cho người nghe. **Cách sửa:** với stream trực tiếp, hiện chữ Live kèm **thời gian đã nghe** (đếm từ lúc bấm phát, dừng khi tạm dừng); ẩn thanh tua vì không tua được. Hiện thêm ảnh bìa trong danh sách phát. Pull request: [#51](https://github.com/kitalikedev/FocusFlow/pull/51) (Phú) |
| 3 | Bật Zen (phím F) rồi bấm nút "Exit Zen" mãi không thoát được, nút nhảy liên tục | Nhóm của Đạt | Đã làm | **Nguyên nhân:** cùng nguyên nhân với góp ý 1. Nút "Exit Zen" được canh giữa bằng `-translate-x-1/2`; lúc nhấn chuột xuống, quy tắc co nút làm mất phần canh giữa nên nút nhảy sang phải khoảng 50 px, con trỏ rơi ra ngoài nút và cú bấm không trúng. Đã tái hiện trên trình duyệt. **Cách sửa:** một thay đổi CSS chung cho cả 2 góp ý (dùng `scale` thay cho `transform`), thêm test. Pull request: [#51](https://github.com/kitalikedev/FocusFlow/pull/51) (Phú) |
| 4 | Sang trang khác vẫn nghe tiếng nhạc; nếu giữ như vậy thì ít nhất cần nút bật/tắt, chuyển bài, âm lượng ở trang khác, giống Spotify | Nhóm của Đạt | Đã làm | Nhạc chạy tiếp là chủ ý (workspace luôn chạy nền để timer và nhạc không ngắt khi xem các trang website), nhưng ở các trang website chưa có cách điều khiển. **Cách sửa:** thêm thanh nhạc nhỏ ở góc dưới các trang website khi có bài đang có trong danh sách phát: tạm dừng/phát, bài trước/sau, âm lượng, tên bài. Cần bổ sung một mục vào PRD. Pull request: [#51](https://github.com/kitalikedev/FocusFlow/pull/51) (Phú) |
| 5 | Nên có chỉnh tốc độ âm thanh cho lofi | Nhóm của Đạt | Không làm lúc này | Nhạc lofi trong app là stream trực tiếp của YouTube (chỉ phát đúng tốc độ thật, không đổi tốc độ được) và âm Lofi tạo bằng Web Audio là vòng lặp cố định; đổi tốc độ không phải tính năng trong PRD. Ghi vào hướng phát triển. |
| 6 | Với link YouTube: có danh sách link đánh dấu yêu thích hoặc lưu lại, có ảnh bìa thumbnail | Nhóm của Đạt | Làm một phần | **Ảnh bìa:** thêm vào danh sách phát (gộp với góp ý 2). **Danh sách yêu thích:** hiện danh sách phát đã được lưu trên máy của người dùng; yêu thích có đồng bộ giữa các thiết bị cần thêm bảng database và sửa PRD nên để vào hướng phát triển. |

### B.3 Trước và sau

Với mỗi thay đổi người dùng nhìn thấy được, thêm một ảnh chụp trước và một ảnh chụp sau.

| Thay đổi | Trước | Sau |
| :--- | :---: | :---: |
| | | |
