import { create } from 'zustand';
import type { YouTubeTrack } from '@/shared/types/contracts';
import { useSettingsStore } from '@/core/data/useSettingsStore';
import { CHANNEL_DEFS } from '../lib/channelDefs';
import { setChannelVolume, setAmbientPaused } from '../lib/ambientEngine';
import { fetchVideoTitle, parseYouTubeId, watchUrl } from '../lib/youtube';

export const QUEUE_STORAGE_KEY = 'focusflow_youtube_queue';
export const QUEUE_MAX = 20;
const PERSIST_DELAY_MS = 500;

/** Slider values 0..1 of every ambient channel, by channel id. */
export type ChannelVolumes = Record<string, number>;

/** Channels saved with the account (database columns volume_rain / volume_brown_noise / volume_campfire). */
const SETTINGS_CHANNELS = CHANNEL_DEFS.map((def) => def.id);

export interface AudioState {
  volumes: ChannelVolumes;
  /** Ambient channels are silent until the user starts them (no sound on page load). */
  isAmbientPaused: boolean;
  queue: YouTubeTrack[];
  currentIndex: number;
  /** What the user wants the YouTube player to do; the player host follows it. */
  wantsYouTubePlaying: boolean;
  isAddingTrack: boolean;
  trackError: string | null;

  setVolume: (id: string, volume: number) => void;
  /** Applies volumes loaded from the settings (account or guest data). */
  hydrateVolumes: (volumes: ChannelVolumes) => void;
  toggleAmbient: () => void;
  addTrack: (url: string) => Promise<boolean>;
  removeTrack: (id: string) => void;
  playAt: (index: number) => void;
  next: () => void;
  previous: () => void;
  toggleYouTube: () => void;
  /** Called by the player when a track ends (AC-17.2). */
  handleTrackEnded: () => void;
  togglePauseAll: () => void;
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

export function readStoredQueue(): StoredQueue {
  try {
    const raw = JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY) ?? 'null') as Partial<StoredQueue> | null;
    const queue = Array.isArray(raw?.queue) ? raw.queue.filter(isTrack).slice(0, QUEUE_MAX) : [];
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
  const volumes: ChannelVolumes = {};
  CHANNEL_DEFS.forEach((def) => {
    volumes[def.id] = 0;
  });
  return volumes;
}

export const useAudioStore = create<AudioState>((set, get) => ({
  volumes: initialVolumes(),
  isAmbientPaused: true,
  queue: stored.queue,
  currentIndex: stored.currentIndex,
  wantsYouTubePlaying: false,
  isAddingTrack: false,
  trackError: null,

  setVolume: (id, volume) => {
    const level = Math.min(1, Math.max(0, volume));
    const volumes = { ...get().volumes, [id]: level };
    set({ volumes });
    setChannelVolume(id, level);
    // Moving a slider up is an explicit "play" gesture.
    if (level > 0 && get().isAmbientPaused) {
      set({ isAmbientPaused: false });
      setAmbientPaused(false);
    }
    persistVolumes(volumes);
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
    set({ isAmbientPaused });
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
    const title = await fetchVideoTitle(videoId);
    const track: YouTubeTrack = { id: crypto.randomUUID(), url: watchUrl(videoId), title };
    const queue = [...get().queue, track];
    const currentIndex = get().currentIndex === -1 ? 0 : get().currentIndex;
    set({ queue, currentIndex, isAddingTrack: false });
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
    });
    writeQueue(nextQueue, nextIndex);
  },

  playAt: (index) => {
    if (index < 0 || index >= get().queue.length) return;
    set({ currentIndex: index, wantsYouTubePlaying: true });
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
    set({ wantsYouTubePlaying: !get().wantsYouTubePlaying });
  },

  handleTrackEnded: () => {
    const { currentIndex, queue } = get();
    if (currentIndex + 1 < queue.length) get().playAt(currentIndex + 1);
    else set({ wantsYouTubePlaying: false });
  },

  togglePauseAll: () => {
    const { isAmbientPaused, volumes, wantsYouTubePlaying, currentIndex } = get();
    const ambientAudible = !isAmbientPaused && Object.values(volumes).some((level) => level > 0);
    if (ambientAudible || wantsYouTubePlaying) {
      set({ isAmbientPaused: true, wantsYouTubePlaying: false });
      setAmbientPaused(true);
      return;
    }
    set({ isAmbientPaused: false, wantsYouTubePlaying: currentIndex !== -1 });
    setAmbientPaused(false);
  },
}));

// The engine starts in the same paused state as the store, so restored volumes never play on page load.
setAmbientPaused(true);
