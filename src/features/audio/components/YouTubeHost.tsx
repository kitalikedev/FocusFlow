import React, { useEffect, useRef, useState } from 'react';
import { useSettingsStore } from '@/core/data/useSettingsStore';
import { useToastStore } from '@/core/ui/useToastStore';
import { isMuted, subscribeMute } from '@/shared/lib/web-audio';
import { loadYouTubeApi, parseYouTubeId, type YouTubeNamespace, type YouTubePlayer } from '../lib/youtube';
import { useAudioStore } from '../store/useAudioStore';

/**
 * Invisible YouTube IFrame player (FR-17). It is created on the first play request and follows the store:
 * current track, play / pause, master volume and the global mute (AC-18.1 pauses YouTube).
 */
export const YouTubeHost: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YouTubePlayer | null>(null);
  const loadedIdRef = useRef<string | null>(null);
  const [ready, setReady] = useState(false);
  const [muted, setMuted] = useState(isMuted);
  const queue = useAudioStore((state) => state.queue);
  const currentIndex = useAudioStore((state) => state.currentIndex);
  const wantsPlaying = useAudioStore((state) => state.wantsYouTubePlaying);
  const masterVolume = useSettingsStore((state) => state.settings.ambientVolumes.master);
  const videoId = currentIndex >= 0 ? parseYouTubeId(queue[currentIndex]?.url ?? '') : null;

  useEffect(() => subscribeMute(setMuted), []);

  // Create the player lazily: the IFrame API script is only downloaded once music is actually requested.
  useEffect(() => {
    if (!wantsPlaying || playerRef.current || !containerRef.current) return;
    let cancelled = false;
    const host = document.createElement('div');
    containerRef.current.appendChild(host);
    loadYouTubeApi()
      .then((YT: YouTubeNamespace) => {
        if (cancelled) return;
        playerRef.current = new YT.Player(host, {
          width: 200,
          height: 200,
          playerVars: { autoplay: 0, controls: 0, playsinline: 1, rel: 0 },
          events: {
            onReady: () => setReady(true),
            onStateChange: ({ data }) => {
              if (data === YT.PlayerState.ENDED) useAudioStore.getState().handleTrackEnded();
            },
            onError: () => {
              useToastStore.getState().showToast('This video cannot be played, skipping.', { variant: 'error' });
              useAudioStore.getState().handleTrackEnded();
            },
          },
        });
      })
      .catch(() => {
        useAudioStore.setState({ wantsYouTubePlaying: false });
        useToastStore.getState().showToast('YouTube player could not be loaded.', { variant: 'error' });
      });
    return () => {
      cancelled = true;
    };
  }, [wantsPlaying]);

  useEffect(
    () => () => {
      playerRef.current?.destroy();
      playerRef.current = null;
    },
    [],
  );

  // Follow the store: load the current track, then play or pause it. Muting pauses YouTube.
  useEffect(() => {
    const player = playerRef.current;
    if (!ready || !player) return;
    if (!videoId) {
      player.pauseVideo();
      loadedIdRef.current = null;
      return;
    }
    const shouldPlay = wantsPlaying && !muted;
    if (loadedIdRef.current !== videoId) {
      loadedIdRef.current = videoId;
      if (shouldPlay) player.loadVideoById(videoId);
      else player.cueVideoById(videoId);
      return;
    }
    if (shouldPlay) player.playVideo();
    else player.pauseVideo();
  }, [ready, videoId, wantsPlaying, muted]);

  useEffect(() => {
    if (ready) playerRef.current?.setVolume(Math.round(masterVolume * 100));
  }, [ready, masterVolume]);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-testid="youtube-host"
      className="pointer-events-none fixed -left-[9999px] top-0 h-[200px] w-[200px] overflow-hidden opacity-0"
    />
  );
};
