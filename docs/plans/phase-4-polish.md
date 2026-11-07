# Kế hoạch Triển khai: Phase 4 — Tối ưu, Âm thanh, Animation

**Phiên bản:** 1.0 (đã triển khai, PR #11)
**Nền tảng:** `main` tại `6470de4` (đã có đủ Phase 3)

---

## 1. Kết quả quét dự án

| # | Phát hiện | Xử lý |
| :--- | :--- | :--- |
| O1 | Nền "Animated" chạy bằng `background-position`, trình duyệt vẽ lại cả màn hình mỗi khung hình | Lớp lớn hơn màn hình, di chuyển bằng `transform` (GPU lo) |
| O3 | State thừa từ thiết kế cũ: `isMobileDrawerOpen`, `activeDrawerTab`, `closeAllModals`, `cycleDots` trong `useHud` | Đã xóa, cập nhật contracts và test |
| O4 | `useMediaQuery` và hằng `(max-width: 639px)` lặp ở 3 chỗ | Dùng chung bản trong `core/ui` |
| O5 | `DEFAULT_WALLPAPER_ID = 'preset-lofi-cafe'` không có trong catalog | Giữ nguyên: đó là mặc định của cột database (ERD), còn nền hiển thị lấy từ `activeTheme.wallpaperRef` |
| O6 | PRD 4.1, ARCHITECTURE, PROGRESS lệch code | Đồng bộ trong PR docs riêng |
| O7 | `npm audit` 12 lỗ hổng, **chỉ ở công cụ dev** (bản người dùng chạy có 0) | PR riêng, cần Node 22 trước vì Vite 8 / Vitest 5 đòi Node ≥ 20.19 |

## 2. Âm thanh

| # | Nội dung |
| :--- | :--- |
| S1 | Mọi kênh lên/xuống âm lượng mượt trong khoảng 1,5 giây (bật, tắt, Play/Pause, kéo thanh trượt), hết tiếng "bụp"; mute cũng mượt |
| S2 | Rain đổi từ noise trắng sang noise hồng, hạ tần số lọc, dao động chậm hơn, thang gain 0,55 |
| S3 | Danh sách kênh `CHANNEL_DEFS` (`features/audio/lib/channelDefs.ts`): `ambientEngine` và thẻ Sounds đọc từ đó; âm lượng 3 kênh lưu cùng tài khoản (cột `volume_rain`, `volume_brown_noise`, `volume_campfire`) |

## 3. Animation

Bộ keyframes dùng chung trong `tailwind.config.ts` và `core/ui`; tất cả tắt khi `prefers-reduced-motion`.

| Thành phần | Hiệu ứng |
| :--- | :--- |
| Nút, tab, icon dock | Nhấn co nhẹ, chuyển màu mượt |
| Thẻ Tasks / Note / Sounds | Trượt lên + mờ vào; đóng thì mờ ra (`usePresence` giữ thẻ thêm 180 ms) |
| Panel Themes / Analytics | Trượt từ phải (desktop) hoặc từ dưới (điện thoại), nền tối mờ dần |
| Thẻ theme, ô nền | Hover nâng nhẹ; chọn thì dấu tích "pop" |
| Task | Trượt vào khi thêm; dấu tích hoàn thành "pop" |
| Đồng hồ | Đổi chế độ hoặc kiểu thì mờ chuyển |
| Toast, danh sách chọn task | Mờ + trượt nhẹ |
| Biểu đồ Analytics | Cột mọc lên từ đáy |

## 4. Hiệu ứng theme

`EffectsConfig` có thêm `scanlines` và `glow` (0 đến 100). Biến `--clock-glow` do `applyTheme` đặt theo mức Glow và màu nhấn; chữ đồng hồ đọc `text-shadow: var(--clock-glow, none)`.

## 5. Ghi chú triển khai

* Nền động: `inset: -15%`, `will-change: transform`; bộ lọc độ sáng và mờ nằm ở lớp ngoài.
* `rampGain()` trong `web-audio.ts`: hằng số thời gian 0,5 s cho kênh và 0,08 s cho master và mute; kênh tắt thì mờ dần rồi 2 giây sau mới giải phóng node.
* `asyncUtilTimeout` 4 giây trong `src/test/setup.ts` để test không hỏng khi máy chậm.
* Thư mục `src/features/quotes/` và `QuoteSlot` (góc phải trên, dưới HUD) là khung cho FR-31, hiện trả về `null`.

## 6. Đặc tả việc còn lại

Quy tắc chung: mỗi việc chỉ sửa trong thư mục được nêu; không import chéo giữa các feature (ESLint chặn); màu và font dùng token (`var(--...)`, class `accent`, `capsule`); tắt animation khi `prefers-reduced-motion`; mỗi việc có test và qua `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.

### Việc 1 — Danh ngôn ngẫu nhiên (FR-31)

* **Thư mục:** `src/features/quotes/` (đã có `QuoteDisplay` trả về `null` và `QuoteSlot` ở góc phải trên, dưới HUD).
* **Hành vi:**
  1. Mặc định tắt: chưa bật thì không có câu chữ nào trên màn hình, chỉ có một icon nhỏ để bật (AC-31.1).
  2. Bật lên thì hiện một câu ngẫu nhiên (khoảng 40 câu ngắn, mỗi câu dưới 90 ký tự, có thể kèm tác giả); nút đổi câu không bao giờ trả lại đúng câu đang hiện; nút tắt.
  3. Chỉ nhớ lựa chọn bật/tắt (`localStorage`, khóa `focusflow_quotes`), câu thì mới mỗi lần mở trang.
  4. Ẩn hoàn toàn trong Zen; câu mới mờ dần vào (`animate-fade-in`).
* **Test:** danh sách (không trùng, độ dài), chọn câu (không lặp, trong khoảng), mặc định không có câu, bật/đổi/tắt, tác giả, Zen, lưu lựa chọn và dữ liệu hỏng.

### Việc 2 — Âm lượng riêng cho nhạc YouTube

* **Thư mục:** `src/features/audio/`.
* **Hành vi:**
  1. Thanh trượt "Music" trong mục YouTube của thẻ Sounds, 0 đến 100 %, mặc định 70 %.
  2. Âm lượng thực của player YouTube = Music × Master; kéo Music không làm đổi 3 kênh ambient và ngược lại.
  3. Lưu trên thiết bị (`localStorage`, khóa `focusflow_audio_levels`, trường `youtube`), không đổi database; dữ liệu hỏng thì về mặc định.
* **Test:** thanh trượt đổi đúng giá trị trong store, lưu và đọc lại, dữ liệu hỏng, âm lượng gửi cho player.

### Việc 3 — Kênh nhạc lofi tự sinh và lofi radio

* **Thư mục:** `src/features/audio/`. Làm sau Việc 2 vì cùng sửa `useAudioStore.ts` và `SoundPanel.tsx`.
* **Hành vi:**
  1. Thêm kênh **Lofi** vào `CHANNEL_DEFS` (`lib/channelDefs.ts`), sinh hoàn toàn bằng Web Audio, không tải file: vòng hợp âm piano điện mềm khoảng 75 BPM, trống nhẹ lệch nhịp (kick, snare, hi-hat), tiếng đĩa than rè nhỏ; có thanh trượt âm lượng riêng như các kênh khác, đi qua cùng cơ chế mờ dần và Master.
  2. Âm lượng kênh Lofi lưu trên thiết bị (`focusflow_audio_levels`), vì database không có cột cho kênh này.
  3. Mục **Lofi radio** trong thẻ Sounds: danh sách vài đường dẫn YouTube dựng sẵn (nằm trong một file riêng, dễ đổi); bấm một mục thì thêm vào hàng chờ như dán link.
  4. Kênh tắt hoặc Pause thì giải phóng hết node, không tốn CPU lúc im lặng.
* **Test:** bộ lập lịch nốt (đúng nhịp, đúng hợp âm), kênh bật/tắt tạo và giải phóng đúng số node, lưu âm lượng, bấm mục radio thêm đúng vào hàng chờ.

### Việc 4 — Theme Pixel và Cyberpunk

* **Thư mục:** `src/features/theme-wallpaper/`.
* **Hành vi:**
  1. Hai nhóm nền mới trong thư viện: **Pixel** (4 nền) và **Cyberpunk** (4 nền), vẽ bằng SVG sinh từ code, nét pixel sắc (`shape-rendering: crispEdges`), mỗi nền có độ sáng tính sẵn trong catalog.
  2. 5 theme dựng sẵn mới: Cyberpunk Neon, Synthwave, Pixel Night, Retro Terminal, Vaporwave (màu nhấn, font trong 6 font đã có, nền và hiệu ứng riêng); vẫn qua các luật dễ đọc của FR-15.
  3. Hiệu ứng **Scanlines** (sọc ngang kiểu màn CRT, lớp tĩnh) trong `EffectsLayer` và thanh trượt trong tab Customize, cùng thanh trượt **Glow** (biến `--clock-glow` đã có sẵn trong core).
  4. Hiệu ứng tắt hoặc tĩnh khi giảm chuyển động.
* **Test:** catalog (id duy nhất, độ sáng hợp lệ, nhóm mới), 5 preset hợp lệ (nền và font tồn tại, capsule đủ tối), Scanlines hiện/ẩn theo mức, thanh trượt Scanlines và Glow cập nhật store.

### Ngoài các việc trên

Nâng toolchain (O7), FR-23 (offline sync), FR-28 (PiP), huy hiệu cục bộ (FR-31 phần achievement), Google OAuth, E2E.
