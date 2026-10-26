import type { ImageConversionOptions, WebPConversionResult } from '@/types/converter';
import { convertWebpToPng } from './webp-to-png';

/**
 * 100% Client-Side HTML5 Canvas Converter for `ico-to-png` on convert.my.id.
 */
export async function convertIcoToPng(
  file: File,
  options: ImageConversionOptions = {}
): Promise<WebPConversionResult> {
  return convertWebpToPng(file, options);
}
