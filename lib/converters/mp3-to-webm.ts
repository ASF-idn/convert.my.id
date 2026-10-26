import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for `mp3-to-webm` on convert.my.id.
 */
export async function convertMp3ToWebm(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'mp3-to-webm',
      inputExtFallback: 'mp3',
      outputExtension: 'webm',
      outputMimeType: 'audio/webm',
      buildArgs: (input, output) => ['-i', input, '-vn', '-c:a', 'libvorbis', '-q:a', '4', '-f', 'webm', output],
    },
    options
  );
}
