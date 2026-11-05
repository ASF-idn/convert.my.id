import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Converter for `avi-to-mp4` on convert.my.id.
 */
export async function convertAviToMp4(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: 'avi-to-mp4',
      inputExtFallback: 'avi',
      outputExtension: 'mp4',
      outputMimeType: 'video/mp4',
      buildArgs: (input, output) => [
        '-i',
        input,
        ...(options.targetHeight
          ? ['-vf', `scale=-2:${options.targetHeight}:flags=lanczos`]
          : []),
        '-c:v',
        'libx264',
        '-preset',
        'veryfast',
        '-crf',
        '18',
        '-pix_fmt',
        'yuv420p',
        '-c:a',
        'aac',
        '-b:a',
        '192k',
        '-movflags',
        '+faststart',
        output,
      ],
    },
    options
  );
}
