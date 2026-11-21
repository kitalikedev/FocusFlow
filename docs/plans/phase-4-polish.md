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

## 7. Giao diện website mặc theme

Bản thiết kế lại các trang website (`/`, `/themes`, `/analytics`, `/tracking`, `/about`) sau PR #42. Workspace `/app` không đổi.

| # | Nội dung | Vị trí |
| :--- | :--- | :--- |
| W1 | Website "mặc" một theme dựng sẵn: `SiteLayout` đặt `--theme-bg`, `--theme-accent`, `--theme-on-accent`, `--theme-clock` từ token của theme; mọi màu `site-*` trộn từ đó bằng `color-mix`, light mode làm tối màu nhấn để chữ vẫn dễ đọc | `src/app/site/site.css`, `SiteLayout.tsx` |
| W2 | Chọn theme bằng 12 chấm màu ở trang chủ hoặc ô ở `/themes`; lựa chọn lưu ở `localStorage` (`focusflow-site-preset`) và chia sẻ qua `SitePresetContext`; không đổi theme của workspace | `src/core/ui/siteTheme.ts`, `src/app/site/ThemeSwitcher.tsx`, `useSiteTheme.ts` |
| W3 | Đổi theme hoặc light/dark thì màu mới lan ra thành hình tròn từ nút vừa bấm (View Transitions API); trình duyệt không hỗ trợ hoặc bật giảm chuyển động thì đổi ngay | `spreadThemeChange` trong `siteTheme.ts` |
| W4 | Ảnh workspace thật: 12 ảnh theo theme, 3 kiểu đồng hồ, Sounds, Tasks và Notes, thư viện theme, 3 hiệu ứng; WebP 1440 px và bản 720 px cho điện thoại, có `width`/`height`; chỉ ảnh đầu trang tải ngay, còn lại `loading="lazy"` | `public/images/home/` |
| W5 | Ảnh demo dạng carousel: ảnh hiện tại ở giữa, ảnh trước và sau mờ hơn ở hai bên, nút mũi tên trái phải, vuốt hoặc kéo, phím mũi tên, chấm tiến trình; tự chuyển mỗi 5 giây, dừng khi rê chuột hoặc focus bàn phím. Cột tính năng hẹp dùng kiểu một ảnh trượt ngang (`variant="single"`). Chỉ ảnh hiện tại và hai ảnh kề nằm trong trang | `src/app/site/Slideshow.tsx` |
| W9 | Chấm chọn theme: nền tròn màu nền của theme, chấm sáng màu nhấn ở giữa, gom trong một khung bo tròn; chấm đang chọn có viền màu nhấn. Ô theme trên `/themes` dùng ảnh chụp workspace của theme đó (theme đã lưu vẫn vẽ bằng màu và font) | `ThemeSwitcher.tsx`, `ThemesPage.tsx` |
| W8 | Khối "Make it fully yours with your own picture or GIF" ngay dưới ảnh demo: ảnh workspace dùng một hình trắng đen tải lên làm nền, kèm ảnh gốc nhỏ nghiêng ở góc (`custom-picture`, `custom-original`); nêu giới hạn JPG, PNG, WebP, GIF tối đa 5 MB | `HomePage.tsx`, `public/images/home/` |
| W6 | Animation: chữ tiêu đề hiện lần lượt khi mở trang, các khối trượt vào khi cuộn tới, chữ số đồng hồ thử rơi vào khi đổi, font đồng hồ mờ chuyển khi đổi theme, hàng ảnh theme chạy ngang, khung ảnh nâng lên và phát sáng theo màu theme khi rê chuột; tất cả tắt khi `prefers-reduced-motion` | `site.css`, `src/core/ui/Reveal.tsx` |
| W7 | Test: chọn theme đổi cả website và được nhớ, ảnh workspace theo theme, trang Themes đổi theme website mà không đổi theme workspace | `src/app/__tests__/routing.test.tsx`, `ThemesPage.test.tsx` |

Ảnh được chụp từ bản chạy ở máy, chế độ khách với dữ liệu mẫu (không có dữ liệu thật). Khi giao diện workspace đổi thì chụp lại cho khớp.

## 8. Sửa âm thanh, Zen và Lighthouse (nhánh `fix/audio-zen-lighthouse`)

| # | Vấn đề | Sửa | Vị trí |
| :--- | :--- | :--- | :--- |
| Z1 | Hai đài Lofi Girl trong mục Lofi radio không phát: kênh đã khởi động lại stream nên link cũ báo lỗi 150 (không cho nhúng), app tự bỏ qua sang bài sau | Đổi sang link stream mới, thêm đài jazz lofi; bảng `RETIRED_STREAMS` đổi id cũ sang id mới khi đọc hàng chờ đã lưu và khi dán link cũ (AC-17.3). Kênh Lofi tự sinh bằng Web Audio vẫn chạy bình thường | `src/features/audio/lib/lofiRadio.ts`, `store/useAudioStore.ts` |
| Z2 | Bấm lại "pause all" trên Control Bar bật cả nhạc lẫn ambient, dù trước đó chỉ phát nhạc | "Pause all" nhớ những gì nó đã dừng (`pausedByPauseAll`) và chỉ phát lại đúng những thứ đó; không có gì để phát lại thì chỉ bật ambient; nút nhạc, nút ambient và thanh trượt xóa trí nhớ này (AC-18.2) | `useAudioStore.ts` |
| Z3 | Bấm Exit Zen bị giật: header, ô Focus Intent, hai dock và Control Bar bị gỡ khỏi trang trong Zen, thoát Zen thì hiện lại đột ngột và đẩy đồng hồ xuống | Các phần đó giữ chỗ, chỉ mờ dần (`opacity`, `pointer-events: none`, `inert`, `aria-hidden`) theo đúng AC-11.2; nút Exit Zen cũng mờ dần thay vì bật tắt | `src/core/ui/zen.ts`, `HudSlot.tsx`, `Dock.tsx`, `FocusIntent.tsx`, `ControlBar.tsx`, `ExitZenButton.tsx` |
| Z4 | Muốn Zen chỉ còn thời gian | Mục "Zen mode" trong Timer Settings: "Whole clock" hoặc "Only the time". Chọn "Only the time" thì trong Zen khung đồng hồ (nền, viền, bóng) và vòng của kiểu Circular Ring cũng mờ đi; lưu trên thiết bị ở `focusflow_zen_time_only` (AC-11.3) | `src/features/clock-modes/hooks/useZenTimeOnly.ts`, `ClockSettingsPopover.tsx`, `ClockDisplay.tsx`, `CircularRingClock.tsx` |
| Z5 | Lighthouse: LCP đồng hồ, CLS trang Analytics, `sizes` ảnh, nhãn nút Login | Chi tiết và số đo trước/sau trong `docs/Lighthouse_v2_report.md` mục 11 | Xem báo cáo |
| Z6 | Test | Header và dock mờ nhưng giữ chỗ trong Zen, Exit Zen mờ dần, Zen chỉ còn thời gian, đổi stream cũ sang mới, "pause all" chỉ phát lại đúng thứ đã dừng, nhạc không bật ambient | `HudSlot.test.tsx`, `Dock.test.tsx`, `ExitZenButton.test.tsx`, `ClockDisplay.test.tsx`, `SoundPanel.test.tsx` |

---

## 9. Sửa theo góp ý đánh giá chéo (nhánh `fix/peer-feedback`)

Nguồn: file đánh giá của nhóm Đạt, 21/11/2026, ghi đầy đủ trong `docs/PEER_REVIEW.md` Phần B. Người thực hiện: Võ Xuân Phú, trong một PR riêng.

| # | Góp ý | Quyết định | Nguyên nhân và cách sửa | Vị trí |
| :--- | :--- | :--- | :--- | :--- |
| P1 | Nút mũi tên carousel và nút Exit Zen "đi xuống" khi bấm, lệch chuột là bấm trượt | Làm | Quy tắc chung `transform: scale(0.95)` khi bấm thay toàn bộ `transform`, làm mất phần `translate` đang canh giữa nút. Đổi sang thuộc tính `scale` riêng; bỏ `active:scale-*` riêng ở trang website để không co hai lần | `src/app/index.css`, `Slideshow.tsx`, `siteStyles.ts` |
| P2 | Lofi không biết đã nghe bao lâu; thanh "0:00 … Live" chỉ để làm cảnh | Làm | Store có thêm `isLive`, `listenedSeconds` (đếm khi đang phát, giữ qua tạm dừng, đặt lại khi đổi bài); thanh tua của stream trực tiếp hiện "LIVE · mm:ss listened"; danh sách phát có ảnh bìa | `useAudioStore.ts`, `YouTubeHost.tsx`, `MusicController.tsx`, `SoundPanel.tsx` |
| P3 | Sang trang khác vẫn có nhạc nhưng không điều khiển được | Làm | `MiniPlayer` ở các trang website qua `MiniPlayerSlot`: tên bài, bài trước, phát/tạm dừng, bài sau, âm lượng, thời gian đã nghe của stream trực tiếp | `src/features/audio/components/MiniPlayer.tsx`, `src/app/slots.tsx`, `SiteLayout.tsx` |
| P4 | Chỉnh tốc độ âm thanh cho lofi | Không làm | Stream trực tiếp của YouTube chỉ phát đúng tốc độ thật, âm Lofi tạo bằng Web Audio là vòng lặp cố định, và đổi tốc độ không có trong PRD | Hướng phát triển |
| P5 | Danh sách link YouTube yêu thích | Làm một phần | Ảnh bìa đã thêm (P2); yêu thích đồng bộ cần bảng database mới và sửa PRD, để về sau | Hướng phát triển |
| P6 | Test | Làm | Nút không nhảy khi bấm (kiểm tra CSS), thời gian đã nghe của stream trực tiếp, thanh tua Live, thanh nhạc nhỏ (hiện, phát/tạm dừng, bài trước/sau, âm lượng, Live), ảnh bìa trong danh sách phát | `pressEffect.test.ts`, `miniPlayer.test.tsx`, `youtubeHost.test.tsx`, `musicController.test.tsx`, `routing.test.tsx` |
