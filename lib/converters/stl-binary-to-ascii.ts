import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';
import { executeThree3DJob } from './threeEngine';

/**
 * 100% Client-Side Three.js 3D Mesh Converter for `stl-binary-to-ascii` on convert.my.id.
 */
export async function convertStlBinaryToAscii(
  file: File,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  return executeThree3DJob(
    file,
    {
      slug: 'stl-binary-to-ascii',
      inputFormat: 'stl',
      outputFormat: 'stl-ascii',
      outputExtension: 'stl',
      outputMimeType: 'model/stl',
    },
    {
      recenterOrigin: false,
      ...options,
    }
  );
}
