# Sprint 3: Website nhiều trang

| Mục | Nội dung |
| :--- | :--- |
| Thời gian | 13/11/2026 – 17/11/2026 |
| Mục tiêu | Đối chiếu barem, lập Milestone và Issue trên GitHub, tách app thành website nhiều trang có trang động lấy dữ liệu từ database. |
| Biên bản họp | [Issue #23](https://github.com/kitalikedev/FocusFlow/issues/23) |

## Việc đã hoàn thành

| # | Người | Việc | Pull request / nơi lưu |
| :-: | :--- | :--- | :--- |
| 1 | Nam | Tạo 5 Milestone và các Issue theo barem ([#19](https://github.com/kitalikedev/FocusFlow/issues/19) – [#23](https://github.com/kitalikedev/FocusFlow/issues/23), [#26](https://github.com/kitalikedev/FocusFlow/issues/26)) | GitHub |
| 2 | Nam | Các trang Analytics và About, điều hướng giữa các trang ([#19](https://github.com/kitalikedev/FocusFlow/issues/19)) | [#24](https://github.com/kitalikedev/FocusFlow/pull/24) |
| 3 | Nam | Landing page và menu website, menu 3 gạch trên điện thoại ([#26](https://github.com/kitalikedev/FocusFlow/issues/26)) | [#27](https://github.com/kitalikedev/FocusFlow/pull/27) |
| 4 | Nam | Thay trang Tasks bằng trang xem trước 12 theme và theme đã lưu | [#28](https://github.com/kitalikedev/FocusFlow/pull/28) |
| 5 | Dũng | Cập nhật README: tính năng, cài đặt, bảo mật, thành viên | [#18](https://github.com/kitalikedev/FocusFlow/pull/18) |

**Hoạt động chung của nhóm:** Buổi họp 3: tổng kết Sprint 2, đối chiếu barem, thống nhất cấu trúc website và cách quản lý việc bằng Milestone và Issue.

## Kết quả

- Website có các trang Home, Themes, Analytics, Tracking (coming soon), About; workspace chuyển sang `/app`.
- Hai trang động: Analytics đọc bảng `focus_sessions`, Themes đọc bảng `saved_themes`.
- Mọi việc còn lại đều có Issue, người nhận và Milestone.

## Khó khăn và cách giải quyết

| Khó khăn | Cách giải quyết |
| :--- | :--- |
| Chuyển sang trang khác thì timer và nhạc bị dừng. | Workspace luôn được giữ chạy nền và chỉ ẩn đi khi người dùng xem các trang website. |
| Phím tắt của timer (Space, F, M) vẫn chạy khi đang ở trang website. | Phím tắt chỉ hoạt động ở `/app`. |

## Việc chưa xong

Google Analytics, Sentry, Lighthouse, dữ liệu mẫu và wireframe các trang website chuyển sang Sprint 4.

## Kế hoạch sprint sau

Giám sát (GA, Sentry), hiệu năng (Lighthouse), dữ liệu mẫu, giao diện website mới.
