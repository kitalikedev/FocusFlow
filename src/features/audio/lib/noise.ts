/** Buffers for the synthesized ambient sounds (FR-16). Everything is generated locally: 0 network request. */

export type NoiseKind = 'white' | 'brown';

/** Uniform white noise, or brown noise made by integrating white noise (AC-16.3). */
export function fillNoise(data: Float32Array, kind: NoiseKind, random: () => number = Math.random): void {
  let last = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = random() * 2 - 1;
    if (kind === 'white') {
      data[i] = white;
    } else {
      // Leaky integrator keeps the walk bounded; 3.5 brings the level back to roughly unit gain.
      last = (last + 0.02 * white) / 1.02;
      data[i] = last * 3.5;
    }
  }
}

/**
 * Wood crackle: silence with sparse, very short decaying bursts at random positions (AC-16.4).
 * About 4 to 12 pops per second, each 2 to 8 ms long.
 */
export function fillCrackle(data: Float32Array, sampleRate: number, random: () => number = Math.random): void {
  data.fill(0);
  let position = Math.floor(random() * sampleRate * 0.1);
  while (position < data.length) {
    const length = Math.floor(sampleRate * (0.002 + random() * 0.006));
    const amplitude = 0.4 + random() * 0.6;
    for (let i = 0; i < length && position + i < data.length; i += 1) {
      const envelope = Math.exp((-5 * i) / length);
      data[position + i] = (random() * 2 - 1) * amplitude * envelope;
    }
    position += length + Math.floor(sampleRate * (0.08 + random() * 0.17));
  }
}

export function createBuffer(
  context: BaseAudioContext,
  seconds: number,
  fill: (data: Float32Array, sampleRate: number) => void,
): AudioBuffer {
  const buffer = context.createBuffer(1, Math.floor(context.sampleRate * seconds), context.sampleRate);
  fill(buffer.getChannelData(0), context.sampleRate);
  return buffer;
}
