import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for `stl-to-gltf` on convert.my.id.
 */
export async function convertStlToGltf(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'stl-to-gltf',
      inputFormat: 'stl',
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
