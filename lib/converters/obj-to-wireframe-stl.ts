import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for `obj-to-wireframe-stl` on convert.my.id.
 */
export async function convertObjToWireframeStl(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'obj-to-wireframe-stl',
      inputFormat: 'obj',
      outputFormat: 'stl-binary',
      outputExtension: 'stl',
      outputMimeType: 'model/stl',
    },
    {
      recenterOrigin: true,
      ...options,
    }
  );
}
