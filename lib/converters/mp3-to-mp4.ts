import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `mp3-to-mp4` on convert.my.id.
 */
export async function convertMp3ToMp4(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'mp3-to-mp4',
      inputExtFallback: 'mp3',
      outputExtension: 'mp4',
      outputMimeType: 'video/mp4',
      buildArgs: (input, output) => ['-i', input, '-c:a', 'aac', '-b:a', '192k', '-f', 'mp4', output],
    },
    options
  );
}
