import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `ogg-to-wav` on convert.my.id.
 */
export async function convertOggToWav(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'ogg-to-wav',
      inputExtFallback: 'ogg',
      outputExtension: 'wav',
      outputMimeType: 'audio/wav',
      buildArgs: (input, output) => ['-i', input, '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', output],
    },
    options
  );
}
