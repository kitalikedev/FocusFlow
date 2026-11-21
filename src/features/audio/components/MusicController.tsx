import React from 'react';
import { Pause, Play, SkipBack, SkipForward, Volume1 } from 'lucide-react';
import { useUiStore } from '@/core/ui/useUiStore';
import { formatTime, parseYouTubeId, thumbnailUrl } from '../lib/youtube';
import { useAudioStore } from '../store/useAudioStore';

const BUTTON_CLASS =
  'rounded-lg p-1.5 text-white/75 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

const RANGE_CLASS = 'h-1 w-full cursor-pointer accent-[var(--color-accent)] disabled:cursor-default disabled:opacity-40';

/** Position of the current video with a slider to jump in it; live streams show "Live" instead. */
export const SeekBar: React.FC<{ testId?: string }> = ({ testId = 'seek-bar' }) => {
  const progress = useAudioStore((state) => state.progress);
  const isLive = useAudioStore((state) => state.isLive);
  const listenedSeconds = useAudioStore((state) => state.listenedSeconds);
  const seek = useAudioStore((state) => state.seek);
  const canSeek = progress.duration > 0;

  // A live stream cannot be seeked: show that it is live and for how long it has been playing.
  if (isLive) {
    return (
      <div
        data-testid={`${testId}-live`}
        aria-label={`Live stream, listened for ${formatTime(listenedSeconds)}`}
        className="flex min-w-0 items-center gap-1.5 text-[11px] tabular-nums text-white/55"
      >
        <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-400" aria-hidden="true" />
        <span className="font-semibold uppercase tracking-wide text-white/80">Live</span>
        <span data-testid={`${testId}-listened`}>{formatTime(listenedSeconds)} listened</span>
      </div>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2 text-[11px] tabular-nums text-white/55">
      <span data-testid={`${testId}-current`} className="w-9 shrink-0 text-right">
        {formatTime(progress.current)}
      </span>
      <input
        type="range"
        data-testid={testId}
        aria-label="Seek"
        aria-valuetext={canSeek ? `${formatTime(progress.current)} of ${formatTime(progress.duration)}` : 'Live'}
        min={0}
        max={canSeek ? Math.floor(progress.duration) : 1}
        step={1}
        value={canSeek ? Math.floor(progress.current) : 0}
        disabled={!canSeek}
        onChange={(event) => seek(Number(event.target.value))}
        className={RANGE_CLASS}
      />
      <span data-testid={`${testId}-duration`} className="w-9 shrink-0">
        {canSeek ? formatTime(progress.duration) : 'Live'}
      </span>
    </div>
  );
};

/**
 * Compact YouTube player for the bottom bar (FR-17, FR-18): cover, title, previous / play / next,
 * a seek bar and the Music volume. Renders nothing when the queue has no current track.
 */
export const MusicController: React.FC = () => {
  const queue = useAudioStore((state) => state.queue);
  const currentIndex = useAudioStore((state) => state.currentIndex);
  const wantsPlaying = useAudioStore((state) => state.wantsYouTubePlaying);
  const youtubeVolume = useAudioStore((state) => state.youtubeVolume);
  const { next, previous, toggleYouTube, setYouTubeVolume } = useAudioStore.getState();
  const openMixer = useUiStore((state) => state.setMixerOpen);

  const track = currentIndex >= 0 ? queue[currentIndex] : undefined;
  if (!track) return null;
  const videoId = parseYouTubeId(track.url);

  return (
    <div data-testid="music-controller" className="flex min-w-0 flex-1 items-center gap-2">
      {videoId && (
        <img
          src={thumbnailUrl(videoId)}
          alt=""
          width={48}
          height={27}
          loading="lazy"
          decoding="async"
          className="h-[27px] w-12 shrink-0 rounded object-cover"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <button
          type="button"
          data-testid="now-playing"
          onClick={() => openMixer(true)}
          title={track.title}
          className="min-w-0 truncate rounded px-1 text-left text-xs text-white/85 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        >
          {track.title}
        </button>
        <SeekBar testId="bar-seek" />
      </div>

      <div className="flex shrink-0 items-center">
        <button
          type="button"
          data-testid="bar-previous-btn"
          aria-label="Previous track"
          onClick={previous}
          disabled={currentIndex <= 0}
          className={BUTTON_CLASS}
        >
          <SkipBack className="h-4 w-4" aria-hidden="true" />
        </button>
        <button
          type="button"
          data-testid="bar-play-btn"
          aria-label={wantsPlaying ? 'Pause music' : 'Play music'}
          onClick={toggleYouTube}
          className={BUTTON_CLASS}
        >
          {wantsPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
        </button>
        <button
          type="button"
          data-testid="bar-next-btn"
          aria-label="Next track"
          onClick={next}
          disabled={currentIndex >= queue.length - 1}
          className={BUTTON_CLASS}
        >
          <SkipForward className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <label className="flex shrink-0 items-center gap-1 text-white/60 max-lg:hidden">
        <Volume1 className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Music volume</span>
        <input
          type="range"
          data-testid="bar-music-volume"
          min={0}
          max={100}
          step={1}
          value={Math.round(youtubeVolume * 100)}
          onChange={(event) => setYouTubeVolume(Number(event.target.value) / 100)}
          className="h-1 w-20 cursor-pointer accent-[var(--color-accent)]"
        />
      </label>
    </div>
  );
};
