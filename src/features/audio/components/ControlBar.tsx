import React from 'react';
import { Pause, Play, Volume2, VolumeX } from 'lucide-react';
import { useUiStore } from '@/core/ui/useUiStore';
import { zenHiddenProps } from '@/core/ui/zen';
import { toggleMasterMute } from '@/shared/lib/web-audio';
import { useMuted, useVolumeHydration } from '../hooks/useAudioSync';
import { AMBIENT_CHANNELS } from '../lib/ambientEngine';
import { useAudioStore } from '../store/useAudioStore';
import { MusicController } from './MusicController';
import { YouTubeHost } from './YouTubeHost';

const BUTTON_CLASS =
  'rounded-lg p-1.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

/**
 * FR-18 bottom controls. Always mounted (it hosts the hidden YouTube player so music keeps playing while the
 * Sounds panel is closed); the compact bar itself only shows once some audio is set up. With a YouTube track
 * it becomes a small music player (cover, title, seek bar, previous / play / next, Music volume).
 */
export const ControlBar: React.FC = () => {
  useVolumeHydration();
  const isZen = useUiStore((state) => state.isZen);
  const openMixer = useUiStore((state) => state.setMixerOpen);
  const muted = useMuted();
  const volumes = useAudioStore((state) => state.volumes);
  const isAmbientPaused = useAudioStore((state) => state.isAmbientPaused);
  const queue = useAudioStore((state) => state.queue);
  const currentIndex = useAudioStore((state) => state.currentIndex);
  const wantsYouTubePlaying = useAudioStore((state) => state.wantsYouTubePlaying);
  const togglePauseAll = useAudioStore((state) => state.togglePauseAll);

  const ambientAudible = !isAmbientPaused && AMBIENT_CHANNELS.some((type) => volumes[type] > 0);
  const hasAmbient = AMBIENT_CHANNELS.some((type) => volumes[type] > 0);
  const isPlaying = ambientAudible || wantsYouTubePlaying;
  const track = currentIndex >= 0 ? queue[currentIndex] : undefined;
  const hasAudio = track !== undefined || hasAmbient;
  const label = ambientAudible ? 'Ambient sounds' : 'Sounds';
  // With music the player has its own play button; "pause all" stays only when ambient sounds are set up too.
  const showPauseAll = !track || hasAmbient;

  return (
    <>
      <YouTubeHost />
      {hasAudio && (
        <div
          data-testid="control-bar"
          {...zenHiddenProps(
            isZen,
            `flex min-w-0 items-center gap-1 rounded-2xl border p-1 max-sm:hidden ${
              track ? 'w-[min(34rem,56vw)]' : 'max-w-[50vw]'
            }`
          )}
          style={{
            backgroundColor: 'var(--capsule-bg)',
            backdropFilter: 'blur(var(--capsule-blur))',
            WebkitBackdropFilter: 'blur(var(--capsule-blur))',
            borderColor: 'var(--capsule-border-color)',
          }}
        >
          {showPauseAll && (
            <button
              type="button"
              data-testid="pause-all-btn"
              aria-label={isPlaying ? 'Pause all sounds' : 'Play sounds'}
              onClick={togglePauseAll}
              className={BUTTON_CLASS}
            >
              {isPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
            </button>
          )}
          {track ? (
            <MusicController />
          ) : (
            <button
              type="button"
              data-testid="now-playing"
              onClick={() => openMixer(true)}
              title={label}
              className="min-w-0 truncate rounded-lg px-2 py-1 text-xs text-white/80 hover:bg-white/10"
            >
              {label}
            </button>
          )}
          <button
            type="button"
            data-testid="mute-btn"
            aria-label={muted ? 'Unmute (M)' : 'Mute (M)'}
            aria-pressed={muted}
            onClick={() => toggleMasterMute()}
            className={BUTTON_CLASS}
          >
            {muted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
          </button>
        </div>
      )}
    </>
  );
};
