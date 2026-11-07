import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AppError } from '@/shared/lib/errors';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { useToastStore } from '@/core/ui/useToastStore';
import { createDefaultSettings } from '../defaults';
import { useSettingsStore } from '../useSettingsStore';
import { getDataRepository } from '../useDataRepository';

vi.mock('../useDataRepository', () => ({ getDataRepository: vi.fn() }));

const getRepo = vi.mocked(getDataRepository);

function settingsWithBackground(color: string) {
  const base = createDefaultSettings();
  return {
    ...base,
    activeTheme: { ...base.activeTheme, tokens: { ...base.activeTheme.tokens, bgSolidColor: color } },
  };
}

describe('useSettingsStore (FR-09)', () => {
  beforeEach(() => {
    useSettingsStore.setState({ settings: createDefaultSettings(), status: 'idle' });
    useThemeStore.getState().resetTheme();
    useToastStore.setState({ toasts: [] });
    getRepo.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('loads settings and applies the saved theme within 1500 ms (AC-09.1)', async () => {
    vi.useFakeTimers();
    const settings = settingsWithBackground('#123456');
    getRepo.mockReturnValue({
      getSettings: () => new Promise((resolve) => setTimeout(() => resolve(settings), 200)),
    } as never);

    const loading = useSettingsStore.getState().load();
    expect(useSettingsStore.getState().status).toBe('loading');
    await vi.advanceTimersByTimeAsync(200);
    await loading;

    expect(useSettingsStore.getState().status).toBe('ready');
    expect(useThemeStore.getState().tokens.bgSolidColor).toBe('#123456');
    expect(document.documentElement.style.getPropertyValue('--bg-solid-color')).toBe('#123456');
  });

  it('reports load failures with a toast', async () => {
    getRepo.mockReturnValue({ getSettings: () => Promise.reject(new AppError('NETWORK_DISCONNECTED')) } as never);
    await useSettingsStore.getState().load();
    expect(useSettingsStore.getState().status).toBe('error');
    expect(useToastStore.getState().toasts[0]).toMatchObject({ variant: 'error' });
  });

  it('ignores the result of an outdated load', async () => {
    let resolveFirst: (value: ReturnType<typeof createDefaultSettings>) => void = () => undefined;
    const first = new Promise<ReturnType<typeof createDefaultSettings>>((resolve) => {
      resolveFirst = resolve;
    });
    getRepo
      .mockReturnValueOnce({ getSettings: () => first } as never)
      .mockReturnValueOnce({ getSettings: () => Promise.resolve(settingsWithBackground('#222222')) } as never);

    const slow = useSettingsStore.getState().load();
    await useSettingsStore.getState().load();
    resolveFirst(settingsWithBackground('#111111'));
    await slow;

    expect(useThemeStore.getState().tokens.bgSolidColor).toBe('#222222');
  });

  it('ignores errors from an outdated load', async () => {
    let rejectFirst: (error: Error) => void = () => undefined;
    const first = new Promise<never>((_, reject) => {
      rejectFirst = reject;
    });
    getRepo
      .mockReturnValueOnce({ getSettings: () => first } as never)
      .mockReturnValueOnce({ getSettings: () => Promise.resolve(createDefaultSettings()) } as never);

    const slow = useSettingsStore.getState().load();
    await useSettingsStore.getState().load();
    rejectFirst(new Error('late'));
    await slow;

    expect(useSettingsStore.getState().status).toBe('ready');
    expect(useToastStore.getState().toasts).toHaveLength(0);
  });

  it('update saves through the repository and applies theme changes', async () => {
    const saved = settingsWithBackground('#abcdef');
    const saveSettings = vi.fn().mockResolvedValue(saved);
    getRepo.mockReturnValue({ saveSettings } as never);

    await useSettingsStore.getState().update({ activeTheme: saved.activeTheme });
    expect(saveSettings).toHaveBeenCalledWith({ activeTheme: saved.activeTheme });
    expect(useThemeStore.getState().tokens.bgSolidColor).toBe('#abcdef');

    await useSettingsStore.getState().update({ autoStartFocus: true });
    expect(useSettingsStore.getState().settings).toBe(saved);
  });

  it('runs overlapping updates one at a time so no patch is lost', async () => {
    const events: string[] = [];
    let stored = createDefaultSettings();
    const saveSettings = vi.fn(async (patch: Partial<typeof stored>) => {
      const name = Object.keys(patch)[0];
      events.push(`start:${name}`);
      const snapshot = stored; // read first, write later (like the real repository)
      await new Promise((resolve) => setTimeout(resolve, 10));
      stored = { ...snapshot, ...patch };
      events.push(`end:${name}`);
      return stored;
    });
    getRepo.mockReturnValue({ saveSettings } as never);

    await Promise.all([
      useSettingsStore.getState().update({ clockVisualMode: 'retro_flip' }),
      useSettingsStore.getState().update({ clockPosition: 'mini_corner' }),
    ]);

    expect(events).toEqual([
      'start:clockVisualMode',
      'end:clockVisualMode',
      'start:clockPosition',
      'end:clockPosition',
    ]);
    expect(useSettingsStore.getState().settings).toMatchObject({
      clockVisualMode: 'retro_flip',
      clockPosition: 'mini_corner',
    });
  });

  it('keeps saving after an earlier update failed', async () => {
    const saved = { ...createDefaultSettings(), autoStartFocus: true };
    const saveSettings = vi
      .fn()
      .mockRejectedValueOnce(new AppError('PERMISSION_DENIED'))
      .mockResolvedValueOnce(saved);
    getRepo.mockReturnValue({ saveSettings } as never);

    await Promise.all([
      useSettingsStore.getState().update({ autoStartBreaks: true }),
      useSettingsStore.getState().update({ autoStartFocus: true }),
    ]);

    expect(saveSettings).toHaveBeenCalledTimes(2);
    expect(useSettingsStore.getState().settings).toBe(saved);
    expect(useToastStore.getState().toasts).toHaveLength(1);
  });

  it('update keeps the previous value and shows a toast on failure', async () => {
    getRepo.mockReturnValue({ saveSettings: () => Promise.reject(new AppError('PERMISSION_DENIED')) } as never);
    const before = useSettingsStore.getState().settings;
    await useSettingsStore.getState().update({ autoStartFocus: true });
    expect(useSettingsStore.getState().settings).toBe(before);
    expect(useToastStore.getState().toasts[0].variant).toBe('error');
  });
});
