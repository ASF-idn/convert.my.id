import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `mp4-to-avi` on convert.my.id.
 */
export async function convertMp4ToAvi(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'mp4-to-avi',
      inputExtFallback: 'mp4',
      outputExtension: 'avi',
      outputMimeType: 'video/x-msvideo',
      buildArgs: (input, output) => ['-i', input, '-c:v', 'mpeg4', '-q:v', '5', '-c:a', 'libmp3lame', '-f', 'avi', output],
    },
    options
  );
}
