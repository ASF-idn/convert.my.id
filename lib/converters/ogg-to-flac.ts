import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `ogg-to-flac` on convert.my.id.
 */
export async function convertOggToFlac(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'ogg-to-flac',
      inputExtFallback: 'ogg',
      outputExtension: 'flac',
      outputMimeType: 'audio/flac',
      buildArgs: (input, output) => ['-i', input, '-c:a', 'flac', output],
    },
    options
  );
}
