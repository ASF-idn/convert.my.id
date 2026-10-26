import * as THREE from 'three';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { PLYLoader } from 'three/examples/jsm/loaders/PLYLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OBJExporter } from 'three/examples/jsm/exporters/OBJExporter.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { PLYExporter } from 'three/examples/jsm/exporters/PLYExporter.js';
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';
import type {
  BinaryFileConversionResult,
  Model3DConversionOptions,
} from '@/types/converter';

export type Model3DFormat =
  | 'obj'
  | 'stl'
  | 'stl-ascii'
  | 'stl-binary'
  | 'ply'
  | 'ply-binary'
  | 'gltf'
  | 'glb'
  | 'threejs-json'
  | 'point-cloud-ply'
  | 'inspector-json';

export interface ThreeConversionSpec {
  slug: string;
  inputFormat: 'auto' | 'obj' | 'stl' | 'ply' | 'gltf' | 'glb' | 'threejs-json';
  outputFormat: Model3DFormat;
  outputExtension: string;
  outputMimeType: string;
}

/**
 * Parses an uploaded 3D file (.obj, .stl, .ply, .gltf, .glb) into a Three.js Object3D scene graph.
 */
async function parse3DInputFile(
  file: File,
  formatHint: ThreeConversionSpec['inputFormat']
): Promise<THREE.Object3D> {
  const ext =
    formatHint !== 'auto'
      ? formatHint
      : file.name.split('.').pop()?.toLowerCase() ?? 'obj';

  const defaultMaterial = new THREE.MeshStandardMaterial({
    color: 0x6366f1,
    roughness: 0.4,
    metalness: 0.2,
  });

  if (ext === 'threejs-json' || ext === 'json') {
    const text = await file.text();
    const json = JSON.parse(text);
    const objLoader = new THREE.ObjectLoader();
    return objLoader.parse(json);
  }

  if (ext === 'obj') {
    const text = await file.text();
    const loader = new OBJLoader();
    return loader.parse(text);
  }

  if (ext === 'stl') {
    const buffer = await file.arrayBuffer();
    const loader = new STLLoader();
    const geometry = loader.parse(buffer);
    geometry.computeVertexNormals();
    const scene = new THREE.Group();
    scene.add(new THREE.Mesh(geometry, defaultMaterial));
    return scene;
  }

  if (ext === 'ply') {
    const buffer = await file.arrayBuffer();
    const loader = new PLYLoader();
    const geometry = loader.parse(buffer);
    geometry.computeVertexNormals();
    const scene = new THREE.Group();
    scene.add(new THREE.Mesh(geometry, defaultMaterial));
    return scene;
  }

  if (ext === 'gltf' || ext === 'glb') {
    const buffer = await file.arrayBuffer();
    const loader = new GLTFLoader();
    const gltf = await new Promise<{ scene: THREE.Group }>((resolve, reject) => {
      loader.parse(
        buffer,
        '',
        (res) => resolve(res),
        (err) => reject(new Error('Failed to parse GLTF/GLB binary: ' + String(err)))
      );
    });
    return gltf.scene;
  }

  // Fallback to OBJ text parser
  const text = await file.text();
  return new OBJLoader().parse(text);
}

/**
 * Computes mesh telemetry (vertex count, triangle count, bounding box dimensions) from a Three.js Object3D.
 */
function inspectObject3D(root: THREE.Object3D): {
  meshCount: number;
  vertexCount: number;
  triangleCount: number;
  boundingBox: { width: number; height: number; depth: number };
} {
  let meshCount = 0;
  let vertexCount = 0;
  let triangleCount = 0;

  root.traverse((child) => {
    if ((child as THREE.Mesh).isMesh) {
      meshCount++;
      const geom = (child as THREE.Mesh).geometry;
      const pos = geom.getAttribute('position');
      if (pos) {
        vertexCount += pos.count;
        if (geom.index) {
          triangleCount += Math.floor(geom.index.count / 3);
        } else {
          triangleCount += Math.floor(pos.count / 3);
        }
      }
    }
  });

  const box = new THREE.Box3().setFromObject(root);
  const size = new THREE.Vector3();
  box.getSize(size);

  return {
    meshCount,
    vertexCount,
    triangleCount,
    boundingBox: {
      width: Number(size.x.toFixed(4)),
      height: Number(size.y.toFixed(4)),
      depth: Number(size.z.toFixed(4)),
    },
  };
}

/**
 * Executes a 100% browser-based Three.js 3D model conversion job.
 */
export async function executeThree3DJob(
  file: File,
  spec: ThreeConversionSpec,
  options: Model3DConversionOptions = {}
): Promise<BinaryFileConversionResult> {
  const startTime = performance.now();
  const rootObject = await parse3DInputFile(file, spec.inputFormat);

  if (options.recenterOrigin) {
    const box = new THREE.Box3().setFromObject(rootObject);
    const center = box.getCenter(new THREE.Vector3());
    rootObject.position.sub(center);
    rootObject.updateMatrixWorld(true);
  }

  if (options.computeVertexNormals !== false) {
    rootObject.traverse((node) => {
      if ((node as THREE.Mesh).isMesh) {
        (node as THREE.Mesh).geometry.computeVertexNormals();
      }
    });
  }

  const stats = inspectObject3D(rootObject);
  let outputBlob: Blob;
  let summaryText = `Meshes: ${stats.meshCount} • Vertices: ${stats.vertexCount.toLocaleString()} • Triangles: ${stats.triangleCount.toLocaleString()} • Size: ${stats.boundingBox.width}×${stats.boundingBox.height}×${stats.boundingBox.depth}`;

  switch (spec.outputFormat) {
    case 'obj': {
      const exporter = new OBJExporter();
      const objText = exporter.parse(rootObject);
      outputBlob = new Blob([objText], { type: 'text/plain;charset=utf-8' });
      summaryText = objText.slice(0, 4000);
      break;
    }

    case 'stl':
    case 'stl-binary': {
      const exporter = new STLExporter();
      const result = exporter.parse(rootObject, { binary: true });
      const buffer =
        result instanceof DataView
          ? (result.buffer as ArrayBuffer)
          : new TextEncoder().encode(String(result)).buffer;
      outputBlob = new Blob([buffer], { type: 'model/stl' });
      break;
    }

    case 'stl-ascii': {
      const exporter = new STLExporter();
      const asciiStl = String(exporter.parse(rootObject, { binary: false }));
      outputBlob = new Blob([asciiStl], { type: 'model/stl;charset=utf-8' });
      summaryText = asciiStl.slice(0, 4000);
      break;
    }

    case 'ply':
    case 'ply-binary': {
      const exporter = new PLYExporter();
      const isBin = spec.outputFormat === 'ply-binary';
      const plyData = await new Promise<string | ArrayBuffer>((resolve) => {
        exporter.parse(
          rootObject,
          (res) => resolve(res),
          { binary: isBin }
        );
      });
      outputBlob = new Blob([plyData], { type: 'application/octet-stream' });
      if (typeof plyData === 'string') {
        summaryText = plyData.slice(0, 4000);
      }
      break;
    }

    case 'point-cloud-ply': {
      const vertices: string[] = [];
      rootObject.traverse((node) => {
        if ((node as THREE.Mesh).isMesh) {
          const pos = (node as THREE.Mesh).geometry.getAttribute('position');
          if (pos) {
            for (let i = 0; i < pos.count; i++) {
              vertices.push(
                `${pos.getX(i).toFixed(5)} ${pos.getY(i).toFixed(5)} ${pos.getZ(i).toFixed(5)}`
              );
            }
          }
        }
      });
      const plyHeader = [
        'ply',
        'format ascii 1.0',
        'comment Generated by convert.my.id 3D Point Cloud Extractor',
        `element vertex ${vertices.length}`,
        'property float x',
        'property float y',
        'property float z',
        'end_header',
        ...vertices,
      ].join('\n');
      outputBlob = new Blob([plyHeader], { type: 'text/plain;charset=utf-8' });
      summaryText = plyHeader.slice(0, 4000);
      break;
    }

    case 'gltf':
    case 'glb': {
      const exporter = new GLTFExporter();
      const isBinary = spec.outputFormat === 'glb';
      const exported = await new Promise<ArrayBuffer | Record<string, unknown>>(
        (resolve, reject) => {
          exporter.parse(
            rootObject,
            (res) => resolve(res as ArrayBuffer | Record<string, unknown>),
            (err) => reject(new Error('GLTFExporter error: ' + String(err))),
            { binary: isBinary }
          );
        }
      );

      if (exported instanceof ArrayBuffer) {
        outputBlob = new Blob([exported], { type: 'model/gltf-binary' });
      } else {
        const jsonStr = JSON.stringify(exported, null, 2);
        outputBlob = new Blob([jsonStr], { type: 'model/gltf+json' });
        summaryText = jsonStr.slice(0, 4000);
      }
      break;
    }

    case 'threejs-json': {
      const jsonPayload = rootObject.toJSON();
      const serialized = JSON.stringify(jsonPayload, null, 2);
      outputBlob = new Blob([serialized], { type: 'application/json' });
      summaryText = serialized.slice(0, 4000);
      break;
    }

    case 'inspector-json': {
      const report = JSON.stringify(
        {
          generator: 'convert.my.id 3D Model Inspector',
          fileName: file.name,
          fileSizeBytes: file.size,
          ...stats,
        },
        null,
        2
      );
      outputBlob = new Blob([report], { type: 'application/json' });
      summaryText = report;
      break;
    }
  }

  const objectUrl = URL.createObjectURL(outputBlob);
  return {
    blob: outputBlob,
    objectUrl,
    originalBytes: file.size,
    outputBytes: outputBlob.size,
    executionTimeMs: Number((performance.now() - startTime).toFixed(2)),
    outputExtension: spec.outputExtension,
    outputMimeType: spec.outputMimeType,
    summaryText,
  };
}

/**
 * Generates an in-memory 3D TorusKnot Wavefront .obj File using Three.js
 * so users can test any 3D Model & AR converter with 1 click.
 */
export function generateSample3DObjFile(): File {
  const geometry = new THREE.TorusKnotGeometry(10, 3, 64, 12);
  const mesh = new THREE.Mesh(geometry);
  const exporter = new OBJExporter();
  const objText = exporter.parse(mesh);
  return new File([objText], 'convert-my-id-torusknot.obj', {
    type: 'model/obj',
  });
}
