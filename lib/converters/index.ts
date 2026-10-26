/**
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

import { convertJsonToTypescript } from './json-to-typescript';
import { convertTypescriptToJavascript } from './typescript-to-javascript';
import { convertYamlToJson } from './yaml-to-json';
import { convertJsonToYaml } from './json-to-yaml';
import { convertXmlToJson } from './xml-to-json';
import { convertJsonToXml } from './json-to-xml';
import { convertJsonToZod } from './json-to-zod';
import { convertJsonToGraphql } from './json-to-graphql';
import { convertJsonToGoStruct } from './json-to-go-struct';
import { convertJsonToRustStruct } from './json-to-rust-struct';
import { convertJsonToPythonDataclass } from './json-to-python-dataclass';
import { convertJsonToSqlTable } from './json-to-sql-table';
import { convertSqlToJson } from './sql-to-json';
import { convertHtmlToJsx } from './html-to-jsx';
import { convertJsxToHtml } from './jsx-to-html';
import { convertCurlToFetch } from './curl-to-fetch';
import { convertJsonToJsdoc } from './json-to-jsdoc';
import { convertJsonToJsonSchema } from './json-to-json-schema';
import { convertEnvToJson } from './env-to-json';
import { convertJsonToEnv } from './json-to-env';
import { convertTomlToJson } from './toml-to-json';
import { convertJsonToToml } from './json-to-toml';
import { convertJavascriptToJson } from './javascript-to-json';
import { convertJsonToQueryString } from './json-to-query-string';
import { convertQueryStringToJson } from './query-string-to-json';
import { convertImageToWebp } from './image-to-webp';
import { convertPngToJpg } from './png-to-jpg';
import { convertJpgToPng } from './jpg-to-png';
import { convertPngToWebp } from './png-to-webp';
import { convertJpgToWebp } from './jpg-to-webp';
import { convertWebpToPng } from './webp-to-png';
import { convertWebpToJpg } from './webp-to-jpg';
import { convertSvgToPng } from './svg-to-png';
import { convertSvgToWebp } from './svg-to-webp';
import { convertSvgToJpg } from './svg-to-jpg';
import { convertBmpToPng } from './bmp-to-png';
import { convertBmpToJpg } from './bmp-to-jpg';
import { convertBmpToWebp } from './bmp-to-webp';
import { convertGifToPng } from './gif-to-png';
import { convertGifToWebp } from './gif-to-webp';
import { convertImageToBase64 } from './image-to-base64';
import { convertImageToBmp } from './image-to-bmp';
import { convertImageToIco } from './image-to-ico';
import { convertImageToGrayscale } from './image-to-grayscale';
import { convertImageToSepia } from './image-to-sepia';
import { convertImageToInverted } from './image-to-inverted';
import { convertImageToPixelArt } from './image-to-pixel-art';
import { convertImageToAscii } from './image-to-ascii';
import { convertSvgToDataUri } from './svg-to-data-uri';
import { convertImageToColorPalette } from './image-to-color-palette';
import { convertPxToRem } from './px-to-rem';
import { convertRemToPx } from './rem-to-px';
import { convertPxToEm } from './px-to-em';
import { convertEmToPx } from './em-to-px';
import { convertPxToVw } from './px-to-vw';
import { convertVwToPx } from './vw-to-px';
import { convertPxToVh } from './px-to-vh';
import { convertPxToPt } from './px-to-pt';
import { convertPtToPx } from './pt-to-px';
import { convertHexToRgb } from './hex-to-rgb';
import { convertRgbToHex } from './rgb-to-hex';
import { convertHexToHsl } from './hex-to-hsl';
import { convertHslToHex } from './hsl-to-hex';
import { convertRgbToHsl } from './rgb-to-hsl';
import { convertHslToRgb } from './hsl-to-rgb';
import { convertHexToRgba } from './hex-to-rgba';
import { convertRgbToCmyk } from './rgb-to-cmyk';
import { convertCmykToRgb } from './cmyk-to-rgb';
import { convertHexToOklch } from './hex-to-oklch';
import { convertCssToTailwind } from './css-to-tailwind';
import { convertCssToJsStyles } from './css-to-js-styles';
import { convertJsStylesToCss } from './js-styles-to-css';
import { convertScssToCss } from './scss-to-css';
import { convertCssToMinifiedCss } from './css-to-minified-css';
import { convertMinifiedCssToCss } from './minified-css-to-css';
import { convertStringToBase64 } from './string-to-base64';
import { convertBase64ToString } from './base64-to-string';
import { convertMarkdownToHtml } from './markdown-to-html';
import { convertHtmlToMarkdown } from './html-to-markdown';
import { convertCsvToJson } from './csv-to-json';
import { convertJsonToCsv } from './json-to-csv';
import { convertTsvToJson } from './tsv-to-json';
import { convertJsonToTsv } from './json-to-tsv';
import { convertCsvToMarkdownTable } from './csv-to-markdown-table';
import { convertMarkdownTableToCsv } from './markdown-table-to-csv';
import { convertCsvToHtmlTable } from './csv-to-html-table';
import { convertUrlEncode } from './url-encode';
import { convertUrlDecode } from './url-decode';
import { convertHtmlEntityEncode } from './html-entity-encode';
import { convertHtmlEntityDecode } from './html-entity-decode';
import { convertStringToBinary } from './string-to-binary';
import { convertBinaryToString } from './binary-to-string';
import { convertStringToHex } from './string-to-hex';
import { convertHexToString } from './hex-to-string';
import { convertStringToMorse } from './string-to-morse';
import { convertMorseToString } from './morse-to-string';
import { convertTextToSlug } from './text-to-slug';
import { convertNumberToRoman } from './number-to-roman';
import { convertUnixTimestampToDate } from './unix-timestamp-to-date';
import { convertJwtDecoder } from './jwt-decoder';
import { convertMp4ToMp3 } from './mp4-to-mp3';
import { convertWavToMp3 } from './wav-to-mp3';
import { convertMp3ToWav } from './mp3-to-wav';
import { convertWebmToMp4 } from './webm-to-mp4';
import { convertMp4ToWebm } from './mp4-to-webm';
import { convertVideoToGif } from './video-to-gif';
import { convertM4aToMp3 } from './m4a-to-mp3';
import { convertMp3ToOgg } from './mp3-to-ogg';
import { convertOggToMp3 } from './ogg-to-mp3';
import { convertFlacToMp3 } from './flac-to-mp3';
import { convertFlacToWav } from './flac-to-wav';
import { convertWavToFlac } from './wav-to-flac';
import { convertAacToMp3 } from './aac-to-mp3';
import { convertMp3ToAac } from './mp3-to-aac';
import { convertMovToMp4 } from './mov-to-mp4';
import { convertMkvToMp4 } from './mkv-to-mp4';
import { convertAviToMp4 } from './avi-to-mp4';
import { convertMp4ToWav } from './mp4-to-wav';
import { convertWebmToMp3 } from './webm-to-mp3';
import { convertGifToMp4 } from './gif-to-mp4';
import { convertGifToWebm } from './gif-to-webm';
import { convertAudioTo8dSurround } from './audio-to-8d-surround';
import { convertAudioSpeedChanger } from './audio-speed-changer';
import { convertAudioBassBooster } from './audio-bass-booster';
import { convertVideoMuteRemover } from './video-mute-remover';
import { convertObjToStl } from './obj-to-stl';
import { convertStlToObj } from './stl-to-obj';
import { convertGltfToGlb } from './gltf-to-glb';
import { convertGlbToGltf } from './glb-to-gltf';
import { convertObjToGltf } from './obj-to-gltf';
import { convertObjToGlb } from './obj-to-glb';
import { convertStlToGltf } from './stl-to-gltf';
import { convertStlToGlb } from './stl-to-glb';
import { convertPlyToStl } from './ply-to-stl';
import { convertPlyToObj } from './ply-to-obj';
import { convertPlyToGlb } from './ply-to-glb';
import { convertPlyToGltf } from './ply-to-gltf';
import { convertObjToPly } from './obj-to-ply';
import { convertStlToPly } from './stl-to-ply';
import { convertGltfToObj } from './gltf-to-obj';
import { convertGltfToStl } from './gltf-to-stl';
import { convertGltfToPly } from './gltf-to-ply';
import { convertStlAsciiToBinary } from './stl-ascii-to-binary';
import { convertStlBinaryToAscii } from './stl-binary-to-ascii';
import { convertObjToThreejsJson } from './obj-to-threejs-json';
import { convertStlToThreejsJson } from './stl-to-threejs-json';
import { convertPlyToThreejsJson } from './ply-to-threejs-json';
import { convertObjToWireframeStl } from './obj-to-wireframe-stl';
import { convertModel3dToPointCloudPly } from './model-3d-to-point-cloud-ply';
import { convertModel3dInspectorJson } from './model-3d-inspector-json';
import { convertMp3ToFlac } from './mp3-to-flac';
import { convertMp4ToMov } from './mp4-to-mov';
import { convertMp4ToMkv } from './mp4-to-mkv';
import { convertMp4ToAvi } from './mp4-to-avi';
import { convertWavToMp4 } from './wav-to-mp4';
import { convertOggToWav } from './ogg-to-wav';
import { convertWavToOgg } from './wav-to-ogg';
import { convertFlacToOgg } from './flac-to-ogg';
import { convertOggToFlac } from './ogg-to-flac';
import { convertMp3ToM4a } from './mp3-to-m4a';
import { convertMp3ToMp4 } from './mp3-to-mp4';
import { convertMp3ToWebm } from './mp3-to-webm';
import { convertWavToAac } from './wav-to-aac';
import { convertAacToWav } from './aac-to-wav';
import { convertM4aToWav } from './m4a-to-wav';
import { convertWavToM4a } from './wav-to-m4a';
import { convertWebmToWav } from './webm-to-wav';
import { convertWavToWebm } from './wav-to-webm';
import { convertMovToWebm } from './mov-to-webm';
import { convertWebmToMov } from './webm-to-mov';
import { convertThreejsJsonToObj } from './threejs-json-to-obj';
import { convertThreejsJsonToStl } from './threejs-json-to-stl';
import { convertThreejsJsonToGlb } from './threejs-json-to-glb';
import { convertPngToBmp } from './png-to-bmp';
import { convertJpgToBmp } from './jpg-to-bmp';
import { convertWebpToBmp } from './webp-to-bmp';
import { convertPngToIco } from './png-to-ico';
import { convertIcoToPng } from './ico-to-png';
import { convertTypescriptToJson } from './typescript-to-json';
import { convertJavascriptToTypescript } from './javascript-to-typescript';
import { convertZodToTypescript } from './zod-to-typescript';
import { convertGraphqlToTypescript } from './graphql-to-typescript';
import { convertGoStructToJson } from './go-struct-to-json';
import { convertRustStructToJson } from './rust-struct-to-json';
import { convertPythonDataclassToJson } from './python-dataclass-to-json';
import { convertJsonSchemaToJson } from './json-schema-to-json';
import { convertBase64ToImage } from './base64-to-image';
import { convertDataUriToSvg } from './data-uri-to-svg';
import { convertVhToPx } from './vh-to-px';
import { convertRgbaToHex } from './rgba-to-hex';
import { convertOklchToHex } from './oklch-to-hex';
import { convertTailwindToCss } from './tailwind-to-css';
import { convertCssToScss } from './css-to-scss';
import { convertPxToPc } from './px-to-pc';
import { convertPcToPx } from './pc-to-px';
import { convertHtmlTableToCsv } from './html-table-to-csv';
import { convertSlugToTitle } from './slug-to-title';
import { convertRomanToNumber } from './roman-to-number';
import { convertDateToUnixTimestamp } from './date-to-unix-timestamp';
import { convertJsonToJwt } from './json-to-jwt';

export {
  generateSampleAudioWavFile,
  generateSample3DObjFile,
  convertJsonToTypescript,
  convertTypescriptToJavascript,
  convertYamlToJson,
  convertJsonToYaml,
  convertXmlToJson,
  convertJsonToXml,
  convertJsonToZod,
  convertJsonToGraphql,
  convertJsonToGoStruct,
  convertJsonToRustStruct,
  convertJsonToPythonDataclass,
  convertJsonToSqlTable,
  convertSqlToJson,
  convertHtmlToJsx,
  convertJsxToHtml,
  convertCurlToFetch,
  convertJsonToJsdoc,
  convertJsonToJsonSchema,
  convertEnvToJson,
  convertJsonToEnv,
  convertTomlToJson,
  convertJsonToToml,
  convertJavascriptToJson,
  convertJsonToQueryString,
  convertQueryStringToJson,
  convertImageToWebp,
  convertPngToJpg,
  convertJpgToPng,
  convertPngToWebp,
  convertJpgToWebp,
  convertWebpToPng,
  convertWebpToJpg,
  convertSvgToPng,
  convertSvgToWebp,
  convertSvgToJpg,
  convertBmpToPng,
  convertBmpToJpg,
  convertBmpToWebp,
  convertGifToPng,
  convertGifToWebp,
  convertImageToBase64,
  convertImageToBmp,
  convertImageToIco,
  convertImageToGrayscale,
  convertImageToSepia,
  convertImageToInverted,
  convertImageToPixelArt,
  convertImageToAscii,
  convertSvgToDataUri,
  convertImageToColorPalette,
  convertPxToRem,
  convertRemToPx,
  convertPxToEm,
  convertEmToPx,
  convertPxToVw,
  convertVwToPx,
  convertPxToVh,
  convertPxToPt,
  convertPtToPx,
  convertHexToRgb,
  convertRgbToHex,
  convertHexToHsl,
  convertHslToHex,
  convertRgbToHsl,
  convertHslToRgb,
  convertHexToRgba,
  convertRgbToCmyk,
  convertCmykToRgb,
  convertHexToOklch,
  convertCssToTailwind,
  convertCssToJsStyles,
  convertJsStylesToCss,
  convertScssToCss,
  convertCssToMinifiedCss,
  convertMinifiedCssToCss,
  convertStringToBase64,
  convertBase64ToString,
  convertMarkdownToHtml,
  convertHtmlToMarkdown,
  convertCsvToJson,
  convertJsonToCsv,
  convertTsvToJson,
  convertJsonToTsv,
  convertCsvToMarkdownTable,
  convertMarkdownTableToCsv,
  convertCsvToHtmlTable,
  convertUrlEncode,
  convertUrlDecode,
  convertHtmlEntityEncode,
  convertHtmlEntityDecode,
  convertStringToBinary,
  convertBinaryToString,
  convertStringToHex,
  convertHexToString,
  convertStringToMorse,
  convertMorseToString,
  convertTextToSlug,
  convertNumberToRoman,
  convertUnixTimestampToDate,
  convertJwtDecoder,
  convertMp4ToMp3,
  convertWavToMp3,
  convertMp3ToWav,
  convertWebmToMp4,
  convertMp4ToWebm,
  convertVideoToGif,
  convertM4aToMp3,
  convertMp3ToOgg,
  convertOggToMp3,
  convertFlacToMp3,
  convertFlacToWav,
  convertWavToFlac,
  convertAacToMp3,
  convertMp3ToAac,
  convertMovToMp4,
  convertMkvToMp4,
  convertAviToMp4,
  convertMp4ToWav,
  convertWebmToMp3,
  convertGifToMp4,
  convertGifToWebm,
  convertAudioTo8dSurround,
  convertAudioSpeedChanger,
  convertAudioBassBooster,
  convertVideoMuteRemover,
  convertObjToStl,
  convertStlToObj,
  convertGltfToGlb,
  convertGlbToGltf,
  convertObjToGltf,
  convertObjToGlb,
  convertStlToGltf,
  convertStlToGlb,
  convertPlyToStl,
  convertPlyToObj,
  convertPlyToGlb,
  convertPlyToGltf,
  convertObjToPly,
  convertStlToPly,
  convertGltfToObj,
  convertGltfToStl,
  convertGltfToPly,
  convertStlAsciiToBinary,
  convertStlBinaryToAscii,
  convertObjToThreejsJson,
  convertStlToThreejsJson,
  convertPlyToThreejsJson,
  convertObjToWireframeStl,
  convertModel3dToPointCloudPly,
  convertModel3dInspectorJson,
  convertMp3ToFlac,
  convertMp4ToMov,
  convertMp4ToMkv,
  convertMp4ToAvi,
  convertWavToMp4,
  convertOggToWav,
  convertWavToOgg,
  convertFlacToOgg,
  convertOggToFlac,
  convertMp3ToM4a,
  convertMp3ToMp4,
  convertMp3ToWebm,
  convertWavToAac,
  convertAacToWav,
  convertM4aToWav,
  convertWavToM4a,
  convertWebmToWav,
  convertWavToWebm,
  convertMovToWebm,
  convertWebmToMov,
  convertThreejsJsonToObj,
  convertThreejsJsonToStl,
  convertThreejsJsonToGlb,
  convertPngToBmp,
  convertJpgToBmp,
  convertWebpToBmp,
  convertPngToIco,
  convertIcoToPng,
  convertTypescriptToJson,
  convertJavascriptToTypescript,
  convertZodToTypescript,
  convertGraphqlToTypescript,
  convertGoStructToJson,
  convertRustStructToJson,
  convertPythonDataclassToJson,
  convertJsonSchemaToJson,
  convertBase64ToImage,
  convertDataUriToSvg,
  convertVhToPx,
  convertRgbaToHex,
  convertOklchToHex,
  convertTailwindToCss,
  convertCssToScss,
  convertPxToPc,
  convertPcToPx,
  convertHtmlTableToCsv,
  convertSlugToTitle,
  convertRomanToNumber,
  convertDateToUnixTimestamp,
  convertJsonToJwt,
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
  'json-to-typescript': convertJsonToTypescript,
  'typescript-to-javascript': convertTypescriptToJavascript,
  'yaml-to-json': convertYamlToJson,
  'json-to-yaml': convertJsonToYaml,
  'xml-to-json': convertXmlToJson,
  'json-to-xml': convertJsonToXml,
  'json-to-zod': convertJsonToZod,
  'json-to-graphql': convertJsonToGraphql,
  'json-to-go-struct': convertJsonToGoStruct,
  'json-to-rust-struct': convertJsonToRustStruct,
  'json-to-python-dataclass': convertJsonToPythonDataclass,
  'json-to-sql-table': convertJsonToSqlTable,
  'sql-to-json': convertSqlToJson,
  'html-to-jsx': convertHtmlToJsx,
  'jsx-to-html': convertJsxToHtml,
  'curl-to-fetch': convertCurlToFetch,
  'json-to-jsdoc': convertJsonToJsdoc,
  'json-to-json-schema': convertJsonToJsonSchema,
  'env-to-json': convertEnvToJson,
  'json-to-env': convertJsonToEnv,
  'toml-to-json': convertTomlToJson,
  'json-to-toml': convertJsonToToml,
  'javascript-to-json': convertJavascriptToJson,
  'json-to-query-string': convertJsonToQueryString,
  'query-string-to-json': convertQueryStringToJson,
  'svg-to-data-uri': convertSvgToDataUri,
  'px-to-rem': convertPxToRem,
  'rem-to-px': convertRemToPx,
  'px-to-em': convertPxToEm,
  'em-to-px': convertEmToPx,
  'px-to-vw': convertPxToVw,
  'vw-to-px': convertVwToPx,
  'px-to-vh': convertPxToVh,
  'px-to-pt': convertPxToPt,
  'pt-to-px': convertPtToPx,
  'hex-to-rgb': convertHexToRgb,
  'rgb-to-hex': convertRgbToHex,
  'hex-to-hsl': convertHexToHsl,
  'hsl-to-hex': convertHslToHex,
  'rgb-to-hsl': convertRgbToHsl,
  'hsl-to-rgb': convertHslToRgb,
  'hex-to-rgba': convertHexToRgba,
  'rgb-to-cmyk': convertRgbToCmyk,
  'cmyk-to-rgb': convertCmykToRgb,
  'hex-to-oklch': convertHexToOklch,
  'css-to-tailwind': convertCssToTailwind,
  'css-to-js-styles': convertCssToJsStyles,
  'js-styles-to-css': convertJsStylesToCss,
  'scss-to-css': convertScssToCss,
  'css-to-minified-css': convertCssToMinifiedCss,
  'minified-css-to-css': convertMinifiedCssToCss,
  'string-to-base64': convertStringToBase64,
  'base64-to-string': convertBase64ToString,
  'markdown-to-html': convertMarkdownToHtml,
  'html-to-markdown': convertHtmlToMarkdown,
  'csv-to-json': convertCsvToJson,
  'json-to-csv': convertJsonToCsv,
  'tsv-to-json': convertTsvToJson,
  'json-to-tsv': convertJsonToTsv,
  'csv-to-markdown-table': convertCsvToMarkdownTable,
  'markdown-table-to-csv': convertMarkdownTableToCsv,
  'csv-to-html-table': convertCsvToHtmlTable,
  'url-encode': convertUrlEncode,
  'url-decode': convertUrlDecode,
  'html-entity-encode': convertHtmlEntityEncode,
  'html-entity-decode': convertHtmlEntityDecode,
  'string-to-binary': convertStringToBinary,
  'binary-to-string': convertBinaryToString,
  'string-to-hex': convertStringToHex,
  'hex-to-string': convertHexToString,
  'string-to-morse': convertStringToMorse,
  'morse-to-string': convertMorseToString,
  'text-to-slug': convertTextToSlug,
  'number-to-roman': convertNumberToRoman,
  'unix-timestamp-to-date': convertUnixTimestampToDate,
  'jwt-decoder': convertJwtDecoder,
  'typescript-to-json': convertTypescriptToJson,
  'javascript-to-typescript': convertJavascriptToTypescript,
  'zod-to-typescript': convertZodToTypescript,
  'graphql-to-typescript': convertGraphqlToTypescript,
  'go-struct-to-json': convertGoStructToJson,
  'rust-struct-to-json': convertRustStructToJson,
  'python-dataclass-to-json': convertPythonDataclassToJson,
  'json-schema-to-json': convertJsonSchemaToJson,
  'base64-to-image': convertBase64ToImage,
  'data-uri-to-svg': convertDataUriToSvg,
  'vh-to-px': convertVhToPx,
  'rgba-to-hex': convertRgbaToHex,
  'oklch-to-hex': convertOklchToHex,
  'tailwind-to-css': convertTailwindToCss,
  'css-to-scss': convertCssToScss,
  'px-to-pc': convertPxToPc,
  'pc-to-px': convertPcToPx,
  'html-table-to-csv': convertHtmlTableToCsv,
  'slug-to-title': convertSlugToTitle,
  'roman-to-number': convertRomanToNumber,
  'date-to-unix-timestamp': convertDateToUnixTimestamp,
  'json-to-jwt': convertJsonToJwt,
};

export const IMAGE_CONVERTER_REGISTRY: Record<string, ImageConverterFn> = {
  'image-to-webp': convertImageToWebp,
  'png-to-jpg': convertPngToJpg,
  'jpg-to-png': convertJpgToPng,
  'png-to-webp': convertPngToWebp,
  'jpg-to-webp': convertJpgToWebp,
  'webp-to-png': convertWebpToPng,
  'webp-to-jpg': convertWebpToJpg,
  'svg-to-png': convertSvgToPng,
  'svg-to-webp': convertSvgToWebp,
  'svg-to-jpg': convertSvgToJpg,
  'bmp-to-png': convertBmpToPng,
  'bmp-to-jpg': convertBmpToJpg,
  'bmp-to-webp': convertBmpToWebp,
  'gif-to-png': convertGifToPng,
  'gif-to-webp': convertGifToWebp,
  'image-to-base64': convertImageToBase64,
  'image-to-bmp': convertImageToBmp,
  'image-to-ico': convertImageToIco,
  'image-to-grayscale': convertImageToGrayscale,
  'image-to-sepia': convertImageToSepia,
  'image-to-inverted': convertImageToInverted,
  'image-to-pixel-art': convertImageToPixelArt,
  'image-to-ascii': convertImageToAscii,
  'image-to-color-palette': convertImageToColorPalette,
  'png-to-bmp': convertPngToBmp,
  'jpg-to-bmp': convertJpgToBmp,
  'webp-to-bmp': convertWebpToBmp,
  'png-to-ico': convertPngToIco,
  'ico-to-png': convertIcoToPng,
};

export const AUDIO_VIDEO_CONVERTER_REGISTRY: Record<string, AudioVideoConverterFn> = {
  'mp4-to-mp3': convertMp4ToMp3,
  'wav-to-mp3': convertWavToMp3,
  'mp3-to-wav': convertMp3ToWav,
  'webm-to-mp4': convertWebmToMp4,
  'mp4-to-webm': convertMp4ToWebm,
  'video-to-gif': convertVideoToGif,
  'm4a-to-mp3': convertM4aToMp3,
  'mp3-to-ogg': convertMp3ToOgg,
  'ogg-to-mp3': convertOggToMp3,
  'flac-to-mp3': convertFlacToMp3,
  'flac-to-wav': convertFlacToWav,
  'wav-to-flac': convertWavToFlac,
  'aac-to-mp3': convertAacToMp3,
  'mp3-to-aac': convertMp3ToAac,
  'mov-to-mp4': convertMovToMp4,
  'mkv-to-mp4': convertMkvToMp4,
  'avi-to-mp4': convertAviToMp4,
  'mp4-to-wav': convertMp4ToWav,
  'webm-to-mp3': convertWebmToMp3,
  'gif-to-mp4': convertGifToMp4,
  'gif-to-webm': convertGifToWebm,
  'audio-to-8d-surround': convertAudioTo8dSurround,
  'audio-speed-changer': convertAudioSpeedChanger,
  'audio-bass-booster': convertAudioBassBooster,
  'video-mute-remover': convertVideoMuteRemover,
  'mp3-to-flac': convertMp3ToFlac,
  'mp4-to-mov': convertMp4ToMov,
  'mp4-to-mkv': convertMp4ToMkv,
  'mp4-to-avi': convertMp4ToAvi,
  'wav-to-mp4': convertWavToMp4,
  'ogg-to-wav': convertOggToWav,
  'wav-to-ogg': convertWavToOgg,
  'flac-to-ogg': convertFlacToOgg,
  'ogg-to-flac': convertOggToFlac,
  'mp3-to-m4a': convertMp3ToM4a,
  'mp3-to-mp4': convertMp3ToMp4,
  'mp3-to-webm': convertMp3ToWebm,
  'wav-to-aac': convertWavToAac,
  'aac-to-wav': convertAacToWav,
  'm4a-to-wav': convertM4aToWav,
  'wav-to-m4a': convertWavToM4a,
  'webm-to-wav': convertWebmToWav,
  'wav-to-webm': convertWavToWebm,
  'mov-to-webm': convertMovToWebm,
  'webm-to-mov': convertWebmToMov,
};

export const MODEL_3D_CONVERTER_REGISTRY: Record<string, Model3DConverterFn> = {
  'obj-to-stl': convertObjToStl,
  'stl-to-obj': convertStlToObj,
  'gltf-to-glb': convertGltfToGlb,
  'glb-to-gltf': convertGlbToGltf,
  'obj-to-gltf': convertObjToGltf,
  'obj-to-glb': convertObjToGlb,
  'stl-to-gltf': convertStlToGltf,
  'stl-to-glb': convertStlToGlb,
  'ply-to-stl': convertPlyToStl,
  'ply-to-obj': convertPlyToObj,
  'ply-to-glb': convertPlyToGlb,
  'ply-to-gltf': convertPlyToGltf,
  'obj-to-ply': convertObjToPly,
  'stl-to-ply': convertStlToPly,
  'gltf-to-obj': convertGltfToObj,
  'gltf-to-stl': convertGltfToStl,
  'gltf-to-ply': convertGltfToPly,
  'stl-ascii-to-binary': convertStlAsciiToBinary,
  'stl-binary-to-ascii': convertStlBinaryToAscii,
  'obj-to-threejs-json': convertObjToThreejsJson,
  'stl-to-threejs-json': convertStlToThreejsJson,
  'ply-to-threejs-json': convertPlyToThreejsJson,
  'obj-to-wireframe-stl': convertObjToWireframeStl,
  'model-3d-to-point-cloud-ply': convertModel3dToPointCloudPly,
  'model-3d-inspector-json': convertModel3dInspectorJson,
  'threejs-json-to-obj': convertThreejsJsonToObj,
  'threejs-json-to-stl': convertThreejsJsonToStl,
  'threejs-json-to-glb': convertThreejsJsonToGlb,
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
'json-to-typescript': "{\n  \"id\": 101,\n  \"site\": \"convert.my.id\",\n  \"clientSide\": true,\n  \"tags\": [\"seo\", \"typescript\"],\n  \"metrics\": { \"latencyMs\": 1.2 }\n}",
  'typescript-to-javascript': "export interface User {\n  id: number;\n  name: string;\n}\n\nexport function greet(user: User, prefix: string = \"Hello\"): string {\n  const message: string = `${prefix}, ${user.name}!`;\n  return message;\n}",
  'yaml-to-json': "site: convert.my.id\nmode: static-export\nport: 3000\nprivacyFirst: true\nfeatures:\n  - client-side\n  - zero-server-load\n  - programmatic-seo",
  'json-to-yaml': "{\n  \"service\": \"convert.my.id\",\n  \"runtime\": \"cloudflare-pages\",\n  \"replicas\": 1,\n  \"regions\": [\"sin\", \"iad\", \"fra\"]\n}",
  'xml-to-json': "<platform id=\"1\" domain=\"convert.my.id\">\n  <philosophy>100% Client-Side</philosophy>\n  <tools count=\"100\">\n    <category>Code &amp; Dev</category>\n    <category>Image &amp; Media</category>\n  </tools>\n</platform>",
  'json-to-xml': "{\n  \"platform\": {\n    \"domain\": \"convert.my.id\",\n    \"clientSide\": true,\n    \"categories\": [\"Code & Dev\", \"Image & Media\", \"CSS & Unit\", \"Text & Data\"]\n  }\n}",
  'json-to-zod': "{\n  \"id\": \"usr_01\",\n  \"email\": \"dev@convert.my.id\",\n  \"age\": 28,\n  \"active\": true,\n  \"roles\": [\"admin\", \"editor\"]\n}",
  'json-to-graphql': "{\n  \"id\": \"gql_99\",\n  \"title\": \"convert.my.id\",\n  \"views\": 42000,\n  \"rating\": 4.95,\n  \"published\": true,\n  \"author\": { \"username\": \"asfa\", \"verified\": true }\n}",
  'json-to-go-struct': "{\n  \"user_id\": 42,\n  \"domain_name\": \"convert.my.id\",\n  \"is_active\": true,\n  \"latency_ms\": 0.85,\n  \"tags\": [\"go\", \"wasm\", \"edge\"]\n}",
  'json-to-rust-struct': "{\n  \"projectId\": 100,\n  \"hostName\": \"convert.my.id\",\n  \"edgeEnabled\": true,\n  \"score\": 99.9,\n  \"keywords\": [\"rust\", \"serde\"]\n}",
  'json-to-python-dataclass': "{\n  \"id\": 1,\n  \"domain\": \"convert.my.id\",\n  \"is_private\": true,\n  \"NestedConfig\": { \"timeout_sec\": 30 }\n}",
  'json-to-sql-table': "[\n  { \"id\": 1, \"slug\": \"json-to-typescript\", \"category\": \"Code & Dev\", \"active\": true },\n  { \"id\": 2, \"slug\": \"px-to-rem\", \"category\": \"CSS & Unit\", \"active\": true }\n]",
  'sql-to-json': "INSERT INTO tools (id, slug, domain, active) VALUES (1, 'json-to-typescript', 'convert.my.id', true);\nINSERT INTO tools (id, slug, domain, active) VALUES (2, 'px-to-rem', 'convert.my.id', true);",
  'html-to-jsx': "<!-- Card Snippet -->\n<div class=\"card-wrapper\" style=\"padding: 16px; background-color: #0f172a;\">\n  <label for=\"email-input\" tabindex=\"1\">Email Address</label>\n  <input id=\"email-input\" type=\"email\" placeholder=\"you@convert.my.id\">\n  <br>\n</div>",
  'jsx-to-html': "{/* Main Container */}\n<section className=\"hero-box\" htmlFor=\"target\" tabIndex={0}>\n  <h1>convert.my.id</h1>\n  <input type=\"text\" readOnly />\n</section>",
  'curl-to-fetch': "curl -X POST \"https://convert.my.id/api/ping\" \\\n  -H \"Content-Type: application/json\" \\\n  -H \"Authorization: Bearer tok_live_123\" \\\n  -d '{\"clientSide\":true,\"tools\":100}'",
  'json-to-jsdoc': "{\n  \"slug\": \"json-to-jsdoc\",\n  \"domain\": \"convert.my.id\",\n  \"clientSide\": true,\n  \"version\": 1\n}",
  'json-to-json-schema': "{\n  \"id\": \"tool_18\",\n  \"domain\": \"convert.my.id\",\n  \"count\": 100,\n  \"enabled\": true\n}",
  'env-to-json': "# Production Config\nNEXT_PUBLIC_SITE_URL=\"https://convert.my.id\"\nSTATIC_EXPORT=true\nTOTAL_TOOLS=100",
  'json-to-env': "{\n  \"siteUrl\": \"https://convert.my.id\",\n  \"environment\": \"production\",\n  \"database\": {\n    \"port\": 5432,\n    \"ssl\": true\n  }\n}",
  'toml-to-json': "name = \"convert-my-id\"\ncompatibility_date = \"2026-10-26\"\n\n[site]\nbucket = \"./out\"\nclient_side = true",
  'json-to-toml': "{\n  \"name\": \"convert.my.id\",\n  \"pages_build_output_dir\": \"out\",\n  \"vars\": {\n    \"NODE_VERSION\": \"22\",\n    \"ZERO_SERVER\": true\n  }\n}",
  'javascript-to-json': "{\n  domain: 'convert.my.id',\n  toolsCount: 100,\n  clientSide: true,\n  categories: ['Code & Dev', 'Image & Media'],\n}",
  'json-to-query-string': "{\n  \"domain\": \"convert.my.id\",\n  \"category\": \"Code & Dev\",\n  \"limit\": 100,\n  \"private\": true\n}",
  'query-string-to-json': "?domain=convert.my.id&category=Code+%26+Dev&limit=100&private=true",
  'svg-to-data-uri': "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\" fill=\"none\" stroke=\"#6366f1\" stroke-width=\"2\">\n  <circle cx=\"12\" cy=\"12\" r=\"10\"/>\n  <path d=\"M12 8v8M8 12h8\"/>\n</svg>",
  'px-to-rem': ".container {\n  max-width: 1280px;\n  padding: 32px 16px;\n  font-size: 18px;\n  gap: 24px;\n}",
  'rem-to-px': ".heading {\n  font-size: 2.25rem;\n  line-height: 2.5rem;\n  margin-bottom: 1.5rem;\n}",
  'px-to-em': ".button {\n  font-size: 16px;\n  padding: 12px 20px;\n  border-radius: 8px;\n}",
  'em-to-px': ".badge {\n  font-size: 0.875em;\n  padding: 0.25em 0.75em;\n}",
  'px-to-vw': ".hero-title {\n  font-size: 72px;\n  max-width: 960px;\n  margin-top: 120px;\n}",
  'vw-to-px': ".banner {\n  width: 50vw;\n  padding: 2.5vw;\n  font-size: 3.75vw;\n}",
  'px-to-vh': ".modal-panel {\n  height: 540px;\n  margin-top: 108px;\n}",
  'px-to-pt': "16px\n24px\n32px",
  'pt-to-px': "12pt\n18pt\n24pt",
  'hex-to-rgb': "#6366f1\n#10b981\n#0f172acc",
  'rgb-to-hex': "rgb(99, 102, 241)\nrgb(16, 185, 129)\nrgba(15, 23, 42, 0.8)",
  'hex-to-hsl': "#6366f1\n#10b981\n#f59e0b",
  'hsl-to-hex': "hsl(239, 84%, 67%)\nhsl(160, 84%, 39%)\nhsl(38, 92%, 50%)",
  'rgb-to-hsl': "rgb(99, 102, 241)\nrgb(16, 185, 129)",
  'hsl-to-rgb': "hsl(239, 84%, 67%)\nhsl(160, 84%, 39%)",
  'hex-to-rgba': "#6366f1\n#10b98180\n#0f172a",
  'rgb-to-cmyk': "rgb(99, 102, 241)\nrgb(16, 185, 129)",
  'cmyk-to-rgb': "cmyk(59%, 58%, 0%, 5%)\ncmyk(91%, 0%, 30%, 27%)",
  'hex-to-oklch': "#6366f1\n#10b981\n#f43f5e",
  'css-to-tailwind': "display: flex;\nflex-direction: column;\nalign-items: center;\njustify-content: space-between;\npadding: 16px;\ngap: 8px;\nfont-weight: 700;\nborder-radius: 12px;",
  'css-to-js-styles': "background-color: #0f172a;\nfont-size: 16px;\nline-height: 24px;\nborder-radius: 12px;\nz-index: 10;",
  'js-styles-to-css': "{\n  \"backgroundColor\": \"#0f172a\",\n  \"fontSize\": \"16px\",\n  \"borderRadius\": \"12px\",\n  \"zIndex\": 10\n}",
  'scss-to-css': "$brand: #6366f1;\n$radius: 12px;\n\n.card {\n  border-radius: $radius;\n  border: 1px solid $brand;\n}",
  'css-to-minified-css': "/* Main Hero Card */\n.hero-card {\n  display: flex;\n  padding: 24px 32px;\n  background-color: #0f172a;\n  color: #ffffff;\n}",
  'minified-css-to-css': ".hero-card{display:flex;padding:24px 32px;background-color:#0f172a;color:#fff}.btn{border-radius:8px;font-weight:600}",
  'string-to-base64': "convert.my.id — 100% Client-Side, Privacy-First & Zero Server Load! 🚀🔒",
  'base64-to-string': "Y29udmVydC5teS5pZCDigJQgMTAwJSBDbGllbnQtU2lkZSwgUHJpdmFjeS1GaXJzdCAmIFplcm8gU2VydmVyIExvYWQhIPCfmqDwn5🔒",
  'markdown-to-html': "# convert.my.id Documentation\n\nWelcome to **convert.my.id** — *100% client-side* utilities.\n\n- Zero server load\n- Instant browser execution\n\n```ts\nconst domain = \"convert.my.id\";\n```",
  'html-to-markdown': "<h1>convert.my.id</h1>\n<p>Built for <strong>instant</strong> and <em>private</em> conversions.</p>\n<ul>\n  <li>Code &amp; Dev</li>\n  <li>Image &amp; Media</li>\n</ul>",
  'csv-to-json': "id,slug,category,clientSide\n1,json-to-typescript,\"Code & Dev\",true\n2,image-to-webp,\"Image & Media\",true\n3,px-to-rem,\"CSS & Unit\",true",
  'json-to-csv': "[\n  { \"id\": 1, \"domain\": \"convert.my.id\", \"category\": \"Code & Dev\" },\n  { \"id\": 2, \"domain\": \"convert.my.id\", \"category\": \"Image & Media\" }\n]",
  'tsv-to-json': "id\tslug\tdomain\n1\ttsv-to-json\tconvert.my.id\n2\tjson-to-tsv\tconvert.my.id",
  'json-to-tsv': "[\n  { \"id\": 1, \"tool\": \"json-to-tsv\", \"site\": \"convert.my.id\" },\n  { \"id\": 2, \"tool\": \"tsv-to-json\", \"site\": \"convert.my.id\" }\n]",
  'csv-to-markdown-table': "Tool,Category,Execution\njson-to-typescript,Code & Dev,Client-Side\nimage-to-webp,Image & Media,HTML5 Canvas",
  'markdown-table-to-csv': "| Tool | Category | Domain |\n| --- | --- | --- |\n| px-to-rem | CSS & Unit | convert.my.id |\n| csv-to-json | Text & Data | convert.my.id |",
  'csv-to-html-table': "ID,Tool,Site\n1,csv-to-html-table,convert.my.id\n2,markdown-to-html,convert.my.id",
  'url-encode': "https://convert.my.id/search?q=100% Client-Side & Privacy=First!",
  'url-decode': "https%3A%2F%2Fconvert.my.id%2Fsearch%3Fq%3D100%25+Client-Side+%26+Privacy%3DFirst%21",
  'html-entity-encode': "<script src=\"https://convert.my.id/app.js\"></script> & © 2026",
  'html-entity-decode': "&lt;div class=&quot;brand&quot;&gt;convert.my.id &amp; &#169; 2026&lt;/div&gt;",
  'string-to-binary': "convert.my.id",
  'binary-to-string': "01100011 01101111 01101110 01110110 01100101 01110010 01110100 00101110 01101101 01111001 00101110 01101001 01100100",
  'string-to-hex': "convert.my.id — 100% Client-Side",
  'hex-to-string': "63 6f 6e 76 65 72 74 2e 6d 79 2e 69 64",
  'string-to-morse': "CONVERT MY ID 100",
  'morse-to-string': "-.-. --- -. ...- . .-. - / -- -.-- / .. -.. / .---- ----- -----",
  'text-to-slug': "Convert.my.id — 100% Free Client-Side Online Converters!",
  'number-to-roman': "2026\n100\n49",
  'unix-timestamp-to-date': "1792986515",
  'jwt-decoder': "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3JfMTAwIiwiaXNzIjoiY29udmVydC5teS5pZCIsImNsaWVudFNpZGUiOnRydWUsImlhdCI6MTc5Mjk4NjUxNX0.signature_part",
  'typescript-to-json': "export interface RootInterface {\n  id: number;\n  domain: string;\n  clientSide: boolean;\n  tags: string[];\n}",
  'javascript-to-typescript': "const domain = \"convert.my.id\";\nconst totalTools = 200;\nconst isPrivate = true;\nfunction calculateRem(px = 16, base = 16) {\n  return px / base;\n}",
  'zod-to-typescript': "export const userSchema = z.object({\n  id: z.string(),\n  age: z.number().int(),\n  active: z.boolean(),\n  tags: z.array(z.string()),\n});",
  'graphql-to-typescript': "type ToolItem {\n  id: ID!\n  slug: String!\n  views: Int\n  rating: Float!\n  active: Boolean!\n}",
  'go-struct-to-json': "type Config struct {\n\tID int64 `json:\"id\"`\n\tDomain string `json:\"domain\"`\n\tClientSide bool `json:\"client_side\"`\n\tScore float64 `json:\"score\"`\n}",
  'rust-struct-to-json': "pub struct AppConfig {\n    pub project_id: i64,\n    pub domain: String,\n    pub edge_enabled: bool,\n    pub tags: Vec<String>,\n}",
  'python-dataclass-to-json': "@dataclass\nclass SiteConfig:\n    id: int\n    domain: str\n    is_private: bool\n    keywords: List[str]",
  'json-schema-to-json': "{\n  \"$schema\": \"http://json-schema.org/draft-07/schema#\",\n  \"type\": \"object\",\n  \"properties\": {\n    \"id\": { \"type\": \"integer\" },\n    \"domain\": { \"type\": \"string\" },\n    \"clientSide\": { \"type\": \"boolean\" }\n  }\n}",
  'base64-to-image': "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI2NCIgaGVpZ2h0PSI2NCI+PGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMjgiIGZpbGw9IiM2MzY2ZjEiLz48L3N2Zz4=",
  'data-uri-to-svg': "background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Ccircle cx='12' cy='12' r='10' fill='%236366f1'/%3E%3C/svg%3E\");",
  'vh-to-px': ".hero-section {\n  min-height: 100vh;\n  padding-top: 10vh;\n  margin-bottom: 5vh;\n}",
  'rgba-to-hex': "rgba(99, 102, 241, 0.85)\nrgba(16, 185, 129, 0.5)\nrgba(15, 23, 42, 1)",
  'oklch-to-hex': "oklch(58.54% 0.2041 277.12)\noklch(69.59% 0.1491 162.48)",
  'tailwind-to-css': "flex flex-col items-center justify-between p-6 gap-4 font-bold rounded-2xl w-full relative overflow-hidden",
  'css-to-scss': ".card {\n  background-color: #0f172a;\n  border: 1px solid #6366f1;\n}\n.badge {\n  color: #6366f1;\n  background: #0f172a;\n}",
  'px-to-pc': "16px\n24px\n32px\n64px",
  'pc-to-px': "1pc\n1.5pc\n2pc\n4pc",
  'html-table-to-csv': "<table>\n  <thead>\n    <tr><th>ID</th><th>Slug</th><th>Domain</th></tr>\n  </thead>\n  <tbody>\n    <tr><td>1</td><td>html-table-to-csv</td><td>convert.my.id</td></tr>\n  </tbody>\n</table>",
  'slug-to-title': "json-to-typescript-interface-converter\nmp4-to-mp3-audio-extractor\nconvert_my_id_client_side_tools",
  'roman-to-number': "MMXXVI\nC\nXLIX",
  'date-to-unix-timestamp': "2026-10-26T12:00:00+07:00",
  'json-to-jwt': "{\n  \"sub\": \"usr_200\",\n  \"iss\": \"convert.my.id\",\n  \"role\": \"developer\",\n  \"iat\": 1792986515\n}",
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
      throw new Error(`No text converter registered for slug "${slug}".`);
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
    throw new Error(`No image converter registered for slug "${slug}".`);
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
    throw new Error(`No FFmpeg Audio/Video converter registered for slug "${slug}".`);
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
    throw new Error(`No Three.js 3D converter registered for slug "${slug}".`);
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
