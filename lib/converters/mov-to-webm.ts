import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `mov-to-webm` on convert.my.id.
 */
export async function convertMovToWebm(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'mov-to-webm',
      inputExtFallback: 'mov',
      outputExtension: 'webm',
      outputMimeType: 'video/webm',
      buildArgs: (input, output) => ['-i', input, '-c:v', 'libvpx', '-b:v', '1M', '-c:a', 'libvorbis', output],
    },
    options
  );
}
