/**
 * generate_tools.mjs
 * Automated Node.js Code & SEO Dataset Generator for convert.my.id
 *
 * Generates:
 * 1. Exactly 100 standalone TypeScript converter modules in `lib/converters/[slug].ts`
 *    using 100% native browser Web APIs (JSON.parse, DOMParser, HTML5 Canvas, ImageData,
 *    TextEncoder/TextDecoder, btoa/atob, URLSearchParams, Intl, RegExp ASTs).
 * 2. `data/converters.json` containing all 100 programmatic SEO tool definitions.
 * 3. `lib/converters/index.ts` exporting all 100 converter functions and unified registries.
 *
 * Usage:
 *   node generate_tools.mjs
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const LIB_CONVERTERS_DIR = path.join(__dirname, 'lib', 'converters');

/**
 * Helper to convert kebab-case slug to camelCase function name:
 * e.g. "json-to-typescript" -> "convertJsonToTypescript"
 */
function slugToFuncName(slug) {
  const pascal = slug
    .split('-')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('');
  return `convert${pascal}`;
}

/**
 * Shared HTML5 Canvas helper template used by raster/vector Image & Media `.ts` modules.
 */
function createCanvasImageConverterSource(slug, fnName, config) {
  const {
    mimeType = 'image/webp',
    extension = 'webp',
    defaultQuality = 0.85,
    filterMode = 'none', // 'none' | 'grayscale' | 'sepia' | 'invert' | 'pixelate' | 'bmp' | 'ico' | 'base64' | 'ascii' | 'palette'
    opaqueBackground = null,
  } = config;

  return `import type { ImageConversionOptions, WebPConversionResult } from '@/types/converter';

function readFileAsDataUrl(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === 'string'
        ? resolve(reader.result)
        : reject(new Error('FileReader failed to return a Data URL.'));
    reader.onerror = () => reject(new Error('Failed to read file from local disk.'));
    reader.readAsDataURL(file);
  });
}

function decodeImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Unable to decode image format in browser.'));
    img.src = dataUrl;
  });
}

function encodeUncompressedBmp(imageData: ImageData): Blob {
  const width = imageData.width;
  const height = imageData.height;
  const rowSize = Math.floor((24 * width + 31) / 32) * 4;
  const pixelArraySize = rowSize * height;
  const fileSize = 54 + pixelArraySize;
  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  // BITMAPFILEHEADER (14 bytes)
  view.setUint8(0, 0x42); // 'B'
  view.setUint8(1, 0x4d); // 'M'
  view.setUint32(2, fileSize, true);
  view.setUint32(6, 0, true);
  view.setUint32(10, 54, true);

  // BITMAPINFOHEADER (40 bytes)
  view.setUint32(14, 40, true);
  view.setInt32(18, width, true);
  view.setInt32(22, -height, true); // top-down DIB
  view.setUint16(26, 1, true);
  view.setUint16(28, 24, true);
  view.setUint32(30, 0, true);
  view.setUint32(34, pixelArraySize, true);
  view.setInt32(38, 2835, true);
  view.setInt32(42, 2835, true);
  view.setUint32(46, 0, true);
  view.setUint32(50, 0, true);

  const src = imageData.data;
  let offset = 54;
  const padding = rowSize - width * 3;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const a = src[idx + 3] / 255;
      const r = Math.round(src[idx] * a + 255 * (1 - a));
      const g = Math.round(src[idx + 1] * a + 255 * (1 - a));
      const b = Math.round(src[idx + 2] * a + 255 * (1 - a));
      view.setUint8(offset++, b);
      view.setUint8(offset++, g);
      view.setUint8(offset++, r);
    }
    offset += padding;
  }
  return new Blob([buffer], { type: 'image/bmp' });
}

async function encodePngIcoContainer(canvas: HTMLCanvasElement): Promise<Blob> {
  const icoCanvas = document.createElement('canvas');
  icoCanvas.width = 64;
  icoCanvas.height = 64;
  const ictx = icoCanvas.getContext('2d');
  if (!ictx) throw new Error('Canvas 2D context unavailable.');
  ictx.drawImage(canvas, 0, 0, 64, 64);

  const pngBlob = await new Promise<Blob>((res, rej) =>
    icoCanvas.toBlob((b) => (b ? res(b) : rej(new Error('ICO PNG blob error'))), 'image/png')
  );
  const pngBytes = new Uint8Array(await pngBlob.arrayBuffer());
  const icoBuffer = new ArrayBuffer(22 + pngBytes.length);
  const view = new DataView(icoBuffer);

  // ICONDIR header (6 bytes)
  view.setUint16(0, 0, true);
  view.setUint16(2, 1, true); // 1 = ICO
  view.setUint16(4, 1, true); // 1 image

  // ICONDIRENTRY (16 bytes)
  view.setUint8(6, 64);
  view.setUint8(7, 64);
  view.setUint8(8, 0);
  view.setUint8(9, 0);
  view.setUint16(10, 1, true);
  view.setUint16(12, 32, true);
  view.setUint32(14, pngBytes.length, true);
  view.setUint32(18, 22, true);

  new Uint8Array(icoBuffer, 22).set(pngBytes);
  return new Blob([icoBuffer], { type: 'image/x-icon' });
}

/**
 * Client-side HTML5 Canvas Converter for \`${slug}\` (convert.my.id).
 */
export async function ${fnName}(
  file: File,
  options: ImageConversionOptions = {}
): Promise<WebPConversionResult> {
  const startTime = performance.now();
  const quality = Math.min(1, Math.max(0.05, options.quality ?? ${defaultQuality}));
  const sourceDataUrl = await readFileAsDataUrl(file);
  const img = await decodeImage(sourceDataUrl);

  let width = img.naturalWidth || img.width || 800;
  let height = img.naturalHeight || img.height || 600;

  if (options.maxWidth && options.maxWidth > 0 && width > options.maxWidth) {
    const ratio = options.maxWidth / width;
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('HTML5 2D Canvas context unavailable.');
  }

  const bgFill = options.backgroundColor ?? ${opaqueBackground ? `'${opaqueBackground}'` : 'null'};
  if (bgFill) {
    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  const filterMode: string = '${filterMode}';
  if (filterMode === 'pixelate') {
    const blockSize = Math.max(4, Math.round(width / 48));
    const smallW = Math.max(1, Math.floor(width / blockSize));
    const smallH = Math.max(1, Math.floor(height / blockSize));
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = smallW;
    tempCanvas.height = smallH;
    const tctx = tempCanvas.getContext('2d');
    if (tctx) {
      tctx.drawImage(img, 0, 0, smallW, smallH);
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(tempCanvas, 0, 0, smallW, smallH, 0, 0, width, height);
    }
  } else {
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, 0, 0, width, height);
  }

  if (filterMode === 'grayscale' || filterMode === 'sepia' || filterMode === 'invert') {
    const imgData = ctx.getImageData(0, 0, width, height);
    const d = imgData.data;
    for (let i = 0; i < d.length; i += 4) {
      const r = d[i];
      const g = d[i + 1];
      const b = d[i + 2];
      if (filterMode === 'grayscale') {
        const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
        d[i] = lum;
        d[i + 1] = lum;
        d[i + 2] = lum;
      } else if (filterMode === 'sepia') {
        d[i] = Math.min(255, Math.round(0.393 * r + 0.769 * g + 0.189 * b));
        d[i + 1] = Math.min(255, Math.round(0.349 * r + 0.686 * g + 0.168 * b));
        d[i + 2] = Math.min(255, Math.round(0.272 * r + 0.534 * g + 0.131 * b));
      } else if (filterMode === 'invert') {
        d[i] = 255 - r;
        d[i + 1] = 255 - g;
        d[i + 2] = 255 - b;
      }
    }
    ctx.putImageData(imgData, 0, 0);
  }

  let textOutput: string | undefined;
  if (filterMode === 'ascii') {
    const chars = '@%#*+=-:. ';
    const cols = 72;
    const rows = Math.max(12, Math.round((height / width) * cols * 0.5));
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = cols;
    sampleCanvas.height = rows;
    const sctx = sampleCanvas.getContext('2d');
    if (sctx) {
      sctx.drawImage(canvas, 0, 0, cols, rows);
      const data = sctx.getImageData(0, 0, cols, rows).data;
      const lines: string[] = [];
      for (let y = 0; y < rows; y++) {
        let rowStr = '';
        for (let x = 0; x < cols; x++) {
          const idx = (y * cols + x) * 4;
          const lum = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
          const charIdx = Math.min(chars.length - 1, Math.floor((lum / 255) * (chars.length - 1)));
          rowStr += chars[charIdx];
        }
        lines.push(rowStr);
      }
      textOutput = lines.join('\\n');
    }
  } else if (filterMode === 'palette') {
    const sampleCanvas = document.createElement('canvas');
    sampleCanvas.width = 48;
    sampleCanvas.height = 48;
    const sctx = sampleCanvas.getContext('2d');
    if (sctx) {
      sctx.drawImage(canvas, 0, 0, 48, 48);
      const data = sctx.getImageData(0, 0, 48, 48).data;
      const buckets = new Map<string, number>();
      for (let i = 0; i < data.length; i += 4) {
        if (data[i + 3] < 128) continue;
        const qr = Math.round(data[i] / 32) * 32;
        const qg = Math.round(data[i + 1] / 32) * 32;
        const qb = Math.round(data[i + 2] / 32) * 32;
        const hex =
          '#' +
          [qr, qg, qb]
            .map((v) => Math.min(255, v).toString(16).padStart(2, '0'))
            .join('');
        buckets.set(hex, (buckets.get(hex) ?? 0) + 1);
      }
      const topColors = Array.from(buckets.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([hex, count], i) => \`--palette-color-\${i + 1}: \${hex}; /* Weight: \${count} */\`);
      textOutput = \`:root {\\n  \${topColors.join('\\n  ')}\\n}\`;
    }
  }

  let outputBlob: Blob;
  if (filterMode === 'bmp') {
    const rawData = ctx.getImageData(0, 0, width, height);
    outputBlob = encodeUncompressedBmp(rawData);
  } else if (filterMode === 'ico') {
    outputBlob = await encodePngIcoContainer(canvas);
  } else {
    outputBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) => (b ? resolve(b) : reject(new Error('Canvas encoding failed.'))),
        '${mimeType}',
        quality
      );
    });
  }

  const dataUrl = canvas.toDataURL('${mimeType}', quality);
  if (filterMode === 'base64') {
    textOutput = dataUrl;
  }

  const objectUrl = URL.createObjectURL(outputBlob);
  const originalBytes = file.size;
  const webpBytes = outputBlob.size;
  const compressionRatioPercent =
    originalBytes > 0
      ? Number((((originalBytes - webpBytes) / originalBytes) * 100).toFixed(1))
      : 0;

  return {
    blob: outputBlob,
    objectUrl,
    dataUrl,
    width,
    height,
    originalBytes,
    webpBytes,
    compressionRatioPercent,
    executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
    outputExtension: '${extension}',
    outputMimeType: '${mimeType}',
    textOutput,
  };
}
`;
}

// ============================================================================
// COMPLETE DEFINITIONS FOR ALL 100 TOOLS (4 CATEGORIES × 25 TOOLS = 100)
// ============================================================================

const TOOLS_SPEC = [
  // ==========================================================================
  // CATEGORY 1: Code & Dev (25 Tools)
  // ==========================================================================
  {
    slug: 'json-to-typescript',
    category: 'Code & Dev',
    h1: 'JSON to TypeScript Interface Converter',
    shortDesc: 'Transform nested JSON payloads and REST API responses into strict TypeScript interfaces locally.',
    outputExtension: 'ts',
    outputMimeType: 'text/typescript',
    sampleInput: '{\n  "id": 101,\n  "site": "convert.my.id",\n  "clientSide": true,\n  "tags": ["seo", "typescript"],\n  "metrics": { "latencyMs": 1.2 }\n}',
    sourceCode: `import type { TextConversionOptions } from '@/types/converter';

function isValidId(key: string): boolean {
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(key);
}

function toPascal(str: string): string {
  const clean = str.replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  return clean ? (/^[0-9]/.test(clean) ? 'I' + clean : clean) : 'GeneratedItem';
}

export function convertJsonToTypescript(input: string, options: TextConversionOptions = {}): string {
  const trimmed = input.trim();
  if (!trimmed) return '// Paste JSON to generate TypeScript interfaces';
  const parsed: unknown = JSON.parse(trimmed);
  const rootName = toPascal(options.rootInterfaceName || 'RootInterface');
  const exportKw = options.exportInterfaces !== false ? 'export ' : '';
  const optFlag = options.optionalFields ? '?' : '';
  const interfaces = new Map<string, string>();
  const used = new Set<string>();

  function uniqueName(hint: string): string {
    const base = toPascal(hint);
    if (!used.has(base)) { used.add(base); return base; }
    let i = 2;
    while (used.has(base + i)) i++;
    used.add(base + i);
    return base + i;
  }

  function infer(val: unknown, hint: string): string {
    if (val === null) return 'null';
    if (Array.isArray(val)) {
      if (val.length === 0) return 'unknown[]';
      const types = Array.from(new Set(val.map((item) => infer(item, hint.replace(/s$/, '') || 'Item'))));
      return types.length === 1 ? \`\${types[0]}[]\` : \`(\${types.join(' | ')})[]\`;
    }
    if (typeof val === 'object') {
      const obj = val as Record<string, unknown>;
      if (Object.keys(obj).length === 0) return 'Record<string, unknown>';
      const name = uniqueName(hint);
      build(obj, name);
      return name;
    }
    return typeof val;
  }

  function build(obj: Record<string, unknown>, name: string): void {
    const lines = [\`\${exportKw}interface \${name} {\`];
    for (const [k, v] of Object.entries(obj)) {
      const prop = isValidId(k) ? k : \`'\${k.replace(/'/g, "\\\\'")}'\`;
      lines.push(\`  \${prop}\${optFlag}: \${infer(v, k)};\`);
    }
    lines.push('}');
    interfaces.set(name, lines.join('\\n'));
  }

  if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
    used.add(rootName);
    build(parsed as Record<string, unknown>, rootName);
  } else {
    interfaces.set(rootName, \`\${exportKw}type \${rootName} = \${infer(parsed, rootName)};\`);
  }

  return Array.from(interfaces.values()).join('\\n\\n');
}
`,
  },
  {
    slug: 'typescript-to-javascript',
    category: 'Code & Dev',
    h1: 'TypeScript to JavaScript Transpiler',
    shortDesc: 'Strip TypeScript interfaces, type aliases, generics, and type annotations into clean ESNext JavaScript.',
    outputExtension: 'js',
    outputMimeType: 'text/javascript',
    sampleInput: 'export interface User {\n  id: number;\n  name: string;\n}\n\nexport function greet(user: User, prefix: string = "Hello"): string {\n  const message: string = `${prefix}, ${user.name}!`;\n  return message;\n}',
    sourceCode: `export function convertTypescriptToJavascript(input: string): string {
  if (!input.trim()) return '';
  let out = input;
  // Remove interface and type alias blocks
  out = out.replace(/^\\s*(?:export\\s+)?interface\\s+[A-Za-z0-9_$<>\\s,]+\\{[\\s\\S]*?^\\}/gm, '');
  out = out.replace(/^\\s*(?:export\\s+)?type\\s+[A-Za-z0-9_$<>]+\\s*=[^;]+;/gm, '');
  // Remove import type statements
  out = out.replace(/^\\s*import\\s+type\\s+[^;]+;\\s*$/gm, '');
  // Remove access modifiers and readonly
  out = out.replace(/\\b(public|private|protected|readonly)\\s+/g, '');
  // Remove generic type parameters on functions
  out = out.replace(/function(\\s+[A-Za-z0-9_$]+)\\s*<[^>]+>\\s*\\(/g, 'function$1(');
  // Remove return type annotations before { or =>
  out = out.replace(/\\)\\s*:\\s*[A-Za-z0-9_$<>\\[\\]|&\\s]+(?=\\s*(?:\\{|=>))/g, ')');
  // Remove variable and parameter type annotations
  out = out.replace(/([A-Za-z0-9_$?]+)\\s*:\\s*[A-Za-z0-9_$<>\\[\\]|&]+(?=\\s*[,)=;])/g, (_m, id) => id.replace(/\\?$/, ''));
  // Remove "as Type" assertions
  out = out.replace(/\\s+as\\s+[A-Za-z0-9_$<>\\[\\]|&]+/g, '');
  return out.replace(/\\n{3,}/g, '\\n\\n').trim();
}
`,
  },
  {
    slug: 'yaml-to-json',
    category: 'Code & Dev',
    h1: 'YAML to JSON Converter',
    shortDesc: 'Parse YAML configuration files and Kubernetes manifests into formatted JSON objects in your browser.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: 'site: convert.my.id\nmode: static-export\nport: 3000\nprivacyFirst: true\nfeatures:\n  - client-side\n  - zero-server-load\n  - programmatic-seo',
    sourceCode: `function parseScalar(val: string): unknown {
  const s = val.trim();
  if (s === 'true') return true;
  if (s === 'false') return false;
  if (s === 'null' || s === '~') return null;
  if (/^-?\\d+(\\.\\d+)?$/.test(s)) return Number(s);
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

export function convertYamlToJson(input: string): string {
  if (!input.trim()) return '';
  const lines = input.replace(/\\r\\n/g, '\\n').split('\\n');
  const root: Record<string, unknown> = {};
  let currentKey: string | null = null;
  let currentObj: Record<string, unknown> | null = null;

  for (const rawLine of lines) {
    const cleaned = rawLine.replace(/\\s+#.*$/, '');
    if (!cleaned.trim() || cleaned.trim() === '---') continue;
    const indent = cleaned.search(/\\S/);
    const trimmed = cleaned.trim();

    if (trimmed.startsWith('- ')) {
      const itemVal = parseScalar(trimmed.slice(2));
      if (currentKey) {
        if (!Array.isArray(root[currentKey])) root[currentKey] = [];
        (root[currentKey] as unknown[]).push(itemVal);
      }
      continue;
    }

    const colonIdx = trimmed.indexOf(':');
    if (colonIdx !== -1) {
      const key = trimmed.slice(0, colonIdx).trim();
      const rest = trimmed.slice(colonIdx + 1).trim();
      if (indent === 0) {
        currentKey = key;
        currentObj = null;
        root[key] = rest === '' ? {} : parseScalar(rest);
      } else if (currentKey) {
        if (typeof root[currentKey] !== 'object' || root[currentKey] === null || Array.isArray(root[currentKey])) {
          root[currentKey] = {};
        }
        currentObj = root[currentKey] as Record<string, unknown>;
        currentObj[key] = rest === '' ? null : parseScalar(rest);
      }
    }
  }
  return JSON.stringify(root, null, 2);
}
`,
  },
  {
    slug: 'json-to-yaml',
    category: 'Code & Dev',
    h1: 'JSON to YAML Converter',
    shortDesc: 'Serialize JSON objects and arrays into clean, human-readable YAML syntax instantaneously.',
    outputExtension: 'yaml',
    outputMimeType: 'text/yaml',
    sampleInput: '{\n  "service": "convert.my.id",\n  "runtime": "cloudflare-pages",\n  "replicas": 1,\n  "regions": ["sin", "iad", "fra"]\n}',
    sourceCode: `function toYaml(value: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (value === null || value === undefined) return 'null';
  if (typeof value === 'boolean' || typeof value === 'number') return String(value);
  if (typeof value === 'string') {
    return /[:#\\n]|^\\s|\\s$/.test(value) ? JSON.stringify(value) : value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return '[]';
    return value
      .map((item) => {
        if (typeof item === 'object' && item !== null) {
          const nested = toYaml(item, indent + 1).trimStart();
          return \`\${pad}- \${nested}\`;
        }
        return \`\${pad}- \${toYaml(item, indent + 1)}\`;
      })
      .join('\\n');
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length === 0) return '{}';
    return entries
      .map(([k, v]) => {
        if (typeof v === 'object' && v !== null) {
          return \`\${pad}\${k}:\\n\${toYaml(v, indent + 1)}\`;
        }
        return \`\${pad}\${k}: \${toYaml(v, indent)}\`;
      })
      .join('\\n');
  }
  return String(value);
}

export function convertJsonToYaml(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  return toYaml(parsed, 0);
}
`,
  },
  {
    slug: 'xml-to-json',
    category: 'Code & Dev',
    h1: 'XML to JSON Converter',
    shortDesc: 'Parse XML documents and RSS/SOAP payloads into structured JSON trees using the browser DOMParser API.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: '<platform id="1" domain="convert.my.id">\n  <philosophy>100% Client-Side</philosophy>\n  <tools count="100">\n    <category>Code &amp; Dev</category>\n    <category>Image &amp; Media</category>\n  </tools>\n</platform>',
    sourceCode: `function xmlNodeToJson(node: Element): unknown {
  const obj: Record<string, unknown> = {};
  if (node.attributes && node.attributes.length > 0) {
    const attrs: Record<string, string> = {};
    for (let i = 0; i < node.attributes.length; i++) {
      const attr = node.attributes[i];
      attrs[attr.name] = attr.value;
    }
    obj['@attributes'] = attrs;
  }

  const children = Array.from(node.children);
  if (children.length === 0) {
    const text = (node.textContent ?? '').trim();
    if (Object.keys(obj).length === 0) return text;
    if (text) obj['#text'] = text;
    return obj;
  }

  for (const child of children) {
    const key = child.tagName;
    const val = xmlNodeToJson(child);
    if (key in obj) {
      if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
      (obj[key] as unknown[]).push(val);
    } else {
      obj[key] = val;
    }
  }
  return obj;
}

export function convertXmlToJson(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  if (typeof DOMParser === 'undefined') {
    return JSON.stringify({ error: 'DOMParser requires browser environment' });
  }
  const parser = new DOMParser();
  const doc = parser.parseFromString(trimmed, 'application/xml');
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Invalid XML syntax: ' + (parserError.textContent ?? 'Parse error'));
  }
  const root = doc.documentElement;
  return JSON.stringify({ [root.tagName]: xmlNodeToJson(root) }, null, 2);
}
`,
  },
  {
    slug: 'json-to-xml',
    category: 'Code & Dev',
    h1: 'JSON to XML Converter',
    shortDesc: 'Convert structured JSON objects and arrays into well-formed, indented XML documents locally.',
    outputExtension: 'xml',
    outputMimeType: 'application/xml',
    sampleInput: '{\n  "platform": {\n    "domain": "convert.my.id",\n    "clientSide": true,\n    "categories": ["Code & Dev", "Image & Media", "CSS & Unit", "Text & Data"]\n  }\n}',
    sourceCode: `function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function toXmlNodes(val: unknown, tagName: string, indent = 0): string {
  const pad = '  '.repeat(indent);
  const safeTag = tagName.replace(/[^A-Za-z0-9_.-]/g, '_') || 'item';
  if (val === null || val === undefined) return \`\${pad}<\${safeTag} />\`;
  if (typeof val !== 'object') {
    return \`\${pad}<\${safeTag}>\${escapeXml(String(val))}</\${safeTag}>\`;
  }
  if (Array.isArray(val)) {
    return val.map((item) => toXmlNodes(item, safeTag, indent)).join('\\n');
  }
  const entries = Object.entries(val as Record<string, unknown>);
  const children = entries.map(([k, v]) => toXmlNodes(v, k, indent + 1)).join('\\n');
  return \`\${pad}<\${safeTag}>\\n\${children}\\n\${pad}</\${safeTag}>\`;
}

export function convertJsonToXml(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  const body =
    typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) && Object.keys(parsed).length === 1
      ? Object.entries(parsed as Record<string, unknown>).map(([k, v]) => toXmlNodes(v, k, 0)).join('\\n')
      : toXmlNodes(parsed, 'root', 0);
  return \`<?xml version="1.0" encoding="UTF-8"?>\\n\${body}\`;
}
`,
  },
  {
    slug: 'json-to-zod',
    category: 'Code & Dev',
    h1: 'JSON to Zod Schema Generator',
    shortDesc: 'Generate runtime TypeScript Zod validation schemas (`z.object()`) directly from sample JSON payloads.',
    outputExtension: 'ts',
    outputMimeType: 'text/typescript',
    sampleInput: '{\n  "id": "usr_01",\n  "email": "dev@convert.my.id",\n  "age": 28,\n  "active": true,\n  "roles": ["admin", "editor"]\n}',
    sourceCode: `function inferZod(val: unknown, indent = 0): string {
  const pad = '  '.repeat(indent);
  if (val === null) return 'z.null()';
  if (typeof val === 'string') {
    if (/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(val)) return 'z.string().email()';
    if (/^https?:\\/\\//.test(val)) return 'z.string().url()';
    return 'z.string()';
  }
  if (typeof val === 'number') return Number.isInteger(val) ? 'z.number().int()' : 'z.number()';
  if (typeof val === 'boolean') return 'z.boolean()';
  if (Array.isArray(val)) {
    if (val.length === 0) return 'z.array(z.unknown())';
    return \`z.array(\${inferZod(val[0], indent)})\`;
  }
  if (typeof val === 'object') {
    const entries = Object.entries(val as Record<string, unknown>);
    if (entries.length === 0) return 'z.record(z.string(), z.unknown())';
    const lines = entries.map(([k, v]) => \`\${pad}  \${/^[A-Za-z_$][A-Za-z0-9_$]*$/.test(k) ? k : JSON.stringify(k)}: \${inferZod(v, indent + 1)},\`);
    return \`z.object({\\n\${lines.join('\\n')}\\n\${pad}})\`;
  }
  return 'z.unknown()';
}

export function convertJsonToZod(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  return \`import { z } from 'zod';\\n\\nexport const schema = \${inferZod(parsed, 0)};\\n\\nexport type SchemaInput = z.infer<typeof schema>;\`;
}
`,
  },
  {
    slug: 'json-to-graphql',
    category: 'Code & Dev',
    h1: 'JSON to GraphQL Schema Generator',
    shortDesc: 'Convert JSON API responses into GraphQL SDL `type` definitions with automatic scalar inference.',
    outputExtension: 'graphql',
    outputMimeType: 'text/plain',
    sampleInput: '{\n  "id": "gql_99",\n  "title": "convert.my.id",\n  "views": 42000,\n  "rating": 4.95,\n  "published": true,\n  "author": { "username": "asfa", "verified": true }\n}',
    sourceCode: `function toPascal(s: string): string {
  return s.replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('') || 'RootType';
}

export function convertJsonToGraphql(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  const blocks: string[] = [];

  function resolveScalar(key: string, val: unknown): string {
    if (val === null || val === undefined) return 'String';
    if (typeof val === 'boolean') return 'Boolean!';
    if (typeof val === 'number') return Number.isInteger(val) ? 'Int!' : 'Float!';
    if (typeof val === 'string') return key.toLowerCase() === 'id' ? 'ID!' : 'String!';
    if (Array.isArray(val)) {
      if (val.length === 0) return '[String]!';
      return \`[\${resolveScalar(key, val[0]).replace(/!$/, '')}!]!\`;
    }
    if (typeof val === 'object') {
      const childName = toPascal(key);
      buildType(childName, val as Record<string, unknown>);
      return \`\${childName}!\`;
    }
    return 'String';
  }

  function buildType(typeName: string, obj: Record<string, unknown>): void {
    const fields = Object.entries(obj).map(([k, v]) => \`  \${k.replace(/[^A-Za-z0-9_]/g, '_')}: \${resolveScalar(k, v)}\`);
    blocks.push(\`type \${typeName} {\\n\${fields.join('\\n')}\\n}\`);
  }

  const rootObj = Array.isArray(parsed) ? (parsed[0] as Record<string, unknown>) ?? {} : (parsed as Record<string, unknown>);
  buildType('RootType', rootObj);
  return blocks.reverse().join('\\n\\n');
}
`,
  },
  {
    slug: 'json-to-go-struct',
    category: 'Code & Dev',
    h1: 'JSON to Go Struct Converter',
    shortDesc: 'Generate idiomatic Golang `type struct` definitions with `json:"..."` struct tags from any JSON object.',
    outputExtension: 'go',
    outputMimeType: 'text/plain',
    sampleInput: '{\n  "user_id": 42,\n  "domain_name": "convert.my.id",\n  "is_active": true,\n  "latency_ms": 0.85,\n  "tags": ["go", "wasm", "edge"]\n}',
    sourceCode: `function toGoPascal(str: string): string {
  const special = new Set(['id', 'url', 'api', 'ip', 'http', 'https', 'json', 'xml', 'sql']);
  return str
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\\s+/)
    .map((w) => (special.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join('') || 'Field';
}

function inferGoType(val: unknown): string {
  if (val === null || val === undefined) return 'interface{}';
  if (typeof val === 'boolean') return 'bool';
  if (typeof val === 'number') return Number.isInteger(val) ? 'int64' : 'float64';
  if (typeof val === 'string') return 'string';
  if (Array.isArray(val)) {
    return val.length > 0 ? \`[]\${inferGoType(val[0])}\` : '[]interface{}';
  }
  if (typeof val === 'object') {
    const fields = Object.entries(val as Record<string, unknown>)
      .map(([k, v]) => \`\\t\${toGoPascal(k)} \${inferGoType(v)} \\\`json:"\${k}"\\\`\`)
      .join('\\n');
    return \`struct {\\n\${fields}\\n}\`;
  }
  return 'interface{}';
}

export function convertJsonToGoStruct(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  return \`package main\\n\\ntype AutoGenerated \${inferGoType(parsed)}\`;
}
`,
  },
  {
    slug: 'json-to-rust-struct',
    category: 'Code & Dev',
    h1: 'JSON to Rust Serde Struct Generator',
    shortDesc: 'Create strongly-typed Rust structs with `#[derive(Serialize, Deserialize)]` attributes from JSON.',
    outputExtension: 'rs',
    outputMimeType: 'text/plain',
    sampleInput: '{\n  "projectId": 100,\n  "hostName": "convert.my.id",\n  "edgeEnabled": true,\n  "score": 99.9,\n  "keywords": ["rust", "serde"]\n}',
    sourceCode: `function toSnake(s: string): string {
  return s.replace(/([a-z0-9])([A-Z])/g, '$1_$2').replace(/[^A-Za-z0-9]+/g, '_').toLowerCase();
}
function toPascal(s: string): string {
  return s.replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('') || 'Item';
}

export function convertJsonToRustStruct(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  const structs: string[] = [];

  function inferRust(key: string, val: unknown): string {
    if (val === null || val === undefined) return 'Option<serde_json::Value>';
    if (typeof val === 'boolean') return 'bool';
    if (typeof val === 'number') return Number.isInteger(val) ? 'i64' : 'f64';
    if (typeof val === 'string') return 'String';
    if (Array.isArray(val)) return val.length ? \`Vec<\${inferRust(key, val[0])}>\` : 'Vec<serde_json::Value>';
    if (typeof val === 'object') {
      const child = toPascal(key);
      buildStruct(child, val as Record<string, unknown>);
      return child;
    }
    return 'serde_json::Value';
  }

  function buildStruct(name: string, obj: Record<string, unknown>): void {
    const lines = ['#[derive(Debug, Clone, Serialize, Deserialize)]', \`pub struct \${name} {\`];
    for (const [k, v] of Object.entries(obj)) {
      const snake = toSnake(k);
      if (snake !== k) lines.push(\`    #[serde(rename = "\${k}")]\`);
      lines.push(\`    pub \${snake}: \${inferRust(k, v)},\`);
    }
    lines.push('}');
    structs.push(lines.join('\\n'));
  }

  const root = (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : { data: parsed }) as Record<string, unknown>;
  buildStruct('RootStruct', root);
  return \`use serde::{Deserialize, Serialize};\\n\\n\${structs.reverse().join('\\n\\n')}\`;
}
`,
  },
  {
    slug: 'json-to-python-dataclass',
    category: 'Code & Dev',
    h1: 'JSON to Python Dataclass Converter',
    shortDesc: 'Transform JSON objects into Python 3 `@dataclass` classes with `typing` annotations.',
    outputExtension: 'py',
    outputMimeType: 'text/x-python',
    sampleInput: '{\n  "id": 1,\n  "domain": "convert.my.id",\n  "is_private": true,\n  "NestedConfig": { "timeout_sec": 30 }\n}',
    sourceCode: `function toPascal(s: string): string {
  return s.replace(/[^A-Za-z0-9]+/g, ' ').trim().split(/\\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('') || 'Item';
}

export function convertJsonToPythonDataclass(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  const classes: string[] = [];

  function inferPy(key: string, val: unknown): string {
    if (val === null || val === undefined) return 'Optional[Any]';
    if (typeof val === 'boolean') return 'bool';
    if (typeof val === 'number') return Number.isInteger(val) ? 'int' : 'float';
    if (typeof val === 'string') return 'str';
    if (Array.isArray(val)) return val.length ? \`List[\${inferPy(key, val[0])}]\` : 'List[Any]';
    if (typeof val === 'object') {
      const clsName = toPascal(key);
      buildClass(clsName, val as Record<string, unknown>);
      return clsName;
    }
    return 'Any';
  }

  function buildClass(name: string, obj: Record<string, unknown>): void {
    const entries = Object.entries(obj);
    const lines = ['@dataclass', \`class \${name}:\`];
    if (entries.length === 0) {
      lines.push('    pass');
    } else {
      for (const [k, v] of entries) {
        const safeKey = k.replace(/[^A-Za-z0-9_]/g, '_');
        lines.push(\`    \${safeKey}: \${inferPy(k, v)}\`);
      }
    }
    classes.push(lines.join('\\n'));
  }

  const root = (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed) ? parsed : { items: parsed }) as Record<string, unknown>;
  buildClass('RootModel', root);
  return \`from dataclasses import dataclass\\nfrom typing import Any, List, Optional\\n\\n\\n\${classes.join('\\n\\n\\n')}\`;
}
`,
  },
  {
    slug: 'json-to-sql-table',
    category: 'Code & Dev',
    h1: 'JSON to SQL Table & INSERT Generator',
    shortDesc: 'Convert a JSON object or array of objects into SQL `CREATE TABLE` DDL and `INSERT INTO` statements.',
    outputExtension: 'sql',
    outputMimeType: 'application/sql',
    sampleInput: '[\n  { "id": 1, "slug": "json-to-typescript", "category": "Code & Dev", "active": true },\n  { "id": 2, "slug": "px-to-rem", "category": "CSS & Unit", "active": true }\n]',
    sourceCode: `function inferSqlType(val: unknown): string {
  if (typeof val === 'boolean') return 'BOOLEAN';
  if (typeof val === 'number') return Number.isInteger(val) ? 'BIGINT' : 'DECIMAL(18, 4)';
  if (typeof val === 'object' && val !== null) return 'JSONB';
  return 'VARCHAR(255)';
}

function formatSqlVal(val: unknown): string {
  if (val === null || val === undefined) return 'NULL';
  if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
  if (typeof val === 'number') return String(val);
  if (typeof val === 'object') return \`'\${JSON.stringify(val).replace(/'/g, "''")}'\`;
  return \`'\${String(val).replace(/'/g, "''")}'\`;
}

export function convertJsonToSqlTable(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  const rows = (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
  if (rows.length === 0 || typeof rows[0] !== 'object' || rows[0] === null) {
    return '-- Provide a JSON object or array of objects';
  }
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const colDefs = cols.map((c) => {
    const sample = rows.find((r) => r[c] !== null && r[c] !== undefined)?.[c];
    const pk = c.toLowerCase() === 'id' ? ' PRIMARY KEY' : '';
    return \`  \${c} \${inferSqlType(sample)}\${pk}\`;
  });

  const ddl = \`CREATE TABLE exported_records (\\n\${colDefs.join(',\\n')}\\n);\`;
  const inserts = rows.map((r) => {
    const vals = cols.map((c) => formatSqlVal(r[c])).join(', ');
    return \`INSERT INTO exported_records (\${cols.join(', ')}) VALUES (\${vals});\`;
  });

  return \`\${ddl}\\n\\n\${inserts.join('\\n')}\`;
}
`,
  },
  {
    slug: 'sql-to-json',
    category: 'Code & Dev',
    h1: 'SQL INSERT to JSON Converter',
    shortDesc: 'Parse SQL `INSERT INTO` statements and extract column-value rows into a structured JSON array.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: "INSERT INTO tools (id, slug, domain, active) VALUES (1, 'json-to-typescript', 'convert.my.id', true);\nINSERT INTO tools (id, slug, domain, active) VALUES (2, 'px-to-rem', 'convert.my.id', true);",
    sourceCode: `function splitSqlValues(raw: string): unknown[] {
  const result: unknown[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch === "'" && raw[i - 1] !== '\\\\') {
      inQuotes = !inQuotes;
      current += ch;
    } else if (ch === ',' && !inQuotes) {
      result.push(parseSqlToken(current.trim()));
      current = '';
    } else {
      current += ch;
    }
  }
  if (current.trim()) result.push(parseSqlToken(current.trim()));
  return result;
}

function parseSqlToken(tok: string): unknown {
  if (/^null$/i.test(tok)) return null;
  if (/^true$/i.test(tok)) return true;
  if (/^false$/i.test(tok)) return false;
  if (/^-?\\d+(\\.\\d+)?$/.test(tok)) return Number(tok);
  if (tok.startsWith("'") && tok.endsWith("'")) return tok.slice(1, -1).replace(/''/g, "'");
  return tok;
}

export function convertSqlToJson(input: string): string {
  if (!input.trim()) return '';
  const regex = /INSERT\\s+INTO\\s+[\\w."\`\\[\\]]+\\s*\\(([^)]+)\\)\\s*VALUES\\s*\\(([^)]+)\\)/gi;
  const output: Record<string, unknown>[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(input)) !== null) {
    const cols = match[1].split(',').map((c) => c.trim().replace(/^["\`\\[]|["\`\\]]$/g, ''));
    const vals = splitSqlValues(match[2]);
    const row: Record<string, unknown> = {};
    cols.forEach((col, idx) => {
      row[col] = vals[idx] ?? null;
    });
    output.push(row);
  }
  return JSON.stringify(output, null, 2);
}
`,
  },
  {
    slug: 'html-to-jsx',
    category: 'Code & Dev',
    h1: 'HTML to React JSX Converter',
    shortDesc: 'Convert raw HTML snippets into valid React JSX components (`className`, `htmlFor`, inline style objects, self-closing tags).',
    outputExtension: 'tsx',
    outputMimeType: 'text/typescript',
    sampleInput: '<!-- Card Snippet -->\n<div class="card-wrapper" style="padding: 16px; background-color: #0f172a;">\n  <label for="email-input" tabindex="1">Email Address</label>\n  <input id="email-input" type="email" placeholder="you@convert.my.id">\n  <br>\n</div>',
    sourceCode: `function cssStyleToJsxObject(styleStr: string): string {
  const props = styleStr
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((decl) => {
      const idx = decl.indexOf(':');
      if (idx === -1) return '';
      const prop = decl
        .slice(0, idx)
        .trim()
        .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
      const val = decl.slice(idx + 1).trim();
      const formattedVal = /^-?\\d+(\\.\\d+)?$/.test(val) ? val : JSON.stringify(val);
      return \`\${prop}: \${formattedVal}\`;
    })
    .filter(Boolean);
  return \`{{ \${props.join(', ')} }}\`;
}

export function convertHtmlToJsx(input: string): string {
  if (!input.trim()) return '';
  let jsx = input;
  // Convert HTML comments to JSX comments
  jsx = jsx.replace(/<!--[\\s\\S]*?-->/g, (m) => \`{/* \${m.slice(4, -3).trim()} */}\`);
  // Convert attributes
  jsx = jsx.replace(/\\bclass=/g, 'className=');
  jsx = jsx.replace(/\\bfor=/g, 'htmlFor=');
  jsx = jsx.replace(/\\btabindex=/gi, 'tabIndex=');
  jsx = jsx.replace(/\\breadonly\\b/gi, 'readOnly');
  jsx = jsx.replace(/\\bmaxlength=/gi, 'maxLength=');
  jsx = jsx.replace(/\\bautocomplete=/gi, 'autoComplete=');
  jsx = jsx.replace(/\\bautofocus\\b/gi, 'autoFocus');
  // Convert inline style="..."
  jsx = jsx.replace(/style="([^"]*)"/g, (_, s: string) => \`style=\${cssStyleToJsxObject(s)}\`);
  // Self-close void HTML elements
  jsx = jsx.replace(/<(area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)([^>]*?)(?<!\\/)>/gi, '<$1$2 />');
  return jsx;
}
`,
  },
  {
    slug: 'jsx-to-html',
    category: 'Code & Dev',
    h1: 'React JSX to HTML Converter',
    shortDesc: 'Transform React JSX markup (`className`, `htmlFor`, JSX comments, style objects) back into standard HTML5.',
    outputExtension: 'html',
    outputMimeType: 'text/html',
    sampleInput: '{/* Main Container */}\n<section className="hero-box" htmlFor="target" tabIndex={0}>\n  <h1>convert.my.id</h1>\n  <input type="text" readOnly />\n</section>',
    sourceCode: `export function convertJsxToHtml(input: string): string {
  if (!input.trim()) return '';
  let html = input;
  html = html.replace(/\\{\\/\\*([\\s\\S]*?)\\*\\/\\}/g, '<!--$1-->');
  html = html.replace(/\\bclassName=/g, 'class=');
  html = html.replace(/\\bhtmlFor=/g, 'for=');
  html = html.replace(/\\btabIndex=\\{(\\d+)\\}/g, 'tabindex="$1"');
  html = html.replace(/\\breadOnly\\b/g, 'readonly');
  html = html.replace(/\\bautoFocus\\b/g, 'autofocus');
  html = html.replace(/\\bmaxLength=\\{(\\d+)\\}/g, 'maxlength="$1"');
  return html;
}
`,
  },
  {
    slug: 'curl-to-fetch',
    category: 'Code & Dev',
    h1: 'cURL to JavaScript Fetch Converter',
    shortDesc: 'Convert terminal `curl` commands (headers, methods, JSON payloads) into modern async JavaScript `fetch()` code.',
    outputExtension: 'js',
    outputMimeType: 'text/javascript',
    sampleInput: 'curl -X POST "https://convert.my.id/api/ping" \\\n  -H "Content-Type: application/json" \\\n  -H "Authorization: Bearer tok_live_123" \\\n  -d \'{"clientSide":true,"tools":100}\'',
    sourceCode: `export function convertCurlToFetch(input: string): string {
  if (!input.trim()) return '';
  const clean = input.replace(/\\\\\\r?\\n/g, ' ').trim();
  const urlMatch = clean.match(/['"]?(https?:\\/\\/[^\\s'"]+)['"]?/);
  const url = urlMatch ? urlMatch[1] : 'https://convert.my.id';

  const methodMatch = clean.match(/(?:-X|--request)\\s+([A-Z]+)/i);
  const dataMatch = clean.match(/(?:-d|--data|--data-raw|--data-binary)\\s+(['"])([\\s\\S]*?)\\1/);
  const method = methodMatch ? methodMatch[1].toUpperCase() : dataMatch ? 'POST' : 'GET';

  const headers: Record<string, string> = {};
  const headerRegex = /(?:-H|--header)\\s+(['"])([^'"]+)\\1/g;
  let hm: RegExpExecArray | null;
  while ((hm = headerRegex.exec(clean)) !== null) {
    const idx = hm[2].indexOf(':');
    if (idx !== -1) {
      headers[hm[2].slice(0, idx).trim()] = hm[2].slice(idx + 1).trim();
    }
  }

  const options: Record<string, unknown> = { method };
  if (Object.keys(headers).length > 0) options.headers = headers;
  if (dataMatch) options.body = dataMatch[2];

  return [
    \`const response = await fetch(\${JSON.stringify(url)}, \${JSON.stringify(options, null, 2)});\`,
    'const data = await response.json();',
    'console.log(data);',
  ].join('\\n');
}
`,
  },
  {
    slug: 'json-to-jsdoc',
    category: 'Code & Dev',
    h1: 'JSON to JSDoc Typedef Generator',
    shortDesc: 'Generate complete JSDoc `@typedef` and `@property` docblock comments from sample JSON objects.',
    outputExtension: 'js',
    outputMimeType: 'text/javascript',
    sampleInput: '{\n  "slug": "json-to-jsdoc",\n  "domain": "convert.my.id",\n  "clientSide": true,\n  "version": 1\n}',
    sourceCode: `export function convertJsonToJsdoc(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return '/** @typedef {any} RootPayload */';
  }
  const lines = ['/**', ' * @typedef {Object} RootPayload'];
  for (const [k, v] of Object.entries(parsed as Record<string, unknown>)) {
    const t = v === null ? 'null' : Array.isArray(v) ? 'Array<any>' : typeof v;
    lines.push(\` * @property {\${t}} \${k}\`);
  }
  lines.push(' */');
  return lines.join('\\n');
}
`,
  },
  {
    slug: 'json-to-json-schema',
    category: 'Code & Dev',
    h1: 'JSON to JSON Schema (Draft-07) Converter',
    shortDesc: 'Infer a compliant Draft-07 JSON Schema document (`type`, `properties`, `required`) from any JSON payload.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: '{\n  "id": "tool_18",\n  "domain": "convert.my.id",\n  "count": 100,\n  "enabled": true\n}',
    sourceCode: `function inferSchema(val: unknown): Record<string, unknown> {
  if (val === null) return { type: 'null' };
  if (Array.isArray(val)) {
    return {
      type: 'array',
      items: val.length > 0 ? inferSchema(val[0]) : {},
    };
  }
  if (typeof val === 'object') {
    const obj = val as Record<string, unknown>;
    const properties: Record<string, unknown> = {};
    const required = Object.keys(obj);
    for (const [k, v] of Object.entries(obj)) {
      properties[k] = inferSchema(v);
    }
    return { type: 'object', properties, required };
  }
  if (typeof val === 'number') {
    return { type: Number.isInteger(val) ? 'integer' : 'number' };
  }
  return { type: typeof val };
}

export function convertJsonToJsonSchema(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  const schema = {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'GeneratedSchema',
    ...inferSchema(parsed),
  };
  return JSON.stringify(schema, null, 2);
}
`,
  },
  {
    slug: 'env-to-json',
    category: 'Code & Dev',
    h1: '.env to JSON Converter',
    shortDesc: 'Convert `.env` environment variable files into structured JSON key-value configurations locally.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: '# Production Config\nNEXT_PUBLIC_SITE_URL="https://convert.my.id"\nSTATIC_EXPORT=true\nTOTAL_TOOLS=100',
    sourceCode: `export function convertEnvToJson(input: string): string {
  if (!input.trim()) return '';
  const result: Record<string, string | number | boolean> = {};
  for (const rawLine of input.split(/\\r?\\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim().replace(/^export\\s+/, '');
    let val = line.slice(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (val === 'true') result[key] = true;
    else if (val === 'false') result[key] = false;
    else if (/^-?\\d+(\\.\\d+)?$/.test(val)) result[key] = Number(val);
    else result[key] = val;
  }
  return JSON.stringify(result, null, 2);
}
`,
  },
  {
    slug: 'json-to-env',
    category: 'Code & Dev',
    h1: 'JSON to .env File Converter',
    shortDesc: 'Flatten JSON configuration objects into uppercase `KEY=VALUE` `.env` environment files.',
    outputExtension: 'env',
    outputMimeType: 'text/plain',
    sampleInput: '{\n  "siteUrl": "https://convert.my.id",\n  "environment": "production",\n  "database": {\n    "port": 5432,\n    "ssl": true\n  }\n}',
    sourceCode: `function flattenToEnv(obj: Record<string, unknown>, prefix = ''): string[] {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const envKey = (prefix ? \`\${prefix}_\${k}\` : k)
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[^A-Za-z0-9_]/g, '_')
      .toUpperCase();
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      lines.push(...flattenToEnv(v as Record<string, unknown>, envKey));
    } else {
      const strVal = typeof v === 'string' && /\\s|#|=/.test(v) ? JSON.stringify(v) : String(v);
      lines.push(\`\${envKey}=\${strVal}\`);
    }
  }
  return lines;
}

export function convertJsonToEnv(input: string): string {
  if (!input.trim()) return '';
  const parsed = JSON.parse(input) as Record<string, unknown>;
  return flattenToEnv(parsed).join('\\n');
}
`,
  },
  {
    slug: 'toml-to-json',
    category: 'Code & Dev',
    h1: 'TOML to JSON Converter',
    shortDesc: 'Parse TOML configuration files (`Cargo.toml`, `wrangler.toml`, `pyproject.toml`) into formatted JSON.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: 'name = "convert-my-id"\ncompatibility_date = "2026-10-26"\n\n[site]\nbucket = "./out"\nclient_side = true',
    sourceCode: `export function convertTomlToJson(input: string): string {
  if (!input.trim()) return '';
  const root: Record<string, unknown> = {};
  let activeSection: Record<string, unknown> = root;

  for (const rawLine of input.split(/\\r?\\n/)) {
    const line = rawLine.replace(/\\s+#.*$/, '').trim();
    if (!line || line.startsWith('#')) continue;
    const secMatch = line.match(/^\\[([^\\]]+)\\]$/);
    if (secMatch) {
      const parts = secMatch[1].split('.');
      let cursor = root;
      for (const p of parts) {
        if (typeof cursor[p] !== 'object' || cursor[p] === null) cursor[p] = {};
        cursor = cursor[p] as Record<string, unknown>;
      }
      activeSection = cursor;
      continue;
    }
    const eqIdx = line.indexOf('=');
    if (eqIdx !== -1) {
      const k = line.slice(0, eqIdx).trim();
      const rawV = line.slice(eqIdx + 1).trim();
      try {
        activeSection[k] = JSON.parse(rawV);
      } catch {
        activeSection[k] = rawV.replace(/^['"]|['"]$/g, '');
      }
    }
  }
  return JSON.stringify(root, null, 2);
}
`,
  },
  {
    slug: 'json-to-toml',
    category: 'Code & Dev',
    h1: 'JSON to TOML Converter',
    shortDesc: 'Serialize JSON configurations into clean TOML tables and key-value pairs for Rust and Cloudflare Wrangler.',
    outputExtension: 'toml',
    outputMimeType: 'text/plain',
    sampleInput: '{\n  "name": "convert.my.id",\n  "pages_build_output_dir": "out",\n  "vars": {\n    "NODE_VERSION": "22",\n    "ZERO_SERVER": true\n  }\n}',
    sourceCode: `export function convertJsonToToml(input: string): string {
  if (!input.trim()) return '';
  const parsed = JSON.parse(input) as Record<string, unknown>;
  const scalars: string[] = [];
  const tables: string[] = [];

  for (const [k, v] of Object.entries(parsed)) {
    if (typeof v === 'object' && v !== null && !Array.isArray(v)) {
      const secLines = [\`[\${k}]\`];
      for (const [sk, sv] of Object.entries(v as Record<string, unknown>)) {
        secLines.push(\`\${sk} = \${JSON.stringify(sv)}\`);
      }
      tables.push(secLines.join('\\n'));
    } else {
      scalars.push(\`\${k} = \${JSON.stringify(v)}\`);
    }
  }
  return [...scalars, ...tables].join('\\n\\n');
}
`,
  },
  {
    slug: 'javascript-to-json',
    category: 'Code & Dev',
    h1: 'JavaScript Object to JSON Converter',
    shortDesc: 'Normalize relaxed JavaScript object literals (unquoted keys, single quotes, trailing commas) into strict RFC 8259 JSON.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: '{\n  domain: \'convert.my.id\',\n  toolsCount: 100,\n  clientSide: true,\n  categories: [\'Code & Dev\', \'Image & Media\'],\n}',
    sourceCode: `export function convertJavascriptToJson(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  let s = trimmed.replace(/^const\\s+\\w+\\s*=\\s*/, '').replace(/;$/, '');
  // Remove single-line and multi-line comments
  s = s.replace(/\\/\\/.*$/gm, '').replace(/\\/\\*[\\s\\S]*?\\*\\//g, '');
  // Convert single-quoted strings to double-quoted strings
  s = s.replace(/'([^'\\\\]*(?:\\\\.[^'\\\\]*)*)'/g, (_, inner: string) => JSON.stringify(inner));
  // Quote unquoted object keys
  s = s.replace(/([{,]\\s*)([A-Za-z_$][A-Za-z0-9_$]*)\\s*:/g, '$1"$2":');
  // Strip trailing commas
  s = s.replace(/,\\s*([}\\]])/g, '$1');
  const parsed: unknown = JSON.parse(s);
  return JSON.stringify(parsed, null, 2);
}
`,
  },
  {
    slug: 'json-to-query-string',
    category: 'Code & Dev',
    h1: 'JSON to URL Query String Converter',
    shortDesc: 'Serialize JSON objects into URL-encoded query parameters using the native browser `URLSearchParams` API.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: '{\n  "domain": "convert.my.id",\n  "category": "Code & Dev",\n  "limit": 100,\n  "private": true\n}',
    sourceCode: `export function convertJsonToQueryString(input: string): string {
  if (!input.trim()) return '';
  const parsed = JSON.parse(input) as Record<string, unknown>;
  const params = new URLSearchParams();
  for (const [k, v] of Object.entries(parsed)) {
    if (v === undefined || v === null) continue;
    if (Array.isArray(v)) {
      v.forEach((item) => params.append(k, String(item)));
    } else if (typeof v === 'object') {
      params.append(k, JSON.stringify(v));
    } else {
      params.append(k, String(v));
    }
  }
  return params.toString();
}
`,
  },
  {
    slug: 'query-string-to-json',
    category: 'Code & Dev',
    h1: 'URL Query String to JSON Converter',
    shortDesc: 'Decode URL query strings (`?a=1&b=2`) into clean, typed JSON objects via native `URLSearchParams`.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: '?domain=convert.my.id&category=Code+%26+Dev&limit=100&private=true',
    sourceCode: `export function convertQueryStringToJson(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const queryPart = trimmed.includes('?') ? trimmed.slice(trimmed.indexOf('?') + 1) : trimmed;
  const params = new URLSearchParams(queryPart);
  const out: Record<string, unknown> = {};
  params.forEach((val, key) => {
    let parsedVal: unknown = val;
    if (val === 'true') parsedVal = true;
    else if (val === 'false') parsedVal = false;
    else if (/^-?\\d+(\\.\\d+)?$/.test(val)) parsedVal = Number(val);
    if (key in out) {
      if (!Array.isArray(out[key])) out[key] = [out[key]];
      (out[key] as unknown[]).push(parsedVal);
    } else {
      out[key] = parsedVal;
    }
  });
  return JSON.stringify(out, null, 2);
}
`,
  },

  // ==========================================================================
  // CATEGORY 2: Image & Media (25 Tools)
  // ==========================================================================
  {
    slug: 'image-to-webp',
    category: 'Image & Media',
    h1: 'Image to WebP Converter',
    shortDesc: 'Compress and convert PNG, JPG, GIF, and BMP images into next-gen WebP locally via HTML5 Canvas.',
    outputExtension: 'webp',
    outputMimeType: 'image/webp',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/webp', extension: 'webp', defaultQuality: 0.82 },
  },
  {
    slug: 'png-to-jpg',
    category: 'Image & Media',
    h1: 'PNG to JPG Converter',
    shortDesc: 'Convert transparent or lossless PNG images into compact JPEG files with white background compositing.',
    outputExtension: 'jpg',
    outputMimeType: 'image/jpeg',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/jpeg', extension: 'jpg', defaultQuality: 0.88, opaqueBackground: '#ffffff' },
  },
  {
    slug: 'jpg-to-png',
    category: 'Image & Media',
    h1: 'JPG to PNG Converter',
    shortDesc: 'Transcode JPEG photographs into lossless 32-bit PNG bitmaps directly inside your browser.',
    outputExtension: 'png',
    outputMimeType: 'image/png',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/png', extension: 'png', defaultQuality: 1.0 },
  },
  {
    slug: 'png-to-webp',
    category: 'Image & Media',
    h1: 'PNG to WebP Converter',
    shortDesc: 'Convert transparent PNG graphics into alpha-preserving WebP images for faster Core Web Vitals.',
    outputExtension: 'webp',
    outputMimeType: 'image/webp',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/webp', extension: 'webp', defaultQuality: 0.85 },
  },
  {
    slug: 'jpg-to-webp',
    category: 'Image & Media',
    h1: 'JPG to WebP Converter',
    shortDesc: 'Compress JPEG photos into ultra-lightweight WebP format locally without uploading files to any server.',
    outputExtension: 'webp',
    outputMimeType: 'image/webp',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/webp', extension: 'webp', defaultQuality: 0.82 },
  },
  {
    slug: 'webp-to-png',
    category: 'Image & Media',
    h1: 'WebP to PNG Converter',
    shortDesc: 'Decode WebP images back into universally compatible lossless PNG files in your browser.',
    outputExtension: 'png',
    outputMimeType: 'image/png',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/png', extension: 'png', defaultQuality: 1.0 },
  },
  {
    slug: 'webp-to-jpg',
    category: 'Image & Media',
    h1: 'WebP to JPG Converter',
    shortDesc: 'Convert WebP graphics into standard JPEG images for legacy software and print workflows.',
    outputExtension: 'jpg',
    outputMimeType: 'image/jpeg',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/jpeg', extension: 'jpg', defaultQuality: 0.9, opaqueBackground: '#ffffff' },
  },
  {
    slug: 'svg-to-png',
    category: 'Image & Media',
    h1: 'SVG to PNG Raster Converter',
    shortDesc: 'Rasterize scalable vector graphics (.svg) into crisp, transparent PNG images using HTML5 Canvas.',
    outputExtension: 'png',
    outputMimeType: 'image/png',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/png', extension: 'png', defaultQuality: 1.0 },
  },
  {
    slug: 'svg-to-webp',
    category: 'Image & Media',
    h1: 'SVG to WebP Converter',
    shortDesc: 'Render vector SVG artwork directly into compressed WebP bitmaps with full alpha transparency.',
    outputExtension: 'webp',
    outputMimeType: 'image/webp',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/webp', extension: 'webp', defaultQuality: 0.9 },
  },
  {
    slug: 'svg-to-jpg',
    category: 'Image & Media',
    h1: 'SVG to JPG Converter',
    shortDesc: 'Convert SVG vector files into high-resolution JPEG images with clean white background compositing.',
    outputExtension: 'jpg',
    outputMimeType: 'image/jpeg',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/jpeg', extension: 'jpg', defaultQuality: 0.92, opaqueBackground: '#ffffff' },
  },
  {
    slug: 'bmp-to-png',
    category: 'Image & Media',
    h1: 'BMP to PNG Converter',
    shortDesc: 'Compress raw uncompressed Windows Bitmap (.bmp) files into lightweight lossless PNG images.',
    outputExtension: 'png',
    outputMimeType: 'image/png',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/png', extension: 'png', defaultQuality: 1.0 },
  },
  {
    slug: 'bmp-to-jpg',
    category: 'Image & Media',
    h1: 'BMP to JPG Converter',
    shortDesc: 'Convert bulky BMP bitmap images into compact JPEG files locally in milliseconds.',
    outputExtension: 'jpg',
    outputMimeType: 'image/jpeg',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/jpeg', extension: 'jpg', defaultQuality: 0.88, opaqueBackground: '#ffffff' },
  },
  {
    slug: 'bmp-to-webp',
    category: 'Image & Media',
    h1: 'BMP to WebP Converter',
    shortDesc: 'Shrink uncompressed BMP files by up to 95% by encoding them into modern WebP format in-browser.',
    outputExtension: 'webp',
    outputMimeType: 'image/webp',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/webp', extension: 'webp', defaultQuality: 0.85 },
  },
  {
    slug: 'gif-to-png',
    category: 'Image & Media',
    h1: 'GIF to PNG Frame Converter',
    shortDesc: 'Extract and convert GIF images into lossless 32-bit PNG format using the HTML5 Canvas API.',
    outputExtension: 'png',
    outputMimeType: 'image/png',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/png', extension: 'png', defaultQuality: 1.0 },
  },
  {
    slug: 'gif-to-webp',
    category: 'Image & Media',
    h1: 'GIF to WebP Converter',
    shortDesc: 'Convert GIF graphics into ultra-optimized WebP images locally with zero cloud uploads.',
    outputExtension: 'webp',
    outputMimeType: 'image/webp',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/webp', extension: 'webp', defaultQuality: 0.85 },
  },
  {
    slug: 'image-to-base64',
    category: 'Image & Media',
    h1: 'Image to Base64 Data URI Converter',
    shortDesc: 'Encode any PNG, JPG, WebP, or SVG image file into an inline Base64 Data URI string for HTML and CSS.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/webp', extension: 'webp', defaultQuality: 0.85, filterMode: 'base64' },
  },
  {
    slug: 'image-to-bmp',
    category: 'Image & Media',
    h1: 'Image to 24-Bit BMP Converter',
    shortDesc: 'Encode PNG, JPG, or WebP images into raw uncompressed 24-bit Windows DIB `.bmp` binary files.',
    outputExtension: 'bmp',
    outputMimeType: 'image/bmp',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/bmp', extension: 'bmp', defaultQuality: 1.0, filterMode: 'bmp', opaqueBackground: '#ffffff' },
  },
  {
    slug: 'image-to-ico',
    category: 'Image & Media',
    h1: 'Image to Favicon ICO Converter',
    shortDesc: 'Generate a compliant 64×64 `.ico` website favicon binary container from any PNG, JPG, or SVG image.',
    outputExtension: 'ico',
    outputMimeType: 'image/x-icon',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/x-icon', extension: 'ico', defaultQuality: 1.0, filterMode: 'ico' },
  },
  {
    slug: 'image-to-grayscale',
    category: 'Image & Media',
    h1: 'Image to Grayscale Converter',
    shortDesc: 'Convert color images into balanced monochrome grayscale using Rec. 601 luminance pixel processing.',
    outputExtension: 'png',
    outputMimeType: 'image/png',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/png', extension: 'png', defaultQuality: 0.92, filterMode: 'grayscale' },
  },
  {
    slug: 'image-to-sepia',
    category: 'Image & Media',
    h1: 'Image to Sepia Tone Converter',
    shortDesc: 'Apply warm archival sepia color matrix transformation to any photo locally via Canvas `ImageData`.',
    outputExtension: 'jpg',
    outputMimeType: 'image/jpeg',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/jpeg', extension: 'jpg', defaultQuality: 0.9, filterMode: 'sepia', opaqueBackground: '#ffffff' },
  },
  {
    slug: 'image-to-inverted',
    category: 'Image & Media',
    h1: 'Image Color Inverter (Negative Filter)',
    shortDesc: 'Invert RGB channels (`255 - channel`) of any image to create a negative color effect in-browser.',
    outputExtension: 'png',
    outputMimeType: 'image/png',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/png', extension: 'png', defaultQuality: 0.92, filterMode: 'invert' },
  },
  {
    slug: 'image-to-pixel-art',
    category: 'Image & Media',
    h1: 'Image to Pixel Art Converter',
    shortDesc: 'Transform photos and illustrations into retro 8-bit pixel art using nearest-neighbor Canvas quantization.',
    outputExtension: 'png',
    outputMimeType: 'image/png',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/png', extension: 'png', defaultQuality: 1.0, filterMode: 'pixelate' },
  },
  {
    slug: 'image-to-ascii',
    category: 'Image & Media',
    h1: 'Image to ASCII Art Generator',
    shortDesc: 'Sample image pixel luminance on an HTML5 Canvas grid and output printable monospace ASCII art.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/png', extension: 'png', defaultQuality: 0.9, filterMode: 'ascii' },
  },
  {
    slug: 'svg-to-data-uri',
    category: 'Image & Media',
    h1: 'SVG to CSS Data URI Converter',
    shortDesc: 'Minify raw `<svg>` markup and encode it into a compact CSS `background-image: url("data:image/svg+xml,...")` declaration.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2">\n  <circle cx="12" cy="12" r="10"/>\n  <path d="M12 8v8M8 12h8"/>\n</svg>',
    sourceCode: `export function convertSvgToDataUri(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const minified = trimmed
    .replace(/<!--[\\s\\S]*?-->/g, '')
    .replace(/\\s+/g, ' ')
    .replace(/>\\s+</g, '><')
    .trim();
  const encoded = minified
    .replace(/"/g, "'")
    .replace(/%/g, '%25')
    .replace(/#/g, '%23')
    .replace(/\\{/g, '%7B')
    .replace(/\\}/g, '%7D')
    .replace(/</g, '%3C')
    .replace(/>/g, '%3E');
  const dataUri = \`data:image/svg+xml,\${encoded}\`;
  return [
    '/* 1. Raw Data URI */',
    dataUri,
    '',
    '/* 2. Ready-to-Use CSS Background Rule */',
    \`.svg-icon {\\n  background-image: url("\${dataUri}");\\n  background-repeat: no-repeat;\\n  background-size: contain;\\n}\`,
  ].join('\\n');
}
`,
  },
  {
    slug: 'image-to-color-palette',
    category: 'Image & Media',
    h1: 'Image to CSS Color Palette Extractor',
    shortDesc: 'Extract dominant HEX color variables from any uploaded image using Canvas pixel histogram quantization.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    isImageTool: true,
    canvasConfig: { mimeType: 'image/png', extension: 'png', defaultQuality: 0.9, filterMode: 'palette' },
  },

  // ==========================================================================
  // CATEGORY 3: CSS & Unit (25 Tools)
  // ==========================================================================
  {
    slug: 'px-to-rem',
    category: 'CSS & Unit',
    h1: 'PX to REM CSS Converter',
    shortDesc: 'Convert pixel values or entire CSS stylesheets into responsive REM units with customizable root font size.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '.container {\n  max-width: 1280px;\n  padding: 32px 16px;\n  font-size: 18px;\n  gap: 24px;\n}',
    sourceCode: `import type { TextConversionOptions } from '@/types/converter';

export function convertPxToRem(input: string, options: TextConversionOptions = {}): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const base = options.baseFontSize && options.baseFontSize > 0 ? options.baseFontSize : 16;
  const prec = typeof options.precision === 'number' ? options.precision : 4;
  const single = trimmed.match(/^(-?\\d*\\.?\\d+)\\s*(px)?$/i);
  if (single) {
    const px = parseFloat(single[1]);
    const rem = Number((px / base).toFixed(prec));
    return \`\${rem}rem\\n\\n/* \${px}px / \${base}px = \${rem}rem */\`;
  }
  return input.replace(/(-?\\d*\\.?\\d+)px\\b/gi, (_, n: string) => {
    const px = parseFloat(n);
    if (px === 0) return '0';
    return \`\${Number((px / base).toFixed(prec))}rem\`;
  });
}
`,
  },
  {
    slug: 'rem-to-px',
    category: 'CSS & Unit',
    h1: 'REM to PX CSS Converter',
    shortDesc: 'Convert CSS `rem` values or full stylesheets back into exact pixel (`px`) units based on root font size.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '.heading {\n  font-size: 2.25rem;\n  line-height: 2.5rem;\n  margin-bottom: 1.5rem;\n}',
    sourceCode: `import type { TextConversionOptions } from '@/types/converter';

export function convertRemToPx(input: string, options: TextConversionOptions = {}): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const base = options.baseFontSize && options.baseFontSize > 0 ? options.baseFontSize : 16;
  const single = trimmed.match(/^(-?\\d*\\.?\\d+)\\s*(rem)?$/i);
  if (single) {
    const rem = parseFloat(single[1]);
    const px = Number((rem * base).toFixed(2));
    return \`\${px}px\\n\\n/* \${rem}rem * \${base}px = \${px}px */\`;
  }
  return input.replace(/(-?\\d*\\.?\\d+)rem\\b/gi, (_, n: string) => {
    const rem = parseFloat(n);
    if (rem === 0) return '0';
    return \`\${Number((rem * base).toFixed(2))}px\`;
  });
}
`,
  },
  {
    slug: 'px-to-em',
    category: 'CSS & Unit',
    h1: 'PX to EM CSS Converter',
    shortDesc: 'Convert pixel (`px`) typography and spacing rules into relative parent `em` CSS units.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '.button {\n  font-size: 16px;\n  padding: 12px 20px;\n  border-radius: 8px;\n}',
    sourceCode: `import type { TextConversionOptions } from '@/types/converter';

export function convertPxToEm(input: string, options: TextConversionOptions = {}): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const base = options.baseFontSize && options.baseFontSize > 0 ? options.baseFontSize : 16;
  const single = trimmed.match(/^(-?\\d*\\.?\\d+)\\s*(px)?$/i);
  if (single) {
    const px = parseFloat(single[1]);
    return \`\${Number((px / base).toFixed(4))}em\`;
  }
  return input.replace(/(-?\\d*\\.?\\d+)px\\b/gi, (_, n: string) => {
    const px = parseFloat(n);
    return px === 0 ? '0' : \`\${Number((px / base).toFixed(4))}em\`;
  });
}
`,
  },
  {
    slug: 'em-to-px',
    category: 'CSS & Unit',
    h1: 'EM to PX CSS Converter',
    shortDesc: 'Calculate exact pixel (`px`) values from relative CSS `em` units and stylesheets.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '.badge {\n  font-size: 0.875em;\n  padding: 0.25em 0.75em;\n}',
    sourceCode: `import type { TextConversionOptions } from '@/types/converter';

export function convertEmToPx(input: string, options: TextConversionOptions = {}): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const base = options.baseFontSize && options.baseFontSize > 0 ? options.baseFontSize : 16;
  const single = trimmed.match(/^(-?\\d*\\.?\\d+)\\s*(em)?$/i);
  if (single) {
    const em = parseFloat(single[1]);
    return \`\${Number((em * base).toFixed(2))}px\`;
  }
  return input.replace(/(-?\\d*\\.?\\d+)em\\b/gi, (_, n: string) => {
    const em = parseFloat(n);
    return em === 0 ? '0' : \`\${Number((em * base).toFixed(2))}px\`;
  });
}
`,
  },
  {
    slug: 'px-to-vw',
    category: 'CSS & Unit',
    h1: 'PX to VW Viewport Width Converter',
    shortDesc: 'Convert pixel dimensions into responsive viewport width (`vw`) CSS units (based on 1920px or custom viewport).',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '.hero-title {\n  font-size: 72px;\n  max-width: 960px;\n  margin-top: 120px;\n}',
    sourceCode: `export function convertPxToVw(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const viewportWidth = 1920;
  const single = trimmed.match(/^(-?\\d*\\.?\\d+)\\s*(px)?$/i);
  if (single) {
    const px = parseFloat(single[1]);
    return \`\${Number(((px / viewportWidth) * 100).toFixed(4))}vw /* @1920px viewport */\`;
  }
  return input.replace(/(-?\\d*\\.?\\d+)px\\b/gi, (_, n: string) => {
    const px = parseFloat(n);
    return px === 0 ? '0' : \`\${Number(((px / viewportWidth) * 100).toFixed(4))}vw\`;
  });
}
`,
  },
  {
    slug: 'vw-to-px',
    category: 'CSS & Unit',
    h1: 'VW to PX Viewport Converter',
    shortDesc: 'Convert CSS viewport width (`vw`) percentages into pixel (`px`) dimensions at 1920px desktop resolution.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '.banner {\n  width: 50vw;\n  padding: 2.5vw;\n  font-size: 3.75vw;\n}',
    sourceCode: `export function convertVwToPx(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const viewportWidth = 1920;
  const single = trimmed.match(/^(-?\\d*\\.?\\d+)\\s*(vw)?$/i);
  if (single) {
    const vw = parseFloat(single[1]);
    return \`\${Number(((vw / 100) * viewportWidth).toFixed(2))}px /* @1920px viewport */\`;
  }
  return input.replace(/(-?\\d*\\.?\\d+)vw\\b/gi, (_, n: string) => {
    const vw = parseFloat(n);
    return vw === 0 ? '0' : \`\${Number(((vw / 100) * viewportWidth).toFixed(2))}px\`;
  });
}
`,
  },
  {
    slug: 'px-to-vh',
    category: 'CSS & Unit',
    h1: 'PX to VH Viewport Height Converter',
    shortDesc: 'Convert vertical pixel measurements into CSS viewport height (`vh`) units (1080px reference height).',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '.modal-panel {\n  height: 540px;\n  margin-top: 108px;\n}',
    sourceCode: `export function convertPxToVh(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const viewportHeight = 1080;
  const single = trimmed.match(/^(-?\\d*\\.?\\d+)\\s*(px)?$/i);
  if (single) {
    const px = parseFloat(single[1]);
    return \`\${Number(((px / viewportHeight) * 100).toFixed(4))}vh /* @1080px height */\`;
  }
  return input.replace(/(-?\\d*\\.?\\d+)px\\b/gi, (_, n: string) => {
    const px = parseFloat(n);
    return px === 0 ? '0' : \`\${Number(((px / viewportHeight) * 100).toFixed(4))}vh\`;
  });
}
`,
  },
  {
    slug: 'px-to-pt',
    category: 'CSS & Unit',
    h1: 'PX to PT Typography Converter',
    shortDesc: 'Convert screen pixels (`px` at 96 DPI) into print typography points (`pt` at 72 DPI, where `1px = 0.75pt`).',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '16px\n24px\n32px',
    sourceCode: `export function convertPxToPt(input: string): string {
  if (!input.trim()) return '';
  return input.replace(/(-?\\d*\\.?\\d+)(?:px)?\\b/gi, (m, n: string) => {
    if (!n) return m;
    const px = parseFloat(n);
    if (Number.isNaN(px)) return m;
    return \`\${Number((px * 0.75).toFixed(2))}pt\`;
  });
}
`,
  },
  {
    slug: 'pt-to-px',
    category: 'CSS & Unit',
    h1: 'PT to PX Typography Converter',
    shortDesc: 'Convert print points (`pt` at 72 DPI) into CSS screen pixels (`px` at 96 DPI, where `1pt = 1.3333px`).',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '12pt\n18pt\n24pt',
    sourceCode: `export function convertPtToPx(input: string): string {
  if (!input.trim()) return '';
  return input.replace(/(-?\\d*\\.?\\d+)(?:pt)?\\b/gi, (m, n: string) => {
    if (!n) return m;
    const pt = parseFloat(n);
    if (Number.isNaN(pt)) return m;
    return \`\${Number((pt / 0.75).toFixed(2))}px\`;
  });
}
`,
  },
  {
    slug: 'hex-to-rgb',
    category: 'CSS & Unit',
    h1: 'HEX to RGB Color Converter',
    shortDesc: 'Convert 3-digit, 6-digit, or 8-digit CSS hexadecimal colors (`#6366f1`) into `rgb()` and `rgba()` syntax.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '#6366f1\n#10b981\n#0f172acc',
    sourceCode: `function hexToRgbString(hexRaw: string): string {
  const hex = hexRaw.replace(/^#/, '');
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return \`rgb(\${r}, \${g}, \${b})\`;
  }
  if (hex.length === 6) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    return \`rgb(\${r}, \${g}, \${b})\`;
  }
  if (hex.length === 8) {
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = Number((parseInt(hex.slice(6, 8), 16) / 255).toFixed(2));
    return \`rgba(\${r}, \${g}, \${b}, \${a})\`;
  }
  throw new Error(\`Invalid HEX color: #\${hex}\`);
}

export function convertHexToRgb(input: string): string {
  if (!input.trim()) return '';
  return input.replace(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\\b/g, (m) => hexToRgbString(m));
}
`,
  },
  {
    slug: 'rgb-to-hex',
    category: 'CSS & Unit',
    h1: 'RGB to HEX Color Converter',
    shortDesc: 'Convert CSS `rgb(r, g, b)` or `rgba(r, g, b, a)` color declarations into `#rrggbb` hexadecimal strings.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: 'rgb(99, 102, 241)\nrgb(16, 185, 129)\nrgba(15, 23, 42, 0.8)',
    sourceCode: `function clampByte(n: number): string {
  return Math.max(0, Math.min(255, Math.round(n))).toString(16).padStart(2, '0');
}

export function convertRgbToHex(input: string): string {
  if (!input.trim()) return '';
  return input.replace(
    /rgba?\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})(?:\\s*,\\s*([0-9.]+))?\\s*\\)/gi,
    (_, r, g, b, a) => {
      const hex = '#' + clampByte(Number(r)) + clampByte(Number(g)) + clampByte(Number(b));
      if (a !== undefined) {
        const alpha = clampByte(parseFloat(a) * 255);
        return hex + alpha;
      }
      return hex;
    }
  );
}
`,
  },
  {
    slug: 'hex-to-hsl',
    category: 'CSS & Unit',
    h1: 'HEX to HSL Color Converter',
    shortDesc: 'Transform hexadecimal color codes (`#6366f1`) into CSS `hsl(hue, saturation%, lightness%)` notation.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '#6366f1\n#10b981\n#f59e0b',
    sourceCode: `function rgbToHslStr(r: number, g: number, b: number): string {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }
  return \`hsl(\${Math.round(h * 360)}, \${Math.round(s * 100)}%, \${Math.round(l * 100)}%)\`;
}

export function convertHexToHsl(input: string): string {
  if (!input.trim()) return '';
  return input.replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\\b/g, (_, raw: string) => {
    const hex = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
    return rgbToHslStr(
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16)
    );
  });
}
`,
  },
  {
    slug: 'hsl-to-hex',
    category: 'CSS & Unit',
    h1: 'HSL to HEX Color Converter',
    shortDesc: 'Convert CSS `hsl(h, s%, l%)` color declarations into 6-digit hexadecimal `#rrggbb` values.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: 'hsl(239, 84%, 67%)\nhsl(160, 84%, 39%)\nhsl(38, 92%, 50%)',
    sourceCode: `function hslToHexStr(h: number, s: number, l: number): string {
  s /= 100; l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) => Math.round(255 * x).toString(16).padStart(2, '0');
  return \`#\${toHex(f(0))}\${toHex(f(8))}\${toHex(f(4))}\`;
}

export function convertHslToHex(input: string): string {
  if (!input.trim()) return '';
  return input.replace(
    /hsla?\\(\\s*(\\d+(?:\\.\\d+)?)(?:deg)?\\s*,\\s*(\\d+(?:\\.\\d+)?)%\\s*,\\s*(\\d+(?:\\.\\d+)?)%(?:\\s*,\\s*[0-9.]+)?\\s*\\)/gi,
    (_, h, s, l) => hslToHexStr(parseFloat(h), parseFloat(s), parseFloat(l))
  );
}
`,
  },
  {
    slug: 'rgb-to-hsl',
    category: 'CSS & Unit',
    h1: 'RGB to HSL Color Converter',
    shortDesc: 'Convert `rgb(r, g, b)` color definitions into `hsl(h, s%, l%)` hue-saturation-lightness values.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: 'rgb(99, 102, 241)\nrgb(16, 185, 129)',
    sourceCode: `export function convertRgbToHsl(input: string): string {
  if (!input.trim()) return '';
  return input.replace(
    /rgba?\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})(?:\\s*,\\s*([0-9.]+))?\\s*\\)/gi,
    (_, rStr, gStr, bStr) => {
      const r = Number(rStr) / 255, g = Number(gStr) / 255, b = Number(bStr) / 255;
      const max = Math.max(r, g, b), min = Math.min(r, g, b);
      let h = 0, s = 0;
      const l = (max + min) / 2;
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break;
          case g: h = (b - r) / d + 2; break;
          case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
      }
      return \`hsl(\${Math.round(h * 360)}, \${Math.round(s * 100)}%, \${Math.round(l * 100)}%)\`;
    }
  );
}
`,
  },
  {
    slug: 'hsl-to-rgb',
    category: 'CSS & Unit',
    h1: 'HSL to RGB Color Converter',
    shortDesc: 'Transform CSS `hsl(h, s%, l%)` values into standard `rgb(r, g, b)` channel triplets.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: 'hsl(239, 84%, 67%)\nhsl(160, 84%, 39%)',
    sourceCode: `export function convertHslToRgb(input: string): string {
  if (!input.trim()) return '';
  return input.replace(
    /hsla?\\(\\s*(\\d+(?:\\.\\d+)?)(?:deg)?\\s*,\\s*(\\d+(?:\\.\\d+)?)%\\s*,\\s*(\\d+(?:\\.\\d+)?)%(?:\\s*,\\s*[0-9.]+)?\\s*\\)/gi,
    (_, hStr, sStr, lStr) => {
      const h = parseFloat(hStr), s = parseFloat(sStr) / 100, l = parseFloat(lStr) / 100;
      const k = (n: number) => (n + h / 30) % 12;
      const a = s * Math.min(l, 1 - l);
      const f = (n: number) => Math.round(255 * (l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))));
      return \`rgb(\${f(0)}, \${f(8)}, \${f(4)})\`;
    }
  );
}
`,
  },
  {
    slug: 'hex-to-rgba',
    category: 'CSS & Unit',
    h1: 'HEX to RGBA CSS Color Converter',
    shortDesc: 'Convert HEX color codes into CSS `rgba(r, g, b, alpha)` rules with customizable opacity.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '#6366f1\n#10b98180\n#0f172a',
    sourceCode: `export function convertHexToRgba(input: string): string {
  if (!input.trim()) return '';
  return input.replace(/#([0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{3})\\b/g, (_, raw: string) => {
    const hex = raw.length === 3 ? raw.split('').map((c) => c + c).join('') : raw;
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = hex.length === 8 ? Number((parseInt(hex.slice(6, 8), 16) / 255).toFixed(2)) : 1;
    return \`rgba(\${r}, \${g}, \${b}, \${a})\`;
  });
}
`,
  },
  {
    slug: 'rgb-to-cmyk',
    category: 'CSS & Unit',
    h1: 'RGB to CMYK Print Color Converter',
    shortDesc: 'Convert screen `rgb(r, g, b)` colors into Cyan, Magenta, Yellow, and Key/Black (`cmyk()`) print percentages.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: 'rgb(99, 102, 241)\nrgb(16, 185, 129)',
    sourceCode: `export function convertRgbToCmyk(input: string): string {
  if (!input.trim()) return '';
  return input.replace(
    /rgba?\\(\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})\\s*,\\s*(\\d{1,3})(?:\\s*,\\s*[0-9.]+)?\\s*\\)/gi,
    (_, rStr, gStr, bStr) => {
      const r = Number(rStr) / 255, g = Number(gStr) / 255, b = Number(bStr) / 255;
      const k = 1 - Math.max(r, g, b);
      if (k === 1) return 'cmyk(0%, 0%, 0%, 100%)';
      const c = Math.round(((1 - r - k) / (1 - k)) * 100);
      const m = Math.round(((1 - g - k) / (1 - k)) * 100);
      const y = Math.round(((1 - b - k) / (1 - k)) * 100);
      const kPct = Math.round(k * 100);
      return \`cmyk(\${c}%, \${m}%, \${y}%, \${kPct}%)\`;
    }
  );
}
`,
  },
  {
    slug: 'cmyk-to-rgb',
    category: 'CSS & Unit',
    h1: 'CMYK to RGB Color Converter',
    shortDesc: 'Convert print `cmyk(c%, m%, y%, k%)` percentages into digital `rgb(r, g, b)` and `#hex` color values.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: 'cmyk(59%, 58%, 0%, 5%)\ncmyk(91%, 0%, 30%, 27%)',
    sourceCode: `export function convertCmykToRgb(input: string): string {
  if (!input.trim()) return '';
  return input.replace(
    /cmyk\\(\\s*(\\d+(?:\\.\\d+)?)%?\\s*,\\s*(\\d+(?:\\.\\d+)?)%?\\s*,\\s*(\\d+(?:\\.\\d+)?)%?\\s*,\\s*(\\d+(?:\\.\\d+)?)%?\\s*\\)/gi,
    (_, cStr, mStr, yStr, kStr) => {
      const c = parseFloat(cStr) / 100, m = parseFloat(mStr) / 100, y = parseFloat(yStr) / 100, k = parseFloat(kStr) / 100;
      const r = Math.round(255 * (1 - c) * (1 - k));
      const g = Math.round(255 * (1 - m) * (1 - k));
      const b = Math.round(255 * (1 - y) * (1 - k));
      return \`rgb(\${r}, \${g}, \${b})\`;
    }
  );
}
`,
  },
  {
    slug: 'hex-to-oklch',
    category: 'CSS & Unit',
    h1: 'HEX to OKLCH CSS Color Converter',
    shortDesc: 'Convert sRGB HEX colors (`#6366f1`) into perceptual CSS Color Level 4 `oklch(L C H)` values.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '#6366f1\n#10b981\n#f43f5e',
    sourceCode: `function srgbToLinear(x: number): number {
  return x <= 0.04045 ? x / 12.92 : Math.pow((x + 0.055) / 1.055, 2.4);
}

function hexToOklchStr(raw: string): string {
  const hex = raw.replace(/^#/, '');
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex;
  const r = srgbToLinear(parseInt(full.slice(0, 2), 16) / 255);
  const g = srgbToLinear(parseInt(full.slice(2, 4), 16) / 255);
  const b = srgbToLinear(parseInt(full.slice(4, 6), 16) / 255);

  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);

  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;

  const C = Math.sqrt(A * A + B * B);
  let H = (Math.atan2(B, A) * 180) / Math.PI;
  if (H < 0) H += 360;

  return \`oklch(\${Number((L * 100).toFixed(2))}% \${Number(C.toFixed(4))} \${Number(H.toFixed(2))})\`;
}

export function convertHexToOklch(input: string): string {
  if (!input.trim()) return '';
  return input.replace(/#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\\b/g, (m) => hexToOklchStr(m));
}
`,
  },
  {
    slug: 'css-to-tailwind',
    category: 'CSS & Unit',
    h1: 'CSS to Tailwind CSS Class Converter',
    shortDesc: 'Translate standard CSS declarations (`display: flex; align-items: center; gap: 16px;`) into Tailwind utility classes.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: 'display: flex;\nflex-direction: column;\nalign-items: center;\njustify-content: space-between;\npadding: 16px;\ngap: 8px;\nfont-weight: 700;\nborder-radius: 12px;',
    sourceCode: `const EXACT_MAP: Record<string, string> = {
  'display: flex': 'flex',
  'display: inline-flex': 'inline-flex',
  'display: grid': 'grid',
  'display: block': 'block',
  'display: inline-block': 'inline-block',
  'display: none': 'hidden',
  'flex-direction: row': 'flex-row',
  'flex-direction: column': 'flex-col',
  'align-items: center': 'items-center',
  'align-items: flex-start': 'items-start',
  'align-items: flex-end': 'items-end',
  'justify-content: center': 'justify-center',
  'justify-content: space-between': 'justify-between',
  'justify-content: flex-start': 'justify-start',
  'position: relative': 'relative',
  'position: absolute': 'absolute',
  'position: fixed': 'fixed',
  'position: sticky': 'sticky',
  'font-weight: 700': 'font-bold',
  'font-weight: 600': 'font-semibold',
  'font-weight: 500': 'font-medium',
  'text-align: center': 'text-center',
  'text-align: right': 'text-right',
  'width: 100%': 'w-full',
  'height: 100%': 'h-full',
  'overflow: hidden': 'overflow-hidden',
  'cursor: pointer': 'cursor-pointer',
  'border-radius: 4px': 'rounded',
  'border-radius: 8px': 'rounded-lg',
  'border-radius: 12px': 'rounded-xl',
  'border-radius: 16px': 'rounded-2xl',
  'border-radius: 9999px': 'rounded-full',
};

function pxToTwScale(pxStr: string): string {
  const px = parseFloat(pxStr);
  const scale = px / 4;
  return Number.isInteger(scale) ? String(scale) : \`[\${px}px]\`;
}

export function convertCssToTailwind(input: string): string {
  if (!input.trim()) return '';
  const classes: string[] = [];
  const clean = input.replace(/^[^{]*\\{/, '').replace(/\\}\\s*$/, '');
  for (const raw of clean.split(';')) {
    const rule = raw.trim().toLowerCase().replace(/\\s*:\\s*/, ': ');
    if (!rule) continue;
    if (EXACT_MAP[rule]) {
      classes.push(EXACT_MAP[rule]);
      continue;
    }
    const m = rule.match(/^(padding|margin|gap|top|left|right|bottom|font-size):\\s*(-?\\d+\\.?\\d*)px$/);
    if (m) {
      const prop = m[1], val = m[2];
      const prefix: Record<string, string> = { padding: 'p', margin: 'm', gap: 'gap', top: 'top', left: 'left', right: 'right', bottom: 'bottom', 'font-size': 'text' };
      classes.push(prop === 'font-size' ? \`text-[\${val}px]\` : \`\${prefix[prop]}-\${pxToTwScale(val)}\`);
      continue;
    }
    const [k, v] = rule.split(': ');
    if (k && v) classes.push(\`[\${k}:\${v.replace(/\\s+/g, '_')}]\`);
  }
  return classes.join(' ');
}
`,
  },
  {
    slug: 'css-to-js-styles',
    category: 'CSS & Unit',
    h1: 'CSS to React JS Style Object Converter',
    shortDesc: 'Convert CSS declarations (`background-color: #0f172a; font-size: 16px;`) into camelCase JavaScript/React style objects.',
    outputExtension: 'ts',
    outputMimeType: 'text/typescript',
    sampleInput: 'background-color: #0f172a;\nfont-size: 16px;\nline-height: 24px;\nborder-radius: 12px;\nz-index: 10;',
    sourceCode: `export function convertCssToJsStyles(input: string): string {
  if (!input.trim()) return '';
  const clean = input.replace(/^[^{]*\\{/, '').replace(/\\}\\s*$/, '');
  const styleObj: Record<string, string | number> = {};
  for (const decl of clean.split(';')) {
    const idx = decl.indexOf(':');
    if (idx === -1) continue;
    const rawProp = decl.slice(0, idx).trim();
    const val = decl.slice(idx + 1).trim();
    if (!rawProp || !val) continue;
    const camel = rawProp.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    styleObj[camel] = /^-?\\d+(\\.\\d+)?$/.test(val) ? Number(val) : val;
  }
  return \`const styles: React.CSSProperties = \${JSON.stringify(styleObj, null, 2)};\`;
}
`,
  },
  {
    slug: 'js-styles-to-css',
    category: 'CSS & Unit',
    h1: 'JS Style Object to CSS Converter',
    shortDesc: 'Convert camelCase React/JavaScript inline style objects back into kebab-case standard CSS declarations.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '{\n  "backgroundColor": "#0f172a",\n  "fontSize": "16px",\n  "borderRadius": "12px",\n  "zIndex": 10\n}',
    sourceCode: `export function convertJsStylesToCss(input: string): string {
  if (!input.trim()) return '';
  let raw = input.trim().replace(/^[^{]*=/, '').replace(/;$/, '').trim();
  raw = raw.replace(/([{,]\\s*)([A-Za-z_$][A-Za-z0-9_$]*)\\s*:/g, '$1"$2":').replace(/'/g, '"').replace(/,\\s*\\}/g, '}');
  const parsed = JSON.parse(raw) as Record<string, unknown>;
  const lines = Object.entries(parsed).map(([k, v]) => {
    const kebab = k.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    return \`  \${kebab}: \${v};\`;
  });
  return \`.element {\\n\${lines.join('\\n')}\\n}\`;
}
`,
  },
  {
    slug: 'scss-to-css',
    category: 'CSS & Unit',
    h1: 'SCSS to CSS Compiler',
    shortDesc: 'Resolve `$variables` and flatten basic nested SCSS rules into standard browser-compatible CSS.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '$brand: #6366f1;\n$radius: 12px;\n\n.card {\n  border-radius: $radius;\n  border: 1px solid $brand;\n}',
    sourceCode: `export function convertScssToCss(input: string): string {
  if (!input.trim()) return '';
  const vars = new Map<string, string>();
  let body = input.replace(/^\\s*\\$([A-Za-z0-9_-]+)\\s*:\\s*([^;]+);/gm, (_, name: string, val: string) => {
    vars.set(name, val.trim());
    return '';
  });
  // Strip single-line comments
  body = body.replace(/\\/\\/.*$/gm, '');
  // Substitute $variables
  vars.forEach((val, name) => {
    body = body.replace(new RegExp('\\\\$' + name + '\\\\b', 'g'), val);
  });
  return body.trim();
}
`,
  },
  {
    slug: 'css-to-minified-css',
    category: 'CSS & Unit',
    h1: 'CSS Minifier & Compressor',
    shortDesc: 'Strip comments, whitespace, and redundant semicolons from CSS stylesheets for maximum network performance.',
    outputExtension: 'min.css',
    outputMimeType: 'text/css',
    sampleInput: '/* Main Hero Card */\n.hero-card {\n  display: flex;\n  padding: 24px 32px;\n  background-color: #0f172a;\n  color: #ffffff;\n}',
    sourceCode: `export function convertCssToMinifiedCss(input: string): string {
  if (!input.trim()) return '';
  return input
    .replace(/\\/\\*[\\s\\S]*?\\*\\//g, '')
    .replace(/\\s+/g, ' ')
    .replace(/\\s*([{}:;,>~+])\\s*/g, '$1')
    .replace(/;}/g, '}')
    .trim();
}
`,
  },
  {
    slug: 'minified-css-to-css',
    category: 'CSS & Unit',
    h1: 'Minified CSS to Beautified CSS Formatter',
    shortDesc: 'Unminify and pretty-print compressed `.min.css` stylesheets into clean, indented multi-line CSS blocks.',
    outputExtension: 'css',
    outputMimeType: 'text/css',
    sampleInput: '.hero-card{display:flex;padding:24px 32px;background-color:#0f172a;color:#fff}.btn{border-radius:8px;font-weight:600}',
    sourceCode: `export function convertMinifiedCssToCss(input: string): string {
  if (!input.trim()) return '';
  return input
    .replace(/\\s*\\{\\s*/g, ' {\\n  ')
    .replace(/;\\s*/g, ';\\n  ')
    .replace(/\\s*\\}\\s*/g, '\\n}\\n\\n')
    .replace(/\\n  \\n\\}/g, '\\n}')
    .trim();
}
`,
  },

  // ==========================================================================
  // CATEGORY 4: Text & Data (25 Tools)
  // ==========================================================================
  {
    slug: 'string-to-base64',
    category: 'Text & Data',
    h1: 'String to Base64 Encoder',
    shortDesc: 'Encode UTF-8 text, emojis, and Unicode strings into RFC 4648 Base64 locally using `TextEncoder` and `btoa`.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: 'convert.my.id — 100% Client-Side, Privacy-First & Zero Server Load! 🚀🔒',
    sourceCode: `import type { TextConversionOptions } from '@/types/converter';

export function convertStringToBase64(input: string, options: TextConversionOptions = {}): string {
  if (!input) return '';
  const bytes = new TextEncoder().encode(input);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  const b64 = btoa(bin);
  return options.urlSafe ? b64.replace(/\\+/g, '-').replace(/\\//g, '_').replace(/=+$/, '') : b64;
}
`,
  },
  {
    slug: 'base64-to-string',
    category: 'Text & Data',
    h1: 'Base64 to UTF-8 String Decoder',
    shortDesc: 'Decode standard or URL-safe Base64 payloads back into readable UTF-8 strings via `atob` and `TextDecoder`.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: 'Y29udmVydC5teS5pZCDigJQgMTAwJSBDbGllbnQtU2lkZSwgUHJpdmFjeS1GaXJzdCAmIFplcm8gU2VydmVyIExvYWQhIPCfmqDwn5🔒',
    sourceCode: `export function convertBase64ToString(input: string): string {
  const clean = input.trim().replace(/[\\r\\n\\s]+/g, '').replace(/-/g, '+').replace(/_/g, '/');
  if (!clean) return '';
  const pad = clean.length % 4;
  const padded = pad === 2 ? clean + '==' : pad === 3 ? clean + '=' : clean;
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder('utf-8').decode(bytes);
}
`,
  },
  {
    slug: 'markdown-to-html',
    category: 'Text & Data',
    h1: 'Markdown to HTML Converter',
    shortDesc: 'Compile Markdown documents (headings, fenced code, tables, lists, links) into clean semantic HTML5.',
    outputExtension: 'html',
    outputMimeType: 'text/html',
    sampleInput: '# convert.my.id Documentation\n\nWelcome to **convert.my.id** — *100% client-side* utilities.\n\n- Zero server load\n- Instant browser execution\n\n```ts\nconst domain = "convert.my.id";\n```',
    sourceCode: `import type { TextConversionOptions } from '@/types/converter';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function inlineMd(s: string): string {
  return esc(s)
    .replace(/\`([^\`]+)\`/g, '<code>$1</code>')
    .replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>')
    .replace(/\\*(.+?)\\*/g, '<em>$1</em>')
    .replace(/~~(.+?)~~/g, '<del>$1</del>')
    .replace(/\\[([^\\]]+)\\]\\(([^)]+)\\)/g, '<a href="$2" rel="noopener noreferrer">$1</a>');
}

export function convertMarkdownToHtml(input: string, options: TextConversionOptions = {}): string {
  if (!input.trim()) return '';
  const lines = input.replace(/\\r\\n/g, '\\n').split('\\n');
  const out: string[] = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i++; continue; }
    const fence = line.match(/^\\\`\\\`\\\`(\\w+)?/);
    if (fence) {
      const lang = fence[1] ? \` class="language-\${fence[1]}"\` : '';
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('\`\`\`')) { code.push(esc(lines[i])); i++; }
      i++;
      out.push(\`<pre><code\${lang}>\${code.join('\\n')}</code></pre>\`);
      continue;
    }
    const h = line.match(/^(#{1,6})\\s+(.+)$/);
    if (h) {
      out.push(\`<h\${h[1].length}>\${inlineMd(h[2])}</h\${h[1].length}>\`);
      i++;
      continue;
    }
    if (/^\\s*[-*+]\\s+/.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\\s*[-*+]\\s+/.test(lines[i])) {
        items.push(\`  <li>\${inlineMd(lines[i].replace(/^\\s*[-*+]\\s+/, ''))}</li>\`);
        i++;
      }
      out.push(\`<ul>\\n\${items.join('\\n')}\\n</ul>\`);
      continue;
    }
    out.push(\`<p>\${inlineMd(line)}</p>\`);
    i++;
  }
  const body = out.join('\\n\\n');
  return options.fullHtmlDocument
    ? \`<!DOCTYPE html>\\n<html lang="en">\\n<head>\\n  <meta charset="UTF-8" />\\n  <title>convert.my.id Document</title>\\n</head>\\n<body>\\n\${body}\\n</body>\\n</html>\`
    : body;
}
`,
  },
  {
    slug: 'html-to-markdown',
    category: 'Text & Data',
    h1: 'HTML to Markdown Converter',
    shortDesc: 'Convert semantic HTML tags (`<h1>`-`<h6>`, `<p>`, `<a>`, `<ul>`, `<pre><code>`, `<strong>`) into clean Markdown.',
    outputExtension: 'md',
    outputMimeType: 'text/markdown',
    sampleInput: '<h1>convert.my.id</h1>\n<p>Built for <strong>instant</strong> and <em>private</em> conversions.</p>\n<ul>\n  <li>Code &amp; Dev</li>\n  <li>Image &amp; Media</li>\n</ul>',
    sourceCode: `export function convertHtmlToMarkdown(input: string): string {
  if (!input.trim()) return '';
  let md = input;
  md = md.replace(/<h([1-6])[^>]*>([\\s\\S]*?)<\\/h\\1>/gi, (_, lvl: string, txt: string) => \`\${'#'.repeat(Number(lvl))} \${txt.trim()}\\n\\n\`);
  md = md.replace(/<strong[^>]*>([\\s\\S]*?)<\\/strong>/gi, '**$1**');
  md = md.replace(/<b[^>]*>([\\s\\S]*?)<\\/b>/gi, '**$1**');
  md = md.replace(/<em[^>]*>([\\s\\S]*?)<\\/em>/gi, '*$1*');
  md = md.replace(/<i[^>]*>([\\s\\S]*?)<\\/i>/gi, '*$1*');
  md = md.replace(/<code[^>]*>([\\s\\S]*?)<\\/code>/gi, '\`$1\`');
  md = md.replace(/<a[^>]*href=["']([^"']+)["'][^>]*>([\\s\\S]*?)<\\/a>/gi, '[$2]($1)');
  md = md.replace(/<li[^>]*>([\\s\\S]*?)<\\/li>/gi, '- $1\\n');
  md = md.replace(/<\\/?(?:ul|ol|div|section|article)[^>]*>/gi, '\\n');
  md = md.replace(/<p[^>]*>([\\s\\S]*?)<\\/p>/gi, '$1\\n\\n');
  md = md.replace(/<br\\s*\\/?>/gi, '\\n');
  md = md.replace(/<[^>]+>/g, '');
  md = md.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"');
  return md.replace(/\\n{3,}/g, '\\n\\n').trim();
}
`,
  },
  {
    slug: 'csv-to-json',
    category: 'Text & Data',
    h1: 'CSV to JSON Converter',
    shortDesc: 'Parse RFC 4180 CSV spreadsheets (including quoted fields and commas) into a typed JSON object array.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: 'id,slug,category,clientSide\n1,json-to-typescript,"Code & Dev",true\n2,image-to-webp,"Image & Media",true\n3,px-to-rem,"CSS & Unit",true',
    sourceCode: `function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { cur += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      out.push(cur);
      cur = '';
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out;
}

export function convertCsvToJson(input: string): string {
  const lines = input.trim().replace(/\\r\\n/g, '\\n').split('\\n').filter(Boolean);
  if (lines.length === 0) return '[]';
  const headers = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const vals = parseCsvLine(line);
    const obj: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      const raw = (vals[idx] ?? '').trim();
      if (raw === 'true') obj[h] = true;
      else if (raw === 'false') obj[h] = false;
      else if (/^-?\\d+(\\.\\d+)?$/.test(raw)) obj[h] = Number(raw);
      else obj[h] = raw;
    });
    return obj;
  });
  return JSON.stringify(rows, null, 2);
}
`,
  },
  {
    slug: 'json-to-csv',
    category: 'Text & Data',
    h1: 'JSON to CSV Converter',
    shortDesc: 'Export JSON arrays of objects into RFC 4180 CSV spreadsheet format ready for Excel and Google Sheets.',
    outputExtension: 'csv',
    outputMimeType: 'text/csv',
    sampleInput: '[\n  { "id": 1, "domain": "convert.my.id", "category": "Code & Dev" },\n  { "id": 2, "domain": "convert.my.id", "category": "Image & Media" }\n]',
    sourceCode: `function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return '';
  const str = typeof val === 'object' ? JSON.stringify(val) : String(val);
  return /[",\\n]/.test(str) ? \`"\${str.replace(/"/g, '""')}"\` : str;
}

export function convertJsonToCsv(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  const arr = (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
  if (arr.length === 0) return '';
  const headers = Array.from(new Set(arr.flatMap((row) => Object.keys(row))));
  const lines = [headers.map(escapeCsvCell).join(',')];
  for (const row of arr) {
    lines.push(headers.map((h) => escapeCsvCell(row[h])).join(','));
  }
  return lines.join('\\n');
}
`,
  },
  {
    slug: 'tsv-to-json',
    category: 'Text & Data',
    h1: 'TSV to JSON Converter',
    shortDesc: 'Convert Tab-Separated Values (`.tsv`) pasted from spreadsheets directly into structured JSON arrays.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: 'id\tslug\tdomain\n1\ttsv-to-json\tconvert.my.id\n2\tjson-to-tsv\tconvert.my.id',
    sourceCode: `export function convertTsvToJson(input: string): string {
  const lines = input.trim().replace(/\\r\\n/g, '\\n').split('\\n').filter(Boolean);
  if (lines.length === 0) return '[]';
  const headers = lines[0].split('\\t').map((h) => h.trim());
  const rows = lines.slice(1).map((line) => {
    const cols = line.split('\\t');
    const obj: Record<string, unknown> = {};
    headers.forEach((h, idx) => {
      const v = (cols[idx] ?? '').trim();
      obj[h] = /^-?\\d+(\\.\\d+)?$/.test(v) ? Number(v) : v === 'true' ? true : v === 'false' ? false : v;
    });
    return obj;
  });
  return JSON.stringify(rows, null, 2);
}
`,
  },
  {
    slug: 'json-to-tsv',
    category: 'Text & Data',
    h1: 'JSON to TSV Converter',
    shortDesc: 'Serialize JSON object arrays into Tab-Separated Values (`.tsv`) for one-click pasting into Excel or Notion.',
    outputExtension: 'tsv',
    outputMimeType: 'text/tab-separated-values',
    sampleInput: '[\n  { "id": 1, "tool": "json-to-tsv", "site": "convert.my.id" },\n  { "id": 2, "tool": "tsv-to-json", "site": "convert.my.id" }\n]',
    sourceCode: `export function convertJsonToTsv(input: string): string {
  if (!input.trim()) return '';
  const parsed: unknown = JSON.parse(input);
  const arr = (Array.isArray(parsed) ? parsed : [parsed]) as Record<string, unknown>[];
  if (arr.length === 0) return '';
  const headers = Array.from(new Set(arr.flatMap((r) => Object.keys(r))));
  const rows = arr.map((r) => headers.map((h) => String(r[h] ?? '').replace(/\\t|\\n/g, ' ')).join('\\t'));
  return [headers.join('\\t'), ...rows].join('\\n');
}
`,
  },
  {
    slug: 'csv-to-markdown-table',
    category: 'Text & Data',
    h1: 'CSV to Markdown Table Converter',
    shortDesc: 'Format comma-separated values (`.csv`) into aligned GitHub Flavored Markdown (`GFM`) tables.',
    outputExtension: 'md',
    outputMimeType: 'text/markdown',
    sampleInput: 'Tool,Category,Execution\njson-to-typescript,Code & Dev,Client-Side\nimage-to-webp,Image & Media,HTML5 Canvas',
    sourceCode: `export function convertCsvToMarkdownTable(input: string): string {
  const lines = input.trim().replace(/\\r\\n/g, '\\n').split('\\n').filter(Boolean);
  if (lines.length === 0) return '';
  const matrix = lines.map((l) => l.split(',').map((c) => c.trim().replace(/^"|"$/g, '')));
  const headers = matrix[0];
  const sep = headers.map(() => '---');
  const fmt = (row: string[]) => \`| \${row.join(' | ')} |\`;
  return [fmt(headers), fmt(sep), ...matrix.slice(1).map(fmt)].join('\\n');
}
`,
  },
  {
    slug: 'markdown-table-to-csv',
    category: 'Text & Data',
    h1: 'Markdown Table to CSV Converter',
    shortDesc: 'Extract rows and columns from GitHub Markdown tables (`| col |`) and convert them into standard CSV.',
    outputExtension: 'csv',
    outputMimeType: 'text/csv',
    sampleInput: '| Tool | Category | Domain |\n| --- | --- | --- |\n| px-to-rem | CSS & Unit | convert.my.id |\n| csv-to-json | Text & Data | convert.my.id |',
    sourceCode: `export function convertMarkdownTableToCsv(input: string): string {
  const lines = input
    .trim()
    .split(/\\r?\\n/)
    .map((l) => l.trim())
    .filter((l) => l.startsWith('|') && !/^\\|[\\s|:-]+\\|$/.test(l));
  return lines
    .map((line) =>
      line
        .replace(/^\\|/, '')
        .replace(/\\|$/, '')
        .split('|')
        .map((cell) => {
          const c = cell.trim();
          return /[",]/.test(c) ? \`"\${c.replace(/"/g, '""')}"\` : c;
        })
        .join(',')
    )
    .join('\\n');
}
`,
  },
  {
    slug: 'csv-to-html-table',
    category: 'Text & Data',
    h1: 'CSV to HTML Table Generator',
    shortDesc: 'Convert CSV data into a semantic, accessible HTML5 `<table>` complete with `<thead>` and `<tbody>` tags.',
    outputExtension: 'html',
    outputMimeType: 'text/html',
    sampleInput: 'ID,Tool,Site\n1,csv-to-html-table,convert.my.id\n2,markdown-to-html,convert.my.id',
    sourceCode: `function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export function convertCsvToHtmlTable(input: string): string {
  const lines = input.trim().split(/\\r?\\n/).filter(Boolean);
  if (lines.length === 0) return '';
  const rows = lines.map((l) => l.split(',').map((c) => esc(c.trim().replace(/^"|"$/g, ''))));
  const headCells = rows[0].map((h) => \`      <th>\${h}</th>\`).join('\\n');
  const bodyRows = rows
    .slice(1)
    .map((r) => \`    <tr>\\n\${r.map((c) => \`      <td>\${c}</td>\`).join('\\n')}\\n    </tr>\`)
    .join('\\n');
  return \`<table>\\n  <thead>\\n    <tr>\\n\${headCells}\\n    </tr>\\n  </thead>\\n  <tbody>\\n\${bodyRows}\\n  </tbody>\\n</table>\`;
}
`,
  },
  {
    slug: 'url-encode',
    category: 'Text & Data',
    h1: 'URL Percent-Encoder Online',
    shortDesc: 'Encode special characters, query parameters, and UTF-8 symbols into RFC 3986 percent-encoded URL strings.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: 'https://convert.my.id/search?q=100% Client-Side & Privacy=First!',
    sourceCode: `export function convertUrlEncode(input: string): string {
  if (!input) return '';
  return [
    '/* encodeURIComponent (Strict Parameter Encoding) */',
    encodeURIComponent(input),
    '',
    '/* encodeURI (Full URL Preserving : / ? & =) */',
    encodeURI(input),
  ].join('\\n');
}
`,
  },
  {
    slug: 'url-decode',
    category: 'Text & Data',
    h1: 'URL Percent-Decoder Online',
    shortDesc: 'Decode percent-encoded URL strings (`%20`, `%3A`, `%2F`) and `+` spaces back into readable UTF-8 text.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: 'https%3A%2F%2Fconvert.my.id%2Fsearch%3Fq%3D100%25+Client-Side+%26+Privacy%3DFirst%21',
    sourceCode: `export function convertUrlDecode(input: string): string {
  if (!input) return '';
  return decodeURIComponent(input.replace(/\\+/g, '%20'));
}
`,
  },
  {
    slug: 'html-entity-encode',
    category: 'Text & Data',
    h1: 'HTML Entity Encoder',
    shortDesc: 'Escape unsafe HTML characters (`<`, `>`, `&`, `"`, `\'`) and non-ASCII symbols into safe HTML entities.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: '<script src="https://convert.my.id/app.js"></script> & © 2026',
    sourceCode: `export function convertHtmlEntityEncode(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/[^\\x00-\\x7F]/g, (ch) => \`&#\${ch.codePointAt(0)};\`);
}
`,
  },
  {
    slug: 'html-entity-decode',
    category: 'Text & Data',
    h1: 'HTML Entity Decoder',
    shortDesc: 'Unescape named (`&amp;`, `&lt;`, `&copy;`) and numeric (`&#169;`, `&#x1F680;`) HTML entities into plain text.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: '&lt;div class=&quot;brand&quot;&gt;convert.my.id &amp; &#169; 2026&lt;/div&gt;',
    sourceCode: `export function convertHtmlEntityDecode(input: string): string {
  if (!input) return '';
  return input
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\\d+);/g, (_, dec: string) => String.fromCodePoint(parseInt(dec, 10)))
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&copy;/g, '©')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&');
}
`,
  },
  {
    slug: 'string-to-binary',
    category: 'Text & Data',
    h1: 'String to 8-Bit Binary Converter',
    shortDesc: 'Convert UTF-8 text strings into space-delimited 8-bit binary byte sequences (`01100011`) via `TextEncoder`.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: 'convert.my.id',
    sourceCode: `export function convertStringToBinary(input: string): string {
  if (!input) return '';
  const bytes = new TextEncoder().encode(input);
  return Array.from(bytes)
    .map((b) => b.toString(2).padStart(8, '0'))
    .join(' ');
}
`,
  },
  {
    slug: 'binary-to-string',
    category: 'Text & Data',
    h1: 'Binary to UTF-8 String Decoder',
    shortDesc: 'Decode 8-bit binary byte sequences (`01100011 01101111`) back into readable UTF-8 text.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: '01100011 01101111 01101110 01110110 01100101 01110010 01110100 00101110 01101101 01111001 00101110 01101001 01100100',
    sourceCode: `export function convertBinaryToString(input: string): string {
  const clean = input.trim();
  if (!clean) return '';
  const tokens = clean.split(/\\s+/);
  const bytes = new Uint8Array(
    tokens.map((tok) => {
      if (!/^[01]{1,8}$/.test(tok)) throw new Error(\`Invalid binary byte token: "\${tok}"\`);
      return parseInt(tok, 2);
    })
  );
  return new TextDecoder('utf-8').decode(bytes);
}
`,
  },
  {
    slug: 'string-to-hex',
    category: 'Text & Data',
    h1: 'String to Hexadecimal Converter',
    shortDesc: 'Encode UTF-8 text strings into hexadecimal byte representation (`63 6f 6e 76 65 72 74`).',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: 'convert.my.id — 100% Client-Side',
    sourceCode: `export function convertStringToHex(input: string): string {
  if (!input) return '';
  const bytes = new TextEncoder().encode(input);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join(' ');
}
`,
  },
  {
    slug: 'hex-to-string',
    category: 'Text & Data',
    h1: 'Hexadecimal to UTF-8 String Decoder',
    shortDesc: 'Decode hexadecimal byte strings (`63 6f 6e 76 65 72 74`) back into human-readable UTF-8 text.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: '63 6f 6e 76 65 72 74 2e 6d 79 2e 69 64',
    sourceCode: `export function convertHexToString(input: string): string {
  const clean = input.trim().replace(/^0x/i, '').replace(/[^0-9a-fA-F]/g, '');
  if (!clean) return '';
  if (clean.length % 2 !== 0) throw new Error('Hex string must have an even number of hex digits.');
  const bytes = new Uint8Array(clean.length / 2);
  for (let i = 0; i < clean.length; i += 2) {
    bytes[i / 2] = parseInt(clean.slice(i, i + 2), 16);
  }
  return new TextDecoder('utf-8').decode(bytes);
}
`,
  },
  {
    slug: 'string-to-morse',
    category: 'Text & Data',
    h1: 'Text to Morse Code Converter',
    shortDesc: 'Translate English text and numbers into International ITU Morse Code dots (`.`) and dashes (`-`).',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: 'CONVERT MY ID 100',
    sourceCode: `const MORSE_MAP: Record<string, string> = {
  A: '.-', B: '-...', C: '-.-.', D: '-..', E: '.', F: '..-.', G: '--.', H: '....',
  I: '..', J: '.---', K: '-.-', L: '.-..', M: '--', N: '-.', O: '---', P: '.--.',
  Q: '--.-', R: '.-.', S: '...', T: '-', U: '..-', V: '...-', W: '.--', X: '-..-',
  Y: '-.--', Z: '--..', '0': '-----', '1': '.----', '2': '..---', '3': '...--',
  '4': '....-', '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
  '.': '.-.-.-', ',': '--..--', '?': '..--..', '-': '-....-', '/': '-..-.',
};

export function convertStringToMorse(input: string): string {
  if (!input.trim()) return '';
  return input
    .toUpperCase()
    .split(/\\s+/)
    .map((word) =>
      word
        .split('')
        .map((ch) => MORSE_MAP[ch] ?? ch)
        .join(' ')
    )
    .join(' / ');
}
`,
  },
  {
    slug: 'morse-to-string',
    category: 'Text & Data',
    h1: 'Morse Code to Text Decoder',
    shortDesc: 'Decode International ITU Morse Code dots (`.`), dashes (`-`), and word slashes (`/`) into plain text.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: '-.-. --- -. ...- . .-. - / -- -.-- / .. -.. / .---- ----- -----',
    sourceCode: `const REV_MORSE: Record<string, string> = {
  '.-': 'A', '-...': 'B', '-.-.': 'C', '-..': 'D', '.': 'E', '..-.': 'F', '--.': 'G', '....': 'H',
  '..': 'I', '.---': 'J', '-.-': 'K', '.-..': 'L', '--': 'M', '-.': 'N', '---': 'O', '.--.': 'P',
  '--.-': 'Q', '.-.': 'R', '...': 'S', '-': 'T', '..-': 'U', '...-': 'V', '.--': 'W', '-..-': 'X',
  '-.--': 'Y', '--..': 'Z', '-----': '0', '.----': '1', '..---': '2', '...--': '3',
  '....-': '4', '.....': '5', '-....': '6', '--...': '7', '---..': '8', '----.': '9',
  '.-.-.-': '.', '--..--': ',', '..--..': '?', '-....-': '-', '-..-.': '/',
};

export function convertMorseToString(input: string): string {
  if (!input.trim()) return '';
  return input
    .trim()
    .split(/\\s*\\/\\s*/)
    .map((word) =>
      word
        .trim()
        .split(/\\s+/)
        .map((code) => REV_MORSE[code] ?? '')
        .join('')
    )
    .join(' ');
}
`,
  },
  {
    slug: 'text-to-slug',
    category: 'Text & Data',
    h1: 'Text to URL Slug & Case Converter',
    shortDesc: 'Transform titles and identifiers into SEO `kebab-case` slugs, `camelCase`, `PascalCase`, `snake_case`, and `CONSTANT_CASE`.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: 'Convert.my.id — 100% Free Client-Side Online Converters!',
    sourceCode: `export function convertTextToSlug(input: string): string {
  if (!input.trim()) return '';
  const words = input
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, ' ')
    .trim()
    .split(/\\s+/)
    .filter(Boolean);

  const lower = words.map((w) => w.toLowerCase());
  const kebab = lower.join('-');
  const snake = lower.join('_');
  const constant = lower.join('_').toUpperCase();
  const pascal = lower.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join('');
  const camel = pascal ? pascal.charAt(0).toLowerCase() + pascal.slice(1) : '';

  return [
    \`SEO URL Slug (kebab-case) : \${kebab}\`,
    \`camelCase                 : \${camel}\`,
    \`PascalCase                : \${pascal}\`,
    \`snake_case                : \${snake}\`,
    \`CONSTANT_CASE             : \${constant}\`,
  ].join('\\n');
}
`,
  },
  {
    slug: 'number-to-roman',
    category: 'Text & Data',
    h1: 'Number to Roman Numeral Converter',
    shortDesc: 'Convert standard integers (`1` to `3999`) into classical Roman numerals (`MMXXVI`) and vice versa.',
    outputExtension: 'txt',
    outputMimeType: 'text/plain',
    sampleInput: '2026\n100\n49',
    sourceCode: `const ROMAN_PAIRS: Array<[number, string]> = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
  [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
  [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];

function intToRoman(num: number): string {
  if (num < 1 || num > 3999 || !Number.isInteger(num)) {
    return \`[Out of range 1..3999: \${num}]\`;
  }
  let n = num;
  let out = '';
  for (const [val, sym] of ROMAN_PAIRS) {
    while (n >= val) { out += sym; n -= val; }
  }
  return out;
}

export function convertNumberToRoman(input: string): string {
  if (!input.trim()) return '';
  return input
    .trim()
    .split(/\\r?\\n/)
    .map((line) => {
      const t = line.trim();
      if (/^\\d+$/.test(t)) return \`\${t} = \${intToRoman(Number(t))}\`;
      return t;
    })
    .join('\\n');
}
`,
  },
  {
    slug: 'unix-timestamp-to-date',
    category: 'Text & Data',
    h1: 'Unix Timestamp to ISO Date Converter',
    shortDesc: 'Convert Unix Epoch timestamps (seconds or milliseconds) into ISO-8601, UTC, and local browser dates.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: '1792986515',
    sourceCode: `export function convertUnixTimestampToDate(input: string): string {
  const trimmed = input.trim();
  if (!trimmed) return '';
  const num = Number(trimmed);
  const d = !Number.isNaN(num)
    ? new Date(trimmed.length <= 10 ? num * 1000 : num)
    : new Date(trimmed);

  if (Number.isNaN(d.getTime())) {
    throw new Error('Invalid Unix timestamp or date string.');
  }

  return JSON.stringify(
    {
      unixSeconds: Math.floor(d.getTime() / 1000),
      unixMilliseconds: d.getTime(),
      iso8601: d.toISOString(),
      utcString: d.toUTCString(),
      localString: d.toString(),
    },
    null,
    2
  );
}
`,
  },
  {
    slug: 'jwt-decoder',
    category: 'Text & Data',
    h1: 'JWT Token Header & Payload Decoder',
    shortDesc: 'Inspect and decode JSON Web Token (`JWT`) Base64URL headers, claims, and expiration timestamps 100% client-side.',
    outputExtension: 'json',
    outputMimeType: 'application/json',
    sampleInput: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMTAwIiwiaXNzIjoiY29udmVydC5teS5pZCIsImNsaWVudFNpZGUiOnRydWUsImlhdCI6MTc5Mjk4NjUxNX0.signature_part',
    sourceCode: `function decodeBase64Url(segment: string): unknown {
  const norm = segment.replace(/-/g, '+').replace(/_/g, '/');
  const pad = norm.length % 4;
  const padded = pad === 2 ? norm + '==' : pad === 3 ? norm + '=' : norm;
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const jsonStr = new TextDecoder('utf-8').decode(bytes);
  return JSON.parse(jsonStr);
}

export function convertJwtDecoder(input: string): string {
  const token = input.trim().replace(/^Bearer\\s+/i, '');
  if (!token) return '';
  const parts = token.split('.');
  if (parts.length < 2) {
    throw new Error('Invalid JWT format. Expected header.payload.signature segments.');
  }
  const header = decodeBase64Url(parts[0]);
  const payload = decodeBase64Url(parts[1]);
  return JSON.stringify(
    {
      header,
      payload,
      signaturePresent: Boolean(parts[2]),
      verifiedClientSideNote: 'Decoded locally on convert.my.id without sending secret tokens over the network.',
    },
    null,
    2
  );
}
`,
  },
];

// Verify exact 100 count
if (TOOLS_SPEC.length !== 100) {
  throw new Error(`Expected 100 tools, found ${TOOLS_SPEC.length}`);
}

// ============================================================================
// GENERATE METADATA, 100 .TS FILES, data/converters.json & lib/converters/index.ts
// ============================================================================

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(LIB_CONVERTERS_DIR)) {
  fs.mkdirSync(LIB_CONVERTERS_DIR, { recursive: true });
}

// Clean up any legacy camelCase files from previous iterations so only exact 100 [slug].ts + index.ts remain
const legacyFiles = ['jsonToTs.ts', 'pxToRem.ts', 'base64.ts', 'markdownToHtml.ts', 'imageToWebp.ts'];
for (const legacy of legacyFiles) {
  const p = path.join(LIB_CONVERTERS_DIR, legacy);
  if (fs.existsSync(p)) fs.unlinkSync(p);
}

const convertersJsonArray = [];
const indexImports = [];
const indexExports = [];
const textRegistryEntries = [];
const imageRegistryEntries = [];
const sampleInputsEntries = [];

for (const tool of TOOLS_SPEC) {
  const fnName = slugToFuncName(tool.slug);
  const isImage = Boolean(tool.isImageTool);

  // Build SEO metadata object for data/converters.json
  const seoEntry = {
    slug: tool.slug,
    title: `${tool.h1} Online (Free & Private) | convert.my.id`,
    metaDescription: `${tool.shortDesc} 100% client-side processing on convert.my.id — your files and data never leave your browser.`,
    h1: tool.h1,
    category: tool.category,
    shortDesc: tool.shortDesc,
    outputExtension: tool.outputExtension,
    outputMimeType: tool.outputMimeType,
    faqs: [
      {
        question: `How does the ${tool.h1} on convert.my.id work?`,
        answer: `${tool.shortDesc} All transformations execute directly inside your browser using native Web APIs with zero server latency.`,
      },
      {
        question: `Is my data safe when using ${tool.h1}?`,
        answer: `Yes. convert.my.id operates on a strict 100% client-side architecture. Your input files, code, and strings never leave your device and are never uploaded to any remote server.`,
      },
      {
        question: `Is ${tool.h1} completely free to use?`,
        answer: `Yes, all 100 developer, image, CSS, and data utilities on convert.my.id are 100% free with no daily limits or watermarks.`,
      },
    ],
  };

  convertersJsonArray.push(seoEntry);

  // Generate physical TypeScript module in lib/converters/[slug].ts
  const tsFilePath = path.join(LIB_CONVERTERS_DIR, `${tool.slug}.ts`);
  const tsSource = isImage
    ? createCanvasImageConverterSource(tool.slug, fnName, tool.canvasConfig)
    : tool.sourceCode;

  fs.writeFileSync(tsFilePath, tsSource, 'utf8');

  // Register in lib/converters/index.ts
  indexImports.push(`import { ${fnName} } from './${tool.slug}';`);
  indexExports.push(`  ${fnName},`);

  if (isImage) {
    imageRegistryEntries.push(`  '${tool.slug}': ${fnName},`);
  } else {
    textRegistryEntries.push(`  '${tool.slug}': ${fnName},`);
    sampleInputsEntries.push(`  '${tool.slug}': ${JSON.stringify(tool.sampleInput ?? '')},`);
  }
}

// Write data/converters.json (100 objects)
fs.writeFileSync(
  path.join(DATA_DIR, 'converters.json'),
  JSON.stringify(convertersJsonArray, null, 2) + '\n',
  'utf8'
);

// Write lib/converters/index.ts
const indexTsContent = `/**
 * Unified Registry for all 100 Client-Side Converters on convert.my.id.
 * Auto-generated via \`node generate_tools.mjs\`.
 */

import convertersRaw from '@/data/converters.json';
import type {
  ConversionResult,
  ConverterTool,
  ImageConversionOptions,
  TextConversionOptions,
  WebPConversionResult,
} from '@/types/converter';

${indexImports.join('\n')}

export {
${indexExports.join('\n')}
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

export const TEXT_CONVERTER_REGISTRY: Record<string, TextConverterFn> = {
${textRegistryEntries.join('\n')}
};

export const IMAGE_CONVERTER_REGISTRY: Record<string, ImageConverterFn> = {
${imageRegistryEntries.join('\n')}
};

export function isImageConverterSlug(slug: string): boolean {
  return slug in IMAGE_CONVERTER_REGISTRY;
}

export const SAMPLE_INPUTS: Record<string, string> = {
${sampleInputsEntries.join('\n')}
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

/**
 * Generates an in-memory 1200x720 sample PNG File via HTML5 Canvas for 1-click testing of any Image & Media converter.
 */
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

  const radial = ctx.createRadialGradient(920, 220, 20, 920, 220, 280);
  radial.addColorStop(0, 'rgba(56, 189, 248, 0.85)');
  radial.addColorStop(1, 'rgba(56, 189, 248, 0)');
  ctx.fillStyle = radial;
  ctx.beginPath();
  ctx.arc(920, 220, 280, 0, Math.PI * 2);
  ctx.fill();

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

fs.writeFileSync(path.join(LIB_CONVERTERS_DIR, 'index.ts'), indexTsContent, 'utf8');

console.log('✅ Successfully generated:');
console.log('   - 100 TypeScript converter modules in lib/converters/*.ts');
console.log('   - 100 SEO tool entries in data/converters.json');
console.log('   - Unified registry in lib/converters/index.ts');
