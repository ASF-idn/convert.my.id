import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Converter for `gif-to-webm` on convert.my.id.
 */
export async function convertGifToWebm(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'gif-to-webm',
      inputExtFallback: 'gif',
      outputExtension: 'webm',
      outputMimeType: 'video/webm',
      buildArgs: (input, output) => ['-i', input, '-c:v', 'libvpx', '-b:v', '800k', '-auto-alt-ref', '0', output],
    },
    options
  );
}
