# Kế hoạch Triển khai: Phase 3 — Hoàn thiện tính năng (3B, 3C, 3D)

**Phiên bản:** 1.0 (đã duyệt, đã triển khai)
**Căn cứ:** `AGENTS.md`, `docs/PRD.md` (FR-13..29), `docs/ARCHITECTURE.md`, `docs/plans/phase-3.md`; tham khảo giao diện dự án cũ (VietTravelTimer) và Flocus
**Nền tảng:** `main` tại `aac02e7` (đã có 3A `clock-modes` và hàng đợi lưu cài đặt)

---

## 1. Cách làm

* **Một nhánh, một commit:** `feature/phase-3-complete`, toàn bộ tính năng trong một PR, Squash and merge thành một commit trên `main`.
* Bên trong vẫn làm theo 5 bước (Mục 4). Hết mỗi bước chạy `lint`, `typecheck`, `test`, `build` rồi mới sang bước sau, để lỗi không dồn đến cuối.
* Initial JS ≤ 200 KB gzip: mọi panel (Tasks, Note, Audio, Settings, Analytics) tải bằng `React.lazy`.
* Không thêm thư viện mới (đã có `lucide-react` cho icon).

---

## 2. Rút ra từ 2 video

| Điểm | Dự án cũ | Flocus | Áp dụng cho FocusFlow |
| :--- | :--- | :--- | :--- |
| Bố cục | Thanh trên + thanh nhạc to dưới đáy | Không có thanh; dock icon nhỏ ở 2 góc dưới | Theo Flocus: màn hình gần như chỉ còn nền + đồng hồ |
| Công cụ | Icon Task, Note, nhạc góc trên trái | Dock trái dưới: Tasks, Music, Notepad, mở thành thẻ nổi | Dock trái dưới: Tasks, Note, Âm thanh; mỗi cái là thẻ nổi, mở nhiều cái cùng lúc được |
| Góc phải dưới | — | Streak 🔥, chế độ, Settings, Fullscreen | Streak, Zen, Settings, Fullscreen |
| Theme | Popover chọn GIF/ảnh tĩnh, upload | Thư viện theme chia nhóm (Gradients, Abstract, Scenic, Nature, Urban, Interior, Animated), preview lớn | Thư viện theme chia nhóm + tự tạo theme (Mục 3) |
| Settings | Popover rời rạc | Một panel lớn bên phải, menu trái: Themes, Clock, Focus Timer, Stats… | Panel trượt bên phải cho Themes và Analytics; cài đặt timer ở bánh răng của viên nang |
| Nhạc | YouTube: dán link, prev/play/next, thanh tiến trình, volume | Panel Music | Thẻ Âm thanh: mixer 3 kênh + YouTube có hàng chờ, prev/next |
| Không lấy | Dán link URL ảnh nền (CSP chặn, PRD cấm URL ngoài), mã đồng bộ tự chế | Quotes (FR-31 mặc định tắt), Rooms, Share | — |

---

## 3. Hệ thống theme (trọng tâm "custom được nhiều theme")

**Một theme = một gói hoàn chỉnh:** nền + tokens (accent, viên nang kính, font, độ đậm, cỡ chữ) + hiệu ứng (`ThemeConfig` đã có sẵn đủ 3 phần). Chọn theme là đổi toàn bộ trong < 100 ms.

**Loại nền** (`wallpaperRef.type` đã có `preset`, `custom`, `solid`):

| Nhóm trong thư viện | Cách làm | Dung lượng |
| :--- | :--- | :--- |
| Colors & Gradients (~12) | CSS gradient | 0 KB |
| Abstract / Animated (~8) | Gradient chuyển động, mesh, hạt bằng CSS/SVG tự viết | Vài KB |
| Scenic / Pixel (tùy asset, xem T1) | Ảnh/GIF trong `public/wallpapers/` | ≤ 1.5 MB mỗi ảnh |
| Custom | Ảnh người dùng upload (FR-14) | ≤ 5 MB |
| Solid | Màu đơn sắc | 0 KB |

**Panel Themes trong Settings:**
1. Preview lớn của theme đang dùng.
2. **Theme Library**: lọc theo nhóm, 6 preset của PRD (Obsidian Minimal, Tokyo Fog, Midnight Indigo, Matcha Slate, Amber Wood, Nordic Night) đứng đầu.
3. **Customize**: chỉnh từng token, Live Preview, Apply / Revert (FR-25), contrast floor (FR-15), hiệu ứng (FR-26).
4. **My Themes**: lưu theme tự tạo (10 user / 3 guest), đổi tên, xóa (FR-27).
5. **Upload**: ảnh nền riêng (FR-14).

Mọi nền dùng chung một lớp `WallpaperLayer`; thêm ảnh mới chỉ cần thả file và thêm một dòng vào `lib/wallpaperCatalog.ts`.

---

## 4. Năm bước trong nhánh

| Bước | Phạm vi | Nội dung chính |
| :--- | :--- | :--- |
| **1. Core** | `src/core`, `src/shared`, `src/app/layout.tsx` | `web-audio.ts` xuất `getAudioContext()`, `getMasterGain()`; `useThemeStore.setConfig()` và `setEffects()`; `applyTheme` ghép `capsuleBg` với `capsuleOpacity`; `useSettingsStore.load()` nạp cả `activeTheme`; `useUiStore` thêm `isSettingsOpen`, `settingsTab`, cờ mở từng thẻ nổi; layout chuyển sang dock 2 góc dưới, HUD trên chỉ còn logo, chỉ báo sync và tài khoản |
| **2. Audio (3C)** | `src/features/audio` | FR-16: 3 kênh Rain, Brown Noise, Campfire sinh bằng Web Audio; FR-17: YouTube ẩn, hàng chờ ≤ 20 bài (localStorage), tên bài qua noembed, tự chuyển bài, prev/next; FR-18: master volume, play/pause toàn bộ, mute (M) tắt cả YouTube |
| **3. Productivity (3D)** | `src/features/productivity` | FR-19: Task CRUD, Priority, Due Date, Labels, tìm, lọc, sắp xếp; FR-20: Notepad tự lưu 500 ms; FR-29: ô "What do you want to focus on?" gõ tự do hoặc chọn task; FR-21: Analytics (7 cột tuần SVG, streak, phút theo intent, lịch sử); FR-22: drawer di động 85 vh với nút More |
| **4. Theme & Wallpaper (3B)** | `src/features/theme-wallpaper`, `public/` | Mục 3; FR-26 hiệu ứng canvas với `useFpsGuard`; 6 font WOFF2 trong `public/fonts/` |
| **5. Hoàn thiện** | Các feature trên | Không làm panel Settings gộp (các gói không được import chéo): góc phải dưới có nút Themes, Analytics, Zen; cài đặt timer vẫn ở nút bánh răng của viên nang; tài khoản ở góc phải trên. Kiểm tra Zen, responsive, bundle |

Mỗi gói vẫn không import chéo nhau (ESLint chặn). Gói khác mở panel của nhau qua cờ trong `useUiStore`.

---

## 5. Quyết định cần duyệt

| # | Vấn đề | Đề xuất |
| :--- | :--- | :--- |
| **L1** | Bố cục | Theo Flocus (Mục 2). PRD Mục 4.1 vẽ thanh HUD trên và thanh điều khiển đáy; đổi sang dock 2 góc, giữ nguyên mọi chức năng. Cập nhật PRD 4.1 lúc đồng bộ docs. |
| **L2** | Thẻ nổi trên desktop | Tasks bên trái, Note và Âm thanh xếp chồng phía trên dock; bấm lại icon thì đóng. Dưới 640 px dùng drawer. |
| **T1** | Ảnh nền Scenic/Pixel | Không tự lấy ảnh trên mạng khi chưa rõ bản quyền. Bản đầu có ~20 nền tự làm (gradient, abstract, animated) + upload. Nếu ảnh/GIF của dự án cũ là của bạn hoặc có giấy phép dùng tự do, gửi mình thư mục ảnh để đưa vào nhóm Scenic. |
| **T2** | Font | 6 font WOFF2 bộ Latin từ `@fontsource` (giấy phép OFL), chép vào `public/fonts/` kèm file giấy phép; font nào > 30 KB thì dùng bản một độ đậm. |
| **T3** | Kiểu đồng hồ trong theme | Theme không đổi kiểu đồng hồ (Minimal/Ring/Flip) và vị trí; hai thứ này nằm ở tab Đồng hồ. Theme có thể đặt viên nang trong suốt để ra kiểu chữ to trên nền như Flocus, trừ khi contrast floor bắt buộc (nền sáng). |
| **T4** | Lưu theme | Apply gọi một lần `useSettingsStore.update({ activeTheme, activeWallpaperId })`. |
| **A1** | Hàng chờ YouTube | Chỉ lưu localStorage (DB không có bảng queue). |
| **P1** | Analytics | Biểu đồ SVG tự vẽ, không thêm thư viện chart. |

## 6. Ngoài phạm vi

FR-23 (offline sync), FR-28 (PiP), FR-31 (quotes, huy hiệu), Import/Export theme JSON, 3 chế độ Home/Focus/Ambient riêng như Flocus (Zen + Mini Corner đã thay thế), Google OAuth, E2E. Đồng bộ `docs/` (PRD 4.1, PROGRESS) làm riêng sau khi merge.

## 7. Kiểm tay trước khi commit

1. Chọn 5 theme ở 3 nhóm khác nhau, F5 vẫn giữ; tự tạo theme, Revert, Apply, lưu, đổi tên, xóa; nền sáng thì độ đục bị khóa 50 %.
2. Upload ảnh (guest 1, user 3); file > 5 MB bị từ chối.
3. Bật 3 kênh âm thanh, chỉnh riêng từng kênh; thêm 2 link YouTube, bài 1 hết tự sang bài 2; M tắt tất cả.
4. Task: thêm, sửa, xóa, lọc, sắp xếp; chọn task làm intent; hết phiên thấy Analytics tăng.
5. Note F5 còn nguyên; hiệu ứng dừng khi đổi tab; điện thoại mở drawer đủ các mục.

## 8. Ghi chú triển khai

* Bố cục: HUD trên (logo, số phiên hôm nay, streak, sync, tài khoản, fullscreen); dock trái dưới (Tasks, Notepad, Sounds); thanh điều khiển âm thanh nhỏ ở giữa đáy, chỉ hiện khi có âm thanh; nút nhanh phải dưới (Themes, Analytics, Zen). Chấm chu kỳ chỉ còn trong viên nang đồng hồ.
* Core thêm: `FloatingPanel` (thẻ nổi / bottom sheet 85 vh), `SlideOver` (panel trượt / bottom sheet), `useMediaQuery`, `color.ts` (WCAG), `--panel-bg` (độ đục ≥ 80 %), `togglePanel` trong `useUiStore`, `setConfig` / `setEffects` / `setWallpaper` trong `useThemeStore`.
* Âm thanh nền không tự phát khi tải trang; kéo thanh trượt hoặc bấm Play mới phát. Âm lượng 3 kênh lưu vào `ambient_volumes` (debounce 500 ms), hàng chờ YouTube lưu `localStorage` (`focusflow_youtube_queue`, tối đa 20 bài).
* Mục tiêu tập trung lưu nháp ở `localStorage` (`focusflow_focus_intent`).
* 20 nền dựng sẵn bằng CSS; 6 font WOFF2 trong `public/fonts/` kèm `LICENSES.txt` (OFL 1.1).
* Initial JS ≈ 147 KB gzip; Tasks, Note, Analytics, Themes tải khi mở lần đầu.
