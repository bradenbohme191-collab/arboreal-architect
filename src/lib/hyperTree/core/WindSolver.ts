/**
 * HYPER-REALISTIC VEGETATION ENGINE
 * Hierarchical Wind Physics Solver
 * 
 * Implements drag cascade from leaves → twigs → branches → trunk
 * with proper force propagation and spring-mass-damper physics.
 */

import * as THREE from 'three';
import type { WindParams } from '@/types/hyperParams';
import { clamp, lerp, fbm2, seededRandom } from './utils';
import { getWindSpeed } from '@/types/hyperParams';

// ─── SKELETON NODE ───────────────────────────────────────────────────────────

export interface WindSkeletonNode {
  id: number;
  parentId: number;
  order: number;
  kind: 'trunk' | 'branch' | 'twig' | 'leaf' | 'root';
  
  // Geometry
  start: THREE.Vector3;
  end: THREE.Vector3;
  length: number;
  radius: number;
  
  // Physical properties
  mass: number;
  surfaceArea: number;
  
  // Spring-damper
  stiffness: number;
  damping: number;
  
  // Hierarchy
  parentInfluence: number;
  childDragSum: number;
  children: WindSkeletonNode[];
  
  // Leaf attachment
  leafCount: number;
  leafArea: number;
  
  // State
  displacement: THREE.Vector3;
  velocity: THREE.Vector3;
  acceleration: THREE.Vector3;
  
  // Hash for variation
  hash: number;
}

// ─── WIND STATE ──────────────────────────────────────────────────────────────

export interface WindState {
  time: number;
  
  // Base wind
  direction: THREE.Vector3;
  baseSpeed: number;
  
  // Gust envelope
  gustStrength: number;
  gustEnvelope: number;
  gustTarget: number;
  gustVelocity: number;
  gustTimer: number;
  
  // Direction variance
  directionAngle: number;
  directionTarget: number;
  directionTimer: number;
  
  // Turbulence
  turbulencePhase: number;
}

// ─── CREATE WIND STATE ───────────────────────────────────────────────────────

export function createWindState(): WindState {
  return {
    time: 0,
    direction: new THREE.Vector3(1, 0, 0),
    baseSpeed: 0,
    gustStrength: 0,
    gustEnvelope: 0,
    gustTarget: 0,
    gustVelocity: 0,
    gustTimer: 0,
    directionAngle: 0,
    directionTarget: 0,
    directionTimer: 0,
    turbulencePhase: 0,
  };
}

// ─── CREATE SKELETON NODE ────────────────────────────────────────────────────

let nodeIdCounter = 0;

export function createSkeletonNode(
  parentId: number,
  start: THREE.Vector3,
  end: THREE.Vector3,
  order: number,
  radius: number,
  kind: WindSkeletonNode['kind'],
  parentInfluence: number = 0.75
): WindSkeletonNode {
  const dir = end.clone().sub(start);
  const length = Math.max(0.001, dir.length());
  const surfaceArea = Math.PI * radius * 2 * length;
  
  // Mass based on kind and size
  const massFactors = {
    trunk: 2.0 + radius * 8,
    branch: 0.5 + radius * 4,
    twig: 0.2 + radius * 2,
    leaf: 0.05,
    root: 1.5 + radius * 6,
  };
  const mass = massFactors[kind] * length;
  
  // Stiffness decreases with order
  const stiffness = clamp(0.3, 0.95, 0.88 - order * 0.1 + (kind === 'root' ? 0.15 : 0));
  
  // Damping increases slightly with order
  const damping = clamp(0.2, 0.9, 0.4 + order * 0.06 + (kind === 'leaf' ? 0.15 : 0));
  
  // Hash for phase variation
  const hash = Math.abs(Math.sin(
    start.x * 127.1 + start.y * 311.7 + start.z * 74.7 + nodeIdCounter * 0.7
  ) * 43758.5453) % 1;
  
  const node: WindSkeletonNode = {
    id: nodeIdCounter++,
    parentId,
    order,
    kind,
    start: start.clone(),
    end: end.clone(),
    length,
    radius,
    mass,
    surfaceArea,
    stiffness,
    damping,
    parentInfluence,
    childDragSum: 0,
    children: [],
    leafCount: 0,
    leafArea: 0,
    displacement: new THREE.Vector3(),
    velocity: new THREE.Vector3(),
    acceleration: new THREE.Vector3(),
    hash,
  };
  
  return node;
}

export function resetNodeIdCounter(): void {
  nodeIdCounter = 0;
}

// ─── WIND SOLVER ─────────────────────────────────────────────────────────────

const AIR_DENSITY = 1.225; // kg/m³
const DRAG_COEFFICIENT = 1.2; // Typical for cylinders

// Max bend factors by order (realistic biomechanical limits)
const MAX_BEND_FACTORS: Record<string, number> = {
  trunk: 0.02,   // Trunk bends very little
  root: 0.01,    // Roots are anchored
  branch: 0.15,  // Branches can bend moderately
  twig: 0.35,    // Twigs are flexible
  leaf: 0.6,     // Leaves flutter significantly
};

/**
 * Update wind state with gust envelopes and direction variance
 */
export function updateWindState(
  state: WindState,
  params: WindParams,
  dt: number
): void {
  // Advance time
  state.time += dt * (0.5 + params.gustFrequency * 1.5);
  state.baseSpeed = getWindSpeed(params.beaufortScale);
  
  // Update direction
  state.direction.set(
    Math.cos(params.direction + state.directionAngle),
    0,
    Math.sin(params.direction + state.directionAngle)
  ).normalize();
  
  // Gust envelope system
  state.gustTimer -= dt;
  if (state.gustTimer <= 0) {
    state.gustTimer = 0.15 + Math.random() * (1.2 / (0.3 + params.gustVariance * 1.3));
    state.gustTarget = (Math.random() * 2 - 1) * (0.3 + params.gustVariance * 1.2);
  }
  
  // Gust dynamics
  const gustKick = Math.sin(state.time * 0.35) * 0.5 + Math.sin(state.time * 0.17) * 0.3;
  state.gustEnvelope = lerp(
    state.gustEnvelope,
    Math.abs(state.gustTarget) * 0.5 + Math.abs(gustKick) * 0.2,
    1 - Math.exp(-dt * 3)
  );
  
  state.gustVelocity += (gustKick * 0.15 + state.gustTarget * 0.4) * dt;
  state.gustVelocity *= Math.max(0, 1 - dt * 2);
  state.gustStrength = clamp(-1, 1, state.gustStrength + state.gustVelocity * 0.6);
  state.gustTarget *= Math.max(0, 1 - dt * 2);
  
  // Direction variance
  state.directionTimer -= dt;
  if (state.directionTimer <= 0) {
    state.directionTimer = 0.2 + Math.random() * (1 + params.gustVariance * 2);
    state.directionTarget += (Math.random() - 0.5) * (0.2 + params.gustVariance * 1.5);
  }
  state.directionAngle = lerp(state.directionAngle, state.directionTarget, 1 - Math.exp(-dt * 2));
  
  // Turbulence
  state.turbulencePhase += dt * params.turbulenceIntensity;
}

/**
 * Calculate drag force on a node
 */
function calculateDrag(
  node: WindSkeletonNode,
  windSpeed: number,
  windDir: THREE.Vector3,
  gustN: number,
  params: WindParams
): THREE.Vector3 {
  // Effective wind speed with gust
  const effectiveSpeed = windSpeed * (0.3 + 0.7 * gustN);
  
  // Drag force: 0.5 * rho * v² * Cd * A
  let dragMagnitude = 0.5 * AIR_DENSITY * effectiveSpeed * effectiveSpeed * DRAG_COEFFICIENT * node.surfaceArea;
  
  // Scale by kind
  const kindFactors = {
    trunk: params.trunkBendFactor,
    root: params.trunkBendFactor * 0.5,
    branch: params.branchBendFactor,
    twig: params.twigBendFactor,
    leaf: params.leafFlutterFactor,
  };
  dragMagnitude *= kindFactors[node.kind] || 1;
  
  // Add leaf drag contribution
  if (node.leafCount > 0) {
    const leafDrag = node.leafArea * params.leafDragScale * effectiveSpeed * effectiveSpeed * 0.1;
    dragMagnitude += leafDrag;
  }
  
  return windDir.clone().multiplyScalar(dragMagnitude);
}

/**
 * Main wind physics solver
 * 
 * Phase 1: Bottom-up drag accumulation (leaves → trunk)
 * Phase 2: Top-down displacement (trunk → leaves)
 */
export function solveWindPhysics(
  nodes: WindSkeletonNode[],
  state: WindState,
  params: WindParams,
  dt: number
): void {
  if (!params.enabled || nodes.length === 0) return;
  
  const windSpeed = state.baseSpeed * (1 + state.gustEnvelope * params.gustIntensity);
  const gustN = 0.5 + 0.5 * state.gustStrength;
  const envN = state.gustEnvelope;
  
  // Quality multiplier
  const qualityMul = params.quality === 'LOW' ? 0.3 : params.quality === 'MEDIUM' ? 0.6 : 1.0;
  
  // ─── PHASE 1: Bottom-up drag accumulation ────────────────────────────────
  // Process from leaves to trunk (reverse order, assuming nodes are sorted root-first)
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    
    // Calculate drag force on this node
    const dragForce = calculateDrag(node, windSpeed, state.direction, gustN, params);
    const dragMagnitude = dragForce.length();
    
    // Add child drag contributions
    let childDrag = 0;
    for (const child of node.children) {
      childDrag += child.childDragSum * child.parentInfluence * params.parentCoupling;
    }
    
    node.childDragSum = dragMagnitude + childDrag;
  }
  
  // ─── PHASE 2: Top-down displacement ──────────────────────────────────────
  // Process from trunk to leaves (nodes should be in parent-first order)
  for (const node of nodes) {
    const parent = node.parentId >= 0 ? nodes.find(n => n.id === node.parentId) : null;
    const parentDisp = parent ? parent.displacement : new THREE.Vector3();
    const parentVel = parent ? parent.velocity : new THREE.Vector3();
    
    // Phase offset for natural variation
    const phaseOffset = state.time * (0.5 + node.order * 0.8) + node.hash * Math.PI * 2;
    const motionCycle = Math.sin(phaseOffset);
    const flutter = Math.sin(phaseOffset * 1.7 + 1.2);
    const eddy = Math.sin(phaseOffset * (2 + windSpeed * 0.1));
    
    // Bend factor based on kind
    const bendMul = MAX_BEND_FACTORS[node.kind] || 0.1;
    const leafDragScale = 1 + (node.leafCount || 0) * 0.015;
    
    // Wind force amplitude
    const forceAmp = windSpeed * bendMul * (0.2 + 0.8 * gustN * (0.7 + envN * 0.5)) * leafDragScale * qualityMul;
    
    // Force direction with turbulence
    const fx = state.direction.x * forceAmp * (0.6 * motionCycle + 0.4 * flutter);
    const fy = forceAmp * 0.06 * flutter;
    const fz = state.direction.z * forceAmp * (0.6 * motionCycle + 0.4 * flutter) + forceAmp * 0.2 * eddy;
    
    // Spring-mass-damper physics
    const k = params.globalStiffness * (0.5 + node.stiffness * 2);
    const c = params.globalDamping * (0.5 + node.damping * 2);
    const invMass = 1 / Math.max(0.2, node.mass * 0.3);
    
    // Target position (includes parent influence)
    const targetX = parentDisp.x * node.parentInfluence + fx;
    const targetY = parentDisp.y * node.parentInfluence + fy;
    const targetZ = parentDisp.z * node.parentInfluence + fz;
    
    // Spring force toward target
    const springX = (targetX - node.displacement.x) * k;
    const springY = (targetY - node.displacement.y) * k;
    const springZ = (targetZ - node.displacement.z) * k;
    
    // Damping force
    const dampX = (node.velocity.x - parentVel.x * node.parentInfluence) * c;
    const dampY = (node.velocity.y - parentVel.y * node.parentInfluence) * c;
    const dampZ = (node.velocity.z - parentVel.z * node.parentInfluence) * c;
    
    // Update velocity
    node.velocity.x += (springX - dampX) * dt * invMass;
    node.velocity.y += (springY - dampY) * dt * invMass;
    node.velocity.z += (springZ - dampZ) * dt * invMass;
    
    // Apply drag
    const drag = Math.max(0, 1 - dt * 1.5);
    node.velocity.multiplyScalar(drag);
    
    // Update displacement
    node.displacement.x += node.velocity.x * dt;
    node.displacement.y += node.velocity.y * dt;
    node.displacement.z += node.velocity.z * dt;
    
    // Clamp to prevent instability
    const maxDisp = node.length * (0.05 + windSpeed * 0.5) * bendMul;
    const currentMag = node.displacement.length();
    if (currentMag > maxDisp && currentMag > 1e-5) {
      const scale = maxDisp / currentMag;
      node.displacement.multiplyScalar(scale);
      node.velocity.multiplyScalar(scale);
    }
  }
}

/**
 * Apply wind displacements to vertex positions
 */
export function applyWindToVertices(
  positions: Float32Array,
  originalPositions: Float32Array,
  windData: Float32Array,
  nodes: WindSkeletonNode[],
  state: WindState,
  params: WindParams
): void {
  if (!params.enabled) return;
  
  const vertexCount = positions.length / 3;
  const windSpeed = state.baseSpeed;
  
  for (let i = 0; i < vertexCount; i++) {
    const i3 = i * 3;
    const i4 = i * 4;
    
    // Wind data: [hierarchy, tipWeight, branchHash, rigidity]
    const hierarchy = windData[i4];
    const tipWeight = windData[i4 + 1];
    const nodeId = Math.floor(windData[i4 + 2] * nodes.length);
    const rigidity = windData[i4 + 3];
    
    // Get node displacement
    const node = nodes[nodeId];
    if (!node) {
      positions[i3] = originalPositions[i3];
      positions[i3 + 1] = originalPositions[i3 + 1];
      positions[i3 + 2] = originalPositions[i3 + 2];
      continue;
    }
    
    // Get parent for interpolation
    const parent = node.parentId >= 0 ? nodes.find(n => n.id === node.parentId) : null;
    
    let dx = node.displacement.x;
    let dy = node.displacement.y;
    let dz = node.displacement.z;
    
    // Interpolate between parent and node based on tipWeight
    if (parent) {
      dx = lerp(parent.displacement.x, dx, tipWeight);
      dy = lerp(parent.displacement.y, dy, tipWeight);
      dz = lerp(parent.displacement.z, dz, tipWeight);
    }
    
    // Leaf flutter (high frequency)
    if (hierarchy > 0.8) {
      const leafPhase = state.time * (3.5 + node.order * 2) + node.hash * 6.28;
      const flutterScale = windSpeed * (1 - rigidity) * 0.06;
      dx += Math.sin(leafPhase) * flutterScale;
      dy += Math.sin(leafPhase * 1.3 + 1) * flutterScale * 0.5;
      dz += Math.cos(leafPhase * 0.9) * flutterScale;
    }
    
    // Apply flexibility (1 - rigidity)
    const flexibility = 1 - rigidity;
    const scale = hierarchy * flexibility;
    
    positions[i3] = originalPositions[i3] + dx * scale;
    positions[i3 + 1] = originalPositions[i3 + 1] + dy * scale;
    positions[i3 + 2] = originalPositions[i3 + 2] + dz * scale;
  }
}
