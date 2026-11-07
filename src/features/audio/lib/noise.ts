/** Buffers for the synthesized ambient sounds (FR-16). Everything is generated locally: 0 network request. */

export type NoiseKind = 'white' | 'pink' | 'brown';

/**
 * White noise, pink noise (Paul Kellet's filter: softer, warmer, like real rain) or brown noise made by
 * integrating white noise (AC-16.3).
 */
export function fillNoise(data: Float32Array, kind: NoiseKind, random: () => number = Math.random): void {
  let last = 0;
  let b0 = 0;
  let b1 = 0;
  let b2 = 0;
  let b3 = 0;
  let b4 = 0;
  let b5 = 0;
  let b6 = 0;
  for (let i = 0; i < data.length; i += 1) {
    const white = random() * 2 - 1;
    if (kind === 'white') {
      data[i] = white;
    } else if (kind === 'pink') {
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11;
      b6 = white * 0.115926;
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
