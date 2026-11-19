# Báo cáo Lighthouse (Issue #30)

- **Dự án:** FocusFlow
- **Môi trường đo:** bản production build chạy local (`npm run build` và `npx vite preview`, địa chỉ `http://localhost:4173`)
- **Công cụ:** Lighthouse CLI 13.6.0
- **Ngày đo:** 19/11/2026
- **Nhánh:** `30-improve-lighthouse-scores`
- **Phạm vi PR:** chỉ thêm tài liệu và báo cáo trong `docs/`, không thay đổi mã nguồn

## 1. Điểm số

| Hạng mục       | Mobile | Desktop |
|----------------|:------:|:-------:|
| Performance    | 95     | 100     |
| Accessibility  | 93     | 94      |
| Best Practices | 100    | 100     |
| SEO            | 92     | 91      |

Lưu ý: Lighthouse 13 có thêm hạng mục thử nghiệm "Agentic Browsing" (mobile 47, desktop 50). Hạng mục này kiểm tra WebMCP, `llms.txt` và ARD manifest, nằm ngoài 4 hạng mục tiêu chuẩn nên không đưa vào mục tiêu của issue này.

## 2. Báo cáo chi tiết

- [Báo cáo Mobile (HTML)](lighthouse/mobile.report.html)
- [Báo cáo Desktop (HTML)](lighthouse/desktop.report.html)
- Dữ liệu thô: `lighthouse/mobile.report.json`, `lighthouse/desktop.report.json`

## 3. Nhận xét chung

- Cả 4 hạng mục tiêu chuẩn đều đạt từ 91 điểm trở lên trên cả mobile và desktop.
- Best Practices đạt tuyệt đối 100 trên cả hai thiết bị.
- Performance mobile 95, desktop 100. Bundle đã được chia nhỏ theo trang, nên tải ban đầu nhẹ.
- Các hạng mục còn thiếu điểm chủ yếu do vài lỗi nhỏ, dễ sửa (viewport, `robots.txt`, layout shift).

## 4. Các vấn đề phát hiện

### Accessibility

| Vấn đề | Mobile | Desktop |
|---|:---:|:---:|
| Viewport meta dùng `user-scalable=no` và `maximum-scale=1.0`, chặn người dùng phóng to | 0 | 0 |
| Phần tử có nhãn chữ hiển thị nhưng tên truy cập (accessible name) không khớp | không lỗi | 0 |

### Performance

| Vấn đề | Mobile | Desktop |
|---|:---:|:---:|
| Cumulative Layout Shift | 87 | đạt |
| Avoid large layout shifts / Layout shift culprits | 0 | đạt |
| Reduce unused JavaScript | 50 | 0 |
| Improve image delivery | 50 | 50 |
| LCP request discovery (chẩn đoán) | 0 | 0 |
| Network dependency tree (chẩn đoán) | 0 | 0 |
| Render-blocking requests (chẩn đoán) | 0 | 50 |

Các mục LCP request discovery, Network dependency tree và Render-blocking requests là insight chẩn đoán, không tính trực tiếp vào điểm Performance.

### SEO

| Vấn đề | Mobile | Desktop |
|---|:---:|:---:|
| `robots.txt` không hợp lệ | 0 | 0 |

Nguyên nhân khả dĩ: thư mục `public/` chưa có file `robots.txt`, nên máy chủ SPA trả về `index.html` thay cho robots.txt.

### Agentic Browsing (thử nghiệm, ngoài phạm vi)

- `llms.txt` không theo khuyến nghị.
- ARD manifest không hợp lệ.

## 5. Đề xuất cải thiện (chưa thực hiện trong PR này)

| # | Việc cần làm | Tệp liên quan | Hạng mục tác động | Mức ưu tiên |
|---|---|---|---|---|
| 1 | Đổi viewport thành `width=device-width, initial-scale=1.0` | `index.html` | Accessibility | Cao |
| 2 | Thêm `robots.txt` hợp lệ (ví dụ `User-agent: *` và `Allow: /`) | `public/robots.txt` | SEO | Cao |
| 3 | Xác định phần tử gây layout shift trên mobile (xem mục "Layout shift culprits" trong báo cáo HTML), đặt kích thước cố định hoặc giữ chỗ | Theo báo cáo | Performance | Trung bình |
| 4 | Nén ảnh `app-preview.jpg`, đổi sang WebP, thêm `width` và `height` | `public/images/` | Performance | Trung bình |
| 5 | Giảm JavaScript chưa dùng: tải muộn Sentry và Google Analytics, lazy load component nặng | `src/` | Performance | Trung bình |
| 6 | Sửa `aria-label` trên desktop để chứa đúng chữ hiển thị | Theo báo cáo | Accessibility | Thấp |
| 7 | Thêm `font-display: swap` và preload font dùng ở màn hình đầu | `index.html`, CSS | Performance | Thấp |

## 6. Cách tái hiện số liệu

```powershell
npm run build
npx vite preview

# Ở cửa sổ terminal khác:
npx lighthouse http://localhost:4173 --form-factor=mobile --output=html --output=json --output-path=docs/lighthouse/mobile
npx lighthouse http://localhost:4173 --preset=desktop --output=html --output=json --output-path=docs/lighthouse/desktop
```

## 7. Kết luận

Website đã đạt chất lượng tốt (tất cả hạng mục chính từ 91 trở lên). Việc 1 và 2 trong mục 5 chỉ cần sửa vài dòng và sẽ nâng điểm Accessibility và SEO lên rõ rệt. Các đề xuất còn lại có thể làm trong các PR riêng.
