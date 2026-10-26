import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Converter for `wav-to-flac` on convert.my.id.
 */
export async function convertWavToFlac(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'wav-to-flac',
      inputExtFallback: 'wav',
      outputExtension: 'flac',
      outputMimeType: 'audio/flac',
      buildArgs: (input, output) => ['-i', input, '-c:a', 'flac', output],
    },
    options
  );
}
