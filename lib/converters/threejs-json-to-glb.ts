import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js Reverse 3D Converter for `threejs-json-to-glb` on convert.my.id.
 */
export async function convertThreejsJsonToGlb(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'threejs-json-to-glb',
      inputFormat: 'threejs-json',
      outputFormat: 'glb',
      outputExtension: 'glb',
      outputMimeType: 'model/gltf-binary',
    },
    options
  );
}
