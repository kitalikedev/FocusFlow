import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { THEME_PRESETS } from '@/features/theme-wallpaper';
import { usePageTitle } from '@/core/ui/usePageTitle';
import { SITE_BUTTON_LINE, SITE_CONTAINER, SITE_FOCUS } from '@/core/ui/siteStyles';
import { OpenAppButton } from '../site/OpenAppButton';
import { DemoTimer } from './DemoTimer';

const FEATURES = [
  {
    title: 'Focus timer',
    text: 'Pomodoro, 52/17, Deep Work, Custom and Stopwatch. It keeps exact time even when the tab is in the background.',
  },
  {
    title: 'Themes and wallpapers',
    text: '12 themes, animated wallpapers, your own images, and effects like rain, snow and fireflies.',
  },
  {
    title: 'Sounds for deep work',
    text: 'Rain, brown noise, campfire and lofi made right in the browser, plus your own YouTube playlist.',
  },
  {
    title: 'Tasks and notes',
    text: 'Plan what to do next, pick a task as the goal of a session and keep quick notes on the side.',
  },
  {
    title: 'Progress',
    text: 'Weekly focus minutes, a daily streak and the history of every session you finish.',
  },
];

const SHORTCUTS = [
  { key: 'Space', text: 'Start or pause' },
  { key: 'R', text: 'Reset the timer' },
  { key: 'F', text: 'Full screen' },
  { key: 'M', text: 'Mute the sounds' },
];

const SHOWN_THEMES = ['nebula', 'midnight-indigo', 'matcha-slate', 'amber-wood', 'cyberpunk-neon', 'retro-terminal'];

const CONTACTS = [
  { href: 'mailto:damnam2456@gmail.com', label: 'damnam2456@gmail.com', note: 'Email' },
  { href: 'https://github.com/kitalikedev/FocusFlow/issues', label: 'Open an issue on GitHub', note: 'Bugs and ideas' },
  { href: 'https://github.com/kitalikedev/FocusFlow', label: 'github.com/kitalikedev/FocusFlow', note: 'Source code' },
];

const SECTION = 'border-t border-site-line py-16 sm:py-24';
const SECTION_HEAD = 'mb-10 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-12';
const H2 = 'font-display text-[32px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[40px]';
const LEAD = 'max-w-xl text-[17px] leading-relaxed text-site-muted';

/** Website home page: what FocusFlow is, a timer to try, the main features and how to reach the team. */
export const HomePage: React.FC = () => {
  usePageTitle();
  const { hash } = useLocation();

  // Links like "/#contact" from other pages land here; the site scrolls in its own container, so scroll by hand.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  const themes = SHOWN_THEMES.map((id) => THEME_PRESETS.find((preset) => preset.id === id)).filter(
    (preset): preset is (typeof THEME_PRESETS)[number] => Boolean(preset),
  );

  return (
    <div data-testid="home-page" className={SITE_CONTAINER}>
      <section
        aria-labelledby="hero-title"
        className="grid items-end gap-12 py-12 sm:py-20 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16"
      >
        <div>
          <h1
            id="hero-title"
            className="mb-6 font-display text-5xl font-semibold leading-[0.98] tracking-[-0.035em] sm:text-[72px]"
          >
            A calm place to get more done
          </h1>
          <p className={`${LEAD} mb-8 max-w-[460px] text-lg`}>
            FocusFlow is a focus timer and a workspace you can make your own. It runs in your browser, it is free, and
            you do not need an account.
          </p>
          <div className="flex flex-wrap gap-2.5">
            <OpenAppButton />
            <a href="#features" className={SITE_BUTTON_LINE}>
              See what it does
            </a>
          </div>
        </div>
        <DemoTimer />
      </section>

      <figure className="mb-16 overflow-hidden rounded-[14px] border border-site-line bg-site-surface sm:mb-24">
        <img
          src="/images/app-preview.jpg"
          alt="The FocusFlow workspace with the Nebula theme and the focus timer"
          width={1440}
          height={900}
          // React 18 drops the camelCase `fetchPriority` prop, so the lowercase HTML attribute is passed as is.
          {...{ fetchpriority: 'high' }}
          className="block h-auto w-full"
        />
        <figcaption className="border-t border-site-line px-4 py-3 text-[13px] text-site-muted">
          The workspace with the Nebula theme
        </figcaption>
      </figure>

      <section id="features" aria-labelledby="features-title" className={`${SECTION} scroll-mt-20`}>
        <div className={SECTION_HEAD}>
          <h2 id="features-title" className={H2}>
            What is inside
          </h2>
          <p className={LEAD}>One quiet tab for your timer, your sounds, your tasks and your progress. Nothing to install.</p>
        </div>
        <ul className="border-t border-site-line">
          {FEATURES.map((feature) => (
            <li
              key={feature.title}
              className="grid gap-2 border-b border-site-line py-6 transition-[padding] duration-200 hover:pl-3 motion-reduce:transition-none lg:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)] lg:gap-12"
            >
              <h3 className="font-display text-[22px] font-medium tracking-[-0.01em]">{feature.title}</h3>
              <p className="leading-relaxed text-site-muted">{feature.text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="keys-title" className={SECTION}>
        <div className={SECTION_HEAD}>
          <h2 id="keys-title" className={H2}>
            Keep your hands on the keys
          </h2>
          <p className={LEAD}>Every main action has a shortcut in the workspace.</p>
        </div>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {SHORTCUTS.map((shortcut) => (
            <li
              key={shortcut.key}
              className="group flex flex-col gap-3.5 rounded-xl border border-site-line p-5 transition-colors hover:border-site-text"
            >
              <kbd className="min-w-11 self-start rounded-lg border border-b-[3px] border-site-line bg-site-surface px-3 py-2 text-center font-digits text-[15px] font-semibold transition-[transform,border-bottom-width] duration-100 group-hover:translate-y-0.5 group-hover:border-b motion-reduce:transition-none">
                {shortcut.key}
              </kbd>
              <span className="text-site-muted">{shortcut.text}</span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="themes-title" className={SECTION}>
        <div className={SECTION_HEAD}>
          <h2 id="themes-title" className={H2}>
            Pick a look
          </h2>
          <div className="flex flex-wrap items-start justify-between gap-6">
            <p className={LEAD}>Each theme sets the colors, the clock font and the wallpaper at once.</p>
            <Link to="/themes" className={SITE_BUTTON_LINE}>
              All {THEME_PRESETS.length} themes
            </Link>
          </div>
        </div>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {themes.map((preset) => (
            <li key={preset.id}>
              <Link
                to="/themes"
                className={`group flex flex-col overflow-hidden rounded-xl border border-site-line transition-colors hover:border-site-text ${SITE_FOCUS}`}
              >
                <span
                  className="flex h-24 items-center justify-center text-[22px] font-bold transition-[letter-spacing] duration-300 group-hover:tracking-[0.08em] motion-reduce:transition-none"
                  style={{
                    backgroundColor: preset.config.tokens.bgSolidColor,
                    color: preset.config.tokens.colorAccent,
                    fontFamily: preset.config.tokens.fontClock,
                  }}
                >
                  25:00
                </span>
                <span className="border-t border-site-line px-3 py-2.5 text-[13px]">{preset.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="contact" aria-labelledby="contact-title" className={`${SECTION} scroll-mt-20`}>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16">
          <div>
            <h2 id="contact-title" className={H2}>
              Contact us
            </h2>
            <p className={`${LEAD} mt-4`}>Found a bug, or have an idea that would help you focus? Write to us.</p>
          </div>
          <ul className="border-t border-site-line">
            {CONTACTS.map((contact) => {
              const isWeb = contact.href.startsWith('http');
              return (
                <li key={contact.href} className="border-b border-site-line">
                  <a
                    href={contact.href}
                    {...(isWeb ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className={`group flex items-center justify-between gap-4 py-[18px] ${SITE_FOCUS}`}
                  >
                    <span className="min-w-0">
                      <span className="block break-words text-[17px]">{contact.label}</span>
                      <span className="text-sm text-site-muted">{contact.note}</span>
                    </span>
                    <ArrowUpRight
                      className="h-4 w-4 shrink-0 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none"
                      aria-hidden="true"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
