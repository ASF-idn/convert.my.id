import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for `gltf-to-obj` on convert.my.id.
 */
export async function convertGltfToObj(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'gltf-to-obj',
      inputFormat: 'auto',
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
