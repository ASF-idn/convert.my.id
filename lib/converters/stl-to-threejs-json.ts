import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for `stl-to-threejs-json` on convert.my.id.
 */
export async function convertStlToThreejsJson(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'stl-to-threejs-json',
      inputFormat: 'stl',
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
