import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for `obj-to-ply` on convert.my.id.
 */
export async function convertObjToPly(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'obj-to-ply',
      inputFormat: 'obj',
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
