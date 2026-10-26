import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Converter for `m4a-to-mp3` on convert.my.id.
 */
export async function convertM4aToMp3(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'm4a-to-mp3',
      inputExtFallback: 'm4a',
      outputExtension: 'mp3',
      outputMimeType: 'audio/mpeg',
      buildArgs: (input, output) => ['-i', input, '-vn', '-acodec', 'libmp3lame', '-b:a', '192k', output],
    },
    options
  );
}
