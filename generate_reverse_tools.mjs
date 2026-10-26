/**
 * generate_reverse_tools.mjs
 * Automated Node.js Inverse/Reverse Converter Generator for convert.my.id
 *
 * Generates 50 Bidirectional / Inverse Client-Side Converter Tools:
 * - 20 Audio & Video Reverse Tools (FFmpeg WebAssembly: MP3 to FLAC, MP4 to MOV, MP4 to MKV, MP4 to AVI, WAV to MP4, OGG to WAV, FLAC to OGG, etc.)
 * - 8 Code & Dev Reverse Tools (TypeScript to JSON, JS to TS, Zod to TS, GraphQL to TS, Go/Rust/Python to JSON, JSON Schema to JSON)
 * - 7 Image & Media Reverse Tools (Base64 to Image, Data URI to SVG, PNG/JPG/WebP to BMP, PNG to ICO, ICO to PNG)
 * - 7 CSS & Unit Reverse Tools (VH to PX, RGBA to HEX, OKLCH to HEX, Tailwind to CSS, CSS to SCSS, PX to PC, PC to PX)
 * - 5 Text & Data Reverse Tools (HTML Table to CSV, Slug to Title, Roman to Number, Date to Unix Timestamp, JSON to JWT)
 * - 3 3D Model & AR Reverse Tools (Three.js JSON to OBJ, Three.js JSON to STL, Three.js JSON to GLB)
 *
 * Usage:
 *   node generate_reverse_tools.mjs
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
// ENHANCE threeEngine.ts TO SUPPORT 'threejs-json' INPUT FOR REVERSE 3D TOOLS
// ============================================================================
const threeEnginePath = path.join(LIB_CONVERTERS_DIR, 'threeEngine.ts');
if (fs.existsSync(threeEnginePath)) {
  let threeSrc = fs.readFileSync(threeEnginePath, 'utf8');
  if (!threeSrc.includes("'threejs-json' | 'auto'")) {
    threeSrc = threeSrc.replace(
      "inputFormat: 'auto' | 'obj' | 'stl' | 'ply' | 'gltf' | 'glb';",
      "inputFormat: 'auto' | 'obj' | 'stl' | 'ply' | 'gltf' | 'glb' | 'threejs-json';"
    );
    threeSrc = threeSrc.replace(
      "  if (ext === 'obj') {",
      `  if (ext === 'threejs-json' || ext === 'json') {
    const text = await file.text();
    const json = JSON.parse(text);
    const objLoader = new THREE.ObjectLoader();
    return objLoader.parse(json);
  }

  if (ext === 'obj') {`
    );
    fs.writeFileSync(threeEnginePath, threeSrc, 'utf8');
  }
}

// ============================================================================
// 1. 20 AUDIO & VIDEO REVERSE TOOLS (FFmpeg WebAssembly)
// ============================================================================
const REVERSE_AUDIO_VIDEO_TOOLS = [
  {
    slug: 'mp3-to-flac',
    h1: 'MP3 to FLAC Lossless Audio Converter',
    shortDesc: 'Transcode MP3 audio files into uncompressed lossless FLAC archive containers locally via FFmpeg WebAssembly.',
    inExt: 'mp3',
    outExt: 'flac',
    mime: 'audio/flac',
    args: `['-i', input, '-c:a', 'flac', output]`,
  },
  {
    slug: 'mp4-to-mov',
    h1: 'MP4 to MOV QuickTime Video Converter',
    shortDesc: 'Convert MP4 videos into Apple QuickTime (.mov) container format for Final Cut Pro and macOS workflows.',
    inExt: 'mp4',
    outExt: 'mov',
    mime: 'video/quicktime',
    args: `['-i', input, '-c:v', 'mpeg4', '-q:v', '4', '-c:a', 'aac', '-f', 'mov', output]`,
  },
  {
    slug: 'mp4-to-mkv',
    h1: 'MP4 to MKV Matroska Video Converter',
    shortDesc: 'Remux and convert MP4 video files into flexible Matroska (.mkv) multimedia containers client-side.',
    inExt: 'mp4',
    outExt: 'mkv',
    mime: 'video/x-matroska',
    args: `['-i', input, '-c:v', 'mpeg4', '-c:a', 'aac', '-f', 'matroska', output]`,
  },
  {
    slug: 'mp4-to-avi',
    h1: 'MP4 to AVI Video Converter',
    shortDesc: 'Transcode modern MP4 video clips into legacy Audio Video Interleave (.avi) format inside your browser.',
    inExt: 'mp4',
    outExt: 'avi',
    mime: 'video/x-msvideo',
    args: `['-i', input, '-c:v', 'mpeg4', '-q:v', '5', '-c:a', 'libmp3lame', '-f', 'avi', output]`,
  },
  {
    slug: 'wav-to-mp4',
    h1: 'WAV to MP4 Media Container Converter',
    shortDesc: 'Encode uncompressed PCM WAV audio tracks into AAC-encoded MP4 media files ready for social video platforms.',
    inExt: 'wav',
    outExt: 'mp4',
    mime: 'video/mp4',
    args: `['-i', input, '-c:a', 'aac', '-b:a', '192k', '-f', 'mp4', output]`,
  },
  {
    slug: 'ogg-to-wav',
    h1: 'OGG to WAV Uncompressed Audio Converter',
    shortDesc: 'Decode OGG Vorbis audio streams into 16-bit 44.1kHz stereo PCM WAV audio files locally.',
    inExt: 'ogg',
    outExt: 'wav',
    mime: 'audio/wav',
    args: `['-i', input, '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', output]`,
  },
  {
    slug: 'wav-to-ogg',
    h1: 'WAV to OGG Vorbis Audio Converter',
    shortDesc: 'Compress raw PCM WAV audio recordings into open-source OGG Vorbis (.ogg) files for web & game engines.',
    inExt: 'wav',
    outExt: 'ogg',
    mime: 'audio/ogg',
    args: `['-i', input, '-c:a', 'libvorbis', '-q:a', '5', output]`,
  },
  {
    slug: 'flac-to-ogg',
    h1: 'FLAC to OGG Vorbis Audio Converter',
    shortDesc: 'Convert lossless FLAC studio tracks into lightweight OGG Vorbis audio streams in your browser.',
    inExt: 'flac',
    outExt: 'ogg',
    mime: 'audio/ogg',
    args: `['-i', input, '-c:a', 'libvorbis', '-q:a', '6', output]`,
  },
  {
    slug: 'ogg-to-flac',
    h1: 'OGG to FLAC Lossless Container Converter',
    shortDesc: 'Transcode OGG Vorbis audio files into FLAC archive format with zero server uploads via FFmpeg WASM.',
    inExt: 'ogg',
    outExt: 'flac',
    mime: 'audio/flac',
    args: `['-i', input, '-c:a', 'flac', output]`,
  },
  {
    slug: 'mp3-to-m4a',
    h1: 'MP3 to M4A Apple Audio Converter',
    shortDesc: 'Convert MP3 audio tracks into Apple M4A (AAC) audio containers locally in your browser.',
    inExt: 'mp3',
    outExt: 'm4a',
    mime: 'audio/mp4',
    args: `['-i', input, '-c:a', 'aac', '-b:a', '192k', output]`,
  },
  {
    slug: 'mp3-to-mp4',
    h1: 'MP3 to MP4 Media Converter',
    shortDesc: 'Wrap MP3 audio streams into standard MP4 multimedia containers locally using WebAssembly FFmpeg.',
    inExt: 'mp3',
    outExt: 'mp4',
    mime: 'video/mp4',
    args: `['-i', input, '-c:a', 'aac', '-b:a', '192k', '-f', 'mp4', output]`,
  },
  {
    slug: 'mp3-to-webm',
    h1: 'MP3 to WebM Audio Converter',
    shortDesc: 'Convert MP3 audio files into HTML5 WebM Vorbis media streams for lightweight web playback.',
    inExt: 'mp3',
    outExt: 'webm',
    mime: 'audio/webm',
    args: `['-i', input, '-vn', '-c:a', 'libvorbis', '-q:a', '4', '-f', 'webm', output]`,
  },
  {
    slug: 'wav-to-aac',
    h1: 'WAV to AAC Audio Converter',
    shortDesc: 'Encode uncompressed PCM WAV audio into raw Advanced Audio Coding (.aac) streams in-browser.',
    inExt: 'wav',
    outExt: 'aac',
    mime: 'audio/aac',
    args: `['-i', input, '-c:a', 'aac', '-b:a', '192k', '-f', 'adts', output]`,
  },
  {
    slug: 'aac-to-wav',
    h1: 'AAC to WAV Uncompressed Audio Converter',
    shortDesc: 'Decode raw AAC audio streams into uncompressed 16-bit stereo PCM WAV files locally.',
    inExt: 'aac',
    outExt: 'wav',
    mime: 'audio/wav',
    args: `['-i', input, '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', output]`,
  },
  {
    slug: 'm4a-to-wav',
    h1: 'M4A to WAV Audio Converter',
    shortDesc: 'Decode Apple M4A voice recordings and music into uncompressed PCM WAV format in-browser.',
    inExt: 'm4a',
    outExt: 'wav',
    mime: 'audio/wav',
    args: `['-i', input, '-vn', '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', output]`,
  },
  {
    slug: 'wav-to-m4a',
    h1: 'WAV to M4A Apple Audio Converter',
    shortDesc: 'Compress PCM WAV audio files into high-efficiency Apple M4A (AAC) containers locally.',
    inExt: 'wav',
    outExt: 'm4a',
    mime: 'audio/mp4',
    args: `['-i', input, '-c:a', 'aac', '-b:a', '192k', output]`,
  },
  {
    slug: 'webm-to-wav',
    h1: 'WebM to WAV Audio Extractor',
    shortDesc: 'Extract uncompressed 16-bit PCM WAV audio tracks from WebM video and audio recordings.',
    inExt: 'webm',
    outExt: 'wav',
    mime: 'audio/wav',
    args: `['-i', input, '-vn', '-acodec', 'pcm_s16le', '-ar', '44100', '-ac', '2', output]`,
  },
  {
    slug: 'wav-to-webm',
    h1: 'WAV to WebM Audio Converter',
    shortDesc: 'Transcode uncompressed WAV audio into web-optimized WebM Vorbis containers via FFmpeg WASM.',
    inExt: 'wav',
    outExt: 'webm',
    mime: 'audio/webm',
    args: `['-i', input, '-vn', '-c:a', 'libvorbis', '-q:a', '5', '-f', 'webm', output]`,
  },
  {
    slug: 'mov-to-webm',
    h1: 'MOV to WebM Video Converter',
    shortDesc: 'Convert QuickTime (.mov) videos into open-standard HTML5 WebM videos locally.',
    inExt: 'mov',
    outExt: 'webm',
    mime: 'video/webm',
    args: `['-i', input, '-c:v', 'libvpx', '-b:v', '1M', '-c:a', 'libvorbis', output]`,
  },
  {
    slug: 'webm-to-mov',
    h1: 'WebM to MOV QuickTime Video Converter',
    shortDesc: 'Convert WebM videos into Apple QuickTime (.mov) files inside your browser with zero uploads.',
    inExt: 'webm',
    outExt: 'mov',
    mime: 'video/quicktime',
    args: `['-i', input, '-c:v', 'mpeg4', '-q:v', '4', '-c:a', 'aac', '-f', 'mov', output]`,
  },
];

// ============================================================================
// 2. 3 REVERSE 3D MODEL & AR TOOLS (Three.js)
// ============================================================================
const REVERSE_3D_TOOLS = [
  {
    slug: 'threejs-json-to-obj',
    h1: 'Three.js JSON to OBJ 3D Mesh Converter',
    shortDesc: 'Deserialize Three.js Object3D / BufferGeometry JSON files back into standard Wavefront (.obj) 3D models.',
    inFmt: 'threejs-json',
    outFmt: 'obj',
    outExt: 'obj',
    mime: 'model/obj',
  },
  {
    slug: 'threejs-json-to-stl',
    h1: 'Three.js JSON to STL 3D Print Converter',
    shortDesc: 'Convert serialized Three.js Object3D JSON scenes into binary 3D-printable (.stl) meshes.',
    inFmt: 'threejs-json',
    outFmt: 'stl-binary',
    outExt: 'stl',
    mime: 'model/stl',
  },
  {
    slug: 'threejs-json-to-glb',
    h1: 'Three.js JSON to GLB Binary 3D Converter',
    shortDesc: 'Compile Three.js Object3D JSON hierarchies into self-contained binary GLB 2.0 AR/WebGL assets.',
    inFmt: 'threejs-json',
    outFmt: 'glb',
    outExt: 'glb',
    mime: 'model/gltf-binary',
  },
];

// ============================================================================
// 3. 5 REVERSE CANVAS IMAGE TOOLS (PNG/JPG/WebP to BMP, PNG to ICO, ICO to PNG)
// ============================================================================
const REVERSE_IMAGE_CANVAS_TOOLS = [
  {
    slug: 'png-to-bmp',
    h1: 'PNG to 24-Bit BMP Bitmap Converter',
    shortDesc: 'Convert lossless PNG graphics into uncompressed 24-bit Windows DIB (.bmp) bitmap files locally.',
    outExt: 'bmp',
    mime: 'image/bmp',
    mode: 'bmp',
  },
  {
    slug: 'jpg-to-bmp',
    h1: 'JPG to 24-Bit BMP Bitmap Converter',
    shortDesc: 'Decode JPEG photographs into uncompressed 24-bit Windows (.bmp) bitmap images in-browser.',
    outExt: 'bmp',
    mime: 'image/bmp',
    mode: 'bmp',
  },
  {
    slug: 'webp-to-bmp',
    h1: 'WebP to 24-Bit BMP Bitmap Converter',
    shortDesc: 'Convert WebP images into raw uncompressed 24-bit Windows Bitmap (.bmp) files via HTML5 Canvas.',
    outExt: 'bmp',
    mime: 'image/bmp',
    mode: 'bmp',
  },
  {
    slug: 'png-to-ico',
    h1: 'PNG to ICO Favicon Converter',
    shortDesc: 'Convert transparent PNG logos into compliant 64×64 website `.ico` favicon files client-side.',
    outExt: 'ico',
    mime: 'image/x-icon',
    mode: 'ico',
  },
  {
    slug: 'ico-to-png',
    h1: 'ICO Favicon to PNG Image Converter',
    shortDesc: 'Decode `.ico` website favicons and extract crisp 32-bit transparent `.png` images in your browser.',
    outExt: 'png',
    mime: 'image/png',
    mode: 'png',
  },
];

// ============================================================================
// 4. 22 REVERSE TEXT / CODE / CSS / DATA TOOLS
// ============================================================================
const REVERSE_TEXT_TOOLS = [
  // --- Code & Dev (8 Reverse Tools) ---
  {
    slug: 'typescript-to-json',
    category: 'Code & Dev',
    h1: 'TypeScript Interface to Mock JSON Generator',
    shortDesc: 'Parse TypeScript `interface` declarations and generate realistic mock JSON payloads matching every property type.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: 'export interface RootInterface {\n  id: number;\n  domain: string;\n  clientSide: boolean;\n  tags: string[];\n}',
    sourceCode: `export function convertTypescriptToJson(input: string): string {
  if (!input.trim()) return '';
  const result: Record<string, unknown> = {};
  const propRegex = /^\\s*['"]?([A-Za-z0-9_$-]+)['"]?\\??\\s*:\\s*([^;\\n]+);?/gm;
  let m: RegExpExecArray | null;
  while ((m = propRegex.exec(input)) !== null) {
    const key = m[1];
    const rawType = m[2].trim();
    if (key === 'interface' || key === 'export') continue;
    if (rawType.endsWith('[]') || rawType.startsWith('Array<')) {
      result[key] = rawType.includes('number') ? [1, 2] : rawType.includes('boolean') ? [true] : ['sample_item'];
    } else if (/string/i.test(rawType)) {
      result[key] = key.toLowerCase().includes('domain') ? 'convert.my.id' : \`sample_\${key}\`;
    } else if (/number|int|float/i.test(rawType)) {
      result[key] = 100;
    } else if (/boolean|bool/i.test(rawType)) {
      result[key] = true;
    } else if (/null/i.test(rawType)) {
      result[key] = null;
    } else {
      result[key] = {};
    }
  }
  return JSON.stringify(result, null, 2);
}
`,
  },
  {
    slug: 'javascript-to-typescript',
    category: 'Code & Dev',
    h1: 'JavaScript to TypeScript Type Annotator',
    shortDesc: 'Infer and add explicit TypeScript type annotations (`: string`, `: number`, `: boolean`) to JavaScript variables and functions.',
    outputExtension: 'ts',
    outputMimeType: 'text/typescript',
    sampleInput: 'const domain = "convert.my.id";\nconst totalTools = 200;\nconst isPrivate = true;\nfunction calculateRem(px = 16, base = 16) {\n  return px / base;\n}',
    sourceCode: `export function convertJavascriptToTypescript(input: string): string {
  if (!input.trim()) return '';
  let out = input;
  // Annotate string variable declarations
  out = out.replace(/\\b(const|let|var)\\s+([A-Za-z_$][A-Za-z0-9_$]*)\\s*=\\s*(['"\`])/g, '$1 $2: string = $3');
  // Annotate numeric variable declarations
  out = out.replace(/\\b(const|let|var)\\s+([A-Za-z_$][A-Za-z0-9_$]*)\\s*=\\s*(-?\\d+(?:\\.\\d+)?)\\b/g, '$1 $2: number = $3');
  // Annotate boolean variable declarations
  out = out.replace(/\\b(const|let|var)\\s+([A-Za-z_$][A-Za-z0-9_$]*)\\s*=\\s*(true|false)\\b/g, '$1 $2: boolean = $3');
  // Annotate default numeric parameters in functions
  out = out.replace(/([A-Za-z_$][A-Za-z0-9_$]*)\\s*=\\s*(-?\\d+(?:\\.\\d+)?)/g, '$1: number = $2');
  // Annotate default string parameters in functions
  out = out.replace(/([A-Za-z_$][A-Za-z0-9_$]*)\\s*=\\s*(['"][^'"]*['"])/g, '$1: string = $2');
  return out;
}
`,
  },
  {
    slug: 'zod-to-typescript',
    category: 'Code & Dev',
    h1: 'Zod Schema to TypeScript Interface Converter',
    shortDesc: 'Convert `z.object({...})` Zod validation schemas back into clean static TypeScript `interface` declarations.',
    outputExtension: 'ts',
    outputMimeType: 'text/typescript',
    sampleInput: 'export const userSchema = z.object({\n  id: z.string(),\n  age: z.number().int(),\n  active: z.boolean(),\n  tags: z.array(z.string()),\n});',
    sourceCode: `export function convertZodToTypescript(input: string): string {
  if (!input.trim()) return '';
  const lines = ['export interface InferredZodInterface {'];
  const fieldRegex = /^\\s*([A-Za-z0-9_$]+)\\s*:\\s*z\\.([A-Za-z0-9_.()]+),?/gm;
  let m: RegExpExecArray | null;
  while ((m = fieldRegex.exec(input)) !== null) {
    const key = m[1];
    const chain = m[2];
    const opt = chain.includes('.optional()') ? '?' : '';
    let tsType = 'unknown';
    if (chain.startsWith('array(')) {
      tsType = chain.includes('number') ? 'number[]' : chain.includes('boolean') ? 'boolean[]' : 'string[]';
    } else if (chain.startsWith('string')) tsType = 'string';
    else if (chain.startsWith('number')) tsType = 'number';
    else if (chain.startsWith('boolean')) tsType = 'boolean';
    else if (chain.startsWith('null')) tsType = 'null';
    lines.push(\`  \${key}\${opt}: \${tsType};\`);
  }
  lines.push('}');
  return lines.join('\\n');
}
`,
  },
  {
    slug: 'graphql-to-typescript',
    category: 'Code & Dev',
    h1: 'GraphQL Schema to TypeScript Interface Converter',
    shortDesc: 'Compile GraphQL SDL `type` definitions (`String!`, `Int`, `[ID!]!`) into strict TypeScript interfaces.',
    outputExtension: 'ts',
    outputMimeType: 'text/typescript',
    sampleInput: 'type ToolItem {\n  id: ID!\n  slug: String!\n  views: Int\n  rating: Float!\n  active: Boolean!\n}',
    sourceCode: `const GQL_SCALAR_MAP: Record<string, string> = {
  ID: 'string',
  String: 'string',
  Int: 'number',
  Float: 'number',
  Boolean: 'boolean',
};

export function convertGraphqlToTypescript(input: string): string {
  if (!input.trim()) return '';
  const typeBlocks = input.match(/type\\s+([A-Za-z0-9_]+)\\s*\\{([^}]*)\\}/g);
  if (!typeBlocks) return '// No GraphQL type blocks found';

  return typeBlocks
    .map((block) => {
      const header = block.match(/type\\s+([A-Za-z0-9_]+)/);
      const name = header ? header[1] : 'GraphQLType';
      const body = block.slice(block.indexOf('{') + 1, block.lastIndexOf('}'));
      const fields = body
        .split(/\\r?\\n/)
        .map((l) => l.trim())
        .filter((l) => l && !l.startsWith('#'))
        .map((line) => {
          const m = line.match(/^([A-Za-z0-9_]+)\\s*:\\s*(.+)$/);
          if (!m) return '';
          const fieldName = m[1];
          const rawType = m[2].trim();
          const isRequired = rawType.endsWith('!');
          const isList = rawType.startsWith('[');
          const core = rawType.replace(/[\\[\\]!]/g, '');
          const mapped = GQL_SCALAR_MAP[core] ?? core;
          return \`  \${fieldName}\${isRequired ? '' : '?'}: \${mapped}\${isList ? '[]' : ''};\`;
        })
        .filter(Boolean);
      return \`export interface \${name} {\\n\${fields.join('\\n')}\\n}\`;
    })
    .join('\\n\\n');
}
`,
  },
  {
    slug: 'go-struct-to-json',
    category: 'Code & Dev',
    h1: 'Go Struct to Sample JSON Converter',
    shortDesc: 'Parse Golang `type struct` definitions and `json:"..."` tags into a formatted sample JSON object.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: 'type Config struct {\n\tID int64 `json:"id"`\n\tDomain string `json:"domain"`\n\tClientSide bool `json:"client_side"`\n\tScore float64 `json:"score"`\n}',
    sourceCode: `export function convertGoStructToJson(input: string): string {
  if (!input.trim()) return '';
  const out: Record<string, unknown> = {};
  const lines = input.split(/\\r?\\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('//') || line.startsWith('type ') || line === '}') continue;
    const m = line.match(/^([A-Za-z0-9_]+)\\s+([\\[\\]A-Za-z0-9_{}]+)(?:\\s+\`json:"([^",]+).*?"\`)?/);
    if (!m) continue;
    const key = m[3] || m[1];
    const goType = m[2];
    if (goType.startsWith('[]')) out[key] = [];
    else if (/int|uint/i.test(goType)) out[key] = 1;
    else if (/float/i.test(goType)) out[key] = 99.9;
    else if (/bool/i.test(goType)) out[key] = true;
    else if (/string/i.test(goType)) out[key] = key.includes('domain') ? 'convert.my.id' : \`sample_\${key}\`;
    else out[key] = {};
  }
  return JSON.stringify(out, null, 2);
}
`,
  },
  {
    slug: 'rust-struct-to-json',
    category: 'Code & Dev',
    h1: 'Rust Serde Struct to JSON Converter',
    shortDesc: 'Convert Rust `pub struct` fields and `#[serde(rename = "...")]` attributes into a sample JSON object.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: 'pub struct AppConfig {\n    pub project_id: i64,\n    pub domain: String,\n    pub edge_enabled: bool,\n    pub tags: Vec<String>,\n}',
    sourceCode: `export function convertRustStructToJson(input: string): string {
  if (!input.trim()) return '';
  const out: Record<string, unknown> = {};
  let pendingRename: string | null = null;
  for (const raw of input.split(/\\r?\\n/)) {
    const line = raw.trim();
    const ren = line.match(/#\\[serde\\(rename\\s*=\\s*"([^"]+)"\\)\\]/);
    if (ren) { pendingRename = ren[1]; continue; }
    const m = line.match(/^(?:pub\\s+)?([A-Za-z0-9_]+)\\s*:\\s*([^,]+),?/);
    if (!m) continue;
    const key = pendingRename ?? m[1];
    pendingRename = null;
    const rType = m[2].trim();
    if (rType.startsWith('Vec<')) out[key] = ['sample'];
    else if (/i\\d+|u\\d+|isize|usize/.test(rType)) out[key] = 100;
    else if (/f32|f64/.test(rType)) out[key] = 1.0;
    else if (rType === 'bool') out[key] = true;
    else if (/String|str/.test(rType)) out[key] = key === 'domain' ? 'convert.my.id' : \`sample_\${key}\`;
    else out[key] = null;
  }
  return JSON.stringify(out, null, 2);
}
`,
  },
  {
    slug: 'python-dataclass-to-json',
    category: 'Code & Dev',
    h1: 'Python Dataclass to JSON Converter',
    shortDesc: 'Transform Python `@dataclass` or `TypedDict` class attributes into a formatted sample JSON payload.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: '@dataclass\nclass SiteConfig:\n    id: int\n    domain: str\n    is_private: bool\n    keywords: List[str]',
    sourceCode: `export function convertPythonDataclassToJson(input: string): string {
  if (!input.trim()) return '';
  const out: Record<string, unknown> = {};
  for (const raw of input.split(/\\r?\\n/)) {
    const line = raw.trim();
    if (!line || line.startsWith('@') || line.startsWith('class ') || line.startsWith('from ') || line === 'pass') continue;
    const m = line.match(/^([A-Za-z0-9_]+)\\s*:\\s*([^=\\n]+)(?:=\\s*(.+))?$/);
    if (!m) continue;
    const key = m[1];
    const pyType = m[2].trim();
    if (pyType.startsWith('List') || pyType.startsWith('list')) out[key] = ['item'];
    else if (pyType === 'int') out[key] = 1;
    else if (pyType === 'float') out[key] = 1.5;
    else if (pyType === 'bool') out[key] = true;
    else if (pyType === 'str') out[key] = key === 'domain' ? 'convert.my.id' : \`sample_\${key}\`;
    else out[key] = null;
  }
  return JSON.stringify(out, null, 2);
}
`,
  },
  {
    slug: 'json-schema-to-json',
    category: 'Code & Dev',
    h1: 'JSON Schema to Sample JSON Generator',
    shortDesc: 'Generate a compliant mock JSON payload from a Draft-07 JSON Schema document.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: '{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "type": "object",\n  "properties": {\n    "id": { "type": "integer" },\n    "domain": { "type": "string" },\n    "clientSide": { "type": "boolean" }\n  }\n}',
    sourceCode: `function instantiateSchema(schema: Record<string, unknown>, keyHint = ''): unknown {
  const t = schema.type;
  if (schema.enum && Array.isArray(schema.enum) && schema.enum.length > 0) return schema.enum[0];
  if (t === 'string') return keyHint.toLowerCase().includes('domain') ? 'convert.my.id' : \`sample_\${keyHint || 'str'}\`;
  if (t === 'integer' || t === 'number') return 100;
  if (t === 'boolean') return true;
  if (t === 'array') {
    const items = (schema.items as Record<string, unknown>) ?? { type: 'string' };
    return [instantiateSchema(items, keyHint)];
  }
  if (t === 'object' || schema.properties) {
    const props = (schema.properties as Record<string, Record<string, unknown>>) ?? {};
    const obj: Record<string, unknown> = {};
    for (const [k, sub] of Object.entries(props)) {
      obj[k] = instantiateSchema(sub, k);
    }
    return obj;
  }
  return null;
}

export function convertJsonSchemaToJson(input: string): string {
  if (!input.trim()) return '';
  const parsed = JSON.parse(input) as Record<string, unknown>;
  return JSON.stringify(instantiateSchema(parsed), null, 2);
}
`,
  },

  // --- Image & Media Text-Based Reverse Tools (2 Tools) ---
  {
    slug: 'base64-to-image',
    category: 'Image & Media',
    h1: 'Base64 to Image Decoder & Inspector',
    shortDesc: 'Decode Base64 image strings or `data:image/...;base64` Data URIs into an embeddable HTML `<img>` tag and MIME metadata report.',
    outputExtension: 'html',
    outputMimeType: 'text/html',
    sampleInput: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMjgiIGZpbGw9IiM2MzY2ZjEiLz48L3N2Zz4=',
    sourceCode: `export function convertBase64ToImage(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const dataUri = trimmed.startsWith('data:image/')
    ? trimmed
    : \`data:image/png;base64,\${trimmed.replace(/\\s+/g, '')}\`;
  const mimeMatch = dataUri.match(/^data:(image\\/[a-zA-Z0-9+.-]+);base64,/);
  const mime = mimeMatch ? mimeMatch[1] : 'image/png';
  const rawB64 = dataUri.replace(/^data:image\\/[a-zA-Z0-9+.-]+;base64,/, '');
  const approxBytes = Math.round((rawB64.length * 3) / 4);

  return [
    \`<!-- Decoded Image Metadata (convert.my.id) -->\`,
    \`<!-- MIME Type: \${mime} | Approx Binary Size: \${approxBytes} bytes -->\`,
    \`<img src="\${dataUri}" alt="Decoded Base64 Image" />\`,
  ].join('\\n');
}
`,
  },
  {
    slug: 'data-uri-to-svg',
    category: 'Image & Media',
    h1: 'CSS Data URI to SVG XML Decoder',
    shortDesc: 'Decode URL-encoded or Base64 `data:image/svg+xml,...` CSS strings back into clean, formatted `<svg>` XML markup.',
    outputExtension: 'svg',
    outputMimeType: 'image/svg+xml',
    sampleInput: 'background-image: url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' viewBox=\'0 0 24 24\'%3E%3Ccircle cx=\'12\' cy=\'12\' r=\'10\' fill=\'%236366f1\'/%3E%3C/svg%3E");',
    sourceCode: `export function convertDataUriToSvg(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  let uri = trimmed;
  const urlMatch = trimmed.match(/url\\(\\s*['"]?([^)'"]+)['"]?\\s*\\)/i);
  if (urlMatch) uri = urlMatch[1];

  if (uri.includes(';base64,')) {
    const b64 = uri.slice(uri.indexOf(';base64,') + 8);
    return atob(b64).trim();
  }

  const prefixIdx = uri.indexOf('data:image/svg+xml,');
  const payload = prefixIdx !== -1 ? uri.slice(prefixIdx + 'data:image/svg+xml,'.length) : uri;
  return decodeURIComponent(payload)
    .replace(/></g, '>\\n<')
    .trim();
}
`,
  },

  // --- CSS & Unit Reverse Tools (7 Tools) ---
  {
    slug: 'vh-to-px',
    category: 'CSS & Unit',
    h1: 'VH to PX Viewport Height Converter',
    shortDesc: 'Convert CSS viewport height (`vh`) units into exact pixel (`px`) values based on a 1080px reference screen height.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '.hero-section {\n  min-height: 100vh;\n  padding-top: 10vh;\n  margin-bottom: 5vh;\n}',
    sourceCode: `export function convertVhToPx(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const vhBase = 1080;
  const single = trimmed.match(/^(-?\\d*\\.?\\d+)\\s*(vh)?$/i);
  if (single) {
    const vh = parseFloat(single[1]);
    return \`\${Number(((vh / 100) * vhBase).toFixed(2))}px /* @1080px viewport height */\`;
  }
  return input.replace(/(-?\\d*\\.?\\d+)vh\\b/gi, (_, n: string) => {
    const vh = parseFloat(n);
    return vh === 0 ? '0' : \`\${Number(((vh / 100) * vhBase).toFixed(2))}px\`;
  });
}
`,
  },
  {
    slug: 'rgba-to-hex',
    category: 'CSS & Unit',
    h1: 'RGBA to 8-Digit HEX Color Converter',
    shortDesc: 'Convert CSS `rgba(r, g, b, alpha)` color declarations into 8-digit `#RRGGBBAA` hexadecimal color codes.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: 'rgba(99, 102, 241, 0.85)\nrgba(16, 185, 129, 0.5)\nrgba(15, 23, 42, 1)',
    sourceCode: `function toHexByte(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
}

export function convertRgbaToHex(input: string): string {
  if (!input.trim()) return '';
  return input.replace(
    /rgba?\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})(?:\\s*,\\s*([0-9.]+))?\\s*\\)/gi,
    (_, r, g, b, a) => {
      const alpha = a !== undefined ? parseFloat(a) : 1;
      const aHex = alpha < 1 ? toHexByte(alpha * 255) : '';
      return \`#\${toHexByte(Number(r))}\${toHexByte(Number(g))}\${toHexByte(Number(b))}\${aHex}\`;
    }
  );
}
`,
  },
  {
    slug: 'oklch-to-hex',
    category: 'CSS & Unit',
    h1: 'OKLCH to HEX sRGB Color Converter',
    shortDesc: 'Convert CSS Color Level 4 `oklch(L% C H)` perceptual colors back into standard `#rrggbb` sRGB hexadecimal values.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: 'oklch(58.54% 0.2041 277.12)\noklch(69.59% 0.1491 162.48)',
    sourceCode: `function linearToSrgb(x: number): number {
  const clamped = Math.max(0, Math.min(1, x));
  return clamped <= 0.0031308
    ? 12.92 * clamped
    : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055;
}

function oklchToHexStr(Lraw: number, isPct: boolean, C: number, Hdeg: number): string {
  const L = isPct ? Lraw / 100 : Lraw;
  const hRad = (Hdeg * Math.PI) / 180;
  const a = C * Math.cos(hRad);
  const b = C * Math.sin(hRad);

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = L - 0.0894841775 * a - 1.291485548 * b;

  const l = l_ * l_ * l_;
  const m = m_ * m_ * m_;
  const s = s_ * s_ * s_;

  const rLin = +4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  const gLin = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  const bLin = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const toHex = (v: number) => Math.round(linearToSrgb(v) * 255).toString(16).padStart(2, '0');
  return \`#\${toHex(rLin)}\${toHex(gLin)}\${toHex(bLin)}\`;
}

export function convertOklchToHex(input: string): string {
  if (!input.trim()) return '';
  return input.replace(
    /oklch\\(\\s*([0-9.]+)(%?)\\s+([0-9.]+)\\s+([0-9.]+)(?:deg)?\\s*\\)/gi,
    (_, lStr, pct, cStr, hStr) =>
      oklchToHexStr(parseFloat(lStr), pct === '%', parseFloat(cStr), parseFloat(hStr))
  );
}
`,
  },
  {
    slug: 'tailwind-to-css',
    category: 'CSS & Unit',
    h1: 'Tailwind CSS Classes to Vanilla CSS Converter',
    shortDesc: 'Translate Tailwind utility class strings (`flex items-center justify-between p-4 rounded-xl`) into standard CSS rules.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: 'flex flex-col items-center justify-between p-6 gap-4 font-bold rounded-2xl w-full relative overflow-hidden',
    sourceCode: `const TW_TO_CSS: Record<string, string> = {
  flex: 'display: flex;',
  'inline-flex': 'display: inline-flex;',
  grid: 'display: grid;',
  block: 'display: block;',
  'inline-block': 'display: inline-block;',
  hidden: 'display: none;',
  'flex-row': 'flex-direction: row;',
  'flex-col': 'flex-direction: column;',
  'items-center': 'align-items: center;',
  'items-start': 'align-items: flex-start;',
  'items-end': 'align-items: flex-end;',
  'justify-center': 'justify-content: center;',
  'justify-between': 'justify-content: space-between;',
  'justify-start': 'justify-content: flex-start;',
  relative: 'position: relative;',
  absolute: 'position: absolute;',
  fixed: 'position: fixed;',
  sticky: 'position: sticky;',
  'font-bold': 'font-weight: 700;',
  'font-semibold': 'font-weight: 600;',
  'font-medium': 'font-weight: 500;',
  'text-center': 'text-align: center;',
  'w-full': 'width: 100%;',
  'h-full': 'height: 100%;',
  'overflow-hidden': 'overflow: hidden;',
  'cursor-pointer': 'cursor: pointer;',
  rounded: 'border-radius: 4px;',
  'rounded-lg': 'border-radius: 8px;',
  'rounded-xl': 'border-radius: 12px;',
  'rounded-2xl': 'border-radius: 16px;',
  'rounded-full': 'border-radius: 9999px;',
};

export function convertTailwindToCss(input: string): string {
  if (!input.trim()) return '';
  const tokens = input.trim().replace(/^class(?:Name)?=["']|["']$/g, '').split(/\\s+/);
  const rules: string[] = [];
  for (const tok of tokens) {
    if (TW_TO_CSS[tok]) {
      rules.push(\`  \${TW_TO_CSS[tok]}\`);
      continue;
    }
    const spacing = tok.match(/^(p|m|gap)-(\\d+(?:\\.\\d+)?)$/);
    if (spacing) {
      const prop = spacing[1] === 'p' ? 'padding' : spacing[1] === 'm' ? 'margin' : 'gap';
      const px = parseFloat(spacing[2]) * 4;
      rules.push(\`  \${prop}: \${px}px;\`);
    }
  }
  return \`.converted-element {\\n\${rules.join('\\n')}\\n}\`;
}
`,
  },
  {
    slug: 'css-to-scss',
    category: 'CSS & Unit',
    h1: 'CSS to SCSS Variable & Nesting Refactorer',
    shortDesc: 'Extract repeated HEX colors into `$color-*` SCSS variables and format standard CSS for Sass stylesheets.',
    outputExtension: 'scss',
    outputMimeType: 'text/x-scss',
    sampleInput: '.card {\n  background-color: #0f172a;\n  border: 1px solid #6366f1;\n}\n.badge {\n  color: #6366f1;\n  background: #0f172a;\n}',
    sourceCode: `export function convertCssToScss(input: string): string {
  if (!input.trim()) return '';
  const colorMap = new Map<string, string>();
  let idx = 1;
  const scssBody = input.replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\\b/g, (hex) => {
    const lower = hex.toLowerCase();
    if (!colorMap.has(lower)) {
      colorMap.set(lower, \`$color-brand-\${idx++}\`);
    }
    return colorMap.get(lower)!;
  });

  const varLines = Array.from(colorMap.entries()).map(([hex, varName]) => \`\${varName}: \${hex};\`);
  return [...varLines, '', scssBody.trim()].join('\\n');
}
`,
  },
  {
    slug: 'px-to-pc',
    category: 'CSS & Unit',
    h1: 'PX to Picas (PC) CSS Unit Converter',
    shortDesc: 'Convert CSS pixels (`px`) into typographic picas (`pc`, where `1pc = 16px` or `12pt`).',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '16px\n24px\n32px\n64px',
    sourceCode: `export function convertPxToPc(input: string): string {
  if (!input.trim()) return '';
  return input.replace(/(-?\\d*\\.?\\d+)(?:px)?\\b/gi, (m, n: string) => {
    if (!n) return m;
    const px = parseFloat(n);
    if (Number.isNaN(px)) return m;
    return \`\${Number((px / 16).toFixed(4))}pc\`;
  });
}
`,
  },
  {
    slug: 'pc-to-px',
    category: 'CSS & Unit',
    h1: 'Picas (PC) to PX CSS Unit Converter',
    shortDesc: 'Convert typographic picas (`pc`) back into standard screen pixels (`px`, where `1pc = 16px`).',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '1pc\n1.5pc\n2pc\n4pc',
    sourceCode: `export function convertPcToPx(input: string): string {
  if (!input.trim()) return '';
  return input.replace(/(-?\\d*\\.?\\d+)(?:pc)?\\b/gi, (m, n: string) => {
    if (!n) return m;
    const pc = parseFloat(n);
    if (Number.isNaN(pc)) return m;
    return \`\${Number((pc * 16).toFixed(2))}px\`;
  });
}
`,
  },

  // --- Text & Data Reverse Tools (5 Tools) ---
  {
    slug: 'html-table-to-csv',
    category: 'Text & Data',
    h1: 'HTML Table to CSV Converter',
    shortDesc: 'Extract rows (`<tr>`) and cells (`<th>`, `<td>`) from HTML `<table>` markup into clean RFC 4180 CSV format.',
    outputExtension: 'csv',
    outputMimeType: 'text/csv',
    sampleInput: '<table>\n  <thead>\n    <tr><th>ID</th><th>Slug</th><th>Domain</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>1</td><td>html-table-to-csv</td><td>convert.my.id</td></tr>\n  </tbody>\n</table>',
    sourceCode: `export function convertHtmlTableToCsv(input: string): string {
  if (!input.trim()) return '';
  const rowMatches = input.match(/<tr[^>]*>[\\s\\S]*?<\\/tr>/gi);
  if (!rowMatches) return '';
  return rowMatches
    .map((rowHtml) => {
      const cells = rowHtml.match(/<t[hd][^>]*>([\\s\\S]*?)<\\/t[hd]>/gi) ?? [];
      return cells
        .map((cell) => {
          const text = cell.replace(/<[^>]+>/g, '').trim();
          return /[",\\n]/.test(text) ? \`"\${text.replace(/"/g, '""')}"\` : text;
        })
        .join(',');
    })
    .join('\\n');
}
`,
  },
  {
    slug: 'slug-to-title',
    category: 'Text & Data',
    h1: 'URL Slug to Title Case Converter',
    shortDesc: 'Convert `kebab-case` URL slugs or `snake_case` identifiers back into properly capitalized Title Case headings.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: 'json-to-typescript-interface-converter\nmp4-to-mp3-audio-extractor\nconvert_my_id_client_side_tools',
    sourceCode: `const ACRONYMS = new Set(['json', 'xml', 'yaml', 'toml', 'html', 'css', 'scss', 'jsx', 'tsx', 'sql', 'csv', 'tsv', 'jwt', 'url', 'uri', 'rgb', 'rgba', 'hsl', 'cmyk', 'oklch', 'px', 'rem', 'em', 'vw', 'vh', 'pt', 'pc', 'png', 'jpg', 'webp', 'svg', 'bmp', 'gif', 'ico', 'mp4', 'mp3', 'wav', 'webm', 'flac', 'ogg', 'aac', 'm4a', 'mov', 'mkv', 'avi', 'obj', 'stl', 'ply', 'gltf', 'glb', '3d', 'ar', 'seo', 'api']);

export function convertSlugToTitle(input: string): string {
  if (!input.trim()) return '';
  return input
    .trim()
    .split(/\\r?\\n/)
    .map((line) =>
      line
        .trim()
        .replace(/^\\/convert\\//, '')
        .split(/[-_/\\s]+/)
        .filter(Boolean)
        .map((word, idx) => {
          const lower = word.toLowerCase();
          if (ACRONYMS.has(lower)) return lower.toUpperCase();
          if (idx > 0 && ['to', 'in', 'on', 'for', 'and', 'or', 'of'].includes(lower)) return lower;
          return lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join(' ')
    )
    .join('\\n');
}
`,
  },
  {
    slug: 'roman-to-number',
    category: 'Text & Data',
    h1: 'Roman Numeral to Integer Converter',
    shortDesc: 'Decode classical Roman numerals (`MMXXVI`, `MCMXCIX`, `XLII`) into standard Arabic integers.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: 'MMXXVI\nC\nXLIX',
    sourceCode: `const ROMAN_VAL: Record<string, number> = {
  I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000,
};

function romanToInt(roman: string): number {
  const s = roman.toUpperCase().trim();
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const curr = ROMAN_VAL[s[i]] ?? 0;
    const next = ROMAN_VAL[s[i + 1]] ?? 0;
    if (curr < next) total -= curr;
    else total += curr;
  }
  return total;
}

export function convertRomanToNumber(input: string): string {
  if (!input.trim()) return '';
  return input
    .trim()
    .split(/\\r?\\n/)
    .map((line) => {
      const t = line.trim();
      if (!t) return '';
      return \`\${t.toUpperCase()} = \${romanToInt(t)}\`;
    })
    .join('\\n');
}
`,
  },
  {
    slug: 'date-to-unix-timestamp',
    category: 'Text & Data',
    h1: 'Date String to Unix Timestamp Converter',
    shortDesc: 'Convert ISO-8601 dates or human-readable date strings into Unix Epoch timestamps in seconds and milliseconds.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: '2026-10-26T12:00:00+07:00',
    sourceCode: `export function convertDateToUnixTimestamp(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const date = new Date(trimmed);
  if (Number.isNaN(date.getTime())) {
    throw new Error('Invalid date string format. Use ISO-8601 (e.g. 2026-10-26T12:00:00Z).');
  }
  return JSON.stringify(
    {
      inputDate: trimmed,
      unixSeconds: Math.floor(date.getTime() / 1000),
      unixMilliseconds: date.getTime(),
      iso8601UTC: date.toISOString(),
    },
    null,
    2
  );
}
`,
  },
  {
    slug: 'json-to-jwt',
    category: 'Text & Data',
    h1: 'JSON Payload to JWT Token Encoder',
    shortDesc: 'Encode JSON claims into a Base64URL-encoded JSON Web Token (`header.payload.signature`) structure locally.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: '{\n  "sub": "usr_200",\n  "iss": "convert.my.id",\n  "role": "developer",\n  "iat": 1792986515\n}',
    sourceCode: `function encodeBase64Url(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '');
}

export function convertJsonToJwt(input: string): string {
  if (!input.trim()) return '';
  const payloadObj: unknown = JSON.parse(input);
  const headerObj = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = encodeBase64Url(JSON.stringify(headerObj));
  const encodedPayload = encodeBase64Url(JSON.stringify(payloadObj));
  const unsignedSig = encodeBase64Url('convert.my.id-client-side-signature-preview');
  return \`\${encodedHeader}.\${encodedPayload}.\${unsignedSig}\`;
}
`,
  },
];

// Verify exact 50 count
const totalReverseCount =
  REVERSE_AUDIO_VIDEO_TOOLS.length +
  REVERSE_3D_TOOLS.length +
  REVERSE_IMAGE_CANVAS_TOOLS.length +
  REVERSE_TEXT_TOOLS.length;

if (totalReverseCount !== 50) {
  throw new Error(`Expected 50 reverse tools, got ${totalReverseCount}`);
}

const reverseSeoEntries = [];

// 1. Write 20 Audio & Video Reverse .ts modules
for (const tool of REVERSE_AUDIO_VIDEO_TOOLS) {
  const fnName = slugToFuncName(tool.slug);
  const tsCode = `import type {
  AudioVideoConversionOptions,
  BinaryFileConversionResult,
} from '@/types/converter';
import { executeFFmpegJob } from './ffmpegEngine';

/**
 * 100% Client-Side WebAssembly FFmpeg Reverse Converter for \`${tool.slug}\` on convert.my.id.
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

  reverseSeoEntries.push({
    slug: tool.slug,
    title: `${tool.h1} Online (Free FFmpeg WASM) | convert.my.id`,
    metaDescription: `${tool.shortDesc} 100% client-side WebAssembly FFmpeg processing on convert.my.id — zero server uploads.`,
    h1: tool.h1,
    category: 'Audio & Video',
    shortDesc: tool.shortDesc,
    outputExtension: tool.outExt,
    outputMimeType: tool.mime,
    faqs: [
      {
        question: `How does ${tool.h1} work in my browser without uploading files?`,
        answer: `${tool.shortDesc} convert.my.id runs FFmpeg compiled to WebAssembly (@ffmpeg/ffmpeg) directly inside your browser's local memory.`,
      },
      {
        question: `Is my audio or video file private when using ${tool.h1}?`,
        answer: `Yes. 100% of the transcoding happens locally on your device. Your media files never touch any external server.`,
      },
      {
        question: `Is ${tool.h1} on convert.my.id completely free?`,
        answer: `Yes, all 200 converters on convert.my.id are 100% free with no file count limits or watermarks.`,
      },
    ],
  });
}

// 2. Write 3 Reverse 3D Model .ts modules
for (const tool of REVERSE_3D_TOOLS) {
  const fnName = slugToFuncName(tool.slug);
  const tsCode = `import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js Reverse 3D Converter for \`${tool.slug}\` on convert.my.id.
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
    options
  );
}
`;
  fs.writeFileSync(path.join(LIB_CONVERTERS_DIR, `${tool.slug}.ts`), tsCode, 'utf8');

  reverseSeoEntries.push({
    slug: tool.slug,
    title: `${tool.h1} Online (Free Client-Side 3D) | convert.my.id`,
    metaDescription: `${tool.shortDesc} 100% client-side Three.js 3D conversion on convert.my.id — your 3D assets never leave your browser.`,
    h1: tool.h1,
    category: '3D Model & AR',
    shortDesc: tool.shortDesc,
    outputExtension: tool.outExt,
    outputMimeType: tool.mime,
    faqs: [
      {
        question: `How does ${tool.h1} reconstruct 3D geometry from JSON?`,
        answer: `convert.my.id parses the Three.js Object3D / BufferGeometry JSON structure via THREE.ObjectLoader and exports the reconstructed mesh directly to .${tool.outExt} in-browser.`,
      },
      {
        question: `Are my 3D JSON scenes uploaded to any server?`,
        answer: `Never. All 3D scene parsing and mesh serialization run 100% client-side inside your browser.`,
      },
    ],
  });
}

// 3. Write 5 Reverse Canvas Image .ts modules
for (const tool of REVERSE_IMAGE_CANVAS_TOOLS) {
  const fnName = slugToFuncName(tool.slug);
  // Reuse image-to-bmp, image-to-ico, or png canvas pipeline
  const delegateSlug =
    tool.mode === 'bmp'
      ? 'image-to-bmp'
      : tool.mode === 'ico'
      ? 'image-to-ico'
      : 'webp-to-png';
  const delegateFn = slugToFuncName(delegateSlug);

  const tsCode = `import type { ImageConversionOptions, WebPConversionResult } from '@/types/converter';
import { ${delegateFn} } from './${delegateSlug}';

/**
 * 100% Client-Side HTML5 Canvas Converter for \`${tool.slug}\` on convert.my.id.
 */
export async function ${fnName}(
  file: File,
  options: ImageConversionOptions = {}
): Promise<WebPConversionResult> {
  return ${delegateFn}(file, options);
}
`;
  fs.writeFileSync(path.join(LIB_CONVERTERS_DIR, `${tool.slug}.ts`), tsCode, 'utf8');

  reverseSeoEntries.push({
    slug: tool.slug,
    title: `${tool.h1} Online (Free & Private) | convert.my.id`,
    metaDescription: `${tool.shortDesc} 100% client-side HTML5 Canvas processing on convert.my.id — zero image uploads.`,
    h1: tool.h1,
    category: 'Image & Media',
    shortDesc: tool.shortDesc,
    outputExtension: tool.outExt,
    outputMimeType: tool.mime,
    faqs: [
      {
        question: `How does ${tool.h1} convert images without a server?`,
        answer: `${tool.shortDesc} All pixel decoding and binary encoding run locally in your browser using the HTML5 FileReader and Canvas 2D APIs.`,
      },
      {
        question: `Are my images uploaded to convert.my.id?`,
        answer: `No. Your images remain 100% on your device and are processed in local browser memory.`,
      },
    ],
  });
}

// 4. Write 22 Reverse Text / Code / CSS / Data .ts modules
for (const tool of REVERSE_TEXT_TOOLS) {
  fs.writeFileSync(
    path.join(LIB_CONVERTERS_DIR, `${tool.slug}.ts`),
    tool.sourceCode,
    'utf8'
  );

  reverseSeoEntries.push({
    slug: tool.slug,
    title: `${tool.h1} Online (Free & Private) | convert.my.id`,
    metaDescription: `${tool.shortDesc} 100% client-side processing on convert.my.id — your data never leaves your browser.`,
    h1: tool.h1,
    category: tool.category,
    shortDesc: tool.shortDesc,
    outputExtension: tool.outputExtension,
    outputMimeType: tool.outputMimeType,
    faqs: [
      {
        question: `How does ${tool.h1} work on convert.my.id?`,
        answer: `${tool.shortDesc} All parsing and code generation run locally inside your browser's JavaScript runtime with sub-5ms latency.`,
      },
      {
        question: `Is my code or data sent to any external server?`,
        answer: `Never. convert.my.id is 100% client-side. Your input data stays strictly inside your browser memory.`,
      },
    ],
  });
}

// ============================================================================
// 5. MERGE INTO data/converters.json (150 EXISTING + 50 REVERSE = 200 TOOLS)
// ============================================================================
const existingConverters = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const reverseSlugsSet = new Set(reverseSeoEntries.map((e) => e.slug));
const base150Converters = existingConverters.filter(
  (c) => !reverseSlugsSet.has(c.slug)
);
const merged200Converters = [...base150Converters, ...reverseSeoEntries];

fs.writeFileSync(
  DATA_FILE,
  JSON.stringify(merged200Converters, null, 2) + '\n',
  'utf8'
);

// ============================================================================
// 6. UPDATE lib/converters/index.ts TO EXPORT & REGISTER ALL 200 FUNCTIONS
// ============================================================================
const currentIndexContent = fs.readFileSync(
  path.join(LIB_CONVERTERS_DIR, 'index.ts'),
  'utf8'
);

function extractRegistryBody(source, constName) {
  const regex = new RegExp(
    `export const ${constName}: Record<[^>]+> = \\{([\\s\\S]*?)\\};`
  );
  const m = source.match(regex);
  return m ? m[1].trim() : '';
}

function mergeRegistryLines(existingBody, newItems) {
  const map = new Map();
  for (const line of existingBody.split(/\r?\n/)) {
    const m = line.trim().match(/^'([^']+)':\s*([A-Za-z0-9_]+),?$/);
    if (m) map.set(m[1], m[2]);
  }
  for (const item of newItems) {
    map.set(item.slug, slugToFuncName(item.slug));
  }
  return Array.from(map.entries())
    .map(([slug, fn]) => `  '${slug}': ${fn},`)
    .join('\n');
}

const textRegBody = mergeRegistryLines(
  extractRegistryBody(currentIndexContent, 'TEXT_CONVERTER_REGISTRY'),
  REVERSE_TEXT_TOOLS
);
const imgRegBody = mergeRegistryLines(
  extractRegistryBody(currentIndexContent, 'IMAGE_CONVERTER_REGISTRY'),
  REVERSE_IMAGE_CANVAS_TOOLS
);
const avRegBody = mergeRegistryLines(
  extractRegistryBody(currentIndexContent, 'AUDIO_VIDEO_CONVERTER_REGISTRY'),
  REVERSE_AUDIO_VIDEO_TOOLS
);
const m3dRegBody = mergeRegistryLines(
  extractRegistryBody(currentIndexContent, 'MODEL_3D_CONVERTER_REGISTRY'),
  REVERSE_3D_TOOLS
);

// Merge SAMPLE_INPUTS
const existingSampleMatch = currentIndexContent.match(
  /export const SAMPLE_INPUTS: Record<string, string> = \{([\s\S]*?)\};/
);
const existingSampleLines = existingSampleMatch
  ? existingSampleMatch[1]
      .trim()
      .split(/\r?\n/)
      .filter((l) => {
        const m = l.trim().match(/^'([^']+)':/);
        return m && !reverseSlugsSet.has(m[1]);
      })
  : [];

for (const t of REVERSE_TEXT_TOOLS) {
  existingSampleLines.push(
    `  '${t.slug}': ${JSON.stringify(t.sampleInput ?? '')},`
  );
}

const all200Imports = merged200Converters.map(
  (c) => `import { ${slugToFuncName(c.slug)} } from './${c.slug}';`
);
const all200Exports = merged200Converters.map(
  (c) => `  ${slugToFuncName(c.slug)},`
);

const updatedIndexTs = `/**
 * Unified Registry for all 200 Client-Side Converters on convert.my.id
 * (150 Core & Pro Tools + 50 Bidirectional Inverse/Reverse Tools).
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

${all200Imports.join('\n')}

export {
  generateSampleAudioWavFile,
  generateSample3DObjFile,
${all200Exports.join('\n')}
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

export const TEXT_CONVERTER_REGISTRY: Record<string, TextConverterFn> = {
${textRegBody}
};

export const IMAGE_CONVERTER_REGISTRY: Record<string, ImageConverterFn> = {
${imgRegBody}
};

export const AUDIO_VIDEO_CONVERTER_REGISTRY: Record<string, AudioVideoConverterFn> = {
${avRegBody}
};

export const MODEL_3D_CONVERTER_REGISTRY: Record<string, Model3DConverterFn> = {
${m3dRegBody}
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

export const SAMPLE_INPUTS: Record<string, string> = {
${existingSampleLines.join('\n')}
};

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

fs.writeFileSync(path.join(LIB_CONVERTERS_DIR, 'index.ts'), updatedIndexTs, 'utf8');

console.log('✅ Successfully generated 50 Reverse/Inverse Converter Tools:');
console.log('   - 50 new TypeScript modules written to lib/converters/*.ts');
console.log(`   - data/converters.json updated to ${merged200Converters.length} total tools`);
console.log('   - lib/converters/index.ts updated with all 200 exported converter functions');
