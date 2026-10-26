import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Converter for `mp4-to-webm` on convert.my.id.
 */
export async function convertMp4ToWebm(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'mp4-to-webm',
      inputExtFallback: 'mp4',
      outputExtension: 'webm',
      outputMimeType: 'video/webm',
      buildArgs: (input, output) => ['-i', input, '-c:v', 'libvpx', '-b:v', '1M', '-c:a', 'libvorbis', output],
    },
    options
  );
}
