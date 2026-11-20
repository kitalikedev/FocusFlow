import React, { useEffect, useRef, useState } from 'react';
import { SITE_FOCUS } from '@/core/ui/siteStyles';

export interface Slide {
  id: string;
  /** Picture name in public/images/home, without the size and extension. */
  image: string;
  alt: string;
  label: string;
}

interface SlideshowProps {
  slides: Slide[];
  /** Name of the slide group for screen readers, for example "Workspace themes". */
  label: string;
  /** Shown slide when the parent controls it (for example the website theme). */
  index?: number;
  onIndexChange?: (index: number) => void;
  /** Time each slide stays, in milliseconds. */
  interval?: number;
  /** The first picture is the main picture of the page: load it first and show it without a fade. */
  isPriority?: boolean;
  /** Width the picture takes on the page, for the browser to pick the 720 or 1440 px file. */
  sizes?: string;
  testId?: string;
}

const prefersLessMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/**
 * Workspace screenshots that change on their own: the next picture fades in over the last one with a slow zoom.
 * It stops while the pointer or the keyboard focus is on it, and for visitors who prefer less motion.
 * Only the current and the previous picture are in the page, so the others load when their turn comes.
 */
export const Slideshow: React.FC<SlideshowProps> = ({
  slides,
  label,
  index: controlledIndex,
  onIndexChange,
  interval = 5000,
  isPriority = false,
  sizes = '(min-width: 1200px) 1160px, 100vw',
  testId,
}) => {
  const [ownIndex, setOwnIndex] = useState(0);
  const index = controlledIndex ?? ownIndex;
  const [previous, setPrevious] = useState<number | null>(null);
  const [isPaused, setPaused] = useState(false);
  const shownRef = useRef(index);

  const goTo = (next: number) => {
    const wrapped = (next + slides.length) % slides.length;
    if (controlledIndex === undefined) setOwnIndex(wrapped);
    onIndexChange?.(wrapped);
  };

  // Keep the last picture under the new one while it fades in.
  useEffect(() => {
    if (shownRef.current !== index) {
      setPrevious(shownRef.current);
      shownRef.current = index;
    }
  }, [index]);

  useEffect(() => {
    if (isPaused || slides.length < 2 || prefersLessMotion()) return;
    const id = window.setTimeout(() => goTo(index + 1), interval);
    return () => window.clearTimeout(id);
  }, [index, isPaused, interval, slides.length]);

  const current = slides[index] ?? slides[0];

  const picture = (slide: Slide, className: string, isMain: boolean) => (
    <img
      key={slide.id}
      src={`/images/home/${slide.image}.webp`}
      srcSet={`/images/home/${slide.image}-720.webp 720w, /images/home/${slide.image}.webp 1440w`}
      sizes={sizes}
      alt={isMain ? slide.alt : ''}
      aria-hidden={isMain ? undefined : true}
      width={1440}
      height={900}
      decoding="async"
      // React 18 drops the camelCase `fetchPriority` prop, so the lowercase HTML attribute is passed as is.
      {...(isPriority && isMain && previous === null
        ? { fetchpriority: 'high' }
        : { loading: 'lazy' as const })}
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );

  return (
    <div
      data-testid={testId}
      role="group"
      aria-roledescription="slideshow"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="flex flex-col gap-4"
    >
      <div className="site-lift relative aspect-[16/10] overflow-hidden rounded-2xl border border-site-line bg-site-surface">
        {previous !== null &&
          previous !== index &&
          slides[previous] &&
          picture(slides[previous], '', false)}
        {picture(current, previous === null ? '' : 'site-slide-in', true)}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-site-muted" aria-live="polite">
          <span className="font-semibold text-site-text">{current.label}</span>
          <span className="sr-only">
            {' '}
            ({index + 1} of {slides.length})
          </span>
        </p>
        <div className="flex items-center gap-1.5">
          {slides.map((slide, slideIndex) => {
            const isActive = slideIndex === index;
            return (
              <button
                key={slide.id}
                type="button"
                aria-label={`Show ${slide.label}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => goTo(slideIndex)}
                className={`relative h-1.5 overflow-hidden rounded-full bg-site-line transition-[width] duration-500 ${SITE_FOCUS} ${
                  isActive ? 'w-10' : 'w-3 hover:bg-site-muted'
                }`}
              >
                {isActive && (
                  <span
                    key={`${slide.id}-${isPaused ? 'paused' : 'playing'}`}
                    aria-hidden="true"
                    className={`absolute inset-y-0 left-0 bg-site-accent ${isPaused ? 'w-full' : 'site-progress'}`}
                    style={{ animationDuration: `${interval}ms` }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
