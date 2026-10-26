/**
 * Core TypeScript definitions for convert.my.id (150 Client-Side Tools across 6 Categories).
 */

export type ToolCategory =
  | 'Code & Dev'
  | 'Image & Media'
  | 'CSS & Unit'
  | 'Text & Data'
  | 'Audio & Video'
  | '3D Model & AR';

export interface ConverterFAQ {
  question: string;
  answer: string;
}

export interface ConverterTool {
  /** URL-friendly identifier mapped to /convert/[slug] */
  slug: string;
  /** SEO <title> tag content */
  title: string;
  /** SEO <meta name="description"> content */
  metaDescription: string;
  /** Primary page heading <h1> */
  h1: string;
  /** Category used for Hub grouping and filtering */
  category: ToolCategory;
  /** Concise summary displayed on the Hub tool card */
  shortDesc: string;
  /** Array of FAQ items rendered in semantic <details> tags & FAQPage JSON-LD */
  faqs: ConverterFAQ[];
  /** Optional custom labels and file export metadata */
  inputLabel?: string;
  outputLabel?: string;
  outputExtension?: string;
  outputMimeType?: string;
  keywords?: string[];
}

export interface TextConversionOptions {
  rootInterfaceName?: string;
  exportInterfaces?: boolean;
  optionalFields?: boolean;
  baseFontSize?: number;
  precision?: number;
  direction?: 'px-to-rem' | 'rem-to-px';
  mode?: 'encode' | 'decode';
  urlSafe?: boolean;
  fullHtmlDocument?: boolean;
}

export interface ImageConversionOptions {
  quality?: number;
  maxWidth?: number;
  backgroundColor?: string | null;
}

export interface AudioVideoConversionOptions {
  onProgress?: (progressPercent: number, statusMessage?: string) => void;
  audioBitrate?: string;
}

export interface Model3DConversionOptions {
  binary?: boolean;
  recenterOrigin?: boolean;
  computeVertexNormals?: boolean;
}

export interface ConversionResult {
  output: string;
  error?: string;
  executionTimeMs: number;
  stats?: {
    inputBytes: number;
    outputBytes: number;
    summary?: string;
  };
}

export interface WebPConversionResult {
  blob: Blob;
  objectUrl: string;
  dataUrl: string;
  width: number;
  height: number;
  originalBytes: number;
  webpBytes: number;
  compressionRatioPercent: number;
  executionTimeMs: number;
  outputExtension?: string;
  outputMimeType?: string;
  textOutput?: string;
}

export interface BinaryFileConversionResult {
  blob: Blob;
  objectUrl: string;
  originalBytes: number;
  outputBytes: number;
  executionTimeMs: number;
  outputExtension: string;
  outputMimeType: string;
  summaryText?: string;
}
