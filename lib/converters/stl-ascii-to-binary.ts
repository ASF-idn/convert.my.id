import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for `stl-ascii-to-binary` on convert.my.id.
 */
export async function convertStlAsciiToBinary(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'stl-ascii-to-binary',
      inputFormat: 'stl',
      outputFormat: 'stl-binary',
      outputExtension: 'stl',
      outputMimeType: 'model/stl',
    },
    {
      recenterOrigin: false,
      ...options,
    }
  );
}
