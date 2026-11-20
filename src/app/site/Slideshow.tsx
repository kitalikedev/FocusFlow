import React, { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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
  /**
   * `carousel`: the current picture in the middle with the previous and the next one peeking on both sides.
   * `single`: one picture that slides out for the next one (for narrow columns).
   */
  variant?: 'carousel' | 'single';
  /** Shown slide when the parent controls it (for example the website theme). */
  index?: number;
  onIndexChange?: (index: number) => void;
  /** Time each slide stays, in milliseconds. */
  interval?: number;
  /** The first picture is the main picture of the page: load it first. */
  isPriority?: boolean;
  /** Width the picture takes on the page, for the browser to pick the 720 or 1440 px file. */
  sizes?: string;
  testId?: string;
}

/** Distance in pixels a swipe must cover to change the slide. */
const SWIPE_DISTANCE = 50;

const prefersLessMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

/** Shortest signed distance from the current slide, going round the ends. */
function offsetOf(slideIndex: number, index: number, count: number): number {
  const half = Math.floor(count / 2);
  return ((((slideIndex - index) % count) + count + half) % count) - half;
}

const ARROW = `absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-site-line bg-site-bg text-site-text shadow-lg transition-[transform,background-color,color] duration-200 hover:scale-110 hover:bg-site-accent hover:text-site-on-accent active:scale-95 motion-reduce:transition-none ${SITE_FOCUS}`;

/**
 * Workspace screenshots that move on their own every few seconds, with arrows, dots, swipe and the arrow keys.
 * It stops while the pointer or the keyboard focus is on it, and for visitors who prefer less motion.
 * Only the current picture and its neighbours are in the page, so the others load when their turn comes.
 */
export const Slideshow: React.FC<SlideshowProps> = ({
  slides,
  label,
  variant = 'carousel',
  index: controlledIndex,
  onIndexChange,
  interval = 5000,
  isPriority = false,
  sizes = '(min-width: 1200px) 1160px, 100vw',
  testId,
}) => {
  const count = slides.length;
  const [ownIndex, setOwnIndex] = useState(0);
  const index = controlledIndex ?? ownIndex;
  const [isPaused, setPaused] = useState(false);
  const [dragX, setDragX] = useState(0);
  const dragStart = useRef<number | null>(null);
  // Set when the last press moved the pictures, so letting go does not also count as a click.
  const didDrag = useRef(false);
  const lastOffsets = useRef<number[]>([]);
  const isCarousel = variant === 'carousel';

  const goTo = (next: number) => {
    const wrapped = (next + count) % count;
    if (controlledIndex === undefined) setOwnIndex(wrapped);
    onIndexChange?.(wrapped);
  };

  useEffect(() => {
    if (isPaused || count < 2 || prefersLessMotion()) return;
    const id = window.setTimeout(() => goTo(index + 1), interval);
    return () => window.clearTimeout(id);
  }, [index, isPaused, interval, count]);

  const onPointerDown = (event: React.PointerEvent) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragStart.current = event.clientX;
    didDrag.current = false;
  };
  const onPointerMove = (event: React.PointerEvent) => {
    if (dragStart.current !== null) setDragX(event.clientX - dragStart.current);
  };
  const endDrag = () => {
    if (dragStart.current === null) return;
    didDrag.current = Math.abs(dragX) > 5;
    if (dragX <= -SWIPE_DISTANCE) goTo(index + 1);
    else if (dragX >= SWIPE_DISTANCE) goTo(index - 1);
    dragStart.current = null;
    setDragX(0);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'ArrowRight') goTo(index + 1);
    if (event.key === 'ArrowLeft') goTo(index - 1);
  };

  const current = slides[index] ?? slides[0];
  const offsets = slides.map((_, slideIndex) => offsetOf(slideIndex, index, count));
  const previousOffsets = lastOffsets.current;
  useEffect(() => {
    lastOffsets.current = offsets;
  });

  return (
    <div
      data-testid={testId}
      role="group"
      aria-roledescription="slideshow"
      aria-label={label}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false);
        endDrag();
      }}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      onKeyDown={onKeyDown}
      className="flex flex-col gap-5"
    >
      <div
        className={`group/stage relative select-none ${isCarousel ? '' : 'overflow-hidden rounded-2xl'}`}
        style={{ touchAction: 'pan-y' }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        {/* Gives the stage the height of one picture. */}
        <div
          aria-hidden="true"
          className={`mx-auto aspect-[16/10] ${isCarousel ? 'w-[86%] lg:w-[74%]' : 'w-full'}`}
        />

        {slides.map((slide, slideIndex) => {
          const offset = offsets[slideIndex];
          const isCurrent = offset === 0;
          const isNear = Math.abs(offset) <= 1;
          // A slide that jumps round the ends moves without animation, so it never flies across the stage.
          const jumped =
            previousOffsets[slideIndex] !== undefined &&
            Math.abs(previousOffsets[slideIndex] - offset) > 1;
          const position = Math.max(-2, Math.min(2, offset));
          const gap = isCarousel ? '20px' : '0px';
          const scale = isCarousel && !isCurrent ? 0.86 : 1;
          return (
            <div
              key={slide.id}
              aria-hidden={isCurrent ? undefined : true}
              onClick={() => {
                if (!isCurrent && isNear && !didDrag.current) goTo(slideIndex);
              }}
              className={`absolute left-1/2 top-0 aspect-[16/10] overflow-hidden rounded-2xl border border-site-line bg-site-surface ${
                isCarousel ? 'w-[86%] lg:w-[74%]' : 'w-full'
              } ${isCurrent ? 'z-10 shadow-[0_30px_80px_-30px_var(--site-glow)]' : 'z-0'} ${
                !isCurrent && isNear && isCarousel ? 'cursor-pointer' : ''
              }`}
              style={{
                transform: `translateX(calc(-50% + ${position} * (100% + ${gap}) + ${dragX}px)) scale(${scale})`,
                opacity: isCurrent ? 1 : isNear && isCarousel ? 0.45 : 0,
                transition:
                  jumped || dragStart.current !== null || prefersLessMotion()
                    ? 'none'
                    : 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1), opacity 700ms ease',
              }}
            >
              {isNear && (
                <img
                  src={`/images/home/${slide.image}.webp`}
                  srcSet={`/images/home/${slide.image}-720.webp 720w, /images/home/${slide.image}.webp 1440w`}
                  sizes={sizes}
                  alt={isCurrent ? slide.alt : ''}
                  width={1440}
                  height={900}
                  decoding="async"
                  draggable={false}
                  // React 18 drops the camelCase `fetchPriority` prop, so the lowercase HTML attribute is passed as is.
                  {...(isPriority && isCurrent
                    ? { fetchpriority: 'high' }
                    : { loading: 'lazy' as const })}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          );
        })}

        {count > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous picture"
              onClick={() => goTo(index - 1)}
              onPointerDown={(event) => event.stopPropagation()}
              className={`${ARROW} ${isCarousel ? 'left-[2%] lg:left-[8%]' : 'left-3 opacity-0 group-hover/stage:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100'}`}
            >
              <ChevronLeft className="h-5 w-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label="Next picture"
              onClick={() => goTo(index + 1)}
              onPointerDown={(event) => event.stopPropagation()}
              className={`${ARROW} ${isCarousel ? 'right-[2%] lg:right-[8%]' : 'right-3 opacity-0 group-hover/stage:opacity-100 focus-visible:opacity-100 [@media(hover:none)]:opacity-100'}`}
            >
              <ChevronRight className="h-5 w-5" aria-hidden="true" />
            </button>
          </>
        )}
      </div>

      <div
        className={`flex flex-wrap items-center justify-between gap-3 ${isCarousel ? 'mx-auto w-[86%] lg:w-[74%]' : ''}`}
      >
        <p className="text-sm text-site-muted" aria-live="polite">
          <span className="font-semibold text-site-text">{current.label}</span>
          <span className="sr-only">
            {' '}
            ({index + 1} of {count})
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
