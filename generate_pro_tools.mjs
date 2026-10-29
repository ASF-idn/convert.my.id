/**
 * generate_pro_tools.mjs
 * Automated Node.js Pro Generator for convert.my.id
 *
 * Adds 50 Heavy 100% Client-Side Pro Tools across 2 new categories:
 * - Category 5: Audio & Video (25 Tools powered by WebAssembly `@ffmpeg/ffmpeg` & `@ffmpeg/util`)
 * - Category 6: 3D Model & AR (25 Tools powered by `three` Loaders & Exporters)
 *
 * When executed (`node generate_pro_tools.mjs`), this script:
 * 1. Writes `lib/converters/ffmpegEngine.ts` (Async FFmpeg WASM Core Loader & Runner)
 * 2. Writes `lib/converters/threeEngine.ts` (Browser Three.js Loader & Exporter Pipeline)
 * 3. Generates 50 physical `.ts` converter modules in `lib/converters/[slug].ts`
 * 4. Merges the 50 new tool definitions into `data/converters.json` (150 tools total)
 * 5. Updates `lib/converters/index.ts` to export and register all 150 converter functions
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_FILE = path.join(__dirname, 'data', 'converters.json');
const LIB_CONVERTERS_DIR = path.join(__dirname, 'lib', 'converters');

function slugToFuncName(slug) {
  const pascal = slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return `convert${pascal}`;
}

// ============================================================================
// 1. SHARED FFMPEG WEBASSEMBLY CORE LOADER (`lib/converters/ffmpegEngine.ts`)
// ============================================================================
const FFMPEG_ENGINE_TS = `import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoadingPromise: Promise<FFmpeg> | null = null;

const FFMPEG_CORE_BASE_URL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
const MAX_FFMPEG_INPUT_BYTES = 2 * 1024 * 1024 * 1024;

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
        onProgress(pct, \`Transcoding via FFmpeg WASM (\${pct}%)...\`);
      }
    });

    if (onProgress) {
      onProgress(5, 'Downloading FFmpeg WebAssembly core...');
    }

    const coreURL = await toBlobURL(
      \`\${FFMPEG_CORE_BASE_URL}/ffmpeg-core.js\`,
      'text/javascript'
    );
    const wasmURL = await toBlobURL(
      \`\${FFMPEG_CORE_BASE_URL}/ffmpeg-core.wasm\`,
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
  if (file.size === 0) {
    throw new Error(
      'The browser reads this file as 0 B, so there is no video data to convert. If the file should be 1.2 GB, it may be an online-only cloud placeholder or an incomplete download. Copy or download it to your device, then select it again.'
    );
  }

  if (file.size > MAX_FFMPEG_INPUT_BYTES) {
    const fileSizeGb = (file.size / MAX_FFMPEG_INPUT_BYTES).toFixed(2);
    throw new Error(
      \`This file is \${fileSizeGb} GB, above the 2 GB limit for in-browser FFmpeg conversion. Large files can exceed browser WebAssembly memory. Use desktop FFmpeg or try a smaller file.\`
    );
  }

  const startTime = performance.now();
  const ffmpeg = await getFFmpegInstance(options.onProgress);

  const extMatch = file.name.match(/\\.([a-zA-Z0-9]+)$/);
  const inExt = extMatch ? extMatch[1].toLowerCase() : spec.inputExtFallback;
  const inputName = \`input_\${Date.now()}.\${inExt}\`;
  const outputName = \`output_\${Date.now()}.\${spec.outputExtension}\`;

  options.onProgress?.(12, 'Writing source media into WASM virtual memory...');
  await ffmpeg.writeFile(inputName, await fetchFile(file));

  const cliArgs = spec.buildArgs(inputName, outputName);
  options.onProgress?.(20, \`Running ffmpeg \${cliArgs.join(' ')}...\`);

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
    summaryText: \`Transcoded \${file.name} -> .\${spec.outputExtension} via FFmpeg WebAssembly\`,
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
`;

// ============================================================================
// 2. SHARED THREE.JS 3D MODEL LOADER & EXPORTER (`lib/converters/threeEngine.ts`)
// ============================================================================
const THREE_ENGINE_TS = `import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { PLYExporter } from 'three/examples/jsm/exporters/PLYExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';

export type Model3DFormat =
  | 'obj'
  | 'stl'
  | 'stl-ascii'
  | 'stl-binary'
  | 'ply'
  | 'ply-binary'
  | 'gltf'
  | 'glb'
  | 'threejs-json'
  | 'point-cloud-ply'
  | 'inspector-json';

export interface ThreeConversionSpec {
  slug: string;
  inputFormat: 'auto' | 'obj' | 'stl' | 'ply' | 'gltf' | 'glb';
  outputFormat: Model3DFormat;
  outputExtension: string;
  outputMimeType: string;
}

/**
 * Parses an uploaded 3D file (.obj, .stl, .ply, .gltf, .glb) into a Three.js Object3D scene graph.
 */
async function parse3DInputFile(
  file: File,
  formatHint: ThreeConversionSpec['inputFormat']
): Promise<THREE.Object3D> {
  const ext =
    formatHint !== 'auto'
      ? formatHint
      : file.name.split('.').pop()?.toLowerCase() ?? 'obj';

  const defaultMaterial = new THREE.MeshStandardMaterial({
    color: 0x6366f1,
    roughness: 0.4,
    metalness: 0.2,
  });

  if (ext === 'obj') {
    const text = await file.text();
    const loader = new OBJLoader();
    return loader.parse(text);
  }

  if (ext === 'stl') {
    const buffer = await file.arrayBuffer();
    const loader = new STLLoader();
    const geometry = loader.parse(buffer);
    geometry.computeVertexNormals();
    const scene = new THREE.Group();
    scene.add(new THREE.Mesh(geometry, defaultMaterial));
    return scene;
  }

  if (ext === 'ply') {
    const buffer = await file.arrayBuffer();
    const loader = new PLYLoader();
    const geometry = loader.parse(buffer);
    geometry.computeVertexNormals();
    const scene = new THREE.Group();
    scene.add(new THREE.Mesh(geometry, defaultMaterial));
    return scene;
  }

  if (ext === 'gltf' || ext === 'glb') {
    const buffer = await file.arrayBuffer();
    const loader = new GLTFLoader();
    const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
      loader.parse(
        buffer,
        '',
        (res) => resolve(res),
        (err) => reject(new Error('Failed to parse GLTF/GLB binary: ' + String(err)))
      );
    });
    return gltf.scene;
  }

  // Fallback to OBJ text parser
  const text = await file.text();
  return new OBJLoader().parse(text);
}

/**
 * Computes mesh telemetry (vertex count, triangle count, bounding box dimensions) from a Three.js Object3D.
 */
function inspectObject3D(root: THREE.Object3D): {
  meshCount: number;
  vertexCount: number;
  triangleCount: number;
  boundingBox: { width: number; height: number; depth: number };
} {
  let meshCount = 0;
  let vertexCount = 0;
  let triangleCount = 0;

  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      meshCount++;
      const geom = (child as THREE.Mesh).geometry;
      const pos = geom.getAttribute('position');
      if (pos) {
        vertexCount += pos.count;
        if (geom.index) {
          triangleCount += Math.floor(geom.index.count / 3);
        } else {
          triangleCount += Math.floor(pos.count / 3);
        }
      }
    }
  });

  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);

  return {
    meshCount,
    vertexCount,
    triangleCount,
    boundingBox: {
      width: Number(size.x.toFixed(4)),
      height: Number(size.y.toFixed(4)),
      depth: Number(size.z.toFixed(4)),
    },
  };
}

/**
 * Executes a 100% browser-based Three.js 3D model conversion job.
 */
export async function executeThree3DJob(
  file: File,
  spec: ThreeConversionSpec,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  const startTime = performance.now();
  const rootObject = await parse3DInputFile(file, spec.inputFormat);

  if (options.recenterOrigin) {
    const box = new THREE.Box3().setFromObject(rootObject);
    const center = box.getCenter(new THREE.Vector3());
    rootObject.position.sub(center);
    rootObject.updateMatrixWorld(true);
  }

  if (options.computeVertexNormals !== false) {
    rootObject.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        (node as THREE.Mesh).geometry.computeVertexNormals();
      }
    });
  }

  const stats = inspectObject3D(rootObject);
  let outputBlob: Blob;
  let summaryText = \`Meshes: \${stats.meshCount} • Vertices: \${stats.vertexCount.toLocaleString()} • Triangles: \${stats.triangleCount.toLocaleString()} • Size: \${stats.boundingBox.width}×\${stats.boundingBox.height}×\${stats.boundingBox.depth}\`;

  switch (spec.outputFormat) {
    case 'obj': {
      const exporter = new OBJExporter();
      const objText = exporter.parse(rootObject);
      outputBlob = new Blob([objText], { type: 'text/plain;charset=utf-8' });
      summaryText = objText.slice(0, 4000);
      break;
    }

    case 'stl':
    case 'stl-binary': {
      const exporter = new STLExporter();
      const result = exporter.parse(rootObject, { binary: true });
      const buffer =
        result instanceof DataView
          ? (result.buffer as ArrayBuffer)
          : new TextEncoder().encode(String(result)).buffer;
      outputBlob = new Blob([buffer], { type: 'model/stl' });
      break;
    }

    case 'stl-ascii': {
      const exporter = new STLExporter();
      const asciiStl = String(exporter.parse(rootObject, { binary: false }));
      outputBlob = new Blob([asciiStl], { type: 'model/stl;charset=utf-8' });
      summaryText = asciiStl.slice(0, 4000);
      break;
    }

    case 'ply':
    case 'ply-binary': {
      const exporter = new PLYExporter();
      const isBin = spec.outputFormat === 'ply-binary';
      const plyData = await new Promise<string | ArrayBuffer>((resolve) => {
        exporter.parse(
          rootObject,
          (res) => resolve(res),
          { binary: isBin }
        );
      });
      outputBlob = new Blob([plyData], { type: 'application/octet-stream' });
      if (typeof plyData === 'string') {
        summaryText = plyData.slice(0, 4000);
      }
      break;
    }

    case 'point-cloud-ply': {
      const vertices: string[] = [];
      rootObject.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          const pos = (node as THREE.Mesh).geometry.getAttribute('position');
          if (pos) {
            for (let i = 0; i < pos.count; i++) {
              vertices.push(
                \`\${pos.getX(i).toFixed(5)} \${pos.getY(i).toFixed(5)} \${pos.getZ(i).toFixed(5)}\`
              );
            }
          }
        }
      });
      const plyHeader = [
        'ply',
        'format ascii 1.0',
        'comment Generated by convert.my.id 3D Point Cloud Extractor',
        \`element vertex \${vertices.length}\`,
        'property float x',
        'property float y',
        'property float z',
        'end_header',
        ...vertices,
      ].join('\\n');
      outputBlob = new Blob([plyHeader], { type: 'text/plain;charset=utf-8' });
      summaryText = plyHeader.slice(0, 4000);
      break;
    }

    case 'gltf':
    case 'glb': {
      const exporter = new GLTFExporter();
      const isBinary = spec.outputFormat === 'glb';
      const exported = await new Promise<ArrayBuffer | Record<string, unknown>>(
        (resolve, reject) => {
          exporter.parse(
            rootObject,
            (res) => resolve(res as ArrayBuffer | Record<string, unknown>),
            (err) => reject(new Error('GLTFExporter error: ' + String(err))),
            { binary: isBinary }
          );
        }
      );

      if (exported instanceof ArrayBuffer) {
        outputBlob = new Blob([exported], { type: 'model/gltf-binary' });
      } else {
        const jsonStr = JSON.stringify(exported, null, 2);
        outputBlob = new Blob([jsonStr], { type: 'model/gltf+json' });
        summaryText = jsonStr.slice(0, 4000);
      }
      break;
    }

    case 'threejs-json': {
      const jsonPayload = rootObject.toJSON();
      const serialized = JSON.stringify(jsonPayload, null, 2);
      outputBlob = new Blob([serialized], { type: 'application/json' });
      summaryText = serialized.slice(0, 4000);
      break;
    }

    case 'inspector-json': {
      const report = JSON.stringify(
        {
          generator: 'convert.my.id 3D Model Inspector',
          fileName: file.name,
          fileSizeBytes: file.size,
          ...stats,
        },
        null,
        2
      );
      outputBlob = new Blob([report], { type: 'application/json' });
      summaryText = report;
      break;
    }
  }

  const objectUrl = URL.createObjectURL(outputBlob);
  return {
    blob: outputBlob,
    objectUrl,
    originalBytes: file.size,
    outputBytes: outputBlob.size,
    executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
    outputExtension: spec.outputExtension,
    outputMimeType: spec.outputMimeType,
    summaryText,
  };
}

/**
 * Generates an in-memory 3D TorusKnot Wavefront .obj File using Three.js
 * so users can test any 3D Model & AR converter with 1 click.
 */
export function generateSample3DObjFile(): File {
  const geometry = new THREE.TorusKnotGeometry(10, 3, 64, 12);
  const mesh = new THREE.Mesh(geometry);
  const exporter = new OBJExporter();
  const objText = exporter.parse(mesh);
  return new File([objText], 'convert-my-id-torusknot.obj', {
    type: 'model/obj',
  });
}
`;

// ============================================================================
// 3. DEFINITIONS FOR ALL 50 PRO TOOLS (25 Audio/Video + 25 3D Model & AR)
// ============================================================================

const AUDIO_VIDEO_TOOLS = [
  {
    slug: 'mp4-to-mp3',
    h1: 'MP4 to MP3 Audio Converter',
    shortDesc: 'Extract high-bitrate MP3 audio tracks from MP4 video files locally using WebAssembly FFmpeg.',
    inExt: 'mp4',
    outExt: 'mp3',
    mime: 'audio/mpeg',
    args: `['-i', input, '-vn', '-acodec', 'libmp3lame', '-q:a', '2', output]`,
  },
  {
    slug: 'wav-to-mp3',
    h1: 'WAV to MP3 Audio Converter',
    shortDesc: 'Compress uncompressed PCM WAV audio files into compact MP3 files in your browser via FFmpeg WASM.',
    inExt: 'wav',
    outExt: 'mp3',
    mime: 'audio/mpeg',
    args: `['-i', input, '-acodec', 'libmp3lame', '-b:a', '192k', output]`,
  },
  {
    slug: 'mp3-to-wav',
    h1: 'MP3 to WAV Audio Converter',
    shortDesc: 'Decode MP3 audio files into uncompressed 16-bit 44.1kHz stereo PCM WAV format locally.',
    inExt: 'mp3',
    outExt: 'wav',
    mime: 'audio/wav',
    args: `['-i', input, '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', output]`,
  },
  {
    slug: 'webm-to-mp4',
    h1: 'WebM to MP4 Video Converter',
    shortDesc: 'Transcode WebM browser recordings and videos into universally compatible MP4 format client-side.',
    inExt: 'webm',
    outExt: 'mp4',
    mime: 'video/mp4',
    args: `['-i', input, '-c:v', 'mpeg4', '-q:v', '4', '-c:a', 'aac', output]`,
  },
  {
    slug: 'mp4-to-webm',
    h1: 'MP4 to WebM Video Converter',
    shortDesc: 'Convert MP4 videos into open-standard WebM media containers directly inside your browser.',
    inExt: 'mp4',
    outExt: 'webm',
    mime: 'video/webm',
    args: `['-i', input, '-c:v', 'libvpx', '-b:v', '1M', '-c:a', 'libvorbis', output]`,
  },
  {
    slug: 'video-to-gif',
    h1: 'Video to Animated GIF Converter',
    shortDesc: 'Convert MP4, WebM, or MOV video clips into optimized animated GIFs (10 fps, 480px width) via FFmpeg WASM.',
    inExt: 'mp4',
    outExt: 'gif',
    mime: 'image/gif',
    args: `['-i', input, '-vf', 'fps=10,scale=480:-1:flags=lanczos', '-t', '8', output]`,
  },
  {
    slug: 'm4a-to-mp3',
    h1: 'M4A to MP3 Audio Converter',
    shortDesc: 'Convert Apple M4A / AAC voice memos and music tracks into universal MP3 format locally.',
    inExt: 'm4a',
    outExt: 'mp3',
    mime: 'audio/mpeg',
    args: `['-i', input, '-vn', '-acodec', 'libmp3lame', '-b:a', '192k', output]`,
  },
  {
    slug: 'mp3-to-ogg',
    h1: 'MP3 to OGG Vorbis Converter',
    shortDesc: 'Transcode MP3 audio files into open-source OGG Vorbis format for web audio and game engines.',
    inExt: 'mp3',
    outExt: 'ogg',
    mime: 'audio/ogg',
    args: `['-i', input, '-c:a', 'libvorbis', '-q:a', '4', output]`,
  },
  {
    slug: 'ogg-to-mp3',
    h1: 'OGG to MP3 Audio Converter',
    shortDesc: 'Convert OGG Vorbis audio files into standard MP3 tracks inside your browser with zero uploads.',
    inExt: 'ogg',
    outExt: 'mp3',
    mime: 'audio/mpeg',
    args: `['-i', input, '-acodec', 'libmp3lame', '-b:a', '192k', output]`,
  },
  {
    slug: 'flac-to-mp3',
    h1: 'FLAC to MP3 Audio Converter',
    shortDesc: 'Convert lossless FLAC studio audio into high-bitrate 320kbps MP3 files 100% client-side.',
    inExt: 'flac',
    outExt: 'mp3',
    mime: 'audio/mpeg',
    args: `['-i', input, '-acodec', 'libmp3lame', '-b:a', '320k', output]`,
  },
  {
    slug: 'flac-to-wav',
    h1: 'FLAC to WAV Audio Converter',
    shortDesc: 'Decompress FLAC audio into raw uncompressed 16-bit PCM WAV files for DAW editing.',
    inExt: 'flac',
    outExt: 'wav',
    mime: 'audio/wav',
    args: `['-i', input, '-acodec', 'pcm_s16le', output]`,
  },
  {
    slug: 'wav-to-flac',
    h1: 'WAV to FLAC Lossless Converter',
    shortDesc: 'Compress bulky PCM WAV recordings into lossless FLAC archives locally via WebAssembly FFmpeg.',
    inExt: 'wav',
    outExt: 'flac',
    mime: 'audio/flac',
    args: `['-i', input, '-c:a', 'flac', output]`,
  },
  {
    slug: 'aac-to-mp3',
    h1: 'AAC to MP3 Audio Converter',
    shortDesc: 'Transcode raw `.aac` audio streams into standard MP3 files directly inside your browser.',
    inExt: 'aac',
    outExt: 'mp3',
    mime: 'audio/mpeg',
    args: `['-i', input, '-acodec', 'libmp3lame', '-b:a', '192k', output]`,
  },
  {
    slug: 'mp3-to-aac',
    h1: 'MP3 to AAC (M4A) Audio Converter',
    shortDesc: 'Convert MP3 audio tracks into efficient AAC `.m4a` containers locally using FFmpeg WASM.',
    inExt: 'mp3',
    outExt: 'm4a',
    mime: 'audio/mp4',
    args: `['-i', input, '-c:a', 'aac', '-b:a', '192k', output]`,
  },
  {
    slug: 'mov-to-mp4',
    h1: 'MOV to MP4 Video Converter',
    shortDesc: 'Convert Apple QuickTime `.mov` videos into web-ready `.mp4` files without uploading to the cloud.',
    inExt: 'mov',
    outExt: 'mp4',
    mime: 'video/mp4',
    args: `['-i', input, '-c:v', 'mpeg4', '-q:v', '4', '-c:a', 'aac', output]`,
  },
  {
    slug: 'mkv-to-mp4',
    h1: 'MKV to MP4 Video Converter',
    shortDesc: 'Remux and transcode Matroska `.mkv` video files into standard `.mp4` containers in-browser.',
    inExt: 'mkv',
    outExt: 'mp4',
    mime: 'video/mp4',
    args: `['-i', input, '-c:v', 'mpeg4', '-c:a', 'aac', output]`,
  },
  {
    slug: 'avi-to-mp4',
    h1: 'AVI to MP4 Video Converter',
    shortDesc: 'Convert legacy `.avi` video files into modern `.mp4` format locally via WebAssembly FFmpeg.',
    inExt: 'avi',
    outExt: 'mp4',
    mime: 'video/mp4',
    args: `['-i', input, '-c:v', 'mpeg4', '-q:v', '4', '-c:a', 'aac', output]`,
  },
  {
    slug: 'mp4-to-wav',
    h1: 'MP4 to WAV Audio Extractor',
    shortDesc: 'Extract uncompressed 44.1kHz stereo PCM `.wav` audio directly from `.mp4` video recordings.',
    inExt: 'mp4',
    outExt: 'wav',
    mime: 'audio/wav',
    args: `['-i', input, '-vn', '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', output]`,
  },
  {
    slug: 'webm-to-mp3',
    h1: 'WebM to MP3 Audio Converter',
    shortDesc: 'Extract and convert audio streams from `.webm` files into standard `.mp3` audio locally.',
    inExt: 'webm',
    outExt: 'mp3',
    mime: 'audio/mpeg',
    args: `['-i', input, '-vn', '-acodec', 'libmp3lame', '-q:a', '2', output]`,
  },
  {
    slug: 'gif-to-mp4',
    h1: 'Animated GIF to MP4 Video Converter',
    shortDesc: 'Convert heavy animated `.gif` files into lightweight, hardware-accelerated `.mp4` videos.',
    inExt: 'gif',
    outExt: 'mp4',
    mime: 'video/mp4',
    args: `['-i', input, '-movflags', 'faststart', '-pix_fmt', 'yuv420p', '-vf', 'scale=trunc(iw/2)*2:trunc(ih/2)*2', output]`,
  },
  {
    slug: 'gif-to-webm',
    h1: 'Animated GIF to WebM Video Converter',
    shortDesc: 'Compress animated `.gif` loops into modern VP8/VP9 `.webm` video files for fast web performance.',
    inExt: 'gif',
    outExt: 'webm',
    mime: 'video/webm',
    args: `['-i', input, '-c:v', 'libvpx', '-b:v', '800k', '-auto-alt-ref', '0', output]`,
  },
  {
    slug: 'audio-to-8d-surround',
    h1: 'Audio to 8D Spatial Surround Converter',
    shortDesc: 'Apply binaural LFO stereo panning (`apulsator`) to transform any song into 8D spatial audio locally.',
    inExt: 'wav',
    outExt: 'mp3',
    mime: 'audio/mpeg',
    args: `['-i', input, '-af', 'apulsator=hz=0.125', '-acodec', 'libmp3lame', '-b:a', '192k', output]`,
  },
  {
    slug: 'audio-speed-changer',
    h1: 'Audio Tempo & Speed Changer (1.25x)',
    shortDesc: 'Speed up podcasts and audio tracks by 1.25x without pitch distortion using FFmpeg `atempo` DSP.',
    inExt: 'wav',
    outExt: 'mp3',
    mime: 'audio/mpeg',
    args: `['-i', input, '-filter:a', 'atempo=1.25', '-acodec', 'libmp3lame', '-b:a', '192k', output]`,
  },
  {
    slug: 'audio-bass-booster',
    h1: 'Audio Sub-Bass EQ Booster',
    shortDesc: 'Enhance low-end 60Hz sub-bass frequencies (+8dB parametric EQ) on any audio track in-browser.',
    inExt: 'wav',
    outExt: 'mp3',
    mime: 'audio/mpeg',
    args: `['-i', input, '-af', 'equalizer=f=60:width_type=o:width=2:g=8', '-acodec', 'libmp3lame', '-b:a', '192k', output]`,
  },
  {
    slug: 'video-mute-remover',
    h1: 'Video Audio Track Remover (Mute Video)',
    shortDesc: 'Strip the audio track (`-an`) from any MP4 or WebM video file losslessly without re-encoding video frames.',
    inExt: 'mp4',
    outExt: 'mp4',
    mime: 'video/mp4',
    args: `['-i', input, '-an', '-c:v', 'copy', output]`,
  },
];

const MODEL_3D_TOOLS = [
  {
    slug: 'obj-to-stl',
    h1: 'OBJ to STL 3D Mesh Converter',
    shortDesc: 'Convert Wavefront `.obj` 3D models into binary `.stl` meshes ready for 3D printing slicing software.',
    inFmt: 'obj',
    outFmt: 'stl-binary',
    outExt: 'stl',
    mime: 'model/stl',
  },
  {
    slug: 'stl-to-obj',
    h1: 'STL to OBJ 3D Model Converter',
    shortDesc: 'Convert 3D printing `.stl` stereolithography meshes into editable Wavefront `.obj` geometry.',
    inFmt: 'stl',
    outFmt: 'obj',
    outExt: 'obj',
    mime: 'model/obj',
  },
  {
    slug: 'gltf-to-glb',
    h1: 'GLTF to GLB Binary 3D Packager',
    shortDesc: 'Pack `.gltf` JSON 3D scenes into self-contained binary `.glb` 2.0 assets for WebGL and AR.',
    inFmt: 'gltf',
    outFmt: 'glb',
    outExt: 'glb',
    mime: 'model/gltf-binary',
  },
  {
    slug: 'glb-to-gltf',
    h1: 'GLB to GLTF 2.0 JSON Converter',
    shortDesc: 'Unpack binary `.glb` 3D models into human-readable `.gltf` 2.0 JSON scene hierarchies locally.',
    inFmt: 'glb',
    outFmt: 'gltf',
    outExt: 'gltf',
    mime: 'model/gltf+json',
  },
  {
    slug: 'obj-to-gltf',
    h1: 'OBJ to GLTF 2.0 Scene Converter',
    shortDesc: 'Convert Wavefront `.obj` meshes into `.gltf` 2.0 JSON scenes for Three.js, Babylon.js, and WebXR.',
    inFmt: 'obj',
    outFmt: 'gltf',
    outExt: 'gltf',
    mime: 'model/gltf+json',
  },
  {
    slug: 'obj-to-glb',
    h1: 'OBJ to GLB Binary 3D Converter',
    shortDesc: 'Compile Wavefront `.obj` 3D geometry into compact binary `.glb` assets in your browser.',
    inFmt: 'obj',
    outFmt: 'glb',
    outExt: 'glb',
    mime: 'model/gltf-binary',
  },
  {
    slug: 'stl-to-gltf',
    h1: 'STL to GLTF 2.0 Converter',
    shortDesc: 'Transform CAD `.stl` meshes into standard `.gltf` 2.0 JSON scenes for web 3D viewers.',
    inFmt: 'stl',
    outFmt: 'gltf',
    outExt: 'gltf',
    mime: 'model/gltf+json',
  },
  {
    slug: 'stl-to-glb',
    h1: 'STL to GLB Binary AR Converter',
    shortDesc: 'Convert `.stl` CAD models into single-file binary `.glb` assets for AR Quick Look and Scene Viewer.',
    inFmt: 'stl',
    outFmt: 'glb',
    outExt: 'glb',
    mime: 'model/gltf-binary',
  },
  {
    slug: 'ply-to-stl',
    h1: 'PLY to STL 3D Printing Converter',
    shortDesc: 'Convert Stanford `.ply` 3D scan meshes into binary `.stl` files for SLA and FDM 3D printers.',
    inFmt: 'ply',
    outFmt: 'stl-binary',
    outExt: 'stl',
    mime: 'model/stl',
  },
  {
    slug: 'ply-to-obj',
    h1: 'PLY to OBJ 3D Mesh Converter',
    shortDesc: 'Convert Stanford Polygon `.ply` 3D scans into Wavefront `.obj` files for Blender and Maya.',
    inFmt: 'ply',
    outFmt: 'obj',
    outExt: 'obj',
    mime: 'model/obj',
  },
  {
    slug: 'ply-to-glb',
    h1: 'PLY to GLB Binary 3D Converter',
    shortDesc: 'Convert Stanford `.ply` polygon meshes into binary `.glb` 2.0 models using Three.js in-browser.',
    inFmt: 'ply',
    outFmt: 'glb',
    outExt: 'glb',
    mime: 'model/gltf-binary',
  },
  {
    slug: 'ply-to-gltf',
    h1: 'PLY to GLTF 2.0 JSON Converter',
    shortDesc: 'Transform Stanford `.ply` 3D geometry into standard `.gltf` 2.0 JSON format locally.',
    inFmt: 'ply',
    outFmt: 'gltf',
    outExt: 'gltf',
    mime: 'model/gltf+json',
  },
  {
    slug: 'obj-to-ply',
    h1: 'OBJ to PLY Polygon Converter',
    shortDesc: 'Convert Wavefront `.obj` models into Stanford `.ply` polygon format directly inside your browser.',
    inFmt: 'obj',
    outFmt: 'ply',
    outExt: 'ply',
    mime: 'application/octet-stream',
  },
  {
    slug: 'stl-to-ply',
    h1: 'STL to PLY 3D Mesh Converter',
    shortDesc: 'Convert `.stl` CAD geometry into Stanford `.ply` polygon files with computed vertex normals.',
    inFmt: 'stl',
    outFmt: 'ply',
    outExt: 'ply',
    mime: 'application/octet-stream',
  },
  {
    slug: 'gltf-to-obj',
    h1: 'GLTF/GLB to OBJ Mesh Exporter',
    shortDesc: 'Extract 3D mesh geometry from `.gltf` or `.glb` scenes and export as Wavefront `.obj`.',
    inFmt: 'auto',
    outFmt: 'obj',
    outExt: 'obj',
    mime: 'model/obj',
  },
  {
    slug: 'gltf-to-stl',
    h1: 'GLTF/GLB to STL 3D Print Exporter',
    shortDesc: 'Convert `.gltf` and `.glb` 3D web assets into printable binary `.stl` stereolithography meshes.',
    inFmt: 'auto',
    outFmt: 'stl-binary',
    outExt: 'stl',
    mime: 'model/stl',
  },
  {
    slug: 'gltf-to-ply',
    h1: 'GLTF/GLB to PLY Polygon Exporter',
    shortDesc: 'Export `.gltf` or `.glb` 3D scenes into Stanford `.ply` polygon files locally.',
    inFmt: 'auto',
    outFmt: 'ply',
    outExt: 'ply',
    mime: 'application/octet-stream',
  },
  {
    slug: 'stl-ascii-to-binary',
    h1: 'ASCII STL to Binary STL Compressor',
    shortDesc: 'Convert verbose text-based ASCII `.stl` files into compact binary `.stl` format to reduce file size by 75%.',
    inFmt: 'stl',
    outFmt: 'stl-binary',
    outExt: 'stl',
    mime: 'model/stl',
  },
  {
    slug: 'stl-binary-to-ascii',
    h1: 'Binary STL to ASCII STL Converter',
    shortDesc: 'Decompile binary `.stl` 3D meshes into human-readable `solid ... facet normal` ASCII `.stl` text.',
    inFmt: 'stl',
    outFmt: 'stl-ascii',
    outExt: 'stl',
    mime: 'model/stl',
  },
  {
    slug: 'obj-to-threejs-json',
    h1: 'OBJ to Three.js BufferGeometry JSON',
    shortDesc: 'Serialize Wavefront `.obj` models into native Three.js `Object3D.toJSON()` scene format.',
    inFmt: 'obj',
    outFmt: 'threejs-json',
    outExt: 'json',
    mime: 'application/json',
  },
  {
    slug: 'stl-to-threejs-json',
    h1: 'STL to Three.js BufferGeometry JSON',
    shortDesc: 'Convert `.stl` CAD meshes into native Three.js `BufferGeometry` JSON format for WebGL apps.',
    inFmt: 'stl',
    outFmt: 'threejs-json',
    outExt: 'json',
    mime: 'application/json',
  },
  {
    slug: 'ply-to-threejs-json',
    h1: 'PLY to Three.js BufferGeometry JSON',
    shortDesc: 'Serialize Stanford `.ply` meshes into Three.js JSON scene objects locally in your browser.',
    inFmt: 'ply',
    outFmt: 'threejs-json',
    outExt: 'json',
    mime: 'application/json',
  },
  {
    slug: 'obj-to-wireframe-stl',
    h1: '3D OBJ Auto-Center & Normal Optimizer to STL',
    shortDesc: 'Re-center `.obj` mesh bounding box to `(0,0,0)`, recompute smooth vertex normals, and export to `.stl`.',
    inFmt: 'obj',
    outFmt: 'stl-binary',
    outExt: 'stl',
    mime: 'model/stl',
    recenter: true,
  },
  {
    slug: 'model-3d-to-point-cloud-ply',
    h1: '3D Mesh to Vertex Point Cloud PLY Extractor',
    shortDesc: 'Strip faces from `.obj`, `.stl`, or `.glb` models and export pure `XYZ` vertex coordinates as an ASCII `.ply` point cloud.',
    inFmt: 'auto',
    outFmt: 'point-cloud-ply',
    outExt: 'ply',
    mime: 'text/plain',
  },
  {
    slug: 'model-3d-inspector-json',
    h1: '3D Model Geometry & Bounding Box Inspector',
    shortDesc: 'Analyze `.obj`, `.stl`, `.ply`, or `.glb` files and export vertex count, triangle count, and `XYZ` dimensions as JSON.',
    inFmt: 'auto',
    outFmt: 'inspector-json',
    outExt: 'json',
    mime: 'application/json',
  },
];

if (AUDIO_VIDEO_TOOLS.length !== 25 || MODEL_3D_TOOLS.length !== 25) {
  throw new Error('Expected exactly 25 Audio/Video tools and 25 3D Model tools.');
}

// Write shared engines
fs.writeFileSync(path.join(LIB_CONVERTERS_DIR, 'ffmpegEngine.ts'), FFMPEG_ENGINE_TS, 'utf8');
fs.writeFileSync(path.join(LIB_CONVERTERS_DIR, 'threeEngine.ts'), THREE_ENGINE_TS, 'utf8');

const proSeoEntries = [];

// Generate 25 Audio & Video .ts modules
for (const tool of AUDIO_VIDEO_TOOLS) {
  const fnName = slugToFuncName(tool.slug);
  const tsCode = `import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Converter for \`${tool.slug}\` on convert.my.id.
 */
export async function ${fnName}(
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeFFmpegJob(
    file,
    {
      slug: '${tool.slug}',
      inputExtFallback: '${tool.inExt}',
      outputExtension: '${tool.outExt}',
      outputMimeType: '${tool.mime}',
      buildArgs: (input, output) => ${tool.args},
    },
    options
  );
}
`;
  fs.writeFileSync(path.join(LIB_CONVERTERS_DIR, `${tool.slug}.ts`), tsCode, 'utf8');

  proSeoEntries.push({
    slug: tool.slug,
    title: `${tool.h1} Online (Free FFmpeg WASM) | convert.my.id`,
    metaDescription: `${tool.shortDesc} 100% client-side WebAssembly FFmpeg processing on convert.my.id — zero video or audio server uploads.`,
    h1: tool.h1,
    category: 'Audio & Video',
    shortDesc: tool.shortDesc,
    outputExtension: tool.outExt,
    outputMimeType: tool.mime,
    faqs: [
      {
        question: `How does ${tool.h1} run inside my browser without a server?`,
        answer: `convert.my.id compiles FFmpeg to WebAssembly (@ffmpeg/ffmpeg). Your media file is loaded into an isolated in-memory virtual filesystem (MEMFS) and transcoded directly by your CPU in-browser.`,
      },
      {
        question: `Are my private audio or video files uploaded to convert.my.id servers?`,
        answer: `Never. Zero bytes of your video or audio leave your device. All transcoding happens 100% locally inside your browser tab.`,
      },
      {
        question: `What is the maximum file size supported by ${tool.h1}?`,
        answer: `Because processing occurs in browser WebAssembly memory, files up to 500MB–1GB can typically be transcoded depending on your device's available RAM.`,
      },
    ],
  });
}

// Generate 25 3D Model & AR .ts modules
for (const tool of MODEL_3D_TOOLS) {
  const fnName = slugToFuncName(tool.slug);
  const tsCode = `import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for \`${tool.slug}\` on convert.my.id.
 */
export async function ${fnName}(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: '${tool.slug}',
      inputFormat: '${tool.inFmt}',
      outputFormat: '${tool.outFmt}',
      outputExtension: '${tool.outExt}',
      outputMimeType: '${tool.mime}',
    },
    {
      recenterOrigin: ${Boolean(tool.recenter)},
      ...options,
    }
  );
}
`;
  fs.writeFileSync(path.join(LIB_CONVERTERS_DIR, `${tool.slug}.ts`), tsCode, 'utf8');

  proSeoEntries.push({
    slug: tool.slug,
    title: `${tool.h1} Online (Free Client-Side 3D) | convert.my.id`,
    metaDescription: `${tool.shortDesc} Powered by client-side Three.js loaders and exporters on convert.my.id — your proprietary 3D CAD & AR assets never leave your browser.`,
    h1: tool.h1,
    category: '3D Model & AR',
    shortDesc: tool.shortDesc,
    outputExtension: tool.outExt,
    outputMimeType: tool.mime,
    faqs: [
      {
        question: `How does ${tool.h1} convert 3D geometry in the browser?`,
        answer: `convert.my.id uses Three.js BufferGeometry parsers (OBJLoader, STLLoader, PLYLoader, GLTFLoader) and exporters (STLExporter, OBJExporter, PLYExporter, GLTFExporter) to parse and serialize 3D meshes locally in JavaScript.`,
      },
      {
        question: `Are my proprietary 3D CAD or AR models uploaded to any external cloud?`,
        answer: `No. Your 3D meshes, vertex buffers, and scene hierarchies are processed 100% locally in your browser's memory with zero network transfers.`,
      },
      {
        question: `Are vertex normals automatically calculated during conversion?`,
        answer: `Yes. Our Three.js pipeline automatically computes smooth vertex normals and bounding box dimensions before exporting your target 3D file.`,
      },
    ],
  });
}

// ============================================================================
// 4. MERGE INTO data/converters.json (100 BASE + 50 PRO = 150 TOOLS TOTAL)
// ============================================================================
const existingConverters = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const proSlugsSet = new Set(proSeoEntries.map((e) => e.slug));
const base100Converters = existingConverters.filter((c) => !proSlugsSet.has(c.slug));
const merged150Converters = [...base100Converters, ...proSeoEntries];

fs.writeFileSync(
  DATA_FILE,
  JSON.stringify(merged150Converters, null, 2) + '\n',
  'utf8'
);

// ============================================================================
// 5. UPDATE lib/converters/index.ts TO EXPORT ALL 150 CONVERTERS
// ============================================================================
const currentIndexContent = fs.readFileSync(
  path.join(LIB_CONVERTERS_DIR, 'index.ts'),
  'utf8'
);

// Only append Pro registrations if not already appended, or regenerate cleanly
const all150Imports = [];
const all150Exports = [];
const avRegistryLines = [];
const model3dRegistryLines = [];

for (const c of merged150Converters) {
  const fn = slugToFuncName(c.slug);
  all150Imports.push(`import { ${fn} } from './${c.slug}';`);
  all150Exports.push(`  ${fn},`);
}

for (const av of AUDIO_VIDEO_TOOLS) {
  avRegistryLines.push(`  '${av.slug}': ${slugToFuncName(av.slug)},`);
}
for (const m3d of MODEL_3D_TOOLS) {
  model3dRegistryLines.push(`  '${m3d.slug}': ${slugToFuncName(m3d.slug)},`);
}

// Extract existing TEXT_CONVERTER_REGISTRY, IMAGE_CONVERTER_REGISTRY, SAMPLE_INPUTS from current index.ts
const textRegMatch = currentIndexContent.match(
  /export const TEXT_CONVERTER_REGISTRY: Record<string, TextConverterFn> = \{([\s\S]*?)\};/
);
const imgRegMatch = currentIndexContent.match(
  /export const IMAGE_CONVERTER_REGISTRY: Record<string, ImageConverterFn> = \{([\s\S]*?)\};/
);
const sampleMatch = currentIndexContent.match(
  /export const SAMPLE_INPUTS: Record<string, string> = \{([\s\S]*?)\};/
);

const newIndexTs = `/**
 * Unified Registry for all 150 Client-Side Converters on convert.my.id
 * (100 Base Converters + 25 FFmpeg WASM Audio/Video + 25 Three.js 3D Model & AR).
 */

import convertersRaw from '@/data/converters.json';
import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
  ConversionResult,
  ConverterTool,
  ImageConversionOptions,
  Model3DConversionOptions,
  TextConversionOptions,
  WebPConversionResult,
} from '@/types/converter';
import { generateSampleAudioWavFile } from './ffmpegEngine';
import { generateSample3DObjFile } from './threeEngine';

${all150Imports.join('\n')}

export {
  generateSampleAudioWavFile,
  generateSample3DObjFile,
${all150Exports.join('\n')}
};

export const CONVERTER_TOOLS: ConverterTool[] = convertersRaw as ConverterTool[];

export function getConverterBySlug(slug: string): ConverterTool | undefined {
  return CONVERTER_TOOLS.find((tool) => tool.slug === slug);
}

export function getRelatedConverters(currentSlug: string, limit = 4): ConverterTool[] {
  const current = getConverterBySlug(currentSlug);
  const others = CONVERTER_TOOLS.filter((t) => t.slug !== currentSlug);
  if (!current) return others.slice(0, limit);
  const sameCategory = others.filter((t) => t.category === current.category);
  const diffCategory = others.filter((t) => t.category !== current.category);
  return [...sameCategory, ...diffCategory].slice(0, limit);
}

export type TextConverterFn = (input: string, options?: TextConversionOptions) => string;
export type ImageConverterFn = (file: File, options?: ImageConversionOptions) => Promise<WebPConversionResult>;
export type AudioVideoConverterFn = (
  file: File,
  options?: AudioVideoConversionOptions
) => Promise<BinaryFileConversionResult>;
export type Model3DConverterFn = (
  file: File,
  options?: Model3DConversionOptions
) => Promise<BinaryFileConversionResult>;

export const TEXT_CONVERTER_REGISTRY: Record<string, TextConverterFn> = {${textRegMatch ? textRegMatch[1] : ''}};

export const IMAGE_CONVERTER_REGISTRY: Record<string, ImageConverterFn> = {${imgRegMatch ? imgRegMatch[1] : ''}};

export const AUDIO_VIDEO_CONVERTER_REGISTRY: Record<string, AudioVideoConverterFn> = {
${avRegistryLines.join('\n')}
};

export const MODEL_3D_CONVERTER_REGISTRY: Record<string, Model3DConverterFn> = {
${model3dRegistryLines.join('\n')}
};

export function isImageConverterSlug(slug: string): boolean {
  return slug in IMAGE_CONVERTER_REGISTRY;
}

export function isAudioVideoConverterSlug(slug: string): boolean {
  return slug in AUDIO_VIDEO_CONVERTER_REGISTRY;
}

export function isModel3DConverterSlug(slug: string): boolean {
  return slug in MODEL_3D_CONVERTER_REGISTRY;
}

export const SAMPLE_INPUTS: Record<string, string> = {${sampleMatch ? sampleMatch[1] : ''}};

export function runTextConversion(
  slug: string,
  input: string,
  options: TextConversionOptions = {}
): ConversionResult {
  const startTime = performance.now();
  const handler = TEXT_CONVERTER_REGISTRY[slug];

  try {
    if (!handler) {
      throw new Error(\`No text converter registered for slug "\${slug}".\`);
    }
    const output = handler(input, options);
    const executionTimeMs = Number((performance.now() - startTime).toFixed(2));
    return {
      output,
      executionTimeMs,
      stats: {
        inputBytes: new Blob([input]).size,
        outputBytes: new Blob([output]).size,
      },
    };
  } catch (err) {
    return {
      output: '',
      error: err instanceof Error ? err.message : 'Conversion failed.',
      executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
    };
  }
}

export async function runImageConversion(
  slug: string,
  file: File,
  options: ImageConversionOptions = {}
): Promise<WebPConversionResult> {
  const handler = IMAGE_CONVERTER_REGISTRY[slug];
  if (!handler) {
    throw new Error(\`No image converter registered for slug "\${slug}".\`);
  }
  return handler(file, options);
}

export async function runAudioVideoConversion(
  slug: string,
  file: File,
  options: AudioVideoConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  const handler = AUDIO_VIDEO_CONVERTER_REGISTRY[slug];
  if (!handler) {
    throw new Error(\`No FFmpeg Audio/Video converter registered for slug "\${slug}".\`);
  }
  return handler(file, options);
}

export async function runModel3DConversion(
  slug: string,
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  const handler = MODEL_3D_CONVERTER_REGISTRY[slug];
  if (!handler) {
    throw new Error(\`No Three.js 3D converter registered for slug "\${slug}".\`);
  }
  return handler(file, options);
}

export async function generateSamplePngFile(): Promise<File> {
  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 720;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context unavailable');

  const gradient = ctx.createLinearGradient(0, 0, 1200, 720);
  gradient.addColorStop(0, '#1e1b4b');
  gradient.addColorStop(0.5, '#4338ca');
  gradient.addColorStop(1, '#0f172a');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 1200, 720);

  ctx.fillStyle = 'rgba(15, 23, 42, 0.78)';
  ctx.fillRect(90, 160, 760, 400);
  ctx.strokeStyle = 'rgba(129, 140, 248, 0.45)';
  ctx.lineWidth = 2;
  ctx.strokeRect(90, 160, 760, 400);

  ctx.fillStyle = '#818cf8';
  ctx.font = 'bold 24px monospace';
  ctx.fillText('100% CLIENT-SIDE CANVAS BENCHMARK', 140, 240);

  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 54px sans-serif';
  ctx.fillText('convert.my.id Media Engine', 140, 325);

  ctx.fillStyle = '#cbd5e1';
  ctx.font = '26px sans-serif';
  ctx.fillText('Sample High-Resolution Canvas Artwork (1200x720px)', 140, 395);
  ctx.fillText('Zero server uploads • Native Browser Processing', 140, 445);

  const pngBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Blob error'))), 'image/png');
  });

  return new File([pngBlob], 'convert-my-id-sample.png', { type: 'image/png' });
}
`;

fs.writeFileSync(path.join(LIB_CONVERTERS_DIR, 'index.ts'), newIndexTs, 'utf8');

console.log('✅ Successfully generated 50 Pro Tools (Audio/Video WASM + 3D Three.js):');
console.log('   - lib/converters/ffmpegEngine.ts & lib/converters/threeEngine.ts');
console.log('   - 25 Audio & Video .ts modules + 25 3D Model & AR .ts modules');
console.log(`   - data/converters.json updated to ${merged150Converters.length} total tools`);
console.log('   - lib/converters/index.ts updated with 150 exported functions');
