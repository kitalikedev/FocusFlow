// src/shared/types/contracts.ts

// ==========================================
// 1. UI STATE CONTRACTS (useUiStore)
// ==========================================
export interface UiState {
  isZen: boolean;
  isFullscreen: boolean;
  isMixerOpen: boolean;
  isWallpaperPickerOpen: boolean;
  isThemeCustomizerOpen: boolean;
  isClockSettingsOpen: boolean;
  isAnalyticsOpen: boolean;
  isTasksOpen: boolean;
  isNoteOpen: boolean;
}

/** Floating tool panels opened from the bottom-left dock. */
export type ToolPanel = 'tasks' | 'note' | 'mixer';

export interface UiActions {
  toggleZen: () => void;
  toggleFullscreen: () => void;
  setMixerOpen: (isOpen: boolean) => void;
  setWallpaperPickerOpen: (isOpen: boolean) => void;
  setThemeCustomizerOpen: (isOpen: boolean) => void;
  setClockSettingsOpen: (isOpen: boolean) => void;
  setAnalyticsOpen: (isOpen: boolean) => void;
  /** Opens or closes a dock panel; `exclusive` closes the other panels first (phones show one at a time). */
  togglePanel: (panel: ToolPanel, exclusive?: boolean) => void;
}

// ==========================================
// 2. THEME ENGINE CONTRACTS (FR-24, FR-25, FR-26, FR-27)
// ==========================================
export interface ThemeTokens {
  colorAccent: string;          // --color-accent
  colorAccentContrast: string;  // --color-accent-contrast (WCAG >= 4.5:1)
  capsuleBg: string;            // --capsule-bg (độ sáng tương đối <= 0.20)
  capsuleOpacity: number;       // --capsule-opacity (0.20 - 0.95, sàn 0.50 khi L > 0.60)
  capsuleBlur: number;          // --capsule-blur (0px - 32px)
  capsuleRadius: number;        // --capsule-radius (4px - 48px)
  capsuleBorderWidth: number;   // --capsule-border-width (0px - 2px)
  capsuleBorderColor: string;   // --capsule-border-color
  fontClock: string;            // --font-clock (6 font self-hosted WOFF2)
  clockScale: number;           // --clock-scale (0.80 - 1.40)
  clockWeight: number;          // --clock-weight (300, 400, 600, 700)
  bgDim: number;                // --bg-dim (0% - 80%)
  bgBlur: number;               // --bg-blur (0px - 20px)
  bgBrightness: number;         // --bg-brightness (40% - 120%)
  bgSolidColor: string;         // --bg-solid-color (khi dùng nền đơn sắc)
}

export interface EffectsConfig {
  rain: number;       // Cường độ mưa (0% - 100%)
  snow: number;       // Cường độ tuyết (0% - 100%)
  fireflies: number;  // Cường độ đom đóm (0% - 100%, tối đa 40 hạt)
  grain: number;      // Hạt phim điện ảnh (0% - 100%)
  vignette: number;   // Tối góc quang học (0% - 100%)
  scanlines: number;  // Sọc ngang kiểu màn hình CRT (0% - 100%)
  glow: number;       // Chữ đồng hồ phát sáng neon theo màu accent (0% - 100%)
}

export interface ThemeConfig {
  presetId?: string;
  tokens: ThemeTokens;
  effects: EffectsConfig;
  wallpaperRef: {
    type: 'preset' | 'custom' | 'solid';
    idOrColor: string;
  };
}

export interface SavedTheme {
  id: string;
  userId?: string;
  name: string;
  config: ThemeConfig;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export class ThemeLimitError extends Error {
  constructor(message = 'Theme limit reached') {
    super(message);
    this.name = 'ThemeLimitError';
  }
}

// ==========================================
// 3. TIMER CONTRACTS (FR-04, FR-05, FR-06, FR-29)
// ==========================================
export type TimerMode = 'pomodoro' | '52_17' | 'deep_work' | 'custom' | 'stopwatch';
export type TimerStatus = 'idle' | 'running' | 'paused' | 'completed';
export type SessionType = 'focus' | 'short_break' | 'long_break' | 'stopwatch';

export interface TimerDurations {
  focus: number;       // Thời lượng tập trung (giây)
  shortBreak: number;  // Nghỉ ngắn (giây)
  longBreak: number;   // Nghỉ dài (giây)
}

export interface TimerState {
  mode: TimerMode;
  status: TimerStatus;
  sessionType: SessionType;
  remainingSeconds: number;     // Stopwatch mode: giây ĐÃ TRÔI (đếm xuôi), không phải giây còn lại
  targetEndTime: number | null; // Timestamp mili-giây Date.now()
  durations: TimerDurations;
  cyclesCompleted: number;      // Chỉ tăng khi hoàn thành phiên focus
  longBreakInterval: number;   // Ngưỡng nghỉ dài (mặc định 4)
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
}

export interface TimerActions {
  start: () => void;
  pause: () => void;
  reset: () => void;
  setMode: (mode: TimerMode, customDurations?: Partial<TimerDurations>) => void;
  skipSession: () => void;
  updateSettings: (settings: Partial<Pick<TimerState, 'durations' | 'longBreakInterval' | 'autoStartBreaks' | 'autoStartFocus'>>) => void;
}

// Component trình bày nội bộ của Clock (props của ClockDisplay xuất xưởng là {})
export interface InternalClockProps {
  remainingSeconds: number;
  totalSeconds: number;
  sessionType: SessionType;
  status: TimerStatus;
  visualMode: 'minimal' | 'circular_ring' | 'retro_flip';
  position: 'center' | 'mini_corner' | 'zen';
}

// ==========================================
// 4. DATA REPOSITORY CONTRACTS (FR-02, FR-09, FR-19, FR-20, FR-21, FR-27, FR-29)
// ==========================================
export type TaskPriority = 'none' | 'low' | 'medium' | 'high';

export interface TaskItem {
  id: string; // UUID v4 do client sinh
  userId?: string;
  title: string;
  isCompleted: boolean;
  priority: TaskPriority;
  dueDate?: string | null; // ISO 8601 hoặc null
  labels: string[];        // Tối đa 5 nhãn, mỗi nhãn <= 24 ký tự
  createdAt: string;       // ISO 8601
  updatedAt: string;       // ISO 8601 (Last-Write-Wins)
}

export interface TaskFilterParams {
  priority?: TaskPriority;
  isCompleted?: boolean;
  search?: string;
  label?: string;
  sortBy?: 'dueDate' | 'createdAt' | 'priority';
  sortOrder?: 'asc' | 'desc';
}

export interface NoteItem {
  id: string; // UUID v4
  userId?: string;
  content: string;
  updatedAt: string;
}

export interface UserSettings {
  userId?: string;
  timerDurations: TimerDurations;
  clockVisualMode: 'minimal' | 'circular_ring' | 'retro_flip';
  clockPosition: 'center' | 'mini_corner' | 'zen';
  activeWallpaperId: string;
  ambientVolumes: {
    rain: number;
    brownNoise: number;
    campfire: number;
    master: number;
  };
  autoStartBreaks: boolean;
  autoStartFocus: boolean;
  longBreakInterval: number;
  isMigrated: boolean;
  activeTheme: ThemeConfig;
  updatedAt: string;
}

export interface FocusSessionRecord {
  id: string; // UUID v4
  userId?: string;
  durationMinutes: number;
  intentTitle?: string | null; // Tiêu đề mục tiêu tập trung (FR-29)
  taskId?: string | null;      // Liên kết khóa ngoại task (FR-29)
  completedAt: string;
}

export interface WallpaperMetadata {
  id: string;
  name: string;
  type: 'preset' | 'custom';
  url: string;
  fileSize?: number;
  luminance: number; // Độ sáng tương đối 0.000 - 1.000
  uploadedAt?: string;
}

export interface DataRepository {
  // Tasks (FR-19)
  getTasks(filter?: TaskFilterParams): Promise<TaskItem[]>;
  createTask(title: string, options?: Partial<Pick<TaskItem, 'priority' | 'dueDate' | 'labels'>>): Promise<TaskItem>;
  updateTask(id: string, updates: Partial<Pick<TaskItem, 'title' | 'isCompleted' | 'priority' | 'dueDate' | 'labels'>>): Promise<TaskItem>;
  deleteTask(id: string): Promise<void>;

  // Notepad (FR-20)
  getNote(): Promise<NoteItem>;
  saveNote(content: string): Promise<NoteItem>;

  // Settings (FR-09, FR-24)
  getSettings(): Promise<UserSettings>;
  saveSettings(settings: Partial<UserSettings>): Promise<UserSettings>;

  // Focus Analytics & Intent (FR-21, FR-29)
  recordFocusSession(durationMinutes: number, intentTitle?: string | null, taskId?: string | null): Promise<FocusSessionRecord>;
  getFocusSessions(): Promise<FocusSessionRecord[]>;

  // Wallpapers (FR-13, FR-14)
  getWallpapers(): Promise<WallpaperMetadata[]>;
  uploadCustomWallpaper(file: File, luminance: number): Promise<WallpaperMetadata>;
  deleteCustomWallpaper(id: string): Promise<void>;

  // Saved Themes (FR-27)
  getSavedThemes(): Promise<SavedTheme[]>;
  saveTheme(theme: Omit<SavedTheme, 'id' | 'createdAt' | 'updatedAt'>): Promise<SavedTheme>;
  renameTheme(id: string, name: string): Promise<SavedTheme>;
  deleteTheme(id: string): Promise<void>;
}

// ==========================================
// 5. AUDIO SERVICE CONTRACTS (FR-16, FR-17, FR-18)
// ==========================================
export type AmbientSoundType = 'rain' | 'brownNoise' | 'campfire';

export interface YouTubeTrack {
  id: string;
  url: string;
  title: string;
}

export interface AudioService {
  initAudioContext(): Promise<void>;
  setAmbientVolume(type: AmbientSoundType, volume: number): void;
  setMasterVolume(volume: number): void;
  toggleMasterMute(): boolean;
  playChime(): void;
  loadYouTubeQueue(tracks: YouTubeTrack[]): void;
  playNextYouTube(): void;
  pauseYouTube(): void;
}

// ==========================================
// 6. AUTH CONTRACTS (FR-01, FR-02, FR-03)
// ==========================================
export interface AuthUser {
  id: string;
  email: string;
  avatarUrl?: string;
}

export interface AuthState {
  user: AuthUser | null;
  isGuest: boolean;
  isLoading: boolean;
  loginWithPassword: (email: string, password: string) => Promise<void>;
  signUpWithPassword: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}
