import { ThemeConfig, ThemeTokens, UserSettings } from '@/shared/types/contracts';
import { OBSIDIAN_MINIMAL_CONFIG, OBSIDIAN_MINIMAL_TOKENS } from '@/core/theme/presets';

/** Limits enforced by the database (ERD) or chosen for Guest Mode so migration never exceeds them. */
export const LIMITS = {
  taskTitleMax: 120,
  taskLabelsMax: 5,
  taskLabelLengthMax: 24,
  intentTitleMax: 80,
  noteMaxChars: 50000,
  themeNameMax: 50,
  themeConfigMaxBytes: 8192,
  sessionMinutesMax: 1440,
  wallpaperMaxBytes: 5 * 1024 * 1024,
  guestTasksMax: 100,
  cloudTasksMax: 100,
  guestThemesMax: 3,
  cloudThemesMax: 10,
} as const;

export const CLOCK_VISUAL_MODES = ['minimal', 'circular_ring', 'retro_flip'] as const;
export const CLOCK_POSITIONS = ['center', 'mini_corner', 'zen'] as const;

export const DEFAULT_WALLPAPER_ID = 'preset-lofi-cafe';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNumber(value: unknown): number | null {
  const candidate = typeof value === 'string' ? Number(value) : value;
  return typeof candidate === 'number' && Number.isFinite(candidate) ? candidate : null;
}

export function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  const n = toNumber(value);
  return n === null ? fallback : Math.min(max, Math.max(min, Math.round(n)));
}

export function clampVolume(value: unknown, fallback: number): number {
  const n = toNumber(value);
  return n === null ? fallback : Math.round(Math.min(1, Math.max(0, n)) * 100) / 100;
}

function pickOne<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return allowed.find((item) => item === value) ?? fallback;
}

function pickBoolean(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

function pickString(value: unknown, fallback: string): string {
  return typeof value === 'string' && value.length > 0 ? value : fallback;
}

/** Creates the default settings object (Obsidian Minimal, 25/5/15, preset wallpaper). */
export function createDefaultSettings(): UserSettings {
  return {
    timerDurations: { focus: 1500, shortBreak: 300, longBreak: 900 },
    clockVisualMode: 'minimal',
    clockPosition: 'center',
    activeWallpaperId: DEFAULT_WALLPAPER_ID,
    ambientVolumes: { rain: 0.5, brownNoise: 0, campfire: 0, master: 0.8 },
    autoStartBreaks: false,
    autoStartFocus: false,
    longBreakInterval: 4,
    isMigrated: false,
    activeTheme: OBSIDIAN_MINIMAL_CONFIG,
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Whitelist-based theme parsing: only known token keys with the correct primitive type are accepted,
 * everything else falls back to Obsidian Minimal (also guards imported or tampered data).
 */
export function parseThemeConfig(raw: unknown): ThemeConfig {
  // `{}` is the database default and means "use the default theme".
  if (!isRecord(raw) || Object.keys(raw).length === 0) return OBSIDIAN_MINIMAL_CONFIG;

  const tokens: ThemeTokens = { ...OBSIDIAN_MINIMAL_TOKENS };
  const rawTokens = isRecord(raw.tokens) ? raw.tokens : {};
  for (const key of Object.keys(OBSIDIAN_MINIMAL_TOKENS) as (keyof ThemeTokens)[]) {
    const candidate = rawTokens[key];
    if (typeof candidate === typeof OBSIDIAN_MINIMAL_TOKENS[key]) {
      if (typeof candidate === 'number' && !Number.isFinite(candidate)) continue;
      (tokens as unknown as Record<string, unknown>)[key] = candidate;
    }
  }

  const rawEffects = isRecord(raw.effects) ? raw.effects : {};
  const effects = { ...OBSIDIAN_MINIMAL_CONFIG.effects };
  for (const key of Object.keys(effects) as (keyof typeof effects)[]) {
    effects[key] = clampInt(rawEffects[key], 0, 100, effects[key]);
  }

  const rawWallpaper = isRecord(raw.wallpaperRef) ? raw.wallpaperRef : {};
  const wallpaperRef = {
    type: pickOne(rawWallpaper.type, ['preset', 'custom', 'solid'] as const, 'solid'),
    idOrColor: pickString(rawWallpaper.idOrColor, OBSIDIAN_MINIMAL_CONFIG.wallpaperRef.idOrColor),
  };

  return {
    presetId: typeof raw.presetId === 'string' ? raw.presetId : undefined,
    tokens,
    effects,
    wallpaperRef,
  };
}

/** Rebuilds a safe UserSettings from untrusted input (localStorage JSON or a database row). */
export function normalizeSettings(raw: unknown): UserSettings {
  const base = createDefaultSettings();
  if (!isRecord(raw)) return base;

  const durations = isRecord(raw.timerDurations) ? raw.timerDurations : {};
  const volumes = isRecord(raw.ambientVolumes) ? raw.ambientVolumes : {};

  return {
    userId: typeof raw.userId === 'string' ? raw.userId : undefined,
    timerDurations: {
      focus: clampInt(durations.focus, 60, 10800, base.timerDurations.focus),
      shortBreak: clampInt(durations.shortBreak, 60, 10800, base.timerDurations.shortBreak),
      longBreak: clampInt(durations.longBreak, 60, 10800, base.timerDurations.longBreak),
    },
    clockVisualMode: pickOne(raw.clockVisualMode, CLOCK_VISUAL_MODES, base.clockVisualMode),
    clockPosition: pickOne(raw.clockPosition, CLOCK_POSITIONS, base.clockPosition),
    activeWallpaperId: pickString(raw.activeWallpaperId, base.activeWallpaperId),
    ambientVolumes: {
      rain: clampVolume(volumes.rain, base.ambientVolumes.rain),
      brownNoise: clampVolume(volumes.brownNoise, base.ambientVolumes.brownNoise),
      campfire: clampVolume(volumes.campfire, base.ambientVolumes.campfire),
      master: clampVolume(volumes.master, base.ambientVolumes.master),
    },
    autoStartBreaks: pickBoolean(raw.autoStartBreaks, base.autoStartBreaks),
    autoStartFocus: pickBoolean(raw.autoStartFocus, base.autoStartFocus),
    longBreakInterval: clampInt(raw.longBreakInterval, 1, 24, base.longBreakInterval),
    isMigrated: pickBoolean(raw.isMigrated, base.isMigrated),
    activeTheme: parseThemeConfig(raw.activeTheme),
    updatedAt: pickString(raw.updatedAt, base.updatedAt),
  };
}

/** Deep-merges a partial settings patch (nested timerDurations / ambientVolumes) into a full object. */
export function mergeSettings(base: UserSettings, patch: Partial<UserSettings>): UserSettings {
  return normalizeSettings({
    ...base,
    ...patch,
    timerDurations: { ...base.timerDurations, ...patch.timerDurations },
    ambientVolumes: { ...base.ambientVolumes, ...patch.ambientVolumes },
  });
}
