/**
 * HYPER-REALISTIC VEGETATION ENGINE
 * Trunk Generator with Organic Cross-Section and Fluting
 * 
 * Features:
 * - Continuous Bezier centerline with gesture knots
 * - Cross-section shaping (ovality, fluting from roots)
 * - Multi-layer procedural bark
 * - Buttress integration
 * - Age-aware detail
 */

import * as THREE from 'three';
import type { 
  TrunkParams, RootParams, BarkParams, GrowthParams 
} from '@/types/hyperParams';
import { interpolateGrowthStage, GrowthStage } from '@/types/hyperParams';
import { 
  clamp, clamp01, lerp, smoothstep, seededRandom, 
  fbm2, ridgedNoise2, tangentFrame,
  GeometryArrays
} from '../core/utils';
import { createSkeletonNode, WindSkeletonNode } from '../core/WindSolver';
import { calculateFlutingMultiplier } from './RootGenerator';

// ─── GESTURE KNOT ────────────────────────────────────────────────────────────

interface GestureKnot {
  position: number;  // 0-1 along trunk
  directionX: number;
  directionZ: number;
  amplitude: number;
  width: number;
}

// ─── TRUNK GENERATION ────────────────────────────────────────────────────────

export interface TrunkResult {
  skeletonNode: WindSkeletonNode;
  topPosition: THREE.Vector3;
  topRadius: number;
  topTangent: THREE.Vector3;
  height: number;
}

export function generateTrunk(
  params: TrunkParams,
  roots: RootParams,
  bark: BarkParams,
  growth: GrowthParams,
  flutePhases: number[],
  seed: number,
  arrays: GeometryArrays,
  windData: number[]
): TrunkResult {
  const rng = seededRandom(seed);
  
  // Get growth stage interpolation
  const stage = interpolateGrowthStage(growth.age);
  
  // Age-adjusted dimensions
  const height = params.heightBase * stage.heightMultiplier;
  const baseRadius = params.baseRadius * stage.radiusMultiplier;
  const trunkTopY = height * 0.65;
  
  // Pre-generate gesture knots
  const knotCount = Math.round(params.knotCount);
  const gestureKnots: GestureKnot[] = [];
  
  for (let i = 0; i < knotCount; i++) {
    const ti = 0.18 + rng() * 0.62;  // Keep away from base/top
    const ang = rng() * Math.PI * 2;
    gestureKnots.push({
      position: ti,
      directionX: Math.cos(ang),
      directionZ: Math.sin(ang),
      amplitude: params.knotStrength * (0.5 + 0.7 * rng()),
      width: 0.12 * (0.7 + 0.8 * rng()),
    });
  }
  
  // Bark parameters
  const barkOctaves = Math.max(1, Math.min(6, Math.round(4 * stage.barkTextureScale)));
  const barkDepth = bark.crackDepth * stage.barkFissureDepth;
  
  // Trunk color
  const trunkColor = new THREE.Color(params.barkColor);
  
  // Twist and oval phase (stable per seed)
  const ovalPhase = rng() * Math.PI * 2;
  const fluteBasePhase = rng() * Math.PI * 2;
  
  // Geometry parameters (scaled by LOD/age)
  const segments = Math.max(8, Math.round(18 * stage.radiusMultiplier));
  const rings = Math.max(12, Math.round(24 * stage.heightMultiplier));
  
  // Calculate trunk lean from wind
  const trunkLeanMag = 0.15 * (1 - stage.heightMultiplier * 0.3);
  const trunkLeanTopX = trunkLeanMag;
  const trunkLeanTopZ = -trunkLeanMag * 0.6;
  
  // Create skeleton node
  const trunkStart = new THREE.Vector3(0, 0, 0);
  const trunkEnd = new THREE.Vector3(trunkLeanTopX, trunkTopY, trunkLeanTopZ);
  const trunkNode = createSkeletonNode(-1, trunkStart, trunkEnd, 0, baseRadius, 'trunk', 0);
  
  const startIdx = arrays.positions.length / 3;
  const trunkHash = rng();
  
  // ─── Generate Trunk Rings ──────────────────────────────────────────────────
  
  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    const y = t * trunkTopY;
    
    // ─── Centerline offset (gesture knots + lean) ────────────────────────────
    let cx = trunkLeanTopX * t * t;
    let cz = trunkLeanTopZ * t * t;
    
    // Apply gesture knots
    if (gestureKnots.length > 0 && params.knotStrength > 0) {
      const scale = Math.min(1.8, Math.max(0.6, height * 0.08));
      for (const knot of gestureKnots) {
        const d = (t - knot.position) / Math.max(0.0001, knot.width);
        const gaussian = Math.exp(-0.5 * d * d);
        const amp = knot.amplitude * scale * (0.55 + 0.45 * (1 - t));
        cx += knot.directionX * amp * gaussian;
        cz += knot.directionZ * amp * gaussian;
      }
    }
    
    // ─── Radius with taper and flare ─────────────────────────────────────────
    const flareT = t < params.flareZone 
      ? params.baseFlare * (1 - t / params.flareZone) + 1 
      : 1;
    const taperBase = Math.pow(Math.max(0.001, 1 - t * 0.95), params.taperExponent);
    let radius = baseRadius * taperBase * flareT;
    
    // Twist
    const twist = t * params.twist * Math.PI / 180;
    
    // ─── Generate Ring Vertices ──────────────────────────────────────────────
    
    for (let s = 0; s <= segments; s++) {
      const angle = (s / segments) * Math.PI * 2 + twist;
      let localRadius = radius;
      
      // ─── Cross-section shaping ─────────────────────────────────────────────
      
      // Ovality
      const ovalMul = 1 + params.ovality * Math.cos(2 * (angle - ovalPhase));
      localRadius *= ovalMul;
      
      // Fluting from roots (fades with height)
      const fluteMul = calculateFlutingMultiplier(angle, t, flutePhases, roots);
      localRadius *= fluteMul;
      
      // Buttress (if enabled, near base only)
      if (roots.buttressEnabled && t < 0.15 && roots.buttressStrength > 0) {
        const buttressT = 1 - t / 0.15;
        let lobeMax = 0;
        for (const phase of flutePhases) {
          const angleDiff = Math.abs(angle - phase);
          const wrapped = Math.min(angleDiff, Math.PI * 2 - angleDiff);
          const influence = Math.exp(-wrapped * wrapped * 4);
          lobeMax = Math.max(lobeMax, influence);
        }
        const buttressMul = 1 + roots.buttressStrength * lobeMax * buttressT * buttressT;
        localRadius *= buttressMul;
      }
      
      // ─── Bark displacement ─────────────────────────────────────────────────
      
      let barkDisp = 0;
      
      if (bark.crackScale > 0 && barkDepth > 0) {
        const bx = (angle / (Math.PI * 2)) * bark.crackScale + seed * 0.003;
        const by = y * bark.crackScale * 0.08;
        
        // Base bark noise
        const barkNoise = fbm2(bx, by, barkOctaves);
        barkDisp = (barkNoise - 0.5) * barkDepth * (1 - t * 0.3);
        
        // Deep fissures for aged trees
        if (stage.barkFissureDepth > 0.5) {
          const fissureNoise = ridgedNoise2(bx * 0.8, by * 2.5, 3);
          const fissureDepth = smoothstep(0.35, 0.5, fissureNoise) * barkDepth * 0.7;
          barkDisp -= fissureDepth;
        }
        
        // Curvature-aware detail (more detail on convex areas)
        const curvatureProxy = 0.5 + 0.5 * Math.abs(Math.cos(2 * (angle - ovalPhase)));
        barkDisp *= 1 + curvatureProxy * 0.3;
      }
      
      const finalRadius = localRadius + barkDisp;
      
      // ─── Vertex position ───────────────────────────────────────────────────
      
      const x = Math.cos(angle) * finalRadius + cx;
      const z = Math.sin(angle) * finalRadius + cz;
      
      arrays.positions.push(x, y, z);
      
      // Normal (approximate - radial)
      const nx = Math.cos(angle);
      const nz = Math.sin(angle);
      arrays.normals.push(nx, 0, nz);
      
      // Color with variation
      const colorVar = 0.85 + rng() * 0.25;
      const mossFactor = bark.mossEnabled 
        ? smoothstep(0.3, 0.7, fbm2(x * 2, y * 0.5, 2)) * bark.mossAmount * (1 - t)
        : 0;
      
      const mossColor = new THREE.Color(bark.mossColor);
      const finalColor = new THREE.Color(
        lerp(trunkColor.r * colorVar, mossColor.r, mossFactor),
        lerp(trunkColor.g * colorVar, mossColor.g, mossFactor),
        lerp(trunkColor.b * colorVar, mossColor.b, mossFactor)
      );
      
      arrays.colors.push(finalColor.r, finalColor.g, finalColor.b);
      
      // Wind data: [hierarchy, tipWeight, hash, rigidity]
      windData.push(
        0.04 + t * 0.2,           // hierarchy (low - trunk)
        t * 0.65,                  // tipWeight
        trunkHash,                 // branchHash
        Math.max(0.45, 0.98 - t * 0.4)  // rigidity (high for trunk)
      );
    }
  }
  
  // ─── Build Indices ─────────────────────────────────────────────────────────
  
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const a = startIdx + r * (segments + 1) + s;
      const b = a + segments + 1;
      arrays.indices.push(a, b, a + 1);
      arrays.indices.push(a + 1, b, b + 1);
    }
  }
  
  // ─── Calculate top position and tangent ────────────────────────────────────
  
  // Apply final gesture offset to top
  let topCx = trunkLeanTopX;
  let topCz = trunkLeanTopZ;
  for (const knot of gestureKnots) {
    const d = (1 - knot.position) / Math.max(0.0001, knot.width);
    const gaussian = Math.exp(-0.5 * d * d);
    const scale = Math.min(1.8, Math.max(0.6, height * 0.08));
    const amp = knot.amplitude * scale * 0.1;
    topCx += knot.directionX * amp * gaussian;
    topCz += knot.directionZ * amp * gaussian;
  }
  
  const topPosition = new THREE.Vector3(topCx, trunkTopY, topCz);
  const topRadius = baseRadius * Math.pow(0.05, params.taperExponent);
  const topTangent = new THREE.Vector3(0, 1, 0); // Approximate upward
  
  return {
    skeletonNode: trunkNode,
    topPosition,
    topRadius: Math.max(0.02, topRadius),
    topTangent,
    height: trunkTopY,
  };
}
