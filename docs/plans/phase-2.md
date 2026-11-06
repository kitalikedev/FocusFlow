# Kế hoạch Triển khai: Phase 2 — Động cơ Đếm Giờ, Phím Tắt, Âm Báo & HUD

**Phiên bản:** 1.1 (Q1–Q12 đã duyệt, đã triển khai, chờ nghiệm thu thủ công Mục 6)
**Căn cứ:** `AGENTS.md`, `docs/PRD.md` (FR-04 đến FR-08, FR-21 AC-21.1/21.2, FR-29, FR-30, NFR-5.2), `docs/ARCHITECTURE.md` (Mục 4, 6, 8.1, 10.3, 11, 12, 15)
**Nền tảng:** `main` tại `f718df3` (Phase 1 đã merge)
**Nhánh:** `feature/core-timer`
**Commit/PR:** `Add timer engine, shortcuts, chime and live HUD`

---

## 1. Mục tiêu & Truy vết

Sau Phase 2, timer chạy thật, chính xác khi ẩn tab hoặc ngủ máy, điều khiển được bằng phím tắt, phát chuông khi hết giờ và ghi phiên focus vào `focus_sessions`. HUD hiển thị dữ liệu thật. Phase 3 chỉ cần đọc `useTimerStore` và các API core dưới đây.

| FR | AC | Nội dung |
| :--- | :--- | :--- |
| FR-04 | 04.1, 04.2, 04.3 | Preset Pomodoro, 52/17, Deep Work, Custom, Stopwatch |
| FR-05 | 05.1, 05.2 | Nghỉ dài sau N phiên, tự chạy phiên kế |
| FR-06 | 06.1, 06.2 | Worker tick + `Date.now()`, tính lại khi `visibilitychange`/`focus` |
| FR-07 | 07.1, 07.2 | Web Notification, chuông tổng hợp D5 + A5 |
| FR-08 | 08.1, 08.2, 08.3 | Space, R, F, Shift+F, M; bỏ qua khi gõ chữ hoặc giữ Ctrl/Cmd/Alt |
| FR-21 | 21.1, 21.2 (phần tính) | Ghi phiên khi hết focus; hàm tính streak theo ngày local |
| FR-30 | 30.1, 30.2, 30.3 | Cycle dots, số phiên hôm nay, streak, chỉ báo sync, Fullscreen |
| NFR-5.2 | | Sai số ≤ 100 ms |

---

## 2. Quyết định cần duyệt

Mỗi mục có đề xuất. Bạn trả lời "Duyệt tất cả" hoặc chỉ ra mục muốn đổi.

| # | Vấn đề | Đề xuất |
| :--- | :--- | :--- |
| **Q1** | **Docs mâu thuẫn.** PRD/NFR ghi hiển thị bằng `Math.floor`, sơ đồ trạng thái ghi "hoàn thành khi `remainingSeconds == 0`". Dùng floor thì về `00:00` sớm gần 1 giây trước giờ thật, trái yêu cầu ≤ 100 ms. | Hiển thị `Math.ceil((target − now)/1000)`; **hoàn thành khi `now ≥ targetEndTime`**. Các ví dụ trong AC-06.1/06.2 vẫn đúng (ranh giới giây cho cùng kết quả). Bắt đầu thấy `25:00`, giây cuối thấy `00:01`, đúng lúc chuông kêu thì về `00:00`. |
| **Q2** | DB không có cột lưu `mode`; preset 52/17 và Deep Work không nêu thời lượng nghỉ dài. | Preset chỉ đặt **focus + nghỉ ngắn** (25/5, 52/17, 90/15), **giữ nguyên nghỉ dài** của người dùng (mặc định 15). Chọn preset thì lưu thời lượng vào `user_settings`. Khi tải lại, `mode` **suy ra** từ cặp focus/nghỉ ngắn (khớp preset thì lấy preset, không khớp thì `custom`). Không sửa schema. Stopwatch không lưu. |
| **Q3** | Nút Start/Pause/Reset và tab chế độ nằm trong viên nang của `features/clock-modes` (gói 3A). Không có UI thì không kiểm tay được Phase 2. | Phase 2 sửa **stub** `features/clock-modes/index.ts` ở mức tối thiểu: hiện giờ thật, nút Start/Pause, Reset, 5 nút chế độ. Gói 3A thay hẳn bằng đồng hồ hoàn chỉnh. Đây là ngoại lệ ranh giới duy nhất, giống việc Phase 0 dựng stub. |
| **Q4** | Lúc ghi phiên, core cần `intentTitle`/`taskId`, nhưng ô Focus Intent thuộc feature 3D (core không được import feature). | Thêm store core `useFocusIntentStore` (`intentTitle`, `taskId`, `setIntent`, `clearTaskLink`). Gói 3D ghi vào đó; timer đọc khi ghi phiên. Phase 2 ghi `null`. |
| **Q5** | Contract có `skipSession`, nhưng docs không nói skip có tính phiên hay không. | Skip **không** ghi phiên, **không** tăng chu kỳ, **không** kêu chuông. Skip từ focus sang nghỉ ngắn; skip từ nghỉ sang focus. Trạng thái về idle. |
| **Q6** | Trình duyệt chỉ cho xin quyền Notification khi người dùng thao tác. AC chỉ có nội dung cho lúc hết focus. | Xin quyền ở **lần bấm Start đầu tiên** nếu quyền còn `default`. Hết focus: "Session Completed!" / "Time for a break!". Hết nghỉ: "Break Over!" / "Time to focus!". Chỉ gửi khi tab đang ẩn. |
| **Q7** | Chưa có `syncQueue` (P2), vậy trạng thái "Syncing" lấy từ đâu? | Khách: **ẩn** chỉ báo (dữ liệu chỉ ở máy). Đã đăng nhập: `Offline` nếu `navigator.onLine === false` (nghe sự kiện `online`/`offline`); `Syncing` khi đang có lượt ghi (đếm trong `useSyncStatusStore`, tăng/giảm quanh `settings.update` và việc ghi phiên); còn lại là `Synced`. |
| **Q8** | Stopwatch đếm xuôi, nhưng contract chỉ có `remainingSeconds`. | Không đổi contract. Khi `mode = 'stopwatch'` thì `remainingSeconds` mang **số giây đã trôi**, `targetEndTime = null`, không tự kết thúc, không ghi phiên. Ghi rõ trong comment của `contracts.ts`. |
| **Q9** | Ngoài input/textarea, còn những chỗ phím tắt dễ gây lỗi. | Bỏ qua phím tắt khi: đang ở `input`/`textarea`/`select`/`contenteditable`; target là nút hoặc link (tránh Space vừa bấm nút vừa đổi timer); đang mở dialog (`role=dialog/alertdialog`); `e.isComposing` (bộ gõ tiếng Việt); `e.repeat`; giữ Ctrl/Cmd/Alt. Space có `preventDefault` để trang không cuộn. |
| **Q10** | Thoát fullscreen bằng Esc làm `isFullscreen` sai; iPhone không có Fullscreen API. | Trạng thái lấy từ sự kiện `fullscreenchange`. Ẩn nút khi `document.fullscreenEnabled` là false. |
| **Q11** | F5 khi timer đang chạy. | PRD không yêu cầu giữ lại, nên F5 thì timer về idle. Không làm thêm. |
| **Q12** | Ngủ máy qua nhiều phiên (cả hai cờ auto-start đều bật). | Chỉ hoàn thành **1** phiên; phiên kế bắt đầu tính từ lúc thức dậy, không chạy bù hàng loạt. |

---

## 3. Thiết kế

### 3.1. File

| File | Loại | Nội dung |
| :--- | :--- | :--- |
| `src/core/timer/timer-engine.ts` | mới | Hàm thuần: `computeRemaining`, `computeElapsed`, `msUntilNextBoundary`, `nextSession` (bảng chuyển trạng thái 6.2), `PRESETS`, `deriveMode`, `sessionTotalSeconds` |
| `src/core/timer/timer.worker.ts` | mới | Nhận `START {anchor}` / `STOP`, phát `TICK` đúng ranh giới giây (dùng `msUntilNextBoundary` + 10 ms đệm) |
| `src/core/timer/ticker.ts` | mới | `createTicker()`: dùng Worker (`new URL('./timer.worker.ts', import.meta.url)`); nếu không có Worker (jsdom) thì dùng `setTimeout` với cùng lịch. Cho phép tiêm ticker giả vào test |
| `src/core/timer/useTimerStore.ts` | mới | `TimerState & TimerActions`, cộng `sync()` và `startedAt` dùng nội bộ |
| `src/core/timer/completion.ts` | mới | Xử lý khi hết giờ: chuông → notification → chuyển phiên → ghi phiên (bất đồng bộ, không chặn UI) |
| `src/core/timer/useFocusIntentStore.ts` | mới | Q4 |
| `src/core/timer/initializeTimer.ts` | mới | Theo dõi `useSettingsStore` để áp thời lượng (idle thì áp ngay, đang chạy thì áp từ phiên sau) và master volume; gắn `visibilitychange`/`focus` → `sync()`. Trả về hàm hủy |
| `src/shared/lib/web-audio.ts` | mới | `AudioContext` dùng chung, lazy: `initAudioContext`, `setMasterVolume`, `toggleMasterMute`, `isMuted`, `subscribeMute`, `playChime` (D5 587.33 Hz + A5 880 Hz, sine, decay hàm mũ ~1.2 s). Gói 3C mở rộng phần ambient/YouTube trên chính file này |
| `src/core/shortcuts/useShortcuts.ts` | mới | Q9; Space → start/pause, R → reset, F → Zen, Shift+F → fullscreen, M → mute |
| `src/core/data/useFocusSessionsStore.ts` | mới | `sessions`, `load()`, `add(record)` |
| `src/core/hud/stats.ts` | mới | `countToday`, `computeStreak` (ngày local; streak còn sống nếu có phiên hôm nay hoặc hôm qua) |
| `src/core/hud/useSyncStatusStore.ts` | mới | Q7 |
| `src/core/hud/useHud.ts`, `HudSlot.tsx` | sửa | Bỏ số giả. Dots = `cyclesCompleted % interval` (đầy đủ khi đang nghỉ dài); số phiên hôm nay; streak; icon sync; nút fullscreen theo Q10. Đổi màu cứng (`text-orange-400`, `bg-white`) sang token accent |
| `src/core/ui/useUiStore.ts` | sửa | `toggleFullscreen` chỉ gọi API; thêm `setFullscreen` nội bộ cho `fullscreenchange` |
| `src/core/data/useSettingsStore.ts` | sửa | Đếm `Syncing` quanh `update` |
| `src/features/clock-modes/index.ts` | sửa | Q3 (stub tối thiểu) |
| `src/app/providers.tsx` | sửa | Gọi `initializeTimer()`, `useShortcuts()`, tải `useFocusSessionsStore` cùng điều kiện với settings |
| `src/shared/types/contracts.ts` | sửa | Chỉ thêm comment (Q8) |

Không cài dependency mới. Không đổi schema.

### 3.2. Luồng chính

```text
start(): (gesture) initAudioContext + xin quyền notification (lần đầu)
         targetEndTime = now + remaining*1000 → ticker.start(anchor)
TICK / visibilitychange / focus → sync():
         countdown: remaining = ceil((target-now)/1000); now ≥ target → complete()
         stopwatch: remaining = floor((now-startedAt)/1000)
complete(): chặn chạy 2 lần (chỉ khi status running) → playChime()
         → notify nếu tab ẩn → nextSession() → auto-start hoặc idle
         → nếu là focus: ghi phiên round(focus/60) phút + intent → add vào store
pause(): lưu remaining, dừng ticker; reset(): idle, thời lượng đầy đủ của phiên hiện tại
setMode(): dừng, về idle, áp preset, lưu settings (trừ stopwatch)
```

Ghi phiên lỗi (ví dụ mất mạng khi đã đăng nhập): toast `ERROR_MESSAGES` hiện có; phiên đó mất (chưa có `syncQueue`, đúng phạm vi P2). Timer vẫn chuyển phiên bình thường.

---

## 4. Các bước triển khai

1. `timer-engine.ts` kèm test thuần (toán, chuyển trạng thái, preset, `deriveMode`).
2. `ticker.ts` + `timer.worker.ts` kèm test lịch tick.
3. `web-audio.ts` kèm test (mock `AudioContext`).
4. `useTimerStore`, `completion`, `useFocusIntentStore`, `initializeTimer` kèm test drift và luồng.
5. `useShortcuts` kèm test.
6. `useFocusSessionsStore`, `stats`, `useSyncStatusStore`, sửa `useUiStore` và HUD, kèm test.
7. Stub `clock-modes`, `providers.tsx`.
8. Chạy lint, typecheck, test kèm coverage, build. Kiểm tay (Mục 6).

---

## 5. Test tự động (Vitest, fake timers + `vi.setSystemTime`)

| File | Ca chính |
| :--- | :--- |
| `timer-engine.test.ts` | ceil/ranh giới; `msUntilNextBoundary` (âm, bằng 0); chu kỳ 4 → nghỉ dài; nghỉ → focus không tăng chu kỳ; preset và `deriveMode` |
| `useTimerStore.test.ts` | AC-04.1/04.2/04.3; AC-05.1/05.2; **AC-06.1**: chạy 20:00, nhảy giờ hệ thống 600 000 ms không có tick, phát `visibilitychange` → còn đúng 600; **AC-06.2**: nhảy 20 phút → hoàn thành ngay, chuông 1 lần; độ lệch thời điểm hoàn thành ≤ 100 ms; pause/resume; reset; skip (Q5); không hoàn thành 2 lần; idle thì áp thời lượng mới ngay, đang chạy thì để phiên sau |
| `completion.test.ts` | Ghi phiên đúng số phút + intent; notification chỉ khi ẩn tab và đã có quyền; ghi lỗi → toast, timer vẫn chuyển phiên |
| `ticker.test.ts` | Fallback không có Worker; start/stop; tick đúng ranh giới |
| `web-audio.test.ts` | Không có `AudioContext` thì không lỗi; chuông tạo 2 oscillator; mute thì không phát; `subscribeMute` |
| `useShortcuts.test.ts` | AC-08.1 (cả 5 phím); AC-08.2 (input, textarea, contenteditable); AC-08.3 (Ctrl/Cmd/Alt); nút đang focus, dialog mở, `isComposing`, `repeat`; Space gọi `preventDefault` |
| `stats.test.ts` | Hôm nay/hôm qua/đứt chuỗi; qua nửa đêm theo giờ local |
| `HudSlot.test.tsx`, `useHud.test.ts` | AC-30.1 (2/4 dots); AC-30.2 (`offline` → icon trong 1 lần render); AC-30.3; ẩn nút khi không hỗ trợ; khách ẩn chỉ báo sync |
| `useUiStore.test.ts` | Đồng bộ qua `fullscreenchange`; `requestFullscreen` bị từ chối thì trạng thái không đổi |

Mục tiêu: branch coverage ≥ 85% cho `src/core/timer`, `src/core/shortcuts`, `src/core/hud` (ngưỡng hiện tại áp cho toàn `src/core`).

---

## 6. Definition of Done

1. `npm run lint` 0 lỗi / 0 cảnh báo; `npm run typecheck` sạch; `npm run test` 100% xanh; `npm run build` thành công, bundle ban đầu ≤ 200 KB gzip.
2. Không file nào ngoài phạm vi Mục 3.1. Không secret.

**Kiểm tay** (`npm run dev`, `http://localhost:5180`):

| # | Thao tác | Kết quả đúng |
| :--- | :--- | :--- |
| 1 | Bấm Start, chuyển tab 1–2 phút rồi quay lại | Giờ khớp đồng hồ thật |
| 2 | Đăng nhập; trên Supabase sửa `user_settings.focus_duration = 60`; F5 (chế độ thành Custom 1:00). Start, chuyển tab, chờ hết giờ | Chuông kêu, có notification, chuyển sang Short Break; HUD: 1 dot, phiên hôm nay = 1, streak = 1 |
| 3 | Timer đang chạy, mở Login, gõ Space/R vào ô email | Chữ được gõ, timer không dừng, không reset |
| 4 | Space, R, F, Shift+F, M ngoài ô nhập | Đúng hành động; Cmd+R vẫn tải lại trang |
| 5 | DevTools chọn Offline (đã đăng nhập) | Icon sync chuyển Offline ngay |
| 6 | Supabase bảng `focus_sessions` | Có 1 dòng `duration_minutes = 1` |

---

## 7. Ngoài phạm vi

Giao diện đồng hồ hoàn chỉnh, popover cài đặt, Zen "Exit" button, Mini Corner, PiP (3A). Ambient, YouTube, Control Bar (3C; Phase 2 chỉ cung cấp mute và master gain). Ô Focus Intent thật, Analytics (3D). `syncQueue`, giữ timer qua F5, Playwright.

---

## 8. Docs cần đồng bộ (PR docs riêng sau Phase 2)

Q1 (ceil, hoàn thành khi `now ≥ target`); Q2 (preset và suy ra mode); Q8 (stopwatch); API core mới (`useFocusIntentStore`, `web-audio.ts`, `initializeTimer`, `useFocusSessionsStore`, `useSyncStatusStore`); cổng dev 5180 (PROGRESS ghi 5173); cùng các mục tồn từ Phase 1.

---

## 9. Ghi chú Triển khai

* **Lệch nhẹ so với Mục 3.1:** `useSyncStatusStore` đặt ở `src/core/data/` (không phải `core/hud/`) để `useSettingsStore` không phải import ngược từ HUD. Thêm `boundaryLoop.ts` (vòng lặp dùng chung cho Worker và bản dự phòng), `watchFullscreen`/`isFullscreenSupported` trong `useUiStore.ts`, `watchConnectivity`/`trackWrite` trong `useSyncStatusStore.ts`.
* **`sessionSeconds`** (độ dài phiên đang đếm) là trường mới trong `useTimerStore`, dùng để ghi đúng số phút và để gói 3A vẽ vòng tiến trình.
* **Giới hạn đã biết:** Streak chỉ tính trong dữ liệu đã tải (data layer trả 90 ngày gần nhất), nên tối đa 90. Tooltip Offline dùng đúng chuỗi của AC-30.2 dù chưa có `syncQueue` (thay đổi khi đăng nhập mà mất mạng sẽ báo lỗi, chưa lưu hàng đợi).
* **Kết quả kiểm tra tự động:** lint 0/0, typecheck sạch, 34 file / 355 test xanh, branch coverage `src/core/timer`, `src/core/shortcuts`, `src/core/hud` đạt 100%, build thành công (initial JS khoảng 127 KB gzip, Worker tách chunk 0.45 KB).
