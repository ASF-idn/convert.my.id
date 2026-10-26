import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `mp4-to-mov` on convert.my.id.
 */
export async function convertMp4ToMov(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'mp4-to-mov',
      inputExtFallback: 'mp4',
      outputExtension: 'mov',
      outputMimeType: 'video/quicktime',
      buildArgs: (input, output) => ['-i', input, '-c:v', 'mpeg4', '-q:v', '4', '-c:a', 'aac', '-f', 'mov', output],
    },
    options
  );
}
