import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/core/data/useSettingsStore';
import { isMuted, subscribeMute } from '@/shared/lib/web-audio';
import { hasPendingVolumeSave, useAudioStore } from '../store/useAudioStore';

/** Restores the saved channel volumes whenever settings are (re)loaded, e.g. after signing in. */
export function useVolumeHydration(): void {
  useEffect(() => {
    const apply = () => {
      const { settings, status } = useSettingsStore.getState();
      if (status !== 'ready' || hasPendingVolumeSave()) return;
      const { rain, brownNoise, campfire } = settings.ambientVolumes;
      const loaded = { rain, brownNoise, campfire };
      const current = useAudioStore.getState().volumes;
      if (Object.entries(loaded).every(([id, level]) => current[id] === level)) return;
      useAudioStore.getState().hydrateVolumes(loaded);
    };
    apply();
    return useSettingsStore.subscribe(apply);
  }, []);
}

/** Live global mute state (button or key M). */
export function useMuted(): boolean {
  const [muted, setMuted] = useState(isMuted);
  useEffect(() => subscribeMute(setMuted), []);
  return muted;
}
