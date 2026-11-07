import React, { useEffect, useRef, useState } from 'react';
import { ListMusic, Music, Pause, Play, Plus, SkipBack, SkipForward, Trash2, Volume2, VolumeX } from 'lucide-react';
import { useSettingsStore } from '@/core/data/useSettingsStore';
import { FloatingPanel } from '@/core/ui/FloatingPanel';
import { usePresence } from '@/core/ui/usePresence';
import { useUiStore } from '@/core/ui/useUiStore';
import { setMasterVolume, toggleMasterMute } from '@/shared/lib/web-audio';
import { useMuted } from '../hooks/useAudioSync';
import { CHANNEL_DEFS } from '../lib/channelDefs';
import { useAudioStore } from '../store/useAudioStore';

const ICON_BUTTON =
  'rounded-lg p-1.5 text-white/70 transition-colors hover:bg-white/10 hover:text-white disabled:opacity-30 disabled:hover:bg-transparent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

const SLIDER_CLASS = 'h-1.5 w-full cursor-pointer accent-[var(--color-accent)]';

const MASTER_SAVE_DELAY_MS = 500;

interface SliderRowProps {
  id: string;
  label: string;
  icon: React.ReactNode;
  value: number;
  onChange: (value: number) => void;
}

const SliderRow: React.FC<SliderRowProps> = ({ id, label, icon, value, onChange }) => (
  <div className="flex items-center gap-3">
    <span aria-hidden="true" className="text-white/60">
      {icon}
    </span>
    <label htmlFor={id} className="w-24 shrink-0 text-xs text-white/80">
      {label}
    </label>
    <input
      id={id}
      type="range"
      min={0}
      max={100}
      step={1}
      value={Math.round(value * 100)}
      onChange={(event) => onChange(Number(event.target.value) / 100)}
      className={SLIDER_CLASS}
    />
    <span className="w-9 text-right text-xs tabular-nums text-white/50">{Math.round(value * 100)}%</span>
  </div>
);

const MasterVolume: React.FC = () => {
  const saved = useSettingsStore((state) => state.settings.ambientVolumes.master);
  const [value, setValue] = useState(saved);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const muted = useMuted();

  useEffect(() => setValue(saved), [saved]);
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const change = (next: number) => {
    setValue(next);
    setMasterVolume(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const current = useSettingsStore.getState().settings.ambientVolumes;
      void useSettingsStore.getState().update({ ambientVolumes: { ...current, master: next } });
    }, MASTER_SAVE_DELAY_MS);
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        data-testid="panel-mute-btn"
        aria-label={muted ? 'Unmute (M)' : 'Mute (M)'}
        aria-pressed={muted}
        onClick={() => toggleMasterMute()}
        className={ICON_BUTTON}
      >
        {muted ? <VolumeX className="h-4 w-4" aria-hidden="true" /> : <Volume2 className="h-4 w-4" aria-hidden="true" />}
      </button>
      <label htmlFor="sound-master" className="w-20 shrink-0 text-xs text-white/80">
        Master
      </label>
      <input
        id="sound-master"
        type="range"
        min={0}
        max={100}
        step={1}
        value={Math.round(value * 100)}
        onChange={(event) => change(Number(event.target.value) / 100)}
        className={SLIDER_CLASS}
      />
      <span className="w-9 text-right text-xs tabular-nums text-white/50">{Math.round(value * 100)}%</span>
    </div>
  );
};

const YouTubeQueue: React.FC = () => {
  const [url, setUrl] = useState('');
  const youtubeVolume = useAudioStore((state) => state.youtubeVolume);
  const setYouTubeVolume = useAudioStore((state) => state.setYouTubeVolume);
  const queue = useAudioStore((state) => state.queue);
  const currentIndex = useAudioStore((state) => state.currentIndex);
  const wantsPlaying = useAudioStore((state) => state.wantsYouTubePlaying);
  const isAdding = useAudioStore((state) => state.isAddingTrack);
  const error = useAudioStore((state) => state.trackError);
  const { addTrack, removeTrack, playAt, next, previous, toggleYouTube } = useAudioStore.getState();

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!url.trim() || isAdding) return;
    if (await addTrack(url)) setUrl('');
  };

  const current = currentIndex >= 0 ? queue[currentIndex] : undefined;

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={submit} className="flex gap-2">
        <label htmlFor="youtube-url" className="sr-only">
          Add YouTube Track
        </label>
        <input
          id="youtube-url"
          type="url"
          value={url}
          onChange={(event) => setUrl(event.target.value)}
          placeholder="Paste a YouTube link"
          aria-invalid={error !== null}
          aria-describedby={error ? 'youtube-url-error' : undefined}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
        />
        <button
          type="submit"
          data-testid="add-track-btn"
          disabled={isAdding}
          className="flex items-center gap-1 rounded-lg bg-white/10 px-3 text-sm text-white hover:bg-white/20 disabled:opacity-50"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          {isAdding ? 'Adding…' : 'Add'}
        </button>
      </form>
      {error && (
        <p id="youtube-url-error" role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}

      {current && (
        <div className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2">
          <Music className="h-4 w-4 shrink-0 text-white/60" aria-hidden="true" />
          <span data-testid="current-track" className="min-w-0 flex-1 truncate text-sm" title={current.title}>
            {current.title}
          </span>
          <button type="button" aria-label="Previous track" onClick={previous} disabled={currentIndex <= 0} className={ICON_BUTTON}>
            <SkipBack className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            data-testid="youtube-play-btn"
            aria-label={wantsPlaying ? 'Pause music' : 'Play music'}
            onClick={toggleYouTube}
            className={ICON_BUTTON}
          >
            {wantsPlaying ? <Pause className="h-4 w-4" aria-hidden="true" /> : <Play className="h-4 w-4" aria-hidden="true" />}
          </button>
          <button
            type="button"
            aria-label="Next track"
            onClick={next}
            disabled={currentIndex >= queue.length - 1}
            className={ICON_BUTTON}
          >
            <SkipForward className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      )}

      <SliderRow
        id="youtube-volume"
        label="Music"
        icon={<Music className="h-4 w-4" />}
        value={youtubeVolume}
        onChange={setYouTubeVolume}
      />

      {queue.length > 0 && (
        <ol data-testid="youtube-queue" aria-label="Queue" className="flex flex-col gap-1">
          {queue.map((track, index) => (
            <li key={track.id} className="group flex items-center gap-2 rounded-lg px-2 py-1.5 hover:bg-white/5">
              <button
                type="button"
                onClick={() => playAt(index)}
                aria-current={index === currentIndex ? 'true' : undefined}
                className={`min-w-0 flex-1 truncate text-left text-xs ${index === currentIndex ? 'text-white' : 'text-white/60'}`}
                title={track.title}
              >
                {index + 1}. {track.title}
              </button>
              <button
                type="button"
                aria-label={`Remove ${track.title}`}
                onClick={() => removeTrack(track.id)}
                className={`${ICON_BUTTON} opacity-60 group-hover:opacity-100`}
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
};

/** Sounds tool (FR-16, FR-17): ambient mixer, master volume and the YouTube queue. */
export const SoundPanel: React.FC = () => {
  const isOpen = useUiStore((state) => state.isMixerOpen);
  const isZen = useUiStore((state) => state.isZen);
  const setOpen = useUiStore((state) => state.setMixerOpen);
  const volumes = useAudioStore((state) => state.volumes);
  const isAmbientPaused = useAudioStore((state) => state.isAmbientPaused);
  const setVolume = useAudioStore((state) => state.setVolume);
  const toggleAmbient = useAudioStore((state) => state.toggleAmbient);

  const { mounted, closing } = usePresence(isOpen);

  if (!mounted || isZen) return null;

  return (
    <FloatingPanel
      title="Sounds"
      testId="sound-panel"
      closing={closing}
      icon={<Music className="h-4 w-4" />}
      onClose={() => setOpen(false)}
      actions={
        <button
          type="button"
          data-testid="ambient-toggle"
          aria-label={isAmbientPaused ? 'Play ambient sounds' : 'Pause ambient sounds'}
          onClick={toggleAmbient}
          className={ICON_BUTTON}
        >
          {isAmbientPaused ? <Play className="h-4 w-4" aria-hidden="true" /> : <Pause className="h-4 w-4" aria-hidden="true" />}
        </button>
      }
    >
      <div className="flex flex-col gap-5 p-4">
        <section aria-labelledby="ambient-title" className="flex flex-col gap-3">
          <h3 id="ambient-title" className="text-xs font-medium uppercase tracking-wider text-white/50">
            Ambient
          </h3>
          {CHANNEL_DEFS.map(({ id, label, icon: Icon }) => (
            <SliderRow
              key={id}
              id={`ambient-${id}`}
              label={label}
              icon={<Icon className="h-4 w-4" />}
              value={volumes[id] ?? 0}
              onChange={(value) => setVolume(id, value)}
            />
          ))}
          <MasterVolume />
        </section>
        <section aria-labelledby="youtube-title" className="flex flex-col gap-3">
          <h3 id="youtube-title" className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-white/50">
            <ListMusic className="h-3.5 w-3.5" aria-hidden="true" />
            YouTube
          </h3>
          <YouTubeQueue />
        </section>
      </div>
    </FloatingPanel>
  );
};
