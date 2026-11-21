# Sprint 1: Đặc tả và nền tảng

| Mục | Nội dung |
| :--- | :--- |
| Thời gian | 05/11/2026 – 06/11/2026 |
| Mục tiêu | Chốt đề tài, phân vai, viết đặc tả và dựng nền tảng kỹ thuật (khung dự án, database, đăng nhập, lớp dữ liệu) để các thành viên có thể bắt đầu làm tính năng. |
| Biên bản họp | [Issue #23](https://github.com/kitalikedev/FocusFlow/issues/23) |

## Việc đã hoàn thành

| # | Người | Việc | Pull request / nơi lưu |
| :-: | :--- | :--- | :--- |
| 1 | Nam | Viết đặc tả dự án: PRD, Architecture, ERD, API docs và quy định cho agent | `docs/` |
| 2 | Nam | Thiết kế migration database: 6 bảng, ràng buộc, trigger, Row Level Security, bucket Storage | `supabase/migrations/` |
| 3 | Nam | Dựng khung dự án Phase 0: Vite, TypeScript, Tailwind, ESLint, CI trên GitHub Actions | [#1](https://github.com/kitalikedev/FocusFlow/pull/1) |
| 4 | Nam | Cập nhật tiến độ sau Phase 0 | [#4](https://github.com/kitalikedev/FocusFlow/pull/4) |
| 5 | Nam | Lớp dữ liệu, đăng nhập Supabase, chuyển dữ liệu khách sang tài khoản | [#5](https://github.com/kitalikedev/FocusFlow/pull/5) |

**Hoạt động chung của nhóm:** Cả nhóm họp khởi động, chọn đề tài FocusFlow, chọn công nghệ và phân vai (Buổi họp 1). Các thành viên đọc đặc tả và chuẩn bị môi trường GitHub Codespaces.

## Kết quả

- Repo có CI chạy lint, kiểm tra kiểu, test và build cho mọi pull request.
- Database có đủ 6 bảng với Row Level Security; khách dùng được app không cần tài khoản, đăng nhập thì dữ liệu đồng bộ lên Supabase.

## Khó khăn và cách giải quyết

| Khó khăn | Cách giải quyết |
| :--- | :--- |
| Dữ liệu sửa khi offline có thể ghi đè bản mới hơn khi đồng bộ. | Trigger `handle_last_write_wins()` so sánh `updated_at` và bỏ qua bản cũ hơn. |
| Người dùng đã dùng app khi chưa đăng nhập sẽ mất dữ liệu khi tạo tài khoản. | Thêm bước hỏi người dùng có muốn chuyển dữ liệu khách vào tài khoản không. |

## Việc chưa xong

Không.

## Kế hoạch sprint sau

Làm các tính năng của workspace, mỗi người một phần.
