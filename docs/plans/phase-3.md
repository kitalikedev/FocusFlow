# Kế hoạch Triển khai: Phase 3 — 4 Feature Module

**Phiên bản:** 1.0 (đã duyệt)
**Căn cứ:** `AGENTS.md`, `docs/PRD.md`, `docs/ARCHITECTURE.md` (Mục 3, 4, 6.3, 15 Phase 3)
**Nền tảng:** `main` tại `e5f53c2`

Plan gồm 2 phần: **Phần A** là cách tổ chức chung cho cả 4 gói; **Phần B** là plan chi tiết gói đầu tiên (3A). Gói 3B, 3C, 3D có plan chi tiết riêng khi đến lượt.

---

## Phần A — Tổ chức chung

### A.1. Bốn gói

| Gói | Thư mục | FR | Phụ thuộc core (đã có) | Cần chuẩn bị core trước? |
| :--- | :--- | :--- | :--- | :--- |
| **3A** `clock-modes` | `src/features/clock-modes/` | FR-10, 11, 12 (FR-28 PiP là P2) | `useTimerStore`, `useSettingsStore`, `useUiStore`, `timer-engine` | Không |
| **3B** `theme-wallpaper` | `src/features/theme-wallpaper/` | FR-13, 14, 15, 25, 26, 27 | `useThemeStore`, `applyTheme`, repository wallpaper/theme | Có thể (contrast, font) — chốt khi lập plan 3B |
| **3C** `audio` | `src/features/audio/` | FR-16, 17, 18 | `shared/lib/web-audio.ts` | **Có:** `web-audio.ts` cần xuất thêm `getAudioContext()` và `getMasterGain()` để gói 3C nối kênh ambient |
| **3D** `productivity` | `src/features/productivity/` | FR-19, 20, 21, 22, 29 | repository task/note/session, `useFocusIntentStore`, `core/hud/stats` | Có thể (cách Mobile Drawer mở UI của gói khác) — chốt khi lập plan 3D |

Phần "chuẩn bị core" được làm trong một PR core riêng **trước** khi bắt đầu gói tương ứng, vì mỗi gói chỉ được sửa trong thư mục của mình.

### A.2. Quy tắc chung cho mọi gói

* Chỉ thêm hoặc sửa file trong `src/features/<module>/`. ESLint sẽ chặn import chéo giữa các feature.
* `index.ts` của gói phải giữ đúng tên export mà `src/app/slots.tsx` đang dùng.
* Ẩn chính mình khi `useUiStore.isZen === true` (AC-11.2), trừ đồng hồ.
* Màu, font, blur dùng token (`var(--...)` hoặc class `accent`, `capsule`), không mã màu cứng mới.
* Mỗi gói một nhánh `feature/<module>` và một PR; các gói không đụng file của nhau nên merge theo thứ tự nào cũng được.
* Mọi PR phải qua `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build` và check `ci` trên GitHub.

---

## Phần B — Gói 3A `clock-modes`

### B.1. Phạm vi & Truy vết

| FR | AC | Nội dung |
| :--- | :--- | :--- |
| FR-10 | 10.1, 10.2, 10.3 | 3 kiểu đồng hồ: Minimal, Circular Ring (SVG `stroke-dashoffset`), Retro Flip (lật 3D 300 ms) |
| FR-11 | 11.1, 11.2 | Vị trí Center / Mini Corner (≤ 240 × 80 px, góc dưới phải); nút "Exit Zen" hiện khi di chuột hoặc chạm trong Zen |
| FR-12 | 12.1, 12.2 | Popover chỉnh phút Focus / Short / Long (1–180), cảnh báo `Must be between 1 and 180 mins`, nút Save bị khóa khi sai |
| FR-30 | 30.1 (phần viên nang) | Chấm chu kỳ ngay dưới các tab chế độ trong viên nang |

Ngoài phạm vi: PiP (FR-28, P2), nút bật Zen ở thanh đáy (thuộc 3C; phím `F` đã có).

### B.2. Quyết định cần duyệt

| # | Vấn đề | Đề xuất |
| :--- | :--- | :--- |
| **A1** | FR-05 (nghỉ dài sau N phiên, tự chạy phiên kế) chưa có chỗ chỉnh trên UI | Đặt trong popover FR-12: 3 ô phút, ô "Long break every N sessions" (1–24), 2 công tắc Auto-start breaks / Auto-start focus. |
| **A2** | Lưu cài đặt | Kiểu đồng hồ và vị trí lưu qua `useSettingsStore.update({ clockVisualMode, clockPosition })`. Thời lượng, N và auto-start đi qua `useTimerStore.updateSettings`; core đã tự đồng bộ sang `user_settings` (Phase 2). |
| **A3** | `clockPosition` trong DB có giá trị `'zen'`, nhưng Zen đang do `useUiStore.isZen` (phím `F`) điều khiển | `isZen` là nguồn duy nhất cho Zen. Popover chỉ cho chọn Center / Mini Corner; nếu đọc được `'zen'` thì hiển thị như Center. |
| **A4** | Mini Corner trên điện thoại | AC-11.1 chỉ nói Desktop. Màn hình < 640 px luôn hiển thị Center. |
| **A5** | Chế độ Custom | Lưu phút trong popover (mà không khớp preset) thì chế độ tự thành Custom (core đã suy ra mode). Tab Custom vẫn hiện để quay lại thời lượng Custom. |
| **A6** | Mở popover | Nút bánh răng cạnh viên nang gọi `useUiStore.setClockSettingsOpen(true)`. Esc hoặc bấm ra ngoài thì đóng. Ngăn kéo di động của 3D sau này mở cùng popover qua cờ này. |

### B.3. File (chỉ trong `src/features/clock-modes/`)

| File | Nội dung |
| :--- | :--- |
| `index.ts` | Export `ClockDisplay`, `ClockSettingsPopover` (giữ nguyên tên) |
| `components/ClockDisplay.tsx` | Viên nang: tab chế độ, chấm chu kỳ, nhãn phiên, đồng hồ theo kiểu, Start/Pause, Reset, Skip, nút bánh răng; xử lý vị trí và Zen |
| `components/MinimalClock.tsx`, `CircularRingClock.tsx`, `RetroFlipClock.tsx` | 3 kiểu hiển thị, nhận `InternalClockProps` |
| `components/ClockSettingsPopover.tsx` | Popover FR-12 + A1, kiểm tra dữ liệu AC-12.2 |
| `components/ExitZenButton.tsx` | Nút Exit Zen, tự ẩn sau 3 giây không di chuột |
| `components/CycleDots.tsx` | Chấm chu kỳ (dùng `filledCycleDots` của core) |
| `hooks/useClockPreferences.ts` | Đọc / ghi kiểu và vị trí từ `useSettingsStore` |
| `lib/formatClock.ts` | `mm:ss`, cho phép quá 59 phút (`90:00`) |
| `__tests__/*` | Test Mục B.4 |

Xóa file tạm `ClockDisplay.tsx` ở gốc thư mục (bản dùng thử của Phase 2).

### B.4. Test

| File | Ca chính |
| :--- | :--- |
| `ClockDisplay.test.tsx` | Render đúng 3 kiểu; đổi preset (25:00, 52:00, 90:00); Start/Pause/Reset/Skip; Mini Corner có class góc; màn hình < 640 px về Center; ẩn mọi nút trừ đồng hồ khi Zen |
| `CircularRingClock.test.tsx` | `stroke-dashoffset` giảm đúng tỉ lệ thời gian còn lại; stopwatch không có vòng |
| `RetroFlipClock.test.tsx` | Lật khi chữ số đổi; `prefers-reduced-motion` thì không có animation |
| `ClockSettingsPopover.test.tsx` | AC-12.1 (lưu 45 → `45:00` khi idle); AC-12.2 (0, −10, 181 → viền đỏ, cảnh báo, Save khóa); N và 2 công tắc cập nhật store; Esc đóng |
| `ExitZenButton.test.tsx` | Hiện khi di chuột, ẩn sau 3 giây, bấm thì thoát Zen |

### B.5. Definition of Done

1. Lint 0/0, typecheck sạch, test 100% xanh, build thành công, initial JS ≤ 200 KB gzip.
2. Chỉ có thay đổi trong `src/features/clock-modes/`.
3. Kiểm tay: đổi 3 kiểu, đổi vị trí, chỉnh phút trong popover, F vào Zen rồi Exit Zen; F5 vẫn giữ kiểu và vị trí.

### B.6. Ghi chú Kỹ thuật 3A

* Mini Corner luôn dùng chữ số gọn (vòng tròn và thẻ lật không vừa khung 240 × 80 px).
* Các nút bị ẩn trong Zen có thêm `inert` để không nhận Tab và không bị trình đọc màn hình đọc.
* Kiểu và vị trí đồng hồ luôn được lưu cùng nhau trong một lần `useSettingsStore.update()`, vì hai lần lưu chạy song song có thể ghi đè nhau (xem mục rủi ro trong `docs/PROGRESS.md`).
