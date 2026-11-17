import React from 'react';
import { CalendarCheck, Clock, Target } from 'lucide-react';
import { PageShell } from '@/core/ui/PageShell';

const PLANNED = [
  { Icon: Target, title: 'Daily goals', text: 'Set how many minutes you want to focus each day and follow your progress.' },
  { Icon: CalendarCheck, title: 'Habit tracking', text: 'Tick off the habits you want to build and keep them going.' },
  { Icon: Clock, title: 'Time per project', text: 'See where your focus time goes, grouped by project or label.' },
];

/** Placeholder for the tracking feature that is still being built. */
export const TrackingPage: React.FC = () => (
  <PageShell title="Tracking" testId="tracking-page" description="Track goals, habits and time in one place.">
    <div className="flex flex-col gap-5 p-5">
      <span
        data-testid="coming-soon"
        className="w-fit rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-contrast"
      >
        Coming soon
      </span>
      <ul className="flex flex-col gap-3">
        {PLANNED.map(({ Icon, title, text }) => (
          <li key={title} className="flex gap-3 rounded-xl bg-white/5 p-4">
            <Icon className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-medium">{title}</h2>
              <p className="text-sm text-white/60">{text}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </PageShell>
);

export default TrackingPage;
