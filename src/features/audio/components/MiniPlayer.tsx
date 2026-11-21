import React from 'react';
import { Pause, Play, SkipBack, SkipForward, Volume1 } from 'lucide-react';
import { formatTime, parseYouTubeId, thumbnailUrl } from '../lib/youtube';
import { useAudioStore } from '../store/useAudioStore';

const BUTTON_CLASS =
  'rounded-lg p-1.5 text-white/80 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

/**
 * Small music player for the website pages. The music keeps playing when the user leaves the workspace, so these
 * pages need a way to pause it, skip a track and change the volume. Renders nothing when no track is set up.
 */
export const MiniPlayer: React.FC = () => {
  const queue = useAudioStore((state) => state.queue);
  const currentIndex = useAudioStore((state) => state.currentIndex);
  const wantsPlaying = useAudioStore((state) => state.wantsYouTubePlaying);
  const youtubeVolume = useAudioStore((state) => state.youtubeVolume);
  const isLive = useAudioStore((state) => state.isLive);
  const listenedSeconds = useAudioStore((state) => state.listenedSeconds);
  const { next, previous, toggleYouTube, setYouTubeVolume } = useAudioStore.getState();

  const track = currentIndex >= 0 ? queue[currentIndex] : undefined;
  if (!track) return null;
  const videoId = parseYouTubeId(track.url);

  return (
    <div
      data-testid="mini-player"
      role="region"
      aria-label="Music player"
      className="fixed inset-x-0 bottom-3 z-40 mx-auto flex w-[min(30rem,calc(100vw-1.5rem))] items-center gap-2 rounded-2xl border border-white/15 bg-zinc-900/90 p-1.5 pr-2 text-white shadow-2xl backdrop-blur"
    >
      {videoId && (
        <img
          src={thumbnailUrl(videoId)}
          alt=""
          width={48}
          height={27}
          decoding="async"
          className="h-[27px] w-12 shrink-0 rounded object-cover"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <span data-testid="mini-player-title" title={track.title} className="truncate text-xs text-white/90">
          {track.title}
        </span>
        {isLive && (
          <span data-testid="mini-player-live" className="text-[11px] tabular-nums text-white/55">
            <span className="font-semibold uppercase tracking-wide text-white/80">Live</span> · {formatTime(listenedSeconds)}{' '}
            listened
          </span>
        )}
      </div>
      <div className="flex shrink-0 items-center">
        <button
          type="button"
          data-testid="mini-previous-btn"
          aria-label="Previous track"
          onClick={previous}
          disabled={currentIndex <= 0}
          className={BUTTON_CLASS}
        >
          <SkipBack className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          data-testid="mini-play-btn"
          aria-label={wantsPlaying ? 'Pause music' : 'Play music'}
          onClick={toggleYouTube}
          className={BUTTON_CLASS}
        >
          {wantsPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
        </button>
        <button
          type="button"
          data-testid="mini-next-btn"
          aria-label="Next track"
          onClick={next}
          disabled={currentIndex >= queue.length - 1}
          className={BUTTON_CLASS}
        >
          <SkipForward className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      <label className="flex shrink-0 items-center gap-1 text-white/60 max-sm:hidden">
        <Volume1 className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Music volume</span>
        <input
          type="range"
          data-testid="mini-music-volume"
          min={0}
          max={100}
          step={1}
          value={Math.round(youtubeVolume * 100)}
          onChange={(event) => setYouTubeVolume(Number(event.target.value) / 100)}
          className="h-1 w-16 cursor-pointer accent-[var(--color-accent)]"
        />
      </label>
    </div>
  );
};
