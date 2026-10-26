import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `mp3-to-m4a` on convert.my.id.
 */
export async function convertMp3ToM4a(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'mp3-to-m4a',
      inputExtFallback: 'mp3',
      outputExtension: 'm4a',
      outputMimeType: 'audio/mp4',
      buildArgs: (input, output) => ['-i', input, '-c:a', 'aac', '-b:a', '192k', output],
    },
    options
  );
}
