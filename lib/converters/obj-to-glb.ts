import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for `obj-to-glb` on convert.my.id.
 */
export async function convertObjToGlb(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'obj-to-glb',
      inputFormat: 'obj',
      outputFormat: 'glb',
      outputExtension: 'glb',
      outputMimeType: 'model/gltf-binary',
    },
    {
      recenterOrigin: false,
      ...options,
    }
  );
}
