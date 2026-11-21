import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { act, render, waitFor } from '@testing-library/react';

const player = {
  loadVideoById: vi.fn(),
  cueVideoById: vi.fn(),
  playVideo: vi.fn(),
  pauseVideo: vi.fn(),
  setVolume: vi.fn(),
  getCurrentTime: vi.fn(() => 42),
  getDuration: vi.fn(() => 180),
  getVideoData: vi.fn((): { isLive?: boolean } => ({})),
  seekTo: vi.fn(),
  destroy: vi.fn(),
};

vi.mock('@/shared/lib/web-audio', () => ({
  isMuted: () => false,
  subscribeMute: () => () => undefined,
}));

// A fake IFrame API: creating the player reports "ready" right away.
vi.mock('../lib/youtube', async (importOriginal) => {
  const original = await importOriginal<typeof import('../lib/youtube')>();
  return {
    ...original,
    loadYouTubeApi: () =>
      Promise.resolve({
        Player: function FakePlayer(_element: HTMLElement, options: { events?: { onReady?: () => void } }) {
          queueMicrotask(() => options.events?.onReady?.());
          return player;
        },
        PlayerState: { ENDED: 0, PLAYING: 1, PAUSED: 2, BUFFERING: 3 },
      }),
  };
});

import { PROGRESS_INTERVAL_MS, YouTubeHost } from '../components/YouTubeHost';
import { useAudioStore } from '../store/useAudioStore';
import { useSettingsStore } from '@/core/data/useSettingsStore';
import { createDefaultSettings } from '@/core/data/defaults';

function setMaster(master: number): void {
  const settings = createDefaultSettings();
  useSettingsStore.setState({ settings: { ...settings, ambientVolumes: { ...settings.ambientVolumes, master } } });
}

const tracks = [
  { id: 't1', title: 'Track 1', url: 'https://www.youtube.com/watch?v=abcdefghij1' },
  { id: 't2', title: 'Track 2', url: 'https://www.youtube.com/watch?v=abcdefghij2' },
];

beforeEach(() => {
  Object.values(player).forEach((fn) => fn.mockClear());
  player.getCurrentTime.mockReturnValue(42);
  player.getDuration.mockReturnValue(180);
  player.getVideoData.mockReturnValue({});
  localStorage.clear();
  setMaster(1);
  useAudioStore.setState({
    youtubeVolume: 0.5,
    queue: tracks,
    currentIndex: 0,
    wantsYouTubePlaying: true,
    progress: { current: 0, duration: 0 },
    isLive: false,
    listenedSeconds: 0,
    seekRequest: null,
  });
});
afterEach(() => {
  vi.useRealTimers();
});

describe('YouTubeHost volume', () => {
  it('sets the player volume to the Music level times the master volume', async () => {
    setMaster(0.8);
    render(<YouTubeHost />);
    await waitFor(() => expect(player.setVolume).toHaveBeenLastCalledWith(40));
  });

  it('follows the Music slider without touching the master volume', async () => {
    render(<YouTubeHost />);
    await waitFor(() => expect(player.setVolume).toHaveBeenLastCalledWith(50));
    act(() => useAudioStore.getState().setYouTubeVolume(0.2));
    await waitFor(() => expect(player.setVolume).toHaveBeenLastCalledWith(20));
    expect(useSettingsStore.getState().settings.ambientVolumes.master).toBe(1);
  });

  it('follows the master volume as well', async () => {
    render(<YouTubeHost />);
    await waitFor(() => expect(player.setVolume).toHaveBeenLastCalledWith(50));
    act(() => setMaster(0.5));
    await waitFor(() => expect(player.setVolume).toHaveBeenLastCalledWith(25));
  });

  it('is silent when the Music level is zero', async () => {
    useAudioStore.setState({ youtubeVolume: 0 });
    render(<YouTubeHost />);
    await waitFor(() => expect(player.setVolume).toHaveBeenLastCalledWith(0));
  });
});

describe('YouTubeHost progress and seeking', () => {
  it('reports the position of the playing video to the store', async () => {
    render(<YouTubeHost />);
    await waitFor(() => expect(useAudioStore.getState().progress).toEqual({ current: 42, duration: 180 }));

    player.getCurrentTime.mockReturnValue(43);
    await waitFor(() => expect(useAudioStore.getState().progress.current).toBe(43), {
      timeout: PROGRESS_INTERVAL_MS * 4,
    });
  });

  it('shows a live stream as Live: its on-air time is not a length to seek in', async () => {
    player.getVideoData.mockReturnValue({ isLive: true });
    player.getDuration.mockReturnValue(15_000_000);
    player.getCurrentTime.mockReturnValue(14_990_000);
    render(<YouTubeHost />);
    await waitFor(() => expect(player.getVideoData).toHaveBeenCalled());
    expect(useAudioStore.getState().progress).toEqual({ current: 0, duration: 0 });
  });

  it('counts how long a live stream has been listened to, and not for a normal video', async () => {
    player.getVideoData.mockReturnValue({ isLive: true });
    player.getDuration.mockReturnValue(15_000_000);
    render(<YouTubeHost />);
    await waitFor(() => expect(useAudioStore.getState().listenedSeconds).toBeGreaterThanOrEqual(1), {
      timeout: PROGRESS_INTERVAL_MS * 8,
    });
    expect(useAudioStore.getState().isLive).toBe(true);
  });

  it('does not report live listening time for a normal video', async () => {
    render(<YouTubeHost />);
    await waitFor(() => expect(useAudioStore.getState().progress.duration).toBe(180));
    expect(useAudioStore.getState()).toMatchObject({ isLive: false, listenedSeconds: 0 });
  });

  it('also treats an impossibly long video as live when YouTube does not say so', async () => {
    player.getDuration.mockReturnValue(15_000_000);
    render(<YouTubeHost />);
    await waitFor(() => expect(player.getDuration).toHaveBeenCalled());
    expect(useAudioStore.getState().progress).toEqual({ current: 0, duration: 0 });
  });

  it('stops reporting while the music is paused', async () => {
    render(<YouTubeHost />);
    await waitFor(() => expect(useAudioStore.getState().progress.current).toBe(42));
    act(() => useAudioStore.setState({ wantsYouTubePlaying: false }));
    const calls = player.getCurrentTime.mock.calls.length;
    await new Promise((resolve) => setTimeout(resolve, PROGRESS_INTERVAL_MS * 2));
    expect(player.getCurrentTime.mock.calls.length).toBe(calls);
  });

  it('skips the reading while the tab is hidden', async () => {
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    render(<YouTubeHost />);
    await waitFor(() => expect(player.setVolume).toHaveBeenCalled());
    await new Promise((resolve) => setTimeout(resolve, PROGRESS_INTERVAL_MS + 100));
    expect(player.getCurrentTime).not.toHaveBeenCalled();
    visibility.mockRestore();
  });

  it('jumps to the position chosen on the seek bar and clears the request', async () => {
    render(<YouTubeHost />);
    await waitFor(() => expect(useAudioStore.getState().progress.duration).toBe(180));
    act(() => useAudioStore.getState().seek(90));
    await waitFor(() => expect(player.seekTo).toHaveBeenCalledWith(90, true));
    expect(useAudioStore.getState().seekRequest).toBeNull();
  });
});
