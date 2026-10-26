import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `wav-to-ogg` on convert.my.id.
 */
export async function convertWavToOgg(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'wav-to-ogg',
      inputExtFallback: 'wav',
      outputExtension: 'ogg',
      outputMimeType: 'audio/ogg',
      buildArgs: (input, output) => ['-i', input, '-c:a', 'libvorbis', '-q:a', '5', output],
    },
    options
  );
}
