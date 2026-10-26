'use client';

import MonetagBanner from '@/components/MonetagBanner';
import {
  SAMPLE_INPUTS,
  generateSample3DObjFile,
  generateSampleAudioWavFile,
  generateSamplePngFile,
  isAudioVideoConverterSlug,
  isImageConverterSlug,
  isModel3DConverterSlug,
  runAudioVideoConversion,
  runImageConversion,
  runModel3DConversion,
  runTextConversion,
} from '@/lib/converters';
import type {
  BinaryFileConversionResult,
  ConverterTool,
  TextConversionOptions,
  WebPConversionResult,
} from '@/types/converter';
import {
  AlertCircle,
  Box,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  FileCode,
  Film,
  Image as ImageIcon,
  Play,
  RotateCcw,
  Sliders,
  Sparkles,
  Upload,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ConverterWorkspaceProps {
  tool: ConverterTool;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

/**
 * User-Friendly Client-Side Converter Workspace for convert.my.id.
 * Designed with a clean, approachable UI for both everyday users and developers.
 */
export default function ConverterWorkspace({ tool }: ConverterWorkspaceProps) {
  const isImageConverter = isImageConverterSlug(tool.slug);
  const isAudioVideoConverter = isAudioVideoConverterSlug(tool.slug);
  const isModel3DConverter = isModel3DConverterSlug(tool.slug);
  const isBinaryFileTool =
    isImageConverter || isAudioVideoConverter || isModel3DConverter;

  // --- Text / Code / CSS / Data Converter State ---
  const [input, setInput] = useState<string>(
    () => SAMPLE_INPUTS[tool.slug] ?? ''
  );
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [copied, setCopied] = useState<boolean>(false);

  const [options, setOptions] = useState<TextConversionOptions>({
    rootInterfaceName: 'RootInterface',
    exportInterfaces: true,
    optionalFields: false,
    baseFontSize: 16,
    precision: 4,
    direction: 'px-to-rem',
    mode: 'encode',
    urlSafe: false,
    fullHtmlDocument: false,
  });

  const [mdViewMode, setMdViewMode] = useState<'code' | 'preview'>('code');

  // --- File-based Converter State (Image / Audio & Video / 3D) ---
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sourcePreviewUrl, setSourcePreviewUrl] = useState<string | null>(null);
  const [imageQuality, setImageQuality] = useState<number>(85);
  const [maxWidth, setMaxWidth] = useState<string>('');
  const [recenter3D, setRecenter3D] = useState<boolean>(true);
  const [imageResult, setImageResult] = useState<WebPConversionResult | null>(
    null
  );
  const [binaryResult, setBinaryResult] =
    useState<BinaryFileConversionResult | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRunTextConversion = useCallback(
    (sourceText: string, currentOpts: TextConversionOptions) => {
      if (isBinaryFileTool) return;
      const res = runTextConversion(tool.slug, sourceText, currentOpts);
      setOutput(res.output);
      setError(res.error);
    },
    [isBinaryFileTool, tool.slug]
  );

  useEffect(() => {
    if (!isBinaryFileTool) {
      handleRunTextConversion(input, options);
    }
  }, [input, options, isBinaryFileTool, handleRunTextConversion]);

  const handleRunFileConversion = useCallback(
    async (fileToConvert: File | null) => {
      if (!fileToConvert) return;
      setIsProcessingFile(true);
      setError(undefined);
      setProgressPercent(15);

      try {
        if (isImageConverter) {
          const parsedMaxW = maxWidth ? parseInt(maxWidth, 10) : undefined;
          const res = await runImageConversion(tool.slug, fileToConvert, {
            quality: imageQuality / 100,
            maxWidth:
              parsedMaxW && !Number.isNaN(parsedMaxW) && parsedMaxW > 0
                ? parsedMaxW
                : undefined,
          });
          setImageResult((prev) => {
            if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
            return res;
          });
        } else if (isAudioVideoConverter) {
          const res = await runAudioVideoConversion(tool.slug, fileToConvert, {
            onProgress: (pct) => {
              setProgressPercent(pct);
            },
          });
          setBinaryResult((prev) => {
            if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
            return res;
          });
        } else if (isModel3DConverter) {
          const res = await runModel3DConversion(tool.slug, fileToConvert, {
            recenterOrigin: recenter3D,
            computeVertexNormals: true,
          });
          setBinaryResult((prev) => {
            if (prev?.objectUrl) URL.revokeObjectURL(prev.objectUrl);
            return res;
          });
        }
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to convert this file. Please try another file.'
        );
      } finally {
        setIsProcessingFile(false);
        setProgressPercent(0);
      }
    },
    [
      isImageConverter,
      isAudioVideoConverter,
      isModel3DConverter,
      tool.slug,
      imageQuality,
      maxWidth,
      recenter3D,
    ]
  );

  useEffect(() => {
    if ((isImageConverter || isModel3DConverter) && selectedFile) {
      void handleRunFileConversion(selectedFile);
    }
  }, [
    isImageConverter,
    isModel3DConverter,
    selectedFile,
    handleRunFileConversion,
  ]);

  useEffect(() => {
    if (isImageConverter && !selectedFile) {
      void (async () => {
        try {
          const sample = await generateSamplePngFile();
          setSourcePreviewUrl(URL.createObjectURL(sample));
          setSelectedFile(sample);
        } catch {
          // Ignore SSR
        }
      })();
    } else if (isModel3DConverter && !selectedFile) {
      try {
        const sample3d = generateSample3DObjFile();
        setSelectedFile(sample3d);
      } catch {
        // Ignore SSR
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isImageConverter, isModel3DConverter]);

  const handleFileSelect = (file: File | undefined) => {
    if (!file) return;
    setError(undefined);
    if (sourcePreviewUrl) URL.revokeObjectURL(sourcePreviewUrl);
    if (
      file.type.startsWith('image/') ||
      file.type.startsWith('video/') ||
      file.type.startsWith('audio/')
    ) {
      setSourcePreviewUrl(URL.createObjectURL(file));
    } else {
      setSourcePreviewUrl(null);
    }
    setSelectedFile(file);
  };

  const handleCopy = async () => {
    const textToCopy = isImageConverter
      ? imageResult?.textOutput ?? imageResult?.dataUrl ?? ''
      : isModel3DConverter
      ? binaryResult?.summaryText ?? ''
      : output;
    if (!textToCopy) return;
    await navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (isImageConverter && imageResult) {
      const baseName = selectedFile
        ? selectedFile.name.replace(/\.[^.]+$/, '')
        : tool.slug;
      const ext = imageResult.outputExtension ?? tool.outputExtension ?? 'webp';
      const link = document.createElement('a');
      link.href = imageResult.objectUrl;
      link.download = `${baseName}-convert.my.id.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if ((isAudioVideoConverter || isModel3DConverter) && binaryResult) {
      const baseName = selectedFile
        ? selectedFile.name.replace(/\.[^.]+$/, '')
        : tool.slug;
      const link = document.createElement('a');
      link.href = binaryResult.objectUrl;
      link.download = `${baseName}-convert.my.id.${binaryResult.outputExtension}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return;
    }

    if (!output) return;
    const ext = tool.outputExtension ?? 'txt';
    const mime = tool.outputMimeType ?? 'text/plain';
    const blob = new Blob([output], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${tool.slug}-convert.my.id.${ext}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadSample = async () => {
    setError(undefined);
    if (isImageConverter) {
      const sampleFile = await generateSamplePngFile();
      if (sourcePreviewUrl) URL.revokeObjectURL(sourcePreviewUrl);
      setSourcePreviewUrl(URL.createObjectURL(sampleFile));
      setSelectedFile(sampleFile);
      return;
    }
    if (isAudioVideoConverter) {
      const sampleWav = generateSampleAudioWavFile();
      if (sourcePreviewUrl) URL.revokeObjectURL(sourcePreviewUrl);
      setSourcePreviewUrl(URL.createObjectURL(sampleWav));
      setSelectedFile(sampleWav);
      void handleRunFileConversion(sampleWav);
      return;
    }
    if (isModel3DConverter) {
      const sampleObj = generateSample3DObjFile();
      setSelectedFile(sampleObj);
      return;
    }
    setInput(SAMPLE_INPUTS[tool.slug] ?? '');
  };

  const handleClear = () => {
    setError(undefined);
    if (isBinaryFileTool) {
      if (sourcePreviewUrl) URL.revokeObjectURL(sourcePreviewUrl);
      setSourcePreviewUrl(null);
      setSelectedFile(null);
      setImageResult(null);
      setBinaryResult(null);
      return;
    }
    setInput('');
    setOutput('');
  };

  const hasResult = isImageConverter
    ? Boolean(imageResult)
    : isAudioVideoConverter || isModel3DConverter
    ? Boolean(binaryResult)
    : Boolean(output);

  const outputSizeBytes = isImageConverter
    ? imageResult?.webpBytes ?? 0
    : isAudioVideoConverter || isModel3DConverter
    ? binaryResult?.outputBytes ?? 0
    : new Blob([output]).size;

  const targetExtension = (
    imageResult?.outputExtension ??
    binaryResult?.outputExtension ??
    tool.outputExtension ??
    'file'
  ).toUpperCase();

  return (
    <div className="space-y-6">
      {/* =====================================================================
          SIMPLE SETTINGS BAR
          ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Sliders className="h-4 w-4 text-brand-500" />
            <span>Settings</span>
          </div>

          {(tool.slug === 'px-to-rem' ||
            tool.slug === 'rem-to-px' ||
            tool.slug === 'px-to-em' ||
            tool.slug === 'em-to-px') && (
            <label className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
              <span className="font-medium">Base Font Size (px):</span>
              <input
                type="number"
                min={1}
                max={100}
                value={options.baseFontSize ?? 16}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    baseFontSize: Number(e.target.value) || 16,
                  }))
                }
                className="w-20 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </label>
          )}

          {isModel3DConverter && (
            <label className="inline-flex cursor-pointer items-center gap-2 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={recenter3D}
                onChange={(e) => setRecenter3D(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
              />
              <span>Auto-center 3D model position</span>
            </label>
          )}

          {isAudioVideoConverter && (
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Select your media file below and click Convert Now
            </span>
          )}

          {isImageConverter && (
            <div className="flex flex-wrap items-center gap-5 text-xs sm:text-sm">
              <label className="flex items-center gap-3 text-slate-700 dark:text-slate-300">
                <span className="font-medium">
                  Image Quality:{' '}
                  <strong className="text-brand-600 dark:text-brand-400">
                    {imageQuality}%
                  </strong>
                </span>
                <input
                  type="range"
                  min={10}
                  max={100}
                  value={imageQuality}
                  onChange={(e) => setImageQuality(Number(e.target.value))}
                  className="h-2 w-32 cursor-pointer appearance-none rounded-lg bg-slate-200 accent-brand-600 dark:bg-slate-700"
                />
              </label>

              <label className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <span className="font-medium">Resize Width (optional):</span>
                <input
                  type="number"
                  placeholder="Auto"
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(e.target.value)}
                  className="w-24 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </label>
            </div>
          )}

          {tool.slug === 'markdown-to-html' && (
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 dark:border-slate-700 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setMdViewMode('code')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold ${
                  mdViewMode === 'code'
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <FileCode className="h-3.5 w-3.5" />
                HTML Code
              </button>
              <button
                type="button"
                onClick={() => setMdViewMode('preview')}
                className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold ${
                  mdViewMode === 'preview'
                    ? 'bg-brand-600 text-white'
                    : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
                Visual Preview
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => void handleLoadSample()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            <Sparkles className="h-3.5 w-3.5 text-brand-500" />
            Try Sample
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-rose-50 hover:text-rose-600 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-400 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
        </div>
      </div>

      {/* =====================================================================
          DUAL-PANE CONVERTER WORKSPACE
          ===================================================================== */}
      {isBinaryFileTool ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left Panel: Upload / Original File */}
          <div className="flex flex-col rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-3.5 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                1. Original File
              </span>
              {selectedFile && (
                <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  {formatBytes(selectedFile.size)}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col justify-center p-5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                  handleFileSelect(e.dataTransfer.files?.[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`group relative flex min-h-[320px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 text-center transition-all ${
                  isDragging
                    ? 'border-brand-500 bg-brand-500/5'
                    : 'border-slate-300 bg-slate-50/50 hover:border-brand-500/60 hover:bg-slate-100/50 dark:border-slate-700 dark:bg-slate-950/50 dark:hover:border-brand-500/60'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={(e) => handleFileSelect(e.target.files?.[0])}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="w-full max-w-md space-y-4">
                    {sourcePreviewUrl && isImageConverter && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={sourcePreviewUrl}
                        alt="Original file preview"
                        className="mx-auto max-h-52 rounded-xl border border-slate-200 object-contain shadow-sm dark:border-slate-800"
                      />
                    )}
                    {sourcePreviewUrl &&
                      isAudioVideoConverter &&
                      selectedFile.type.startsWith('audio/') && (
                        <audio
                          controls
                          src={sourcePreviewUrl}
                          onClick={(e) => e.stopPropagation()}
                          className="mx-auto w-full"
                        />
                      )}
                    {sourcePreviewUrl &&
                      isAudioVideoConverter &&
                      selectedFile.type.startsWith('video/') && (
                        <video
                          controls
                          src={sourcePreviewUrl}
                          onClick={(e) => e.stopPropagation()}
                          className="mx-auto max-h-52 rounded-xl"
                        />
                      )}
                    <div className="rounded-xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">
                        {selectedFile.name}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                        Size: {formatBytes(selectedFile.size)}
                      </p>
                    </div>
                    <p className="text-xs font-medium text-brand-600 dark:text-brand-400">
                      Click here or drop another file to change
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-600 dark:text-brand-400">
                      <Upload className="h-7 w-7" />
                    </div>
                    <div>
                      <p className="text-base font-semibold text-slate-900 dark:text-white">
                        Choose a file or drag &amp; drop it here
                      </p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        Your file stays private on your device
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Panel: Clean Media Player / Image Preview / Ready Card */}
          <div className="flex flex-col rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-3.5 dark:border-slate-800">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                2. Converted Result
              </span>
              {hasResult && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                  Conversion Complete • {formatBytes(outputSizeBytes)}
                </span>
              )}
            </div>

            <div className="flex flex-1 flex-col items-center justify-center p-6">
              {error ? (
                <div className="w-full max-w-md rounded-2xl border border-rose-200 bg-rose-50/70 p-5 text-center text-sm text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
                  <AlertCircle className="mx-auto mb-2 h-6 w-6 text-rose-500" />
                  <p className="font-semibold">Unable to Convert File</p>
                  <p className="mt-1 text-xs opacity-90">{error}</p>
                </div>
              ) : isProcessingFile ? (
                <div className="w-full max-w-xs space-y-3 py-12 text-center">
                  <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full rounded-full bg-brand-600 transition-all duration-300"
                      style={{ width: `${Math.max(20, progressPercent)}%` }}
                    />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                    Converting your file...
                  </p>
                </div>
              ) : isImageConverter && imageResult ? (
                <div className="flex w-full max-w-md flex-col items-center justify-center space-y-5 text-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imageResult.objectUrl}
                    alt="Converted result"
                    className="mx-auto max-h-56 rounded-xl border border-slate-200 object-contain shadow-sm dark:border-slate-800"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      Conversion Complete!
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      New file size:{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {formatBytes(imageResult.webpBytes)}
                      </strong>{' '}
                      ({imageResult.width} × {imageResult.height} px)
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-500 active:scale-[0.99]"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download {targetExtension} File</span>
                  </button>
                </div>
              ) : (isAudioVideoConverter || isModel3DConverter) &&
                binaryResult ? (
                <div className="flex w-full max-w-md flex-col items-center justify-center space-y-5 text-center">
                  {isAudioVideoConverter &&
                    binaryResult.outputMimeType.startsWith('audio/') && (
                      <div className="w-full rounded-2xl border border-slate-200/80 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/60">
                        <Film className="mx-auto mb-3 h-8 w-8 text-brand-500" />
                        <audio
                          controls
                          src={binaryResult.objectUrl}
                          className="mx-auto w-full"
                        />
                      </div>
                    )}

                  {isAudioVideoConverter &&
                    binaryResult.outputMimeType.startsWith('video/') && (
                      <video
                        controls
                        src={binaryResult.objectUrl}
                        className="mx-auto max-h-56 w-full rounded-xl border border-slate-200 bg-black shadow-sm dark:border-slate-800"
                      />
                    )}

                  {isAudioVideoConverter &&
                    binaryResult.outputMimeType === 'image/gif' && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={binaryResult.objectUrl}
                        alt="Converted Animated GIF"
                        className="mx-auto max-h-56 rounded-xl border border-slate-200 object-contain shadow-sm dark:border-slate-800"
                      />
                    )}

                  {isModel3DConverter && (
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Box className="h-10 w-10" />
                    </div>
                  )}

                  <div className="space-y-1">
                    <p className="text-base font-bold text-slate-900 dark:text-white">
                      Conversion Complete!
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Output format: <strong>.{targetExtension}</strong> • Size:{' '}
                      <strong className="text-emerald-600 dark:text-emerald-400">
                        {formatBytes(binaryResult.outputBytes)}
                      </strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleDownload}
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:bg-emerald-500 active:scale-[0.99]"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download {targetExtension} File</span>
                  </button>
                </div>
              ) : (
                <div className="flex min-h-[300px] flex-col items-center justify-center text-center text-slate-400">
                  {isAudioVideoConverter ? (
                    <Film className="h-11 w-11 opacity-35" />
                  ) : isModel3DConverter ? (
                    <Box className="h-11 w-11 opacity-35" />
                  ) : (
                    <ImageIcon className="h-11 w-11 opacity-35" />
                  )}
                  <p className="mt-3 text-sm font-medium text-slate-600 dark:text-slate-300">
                    Ready to Convert
                  </p>
                  <p className="mt-1 max-w-xs text-xs text-slate-400">
                    Upload a file on the left and click &ldquo;Convert
                    Now&rdquo; to see your result here.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TEXT / CODE / CSS / DATA DUAL-PANE INTERFACE */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-3.5 dark:border-slate-800">
              <label
                htmlFor="converter-input"
                className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
              >
                {tool.inputLabel ?? '1. Input'}
              </label>
              <span className="text-xs text-slate-400">
                {formatBytes(new Blob([input]).size)}
              </span>
            </div>
            <textarea
              id="converter-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              spellCheck={false}
              placeholder="Paste or type your text here..."
              className="min-h-[360px] w-full flex-1 resize-y rounded-b-2xl bg-transparent p-5 font-mono text-xs leading-relaxed text-slate-900 placeholder-slate-400 focus:outline-none dark:text-slate-100 dark:placeholder-slate-600 sm:text-sm"
            />
          </div>

          <div className="flex flex-col rounded-2xl border border-slate-200/90 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
            <div className="flex items-center justify-between border-b border-slate-200/80 px-5 py-3.5 dark:border-slate-800">
              <label
                htmlFor="converter-output"
                className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300"
              >
                {tool.outputLabel ?? '2. Converted Result'}
              </label>
              {hasResult && !error && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Conversion Complete ({formatBytes(outputSizeBytes)})
                </span>
              )}
            </div>

            {error ? (
              <div className="flex min-h-[360px] flex-1 flex-col items-start justify-start gap-2 rounded-b-2xl bg-rose-50/60 p-5 text-rose-700 dark:bg-rose-950/20 dark:text-rose-300">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>Please check your input</span>
                </div>
                <p className="text-xs leading-relaxed">{error}</p>
              </div>
            ) : tool.slug === 'markdown-to-html' &&
              mdViewMode === 'preview' ? (
              <div
                className="prose prose-slate dark:prose-invert min-h-[360px] max-w-none flex-1 overflow-auto p-5 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: output }}
              />
            ) : (
              <textarea
                id="converter-output"
                readOnly
                value={output}
                spellCheck={false}
                placeholder="Your converted result will appear here..."
                className="min-h-[360px] w-full flex-1 resize-y rounded-b-2xl bg-slate-50/50 p-5 font-mono text-xs leading-relaxed text-slate-900 focus:outline-none dark:bg-slate-950/40 dark:text-emerald-300 sm:text-sm"
              />
            )}
          </div>
        </div>
      )}

      {/* =====================================================================
          PRIMARY ACTION BUTTONS BAR (Clear & Cohesive Call-To-Action)
          ===================================================================== */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/90">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() =>
              isBinaryFileTool
                ? void handleRunFileConversion(selectedFile)
                : handleRunTextConversion(input, options)
            }
            disabled={isProcessingFile}
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-brand-500/25 transition-all hover:bg-brand-500 active:scale-[0.99] disabled:opacity-60"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>{isProcessingFile ? 'Converting...' : 'Convert Now'}</span>
          </button>

          <button
            type="button"
            onClick={handleDownload}
            disabled={!hasResult}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-40 ${
              hasResult
                ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-500/25 hover:bg-emerald-500'
                : 'border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200'
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Download {targetExtension}</span>
          </button>

          {!isAudioVideoConverter && (
            <button
              type="button"
              onClick={() => void handleCopy()}
              disabled={!hasResult}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Copied!
                  </span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Result</span>
                </>
              )}
            </button>
          )}
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          100% Free &amp; Private • Files stay on your device
        </p>
      </div>

      {/* =====================================================================
          MONETAG NATIVE BANNER PLACEMENT (Below Download / Copy Buttons)
          ===================================================================== */}
      <div className="pt-2">
        <MonetagBanner zoneId="ISI_ZONE_ID_NANTI" />
      </div>
    </div>
  );
}
