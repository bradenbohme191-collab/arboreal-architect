/**
 * HYPER-REALISTIC VEGETATION ENGINE
 * Branch Generator with Smooth Junctions and Hierarchical Structure
 * 
 * Features:
 * - Recursive L-system style branching
 * - Bezier curve segments for natural curvature
 * - Collar bulge at branch junctions
 * - Da Vinci pipe model for radius
 * - Species-aware behavior (drooping willow, upright pine, etc.)
 */

import * as THREE from 'three';
import type { 
  BranchingParams, TrunkParams, GrowthParams, LeafParams 
} from '@/types/hyperParams';
import { interpolateGrowthStage } from '@/types/hyperParams';
import {
  clamp, clamp01, lerp, smoothstep, seededRandom,
  fbm2, tangentFrame, bezierPoint, bezierTangent,
  phyllotaxisAngle, GeometryArrays
} from '../core/utils';
import { createSkeletonNode, WindSkeletonNode } from '../core/WindSolver';

// ─── BRANCH NODE ─────────────────────────────────────────────────────────────

export interface BranchNode {
  id: number;
  parentId: number;
  order: number;
  
  // Bezier control points
  p0: THREE.Vector3;
  p1: THREE.Vector3;
  p2: THREE.Vector3;
  p3: THREE.Vector3;
  
  // Radii
  startRadius: number;
  endRadius: number;
  
  // Attachment info
  attachT: number;  // Position along parent (0-1)
  azimuth: number;  // Angular position around parent
  
  // Children
  children: BranchNode[];
  
  // Physics
  skeletonNode?: WindSkeletonNode;
  
  // Leaf data
  hasLeaves: boolean;
  leafCount: number;
}

export interface BranchSystemResult {
  nodes: BranchNode[];
  skeletonNodes: WindSkeletonNode[];
  terminalBranches: BranchNode[];  // For leaf placement
}

// ─── BRANCH GENERATOR ────────────────────────────────────────────────────────

export function generateBranchSystem(
  trunkTop: THREE.Vector3,
  trunkTopRadius: number,
  trunkHeight: number,
  trunkSkeletonId: number,
  branching: BranchingParams,
  growth: GrowthParams,
  foliage: LeafParams,
  species: string,
  seed: number
): BranchSystemResult {
  const rng = seededRandom(seed + 1000);
  const stage = interpolateGrowthStage(growth.age);
  
  const nodes: BranchNode[] = [];
  const skeletonNodes: WindSkeletonNode[] = [];
  const terminalBranches: BranchNode[] = [];
  
  let nodeIdCounter = 0;
  let phyllotaxisIndex = 0;
  
  // Species-specific behavior
  const isConifer = species === 'PINE' || species === 'SPRUCE';
  const isWillow = species === 'WILLOW';
  const isAcacia = species === 'ACACIA';
  
  // Adjusted branch count based on age
  const branchCount = Math.round(branching.branchCount * stage.branchCountMultiplier);
  
  // ─── Generate Main Branches from Trunk ───────────────────────────────────
  
  for (let i = 0; i < branchCount; i++) {
    // Height distribution along trunk
    let t = branching.startHeight + (i / branchCount) * (0.65 - branching.startHeight);
    t += (rng() - 0.5) * 0.04;
    t = clamp(0.1, 0.85, t);
    
    const y = t * trunkHeight;
    const trunkRadius = trunkTopRadius * (1 + (1 - t) * 4); // Approximate trunk radius at height
    
    // Phyllotaxis angle
    const azimuth = phyllotaxisAngle(phyllotaxisIndex++, branching.phyllotaxis, rng);
    
    // Start position on trunk surface
    const startX = Math.cos(azimuth) * trunkRadius;
    const startZ = Math.sin(azimuth) * trunkRadius;
    const start = new THREE.Vector3(startX, y, startZ);
    
    // Branch direction
    const tiltAngle = (branching.angleMean + (rng() - 0.5) * branching.angleVariance * 2) * Math.PI / 180;
    let dirX = Math.cos(azimuth) * Math.sin(tiltAngle);
    let dirY = Math.cos(tiltAngle);
    let dirZ = Math.sin(azimuth) * Math.sin(tiltAngle);
    
    // Species modifications
    if (isConifer) {
      dirY -= 0.1 + t * 0.2;  // Droop more at top
    }
    if (isWillow) {
      dirY -= 0.15 + t * 0.25;  // Heavy droop
    }
    if (isAcacia) {
      dirY -= 0.05;  // Slight horizontal spread
    }
    
    const dir = new THREE.Vector3(dirX, dirY, dirZ).normalize();
    
    // Branch length (affected by age and position)
    const lengthBase = trunkHeight * 0.55 * (0.7 + rng() * 0.5);
    const length = lengthBase * stage.branchCountMultiplier * (1 - t * 0.3);
    
    // Branch radius (Da Vinci approximation)
    const radius = trunkRadius * 0.3 * (0.7 + rng() * 0.3);
    
    // Create main branch
    const branch = createBranch(
      nodeIdCounter++,
      -1,  // Parent is trunk (special case)
      1,   // Order 1
      start,
      dir,
      length,
      radius,
      t,
      azimuth,
      rng
    );
    
    // Create skeleton node
    branch.skeletonNode = createSkeletonNode(
      trunkSkeletonId,
      start,
      branch.p3,
      1,
      radius,
      'branch',
      0.75
    );
    skeletonNodes.push(branch.skeletonNode);
    
    nodes.push(branch);
    
    // Recursively generate child branches
    generateChildBranches(
      branch,
      branching,
      growth,
      foliage,
      species,
      rng,
      nodes,
      skeletonNodes,
      terminalBranches,
      nodeIdCounter,
      phyllotaxisIndex
    );
  }
  
  // Crown leader (continuation of trunk)
  const leaderStart = new THREE.Vector3(0, trunkHeight * 0.65, 0);
  const leaderDir = new THREE.Vector3(0.05, 1, 0.02).normalize();
  const leaderLength = trunkHeight * 0.25;
  const leaderRadius = trunkTopRadius * 0.85;
  
  const leader = createBranch(
    nodeIdCounter++,
    -1,
    1,
    leaderStart,
    leaderDir,
    leaderLength,
    leaderRadius,
    0.65,
    0,
    rng
  );
  
  leader.skeletonNode = createSkeletonNode(
    trunkSkeletonId,
    leaderStart,
    leader.p3,
    1,
    leaderRadius,
    'branch',
    0.8
  );
  skeletonNodes.push(leader.skeletonNode);
  nodes.push(leader);
  
  generateChildBranches(
    leader,
    branching,
    growth,
    foliage,
    species,
    rng,
    nodes,
    skeletonNodes,
    terminalBranches,
    nodeIdCounter,
    phyllotaxisIndex
  );
  
  return { nodes, skeletonNodes, terminalBranches };
}

function createBranch(
  id: number,
  parentId: number,
  order: number,
  start: THREE.Vector3,
  direction: THREE.Vector3,
  length: number,
  startRadius: number,
  attachT: number,
  azimuth: number,
  rng: () => number
): BranchNode {
  const end = start.clone().add(direction.clone().multiplyScalar(length));
  
  // Control points for natural curve
  const randomOffset = () => (rng() - 0.5) * length * 0.15;
  
  const p1 = start.clone().add(direction.clone().multiplyScalar(length * 0.33))
    .add(new THREE.Vector3(randomOffset(), randomOffset() * 0.5, randomOffset()));
  
  const p2 = start.clone().lerp(end, 0.66)
    .add(new THREE.Vector3(randomOffset(), randomOffset() * 0.5, randomOffset()));
  
  // End radius with Da Vinci tapering
  const endRadius = startRadius * (0.5 + 0.3 * (1 - order / 6));
  
  return {
    id,
    parentId,
    order,
    p0: start,
    p1,
    p2,
    p3: end,
    startRadius,
    endRadius,
    attachT,
    azimuth,
    children: [],
    hasLeaves: false,
    leafCount: 0,
  };
}

function generateChildBranches(
  parent: BranchNode,
  branching: BranchingParams,
  growth: GrowthParams,
  foliage: LeafParams,
  species: string,
  rng: () => number,
  nodes: BranchNode[],
  skeletonNodes: WindSkeletonNode[],
  terminalBranches: BranchNode[],
  nodeIdCounter: number,
  phyllotaxisIndex: number
): void {
  const stage = interpolateGrowthStage(growth.age);
  
  // Stop conditions
  if (parent.order >= branching.maxOrder) {
    parent.hasLeaves = true;
    parent.leafCount = Math.round(foliage.density * stage.leafDensityMultiplier);
    terminalBranches.push(parent);
    return;
  }
  
  const parentLength = parent.p0.distanceTo(parent.p3);
  if (parentLength < 0.12 || parent.startRadius < 0.003) {
    parent.hasLeaves = true;
    parent.leafCount = Math.round(foliage.density * 0.5 * stage.leafDensityMultiplier);
    terminalBranches.push(parent);
    return;
  }
  
  // Determine number of children
  const baseCount = Math.max(1, Math.round(
    branching.childBudget * (1 - parent.order * 0.15) + rng() * 1.5
  ));
  
  let childCount = 0;
  
  for (let i = 0; i < baseCount; i++) {
    // Probability check
    if (rng() > branching.probability) continue;
    
    // Attachment position along parent
    const attachT = 0.25 + rng() * 0.55;
    const attachPoint = bezierPoint(parent.p0, parent.p1, parent.p2, parent.p3, attachT);
    const parentTangent = bezierTangent(parent.p0, parent.p1, parent.p2, parent.p3, attachT);
    
    // Get tangent frame
    const { right, forward } = tangentFrame(parentTangent);
    
    // Child azimuth (phyllotaxis)
    const azimuth = phyllotaxisAngle(phyllotaxisIndex++, branching.phyllotaxis, rng);
    const sideDir = right.clone()
      .multiplyScalar(Math.cos(azimuth))
      .add(forward.clone().multiplyScalar(Math.sin(azimuth)))
      .normalize();
    
    // Child direction (branch off from parent)
    const tiltAngle = (branching.angleMean + (rng() - 0.5) * branching.angleVariance * 2) * Math.PI / 180;
    let childDir = parentTangent.clone()
      .multiplyScalar(Math.cos(tiltAngle))
      .add(sideDir.clone().multiplyScalar(Math.sin(tiltAngle)));
    
    // Species modifications
    const isConifer = species === 'PINE' || species === 'SPRUCE';
    const isWillow = species === 'WILLOW';
    
    if (isConifer) {
      childDir.y -= 0.1 + attachT * 0.2;
    }
    if (isWillow) {
      childDir.y -= 0.2 + attachT * 0.3;
    }
    
    childDir.normalize();
    
    // Child dimensions
    const childLength = parentLength * branching.lengthDecay * (0.7 + rng() * 0.5);
    const childRadius = parent.startRadius * (1 - attachT) * branching.radiusDecay * (0.7 + rng() * 0.3);
    
    // Create child branch
    const child = createBranch(
      nodeIdCounter++,
      parent.id,
      parent.order + 1,
      attachPoint,
      childDir,
      Math.max(0.1, childLength),
      Math.max(0.005, childRadius),
      attachT,
      azimuth,
      rng
    );
    
    // Skeleton node
    child.skeletonNode = createSkeletonNode(
      parent.skeletonNode?.id ?? -1,
      attachPoint,
      child.p3,
      child.order,
      childRadius,
      child.order >= branching.maxOrder - 1 ? 'twig' : 'branch',
      0.75 - child.order * 0.05
    );
    skeletonNodes.push(child.skeletonNode);
    
    parent.children.push(child);
    nodes.push(child);
    childCount++;
    
    // Recurse
    generateChildBranches(
      child,
      branching,
      growth,
      foliage,
      species,
      rng,
      nodes,
      skeletonNodes,
      terminalBranches,
      nodeIdCounter,
      phyllotaxisIndex
    );
  }
  
  // Apical continuation (main branch continues)
  if (rng() < branching.apicalDominance && parent.order < branching.maxOrder) {
    const contDir = bezierTangent(parent.p0, parent.p1, parent.p2, parent.p3, 1)
      .add(new THREE.Vector3((rng() - 0.5) * 0.12, 0.08, (rng() - 0.5) * 0.12))
      .normalize();
    
    const contLength = parentLength * 0.8;
    const contRadius = parent.endRadius * 0.88;
    
    const continuation = createBranch(
      nodeIdCounter++,
      parent.id,
      parent.order,
      parent.p3,
      contDir,
      contLength,
      contRadius,
      1,
      parent.azimuth,
      rng
    );
    
    continuation.skeletonNode = createSkeletonNode(
      parent.skeletonNode?.id ?? -1,
      parent.p3,
      continuation.p3,
      continuation.order,
      contRadius,
      'branch',
      0.7
    );
    skeletonNodes.push(continuation.skeletonNode);
    
    parent.children.push(continuation);
    nodes.push(continuation);
    
    generateChildBranches(
      continuation,
      branching,
      growth,
      foliage,
      species,
      rng,
      nodes,
      skeletonNodes,
      terminalBranches,
      nodeIdCounter,
      phyllotaxisIndex
    );
  }
  
  // Mark terminal if no children were added
  if (childCount === 0 && parent.order >= Math.max(2, branching.maxOrder - 2)) {
    parent.hasLeaves = true;
    parent.leafCount = Math.round(foliage.density * stage.leafDensityMultiplier);
    terminalBranches.push(parent);
  }
}

// ─── BRANCH GEOMETRY BUILDER ─────────────────────────────────────────────────

export function buildBranchGeometry(
  nodes: BranchNode[],
  branching: BranchingParams,
  barkColor: THREE.Color,
  barkScale: number,
  arrays: GeometryArrays,
  windData: number[],
  rng: () => number
): void {
  for (const branch of nodes) {
    const order = branch.order;
    const segCount = Math.max(4, Math.round((8 - order) * 0.8));
    const ringCount = Math.max(4, Math.round((8 - order * 0.5) * 0.9));
    
    const startIdx = arrays.positions.length / 3;
    
    for (let r = 0; r <= ringCount; r++) {
      const t = r / ringCount;
      const pos = bezierPoint(branch.p0, branch.p1, branch.p2, branch.p3, t);
      const tan = bezierTangent(branch.p0, branch.p1, branch.p2, branch.p3, t);
      const { right, forward } = tangentFrame(tan);
      
      // Interpolate radius
      let radius = lerp(branch.startRadius, branch.endRadius, t);
      
      // Collar bulge at base
      if (branching.collarStrength > 0 && t < branching.collarLength && order > 0) {
        const u = 1 - t / branching.collarLength;
        radius *= 1 + branching.collarStrength * u * u * (1 - order * 0.15);
      }
      
      for (let s = 0; s <= segCount; s++) {
        const angle = (s / segCount) * Math.PI * 2;
        let localRadius = radius;
        
        // Bark displacement (simplified for branches)
        if (order < 3) {
          const barkNoise = fbm2(
            angle * 2 + branch.id * 0.1,
            t * 4,
            2
          );
          localRadius *= 1 + (barkNoise - 0.5) * 0.015 * barkScale;
        }
        
        const ringDir = right.clone()
          .multiplyScalar(Math.cos(angle))
          .add(forward.clone().multiplyScalar(Math.sin(angle)));
        
        const vtx = pos.clone().add(ringDir.clone().multiplyScalar(localRadius));
        const normal = ringDir.normalize();
        
        // Color (slightly different per branch)
        const colorVar = 0.85 + rng() * 0.25;
        arrays.positions.push(vtx.x, vtx.y, vtx.z);
        arrays.normals.push(normal.x, normal.y, normal.z);
        arrays.colors.push(barkColor.r * colorVar, barkColor.g * colorVar, barkColor.b * colorVar);
        
        // Wind data
        const hierarchy = clamp01(0.05 + order * 0.18 + t * 0.15);
        const tipWeight = clamp01(0.2 + t * 0.8);
        const rigidity = clamp01(0.95 - order * 0.12 - t * 0.2);
        const branchHash = (branch.skeletonNode?.hash ?? 0);
        
        windData.push(hierarchy, tipWeight, branchHash, rigidity);
      }
    }
    
    // Build indices
    for (let r = 0; r < ringCount; r++) {
      for (let s = 0; s < segCount; s++) {
        const a = startIdx + r * (segCount + 1) + s;
        const b = a + segCount + 1;
        arrays.indices.push(a, b, a + 1);
        arrays.indices.push(a + 1, b, b + 1);
      }
    }
  }
}
