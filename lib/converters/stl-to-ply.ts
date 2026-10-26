import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for `stl-to-ply` on convert.my.id.
 */
export async function convertStlToPly(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'stl-to-ply',
      inputFormat: 'stl',
      outputFormat: 'ply',
      outputExtension: 'ply',
      outputMimeType: 'application/octet-stream',
    },
    {
      recenterOrigin: false,
      ...options,
    }
  );
}
