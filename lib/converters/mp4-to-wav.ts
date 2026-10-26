import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Converter for `mp4-to-wav` on convert.my.id.
 */
export async function convertMp4ToWav(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'mp4-to-wav',
      inputExtFallback: 'mp4',
      outputExtension: 'wav',
      outputMimeType: 'audio/wav',
      buildArgs: (input, output) => ['-i', input, '-vn', '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', output],
    },
    options
  );
}
