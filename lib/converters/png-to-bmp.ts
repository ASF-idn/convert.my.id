import type { ImageConversionOptions, WebPConversionResult } from '@/types/converter';
import { convertImageToBmp } from './image-to-bmp';

/**
 * 100% Client-Side HTML5 Canvas Converter for `png-to-bmp` on convert.my.id.
 */
export async function convertPngToBmp(
  file: File,
  options: ImageConversionOptions = {}
): Promise<WebPConversionResult> {
  return convertImageToBmp(file, options);
}
