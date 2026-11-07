import type { SessionType, TimerMode } from '@/shared/types/contracts';
import type { ClockPosition, ClockVisualMode } from '../hooks/useClockPreferences';

export const MODE_TABS: { mode: TimerMode; label: string }[] = [
  { mode: 'pomodoro', label: 'Pomodoro' },
  { mode: '52_17', label: '52/17' },
  { mode: 'deep_work', label: 'Deep Work' },
  { mode: 'custom', label: 'Custom' },
  { mode: 'stopwatch', label: 'Stopwatch' },
];

export const SESSION_LABELS: Record<SessionType, string> = {
  focus: 'Focus',
  short_break: 'Short Break',
  long_break: 'Long Break',
  stopwatch: 'Stopwatch',
};

export const VISUAL_MODE_OPTIONS: { value: ClockVisualMode; label: string }[] = [
  { value: 'minimal', label: 'Minimal' },
  { value: 'circular_ring', label: 'Circular Ring' },
  { value: 'retro_flip', label: 'Retro Flip' },
];

export const POSITION_OPTIONS: { value: ClockPosition; label: string }[] = [
  { value: 'center', label: 'Center' },
  { value: 'mini_corner', label: 'Mini Corner' },
];

export const CONTROL_BUTTON_CLASS =
  'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-white/80 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-300';
