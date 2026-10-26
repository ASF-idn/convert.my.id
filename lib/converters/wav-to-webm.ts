import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `wav-to-webm` on convert.my.id.
 */
export async function convertWavToWebm(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'wav-to-webm',
      inputExtFallback: 'wav',
      outputExtension: 'webm',
      outputMimeType: 'audio/webm',
      buildArgs: (input, output) => ['-i', input, '-vn', '-c:a', 'libvorbis', '-q:a', '5', '-f', 'webm', output],
    },
    options
  );
}
