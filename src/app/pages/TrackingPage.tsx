import React from 'react';
import { Link } from 'react-router-dom';
import { PageShell } from '@/core/ui/PageShell';
import { SITE_BUTTON_PRIMARY } from '@/core/ui/siteStyles';

const PLANNED = [
  { title: 'Daily goals', text: 'Set how many minutes you want to focus each day and follow your progress.' },
  { title: 'Habit tracking', text: 'Tick off the habits you want to build and keep them going.' },
  { title: 'Time per project', text: 'See where your focus time goes, grouped by project or label.' },
];

/** Placeholder for the tracking feature that is still being built. */
export const TrackingPage: React.FC = () => (
  <PageShell
    title="Tracking"
    testId="tracking-page"
    description="Goals, habits and time, all in one place. We are building it now. Here is what is planned."
  >
    <span
      data-testid="coming-soon"
      className="mb-8 inline-block rounded-md border border-site-line px-2.5 py-1 text-sm text-site-muted"
    >
      Coming soon
    </span>
    <ul className="border-t border-site-line">
      {PLANNED.map((item) => (
        <li
          key={item.title}
          className="grid gap-2 border-b border-site-line py-6 transition-[padding] duration-200 hover:pl-3 motion-reduce:transition-none lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-12"
        >
          <h2 className="font-display text-[22px] font-medium tracking-[-0.01em]">{item.title}</h2>
          <p className="leading-relaxed text-site-muted">{item.text}</p>
        </li>
      ))}
    </ul>
    <div className="flex flex-wrap items-center justify-between gap-4 pt-8 text-site-muted">
      <span>Something you would like to track?</span>
      <Link to="/#contact" className={SITE_BUTTON_PRIMARY}>
        Tell us
      </Link>
    </div>
  </PageShell>
);

export default TrackingPage;
