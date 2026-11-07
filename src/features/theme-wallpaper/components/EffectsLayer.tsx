import React, { useEffect, useRef } from 'react';
import { useThemeStore } from '@/core/theme/useThemeStore';
import { useMediaQuery } from '@/core/ui/useMediaQuery';
import { createFpsGuard, DESKTOP_MIN_FPS, MOBILE_MIN_FPS } from '../hooks/useFpsGuard';
import { draw, particleCount, spawn, step, type Particle, type ParticleKind } from '../lib/particles';

const KINDS: ParticleKind[] = ['rain', 'snow', 'fireflies'];
const REDUCED_MOTION = '(prefers-reduced-motion: reduce)';
const NARROW = '(max-width: 639px)';

// Fine film grain as a tiny inline SVG noise tile (no request).
const GRAIN_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

/** Canvas loop for Rain, Snow and Fireflies: pauses while the tab is hidden and sheds particles when slow. */
const ParticleCanvas: React.FC<{ intensities: Record<ParticleKind, number>; isNarrow: boolean }> = ({
  intensities,
  isNarrow,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { rain, snow, fireflies } = intensities;

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    if (!canvas || !context) return;

    const guard = createFpsGuard(isNarrow ? MOBILE_MIN_FPS : DESKTOP_MIN_FPS);
    const levels: Record<ParticleKind, number> = { rain, snow, fireflies };
    let particles: Particle[] = [];
    let frameId: number | null = null;
    let last = 0;
    let appliedMultiplier = -1;

    const resize = () => {
      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = window.innerWidth * ratio;
      canvas.height = window.innerHeight * ratio;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };

    const populate = (multiplier: number) => {
      appliedMultiplier = multiplier;
      particles = KINDS.flatMap((kind) =>
        Array.from({ length: particleCount(kind, levels[kind], multiplier) }, () =>
          spawn(kind, window.innerWidth, window.innerHeight),
        ),
      );
    };

    const loop = (time: number) => {
      const multiplier = guard.frame(time);
      if (multiplier !== appliedMultiplier) populate(multiplier); // AC-26.3
      const dt = last ? Math.min(3, (time - last) / 16.67) : 1;
      last = time;
      context.clearRect(0, 0, window.innerWidth, window.innerHeight);
      for (const particle of particles) {
        step(particle, window.innerWidth, window.innerHeight, dt, time);
        draw(context, particle, time);
      }
      frameId = requestAnimationFrame(loop);
    };

    const start = () => {
      if (frameId !== null || document.hidden) return;
      guard.reset();
      last = 0;
      frameId = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
    };
    // AC-26.2: no animation frame at all while the tab is hidden.
    const onVisibility = () => (document.hidden ? stop() : start());

    resize();
    populate(1);
    start();
    window.addEventListener('resize', resize);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      stop();
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [rain, snow, fireflies, isNarrow]);

  return <canvas ref={canvasRef} data-testid="particle-canvas" aria-hidden="true" className="absolute inset-0 h-full w-full" />;
};

/** Ambient overlays (FR-26). Grain and vignette are static layers; motion is skipped with reduced motion. */
export const EffectsLayer: React.FC = () => {
  const effects = useThemeStore((state) => state.config.effects);
  const reducedMotion = useMediaQuery(REDUCED_MOTION);
  const isNarrow = useMediaQuery(NARROW);
  const hasParticles = !reducedMotion && (effects.rain > 0 || effects.snow > 0 || effects.fireflies > 0);

  if (!hasParticles && effects.grain === 0 && effects.vignette === 0) return null;

  return (
    <div data-testid="effects-layer" aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1]">
      {hasParticles && (
        <ParticleCanvas intensities={{ rain: effects.rain, snow: effects.snow, fireflies: effects.fireflies }} isNarrow={isNarrow} />
      )}
      {effects.grain > 0 && (
        <div
          data-testid="grain-overlay"
          className="absolute inset-0 mix-blend-overlay"
          style={{ backgroundImage: GRAIN_TILE, opacity: (effects.grain / 100) * 0.5 }}
        />
      )}
      {effects.vignette > 0 && (
        <div
          data-testid="vignette-overlay"
          className="absolute inset-0"
          style={{
            background: `radial-gradient(ellipse at center, transparent 45%, rgba(0, 0, 0, ${(effects.vignette / 100) * 0.85}) 100%)`,
          }}
        />
      )}
    </div>
  );
};
