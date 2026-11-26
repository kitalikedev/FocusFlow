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

## 9. Sửa theo góp ý đánh giá chéo (PR #51)

Nguồn: file đánh giá của nhóm Đạt, 21/11/2026, ghi đầy đủ trong `docs/PEER_REVIEW.md` Phần B. Người thực hiện: Võ Xuân Phú, PR #51 (đã merge, 62 file / 653 test đạt).

| # | Góp ý | Quyết định | Nguyên nhân và cách sửa | Vị trí |
| :--- | :--- | :--- | :--- | :--- |
| P1 | Nút mũi tên carousel và nút Exit Zen "đi xuống" khi bấm, lệch chuột là bấm trượt | Làm | Quy tắc chung `transform: scale(0.95)` khi bấm thay toàn bộ `transform`, làm mất phần `translate` đang canh giữa nút. Đổi sang thuộc tính `scale` riêng; bỏ `active:scale-*` riêng ở trang website để không co hai lần | `src/app/index.css`, `Slideshow.tsx`, `siteStyles.ts` |
| P2 | Lofi không biết đã nghe bao lâu; thanh "0:00 … Live" chỉ để làm cảnh | Làm | Store có thêm `isLive`, `listenedSeconds` (đếm khi đang phát, giữ qua tạm dừng, đặt lại khi đổi bài); thanh tua của stream trực tiếp hiện "LIVE · mm:ss listened"; danh sách phát có ảnh bìa | `useAudioStore.ts`, `YouTubeHost.tsx`, `MusicController.tsx`, `SoundPanel.tsx` |
| P3 | Sang trang khác vẫn có nhạc nhưng không điều khiển được | Làm | `MiniPlayer` ở các trang website qua `MiniPlayerSlot`: tên bài, bài trước, phát/tạm dừng, bài sau, âm lượng, thời gian đã nghe của stream trực tiếp | `src/features/audio/components/MiniPlayer.tsx`, `src/app/slots.tsx`, `SiteLayout.tsx` |
| P4 | Chỉnh tốc độ âm thanh cho lofi | Không làm | Stream trực tiếp của YouTube chỉ phát đúng tốc độ thật, âm Lofi tạo bằng Web Audio là vòng lặp cố định, và đổi tốc độ không có trong PRD | Hướng phát triển |
| P5 | Danh sách link YouTube yêu thích | Làm một phần | Ảnh bìa đã thêm (P2); yêu thích đồng bộ cần bảng database mới và sửa PRD, để về sau | Hướng phát triển |
| P6 | Test | Làm | Nút không nhảy khi bấm (kiểm tra CSS), thời gian đã nghe của stream trực tiếp, thanh tua Live, thanh nhạc nhỏ (hiện, phát/tạm dừng, bài trước/sau, âm lượng, Live), ảnh bìa trong danh sách phát | `pressEffect.test.ts`, `miniPlayer.test.tsx`, `youtubeHost.test.tsx`, `musicController.test.tsx`, `routing.test.tsx` |

## 10. Sửa theo bản chấm thử và chuyển sang Next.js (26/11 – 27/11/2026)

Nguồn: bản chấm thử của giảng viên trên commit `02dbb44` (8/10). Mục tiêu: lấy lại tối đa 2 điểm đang mất, không làm hỏng bản đang chạy. Lớp yêu cầu dùng Next.js; không dùng thì mục 3(c) tối đa 50 %.

### 10.1 Điểm đang mất và việc lấy lại

| Mục | Còn thiếu | Việc | Lấy lại tối đa | Người làm |
| :-- | :-- | :-- | :-: | :-- |
| 5(a) | Góp ý cho PawPass còn chung chung; chưa có bằng chứng đã gửi góp ý cho 2 nhóm | P1 | +0.5 | Nhóm |
| 3(c) | Không dùng Next.js, đọc Supabase thẳng từ trình duyệt | N1, N2 (N3 nếu kịp) | +0.5 | Nam |
| 3(a) | Chưa có ghi nhận nhóm cùng rà soát lược đồ | D1 | +0.25 | Nam và cả nhóm |
| 1(b) | Chưa ghi công cụ vẽ wireframe, chưa có link file gốc | W1 | +0.25 | Dũng |
| 1(d), 1(e) | Issue dùng muộn, commit lớn, ít PR có `Closes #n` | Quy trình 10.3 cho mọi việc từ giờ | một phần của +0.5 | Cả nhóm |

### 10.2 Chọn cách chuyển sang Next.js

**Thử trước trên một bản sao (26/11):** Next.js 16.4.6 với React 18 build xong trong khoảng 9 giây; 62 file / 653 test vẫn đạt; timer chạy bằng Web Worker vẫn đếm; mở thẳng `/analytics`, `/app` đúng trang. Có hai chỗ bắt buộc phải sửa, nếu không trang sẽ trắng sau khi deploy:

1. CSP hiện tại chặn các script inline mà Next.js chèn vào trang. Đã thử: trang trắng; thêm `'unsafe-inline'` vào `script-src` (cách Next.js hướng dẫn khi không dùng nonce) thì trang chạy lại.
2. `vercel.json` đang chuyển mọi đường dẫn về `/index.html` của Vite. Phải bỏ quy tắc này và khai báo `"framework": "nextjs"`.

Next.js 16 báo React 18 sẽ bị bỏ ở Next.js 17. Giữ React 18 lúc này để không phải sửa code giao diện.

| Phương án | Nội dung | Rủi ro | Công sức | Đáp ứng 3(c) |
| :-- | :-- | :-- | :-- | :-- |
| A | Next.js làm nền, toàn bộ app chạy qua một route bắt mọi đường dẫn, vẫn dùng React Router (bước 1 trong hướng dẫn chuyển từ Vite của Next.js) | Thấp | Nửa ngày | Chưa đủ: dữ liệu chưa đọc qua Next.js |
| B | A cộng Route Handler: trang Analytics và Themes đọc `focus_sessions`, `saved_themes` qua `/api` của Next.js, chạy trên server Vercel, vẫn qua RLS | Thấp đến vừa | Thêm nửa ngày | Đúng việc giảng viên đề xuất |
| C | B cộng định tuyến App Router: mỗi trang là một route có metadata riêng, bỏ React Router | Vừa | Thêm nửa đến một ngày | Thể hiện rõ nhất việc dùng Next.js |
| D | Server Component đọc dữ liệu, phiên đăng nhập lưu bằng cookie (`@supabase/ssr`), trang render phía server | Cao | Nhiều ngày | Đủ, nhưng dễ hỏng đăng nhập, chế độ khách và gộp dữ liệu khách |

**Chọn:** làm lần lượt A → B → C, mỗi bước một PR (N1, N2, N3). Chỉ sang bước sau khi bước trước đã chạy ổn trên production. Không làm D.

**Vì sao dùng Route Handler mà không dùng Server Component:** phiên đăng nhập đang nằm trong trình duyệt nên server không đọc được. Route Handler nhận access token qua header `Authorization` và tạo client Supabase theo token đó, nên RLS vẫn chỉ trả dữ liệu của đúng người dùng. Không cần service role key, không đổi luồng đăng nhập. Ngoài ra các store đọc `localStorage` ngay khi tải, nên nội dung trang vẫn render phía trình duyệt.

### 10.3 Quy trình cho mọi việc từ giờ (1d, 1e)

- Mỗi việc có issue trước khi làm, có nhãn, milestone và người nhận.
- Mỗi issue một nhánh. Commit nhỏ, mỗi commit một thay đổi, thân commit ghi `Refs #n`.
- PR nhỏ, mô tả có `Closes #n`, CI xanh, một bạn duyệt rồi mới merge.
- Squash merge gộp các commit nhỏ thành một. Cân nhắc bật "Rebase and merge" trong ruleset để giữ từng commit nhỏ trên `main`.
- Mỗi thành viên có ít nhất một PR trong hai ngày này.

### 10.4 Danh sách issue

| Mã | Issue | Người làm | Hạn |
| :-- | :-- | :-- | :-- |
| N1 | Chuyển nền tảng build sang Next.js, giữ nguyên giao diện | Nam | 26/11 |
| N2 | Đọc dữ liệu trang Analytics và Themes qua Route Handler của Next.js | Nam | 26/11 |
| N3 | Dùng định tuyến App Router thay React Router (chỉ làm khi đủ điều kiện ở 10.7) | Nam | Trưa 27/11 |
| D1 | Rà soát lược đồ CSDL cùng nhóm và cập nhật migration | Nam và cả nhóm | Tối 26/11 |
| W1 | Ghi công cụ và link file gốc của wireframe | Dũng | 27/11 |
| P1 | Viết lại góp ý cho PawPass, đăng góp ý thành issue trên repo của 2 nhóm | Nhóm | 27/11 |
| E1 | Bảng test thủ công và ảnh ở 3 kích thước màn hình | Nam | 27/11 |
| E2 | Đo lại Lighthouse sau khi chuyển sang Next.js, thêm Themes, Tracking, About | Nam | 27/11 |
| R1 | Cập nhật README, tài liệu và `AGENTS.md` theo Next.js; xuất video MP4 | Nam | 27/11 |

### 10.5 Chi tiết từng việc

**N1: nền tảng Next.js** (mỗi dòng là một commit)

1. Thêm Next.js và điểm vào App Router: `next.config.ts`; `app/layout.tsx` (metadata, viewport, CSS); `app/[[...slug]]/page.tsx` render app phía trình duyệt (`ssr: false`); `src/app/ClientEntry.tsx` thay `main.tsx`, khởi động Sentry và GA trong `useEffect`. Route của Next.js nằm ở thư mục `app/` ở gốc. `src/app/` giữ vai trò lớp ghép giao diện như cũ, vì Next.js bỏ qua `src/app` khi đã có `app/` ở gốc.
2. Đọc biến môi trường qua `process.env.NEXT_PUBLIC_*` (3 file code, 3 file test, `.env.example`). `next.config.ts` nhận cả tên cũ `VITE_*`, nên chưa cần sửa biến trên Vercel.
3. Chuyển header bảo mật sang `next.config.ts` để thử được bằng `next start`; thêm `'unsafe-inline'` vào `script-src`; `vercel.json` chỉ còn `"framework": "nextjs"`.
4. Bỏ các file của Vite (`index.html`, `vite.config.ts`, `src/app/main.tsx`, `src/vite-env.d.ts`). Các script `dev`, `build`, `start` chạy bằng `next`. `tsconfig.json` thêm `app`; `.gitignore` và ESLint bỏ qua `.next`. Vitest giữ nguyên `vitest.config.ts`.

**N2: Route Handler đọc dữ liệu**

1. Tách câu truy vấn `focus_sessions` (90 ngày, mỗi trang 500 dòng) và `saved_themes` ra `src/core/data/queries.ts` để trình duyệt và server dùng chung.
2. Thêm `createSupabaseForToken(token)` trong `src/shared/lib/supabase.ts`, nơi duy nhất được gọi `createClient` theo luật ESLint. Client này không lưu phiên và gửi kèm header `Authorization`.
3. Thêm `app/api/focus-sessions/route.ts` và `app/api/saved-themes/route.ts` (GET). Token được kiểm tra bằng `auth.getUser`; thiếu hoặc sai token thì trả 401. Lỗi CSDL trả 500 nhưng không lộ chi tiết. Phản hồi có `Cache-Control: no-store`.
4. `SupabaseRepository.getFocusSessions` và `getSavedThemes` gọi `/api/...` kèm access token của phiên hiện tại; 401 thì báo `AUTH_SESSION_EXPIRED`. Các thao tác thêm, sửa, xoá giữ nguyên. Chế độ khách (`LocalRepository`) không đổi.
5. Test: route handler (không có token, token sai, thành công, lỗi CSDL) chạy trong môi trường node; repository dùng `fetch` giả; test của trang Analytics và Themes vẫn phải xanh.

Bằng chứng: ảnh tab Network trên production có `/api/focus-sessions` trả dữ liệu.

**N3: định tuyến App Router** (chỉ làm khi đủ điều kiện ở 10.7)

- Root layout giữ workspace luôn được mount để timer và nhạc không ngắt khi đổi trang. `src/app/ClientShell.tsx` chứa Providers, workspace, hộp thoại đăng nhập và toast. `app/(site)/layout.tsx` dùng `SiteLayout`. Các route: `/`, `/themes`, `/analytics`, `/tracking`, `/about`, `/app`; `not-found` chuyển về `/`.
- Mỗi trang có `metadata` riêng.
- `src/core/ui/navigation.ts` bọc `next/link` và `next/navigation`, để sửa 10 file đang dùng React Router theo cùng một cách. Sau đó bỏ `react-router-dom`. Viết lại 4 file test có dùng router.
- Kiểm tra quan trọng nhất: đang chạy timer và nhạc, chuyển qua lại các trang website rồi về `/app` mà timer và nhạc không ngắt.

**D1: rà soát lược đồ cùng cả nhóm (họp tối 26/11/2026)**

Giảng viên trừ điểm 3(a) vì không thấy nhóm cùng rà soát lược đồ: migration được viết một lần ngày 06/11, không có buổi họp hay PR nào bàn về lược đồ. Để lấy lại điểm cần ba bằng chứng: một buổi họp thật có biên bản, các ý kiến trên issue #63, và một PR sửa theo kết quả buổi họp.

*Chuẩn bị trước buổi họp:* mỗi người đọc `docs/ERD.md` (mục 1 đến 4 và mục 12) và xem sơ đồ ở README mục 6, rồi ghi ý kiến vào issue #63 (đúng ý kiến của mình, kể cả "không có gì cần sửa" nếu thật sự vậy).

*Buổi họp:* online 30 – 45 phút, đủ 5 người. Giờ họp do nhóm chốt. Nam điều phối; một người khác ghi biên bản.

| Thứ tự | Nội dung | Thời gian | Kết quả cần có |
| :-: | :-- | :-: | :-- |
| 1 | Nam trình bày 6 bảng, quan hệ và quy tắc xoá (ERD mục 1 và 3) | 5 phút | Cả nhóm hiểu lược đồ |
| 2 | Đối chiếu từng bảng với chức năng trong PRD: thiếu bảng, thiếu cột, cột thừa | 10 phút | Danh sách thiếu và thừa, có thể là rỗng |
| 3 | Bàn các điểm ở bảng bên dưới và biểu quyết từng điểm | 15 phút | Cột "Quyết định" được điền |
| 4 | Chốt phần đưa vào migration mới, phân người làm | 5 phút | Danh sách việc và người nhận |

*Các điểm cần bàn* (mỗi điểm đã đối chiếu với migration và code hiện tại; cột "Quyết định" nhóm điền trong buổi họp, không điền trước):

| # | Điểm | Hiện trạng | Đề xuất | Rủi ro | Quyết định |
| :-: | :-- | :-- | :-- | :-- | :-- |
| 1 | `focus_sessions.task_id` có thể trỏ tới task của người khác | Khoá ngoại chỉ kiểm tra task có tồn tại, chính sách INSERT chỉ so `user_id`; ERD mục 12.7 đang ghi là chấp nhận | Khoá ngoại ghép `(task_id, user_id)` tới `tasks(id, user_id)` với `ON DELETE SET NULL (task_id)`; cần thêm `UNIQUE (id, user_id)` trên `tasks` | Phải kiểm tra trước trên dữ liệu thật rằng không có phiên nào vi phạm. Lỗi vi phạm vẫn là 23503, code hiện đã xử lý (thử lại không kèm task) | |
| 2 | `saved_themes` cho phép trùng tên trong một tài khoản | Không có ràng buộc duy nhất; lúc gộp dữ liệu khách, hàm `importSavedThemes` chèn cả lô | Hoặc thêm `UNIQUE (user_id, lower(name))`, hoặc giữ nguyên và ghi lý do vào ERD | Nếu thêm: dữ liệu khách có hai theme trùng tên sẽ làm hỏng cả lô gộp dữ liệu, nên cần sửa code kèm theo. Lựa chọn giữ nguyên là hợp lệ nếu ghi rõ lý do | |
| 3 | Giới hạn 100 task, 10 theme, 3 hình nền kiểm tra bằng `count(*)` rồi mới chèn | Hai lần chèn đồng thời có thể cùng vượt qua kiểm tra | Khoá theo người dùng trong trigger (`pg_advisory_xact_lock`) | Thấp: chỉ xảy ra khi một người chèn đồng thời nhiều dòng. Có thể ghi vào ERD là rủi ro chấp nhận | |
| 4 | Cơ sở dữ liệu chưa có mô tả bảng và cột | Migration chưa có `COMMENT ON` | Thêm `COMMENT ON TABLE` và `COMMENT ON COLUMN` cho 6 bảng, để Supabase Studio hiện mô tả | Không ảnh hưởng dữ liệu hay code | |
| 5 | Nhãn task lưu bằng cột mảng `text[]`, cấu hình theme lưu bằng `jsonb` | Đã có lý do trong ERD mục 12.6 | Nhóm xác nhận lại lý do còn đúng, hay cần tách bảng nhãn | Tách bảng nhãn đổi cả code; chỉ làm nếu nhóm thấy lý do hiện tại không thuyết phục | |
| 6 | Chỉ mục | Đã có 7 chỉ mục (ERD mục 4); mỗi người chỉ có tối đa 100 task nên không cần chỉ mục sắp xếp thêm | Xác nhận đủ, hoặc thêm chỉ mục nếu có truy vấn chậm | Thấp | |
| 7 | Kiểm thử migration và RLS trên PostgreSQL thật trong CI | CI hiện chỉ chạy test với Supabase giả; bộ kiểm thử SQL của ERD mục 11 chỉ chạy tay trong SQL Editor | Thêm job CI dựng PostgreSQL, chạy migration, seed và bộ kiểm thử RLS, quota, Last-Write-Wins | Không đụng database production hay code app; rủi ro là job CI mới bị đỏ, xử lý trước khi merge. Cần thử Supabase CLI trên GitHub Actions | |
| 8 | Điểm khác thành viên nêu | | | | |

*Sau buổi họp:*

1. Ghi **Buổi 7** vào `docs/MEETING_NOTES.md` đúng như buổi họp: ngày, giờ, người dự, các điểm đã bàn, quyết định của từng điểm, người nhận việc. Không ghi điểm nào chưa bàn. README mục 8 thêm một dòng trỏ tới buổi 7.
2. Cập nhật issue #63: dán bảng quyết định, đánh dấu các việc đã xong.
3. Làm một PR riêng cho các điểm nhóm đồng ý, ghi `Closes #63`: migration mới `supabase/migrations/<ngày>_schema_review.sql` (chỉ thêm ràng buộc, chỉ mục hoặc mô tả, không xoá dữ liệu), cập nhật `docs/ERD.md` (sơ đồ, từ điển dữ liệu, mục 12) và README mục 6. Nếu nhóm quyết định không đổi gì ở một điểm thì ghi lý do vào ERD mục 12.
4. Trước khi chạy migration trên production: chạy câu kiểm tra dữ liệu của từng điểm, rồi chạy thử trong `BEGIN … ROLLBACK` trên SQL Editor, sau đó mới chạy thật. Mở lại Analytics và Themes để kiểm tra.
5. Nếu hết giờ mà migration chưa chạy được an toàn thì chỉ gộp biên bản và ERD, ghi migration vào hướng phát triển. Bằng chứng buổi họp và quyết định vẫn là phần quan trọng nhất của mục 3(a).

**W1, P1, E1, E2, R1**

- W1: Dũng gửi link Figma (quyền xem), tên công cụ và ngày vẽ lấy từ lịch sử phiên bản của Figma; ghi vào `docs/wireframes/` và README đúng như lịch sử đó.
- P1: viết góp ý cho PawPass chi tiết như bản cho nhóm Đạt (màn hình, thành phần, vấn đề, cách sửa). Mở issue góp ý trên repo của cả 2 nhóm, rồi đưa link 2 issue vào `docs/PEER_REVIEW.md`.
- E1: bảng thao tác, kết quả mong đợi, kết quả thực tế cho các luồng chính; ảnh ở 375, 768 và 1440 px.
- E2: đo trên production sau N1, N2 (và N3 nếu có) cho trang chủ, `/app`, Analytics, Themes, Tracking, About, trên cả mobile và desktop. Trang cần đăng nhập đo trong DevTools, bỏ chọn "Clear storage". Nếu điểm thấp hơn bản Vite thì ghi lý do và sửa trước giờ đóng băng.
- R1: README (công nghệ, cách chạy, kiến trúc có Route Handler), `docs/SYSTEM_DESIGN.md`, `AGENTS.md` (stack, tên biến môi trường), `docs/PROGRESS.md`. Video xuất ra MP4, tối thiểu 720p, không quá 10 phút.

### 10.6 Kiểm tra trước khi merge mỗi PR

Chạy trên `next start` ở máy và trên Vercel Preview của PR:

- [ ] Lint, typecheck, test, build đều xanh
- [ ] Mở thẳng `/`, `/themes`, `/analytics`, `/tracking`, `/about`, `/app`; đường dẫn lạ quay về `/`
- [ ] Console không có lỗi CSP
- [ ] Timer đếm; chuyển trang thì timer vẫn chạy
- [ ] Nhạc YouTube phát; thanh nhạc nhỏ hiện ở các trang website
- [ ] Đăng nhập, đăng xuất; Analytics và Themes hiện dữ liệu của tài khoản; đổi tài khoản thì dữ liệu đổi theo
- [ ] Chế độ khách vẫn lưu task và ghi chú
- [ ] GA nhận page view (Realtime); `/?sentry_test` gửi được về Sentry
- [ ] Trên điện thoại: menu 3 gạch, panel dạng bảng trượt

### 10.7 An toàn và mốc dừng

- Production chỉ đổi khi PR được merge vào `main`. Mỗi PR phải qua checklist 10.6 trên Vercel Preview trước.
- Trước khi merge N1: kiểm tra Vercel → Settings → Build không ghi đè Output Directory thành `dist`, và môi trường Preview có đủ biến Supabase.
- Nếu có sự cố sau khi merge: dùng Instant Rollback trên Vercel để quay về bản trước, rồi revert PR.
- N3 chỉ bắt đầu nếu N1 và N2 đã chạy ổn trên production trước 12:00 ngày 27/11, và phải merge trước 16:00. Quá giờ thì giữ nhánh lại và ghi vào hướng phát triển.
- Đóng băng code lúc 18:00 ngày 27/11; sau giờ này chỉ sửa tài liệu.
