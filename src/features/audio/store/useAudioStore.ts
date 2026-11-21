import { create } from 'zustand';
import type { YouTubeTrack } from '@/shared/types/contracts';
import { useSettingsStore } from '@/core/data/useSettingsStore';
import { CHANNEL_DEFS } from '../lib/channelDefs';
import { setChannelVolume, setAmbientPaused } from '../lib/ambientEngine';
import { liveStreamId } from '../lib/lofiRadio';
import { fetchVideoTitle, parseYouTubeId, watchUrl } from '../lib/youtube';

export const QUEUE_STORAGE_KEY = 'focusflow_youtube_queue';
export const LEVELS_STORAGE_KEY = 'focusflow_audio_levels';
export const DEFAULT_YOUTUBE_VOLUME = 0.7;
export const QUEUE_MAX = 20;
const PERSIST_DELAY_MS = 500;

/** Slider values 0..1 of every ambient channel, by channel id. */
export type ChannelVolumes = Record<string, number>;

/** Channels saved with the account (database columns volume_rain / volume_brown_noise / volume_campfire). */
const SETTINGS_CHANNELS = CHANNEL_DEFS.filter((def) => def.persist === 'settings').map((def) => def.id);
/** Channels without a database column (lofi): their volume lives on this device only. */
const DEVICE_CHANNELS = CHANNEL_DEFS.filter((def) => def.persist === 'device').map((def) => def.id);

export interface AudioState {
  volumes: ChannelVolumes;
  /** Volume of the YouTube player relative to the master volume, 0..1. */
  youtubeVolume: number;
  /** Ambient channels are silent until the user starts them (no sound on page load). */
  isAmbientPaused: boolean;
  queue: YouTubeTrack[];
  currentIndex: number;
  /** What the user wants the YouTube player to do; the player host follows it. */
  wantsYouTubePlaying: boolean;
  isAddingTrack: boolean;
  trackError: string | null;
  /** Position and length of the current video in seconds, reported by the player. */
  progress: { current: number; duration: number };
  /** True while the current video is a live stream (no length to seek in). */
  isLive: boolean;
  /** Seconds the user has listened to the current live stream (counted while it plays). */
  listenedSeconds: number;
  /** A position the user asked to jump to; the player host applies it and clears it. */
  seekRequest: number | null;
  /**
   * What "pause all" stopped, so pressing it again brings back exactly that and nothing more. Music and ambient
   * sounds are started on their own: playing music never starts the ambient sounds, and the other way round.
   */
  pausedByPauseAll: { ambient: boolean; music: boolean } | null;

  setVolume: (id: string, volume: number) => void;
  setYouTubeVolume: (volume: number) => void;
  /** Applies volumes loaded from the settings (account or guest data). */
  hydrateVolumes: (volumes: ChannelVolumes) => void;
  toggleAmbient: () => void;
  addTrack: (url: string) => Promise<boolean>;
  /** Adds a ready-made station (known title, no lookup) to the end of the queue. */
  addStation: (station: { title: string; url: string }) => boolean;
  removeTrack: (id: string) => void;
  playAt: (index: number) => void;
  next: () => void;
  previous: () => void;
  toggleYouTube: () => void;
  /** Called by the player when a track ends (AC-17.2). */
  handleTrackEnded: () => void;
  togglePauseAll: () => void;
  /** Called by the player host with the latest position. */
  setProgress: (current: number, duration: number) => void;
  /** Called by the player host: whether the track is a live stream and how long it has been listened to. */
  setLive: (isLive: boolean, listenedSeconds: number) => void;
  /** Jumps to a position of the current video (seek bar). */
  seek: (seconds: number) => void;
  clearSeekRequest: () => void;
}

interface StoredQueue {
  queue: YouTubeTrack[];
  currentIndex: number;
}

function isTrack(value: unknown): value is YouTubeTrack {
  if (typeof value !== 'object' || value === null) return false;
  const track = value as Record<string, unknown>;
  return (
    typeof track.id === 'string' &&
    typeof track.title === 'string' &&
    typeof track.url === 'string' &&
    parseYouTubeId(track.url) !== null
  );
}

/** A saved track that points at a retired lofi stream is moved to the stream that replaced it. */
function withLiveStream(track: YouTubeTrack): YouTubeTrack {
  const videoId = parseYouTubeId(track.url);
  if (!videoId || liveStreamId(videoId) === videoId) return track;
  return { ...track, url: watchUrl(liveStreamId(videoId)) };
}

export function readStoredQueue(): StoredQueue {
  try {
    const raw = JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY) ?? 'null') as Partial<StoredQueue> | null;
    const queue = Array.isArray(raw?.queue) ? raw.queue.filter(isTrack).slice(0, QUEUE_MAX).map(withLiveStream) : [];
    const index = typeof raw?.currentIndex === 'number' ? raw.currentIndex : -1;
    return { queue, currentIndex: index >= 0 && index < queue.length ? index : queue.length > 0 ? 0 : -1 };
  } catch {
    return { queue: [], currentIndex: -1 };
  }
}

function writeQueue(queue: YouTubeTrack[], currentIndex: number): void {
  try {
    localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify({ queue, currentIndex }));
  } catch {
    // Storage full or blocked: the queue still works for this visit.
  }
}

/** Levels that only live on this device (YouTube volume), by key. Anything unreadable is dropped. */
export function readDeviceLevels(): Record<string, number> {
  const levels: Record<string, number> = {};
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(LEVELS_STORAGE_KEY) ?? 'null');
    if (typeof parsed === 'object' && parsed !== null) {
      for (const [key, value] of Object.entries(parsed)) {
        if (typeof value === 'number' && Number.isFinite(value)) levels[key] = Math.min(1, Math.max(0, value));
      }
    }
  } catch {
    // corrupted value: start from defaults
  }
  return levels;
}

export function writeDeviceLevel(key: string, level: number): void {
  try {
    localStorage.setItem(LEVELS_STORAGE_KEY, JSON.stringify({ ...readDeviceLevels(), [key]: level }));
  } catch {
    // Storage blocked: the level still applies for this visit.
  }
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;

/** Debounced save of the account channels into user_settings (one update per burst of slider moves). */
function persistVolumes(volumes: ChannelVolumes): void {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    persistTimer = null;
    const current = useSettingsStore.getState().settings.ambientVolumes;
    const patch: Record<string, number> = {};
    SETTINGS_CHANNELS.forEach((id) => {
      patch[id] = volumes[id] ?? 0;
    });
    void useSettingsStore.getState().update({ ambientVolumes: { ...current, ...patch } });
  }, PERSIST_DELAY_MS);
}

export function hasPendingVolumeSave(): boolean {
  return persistTimer !== null;
}

const stored = readStoredQueue();

function initialVolumes(): ChannelVolumes {
  const saved = readDeviceLevels();
  const volumes: ChannelVolumes = {};
  CHANNEL_DEFS.forEach((def) => {
    volumes[def.id] = def.persist === 'device' ? (saved[def.id] ?? 0) : 0;
  });
  return volumes;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  volumes: initialVolumes(),
  youtubeVolume: readDeviceLevels().youtube ?? DEFAULT_YOUTUBE_VOLUME,
  isAmbientPaused: true,
  queue: stored.queue,
  currentIndex: stored.currentIndex,
  wantsYouTubePlaying: false,
  isAddingTrack: false,
  trackError: null,
  progress: { current: 0, duration: 0 },
  isLive: false,
  listenedSeconds: 0,
  seekRequest: null,
  pausedByPauseAll: null,

  setVolume: (id, volume) => {
    const level = Math.min(1, Math.max(0, volume));
    const volumes = { ...get().volumes, [id]: level };
    set({ volumes });
    setChannelVolume(id, level);
    // Moving a slider up is an explicit "play" gesture.
    if (level > 0 && get().isAmbientPaused) {
      set({ isAmbientPaused: false, pausedByPauseAll: null });
      setAmbientPaused(false);
    }
    if (SETTINGS_CHANNELS.includes(id)) persistVolumes(volumes);
    else if (DEVICE_CHANNELS.includes(id)) writeDeviceLevel(id, level);
  },

  setYouTubeVolume: (volume) => {
    const youtubeVolume = Math.min(1, Math.max(0, volume));
    set({ youtubeVolume });
    writeDeviceLevel('youtube', youtubeVolume);
  },

  hydrateVolumes: (loaded) => {
    const volumes = { ...get().volumes };
    SETTINGS_CHANNELS.forEach((id) => {
      volumes[id] = loaded[id] ?? 0;
    });
    set({ volumes });
    Object.keys(volumes).forEach((id) => setChannelVolume(id, volumes[id]));
  },

  toggleAmbient: () => {
    const isAmbientPaused = !get().isAmbientPaused;
    set({ isAmbientPaused, pausedByPauseAll: null });
    setAmbientPaused(isAmbientPaused);
  },

  addTrack: async (url) => {
    const videoId = parseYouTubeId(url);
    if (!videoId) {
      set({ trackError: 'Please paste a valid YouTube video link.' });
      return false;
    }
    if (get().queue.length >= QUEUE_MAX) {
      set({ trackError: `The queue holds up to ${QUEUE_MAX} tracks.` });
      return false;
    }
    set({ isAddingTrack: true, trackError: null });
    const playableId = liveStreamId(videoId);
    const title = await fetchVideoTitle(playableId);
    const track: YouTubeTrack = { id: crypto.randomUUID(), url: watchUrl(playableId), title };
    const queue = [...get().queue, track];
    const currentIndex = get().currentIndex === -1 ? 0 : get().currentIndex;
    set({ queue, currentIndex, isAddingTrack: false });
    writeQueue(queue, currentIndex);
    return true;
  },

  addStation: (station) => {
    if (get().queue.length >= QUEUE_MAX) {
      set({ trackError: `The queue holds up to ${QUEUE_MAX} tracks.` });
      return false;
    }
    const track: YouTubeTrack = { id: crypto.randomUUID(), url: station.url, title: station.title };
    const queue = [...get().queue, track];
    const currentIndex = get().currentIndex === -1 ? 0 : get().currentIndex;
    set({ queue, currentIndex, trackError: null });
    writeQueue(queue, currentIndex);
    return true;
  },

  removeTrack: (id) => {
    const { queue, currentIndex } = get();
    const index = queue.findIndex((track) => track.id === id);
    if (index === -1) return;
    const nextQueue = queue.filter((track) => track.id !== id);
    let nextIndex = currentIndex;
    if (nextQueue.length === 0) nextIndex = -1;
    else if (index < currentIndex) nextIndex = currentIndex - 1;
    else if (index === currentIndex) nextIndex = Math.min(currentIndex, nextQueue.length - 1);
    set({
      queue: nextQueue,
      currentIndex: nextIndex,
      wantsYouTubePlaying: nextQueue.length === 0 ? false : get().wantsYouTubePlaying,
      ...(index === currentIndex ? { progress: { current: 0, duration: 0 }, isLive: false, listenedSeconds: 0, seekRequest: null } : {}),
    });
    writeQueue(nextQueue, nextIndex);
  },

  playAt: (index) => {
    if (index < 0 || index >= get().queue.length) return;
    set({
      currentIndex: index,
      wantsYouTubePlaying: true,
      progress: { current: 0, duration: 0 },
      isLive: false,
      listenedSeconds: 0,
      seekRequest: null,
      pausedByPauseAll: null,
    });
    writeQueue(get().queue, index);
  },

  next: () => {
    const { currentIndex, queue } = get();
    if (currentIndex + 1 < queue.length) get().playAt(currentIndex + 1);
  },

  previous: () => {
    const { currentIndex } = get();
    if (currentIndex > 0) get().playAt(currentIndex - 1);
  },

  toggleYouTube: () => {
    if (get().currentIndex === -1) return;
    set({ wantsYouTubePlaying: !get().wantsYouTubePlaying, pausedByPauseAll: null });
  },

  handleTrackEnded: () => {
    const { currentIndex, queue } = get();
    if (currentIndex + 1 < queue.length) get().playAt(currentIndex + 1);
    else set({ wantsYouTubePlaying: false });
  },

  togglePauseAll: () => {
    const { isAmbientPaused, volumes, wantsYouTubePlaying, currentIndex, pausedByPauseAll } = get();
    const hasAmbient = Object.values(volumes).some((level) => level > 0);
    const ambientAudible = !isAmbientPaused && hasAmbient;
    if (ambientAudible || wantsYouTubePlaying) {
      set({
        isAmbientPaused: true,
        wantsYouTubePlaying: false,
        pausedByPauseAll: { ambient: ambientAudible, music: wantsYouTubePlaying },
      });
      setAmbientPaused(true);
      return;
    }
    // Bring back what "pause all" stopped. Without that memory the button plays the ambient sounds only:
    // the music has its own play button right next to it.
    const resume = pausedByPauseAll ?? { ambient: hasAmbient, music: false };
    const music = resume.music && currentIndex !== -1;
    set({ isAmbientPaused: !resume.ambient, wantsYouTubePlaying: music, pausedByPauseAll: null });
    setAmbientPaused(!resume.ambient);
  },

  setProgress: (current, duration) => {
    const safeDuration = Number.isFinite(duration) && duration > 0 ? duration : 0;
    const safeCurrent = Number.isFinite(current) && current > 0 ? current : 0;
    set({ progress: { current: safeDuration > 0 ? Math.min(safeCurrent, safeDuration) : safeCurrent, duration: safeDuration } });
  },

  setLive: (isLive, listenedSeconds) => {
    const safeSeconds = Number.isFinite(listenedSeconds) && listenedSeconds > 0 ? Math.floor(listenedSeconds) : 0;
    set({ isLive, listenedSeconds: isLive ? safeSeconds : 0 });
  },

  seek: (seconds) => {
    const { currentIndex, progress } = get();
    // Nothing to seek in: no track, or a live stream / a video whose length is not known yet.
    if (currentIndex === -1 || progress.duration <= 0) return;
    const target = Math.min(progress.duration, Math.max(0, seconds));
    set({ seekRequest: target, progress: { ...progress, current: target } });
  },

  clearSeekRequest: () => set({ seekRequest: null }),
}));

// The engine starts in the same paused state as the store, so restored volumes never play on page load.
setAmbientPaused(true);
