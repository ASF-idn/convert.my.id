import type { ImageConversionOptions, WebPConversionResult } from '@/types/converter';

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
 * Client-side HTML5 Canvas Converter for `webp-to-png` (convert.my.id).
 */
export async function convertWebpToPng(
  file: File,
  options: ImageConversionOptions = {}
): Promise<WebPConversionResult> {
  const startTime = performance.now();
  const quality = Math.min(1, Math.max(0.05, options.quality ?? 1));
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

  const bgFill = options.backgroundColor ?? null;
  if (bgFill) {
    ctx.fillStyle = bgFill;
    ctx.fillRect(0, 0, width, height);
  } else {
    ctx.clearRect(0, 0, width, height);
  }

  const filterMode: string = 'none';
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
      textOutput = lines.join('\n');
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
        .map(([hex, count], i) => `--palette-color-${i + 1}: ${hex}; /* Weight: ${count} */`);
      textOutput = `:root {\n  ${topColors.join('\n  ')}\n}`;
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
        'image/png',
        quality
      );
    });
  }

  const dataUrl = canvas.toDataURL('image/png', quality);
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
    outputExtension: 'png',
    outputMimeType: 'image/png',
    textOutput,
  };
}
