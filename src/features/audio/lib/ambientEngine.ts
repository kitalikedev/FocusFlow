import { getAudioContext, getMasterGain, rampGain } from '@/shared/lib/web-audio';
import { CHANNEL_DEFS, findChannelDef, type ChannelGraph } from './channelDefs';

export const AMBIENT_CHANNELS: string[] = CHANNEL_DEFS.map((def) => def.id);

/** Volume changes glide for about 1.5 s (3 time constants of 0.5 s), so nothing ever clicks or jumps. */
export const FADE_TIME_CONSTANT = 0.5;
const FADE_OUT_MS = 2000;

const channels = new Map<string, ChannelGraph>();
const volumes = new Map<string, number>();
const releaseTimers = new Map<string, ReturnType<typeof setTimeout>>();
let paused = false;

function clamp(volume: number): number {
  return Math.min(1, Math.max(0, Number.isFinite(volume) ? volume : 0));
}

function release(id: string): void {
  const timer = releaseTimers.get(id);
  if (timer) clearTimeout(timer);
  releaseTimers.delete(id);
  const channel = channels.get(id);
  if (!channel) return;
  channel.dispose?.();
  channel.nodes.forEach((node) => {
    try {
      node.stop();
    } catch {
      // already stopped
    }
    node.disconnect();
  });
  channel.gain.disconnect();
  channels.delete(id);
}

/**
 * Creates the graph while the channel is audible, fades it in, and after a fade-out frees it again so a
 * silent channel costs no CPU.
 */
function sync(id: string): void {
  const def = findChannelDef(id);
  if (!def) return;
  const effective = paused ? 0 : (volumes.get(id) ?? 0) * def.scale;
  const channel = channels.get(id);

  if (effective <= 0) {
    if (!channel) return;
    rampGain(channel.gain, 0, FADE_TIME_CONSTANT / 2);
    if (!releaseTimers.has(id)) {
      releaseTimers.set(
        id,
        setTimeout(() => {
          releaseTimers.delete(id);
          if (paused || (volumes.get(id) ?? 0) <= 0) release(id);
        }, FADE_OUT_MS),
      );
    }
    return;
  }

  const pending = releaseTimers.get(id);
  if (pending) {
    clearTimeout(pending);
    releaseTimers.delete(id);
  }
  let live = channel;
  if (!live) {
    const ctx = getAudioContext();
    const master = getMasterGain();
    if (!ctx || !master) return;
    if (ctx.state === 'suspended') void ctx.resume().catch(() => {});
    live = def.build(ctx, master);
    channels.set(id, live);
  }
  // AC-16.2: only this channel's gain changes, the other channels keep playing untouched.
  rampGain(live.gain, effective, FADE_TIME_CONSTANT);
}

export function setChannelVolume(id: string, volume: number): void {
  volumes.set(id, clamp(volume));
  sync(id);
}

export function setAmbientPaused(isPaused: boolean): void {
  paused = isPaused;
  AMBIENT_CHANNELS.forEach(sync);
}

export function isChannelActive(id: string): boolean {
  return channels.has(id);
}

/** Test helper: drops every channel and resets the state. */
export function resetAmbientEngine(): void {
  AMBIENT_CHANNELS.forEach(release);
  volumes.clear();
  paused = false;
}
