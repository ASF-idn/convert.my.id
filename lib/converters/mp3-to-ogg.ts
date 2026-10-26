import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Converter for `mp3-to-ogg` on convert.my.id.
 */
export async function convertMp3ToOgg(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'mp3-to-ogg',
      inputExtFallback: 'mp3',
      outputExtension: 'ogg',
      outputMimeType: 'audio/ogg',
      buildArgs: (input, output) => ['-i', input, '-c:a', 'libvorbis', '-q:a', '4', output],
    },
    options
  );
}
