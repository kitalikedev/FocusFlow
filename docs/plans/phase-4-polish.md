# Kế hoạch Triển khai: Phase 4 — Tối ưu, Âm thanh, Animation và 3 gói cho team

**Phiên bản:** 1.0 (đã duyệt; phần A đã triển khai)
**Nền tảng:** `main` tại `6470de4` (đã có đủ Phase 3)
**Cách làm:** phần của mình trong một nhánh `feature/phase-4-polish`, một PR, Squash and merge thành một commit. Chạy `lint`, `typecheck`, `test`, `build` sau mỗi bước. Ba gói cho team làm sau, khi PR này đã merge.

---

## 1. Chia việc

| Phần | Ai làm | Nội dung |
| :--- | :--- | :--- |
| **A. Lõi** | Mình, PR `feature/phase-4-polish` | Tối ưu, âm thanh mượt, âm lượng YouTube, animation, chuẩn bị chỗ cho 3 gói (Mục 2 đến 4) |
| **B. Gói 3E `quotes`** | Thành viên | Quote ngẫu nhiên trên màn hình (Mục 5) |
| **C. Gói 3F `themes-pixel`** | Thành viên | Nền pixel/cyberpunk, 5 theme mới, hiệu ứng Scanlines và Glow (Mục 5) |
| **D. Gói 3G `lofi`** | Thành viên | Kênh nhạc lofi tự sinh và danh sách lofi radio (Mục 5) |

Mình viết **bản nháp chạy được** cho B, C, D, kiểm tra trong một bản sao tạm của repo, rồi đóng zip kèm hướng dẫn Discord. Zip và hướng dẫn để **ngoài** thư mục dự án (`~/FocusFlow-handoff/`), không đụng repo. Thành viên nhận bản nháp, làm thử, hoàn thiện rồi commit như làm bình thường.

---

## 2. Phần A — Tối ưu và dọn dẹp

| # | Phát hiện | Xử lý |
| :--- | :--- | :--- |
| O1 | Nền "Animated" chạy bằng `background-position`, trình duyệt vẽ lại cả màn hình mỗi khung hình | Chuyển sang lớp lớn hơn màn hình, di chuyển bằng `transform` (GPU lo) |
| O3 | State thừa từ thiết kế cũ: `isMobileDrawerOpen`, `activeDrawerTab`, `closeAllModals`, `cycleDots` trong `useHud` | Xóa, cập nhật contracts và test |
| O4 | `useMediaQuery` và hằng `(max-width: 639px)` lặp ở 3 chỗ | Dùng chung bản trong `core/ui` |
| O5 | `DEFAULT_WALLPAPER_ID = 'preset-lofi-cafe'` không có trong catalog | Giữ nguyên: đó là mặc định của cột database (ERD), còn nền hiển thị lấy từ `activeTheme.wallpaperRef`; chỉ thêm chú thích |
| O6 | PRD 4.1, ARCHITECTURE, PROGRESS lệch code | Cập nhật ở bước cuối |
| O7 | `npm audit` 12 lỗ hổng, **chỉ ở công cụ dev** (bản người dùng chạy có 0) | PR riêng, cần Node 22 trước vì Vite 8 / Vitest 5 đòi Node ≥ 20.19 (máy đang Node 20.11) |

## 3. Phần A — Âm thanh

| # | Nội dung |
| :--- | :--- |
| S1 | Mọi kênh lên/xuống âm lượng mượt trong khoảng 1,5 giây (bật, tắt, Play/Pause, kéo thanh trượt): hết tiếng "bụp". |
| S2 | Rain đổi từ noise trắng sang noise hồng, hạ tần số lọc, dao động chậm hơn: ấm và nhẹ nhàng hơn. |
| S5 | **Âm lượng YouTube riêng:** thanh trượt "Music" trong thẻ Sounds, độc lập với Master (âm lượng thực = Music × Master). Lưu trên thiết bị (`localStorage`, khóa `focusflow_audio_levels`), không đổi database: âm lượng 3 kênh trong database là các cột riêng (`volume_rain`…), không phải JSONB. |

(S3 kênh Lofi tự sinh và S4 lofi radio chuyển thành gói 3G.)

## 4. Phần A — Animation

Một bộ keyframes dùng chung trong Tailwind và `core/ui`; tất cả tắt khi `prefers-reduced-motion`.

| Thành phần | Hiệu ứng |
| :--- | :--- |
| Nút, tab, icon dock | Nhấn co nhẹ, hover sáng dần |
| Thẻ Tasks / Note / Sounds | Trượt lên + mờ vào; đóng thì mờ ra |
| Panel Themes / Analytics | Trượt từ phải (desktop) hoặc từ dưới (điện thoại), nền tối mờ dần |
| Thẻ theme, ô nền | Hover nâng nhẹ; chọn thì viền "nảy" |
| Task | Trượt vào khi thêm; dấu tích hoàn thành "pop" |
| Đồng hồ | Đổi chế độ mờ chuyển; Start/Pause có hiệu ứng nhấn |
| Toast, danh sách chọn task | Mờ + trượt nhẹ |
| Biểu đồ Analytics | Cột mọc lên từ đáy |

Animation nằm ở `core/ui` và class Tailwind dùng chung, vì nó đi qua nhiều thư mục; không giao cho thành viên.

## 5. Chuẩn bị chỗ cho 3 gói (làm trong PR của phần A)

Để mỗi gói chỉ sửa trong thư mục của mình, mình làm sẵn phần chung:

* **3E `quotes`:** thư mục `src/features/quotes/`, `index.ts` xuất `QuoteDisplay` (trả về `null`), `QuoteSlot` trong `slots.tsx` đặt góc phải trên dưới HUD.
* **3F `themes-pixel`:** thêm `scanlines` và `glow` vào `EffectsConfig` (contracts, `parseThemeConfig`, `useThemeStore`); đồng hồ đọc biến `--clock-glow`; `EffectsLayer` nhận hai hiệu ứng mới; catalog và presets của gói theme đọc thêm từ file riêng (`lib/pixelCyberpunk.ts`) để gói chỉ thêm file, ít sửa file có sẵn.
* **3G `lofi`:** `ambientEngine` và thẻ Sounds đọc danh sách kênh `CHANNEL_DEFS` (`features/audio/lib/channelDefs.ts`); thêm kênh mới là thêm một mục `{ id, label, icon, scale, persist: 'device', build }`. Âm lượng của kênh `device` lưu trên thiết bị nên không cần sửa database hay contracts.

Hai gói 3F, 3G chỉ **thêm** nội dung vào thư mục riêng; quy tắc chung vẫn như `docs/plans/phase-3.md` Phần A.

## 6. Phần B, C, D — bản nháp và đóng gói

| Gói | Bản nháp mình viết |
| :--- | :--- |
| 3E quotes | ~40 câu danh ngôn ngắn (tiếng Anh), công tắc bật/tắt (mặc định TẮT, lưu `localStorage`), đổi câu ngẫu nhiên, ẩn trong Zen, animation mờ dần |
| 3F themes-pixel | 4 nền Pixel + 4 nền Cyberpunk (SVG sinh từ code), 5 theme (Cyberpunk Neon, Synthwave, Pixel Night, Retro Terminal, Vaporwave), Scanlines và Glow chạy được |
| 3G lofi | Kênh Lofi Web Audio (hợp âm piano điện mềm, trống nhẹ lệch nhịp, tiếng đĩa than rè, ~75 BPM), danh sách lofi radio thêm vào hàng chờ YouTube bằng một lần bấm |

Mỗi gói kèm test và được chạy `lint`, `typecheck`, `test`, `build` trong bản sao tạm đã gồm PR này. Ngoài ra trong `~/FocusFlow-handoff/` mỗi gói có: zip code, hướng dẫn Discord (cách làm trên Codespaces hoặc web, như gói 3A), danh sách việc "còn thiếu để hoàn thiện" (ví dụ thêm câu quote, chỉnh màu, thêm nền) và mô tả PR.

Mình không thêm plan chi tiết của 3E, 3F, 3G vào `phase-3.md` nữa; mỗi gói có một file `PLAN.md` nằm trong zip hướng dẫn (ngoài repo), nên repo không có dấu vết sắp xếp trước.

## 7. Thứ tự làm

1. Phần A: O1, O3, O4, O5, S1, S2, S5, animation, chuẩn bị chỗ cho 3 gói; test, build, kiểm trên trình duyệt.
2. Bạn commit và merge PR.
3. Mình tạo bản sao tạm từ `main` mới, viết bản nháp 3E, 3F, 3G, kiểm tra, đóng zip và hướng dẫn vào `~/FocusFlow-handoff/`.
4. Đồng bộ tài liệu (O6) là PR docs riêng, chỉ ghi những gì đã merge.

## 8. Ngoài phạm vi

Nâng toolchain (O7), FR-23, FR-28, huy hiệu, Google OAuth, E2E.

## 9. Kiểm tay (phần A)

1. Bật Rain, Play/Pause: âm lượng lên xuống mượt, Rain dịu hơn trước.
2. Kéo thanh "Music" khi đang phát YouTube: chỉ nhạc YouTube đổi to nhỏ.
3. Mở/đóng thẻ và panel: có animation; bật "Giảm chuyển động" trong hệ điều hành thì không còn.
4. Nền Animated chạy mượt, CPU thấp hơn.
5. F5 giữ nguyên theme, âm lượng và hàng chờ.

## 10. Ghi chú triển khai phần A

* Dọn dẹp: bỏ `isMobileDrawerOpen`, `activeDrawerTab`, `closeAllModals`, `DrawerTab`, `cycleDots` trong `useHud`; `useMediaQuery` dùng chung ở `core/ui` (clock-modes chỉ re-export). O5 giữ nguyên (xem bảng Mục 2).
* Nền động: lớp lớn hơn màn hình (`inset: -15%`) di chuyển bằng `transform`; bộ lọc độ sáng và mờ nằm ở lớp ngoài.
* Âm thanh: `rampGain()` trong `web-audio.ts` (τ = 0,5 s cho kênh, 0,08 s cho master và mute); kênh tắt thì mờ dần rồi 2 giây sau mới giải phóng node. Rain dùng noise hồng, thang gain 0,55.
* Animation: keyframes trong `tailwind.config.ts`; `usePresence` giữ thẻ thêm 180 ms để chạy hiệu ứng đóng (tắt khi giảm chuyển động); nút nhấn co 0,95 và chuyển màu mượt (`index.css`, `@layer base`).
* Hiệu ứng mới trong contracts: `scanlines`, `glow`. Biến `--clock-glow` do `applyTheme` đặt, chữ đồng hồ đọc nó.
* Khung quote: `src/features/quotes/` (trả về `null`), `QuoteSlot`, vị trí góc phải trên dưới HUD.
* Test: `asyncUtilTimeout` 4 giây trong `src/test/setup.ts` để test không hỏng khi máy chậm.
