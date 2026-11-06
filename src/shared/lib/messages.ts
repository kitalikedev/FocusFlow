/**
 * Central place for every user-facing string produced by the data and auth layers.
 * Strings required verbatim by PRD acceptance criteria stay in English / Vietnamese exactly as written there.
 * Changing the UI language later only requires editing this file.
 */

export const ERROR_MESSAGES = {
  NETWORK_DISCONNECTED: 'Mất kết nối mạng. Vui lòng kiểm tra kết nối và thử lại.',
  AUTH_SESSION_EXPIRED: 'Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.',
  PERMISSION_DENIED: 'Bạn không có quyền thực hiện thao tác này.',
  ALREADY_EXISTS: 'Dữ liệu này đã tồn tại trong hệ thống.',
  FOREIGN_KEY_INVALID: 'Dữ liệu liên kết không tồn tại.',
  TASK_LIMIT_EXCEEDED:
    'Đã đạt giới hạn tối đa công việc cho phép. Vui lòng hoàn thành hoặc xóa bớt việc cũ.',
  THEME_LIMIT_EXCEEDED: 'Bạn đã đạt giới hạn tối đa giao diện lưu trữ.',
  WALLPAPER_LIMIT_EXCEEDED: 'Bạn đã đạt giới hạn tối đa ảnh nền cá nhân.',
  CONFIG_TOO_LARGE: 'Cấu hình giao diện vượt quá dung lượng cho phép (tối đa 8KB).',
  TITLE_LENGTH_INVALID: 'Tiêu đề công việc phải từ 1 đến 120 ký tự.',
  NAME_LENGTH_INVALID: 'Tên giao diện phải từ 1 đến 50 ký tự.',
  INTENT_TOO_LONG: 'Mục tiêu tập trung tối đa 80 ký tự.',
  INVALID_LABELS: 'Tối đa 5 nhãn, mỗi nhãn không quá 24 ký tự.',
  NOTE_TOO_LARGE: 'Nội dung ghi chú vượt quá giới hạn 50,000 ký tự.',
  INVALID_DUE_DATE: 'Hạn chót công việc không hợp lệ.',
  RATE_LIMITED: 'Quá nhiều yêu cầu. Vui lòng thử lại sau giây lát.',
  FILE_TOO_LARGE: 'Tệp tải lên vượt quá dung lượng tối đa 5MB.',
  INVALID_FILE_TYPE:
    'Định dạng tệp không được hỗ trợ. Vui lòng chọn ảnh JPG, PNG, WebP hoặc GIF.',
  VALIDATION_FAILED: 'Dữ liệu không đáp ứng ràng buộc hợp lệ của hệ thống.',
  NOT_FOUND: 'Không tìm thấy dữ liệu yêu cầu.',
  STORAGE_FULL: 'Bộ nhớ trình duyệt đã đầy, không thể lưu thêm dữ liệu.',
  FEATURE_UNAVAILABLE: 'Tính năng này hiện chưa khả dụng.',
  AUTH_INVALID_CREDENTIALS: 'Invalid login credentials',
  AUTH_USER_EXISTS: 'This email is already registered. Please sign in instead.',
  AUTH_WEAK_PASSWORD: 'Password is too weak. Please choose a stronger password.',
  AUTH_CONFIRMATION_REQUIRED:
    'Account created, but email confirmation is required before you can sign in.',
  UNKNOWN_ERROR: 'Đã có lỗi xảy ra. Vui lòng thử lại.',
} as const;

export type ErrorCode = keyof typeof ERROR_MESSAGES;

export const AUTH_MESSAGES = {
  accountCreated: 'Account created successfully',
  invalidEmail: 'Please enter a valid email address.',
  passwordTooShort: 'Password must be at least 6 characters.',
  cloudUnavailable: 'Cloud sync unavailable',
  guestMergeQuestion: 'Bạn có muốn nhập dữ liệu từ phiên khách vào tài khoản này không?',
  guestMergeConfirm: 'Đồng ý',
  guestMergeDiscard: 'Từ chối',
  guestMigrated: 'Đã đồng bộ toàn bộ dữ liệu khách vào tài khoản!',
  guestMerged: 'Đã nhập dữ liệu khách vào tài khoản.',
  guestDiscarded: 'Đã bỏ dữ liệu khách trên máy này.',
} as const;
