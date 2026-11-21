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

| Nhóm | Ngày | Đường dẫn bài đánh giá |
| :--- | :--- | :--- |
| Nhóm của Đạt | 21/11/2026 | Góp ý qua tin nhắn |
| | | |

### B.2 Quyết định

Cả nhóm đọc từng góp ý cùng nhau và quyết định có thay đổi dự án hay không.

| # | Góp ý | Từ nhóm | Quyết định | Đã thay đổi gì (pull request) hoặc lý do không làm |
| :-: | :--- | :--- | :---: | :--- |
| 1 | Bật Zen mode (phím F) rồi bấm nút "Exit Zen" mãi không thoát được, nút cứ nhảy liên tục | Nhóm của Đạt | Đang sửa | **Nguyên nhân:** mọi nút đều co lại 5 % khi bấm (`transform: scale(0.95)`). Nút "Exit Zen" được canh giữa màn hình cũng bằng `transform`, nên lúc nhấn chuột xuống nút mất phần canh giữa và nhảy sang phải nửa bề rộng của nó. Con trỏ rơi ra ngoài nút, lúc nhả chuột cú bấm không trúng nút nữa. **Cách sửa:** canh giữa nút mà không dùng `transform`, thêm test cho trường hợp này. Pull request: ____ |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |

### B.3 Trước và sau

Với mỗi thay đổi người dùng nhìn thấy được, thêm một ảnh chụp trước và một ảnh chụp sau.

| Thay đổi | Trước | Sau |
| :--- | :---: | :---: |
| | | |
