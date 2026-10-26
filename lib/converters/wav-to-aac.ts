import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `wav-to-aac` on convert.my.id.
 */
export async function convertWavToAac(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'wav-to-aac',
      inputExtFallback: 'wav',
      outputExtension: 'aac',
      outputMimeType: 'audio/aac',
      buildArgs: (input, output) => ['-i', input, '-c:a', 'aac', '-b:a', '192k', '-f', 'adts', output],
    },
    options
  );
}
