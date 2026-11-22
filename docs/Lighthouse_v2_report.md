# Báo cáo Lighthouse v2 (Issue #30)

> Đánh giá hiệu năng, khả năng truy cập, thực hành tốt nhất và SEO của FocusFlow trên môi trường production, theo từng trang và từng thiết bị.

| Thông tin | Chi tiết |
|---|---|
| **Dự án** | FocusFlow |
| **Môi trường đo** | Production (Vercel): `https://focus-flow-two-wheat.vercel.app` |
| **Công cụ** | Lighthouse trong Chrome DevTools |
| **Ngày đo** | 21/11/2026 (mốc giờ máy 00:04 – 00:09, xem từng ảnh) |
| **Phạm vi** | 3 trang × 2 thiết bị = 6 lượt đo |
| **Nhánh / Issue** | `30-lighthouse-v2-report` (PR #45) / #30 |
| **Phạm vi PR** | Chỉ thêm tài liệu và ảnh chụp trong `docs/`, không thay đổi mã nguồn. Đo lại sạch và các bản sửa sau đó: xem mục 11 |

---

## 1. Tóm tắt

- **Chất lượng chung tốt:** cả 3 trang đạt **Best Practices 100** và **SEO 100** trên cả mobile lẫn desktop.
- **Accessibility gần như tuyệt đối:** trang App và Analytics đạt 100, trang chủ đạt 96.
- **Performance là hạng mục cần cải thiện nhất:** trang chủ 86, Analytics 88, App 90 (vừa chạm ngưỡng "tốt" 90). Hai trang chủ và Analytics nằm dưới ngưỡng 90.
- **Điểm mobile và desktop giống hệt nhau** ở cả 3 trang: dấu hiệu lượt "desktop" vẫn chạy chế độ Mobile của Lighthouse (xem mục 7). Lần đo lại sạch ở mục 11 cho điểm desktop riêng.

| Hạng mục | Trung bình 3 trang | Đánh giá |
|---|:---:|---|
| Performance | 88 | Cần cải thiện |
| Accessibility | 99 | Đạt |
| Best Practices | 100 | Đạt |
| SEO | 100 | Đạt |

**Mục tiêu đề xuất:** đưa Performance của cả 3 trang lên từ 90 trở lên, và Accessibility của trang chủ lên 100.

---

## 2. Phương pháp đo

1. Mở từng trang trên bản production bằng Chrome.
2. Mở DevTools (F12), chọn tab **Lighthouse**.
3. Chọn thiết bị **Mobile** hoặc **Desktop**, tick cả 4 hạng mục (Performance, Accessibility, Best Practices, SEO).
4. Bấm **Analyze page load** và chụp phần điểm số.

Thang điểm Lighthouse: **90–100** (tốt), **50–89** (cần cải thiện), **0–49** (kém).

| Trang | Đường dẫn đo |
|---|---|
| Trang chủ (Home) | `/` (đo tại `/#features`) |
| Ứng dụng (App) | `/app` |
| Phân tích (Analytics) | `/analytics` |

Cấu hình giả lập: mobile dùng khung thiết bị giả lập của DevTools (trang chủ: iPhone 16 Pro Max 440×956; App và Analytics: Responsive 400×870).

---

## 3. Kết quả chi tiết

| Trang | Thiết bị | Performance | Accessibility | Best Practices | SEO |
|---|---|:---:|:---:|:---:|:---:|
| Trang chủ | Mobile | **86** | 96 | 100 | 100 |
| Trang chủ | Desktop | **86** | 96 | 100 | 100 |
| App | Mobile | 90 | 100 | 100 | 100 |
| App | Desktop | 90 | 100 | 100 | 100 |
| Analytics | Mobile | **88** | 100 | 100 | 100 |
| Analytics | Desktop | **88** | 100 | 100 | 100 |

In đậm là các điểm Performance dưới 90.

### Xếp hạng Performance (thấp đến cao)

1. Trang chủ: 86
2. Analytics: 88
3. App: 90

---

## 4. Ảnh chụp kết quả lần đo v2

### Trang chủ

| Mobile | Desktop |
|---|---|
| ![Trang chủ - Mobile](images/lighthouse/v2-home-mobile.png) | ![Trang chủ - Desktop](images/lighthouse/v2-home-desktop.png) |

### App

| Mobile | Desktop |
|---|---|
| ![App - Mobile](images/lighthouse/v2-app-mobile.png) | ![App - Desktop](images/lighthouse/v2-app-desktop.png) |

### Analytics

| Mobile | Desktop |
|---|---|
| ![Analytics - Mobile](images/lighthouse/v2-analytics-mobile.png) | ![Analytics - Desktop](images/lighthouse/v2-analytics-desktop.png) |

---

## 5. Phân tích theo trang

### Trang chủ (`/`)
- Performance 86, thấp nhất trong 3 trang, nên là ưu tiên số một.
- Accessibility 96: còn mất 4 điểm do một vài mục chưa đạt trong phần Accessibility của báo cáo.
- Đây là trang landing có carousel ảnh chụp workspace (WebP 1440 và 720 px, có `width`/`height`, tải lazy trừ ảnh đầu), đồng hồ thử cỡ lớn và các font tự host. Lần đo lại ở mục 11 cho thấy phần tử LCP là đồng hồ thử 25:00.

### App (`/app`)
- Performance 90, đúng ngưỡng, chỉ cần một biến động nhỏ là rơi xuống dưới 90.
- Accessibility, Best Practices, SEO đều 100.
- Trang có nền động, trình phát nhạc và nhiều thành phần tương tác. Khi đo, DevTools hiển thị biểu tượng cảnh báo với số 5, cần mở Console xem 5 cảnh báo là gì.

### Analytics (`/analytics`)
- Performance 88, còn thiếu 2 điểm để đạt ngưỡng 90.
- Nội dung nhẹ (số liệu và biểu đồ tuần), nên điểm chưa cao nhiều khả năng do tải JavaScript và thành phần biểu đồ.
- Cũng có biểu tượng cảnh báo số 5 trong DevTools.

---

## 6. Lịch sử các lần đo trang chủ

Trang chủ đã được đo nhiều lần với kết quả khác nhau, ghi lại để đối chiếu:

| Lần đo | Môi trường | Mobile (P / A / BP / SEO) |
|---|---|---|
| 1 | Build production chạy local (`vite preview`), Lighthouse CLI | 95 / 93 / 100 / 92 |
| 2 | Production Vercel, trang `/` (19/11/2026, 20:03) | 80 / 93 / 100 / 92 |
| 3 (báo cáo này) | Production Vercel, trang `/#features` | 86 / 96 / 100 / 100 |

Điểm chênh lệch có thể do bản deploy đã thay đổi giữa các lần đo, trạng thái bộ nhớ trình duyệt, biến động bình thường của Lighthouse (thường dao động vài điểm), hoặc đo ở hai địa chỉ khác nhau (`/` và `/#features`). Vì vậy khi so sánh trước và sau khi tối ưu cần đo **cùng địa chỉ, cùng điều kiện**.

---

## 7. Hạn chế và lưu ý

- **Cảnh báo IndexedDB:** mọi lượt đo đều hiển thị cảnh báo có dữ liệu IndexedDB lưu sẵn trong trình duyệt, có thể ảnh hưởng điểm Performance. Khi đo lại, nên xóa dữ liệu trang (Application → Storage → Clear site data) hoặc đo trong cửa sổ ẩn danh.
- **Mỗi lượt đo chỉ chạy một lần.** Điểm Lighthouse có thể dao động vài điểm, nên đối chiếu thêm bằng cách đo nhiều lần và lấy trung bình khi chốt số liệu.
- **Điểm Mobile và Desktop trùng nhau** ở cả 3 trang. Thông thường Mobile thấp hơn Desktop. Nguyên nhân hay gặp: chỉ đổi kích thước khung bằng nút thiết bị của DevTools mà không chọn **Desktop** trong mục *Device* của chính tab Lighthouse. Lần đo lại ở mục 11 chạy riêng hai chế độ.
- **Trang chủ đo tại `/#features`** (có phần neo), không phải `/` thuần.
- **Chưa đo các trang Themes, Tracking, About** (có trong menu của trang). Có thể bổ sung ở lần đo sau.
- **Báo cáo này dựa trên điểm số trong ảnh chụp**, chưa phân tích từng chỉ số chi tiết (LCP, TBT, CLS). Các đề xuất bên dưới là giả thuyết cần xác nhận bằng phần *Opportunities* và *Diagnostics* trong báo cáo Lighthouse.

---

## 8. Đề xuất cải thiện (chưa thực hiện trong PR này)

| # | Việc cần làm | Trang áp dụng | Hạng mục tác động | Ưu tiên |
|---|---|---|---|:---:|
| 1 | Mở *Opportunities/Diagnostics* của trang chủ, xác định các chỉ số kéo điểm Performance (LCP, TBT, CLS) | Trang chủ | Performance | Cao |
| 2 | Giảm JavaScript tải ban đầu: tải muộn Sentry và Google Analytics, lazy load thành phần nặng | Cả 3 trang | Performance | Cao |
| 3 | ~~Tối ưu ảnh `app-preview.jpg`~~: ảnh này đã bỏ ở PR #43; ảnh trang chủ đã là WebP có `width`/`height` và lazy load. Còn lại: khai báo `sizes` đúng bề rộng thật để điện thoại tải bản 720 px (đã làm, mục 11) | Trang chủ | Performance | Đã xong |
| 4 | Kiểm tra và đặt kích thước cố định cho carousel và các phần tử gây layout shift | Trang chủ | Performance | Trung bình |
| 5 | Đọc danh sách Accessibility chưa đạt của trang chủ và sửa (nhãn, tương phản, `aria-label`) | Trang chủ | Accessibility | Trung bình |
| 6 | Xem 5 cảnh báo trong Console của `/app` và `/analytics`, xử lý nếu liên quan đến hiệu năng | App, Analytics | Performance, Best Practices | Trung bình |
| 7 | Tải muộn thành phần biểu đồ và dữ liệu phân tích cho trang Analytics | Analytics | Performance | Trung bình |
| 8 | ~~Thêm `font-display: swap`~~: các `@font-face` đã có sẵn `font-display: swap` | Trang chủ | Performance | Đã xong |

---

## 9. Cách tái hiện số liệu

**Cách 1: DevTools (dùng cho báo cáo này)**

1. Mở trang cần đo bằng Chrome ở chế độ ẩn danh.
2. F12 → Application → Storage → **Clear site data**.
3. F12 → tab **Lighthouse** → chọn Mobile hoặc Desktop → tick cả 4 mục → **Analyze page load**.
4. Chụp kết quả và đặt tên theo mẫu `v<lần đo>-<trang>-<thiết bị>.png` trong `docs/images/lighthouse/`. Không ghi đè ảnh của lần đo trước: ảnh `before-*.png` thuộc báo cáo lần đầu `docs/lighthouse-report.md`.

**Cách 2: dòng lệnh (tùy chọn)**

```powershell
npx lighthouse https://focus-flow-two-wheat.vercel.app/ --form-factor=mobile --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=$env:TEMP\home-mobile.json
npx lighthouse https://focus-flow-two-wheat.vercel.app/ --preset=desktop --only-categories=performance,accessibility,best-practices,seo --output=json --output-path=$env:TEMP\home-desktop.json
```

Đặt file kết quả ở thư mục tạm, không đưa vào repo.

---

## 10. Kết luận

FocusFlow đã đạt chất lượng tốt: Best Practices và SEO đạt tuyệt đối, Accessibility từ 96 đến 100. Khoảng cách duy nhất so với mục tiêu 90 điểm nằm ở **Performance của trang chủ (86) và Analytics (88)**, và trang App (90) đang sát ngưỡng. Bước tiếp theo là xác định nguyên nhân cụ thể trong phần Opportunities và Diagnostics, thực hiện các đề xuất ưu tiên cao ở mục 8 trong các PR riêng, sau đó đo lại cùng điều kiện và so sánh với 6 ảnh v2 trong báo cáo này. Mục 11 là lần đo lại sạch và kết quả sau các bản sửa.

---

## 11. Đo lại sạch và kết quả sau khi sửa (21/11/2026)

### 11.1. Cách đo

- **Công cụ:** Lighthouse CLI `12.8.2`, Chrome headless ở chế độ ẩn danh (không extension, không dữ liệu IndexedDB cũ), mỗi trang chạy riêng chế độ Mobile (mặc định) và Desktop (`--preset=desktop`).
- **Trước khi sửa:** đo trên production `https://focus-flow-two-wheat.vercel.app` lúc 01:25 ngày 21/11/2026 (bản `main` sau PR #45).
- **Sau khi sửa:** đo bản build production chạy ở máy (`vite preview`, cổng 4173). Máy chủ này không nén gzip/brotli như Vercel, nên FCP trên mobile kém hơn production vài trăm ms; số liệu chính thức cần đo lại trên production sau khi merge.

### 11.2. Kết quả (P / A / BP / SEO, kèm LCP, TBT, CLS)

| Trang | Thiết bị | Trước (production, sạch) | Sau (build ở máy) |
|---|---|---|---|
| Trang chủ `/` | Mobile | 92 / 100 / 100 / 100, LCP 3,0 s, TBT 110 ms, CLS 0 | **94** / 100 / 100 / 100, LCP 2,6 s, TBT 20 ms, CLS 0 |
| Trang chủ `/` | Desktop | 100 / 100 / 100 / 100, LCP 0,6 s, TBT 0 ms, CLS 0,002 | 100 / 100 / 100 / 100, LCP 0,6 s, TBT 0 ms, CLS 0,002 |
| App `/app` | Mobile | 95 / 100 / 100 / 100, LCP 2,5 s, TBT 40 ms, CLS 0 | **97** / 100 / 100 / 100, LCP 2,3 s, TBT 0 ms, CLS 0 |
| App `/app` | Desktop | 100 / 100 / 100 / 100, LCP 0,6 s, TBT 0 ms, CLS 0,001 | 100 / 100 / 100 / 100, LCP 0,5 s, TBT 0 ms, CLS 0 |
| Analytics `/analytics` | Mobile | 96 / 100 / 100 / 100, LCP 2,6 s, TBT 60 ms, CLS 0,001 | 94 / 100 / 100 / 100, LCP 2,6 s, TBT 0 ms, CLS 0,001 |
| Analytics `/analytics` | Desktop | 95 / 100 / 100 / 100, LCP 0,6 s, TBT 0 ms, CLS 0,134 | **100** / 100 / 100 / 100, LCP 0,5 s, TBT 0 ms, CLS 0 |

Đo sạch thì cả 3 trang đều đạt Performance từ 92 trở lên ngay trên production; điểm 86 và 88 ở mục 3 thấp hơn chủ yếu vì đo trong cửa sổ thường có sẵn dữ liệu IndexedDB (Lighthouse đã cảnh báo ở mọi ảnh) và có thể có extension chạy cùng. Analytics mobile sau khi sửa thấp hơn 2 điểm chỉ vì FCP chậm hơn khi máy chủ ở máy không nén file (TBT đã về 0).

### 11.3. Các bản sửa

| # | Vấn đề Lighthouse báo | Sửa | Tệp |
|---|---|---|---|
| 1 | LCP trang chủ mobile 3,0 s: phần tử LCP là đồng hồ thử 25:00, mỗi chữ số chạy hiệu ứng hiện dần từ trong suốt ngay khi mở trang nên trình duyệt vẽ muộn | Lần mở đầu đồng hồ hiện ngay; hiệu ứng chỉ chạy khi chữ số hoặc theme đổi | `src/app/pages/DemoTimer.tsx` |
| 2 | Cùng lỗi ở `/app`: đồng hồ workspace mờ dần vào ngay khi mở | Chỉ mờ dần khi đổi chế độ hoặc kiểu đồng hồ | `src/features/clock-modes/components/ClockDisplay.tsx` |
| 3 | `/analytics` desktop CLS 0,134: nội dung tải lazy, hiện "Loading…" rồi đẩy footer xuống | Nội dung (nhỏ) đi cùng trang, không tải sau | `src/features/productivity/components/AnalyticsPage.tsx` |
| 4 | Ảnh trang chủ trên điện thoại tải bản 1440 px (thừa 133 KB) vì `sizes` khai báo `100vw` | `sizes` theo bề rộng thật (trừ lề 16 px, carousel 86 %), thêm bản 320 px cho ảnh gốc nhỏ | `HomePage.tsx`, `Slideshow.tsx`, `ThemesPage.tsx`, `public/images/home/custom-original-320.webp` |
| 5 | Accessibility `label-content-name-mismatch`: nút "Login" có `aria-label="Open sign in"` khác chữ hiển thị | Bỏ `aria-label`, tên nút là chữ "Login" | `src/core/hud/AccountMenu.tsx` |

### 11.4. Còn lại (không chặn mục tiêu 90 điểm)

- **JavaScript chưa dùng (khoảng 250 KB):** gồm `gtag.js` của Google Analytics (đã nạp sau sự kiện `load`), thư viện Supabase (cần để kiểm tra phiên đăng nhập) và code workspace (được giữ chạy nền để timer và nhạc không ngắt khi chuyển trang). Tách nhỏ thêm cần thay đổi kiến trúc, để PR riêng nếu cần.
- **CSS chặn hiển thị (khoảng 10 KB):** file CSS chính; mức ảnh hưởng nhỏ khi có nén trên Vercel.
- ~~Đo lại trên production sau khi merge~~: đã đo, xem mục 11.5.

### 11.5. Đo lại trên production sau khi merge (22/11/2026)

Đo bằng Lighthouse CLI `12.8.2`, Chrome headless ẩn danh, trên `https://focus-flow-two-wheat.vercel.app` sau khi các bản sửa ở PR #46, #47 và #51 đã lên production.

| Trang | Thiết bị | P / A / BP / SEO | LCP | TBT | CLS |
|---|---|:---:|:---:|:---:|:---:|
| Trang chủ `/` | Mobile | **97** / 100 / 100 / 100 | 2,1 s | 70 ms | 0 |
| Trang chủ `/` | Desktop | **100** / 100 / 100 / 100 | 0,6 s | 0 ms | 0,002 |
| App `/app` | Mobile | **95** / 100 / 100 / 100 | 2,5 s | 50 ms | 0 |
| App `/app` | Desktop | **100** / 100 / 100 / 100 | 0,4 s | 0 ms | 0,001 |
| Analytics `/analytics` | Mobile | **96** / 100 / 100 / 100 | 2,6 s | 70 ms | 0,001 |
| Analytics `/analytics` | Desktop | **100** / 100 / 100 / 100 | 0,6 s | 0 ms | 0 |

Cả 3 trang đạt mục tiêu Performance từ 90 trở lên trên cả mobile và desktop, các hạng mục khác đều 100. So với lần đo đầu (mục 3 của `lighthouse-report.md`): trang chủ mobile tăng từ 80 lên 97, Analytics mobile từ 83 lên 96.
