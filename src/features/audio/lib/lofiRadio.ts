/**
 * Ready-made lofi streams for the YouTube queue. If a stream is taken down, replace its URL here: nothing
 * else depends on these links.
 */
export interface RadioStation {
  id: string;
  title: string;
  url: string;
}

export const LOFI_RADIO: RadioStation[] = [
  { id: 'lofi-girl', title: 'lofi hip hop radio - beats to relax/study to', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
  { id: 'lofi-sleep', title: 'lofi hip hop radio - beats to sleep/chill to', url: 'https://www.youtube.com/watch?v=rUxyKA_-grg' },
  { id: 'synthwave', title: 'synthwave radio - beats to chill/game to', url: 'https://www.youtube.com/watch?v=4xDzrJKXOOY' },
];
