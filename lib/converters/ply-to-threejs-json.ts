import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for `ply-to-threejs-json` on convert.my.id.
 */
export async function convertPlyToThreejsJson(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'ply-to-threejs-json',
      inputFormat: 'ply',
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
