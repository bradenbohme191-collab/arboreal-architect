/**
 * CODEX5.3TREES - Tree Generation Engine
 * 
 * Core procedural tree generation using L-system and space colonization hybrid.
 * Implements biologically-accurate branching with pipe-model theory.
 */

import type { TreeParams, LODLevel } from '@/types/treeParams';
import { getPN, getPS, getPB } from '@/types/treeParams';

// ─── TYPES ──────────────────────────────────────────────────────────────────

export interface Vec3 {
  x: number;
  y: number;
  z: number;
}

export interface SkeletonNode {
  id: number;
  parentId: number;
  order: number;
  radius: number;
  length: number;
  dir: Vec3;
  start: Vec3;
  end: Vec3;
  center: Vec3;
  area: number;
  mass: number;
  hash: number;
  stiffness: number;
  damping: number;
  parentInfluence: number;
  kind: 'trunk' | 'branch' | 'twig' | 'root';
}

export interface WindData {
  hierarchy: number;
  tipWeight: number;
  branchHash: number;
  rigidity: number;
  parentHash: number;
  orderNorm: number;
  parentInfluence: number;
  leafiness: number;
}

export interface GenerationContext {
  lod?: LODLevel;
  lodScale?: number;
}

export interface TreeGeometryResult {
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  indices: Uint32Array;
  windData: Float32Array;
  windData2: Float32Array;
  branchBinding: Float32Array;
  skeleton: SkeletonNode[];
  meta: {
    height: number;
    vertCount: number;
    triCount: number;
    branchCount: number;
    leafCount: number;
  };
}

// ─── MATH HELPERS ───────────────────────────────────────────────────────────

function vec3(x: number, y: number, z: number): Vec3 {
  return { x, y, z };
}

function add(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

function sub(a: Vec3, b: Vec3): Vec3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

function scale(v: Vec3, s: number): Vec3 {
  return { x: v.x * s, y: v.y * s, z: v.z * s };
}

function length(v: Vec3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

function normalize(v: Vec3): Vec3 {
  const len = length(v);
  if (len < 0.0001) return { x: 0, y: 1, z: 0 };
  return scale(v, 1 / len);
}

function cross(a: Vec3, b: Vec3): Vec3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x,
  };
}

function dot(a: Vec3, b: Vec3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function lerpVec3(a: Vec3, b: Vec3, t: number): Vec3 {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    z: lerp(a.z, b.z, t),
  };
}

function rotateAroundAxis(v: Vec3, axis: Vec3, angle: number): Vec3 {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const k = normalize(axis);
  const vDotK = dot(v, k);
  const kCrossV = cross(k, v);
  
  return {
    x: v.x * cos + kCrossV.x * sin + k.x * vDotK * (1 - cos),
    y: v.y * cos + kCrossV.y * sin + k.y * vDotK * (1 - cos),
    z: v.z * cos + kCrossV.z * sin + k.z * vDotK * (1 - cos),
  };
}

// Seeded random number generator (mulberry32)
function createRandom(seed: number) {
  let state = seed;
  return () => {
    state |= 0;
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(x: number, y: number, z: number): number {
  let h = 0;
  h = Math.imul(h ^ Math.floor(x * 1000), 0x85ebca6b);
  h = Math.imul(h ^ Math.floor(y * 1000), 0xc2b2ae35);
  h = Math.imul(h ^ Math.floor(z * 1000), 0x27d4eb2f);
  return (h >>> 0) / 4294967296;
}

// ─── COLOR HELPERS ──────────────────────────────────────────────────────────

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255,
      }
    : { r: 0.36, g: 0.25, b: 0.22 };
}

function varyColor(
  base: { r: number; g: number; b: number },
  variation: number,
  random: () => number
): { r: number; g: number; b: number } {
  const v = variation * 0.5;
  return {
    r: Math.max(0, Math.min(1, base.r + (random() - 0.5) * v)),
    g: Math.max(0, Math.min(1, base.g + (random() - 0.5) * v)),
    b: Math.max(0, Math.min(1, base.b + (random() - 0.5) * v)),
  };
}

// ─── LOD HELPERS ────────────────────────────────────────────────────────────

function getLodSettings(lod: LODLevel): { segments: number; octaveCap: number; leafDetail: number } {
  switch (lod) {
    case 'near':
      return { segments: 12, octaveCap: 6, leafDetail: 1.0 };
    case 'mid':
      return { segments: 8, octaveCap: 4, leafDetail: 0.6 };
    case 'far':
      return { segments: 6, octaveCap: 2, leafDetail: 0.3 };
    case 'ultra':
      return { segments: 4, octaveCap: 1, leafDetail: 0.1 };
    default:
      return { segments: 12, octaveCap: 6, leafDetail: 1.0 };
  }
}

// ─── BEZIER HELPERS ─────────────────────────────────────────────────────────

function bezier3(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  const t2 = t * t;
  const t3 = t2 * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  const mt3 = mt2 * mt;
  
  return {
    x: mt3 * p0.x + 3 * mt2 * t * p1.x + 3 * mt * t2 * p2.x + t3 * p3.x,
    y: mt3 * p0.y + 3 * mt2 * t * p1.y + 3 * mt * t2 * p2.y + t3 * p3.y,
    z: mt3 * p0.z + 3 * mt2 * t * p1.z + 3 * mt * t2 * p2.z + t3 * p3.z,
  };
}

function bezier3Tangent(p0: Vec3, p1: Vec3, p2: Vec3, p3: Vec3, t: number): Vec3 {
  const t2 = t * t;
  const mt = 1 - t;
  const mt2 = mt * mt;
  
  return normalize({
    x: 3 * mt2 * (p1.x - p0.x) + 6 * mt * t * (p2.x - p1.x) + 3 * t2 * (p3.x - p2.x),
    y: 3 * mt2 * (p1.y - p0.y) + 6 * mt * t * (p2.y - p1.y) + 3 * t2 * (p3.y - p2.y),
    z: 3 * mt2 * (p1.z - p0.z) + 6 * mt * t * (p2.z - p1.z) + 3 * t2 * (p3.z - p2.z),
  });
}

// ─── MAIN GENERATOR ─────────────────────────────────────────────────────────

export function generateTreeGeometry(
  params: TreeParams,
  seed: number = 1337,
  ctx: GenerationContext = {}
): TreeGeometryResult {
  const random = createRandom(seed);
  const lod = ctx.lod || 'near';
  const lodSettings = getLodSettings(lod);
  
  // Extract parameters
  const height = getPN(params, 'height', 'vegetation.species.heightBase_m', 8);
  const baseRadius = getPN(params, 'baseRadius', 'vegetation.trunk.baseRadius_m', 0.4);
  const taperExponent = getPN(params, 'taperExponent', 'vegetation.trunk.taperExponent', 0.7);
  const baseFlare = getPN(params, 'baseFlare', 'vegetation.trunk.baseFlare', 1.3);
  const twist = getPN(params, 'twist', 'vegetation.trunk.twist_deg', 0) * Math.PI / 180;
  
  const trunkColorHex = getPS(params, 'trunkColor', 'vegetation.trunk.barkColor', '#5d4037');
  const leafColorHex = getPS(params, 'leafColor', 'vegetation.leaves.colorBase', '#4a7c3f');
  const trunkColor = hexToRgb(trunkColorHex);
  const leafColor = hexToRgb(leafColorHex);
  
  const branchCount = getPN(params, 'branchCount', 'vegetation.branching.mainBranchCount', 8);
  const branchAngle = getPN(params, 'branchAngle', 'vegetation.branching.angleMean_deg', 40) * Math.PI / 180;
  const branchAngleVar = getPN(params, 'branchAngleVar', 'vegetation.branching.angleVariance_deg', 15) * Math.PI / 180;
  const maxOrder = Math.min(getPN(params, 'maxOrder', 'vegetation.branching.maxOrder', 4), lodSettings.octaveCap);
  const lengthDecay = getPN(params, 'lengthDecay', 'vegetation.branching.lengthDecay', 0.75);
  const radiusDecay = getPN(params, 'radiusDecay', 'vegetation.branching.radiusDecay', 0.6);
  const branchProbability = getPN(params, 'branchProbability', 'vegetation.branching.probability', 0.85);
  const apicalDominance = getPN(params, 'apicalDominance', 'vegetation.branching.apicalDominance', 0.6);
  
  const leafSize = getPN(params, 'leafSize', 'vegetation.leaves.size_m', 0.08);
  const leafClusterSize = getPN(params, 'leafClusterSize', 'vegetation.leaves.clusterSize', 12);
  const leafColorVariation = getPN(params, 'leafColorVariation', 'vegetation.leaves.colorVariation', 0.15);
  
  const trunkKnotCount = getPN(params, 'trunkKnotCount', 'vegetation.trunk.gestureKnotCount', 2);
  const trunkKnotStrength = getPN(params, 'trunkKnotStrength', 'vegetation.trunk.gestureKnotStrength', 0.25);
  const trunkOvality = getPN(params, 'trunkOvality', 'vegetation.trunk.ovality', 0.06);
  
  const crownRadiusRatio = getPN(params, 'crownRadiusRatio', 'vegetation.crown.crownRadiusRatio', 0.8);
  
  // Age affects growth
  const age01 = getPN(params, 'age01', 'vegetation.instance.age01', 1.0);
  const ageGrowth = 0.3 + 0.7 * age01;
  
  // Geometry buffers
  const positions: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const indices: number[] = [];
  const windDataArr: number[] = [];
  const windData2Arr: number[] = [];
  const branchBindingArr: number[] = [];
  const skeleton: SkeletonNode[] = [];
  
  let vertexCount = 0;
  let branchCountActual = 0;
  let leafCountActual = 0;
  let nodeIdCounter = 0;
  
  // ─── Generate trunk knots for natural gesture ───
  const knots: { t: number; dx: number; dz: number; amp: number }[] = [];
  for (let i = 0; i < trunkKnotCount; i++) {
    const t = 0.2 + random() * 0.6;
    const angle = random() * Math.PI * 2;
    knots.push({
      t,
      dx: Math.cos(angle),
      dz: Math.sin(angle),
      amp: trunkKnotStrength * (0.5 + random() * 0.5),
    });
  }
  
  // ─── Trunk radius at height ───
  function trunkRadiusAtY(y: number): number {
    const t = y / (height * ageGrowth);
    let r = baseRadius * Math.pow(1 - t, taperExponent);
    if (t < 0.1) {
      r *= lerp(baseFlare, 1, t / 0.1);
    }
    return r;
  }
  
  // ─── Add ring of vertices ───
  function addRing(
    center: Vec3,
    up: Vec3,
    radius: number,
    segments: number,
    color: { r: number; g: number; b: number },
    windHierarchy: number,
    branchHash: number,
    order: number
  ): number {
    const startIdx = vertexCount;
    
    // Build local coordinate frame
    let tangent = Math.abs(up.y) < 0.99
      ? normalize(cross(up, vec3(0, 1, 0)))
      : normalize(cross(up, vec3(1, 0, 0)));
    const bitangent = normalize(cross(up, tangent));
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      
      // Apply ovality
      const ovalityMul = 1 + trunkOvality * Math.cos(angle * 2);
      const r = radius * ovalityMul;
      
      const px = center.x + (tangent.x * Math.cos(angle) + bitangent.x * Math.sin(angle)) * r;
      const py = center.y + (tangent.y * Math.cos(angle) + bitangent.y * Math.sin(angle)) * r;
      const pz = center.z + (tangent.z * Math.cos(angle) + bitangent.z * Math.sin(angle)) * r;
      
      const nx = tangent.x * Math.cos(angle) + bitangent.x * Math.sin(angle);
      const ny = tangent.y * Math.cos(angle) + bitangent.y * Math.sin(angle);
      const nz = tangent.z * Math.cos(angle) + bitangent.z * Math.sin(angle);
      
      positions.push(px, py, pz);
      normals.push(nx, ny, nz);
      colors.push(color.r, color.g, color.b);
      
      // Wind data
      windDataArr.push(windHierarchy, order / maxOrder, branchHash, 1 - order / maxOrder);
      windData2Arr.push(0, 0, 0, 0);
      branchBindingArr.push(nodeIdCounter, nodeIdCounter, 0, 0);
      
      vertexCount++;
    }
    
    return startIdx;
  }
  
  // ─── Connect two rings with triangles ───
  function connectRings(ring1Start: number, ring2Start: number, segments: number) {
    for (let i = 0; i < segments; i++) {
      const i1 = ring1Start + i;
      const i2 = ring1Start + ((i + 1) % segments);
      const i3 = ring2Start + i;
      const i4 = ring2Start + ((i + 1) % segments);
      
      indices.push(i1, i3, i2);
      indices.push(i2, i3, i4);
    }
  }
  
  // ─── Generate branch recursively ───
  function generateBranch(
    start: Vec3,
    direction: Vec3,
    branchLength: number,
    radius: number,
    order: number,
    depth: number,
    parentId: number
  ): void {
    if (order > maxOrder || depth > 64 || branchLength < 0.18 || radius < 0.004) {
      return;
    }
    
    branchCountActual++;
    const myNodeId = nodeIdCounter++;
    
    // Species-specific bend
    const gravityBend = order === 0 ? 0 : (order / maxOrder) * 0.15;
    const randomBend = (random() - 0.5) * 0.3;
    
    // Apply gesture knots for trunk
    let gestureOffset = vec3(0, 0, 0);
    if (order === 0) {
      for (const knot of knots) {
        const influence = Math.exp(-10 * Math.pow(depth / 20 - knot.t, 2));
        gestureOffset = add(gestureOffset, vec3(knot.dx * knot.amp * influence, 0, knot.dz * knot.amp * influence));
      }
    }
    
    // Build Bezier control points for smooth branch
    const p0 = start;
    const bendDir = normalize(add(
      scale(direction, 1),
      vec3(0, -gravityBend, 0)
    ));
    const p1 = add(start, add(scale(direction, branchLength * 0.33), gestureOffset));
    const p2 = add(start, add(scale(bendDir, branchLength * 0.66), scale(gestureOffset, 0.5)));
    const p3 = add(start, add(scale(bendDir, branchLength), vec3(randomBend * 0.1, 0, randomBend * 0.1)));
    
    // Skeleton node
    const end = p3;
    const center = lerpVec3(start, end, 0.5);
    skeleton.push({
      id: myNodeId,
      parentId,
      order,
      radius,
      length: branchLength,
      dir: direction,
      start,
      end,
      center,
      area: Math.PI * radius * radius,
      mass: Math.PI * radius * radius * branchLength * 800,
      hash: hash(start.x, start.y, start.z),
      stiffness: 1 - order / maxOrder * 0.7,
      damping: 0.3 + order / maxOrder * 0.3,
      parentInfluence: order === 0 ? 0 : 0.7,
      kind: order === 0 ? 'trunk' : order < maxOrder - 1 ? 'branch' : 'twig',
    });
    
    const segments = Math.max(4, Math.floor(lodSettings.segments * (1 - order / maxOrder * 0.5)));
    const steps = Math.max(3, Math.ceil(branchLength * 8));
    
    const barkColorVaried = varyColor(trunkColor, 0.1, random);
    let prevRingStart = -1;
    
    for (let s = 0; s <= steps; s++) {
      const t = s / steps;
      const pos = bezier3(p0, p1, p2, p3, t);
      const tangent = bezier3Tangent(p0, p1, p2, p3, t);
      
      // Radius tapers along branch
      const r = radius * (1 - t * 0.5);
      
      const ringStart = addRing(
        pos,
        tangent,
        r,
        segments,
        barkColorVaried,
        order / maxOrder,
        hash(start.x, start.y, start.z),
        order
      );
      
      if (prevRingStart >= 0) {
        connectRings(prevRingStart, ringStart, segments);
      }
      prevRingStart = ringStart;
    }
    
    // Spawn child branches
    const childCount = order === 0
      ? Math.floor(branchCount * ageGrowth)
      : Math.max(1, Math.floor((branchCount * 0.5) * Math.pow(lengthDecay, order)));
    
    for (let i = 0; i < childCount; i++) {
      if (random() > branchProbability) continue;
      
      // Position along parent branch
      const spawnT = order === 0
        ? 0.3 + (i / childCount) * 0.6
        : 0.2 + random() * 0.6;
      
      const spawnPos = bezier3(p0, p1, p2, p3, spawnT);
      const parentDir = bezier3Tangent(p0, p1, p2, p3, spawnT);
      
      // Branch direction with angle variation
      const angle = branchAngle + (random() - 0.5) * branchAngleVar * 2;
      const azimuth = (i / childCount + random() * 0.2) * Math.PI * 2;
      
      // Rotate away from parent
      let childDir = rotateAroundAxis(parentDir, normalize(cross(parentDir, vec3(0, 1, 0))), angle);
      childDir = rotateAroundAxis(childDir, parentDir, azimuth + twist * spawnT);
      
      // Apical dominance - leader branch goes more vertical
      if (i === 0 && order === 0) {
        childDir = normalize(lerpVec3(childDir, vec3(0, 1, 0), apicalDominance * 0.5));
      }
      
      const childLength = branchLength * lengthDecay * (0.8 + random() * 0.4);
      const childRadius = radius * radiusDecay;
      
      generateBranch(spawnPos, childDir, childLength, childRadius, order + 1, depth + 1, myNodeId);
    }
    
    // Add leaves at terminal branches
    if (order >= maxOrder - 1 && lodSettings.leafDetail > 0) {
      const leavesToAdd = Math.floor(leafClusterSize * lodSettings.leafDetail * ageGrowth);
      for (let l = 0; l < leavesToAdd; l++) {
        const leafT = 0.5 + random() * 0.5;
        const leafPos = bezier3(p0, p1, p2, p3, leafT);
        addLeaf(leafPos, direction, order);
      }
    }
  }
  
  // ─── Add leaf quad ───
  function addLeaf(center: Vec3, parentDir: Vec3, order: number) {
    leafCountActual++;
    
    const size = leafSize * (0.7 + random() * 0.6);
    
    // Leaf faces roughly outward/upward
    const up = normalize(lerpVec3(vec3(0, 1, 0), parentDir, 0.3));
    const right = normalize(cross(up, parentDir));
    const forward = normalize(cross(right, up));
    
    // Random rotation
    const rotAngle = random() * Math.PI * 2;
    const leafRight = rotateAroundAxis(right, up, rotAngle);
    const leafForward = rotateAroundAxis(forward, up, rotAngle);
    
    const halfSize = size * 0.5;
    const leafColorVaried = varyColor(leafColor, leafColorVariation, random);
    
    // Quad vertices
    const v0 = add(center, add(scale(leafRight, -halfSize), scale(leafForward, -halfSize)));
    const v1 = add(center, add(scale(leafRight, halfSize), scale(leafForward, -halfSize)));
    const v2 = add(center, add(scale(leafRight, halfSize), scale(leafForward, halfSize)));
    const v3 = add(center, add(scale(leafRight, -halfSize), scale(leafForward, halfSize)));
    
    const baseIdx = vertexCount;
    
    for (const v of [v0, v1, v2, v3]) {
      positions.push(v.x, v.y, v.z);
      normals.push(up.x, up.y, up.z);
      colors.push(leafColorVaried.r, leafColorVaried.g, leafColorVaried.b);
      
      // Leaf wind data - high flutter
      windDataArr.push(1.0, 1.0, random(), 0.2);
      windData2Arr.push(1, 0, 0, 0);
      branchBindingArr.push(nodeIdCounter - 1, nodeIdCounter - 1, 0, 0);
      
      vertexCount++;
    }
    
    // Two triangles for quad
    indices.push(baseIdx, baseIdx + 1, baseIdx + 2);
    indices.push(baseIdx, baseIdx + 2, baseIdx + 3);
  }
  
  // ─── Generate trunk ───
  const trunkLength = height * ageGrowth;
  generateBranch(
    vec3(0, 0, 0),
    vec3(0, 1, 0),
    trunkLength,
    baseRadius,
    0,
    0,
    -1
  );
  
  // ─── Generate roots ───
  const rootCount = getPN(params, 'rootCount', 'vegetation.roots.rootCount', 5);
  const rootVisibility = getPN(params, 'rootVisibility', 'vegetation.roots.visibility', 0.6);
  
  if (rootVisibility > 0.1) {
    for (let i = 0; i < rootCount; i++) {
      const angle = (i / rootCount) * Math.PI * 2 + random() * 0.3;
      const rootDir = normalize(vec3(
        Math.cos(angle) * 0.8,
        -0.4 - random() * 0.3,
        Math.sin(angle) * 0.8
      ));
      
      const rootLength = baseRadius * 3 * rootVisibility * (0.7 + random() * 0.6);
      const rootRadius = baseRadius * 0.3 * (0.6 + random() * 0.8);
      
      generateBranch(
        vec3(0, 0, 0),
        rootDir,
        rootLength,
        rootRadius,
        maxOrder - 1, // High order = no child branches
        0,
        0
      );
    }
  }
  
  return {
    positions: new Float32Array(positions),
    normals: new Float32Array(normals),
    colors: new Float32Array(colors),
    indices: new Uint32Array(indices),
    windData: new Float32Array(windDataArr),
    windData2: new Float32Array(windData2Arr),
    branchBinding: new Float32Array(branchBindingArr),
    skeleton,
    meta: {
      height: height * ageGrowth,
      vertCount: vertexCount,
      triCount: indices.length / 3,
      branchCount: branchCountActual,
      leafCount: leafCountActual,
    },
  };
}
