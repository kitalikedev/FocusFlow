# Báo cáo 5 sprint của nhóm

Nhóm làm việc trong 5 sprint, từ 05/11 đến 26/11/2026. Biên bản họp: [Issue #23](https://github.com/kitalikedev/FocusFlow/issues/23). Self-report của từng thành viên nằm trong [`self-reports/`](self-reports/).

| Sprint | Thời gian | Nội dung chính |
| :-: | :--- | :--- |
| 1 | 05/11 – 06/11/2026 | Đặc tả và nền tảng |
| 2 | 07/11 – 10/11/2026 | Tính năng workspace |
| 3 | 13/11 – 17/11/2026 | Website nhiều trang |
| 4 | 18/11 – 20/11/2026 | Giám sát, hiệu năng, dữ liệu mẫu, giao diện mới |
| 5 | 21/11 – 26/11/2026 | Hoàn thiện và nộp bài |

## Sprint 1: Đặc tả và nền tảng

**Thời gian:** 05/11 – 06/11/2026. **Mục tiêu:** Chốt đề tài và phân vai, viết đặc tả, dựng nền tảng kỹ thuật để các thành viên bắt đầu làm tính năng.

| Người | Việc | Pull request / nơi lưu |
| :--- | :--- | :--- |
| Nam | Đặc tả dự án (PRD, Architecture, ERD, API docs) và thiết kế database: 6 bảng, ràng buộc, trigger, Row Level Security, Storage | `docs/`, `supabase/migrations/` |
| Nam | Khung dự án (Vite, TypeScript, Tailwind, ESLint, CI), lớp dữ liệu, đăng nhập, chuyển dữ liệu khách sang tài khoản | [#1](https://github.com/kitalikedev/FocusFlow/pull/1), [#4](https://github.com/kitalikedev/FocusFlow/pull/4), [#5](https://github.com/kitalikedev/FocusFlow/pull/5) |

**Thảo luận và ý tưởng**

| Ý tưởng | Đề xuất | Quyết định |
| :--- | :--- | :--- |
| Làm giao diện đẹp, có hình nền và theme để người dùng tự chọn không khí làm việc | Thảo Anh | Giữ làm hướng chính của sản phẩm; về sau thành thư viện 12 theme. |
| Thêm âm thanh nền kiểu lofi để tạo không khí tập trung | Phú | Đưa vào kế hoạch tính năng âm thanh. |
| Dùng Supabase thay cho tự viết server | Nam | Thống nhất: có sẵn PostgreSQL, đăng nhập, Row Level Security và Storage, tiết kiệm thời gian. |

**Kết quả**

- Repo có CI chạy lint, kiểm tra kiểu, test và build cho mọi pull request.
- Khách dùng được app không cần tài khoản; đăng nhập thì dữ liệu đồng bộ lên Supabase.

**Khó khăn và cách giải quyết**

| Khó khăn | Cách giải quyết |
| :--- | :--- |
| Dữ liệu sửa khi offline có thể ghi đè bản mới hơn khi đồng bộ. | Trigger `handle_last_write_wins()` so sánh `updated_at`, bỏ qua bản cũ hơn. |
| Người dùng đã dùng app khi chưa đăng nhập sẽ mất dữ liệu khi tạo tài khoản. | Thêm bước hỏi có muốn chuyển dữ liệu khách vào tài khoản không. |

**Việc chưa xong:** Không.

## Sprint 2: Tính năng workspace

**Thời gian:** 07/11 – 10/11/2026. **Mục tiêu:** Duyệt wireframe workspace và hoàn thành các tính năng chính của workspace.

| Người | Việc | Pull request / nơi lưu |
| :--- | :--- | :--- |
| Nam | Tính năng workspace: timer và âm báo, âm thanh nền, tasks, notes, analytics, thư viện theme, trích dẫn, tối ưu âm thanh | [#6](https://github.com/kitalikedev/FocusFlow/pull/6), [#10](https://github.com/kitalikedev/FocusFlow/pull/10), [#11](https://github.com/kitalikedev/FocusFlow/pull/11), [#15](https://github.com/kitalikedev/FocusFlow/pull/15) |
| Nam | Kế hoạch từng phase, cập nhật tiến độ, dọn tài liệu và chia task cho thành viên | [#7](https://github.com/kitalikedev/FocusFlow/pull/7), [#8](https://github.com/kitalikedev/FocusFlow/pull/8), [#12](https://github.com/kitalikedev/FocusFlow/pull/12) |
| Dũng | Chế độ đồng hồ: vòng tròn, lật kiểu retro, bảng cài đặt, nút thoát Zen, kèm test | [#9](https://github.com/kitalikedev/FocusFlow/pull/9) |
| Phú | Lofi radio trong bảng âm thanh, tối ưu trích dẫn, theme mặc định | [#13](https://github.com/kitalikedev/FocusFlow/pull/13), [#16](https://github.com/kitalikedev/FocusFlow/pull/16) |
| Thảo Anh | Wireframe workspace (máy tính và điện thoại), theme Pixel Cyberpunk | [#14](https://github.com/kitalikedev/FocusFlow/pull/14), `docs/wireframes/` |

**Thảo luận và ý tưởng**

| Ý tưởng | Đề xuất | Quyết định |
| :--- | :--- | :--- |
| Bố cục workspace: đồng hồ ở giữa, công cụ ở hai góc dưới; trên điện thoại công cụ mở dạng bảng trượt từ dưới lên | Thảo Anh | Cả nhóm duyệt wireframe và làm theo. |
| Theme Pixel Cyberpunk để thư viện theme có phong cách riêng | Thảo Anh | Làm trong PR #14. |
| Lofi radio từ YouTube bên cạnh âm thanh tạo bằng code | Phú | Làm trong PR #13. |
| Cách hiển thị trích dẫn gọn hơn và chọn theme mặc định cho người mới | Phú | Làm trong PR #16. |

**Kết quả**

- Workspace đủ tính năng chính: 5 chế độ timer, 3 kiểu đồng hồ, Zen, âm thanh nền, lofi radio, tasks, notes, thống kê, 12 theme, trích dẫn.
- Mỗi tính năng nằm trong thư mục riêng, gắn vào giao diện qua slot, nên làm song song không sửa trùng file.

**Khó khăn và cách giải quyết**

| Khó khăn | Cách giải quyết |
| :--- | :--- |
| Nhiều người cùng sửa giao diện dễ đụng file của nhau. | Mỗi tính năng một thư mục trong `src/features`, không import lẫn nhau; ESLint kiểm tra ranh giới này trên CI. |
| Đổi hai cài đặt liên tiếp thì lần lưu sau có thể ghi đè lần trước. | Lưu cài đặt lần lượt, luôn gửi kèm cả hai giá trị. |

**Việc chưa xong:** Không.

## Sprint 3: Website nhiều trang

**Thời gian:** 13/11 – 17/11/2026. **Mục tiêu:** Đối chiếu barem, lập Milestone và Issue, tách app thành website nhiều trang có trang lấy dữ liệu từ database.

| Người | Việc | Pull request / nơi lưu |
| :--- | :--- | :--- |
| Nam | Tạo 5 Milestone và các Issue theo barem | GitHub ([#19](https://github.com/kitalikedev/FocusFlow/issues/19) – [#23](https://github.com/kitalikedev/FocusFlow/issues/23)) |
| Nam | Website nhiều trang: Analytics, About, landing page, menu cho điện thoại, trang xem trước theme | [#24](https://github.com/kitalikedev/FocusFlow/pull/24), [#27](https://github.com/kitalikedev/FocusFlow/pull/27), [#28](https://github.com/kitalikedev/FocusFlow/pull/28) |
| Dũng | Cập nhật README: tính năng, cài đặt, bảo mật, thành viên | [#18](https://github.com/kitalikedev/FocusFlow/pull/18) |

**Thảo luận và ý tưởng**

| Ý tưởng | Đề xuất | Quyết định |
| :--- | :--- | :--- |
| Tách app thành website nhiều trang để đạt yêu cầu ít nhất 3 trang của barem | Cả nhóm (Nam đề xuất) | Chuyển workspace sang `/app`, thêm các trang Home, Themes, Analytics, Tracking, About. |
| Menu điều hướng gọn, dùng menu 3 gạch trên điện thoại | Thảo Anh | Làm trong PR #27. |

**Kết quả**

- Website có Home, Themes, Analytics, Tracking (coming soon), About; workspace chuyển sang `/app`.
- Hai trang động: Analytics đọc `focus_sessions`, Themes đọc `saved_themes`.

**Khó khăn và cách giải quyết**

| Khó khăn | Cách giải quyết |
| :--- | :--- |
| Chuyển sang trang khác thì timer và nhạc bị dừng. | Workspace luôn chạy nền, chỉ ẩn đi khi xem các trang website. |
| Phím tắt của timer vẫn chạy khi đang ở trang website. | Phím tắt chỉ hoạt động ở `/app`. |

**Việc chưa xong:** Google Analytics, Sentry, Lighthouse, dữ liệu mẫu, wireframe các trang website (chuyển sang Sprint 4).

## Sprint 4: Giám sát, hiệu năng, dữ liệu mẫu, giao diện mới

**Thời gian:** 18/11 – 20/11/2026. **Mục tiêu:** Hoàn thành các phần còn lại của barem: Google Analytics, Sentry, Lighthouse, dữ liệu mẫu, wireframe và giao diện mới cho website.

| Người | Việc | Pull request / nơi lưu |
| :--- | :--- | :--- |
| Nam | Google Analytics 4 và Sentry ([#21](https://github.com/kitalikedev/FocusFlow/issues/21)) | [#29](https://github.com/kitalikedev/FocusFlow/pull/29) |
| Nam | Sửa lỗi Lighthouse trang chủ, sửa test tiêu đề không ổn định | [#33](https://github.com/kitalikedev/FocusFlow/pull/33), [#36](https://github.com/kitalikedev/FocusFlow/pull/36) |
| Nam | Website dùng theme đã chọn, ảnh chụp workspace, carousel ảnh demo | [#43](https://github.com/kitalikedev/FocusFlow/pull/43), [#44](https://github.com/kitalikedev/FocusFlow/pull/44) |
| Phú | Báo cáo Lighthouse lần 1 cho 3 trang, mobile và desktop ([#30](https://github.com/kitalikedev/FocusFlow/issues/30)) | [#35](https://github.com/kitalikedev/FocusFlow/pull/35) |
| Sanh | Dữ liệu mẫu cho database ([#20](https://github.com/kitalikedev/FocusFlow/issues/20)) và trình điều khiển nhạc YouTube ([#37](https://github.com/kitalikedev/FocusFlow/issues/37)) | [#38](https://github.com/kitalikedev/FocusFlow/pull/38), [#41](https://github.com/kitalikedev/FocusFlow/pull/41) |
| Thảo Anh | Wireframe các trang website ([#22](https://github.com/kitalikedev/FocusFlow/issues/22)) và lập trình giao diện website mới ([#34](https://github.com/kitalikedev/FocusFlow/issues/34)) | [#39](https://github.com/kitalikedev/FocusFlow/pull/39), [#42](https://github.com/kitalikedev/FocusFlow/pull/42) |
| Dũng | Thiết kế lại giao diện các trang website | [#40](https://github.com/kitalikedev/FocusFlow/pull/40) |

**Thảo luận và ý tưởng**

| Ý tưởng | Đề xuất | Quyết định |
| :--- | :--- | :--- |
| Vẽ lại wireframe các trang website; thêm nút sáng/tối, timer thử và mục liên hệ ở trang chủ | Thảo Anh | Làm trong PR #39 và #42. |
| Đo Lighthouse trên bản production và đo trong cửa sổ sạch, vì dữ liệu cũ và extension làm sai điểm | Phú | Làm trong báo cáo Lighthouse lần 1 và lần 2. |
| Cần dữ liệu mẫu để hai trang động có số liệu khi demo | Cả nhóm (Sanh làm) | Làm trong PR #38. |

**Kết quả**

- GA4 ghi nhận lượt xem từng trang; Sentry nhận lỗi từ bản production.
- `supabase/seed.sql` tạo 10 task, 1 ghi chú, 23 phiên tập trung trong 14 ngày và 3 theme cho tài khoản demo.
- Website có giao diện mới theo wireframe, đổi theo theme người dùng chọn.

**Khó khăn và cách giải quyết**

| Khó khăn | Cách giải quyết |
| :--- | :--- |
| Push thẳng lên `main` bị từ chối; hook Git LFS trong Codespace chặn push. | Làm trên nhánh riêng và mở PR; gỡ các hook Git LFS không dùng. |
| Test tiêu đề trang lúc đạt lúc không. | Viết lại test cho ổn định. |
| Performance trang chủ trên mobile chỉ 80 điểm. | Sửa các mục Lighthouse báo; phần còn lại làm ở Sprint 5. |

**Việc chưa xong:** Đo lại Lighthouse sau khi sửa; README theo mẫu nộp bài.

## Sprint 5: Hoàn thiện và nộp bài

**Thời gian:** 21/11 – 26/11/2026. **Mục tiêu:** Đo lại Lighthouse, sửa lỗi người dùng báo, hoàn thành README, biên bản họp, đánh giá chéo UI/UX và video demo.

| Người | Việc | Pull request / nơi lưu |
| :--- | :--- | :--- |
| Phú | Báo cáo Lighthouse lần 2 theo từng trang ([#30](https://github.com/kitalikedev/FocusFlow/issues/30)) | [#45](https://github.com/kitalikedev/FocusFlow/pull/45) |
| Nam | Sửa lofi radio, tách nhạc và âm thanh nền, làm mượt Zen, hiện Live cho stream, sửa ô mục tiêu, cải thiện Lighthouse | [#46](https://github.com/kitalikedev/FocusFlow/pull/46), [#47](https://github.com/kitalikedev/FocusFlow/pull/47) |
| Dũng | README theo mẫu nộp bài ([#31](https://github.com/kitalikedev/FocusFlow/issues/31)) và biên bản họp ([#23](https://github.com/kitalikedev/FocusFlow/issues/23)) | README.md |

**Thảo luận và ý tưởng**

| Ý tưởng | Đề xuất | Quyết định |
| :--- | :--- | :--- |
| Báo cáo Lighthouse lần 2 theo từng trang và từng thiết bị, ghi cách tái hiện số liệu | Phú | Làm trong PR #45. |
| Sửa nút Exit Zen của chế độ Zen theo góp ý của nhóm Đạt (nút nhảy khi bấm) | Nhóm Đạt (đánh giá chéo) | Ghi vào `docs/PEER_REVIEW.md`, sửa trong một PR riêng. |

**Kết quả**

- Lighthouse sau khi sửa (bản production): Performance 94 – 100; Accessibility, Best Practices, SEO đều 100 ở cả 3 trang.
- 60 file test, 640 test đạt. README có đủ 5 mục đề yêu cầu, kèm ERD và sơ đồ.

**Khó khăn và cách giải quyết**

| Khó khăn | Cách giải quyết |
| :--- | :--- |
| Lofi radio không phát vì YouTube chặn nhúng link stream cũ. | Đổi link mới; hàng chờ đã lưu tự chuyển link cũ sang link mới. |
| Stream trực tiếp hiện thời lượng là tổng số giờ đã phát. | Nhận ra stream trực tiếp và hiện chữ Live. |
| Điểm Lighthouse lần đo trước thấp do đo trong cửa sổ có sẵn dữ liệu và extension. | Đo lại bằng Lighthouse CLI trong trình duyệt sạch. |

**Việc chưa xong:** Điền sau khi xong: đánh giá chéo UI/UX (xem `docs/PEER_REVIEW.md`), video demo.
