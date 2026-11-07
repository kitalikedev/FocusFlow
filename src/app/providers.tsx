import React, { useEffect } from 'react';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { applyTheme } from '@/core/theme/applyTheme';
import { initializeAuth, useAuthStore } from '@/core/auth/useAuthStore';
import { useSettingsStore } from '@/core/data/useSettingsStore';
import { useFocusSessionsStore } from '@/core/data/useFocusSessionsStore';
import { watchConnectivity } from '@/core/data/useSyncStatusStore';
import { initializeTimer } from '@/core/timer/initializeTimer';
import { useShortcuts } from '@/core/shortcuts/useShortcuts';
import { watchFullscreen } from '@/core/ui/useUiStore';

export interface ProvidersProps {
  children: React.ReactNode;
}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  const tokens = useThemeStore((state) => state.tokens);
  const effects = useThemeStore((state) => state.config.effects);
  const isLoading = useAuthStore((state) => state.isLoading);
  const isGuest = useAuthStore((state) => state.isGuest);
  const userId = useAuthStore((state) => state.user?.id);
  const dataVersion = useAuthStore((state) => state.dataVersion);

  useEffect(() => {
    applyTheme(tokens, effects);
  }, [tokens, effects]);

  // Restore the Supabase session (or stay in Guest Mode when the environment is not configured).
  useEffect(() => initializeAuth(), []);

  // Load settings once auth is known, and again whenever the data source or its content changed (FR-09).
  useEffect(() => {
    if (isLoading) return;
    void useSettingsStore.getState().load();
    void useFocusSessionsStore.getState().load();
  }, [isLoading, isGuest, userId, dataVersion]);

  // Timer wiring (settings, visibility / focus resync), connectivity and fullscreen state, plus the shortcuts.
  useEffect(() => {
    const cleanups = [initializeTimer(), watchConnectivity(), watchFullscreen()];
    return () => cleanups.forEach((cleanup) => cleanup());
  }, []);
  useShortcuts();

  return <>{children}</>;
};
