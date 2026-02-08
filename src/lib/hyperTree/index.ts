/**
 * HYPER-REALISTIC VEGETATION ENGINE
 * Main Export and Tree Generator Orchestrator
 */

export * from './core/utils';
export * from './core/WindSolver';
export * from './generators/RootGenerator';
export * from './generators/TrunkGenerator';
export * from './generators/BranchGenerator';
export * from './generators/LeafGenerator';

import * as THREE from 'three';
import type { HyperTreeParams } from '@/types/hyperParams';
import { DEFAULT_HYPER_TREE_PARAMS, interpolateGrowthStage } from '@/types/hyperParams';
import { 
  seededRandom, createGeometryArrays, GeometryArrays 
} from './core/utils';
import { 
  WindSkeletonNode, createWindState, WindState,
  solveWindPhysics, updateWindState, applyWindToVertices,
  resetNodeIdCounter
} from './core/WindSolver';
import { 
  generateRootSystem, buildRootGeometry, RootSystemResult 
} from './generators/RootGenerator';
import { generateTrunk, TrunkResult } from './generators/TrunkGenerator';
import { 
  generateBranchSystem, buildBranchGeometry, BranchSystemResult 
} from './generators/BranchGenerator';
import { 
  generateLeafClusters, buildLeafGeometry 
} from './generators/LeafGenerator';

// ─── TREE GENERATION RESULT ──────────────────────────────────────────────────

export interface HyperTreeResult {
  // Geometry data
  positions: Float32Array;
  normals: Float32Array;
  colors: Float32Array;
  indices: Uint32Array | Uint16Array;
  windData: Float32Array;
  
  // Original positions for wind animation
  originalPositions: Float32Array;
  
  // Physics skeleton
  skeletonNodes: WindSkeletonNode[];
  
  // Wind state
  windState: WindState;
  
  // Metadata
  meta: {
    vertexCount: number;
    triangleCount: number;
    branchCount: number;
    leafCount: number;
    rootCount: number;
    height: number;
    crownRadius: number;
    age: number;
    species: string;
  };
}

// ─── MAIN TREE GENERATOR ─────────────────────────────────────────────────────

export function generateHyperTree(
  params: Partial<HyperTreeParams> = {},
  seed: number = 1337
): HyperTreeResult {
  // Merge with defaults
  const p: HyperTreeParams = {
    ...DEFAULT_HYPER_TREE_PARAMS,
    ...params,
    soil: { ...DEFAULT_HYPER_TREE_PARAMS.soil, ...params.soil },
    roots: { ...DEFAULT_HYPER_TREE_PARAMS.roots, ...params.roots },
    growth: { ...DEFAULT_HYPER_TREE_PARAMS.growth, ...params.growth },
    wind: { ...DEFAULT_HYPER_TREE_PARAMS.wind, ...params.wind },
    bark: { ...DEFAULT_HYPER_TREE_PARAMS.bark, ...params.bark },
    damage: { ...DEFAULT_HYPER_TREE_PARAMS.damage, ...params.damage },
    foliage: { ...DEFAULT_HYPER_TREE_PARAMS.foliage, ...params.foliage },
    trunk: { ...DEFAULT_HYPER_TREE_PARAMS.trunk, ...params.trunk },
    branching: { ...DEFAULT_HYPER_TREE_PARAMS.branching, ...params.branching },
    lod: { ...DEFAULT_HYPER_TREE_PARAMS.lod, ...params.lod },
    viewport: { ...DEFAULT_HYPER_TREE_PARAMS.viewport, ...params.viewport },
  };
  
  const rng = seededRandom(seed);
  const arrays = createGeometryArrays();
  const windData: number[] = [];
  const allSkeletonNodes: WindSkeletonNode[] = [];
  
  // Reset node ID counter for wind skeleton
  resetNodeIdCounter();
  
  // Get growth stage
  const stage = interpolateGrowthStage(p.growth.age);
  
  // ─── 1. Generate Root System ───────────────────────────────────────────────
  
  const rootResult: RootSystemResult = generateRootSystem(
    p.roots,
    p.soil,
    p.trunk.baseRadius,
    seed
  );
  
  // Build root geometry
  const trunkColor = new THREE.Color(p.trunk.barkColor);
  buildRootGeometry(
    rootResult.nodes,
    p.roots,
    trunkColor,
    arrays,
    windData,
    rng
  );
  
  allSkeletonNodes.push(...rootResult.skeletonNodes);
  
  // ─── 2. Generate Trunk ─────────────────────────────────────────────────────
  
  const trunkResult: TrunkResult = generateTrunk(
    p.trunk,
    p.roots,
    p.bark,
    p.growth,
    rootResult.flutePhases,
    seed,
    arrays,
    windData
  );
  
  allSkeletonNodes.push(trunkResult.skeletonNode);
  
  // ─── 3. Generate Branch System ─────────────────────────────────────────────
  
  const branchResult: BranchSystemResult = generateBranchSystem(
    trunkResult.topPosition,
    trunkResult.topRadius,
    trunkResult.height,
    trunkResult.skeletonNode.id,
    p.branching,
    p.growth,
    p.foliage,
    p.species,
    seed
  );
  
  // Build branch geometry
  buildBranchGeometry(
    branchResult.nodes,
    p.branching,
    trunkColor,
    p.bark.crackScale * 0.6,
    arrays,
    windData,
    rng
  );
  
  allSkeletonNodes.push(...branchResult.skeletonNodes);
  
  // ─── 4. Generate Leaves ────────────────────────────────────────────────────
  
  const leafClusters = generateLeafClusters(
    branchResult.terminalBranches,
    p.foliage,
    p.growth
  );
  
  const leafCount = buildLeafGeometry(
    leafClusters,
    p.foliage,
    p.growth,
    seed,
    arrays,
    windData
  );
  
  // ─── 5. Build Skeleton Hierarchy ───────────────────────────────────────────
  
  // Link parent-child relationships in skeleton
  for (const node of allSkeletonNodes) {
    if (node.parentId >= 0) {
      const parent = allSkeletonNodes.find(n => n.id === node.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  }
  
  // ─── 6. Create Output Arrays ───────────────────────────────────────────────
  
  const vertexCount = arrays.positions.length / 3;
  const useUint32 = vertexCount > 65535;
  
  const positions = new Float32Array(arrays.positions);
  const normals = new Float32Array(arrays.normals);
  const colors = new Float32Array(arrays.colors);
  const indices = useUint32 
    ? new Uint32Array(arrays.indices) 
    : new Uint16Array(arrays.indices);
  const windDataArray = new Float32Array(windData);
  const originalPositions = new Float32Array(arrays.positions);
  
  // ─── 7. Calculate Metadata ─────────────────────────────────────────────────
  
  // Estimate crown radius from branch positions
  let maxRadius = 0;
  for (const branch of branchResult.nodes) {
    const dist = Math.sqrt(branch.p3.x * branch.p3.x + branch.p3.z * branch.p3.z);
    maxRadius = Math.max(maxRadius, dist);
  }
  
  return {
    positions,
    normals,
    colors,
    indices,
    windData: windDataArray,
    originalPositions,
    skeletonNodes: allSkeletonNodes,
    windState: createWindState(),
    meta: {
      vertexCount,
      triangleCount: arrays.indices.length / 3,
      branchCount: branchResult.nodes.length,
      leafCount,
      rootCount: rootResult.nodes.length,
      height: trunkResult.height,
      crownRadius: maxRadius,
      age: p.growth.age,
      species: p.species,
    },
  };
}

// ─── WIND UPDATE FUNCTION ────────────────────────────────────────────────────

export function updateHyperTreeWind(
  result: HyperTreeResult,
  params: HyperTreeParams,
  dt: number
): void {
  // Update wind state
  updateWindState(result.windState, params.wind, dt);
  
  // Solve physics
  solveWindPhysics(result.skeletonNodes, result.windState, params.wind, dt);
  
  // Apply to vertices
  applyWindToVertices(
    result.positions,
    result.originalPositions,
    result.windData,
    result.skeletonNodes,
    result.windState,
    params.wind
  );
}
