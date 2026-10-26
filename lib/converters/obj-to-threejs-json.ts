import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for `obj-to-threejs-json` on convert.my.id.
 */
export async function convertObjToThreejsJson(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'obj-to-threejs-json',
      inputFormat: 'obj',
      outputFormat: 'threejs-json',
      outputExtension: 'json',
      outputMimeType: 'application/json',
    },
    {
      recenterOrigin: false,
      ...options,
    }
  );
}
