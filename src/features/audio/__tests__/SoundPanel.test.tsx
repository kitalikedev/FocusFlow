import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { FakeContext, type FakeGain } from './fakeAudio';

let ctx: FakeContext;
let master: FakeGain;
let muted = false;
const muteListeners = new Set<(value: boolean) => void>();

vi.mock('@/shared/lib/web-audio', () => ({
  getAudioContext: () => ctx,
  getMasterGain: () => master,
  rampGain: (node: { gain: { value: number } }, target: number) => {
    node.gain.value = target;
  },
  setMasterVolume: vi.fn(),
  isMuted: () => muted,
  subscribeMute: (listener: (value: boolean) => void) => {
    muteListeners.add(listener);
    return () => muteListeners.delete(listener);
  },
  toggleMasterMute: vi.fn(() => {
    muted = !muted;
    muteListeners.forEach((listener) => listener(muted));
    return muted;
  }),
}));

import { ControlBar, SoundPanel } from '../index';
import { DEFAULT_YOUTUBE_VOLUME, LEVELS_STORAGE_KEY, QUEUE_STORAGE_KEY, readDeviceLevels, readStoredQueue, useAudioStore } from '../store/useAudioStore';
import { resetAmbientEngine, setAmbientPaused } from '../lib/ambientEngine';
import { useUiStore } from '@/core/ui/useUiStore';
import { useSettingsStore } from '@/core/data/useSettingsStore';
import { setMasterVolume, toggleMasterMute } from '@/shared/lib/web-audio';

function channelGains(): FakeGain[] {
  return ctx.gains.filter((gain) => gain.connect.mock.calls.some(([target]) => target === master));
}

const track = (n: number) => ({ id: `t${n}`, title: `Track ${n}`, url: `https://www.youtube.com/watch?v=abcdefghij${n}` });

beforeEach(() => {
  ctx = new FakeContext();
  master = ctx.createGain();
  ctx.gains = [];
  muted = false;
  localStorage.clear();
  resetAmbientEngine();
  setAmbientPaused(true);
  useAudioStore.setState({
    volumes: { rain: 0, brownNoise: 0, campfire: 0 },
    youtubeVolume: DEFAULT_YOUTUBE_VOLUME,
    isAmbientPaused: true,
    queue: [],
    currentIndex: -1,
    wantsYouTubePlaying: false,
    isAddingTrack: false,
    trackError: null,
  });
  useUiStore.setState({ isMixerOpen: true, isZen: false });
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('SoundPanel', () => {
  it('stays closed until the dock opens it and hides in Zen', () => {
    useUiStore.setState({ isMixerOpen: false });
    const { rerender } = render(<SoundPanel />);
    expect(screen.queryByTestId('sound-panel')).not.toBeInTheDocument();
    act(() => useUiStore.setState({ isMixerOpen: true, isZen: true }));
    rerender(<SoundPanel />);
    expect(screen.queryByTestId('sound-panel')).not.toBeInTheDocument();
  });

  it('AC-16.1: moving the Rain slider to 50 % starts the rain channel at gain 0.5', () => {
    render(<SoundPanel />);
    fireEvent.change(screen.getByLabelText('Rain'), { target: { value: '50' } });
    expect(useAudioStore.getState().isAmbientPaused).toBe(false);
    expect(channelGains()[0].gain.value).toBeCloseTo(0.5 * 0.55);
    expect(screen.getAllByText('50%').length).toBeGreaterThan(0);
  });

  it('pauses and resumes the ambient channels from the header button', () => {
    render(<SoundPanel />);
    fireEvent.change(screen.getByLabelText('Brown Noise'), { target: { value: '30' } });
    fireEvent.click(screen.getByTestId('ambient-toggle'));
    expect(useAudioStore.getState().isAmbientPaused).toBe(true);
    fireEvent.click(screen.getByTestId('ambient-toggle'));
    expect(useAudioStore.getState().isAmbientPaused).toBe(false);
  });

  it('master slider changes the master volume and the mute button toggles mute', () => {
    render(<SoundPanel />);
    fireEvent.change(screen.getByLabelText('Master'), { target: { value: '40' } });
    expect(setMasterVolume).toHaveBeenCalledWith(0.4);
    fireEvent.click(screen.getByTestId('panel-mute-btn'));
    expect(toggleMasterMute).toHaveBeenCalled();
    expect(screen.getByTestId('panel-mute-btn')).toHaveAttribute('aria-pressed', 'true');
  });

  it('AC-17.1: adds a pasted YouTube link with its real title and keeps the queue', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ title: 'Lofi Girl' }) }));
    render(<SoundPanel />);
    fireEvent.change(screen.getByPlaceholderText('Paste a YouTube link'), {
      target: { value: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
    });
    fireEvent.click(screen.getByTestId('add-track-btn'));

    await waitFor(() => expect(screen.getByTestId('current-track')).toHaveTextContent('Lofi Girl'));
    expect(screen.getByPlaceholderText('Paste a YouTube link')).toHaveValue('');
    expect(readStoredQueue().queue).toHaveLength(1);
    expect(JSON.parse(localStorage.getItem(QUEUE_STORAGE_KEY) ?? '{}').currentIndex).toBe(0);
  });

  it('rejects links that are not YouTube videos', async () => {
    render(<SoundPanel />);
    fireEvent.change(screen.getByPlaceholderText('Paste a YouTube link'), { target: { value: 'https://vimeo.com/1' } });
    fireEvent.click(screen.getByTestId('add-track-btn'));
    expect(await screen.findByRole('alert')).toHaveTextContent('valid YouTube');
  });

  it('the Music slider sets the YouTube volume on its own and remembers it on this device', () => {
    render(<SoundPanel />);
    expect(screen.getByLabelText('Music')).toHaveValue('70');
    fireEvent.change(screen.getByLabelText('Music'), { target: { value: '30' } });
    expect(useAudioStore.getState().youtubeVolume).toBe(0.3);
    expect(useAudioStore.getState().volumes).toEqual({ rain: 0, brownNoise: 0, campfire: 0 });
    expect(JSON.parse(localStorage.getItem(LEVELS_STORAGE_KEY) ?? '{}').youtube).toBe(0.3);
    expect(readDeviceLevels().youtube).toBe(0.3);
  });

  it('keeps other saved levels when the YouTube volume changes and ignores corrupted data', () => {
    localStorage.setItem(LEVELS_STORAGE_KEY, JSON.stringify({ other: 0.5, youtube: 9, bad: 'loud' }));
    expect(readDeviceLevels()).toEqual({ other: 0.5, youtube: 1 });
    useAudioStore.getState().setYouTubeVolume(0.2);
    expect(JSON.parse(localStorage.getItem(LEVELS_STORAGE_KEY) ?? '{}')).toEqual({ other: 0.5, youtube: 0.2 });
    localStorage.setItem(LEVELS_STORAGE_KEY, 'nope');
    expect(readDeviceLevels()).toEqual({});
  });

  it('shows the Lofi channel and keeps its volume on this device, not in the account settings', () => {
    const update = vi.spyOn(useSettingsStore.getState(), 'update').mockResolvedValue(undefined);
    vi.useFakeTimers();
    render(<SoundPanel />);
    fireEvent.change(screen.getByLabelText('Lofi'), { target: { value: '40' } });
    vi.advanceTimersByTime(1000); // longer than the debounce of the account volumes
    vi.useRealTimers();
    expect(useAudioStore.getState().volumes.lofi).toBe(0.4);
    expect(useAudioStore.getState().isAmbientPaused).toBe(false);
    expect(readDeviceLevels().lofi).toBe(0.4);
    expect(update).not.toHaveBeenCalled();
    expect(channelGains().length).toBeGreaterThan(0);
  });

  it('adds a lofi radio station to the queue with its own title', () => {
    render(<SoundPanel />);
    fireEvent.click(screen.getByTestId('radio-lofi-girl'));
    expect(useAudioStore.getState().queue).toHaveLength(1);
    expect(useAudioStore.getState().queue[0].title).toContain('lofi hip hop radio');
    expect(useAudioStore.getState().currentIndex).toBe(0);
    expect(readStoredQueue().queue).toHaveLength(1);
    fireEvent.click(screen.getByTestId('radio-synthwave'));
    expect(useAudioStore.getState().queue).toHaveLength(2);
    expect(useAudioStore.getState().currentIndex).toBe(0);
  });

  it('does not add stations beyond the queue limit', () => {
    const full = Array.from({ length: 20 }, (_, n) => ({ id: `t${n}`, title: `T${n}`, url: `https://www.youtube.com/watch?v=abcdefghij${n % 10}` }));
    useAudioStore.setState({ queue: full, currentIndex: 0 });
    render(<SoundPanel />);
    fireEvent.click(screen.getByTestId('radio-lofi-girl'));
    expect(useAudioStore.getState().queue).toHaveLength(20);
    expect(useAudioStore.getState().trackError).toContain('up to 20');
  });

  it('plays, skips and removes queue items', () => {
    useAudioStore.setState({ queue: [track(1), track(2), track(3)], currentIndex: 0 });
    render(<SoundPanel />);
    fireEvent.click(screen.getByTestId('youtube-play-btn'));
    expect(useAudioStore.getState().wantsYouTubePlaying).toBe(true);
    fireEvent.click(screen.getByLabelText('Next track'));
    expect(useAudioStore.getState().currentIndex).toBe(1);
    fireEvent.click(screen.getByLabelText('Previous track'));
    expect(useAudioStore.getState().currentIndex).toBe(0);
    fireEvent.click(screen.getByText('3. Track 3'));
    expect(useAudioStore.getState().currentIndex).toBe(2);
    fireEvent.click(screen.getByLabelText('Remove Track 1'));
    expect(useAudioStore.getState()).toMatchObject({ currentIndex: 1 });
    expect(useAudioStore.getState().queue.map((item) => item.id)).toEqual(['t2', 't3']);
  });
});

describe('useAudioStore queue rules', () => {
  it('AC-17.2: an ended track moves to the next one and stops after the last', () => {
    useAudioStore.setState({ queue: [track(1), track(2)], currentIndex: 0, wantsYouTubePlaying: true });
    useAudioStore.getState().handleTrackEnded();
    expect(useAudioStore.getState()).toMatchObject({ currentIndex: 1, wantsYouTubePlaying: true });
    useAudioStore.getState().handleTrackEnded();
    expect(useAudioStore.getState()).toMatchObject({ currentIndex: 1, wantsYouTubePlaying: false });
  });

  it('removing the last track stops the music', () => {
    useAudioStore.setState({ queue: [track(1)], currentIndex: 0, wantsYouTubePlaying: true });
    useAudioStore.getState().removeTrack('t1');
    expect(useAudioStore.getState()).toMatchObject({ currentIndex: -1, wantsYouTubePlaying: false });
  });

  it('ignores corrupted stored queues', () => {
    localStorage.setItem(QUEUE_STORAGE_KEY, '{"queue":[{"id":1},{"id":"a","title":"x","url":"https://evil.test"}],"currentIndex":9}');
    expect(readStoredQueue()).toEqual({ queue: [], currentIndex: -1 });
    localStorage.setItem(QUEUE_STORAGE_KEY, 'not json');
    expect(readStoredQueue()).toEqual({ queue: [], currentIndex: -1 });
  });
});

describe('ControlBar (FR-18)', () => {
  it('only shows once audio is set up, and pauses / resumes everything', () => {
    const { rerender } = render(<ControlBar />);
    expect(screen.queryByTestId('control-bar')).not.toBeInTheDocument();
    expect(screen.getByTestId('youtube-host')).toBeInTheDocument();

    act(() => useAudioStore.getState().setVolume('rain', 0.5));
    act(() => useAudioStore.setState({ queue: [track(1)], currentIndex: 0, wantsYouTubePlaying: true }));
    rerender(<ControlBar />);
    expect(screen.getByTestId('now-playing')).toHaveTextContent('Track 1');

    fireEvent.click(screen.getByTestId('pause-all-btn'));
    expect(useAudioStore.getState()).toMatchObject({ isAmbientPaused: true, wantsYouTubePlaying: false });
    expect(screen.getByTestId('now-playing')).toHaveTextContent('Track 1');

    fireEvent.click(screen.getByTestId('pause-all-btn'));
    expect(useAudioStore.getState()).toMatchObject({ isAmbientPaused: false, wantsYouTubePlaying: true });
  });

  it('AC-18.1: the speaker button mutes and shows the crossed speaker', () => {
    useAudioStore.setState({ volumes: { rain: 0.3, brownNoise: 0, campfire: 0 } });
    render(<ControlBar />);
    fireEvent.click(screen.getByTestId('mute-btn'));
    expect(screen.getByTestId('mute-btn')).toHaveAttribute('aria-label', 'Unmute (M)');
  });

  it('the title opens the Sounds panel', () => {
    useUiStore.setState({ isMixerOpen: false });
    useAudioStore.setState({ volumes: { rain: 0.3, brownNoise: 0, campfire: 0 }, isAmbientPaused: false });
    render(<ControlBar />);
    expect(screen.getByTestId('now-playing')).toHaveTextContent('Ambient sounds');
    fireEvent.click(screen.getByTestId('now-playing'));
    expect(useUiStore.getState().isMixerOpen).toBe(true);
  });
});
