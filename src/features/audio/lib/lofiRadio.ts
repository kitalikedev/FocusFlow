/**
 * Ready-made lofi streams for the YouTube queue. A 24/7 stream gets a new link each time its channel restarts it,
 * and the old link then stops playing on other sites (YouTube error 150). When that happens: put the new link
 * here and map the old video id to the new one in RETIRED_STREAMS, so queues saved on devices keep working.
 */
export interface RadioStation {
  id: string;
  title: string;
  url: string;
}

export const LOFI_RADIO: RadioStation[] = [
  { id: 'lofi-girl', title: 'lofi hip hop radio - beats to relax/study to', url: 'https://www.youtube.com/watch?v=rFZHOHl-L8A' },
  { id: 'lofi-sleep', title: 'lofi hip hop radio - beats to sleep/chill to', url: 'https://www.youtube.com/watch?v=JD-kMIpDfnY' },
  { id: 'lofi-jazz', title: 'jazz lofi radio - beats to chill/study to', url: 'https://www.youtube.com/watch?v=E2vONfzoyRI' },
  { id: 'synthwave', title: 'synthwave radio - beats to chill/game to', url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY' },
];

/** Video ids of streams that ended, mapped to the stream that replaced them. */
export const RETIRED_STREAMS: Record<string, string> = {
  jfKfPfyJRdk: 'rFZHOHl-L8A',
  'rUxyKA_-grg': 'JD-kMIpDfnY',
};

/** The id to play for a video: the replacement of a retired stream, otherwise the id itself. */
export function liveStreamId(videoId: string): string {
  return RETIRED_STREAMS[videoId] ?? videoId;
}
