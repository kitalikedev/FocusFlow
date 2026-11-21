# Sprint 5: Hoàn thiện và nộp bài

| Mục | Nội dung |
| :--- | :--- |
| Thời gian | 21/11/2026 – 26/11/2026 |
| Mục tiêu | Đo lại Lighthouse, sửa các lỗi người dùng báo, hoàn thành README theo mẫu nộp bài, biên bản họp, đánh giá chéo UI/UX và video demo. |
| Biên bản họp | [Issue #23](https://github.com/kitalikedev/FocusFlow/issues/23) |

## Việc đã hoàn thành

| # | Người | Việc | Pull request / nơi lưu |
| :-: | :--- | :--- | :--- |
| 1 | Phú | Báo cáo Lighthouse lần 2 theo từng trang ([#30](https://github.com/kitalikedev/FocusFlow/issues/30)) | [#45](https://github.com/kitalikedev/FocusFlow/pull/45) |
| 2 | Nam | Sửa lofi radio bị chặn nhúng, tách nhạc và âm thanh nền, làm mượt Zen, thêm kiểu Zen chỉ hiện giờ, cải thiện Lighthouse | [#46](https://github.com/kitalikedev/FocusFlow/pull/46) |
| 3 | Nam | Hiện Live cho stream trực tiếp, giữ ô mục tiêu đủ rộng khi đồng hồ ở góc | [#47](https://github.com/kitalikedev/FocusFlow/pull/47) |
| 4 | Dũng | Báo cáo README theo mẫu nộp bài: cách chạy, công cụ, tính năng và ảnh, ERD, sơ đồ ([#31](https://github.com/kitalikedev/FocusFlow/issues/31)) | README.md |
| 5 | Dũng | Biên bản họp và phân vai ([#23](https://github.com/kitalikedev/FocusFlow/issues/23)) | [#23](https://github.com/kitalikedev/FocusFlow/issues/23) |

**Hoạt động chung của nhóm:** Buổi họp 5: tổng kết Sprint 4, thống nhất hồ sơ nộp bài, chia việc đánh giá chéo, video và self-report. Cả nhóm đánh giá UI/UX cho 2 nhóm khác và sửa theo góp ý nhận được (ghi trong `docs/PEER_REVIEW.md`).

## Kết quả

- Lighthouse sau khi sửa (bản build production): Performance 94 – 100, Accessibility, Best Practices và SEO đều 100 ở cả 3 trang.
- 60 file test, 640 test đều đạt.
- README có đủ 5 mục đề yêu cầu, kèm ERD và các sơ đồ.

## Khó khăn và cách giải quyết

| Khó khăn | Cách giải quyết |
| :--- | :--- |
| Lofi radio không phát được vì YouTube chặn nhúng link stream cũ. | Đổi sang link mới; hàng chờ đã lưu tự chuyển link cũ sang link mới. |
| Stream trực tiếp hiện thời lượng là tổng số giờ đã phát (kiểu 4373:55:37). | Nhận ra stream trực tiếp và hiện chữ Live thay cho thanh tua. |
| Điểm Lighthouse lần đo trước thấp do đo trong cửa sổ có sẵn dữ liệu và extension. | Đo lại bằng Lighthouse CLI trong trình duyệt sạch. |

## Việc chưa xong

Điền sau khi xong: đánh giá chéo, video demo.

## Kế hoạch sprint sau

Không (sprint cuối).
