import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { THEME_PRESETS } from '@/features/theme-wallpaper';
import { usePageTitle } from '@/core/ui/usePageTitle';
import { Reveal } from '@/core/ui/Reveal';
import { SITE_BUTTON_LINE, SITE_CONTAINER, SITE_FOCUS } from '@/core/ui/siteStyles';
import { useSitePreset } from '@/core/ui/siteTheme';
import { OpenAppButton } from '../site/OpenAppButton';
import { Slideshow, type Slide } from '../site/Slideshow';
import { ThemeSwitcher } from '../site/ThemeSwitcher';
import { DemoTimer } from './DemoTimer';

const HEADLINE = 'A calm place to get more done';

const THEME_SLIDES: Slide[] = THEME_PRESETS.map((preset) => ({
  id: preset.id,
  image: `theme-${preset.id}`,
  alt: `The FocusFlow workspace with the ${preset.name} theme and the focus timer`,
  label: preset.name,
}));

const CLOCK_SLIDES: Slide[] = [
  {
    id: 'minimal',
    image: 'theme-nebula',
    alt: 'The minimal clock with the Nebula theme',
    label: 'Minimal clock',
  },
  {
    id: 'ring',
    image: 'clock-ring',
    alt: 'The ring clock with the Midnight Indigo theme',
    label: 'Ring clock',
  },
  {
    id: 'flip',
    image: 'clock-flip',
    alt: 'The flip clock with the Amber Wood theme',
    label: 'Flip clock',
  },
];

const EFFECT_SLIDES: Slide[] = [
  {
    id: 'rain',
    image: 'effect-rain',
    alt: 'Rain falling over the Nordic Night theme',
    label: 'Rain',
  },
  { id: 'snow', image: 'effect-snow', alt: 'Snow falling over the Tokyo Fog theme', label: 'Snow' },
  {
    id: 'fireflies',
    image: 'effect-fireflies',
    alt: 'Fireflies over the Matcha Slate theme',
    label: 'Fireflies',
  },
];

interface Feature {
  id: string;
  title: string;
  text: string;
  points: string[];
  slides?: Slide[];
  image?: { name: string; alt: string };
}

const FEATURES: Feature[] = [
  {
    id: 'timer',
    title: 'A timer that keeps exact time',
    text: 'Pick Pomodoro, 52/17, Deep Work, your own lengths or a stopwatch. The time stays right even when the tab sits in the background.',
    points: [
      'Three clock styles',
      'Breaks start on their own if you want',
      'Full screen with one key',
    ],
    slides: CLOCK_SLIDES,
  },
  {
    id: 'sounds',
    title: 'Sounds for deep work',
    text: 'Mix rain, brown noise, campfire and lofi, made right in the browser. Or paste a YouTube playlist and keep it playing while you work.',
    points: ['A volume for each sound', 'Lofi radio stations ready to play'],
    image: { name: 'sounds', alt: 'The sound panel open over the Matcha Slate theme' },
  },
  {
    id: 'tasks',
    title: 'Tasks and notes next to the clock',
    text: 'Write down what to do, give it a priority and labels, then pick a task as the goal of your next session. Keep quick notes on the side.',
    points: ['Filters by priority and label', 'Notes are saved as you type'],
    image: { name: 'tasks', alt: 'The task list and the notepad open in the workspace' },
  },
  {
    id: 'customize',
    title: 'Make it look like yours',
    text: 'Start from one of 12 themes, then change the colors, the clock font, the glass panels and the wallpaper. Save the result as your own theme.',
    points: ['Animated and pixel wallpapers', 'Upload your own picture'],
    image: { name: 'customize', alt: 'The theme library open next to the Synthwave theme' },
  },
  {
    id: 'effects',
    title: 'Weather on your wallpaper',
    text: 'Turn on rain, snow or fireflies over any wallpaper, and add film grain, glow or scan lines for a retro screen.',
    points: ['Each effect has its own strength', 'Turned off for visitors who prefer less motion'],
    slides: EFFECT_SLIDES,
  },
];

/** Each demo picture stays 5 seconds before the next one fades in. */
const SLIDE_INTERVAL = 5000;

const OWN_PICTURE_POINTS = [
  'JPG, PNG, WebP or animated GIF, up to 5 MB',
  'Works as a guest, saved to your account when you sign in',
  'Blur and dim it so the timer stays easy to read',
];

const SHORTCUTS = [
  { key: 'Space', text: 'Start or pause' },
  { key: 'R', text: 'Reset the timer' },
  { key: 'F', text: 'Full screen' },
  { key: 'M', text: 'Mute the sounds' },
];

const CONTACTS = [
  { href: 'mailto:damnam2456@gmail.com', label: 'damnam2456@gmail.com', note: 'Email' },
  {
    href: 'https://github.com/kitalikedev/FocusFlow/issues',
    label: 'Open an issue on GitHub',
    note: 'Bugs and ideas',
  },
  {
    href: 'https://github.com/kitalikedev/FocusFlow',
    label: 'github.com/kitalikedev/FocusFlow',
    note: 'Source code',
  },
];

const SECTION = 'py-20 sm:py-28';
const H2 =
  'font-display text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] sm:text-[48px]';
const LEAD = 'max-w-xl text-[17px] leading-relaxed text-site-muted';
const FEATURE_SIZES = '(min-width: 1024px) 640px, 100vw';

const FeaturePicture: React.FC<{ name: string; alt: string }> = ({ name, alt }) => (
  <div className="site-lift overflow-hidden rounded-2xl border border-site-line bg-site-surface">
    <img
      src={`/images/home/${name}.webp`}
      srcSet={`/images/home/${name}-720.webp 720w, /images/home/${name}.webp 1440w`}
      sizes={FEATURE_SIZES}
      alt={alt}
      width={1440}
      height={900}
      loading="lazy"
      decoding="async"
      className="block h-auto w-full transition-transform duration-700 hover:scale-[1.03] motion-reduce:transition-none"
    />
  </div>
);

/** Website home page: a timer to try, the workspace in pictures, the main features and how to reach the team. */
export const HomePage: React.FC = () => {
  usePageTitle();
  const { hash } = useLocation();
  const { presetId } = useSitePreset();
  const presetIndex = Math.max(
    0,
    THEME_PRESETS.findIndex((preset) => preset.id === presetId)
  );
  const [slideIndex, setSlideIndex] = useState(presetIndex);

  // Picking a website theme also shows the workspace in that theme.
  useEffect(() => setSlideIndex(presetIndex), [presetIndex]);

  // Links like "/#contact" from other pages land here; the site scrolls in its own container, so scroll by hand.
  useEffect(() => {
    if (hash) document.getElementById(hash.slice(1))?.scrollIntoView();
  }, [hash]);

  return (
    <div data-testid="home-page" className={SITE_CONTAINER}>
      <section
        aria-labelledby="hero-title"
        className="flex flex-col items-center pb-14 pt-14 text-center sm:pt-20"
      >
        <h1
          id="hero-title"
          className="max-w-[14ch] font-display text-[44px] font-semibold leading-[0.98] tracking-[-0.04em] sm:text-[76px]"
        >
          {HEADLINE.split(' ').map((word, index) => (
            <React.Fragment key={word + index}>
              <span className="site-rise" style={{ '--i': index } as React.CSSProperties}>
                {word}
              </span>{' '}
            </React.Fragment>
          ))}
        </h1>
        <p
          className={`${LEAD} site-rise mx-auto mt-6 text-lg`}
          style={{ '--i': 6 } as React.CSSProperties}
        >
          A focus timer and a workspace you can make your own. It runs in your browser, it is free,
          and you do not need an account.
        </p>
        <div
          className="site-rise mt-8 flex flex-wrap justify-center gap-2.5"
          style={{ '--i': 7 } as React.CSSProperties}
        >
          <OpenAppButton />
          <a href="#features" className={SITE_BUTTON_LINE}>
            See what it does
          </a>
        </div>

        <div className="mt-14 w-full sm:mt-20">
          <DemoTimer />
        </div>
        <ThemeSwitcher className="mt-12" />
      </section>

      <section aria-label="The workspace in every theme" className="pb-8">
        <Slideshow
          testId="theme-slideshow"
          label="The workspace in every theme"
          slides={THEME_SLIDES}
          index={slideIndex}
          onIndexChange={setSlideIndex}
          interval={SLIDE_INTERVAL}
          isPriority
        />
      </section>

      <section aria-labelledby="own-picture-title" className="pt-10">
        <Reveal className="grid items-center gap-10 overflow-hidden rounded-3xl border border-site-line bg-site-surface p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)] lg:gap-14">
          <div>
            <h2 id="own-picture-title" className={H2}>
              Make it fully yours with your own picture or GIF
            </h2>
            <p className={`${LEAD} mt-5`}>
              Upload a photo, an artwork or an animated GIF and it becomes the wallpaper behind your
              timer. Then match the colors, the clock font and the glass panels to it.
            </p>
            <ul className="mt-6 flex flex-col gap-2.5">
              {OWN_PICTURE_POINTS.map((point) => (
                <li key={point} className="flex items-center gap-3 text-[15px]">
                  <span
                    aria-hidden="true"
                    className="h-2 w-2 shrink-0 rounded-full bg-site-accent"
                  />
                  {point}
                </li>
              ))}
            </ul>
          </div>
          <div className="relative pb-10 pl-6 sm:pb-14 sm:pl-10">
            <FeaturePicture
              name="custom-picture"
              alt="The workspace with a black and white drawing uploaded as the wallpaper"
            />
            <figure className="site-lift absolute bottom-0 left-0 w-[42%] -rotate-3 overflow-hidden rounded-xl border-4 border-site-surface shadow-2xl">
              <img
                src="/images/home/custom-original.webp"
                alt="The picture before upload: a black and white drawing of a girl with long hair"
                width={640}
                height={360}
                loading="lazy"
                decoding="async"
                className="block h-auto w-full"
              />
              <figcaption className="bg-site-bg px-2.5 py-1.5 text-xs text-site-muted">
                Your picture
              </figcaption>
            </figure>
          </div>
        </Reveal>
      </section>

      <section id="features" aria-labelledby="features-title" className={`${SECTION} scroll-mt-20`}>
        <Reveal className="mb-16 max-w-2xl sm:mb-24">
          <h2 id="features-title" className={H2}>
            Everything for a focus session, in one tab
          </h2>
          <p className={`${LEAD} mt-5`}>
            Your timer, your sounds, your tasks and your progress. Nothing to install.
          </p>
        </Reveal>

        <ul className="flex flex-col gap-24 sm:gap-32">
          {FEATURES.map((feature, index) => {
            const isFlipped = index % 2 === 1;
            return (
              <li
                key={feature.id}
                className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] lg:gap-16"
              >
                <Reveal className={isFlipped ? 'lg:order-2' : ''}>
                  {feature.slides ? (
                    <Slideshow
                      label={feature.title}
                      slides={feature.slides}
                      variant="single"
                      interval={SLIDE_INTERVAL}
                      sizes={FEATURE_SIZES}
                    />
                  ) : (
                    feature.image && (
                      <FeaturePicture name={feature.image.name} alt={feature.image.alt} />
                    )
                  )}
                </Reveal>
                <Reveal index={1} className={isFlipped ? 'lg:order-1' : ''}>
                  <h3 className="font-display text-[28px] font-semibold leading-tight tracking-[-0.02em] sm:text-[34px]">
                    {feature.title}
                  </h3>
                  <p className="mt-4 text-[17px] leading-relaxed text-site-muted">{feature.text}</p>
                  <ul className="mt-6 flex flex-col gap-2.5">
                    {feature.points.map((point) => (
                      <li key={point} className="flex items-center gap-3 text-[15px]">
                        <span
                          aria-hidden="true"
                          className="h-2 w-2 shrink-0 rounded-full bg-site-accent"
                        />
                        {point}
                      </li>
                    ))}
                  </ul>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="themes-title" className={SECTION}>
        <Reveal className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 id="themes-title" className={H2}>
              Pick a look
            </h2>
            <p className={`${LEAD} mt-4`}>
              Each theme sets the colors, the clock font and the wallpaper at once.
            </p>
          </div>
          <Link to="/themes" className={SITE_BUTTON_LINE}>
            All {THEME_PRESETS.length} themes
          </Link>
        </Reveal>
        <div
          className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden py-4"
          style={{
            maskImage: 'linear-gradient(to right, transparent, #000 8%, #000 92%, transparent)',
          }}
        >
          <ul className="site-marquee flex w-max gap-4">
            {[...THEME_PRESETS, ...THEME_PRESETS].map((preset, index) => (
              <li
                key={`${preset.id}-${index}`}
                aria-hidden={index >= THEME_PRESETS.length ? true : undefined}
              >
                <Link
                  to="/themes"
                  tabIndex={index >= THEME_PRESETS.length ? -1 : undefined}
                  className={`site-lift group block w-[260px] overflow-hidden rounded-xl border border-site-line bg-site-surface sm:w-[320px] ${SITE_FOCUS}`}
                >
                  <img
                    src={`/images/home/theme-${preset.id}-720.webp`}
                    alt={index >= THEME_PRESETS.length ? '' : `${preset.name} theme`}
                    width={720}
                    height={450}
                    loading="lazy"
                    decoding="async"
                    className="block h-auto w-full"
                  />
                  <span className="flex items-center justify-between px-3.5 py-2.5 text-sm">
                    {preset.name}
                    <span
                      aria-hidden="true"
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: preset.config.tokens.colorAccent }}
                    />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="keys-title" className={SECTION}>
        <Reveal className="mb-10">
          <h2 id="keys-title" className={H2}>
            Keep your hands on the keys
          </h2>
          <p className={`${LEAD} mt-4`}>Every main action has a shortcut in the workspace.</p>
        </Reveal>
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {SHORTCUTS.map((shortcut, index) => (
            <Reveal as="li" key={shortcut.key} index={index}>
              <div className="group flex h-full flex-col gap-4 rounded-2xl border border-site-line bg-site-surface p-6 transition-colors duration-300 hover:border-site-accent">
                <kbd className="site-clock min-w-12 self-start rounded-lg border border-b-4 border-site-line bg-site-bg px-3 py-2 text-center text-lg font-bold text-site-accent transition-[transform,border-bottom-width] duration-100 group-hover:translate-y-[3px] group-hover:border-b motion-reduce:transition-none">
                  {shortcut.key}
                </kbd>
                <span className="text-site-muted">{shortcut.text}</span>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      <section id="contact" aria-labelledby="contact-title" className={`${SECTION} scroll-mt-20`}>
        <div className="grid gap-10 rounded-3xl border border-site-line bg-site-surface p-6 sm:p-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-16">
          <div>
            <h2 id="contact-title" className={H2}>
              Contact us
            </h2>
            <p className={`${LEAD} mt-4`}>
              Found a bug, or have an idea that would help you focus? Write to us.
            </p>
          </div>
          <ul className="border-t border-site-line">
            {CONTACTS.map((contact) => {
              const isWeb = contact.href.startsWith('http');
              return (
                <li key={contact.href} className="border-b border-site-line">
                  <a
                    href={contact.href}
                    {...(isWeb ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className={`group flex items-center justify-between gap-4 py-[18px] transition-[padding] duration-300 hover:pl-2 motion-reduce:transition-none ${SITE_FOCUS}`}
                  >
                    <span className="min-w-0">
                      <span className="block break-words text-[17px] transition-colors group-hover:text-site-accent">
                        {contact.label}
                      </span>
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
