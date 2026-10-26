import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Converter for `webm-to-mp4` on convert.my.id.
 */
export async function convertWebmToMp4(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'webm-to-mp4',
      inputExtFallback: 'webm',
      outputExtension: 'mp4',
      outputMimeType: 'video/mp4',
      buildArgs: (input, output) => ['-i', input, '-c:v', 'mpeg4', '-q:v', '4', '-c:a', 'aac', output],
    },
    options
  );
}
