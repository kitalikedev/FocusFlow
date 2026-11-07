import { describe, it, expect, vi } from 'vitest';
import { fetchVideoTitle, parseYouTubeId, watchUrl } from '../lib/youtube';

describe('parseYouTubeId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=jfKfPfyJRdk', 'jfKfPfyJRdk'],
    ['https://youtube.com/watch?v=jfKfPfyJRdk&list=abc', 'jfKfPfyJRdk'],
    ['https://youtu.be/jfKfPfyJRdk?t=10', 'jfKfPfyJRdk'],
    ['https://www.youtube.com/embed/jfKfPfyJRdk', 'jfKfPfyJRdk'],
    ['https://www.youtube.com/shorts/jfKfPfyJRdk', 'jfKfPfyJRdk'],
    ['https://music.youtube.com/watch?v=jfKfPfyJRdk', 'jfKfPfyJRdk'],
  ])('reads the id from %s', (url, id) => {
    expect(parseYouTubeId(url)).toBe(id);
  });

  it.each(['not a url', 'https://vimeo.com/123', 'https://www.youtube.com/watch?v=short', 'javascript:alert(1)', 'https://www.youtube.com/channel/abc'])(
    'rejects %s',
    (url) => {
      expect(parseYouTubeId(url)).toBeNull();
    },
  );
});

describe('fetchVideoTitle (AC-17.1)', () => {
  it('asks noembed for the title of the canonical watch URL', async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ title: ' lofi hip hop radio ' }) });
    await expect(fetchVideoTitle('jfKfPfyJRdk', fetcher)).resolves.toBe('lofi hip hop radio');
    expect(fetcher.mock.calls[0][0]).toBe(
      `https://noembed.com/embed?url=${encodeURIComponent(watchUrl('jfKfPfyJRdk'))}`,
    );
  });

  it('falls back to a neutral title when the lookup fails', async () => {
    await expect(fetchVideoTitle('jfKfPfyJRdk', vi.fn().mockResolvedValue({ ok: false }))).resolves.toBe('YouTube video');
    await expect(fetchVideoTitle('jfKfPfyJRdk', vi.fn().mockRejectedValue(new Error('offline')))).resolves.toBe(
      'YouTube video',
    );
    await expect(
      fetchVideoTitle('jfKfPfyJRdk', vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve({ error: 'x' }) })),
    ).resolves.toBe('YouTube video');
  });
});
