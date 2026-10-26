import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Converter for `audio-bass-booster` on convert.my.id.
 */
export async function convertAudioBassBooster(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'audio-bass-booster',
      inputExtFallback: 'wav',
      outputExtension: 'mp3',
      outputMimeType: 'audio/mpeg',
      buildArgs: (input, output) => ['-i', input, '-af', 'equalizer=f=60:width_type=o:width=2:g=8', '-acodec', 'libmp3lame', '-b:a', '192k', output],
    },
    options
  );
}
