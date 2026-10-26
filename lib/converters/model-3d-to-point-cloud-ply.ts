import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for `model-3d-to-point-cloud-ply` on convert.my.id.
 */
export async function convertModel3dToPointCloudPly(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'model-3d-to-point-cloud-ply',
      inputFormat: 'auto',
      outputFormat: 'point-cloud-ply',
      outputExtension: 'ply',
      outputMimeType: 'text/plain',
    },
    {
      recenterOrigin: false,
      ...options,
    }
  );
}
