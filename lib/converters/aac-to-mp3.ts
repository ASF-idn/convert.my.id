import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Converter for `aac-to-mp3` on convert.my.id.
 */
export async function convertAacToMp3(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'aac-to-mp3',
      inputExtFallback: 'aac',
      outputExtension: 'mp3',
      outputMimeType: 'audio/mpeg',
      buildArgs: (input, output) => ['-i', input, '-acodec', 'libmp3lame', '-b:a', '192k', output],
    },
    options
  );
}
