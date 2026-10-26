import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Converter for `video-to-gif` on convert.my.id.
 */
export async function convertVideoToGif(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'video-to-gif',
      inputExtFallback: 'mp4',
      outputExtension: 'gif',
      outputMimeType: 'image/gif',
      buildArgs: (input, output) => ['-i', input, '-vf', 'fps=10,scale=480:-1:flags=lanczos', '-t', '8', output],
    },
    options
  );
}
