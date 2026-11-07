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
      const current = useAudioStore.getState().volumes;
      if (current.rain === rain && current.brownNoise === brownNoise && current.campfire === campfire) return;
      useAudioStore.getState().hydrateVolumes({ rain, brownNoise, campfire });
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
