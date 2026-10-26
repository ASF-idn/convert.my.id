import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `mp4-to-mkv` on convert.my.id.
 */
export async function convertMp4ToMkv(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'mp4-to-mkv',
      inputExtFallback: 'mp4',
      outputExtension: 'mkv',
      outputMimeType: 'video/x-matroska',
      buildArgs: (input, output) => ['-i', input, '-c:v', 'mpeg4', '-c:a', 'aac', '-f', 'matroska', output],
    },
    options
  );
}
