import { describe, it, expect, beforeEach, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';

vi.mock('@/shared/lib/web-audio', () => ({
  isMuted: () => false,
  subscribeMute: () => () => undefined,
  toggleMasterMute: vi.fn(),
  setMasterVolume: vi.fn(),
  getAudioContext: () => null,
  getMasterGain: () => null,
  rampGain: vi.fn(),
}));

import { ControlBar } from '../index';
import { MusicController, SeekBar } from '../components/MusicController';
import { formatTime, thumbnailUrl } from '../lib/youtube';
import { useAudioStore } from '../store/useAudioStore';
import { useUiStore } from '@/core/ui/useUiStore';

const track = (n: number) => ({ id: `t${n}`, title: `Track ${n}`, url: `https://www.youtube.com/watch?v=abcdefghij${n}` });

beforeEach(() => {
  localStorage.clear();
  useAudioStore.setState({
    volumes: { rain: 0, brownNoise: 0, campfire: 0 },
    youtubeVolume: 0.7,
    isAmbientPaused: true,
    queue: [track(1), track(2), track(3)],
    currentIndex: 1,
    wantsYouTubePlaying: false,
    progress: { current: 83, duration: 225 },
    isLive: false,
    listenedSeconds: 0,
    seekRequest: null,
    pausedByPauseAll: null,
  });
  useUiStore.setState({ isMixerOpen: false, isZen: false });
});

describe('formatTime and thumbnailUrl', () => {
  it.each([
    [0, '0:00'],
    [5, '0:05'],
    [83, '1:23'],
    [3725, '1:02:05'],
    [-4, '0:00'],
    [Number.NaN, '0:00'],
  ])('formats %s seconds as %s', (seconds, text) => {
    expect(formatTime(seconds)).toBe(text);
  });

  it('builds the cover image address of a video', () => {
    expect(thumbnailUrl('abcdefghij1')).toBe('https://i.ytimg.com/vi/abcdefghij1/mqdefault.jpg');
  });
});

describe('MusicController', () => {
  it('shows the cover, title and position of the current track', () => {
    const { container } = render(<MusicController />);
    expect(screen.getByTestId('now-playing')).toHaveTextContent('Track 2');
    // The cover is decorative (empty alt): the title already names the track.
    expect(container.querySelector('img')).toHaveAttribute('src', thumbnailUrl('abcdefghij2'));
    expect(screen.getByTestId('bar-seek-current')).toHaveTextContent('1:23');
    expect(screen.getByTestId('bar-seek-duration')).toHaveTextContent('3:45');
    expect(screen.getByTestId('bar-seek')).toHaveAttribute('aria-valuetext', '1:23 of 3:45');
  });

  it('plays, pauses and moves between tracks', () => {
    render(<MusicController />);
    fireEvent.click(screen.getByTestId('bar-play-btn'));
    expect(useAudioStore.getState().wantsYouTubePlaying).toBe(true);
    expect(screen.getByTestId('bar-play-btn')).toHaveAttribute('aria-label', 'Pause music');

    fireEvent.click(screen.getByTestId('bar-next-btn'));
    expect(useAudioStore.getState().currentIndex).toBe(2);
    expect(screen.getByTestId('bar-next-btn')).toBeDisabled();

    fireEvent.click(screen.getByTestId('bar-previous-btn'));
    fireEvent.click(screen.getByTestId('bar-previous-btn'));
    expect(useAudioStore.getState().currentIndex).toBe(0);
    expect(screen.getByTestId('bar-previous-btn')).toBeDisabled();
  });

  it('starts a new track from the beginning', () => {
    render(<MusicController />);
    fireEvent.click(screen.getByTestId('bar-next-btn'));
    expect(useAudioStore.getState().progress).toEqual({ current: 0, duration: 0 });
  });

  it('asks the player to jump when the seek bar moves', () => {
    render(<MusicController />);
    fireEvent.change(screen.getByTestId('bar-seek'), { target: { value: '120' } });
    expect(useAudioStore.getState().seekRequest).toBe(120);
    expect(screen.getByTestId('bar-seek-current')).toHaveTextContent('2:00');
  });

  it('changes only the Music volume', () => {
    render(<MusicController />);
    fireEvent.change(screen.getByTestId('bar-music-volume'), { target: { value: '25' } });
    expect(useAudioStore.getState().youtubeVolume).toBe(0.25);
  });

  it('opens the Sounds panel from the title', () => {
    render(<MusicController />);
    fireEvent.click(screen.getByTestId('now-playing'));
    expect(useUiStore.getState().isMixerOpen).toBe(true);
  });

  it('renders nothing without a current track', () => {
    useAudioStore.setState({ queue: [], currentIndex: -1 });
    const { container } = render(<MusicController />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe('SeekBar', () => {
  it('shows "Live" and cannot seek when the length is unknown', () => {
    useAudioStore.setState({ progress: { current: 30, duration: 0 } });
    render(<SeekBar />);
    expect(screen.getByTestId('seek-bar')).toBeDisabled();
    expect(screen.getByTestId('seek-bar-duration')).toHaveTextContent('Live');
    expect(screen.getByTestId('seek-bar')).toHaveAttribute('aria-valuetext', 'Live');
  });
});

describe('SeekBar on a live stream', () => {
  it('shows Live and how long it has been listened to, without a seek slider', () => {
    useAudioStore.setState({ progress: { current: 0, duration: 0 }, isLive: true, listenedSeconds: 65 });
    render(<SeekBar />);
    expect(screen.getByTestId('seek-bar-live')).toHaveTextContent('Live');
    expect(screen.getByTestId('seek-bar-listened')).toHaveTextContent('1:05 listened');
    expect(screen.queryByTestId('seek-bar')).not.toBeInTheDocument();
  });

  it('goes back to the seek slider for a normal video', () => {
    useAudioStore.setState({ isLive: false });
    render(<SeekBar />);
    expect(screen.getByTestId('seek-bar')).toBeInTheDocument();
    expect(screen.queryByTestId('seek-bar-live')).not.toBeInTheDocument();
  });
});

describe('store rules for progress and seeking', () => {
  it('keeps the seek target inside the video', () => {
    act(() => useAudioStore.getState().seek(999));
    expect(useAudioStore.getState().seekRequest).toBe(225);
    act(() => useAudioStore.getState().seek(-5));
    expect(useAudioStore.getState().seekRequest).toBe(0);
  });

  it('ignores seeking without a track or in a live stream', () => {
    useAudioStore.setState({ progress: { current: 10, duration: 0 } });
    act(() => useAudioStore.getState().seek(5));
    expect(useAudioStore.getState().seekRequest).toBeNull();
    useAudioStore.setState({ currentIndex: -1, progress: { current: 0, duration: 100 } });
    act(() => useAudioStore.getState().seek(5));
    expect(useAudioStore.getState().seekRequest).toBeNull();
  });

  it('cleans up values reported by the player', () => {
    act(() => useAudioStore.getState().setProgress(300, 200));
    expect(useAudioStore.getState().progress).toEqual({ current: 200, duration: 200 });
    act(() => useAudioStore.getState().setProgress(Number.NaN, -1));
    expect(useAudioStore.getState().progress).toEqual({ current: 0, duration: 0 });
    act(() => useAudioStore.getState().setProgress(1500, 0));
    expect(useAudioStore.getState().progress).toEqual({ current: 1500, duration: 0 });
  });

  it('resets the position when the current track is removed', () => {
    act(() => useAudioStore.getState().removeTrack('t2'));
    expect(useAudioStore.getState().progress).toEqual({ current: 0, duration: 0 });
  });

  it('keeps the position when another track is removed', () => {
    act(() => useAudioStore.getState().removeTrack('t3'));
    expect(useAudioStore.getState().progress).toEqual({ current: 83, duration: 225 });
  });
});

describe('ControlBar with music', () => {
  it('turns into the music player and keeps "pause all" only with ambient sounds', () => {
    const { rerender } = render(<ControlBar />);
    expect(screen.getByTestId('music-controller')).toBeInTheDocument();
    expect(screen.queryByTestId('pause-all-btn')).not.toBeInTheDocument();

    act(() => useAudioStore.setState({ volumes: { rain: 0.4, brownNoise: 0, campfire: 0 } }));
    rerender(<ControlBar />);
    expect(screen.getByTestId('pause-all-btn')).toBeInTheDocument();
  });
});
