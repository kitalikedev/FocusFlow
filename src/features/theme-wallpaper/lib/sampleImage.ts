import { relativeLuminance } from '@/core/theme/color';
import { LIMITS } from '@/core/data/defaults';

export const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const UPLOAD_ERROR = 'File size exceeds 5MB or format unsupported';
const SAMPLE_SIZE = 32;

/** AC-14.1: ≤ 5 MB and JPG, PNG, GIF or WebP only. */
export function isAcceptedWallpaper(file: File): boolean {
  return file.size <= LIMITS.wallpaperMaxBytes && ACCEPTED_TYPES.includes(file.type);
}

/** Average relative luminance of 32 × 32 RGBA pixels. */
export function averagePixelLuminance(data: Uint8ClampedArray): number {
  let total = 0;
  let count = 0;
  for (let i = 0; i + 3 < data.length; i += 4) {
    total += relativeLuminance({ r: data[i], g: data[i + 1], b: data[i + 2], a: 1 });
    count += 1;
  }
  return count === 0 ? 0.5 : Math.round((total / count) * 1000) / 1000;
}

/**
 * FR-15: samples the first frame once at upload, scaled down to 32 × 32. Falls back to 0.5 (mid grey, which
 * keeps the default capsule) when the browser cannot decode the file.
 */
export async function sampleLuminance(file: File): Promise<number> {
  const url = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.decoding = 'async';
    image.src = url;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = SAMPLE_SIZE;
    canvas.height = SAMPLE_SIZE;
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (!context) return 0.5;
    context.drawImage(image, 0, 0, SAMPLE_SIZE, SAMPLE_SIZE);
    return averagePixelLuminance(context.getImageData(0, 0, SAMPLE_SIZE, SAMPLE_SIZE).data);
  } catch {
    return 0.5;
  } finally {
    URL.revokeObjectURL(url);
  }
}
