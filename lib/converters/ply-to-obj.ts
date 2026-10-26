import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for `ply-to-obj` on convert.my.id.
 */
export async function convertPlyToObj(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'ply-to-obj',
      inputFormat: 'ply',
      outputFormat: 'obj',
      outputExtension: 'obj',
      outputMimeType: 'model/obj',
    },
    {
      recenterOrigin: false,
      ...options,
    }
  );
}
