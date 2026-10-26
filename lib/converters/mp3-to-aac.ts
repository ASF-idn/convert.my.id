import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Converter for `mp3-to-aac` on convert.my.id.
 */
export async function convertMp3ToAac(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'mp3-to-aac',
      inputExtFallback: 'mp3',
      outputExtension: 'm4a',
      outputMimeType: 'audio/mp4',
      buildArgs: (input, output) => ['-i', input, '-c:a', 'aac', '-b:a', '192k', output],
    },
    options
  );
}
