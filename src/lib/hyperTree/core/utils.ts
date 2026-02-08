/**
 * HYPER-REALISTIC VEGETATION ENGINE
 * Core utility functions for math, noise, and geometry
 */

import * as THREE from 'three';

// ─── BASIC MATH ──────────────────────────────────────────────────────────────

export const clamp = (min: number, max: number, value: number): number => 
  Math.max(min, Math.min(max, value));

export const clamp01 = (x: number): number => Math.max(0, Math.min(1, x));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

export const smoothstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp(0, 1, (x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
};

export const smootherstep = (edge0: number, edge1: number, x: number): number => {
  const t = clamp(0, 1, (x - edge0) / (edge1 - edge0));
  return t * t * t * (t * (t * 6 - 15) + 10);
};

export const fract = (x: number): number => x - Math.floor(x);

export const remap = (
  value: number, 
  inMin: number, 
  inMax: number, 
  outMin: number, 
  outMax: number
): number => {
  return outMin + (value - inMin) * (outMax - outMin) / (inMax - inMin);
};

// ─── SEEDED RANDOM ───────────────────────────────────────────────────────────

export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function seededRandomRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

// ─── HASH FUNCTIONS ──────────────────────────────────────────────────────────

export function hash11(x: number): number {
  return fract(Math.sin(x * 127.1) * 43758.5453);
}

export function hash21(x: number, y: number): number {
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
}

export function hash31(x: number, y: number, z: number): number {
  return fract(Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453);
}

export function hash22(x: number, y: number): [number, number] {
  const h1 = fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453);
  const h2 = fract(Math.sin(x * 269.5 + y * 183.3) * 43758.5453);
  return [h1, h2];
}

// ─── NOISE FUNCTIONS ─────────────────────────────────────────────────────────

export function noise2(x: number, y: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  
  const a = hash21(ix, iy);
  const b = hash21(ix + 1, iy);
  const c = hash21(ix, iy + 1);
  const d = hash21(ix + 1, iy + 1);
  
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}

export function noise3(x: number, y: number, z: number): number {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const iz = Math.floor(z);
  const fx = x - ix;
  const fy = y - iy;
  const fz = z - iz;
  
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const w = fz * fz * (3 - 2 * fz);
  
  const a000 = hash31(ix, iy, iz);
  const a100 = hash31(ix + 1, iy, iz);
  const a010 = hash31(ix, iy + 1, iz);
  const a110 = hash31(ix + 1, iy + 1, iz);
  const a001 = hash31(ix, iy, iz + 1);
  const a101 = hash31(ix + 1, iy, iz + 1);
  const a011 = hash31(ix, iy + 1, iz + 1);
  const a111 = hash31(ix + 1, iy + 1, iz + 1);
  
  return lerp(
    lerp(lerp(a000, a100, u), lerp(a010, a110, u), v),
    lerp(lerp(a001, a101, u), lerp(a011, a111, u), v),
    w
  );
}

export function fbm2(x: number, y: number, octaves: number = 4): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise2(x * freq, y * freq);
    freq *= 2;
    amp *= 0.5;
  }
  
  return sum;
}

export function fbm3(x: number, y: number, z: number, octaves: number = 4): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise3(x * freq, y * freq, z * freq);
    freq *= 2;
    amp *= 0.5;
  }
  
  return sum;
}

// Ridged noise for cracks/fissures
export function ridgedNoise2(x: number, y: number, octaves: number = 4): number {
  let sum = 0;
  let amp = 0.5;
  let freq = 1;
  let prev = 1;
  
  for (let i = 0; i < octaves; i++) {
    let n = 1 - Math.abs(noise2(x * freq, y * freq) * 2 - 1);
    n = n * n * prev;
    sum += amp * n;
    prev = n;
    freq *= 2;
    amp *= 0.5;
  }
  
  return sum;
}

// ─── VECTOR UTILITIES ────────────────────────────────────────────────────────

export function vec3Lerp(a: THREE.Vector3, b: THREE.Vector3, t: number): THREE.Vector3 {
  return new THREE.Vector3(
    lerp(a.x, b.x, t),
    lerp(a.y, b.y, t),
    lerp(a.z, b.z, t)
  );
}

// Tangent frame from direction
export function tangentFrame(dir: THREE.Vector3): { right: THREE.Vector3; forward: THREE.Vector3 } {
  const up = Math.abs(dir.y) > 0.92 
    ? new THREE.Vector3(1, 0, 0) 
    : new THREE.Vector3(0, 1, 0);
  
  const right = new THREE.Vector3().crossVectors(dir, up).normalize();
  const forward = new THREE.Vector3().crossVectors(right, dir).normalize();
  
  return { right, forward };
}

// ─── BEZIER CURVES ───────────────────────────────────────────────────────────

export function bezierPoint(
  p0: THREE.Vector3, 
  p1: THREE.Vector3, 
  p2: THREE.Vector3, 
  p3: THREE.Vector3, 
  t: number
): THREE.Vector3 {
  const u = 1 - t;
  const u2 = u * u;
  const u3 = u2 * u;
  const t2 = t * t;
  const t3 = t2 * t;
  
  return new THREE.Vector3(
    u3 * p0.x + 3 * u2 * t * p1.x + 3 * u * t2 * p2.x + t3 * p3.x,
    u3 * p0.y + 3 * u2 * t * p1.y + 3 * u * t2 * p2.y + t3 * p3.y,
    u3 * p0.z + 3 * u2 * t * p1.z + 3 * u * t2 * p2.z + t3 * p3.z
  );
}

export function bezierTangent(
  p0: THREE.Vector3, 
  p1: THREE.Vector3, 
  p2: THREE.Vector3, 
  p3: THREE.Vector3, 
  t: number
): THREE.Vector3 {
  const u = 1 - t;
  const u2 = u * u;
  const t2 = t * t;
  
  const tangent = new THREE.Vector3(
    -3 * u2 * p0.x + 3 * (u2 - 2 * u * t) * p1.x + 3 * (2 * u * t - t2) * p2.x + 3 * t2 * p3.x,
    -3 * u2 * p0.y + 3 * (u2 - 2 * u * t) * p1.y + 3 * (2 * u * t - t2) * p2.y + 3 * t2 * p3.y,
    -3 * u2 * p0.z + 3 * (u2 - 2 * u * t) * p1.z + 3 * (2 * u * t - t2) * p2.z + 3 * t2 * p3.z
  );
  
  return tangent.normalize();
}

// ─── COLOR UTILITIES ─────────────────────────────────────────────────────────

export function colorVariation(baseColor: THREE.Color, variation: number, rng: () => number): THREE.Color {
  const v = 1 + (rng() - 0.5) * variation * 2;
  return new THREE.Color(
    clamp01(baseColor.r * v),
    clamp01(baseColor.g * v),
    clamp01(baseColor.b * v)
  );
}

export function lerpColor(a: THREE.Color, b: THREE.Color, t: number): THREE.Color {
  return new THREE.Color(
    lerp(a.r, b.r, t),
    lerp(a.g, b.g, t),
    lerp(a.b, b.b, t)
  );
}

// ─── GEOMETRY UTILITIES ──────────────────────────────────────────────────────

export interface GeometryArrays {
  positions: number[];
  normals: number[];
  colors: number[];
  indices: number[];
  uvs?: number[];
}

export function createGeometryArrays(): GeometryArrays {
  return {
    positions: [],
    normals: [],
    colors: [],
    indices: [],
    uvs: [],
  };
}

export function pushVertex(
  arrays: GeometryArrays,
  position: THREE.Vector3,
  normal: THREE.Vector3,
  color: THREE.Color,
  uv?: { u: number; v: number }
): number {
  const index = arrays.positions.length / 3;
  
  arrays.positions.push(position.x, position.y, position.z);
  arrays.normals.push(normal.x, normal.y, normal.z);
  arrays.colors.push(color.r, color.g, color.b);
  
  if (uv && arrays.uvs) {
    arrays.uvs.push(uv.u, uv.v);
  }
  
  return index;
}

export function pushTriangle(arrays: GeometryArrays, a: number, b: number, c: number): void {
  arrays.indices.push(a, b, c);
}

export function pushQuad(arrays: GeometryArrays, a: number, b: number, c: number, d: number): void {
  arrays.indices.push(a, b, c, a, c, d);
}

// ─── GOLDEN ANGLE FOR PHYLLOTAXIS ────────────────────────────────────────────

export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5)); // ~137.5°

export function phyllotaxisAngle(index: number, mode: 'ALTERNATE' | 'OPPOSITE' | 'WHORLED' | 'RANDOM', rng?: () => number): number {
  switch (mode) {
    case 'ALTERNATE':
      return (index * GOLDEN_ANGLE) % (Math.PI * 2);
    case 'OPPOSITE':
      return (index % 2) * Math.PI;
    case 'WHORLED':
      const whorlSize = 3;
      return ((index % whorlSize) * (2 * Math.PI / whorlSize)) + (Math.floor(index / whorlSize) * GOLDEN_ANGLE);
    case 'RANDOM':
      return rng ? rng() * Math.PI * 2 : Math.random() * Math.PI * 2;
    default:
      return (index * GOLDEN_ANGLE) % (Math.PI * 2);
  }
}
