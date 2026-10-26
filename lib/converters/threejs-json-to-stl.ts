import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js Reverse 3D Converter for `threejs-json-to-stl` on convert.my.id.
 */
export async function convertThreejsJsonToStl(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'threejs-json-to-stl',
      inputFormat: 'threejs-json',
      outputFormat: 'stl-binary',
      outputExtension: 'stl',
      outputMimeType: 'model/stl',
    },
    options
  );
}
