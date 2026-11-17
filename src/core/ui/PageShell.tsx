import React from 'react';
import { usePageTitle } from './usePageTitle';

export interface PageShellProps {
  /** Page heading, also used for the browser tab title. */
  title: string;
  description?: string;
  testId: string;
  /** Wider card for pages that hold a lot of content. */
  wide?: boolean;
  children: React.ReactNode;
}

/** Common frame of the website pages: a titled glass card. */
export const PageShell: React.FC<PageShellProps> = ({ title, description, testId, wide, children }) => {
  usePageTitle(title);

  return (
    <section
      data-testid={testId}
      aria-labelledby={`${testId}-title`}
      className={`mx-auto w-full overflow-hidden rounded-2xl border text-white shadow-2xl ${wide ? 'max-w-3xl' : 'max-w-2xl'}`}
      style={{
        backgroundColor: 'var(--panel-bg)',
        backdropFilter: 'blur(var(--capsule-blur))',
        WebkitBackdropFilter: 'blur(var(--capsule-blur))',
        borderColor: 'var(--capsule-border-color)',
      }}
    >
      <header className="border-b border-white/10 px-5 py-4">
        <h1 id={`${testId}-title`} className="text-lg font-semibold">
          {title}
        </h1>
        {description && <p className="mt-1 text-xs text-white/60">{description}</p>}
      </header>
      {children}
    </section>
  );
};
