import React, { useMemo } from 'react';
import { computeStreak, countToday } from '@/core/hud/stats';
import { useFocusSessionsStore } from '@/core/data/useFocusSessionsStore';
import { formatMinutes, minutesByIntent, WEEKDAY_LABELS, weekMinutes } from '../lib/analytics';

const CHART_HEIGHT = 120;
const H2 = 'font-display text-[22px] font-medium tracking-[-0.01em]';

const Stat: React.FC<{ label: string; testId: string; children: React.ReactNode }> = ({ label, testId, children }) => (
  <div className="border-t border-site-line py-6 first:border-t-0 sm:border-l sm:border-t-0 sm:px-6 sm:first:border-l-0 sm:first:pl-0">
    <span className="text-sm text-site-muted">{label}</span>
    <span
      data-testid={testId}
      className="mt-2 block font-digits text-4xl font-bold tracking-[-0.04em] tabular-nums sm:text-5xl"
    >
      {children}
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
    <div className="flex flex-col">
      <div className="grid border-y border-site-line sm:grid-cols-3">
        <Stat label="This week" testId="week-total">
          {formatMinutes(weekTotal)}
        </Stat>
        <Stat label="Today" testId="today-count">
          {today} sessions
        </Stat>
        <Stat label="Streak" testId="current-streak">
          {streak} {streak === 1 ? 'Day' : 'Days'}
        </Stat>
      </div>

      <section aria-labelledby="week-chart-title" className="border-b border-site-line py-10">
        <h2 id="week-chart-title" className={H2}>
          Focus minutes this week
        </h2>
        <svg
          data-testid="week-chart"
          role="img"
          aria-label={`Focus minutes from Monday to Sunday: ${week.join(', ')}`}
          viewBox={`0 0 280 ${CHART_HEIGHT + 20}`}
          className="mt-8 w-full max-w-xl text-site-muted"
        >
          {week.map((minutes, index) => {
            const height = minutes === 0 ? 2 : Math.max(4, (minutes / maxDay) * CHART_HEIGHT);
            const x = index * 40 + 8;
            const isToday = index === todayIndex;
            return (
              <g key={WEEKDAY_LABELS[index]}>
                <rect
                  data-testid={`bar-${index}`}
                  data-minutes={minutes}
                  x={x}
                  y={CHART_HEIGHT - height}
                  width={24}
                  height={height}
                  rx={3}
                  className={`animate-bar-grow transition-colors motion-reduce:animate-none ${
                    isToday ? 'fill-site-accent' : 'fill-site-bar hover:fill-site-text'
                  }`}
                  style={{ transformBox: 'fill-box', transformOrigin: 'bottom', animationDelay: `${index * 50}ms` }}
                >
                  <title>{`${WEEKDAY_LABELS[index]}: ${formatMinutes(minutes)}`}</title>
                </rect>
                <text x={x + 12} y={CHART_HEIGHT + 15} textAnchor="middle" fontSize="7.5" fill="currentColor">
                  {WEEKDAY_LABELS[index]}
                </text>
              </g>
            );
          })}
        </svg>
      </section>

      {intents.length > 0 && (
        <section aria-labelledby="intent-title" className="border-b border-site-line py-10">
          <h2 id="intent-title" className={H2}>
            By focus intent
          </h2>
          <ul className="mt-6 flex max-w-2xl flex-col gap-4">
            {intents.map((intent) => (
              <li key={intent.title} className="flex flex-col gap-1.5">
                <div className="flex justify-between gap-3 text-[15px]">
                  <span className="truncate">{intent.title}</span>
                  <span className="shrink-0 font-digits text-sm tabular-nums text-site-muted">
                    {formatMinutes(intent.minutes)}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-site-line">
                  <div
                    className="h-1.5 rounded-full bg-site-accent"
                    style={{ width: `${Math.max(4, (intent.minutes / maxIntent) * 100)}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="history-title" className="py-10">
        <h2 id="history-title" className={H2}>
          Recent sessions
        </h2>
        {sessions.length === 0 ? (
          <p className="mt-4 text-site-muted">Finish a focus session in the workspace to see it here.</p>
        ) : (
          <ul data-testid="session-history" className="mt-4 flex flex-col">
            {sessions.slice(0, 10).map((session) => (
              <li
                key={session.id}
                className="flex items-baseline justify-between gap-4 border-b border-site-line py-4 transition-[padding] duration-200 last:border-b-0 hover:pl-2 motion-reduce:transition-none"
              >
                <span className="min-w-0">
                  <span className="block truncate">{session.intentTitle || 'Focus session'}</span>
                  <span className="text-[13px] text-site-muted">
                    {new Date(session.completedAt).toLocaleString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </span>
                <span className="shrink-0 font-digits text-sm tabular-nums">{formatMinutes(session.durationMinutes)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default AnalyticsContent;
