/**
 * HYPER-REALISTIC VEGETATION ENGINE
 * Root System Generator with Fluting Transition
 * 
 * Features:
 * - Multiple root architecture types (tap, fibrous, heart, plate, buttress)
 * - Tropism-driven growth (moisture, gravity, obstacle avoidance)
 * - Organic fluting transition where roots meet trunk
 * - Da Vinci's pipe model for radius tapering
 */

import * as THREE from 'three';
import type { RootParams, SoilParams } from '@/types/hyperParams';
import { 
  clamp, lerp, smoothstep, seededRandom, fbm2, 
  tangentFrame, bezierPoint, bezierTangent,
  GeometryArrays, pushVertex, pushQuad,
  colorVariation
} from '../core/utils';
import { createSkeletonNode, WindSkeletonNode } from '../core/WindSolver';

// ─── ROOT NODE ───────────────────────────────────────────────────────────────

export interface RootNode {
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
  
  // Growth parameters
  tropismResponse: number;
  absorptionRate: number;
  
  // Fluting data
  flutePhase: number;  // Angular offset for flute alignment
  
  children: RootNode[];
  skeletonNode?: WindSkeletonNode;
}

export interface RootSystemResult {
  nodes: RootNode[];
  skeletonNodes: WindSkeletonNode[];
  flutePhases: number[];  // Angular positions of major roots for trunk fluting
}

// ─── ROOT GENERATOR ──────────────────────────────────────────────────────────

export function generateRootSystem(
  params: RootParams,
  soil: SoilParams,
  trunkRadius: number,
  seed: number
): RootSystemResult {
  const rng = seededRandom(seed);
  const nodes: RootNode[] = [];
  const skeletonNodes: WindSkeletonNode[] = [];
  const flutePhases: number[] = [];
  
  let nodeIdCounter = 0;
  
  // Determine root count based on architecture
  const rootCount = params.count;
  
  // Generate primary roots based on architecture
  for (let i = 0; i < rootCount; i++) {
    // Angular distribution - align with fluting
    const baseAngle = (i / rootCount) * Math.PI * 2;
    const angleVariation = (rng() - 0.5) * 0.3;
    const angle = baseAngle + angleVariation;
    
    // Store for trunk fluting
    flutePhases.push(angle);
    
    // Starting position at trunk base
    const startX = Math.cos(angle) * trunkRadius * 0.6;
    const startZ = Math.sin(angle) * trunkRadius * 0.6;
    const startY = -0.02; // Slightly below ground
    
    const start = new THREE.Vector3(startX, startY, startZ);
    
    // Root parameters based on architecture
    let length: number, depth: number, spread: number;
    
    switch (params.architecture) {
      case 'TAP_ROOT':
        if (i === 0) {
          // Central tap root
          length = params.tapRootLength * (0.9 + rng() * 0.2);
          depth = params.maxDepth;
          spread = 0.2;
        } else {
          // Lateral roots
          length = params.spreadRadius * (0.6 + rng() * 0.4);
          depth = params.maxDepth * (0.3 + rng() * 0.3);
          spread = 0.8 + rng() * 0.4;
        }
        break;
        
      case 'FIBROUS':
        length = params.spreadRadius * (0.3 + rng() * 0.5);
        depth = params.maxDepth * (0.2 + rng() * 0.3);
        spread = 1.0 + rng() * 0.3;
        break;
        
      case 'HEART':
        length = params.spreadRadius * (0.5 + rng() * 0.4);
        depth = params.maxDepth * (0.4 + rng() * 0.4);
        spread = 0.6 + rng() * 0.3;
        break;
        
      case 'PLATE':
        length = params.spreadRadius * (0.8 + rng() * 0.4);
        depth = params.maxDepth * (0.15 + rng() * 0.15);
        spread = 1.2 + rng() * 0.3;
        break;
        
      case 'BUTTRESS':
        length = params.spreadRadius * (0.9 + rng() * 0.3);
        depth = params.maxDepth * (0.25 + rng() * 0.25);
        spread = 1.0 + rng() * 0.2;
        break;
        
      default:
        length = params.spreadRadius * (0.6 + rng() * 0.4);
        depth = params.maxDepth * (0.4 + rng() * 0.4);
        spread = 0.8 + rng() * 0.3;
    }
    
    // Calculate end position with tropism
    const dirHorizontal = new THREE.Vector3(Math.cos(angle), 0, Math.sin(angle));
    
    // Gravitropism pulls downward, hydrotropism toward moisture
    const gravityPull = params.gravitropismStrength * depth;
    const moistureBias = (soil.moisture - 0.5) * params.hydrotropismStrength * 0.5;
    
    const endX = startX + dirHorizontal.x * length * spread;
    const endZ = startZ + dirHorizontal.z * length * spread;
    const endY = -depth - moistureBias;
    
    const end = new THREE.Vector3(endX, endY, endZ);
    
    // Control points for natural curve
    const wiggle = params.spreadRadius * 0.1;
    const sideDir = new THREE.Vector3(-dirHorizontal.z, 0, dirHorizontal.x);
    
    const p1 = start.clone().lerp(end, 0.33)
      .add(new THREE.Vector3(0, -depth * 0.15, 0))
      .add(sideDir.clone().multiplyScalar(Math.sin(rng() * 6.28) * wiggle));
    
    const p2 = start.clone().lerp(end, 0.66)
      .add(new THREE.Vector3(0, -depth * 0.5, 0))
      .add(sideDir.clone().multiplyScalar(Math.sin(rng() * 6.28) * wiggle * 0.7));
    
    // Radius with Da Vinci tapering
    const startRad = params.baseRadius * (0.8 + rng() * 0.4);
    const endRad = startRad * params.taperRate * 0.3;
    
    const rootNode: RootNode = {
      id: nodeIdCounter++,
      parentId: -1,
      order: 1,
      p0: start,
      p1,
      p2,
      p3: end,
      startRadius: startRad,
      endRadius: endRad,
      tropismResponse: params.hydrotropismStrength,
      absorptionRate: 1 - (i / rootCount) * 0.3,
      flutePhase: angle,
      children: [],
    };
    
    // Create skeleton node for wind
    rootNode.skeletonNode = createSkeletonNode(
      -1,
      start,
      end,
      1,
      startRad,
      'root',
      0.3
    );
    skeletonNodes.push(rootNode.skeletonNode);
    
    nodes.push(rootNode);
    
    // Generate secondary roots
    if (params.branchingDensity > 0.3 && rng() < params.branchingDensity) {
      generateSecondaryRoots(rootNode, params, soil, rng, nodes, skeletonNodes, nodeIdCounter);
    }
  }
  
  return { nodes, skeletonNodes, flutePhases };
}

function generateSecondaryRoots(
  parent: RootNode,
  params: RootParams,
  soil: SoilParams,
  rng: () => number,
  nodes: RootNode[],
  skeletonNodes: WindSkeletonNode[],
  nodeIdCounter: number
): void {
  const secondaryCount = Math.floor(2 + rng() * 3 * params.branchingDensity);
  
  for (let i = 0; i < secondaryCount; i++) {
    // Attach point along parent
    const t = 0.3 + rng() * 0.5;
    const attachPoint = bezierPoint(parent.p0, parent.p1, parent.p2, parent.p3, t);
    const parentTangent = bezierTangent(parent.p0, parent.p1, parent.p2, parent.p3, t);
    
    // Branch direction (perpendicular to parent with downward bias)
    const { right, forward } = tangentFrame(parentTangent);
    const branchAngle = rng() * Math.PI * 2;
    const branchDir = right.clone()
      .multiplyScalar(Math.cos(branchAngle))
      .add(forward.clone().multiplyScalar(Math.sin(branchAngle)))
      .add(new THREE.Vector3(0, -0.5, 0))
      .normalize();
    
    // Secondary root length
    const length = (parent.p0.distanceTo(parent.p3) * 0.4) * (0.5 + rng() * 0.5);
    const end = attachPoint.clone().add(branchDir.clone().multiplyScalar(length));
    
    // Simple linear control points for secondary roots
    const p1 = attachPoint.clone().lerp(end, 0.33);
    const p2 = attachPoint.clone().lerp(end, 0.66);
    
    // Radius
    const startRad = parent.startRadius * (1 - t) * params.taperRate * 0.5;
    const endRad = startRad * 0.2;
    
    const secondaryRoot: RootNode = {
      id: nodeIdCounter++,
      parentId: parent.id,
      order: 2,
      p0: attachPoint,
      p1,
      p2,
      p3: end,
      startRadius: startRad,
      endRadius: endRad,
      tropismResponse: params.hydrotropismStrength * 0.5,
      absorptionRate: parent.absorptionRate * 0.7,
      flutePhase: parent.flutePhase,
      children: [],
    };
    
    // Skeleton node
    secondaryRoot.skeletonNode = createSkeletonNode(
      parent.skeletonNode?.id ?? -1,
      attachPoint,
      end,
      2,
      startRad,
      'root',
      0.4
    );
    skeletonNodes.push(secondaryRoot.skeletonNode);
    
    parent.children.push(secondaryRoot);
    nodes.push(secondaryRoot);
  }
}

// ─── ROOT GEOMETRY BUILDER ───────────────────────────────────────────────────

export function buildRootGeometry(
  nodes: RootNode[],
  params: RootParams,
  baseColor: THREE.Color,
  arrays: GeometryArrays,
  windData: number[],
  rng: () => number
): void {
  const segmentCount = 6;
  const ringCount = 8;
  
  for (const root of nodes) {
    if (params.visibility <= 0) continue;
    
    // Visibility fade
    const visFade = clamp(0, 1, params.visibility);
    if (visFade < 0.01) continue;
    
    const startIdx = arrays.positions.length / 3;
    
    // Build tube geometry
    for (let r = 0; r <= ringCount; r++) {
      const t = r / ringCount;
      const pos = bezierPoint(root.p0, root.p1, root.p2, root.p3, t);
      const tan = bezierTangent(root.p0, root.p1, root.p2, root.p3, t);
      const { right, forward } = tangentFrame(tan);
      
      // Interpolate radius
      let radius = lerp(root.startRadius, root.endRadius, t);
      
      // Underground visibility based on soil surface
      const undergroundT = smoothstep(0, -0.3, pos.y);
      const visMultiplier = lerp(visFade, visFade * 0.3, undergroundT);
      if (visMultiplier < 0.1) continue;
      
      for (let s = 0; s <= segmentCount; s++) {
        const angle = (s / segmentCount) * Math.PI * 2;
        
        // Add bark-like roughness
        const barkNoise = fbm2(
          angle * 2 + root.id * 0.1,
          t * 4 + root.flutePhase,
          2
        );
        const localRadius = radius * (1 + (barkNoise - 0.5) * 0.08);
        
        // Ring direction
        const ringDir = right.clone()
          .multiplyScalar(Math.cos(angle))
          .add(forward.clone().multiplyScalar(Math.sin(angle)));
        
        const vtx = pos.clone().add(ringDir.clone().multiplyScalar(localRadius));
        const normal = ringDir.normalize();
        
        // Darker color for roots
        const colorVar = 0.75 + rng() * 0.2;
        const rootColor = new THREE.Color(
          baseColor.r * colorVar * 0.85,
          baseColor.g * colorVar * 0.75,
          baseColor.b * colorVar * 0.7
        );
        
        arrays.positions.push(vtx.x, vtx.y, vtx.z);
        arrays.normals.push(normal.x, normal.y, normal.z);
        arrays.colors.push(rootColor.r, rootColor.g, rootColor.b);
        
        // Wind data: [hierarchy, tipWeight, hash, rigidity]
        // Roots have high rigidity and low wind response
        windData.push(
          0.05 + t * 0.1,  // hierarchy (low - roots don't move much)
          t * 0.3,          // tipWeight
          root.flutePhase / (Math.PI * 2), // branchHash
          0.9 - t * 0.1     // rigidity (high)
        );
      }
    }
    
    // Build indices
    for (let r = 0; r < ringCount; r++) {
      for (let s = 0; s < segmentCount; s++) {
        const a = startIdx + r * (segmentCount + 1) + s;
        const b = a + segmentCount + 1;
        arrays.indices.push(a, b, a + 1);
        arrays.indices.push(a + 1, b, b + 1);
      }
    }
  }
}

// ─── FLUTING CALCULATION ─────────────────────────────────────────────────────

/**
 * Calculate cross-section radius modification for fluting
 * Returns a multiplier (0.0 to 1.0) where lower values = deeper flutes
 */
export function calculateFlutingMultiplier(
  angle: number,
  heightT: number,
  flutePhases: number[],
  params: RootParams
): number {
  if (!params.flutingEnabled || params.flutingStrength <= 0) {
    return 1.0;
  }
  
  // Fluting fades out with height
  const heightFade = smoothstep(params.flutingTransitionHeight, 0, heightT);
  if (heightFade < 0.01) return 1.0;
  
  // Calculate flute pattern based on root positions
  let fluteValue = 0;
  const fluteCount = params.flutingCount;
  
  if (flutePhases.length > 0) {
    // Use actual root positions for organic fluting
    for (const phase of flutePhases) {
      const angleDiff = Math.abs(angle - phase);
      const wrapped = Math.min(angleDiff, Math.PI * 2 - angleDiff);
      const influence = Math.exp(-wrapped * wrapped * 8);
      fluteValue += influence;
    }
    fluteValue = clamp(0, 1, fluteValue / flutePhases.length * 2);
  } else {
    // Fallback to regular fluting
    const fluteRaw = 0.5 + 0.5 * Math.cos(fluteCount * angle);
    fluteValue = Math.pow(fluteRaw, params.flutingSharpness);
  }
  
  // Add asymmetry
  const asymmetry = 1 + params.fluteAsymmetry * (fbm2(angle * 3, heightT * 5, 2) - 0.5);
  
  // Final multiplier: 1.0 = no indentation, lower = deeper flute (between lobes)
  // Roots create lobes, so we want HIGH value at root positions, LOW between
  const fluteDepth = params.flutingStrength * heightFade * asymmetry;
  return 1.0 - fluteDepth * (1 - fluteValue);
}
