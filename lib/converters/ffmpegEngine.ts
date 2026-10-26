import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoadingPromise: Promise<FFmpeg> | null = null;

const FFMPEG_CORE_BASE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';

/**
 * Asynchronously loads and initializes the singleton @ffmpeg/ffmpeg WebAssembly core in the browser.
 */
export async function getFFmpegInstance(
  onProgress?: (progressPercent: number, statusMessage?: string) => void
): Promise<FFmpeg> {
  if (ffmpegInstance && ffmpegInstance.loaded) {
    return ffmpegInstance;
  }

  if (ffmpegLoadingPromise) {
    return ffmpegLoadingPromise;
  }

  ffmpegLoadingPromise = (async () => {
    const ffmpeg = new FFmpeg();

    ffmpeg.on('progress', ({ progress }) => {
      const pct = Math.min(99, Math.max(1, Math.round(progress * 100)));
      if (onProgress) {
        onProgress(pct, `Transcoding via FFmpeg WASM (${pct}%)...`);
      }
    });

    if (onProgress) {
      onProgress(5, 'Downloading FFmpeg WebAssembly core...');
    }

    const coreURL = await toBlobURL(
      `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js`,
      'text/javascript'
    );
    const wasmURL = await toBlobURL(
      `${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm`,
      'application/wasm'
    );

    await ffmpeg.load({ coreURL, wasmURL });
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  return ffmpegLoadingPromise;
}

export interface FFmpegJobSpec {
  slug: string;
  inputExtFallback: string;
  outputExtension: string;
  outputMimeType: string;
  buildArgs: (inputFileName: string, outputFileName: string) => string[];
}

/**
 * Executes an in-browser WebAssembly FFmpeg transcoding job inside virtual MEMFS.
 */
export async function executeFFmpegJob(
  file: File,
  spec: FFmpegJobSpec,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  const startTime = performance.now();
  const ffmpeg = await getFFmpegInstance(options.onProgress);

  const extMatch = file.name.match(/\.([a-zA-Z0-9]+)$/);
  const inExt = extMatch ? extMatch[1].toLowerCase() : spec.inputExtFallback;
  const inputName = `input_${Date.now()}.${inExt}`;
  const outputName = `output_${Date.now()}.${spec.outputExtension}`;

  options.onProgress?.(12, 'Writing source media into WASM virtual memory...');
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const cliArgs = spec.buildArgs(inputName, outputName);
  options.onProgress?.(20, `Running ffmpeg ${cliArgs.join(' ')}...`);

  await ffmpeg.exec(cliArgs);

  options.onProgress?.(95, 'Reading transcoded output stream...');
  const data = await ffmpeg.readFile(outputName);

  // Clean up virtual MEMFS files to keep browser RAM usage low
  try {
    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);
  } catch {
    // Ignore cleanup errors
  }

  const uint8 =
    data instanceof Uint8Array
      ? data
      : new TextEncoder().encode(String(data));
  const blob = new Blob([uint8.buffer as ArrayBuffer], {
    type: spec.outputMimeType,
  });
  const objectUrl = URL.createObjectURL(blob);

  options.onProgress?.(100, 'Complete');

  return {
    blob,
    objectUrl,
    originalBytes: file.size,
    outputBytes: blob.size,
    executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
    outputExtension: spec.outputExtension,
    outputMimeType: spec.outputMimeType,
    summaryText: `Transcoded ${file.name} -> .${spec.outputExtension} via FFmpeg WebAssembly`,
  };
}

/**
 * Generates an in-memory 2-second stereo 44.1kHz PCM WAV audio file (C-major chord)
 * so users can test any Audio/Video FFmpeg converter with 1 click.
 */
export function generateSampleAudioWavFile(): File {
  const sampleRate = 44100;
  const durationSeconds = 2;
  const numSamples = sampleRate * durationSeconds;
  const numChannels = 2;
  const bytesPerSample = 2;
  const dataBytes = numSamples * numChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataBytes);
  const view = new DataView(buffer);

  const writeStr = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeStr(0, 'RIFF');
  view.setUint32(4, 36 + dataBytes, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * numChannels * bytesPerSample, true);
  view.setUint16(32, numChannels * bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeStr(36, 'data');
  view.setUint32(40, dataBytes, true);

  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * 1.2);
    const wave =
      (Math.sin(2 * Math.PI * 261.63 * t) +
        Math.sin(2 * Math.PI * 329.63 * t) +
        Math.sin(2 * Math.PI * 392.0 * t)) /
      3;
    const pcmVal = Math.max(-1, Math.min(1, wave * envelope * 0.7));
    const intSample = Math.round(pcmVal * 32767);
    view.setInt16(offset, intSample, true);
    view.setInt16(offset + 2, intSample, true);
    offset += 4;
  }

  return new File([buffer], 'convert-my-id-sample-chord.wav', {
    type: 'audio/wav',
  });
}
