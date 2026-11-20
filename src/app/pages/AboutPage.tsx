import React from 'react';
import { PageShell } from '@/core/ui/PageShell';
import { SITE_FOCUS } from '@/core/ui/siteStyles';

const REPO_URL = 'https://github.com/kitalikedev/FocusFlow';

const TEAM = [
  { name: 'Võ Xuân Phú', github: 'vxphuswe' },
  { name: 'Trần Công Sanh', github: 'sanh2k6-sec' },
  { name: 'Nguyễn Anh Dũng', github: 'Nad1406' },
  { name: 'Đàm Huỳnh Hoài Nam', github: 'kitalikedev' },
  { name: 'Lê Nguyễn Thảo Anh', github: 'AnhTe0301' },
];

const STACK = [
  'React 18',
  'TypeScript',
  'Vite',
  'Tailwind CSS',
  'Zustand',
  'Supabase',
  'Web Audio API',
  'Vitest',
  'GitHub Actions',
  'Vercel',
];

const SECTION = 'grid gap-5 border-t border-site-line py-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,2.2fr)] lg:gap-12';
const H2 = 'font-display text-[22px] font-medium tracking-[-0.01em]';
const LINK = `underline underline-offset-[3px] hover:text-site-accent ${SITE_FOCUS}`;

/** About page: what FocusFlow is, who made it and how it is built. Contact details live on the home page. */
export const AboutPage: React.FC = () => (
  <PageShell
    title="About FocusFlow"
    testId="about-page"
    description="FocusFlow is a free focus timer and workspace that runs in the browser. Use it right away as a guest, or sign in to keep your data in sync across devices."
  >
    <section aria-labelledby="about-team" className={SECTION}>
      <h2 id="about-team" className={H2}>
        Team
      </h2>
      <ul className="border-t border-site-line">
        {TEAM.map((member) => (
          <li key={member.github} className="border-b border-site-line">
            <a
              href={`https://github.com/${member.github}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex items-center justify-between gap-4 py-4 transition-[padding] duration-200 hover:pl-2 motion-reduce:transition-none ${SITE_FOCUS}`}
            >
              <span className="text-[17px]">{member.name}</span>
              <span className="font-digits text-[13px] text-site-muted transition-colors group-hover:text-site-accent">
                @{member.github}
              </span>
            </a>
          </li>
        ))}
      </ul>
    </section>

    <section aria-labelledby="about-stack" className={SECTION}>
      <h2 id="about-stack" className={H2}>
        Built with
      </h2>
      <ul className="flex flex-wrap gap-2">
        {STACK.map((item) => (
          <li key={item} className="rounded-lg border border-site-line px-3 py-2 text-sm">
            {item}
          </li>
        ))}
      </ul>
    </section>

    <section aria-labelledby="about-project" className={SECTION}>
      <h2 id="about-project" className={H2}>
        Project
      </h2>
      <dl className="grid gap-6 sm:grid-cols-3">
        <div>
          <dt className="mb-1.5 text-[13px] text-site-muted">Course</dt>
          <dd>Web Basic, CSB25022</dd>
        </div>
        <div>
          <dt className="mb-1.5 text-[13px] text-site-muted">Team</dt>
          <dd>Group 1, class 24SE1, VNUK</dd>
        </div>
        <div>
          <dt className="mb-1.5 text-[13px] text-site-muted">Source code</dt>
          <dd>
            <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={LINK}>
              GitHub repository
            </a>
          </dd>
        </div>
      </dl>
    </section>
  </PageShell>
);

export default AboutPage;
