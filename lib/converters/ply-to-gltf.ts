import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for `ply-to-gltf` on convert.my.id.
 */
export async function convertPlyToGltf(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'ply-to-gltf',
      inputFormat: 'ply',
      outputFormat: 'gltf',
      outputExtension: 'gltf',
      outputMimeType: 'model/gltf+json',
    },
    {
      recenterOrigin: false,
      ...options,
    }
  );
}
