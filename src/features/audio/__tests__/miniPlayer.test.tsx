import { describe, it, expect, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MiniPlayer } from '../components/MiniPlayer';
import { SoundPanel } from '../index';
import { thumbnailUrl } from '../lib/youtube';
import { useAudioStore } from '../store/useAudioStore';
import { useUiStore } from '@/core/ui/useUiStore';

const track = (n: number) => ({ id: `t${n}`, title: `Track ${n}`, url: `https://www.youtube.com/watch?v=abcdefghij${n}` });

beforeEach(() => {
  localStorage.clear();
  useUiStore.setState({ isMixerOpen: false });
  useAudioStore.setState({
    youtubeVolume: 0.5,
    queue: [track(1), track(2), track(3)],
    currentIndex: 1,
    wantsYouTubePlaying: true,
    isLive: false,
    listenedSeconds: 0,
    progress: { current: 0, duration: 0 },
    seekRequest: null,
    pausedByPauseAll: null,
  });
});

describe('MiniPlayer on the website pages', () => {
  it('renders nothing when no track is set up', () => {
    useAudioStore.setState({ queue: [], currentIndex: -1, wantsYouTubePlaying: false });
    render(<MiniPlayer />);
    expect(screen.queryByTestId('mini-player')).not.toBeInTheDocument();
  });

  it('shows the cover and title of the current track', () => {
    const { container } = render(<MiniPlayer />);
    expect(screen.getByRole('region', { name: 'Music player' })).toBeInTheDocument();
    expect(screen.getByTestId('mini-player-title')).toHaveTextContent('Track 2');
    expect(container.querySelector('img')).toHaveAttribute('src', thumbnailUrl('abcdefghij2'));
  });

  it('pauses and plays the music', () => {
    render(<MiniPlayer />);
    const play = screen.getByTestId('mini-play-btn');
    expect(play).toHaveAccessibleName('Pause music');
    fireEvent.click(play);
    expect(useAudioStore.getState().wantsYouTubePlaying).toBe(false);
    expect(screen.getByTestId('mini-play-btn')).toHaveAccessibleName('Play music');
  });

  it('skips to the previous and next track and stops at the ends', () => {
    render(<MiniPlayer />);
    fireEvent.click(screen.getByTestId('mini-next-btn'));
    expect(useAudioStore.getState().currentIndex).toBe(2);
    expect(screen.getByTestId('mini-next-btn')).toBeDisabled();
    fireEvent.click(screen.getByTestId('mini-previous-btn'));
    fireEvent.click(screen.getByTestId('mini-previous-btn'));
    expect(useAudioStore.getState().currentIndex).toBe(0);
    expect(screen.getByTestId('mini-previous-btn')).toBeDisabled();
  });

  it('changes the Music volume', () => {
    render(<MiniPlayer />);
    fireEvent.change(screen.getByTestId('mini-music-volume'), { target: { value: '30' } });
    expect(useAudioStore.getState().youtubeVolume).toBeCloseTo(0.3);
  });

  it('shows Live and the listening time for a live stream', () => {
    useAudioStore.setState({ isLive: true, listenedSeconds: 125 });
    render(<MiniPlayer />);
    expect(screen.getByTestId('mini-player-live')).toHaveTextContent('Live · 2:05 listened');
  });
});

describe('queue in the Sounds panel', () => {
  it('shows a cover image for each queued track', () => {
    useUiStore.setState({ isMixerOpen: true });
    render(<SoundPanel />);
    const covers = screen.getAllByTestId('queue-thumbnail');
    expect(covers).toHaveLength(3);
    expect(covers[0]).toHaveAttribute('src', thumbnailUrl('abcdefghij1'));
    expect(covers[2]).toHaveAttribute('src', thumbnailUrl('abcdefghij3'));
  });
});
