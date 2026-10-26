import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for `stl-to-obj` on convert.my.id.
 */
export async function convertStlToObj(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'stl-to-obj',
      inputFormat: 'stl',
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
