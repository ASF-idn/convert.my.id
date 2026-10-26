import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `aac-to-wav` on convert.my.id.
 */
export async function convertAacToWav(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'aac-to-wav',
      inputExtFallback: 'aac',
      outputExtension: 'wav',
      outputMimeType: 'audio/wav',
      buildArgs: (input, output) => ['-i', input, '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', output],
    },
    options
  );
}
