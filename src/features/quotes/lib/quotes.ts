export interface Quote {
  text: string;
  /** Left out for proverbs and short reminders without a reliable source. */
  author?: string;
}

/** Short, calm reminders about focus and steady work (FR-31). Keep each under 90 characters. */
export const QUOTES: Quote[] = [
  { text: 'A journey of a thousand miles begins with a single step.', author: 'Lao Tzu' },
  { text: 'Genius is one percent inspiration and ninety-nine percent perspiration.', author: 'Thomas Edison' },
  { text: 'Well done is better than well said.', author: 'Benjamin Franklin' },
  { text: 'Nothing will work unless you do.', author: 'Maya Angelou' },
  { text: 'The only way to do great work is to love what you do.', author: 'Steve Jobs' },
  { text: 'Do what you can, with what you have, where you are.', author: 'Theodore Roosevelt' },
  { text: 'We are what we repeatedly do. Excellence, then, is not an act, but a habit.', author: 'Will Durant' },
  { text: 'The man who moves a mountain begins by carrying away small stones.', author: 'Chinese proverb' },
  { text: 'You can’t use up creativity. The more you use, the more you have.', author: 'Maya Angelou' },
  { text: 'It does not matter how slowly you go, as long as you do not stop.', author: 'Confucius' },
  { text: 'One task at a time.' },
  { text: 'Start small. Stay steady.' },
  { text: 'Progress, not perfection.' },
  { text: 'Done is better than perfect.' },
  { text: 'Focus is choosing what to ignore.' },
  { text: 'Small steps still move you forward.' },
  { text: 'Breathe in. Begin.' },
  { text: 'Today’s effort is tomorrow’s ease.' },
  { text: 'Keep going. You are closer than you think.' },
  { text: 'Quiet mind, steady hands.' },
  { text: 'The next 25 minutes are enough.' },
  { text: 'Begin where you are.' },
  { text: 'Consistency beats intensity.' },
  { text: 'Finish one thing, then choose the next.' },
  { text: 'Calm is a superpower.' },
  { text: 'Be gentle with yourself and keep working.' },
  { text: 'Deep work today, rest well tonight.' },
  { text: 'Make it work, then make it better.' },
  { text: 'A little every day adds up to a lot.' },
  { text: 'Slow is smooth, smooth is fast.' },
  { text: 'You do not have to be perfect to be productive.' },
  { text: 'Protect your attention. It is your most valuable tool.' },
  { text: 'Every expert was once a beginner.' },
  { text: 'Let the work speak for itself.' },
  { text: 'One focused hour beats three distracted ones.' },
  { text: 'Rest is part of the work.' },
  { text: 'Do the hard thing first.' },
  { text: 'Your future self will thank you.' },
  { text: 'Clear desk, clear mind.' },
  { text: 'Show up. The rest follows.' },
];

/**
 * Picks a random quote different from the one currently shown (index in `QUOTES`).
 * `random` returns a number in [0, 1) and is injectable for tests.
 */
export function pickQuoteIndex(current: number | null, random: () => number = Math.random): number {
  if (QUOTES.length === 1) return 0;
  const pool = current === null ? QUOTES.length : QUOTES.length - 1;
  const picked = Math.min(pool - 1, Math.floor(random() * pool));
  return current === null || picked < current ? picked : picked + 1;
}
