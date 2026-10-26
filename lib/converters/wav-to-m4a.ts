import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `wav-to-m4a` on convert.my.id.
 */
export async function convertWavToM4a(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'wav-to-m4a',
      inputExtFallback: 'wav',
      outputExtension: 'm4a',
      outputMimeType: 'audio/mp4',
      buildArgs: (input, output) => ['-i', input, '-c:a', 'aac', '-b:a', '192k', output],
    },
    options
  );
}
