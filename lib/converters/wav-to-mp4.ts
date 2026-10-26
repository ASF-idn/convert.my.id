import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `wav-to-mp4` on convert.my.id.
 */
export async function convertWavToMp4(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'wav-to-mp4',
      inputExtFallback: 'wav',
      outputExtension: 'mp4',
      outputMimeType: 'video/mp4',
      buildArgs: (input, output) => ['-i', input, '-c:a', 'aac', '-b:a', '192k', '-f', 'mp4', output],
    },
    options
  );
}
