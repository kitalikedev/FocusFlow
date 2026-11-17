import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, ListChecks, Music, Palette, Timer } from 'lucide-react';
import { usePageTitle } from '@/core/ui/usePageTitle';
import { APP_PATH } from '@/core/ui/routes';
import { OpenAppButton } from '../site/OpenAppButton';

const FEATURES = [
  {
    Icon: Timer,
    title: 'Accurate focus timer',
    text: 'Pomodoro, 52/17, Deep Work, Custom and Stopwatch. It keeps exact time even when the tab is in the background.',
  },
  {
    Icon: Palette,
    title: 'A workspace that feels like yours',
    text: '12 themes, animated wallpapers, your own images and effects like rain, snow and fireflies.',
  },
  {
    Icon: Music,
    title: 'Sounds for deep work',
    text: 'Rain, brown noise, campfire and lofi made right in the browser, plus your own YouTube playlist.',
  },
  {
    Icon: ListChecks,
    title: 'Tasks and notes',
    text: 'Plan what to do next, pick a task as the goal of a session and keep quick notes on the side.',
  },
  {
    Icon: BarChart3,
    title: 'Progress you can see',
    text: 'Weekly focus minutes, a daily streak and the history of every session you complete.',
  },
];

/** Website home page: what FocusFlow is, a preview of the workspace and its main features. */
export const HomePage: React.FC = () => {
  usePageTitle();

  return (
    <div data-testid="home-page" className="mx-auto flex max-w-6xl flex-col gap-20">
      <section aria-labelledby="hero-title" className="grid items-center gap-10 lg:grid-cols-2">
        <div className="flex flex-col gap-6">
          <h1 id="hero-title" className="text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            A calm place to get more done
          </h1>
          <p className="max-w-md text-base text-white/70">
            <span className="text-white">FocusFlow is a focus timer and a workspace you can make your own.</span> Free,
            works right away in the browser, no account needed.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <OpenAppButton className="px-5 py-3 text-base" />
            <a
              href="#features"
              className="rounded-xl px-4 py-3 text-sm text-white/70 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
            >
              See features
            </a>
          </div>
        </div>

        <Link
          to={APP_PATH}
          aria-label="Open the FocusFlow workspace"
          className="block overflow-hidden rounded-2xl border border-white/10 shadow-2xl transition-transform hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 motion-reduce:transition-none"
        >
          <img
            src="/images/app-preview.jpg"
            alt="The FocusFlow workspace with the Nebula theme and the focus timer"
            width={1440}
            height={900}
            className="h-auto w-full"
          />
        </Link>
      </section>

      <section id="features" aria-labelledby="features-title" className="scroll-mt-24">
        <h2 id="features-title" className="mb-8 text-center text-2xl font-semibold">
          Everything you need to focus
        </h2>
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ Icon, title, text }) => (
            <li key={title} className="flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
              <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-white/60">{text}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
};

export default HomePage;
