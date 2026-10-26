import type { ImageConversionOptions, WebPConversionResult } from '@/types/converter';
import { convertImageToIco } from './image-to-ico';

/**
 * 100% Client-Side HTML5 Canvas Converter for `png-to-ico` on convert.my.id.
 */
export async function convertPngToIco(
  file: File,
  options: ImageConversionOptions = {}
): Promise<WebPConversionResult> {
  return convertImageToIco(file, options);
}
