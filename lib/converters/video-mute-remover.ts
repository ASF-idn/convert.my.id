import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Converter for `video-mute-remover` on convert.my.id.
 */
export async function convertVideoMuteRemover(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'video-mute-remover',
      inputExtFallback: 'mp4',
      outputExtension: 'mp4',
      outputMimeType: 'video/mp4',
      buildArgs: (input, output) => ['-i', input, '-an', '-c:v', 'copy', output],
    },
    options
  );
}
