import React from 'react';
import { ExternalLink } from 'lucide-react';
import { PageShell } from '@/core/ui/PageShell';

const REPO_URL = 'https://github.com/kitalikedev/FocusFlow';

const TEAM = [
  { name: 'Võ Xuân Phú', github: 'vxphuswe' },
  { name: 'Trần Công Sanh', github: 'sanh2k6-sec' },
  { name: 'Nguyễn Anh Dũng', github: 'Nad1406' },
  { name: 'Đàm Huỳnh Hoài Nam', github: 'kitalikedev' },
  { name: 'Lê Nguyễn Thảo Anh', github: 'AnhTe0301' },
];

const STACK = [
  'React 18 and TypeScript',
  'Vite and Tailwind CSS',
  'Zustand for state',
  'Supabase: Auth, PostgreSQL with Row Level Security, Storage',
  'Web Audio API and the YouTube IFrame API',
  'Vitest, GitHub Actions and Vercel',
];

const LINK_CLASS =
  'inline-flex items-center gap-1 text-accent underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40';

const SectionTitle: React.FC<{ id: string; children: React.ReactNode }> = ({ id, children }) => (
  <h2 id={id} className="mb-2 text-xs font-medium uppercase tracking-wider text-white/50">
    {children}
  </h2>
);

/** About and contact page: what FocusFlow is, how it is built, who made it and where to reach the team. */
export const AboutPage: React.FC = () => (
  <PageShell
    title="About FocusFlow"
    testId="about-page"
    wide
    description="An aesthetic workspace with an accurate focus timer, made by Group 1, class 24SE1."
  >
    <div className="flex flex-col gap-6 p-5 text-sm text-white/85">
      <section aria-labelledby="about-what">
        <SectionTitle id="about-what">What it is</SectionTitle>
        <p>
          FocusFlow combines a Pomodoro-style timer with themes, generated background sounds, tasks, notes and focus
          statistics. Use it right away as a guest, or sign in to keep your data in sync across devices.
        </p>
      </section>

      <section aria-labelledby="about-stack">
        <SectionTitle id="about-stack">Built with</SectionTitle>
        <ul className="list-disc pl-5">
          {STACK.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="about-team">
        <SectionTitle id="about-team">Team</SectionTitle>
        <ul className="grid gap-2 sm:grid-cols-2">
          {TEAM.map((member) => (
            <li key={member.github} className="flex flex-col rounded-xl bg-white/5 px-3 py-2">
              <span className="font-medium">{member.name}</span>
              <a
                href={`https://github.com/${member.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`${LINK_CLASS} text-xs`}
              >
                @{member.github}
                <ExternalLink className="h-3 w-3" aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="about-contact">
        <SectionTitle id="about-contact">Contact</SectionTitle>
        <p>
          Found a bug or have an idea? Open an issue on{' '}
          <a href={`${REPO_URL}/issues`} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
            GitHub
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
          . The source code is in the{' '}
          <a href={REPO_URL} target="_blank" rel="noopener noreferrer" className={LINK_CLASS}>
            repository
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
          .
        </p>
      </section>
    </div>
  </PageShell>
);

export default AboutPage;
