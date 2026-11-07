import React, { useMemo } from 'react';
import { Flame } from 'lucide-react';
import { computeStreak, countToday } from '@/core/hud/stats';
import { useFocusSessionsStore } from '@/core/data/useFocusSessionsStore';
import { formatMinutes, minutesByIntent, WEEKDAY_LABELS, weekMinutes } from '../lib/analytics';

const CHART_HEIGHT = 120;

const Stat: React.FC<{ label: string; value: string; testId: string }> = ({ label, value, testId }) => (
  <div className="flex flex-col gap-1 rounded-xl bg-white/5 px-3 py-2.5">
    <span className="text-[11px] uppercase tracking-wider text-white/50">{label}</span>
    <span data-testid={testId} className="text-lg font-semibold">
      {value}
    </span>
  </div>
);

/** Weekly bars, streak, minutes per intent and history (FR-21). */
export const AnalyticsContent: React.FC = () => {
  const sessions = useFocusSessionsStore((state) => state.sessions);
  const week = useMemo(() => weekMinutes(sessions), [sessions]);
  const intents = useMemo(() => minutesByIntent(sessions), [sessions]);
  const streak = useMemo(() => computeStreak(sessions), [sessions]);
  const today = useMemo(() => countToday(sessions), [sessions]);
  const weekTotal = week.reduce((sum, minutes) => sum + minutes, 0);
  const maxDay = Math.max(...week, 1);
  const todayIndex = (new Date().getDay() + 6) % 7;
  const maxIntent = intents[0]?.minutes ?? 1;

  return (
    <div className="flex flex-col gap-5 p-5">
      <div className="grid grid-cols-3 gap-2">
        <Stat label="This week" value={formatMinutes(weekTotal)} testId="week-total" />
        <Stat label="Today" value={`${today} sessions`} testId="today-count" />
        <div className="flex flex-col gap-1 rounded-xl bg-white/5 px-3 py-2.5">
          <span className="text-[11px] uppercase tracking-wider text-white/50">Streak</span>
          <span data-testid="current-streak" className="flex items-center gap-1 text-lg font-semibold">
            <Flame className="h-4 w-4 text-accent" aria-hidden="true" />
            {streak} {streak === 1 ? 'Day' : 'Days'}
          </span>
        </div>
      </div>

      <section aria-labelledby="week-chart-title">
        <h3 id="week-chart-title" className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">
          Focus minutes this week
        </h3>
        <svg
          data-testid="week-chart"
          role="img"
          aria-label={`Focus minutes from Monday to Sunday: ${week.join(', ')}`}
          viewBox={`0 0 280 ${CHART_HEIGHT + 20}`}
          className="w-full"
        >
          {week.map((minutes, index) => {
            const height = minutes === 0 ? 2 : Math.max(4, (minutes / maxDay) * CHART_HEIGHT);
            const x = index * 40 + 8;
            return (
              <g key={WEEKDAY_LABELS[index]}>
                <rect
                  data-testid={`bar-${index}`}
                  data-minutes={minutes}
                  x={x}
                  y={CHART_HEIGHT - height}
                  width={24}
                  height={height}
                  rx={4}
                  fill="var(--color-accent)"
                  opacity={index === todayIndex ? 1 : 0.45}
                >
                  <title>{`${WEEKDAY_LABELS[index]}: ${formatMinutes(minutes)}`}</title>
                </rect>
                <text x={x + 12} y={CHART_HEIGHT + 15} textAnchor="middle" fontSize="10" fill="currentColor" opacity={0.6}>
                  {WEEKDAY_LABELS[index]}
                </text>
              </g>
            );
          })}
        </svg>
      </section>

      {intents.length > 0 && (
        <section aria-labelledby="intent-title">
          <h3 id="intent-title" className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">
            By focus intent
          </h3>
          <ul className="flex flex-col gap-2">
            {intents.map((intent) => (
              <li key={intent.title} className="flex flex-col gap-1">
                <div className="flex justify-between gap-2 text-xs">
                  <span className="truncate text-white/85">{intent.title}</span>
                  <span className="shrink-0 text-white/60">{formatMinutes(intent.minutes)}</span>
                </div>
                <div className="h-1.5 rounded-full bg-white/10">
                  <div
                    className="h-1.5 rounded-full bg-accent"
                    style={{ width: `${Math.max(4, (intent.minutes / maxIntent) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="history-title">
        <h3 id="history-title" className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">
          Recent sessions
        </h3>
        {sessions.length === 0 ? (
          <p className="text-xs text-white/50">Finish a focus session to see it here.</p>
        ) : (
          <ul data-testid="session-history" className="flex flex-col divide-y divide-white/5">
            {sessions.slice(0, 10).map((session) => (
              <li key={session.id} className="flex items-center justify-between gap-3 py-2 text-xs">
                <span className="truncate text-white/85">{session.intentTitle || 'Focus session'}</span>
                <span className="shrink-0 text-white/50">
                  {formatMinutes(session.durationMinutes)} ·{' '}
                  {new Date(session.completedAt).toLocaleString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AnalyticsContent;
