# Product Requirement Document (PRD) — FocusFlow

**Phiên bản:** 1.2.1  
**Tình trạng:** Sẵn sàng thực thi (Ready for Implementation)  
**Tác giả:** Product Manager & Lead UX Designer  
**Mục tiêu hệ thống:** Custom Focus Timer & Aesthetic Workspace Web Application  

---

## Bảng Tóm Tắt Yêu Cầu Chức Năng (FR Summary by Priority)

| Mức ưu tiên | Mã FR | Tên tính năng | Mô tả tóm lược |
| :--- | :--- | :--- | :--- |
| **P0 (Bắt buộc)** | **FR-01** | Xác thực Email/Password | Đăng ký, đăng nhập, đăng xuất qua Supabase Auth; tắt confirm email để có session ngay. |
| | **FR-02** | Chế độ Khách & Di chuyển dữ liệu | Dùng ngay không cần đăng nhập; migrate dữ liệu guest lên Supabase khi đăng ký hoặc merge khi đăng nhập. |
| | **FR-04** | Động cơ Đếm Giờ Đa Chế độ | Preset Pomodoro (25/5), 52/17, Deep Work 90m, Stopwatch và Custom tùy biến. |
| | **FR-05** | Nghỉ Dài & Tự Động Bắt Đầu | Nghỉ dài sau N chu kỳ; bật/tắt tự động chuyển phiên focus/break. |
| | **FR-06** | Đếm Giờ Chính Xác `Date.now()` | Web Worker phát tick, tính lại hiệu số timestamp, triệt tiêu sai số trôi thời gian ($\le 100\text{ms}$). |
| | **FR-07** | Âm Báo & Thông Báo Hết Giờ | Web Notification và chuông tổng hợp bằng Web Audio `OscillatorNode` + `GainNode`. |
| | **FR-08** | Hệ Thống Phím Tắt & Chống Xung Đột | Space, R, F, M; kiểm soát không kích hoạt phím tắt khi đang nhập liệu văn bản. |
| | **FR-09** | Lưu Trữ & Đồng Bộ Cài Đặt | Lưu trữ và đồng bộ cấu hình người dùng qua Supabase `user_settings` / `localStorage`. |
| | **FR-15** | Bảo Vệ Tương Phản Nền Sáng | Viên nang kính mờ bắt buộc với mức sàn độ đục tự động để tương phản chữ luôn $\ge 4.5:1$. |
| | **FR-16** | Bộ Trộn Âm Thanh Nền Web Audio | Tổng hợp client-side 3 kênh Mưa, Brown Noise, Lửa trại với slider âm lượng độc lập. |
| | **FR-18** | Thanh Điều Khiển Cố Định Dưới Đáy | Master mute, master volume, điều khiển phát YouTube và trạng thái bài hát. |
| | **FR-19** | Quản Lý Tác Vụ Tức Thì | Thêm, sửa, xóa, hoàn thành task (nền tảng cốt lõi của Task Manager). |
| | **FR-20** | Sổ Ghi Chép Tự Động Lưu | Khung ghi chú nhanh (scratchpad) với cơ chế tự động lưu debounce 500ms. |
| | **FR-22** | Ngăn Kéo Tiện Ích Di Động | Mobile Bottom Sheet / Drawer đảm bảo 100% Mobile Parity qua thanh Bottom Nav. |
| | **FR-24** | Động Cơ Giao Diện (Theme Engine) | Quản lý toàn bộ token màu, font, độ mờ qua CSS variables; chuyển theme tức thì $< 100\text{ms}$. |
| **P1 (Quan trọng)** | **FR-10** | Các Kiểu Hiển Thị Đồng Hồ | 3 kiểu hiển thị: Minimal (chữ số trong viên nang), Circular Ring, Retro Flip Clock. |
| | **FR-11** | Vị Trí Hiển Thị & Chế Độ Zen | Center, Mini Corner và Zen Mode (ẩn toàn bộ thanh công cụ, chỉ giữ đồng hồ). |
| | **FR-12** | Popover Tùy Chỉnh Thông Số | Hộp thoại mở nhanh cạnh đồng hồ chỉnh số phút các phiên làm việc/nghỉ ngơi. |
| | **FR-13** | Lưới Ảnh Nền Pixel Art GIF | Thư viện thumbnail trực quan chọn ảnh nền động pixel art tinh tuyển. |
| | **FR-14** | Tải Lên Ảnh Nền Cá Nhân | Upload ảnh/GIF cá nhân $\le 5\text{MB}$ (User: Supabase Storage tối đa 3 file, Guest: IndexedDB 1 file). |
| | **FR-17** | Trình Phát YouTube Chạy Ngầm | IFrame ẩn phát nhạc Lo-fi, quản lý hàng chờ queue, lấy tiêu đề tự động qua NoEmbed. |
| | **FR-19 (Mở rộng)** | Quản Lý Tác Vụ Nâng Cao | Priority (None/Low/Med/High), Due Date, Labels, Tìm kiếm, Lọc và Sắp xếp task. |
| | **FR-21** | Thống Kê Giờ Tập Trung | Biểu đồ cột theo tuần, streak tính theo múi giờ local, lịch sử phiên theo user. |
| | **FR-25** | Bảng Tùy Biến Giao Diện (Customizer) | Live preview tùy chỉnh accent color, viên nang kính, 6 font self-hosted, nền đơn sắc/ảnh. |
| | **FR-26** | Hiệu Ứng Môi Trường Lớp Phủ | Lớp phủ hạt Rain, Snow, Fireflies, Grain, Vignette; giới hạn hạt, tự giảm tải khi $< 55\text{ FPS}$. |
| | **FR-27** | Mẫu Theme Dựng Sẵn & Quản Lý Lưu | 6 preset độc bản (Obsidian, Tokyo, Indigo, Matcha, Amber, Nordic Night); lưu tối đa 10 custom theme cho user (3 cho guest); khôi phục theme khi mở lại. |
| | **FR-29** | Mục Tiêu Tập Trung (Focus Intent) | Ô nhập ý định tập trung trên đồng hồ, liên kết chọn task, lưu vào session analytics. |
| | **FR-30** | Thanh Trạng Thái & Điều Khiển (HUD) | Chấm chu kỳ cycle dots, bộ đếm phiên, streak badge, chỉ báo sync, nút Fullscreen (`Shift + F`). |
| **P2 (Nâng cao)** | **FR-03** | Đăng Nhập Bằng Google OAuth | Đăng nhập một chạm bằng tài khoản Google thông qua Supabase OAuth. |
| | **FR-23** | Chế Độ Ngoại Tuyến & Auto-sync | Lưu `localStorage` khi mất mạng kèm nhãn offline; auto sync lên Supabase khi online (Last-Write-Wins). |
| | **FR-27 (JSON)** | Nhập/Xuất Cấu Hình Theme JSON | Export/Import file JSON kiểm tra whitelist token nghiêm ngặt, chặn URL ngoài độc hại. |
| | **FR-28** | Đồng Hồ Picture-in-Picture (PiP) | Cửa sổ đồng hồ nổi nhỏ qua Document PiP API (Chromium) hoặc fallback Mini Corner. |
| | **FR-31** | Danh Ngôn/Lời Chào & Huy Hiệu Cục Bộ | Mặc định TẮT; danh ngôn nhẹ nhàng; huy hiệu thành tựu cá nhân lưu client, không public ranking. |

---

## 1. Problem

Người dùng (học sinh, sinh viên và nhân viên tri thức) gặp khó khăn trong việc duy trì trạng thái tập trung sâu (Deep Work) do các hạn chế từ giải pháp hiện tại:
* **Giao diện phân mảnh và khô khan:** Hầu hết ứng dụng Pomodoro/Timer hiện nay (như Pomofocus, Forest) sở hữu giao diện tiện ích đơn điệu, thiếu cảm hứng thẩm mỹ (aesthetic), hoặc tạo cảm giác gò bó thay vì một không gian làm việc thư thái.
* **Mất tập trung vì phân tán công cụ:** Người dùng phải mở song song 3–4 thẻ trình duyệt: 1 tab đồng hồ đếm giờ, 1 tab nhạc lo-fi YouTube/Spotify, 1 tab ghi chú nhanh (Notepad) và 1 tab quản lý việc (To-Do), dẫn đến quá tải nhận thức (cognitive overload) và dễ bị sao nhãng khi chuyển đổi qua lại.
* **Đồng hồ đếm sai khi ẩn tab trình duyệt:** Cơ chế `setInterval` thông thường bị trình duyệt (Chrome, Safari) tự động "throttle" (tiết kiệm tài nguyên) khi chạy ngầm hoặc khóa màn hình điện thoại, làm sai lệch thời gian tập trung thực tế.
* **Thiếu khả năng cá nhân hóa theo bối cảnh:** Người dùng không thể linh hoạt tùy biến sâu màu sắc, hiệu ứng môi trường hay font chữ theo tâm trạng, không thể đổi chế độ hiển thị (từ đồng hồ trung tâm sang góc nhỏ khi đọc tài liệu, hoặc chế độ Zen tối giản tuyệt đối) và không tự do phối các nguồn âm thanh môi trường trực tiếp tại một màn hình duy nhất.

---

## 2. Context

### 2.1. Phạm vi & Mục tiêu sản phẩm
FocusFlow là ứng dụng web cung cấp không gian làm việc thẩm mỹ tối giản, kết hợp giữa bộ đếm thời gian linh hoạt (Custom Timer), máy phát âm thanh thư giãn (Ambient Sound & YouTube Lo-Fi), các công cụ ghi chú/nhiệm vụ tức thì (Quick Productivity), và hệ thống tùy biến giao diện đa dạng (Theme Customization Engine). Ứng dụng hoạt động mượt mà trên trình duyệt máy tính (Desktop Web) lẫn thiết bị di động (Mobile Web) mà không cần cài đặt.

Sản phẩm tham chiếu chức năng tiện ích từ hai web focus timer điển hình (Flocus, Pomodoro Timer) nhưng tuyệt đối **KHÔNG** sao chép ảnh nền, logo, tên gọi, câu chữ hay bố cục chi tiết của họ. Điểm khác biệt cốt lõi của FocusFlow là hệ thống Theme Engine mở rộng, cho phép biến đổi không gian tập trung theo phong cách cá nhân với tiêu chuẩn tương phản chuẩn xác.

### 2.2. Đối tượng người dùng mục tiêu
* **Sinh viên / Học sinh:** Cần không gian ôn thi, học nhóm ảo (Study with me), nghe nhạc nền không có quảng cáo chen ngang, theo dõi số giờ học tập hằng ngày và tùy biến không gian học tập thẩm mỹ.
* **Nhân viên văn phòng / Freelancers / Lập trình viên:** Cần công cụ hỗ trợ phiên làm việc sâu (Deep Work 90 phút hoặc Pomodoro chuẩn), giao diện tối giản kiểu Linear/Apple để không gây xao nhãng màn hình làm việc thứ hai.

### 2.3. Nền tảng & Ràng buộc công nghệ
* **Deployment & Hosting:** Vercel (Hobby Free Tier — áp dụng theo hạn mức free tier hiện hành, cần kiểm tra lại trước khi deploy; Edge Network toàn cầu).
* **Database & BaaS:** Supabase Free Tier (PostgreSQL Database, Supabase Auth, Supabase Storage — áp dụng theo hạn mức free tier hiện hành, cần kiểm tra lại trước khi deploy).
* **Xác thực Supabase Auth:** Cấu hình tắt tính năng "Confirm email" cho phiên bản này để cấp phiên đăng nhập (session token) hợp lệ ngay sau khi đăng ký mà không bắt buộc bước kích hoạt qua thư điện tử.
* **Frontend Core:** React 18, TypeScript 5, Vite 5, Tailwind CSS 3, Lucide React (Icons), Zustand (State Management), Vitest + React Testing Library.
* **Tối ưu chi phí $0:** Toàn bộ âm thanh nền thiên nhiên (mưa, tiếng ồn nâu, lửa trại) và chuông báo hết giờ được tổng hợp trực tiếp bằng Web Audio API trên client để tiêu tốn 0 byte băng thông máy chủ. Video lo-fi phát thông qua YouTube IFrame Embed (tận dụng CDN YouTube).

### 2.4. Out of Scope (Những thứ KHÔNG làm trong phiên bản này)
1. **Không làm ứng dụng Native Mobile:** Không phát triển app iOS (Swift) hay Android (Kotlin) đóng gói; chỉ hỗ trợ Responsive Web App và PWA cơ bản trên trình duyệt.
2. **Không làm tính năng Bản đồ / Đường sắt / Địa lý:** Không tích hợp tính năng bản đồ không gian, lộ trình tàu hỏa hay GPS tracking.
3. **Không tích hợp Cổng thanh toán (Payment Gateway):** Không có gói trả phí, không thu thập thẻ tín dụng, toàn bộ tính năng khả dụng miễn phí.
4. **Không làm tính năng Mạng xã hội / Phòng học công cộng (Multiplayer Rooms):** Không hỗ trợ kết bạn, nhắn tin thời gian thực qua WebRTC/Socket, không gọi video.
5. **Không làm Trình đồng bộ lịch ngoài:** Không đồng bộ hai chiều với Google Calendar, Notion hay Apple Reminders.
6. **Không làm Bảng xếp hạng thi đua công khai (Public Leaderboards):** Tránh tạo áp lực xã hội và cạnh tranh độc hại; mọi thống kê và huy hiệu thành tựu chỉ hiển thị riêng cho người dùng.
7. **Không tích hợp Discord Rich Presence hay Webhook ngoài:** Giữ trải nghiệm tập trung khép kín.
8. **Không hỗ trợ Hình nền Video (.mp4 / .webm streaming):** Để đảm bảo zero-bandwidth server và hiệu năng khung hình $\ge 55\text{ FPS}$.
9. **Không hỗ trợ Nhập Theme từ đường dẫn URL mạng tùy ý:** Chỉ hỗ trợ file JSON cục bộ kiểm tra nghiêm ngặt whitelist token để triệt tiêu nguy cơ XSS/CSRF.

---

## 3. Functional Requirements (FR) + Acceptance Criteria (AC)

### Nhóm A: Core (P0)

#### FR-01: Đăng ký, Đăng nhập, Đăng xuất bằng Email/Password
* **Mô tả:** Cung cấp cơ chế xác thực người dùng an toàn bằng email và mật khẩu qua Supabase Auth. Cấu hình tắt "Confirm email" để có session hoạt động ngay lập tức sau khi đăng ký.
* **Mức độ ưu tiên:** P0
* **Acceptance Criteria:**
  * **AC-01.1 (Đăng ký thành công và nhận Session ngay):**  
    * **Given:** Người dùng chưa đăng nhập mở Auth Modal ở tab "Sign Up", hệ thống Supabase Auth đã được cấu hình tắt tùy chọn "Confirm email".  
    * **When:** Nhập email hợp lệ (RFC 5322) và mật khẩu $\ge 6$ ký tự, bấm nút "Create Account".  
    * **Then:** Hệ thống gửi request tạo tài khoản tới Supabase Auth, nhận về status `200/201`, lập tức khởi tạo session token (không chờ xác nhận email), lưu trạng thái user vào Zustand store, đóng Auth Modal, và hiển thị thông báo "Account created successfully" trong 3000ms.
  * **AC-01.2 (Đăng nhập thất bại):**  
    * **Given:** Người dùng ở tab "Sign In".  
    * **When:** Nhập sai mật khẩu hoặc email chưa tồn tại và bấm "Sign In".  
    * **Then:** Hệ thống hiển thị thông báo lỗi cụ thể `Invalid login credentials` bên dưới form nhập trong vòng 1000ms, không xóa trường email của người dùng.
  * **AC-01.3 (Đăng xuất):**  
    * **Given:** Người dùng đang đăng nhập với session hợp lệ.  
    * **When:** Bấm nút "Log Out" trong menu cài đặt.  
    * **Then:** Supabase Auth hủy token cục bộ, xóa trạng thái user trong Zustand store, và đưa ứng dụng về trạng thái Guest Mode trong vòng 300ms.

#### FR-02: Chế độ Khách (Guest Mode) & Cơ chế Di chuyển Dữ liệu (Migration)
* **Mô tả:** Cho phép người dùng sử dụng đầy đủ tính năng ngay lập tức mà không cần tạo tài khoản (lưu dữ liệu vào `localStorage`). Khi đăng ký mới hoặc đăng nhập tài khoản cũ, hệ thống cung cấp quy trình di chuyển dữ liệu rõ ràng.
* **Mức độ ưu tiên:** P0
* **Acceptance Criteria:**
  * **AC-02.1 (Sử dụng Guest):**  
    * **Given:** Người dùng lần đầu truy cập trang web mà không đăng nhập.  
    * **When:** Người dùng tạo 3 task, ghi 1 đoạn notepad, và thay đổi cài đặt timer.  
    * **Then:** Dữ liệu được lưu ngay vào `localStorage` dưới các key `focusflow_tasks`, `focusflow_notes`, `focusflow_settings`. Khi tải lại trang (F5), toàn bộ dữ liệu này hiển thị nguyên vẹn.
  * **AC-02.2 (Data Migration khi Đăng ký mới):**  
    * **Given:** Trình duyệt đang chứa dữ liệu Guest Mode (3 tasks, 1 note) trong `localStorage`.  
    * **When:** Người dùng thực hiện đăng ký tài khoản mới thành công theo FR-01.  
    * **Then:** Hệ thống kích hoạt routine `migrateGuestData()`, gọi batch `upsert` vào các bảng `tasks`, `notes`, `user_settings` trên Supabase tương ứng với `user_id` mới tạo; sau khi response trả về `200 OK`, `localStorage` dữ liệu guest được dọn dẹp và cờ `is_migrated` được cập nhật thành `true` trong cột `is_migrated` (loại boolean) thuộc bảng `user_settings`.
  * **AC-02.3 (Đăng nhập tài khoản cũ khi trình duyệt đang có dữ liệu Guest):**  
    * **Given:** Trình duyệt đang chứa dữ liệu Guest Mode (task, note) trong `localStorage` và người dùng thực hiện đăng nhập vào một tài khoản đã tồn tại từ trước trên Supabase.  
    * **When:** Quá trình đăng nhập thành công.  
    * **Then:** Hệ thống hiển thị modal xác nhận: *"Bạn có muốn nhập dữ liệu từ phiên khách vào tài khoản này không?"*:  
      * Nếu chọn **"Đồng ý" (Merge)**: Hệ thống thêm nối tiếp (append) toàn bộ task và note từ `localStorage` vào tài khoản trên Supabase, giữ nguyên `user_settings` hiện có trên Cloud (không ghi đè settings), dọn dẹp `localStorage` của guest, và lưu cờ `is_migrated = true` vào cột `is_migrated` trong bảng `user_settings`.  
      * Nếu chọn **"Từ chối" (Discard)**: Hệ thống giữ nguyên toàn bộ dữ liệu hiện có trên Cloud, xóa sạch dữ liệu guest trong `localStorage`, và đóng modal xác nhận.

#### FR-03: Đăng nhập bằng Google OAuth
* **Mô tả:** Cung cấp phương thức đăng nhập nhanh một chạm sử dụng tài khoản Google qua Supabase OAuth.
* **Mức độ ưu tiên:** P2
* **Acceptance Criteria:**
  * **AC-03.1 (Google Sign-In Popup):**  
    * **Given:** Người dùng đang mở Auth Modal.  
    * **When:** Nhấp vào nút "Continue with Google".  
    * **Then:** Trình duyệt mở cửa sổ xác thực OAuth của Google; sau khi người dùng cấp quyền, redirect trở lại FocusFlow, khởi tạo session thành công, và lưu email/avatar người dùng vào Zustand store.

#### FR-04: Động cơ Đếm Giờ Đa Chế độ (Custom Timer Engine)
* **Mô tả:** Bộ đếm thời gian hỗ trợ các preset chuẩn hóa (Pomodoro 25/5, 52/17, Deep Work 90m, Stopwatch đếm xuôi, và Custom tùy biến thời gian làm việc/nghỉ ngơi).
* **Mức độ ưu tiên:** P0
* **Acceptance Criteria:**
  * **AC-04.1 (Chuyển đổi Preset Pomodoro 25/5):**  
    * **Given:** Timer đang ở trạng thái dừng (Idle).  
    * **When:** Người dùng chọn preset "Pomodoro".  
    * **Then:** Đồng hồ hiển thị thời lượng `25:00`, nhãn phiên là "Focus", và thời gian nghỉ ngắn định cấu hình sẵn là `05:00`.
  * **AC-04.2 (Chuyển đổi Preset 52/17 & Deep Work 90):**  
    * **Given:** Người dùng chọn preset "52/17" hoặc "Deep Work".  
    * **When:** Áp dụng lựa chọn.  
    * **Then:** Timer chuyển sang hiển thị tương ứng `52:00` (nghỉ `17:00`) hoặc `90:00` (nghỉ `15:00`).
  * **AC-04.3 (Chế độ Stopwatch):**  
    * **Given:** Người dùng chọn preset "Stopwatch".  
    * **When:** Bấm bắt đầu (Start).  
    * **Then:** Đồng hồ đếm xuôi từ `00:00` tăng dần mỗi 1000ms và không có thời gian kết thúc định trước.

#### FR-05: Nghỉ Dài (Long Break) & Tự Động Bắt Đầu (Auto-start)
* **Mô tả:** Cấu hình chu kỳ nghỉ dài sau N phiên tập trung hoàn thành và tùy chọn tự động chuyển phiên mà không cần thao tác bấm nút.
* **Mức độ ưu tiên:** P0
* **Acceptance Criteria:**
  * **AC-05.1 (Kích hoạt Long Break):**  
    * **Given:** Thiết lập hệ thống là `long_break_interval = 4` phiên, thời gian nghỉ dài là `15:00`.  
    * **When:** Người dùng hoàn thành phiên Focus thứ 4 liên tiếp.  
    * **Then:** Trạng thái timer tự động chuyển sang "Long Break" với thời lượng `15:00` thay vì chuyển sang "Short Break" thông thường.
  * **AC-05.2 (Auto-start Toggle):**  
    * **Given:** Tùy chọn `auto_start_breaks = true` và `auto_start_focus = false`.  
    * **When:** Phiên Focus hiện tại đếm về `00:00`.  
    * **Then:** Hệ thống phát chuông thông báo, chuyển sang chế độ "Short Break" và tự động kích hoạt đếm ngược ngay lập tức mà không cần người dùng click nút Start.

#### FR-06: Đếm Giờ Chính Xác Dựa Trên Timestamp (`Date.now()`)
* **Mô tả:** Bộ đếm thời gian được điều khiển bằng Web Worker timer phát tick định kỳ. Mỗi tick và mỗi khi tab thay đổi hiển thị, hệ thống tính toán lại thời gian còn lại dựa trên hiệu số `remaining = targetEndTime - Date.now()`, loại bỏ hoàn toàn độ trôi (drift) do trình duyệt bóp nghẹt tài nguyên hoặc máy tính chuyển sang chế độ ngủ.
* **Mức độ ưu tiên:** P0
* **Acceptance Criteria:**
  * **AC-06.1 (Kiểm soát Background Drift):**  
    * **Given:** Timer còn lại `20:00` trên tổng số `25:00` (xác lập `targetEndTime = Date.now() + 1200000`).  
    * **When:** Người dùng chuyển sang tab khác trong 10 phút (chính xác 600,000ms) rồi quay lại tab FocusFlow.  
    * **Then:** Đồng hồ hiển thị `10:00` với sai số $\le 100\text{ms}$ (giá trị hiển thị làm tròn xuống giây theo `Math.floor(remainingSeconds)`), không bị hiện tượng thời gian còn lại lớn hơn do trình duyệt throttle.
  * **AC-06.2 (Xử lý khi máy tính Sleep/Wake):**  
    * **Given:** Timer đang chạy còn `15:00`, người dùng gập màn hình laptop trong 20 phút rồi mở lại.  
    * **When:** Trình duyệt nhận sự kiện `visibilitychange` hoặc `focus`.  
    * **Then:** Hệ thống tính toán $Date.now() \ge targetEndTime$, chuyển ngay timer về trạng thái Hoàn thành (`00:00`) với sai số thời gian $\le 100\text{ms}$ (giá trị hiển thị làm tròn xuống giây), phát âm thanh kết thúc và kích hoạt notification.

#### FR-07: Âm Báo & Thông Báo Trình Duyệt Khi Hết Giờ
* **Mô tả:** Phát âm thanh thông báo được tổng hợp bằng Web Audio API và gửi Web Notification đến hệ điều hành khi phiên làm việc hoặc phiên nghỉ kết thúc.
* **Mức độ ưu tiên:** P0
* **Acceptance Criteria:**
  * **AC-07.1 (Browser Notification):**  
    * **Given:** Người dùng đã cấp quyền `Notification.permission === 'granted'` và tab FocusFlow đang bị ẩn.  
    * **When:** Đồng hồ đếm về mốc `00:00`.  
    * **Then:** Một Web Notification xuất hiện trên hệ điều hành với tiêu đề "Session Completed!" và nội dung "Time for a break!".
  * **AC-07.2 (Chime Audio Tổng Hợp Client-side):**  
    * **Given:** Cài đặt âm thanh chuông đang bật với âm lượng > 0.  
    * **When:** Phiên đếm ngược chạm mốc `00:00`.  
    * **Then:** Hệ thống phát chuông thông báo được tổng hợp trực tiếp bằng `OscillatorNode` + `GainNode` trong Web Audio API (không sử dụng file âm thanh tải từ server), với độ trễ phản hồi < 100ms.

#### FR-08: Hệ Thống Phím Tắt (Keyboard Shortcuts) & Kiểm Soát Xung Đột
* **Mô tả:** Cho phép điều khiển toàn bộ thao tác cốt lõi bằng bàn phím mà không bị xung đột khi đang gõ văn bản.
* **Mức độ ưu tiên:** P0
* **Acceptance Criteria:**
  * **AC-08.1 (Phím tắt cơ bản ngoài ô nhập liệu):**  
    * **Given:** Người dùng không `focus` vào bất kỳ thẻ `input`, `textarea`, hoặc `contenteditable` nào.  
    * **When:** Người dùng nhấn `Space` (bắt đầu/tạm dừng), `R` (reset timer), `F` (bật/tắt Zen Mode), `Shift + F` (bật/tắt Fullscreen), hoặc `M` (mute/unmute toàn bộ âm thanh).  
    * **Then:** Hệ thống kích hoạt hành động tương ứng trong vòng 50ms.
  * **AC-08.2 (Ngăn chặn xung đột khi gõ text):**  
    * **Given:** Con trỏ bàn phím đang nằm trong thẻ `<input>` tạo task, Focus Intent hoặc `<textarea>` của Notepad.  
    * **When:** Người dùng nhấn phím `Space` hoặc `R`.  
    * **Then:** Ký tự khoảng trắng hoặc chữ "r" được nhập vào trường văn bản bình thường; timer KHÔNG bị tạm dừng hay bị reset.
  * **AC-08.3 (Không can thiệp phím tắt trình duyệt khi dùng Modifier Keys):**  
    * **Given:** Người dùng không ở trong ô nhập liệu văn bản nhưng đang giữ một trong các phím bổ trợ `Ctrl`, `Cmd` (`Meta`), `Alt`.  
    * **When:** Người dùng nhấn các phím `Space`, `R`, `F`, hoặc `M` (ví dụ: `Cmd + R` để tải lại trang, `Ctrl + F` để tìm kiếm trên trình duyệt).  
    * **Then:** Hệ thống KHÔNG kích hoạt các hành động của FocusFlow (không reset, không bật/tắt Zen mode, không mute), nhường quyền xử lý hoàn toàn cho trình duyệt; riêng tổ hợp `Shift + F` (không kèm Ctrl/Cmd/Alt) kích hoạt chế độ Fullscreen (FR-30), và phím `F` đơn lẻ (không kèm phím bổ trợ) kích hoạt Zen Mode (FR-11).

#### FR-09: Lưu Trữ & Đồng Bộ Cài Đặt Người Dùng (Settings Sync)
* **Mô tả:** Mọi cấu hình cá nhân (preset, âm lượng, giao diện đồng hồ, hình nền đã chọn, active theme) được tự động lưu trữ và đồng bộ xuyên suốt các thiết bị đăng nhập.
* **Mức độ ưu tiên:** P0
* **Acceptance Criteria:**
  * **AC-09.1 (Đồng bộ cấu hình Cloud):**  
    * **Given:** Người dùng đã đăng nhập trên máy tính A và đổi kiểu đồng hồ sang "Retro Flip Clock" cùng theme "Midnight Indigo".  
    * **When:** Người dùng mở ứng dụng và đăng nhập cùng tài khoản trên điện thoại B.  
    * **Then:** Cấu hình trên điện thoại B tự động tải từ bảng `user_settings` trên Supabase và áp dụng ngay kiểu "Retro Flip Clock" cùng theme "Midnight Indigo" trong vòng 1500ms sau khi đăng nhập.

---

### Nhóm B: Clock Modes

#### FR-10: Các Kiểu Hiển Thị Đồng Hồ (Clock Visual Styles)
* **Mô tả:** Hỗ trợ 3 phong cách đồng hồ hiển thị: Minimal (chữ số thuần túy trong viên nang kính mờ), Circular Ring (vòng tròn tiến trình SVG), và Retro Flip Clock (thẻ lật kỹ thuật số cổ điển).
* **Mức độ ưu tiên:** P1
* **Acceptance Criteria:**
  * **AC-10.1 (Chế độ Minimal):**  
    * **Given:** Người dùng chọn kiểu "Minimal".  
    * **When:** Timer chạy.  
    * **Then:** Đồng hồ hiển thị thời gian dạng chữ số kích thước lớn (`text-7xl` tới `text-9xl`) nằm trong Frosted Glass Capsule theo FR-15, không có các đồ họa phụ (không vòng tròn tiến trình ring, không thẻ lật flip clock).
  * **AC-10.2 (Chế độ Circular Ring):**  
    * **Given:** Người dùng chọn kiểu "Circular Ring".  
    * **When:** Timer đếm ngược.  
    * **Then:** Một vòng tròn SVG bao quanh số thời gian; thuộc tính `stroke-dashoffset` giảm đều tương ứng theo tỷ lệ phần trăm thời gian còn lại so với tổng thời lượng phiên.
  * **AC-10.3 (Chế độ Retro Flip Clock):**  
    * **Given:** Người dùng chọn kiểu "Retro Flip Clock".  
    * **When:** Chữ số giây hoặc phút thay đổi.  
    * **Then:** Phần tử số chia làm 2 nửa trên/dưới với hiệu ứng chuyển động lật (3D CSS flip transform) trong 300ms mô phỏng đồng hồ cơ học.

#### FR-11: Vị Trí Hiển Thị & Chế Độ Zen (Placement & Zen Mode)
* **Mô tả:** Cho phép đặt đồng hồ ở vị trí trung tâm màn hình (Center), góc nhỏ màn hình (Mini Corner) hoặc chuyển sang Zen Mode (ẩn toàn bộ thanh công cụ, chỉ giữ đồng hồ).
* **Mức độ ưu tiên:** P1
* **Acceptance Criteria:**
  * **AC-11.1 (Mini Corner Mode):**  
    * **Given:** Người dùng đang ở màn hình Desktop.  
    * **When:** Chọn vị trí "Mini Corner".  
    * **Then:** Viên nang đồng hồ thu nhỏ kích thước xuống góc dưới bên phải màn hình (kích thước tối đa $240 \times 80\text{px}$), giải phóng 90% không gian chính giữa.
  * **AC-11.2 (Zen Mode):**  
    * **Given:** Người dùng đang ở chế độ xem chuẩn.  
    * **When:** Bấm nút Zen Mode hoặc nhấn phím `F`.  
    * **Then:** Toàn bộ thanh header, thanh dock điều khiển dưới đáy, bảng task, notepad đều chuyển sang `opacity: 0` và `pointer-events: none` trong 300ms; chỉ còn lại đồng hồ và hình nền. Di chuyển chuột hoặc chạm màn hình sẽ làm xuất hiện nút "Exit Zen" ở góc trên cùng.

#### FR-12: Popover Tùy Chỉnh Thông Số Đồng Hồ (Timer Settings Popover)
* **Mô tả:** Hộp thoại popover mở nhanh ngay cạnh đồng hồ cho phép điều chỉnh số phút của Focus, Short Break, Long Break mà không cần chuyển trang.
* **Mức độ ưu tiên:** P1
* **Acceptance Criteria:**
  * **AC-12.1 (Điều chỉnh giá trị hợp lệ):**  
    * **Given:** Popover tùy chỉnh đang mở.  
    * **When:** Người dùng nhập thời lượng Focus là `45` phút (giới hạn từ 1 đến 180 phút) và bấm "Save".  
    * **Then:** Timer cập nhật ngay giá trị `45:00` vào bộ đếm hiện tại nếu timer đang Idle, và lưu giá trị mới vào state.
  * **AC-12.2 (Validation chặn giá trị sai):**  
    * **Given:** Người dùng nhập số phút là `0` hoặc `-10` hoặc số lớn hơn `180`.  
    * **When:** Bấm "Save" hoặc blur khỏi input.  
    * **Then:** Input viền đỏ, hiển thị nhãn cảnh báo `Must be between 1 and 180 mins`, nút "Save" bị vô hiệu hóa (`disabled`).

---

### Nhóm C: Theme, Styling & Wallpaper Customization

#### FR-13: Lưới Chọn Hình Nền Pixel Art GIF Tinh Tuyển
* **Mô tả:** Cung cấp sẵn thư viện ảnh nền động Pixel Art GIF chất lượng cao, hiển thị dưới dạng lưới thumbnail trực quan, tối giản chữ mô tả.
* **Mức độ ưu tiên:** P1
* **Acceptance Criteria:**
  * **AC-13.1 (Áp dụng hình nền):**  
    * **Given:** Modal chọn hình nền đang mở hiển thị danh sách 8–12 preset Pixel Art (ví dụ: Lofi Cafe, Cyberpunk Rain, Cozy Bedroom).  
    * **When:** Người dùng click vào một thumbnail.  
    * **Then:** Hình nền toàn màn hình thay đổi sang GIF tương ứng trong vòng 200ms, thumbnail được chọn hiển thị viền active màu trắng (`ring-2 ring-white`).

#### FR-14: Tải Lên Ảnh Nền Cá Nhân (Custom Wallpaper Upload)
* **Mô tả:** Người dùng có thể tải lên ảnh hoặc file GIF cá nhân. Người dùng đã đăng nhập lưu vào Supabase Storage; tài khoản khách (Guest) lưu trữ cục bộ.
* **Mức độ ưu tiên:** P1
* **Acceptance Criteria:**
  * **AC-14.1 (Giới hạn dung lượng và định dạng):**  
    * **Given:** Người dùng mở tính năng Upload Wallpaper.  
    * **When:** Chọn file có dung lượng $> 5\text{MB}$ hoặc định dạng không phải `.jpg, .png, .gif, .webp`.  
    * **Then:** Hệ thống từ chối tải file, hiển thị lỗi `File size exceeds 5MB or format unsupported` và không thực hiện upload.
  * **AC-14.2 (Lưu trữ theo User Type):**  
    * **Given:** Người dùng tải lên file GIF hợp lệ ($\le 5\text{MB}$).  
    * **When:** Quá trình tải hoàn tất.  
    * **Then:**  
      * Nếu là **User đăng nhập**: File được upload lên Supabase Storage bucket `user-wallpapers/{user_id}/`, URL công khai được lưu vào hồ sơ người dùng (giới hạn tối đa 3 file).  
      * Nếu là **Guest**: File được chuyển thành Base64/Blob URL và lưu trữ trong IndexedDB của trình duyệt (giới hạn tối đa 1 ảnh tự chọn để không làm tràn bộ nhớ).

#### FR-15: Đảm Bảo Tương Phản & Khả Năng Đọc Trên Nền Sáng (Readability Protection)
* **Mô tả:** Khối chứa đồng hồ bắt buộc nằm trong viên nang kính mờ (Frosted Glass Capsule Shield). Màu nền viên nang `--capsule-bg` chỉ được chọn trong dải tối (độ sáng tương đối relative luminance $\le 0.20$). Các thông số (độ đục, độ mờ blur, bo góc, màu viền) được kế thừa linh hoạt từ Theme Engine (FR-24), nhưng luôn chịu sự kiểm soát của quy tắc Mức sàn Tự động (Contrast Floor Threshold) để đảm bảo tỷ lệ tương phản chữ $\ge 4.5:1$ ngay cả trên hình nền sáng màu.
* **Cơ chế đo độ sáng nền ($L_{\text{effective}}$):**
  * Ảnh preset: Có sẵn giá trị `luminance` chuẩn xác được tính toán trước trong metadata.
  * Ảnh/GIF user tải lên: Được lấy mẫu 1 lần duy nhất lúc upload (khung hình đầu tiên, thu nhỏ về kích thước $32 \times 32\text{px}$ để tính độ sáng trung bình và lưu vào metadata).
  * Nền đơn sắc: Tính toán độ sáng tương đối trực tiếp từ mã màu hex/rgb.
  * Độ sáng hiệu dụng $L_{\text{effective}}$ được tính toán tức thì sau khi áp dụng độ tối (`--bg-dim`) và độ sáng (`--bg-brightness`): $L_{\text{effective}} = L_{\text{base}} \times (\text{brightness} / 100) \times (1 - \text{dim} / 100)$. Tuyệt đối không phân tích ảnh theo thời gian thực (no real-time per-frame canvas scanning).
* **Mức độ ưu tiên:** P0
* **Acceptance Criteria:**
  * **AC-15.1 (Frosted Glass Capsule Shield với Contrast Floor):**  
    * **Given:** Hình nền toàn trang có độ sáng hiệu dụng $L_{\text{effective}} > 0.60$ (xác định từ metadata ảnh hoặc màu đơn sắc sau khi áp dụng `--bg-dim` và `--bg-brightness`).  
    * **When:** Đồng hồ hiển thị ở bất kỳ chế độ hiển thị nào (Minimal, Circular Ring, Retro Flip).  
    * **Then:** Khối chứa đồng hồ luôn được bọc trong viên nang kính mờ tối màu (`--capsule-bg` có độ sáng tương đối $\le 0.20$) với độ đục tối thiểu $\ge 50\%$ (`opacity >= 0.50`, tức `bg-black/50` trở lên) kết hợp đổ bóng sâu `shadow-2xl shadow-black/80 drop-shadow-2xl`, đảm bảo tỷ lệ tương phản chữ đo được luôn đạt tối thiểu `4.5:1` (chuẩn WCAG 2.1 AA).

#### FR-24: Động Cơ Giao Diện & Biến Thiết Kế (Theme Engine)
* **Mô tả:** Toàn bộ bảng màu, phông chữ, độ mờ kính, bo góc và kích thước được quản lý dưới dạng các Design Tokens CSS variables trên `:root`. Tailwind CSS ánh xạ trực tiếp vào các biến này. Đổi theme không cần reload trang và áp dụng trong $< 100\text{ms}$. Theme mặc định giữ vững phong cách đơn sắc Apple/Linear Dark Mode.
* **Mức độ ưu tiên:** P0 (Nền tảng)
* **Danh sách Design Tokens tối thiểu:**
  1. `--color-accent`: Mã màu nhấn (Hex/HSL).
  2. `--color-accent-contrast`: Màu chữ trên nền accent (tự động đảo trắng/đen để đạt $\ge 4.5:1$).
  3. `--capsule-bg`: Màu nền viên nang kính (chỉ được chọn trong dải tối: độ sáng tương đối relative luminance $\le 0.20$; bộ chọn màu tự động kẹp giá trị về dải này và hiển thị chú thích).
  4. `--capsule-opacity`: Độ đục viên nang ($0.20$ – $0.95$).
  5. `--capsule-blur`: Độ mờ kính (`0px` – `32px`).
  6. `--capsule-radius`: Bo góc (`4px` – `48px`).
  7. `--capsule-border-width`: Độ dày viền (`0px` – `2px`).
  8. `--capsule-border-color`: Màu viền kính (`rgba(...)`).
  9. `--font-clock`: Phông chữ của đồng hồ.
  10. `--clock-scale`: Tỷ lệ kích thước chữ số đồng hồ ($80\%$ – $140\%$).
  11. `--clock-weight`: Độ đậm nét font (`300`, `400`, `600`, `700`).
  12. `--bg-dim`: Độ tối phủ màn hình nền ($0\%$ – $80\%$).
  13. `--bg-blur`: Độ mờ của hình nền ($0\text{px}$ – $20\text{px}$).
  14. `--bg-brightness`: Độ sáng hình nền ($40\%$ – $120\%$).
  15. `--bg-solid-color`: Mã màu khi dùng nền đơn sắc không ảnh.
* **Acceptance Criteria:**
  * **AC-24.1 (Thời gian áp dụng token CSS):**  
    * **Given:** Ứng dụng đang chạy ở bất kỳ màn hình nào.  
    * **When:** Người dùng chọn một theme mới hoặc thay đổi một biến token.  
    * **Then:** Toàn bộ UI cập nhật thuộc tính CSS tương ứng trong vòng $< 100\text{ms}$ mà không tải lại trang (0 HTTP navigation request).
  * **AC-24.2 (Theme mặc định chuẩn Apple/Linear Dark Mode):**  
    * **Given:** Người dùng lần đầu truy cập hoặc chọn "Reset to Default".  
    * **When:** Theme mặc định được nạp.  
    * **Then:** Hệ thống kích hoạt theme "Obsidian Minimal" với `--color-accent: #ffffff`, `--capsule-bg: rgba(0, 0, 0, 0.35)`, `--capsule-blur: 24px`, `--capsule-border-width: 1px`, không sử dụng màu gradient hay neon.

#### FR-25: Bảng Điều Khiển Tùy Biến Giao Diện (Theme Customizer)
* **Mô tả:** Panel tùy biến dạng slide-over (desktop) hoặc bottom sheet (mobile) có Live Preview (xem trước trực tiếp), đi kèm 2 nút "Áp dụng" (Apply) và "Hoàn tác" (Revert). Cung cấp tùy biến Accent Color, Viên nang kính mờ (kèm mức sàn tương phản), Phông chữ đồng hồ (6 font self-hosted), và Nền không gian (ảnh hoặc màu đơn sắc).
* **Mức độ ưu tiên:** P1
* **Acceptance Criteria:**
  * **AC-25.1 (Live Preview & Hoàn tác):**  
    * **Given:** Bảng Theme Customizer đang mở và người dùng thay đổi bo góc hoặc màu accent.  
    * **When:** Người dùng bấm "Revert" hoặc đóng panel mà chưa bấm "Apply".  
    * **Then:** Toàn bộ token CSS lập tức hoàn tác về giá trị ban đầu trong $< 50\text{ms}$. Nếu bấm "Apply", cấu hình mới được lưu vĩnh viễn vào state.
  * **AC-25.2 (Kiểm soát tương phản Accent Color):**  
    * **Given:** Người dùng nhập mã màu hex tùy ý vào ô Accent Color.  
    * **When:** Mã màu có tỷ lệ tương phản so với chữ hoặc nền viên nang $< 4.5:1$.  
    * **Then:** Hệ thống tự động làm đậm hoặc làm sáng màu hex để đạt chuẩn WCAG AA $\ge 4.5:1$ kèm thông báo nhỏ `Contrast adjusted to 4.5:1 for readability`.
  * **AC-25.3 (Mức sàn Opacity tự động khi độ sáng hiệu dụng Leffective > 0.60):**  
    * **Given:** Nền đang chọn có độ sáng hiệu dụng $L_{\text{effective}} > 0.60$ (xác định từ metadata ảnh hoặc mã màu sau khi áp dụng `--bg-dim` và `--bg-brightness`, không phân tích thời gian thực).  
    * **When:** Người dùng kéo slider độ đục viên nang kính về mức $< 50\%$ hoặc chọn màu nền viên nang.  
    * **Then:** Hệ thống tự động khóa slider độ đục ở mức sàn $50\%$ (`opacity = 0.50`), tự kẹp màu viên nang về dải tối (luminance $\le 0.20$), và hiển thị chú thích `Locked at min 50% on bright background`.
  * **AC-25.4 (Tải font self-hosted theo yêu cầu):**  
    * **Given:** Font hiện tại của đồng hồ là "Inter".  
    * **When:** Người dùng chọn font mới "Space Mono" từ danh sách 6 font self-hosted.  
    * **Then:** Trình duyệt chỉ nạp duy nhất tệp `/fonts/space-mono.woff2` (dung lượng $\le 30\text{KB}$), không gọi Google Fonts CDN, và áp dụng font mới cho đồng hồ trong $< 150\text{ms}$.
  * **AC-25.5 (Tùy chọn nền màu đơn sắc):**  
    * **Given:** Người dùng không muốn dùng ảnh Pixel Art.  
    * **When:** Chọn chế độ "Solid Color" và chọn mã màu `#121214`.  
    * **Then:** Hình nền toàn màn hình chuyển sang màu đơn sắc `#121214` trong $< 100\text{ms}$, các thanh điều chỉnh độ tối/mờ của ảnh tự động ẩn đi.

#### FR-26: Hiệu Ứng Môi Trường Lớp Phủ (Ambient Effects)
* **Mô tả:** Lớp phủ hạt và hiệu ứng quang học thẩm mỹ nhẹ nhàng trên workspace: Rain (mưa rơi), Snow (tuyết rơi), Fireflies (đom đóm bay), Grain (hạt phim điện ảnh cổ điển), Vignette (tối góc màn hình nghệ thuật). Mỗi hiệu ứng có thanh trượt cường độ độc lập và cơ chế tự giảm tải khi sụt giảm FPS.
* **Mức độ ưu tiên:** P1
* **Acceptance Criteria:**
  * **AC-26.1 (Hiển thị hạt theo cường độ):**  
    * **Given:** Người dùng kích hoạt hiệu ứng "Fireflies" ở cường độ 50%.  
    * **When:** Hiệu ứng render trên canvas/overlay.  
    * **Then:** Số lượng hạt hiển thị là 20 hạt (tương ứng 50% mức trần 40 hạt), tốc độ khung hình duy trì $\ge 55\text{ FPS}$ trên máy tính.
  * **AC-26.2 (Tạm dừng khi tab ẩn):**  
    * **Given:** Hiệu ứng hạt đang chạy.  
    * **When:** Người dùng chuyển sang tab khác trong trình duyệt (`document.hidden === true`).  
    * **Then:** Vòng lặp render `requestAnimationFrame` dừng hoàn toàn, đưa CPU/GPU overhead về 0%.
  * **AC-26.3 (Tự động giảm tải khi FPS < 55 trên Desktop hoặc < 50 trên Mobile):**  
    * **Given:** Thiết bị người dùng bị sụt giảm tốc độ khung hình (FPS < 55 trên máy tính hoặc FPS < 50 trên điện thoại di động) liên tục trong 3 giây.  
    * **When:** Bộ giám sát hiệu năng phát hiện.  
    * **Then:** Hệ thống tự động giảm 50% số lượng hạt để đưa FPS trở lại ngưỡng an toàn ($\ge 55\text{ FPS}$ trên máy tính, $\ge 50\text{ FPS}$ trên điện thoại di động).
  * **AC-26.4 (Tuân thủ `prefers-reduced-motion`):**  
    * **Given:** Thiết bị người dùng bật chế độ giảm chuyển động trong hệ điều hành.  
    * **When:** Kích hoạt hiệu ứng môi trường.  
    * **Then:** Các hiệu ứng chuyển động hạt (Rain/Snow/Fireflies) tự động chuyển sang dạng tĩnh hoặc bị tắt hoàn toàn; hiệu ứng Grain và Vignette giữ dạng static filter tĩnh.

#### FR-27: Mẫu Giao Diện Dựng Sẵn & Quản Lý Theme Lưu (Theme Presets & Saved Themes)
* **Mô tả:** Cung cấp 6 theme dựng sẵn độc bản mang phong cách riêng của FocusFlow. Người dùng đã đăng nhập lưu tối đa 10 theme tùy biến; Guest lưu tối đa 3 theme trong `localStorage`. Cho phép đổi tên, xóa, áp dụng nhanh, và xuất/nhập file JSON an toàn (P2).
* **Mức độ ưu tiên:** P1 (Presets & Save Theme), P2 (Import/Export JSON)
* **Danh sách 6 Theme Presets độc bản:**
  1. **Obsidian Minimal:** Đơn sắc đen sâu (`#09090b`), chữ trắng, kính mờ tối giản chuẩn Linear Dark Mode, font Inter.
  2. **Tokyo Fog:** Tông xám tro sương mù (`#18181b`), kính xám nhẹ, accent trắng ngà, font Space Mono.
  3. **Midnight Indigo:** Tông lam chàm đêm muộn (`#0b0f19`), viên nang xanh than, accent xanh băng tuyết (`#38bdf8`), font JetBrains Mono.
  4. **Matcha Slate:** Tông xanh trà tĩnh lặng (`#0f1412`), kính xanh rêu sẫm, accent ngọc bích nhạt (`#4ade80`), font Outfit.
  5. **Amber Wood:** Tông hoàng hôn gỗ ấm (`#140f0b`), viên nang nâu hổ phách trầm, accent cam ấm (`#fb923c`), font Playfair Display.
  6. **Nordic Night:** Tông xanh đêm Bắc Âu (`#0f172a`), viền mờ băng tuyết, accent lam nhạt (`#93c5fd`), font Silkscreen Pixel.
* **Acceptance Criteria:**
  * **AC-27.1 (Chuyển đổi tức thì giữa 6 Presets):**  
    * **Given:** Modal theme đang mở.  
    * **When:** Người dùng click vào preset "Tokyo Fog".  
    * **Then:** Toàn bộ bảng màu, bo góc, độ mờ kính và font chữ chuyển sang thông số của "Tokyo Fog" trong vòng $< 100\text{ms}$.
  * **AC-27.2 (Giới hạn số theme lưu theo tài khoản):**  
    * **Given:** Người dùng đã lưu đủ 10 theme tùy biến (hoặc 3 theme với Guest).  
    * **When:** Bấm nút "Save as New Theme".  
    * **Then:** Hệ thống từ chối tạo mới, hiển thị cảnh báo `Limit reached (10 themes). Please delete an existing theme to save.`
  * **AC-27.3 (Bảo mật Import Theme JSON — P2):**  
    * **Given:** Người dùng tải lên file JSON có trường lạ ngoài danh sách whitelist token hoặc có URL hình nền ngoài.  
    * **When:** Hệ thống kiểm tra tính hợp lệ của file.  
    * **Then:** File bị từ chối nạp, báo lỗi `Invalid theme file format. External URLs are not allowed.`, không có token nào bị thay đổi.

---

### Nhóm D: Audio

#### FR-16: Bộ Trộn Âm Thanh Nền Tổng Hợp Bằng Web Audio API
* **Mô tả:** Trình tạo âm thanh môi trường không bản quyền gồm 3 âm thanh cốt lõi: Tiếng mưa (Rain), Tiếng ồn nâu (Brown Noise), Tiếng lửa trại tí tách (Campfire). Mỗi âm thanh có cơ chế sinh âm chuyên biệt và thanh trượt âm lượng độc lập.
* **Mức độ ưu tiên:** P0
* **Acceptance Criteria:**
  * **AC-16.1 (Sinh âm thanh Rain client-side không tốn băng thông):**  
    * **Given:** Ứng dụng đã khởi tạo `AudioContext`.  
    * **When:** Người dùng kéo slider âm lượng "Rain" từ `0` lên `50%`.  
    * **Then:** Web Audio API kích hoạt bộ sinh White Noise đi qua bộ lọc thông dải (Bandpass Filter) và bộ lọc thông thấp (Lowpass Filter) dao động ngẫu nhiên mô phỏng giọt nước rơi mà không gửi bất kỳ HTTP request tải file âm thanh nào về server, `gainNode.gain.value` của kênh mưa đạt `0.5`.
  * **AC-16.2 (Điều chỉnh âm lượng riêng biệt giữa các kênh):**  
    * **Given:** Người dùng bật đồng thời cả 3 âm "Rain", "Brown Noise" và "Campfire".  
    * **When:** Thay đổi thanh trượt âm lượng của từng kênh.  
    * **Then:** Giá trị `gainNode.gain.value` của kênh tương ứng thay đổi từ `0.0` đến `1.0` mà không làm thay đổi biên độ hoặc làm gián đoạn luồng phát của 2 kênh còn lại.
  * **AC-16.3 (Sinh âm thanh Brown Noise client-side):**  
    * **Given:** Ứng dụng đã khởi tạo `AudioContext`.  
    * **When:** Người dùng kích hoạt kênh âm thanh "Brown Noise" và điều chỉnh slider âm lượng.  
    * **Then:** Web Audio API sử dụng `AudioBuffer` sinh chuỗi số ngẫu nhiên thuật toán tích phân (white noise tích lũy qua bộ lọc) tạo tần số âm trầm ấm áp với 0 request mạng và điều khiển âm lượng độc lập qua `gainNode` của kênh Brown Noise.
  * **AC-16.4 (Sinh âm thanh Campfire client-side):**  
    * **Given:** Ứng dụng đã khởi tạo `AudioContext`.  
    * **When:** Người dùng kích hoạt kênh âm thanh "Campfire" và điều chỉnh slider âm lượng.  
    * **Then:** Web Audio API kết hợp Brown Noise làm âm nền ấm với các xung tín hiệu ngẫu nhiên biên độ cao cực ngắn (buffer impulses) mô phỏng tiếng củi nổ lách tách mà không gửi HTTP request tải file âm thanh, điều khiển âm lượng độc lập qua `gainNode` của kênh Campfire.

#### FR-17: Trình Phát YouTube Chạy Ngầm Với Hàng Chờ (Queue) & Lấy Tên Qua Noembed
* **Mô tả:** Tích hợp trình phát YouTube IFrame API ẩn, cho phép dán URL video/playlist lo-fi, duy trì hàng đợi phát và tự động lấy tiêu đề video thông qua dịch vụ `https://noembed.com/embed?url=...`.
* **Mức độ ưu tiên:** P1
* **Acceptance Criteria:**
  * **AC-17.1 (Thêm bài hát và lấy tiêu đề):**  
    * **Given:** Người dùng dán đường dẫn YouTube hợp lệ (ví dụ: `https://www.youtube.com/watch?v=jfKfPfyJRdk`) vào ô "Add YouTube Track".  
    * **When:** Bấm nút Enter hoặc Add.  
    * **Then:** Hệ thống gửi GET request tới `https://noembed.com/embed?url={URL}`, trích xuất trường `title`, và thêm item vào danh sách Queue với tên bài thực tế trong vòng 1000ms.
  * **AC-17.2 (Chuyển bài tự động):**  
    * **Given:** Hàng chờ có 3 bài hát và bài số 1 đang phát.  
    * **When:** YouTube Player kích hoạt sự kiện `YT.PlayerState.ENDED`.  
    * **Then:** Trình phát tự động chuyển sang bài số 2 trong danh sách hàng đợi và cập nhật UI bài đang phát.

#### FR-18: Thanh Điều Khiển Cố Định Dưới Đáy (Fixed Bottom Control Bar)
* **Mô tả:** Thanh điều khiển cố định sát cạnh dưới màn hình, tích hợp master volume, nút toggle play/pause nhanh toàn bộ âm thanh, nút mở mixer, và trạng thái bài hát đang phát.
* **Mức độ ưu tiên:** P0
* **Acceptance Criteria:**
  * **AC-18.1 (Master Mute):**  
    * **Given:** Có âm thanh Web Audio và YouTube đang phát.  
    * **When:** Click nút Speaker/Mute trên thanh Control Bar hoặc nhấn phím `M`.  
    * **Then:** Toàn bộ âm thanh im lặng ngay lập tức (`gainNode.gain.value = 0` và YouTube pause); icon chuyển thành loa gạch chéo (`VolumeX`). Click lần nữa khôi phục mức âm lượng trước đó.

---

### Nhóm E: Productivity & Advanced Workspace Features

#### FR-19: Quản Lý Tác Vụ Tức Thì & Nâng Cao (Task Manager)
* **Mô tả:** Bảng quản lý công việc toàn diện cho phép thêm, sửa, xóa, hoàn thành; bổ sung mức độ ưu tiên (Priority), ngày hết hạn (Due Date), nhãn phân loại (Labels), tìm kiếm, lọc và sắp xếp.
* **Mức độ ưu tiên:** P0 (Core CRUD: Thêm, sửa, xóa, hoàn thành), P1 (Mở rộng: Priority, Due Date, Labels, Search & Filter)
* **Giới hạn trường dữ liệu:**
  * Độ dài tiêu đề task: Tối đa 120 ký tự.
  * Nhãn phân loại (Labels): Tối đa 5 labels trên 1 task; tối đa 20 labels cho một người dùng/guest; độ dài mỗi label tối đa 24 ký tự.
* **Acceptance Criteria:**
  * **AC-19.1 (Thêm công việc cơ bản):**  
    * **Given:** Bảng Task đang mở.  
    * **When:** Người dùng gõ "Hoàn thành báo cáo tài chính" và nhấn phím `Enter`.  
    * **Then:** Task mới xuất hiện đầu danh sách với checkbox chưa tích, thời gian phản hồi UI $< 50\text{ms}$, và lưu vào storage (Local hoặc Supabase).
  * **AC-19.2 (Đánh dấu hoàn thành):**  
    * **Given:** Có 1 task trong danh sách.  
    * **When:** Người dùng click vào checkbox của task.  
    * **Then:** Text của task chuyển sang gạch ngang (`line-through`) với màu chữ mờ (`text-zinc-500`), trạng thái `is_completed` đổi thành `true`.
  * **AC-19.3 (Xóa công việc):**  
    * **Given:** Có 1 task tồn tại.  
    * **When:** Click vào icon thùng rác (`Trash2`).  
    * **Then:** Task bị xóa khỏi UI và danh sách lưu trữ ngay lập tức.
  * **AC-19.4 (Thiết lập Mức ưu tiên, Due Date và Labels — P1):**  
    * **Given:** Một task đang ở chế độ chỉnh sửa.  
    * **When:** Người dùng đặt Priority = "High", Due Date = ngày mai, và thêm 2 nhãn "Work", "Urgent".  
    * **Then:** Thẻ task hiển thị huy hiệu đỏ (High), ngày hết hạn và 2 nhãn phân loại; lưu trữ thành công vào DB/localStorage.
  * **AC-19.5 (Tìm kiếm và lọc tác vụ — P1):**  
    * **Given:** Danh sách gồm 10 task với nhiều nhãn và mức ưu tiên khác nhau.  
    * **When:** Người dùng gõ "báo cáo" vào ô tìm kiếm và chọn bộ lọc Priority = "High".  
    * **Then:** Danh sách chỉ hiển thị các task chứa từ "báo cáo" và có độ ưu tiên High trong vòng $< 100\text{ms}$.
  * **AC-19.6 (Sắp xếp tác vụ — P1):**  
    * **Given:** Danh sách nhiều task có hạn chót khác nhau.  
    * **When:** Người dùng chọn sắp xếp theo "Due Date (Ascending)".  
    * **Then:** Các task có hạn chót gần nhất được đẩy lên đầu danh sách.

#### FR-20: Sổ Ghi Chép Tự Động Lưu (Auto-saving Notepad)
* **Mô tả:** Khung ghi chú nhanh (scratchpad) cho phép ghi chép ý tưởng bất chợt mà không sợ mất dữ liệu nhờ cơ chế tự động lưu (Debounced Auto-save).
* **Mức độ ưu tiên:** P0
* **Acceptance Criteria:**
  * **AC-20.1 (Tự động lưu với debounce):**  
    * **Given:** Người dùng đang gõ nội dung vào Notepad.  
    * **When:** Người dùng ngừng gõ phím trong 500ms.  
    * **Then:** Hệ thống kích hoạt lưu dữ liệu vào `localStorage` (nếu là guest) hoặc gọi API Supabase `notes` (nếu đã đăng nhập); chỉ báo "Saved" xuất hiện ở góc dưới khung ghi chú.
  * **AC-20.2 (Khôi phục ghi chú khi reload):**  
    * **Given:** Người dùng đã lưu đoạn ghi chú 200 từ.  
    * **When:** F5 tải lại trang web hoặc đóng trình duyệt và mở lại.  
    * **Then:** Khung Notepad hiển thị chính xác 100% nội dung đã nhập trước đó.

#### FR-21: Thống Kê Giờ Tập Trung (Focus Analytics)
* **Mô tả:** Bảng biểu đồ trực quan hóa tổng số giờ tập trung theo ngày trong tuần, chuỗi ngày liên tục (streak), phân bổ thời gian theo từng Focus Intent/Task, và danh sách lịch sử các phiên đã hoàn thành.
* **Mức độ ưu tiên:** P1
* **Acceptance Criteria:**
  * **AC-21.1 (Ghi nhận phiên hoàn thành):**  
    * **Given:** Người dùng vừa hoàn thành phiên Focus 25 phút.  
    * **When:** Timer kết thúc.  
    * **Then:** Một bản ghi mới được thêm vào lịch sử phiên (`focus_sessions`) với trường `duration_minutes: 25`, `completed_at: timestamp`.
  * **AC-21.2 (Tính toán Streak chính xác theo múi giờ Local):**  
    * **Given:** Ranh giới một ngày được xác định từ `00:00:00` đến `23:59:59` theo múi giờ địa phương (local timezone) của trình duyệt; người dùng đã hoàn thành ít nhất một phiên tập trung vào ngày hôm qua.  
    * **When:** Người dùng hoàn thành ít nhất một phiên tập trung trong ngày hôm nay trước `23:59:59` theo giờ local và mở bảng thống kê Analytics.  
    * **Then:** Huy hiệu "Current Streak" tăng thêm 1 ngày (ví dụ: "🔥 5 Days Streak"). Nếu qua mốc `23:59:59` giờ local mà không có phiên nào được ghi nhận, streak tự động reset về 1 khi hoàn thành phiên kế tiếp.
  * **AC-21.3 (Biểu đồ cột theo tuần):**  
    * **Given:** Dữ liệu tuần hiện tại từ Thứ Hai đến Chủ Nhật.  
    * **When:** Mở tab Analytics.  
    * **Then:** Hiển thị biểu đồ 7 cột đại diện cho 7 ngày; chiều cao mỗi cột tỷ lệ thuận với số phút tập trung trong ngày đó.

#### FR-22: Ngăn Kéo Tiện Ích Di Động (Mobile Bottom Sheet / Drawer)
* **Mô tả:** Trên màn hình di động, toàn bộ công cụ năng suất và tiện ích quản trị được gom vào thanh Bottom Sheet có thể vuốt mở linh hoạt qua thanh Bottom Navigation.
* **Mức độ ưu tiên:** P0
* **Acceptance Criteria:**
  * **AC-22.1 (Mở Drawer tác vụ và âm thanh):**  
    * **Given:** Kích thước màn hình viewport $< 640\text{px}$.  
    * **When:** Người dùng chạm vào icon "Tasks" hoặc "Audio" trên thanh navigation dưới đáy.  
    * **Then:** Một Bottom Sheet trượt lên từ đáy màn hình chiếm $85\%$ chiều cao viewport, hiển thị nội dung công cụ tương ứng (Tasks/Notepad hoặc Audio Mixer/YouTube Player) với nút đóng (`X`) rõ ràng.
  * **AC-22.2 (Mở Drawer mở rộng qua nút 'More'):**  
    * **Given:** Người dùng đang sử dụng FocusFlow trên thiết bị di động.  
    * **When:** Người dùng chạm vào nút "More" trên thanh bottom navigation.  
    * **Then:** Bottom Sheet mở ra hiển thị menu điều hướng chứa đầy đủ các phân hệ: Wallpaper & Theme Customizer (FR-13, FR-14, FR-25), Timer Settings (FR-12), Focus Analytics (FR-21), và Auth / Profile Manager (FR-01, FR-02), đảm bảo mọi tính năng Desktop đều có đường truy cập trực tiếp.

#### FR-23: Chế Độ Ngoại Tuyến & Tự Động Đồng Bộ (Offline Mode & Auto-sync)
* **Mô tả:** Cho phép người dùng tiếp tục làm việc bình thường (thêm/sửa task, ghi chép notepad, đổi settings) khi mất kết nối mạng, tự động lưu cục bộ và đồng bộ lên Supabase ngay khi có kết nối trở lại.
* **Mức độ ưu tiên:** P2
* **Acceptance Criteria:**
  * **AC-23.1 (Lưu ngoại tuyến khi mất mạng):**  
    * **Given:** Thiết bị người dùng mất kết nối Internet (`navigator.onLine === false`).  
    * **When:** Người dùng tạo/sửa task, sửa notepad, hoặc thay đổi cài đặt timer.  
    * **Then:** Mọi thay đổi được ghi nhận tức thì vào `localStorage` kèm timestamp `updated_at`, và thanh thông báo nhỏ xuất hiện với nội dung *"Offline Mode — changes saved locally"*.
  * **AC-23.2 (Tự động đồng bộ khi có mạng lại):**  
    * **Given:** Trình duyệt đang chứa các thay đổi ngoại tuyến chưa đồng bộ.  
    * **When:** Kết nối Internet được phục hồi (`window` nhận sự kiện `online`).  
    * **Then:** Hệ thống tự động gửi yêu cầu đồng bộ batch lên Supabase trong vòng 5000ms, áp dụng quy tắc giải quyết xung đột **Last-Write-Wins** dựa trên trường thời gian `updated_at` (bản ghi nào có `updated_at` mới hơn sẽ được lưu), và tự động ẩn thông báo Offline Mode sau khi đồng bộ thành công.

#### FR-28: Đồng Hồ Thu Nhỏ Picture-in-Picture (PiP Mini Timer)
* **Mô tả:** Hỗ trợ mở cửa sổ nổi nhỏ ngoài màn hình trình duyệt thông qua Document Picture-in-Picture API (cho các trình duyệt Chromium). Nếu trình duyệt không hỗ trợ (Safari, Firefox), nút PiP tự động ẩn hoặc bấm vào sẽ chuyển sang chế độ "Mini Corner" góc màn hình (FR-11).
* **Mức độ ưu tiên:** P2
* **Acceptance Criteria:**
  * **AC-28.1 (Mở cửa sổ PiP thành công):**  
    * **Given:** Trình duyệt hỗ trợ `window.documentPictureInPicture` và timer đang chạy còn `18:45`.  
    * **When:** Người dùng click nút icon PiP trên thanh điều khiển.  
    * **Then:** Một cửa sổ popup nổi kích thước $260 \times 120\text{px}$ mở ra chứa thời gian đếm ngược `18:45`, nút Play/Pause và nhãn phiên; timer chạy đồng bộ với tab chính, sai số $\le 100\text{ms}$.
  * **AC-28.2 (Graceful Fallback trên trình duyệt không hỗ trợ):**  
    * **Given:** Trình duyệt là Safari hoặc Firefox (`'documentPictureInPicture' in window === false`).  
    * **When:** Người dùng nhấp nút PiP.  
    * **Then:** Hệ thống tự động chuyển đồng hồ chính về vị trí "Mini Corner" (FR-11) tại góc dưới bên phải màn hình làm việc mà không sinh bất kỳ lỗi console nào.

#### FR-29: Mục Tiêu Tập Trung (Focus Intent)
* **Mô tả:** Ô nhập ngắn đặt phía trên viên nang đồng hồ cho phép người dùng xác định mục tiêu làm việc ("What is your focus intent?"), có thể gõ văn bản tự do (tối đa 80 ký tự) hoặc chọn một đầu việc có sẵn từ Task Manager. Bản nháp ô Focus Intent khi chưa bắt đầu phiên hoặc đang chỉnh sửa chỉ được lưu cục bộ tại client (`localStorage`). Khi một phiên Focus hoàn thành, `intent_title` và `task_id` được ghi nhận chính thức vào bản ghi `focus_sessions` (đồng bộ lên Supabase đối với user đã đăng nhập, lưu trữ trong `localStorage` đối với Guest) để Analytics thống kê theo đầu việc.
* **Mức độ ưu tiên:** P1
* **Acceptance Criteria:**
  * **AC-29.1 (Gán task vào Focus Intent):**  
    * **Given:** Danh sách Task đang có mục "Viết báo cáo tài chính".  
    * **When:** Người dùng bấm vào nút chọn task trên ô Focus Intent và chọn mục này.  
    * **Then:** Ô Intent hiển thị "Viết báo cáo tài chính", gán `task_id` vào phiên hiện tại.
  * **AC-29.2 (Ghi nhận phiên Analytics theo Intent):**  
    * **Given:** Ô Focus Intent đang ghi "Thiết kế UI Tokens" và phiên Focus 25 phút kết thúc.  
    * **When:** Timer chạm mốc `00:00`.  
    * **Then:** Bản ghi `focus_sessions` được tạo kèm `intent_title: "Thiết kế UI Tokens"` (lưu lên Supabase nếu user đã đăng nhập, lưu vào `localStorage` nếu là Guest); tab Analytics hiển thị số phút tập trung cho đầu việc này.
  * **AC-29.3 (Xử lý khi Task bị xóa):**  
    * **Given:** Một task đã được gán vào Focus Intent.  
    * **When:** Người dùng xóa task đó trong Task Manager.  
    * **Then:** Ô Focus Intent vẫn giữ nguyên chuỗi text tiêu đề công việc, trường `task_id` đổi thành `null`, và các phiên đã ghi nhận trước đó trong Analytics không bị mất tên.

#### FR-30: Thanh Hiển Thị Trạng Thái & Điều Khiển Nhanh (HUD & Quick Controls)
* **Mô tả:** Tích hợp các chấm chu kỳ trực quan (Cycle Dots), bộ đếm số phiên đã xong trong ngày, badge chuỗi streak, icon trạng thái đồng bộ dữ liệu (Synced / Syncing / Offline), và nút kích hoạt chế độ Toàn màn hình (Fullscreen API qua phím tắt `Shift + F`).
* **Mức độ ưu tiên:** P1
* **Acceptance Criteria:**
  * **AC-30.1 (Hiển thị chấm chu kỳ Cycle Dots):**  
    * **Given:** Thiết lập `long_break_interval = 4` phiên và người dùng đã hoàn thành 2 phiên Focus.  
    * **When:** Quan sát viên nang đồng hồ.  
    * **Then:** Ngay dưới các tab chế độ hiển thị 4 chấm tròn: 2 chấm sáng màu accent (đã xong) và 2 chấm viền mờ `border-white/20` (chưa hoàn thành).
  * **AC-30.2 (Chỉ báo trạng thái Sync Indicator):**  
    * **Given:** Người dùng đang sử dụng bình thường thì thiết bị mất kết nối mạng.  
    * **When:** `window` bắt sự kiện `offline`.  
    * **Then:** Icon trạng thái đồng bộ trên thanh HUD chuyển ngay sang biểu tượng đám mây gạch chéo với tooltip "Offline — changes saved locally" trong $< 100\text{ms}$.
  * **AC-30.3 (Nút Fullscreen và phím tắt Shift + F):**  
    * **Given:** Người dùng đang ở màn hình làm việc thông thường.  
    * **When:** Nhấn phím `Shift + F` hoặc click nút Fullscreen trên thanh HUD.  
    * **Then:** Trình duyệt mở rộng toàn màn hình (`requestFullscreen`); nhấn lần nữa khôi phục kích thước ban đầu.

#### FR-31: Danh Ngôn/Lời Chào Tùy Chọn & Huy Hiệu Cục Bộ (Quotes/Greetings & Local Achievements)
* **Mô tả:** Lời chào theo buổi và danh ngôn cảm hứng ngắn gọn (MẶC ĐỊNH TẮT HOÀN TOÀN để tránh gây xao nhãng); Hệ thống huy hiệu thành tựu cá nhân tự động mở khóa dựa trên dữ liệu phiên, hoàn toàn không có bảng xếp hạng công khai hay chia sẻ giữa các người dùng.
* **Mức độ ưu tiên:** P2 (Mặc định TẮT)
* **Acceptance Criteria:**
  * **AC-31.1 (Mặc định tắt hoàn toàn Quotes & Greetings):**  
    * **Given:** Tài khoản mới tạo hoặc người dùng mở app lần đầu.  
    * **When:** Nhìn vào màn hình chính.  
    * **Then:** Tuyệt đối không hiển thị bất kỳ dòng chữ chào mừng hay danh ngôn nào; cờ `show_quotes` trong Settings có giá trị `false`.
  * **AC-31.2 (Mở khóa Achievement cục bộ):**  
    * **Given:** Người dùng hoàn thành phiên làm việc thứ 5 trong ngày.  
    * **When:** Timer kết thúc.  
    * **Then:** Thông báo nhỏ góc màn hình xuất hiện: `🏆 Achievement Unlocked: Unstoppable (5 sessions completed today!)`, lưu huy hiệu vào danh sách thành tựu cá nhân trên thiết bị.

---

## 4. UI Spec

### 4.1. Sơ Đồ Bố Cục ASCII (Layout Wireframes)

#### Desktop Main Workspace Layout with HUD & Focus Intent
```text
+----------------------------------------------------------------------------------------------------+
|  [Logo FocusFlow]   [🔥 5 Streak]   [☁ Synced]                      [Theme] [Audio] [Login/Profile]|
+----------------------------------------------------------------------------------------------------+
|                                                                                                    |
|                                     +---------------------------+                                  |
|                                     |  🎯 [Focus Intent: PRD v1.2]                             |
|                                     |---------------------------|                                  |
|                                     |    [Pomodoro] [52/17]     |                                  |
|                                     |        ● ● ○ ○ (Cycle)    |                                  |
|                                     |                           |                                  |
|                                     |         24 : 58           |                                  |
|                                     |                           |                                  |
|                                     |    [ ▶ Start ]  [ ↺ ]     |                                  |
|                                     +---------------------------+                                  |
|                                       Frosted Glass Capsule Shield                                 |
|                                                                                                    |
|  +--------------------+                                                      +------------------+  |
|  | Tasks (Priority)   |                                                      | Quick Note:      |  |
|  | [!] [x] Standup    |                                                      | - Theme tokens   |  |
|  | [ ] PRD Review     |                                                      | - Self-host font |  |
|  | + Add new task...  |                                                      |                  |  |
|  +--------------------+                                                      +------------------+  |
|     Task Panel (L)                                                              Notepad (R)        |
+----------------------------------------------------------------------------------------------------+
|  [|| Play]  Lo-fi Chill Beats  [Vol ---o---]  |  Rain [-o-] Fire [--o]  | [PiP 🗖] [Zen ⛶] [⛶ Full]|
+----------------------------------------------------------------------------------------------------+
                                      Fixed Bottom Control Bar
```

#### Theme Customizer Slide-over Panel (Desktop)
```text
+---------------------------------------------------------------------+------------------------------+
|                                                                     | Theme Customizer         [✕] |
|                                                                     |------------------------------|
|                                                                     | Presets:                     |
|                                                                     | [Obsidian] [Tokyo] [Indigo]  |
|                                                                     | [Matcha]   [Amber] [Nordic]  |
|                                                                     |                              |
|                                                                     | Accent Color:                |
|                                                                     | (●) (●) (●) (●) (●) [#ffffff]|
|                        MAIN WORKSPACE PREVIEW                       | [Contrast: 8.2:1 (Pass AA)]  |
|                        (Live updates on drag)                       |                              |
|                                                                     | Capsule Glass:               |
|                                                                     | - Opacity:  [----o-----] 50% |
|                                                                     | - Blur:     [------o---] 20px|
|                                                                     | - Radius:   [---o------] 16px|
|                                                                     |                              |
|                                                                     | Typography:                  |
|                                                                     | Font: [Space Mono        ▼]  |
|                                                                     | Scale: 100% [---o------]     |
|                                                                     |                              |
|                                                                     | Ambient Effects:             |
|                                                                     | [x] Fireflies [---o----] 40% |
|                                                                     |                              |
|                                                                     | [ Revert ]       [ Apply ]   |
+---------------------------------------------------------------------+------------------------------+
```

#### Mobile Main View & Extended [More] Drawer
```text
  +--------------------------------+       +--------------------------------+
  | [FocusFlow]  [🔥5]  [☁]  [👤]   |       | [FocusFlow]  [🔥5]  [☁]  [👤]   |
  +--------------------------------+       +--------------------------------+
  |    🎯 [Focus Intent: PRD...]   |       |                                |
  |   +------------------------+   |       |   === Extended Drawer (85%H) ===|
  |   |    [Pomo]  ● ● ○ ○     |   |       |   [ 🎨 Theme & Presets ]      |
  |   |        24 : 58         |   |       |   [ 🖼 Wallpaper Gallery ]    |
  |   |    [ ▶ ]     [ ↺ ]     |   |  ==>  |   | [ ⚙ Timer Settings ]      |
  |   +------------------------+   |       |   | [ 📊 Focus Analytics ]    |
  |      Timer Glass Capsule       |       |   | [ 🏆 Achievements (Local)]|
  |                                |       |   | [ 👤 Account / Profile ]  |
  |   Now: ♫ Lofi Beats            |       |   |                            |
  +--------------------------------+       |   |                            |
  | [Timer] [Tasks] [Audio] [More] |       |   | [Close Drawer / Drag ▼]    |
  +--------------------------------+       +--------------------------------+
         Mobile Bottom Nav                      Mobile Sheet Opened via [More]
```

---

### 4.2. Design Tokens & Visual Language

Hệ thống tuân thủ triết lý thiết kế tối giản cao cấp (kiểu Apple / Linear Dark Mode) và quản trị toàn bộ qua các biến CSS variables:
* **Background Primary:** Cố định biến `--bg-primary: #09090b` (Zinc-950) hoặc mã màu đơn sắc do người dùng chọn.
* **Background Surface / Cards:** Cố định biến `--bg-surface: #121214` (Zinc-900).
* **Frosted Glass Capsule Shield:** Quản lý bằng các biến `--capsule-bg`, `--capsule-opacity`, `--capsule-blur`, `--capsule-radius`.
* **Border Token:** `--capsule-border-color: rgba(255, 255, 255, 0.10)`.
* **Typography:** `--font-clock` ánh xạ vào 6 phông chữ self-hosted (`Inter`, `Space Mono`, `JetBrains Mono`, `Playfair Display`, `Outfit`, `Silkscreen Pixel`).
* **Accent Color Token:** Biến `--color-accent` (mặc định `#ffffff`), cho phép người dùng đổi sang 12 màu preset hoặc mã hex tự do với cơ chế tự động bảo vệ tương phản $\ge 4.5:1$.
* **QUY TẮC CẤM VÀ NGOẠI LỆ CÓ CHỦ ĐÍCH:**
  * ❌ **CẤM TUYỆT ĐỐI trên giao diện ứng dụng (Chrome):** Không sử dụng dải màu gradient tím/cyan lòe loẹt, viền neon phát sáng cyberpunk, và các huy hiệu AI vô nghĩa ("Smart AI Powered", "Magic Pro").
  * ✅ **NGOẠI LỆ CÓ CHỦ ĐÍCH:** Người dùng được phép chọn màu nhấn (Accent Color) và màu/ảnh nền theo sở thích cá nhân. Theme mặc định ("Obsidian Minimal") và 6 Presets hoàn toàn không dùng gradient lòe loẹt.

---

### 4.3. State Matrix Mở Rộng Cho Các Component

| Component | Default | Hover | Active / Focus | Disabled | Loading | Empty | Error |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **1. Timer Capsule** | Nền kính theo theme, số rõ nét, viền mờ | Viền sáng nhẹ `border-white/20` | Viền sáng theo accent color, số đếm giây chạy | Luôn tương tác được | Skeleton viền mờ | Hiện `00:00` | Báo viền đỏ khi Web Worker lỗi |
| **2. Control Bar** | Cố định đáy, icon `text-zinc-400` | Icon `text-white`, tooltip hiện | Nút active có nền `bg-white/10` | Con trỏ `not-allowed`, icon mờ | Spinner xoay tròn 16px tại icon nhạc | Hiện "No audio playing" | Icon vàng báo lỗi kết nối |
| **3. Wallpaper Grid** | Lưới ảnh 3 cột, bo góc `rounded-lg` | Phóng to `scale-105`, viền sáng | Viền active màu accent `ring-2` | Thumbnail mờ `opacity-30` | Skeleton nhấp nháy `animate-pulse` | "No custom wallpapers" | Icon ảnh gãy + "Failed to load" |
| **4. Audio Mixer** | Slider rãnh xám, nút kéo tròn | Nút kéo sáng hơn, con trỏ `grab` | Nút to 1.2x, con trỏ `grabbing` | Slider mờ `opacity-20` | Khóa nhẹ chờ AudioContext | Slider 0% (Mute) | "Web Audio blocked" |
| **5. Task Panel** | Danh sách task kèm nhãn/priority | Nền dòng `bg-white/5` | Task đang sửa viền sáng | Checkbox khóa, gạch ngang khi xong | Skeleton 3 dòng task giả | "No tasks found" | "Failed to sync task" |
| **6. Notepad** | Textarea trong suốt, chữ xám sáng | Thanh cuộn mờ xuất hiện | Hiện chỉ báo "Saving..." góc dưới | Khung mờ, `readonly` | Skeleton nhấp nháy | "Jot down your thoughts..." | "Storage full, cannot save" |
| **7. Analytics** | Biểu đồ cột xám, cột hôm nay màu accent | Tooltip: `Ngày - X phút - Task` | Cột chọn giữ viền sáng | Biểu đồ mờ khi chưa đủ số liệu | Spinner xoay tròn trung tâm | "Start a session to see stats" | "Could not load history" |
| **8. Auth Modal** | Hộp thoại giữa màn hình `bg-zinc-900` | Nút submit chuyển màu xám trắng | Input có viền sáng focus | Nút submit mờ `opacity-50` | Nút submit hiện Spinner | Trường input trống | Báo lỗi đỏ `text-red-400 text-xs` |
| **9. Settings Popover** | Khung popover nổi `bg-zinc-900` | Nút tăng giảm số sáng nhẹ | Ô nhập đang focus viền sáng | Khóa khi timer đang chạy | Local state tức thì | Luôn có giá trị mặc định | "Invalid duration (1-180)" |
| **10. Theme Customizer** | Panel slide-over bên phải, các slider sẵn sàng | Nút preset phóng to `scale-105` | Slider đang kéo có glow nhẹ | Nút Apply mờ khi không có thay đổi | Skeleton bảng màu khi nạp | "No custom themes saved" | "Contrast too low (< 4.5:1)" |
| **11. Ambient Overlay** | Lớp phủ trong suốt, hạt rơi tự nhiên | Không nhận tương tác trỏ chuột | Không nhận tương tác chuột | Ẩn hoàn toàn khi tắt | Fade in mượt trong 300ms | Không có hiệu ứng | Tự động tắt nếu FPS $< 50$ |
| **12. Focus Intent Input** | Khung nhập trong suốt trên đồng hồ | Viền mờ `border-white/20` sáng lên | Viền sáng theo accent, dropdown mở | Bị khóa khi timer đang chạy | Đang nạp danh sách task | "What is your focus intent?" | Viền đỏ nếu quá 80 ký tự |
| **13. PiP Button** | Icon thu nhỏ cửa sổ trên dock | Icon sáng màu trắng kèm tooltip | Icon chuyển màu accent khi PiP mở | Ẩn nếu trình duyệt không hỗ trợ | Đang khởi tạo cửa sổ PiP | N/A | Báo fallback sang Mini Corner |
| **14. HUD & Sync Status** | Chấm cycle sáng/mờ, icon mây xanh | Tooltip hiện trạng thái đồng bộ | Bấm icon Fullscreen mở rộng màn | Không áp dụng | Icon mây xoay báo "Syncing..." | 0 cycle dots sáng | Icon mây gạch chéo "Offline" |

---

### 4.4. Quy Tắc Responsive & Mobile Parity

* **Hệ thống Breakpoints:**
  * **Mobile:** `< 640px` (`sm` của Tailwind).
  * **Tablet:** `640px` đến `1023px` (`md`).
  * **Desktop:** `≥ 1024px` (`lg` / `xl`).
* **Đồng Hồ Co Giãn (Clock Scaling):**
  * Trên Mobile: Chữ số timer hiển thị ở kích thước `text-5xl` hoặc `text-6xl`, đệm viền `p-4`, nhân với tỷ lệ `--clock-scale` ($80\%$ – $140\%$), luôn nằm gọn gàng bên trong Frosted Glass Capsule giữa màn hình dọc mà không bao giờ gây tràn ngang.
  * Trên Desktop: Chữ số timer đạt kích thước `text-8xl` hoặc `text-9xl` với khoảng cách viền `p-8`.
* **Thanh Trượt Cảm Ứng (Touch Sliders):**
  * Trên Desktop: Chiều cao `h-1.5`, nút kéo `thumb` đường kính `12px`.
  * Trên Mobile: Vùng chạm mở rộng tối thiểu `44px × 44px` theo chuẩn iOS HIG cho toàn bộ thanh trượt âm lượng, độ đục kính và cường độ hạt.
* **Nguyên Tắc Mobile Parity & Điều Hướng Qua Nút "More":**
  * 100% tính năng trên Desktop đều có đường truy cập trực tiếp trên Mobile thông qua thanh Bottom Navigation và hệ thống Bottom Sheet Drawer:
    * Nút **[Timer]**: Màn hình chính với Focus Intent, viên nang đồng hồ, cycle dots và hình nền.
    * Nút **[Tasks]**: Mở Bottom Sheet chứa Task Manager nâng cao (Priority, Due Date, Labels, Search/Filter) và Notepad.
    * Nút **[Audio]**: Mở Bottom Sheet chứa bộ trộn 3 kênh Web Audio và trình phát nhạc YouTube.
    * Nút **[More]**: Mở Bottom Sheet mở rộng chứa:
      1. *Theme & Presets*: 6 preset dựng sẵn, Theme Customizer, Ambient Effects và thư viện Wallpaper.
      2. *Timer Settings*: Cấu hình chi tiết số phút phiên Focus/Break, chu kỳ nghỉ dài, âm báo.
      3. *Focus Analytics*: Biểu đồ tuần, streak, thống kê theo Focus Intent.
      4. *Achievements (Local)*: Danh sách huy hiệu cá nhân đã mở khóa.
      5. *Account / Profile*: Form đăng ký/đăng nhập/đăng xuất và trạng thái đồng bộ dữ liệu.

---

### 4.5. Accessibility (A11y) Tiêu Chuẩn

* **Hiển thị Tiêu Điểm Bàn Phím (Keyboard Focus Ring):**
  * Toàn bộ phần tử tương tác (`<button>`, `<input>`, `<a>`, `<select>`, sliders) có chỉ báo rõ ràng khi `Tab`: sử dụng lớp `focus-visible:ring-2 focus-visible:ring-zinc-300 focus-visible:outline-none`.
* **Nhãn Hỗ Trợ Trình Đọc Màn Hình (Accessible Icon Labels):**
  * Toàn bộ nút bấm icon bắt buộc có `aria-label` mô tả rõ hành động (ví dụ: `aria-label="Start Focus Timer"`, `aria-label="Open Picture-in-Picture window"`, `aria-label="Toggle Fullscreen mode"`).
* **Hỗ Trợ Tùy Chọn Giảm Chuyển Động (`prefers-reduced-motion`):**
  * Vô hiệu hóa hiệu ứng lật 3D của Retro Flip Clock (đổi số tức thì).
  * Đóng băng hoặc tắt hoàn toàn các chuyển động hạt Ambient Effects (Rain, Snow, Fireflies).
  * Giảm toàn bộ thời gian transition CSS từ `300ms` về `0ms`.
* **Mức Sàn Tương Phản Tự Động:**
  * Tỷ lệ tương phản chữ trên nền viên nang kính mờ luôn được khóa cứng $\ge 4.5:1$ theo chuẩn WCAG 2.1 AA.

---

## 5. Non-functional Requirements (NFR)

### 5.1. Hiệu Năng (Performance)
* **Thời gian tải ban đầu (Initial Load Time):**
  * Largest Contentful Paint (LCP) $\le 1.8\text{s}$ trên mạng 4G tiêu chuẩn; FCP $\le 1.0\text{s}$.
  * Kích thước Initial JS Bundle $\le 200\text{KB}$ (sau nén Gzip/Brotli).
  * **Không tăng bundle ban đầu do Font hay Hiệu ứng:** Toàn bộ 6 font chữ self-hosted chỉ được nạp động (lazy-loaded WOFF2) khi được chọn. Mã nguồn bộ tạo hạt Ambient Effects được tách thành chunk riêng chỉ tải khi kích hoạt.
* **Thời gian Áp dụng Theme (Theme Switching Latency):**
  * Toàn bộ thao tác chuyển đổi theme preset hoặc thay đổi thông số CSS variables thực thi trực tiếp trên DOM trong thời gian $< 100\text{ms}$ mà không tải lại trang.
* **Tốc độ Khung hình & Tự Động Giảm Tải (Frame Rate Guard):**
  * Duy trì tối thiểu $55\text{ FPS}$ trên máy tính và $50\text{ FPS}$ trên điện thoại di động khi đang chạy GIF nền và Ambient Effects. Nếu tốc độ khung hình bị sụt giảm dưới ngưỡng an toàn (FPS < 55 trên máy tính hoặc FPS < 50 trên điện thoại di động) liên tục trong 3 giây, hệ thống tự động giảm 50% số hạt hiệu ứng để khôi phục độ mượt.
  * Các hiệu ứng kính mờ `backdrop-filter` được tăng tốc bằng GPU (`transform: translateZ(0)`).

### 5.2. Độ Chính Xác Bộ Đếm (Timer Precision)
* Sai số thời gian tích lũy tuyệt đối không vượt quá $\pm 100\text{ms}$ sau 60 phút hoạt động liên tục (giá trị hiển thị làm tròn xuống giây theo `Math.floor(remainingSeconds)`), bất kể tab trình duyệt bị thu nhỏ, chuyển sang background, hoặc thiết bị rơi vào chế độ ngủ và được đánh thức lại.
* Web Worker chuyên trách phát tick nhịp; mỗi tick và mỗi lần `visibilitychange`/`focus` tính lại `remaining = targetEndTime - Date.now()`.

### 5.3. Bảo Mật & Cô Lập Dữ Liệu (Security & Data Isolation)
* **Row Level Security (RLS):** Toàn bộ các bảng (`tasks`, `notes`, `user_settings`, `focus_sessions`, `user_wallpapers`, `saved_themes`) bắt buộc bật RLS 100%. Chính sách (Policy) chỉ cho phép thao tác khi `auth.uid() = user_id`.
* **Cấu trúc Lưu trữ Theme:** Cấu hình theme đang dùng được lưu trực tiếp vào bảng `user_settings`. Danh sách custom theme đã lưu được lưu trữ riêng trong bảng `saved_themes` (tối đa 10 theme/user có tài khoản; tối đa 3 theme trong `localStorage` cho Guest).
* **Bảo vệ Nhập Theme JSON:** Chỉ chấp nhận các trường nằm trong danh sách whitelist token. Từ chối mọi chuỗi script độc hại hoặc đường dẫn URL ngoài (ảnh nền chỉ được trỏ tới ID của preset nội bộ hoặc file trong Supabase Storage của chính tài khoản đó).
* **Quyền Riêng Tư Cục Bộ:** Bản nháp Focus Intent chưa hoàn thành phiên, dữ liệu Guest và danh sách Huy hiệu (Achievements) hoàn toàn lưu trữ cục bộ tại trình duyệt; các phiên tập trung hoàn thành của user đăng nhập chỉ lưu các trường dữ liệu cần thiết (`duration_minutes`, `completed_at`, `intent_title`, `task_id`) vào bảng `focus_sessions` trên Supabase, không thu thập nhật ký theo dõi hay thông tin riêng tư ngoài phạm vi này.

### 5.4. Vận Hành Ổn Định Trên Free Tier (Zero-Cost Sustainability)
* Đảm bảo hệ thống vận hành liên tục cho ít nhất 500 người dùng tích cực hàng tháng (MAU) mà không vượt quá các hạn mức miễn phí (áp dụng theo hạn mức free tier hiện hành của Vercel và Supabase, cần kiểm tra lại trước khi deploy):
  * Âm thanh môi trường và chuông báo tổng hợp 100% qua Web Audio API client-side ($0\text{ byte}$ băng thông).
  * Toàn bộ ảnh động GIF preset phục vụ trực tiếp từ Vercel static assets, dung lượng mỗi file $\le 2\text{MB}$.
  * Giới hạn mỗi user đăng ký chỉ tải lên tối đa 3 ảnh nền cá nhân ($\le 5\text{MB}$/file).
  * Thiết lập GitHub Actions cron job chạy 3 ngày một lần ping Supabase REST API để ngăn cơ chế tự động tạm dừng (auto-pause) của database free tier.

---

## 6. Open Questions & Giả Định (Assumptions)

1. **Danh mục 6 Phông chữ Self-hosted:**
   * *Giả định đã chọn:* Lựa chọn 6 font mã nguồn mở miễn phí, bao phủ đầy đủ các nhóm phong cách: `Inter` (Sans tối giản hiện đại), `Space Mono` (Monospace kỹ thuật số), `JetBrains Mono` (Monospace lập trình), `Playfair Display` (Serif cổ điển sang trọng), `Outfit` (Geometric hiện đại thanh thoát), và `Silkscreen Pixel` (Pixel art hoài niệm). Toàn bộ được nén chuẩn WOFF2 và lưu trữ nội bộ tại `/public/fonts/`.
2. **Danh mục 6 Theme Presets Độc Bản:**
   * *Giả định đã chọn:* Xây dựng 6 theme nguyên bản lấy cảm hứng từ không gian tự nhiên và đô thị tĩnh lặng: `Obsidian Minimal`, `Tokyo Fog`, `Midnight Indigo`, `Matcha Slate`, `Amber Wood`, `Nordic Night`. Không sao chép bất kỳ tên gọi hay bộ mã màu nguyên bản của Flocus hay Pomodoro Timer.
3. **Công thức Mức sàn Độ đục Tự động & Đo độ sáng nền:**
   * *Giả định đã chọn:* Màu nền viên nang `--capsule-bg` bắt buộc nằm trong dải tối có độ sáng tương đối relative luminance $\le 0.20$. Độ sáng nền cơ sở $L_{\text{base}}$ được xác định trước qua metadata (ảnh preset có sẵn, ảnh upload lấy mẫu 1 lần khung hình đầu ở $32 \times 32\text{px}$, nền đơn sắc tính từ mã màu). Độ sáng hiệu dụng sau khi áp dụng dim và brightness: $L_{\text{effective}} = L_{\text{base}} \times (\text{brightness} / 100) \times (1 - \text{dim} / 100)$. Nếu $L_{\text{effective}} > 0.60$ (nền sáng), độ mờ viên nang kính tự động bị khóa mức sàn tối thiểu $\ge 50\%$ (`opacity >= 0.50`) với nền tối và deep shadow để đảm bảo tương phản chữ trắng luôn đạt $\ge 4.5:1$. Nếu $L_{\text{effective}} \le 0.60$, mức sàn cho phép xuống tối thiểu $20\%$. Hệ thống không phân tích ảnh theo thời gian thực để bảo vệ hiệu năng FPS.
4. **Chiến lược Fallback cho Picture-in-Picture:**
   * *Giả định đã chọn:* Do API `documentPictureInPicture` hiện chỉ khả dụng trên trình duyệt Chromium (Chrome, Edge), trên các trình duyệt khác (Safari, Firefox), nút PiP sẽ tự động chuyển hướng gọi tính năng "Mini Corner Mode" (FR-11) để đưa đồng hồ xuống góc dưới màn hình làm việc, đảm bảo trải nghiệm tương đương mà không bị lỗi.
5. **Xử lý Khi Xóa Task Đã Gán Vào Focus Intent:**
   * *Giả định đã chọn:* Khi một task bị xóa khỏi Task Manager, chuỗi văn bản của Focus Intent vẫn được giữ nguyên dạng text tĩnh trên đồng hồ, trường `task_id` được chuyển thành `null` để các phiên tập trung trong quá khứ đã lưu vào Analytics không bị mất tên công việc.
6. **Cấu hình tắt xác nhận email (Confirm Email) trong Supabase Auth:**
   * *Giả định đã chọn:* Tắt tùy chọn "Confirm email" trong cấu hình Supabase Auth cho phiên bản 1.2.1 để cấp session token và chuyển trạng thái đăng nhập ngay sau khi đăng ký.
   * *Rủi ro:* Người dùng có thể đăng ký bằng email giả hoặc email không thuộc quyền sở hữu của họ; chấp nhận rủi ro này trong giai đoạn thử nghiệm để tối ưu trải nghiệm đăng ký không ma sát.
