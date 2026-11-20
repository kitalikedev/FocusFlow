import React from 'react';
import { usePageTitle } from './usePageTitle';
import { SITE_CONTAINER } from './siteStyles';

export interface PageShellProps {
  /** Page heading, also used for the browser tab title. */
  title: string;
  description?: string;
  testId: string;
  children: React.ReactNode;
}

/** Common frame of the website pages: a large title with its description beside it, then the content. */
export const PageShell: React.FC<PageShellProps> = ({ title, description, testId, children }) => {
  usePageTitle(title);

  return (
    <section
      data-testid={testId}
      aria-labelledby={`${testId}-title`}
      className={`${SITE_CONTAINER} pb-24`}
    >
      <header className="grid gap-5 py-12 sm:py-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:items-end lg:gap-12">
        <h1
          id={`${testId}-title`}
          className="site-rise font-display text-[44px] font-semibold leading-none tracking-[-0.035em] sm:text-[64px]"
        >
          {title}
        </h1>
        {description && (
          <p
            className="site-rise max-w-xl text-[17px] leading-relaxed text-site-muted"
            style={{ '--i': 2 } as React.CSSProperties}
          >
            {description}
          </p>
        )}
      </header>
      {children}
    </section>
  );
};
