# Sprint 4: Giám sát, hiệu năng, dữ liệu mẫu và giao diện mới

| Mục | Nội dung |
| :--- | :--- |
| Thời gian | 18/11/2026 – 20/11/2026 |
| Mục tiêu | Hoàn thành các phần còn lại của barem: Google Analytics và Sentry, đo Lighthouse, dữ liệu mẫu cho database, wireframe và giao diện mới cho website. |
| Biên bản họp | [Issue #23](https://github.com/kitalikedev/FocusFlow/issues/23) |

## Việc đã hoàn thành

| # | Người | Việc | Pull request / nơi lưu |
| :-: | :--- | :--- | :--- |
| 1 | Nam | Google Analytics 4 và ghi lỗi bằng Sentry ([#21](https://github.com/kitalikedev/FocusFlow/issues/21)) | [#29](https://github.com/kitalikedev/FocusFlow/pull/29) |
| 2 | Nam | Sửa test tiêu đề trang chạy không ổn định | [#33](https://github.com/kitalikedev/FocusFlow/pull/33) |
| 3 | Nam | Sửa lỗi Lighthouse trên trang chủ: cho phép zoom, robots.txt, favicon, ưu tiên ảnh | [#36](https://github.com/kitalikedev/FocusFlow/pull/36) |
| 4 | Nam | Website dùng theme đã chọn, thêm ảnh chụp workspace | [#43](https://github.com/kitalikedev/FocusFlow/pull/43) |
| 5 | Nam | Carousel ảnh demo, ảnh theme trên trang Themes | [#44](https://github.com/kitalikedev/FocusFlow/pull/44) |
| 6 | Phú | Báo cáo Lighthouse lần 1 cho 3 trang, mobile và desktop ([#30](https://github.com/kitalikedev/FocusFlow/issues/30)) | [#35](https://github.com/kitalikedev/FocusFlow/pull/35) |
| 7 | Sanh | Dữ liệu mẫu cho database để demo ([#20](https://github.com/kitalikedev/FocusFlow/issues/20)) | [#38](https://github.com/kitalikedev/FocusFlow/pull/38) |
| 8 | Sanh | Trình điều khiển nhạc YouTube: ảnh bìa, tên bài, thanh tua, bài trước và sau, âm lượng riêng ([#37](https://github.com/kitalikedev/FocusFlow/issues/37)) | [#41](https://github.com/kitalikedev/FocusFlow/pull/41) |
| 9 | Thảo Anh | Wireframe các trang website mới, đưa toàn bộ wireframe lên repo ([#22](https://github.com/kitalikedev/FocusFlow/issues/22)) | [#39](https://github.com/kitalikedev/FocusFlow/pull/39) |
| 10 | Thảo Anh | Lập trình giao diện website mới: nút sáng/tối, timer thử, các trang Home, Themes, Analytics, Tracking, About ([#34](https://github.com/kitalikedev/FocusFlow/issues/34)) | [#42](https://github.com/kitalikedev/FocusFlow/pull/42) |
| 11 | Dũng | Thiết kế lại giao diện các trang website | [#40](https://github.com/kitalikedev/FocusFlow/pull/40) |

**Hoạt động chung của nhóm:** Buổi họp 4: tổng kết Sprint 3, chia việc theo các phần còn lại của barem, thống nhất luôn làm trên nhánh riêng và mở PR.

## Kết quả

- GA4 ghi nhận lượt xem từng trang; Sentry nhận lỗi từ bản production.
- Lighthouse lần 1 có số liệu cho 3 trang; trang chủ đã được sửa một phần.
- `supabase/seed.sql` tạo 10 task, 1 ghi chú, 23 phiên tập trung trong 14 ngày và 3 theme cho một tài khoản demo.
- Website có giao diện mới theo wireframe, tự đổi theo theme người dùng chọn.

## Khó khăn và cách giải quyết

| Khó khăn | Cách giải quyết |
| :--- | :--- |
| Thành viên push thẳng lên `main` bị từ chối, và hook Git LFS trong Codespace chặn push. | Làm trên nhánh riêng, mở PR; gỡ các hook Git LFS không dùng. |
| Test tiêu đề trang lúc đạt lúc không. | Viết lại test cho ổn định (PR #33). |
| Performance trang chủ trên mobile chỉ 80 điểm. | Sửa các mục Lighthouse báo; phần còn lại chuyển sang Sprint 5. |

## Việc chưa xong

Đo lại Lighthouse sau khi sửa; README theo mẫu nộp bài.

## Kế hoạch sprint sau

Lighthouse lần 2, sửa lỗi người dùng báo, hồ sơ nộp bài và đánh giá chéo.
