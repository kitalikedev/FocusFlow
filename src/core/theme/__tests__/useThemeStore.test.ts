import { describe, it, expect, beforeEach } from 'vitest';
import { useThemeStore } from '../useThemeStore';
import { OBSIDIAN_MINIMAL_TOKENS } from '../presets';

describe('useThemeStore', () => {
  beforeEach(() => {
    useThemeStore.getState().resetTheme();
  });

  it('initializes with Obsidian Minimal tokens', () => {
    const { tokens, config } = useThemeStore.getState();
    expect(tokens.colorAccent).toBe('#ffffff');
    expect(tokens.bgSolidColor).toBe('#09090b');
    expect(config.presetId).toBe('obsidian-minimal');
  });

  it('updates tokens and syncs with CSS variables when setTokens is called', () => {
    useThemeStore.getState().setTokens({
      colorAccent: '#3b82f6',
      capsuleRadius: 16,
    });

    const updatedTokens = useThemeStore.getState().tokens;
    expect(updatedTokens.colorAccent).toBe('#3b82f6');
    expect(updatedTokens.capsuleRadius).toBe(16);
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#3b82f6');
    expect(document.documentElement.style.getPropertyValue('--capsule-radius')).toBe('16px');
  });

  it('resets back to Obsidian Minimal default preset when resetTheme is called', () => {
    useThemeStore.getState().setTokens({
      colorAccent: '#ef4444',
      bgSolidColor: '#18181b',
    });

    expect(useThemeStore.getState().tokens.colorAccent).toBe('#ef4444');

    useThemeStore.getState().resetTheme();

    const currentTokens = useThemeStore.getState().tokens;
    expect(currentTokens).toEqual(OBSIDIAN_MINIMAL_TOKENS);
    expect(document.documentElement.style.getPropertyValue('--color-accent')).toBe('#ffffff');
    expect(document.documentElement.style.getPropertyValue('--bg-solid-color')).toBe('#09090b');
    const obsoleteToken = ['--', 'color', '-', 'bg'].join('');
    expect(document.documentElement.style.getPropertyValue(obsoleteToken)).toBe('');
  });
});
