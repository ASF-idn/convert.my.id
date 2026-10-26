import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for `model-3d-inspector-json` on convert.my.id.
 */
export async function convertModel3dInspectorJson(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'model-3d-inspector-json',
      inputFormat: 'auto',
      outputFormat: 'inspector-json',
      outputExtension: 'json',
      outputMimeType: 'application/json',
    },
    {
      recenterOrigin: false,
      ...options,
    }
  );
}
