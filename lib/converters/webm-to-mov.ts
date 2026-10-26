import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `webm-to-mov` on convert.my.id.
 */
export async function convertWebmToMov(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'webm-to-mov',
      inputExtFallback: 'webm',
      outputExtension: 'mov',
      outputMimeType: 'video/quicktime',
      buildArgs: (input, output) => ['-i', input, '-c:v', 'mpeg4', '-q:v', '4', '-c:a', 'aac', '-f', 'mov', output],
    },
    options
  );
}
