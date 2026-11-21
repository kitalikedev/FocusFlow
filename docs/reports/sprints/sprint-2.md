# Sprint 2: Tính năng workspace

| Mục | Nội dung |
| :--- | :--- |
| Thời gian | 07/11/2026 – 10/11/2026 |
| Mục tiêu | Duyệt wireframe workspace và hoàn thành các tính năng chính: timer, đồng hồ, âm thanh, công việc, ghi chú, thống kê, theme, trích dẫn. |
| Biên bản họp | [Issue #23](https://github.com/kitalikedev/FocusFlow/issues/23) |

## Việc đã hoàn thành

| # | Người | Việc | Pull request / nơi lưu |
| :-: | :--- | :--- | :--- |
| 1 | Nam | Timer engine chạy bằng Web Worker và âm báo cuối phiên | [#6](https://github.com/kitalikedev/FocusFlow/pull/6) |
| 2 | Nam | Cập nhật tài liệu sau Phase 2, lập kế hoạch Phase 3 | [#7](https://github.com/kitalikedev/FocusFlow/pull/7), [#8](https://github.com/kitalikedev/FocusFlow/pull/8) |
| 3 | Nam | Âm thanh nền, tasks, notes, analytics, thư viện theme | [#10](https://github.com/kitalikedev/FocusFlow/pull/10) |
| 4 | Nam | Tối ưu âm thanh và hiệu ứng chuyển động | [#11](https://github.com/kitalikedev/FocusFlow/pull/11) |
| 5 | Nam | Dọn tài liệu, đơn giản hóa bảng âm thanh và chia task cho thành viên | [#12](https://github.com/kitalikedev/FocusFlow/pull/12) |
| 6 | Nam | Tính năng trích dẫn | [#15](https://github.com/kitalikedev/FocusFlow/pull/15) |
| 7 | Nam | Lưu cài đặt lần lượt để hai lần lưu không ghi đè nhau | commit trên `main` |
| 8 | Dũng | Chế độ đồng hồ: vòng tròn, lật kiểu retro, bảng cài đặt đồng hồ, nút thoát Zen, kèm test | [#9](https://github.com/kitalikedev/FocusFlow/pull/9) |
| 9 | Phú | Kênh lofi và lofi radio trong bảng âm thanh, kèm test | [#13](https://github.com/kitalikedev/FocusFlow/pull/13) |
| 10 | Phú | Tối ưu hiển thị trích dẫn và đặt theme mặc định | [#16](https://github.com/kitalikedev/FocusFlow/pull/16) |
| 11 | Thảo Anh | Vẽ wireframe workspace bản máy tính và điện thoại (ảnh đưa lên repo ở PR #39) | `docs/wireframes/` |
| 12 | Thảo Anh | Theme Pixel Cyberpunk cho thư viện theme, kèm test | [#14](https://github.com/kitalikedev/FocusFlow/pull/14) |

**Hoạt động chung của nhóm:** Buổi họp 2: tổng kết Sprint 1, duyệt wireframe workspace, chia task theo từng thư mục tính năng.

## Kết quả

- Workspace đủ tính năng chính: 5 chế độ timer, 3 kiểu đồng hồ, Zen, âm thanh nền và lofi radio, tasks, notes, thống kê, 12 theme, trích dẫn.
- Mỗi tính năng nằm trong một thư mục riêng, gắn vào giao diện qua slot, nên các thành viên làm song song không sửa trùng file.

## Khó khăn và cách giải quyết

| Khó khăn | Cách giải quyết |
| :--- | :--- |
| Nhiều người cùng sửa giao diện dễ đụng file của nhau. | Mỗi tính năng một thư mục trong `src/features`, không import lẫn nhau; ESLint kiểm tra ranh giới này trên CI. |
| Đổi hai cài đặt liên tiếp thì lần lưu sau có thể ghi đè lần trước. | Lưu cài đặt lần lượt và luôn gửi kèm cả hai giá trị. |

## Việc chưa xong

Không.

## Kế hoạch sprint sau

Đối chiếu barem và chuyển app thành website nhiều trang.
