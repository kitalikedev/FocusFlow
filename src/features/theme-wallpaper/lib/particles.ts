/** Particle simulation for the Rain, Snow and Fireflies overlays (FR-26). */

export type ParticleKind = 'rain' | 'snow' | 'fireflies';

/** Ceiling per effect at 100 % (AC-26.1: fireflies 40, so 50 % → 20). */
export const PARTICLE_MAX: Record<ParticleKind, number> = { rain: 160, snow: 120, fireflies: 40 };

export interface Particle {
  kind: ParticleKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
}

export function particleCount(kind: ParticleKind, intensity: number, multiplier = 1): number {
  const clamped = Math.min(100, Math.max(0, intensity));
  return Math.round((PARTICLE_MAX[kind] * clamped * multiplier) / 100);
}

export function spawn(kind: ParticleKind, width: number, height: number, random: () => number = Math.random): Particle {
  const base = { kind, x: random() * width, y: random() * height, phase: random() * Math.PI * 2 };
  if (kind === 'rain') return { ...base, vx: -0.8, vy: 9 + random() * 6, size: 10 + random() * 10 };
  if (kind === 'snow') return { ...base, vx: 0, vy: 0.4 + random() * 0.9, size: 1 + random() * 2.5 };
  return { ...base, vx: (random() - 0.5) * 0.4, vy: (random() - 0.5) * 0.4, size: 1.5 + random() * 1.5 };
}

/** Advances one particle by `dt` frames (1 = 16.7 ms) and wraps it around the screen edges. */
export function step(p: Particle, width: number, height: number, dt: number, time: number): void {
  if (p.kind === 'snow') p.x += Math.sin(time / 1500 + p.phase) * 0.4 * dt;
  if (p.kind === 'fireflies') {
    p.vx += Math.sin(time / 900 + p.phase) * 0.01;
    p.vy += Math.cos(time / 1100 + p.phase) * 0.01;
    p.vx = Math.max(-0.6, Math.min(0.6, p.vx));
    p.vy = Math.max(-0.6, Math.min(0.6, p.vy));
  }
  p.x += p.vx * dt;
  p.y += p.vy * dt;
  if (p.y > height + 20) {
    p.y = -20;
    p.x = Math.random() * width;
  } else if (p.y < -20) p.y = height + 20;
  if (p.x > width + 20) p.x = -20;
  else if (p.x < -20) p.x = width + 20;
}

export function draw(context: CanvasRenderingContext2D, p: Particle, time: number): void {
  if (p.kind === 'rain') {
    context.strokeStyle = 'rgba(200, 220, 255, 0.35)';
    context.lineWidth = 1;
    context.beginPath();
    context.moveTo(p.x, p.y);
    context.lineTo(p.x + p.vx * 2, p.y + p.size);
    context.stroke();
  } else if (p.kind === 'snow') {
    context.fillStyle = 'rgba(255, 255, 255, 0.8)';
    context.beginPath();
    context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    context.fill();
  } else {
    const glow = 0.35 + 0.65 * Math.abs(Math.sin(time / 800 + p.phase));
    context.fillStyle = `rgba(253, 230, 138, ${glow.toFixed(2)})`;
    context.shadowColor = 'rgba(253, 224, 71, 0.9)';
    context.shadowBlur = 8;
    context.beginPath();
    context.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    context.fill();
    context.shadowBlur = 0;
  }
}
