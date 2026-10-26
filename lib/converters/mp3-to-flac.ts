import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `mp3-to-flac` on convert.my.id.
 */
export async function convertMp3ToFlac(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'mp3-to-flac',
      inputExtFallback: 'mp3',
      outputExtension: 'flac',
      outputMimeType: 'audio/flac',
      buildArgs: (input, output) => ['-i', input, '-c:a', 'flac', output],
    },
    options
  );
}
