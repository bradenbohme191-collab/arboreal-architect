/**
 * HYPER-REALISTIC VEGETATION ENGINE
 * Leaf Generator with Veins, Petioles, and Realistic Shapes
 * 
 * Features:
 * - Multiple leaf shapes (ovate, lanceolate, lobed, needle, etc.)
 * - Vein network generation
 * - Petiole connection
 * - Cluster placement
 * - Color variation and translucency
 */

import * as THREE from 'three';
import type { LeafParams, GrowthParams } from '@/types/hyperParams';
import { interpolateGrowthStage } from '@/types/hyperParams';
import {
  clamp, clamp01, lerp, smoothstep, seededRandom,
  tangentFrame, GeometryArrays, colorVariation
} from '../core/utils';
import { BranchNode } from './BranchGenerator';

// ─── LEAF SHAPES ─────────────────────────────────────────────────────────────

interface LeafVertex {
  position: THREE.Vector3;
  normal: THREE.Vector3;
  uv: { u: number; v: number };
}

function generateLeafShape(
  shape: LeafParams['shape'],
  length: number,
  width: number,
  detail: number,
  rng: () => number
): LeafVertex[] {
  const vertices: LeafVertex[] = [];
  
  switch (shape) {
    case 'OVATE':
      return generateOvateLeaf(length, width, detail, rng);
    case 'LANCEOLATE':
      return generateLanceolateLeaf(length, width, detail, rng);
    case 'PALMATELY_LOBED':
      return generateLobedLeaf(length, width, detail, rng);
    case 'NEEDLE':
      return generateNeedleLeaf(length, width, rng);
    case 'COMPOUND':
      return generateCompoundLeaf(length, width, detail, rng);
    default:
      return generateOvateLeaf(length, width, detail, rng);
  }
}

function generateOvateLeaf(
  length: number,
  width: number,
  detail: number,
  rng: () => number
): LeafVertex[] {
  const vertices: LeafVertex[] = [];
  const segments = Math.max(4, Math.round(8 * detail));
  
  // Create ovate (egg-shaped) outline
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * length;
    
    // Ovate profile: widest at 1/3 from base
    const widthProfile = Math.sin(t * Math.PI) * (1 + 0.3 * (1 - t));
    const x = widthProfile * width * 0.5;
    
    // Add edge waviness
    const wave = Math.sin(t * 12 + rng() * 2) * 0.02 * width;
    
    // Left and right vertices
    vertices.push({
      position: new THREE.Vector3(-x - wave, y, 0),
      normal: new THREE.Vector3(0, 0, 1),
      uv: { u: 0, v: t },
    });
    vertices.push({
      position: new THREE.Vector3(x + wave, y, 0),
      normal: new THREE.Vector3(0, 0, 1),
      uv: { u: 1, v: t },
    });
  }
  
  // Add midrib vertices for slight 3D relief
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * length;
    const z = Math.sin(t * Math.PI) * 0.005; // Slight dome
    
    vertices.push({
      position: new THREE.Vector3(0, y, z),
      normal: new THREE.Vector3(0, 0.1, 1).normalize(),
      uv: { u: 0.5, v: t },
    });
  }
  
  return vertices;
}

function generateLanceolateLeaf(
  length: number,
  width: number,
  detail: number,
  rng: () => number
): LeafVertex[] {
  const vertices: LeafVertex[] = [];
  const segments = Math.max(4, Math.round(8 * detail));
  
  // Lanceolate: long and narrow, widest near middle
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const y = t * length;
    
    // Lanceolate profile: narrow, tapers at both ends
    const widthProfile = Math.sin(t * Math.PI) * 0.8;
    const x = widthProfile * width * 0.5;
    
    vertices.push({
      position: new THREE.Vector3(-x, y, 0),
      normal: new THREE.Vector3(0, 0, 1),
      uv: { u: 0, v: t },
    });
    vertices.push({
      position: new THREE.Vector3(x, y, 0),
      normal: new THREE.Vector3(0, 0, 1),
      uv: { u: 1, v: t },
    });
  }
  
  return vertices;
}

function generateLobedLeaf(
  length: number,
  width: number,
  detail: number,
  rng: () => number
): LeafVertex[] {
  const vertices: LeafVertex[] = [];
  const lobeCount = 5;
  const segments = Math.max(8, Math.round(16 * detail));
  
  // Palmately lobed (like maple)
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = (t - 0.5) * Math.PI * 0.8;  // -72° to +72°
    
    // Lobe profile
    const lobePhase = t * lobeCount * Math.PI;
    const lobeRadius = length * (0.4 + 0.6 * Math.abs(Math.cos(lobePhase)));
    
    const x = Math.sin(angle) * lobeRadius;
    const y = Math.cos(angle) * lobeRadius * 0.5 + length * 0.3;
    
    vertices.push({
      position: new THREE.Vector3(x, y, 0),
      normal: new THREE.Vector3(0, 0, 1),
      uv: { u: t, v: y / length },
    });
  }
  
  // Center vertex
  vertices.push({
    position: new THREE.Vector3(0, length * 0.3, 0.002),
    normal: new THREE.Vector3(0, 0, 1),
    uv: { u: 0.5, v: 0.3 },
  });
  
  return vertices;
}

function generateNeedleLeaf(
  length: number,
  width: number,
  rng: () => number
): LeafVertex[] {
  // Simple quad for needle
  const w = width * 0.1;  // Needles are very thin
  
  return [
    { position: new THREE.Vector3(-w, 0, 0), normal: new THREE.Vector3(0, 0, 1), uv: { u: 0, v: 0 } },
    { position: new THREE.Vector3(w, 0, 0), normal: new THREE.Vector3(0, 0, 1), uv: { u: 1, v: 0 } },
    { position: new THREE.Vector3(w * 0.3, length, 0), normal: new THREE.Vector3(0, 0, 1), uv: { u: 0.65, v: 1 } },
    { position: new THREE.Vector3(-w * 0.3, length, 0), normal: new THREE.Vector3(0, 0, 1), uv: { u: 0.35, v: 1 } },
  ];
}

function generateCompoundLeaf(
  length: number,
  width: number,
  detail: number,
  rng: () => number
): LeafVertex[] {
  // Compound leaf: multiple small leaflets
  const vertices: LeafVertex[] = [];
  const leafletCount = 5 + Math.floor(rng() * 4);
  const leafletLength = length / leafletCount * 1.5;
  const leafletWidth = width * 0.4;
  
  for (let l = 0; l < leafletCount; l++) {
    const t = l / (leafletCount - 1);
    const baseY = t * length * 0.8;
    const offset = l % 2 === 0 ? -1 : 1;
    const offsetX = offset * width * 0.3 * (l > 0 ? 1 : 0);
    
    // Simple quad per leaflet
    const leafletVerts = [
      { x: offsetX - leafletWidth * 0.3, y: baseY },
      { x: offsetX + leafletWidth * 0.3, y: baseY },
      { x: offsetX + leafletWidth * 0.2, y: baseY + leafletLength },
      { x: offsetX - leafletWidth * 0.2, y: baseY + leafletLength },
    ];
    
    for (const v of leafletVerts) {
      vertices.push({
        position: new THREE.Vector3(v.x, v.y, 0),
        normal: new THREE.Vector3(0, 0, 1),
        uv: { u: 0.5 + v.x / width, v: v.y / length },
      });
    }
  }
  
  return vertices;
}

// ─── LEAF CLUSTER GENERATOR ──────────────────────────────────────────────────

export interface LeafCluster {
  position: THREE.Vector3;
  direction: THREE.Vector3;
  count: number;
  branchOrder: number;
}

export function generateLeafClusters(
  terminalBranches: BranchNode[],
  foliage: LeafParams,
  growth: GrowthParams
): LeafCluster[] {
  const stage = interpolateGrowthStage(growth.age);
  const clusters: LeafCluster[] = [];
  
  for (const branch of terminalBranches) {
    if (!branch.hasLeaves) continue;
    
    const count = Math.round(branch.leafCount * stage.leafDensityMultiplier);
    if (count <= 0) continue;
    
    // Get branch tip direction
    const tipDir = branch.p3.clone().sub(branch.p2).normalize();
    
    clusters.push({
      position: branch.p3.clone(),
      direction: tipDir,
      count,
      branchOrder: branch.order,
    });
  }
  
  return clusters;
}

// ─── LEAF GEOMETRY BUILDER ───────────────────────────────────────────────────

export function buildLeafGeometry(
  clusters: LeafCluster[],
  foliage: LeafParams,
  growth: GrowthParams,
  seed: number,
  arrays: GeometryArrays,
  windData: number[]
): number {
  const rng = seededRandom(seed + 2000);
  const stage = interpolateGrowthStage(growth.age);
  
  const baseColor = new THREE.Color(foliage.colorBase);
  const leafSize = foliage.length * stage.leafSize;
  const leafWidth = foliage.width * stage.leafSize;
  
  let totalLeaves = 0;
  
  for (const cluster of clusters) {
    const { right, forward } = tangentFrame(cluster.direction);
    const clusterRadius = leafSize * Math.sqrt(cluster.count) * 1.8;
    
    for (let i = 0; i < cluster.count; i++) {
      // Random position within cluster
      const az = rng() * Math.PI * 2;
      const dist = Math.sqrt(rng()) * clusterRadius;
      const lift = (rng() - 0.3) * clusterRadius * 0.6;
      
      const center = cluster.position.clone()
        .add(right.clone().multiplyScalar(Math.cos(az) * dist))
        .add(forward.clone().multiplyScalar(Math.sin(az) * dist))
        .add(new THREE.Vector3(0, lift, 0));
      
      // Random size variation
      const size = leafSize * (0.7 + rng() * 0.6);
      const width = leafWidth * (0.7 + rng() * 0.6);
      
      // Leaf orientation (random but biased upward)
      const leafNormal = right.clone()
        .multiplyScalar(rng() - 0.5)
        .add(forward.clone().multiplyScalar(rng() - 0.5))
        .add(new THREE.Vector3(0, 0.3, 0))
        .normalize();
      
      const leafRight = new THREE.Vector3().crossVectors(leafNormal, new THREE.Vector3(0, 1, 0)).normalize();
      const leafUp = new THREE.Vector3().crossVectors(leafNormal, leafRight).normalize();
      
      // Color variation
      const colorVar = 1 + (rng() - 0.5) * foliage.colorVariation * 2;
      const leafColor = new THREE.Color(
        clamp01(baseColor.r * colorVar),
        clamp01(baseColor.g * colorVar),
        clamp01(baseColor.b * colorVar)
      );
      
      // Simple quad leaf (for performance)
      const startIdx = arrays.positions.length / 3;
      const hw = width * 0.5;
      const hl = size;
      
      // Petiole droop
      const droop = foliage.petioleDroop * size;
      
      const corners = [
        center.clone().add(leafRight.clone().multiplyScalar(-hw)).add(leafUp.clone().multiplyScalar(-hl * 0.2)),
        center.clone().add(leafRight.clone().multiplyScalar(hw)).add(leafUp.clone().multiplyScalar(-hl * 0.2)),
        center.clone().add(leafRight.clone().multiplyScalar(hw * 0.8)).add(leafUp.clone().multiplyScalar(hl)).add(new THREE.Vector3(0, -droop, 0)),
        center.clone().add(leafRight.clone().multiplyScalar(-hw * 0.8)).add(leafUp.clone().multiplyScalar(hl)).add(new THREE.Vector3(0, -droop, 0)),
      ];
      
      for (const corner of corners) {
        arrays.positions.push(corner.x, corner.y, corner.z);
        arrays.normals.push(leafNormal.x, leafNormal.y, leafNormal.z);
        arrays.colors.push(leafColor.r, leafColor.g, leafColor.b);
        
        // Wind data: leaves are highly flexible
        windData.push(
          0.9 + rng() * 0.1,  // hierarchy (high - leaves)
          0.9,                 // tipWeight
          rng(),               // hash
          0.08 + rng() * 0.1   // rigidity (very low)
        );
      }
      
      // Two triangles for quad
      arrays.indices.push(startIdx, startIdx + 1, startIdx + 2);
      arrays.indices.push(startIdx, startIdx + 2, startIdx + 3);
      
      totalLeaves++;
    }
  }
  
  return totalLeaves;
}

// ─── HIGH-DETAIL LEAF WITH VEINS ─────────────────────────────────────────────

export function buildDetailedLeafGeometry(
  position: THREE.Vector3,
  direction: THREE.Vector3,
  foliage: LeafParams,
  rng: () => number,
  arrays: GeometryArrays,
  windData: number[]
): void {
  const { right, forward } = tangentFrame(direction);
  const baseColor = new THREE.Color(foliage.colorBase);
  
  // Generate leaf shape vertices
  const leafVerts = generateLeafShape(
    foliage.shape,
    foliage.length,
    foliage.width,
    foliage.veinDetail,
    rng
  );
  
  if (leafVerts.length < 4) return;
  
  const startIdx = arrays.positions.length / 3;
  
  // Transform and add vertices
  for (const vert of leafVerts) {
    const worldPos = position.clone()
      .add(right.clone().multiplyScalar(vert.position.x))
      .add(new THREE.Vector3(0, 1, 0).multiplyScalar(vert.position.y))
      .add(forward.clone().multiplyScalar(vert.position.z));
    
    const worldNormal = forward.clone()
      .multiplyScalar(vert.normal.z)
      .add(right.clone().multiplyScalar(vert.normal.x))
      .add(new THREE.Vector3(0, 1, 0).multiplyScalar(vert.normal.y))
      .normalize();
    
    // Color with subtle variation based on vein proximity
    const veinProximity = Math.abs(vert.uv.u - 0.5) * 2;
    const veinDarkening = 0.9 + veinProximity * 0.1;
    
    arrays.positions.push(worldPos.x, worldPos.y, worldPos.z);
    arrays.normals.push(worldNormal.x, worldNormal.y, worldNormal.z);
    arrays.colors.push(
      baseColor.r * veinDarkening,
      baseColor.g * veinDarkening,
      baseColor.b * veinDarkening
    );
    
    windData.push(0.95, 0.95, rng(), 0.05);
  }
  
  // Build indices (triangle fan from center or strip)
  if (foliage.shape === 'NEEDLE') {
    arrays.indices.push(startIdx, startIdx + 1, startIdx + 2);
    arrays.indices.push(startIdx, startIdx + 2, startIdx + 3);
  } else {
    // For other shapes, use a simple fan from first vertex
    for (let i = 1; i < leafVerts.length - 1; i++) {
      arrays.indices.push(startIdx, startIdx + i, startIdx + i + 1);
    }
  }
}
