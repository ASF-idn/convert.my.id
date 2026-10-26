import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Converter for `audio-speed-changer` on convert.my.id.
 */
export async function convertAudioSpeedChanger(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'audio-speed-changer',
      inputExtFallback: 'wav',
      outputExtension: 'mp3',
      outputMimeType: 'audio/mpeg',
      buildArgs: (input, output) => ['-i', input, '-filter:a', 'atempo=1.25', '-acodec', 'libmp3lame', '-b:a', '192k', output],
    },
    options
  );
}
