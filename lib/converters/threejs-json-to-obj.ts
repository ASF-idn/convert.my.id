import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js Reverse 3D Converter for `threejs-json-to-obj` on convert.my.id.
 */
export async function convertThreejsJsonToObj(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'threejs-json-to-obj',
      inputFormat: 'threejs-json',
      outputFormat: 'obj',
      outputExtension: 'obj',
      outputMimeType: 'model/obj',
    },
    options
  );
}
