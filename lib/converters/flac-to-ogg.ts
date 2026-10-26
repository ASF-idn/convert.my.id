import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `flac-to-ogg` on convert.my.id.
 */
export async function convertFlacToOgg(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'flac-to-ogg',
      inputExtFallback: 'flac',
      outputExtension: 'ogg',
      outputMimeType: 'audio/ogg',
      buildArgs: (input, output) => ['-i', input, '-c:a', 'libvorbis', '-q:a', '6', output],
    },
    options
  );
}
