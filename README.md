# FocusFlow ⏳✨

> **Aesthetic Workspace & Custom Focus Timer**  
> Không gian làm việc tối giản, thẩm mỹ và tập trung cao độ dành cho sinh viên và tri thức số.

[![React](https://img.shields.io/badge/React-18.x-61dafb?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x_Strict-3178c6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.x-646cff?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.x-38bdf8?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_%7C_Postgres_%7C_Storage-3ecf8e?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Unit_%26_Integration-729b1b?logo=vitest&logoColor=white)](https://vitest.dev/)

---

## 🌟 Giới thiệu

**FocusFlow** là ứng dụng web cá nhân hóa không gian làm việc tập trung (lấy cảm hứng từ Flocus và phong cách thẩm mỹ tối giản). Ứng dụng vận hành theo triết lý **Zero-Backend-Maintenance ($0 Operating Cost)**: triển khai hoàn toàn phía client trên Vercel Edge Network và kết nối trực tiếp với backend Supabase (GoTrue Auth, PostgreSQL 15+ RLS, Storage).

---

## 🚀 Tính năng Cốt lõi

- ⏱️ **Động cơ Đếm giờ Drift-Free:** Web Worker chạy nền triệt tiêu sai số trôi dạt ($\le 100\text{ms}$), hỗ trợ Pomodoro, 52/17, Deep Work, Custom và Stopwatch.
- 🕰️ **Đồng hồ Frosted Glass Capsule:** 3 chế độ hiển thị linh hoạt (Minimal, Circular Ring, Retro Flip Clock) đặt trong viên nang kính mờ tương phản cao.
- 🎨 **Theme Engine 15 Design Tokens:** Tùy biến toàn diện màu sắc, độ mờ capsule, bo góc, font chữ và hiệu ứng nền canvas (Mưa, Tuyết, Đom đóm) với Live Preview tức thì.
- 🎵 **Bộ trộn Âm thanh Môi trường & Lo-fi:** Bộ trộn 3 kênh Web Audio độc lập (Mưa, Brown Noise, Lửa trại) kết hợp trình phát YouTube Lo-fi chạy ngầm.
- 📋 **Hệ thống Năng suất Cá nhân:**
  - **Task Manager:** Quản lý công việc phân loại theo độ ưu tiên, hạn chót và nhãn.
  - **Notepad:** Sổ ghi chép nhanh tự động lưu (debounce 500ms).
  - **Focus Intent:** Gán mục tiêu tập trung trực tiếp lên mặt đồng hồ.
  - **Focus Analytics:** Biểu đồ thời gian tập trung và chuỗi ngày liên tiếp (Streak) tính toán theo múi giờ địa phương.
- 📱 **100% Mobile Parity:** Đầy đủ tính năng trên thiết bị di động qua Bottom Drawer mượt mà.

---

## 📚 Hệ thống Tài liệu Thiết kế (Specifications)

Dự án được đặc tả chi tiết và hoàn chỉnh qua 4 tài liệu kỹ thuật cốt lõi:

| Tài liệu | Vai trò & Nội dung chính |
| :--- | :--- |
| [`docs/PRD.md`](docs/PRD.md) | Yêu cầu sản phẩm (FR-01 đến FR-31), tiêu chí nghiệm thu (AC) dạng Given/When/Then, UX/UI spec và Design Tokens. |
| [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) | Kiến trúc tổng thể Single Page Application, cơ chế Plug-and-Play Slot, ranh giới ESLint, State Machine và lộ trình phân kỳ 4 Phase. |
| [`docs/ERD.md`](docs/ERD.md) | Sơ đồ quan hệ thực thể, từ điển dữ liệu 6 bảng PostgreSQL, hàm trigger hạn ngạch (quota), hàng rào RLS và kịch bản test. |
| [`docs/API_DOCS.md`](docs/API_DOCS.md) | Đặc tả tích hợp Supabase Data API (PostgREST), GoTrue Auth, Storage bucket `user-wallpapers`, RPC `ping`, mô hình lỗi `AppError` và luồng tuần tự. |
| [`AGENTS.md`](AGENTS.md) | Quy định vận hành, chuẩn mực kiểm thử và kỷ luật kỹ thuật dành riêng cho các AI Coding Agents. |

---

## 🛠️ Tech Stack

- **Frontend:** React 18, TypeScript (Strict Mode), Vite 5
- **Styling & Tokens:** Tailwind CSS 3, CSS Variables Design Tokens, Lucide React
- **State Management:** Zustand
- **Backend-as-a-Service:** Supabase (Auth, PostgreSQL 15+, Storage)
- **Testing:** Vitest, React Testing Library (RTL)
- **Deployment:** Vercel ($0 Operating Cost)

---

## 🏗️ Lệnh Chuẩn Phát triển

```bash
# Cài đặt thư viện phụ thuộc
npm install

# Khởi chạy môi trường phát triển cục bộ
npm run dev

# Kiểm tra chất lượng mã nguồn (ESLint ranh giới module)
npm run lint

# Kiểm tra kiểu dữ liệu TypeScript (strict: true)
npm run typecheck

# Chạy toàn bộ bộ kiểm thử tự động (Vitest)
npm run test

# Đóng gói sản phẩm cho production
npm run build
```

---

## 📄 Bản quyền

Phát triển bởi [kitalikedev](https://github.com/kitalikedev) — Dự án mã nguồn mở phục vụ cộng đồng học tập và làm việc tập trung.
