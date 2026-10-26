import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `m4a-to-wav` on convert.my.id.
 */
export async function convertM4aToWav(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'm4a-to-wav',
      inputExtFallback: 'm4a',
      outputExtension: 'wav',
      outputMimeType: 'audio/wav',
      buildArgs: (input, output) => ['-i', input, '-vn', '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', output],
    },
    options
  );
}
