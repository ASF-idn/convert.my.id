import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Converter for `audio-to-8d-surround` on convert.my.id.
 */
export async function convertAudioTo8dSurround(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'audio-to-8d-surround',
      inputExtFallback: 'wav',
      outputExtension: 'mp3',
      outputMimeType: 'audio/mpeg',
      buildArgs: (input, output) => ['-i', input, '-af', 'apulsator=hz=0.125', '-acodec', 'libmp3lame', '-b:a', '192k', output],
    },
    options
  );
}
