/**
 * TREE 3D PREVIEW
 * 
 * Full 3D tree preview with Three.js rendering.
 * Smooth Bezier branch merging, volumetric roots, realistic bark.
 */

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { loadQuickGrassShaders, createQuickGrassGround } from '@/lib/quickGrassGround';
import type { GroundLayerType } from '@/contexts/ProVegLayoutContext';
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';

function resolveAssetUrl(path: string): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/?$/, '/');
  const rel = path.replace(/^\/+/, '');
  return `${base}${rel}`;
}

// Seeded random
function seededRandom(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}


// Small deterministic 2D value noise (for coherent bark/shape variation)
const fract = (x) => x - Math.floor(x);
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (t) => t * t * (3 - 2 * t);
const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smoothstepRange = (edge0, edge1, x) => {
  const t = clamp01((x - edge0) / Math.max(1e-5, edge1 - edge0));
  return smooth(t);
};

function hash21(x, y) {
  // deterministic, cheap hash -> [0,1)
  return fract(Math.sin(x * 127.1 + y * 311.7) * 43758.5453123);
}

function noise2(x, y) {
  const ix = Math.floor(x), iy = Math.floor(y);
  const fx = x - ix, fy = y - iy;
  const u = smooth(fx), v = smooth(fy);

  const a = hash21(ix, iy);
  const b = hash21(ix + 1, iy);
  const c = hash21(ix, iy + 1);
  const d = hash21(ix + 1, iy + 1);

  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}

function fbm2(x, y, octaves = 4) {
  let sum = 0.0;
  let amp = 0.5;
  let freq = 1.0;
  for (let i = 0; i < octaves; i++) {
    sum += amp * noise2(x * freq, y * freq);
    freq *= 2.0;
    amp *= 0.5;
  }
  return sum;
}

// Generate tree geometry with smooth Bezier branches
function generateTreeGeometry(params, seed = 1337, ctx = {}) {
  const getP = (k, alt, def) => (params?.[k] ?? (alt ? params?.[alt] : undefined) ?? def);

  // Core drivers
  const branchModel = getP('vegetation.branching.model', 'branchModel', 'L_SYSTEM');
  const phyllotaxisMode = getP('vegetation.branching.phyllotaxis', 'phyllotaxis', 'ALTERNATE');
  const leafRepRaw = getP('vegetation.leaves.representation', 'leafRepresentation', 'CLUSTERS');
  const leafShapeRaw = getP('vegetation.leaves.shape', 'leafShape', 'BROADLEAF');
  const speciesProfile = String(getP('vegetation.species.profile', 'speciesProfile', 'BROADLEAF_DECIDUOUS')).toUpperCase();
  const isConiferProfile = (speciesProfile === 'PINE_CONIFER' || speciesProfile === 'SPRUCE_CONICAL');
  const leafRep = isConiferProfile ? 'CARDS' : leafRepRaw;
  const leafShape = isConiferProfile
    ? 'NEEDLE'
    : ((speciesProfile === 'WILLOW_WEEPING' || speciesProfile === 'ACACIA_SAVANNA') && leafShapeRaw === 'NEEDLE')
      ? 'COMPOUND'
      : leafShapeRaw;

  // Age: 0.2..2.0, where 1.0 ~ mature baseline
  const age01 = Math.max(0.2, Math.min(2.0, getP('vegetation.instance.age01', 'age01', 1.0)));
  const ageGrowth = (t) => {
    // smooth-ish: quick early growth, slow near 1.0, mild decline >1.6
    const a = Math.max(0, Math.min(2, t));
    const early = 1 - Math.exp(-2.4 * a);
    const oldPenalty = a > 1.6 ? (1 - (a - 1.6) * 0.35) : 1;
    return Math.max(0.35, early * oldPenalty);
  };

  // Environment cues (preview-level)
  const timeOfDay = getP('vegetation.env.timeOfDay', 'timeOfDay', 0.45);
  const windStrength = getP('vegetation.wind.gustStrength', 'windStrength', 0.6);
  const restLean = Math.max(0.0, Math.min(1.0, getP('vegetation.wind.restLean', 'restLean', 0.22)));

  // Sun direction (simple): azimuth is fixed, elevation changes with timeOfDay
  const sunElev = Math.sin(timeOfDay * Math.PI * 2) * 0.55 + 0.35;
  const sunDir = new THREE.Vector3(0.6, sunElev, 0.2).normalize();
  // Keep a structural lean, but avoid hard-locking gust strength into static geometry.
  const trunkLeanMag = (restLean * 0.20 + windStrength * 0.06 + (1.0 - Math.abs(timeOfDay - 0.5) * 2) * 0.08) * (0.6 + 0.4 * (age01 < 1 ? (1 - age01) : 0));
  const trunkLeanTopX = trunkLeanMag;
  const trunkLeanTopZ = -trunkLeanMag * 0.6;


  const rng = seededRandom(seed);
  const trunkHash = rng();

  // LOD context (scales geometry budgets + clamps microdetail octaves)
  const lod = (ctx && ctx.lod) ? ctx.lod : 'near';
  const lodIndex = (lod === 'near') ? 0 : (lod === 'mid') ? 1 : (lod === 'far') ? 2 : 3;
  const lodScale = (ctx && typeof ctx.lodScale === 'number') ? ctx.lodScale : (lodIndex === 0 ? 1.0 : lodIndex === 1 ? 0.7 : lodIndex === 2 ? 0.45 : 0.25);
  const lodGeoMul = 0.55 + 0.45 * lodScale;

  const capNear = Math.round(getP('vegetation.lod.octaveCap.lod1', 'octaveCapLod1', 5));
  const capMid  = Math.round(getP('vegetation.lod.octaveCap.lod2', 'octaveCapLod2', 3));
  const capFar  = Math.round(getP('vegetation.lod.octaveCap.lod3', 'octaveCapLod3', 2));
  const octaveCap = (lodIndex === 0) ? capNear : (lodIndex === 1) ? capMid : (lodIndex === 2) ? capFar : 1;
  const barkOctaves = Math.max(1, Math.min(8, octaveCap));
  const vertices = [];
  const normals = [];
  const colors = [];
  const indices = [];
  const windData = [];
  const windData2 = [];
  const branchBinding = [];
  const skeletonNodes = [];
  const pushWindMeta = (
    hierarchy,
    tipWeight,
    branchHash,
    rigidity,
    parentHash = branchHash,
    orderNorm = 0,
    parentInfluence = 0,
    leafiness = 0,
    count = 1
  ) => {
    const h = clamp01(hierarchy);
    const t = clamp01(tipWeight);
    const b = fract(branchHash);
    const r = clamp01(rigidity);
    const p = fract(parentHash);
    const o = clamp01(orderNorm);
    const pi = clamp01(parentInfluence);
    const lf = clamp01(leafiness);
    for (let i = 0; i < count; i++) {
      windData.push(h, t, b, r);
      windData2.push(p, o, pi, lf);
    }
  };
  const pushBranchBinding = (nodeId, parentId, along = 0, parentBlend = 0, count = 1) => {
    const nid = Math.max(0, nodeId | 0);
    const pid = Math.max(0, parentId | 0);
    const a = clamp01(along);
    const pb = clamp01(parentBlend);
    for (let i = 0; i < count; i++) {
      branchBinding.push(nid, pid, a, pb);
    }
  };
  const createSkeletonNode = (parentId, start, end, order = 0, radius = baseRadius, kind = 'branch', parentInfluence = 0) => {
    const id = skeletonNodes.length;
    const dir = end.clone().sub(start);
    const len = Math.max(0.001, dir.length());
    dir.normalize();
    const center = start.clone().lerp(end, 0.5);
    const size = Math.max(0.002, radius);
    const area = Math.max(0.012, size * len);
    const mass =
      kind === 'trunk'
        ? (1.65 + size * 6.2) * len
        : kind === 'root'
          ? (1.45 + size * 5.4) * len
          : kind === 'twig'
            ? (0.25 + size * 2.6) * len
            : kind === 'leaf'
              ? (0.1 + size * 0.9) * Math.max(0.12, len * 0.35)
              : (0.42 + size * 3.2) * len;
    const hash = fract(Math.sin((start.x + 0.13) * 19.73 + (start.y + 0.21) * 31.17 + (start.z - 0.37) * 41.53 + id * 0.73) * 43758.5453123);
    const node = {
      id,
      parentId: parentId >= 0 ? parentId : -1,
      order,
      radius,
      length: len,
      dir: [dir.x, dir.y, dir.z],
      start: [start.x, start.y, start.z],
      end: [end.x, end.y, end.z],
      center: [center.x, center.y, center.z],
      area,
      mass,
      hash,
      stiffness: clamp01(0.78 - order * 0.08 + (kind === 'root' ? 0.18 : 0.0)),
      damping: clamp01(0.36 + order * 0.05 + (kind === 'leaf' ? 0.12 : 0.0)),
      parentInfluence: clamp01(parentInfluence),
      kind,
    };
    skeletonNodes.push(node);
    return node;
  };
  
  // Colors (supports both legacy keys and registry ids)
  const trunkColor = new THREE.Color(getP('vegetation.trunk.barkColor', 'trunkColor', '#5d4037'));
  const leafColorBase = new THREE.Color(getP('vegetation.leaves.colorBase', 'leafColor', '#4a7c3f'));
  const leafColorVariation = Math.max(0.0, Math.min(0.4, getP('vegetation.leaves.colorVariation', 'leafColorVariation', 0.15)));
  
  // Trunk parameters
  const heightBase = getP('height', 'vegetation.species.heightBase_m', 8);
  const height = heightBase * ageGrowth(age01);
  const baseRadius = getP('baseRadius', 'vegetation.trunk.baseRadius_m', 0.4) * (0.85 + 0.25 * age01);
  const taperExponent = getP('taperExponent', 'vegetation.trunk.taperExponent', 0.7);
  const baseFlare = getP('baseFlare', 'vegetation.trunk.baseFlare', 1.3) * (0.9 + 0.2 * age01);

  // Trunk gesture knots (controls *where* bends happen, not just how much)
  const trunkKnotCount = Math.max(0, Math.min(8, Math.round(getP('vegetation.trunk.gestureKnotCount', 'trunkKnotCount', 2))));
  const trunkKnotStrength = Math.max(0.0, Math.min(1.0, getP('vegetation.trunk.gestureKnotStrength', 'trunkKnotStrength', 0.25)));
  const trunkKnotWidth = Math.max(0.02, Math.min(0.45, getP('vegetation.trunk.gestureKnotWidth', 'trunkKnotWidth', 0.12)));

  // Cross-section realism (subtle ovality + fluting)
  const trunkOvality = Math.max(0.0, Math.min(0.35, getP('vegetation.trunk.ovality', 'trunkOvality', 0.06)));
  const trunkFlutingStrength = Math.max(0.0, Math.min(0.35, getP('vegetation.trunk.flutingStrength', 'trunkFlutingStrength', 0.0)));
  const trunkFlutingCount = Math.max(2, Math.min(12, Math.round(getP('vegetation.trunk.flutingCount', 'trunkFlutingCount', 4))));
  const trunkFlutingSharpness = Math.max(0.5, Math.min(6.0, getP('vegetation.trunk.flutingSharpness', 'trunkFlutingSharpness', 2.0)));

  // Environment fields (preview-level but used for growth biases)
  const moisture = Math.max(0.0, Math.min(1.0, getP('vegetation.env.moisture', 'moisture', 0.55)));

  // Bark & base structure
  const barkStyle = getP('vegetation.trunk.barkTexture', 'barkTexture', 'FURROWED');
  const barkRoughness = Math.max(0.0, Math.min(1.0, getP('vegetation.trunk.barkRoughness', 'barkRoughness', 0.75)));
  const barkAnisotropy = Math.max(0.0, Math.min(1.0, getP('vegetation.trunk.barkAnisotropy', 'barkAnisotropy', 0.34)));
  const barkMicroDetail = Math.max(0.0, Math.min(1.0, getP('vegetation.trunk.barkMicroDetail', 'barkMicroDetail', 0.44)));
  const barkCurvatureDetail = Math.max(0.0, Math.min(1.0, getP('vegetation.trunk.barkCurvatureDetail', 'barkCurvatureDetail', 0.4)));
  const branchBarkScale = Math.max(0.0, Math.min(1.5, getP('vegetation.bark.branchScale', 'branchBarkScale', 0.65)));

  // Buttress (root flare lobes) â€” cheap geometry anisotropy at the base
  const buttressStrength = Math.max(0.0, getP('vegetation.trunk.buttressStrength', 'buttressStrength', 0.0));
  const buttressCount = Math.max(3, Math.round(getP('vegetation.trunk.buttressCount', 'buttressCount', 4)));
  const buttressSharpness = Math.max(0.5, getP('vegetation.trunk.buttressSharpness', 'buttressSharpness', 2.2));
  const buttressPhase = rng() * Math.PI * 2;

  // Macro profile phases (stable per-seed)
  const trunkOvalPhase = rng() * Math.PI * 2;
  const trunkFlutePhase = rng() * Math.PI * 2;

  // Precompute trunk gesture knots (Gaussian bends along height)
  const trunkKnots = [];
  for (let i = 0; i < trunkKnotCount; i++) {
    // Keep away from base/top so we don't explode the buttress/crown junction
    const ti = 0.18 + rng() * 0.62;
    const ang = rng() * Math.PI * 2;
    const dirX = Math.cos(ang);
    const dirZ = Math.sin(ang);
    const amp = trunkKnotStrength * (0.5 + 0.7 * rng());
    const width = trunkKnotWidth * (0.7 + 0.8 * rng());
    trunkKnots.push({ ti, dirX, dirZ, amp, width });
  }


  const segBase = 16;
  const ringBase = 20;
  const segments = Math.max(6, Math.round(segBase * lodGeoMul));
  const rings = Math.max(8, Math.round(ringBase * lodGeoMul));
  const trunkTopY = height * 0.6;
  const trunkTop = new THREE.Vector3(trunkLeanTopX, trunkTopY, trunkLeanTopZ);
  const trunkNode = createSkeletonNode(-1, new THREE.Vector3(0, 0, 0), trunkTop.clone(), 0, baseRadius, 'trunk', 0);
  const trunkNodeId = trunkNode.id;
  
  // Generate trunk with taper and twist
  let vertexOffset = 0;
  
  for (let r = 0; r <= rings; r++) {
    const t = r / rings;
    const y = t * height * 0.6;
    // Centerline offset: baseline lean + gesture knots (concentrated bends)
    let cx = trunkLeanTopX * t * t;
    let cz = trunkLeanTopZ * t * t;

    if (trunkKnots.length && trunkKnotStrength > 0.0) {
      // Scale with trunk size, but clamp so it doesn't go wild on giants
      const s = Math.min(1.8, Math.max(0.6, height * 0.08));
      for (let k = 0; k < trunkKnots.length; k++) {
        const kk = trunkKnots[k];
        const d = (t - kk.ti) / Math.max(0.0001, kk.width);
        const g = Math.exp(-0.5 * d * d);
        const a = kk.amp * s * (0.55 + 0.45 * (1.0 - t));
        cx += kk.dirX * a * g;
        cz += kk.dirZ * a * g;
      }
    }
    
    // Radius with taper and base flare
    const flare = t < 0.1 ? baseFlare * (1 - t / 0.1) + 1 : 1;
    const radius = baseRadius * Math.pow(1 - t, taperExponent) * flare;
    
    // Slight twist
    const twist = t * (getP('twist', 'vegetation.trunk.twist_deg', 0)) * Math.PI / 180;
    
    for (let s = 0; s <= segments; s++) {
      const theta = (s / segments) * Math.PI * 2 + twist;
      
      // Bark roughness + ridges (cheap, but reads surprisingly well)
      let barkAmp = radius * (0.008 + 0.020 * barkRoughness) * (0.45 + 0.9 * barkMicroDetail) * (0.85 + 0.3 * barkAnisotropy);
      let ridgeK = 9.0;
      let ridgeF = 1.8 / Math.max(0.001, radius);
      if (barkStyle === 'SMOOTH') { barkAmp *= 0.25; ridgeK = 2.0; ridgeF *= 0.6; }
      else if (barkStyle === 'PLATE') { barkAmp *= 0.55; ridgeK = 5.0; ridgeF *= 0.9; }

      const ridge = Math.sin(theta * ridgeK + y * ridgeF + buttressPhase * 1.7);
      const curvatureProxy = 0.5 + 0.5 * Math.abs(Math.cos(2.0 * (theta - trunkOvalPhase)));
      const barkCurvMul = 1.0 + barkCurvatureDetail * curvatureProxy * (0.7 + 0.3 * (1.0 - t));
      // Coherent bark field (avoids speckle shimmer; still cheap)
      const tx = (theta / (Math.PI * 2)) * ridgeK * 2.6 + buttressPhase * 0.13;
      const ty = y * ridgeF * 0.55;
      const barkField = fbm2(tx, ty, barkOctaves);
      const barkNoise = ((barkField - 0.5) * barkAmp * 1.85 + ridge * barkAmp * 0.55) * barkCurvMul;

      // Buttress lobes only near the ground
      const buttressT = (t < 0.08 && buttressStrength > 0.0) ? (1.0 - t / 0.08) : 0.0;
      const lobeRaw = Math.max(0.0, Math.cos(buttressCount * theta + buttressPhase));
      const lobe = Math.pow(lobeRaw, buttressSharpness);
      const buttressMul = 1.0 + buttressStrength * lobe * buttressT;

      // Macro cross-section shaping: ovality + fluting (mainly lower trunk)
      const oval = 1.0 + trunkOvality * Math.cos(2.0 * (theta - trunkOvalPhase));
      const flutingT = trunkFlutingStrength > 0.0 ? Math.max(0.0, Math.min(1.0, (0.35 - t) / 0.35)) : 0.0;
      const flute = 0.5 + 0.5 * Math.cos(trunkFlutingCount * (theta - trunkFlutePhase));
      const fluteVal = Math.pow(flute, trunkFlutingSharpness);
      const fluteMul = 1.0 - trunkFlutingStrength * fluteVal * flutingT;

      const macroMul = Math.max(0.45, oval * fluteMul);
      const r2 = (radius * macroMul + barkNoise) * buttressMul;
      
      const x = Math.cos(theta) * r2;
      const z = Math.sin(theta) * r2;
      
      vertices.push(x + cx, y, z + cz);
      
      // Normal
      const nx = Math.cos(theta);
      const nz = Math.sin(theta);
      normals.push(nx, 0, nz);
      
      // Color with variation
      const colorVar = 0.9 + rng() * 0.2;
      colors.push(
        trunkColor.r * colorVar,
        trunkColor.g * colorVar,
        trunkColor.b * colorVar
      );
      pushWindMeta(
        0.04 + t * 0.2,
        t * 0.65,
        trunkHash,
        Math.max(0.45, 0.98 - t * 0.4),
        trunkHash,
        0.0,
        0.0,
        0.0,
        1
      );
      pushBranchBinding(trunkNodeId, trunkNodeId, t, 0.0, 1);
    }
  }
  
  // Trunk indices
  for (let r = 0; r < rings; r++) {
    for (let s = 0; s < segments; s++) {
      const a = r * (segments + 1) + s;
      const b = a + segments + 1;
      indices.push(a, b, a + 1);
      indices.push(a + 1, b, b + 1);
    }
  }
  
  vertexOffset = vertices.length / 3;
  

  // Generate branches (hero structure)
  const maxOrder = Math.max(2, Math.min(8, getP('vegetation.branching.maxOrder', 'maxOrder', 5)));
  const branchProbBase = Math.max(0.05, Math.min(1.0, getP('vegetation.branching.probability', 'branchProbability', 0.65)));
  const apicalDomBase = Math.max(0.0, Math.min(1.0, getP('vegetation.branching.apicalDominance', 'apicalDominance', 0.7)));
  const angleMeanBase = (getP('vegetation.branching.angleMean_deg', 'branchAngle', 35)) * Math.PI / 180;
  const angleVarBase = (getP('vegetation.branching.angleVariance_deg', 'branchAngleVar', 12)) * Math.PI / 180;
  const lengthDecayBase = getP('vegetation.branching.lengthDecay', 'lengthDecay', 0.72);
  const radiusDecayBase = getP('vegetation.branching.radiusDecay', 'radiusDecay', 0.65);

  // Branchâ€“trunk junction shaping (reduces the "stuck-on tube" look)
  const collarStrength = Math.max(0.0, getP('vegetation.branching.collarStrength', 'collarStrength', 0.28));
  const collarLength = Math.max(0.02, Math.min(0.35, getP('vegetation.branching.collarLength', 'collarLength', 0.12)));

  // Metaball-ish unions (adds a junction blob + local bulge; visual SDF feel without SDF meshing)
  const junctionBlobStrength = Math.max(0.0, Math.min(1.0, getP('vegetation.branching.junctionMetaballStrength', 'junctionMetaballStrength', 0.35)));
  const junctionBlobRadiusScale = Math.max(0.4, Math.min(3.0, getP('vegetation.branching.junctionMetaballRadius', 'junctionMetaballRadius', 1.25)));
  const junctionBlobSeg = Math.max(4, Math.min(14, Math.round(getP('vegetation.branching.junctionMetaballSegments', 'junctionMetaballSegments', 7))));
  const unionBlendLength = Math.max(0.06, Math.min(0.45, getP('vegetation.branching.unionBlendLength', 'unionBlendLength', 0.22)));
  const unionBlendStrength = Math.max(0.0, Math.min(1.0, getP('vegetation.branching.unionBlendStrength', 'unionBlendStrength', 0.58)));
  const unionAsymmetry = Math.max(0.0, Math.min(1.0, getP('vegetation.branching.unionAsymmetry', 'unionAsymmetry', 0.42)));

  // Branch gesture knots (concentrate curvature into specific parts of the limb)
  const branchKnotStrength = Math.max(0.0, Math.min(1.0, getP('vegetation.branching.gestureKnotStrength', 'branchKnotStrength', 0.25)));
  const branchKnotWidth = Math.max(0.02, Math.min(0.55, getP('vegetation.branching.gestureKnotWidth', 'branchKnotWidth', 0.18)));

  // Branch cross-section subtle ovality
  const branchOvality = Math.max(0.0, Math.min(0.25, getP('vegetation.branching.ovality', 'branchOvality', 0.05)));
  const branchOvalPhase = rng() * Math.PI * 2;

  // Damage / breakage
  const breakProbability = Math.max(0.0, Math.min(0.6, getP('vegetation.branching.breakProbability', 'breakProbability', 0.0)));
  const breakSeverity = Math.max(0.0, Math.min(1.0, getP('vegetation.branching.breakSeverity', 'breakSeverity', 0.5)));

  const mainBranchCountBase = getP('vegetation.branching.mainBranchCount', 'branchCount', 6);
  const branchLengthRatioBase = getP('vegetation.branching.lengthRatio', 'branchLength', 0.55);

  let profileBranchCountMul = 1.0;
  let profileBranchProbMul = 1.0;
  let profileApicalMul = 1.0;
  let profileAngleMul = 1.0;
  let profileAngleVarMul = 1.0;
  let profileLengthRatioMul = 1.0;
  let profileLengthDecayMul = 1.0;
  let profileRadiusDecayMul = 1.0;

  if (speciesProfile === 'PINE_CONIFER') {
    profileBranchCountMul = 1.35;
    profileBranchProbMul = 1.08;
    profileApicalMul = 1.28;
    profileAngleMul = 0.72;
    profileAngleVarMul = 0.62;
    profileLengthRatioMul = 0.82;
    profileLengthDecayMul = 0.94;
    profileRadiusDecayMul = 0.93;
  } else if (speciesProfile === 'SPRUCE_CONICAL') {
    profileBranchCountMul = 1.42;
    profileBranchProbMul = 1.12;
    profileApicalMul = 1.36;
    profileAngleMul = 0.62;
    profileAngleVarMul = 0.52;
    profileLengthRatioMul = 0.74;
    profileLengthDecayMul = 0.92;
    profileRadiusDecayMul = 0.9;
  } else if (speciesProfile === 'WILLOW_WEEPING') {
    profileBranchCountMul = 1.18;
    profileBranchProbMul = 1.04;
    profileApicalMul = 0.76;
    profileAngleMul = 1.22;
    profileAngleVarMul = 1.18;
    profileLengthRatioMul = 1.14;
    profileLengthDecayMul = 0.9;
    profileRadiusDecayMul = 0.95;
  } else if (speciesProfile === 'BIRCH_UPRIGHT') {
    profileBranchCountMul = 0.88;
    profileBranchProbMul = 0.92;
    profileApicalMul = 1.1;
    profileAngleMul = 0.84;
    profileAngleVarMul = 0.75;
    profileLengthRatioMul = 0.9;
    profileLengthDecayMul = 0.96;
    profileRadiusDecayMul = 0.9;
  } else if (speciesProfile === 'ACACIA_SAVANNA') {
    profileBranchCountMul = 0.86;
    profileBranchProbMul = 1.08;
    profileApicalMul = 0.52;
    profileAngleMul = 1.34;
    profileAngleVarMul = 1.35;
    profileLengthRatioMul = 1.24;
    profileLengthDecayMul = 0.86;
    profileRadiusDecayMul = 0.92;
  } else if (speciesProfile === 'OAK_MAPLE') {
    profileBranchCountMul = 1.08;
    profileBranchProbMul = 1.0;
    profileApicalMul = 0.92;
    profileAngleMul = 1.08;
    profileAngleVarMul = 1.08;
    profileLengthRatioMul = 1.08;
    profileLengthDecayMul = 0.98;
    profileRadiusDecayMul = 1.0;
  }

  const branchProb = Math.max(0.05, Math.min(1.0, branchProbBase * profileBranchProbMul));
  const apicalDom = Math.max(0.0, Math.min(1.0, apicalDomBase * profileApicalMul));
  const angleMean = angleMeanBase * profileAngleMul;
  const angleVar = angleVarBase * profileAngleVarMul;
  const lengthDecay = lengthDecayBase * profileLengthDecayMul;
  const radiusDecay = radiusDecayBase * profileRadiusDecayMul;
  const mainBranchCount = Math.max(1, Math.round(mainBranchCountBase * profileBranchCountMul * (0.65 + 0.55 * Math.min(1.2, age01)) * (0.45 + 0.55 * lodScale)));
  const branchLengthRatio = branchLengthRatioBase * profileLengthRatioMul;
  const isPine = speciesProfile === 'PINE_CONIFER';
  const isSpruce = speciesProfile === 'SPRUCE_CONICAL';
  const isWillow = speciesProfile === 'WILLOW_WEEPING';
  const isBirch = speciesProfile === 'BIRCH_UPRIGHT';
  const isAcacia = speciesProfile === 'ACACIA_SAVANNA';
  const isConifer = isPine || isSpruce;
  const speciesEnvelopeStrength = isSpruce ? 0.94 : isAcacia ? 0.88 : 0.0;
  const speciesEnvelopeCenter = new THREE.Vector3(trunkLeanTopX * 0.7, trunkTopY + height * 0.12, trunkLeanTopZ * 0.7);

  // Phyllotaxis azimuth helper
  const GOLDEN = Math.PI * (3 - Math.sqrt(5));
  const resolvedPhyllotaxis = isConifer ? 'WHORLED' : phyllotaxisMode;
  const phylloAz = (i) => {
    if (resolvedPhyllotaxis === 'ALTERNATE') return (i * GOLDEN) % (Math.PI * 2);
    if (resolvedPhyllotaxis === 'OPPOSITE') return (i % 2) * Math.PI;
    if (resolvedPhyllotaxis === 'WHORLED')  return ((i % 3) * (2 * Math.PI / 3)) + (Math.floor(i / 3) * GOLDEN);
    return rng() * Math.PI * 2;
  };

  const safeCross = (a, b) => {
    const v = new THREE.Vector3().crossVectors(a, b);
    if (v.lengthSq() < 1e-6) {
      // choose an alternate basis if nearly parallel
      return new THREE.Vector3().crossVectors(a, new THREE.Vector3(1, 0, 0)).normalize();
    }
    return v.normalize();
  };

  const tangentFrame = (tangent) => {
    const up = Math.abs(tangent.y) > 0.92 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const right = safeCross(tangent, up);
    const forward = new THREE.Vector3().crossVectors(right, tangent).normalize();
    return { right, forward };
  };

  const bezierPos = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return new THREE.Vector3(
      u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x,
      u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y,
      u*u*u*p0.z + 3*u*u*t*p1.z + 3*u*t*t*p2.z + t*t*t*p3.z
    );
  };
  const bezierTan = (p0, p1, p2, p3, t) => {
    const u = 1 - t;
    return new THREE.Vector3(
      -3*u*u*p0.x + 3*(u*u - 2*u*t)*p1.x + 3*(2*u*t - t*t)*p2.x + 3*t*t*p3.x,
      -3*u*u*p0.y + 3*(u*u - 2*u*t)*p1.y + 3*(2*u*t - t*t)*p2.y + 3*t*t*p3.y,
      -3*u*u*p0.z + 3*(u*u - 2*u*t)*p1.z + 3*(2*u*t - t*t)*p2.z + 3*t*t*p3.z
    ).normalize();
  };

  const envelopeCenterXZ = (yVal) => {
    const yNorm = clamp01(yVal / Math.max(0.001, trunkTopY));
    return new THREE.Vector3(
      trunkLeanTopX * yNorm * yNorm * 0.95,
      0,
      trunkLeanTopZ * yNorm * yNorm * 0.95
    );
  };

  const clampPointToSpeciesEnvelope = (point, controlBias = 1.0) => {
    if (speciesEnvelopeStrength <= 0.001) return point.clone();
    const out = point.clone();
    const center = envelopeCenterXZ(out.y);
    const lateral = new THREE.Vector3(out.x - center.x, 0, out.z - center.z);
    const lateralLen = lateral.length();

    if (isSpruce) {
      const yMin = height * 0.08;
      const yMax = height * 1.02;
      const yNorm = clamp01((out.y - yMin) / Math.max(0.001, yMax - yMin));
      const baseR = baseRadius * 0.72;
      const canopyR = height * (0.32 + 0.08 * Math.min(1.3, age01));
      const allowedR = baseR + canopyR * Math.pow(Math.max(0, 1.0 - yNorm), 1.12);
      const blend = speciesEnvelopeStrength * controlBias * smoothstepRange(height * 0.14, height * 0.54, out.y);
      if (lateralLen > allowedR && lateralLen > 1e-6) {
        lateral.multiplyScalar(allowedR / lateralLen);
        out.x = center.x + lateral.x;
        out.z = center.z + lateral.z;
      }
      return point.clone().lerp(out, blend);
    }

    if (isAcacia) {
      const canopyY = trunkTopY + height * 0.22;
      const halfBand = height * 0.14;
      const yClamped = Math.max(canopyY - halfBand, Math.min(canopyY + halfBand * 0.55, out.y));
      const bandN = 1.0 - clamp01(Math.abs(yClamped - canopyY) / Math.max(0.001, halfBand));
      const flatR = height * (0.5 + 0.08 * Math.min(1.2, age01));
      const allowedR = flatR * (0.76 + 0.24 * bandN);
      const blend = speciesEnvelopeStrength * controlBias * smoothstepRange(height * 0.28, height * 0.6, out.y);
      if (lateralLen > allowedR && lateralLen > 1e-6) {
        lateral.multiplyScalar(allowedR / lateralLen);
        out.x = center.x + lateral.x;
        out.z = center.z + lateral.z;
      }
      out.y = lerp(out.y, yClamped, blend * 0.82);
      return point.clone().lerp(out, blend);
    }

    return point.clone();
  };

  const makeWindProfile = (
    order,
    branchHash,
    parentHash,
    parentInfluence = 0.0,
    leafiness = 0.0,
    nodeId = trunkNodeId,
    parentNodeId = trunkNodeId,
    unionNormal = null,
    parentRadiusHint = 0
  ) => ({
    branchHash: fract(branchHash),
    parentHash: fract(parentHash),
    parentInfluence: clamp01(parentInfluence),
    orderNorm: clamp01((order - 1) / Math.max(1, maxOrder - 1)),
    leafiness: clamp01(leafiness),
    nodeId: Math.max(0, nodeId | 0),
    parentNodeId: Math.max(0, parentNodeId | 0),
    unionNormal: unionNormal ? [unionNormal.x, unionNormal.y, unionNormal.z] : null,
    parentRadiusHint: Math.max(0.0, parentRadiusHint || 0.0),
  });

  const addLeafCluster = (tip, tangent, rad, order, windProfile = makeWindProfile(order, trunkHash, trunkHash, 0.0, 1.0)) => {
    if (leafRep === 'MASS_ONLY') return;
    const leafSize_m = getP('vegetation.leaves.size_m', 'leafSize', 0.08);
    const leavesPerCluster = Math.max(3, Math.round(getP('vegetation.leaves.clusterSize', 'leafClusterSize', 12)));
    const densityN = getP('vegetation.leaves.cardsPerMeter', 'leafDensity', 8.0) / 8.0;
    const petioleLengthFactor = Math.max(0.0, getP('vegetation.leaves.petioleLengthFactor', 'petioleLengthFactor', 0.35));
    const petioleDroop = Math.max(0.0, Math.min(1.5, getP('vegetation.leaves.petioleDroop', 'petioleDroop', 0.35)));
    const petioleWidthFactor = Math.max(0.02, Math.min(0.25, getP('vegetation.leaves.petioleWidthFactor', 'petioleWidthFactor', 0.07)));

    const leafLodMul = (lodIndex === 0) ? 1.0 : (lodIndex === 1) ? 0.65 : (lodIndex === 2) ? 0.35 : 0.18;
    const clusterRadiusMul = isConifer ? (isSpruce ? 0.62 : 0.7) : isAcacia ? 1.2 : isWillow ? 1.1 : 1.0;
    const clusterRadius = leafSize_m * Math.sqrt(leavesPerCluster) * 2.2 * (0.6 + 0.5 * (order / maxOrder)) * clusterRadiusMul;
    const baseCountRaw = Math.round(leavesPerCluster * (0.75 + rng() * 0.5) * densityN * (0.7 + 0.5 * age01));
    const speciesLeafMul = isConifer ? (isSpruce ? 1.18 : 1.05) : isAcacia ? 1.2 : isWillow ? 1.1 : 1.0;
    const baseCount = Math.max(1, Math.round(baseCountRaw * (leafRep === 'CLUSTERS' ? 0.7 : 1.0) * leafLodMul * speciesLeafMul));
    const { right, forward } = tangentFrame(tangent);
    const branchHash = windProfile.branchHash;
    const parentHash = windProfile.parentHash;
    const orderNorm = windProfile.orderNorm;
    const parentInfluence = windProfile.parentInfluence;
    const nodeId = windProfile.nodeId;
    const parentNodeId = windProfile.parentNodeId;

    const emitPetioleRibbon = (basePt, tipPt, rightVec, normalVec, width, colorMul = 0.7) => {
      const idx0 = vertices.length / 3;
      const w0 = width;
      const w1 = width * 0.65;

      const bL = basePt.clone().add(rightVec.clone().multiplyScalar(-w0));
      const bR = basePt.clone().add(rightVec.clone().multiplyScalar( w0));
      const tL = tipPt.clone().add(rightVec.clone().multiplyScalar(-w1));
      const tR = tipPt.clone().add(rightVec.clone().multiplyScalar( w1));

      vertices.push(bL.x, bL.y, bL.z, bR.x, bR.y, bR.z, tR.x, tR.y, tR.z, tL.x, tL.y, tL.z);

      // Darker, woodier green for stems
      const cVar = 1.0 + (rng() - 0.5) * 2 * leafColorVariation;
      const rC = leafColorBase.r * colorMul * cVar;
      const gC = leafColorBase.g * colorMul * cVar;
      const bC = leafColorBase.b * colorMul * cVar;
      for (let k = 0; k < 4; k++) colors.push(rC, gC, bC);
      for (let k = 0; k < 4; k++) normals.push(normalVec.x, normalVec.y, normalVec.z);
      const petHash = fract(branchHash * 0.73 + cVar * 0.11);
      pushWindMeta(0.78, 0.66, petHash, 0.22, parentHash, orderNorm, Math.max(0.62, parentInfluence), 0.68, 4);
      pushBranchBinding(nodeId, parentNodeId, 0.9, Math.max(0.62, parentInfluence), 4);

      indices.push(idx0, idx0 + 1, idx0 + 2);
      indices.push(idx0, idx0 + 2, idx0 + 3);
    };

    for (let i = 0; i < baseCount; i++) {
      const az = rng() * Math.PI * 2;
      const dist = Math.sqrt(rng()) * clusterRadius;
      const lift = (rng() - 0.25) * clusterRadius * 0.8;

      const center = tip.clone()
        .add(right.clone().multiplyScalar(Math.cos(az) * dist))
        .add(forward.clone().multiplyScalar(Math.sin(az) * dist))
        .add(new THREE.Vector3(0, lift, 0));

      const s = (leafSize_m * (0.85 + rng() * 0.7)) * (0.7 + 0.6 * (order / maxOrder)) * (0.9 + 0.2 * age01);

            // Billboard-ish quads (camera-facing is expensive; we approximate with branch frame)
      const n = right.clone().multiplyScalar((rng() - 0.5) * 0.4)
        .add(forward.clone().multiplyScalar((rng() - 0.5) * 0.4))
        .add(sunDir.clone().multiplyScalar(0.25))
        .normalize();
      const u = safeCross(n, new THREE.Vector3(0,1,0));
      const v = new THREE.Vector3().crossVectors(n, u).normalize();

      const emitLeafPrimitive = (uVec, vVec, centerPt = center) => {
        const lVar = 1.0 + (rng() - 0.5) * 2 * leafColorVariation;
        const lMul = 0.85 + rng() * 0.35;
        const leafHash = fract(branchHash * 0.69 + i * 0.173 + lVar * 0.117 + lMul * 0.083);

        const pushColorN = (nVerts) => {
          for (let k = 0; k < nVerts; k++) {
            colors.push(
              leafColorBase.r * lMul * lVar,
              leafColorBase.g * lMul * lVar,
              leafColorBase.b * lMul * lVar
            );
            normals.push(n.x, n.y, n.z);
          }
          pushWindMeta(0.98, 0.94, leafHash, 0.08, parentHash, orderNorm, Math.max(0.74, parentInfluence), 1.0, nVerts);
          pushBranchBinding(nodeId, parentNodeId, 1.0, Math.max(0.74, parentInfluence), nVerts);
        };

        const emitQuadUV = (uL, vL, wScale, lScale) => {
          const leafIdx = vertices.length / 3;
          const ww = s * wScale;
          const ll0 = -s * 0.35 * lScale;
          const ll1 =  s * 1.10 * lScale;

          const pA = centerPt.clone().add(uL.clone().multiplyScalar(-ww)).add(vL.clone().multiplyScalar(ll0));
          const pB = centerPt.clone().add(uL.clone().multiplyScalar( ww)).add(vL.clone().multiplyScalar(ll0));
          const pC = centerPt.clone().add(uL.clone().multiplyScalar( ww)).add(vL.clone().multiplyScalar(ll1));
          const pD = centerPt.clone().add(uL.clone().multiplyScalar(-ww)).add(vL.clone().multiplyScalar(ll1));

          vertices.push(pA.x, pA.y, pA.z, pB.x, pB.y, pB.z, pC.x, pC.y, pC.z, pD.x, pD.y, pD.z);
          pushColorN(4);

          indices.push(leafIdx, leafIdx + 1, leafIdx + 2);
          indices.push(leafIdx, leafIdx + 2, leafIdx + 3);
        };

        const emitBroadleafStripUV = (uL, vL, wScale = 1.0, lScale = 1.0, lobe = 0.0, offsetAlong = 0.0, sideOffset = 0.0) => {
          const segN = (lodIndex <= 1) ? 4 : 3;
          const L = s * 2.4 * lScale;
          const W = s * 1.15 * wScale;

          const base = centerPt.clone()
            .add(vL.clone().multiplyScalar(-0.45 * L + offsetAlong))
            .add(uL.clone().multiplyScalar(sideOffset));

          const baseIdx = vertices.length / 3;

          for (let i = 0; i <= segN; i++) {
            const t = i / segN; // 0..1
            const y = (-0.45 + 1.45 * t) * L;
            // leaf profile (wide mid, narrow base+tip)
            let w = Math.pow(Math.max(0.0, Math.sin(Math.PI * t)), 0.72) * W;
            w = Math.max(0.08 * W, w);

            if (lobe > 0.0) {
              const lobes = 4.0;
              const lobeMod = 0.85 + 0.15 * Math.sin(lobes * Math.PI * t) * Math.pow(Math.sin(Math.PI * t), 1.2);
              w *= (1.0 - 0.12 * lobe) + 0.24 * lobe * lobeMod;
            }

            const pL = base.clone().add(uL.clone().multiplyScalar(-w)).add(vL.clone().multiplyScalar(y));
            const pR = base.clone().add(uL.clone().multiplyScalar( w)).add(vL.clone().multiplyScalar(y));

            vertices.push(pL.x, pL.y, pL.z, pR.x, pR.y, pR.z);
          }

          const nVerts = (segN + 1) * 2;
          pushColorN(nVerts);

          for (let i = 0; i < segN; i++) {
            const i0 = baseIdx + i * 2;
            const i1 = i0 + 1;
            const i2 = i0 + 2;
            const i3 = i0 + 3;
            indices.push(i0, i1, i2);
            indices.push(i1, i3, i2);
          }
        };

        // Leaf shape selection (still "cards", but with better silhouettes)
        if (leafShape === 'NEEDLE' || leafShape === 'SCALE') {
          emitQuadUV(uVec, vVec, 0.22, 1.85);
        } else if (leafShape === 'PALM_FROND') {
          // A few needle strips in a fan
          emitQuadUV(uVec, vVec, 0.16, 2.1);
          const fan = 0.55;
          for (let sgn = -1; sgn <= 1; sgn += 2) {
            const rot = fan * sgn;
            const u2 = uVec.clone().multiplyScalar(Math.cos(rot)).add(vVec.clone().multiplyScalar(Math.sin(rot))).normalize();
            const v2 = vVec.clone().multiplyScalar(Math.cos(rot)).sub(uVec.clone().multiplyScalar(Math.sin(rot))).normalize();
            emitQuadUV(u2, v2, 0.14, 1.95);
          }
          emitQuadUV(uVec, vVec, 0.12, 1.8);
        } else if (leafShape === 'COMPOUND') {
          // Three smaller leaflets along the stem
          emitBroadleafStripUV(uVec, vVec, 0.55, 0.8, 0.0, -s * 0.25, -s * 0.35);
          emitBroadleafStripUV(uVec, vVec, 0.55, 0.85, 0.0, s * 0.15, s * 0.35);
          emitBroadleafStripUV(uVec, vVec, 0.48, 0.7, 0.0, s * 0.45, 0.0);
        } else if (leafShape === 'LOBED') {
          emitBroadleafStripUV(uVec, vVec, 1.0, 1.0, 1.0);
        } else {
          // BROADLEAF default
          emitBroadleafStripUV(uVec, vVec, 1.0, 1.0, 0.0);
        }
      };

      // Petiole + gravity droop (gives real leaf attachment and weight)
      const gravity = new THREE.Vector3(0, -1, 0);
      const petioleLen = s * petioleLengthFactor * (0.75 + 0.5 * rng());
      const droop = petioleDroop * (0.7 + 0.5 * (1.0 - order / maxOrder)) * (0.85 + 0.4 * rng());
      const petDir = v.clone().add(gravity.clone().multiplyScalar(droop)).normalize();
      const leafCenter = center.clone().add(petDir.clone().multiplyScalar(petioleLen));
      const vLeaf = petDir.clone().lerp(v, 0.45).normalize();

      if (petioleLen > 0.0005 && lodIndex <= 2) {
        emitPetioleRibbon(center, leafCenter, u, n, s * petioleWidthFactor);
      }

      // CARDS: 1 primitive; CLUSTERS: crossed primitives (volume fake)
      emitLeafPrimitive(u, vLeaf, leafCenter);
      if (leafRep === 'CLUSTERS') {
        // Crossed primitives to fake volume at a distance
        emitLeafPrimitive(vLeaf, u.clone().multiplyScalar(-1), leafCenter);

        const rot = 0.9;
        const u2 = u.clone().multiplyScalar(Math.cos(rot)).add(vLeaf.clone().multiplyScalar(Math.sin(rot))).normalize();
        const v2 = vLeaf.clone().multiplyScalar(Math.cos(rot)).sub(u.clone().multiplyScalar(Math.sin(rot))).normalize();
        emitLeafPrimitive(u2, v2, leafCenter);
      }

    }
  };

  const addBezierBranchTube = (p0, p1, p2, p3, rad0, rad1, order, windProfile = makeWindProfile(order, trunkHash, trunkHash, 0.0, 0.0)) => {
    const branchSegs = Math.max(4, Math.min(12, Math.round((6 + order) * lodGeoMul)));
    const branchRings = Math.max(5, Math.min(12, Math.round((7 + order) * lodGeoMul)));
    const startIdx = vertices.length / 3;
    const branchHash = windProfile.branchHash;
    const parentHash = windProfile.parentHash;
    const orderNorm = windProfile.orderNorm;
    const parentInfluence = windProfile.parentInfluence;
    const nodeId = windProfile.nodeId;
    const parentNodeId = windProfile.parentNodeId;
    const parentRadiusHint = Math.max(rad0, windProfile.parentRadiusHint ?? 0.0);
    const unionNormal = Array.isArray(windProfile.unionNormal)
      ? new THREE.Vector3(windProfile.unionNormal[0] ?? 0, windProfile.unionNormal[1] ?? 0, windProfile.unionNormal[2] ?? 0).normalize()
      : null;
    const unionLen = Math.max(collarLength * 1.05, unionBlendLength);

    for (let r = 0; r <= branchRings; r++) {
      const t = r / branchRings;
      const pos = bezierPos(p0, p1, p2, p3, t);
      const tan = bezierTan(p0, p1, p2, p3, t);
      const { right, forward } = tangentFrame(tan);
      let rad = rad0 + (rad1 - rad0) * t;
      const unionMask = smoothstepRange(unionLen, 0.0, t);

      if (parentRadiusHint > rad0 && unionMask > 0.001 && unionBlendStrength > 0.0) {
        const parentTarget = parentRadiusHint * (0.28 + 0.48 * unionBlendStrength) * (1.0 - Math.min(0.55, orderNorm * 0.5));
        rad = lerp(rad, Math.max(rad, parentTarget), unionMask * unionBlendStrength);
      }
      // Local base thickening near junctions: collar + metaball-ish bulge
      if ((collarStrength > 0.0 || junctionBlobStrength > 0.0) && t < collarLength * 1.6) {
        const orderScale = 1.0 - Math.min(0.7, (order - 1) * 0.18);

        if (collarStrength > 0.0 && t < collarLength) {
          const u = 1.0 - (t / collarLength);
          rad *= 1.0 + collarStrength * orderScale * (u * u);
        }

        if (junctionBlobStrength > 0.0) {
          const u0 = 1.0 - (t / (collarLength * 1.6));
          rad *= 1.0 + junctionBlobStrength * 0.55 * orderScale * (u0 * u0);
        }
      }

      for (let s = 0; s <= branchSegs; s++) {
        const ang = (s / branchSegs) * Math.PI * 2;
        const ang2 = ang + branchOvalPhase;
        let radAng = rad * (1.0 + branchOvality * Math.cos(2.0 * ang2) * (0.75 + 0.25 * (1.0 - t)));
        const ringDir = right.clone().multiplyScalar(Math.cos(ang)).add(forward.clone().multiplyScalar(Math.sin(ang)));

        if (unionNormal && unionMask > 0.001 && unionAsymmetry > 0.0) {
          const align = ringDir.dot(unionNormal);
          const inward = Math.max(0.0, -align);
          const outward = Math.max(0.0, align);
          const asymW = unionAsymmetry * unionMask;
          radAng *= (1.0 - 0.42 * asymW * inward * inward);
          radAng *= (1.0 + 0.18 * asymW * Math.pow(outward, 1.25));
        }

        // Bark microdisplacement around the ring (order-scaled, LOD-capped)

        if (barkRoughness > 0.001 && lodIndex <= 1) {

          const ord = Math.max(0, order - 1);

          let barkAmpLocal = rad * (0.006 + 0.018 * barkRoughness) * (0.45 + 0.9 * barkMicroDetail) * (0.85 + 0.3 * barkAnisotropy);

          let ridgeK = 8.0;

          let ridgeF = 1.6 / Math.max(0.001, rad);

          if (barkStyle === 'SMOOTH') { barkAmpLocal *= 0.22; ridgeK = 2.0; ridgeF *= 0.6; }

          else if (barkStyle === 'PLATE') { barkAmpLocal *= 0.55; ridgeK = 5.0; ridgeF *= 0.9; }

          const orderScale = Math.pow(0.72, ord);

          const tipFade = 0.25 + 0.75 * (1.0 - t);

          const lodAmp = (lodIndex === 0) ? 1.0 : 0.65;

          const tx = (ang2 / (Math.PI * 2)) * ridgeK * 2.4 + (seed * 0.001) + ord * 0.17;

          const ty = (t * ridgeF * 0.8) + ord * 0.31;

          const b = fbm2(tx, ty, barkOctaves);

          const barkNoise = (b - 0.5) * 2.0;
          const curvatureProxy = 0.5 + 0.5 * Math.abs(Math.cos(2.0 * ang2));
          const barkCurvMul = 1.0 + barkCurvatureDetail * curvatureProxy * (0.65 + 0.35 * (1.0 - t));

          radAng *= (1.0 + barkAmpLocal * orderScale * tipFade * lodAmp * branchBarkScale * 0.35 * barkNoise * barkCurvMul);

        }
        const unionShift = (unionNormal && unionMask > 0.001 && unionAsymmetry > 0.0)
          ? unionNormal.clone().multiplyScalar(rad * unionAsymmetry * unionMask * 0.24)
          : null;
        const offset = ringDir.multiplyScalar(radAng);
        if (unionShift) offset.add(unionShift);
        const vtx = pos.clone().add(offset);
        vertices.push(vtx.x, vtx.y, vtx.z);
        const nn = offset.clone().normalize();
        normals.push(nn.x, nn.y, nn.z);

        const colorVar = 0.82 + rng() * 0.28;
        colors.push(trunkColor.r * colorVar, trunkColor.g * colorVar, trunkColor.b * colorVar);
        pushWindMeta(
          0.2 + orderNorm * 0.62 + t * 0.22,
          0.25 + t * 0.75,
          branchHash,
          0.84 - orderNorm * 0.36 - t * 0.25,
          parentHash,
          orderNorm,
          parentInfluence,
          0.0,
          1
        );
        pushBranchBinding(nodeId, parentNodeId, t, parentInfluence, 1);
      }
    }

    for (let r = 0; r < branchRings; r++) {
      for (let s = 0; s < branchSegs; s++) {
        const a = startIdx + r * (branchSegs + 1) + s;
        const b = a + branchSegs + 1;
        indices.push(a, b, a + 1);
        indices.push(a + 1, b, b + 1);
      }
    }

    return { tip: p3.clone(), tipTan: bezierTan(p0, p1, p2, p3, 1.0) };
  };

  let azIndex = 0;

  
  // Helper: approximate trunk radius (angular details ignored) at a given height y
  const trunkRadiusAtY = (y) => {
    const t = Math.max(0.0, Math.min(1.0, y / Math.max(0.001, height)));
    const flare = t < 0.1 ? baseFlare * (1 - t / 0.1) + 1 : 1;
    const r = baseRadius * Math.pow(1 - t, taperExponent) * flare;
    return Math.max(0.001, r);
  };

  // Junction blob geometry: low-poly ellipsoid that visually "metaballs" the limb into the trunk
  const addJunctionBlob = (center, axisDir, parentRad, childRad, order, windProfile = makeWindProfile(order, trunkHash, trunkHash, 0.0, 0.0)) => {
    if (junctionBlobStrength <= 0.0) return;
    if (lodIndex >= 2) return; // union blob only for near/mid
    // Stronger for primary limbs; fades for higher orders
    const oScale = 1.0 - Math.min(0.85, (order - 1) * 0.22);
    const s = junctionBlobStrength * oScale;
    if (s <= 0.001) return;

    const seg = Math.max(3, Math.round(junctionBlobSeg * lodGeoMul));
    const latSeg = seg;
    const lonSeg = seg * 2;

    const blobR = (parentRad + childRad) * 0.65 * junctionBlobRadiusScale * (0.9 + 0.25 * rng()) * (0.8 + 0.35 * s);
    const axis = axisDir.clone().normalize();
    const tmp = Math.abs(axis.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(tmp, axis).normalize();
    const forward = new THREE.Vector3().crossVectors(axis, right).normalize();

    // Ellipsoid scales
    const radX = blobR * (1.0 + 0.18 * trunkOvality);
    const radZ = blobR * (1.0 - 0.12 * trunkOvality);
    const radY = blobR * (1.0 + 0.85 * s);
    const branchHash = windProfile.branchHash;
    const parentHash = windProfile.parentHash;
    const orderNorm = windProfile.orderNorm;
    const parentInfluence = windProfile.parentInfluence;
    const nodeId = windProfile.nodeId;
    const parentNodeId = windProfile.parentNodeId;

    const baseIdx = vertices.length / 3;

    for (let i = 0; i <= latSeg; i++) {
      const v = i / latSeg;
      const phi = v * Math.PI;
      const sp = Math.sin(phi);
      const cp = Math.cos(phi);

      for (let j = 0; j <= lonSeg; j++) {
        const u = j / lonSeg;
        const th = u * Math.PI * 2;
        const ct = Math.cos(th);
        const st = Math.sin(th);

        // Local ellipsoid point (x,z around, y along axis)
        const lx = ct * sp * radX;
        const lz = st * sp * radZ;
        const ly = cp * radY;

        const p = center.clone()
          .add(right.clone().multiplyScalar(lx))
          .add(forward.clone().multiplyScalar(lz))
          .add(axis.clone().multiplyScalar(ly));

        vertices.push(p.x, p.y, p.z);

        // Approx ellipsoid normal
        const nx = (ct * sp) / Math.max(0.0001, radX);
        const nz = (st * sp) / Math.max(0.0001, radZ);
        const ny = (cp) / Math.max(0.0001, radY);
        const n = right.clone().multiplyScalar(nx)
          .add(forward.clone().multiplyScalar(nz))
          .add(axis.clone().multiplyScalar(ny))
          .normalize();
        normals.push(n.x, n.y, n.z);

        const cVar = 0.9 + rng() * 0.22;
        colors.push(trunkColor.r * cVar, trunkColor.g * cVar, trunkColor.b * cVar);
        pushWindMeta(
          0.16 + orderNorm * 0.46,
          0.18,
          branchHash,
          0.9,
          parentHash,
          orderNorm,
          Math.max(parentInfluence, 0.75),
          0.0,
          1
        );
        pushBranchBinding(nodeId, parentNodeId, 0.08, Math.max(parentInfluence, 0.75), 1);
      }
    }

    for (let i = 0; i < latSeg; i++) {
      for (let j = 0; j < lonSeg; j++) {
        const a = baseIdx + i * (lonSeg + 1) + j;
        const b = baseIdx + (i + 1) * (lonSeg + 1) + j;
        const c = baseIdx + (i + 1) * (lonSeg + 1) + (j + 1);
        const d = baseIdx + i * (lonSeg + 1) + (j + 1);
        indices.push(a, b, d);
        indices.push(b, c, d);
      }
    }
  };

  // Broken tip cap: small jagged cone, used when "breakProbability" triggers
  const addBrokenTipCap = (pos, dir, rad, windProfile = makeWindProfile(maxOrder, trunkHash, trunkHash, 0.0, 0.0)) => {
    const seg = 7;
    const axis = dir.clone().normalize();
    const tmp = Math.abs(axis.y) > 0.9 ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(tmp, axis).normalize();
    const forward = new THREE.Vector3().crossVectors(axis, right).normalize();

    const capLen = rad * (2.6 + 2.4 * rng());
    const baseR = rad * (1.0 + 0.6 * rng());
    const tip = pos.clone().add(axis.clone().multiplyScalar(capLen));
    const branchHash = windProfile.branchHash;
    const parentHash = windProfile.parentHash;
    const orderNorm = windProfile.orderNorm;
    const parentInfluence = windProfile.parentInfluence;
    const nodeId = windProfile.nodeId;
    const parentNodeId = windProfile.parentNodeId;

    const baseIdx = vertices.length / 3;

    // base ring
    for (let i = 0; i < seg; i++) {
      const a = (i / seg) * Math.PI * 2;
      const wobble = 0.65 + 0.55 * rng();
      const r = baseR * wobble;
      const p = pos.clone()
        .add(right.clone().multiplyScalar(Math.cos(a) * r))
        .add(forward.clone().multiplyScalar(Math.sin(a) * r));
      vertices.push(p.x, p.y, p.z);
      const n = p.clone().sub(pos).normalize();
      normals.push(n.x, n.y, n.z);
      const cVar = 0.75 + rng() * 0.18;
      colors.push(trunkColor.r * cVar, trunkColor.g * cVar, trunkColor.b * cVar);
      pushWindMeta(0.82, 0.88, branchHash, 0.22, parentHash, orderNorm, Math.max(0.7, parentInfluence), 0.0, 1);
      pushBranchBinding(nodeId, parentNodeId, 0.92, Math.max(0.7, parentInfluence), 1);
    }

    // tip vertex
    vertices.push(tip.x, tip.y, tip.z);
    normals.push(axis.x, axis.y, axis.z);
    const tVar = 0.7 + rng() * 0.2;
    colors.push(trunkColor.r * tVar, trunkColor.g * tVar, trunkColor.b * tVar);
    pushWindMeta(0.9, 1.0, branchHash, 0.18, parentHash, orderNorm, Math.max(0.72, parentInfluence), 0.0, 1);
    pushBranchBinding(nodeId, parentNodeId, 1.0, Math.max(0.72, parentInfluence), 1);

    const tipIdx = baseIdx + seg;

    for (let i = 0; i < seg; i++) {
      const a = baseIdx + i;
      const b = baseIdx + ((i + 1) % seg);
      indices.push(a, b, tipIdx);
    }
  };

const generateBranch = (startPos, startDir, length, radius, order, depth = 0, windProfile = makeWindProfile(order, trunkHash, trunkHash, 0.0, 0.0)) => {
    if (order > maxOrder || depth > 64 || length < 0.18 || radius < 0.004) return null;

    // Bend: gravity + wind + profile-specific architecture bias
    const gravity = new THREE.Vector3(0, -1, 0);
    const windDir = new THREE.Vector3(1, 0, -0.3).normalize();
    const startH = clamp01(startPos.y / Math.max(0.001, height));
    let speciesGravityMul = 1.0;
    let speciesWindMul = 1.0;
    let speciesRandMul = 1.0;
    let speciesVerticalBias = 0.0;
    if (isConifer) {
      if (isSpruce) {
        speciesGravityMul = 0.74 + 0.08 * order + 0.22 * startH;
        speciesWindMul = 0.82;
        speciesRandMul = 0.62;
        speciesVerticalBias = 0.2 * (1.0 - startH);
      } else {
        speciesGravityMul = 0.66 + 0.10 * order + 0.18 * startH;
        speciesWindMul = 0.88;
        speciesRandMul = 0.72;
        speciesVerticalBias = 0.16 * (1.0 - startH);
      }
    } else if (isWillow) {
      speciesGravityMul = 1.28 + 0.12 * order;
      speciesWindMul = 1.06;
      speciesRandMul = 1.12;
      speciesVerticalBias = -0.08;
    } else if (isBirch) {
      speciesGravityMul = 0.74 + 0.06 * order;
      speciesWindMul = 0.9;
      speciesRandMul = 0.62;
      speciesVerticalBias = 0.18 * (1.0 - startH);
    } else if (isAcacia) {
      speciesGravityMul = 0.92 + 0.07 * order;
      speciesWindMul = 1.04;
      speciesRandMul = 1.08;
      speciesVerticalBias = -0.06 + 0.04 * (1.0 - startH);
    }
    const bend = gravity.clone().multiplyScalar((0.10 + 0.12 * order) * speciesGravityMul)
      .add(windDir.clone().multiplyScalar(0.18 * windStrength * speciesWindMul))
      .add(new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(0.12 * speciesRandMul));

    const dir = startDir.clone().add(bend).add(new THREE.Vector3(0, speciesVerticalBias, 0)).normalize();

    const p0 = startPos.clone();

    // Optional limb breakage: truncates limb and adds a jagged cap
    let broken = false;
    let localLen = length;
    if (breakProbability > 0.0 && age01 > 0.9 && order <= Math.max(2, maxOrder - 1)) {
      const oBias = 0.35 + 0.35 * (order / Math.max(1, maxOrder));
      if (rng() < breakProbability * oBias) {
        broken = true;
        const cut = 0.35 + (0.55 * (1.0 - breakSeverity)) * (0.55 + 0.45 * rng());
        localLen *= cut;
      }
    }

    let p3 = p0.clone().add(dir.clone().multiplyScalar(localLen));
    let p1 = p0.clone().add(dir.clone().multiplyScalar(localLen * 0.33));
    let p2 = p3.clone().sub(dir.clone().multiplyScalar(localLen * 0.33));

    if (speciesEnvelopeStrength > 0.001) {
      p1.copy(clampPointToSpeciesEnvelope(p1, 0.5));
      p2.copy(clampPointToSpeciesEnvelope(p2, 0.72));
      p3.copy(clampPointToSpeciesEnvelope(p3, 1.0));
      localLen = p0.distanceTo(p3);
      if (localLen < 0.09) return null;
    }

    const parentNodeId = Math.max(0, windProfile.nodeId | 0);
    const entryNormal = Array.isArray(windProfile.unionNormal)
      ? new THREE.Vector3(windProfile.unionNormal[0] ?? 0, windProfile.unionNormal[1] ?? 0, windProfile.unionNormal[2] ?? 0).normalize()
      : null;
    const parentRadiusHint = Math.max(0.0, windProfile.parentRadiusHint ?? 0.0);
    const autoParentRad = (order === 1 && depth === 0)
      ? trunkRadiusAtY(p0.y)
      : Math.max(radius * 1.6, radius / Math.max(0.2, radiusDecay));
    const parentRad = parentRadiusHint > 0.0 ? Math.max(autoParentRad * 0.7, parentRadiusHint) : autoParentRad;
    const branchNode = createSkeletonNode(parentNodeId, p0, p3, order, radius, 'branch', windProfile.parentInfluence);
    const branchWind = {
      ...windProfile,
      nodeId: branchNode.id,
      parentNodeId,
      orderNorm: clamp01((order - 1) / Math.max(1, maxOrder - 1)),
      unionNormal: entryNormal ? [entryNormal.x, entryNormal.y, entryNormal.z] : null,
      parentRadiusHint: parentRad,
    };

    // add a lateral curve component
    const { right, forward } = tangentFrame(dir);
    const curve = right.clone().multiplyScalar((rng() - 0.5) * localLen * 0.25)
      .add(forward.clone().multiplyScalar((rng() - 0.5) * localLen * 0.25));
    p2.add(curve.multiplyScalar(0.6));

    // Branch gesture knot: concentrates a bend into a specific section of the limb
    if (branchKnotStrength > 0.0) {
      const bumpPos = 0.22 + rng() * 0.56; // along normalized limb length
      const bumpAng = rng() * Math.PI * 2;
      const bumpDir = right.clone().multiplyScalar(Math.cos(bumpAng)).add(forward.clone().multiplyScalar(Math.sin(bumpAng))).normalize();
      const bumpAmt = branchKnotStrength * localLen * (0.16 + 0.22 * rng()) * (1.0 - 0.10 * order);

      const w1 = Math.exp(-0.5 * Math.pow((0.33 - bumpPos) / Math.max(0.0001, branchKnotWidth), 2));
      const w2 = Math.exp(-0.5 * Math.pow((0.66 - bumpPos) / Math.max(0.0001, branchKnotWidth), 2));

      p1.add(bumpDir.clone().multiplyScalar(bumpAmt * w1));
      p2.add(bumpDir.clone().multiplyScalar(bumpAmt * w2));
    }

    if (speciesEnvelopeStrength > 0.001) {
      p1.copy(clampPointToSpeciesEnvelope(p1, 0.56));
      p2.copy(clampPointToSpeciesEnvelope(p2, 0.78));
      p3.copy(clampPointToSpeciesEnvelope(p3, 1.0));
    }

    // Metaball-ish junction blob at the attachment point
    addJunctionBlob(p0, dir, parentRad, radius, order, branchWind);

    const rad1 = radius * (0.55 + 0.25 * (1 - order / maxOrder));
    const out = addBezierBranchTube(p0, p1, p2, p3, radius, rad1, order, branchWind);
    out.nodeId = branchNode.id;

    if (broken) {
      addBrokenTipCap(out.tip, out.tipTan, rad1 * (0.9 + 0.2 * rng()), branchWind);
      return out;
    }

    // Leaves near tips for higher orders
    if (order >= Math.max(2, maxOrder - 2)) {
      addLeafCluster(out.tip, out.tipTan, rad1, order, {
        ...branchWind,
        parentInfluence: clamp01(branchWind.parentInfluence + 0.08),
        leafiness: 1.0,
      });
    }

    // Child branches
    let childBudget = order <= 2 ? 2 : (order <= 4 ? 1 : 0);
    if (isConifer) childBudget = isSpruce
      ? (order <= 2 ? 4 : (order <= 3 ? 2 : (order <= 4 ? 1 : 0)))
      : (order <= 2 ? 3 : (order <= 3 ? 2 : (order <= 4 ? 1 : 0)));
    if (isWillow) childBudget = order <= 2 ? 3 : (order <= 4 ? 2 : 1);
    if (isBirch) childBudget = order <= 2 ? 1 : (order <= 4 ? 1 : 0);
    if (isAcacia) childBudget = order <= 2 ? 2 : (order <= 4 ? 2 : 1);
    const childJitter = isConifer ? (isSpruce ? 0.9 : 1.15) : isWillow ? 1.85 : isBirch ? 1.0 : isAcacia ? 1.3 : 1.5;
    const childCount = Math.max(0, Math.round(childBudget + rng() * childJitter));
    const whorlMode = isConifer && order <= 2 && childCount >= 2;
    const whorlPhase = fract(branchWind.branchHash * 1.37 + depth * 0.21) * Math.PI * 2;
    const whorlStep = (Math.PI * 2) / Math.max(2, childCount);
    for (let i = 0; i < childCount; i++) {
      const speciesProbMul = isConifer ? (isSpruce ? 1.02 : 0.95) : isWillow ? 1.08 : isBirch ? 0.92 : isAcacia ? 1.12 : 1.0;
      if (rng() > Math.min(1.0, branchProb * speciesProbMul)) continue;

      let tAttach = 0.25 + rng() * 0.55;
      if (isConifer) {
        const slot = (i + Math.floor(depth * 0.5)) / Math.max(1, childCount - 1);
        const baseT = isSpruce ? 0.18 : 0.24;
        const spanT = isSpruce ? 0.68 : 0.62;
        tAttach = Math.max(0.14, Math.min(0.92, baseT + slot * spanT + (rng() - 0.5) * 0.08));
      } else if (isWillow) {
        tAttach = 0.42 + rng() * 0.5;
      } else if (isBirch) {
        tAttach = 0.28 + rng() * 0.44;
      } else if (isAcacia) {
        tAttach = 0.46 + rng() * 0.46;
      }

      const attachPos = bezierPos(p0, p1, p2, p3, tAttach);
      const attachTan = bezierTan(p0, p1, p2, p3, tAttach);
      const { right: rB, forward: fB } = tangentFrame(attachTan);
      const az = whorlMode ? (whorlPhase + i * whorlStep + (rng() - 0.5) * 0.16) : phylloAz(azIndex++);
      const side = rB.clone().multiplyScalar(Math.cos(az)).add(fB.clone().multiplyScalar(Math.sin(az))).normalize();

      let tilt = angleMean + (rng() - 0.5) * angleVar * 2;
      if (isConifer) {
        const crown01 = clamp01(attachPos.y / Math.max(0.001, height));
        if (isSpruce) {
          tilt = THREE.MathUtils.lerp(angleMean * 0.82, angleMean * 1.55, crown01) + (rng() - 0.5) * angleVar * 0.95;
        } else {
          tilt = THREE.MathUtils.lerp(angleMean * 0.9, angleMean * 1.38, crown01) + (rng() - 0.5) * angleVar * 1.25;
        }
      } else if (isWillow) {
        tilt = angleMean * 1.22 + (rng() - 0.5) * angleVar * 1.55;
      } else if (isBirch) {
        tilt = angleMean * 0.86 + (rng() - 0.5) * angleVar * 0.8;
      } else if (isAcacia) {
        tilt = angleMean * 1.28 + (rng() - 0.5) * angleVar * 1.32;
      }

      let childDir = attachTan.clone().multiplyScalar(Math.cos(tilt)).add(side.multiplyScalar(Math.sin(tilt)));
      // phototropism: bias toward sun hemisphere
      childDir.add(sunDir.clone().multiplyScalar(isWillow ? 0.12 : isConifer ? (isSpruce ? 0.24 : 0.28) : isAcacia ? 0.16 : 0.22));
      if (isConifer) {
        const crown01 = clamp01(attachPos.y / Math.max(0.001, height));
        if (isSpruce) {
          childDir.y -= 0.14 + crown01 * 0.26;
          childDir.add(attachTan.clone().multiplyScalar(0.04));
        } else {
          childDir.y -= 0.08 + crown01 * 0.2;
          childDir.add(attachTan.clone().multiplyScalar(0.08));
        }
      } else if (isWillow) {
        childDir.y -= 0.24 + 0.42 * tAttach + 0.06 * order;
        childDir.add(gravity.clone().multiplyScalar(0.2 + 0.35 * tAttach));
      } else if (isBirch) {
        childDir.y += 0.12 + 0.12 * (1.0 - tAttach);
      } else if (isAcacia) {
        childDir.y -= 0.05 + 0.16 * tAttach;
        childDir.add(new THREE.Vector3(0, 0.06, 0));
      }
      childDir.normalize();

      let childLen = localLen * lengthDecay * (0.75 + rng() * 0.5);
      let childRad = radius * radiusDecay * (0.75 + rng() * 0.25);
      if (isConifer) {
        const crown01 = clamp01(attachPos.y / Math.max(0.001, height));
        if (isSpruce) {
          childLen *= (1.08 - 0.84 * crown01) * (0.94 + 0.08 * Math.cos(i * whorlStep));
          childRad *= (0.88 - 0.28 * crown01);
        } else {
          childLen *= (1.18 - 0.76 * crown01) * (0.92 + 0.12 * Math.cos(i * whorlStep));
          childRad *= (0.9 - 0.22 * crown01);
        }
      } else if (isWillow) {
        childLen *= 1.02 + 0.48 * tAttach;
        childRad *= 0.84 - 0.14 * tAttach;
      } else if (isBirch) {
        childLen *= 0.78 + 0.28 * (1.0 - tAttach);
        childRad *= 0.74 + 0.14 * (1.0 - tAttach);
      } else if (isAcacia) {
        childLen *= 1.14 + 0.42 * tAttach;
        childRad *= 0.88 - 0.1 * tAttach;
      }
      childLen = Math.max(0.16, childLen);
      childRad = Math.max(0.0035, childRad);

      let parentAttachRad = Math.max(childRad * 1.25, radius * (0.58 + 0.35 * (1.0 - tAttach)));
      if (isConifer) parentAttachRad *= isSpruce ? 1.08 : 1.06;
      if (isWillow) parentAttachRad *= 0.92;
      if (isBirch) parentAttachRad *= 0.88;
      if (isAcacia) parentAttachRad *= 0.96;

      const childHash = fract(branchWind.branchHash * 0.73 + 0.17 + rng() * 0.61);
      const childWind = makeWindProfile(
        order + 1,
        childHash,
        branchWind.branchHash,
        0.58 + 0.22 * (1.0 - tAttach),
        0.0,
        branchNode.id,
        parentNodeId,
        side.clone().normalize(),
        parentAttachRad
      );
      generateBranch(attachPos, childDir, childLen, childRad, order + 1, depth + 1, childWind);
    }

    // Birch spur shoots: short lateral twigs near tips
    if (isBirch && order >= 2 && order <= Math.max(2, maxOrder - 1) && leafRep !== 'MASS_ONLY') {
      const spurChance = 0.55 + 0.1 * (1.0 - order / Math.max(1, maxOrder));
      if (rng() < spurChance) {
        const spurCount = 1 + (rng() < 0.6 ? 1 : 0) + (rng() < 0.24 ? 1 : 0);
        const tipFrame = tangentFrame(out.tipTan);
        for (let s = 0; s < spurCount; s++) {
          const az = (s / Math.max(1, spurCount)) * Math.PI * 2 + rng() * 0.55;
          const spurSide = tipFrame.right.clone().multiplyScalar(Math.cos(az)).add(tipFrame.forward.clone().multiplyScalar(Math.sin(az))).normalize();
          const spurDir = out.tipTan.clone().multiplyScalar(0.42).add(spurSide.clone().multiplyScalar(0.84)).add(new THREE.Vector3(0, 0.22, 0)).normalize();
          const spurLen = Math.max(0.06, localLen * (0.11 + 0.07 * rng()));
          const spurR0 = Math.max(0.0026, rad1 * (0.18 + 0.08 * rng()));
          const spurR1 = spurR0 * (0.54 + 0.12 * rng());
          const spurStart = out.tip.clone();
          const spurEnd = spurStart.clone().add(spurDir.clone().multiplyScalar(spurLen));
          const spurNode = createSkeletonNode(branchNode.id, spurStart, spurEnd, Math.min(maxOrder, order + 1), spurR0, 'twig', 0.68);
          const spurWind = makeWindProfile(
            Math.min(maxOrder, order + 1),
            fract(branchWind.branchHash * 0.83 + s * 0.19 + rng() * 0.41),
            branchWind.branchHash,
            clamp01(branchWind.parentInfluence + 0.14),
            0.0,
            spurNode.id,
            branchNode.id,
            spurSide,
            spurR0 * 1.55
          );
          const q0 = spurStart.clone();
          const q3 = spurEnd.clone();
          const q1 = q0.clone().lerp(q3, 0.34).add(new THREE.Vector3((rng() - 0.5) * spurLen * 0.2, (rng() - 0.5) * spurLen * 0.1, (rng() - 0.5) * spurLen * 0.2));
          const q2 = q0.clone().lerp(q3, 0.68).add(new THREE.Vector3((rng() - 0.5) * spurLen * 0.22, (rng() - 0.5) * spurLen * 0.12, (rng() - 0.5) * spurLen * 0.22));
          addBezierBranchTube(q0, q1, q2, q3, spurR0, spurR1, Math.min(maxOrder, order + 1), spurWind);
          addLeafCluster(q3, spurDir, spurR1, Math.min(maxOrder, order + 1), { ...spurWind, leafiness: 1.0 });
        }
      }
    }

    // Apical continuation (same order) to create longer limbs
    const apicalChance = isConifer
      ? Math.min(1.0, apicalDom * (isSpruce ? 1.28 : 1.2))
      : isWillow
        ? apicalDom * 0.72
        : isBirch
          ? Math.min(1.0, apicalDom * 1.08)
          : isAcacia
            ? apicalDom * 0.64
          : apicalDom;
    if (rng() < apicalChance && order < maxOrder) {
      const jitterAmp = isConifer ? (isSpruce ? 0.1 : 0.12) : isWillow ? 0.24 : isBirch ? 0.11 : isAcacia ? 0.2 : 0.18;
      const jitter = new THREE.Vector3(rng() - 0.5, rng() - 0.5, rng() - 0.5).multiplyScalar(jitterAmp);
      const contDir = dir.clone().add(jitter).add(sunDir.clone().multiplyScalar(isWillow ? 0.06 : 0.1));
      if (isConifer) contDir.y += isSpruce ? 0.22 : 0.18;
      if (isWillow) contDir.y -= 0.16 + 0.07 * order;
      if (isBirch) contDir.y += 0.12;
      if (isAcacia) contDir.y -= 0.08 + 0.04 * order;
      contDir.normalize();

      const contHash = fract(branchWind.branchHash * 0.89 + 0.09 + rng() * 0.31);
      const contWind = makeWindProfile(
        order,
        contHash,
        branchWind.parentHash,
        clamp01(branchWind.parentInfluence + 0.06),
        0.0,
        branchNode.id,
        parentNodeId,
        null,
        Math.max(radius * 1.05, parentRad * 0.56)
      );
      let contLen = localLen * (0.78 + rng() * 0.12);
      let contRad = radius * (0.86 + rng() * 0.06);
      if (isConifer) {
        if (isSpruce) {
          contLen *= 0.88;
          contRad *= 0.94;
        } else {
          contLen *= 0.92;
          contRad *= 0.96;
        }
      } else if (isWillow) {
        contLen *= 0.88;
        contRad *= 0.9;
      } else if (isBirch) {
        contLen *= 0.95;
        contRad *= 0.92;
      } else if (isAcacia) {
        contLen *= 0.82;
        contRad *= 0.88;
      }
      generateBranch(p3, contDir, contLen, contRad, order, depth + 1, contWind);
    }

    return out;
  };


  // Spawn main branches from trunk
  const crownCenter = speciesEnvelopeCenter.clone();

  const scaffoldTips: Array<{ pos: THREE.Vector3; nodeId: number }> = [];
  for (let i = 0; i < mainBranchCount; i++) {
    let t = 0.25 + (i / mainBranchCount) * 0.55 + (rng() - 0.5) * 0.06;
    if (isConifer) {
      const tier = i / Math.max(1, mainBranchCount - 1);
      if (isSpruce) {
        t = 0.14 + tier * 0.7 + (rng() - 0.5) * 0.04;
      } else {
        t = 0.18 + tier * 0.62 + (rng() - 0.5) * 0.045;
      }
    } else if (isWillow) {
      t = 0.22 + (i / Math.max(1, mainBranchCount)) * 0.5 + (rng() - 0.5) * 0.07;
    } else if (isBirch) {
      t = 0.3 + (i / Math.max(1, mainBranchCount)) * 0.48 + (rng() - 0.5) * 0.05;
    } else if (isAcacia) {
      t = 0.34 + (i / Math.max(1, mainBranchCount)) * 0.44 + (rng() - 0.5) * 0.055;
    }
    t = clamp01(t);
    const y = t * trunkTopY;
    const r = baseRadius * Math.pow(1 - t, taperExponent);
    const az = phylloAz(azIndex++);
    const attachLeanX = trunkLeanMag * t * t;
    const attachLeanZ = -trunkLeanMag * 0.6 * t * t;
    const startPos = new THREE.Vector3(Math.cos(az) * r + attachLeanX, y, Math.sin(az) * r + attachLeanZ);
    const tilt = angleMean + (rng() - 0.5) * angleVar * 2;
    const dir = new THREE.Vector3(Math.cos(az) * Math.sin(tilt), Math.cos(tilt), Math.sin(az) * Math.sin(tilt));
    const hNorm = clamp01(y / Math.max(0.001, trunkTopY));
    if (isConifer) dir.y -= (isSpruce ? 0.14 : 0.08) + hNorm * (isSpruce ? 0.3 : 0.22);
    if (isWillow) dir.y -= 0.16 + hNorm * 0.28;
    if (isBirch) dir.y += 0.14 * (1.0 - hNorm);
    if (isAcacia) dir.y -= 0.08 + hNorm * 0.12;
    dir.normalize();
    let len = height * branchLengthRatio * (0.8 + rng() * 0.4) * (0.75 + 0.35 * age01);
    let rad = baseRadius * Math.pow(1 - t, taperExponent) * 0.32 * (0.8 + 0.25 * age01);
    if (isConifer) {
      if (isSpruce) {
        len *= 1.14 - 0.84 * hNorm;
        rad *= 0.9 - 0.28 * hNorm;
      } else {
        len *= 1.22 - 0.78 * hNorm;
        rad *= 0.95 - 0.22 * hNorm;
      }
    } else if (isWillow) {
      len *= 1.08 + 0.26 * hNorm;
      rad *= 0.84;
    } else if (isBirch) {
      len *= 0.78 + 0.34 * (1.0 - hNorm);
      rad *= 0.72 + 0.16 * (1.0 - hNorm);
    } else if (isAcacia) {
      len *= 1.22 + 0.35 * hNorm;
      rad *= 0.82 + 0.1 * (1.0 - hNorm);
    }
    len = Math.max(0.2, len);
    rad = Math.max(0.006, rad);
    const trunkOutNormal = new THREE.Vector3(Math.cos(az), 0, Math.sin(az)).normalize();
    const mainWind = makeWindProfile(
      1,
      fract(trunkHash * 0.61 + i * 0.17 + rng() * 0.37),
      trunkHash,
      0.42,
      0.0,
      trunkNodeId,
      trunkNodeId,
      trunkOutNormal,
      trunkRadiusAtY(y)
    );
    const tip = generateBranch(startPos, dir, len, rad, 1, 0, mainWind);
    if (tip?.tip) scaffoldTips.push({ pos: tip.tip, nodeId: tip.nodeId ?? trunkNodeId });
  }

  // Continue the trunk as a dominant leader so the crown doesn't feel abruptly cut off.
  const leaderDir = new THREE.Vector3(
    sunDir.x * 0.22 + trunkLeanTopX * 0.35 + (rng() - 0.5) * 0.08,
    1.0,
    sunDir.z * 0.22 + trunkLeanTopZ * 0.35 + (rng() - 0.5) * 0.08
  );
  if (isConifer) {
    leaderDir.y += isSpruce ? 0.4 : 0.32;
    leaderDir.x *= isSpruce ? 0.76 : 0.82;
    leaderDir.z *= isSpruce ? 0.76 : 0.82;
  } else if (isWillow) {
    leaderDir.y -= 0.16;
    leaderDir.x *= 1.08;
    leaderDir.z *= 1.08;
  } else if (isBirch) {
    leaderDir.y += 0.2;
    leaderDir.x *= 0.9;
    leaderDir.z *= 0.9;
  } else if (isAcacia) {
    leaderDir.y -= 0.1;
    leaderDir.x *= 1.06;
    leaderDir.z *= 1.06;
  }
  leaderDir.normalize();
  const leaderUnionNormal = new THREE.Vector3(leaderDir.x, 0, leaderDir.z).normalize();
  let leaderLen = height * (0.20 + 0.18 * apicalDom) * (0.85 + 0.3 * age01);
  let leaderRad = trunkRadiusAtY(trunkTopY) * (0.95 + 0.20 * apicalDom);
  if (isConifer) {
    leaderLen *= isSpruce ? 1.34 : 1.24;
    leaderRad *= isSpruce ? 0.92 : 0.95;
  } else if (isWillow) {
    leaderLen *= 0.86;
    leaderRad *= 0.92;
  } else if (isBirch) {
    leaderLen *= 1.08;
    leaderRad *= 0.9;
  } else if (isAcacia) {
    leaderLen *= 0.8;
    leaderRad *= 0.88;
  }
  const leaderWind = makeWindProfile(
    1,
    fract(trunkHash * 0.47 + 0.21),
    trunkHash,
    0.34,
    0.0,
    trunkNodeId,
    trunkNodeId,
    leaderUnionNormal.lengthSq() > 1e-6 ? leaderUnionNormal : new THREE.Vector3(1, 0, 0),
    trunkRadiusAtY(trunkTopY)
  );
  const leaderTip = generateBranch(trunkTop.clone(), leaderDir, leaderLen, leaderRad, 1, 1, leaderWind);
  if (leaderTip?.tip) scaffoldTips.push({ pos: leaderTip.tip, nodeId: leaderTip.nodeId ?? trunkNodeId });

  // Optional twig fill (SPACE_COLONIZATION or HYBRID)
  const doColonize = (branchModel === 'SPACE_COLONIZATION' || branchModel === 'HYBRID');
  if (doColonize) {
    const attractorCount = Math.round(getP('vegetation.branching.attractorCount', 'attractorCount', 220) * (0.7 + 0.6 * age01));
    const influence = getP('vegetation.branching.influenceRadius_m', 'influenceRadius_m', height * 0.18);
    const kill = getP('vegetation.branching.killRadius_m', 'killRadius_m', height * 0.04);
    const step = getP('vegetation.branching.step_m', 'step_m', height * 0.03);
    const maxIter = Math.round(getP('vegetation.branching.maxIterations', 'maxIterations', 18));

    const crownR = height * getP('vegetation.crown.crownRadiusRatio', 'crownRadiusRatio', 0.42);
    const radii = new THREE.Vector3(crownR * 1.05, crownR * 0.75, crownR * 1.05);
    if (isSpruce) radii.set(crownR * 0.72, crownR * 1.2, crownR * 0.72);
    if (isAcacia) radii.set(crownR * 1.58, crownR * 0.36, crownR * 1.58);

    // Attractors inside ellipsoid shell
    const attractors = [];
    let guard = 0;
    while (attractors.length < attractorCount && guard++ < attractorCount * 8) {
      const x = (rng() * 2 - 1) * radii.x;
      let y = (rng() * 2 - 1) * radii.y;
      const z = (rng() * 2 - 1) * radii.z;
      if (isSpruce) y *= 0.88 + 0.12 * rng();
      if (isAcacia) y = y * 0.45 + radii.y * 0.35;
      const q = (x*x)/(radii.x*radii.x) + (y*y)/(radii.y*radii.y) + (z*z)/(radii.z*radii.z);
      if (q > 1) continue;
      // bias toward shell
      const shell = isSpruce ? (0.68 + rng() * 0.32) : isAcacia ? (0.72 + rng() * 0.28) : (0.55 + rng() * 0.45);
      const p = new THREE.Vector3(x * shell, y * shell, z * shell).add(crownCenter);
      if (isAcacia) p.y = Math.max(p.y, trunkTopY + height * 0.1);
      attractors.push(p);
    }

    // Start tips: scaffold endpoints (or trunk top if none)
    let tips: Array<{ pos: THREE.Vector3; nodeId: number }> = (scaffoldTips.length ? scaffoldTips : [{ pos: trunkTop.clone(), nodeId: trunkNodeId }]);
    for (let iter = 0; iter < maxIter && attractors.length; iter++) {
      // assign attractors to nearest tip
      const assigns = new Array(tips.length);
      for (let i = 0; i < tips.length; i++) assigns[i] = [];

      // brute force is fine at preview scale
      for (let a = attractors.length - 1; a >= 0; a--) {
        const A = attractors[a];
        let bestI = -1;
        let bestD2 = Infinity;
        for (let i = 0; i < tips.length; i++) {
          const d2 = tips[i].pos.distanceToSquared(A);
          if (d2 < bestD2) { bestD2 = d2; bestI = i; }
        }
        if (bestI === -1) continue;
        const d = Math.sqrt(bestD2);
        if (d < kill) {
          attractors.splice(a, 1);
          continue;
        }
        if (d < influence) {
          assigns[bestI].push(A);
        }
      }

      const newTips = [];
      for (let i = 0; i < tips.length; i++) {
        const list = assigns[i];
        if (!list.length) continue;
        const tipEntry = tips[i];
        const tip = tipEntry.pos;

        const dir = new THREE.Vector3();
        for (const A of list) dir.add(A.clone().sub(tip).normalize());
        dir.normalize().add(sunDir.clone().multiplyScalar(0.12)).normalize();

        const next = tip.clone().add(dir.multiplyScalar(step));
        // draw a thin twig segment
        const twigR0 = baseRadius * 0.02 * (0.9 + 0.3 * rng());
        const twigR1 = twigR0 * 0.65;
        const twigParentId = Math.max(0, tipEntry.nodeId | 0);
        const twigNode = createSkeletonNode(twigParentId, tip, next, maxOrder, twigR0, 'twig', 0.74);
        const twigWind = makeWindProfile(
          maxOrder,
          fract(trunkHash * 0.31 + iter * 0.13 + i * 0.17 + rng() * 0.41),
          trunkHash,
          0.74,
          0.0,
          twigNode.id,
          twigParentId,
          next.clone().sub(tip).normalize(),
          twigR0 * 1.65
        );

        const p0 = tip.clone();
        const p3 = next.clone();
        const p1 = p0.clone().lerp(p3, 0.33);
        const p2 = p0.clone().lerp(p3, 0.66).add(new THREE.Vector3((rng()-0.5)*step*0.25, (rng()-0.5)*step*0.15, (rng()-0.5)*step*0.25));

        addBezierBranchTube(p0, p1, p2, p3, twigR0, twigR1, maxOrder, twigWind);

        // light foliage at twig tips
        if (leafRep !== 'MASS_ONLY' && (iter > maxIter * 0.4)) {
          addLeafCluster(p3, p3.clone().sub(p0).normalize(), twigR1, maxOrder, { ...twigWind, leafiness: 1.0 });
        }

        newTips.push({ pos: next, nodeId: twigNode.id });
      }

      tips = tips.concat(newTips).slice(-Math.min(900, 60 + iter * 80));
    }
  }
  // Generate root system (base-aware, oriented, buttress-aligned)
  const rootCount = Math.max(0, Math.round(getP('rootCount', 'vegetation.roots.rootCount', 5)));
  const moisture01 = Math.max(0.0, Math.min(1.0, moisture));
  const dry01 = 1.0 - moisture01;
  const rootStyle = getP('vegetation.roots.style', 'rootStyle', 'SURFACE_SPREAD');
  const rootVisibility = Math.max(0.0, Math.min(1.0, getP('vegetation.roots.visibility', 'rootVisibility', 0.4)));
  const rootShoulderLength = Math.max(0.0, Math.min(0.45, getP('vegetation.roots.shoulderLength', 'rootShoulderLength', 0.22)));
  const rootShoulderRadiusMul = Math.max(0.8, Math.min(2.2, getP('vegetation.roots.shoulderRadiusMul', 'rootShoulderRadiusMul', 1.3)));

  if (rootCount > 0 && rootVisibility > 0.001) {
    const buttressAlign = (-buttressPhase / Math.max(1, buttressCount));

    for (let r = 0; r < rootCount; r++) {
      const rootAngle = (r / rootCount) * Math.PI * 2 + buttressAlign + (rng() - 0.5) * (0.18 + 0.32 * moisture01);
      const dir2 = new THREE.Vector3(Math.cos(rootAngle), 0, Math.sin(rootAngle));
      const side2 = new THREE.Vector3(-dir2.z, 0, dir2.x);
      const rootHash = fract(trunkHash * 0.53 + r * 0.23 + rng() * 0.41);

      const rootLen = (1.0 + rng() * 1.6) * (0.65 + 0.6 * rootVisibility) * (0.85 + 0.25 * Math.min(1.5, age01)) * (0.85 + 0.35 * dry01);
      const rootDepth = (0.28 + rng() * 0.55) * (0.8 + 0.4 * rootVisibility) * (0.75 + 0.75 * dry01);
      const rootRad0 = baseRadius * (0.30 + rng() * 0.24) * (0.75 + 0.45 * rootVisibility);

      const rootSegs = 7;
      const rootRings = 10;
      const rootIdx = vertices.length / 3;
      const rootBasePos = new THREE.Vector3(dir2.x * baseRadius * 0.68, -0.02, dir2.z * baseRadius * 0.68);
      const rootEndEst = new THREE.Vector3(dir2.x * (baseRadius + rootLen), -rootDepth * 0.75, dir2.z * (baseRadius + rootLen));
      const rootNode = createSkeletonNode(trunkNodeId, rootBasePos, rootEndEst, 1, rootRad0, 'root', 0.84);

      const wPhase = rng() * Math.PI * 2;
      const wFreq = 1.6 + rng() * 2.4;
      const wAmp = (0.05 + 0.08 * rng()) * rootLen * rootVisibility;

      const crownLift = (rootStyle === 'BUTTRESS' ? 0.10 : 0.03) * (0.6 + 0.4 * rootVisibility);
      const rootAttach = baseRadius * (0.34 + 0.22 * rootVisibility + rootShoulderLength * 0.18);
      const rootWind = makeWindProfile(
        1,
        rootHash,
        trunkHash,
        0.84,
        0.0,
        rootNode.id,
        trunkNodeId,
        dir2,
        baseRadius * (1.18 + 0.35 * rootVisibility)
      );

      // Blend root shoulders into the trunk base to avoid hard root cuts.
      addJunctionBlob(
        rootBasePos,
        dir2.clone().multiplyScalar(0.85).add(new THREE.Vector3(0, -0.25, 0)).normalize(),
        baseRadius * (1.15 + 0.35 * rootVisibility),
        rootRad0 * 1.15,
        1,
        rootWind
      );

      if (rootShoulderLength > 0.001) {
        const shoulderLen = Math.min(rootLen * 0.32, baseRadius * (0.28 + rootShoulderLength * 1.45));
        const shoulderDrop = rootDepth * (0.02 + 0.14 * rootShoulderLength);
        const s0 = rootBasePos.clone();
        const s3 = rootBasePos.clone().add(dir2.clone().multiplyScalar(shoulderLen)).add(new THREE.Vector3(0, -shoulderDrop, 0));
        const s1 = s0.clone().lerp(s3, 0.33).add(new THREE.Vector3(0, -shoulderDrop * 0.2, 0));
        const s2 = s0.clone().lerp(s3, 0.66).add(new THREE.Vector3(0, -shoulderDrop * 0.45, 0));
        const shoulderWind = makeWindProfile(
          1,
          fract(rootHash * 0.81 + 0.13),
          trunkHash,
          0.84,
          0.0,
          rootNode.id,
          trunkNodeId,
          dir2,
          baseRadius * (1.22 + 0.4 * rootVisibility)
        );
        const shoulderR0 = rootRad0 * rootShoulderRadiusMul * (0.92 + 0.36 * rootVisibility);
        const shoulderR1 = rootRad0 * (0.92 + 0.18 * rootVisibility);
        addBezierBranchTube(s0, s1, s2, s3, shoulderR0, shoulderR1, 1, shoulderWind);
      }

      const centerAt = (t) => {
        const out = rootAttach + rootLen * t;
        const wiggle = Math.sin(wPhase + t * wFreq * Math.PI * 2) * wAmp * t;
        const down = -rootDepth * Math.pow(t, 1.45) - (1.0 - t) * rootAttach * 0.16;
        const lift = crownLift * Math.sin(Math.min(1.0, t) * Math.PI) * (1.0 - t) * (rootStyle === 'SURFACE_SPREAD' ? 1.0 : 1.35);
        return dir2.clone().multiplyScalar(out).add(side2.clone().multiplyScalar(wiggle)).add(new THREE.Vector3(0, down + lift, 0));
      };

      for (let ring = 0; ring <= rootRings; ring++) {
        const t = ring / rootRings;
        const center = centerAt(t);
        const prev = centerAt(Math.max(0, t - 1 / rootRings));
        const next = centerAt(Math.min(1, t + 1 / rootRings));
        const tan = next.clone().sub(prev).normalize();
        const { right, forward } = tangentFrame(tan);

        // Roots: slightly flattened cross-section (more believable under soil)
        const shoulder = Math.exp(-Math.pow(t / 0.16, 2.0));
        const rad = rootRad0 * (1.0 - 0.78 * Math.pow(t, 0.85)) * (1.0 + 0.32 * shoulder);
        const radY = rad * (0.45 + 0.18 * rootVisibility);

        for (let s = 0; s <= rootSegs; s++) {
          const ang = (s / rootSegs) * Math.PI * 2;
          const off = right.clone().multiplyScalar(Math.cos(ang) * rad).add(forward.clone().multiplyScalar(Math.sin(ang) * radY));
          const vtx = center.clone().add(off);

          vertices.push(vtx.x, vtx.y, vtx.z);
          const nn = off.clone().normalize();
          normals.push(nn.x, nn.y, nn.z);

          const rootVar = 0.70 + rng() * 0.28;
          colors.push(trunkColor.r * rootVar, trunkColor.g * rootVar, trunkColor.b * rootVar);
          pushWindMeta(0.03, 0.04, rootHash, 0.985, trunkHash, 0.0, 0.88, 0.0, 1);
          pushBranchBinding(rootNode.id, trunkNodeId, t, 0.88, 1);
        }
      }

      for (let ring = 0; ring < rootRings; ring++) {
        for (let s = 0; s < rootSegs; s++) {
          const a = rootIdx + ring * (rootSegs + 1) + s;
          const b = a + rootSegs + 1;
          indices.push(a, b, a + 1);
          indices.push(a + 1, b, b + 1);
        }
      }
    }
  }

  const vertCount = vertices.length / 3;
  const expectedMetaLen = vertCount * 4;
  if (windData.length !== expectedMetaLen || windData2.length !== expectedMetaLen || branchBinding.length !== expectedMetaLen) {
    windData.length = 0;
    windData2.length = 0;
    branchBinding.length = 0;
    const trunkRadiusNorm = Math.max(0.02, baseRadius * 1.8);
    for (let i = 0; i < vertCount; i++) {
      const x = vertices[i * 3 + 0];
      const y = vertices[i * 3 + 1];
      const z = vertices[i * 3 + 2];
      const r = colors[i * 3 + 0];
      const g = colors[i * 3 + 1];
      const h = clamp01(y / Math.max(0.001, height));
      const leafMask = smoothstepRange(0.05, 0.22, g - r);
      const radial = Math.sqrt(x * x + z * z);
      const branchReach = smoothstepRange(baseRadius * 0.75, trunkRadiusNorm, radial);
      const hierarchy = clamp01(Math.max(leafMask, h * 0.88, branchReach * 0.7));
      const tipWeight = clamp01(Math.pow(h, 1.2) * (0.4 + 0.6 * branchReach) + leafMask * 0.35);
      const rigidityBase = clamp01(0.94 - hierarchy * 0.62 - leafMask * 0.26);
      const rigidity = (y < -0.03) ? 0.98 : Math.max(0.08, rigidityBase);
      const hash = fract(Math.sin((x + seed * 0.0007) * 12.9898 + (y + 0.41) * 78.233 + (z - 0.17) * 37.719) * 43758.5453123);
      const parentInfluence = clamp01((1.0 - hierarchy) * 0.65 + h * 0.2);

      windData.push(
        (y < -0.03) ? hierarchy * 0.18 : hierarchy,
        (y < -0.03) ? tipWeight * 0.22 : tipWeight,
        hash,
        rigidity
      );
      windData2.push(hash, clamp01(h), parentInfluence, leafMask);
      branchBinding.push(trunkNodeId, trunkNodeId, h, parentInfluence);
    }
  }

  const indexArray = (vertCount > 65535) ? new Uint32Array(indices) : new Uint16Array(indices);

  return {
    vertices: new Float32Array(vertices),
    normals: new Float32Array(normals),
    colors: new Float32Array(colors),
    windData: new Float32Array(windData),
    windData2: new Float32Array(windData2),
    branchBinding: new Float32Array(branchBinding),
    indices: indexArray,
    skeleton: {
      nodes: skeletonNodes,
      count: skeletonNodes.length,
    },
    meta: { height, vertCount },
  };
}

export default function Tree3DPreview({ params, seed = 1337, isPlaying = false, groundLayer = 'simple', className = '', showOverlay = true }) {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const meshRef = useRef(null);
  const playingRef = useRef(isPlaying);
  const paramsRef = useRef(params);
  const [lodLevel, setLodLevel] = useState('near');
  const lodRef = useRef('near');
  const windRuntimeRef = useRef({
    time: 0,
    gust: 0,
    gustEnvelope: 0,
    gustEnvelopeTarget: 0,
    gustVel: 0,
    gustPulse: 0,
    gustTimer: 0,
    dirAngle: Math.atan2(-0.3, 1.0),
    dirTarget: Math.atan2(-0.3, 1.0),
    dirTimer: 0,
  });
  const branchWindTexRef = useRef<THREE.DataTexture | null>(null);
  const windDebugLinesRef = useRef<THREE.LineSegments | null>(null);
  const contactShadowRef = useRef<THREE.Mesh | null>(null);
  const branchWindSolverRef = useRef<{
    nodeCount: number;
    texWidth: number;
    texHeight: number;
    data: Float32Array;
    disp: Float32Array;
    vel: Float32Array;
    nodes: Array<{
      id: number;
      parentId: number;
      order: number;
      radius: number;
      length: number;
      dir: [number, number, number];
      start: [number, number, number];
      end: [number, number, number];
      center: [number, number, number];
      area: number;
      mass: number;
      hash: number;
      stiffness: number;
      damping: number;
      parentInfluence: number;
      kind: string;
    }>;
  } | null>(null);

  const groundLayerRef = useRef(groundLayer);
  const shadersRef = useRef<Awaited<ReturnType<typeof loadQuickGrassShaders>> | null>(null);
  const grassGroupRef = useRef<THREE.Group | null>(null);
  const grassUpdateRef = useRef<((dt: number, cam: THREE.Camera) => void) | null>(null);
  const grassDisposeRef = useRef<(() => void) | null>(null);
  const addGrassRef = useRef<(() => void) | null>(null);
  const removeGrassRef = useRef<(() => void) | null>(null);

  const { setGroundLayer, viewportSettings } = useProVegLayout();
  const viewportSettingsRef = useRef(viewportSettings);
  const lightsRef = useRef<{
    ambient: THREE.AmbientLight;
    mainLight: THREE.DirectionalLight;
    fillLight: THREE.DirectionalLight;
    hemi: THREE.HemisphereLight;
  } | null>(null);
  viewportSettingsRef.current = viewportSettings;

  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useEffect(() => {
    playingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    groundLayerRef.current = groundLayer;
    if (groundLayer === 'quick-grass') {
      addGrassRef.current?.();
    } else {
      removeGrassRef.current?.();
    }
  }, [groundLayer]);

  // Apply viewport/lighting settings to scene when they change
  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const lights = lightsRef.current;
    if (!scene || !renderer || !lights) return;
    const vp = viewportSettings;
    scene.background = new THREE.Color(vp.backgroundColor);
    if (scene.fog instanceof THREE.Fog) {
      scene.fog.color.set(vp.backgroundColor);
    }
    renderer.toneMappingExposure = vp.exposure;
    renderer.shadowMap.enabled = vp.enableShadows;
    lights.ambient.color.set(vp.ambientLightColor);
    lights.ambient.intensity = vp.ambientLightIntensity;
    lights.mainLight.color.set(vp.mainLightColor);
    lights.mainLight.intensity = vp.mainLightIntensity;
    lights.mainLight.position.set(vp.mainLightPosition[0], vp.mainLightPosition[1], vp.mainLightPosition[2]);
    lights.mainLight.castShadow = vp.enableShadows;
    lights.fillLight.color.set(vp.fillLightColor);
    lights.fillLight.intensity = vp.fillLightIntensity;
    lights.fillLight.position.set(vp.fillLightPosition[0], vp.fillLightPosition[1], vp.fillLightPosition[2]);
    lights.hemi.color.set(vp.hemiSkyColor);
    lights.hemi.groundColor.set(vp.hemiGroundColor);
    lights.hemi.intensity = vp.hemiIntensity;
  }, [viewportSettings]);

  // Wait for container to have non-zero size (avoids NaN aspect / blank canvas)
  const [containerReady, setContainerReady] = useState(false);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const check = () => {
      if (container.clientWidth > 0 && container.clientHeight > 0) setContainerReady(true);
    };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(container);
    return () => ro.disconnect();
  }, []);

  // Initialize Three.js scene
  useEffect(() => {
    if (!containerReady) return;
    const container = containerRef.current;
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (w < 1 || h < 1) return;

    const vp = viewportSettingsRef.current;
    // Scene (ShapeForge-style; background from viewport settings)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(vp.backgroundColor);
    scene.fog = new THREE.Fog(vp.backgroundColor, 16, 82);
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(50, w / h, 0.01, 1000);
    camera.position.set(8, 6, 10);
    camera.lookAt(0, 2.5, 0);
    cameraRef.current = camera;

    // Renderer â€” ShapeForge-style: tone mapping, color space, shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.physicallyCorrectLights = true;
    renderer.toneMappingExposure = vp.exposure;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.shadowMap.autoUpdate = true;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControls â€” rotate, pan, zoom (no auto-rotate). ShapeForge/Viewport pattern.
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 2.5, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 0.5;
    controls.maxDistance = 80;
    controlsRef.current = controls;

    // Lighting â€” driven by viewport settings (ShapeForge ViewportEnvironment-style)
    const ambient = new THREE.AmbientLight(vp.ambientLightColor, vp.ambientLightIntensity);
    scene.add(ambient);

    const mainLight = new THREE.DirectionalLight(vp.mainLightColor, vp.mainLightIntensity);
    mainLight.position.set(vp.mainLightPosition[0], vp.mainLightPosition[1], vp.mainLightPosition[2]);
    mainLight.target.position.set(0, 2.3, 0);
    mainLight.castShadow = vp.enableShadows;
    mainLight.shadow.mapSize.width = 3072;
    mainLight.shadow.mapSize.height = 3072;
    mainLight.shadow.camera.near = 0.5;
    mainLight.shadow.camera.far = 80;
    mainLight.shadow.camera.left = -20;
    mainLight.shadow.camera.right = 20;
    mainLight.shadow.camera.top = 20;
    mainLight.shadow.camera.bottom = -20;
    mainLight.shadow.bias = -0.00008;
    mainLight.shadow.normalBias = 0.03;
    mainLight.shadow.radius = 2.2;
    scene.add(mainLight);
    scene.add(mainLight.target);

    const fillLight = new THREE.DirectionalLight(vp.fillLightColor, vp.fillLightIntensity);
    fillLight.position.set(vp.fillLightPosition[0], vp.fillLightPosition[1], vp.fillLightPosition[2]);
    fillLight.target.position.set(0, 2.0, 0);
    scene.add(fillLight);
    scene.add(fillLight.target);

    const hemi = new THREE.HemisphereLight(vp.hemiSkyColor, vp.hemiGroundColor, vp.hemiIntensity);
    scene.add(hemi);

    lightsRef.current = { ambient, mainLight, fillLight, hemi };

    // Ground â€” receive shadows (kept under grass when Quick Grass is active)
    const groundGeo = new THREE.PlaneGeometry(220, 220, 1, 1);
    const groundTexture = new THREE.TextureLoader().load(resolveAssetUrl('textures/grass.png'));
    groundTexture.wrapS = groundTexture.wrapT = THREE.RepeatWrapping;
    groundTexture.repeat.set(26, 26);
    groundTexture.colorSpace = THREE.SRGBColorSpace;
    groundTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const groundMat = new THREE.MeshStandardMaterial({
      map: groundTexture,
      color: 0x607247,
      roughness: 0.93,
      metalness: 0.0,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.015;
    ground.receiveShadow = true;
    scene.add(ground);

    // Contact shadow: cheap, stable grounding under the tree.
    const contactShadowCanvas = document.createElement('canvas');
    contactShadowCanvas.width = 256;
    contactShadowCanvas.height = 256;
    const contactCtx = contactShadowCanvas.getContext('2d');
    if (contactCtx) {
      const grad = contactCtx.createRadialGradient(128, 128, 18, 128, 128, 118);
      grad.addColorStop(0, 'rgba(0, 0, 0, 0.68)');
      grad.addColorStop(0.55, 'rgba(0, 0, 0, 0.34)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      contactCtx.fillStyle = grad;
      contactCtx.fillRect(0, 0, 256, 256);
    }
    const contactShadowTex = new THREE.CanvasTexture(contactShadowCanvas);
    contactShadowTex.wrapS = THREE.ClampToEdgeWrapping;
    contactShadowTex.wrapT = THREE.ClampToEdgeWrapping;
    contactShadowTex.colorSpace = THREE.SRGBColorSpace;
    const contactShadowGeo = new THREE.PlaneGeometry(1, 1, 1, 1);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: contactShadowTex,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      toneMapped: false,
      blending: THREE.NormalBlending,
      side: THREE.DoubleSide,
    });
    const contactShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    contactShadow.rotation.x = -Math.PI / 2;
    contactShadow.position.y = -0.012;
    contactShadow.renderOrder = 1;
    scene.add(contactShadow);
    contactShadowRef.current = contactShadow;

    // Quick Grass ground layer (Ghost of Tsushimaâ€“style) â€” load and add when groundLayer is quick-grass
    loadQuickGrassShaders()
      .then((shaders) => {
        shadersRef.current = shaders;
        addGrassRef.current = () => {
          const scene = sceneRef.current;
          const camera = cameraRef.current;
          const sh = shadersRef.current;
          if (!scene || !camera || !sh || grassGroupRef.current) return;
          const { group, update, dispose } = createQuickGrassGround(scene, camera, sh);
          grassGroupRef.current = group;
          grassUpdateRef.current = update;
          grassDisposeRef.current = dispose;
        };
        removeGrassRef.current = () => {
          grassDisposeRef.current?.();
          grassGroupRef.current = null;
          grassUpdateRef.current = null;
          grassDisposeRef.current = null;
        };
        if (groundLayerRef.current === 'quick-grass') addGrassRef.current();
      })
      .catch((err) => console.warn('Quick Grass shaders failed to load:', err));

    // Resize handler
    const onResize = () => {
      if (!containerRef.current || !cameraRef.current || !rendererRef.current) return;
      const c = containerRef.current;
      const width = c.clientWidth;
      const height = c.clientHeight;
      if (width < 1 || height < 1) return;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', onResize);

    let lastTime = performance.now() * 0.001;
    const runtimeSunDir = new THREE.Vector3(0.35, 0.82, 0.2).normalize();
    // Animation loop â€” no auto-rotate; controls.update() drives camera
    const animate = () => {
      requestAnimationFrame(animate);
      const t = performance.now() * 0.001;
      const delta = t - lastTime;
      lastTime = t;
      controls.update();

        grassUpdateRef.current?.(delta, camera);

      // LOD switching (distance-based)
      const p = paramsRef.current || params;
      const nearR = (p['vegetation.lod.distance.nearRadius_m'] ?? 4);
      const midR  = (p['vegetation.lod.distance.midRadius_m'] ?? 8);
      const farR  = (p['vegetation.lod.distance.farRadius_m'] ?? 15);
      const d = camera.position.distanceTo(controls.target);
      const nextLod = (d < nearR) ? 'near' : (d < midR) ? 'mid' : (d < farR) ? 'far' : 'ultra';
      if (lodRef.current !== nextLod) {
        lodRef.current = nextLod;
        setLodLevel(nextLod);
      }

      // Environment-driven lighting/shadow rig
      const lights = lightsRef.current;
      const shadowBlob = contactShadowRef.current;
      if (lights) {
        const vpNow = viewportSettingsRef.current;
        const timeOfDay = Math.max(0, Math.min(1, (p['vegetation.env.timeOfDay'] ?? p.timeOfDay ?? 0.45) as number));
        const autoSunRaw = p['vegetation.env.autoSun'] ?? p.autoSun ?? true;
        const autoSun = (typeof autoSunRaw === 'boolean') ? autoSunRaw : autoSunRaw === 1;
        const autoSunInfluence = Math.max(0, Math.min(1, (p['vegetation.env.autoSunInfluence'] ?? p.autoSunInfluence ?? 0.82) as number));
        const atmosphereStrength = Math.max(0, Math.min(1, (p['vegetation.env.atmosphereStrength'] ?? p.atmosphereStrength ?? 0.45) as number));
        const contactShadowStrength = Math.max(0, Math.min(1, (p['vegetation.env.contactShadowStrength'] ?? p.contactShadowStrength ?? 0.62) as number));
        const contactShadowRadius = Math.max(0.4, Math.min(5.0, (p['vegetation.env.contactShadowRadius_m'] ?? p.contactShadowRadius_m ?? 1.65) as number));
        const shadowSoftness = Math.max(0, Math.min(1, (p['vegetation.env.shadowSoftness'] ?? p.shadowSoftness ?? 0.55) as number));
        const rigMix = autoSun ? autoSunInfluence : 0.0;

        const dayPhase = timeOfDay * Math.PI * 2;
        const sunElev = Math.max(-0.18, Math.min(1.0, Math.sin(dayPhase) * 0.9));
        const daylight = THREE.MathUtils.clamp((sunElev + 0.12) / 0.92, 0, 1);
        const azimuth = dayPhase - Math.PI * 0.38;
        const horiz = Math.sqrt(Math.max(1e-5, 1.0 - Math.min(0.99, sunElev * sunElev)));
        const autoSunDir = new THREE.Vector3(Math.cos(azimuth) * horiz, sunElev, Math.sin(azimuth) * horiz).normalize();
        const autoMainPos = autoSunDir.clone().multiplyScalar(18.0 + daylight * 8.0);
        const manualMainPos = new THREE.Vector3(vpNow.mainLightPosition[0], vpNow.mainLightPosition[1], vpNow.mainLightPosition[2]);
        const finalMainPos = manualMainPos.clone().lerp(autoMainPos, rigMix);
        lights.mainLight.position.copy(finalMainPos);
        lights.mainLight.target.position.copy(controls.target);
        lights.fillLight.target.position.copy(controls.target);
        runtimeSunDir.copy(controls.target).sub(finalMainPos).normalize();

        const warmness = Math.pow(1.0 - daylight, 1.45);
        const autoSunColor = new THREE.Color().setRGB(
          1.0,
          0.82 + daylight * 0.16 - warmness * 0.08,
          0.66 + daylight * 0.32 - warmness * 0.18
        );
        const autoFillColor = new THREE.Color().setRGB(
          0.50 + daylight * 0.22,
          0.58 + daylight * 0.24,
          0.82 + daylight * 0.16
        );
        const autoAmbientColor = new THREE.Color().setRGB(
          0.46 + daylight * 0.34,
          0.5 + daylight * 0.32,
          0.62 + daylight * 0.26
        );
        const mainManualColor = new THREE.Color(vpNow.mainLightColor);
        const fillManualColor = new THREE.Color(vpNow.fillLightColor);
        const ambientManualColor = new THREE.Color(vpNow.ambientLightColor);
        const hemiSkyManualColor = new THREE.Color(vpNow.hemiSkyColor);
        const hemiGroundManualColor = new THREE.Color(vpNow.hemiGroundColor);

        lights.mainLight.color.copy(mainManualColor.lerp(autoSunColor, rigMix * 0.95));
        lights.fillLight.color.copy(fillManualColor.lerp(autoFillColor, rigMix * 0.85));
        lights.ambient.color.copy(ambientManualColor.lerp(autoAmbientColor, rigMix * 0.7));

        const autoMainIntensity = 0.18 + daylight * 1.45;
        const autoFillIntensity = 0.08 + daylight * 0.33 + (1.0 - daylight) * 0.05;
        const autoAmbientIntensity = 0.1 + daylight * 0.42;
        const autoHemiIntensity = 0.12 + daylight * 0.5;
        lights.mainLight.intensity = THREE.MathUtils.lerp(vpNow.mainLightIntensity, autoMainIntensity, rigMix);
        lights.fillLight.intensity = THREE.MathUtils.lerp(vpNow.fillLightIntensity, autoFillIntensity, rigMix);
        lights.ambient.intensity = THREE.MathUtils.lerp(vpNow.ambientLightIntensity, autoAmbientIntensity, rigMix);
        lights.hemi.intensity = THREE.MathUtils.lerp(vpNow.hemiIntensity, autoHemiIntensity, rigMix * 0.8);

        const autoHemiSky = new THREE.Color().setRGB(
          0.26 + daylight * 0.44,
          0.36 + daylight * 0.38,
          0.52 + daylight * 0.34
        );
        const autoHemiGround = new THREE.Color().setRGB(
          0.11 + daylight * 0.13,
          0.09 + daylight * 0.15,
          0.08 + daylight * 0.12
        );
        lights.hemi.color.copy(hemiSkyManualColor.lerp(autoHemiSky, rigMix * 0.78));
        lights.hemi.groundColor.copy(hemiGroundManualColor.lerp(autoHemiGround, rigMix * 0.78));

        // Stabilize and tighten shadow camera around target for better depth precision.
        const shadowCam = lights.mainLight.shadow.camera as THREE.OrthographicCamera;
        const camDist = camera.position.distanceTo(controls.target);
        const shadowSpan = THREE.MathUtils.clamp(10 + camDist * 0.65 + (1 - daylight) * 3.0, 10, 30);
        shadowCam.left = -shadowSpan;
        shadowCam.right = shadowSpan;
        shadowCam.top = shadowSpan;
        shadowCam.bottom = -shadowSpan;
        shadowCam.near = 0.4;
        shadowCam.far = 96;
        shadowCam.updateProjectionMatrix();
        lights.mainLight.shadow.radius = 0.7 + shadowSoftness * 3.2;
        lights.mainLight.shadow.normalBias = 0.015 + shadowSoftness * 0.03;
        lights.mainLight.shadow.bias = -0.00004 - shadowSoftness * 0.00009;

        if (scene) {
          const manualBg = new THREE.Color(vpNow.backgroundColor);
          const autoBg = new THREE.Color().setRGB(
            0.07 + daylight * 0.45,
            0.11 + daylight * 0.47,
            0.16 + daylight * 0.53
          );
          const finalBg = manualBg.lerp(autoBg, rigMix * atmosphereStrength);
          scene.background = finalBg;
          if (scene.fog instanceof THREE.Fog) {
            const autoFog = new THREE.Color().setRGB(
              0.09 + daylight * 0.39,
              0.12 + daylight * 0.41,
              0.15 + daylight * 0.44
            );
            scene.fog.color.copy(new THREE.Color(vpNow.backgroundColor).lerp(autoFog, rigMix * atmosphereStrength * 0.9));
          }
        }

        if (shadowBlob && shadowBlob.material instanceof THREE.MeshBasicMaterial) {
          const daylightShadow = rigMix > 0.001 ? (0.45 + daylight * 0.55) : 1.0;
          const contactOpacity = contactShadowStrength * (vpNow.enableShadows ? 1 : 0) * daylightShadow;
          shadowBlob.material.opacity = contactOpacity;
          shadowBlob.position.set(controls.target.x, -0.012, controls.target.z);
          const stretch = 1.0 + (1.0 - daylight) * 1.4;
          shadowBlob.scale.set(contactShadowRadius * 2.0 * stretch, contactShadowRadius * 2.0, 1);
          shadowBlob.rotation.y = Math.atan2(runtimeSunDir.z, runtimeSunDir.x);
        }
      }

      // GPU wind: update shader uniforms
      if (meshRef.current) {
        const mat = meshRef.current.material;
        const shader = mat?.userData?.shader;
        const base = mat?.userData?.windBase;
        if (shader && base) {
          const wr = windRuntimeRef.current;
          const gustVariance = Math.max(0.0, base.gustVariance ?? 0.7);
          const gustEnvelope = Math.max(0.0, Math.min(1.5, base.gustEnvelope ?? 0.58));
          const motionDamping = Math.max(0.2, base.motionDamping ?? 1.0);
          const vortexStrength = Math.max(0.0, base.vortexStrength ?? 0.55);
          if (playingRef.current) {
            wr.time += delta * (0.55 + base.gustFrequency * 1.45);
            wr.gustTimer -= delta;
            if (wr.gustTimer <= 0) {
              wr.gustTimer = 0.18 + Math.random() * (1.2 / (0.35 + gustVariance * 1.25));
              wr.gustPulse = (Math.random() * 2 - 1) * (0.25 + gustVariance * 1.2);
              wr.gustEnvelopeTarget = Math.min(1.5, 0.35 + Math.random() * (0.45 + gustVariance * 0.65));
            }
            const gustKick = Math.sin(wr.time * (0.34 + base.gustFrequency * 0.42) + base.phase * 0.71)
              + Math.sin(wr.time * (0.16 + base.gustFrequency * 0.2) + base.phase * 1.93) * 0.7;
            const gustPulseWave = wr.gustPulse * Math.sin(wr.time * (1.9 + gustVariance * 2.4) + base.phase * 0.9);
            const envelopeInput = Math.min(1.5, Math.abs(wr.gustPulse) * (0.4 + gustVariance * 0.5) + Math.abs(gustKick) * 0.22 + wr.gustEnvelopeTarget);
            const envLerp = 1 - Math.exp(-delta * (0.8 + gustEnvelope * 3.2));
            wr.gustEnvelope = THREE.MathUtils.lerp(wr.gustEnvelope, envelopeInput, envLerp);
            wr.gustEnvelopeTarget *= Math.max(0, 1 - delta * (0.9 + gustEnvelope * 1.2));
            wr.gustPulse *= Math.max(0, 1 - delta * (2.4 + gustVariance * 2.8));
            wr.gustVel += (gustKick * 0.16 + gustPulseWave * 0.42 + (Math.random() - 0.5) * (0.14 + gustVariance * 0.24))
              * delta * (0.45 + base.turbulence * 1.3) * (0.55 + wr.gustEnvelope * 0.7);
            wr.gustVel *= Math.max(0, 1 - delta * (0.95 + motionDamping * 0.85));
            wr.gust = THREE.MathUtils.clamp(wr.gust + wr.gustVel * (0.62 + wr.gustEnvelope * 0.48), -1, 1);

            wr.dirTimer -= delta;
            if (wr.dirTimer <= 0) {
              wr.dirTimer = 0.22 + Math.random() * (0.95 + base.directionVariance * 1.95);
              const steer = (Math.random() - 0.5) * (0.18 + base.directionVariance * 1.45 + vortexStrength * 0.45 + wr.gustEnvelope * 0.25);
              wr.dirTarget += steer + wr.gust * 0.24 * gustVariance;
            }
            const dirNoise = Math.sin(wr.time * (0.42 + vortexStrength * 0.9) + base.phase * 0.31)
              * (0.05 + base.directionVariance * 0.24 + vortexStrength * 0.16 + wr.gustEnvelope * 0.1);
            const dirLerp = 1 - Math.exp(-delta * (1.2 + base.directionVariance * 2.5 + gustVariance * 0.8));
            wr.dirAngle = THREE.MathUtils.lerp(wr.dirAngle, wr.dirTarget + dirNoise, dirLerp);
          } else {
            wr.time += delta * 0.12;
            wr.gust *= Math.max(0, 1 - delta * 2.1);
            wr.gustVel *= Math.max(0, 1 - delta * 2.1);
            wr.gustPulse *= Math.max(0, 1 - delta * 3.5);
            wr.gustEnvelope *= Math.max(0, 1 - delta * (1.2 + gustEnvelope * 1.3));
            wr.gustEnvelopeTarget *= Math.max(0, 1 - delta * 2.2);
          }

          const gustState = THREE.MathUtils.clamp(0.5 + 0.5 * wr.gust, 0, 1);
          const gustEnvelopeState = THREE.MathUtils.clamp((base.gustEnvelope ?? 0.58) * (0.35 + wr.gustEnvelope * 0.85), 0, 2.0);

          shader.uniforms.uTime.value = wr.time;
          shader.uniforms.uGustState.value = gustState;
          shader.uniforms.uGustEnvelope.value = gustEnvelopeState;
          shader.uniforms.uWindDir.value.set(Math.cos(wr.dirAngle), Math.sin(wr.dirAngle));
          shader.uniforms.uWindStrength.value = playingRef.current ? base.windStrength : 0.0;
          shader.uniforms.uTrunkBend.value = base.trunkBend;
          shader.uniforms.uBranchBend.value = base.branchBend;
          shader.uniforms.uBranchTorsion.value = base.branchTorsion;
          shader.uniforms.uTwigBend.value = base.twigBend;
          shader.uniforms.uCanopyShear.value = base.canopyShear;
          shader.uniforms.uLeafFlutter.value = base.leafFlutter;
          shader.uniforms.uDirectionVariance.value = base.directionVariance;
          shader.uniforms.uTurbulence.value = base.turbulence;
          shader.uniforms.uHierarchyBias.value = base.hierarchyBias;
          shader.uniforms.uTreeHeight.value = base.treeHeight;
          shader.uniforms.uPhase.value = base.phase;
          shader.uniforms.uBranchWindTex.value = base.branchWindTex;
          shader.uniforms.uBranchWindTexSize.value.copy(base.branchWindTexSize);
          shader.uniforms.uBranchNodeCount.value = base.branchNodeCount;
          shader.uniforms.uBranchDynScale.value = base.solverInfluence;
          shader.uniforms.uNearFieldAOStrength.value = base.nearFieldAOStrength;
          shader.uniforms.uCanopySelfShadow.value = base.canopySelfShadow;
          shader.uniforms.uSunDirWS.value.copy(runtimeSunDir);
          shader.uniforms.uBarkAnisotropy.value = base.barkAnisotropy;
          shader.uniforms.uBarkMicroDetail.value = base.barkMicroDetail;
          shader.uniforms.uBarkCurvatureDetail.value = base.barkCurvatureDetail;

          const solver = branchWindSolverRef.current;
          if (solver && solver.nodeCount > 0) {
            const dtSafe = Math.max(0.001, Math.min(0.04, delta));
            const gustN = 0.5 + 0.5 * wr.gust;
            const activeStrength = playingRef.current ? base.windStrength : 0.0;
            const windDirX = Math.cos(wr.dirAngle);
            const windDirZ = Math.sin(wr.dirAngle);
            const sideX = -windDirZ;
            const sideZ = windDirX;
            const motionInertia = Math.max(0.2, base.motionInertia ?? 0.95);
            const springResponse = Math.max(0.2, base.springResponse ?? 1.0);
            const solverDamping = Math.max(0.2, base.motionDamping ?? 1.0);
            const parentCoupling = Math.max(0.0, Math.min(1.0, base.parentCoupling ?? 0.78));
            const solverLeafMicro = Math.max(0.0, base.leafMicroTurbulence ?? 0.6);
            const solverVortex = Math.max(0.0, base.vortexStrength ?? 0.55);
            const solverOrderDrag = Math.max(0.0, Math.min(1.5, base.orderDrag ?? 0.68));
            const solverBranchTorsion = Math.max(0.0, Math.min(1.5, base.branchTorsion ?? 0.32));
            const orderDenom = Math.max(1, (base.maxOrder ?? 5) - 1);
            const gustEnvN = Math.max(0.0, Math.min(1.5, wr.gustEnvelope));

            for (let i = 0; i < solver.nodeCount; i++) {
              const node = solver.nodes[i];
              const id3 = i * 3;
              const orderNorm = Math.max(0, Math.min(1, ((node?.order ?? 0) - 1) / orderDenom));
              const parent = (node?.parentId ?? -1);
              const parent3 = parent >= 0 ? parent * 3 : -1;
              const parentDx = parent3 >= 0 ? solver.disp[parent3 + 0] : 0;
              const parentDy = parent3 >= 0 ? solver.disp[parent3 + 1] : 0;
              const parentDz = parent3 >= 0 ? solver.disp[parent3 + 2] : 0;
              const parentVx = parent3 >= 0 ? solver.vel[parent3 + 0] : 0;
              const parentVy = parent3 >= 0 ? solver.vel[parent3 + 1] : 0;
              const parentVz = parent3 >= 0 ? solver.vel[parent3 + 2] : 0;
              const inherit = Math.max(0, Math.min(1, (node?.parentInfluence ?? 0.55) * parentCoupling));

              const targetX = parentDx * inherit;
              const targetY = parentDy * inherit;
              const targetZ = parentDz * inherit;

              const hash = node?.hash ?? 0;
              const phase = wr.time * (0.55 + orderNorm * 1.9) + hash * 6.2831853;
              const macro = Math.sin(phase);
              const fine = Math.sin(phase * 1.73 + 1.2);
              const eddy = Math.sin(phase * (2.15 + base.turbulence * 1.2 + solverVortex * 1.6) + (i % 7) * 0.41);
              const dirJit = (Math.sin(phase * 0.9 + hash * 4.0) * 0.5 + 0.5) * (base.directionVariance + solverVortex * 0.2);

              const kind = String(node?.kind ?? 'branch');
              const kindMul = kind === 'trunk' ? 0.45 : kind === 'root' ? 0.18 : kind === 'leaf' ? 1.1 : 0.82;
              const length = Math.max(0.001, node?.length ?? 0.5);
              const radius = Math.max(0.001, node?.radius ?? 0.01);
              const area = Math.max(0.012, node?.area ?? radius * length);
              const mass = Math.max(0.12, node?.mass ?? (0.45 + radius * 3.0) * length);
              const stiffness = Math.max(0.05, Math.min(1, node?.stiffness ?? 0.5));
              const damping = Math.max(0.05, Math.min(1, node?.damping ?? 0.5));
              const axis = node?.dir ?? [0, 1, 0];
              const axisX = axis[0] ?? 0;
              const axisY = axis[1] ?? 1;
              const axisZ = axis[2] ?? 0;

              let localWindX = windDirX * (1.0 - dirJit) + sideX * dirJit;
              let localWindY = (kind === 'leaf' ? 0.2 : 0.07) * fine;
              let localWindZ = windDirZ * (1.0 - dirJit) + sideZ * dirJit;
              localWindX += sideX * solverVortex * 0.35 * eddy + axisZ * (wr.gust * gustVariance * 0.15);
              localWindZ += sideZ * solverVortex * 0.35 * eddy - axisX * (wr.gust * gustVariance * 0.15);
              localWindY += solverLeafMicro * 0.22 * Math.sin(phase * (4.8 + orderNorm * 2.0) + hash * 5.3);
              const localWindLen = Math.hypot(localWindX, localWindY, localWindZ);
              if (localWindLen > 1e-6) {
                localWindX /= localWindLen;
                localWindY /= localWindLen;
                localWindZ /= localWindLen;
              }

              const axial = localWindX * axisX + localWindY * axisY + localWindZ * axisZ;
              const bendWindX = localWindX - axisX * axial;
              const bendWindY = localWindY - axisY * axial;
              const bendWindZ = localWindZ - axisZ * axial;
              const orderDragMul = 0.35 + Math.pow(orderNorm + 0.1, 0.65 + solverOrderDrag * 1.25) * (0.65 + solverOrderDrag * 0.7);
              const forceAmp = activeStrength
                * kindMul
                * (0.18 + Math.min(1.45, area * 1.55))
                * (0.22 + 0.78 * gustN * (0.75 + gustEnvN * 0.45))
                * orderDragMul;
              const forceX = bendWindX * forceAmp * (0.58 * macro + 0.42 * fine) + sideX * forceAmp * base.turbulence * 0.2 * eddy;
              const forceY = bendWindY * forceAmp * (kind === 'leaf' ? 0.42 : 0.14) + solverLeafMicro * forceAmp * 0.08 * fine;
              const forceZ = bendWindZ * forceAmp * (0.58 * macro + 0.42 * fine) + sideZ * forceAmp * base.turbulence * 0.2 * eddy;

              let swirlX = axisY * windDirZ;
              let swirlY = axisZ * windDirX - axisX * windDirZ;
              let swirlZ = -axisY * windDirX;
              const swirlLen = Math.hypot(swirlX, swirlY, swirlZ);
              if (swirlLen > 1e-6) {
                swirlX /= swirlLen;
                swirlY /= swirlLen;
                swirlZ /= swirlLen;
              }
              const torsionWave = Math.sin(phase * (1.35 + solverBranchTorsion * 1.8) + wr.time * (1.45 + orderNorm * 2.15));
              const torsionAmp = activeStrength * solverBranchTorsion * (0.08 + 0.45 * orderNorm) * (0.4 + 0.6 * gustN) * (kind === 'trunk' ? 0.42 : kind === 'root' ? 0.12 : 1.0);
              const forceTX = swirlX * torsionAmp * torsionWave;
              const forceTY = swirlY * torsionAmp * torsionWave * 0.68;
              const forceTZ = swirlZ * torsionAmp * torsionWave;

              const k = (3.0 + stiffness * 8.0) * springResponse;
              const c = (1.5 + damping * 4.5) * solverDamping;
              const inertia = 1.0 / Math.max(0.22, motionInertia * 0.65 + mass * 0.24);
              let vx = solver.vel[id3 + 0] + ((targetX + forceX + forceTX - solver.disp[id3 + 0]) * k - (solver.vel[id3 + 0] - parentVx * inherit) * c) * dtSafe * inertia;
              let vy = solver.vel[id3 + 1] + ((targetY + forceY + forceTY - solver.disp[id3 + 1]) * k - (solver.vel[id3 + 1] - parentVy * inherit) * c) * dtSafe * inertia;
              let vz = solver.vel[id3 + 2] + ((targetZ + forceZ + forceTZ - solver.disp[id3 + 2]) * k - (solver.vel[id3 + 2] - parentVz * inherit) * c) * dtSafe * inertia;
              const orderDragVel = 1.0 + solverOrderDrag * (0.2 + 1.1 * orderNorm * orderNorm);
              const velDrag = Math.max(0, 1 - dtSafe * (0.32 + solverDamping * 0.58) * orderDragVel);
              vx *= velDrag;
              vy *= velDrag;
              vz *= velDrag;

              let dx = solver.disp[id3 + 0] + vx * dtSafe;
              let dy = solver.disp[id3 + 1] + vy * dtSafe;
              let dz = solver.disp[id3 + 2] + vz * dtSafe;

              const maxDisp = length * (0.06 + activeStrength * 0.42) * (kind === 'trunk' ? 0.55 : kind === 'root' ? 0.2 : 1.0);
              const mag = Math.sqrt(dx * dx + dy * dy + dz * dz);
              if (mag > maxDisp && mag > 1e-5) {
                const s = maxDisp / mag;
                dx *= s;
                dy *= s;
                dz *= s;
                vx *= s;
                vy *= s;
                vz *= s;
              }

              solver.vel[id3 + 0] = vx;
              solver.vel[id3 + 1] = vy;
              solver.vel[id3 + 2] = vz;
              solver.disp[id3 + 0] = dx;
              solver.disp[id3 + 1] = dy;
              solver.disp[id3 + 2] = dz;

              const id4 = i * 4;
              solver.data[id4 + 0] = dx;
              solver.data[id4 + 1] = dy;
              solver.data[id4 + 2] = dz;
              solver.data[id4 + 3] = 1.0;
            }

            base.branchWindTex.needsUpdate = true;

            const debugLines = windDebugLinesRef.current;
            if (debugLines) {
              const posAttr = debugLines.geometry.getAttribute('position');
              const posArray = posAttr?.array as Float32Array | undefined;
              if (posArray) {
                let cursor = 0;
                for (let i = 0; i < solver.nodeCount && cursor + 5 < posArray.length; i++) {
                  const node = solver.nodes[i];
                  if (!node || (node.parentId ?? -1) < 0) continue;
                  const node3 = i * 3;
                  const parent3 = node.parentId * 3;
                  const startBase = node.start ?? [0, 0, 0];
                  const endBase = node.end ?? startBase;
                  const sx = startBase[0] + (parent3 >= 0 ? solver.disp[parent3 + 0] : solver.disp[node3 + 0]);
                  const sy = startBase[1] + (parent3 >= 0 ? solver.disp[parent3 + 1] : solver.disp[node3 + 1]);
                  const sz = startBase[2] + (parent3 >= 0 ? solver.disp[parent3 + 2] : solver.disp[node3 + 2]);
                  const ex = endBase[0] + solver.disp[node3 + 0];
                  const ey = endBase[1] + solver.disp[node3 + 1];
                  const ez = endBase[2] + solver.disp[node3 + 2];
                  posArray[cursor++] = sx;
                  posArray[cursor++] = sy;
                  posArray[cursor++] = sz;
                  posArray[cursor++] = ex;
                  posArray[cursor++] = ey;
                  posArray[cursor++] = ez;
                }
                while (cursor < posArray.length) {
                  posArray[cursor++] = 0;
                }
                posAttr.needsUpdate = true;
              }
            }
          }
        }
      }

      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      removeGrassRef.current?.();
      lightsRef.current = null;
      window.removeEventListener('resize', onResize);
      controls.dispose();
      controlsRef.current = null;
      groundTexture.dispose();
      groundGeo.dispose();
      groundMat.dispose();
      scene.remove(contactShadow);
      contactShadowRef.current = null;
      contactShadowTex.dispose();
      contactShadowGeo.dispose();
      contactShadowMat.dispose();
      branchWindTexRef.current?.dispose();
      branchWindTexRef.current = null;
      branchWindSolverRef.current = null;
      if (windDebugLinesRef.current) {
        scene.remove(windDebugLinesRef.current);
        windDebugLinesRef.current.geometry.dispose();
        windDebugLinesRef.current.material.dispose();
        windDebugLinesRef.current = null;
      }
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
      renderer.dispose();
    };
  }, [containerReady]);
  
  // Update tree geometry when params change
  useEffect(() => {
    if (!sceneRef.current) return;
    
    // Remove old mesh
    if (meshRef.current) {
      sceneRef.current.remove(meshRef.current);
      meshRef.current.geometry.dispose();
      meshRef.current.material.dispose();
    }
    if (windDebugLinesRef.current) {
      sceneRef.current.remove(windDebugLinesRef.current);
      windDebugLinesRef.current.geometry.dispose();
      windDebugLinesRef.current.material.dispose();
      windDebugLinesRef.current = null;
    }
    
    // Generate new geometry
    const geo = generateTreeGeometry(params, seed, { lod: lodLevel });
    
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(geo.vertices, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(geo.normals, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(geo.colors, 3));
    geometry.setAttribute('windData', new THREE.BufferAttribute(geo.windData, 4));
    geometry.setAttribute('windData2', new THREE.BufferAttribute(geo.windData2, 4));
    geometry.setAttribute('branchBinding', new THREE.BufferAttribute(geo.branchBinding, 4));
    geometry.setIndex(new THREE.BufferAttribute(geo.indices, 1));
    
    const treeHeight = geo.meta?.height ?? 8;
    const skeletonNodesGeo = Array.isArray(geo.skeleton?.nodes) ? geo.skeleton.nodes : [];
    const nodeCount = Math.max(1, skeletonNodesGeo.length);
    const texWidth = Math.max(1, Math.ceil(Math.sqrt(nodeCount)));
    const texHeight = Math.max(1, Math.ceil(nodeCount / texWidth));
    const branchWindData = new Float32Array(texWidth * texHeight * 4);
    branchWindTexRef.current?.dispose();
    const branchWindTex = new THREE.DataTexture(branchWindData, texWidth, texHeight, THREE.RGBAFormat, THREE.FloatType);
    branchWindTex.magFilter = THREE.NearestFilter;
    branchWindTex.minFilter = THREE.NearestFilter;
    branchWindTex.generateMipmaps = false;
    branchWindTex.wrapS = THREE.ClampToEdgeWrapping;
    branchWindTex.wrapT = THREE.ClampToEdgeWrapping;
    branchWindTex.flipY = false;
    branchWindTex.needsUpdate = true;
    branchWindTexRef.current = branchWindTex;
    branchWindSolverRef.current = {
      nodeCount,
      texWidth,
      texHeight,
      data: branchWindData,
      disp: new Float32Array(nodeCount * 3),
      vel: new Float32Array(nodeCount * 3),
      nodes: skeletonNodesGeo,
    };

    // Material (ShapeForge-style PBR: roughness/metalness). Wind deformation injected in vertex shader.
    const roughness = Math.max(0.0, Math.min(1.0, params?.['vegetation.trunk.barkRoughness'] ?? params?.barkRoughness ?? 0.78));
    const barkAnisotropyParam = Math.max(0.0, Math.min(1.0, params?.['vegetation.trunk.barkAnisotropy'] ?? params?.barkAnisotropy ?? 0.34));
    const barkMicroDetailParam = Math.max(0.0, Math.min(1.0, params?.['vegetation.trunk.barkMicroDetail'] ?? params?.barkMicroDetail ?? 0.44));
    const barkCurvatureDetailParam = Math.max(0.0, Math.min(1.0, params?.['vegetation.trunk.barkCurvatureDetail'] ?? params?.barkCurvatureDetail ?? 0.4));
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    const windEnabled = (params?.['vegetation.wind.enabled'] ?? params?.windEnabled ?? true) === true;
    const windStrength = Math.max(0.0, params?.['vegetation.wind.gustStrength'] ?? params?.windStrength ?? 0.6);
    const trunkBend = Math.max(0.0, params?.['vegetation.wind.trunkBend'] ?? params?.trunkBend ?? 0.02);
    const branchBend = Math.max(0.0, params?.['vegetation.wind.branchBend'] ?? params?.branchBend ?? 0.08);
    const twigBend = Math.max(0.0, params?.['vegetation.wind.twigBend'] ?? params?.twigBend ?? 0.25);
    const canopyShear = Math.max(0.0, params?.['vegetation.wind.canopyShear'] ?? params?.canopyShear ?? 0.12);
    const leafFlutter = Math.max(0.0, params?.['vegetation.wind.leafFlutter'] ?? params?.leafFlutter ?? 0.35);
    const turbulence = Math.max(0.0, params?.['vegetation.wind.turbulence'] ?? params?.windTurbulence ?? 0.5);
    const directionVariance = Math.max(0.0, params?.['vegetation.wind.directionVariance'] ?? params?.windDirectionVariance ?? 0.35);
    const gustFrequency = Math.max(0.1, params?.['vegetation.wind.gustFrequency'] ?? params?.windGustFrequency ?? 1.0);
    const hierarchyBias = Math.max(0.0, Math.min(1.5, params?.['vegetation.wind.hierarchyBias'] ?? params?.windHierarchyBias ?? 0.75));
    const motionInertia = Math.max(0.2, params?.['vegetation.wind.motionInertia'] ?? params?.windMotionInertia ?? 0.95);
    const springResponse = Math.max(0.2, params?.['vegetation.wind.springResponse'] ?? params?.windSpringResponse ?? 1.0);
    const motionDamping = Math.max(0.2, params?.['vegetation.wind.motionDamping'] ?? params?.windMotionDamping ?? 1.0);
    const parentCoupling = Math.max(0.0, Math.min(1.0, params?.['vegetation.wind.parentCoupling'] ?? params?.windParentCoupling ?? 0.78));
    const gustVariance = Math.max(0.0, params?.['vegetation.wind.gustVariance'] ?? params?.windGustVariance ?? 0.7);
    const gustEnvelope = Math.max(0.0, Math.min(1.5, params?.['vegetation.wind.gustEnvelope'] ?? params?.windGustEnvelope ?? 0.58));
    const vortexStrength = Math.max(0.0, params?.['vegetation.wind.vortexStrength'] ?? params?.windVortexStrength ?? 0.55);
    const branchTorsion = Math.max(0.0, Math.min(1.5, params?.['vegetation.wind.branchTorsion'] ?? params?.windBranchTorsion ?? 0.32));
    const orderDrag = Math.max(0.0, Math.min(1.5, params?.['vegetation.wind.orderDrag'] ?? params?.windOrderDrag ?? 0.68));
    const leafMicroTurbulence = Math.max(0.0, params?.['vegetation.wind.leafMicroTurbulence'] ?? params?.windLeafMicroTurbulence ?? 0.6);
    const solverInfluence = Math.max(0.0, params?.['vegetation.wind.solverInfluence'] ?? params?.windSolverInfluence ?? 0.85);
    const debugSkeletonRaw = params?.['vegetation.wind.debugSkeleton'] ?? params?.windDebugSkeleton ?? false;
    const debugSkeleton = (typeof debugSkeletonRaw === 'boolean') ? debugSkeletonRaw : (typeof debugSkeletonRaw === 'number' ? debugSkeletonRaw > 0.5 : false);
    const maxOrderParam = Math.max(2, Math.min(8, params?.['vegetation.branching.maxOrder'] ?? params?.maxOrder ?? 5));
    const phaseRandom = Math.max(0.0, Math.min(1.0, params?.['vegetation.wind.phaseRandom'] ?? params?.phaseRandom ?? 0.8));
    const nearFieldAOStrength = Math.max(0.0, Math.min(1.0, params?.['vegetation.env.nearFieldAOStrength'] ?? params?.nearFieldAOStrength ?? 0.36));
    const canopySelfShadow = Math.max(0.0, Math.min(1.0, params?.['vegetation.env.canopySelfShadow'] ?? params?.canopySelfShadow ?? 0.48));

    // Stable phase per-seed (with optional randomization)
    const basePhase = ((seed % 100000) / 100000) * Math.PI * 2;
    const phase = basePhase * (0.35 + 0.65 * phaseRandom);

    material.userData.windBase = {
      windStrength: windEnabled ? windStrength : 0.0,
      trunkBend,
      branchBend,
      twigBend,
      canopyShear,
      leafFlutter,
      turbulence,
      directionVariance,
      gustFrequency,
      hierarchyBias,
      motionInertia,
      springResponse,
      motionDamping,
      parentCoupling,
      gustVariance,
      gustEnvelope,
      vortexStrength,
      branchTorsion,
      orderDrag,
      leafMicroTurbulence,
      solverInfluence,
      debugSkeleton,
      treeHeight,
      phase,
      barkAnisotropy: barkAnisotropyParam,
      barkMicroDetail: barkMicroDetailParam,
      barkCurvatureDetail: barkCurvatureDetailParam,
      nearFieldAOStrength,
      canopySelfShadow,
      branchWindTex,
      branchWindTexSize: new THREE.Vector2(texWidth, texHeight),
      branchNodeCount: skeletonNodesGeo.length,
      maxOrder: maxOrderParam,
    };

    material.onBeforeCompile = (shader) => {
      shader.uniforms.uTime = { value: 0 };
      shader.uniforms.uGustState = { value: 0.5 };
      shader.uniforms.uGustEnvelope = { value: gustEnvelope };
      shader.uniforms.uWindStrength = { value: 0 };
      shader.uniforms.uTrunkBend = { value: trunkBend };
      shader.uniforms.uBranchBend = { value: branchBend };
      shader.uniforms.uBranchTorsion = { value: branchTorsion };
      shader.uniforms.uTwigBend = { value: twigBend };
      shader.uniforms.uCanopyShear = { value: canopyShear };
      shader.uniforms.uLeafFlutter = { value: leafFlutter };
      shader.uniforms.uDirectionVariance = { value: directionVariance };
      shader.uniforms.uTurbulence = { value: turbulence };
      shader.uniforms.uHierarchyBias = { value: hierarchyBias };
      shader.uniforms.uTreeHeight = { value: treeHeight };
      shader.uniforms.uPhase = { value: phase };
      shader.uniforms.uWindDir = { value: new THREE.Vector2(1.0, -0.3).normalize() };
      shader.uniforms.uBranchWindTex = { value: branchWindTex };
      shader.uniforms.uBranchWindTexSize = { value: new THREE.Vector2(texWidth, texHeight) };
      shader.uniforms.uBranchNodeCount = { value: skeletonNodesGeo.length };
      shader.uniforms.uBranchDynScale = { value: solverInfluence };
      shader.uniforms.uNearFieldAOStrength = { value: nearFieldAOStrength };
      shader.uniforms.uCanopySelfShadow = { value: canopySelfShadow };
      shader.uniforms.uSunDirWS = { value: new THREE.Vector3(0.35, 0.82, 0.2).normalize() };
      shader.uniforms.uBarkAnisotropy = { value: barkAnisotropyParam };
      shader.uniforms.uBarkMicroDetail = { value: barkMicroDetailParam };
      shader.uniforms.uBarkCurvatureDetail = { value: barkCurvatureDetailParam };

      shader.vertexShader =
        'attribute vec4 windData;\n' +
        'attribute vec4 windData2;\n' +
        'attribute vec4 branchBinding;\n' +
        'uniform float uTime;\n' +
        'uniform float uGustState;\n' +
        'uniform float uGustEnvelope;\n' +
        'uniform float uWindStrength;\n' +
        'uniform float uTrunkBend;\n' +
        'uniform float uBranchBend;\n' +
        'uniform float uBranchTorsion;\n' +
        'uniform float uTwigBend;\n' +
        'uniform float uCanopyShear;\n' +
        'uniform float uLeafFlutter;\n' +
        'uniform float uDirectionVariance;\n' +
        'uniform float uTurbulence;\n' +
        'uniform float uHierarchyBias;\n' +
        'uniform float uTreeHeight;\n' +
        'uniform float uPhase;\n' +
        'uniform vec2 uWindDir;\n' +
        'uniform sampler2D uBranchWindTex;\n' +
        'uniform vec2 uBranchWindTexSize;\n' +
        'uniform float uBranchNodeCount;\n' +
        'uniform float uBranchDynScale;\n' +
        'varying float vNearFieldAO;\n' +
        'varying float vCanopyAO;\n' +
        'varying vec3 vApproxWorldNormal;\n' +
        'varying float vBarkMask;\n' +
        'varying float vBarkGrain;\n' +
        'varying vec3 vObjPosApprox;\n' +
        shader.vertexShader;

      shader.vertexShader = shader.vertexShader.replace(
        '#include <begin_vertex>',
        [
          '#include <begin_vertex>',
          'float h = clamp(transformed.y / max(uTreeHeight, 0.001), 0.0, 1.0);',
          'float leafMask = smoothstep(0.05, 0.22, (color.g - color.r));',
          'float barkMask = smoothstep(0.05, 0.24, (color.r - color.g));',
          'vec4 wd = windData;',
          'vec4 wd2 = windData2;',
          'float hierarchy = clamp(wd.x * (0.55 + 0.45 * uHierarchyBias), 0.0, 1.0);',
          'float tipWeight = clamp(wd.y, 0.0, 1.0);',
          'float branchHash = wd.z;',
          'float parentHash = wd2.x;',
          'float orderNorm = clamp(wd2.y, 0.0, 1.0);',
          'float parentInfluence = clamp(wd2.z, 0.0, 1.0);',
          'float leafiness = clamp(max(wd2.w, leafMask), 0.0, 1.0);',
          'float phase = uPhase + branchHash * 6.2831853 + dot(position.xz, vec2(0.035, 0.051));',
          'float parentPhase = uPhase + parentHash * 6.2831853 + dot(position.xz, vec2(0.018, 0.027));',
          'float rigidity = clamp(wd.w, 0.04, 0.99);',
          'float flexibility = 1.0 - rigidity;',
          'float rootMask = smoothstep(-0.35, 0.02, transformed.y);',
          'float gust01 = clamp(uGustState, 0.0, 1.0);',
          'float gustEnv = clamp(uGustEnvelope, 0.0, 2.0);',
          'float gust = mix(0.32, 1.42, pow(gust01, 1.0 + gustEnv * 1.35));',
          'float macroWave = sin(uTime * (0.78 + orderNorm * 0.9) + parentPhase);',
          'float childWave = sin(uTime * (1.35 + hierarchy * 1.45) + phase * 1.6 + transformed.y * 0.18);',
          'float branchWave = mix(childWave, macroWave, parentInfluence);',
          'float twigWave = sin(uTime * (3.8 + hierarchy * 2.6) + phase * 3.4 + dot(position.xz, vec2(0.12, 0.09)));',
          'float torsionWave = sin(uTime * (2.1 + hierarchy * 2.4) + phase * 2.6 + transformed.y * 0.45);',
          'float eddy = sin(uTime * (2.0 + uTurbulence * 2.8 + hierarchy * 1.9) + phase * 2.2);',
          'vec3 baseDir = normalize(vec3(uWindDir.x, 0.0, uWindDir.y));',
          'vec3 parentDir = normalize(mix(baseDir, vec3(cos(parentPhase * 1.1), 0.0, sin(parentPhase * 1.4)), uDirectionVariance * 0.42));',
          'vec3 localDir = normalize(vec3(cos(phase * 1.7), 0.0, sin(phase * 1.3)));',
          'vec3 branchDir = normalize(mix(parentDir, localDir, uDirectionVariance * (0.24 + 0.76 * hierarchy)));',
          'vec3 crossDir = vec3(branchDir.z, 0.0, -branchDir.x);',
          'vec4 bind = branchBinding;',
          'vec3 nodeDyn = vec3(0.0);',
          'vec3 parentDyn = vec3(0.0);',
          'if (uBranchNodeCount > 0.5) {',
          '  float nodeId = clamp(bind.x, 0.0, max(0.0, uBranchNodeCount - 1.0));',
          '  float parentId = clamp(bind.y, 0.0, max(0.0, uBranchNodeCount - 1.0));',
          '  vec2 nodeUV = (vec2(mod(nodeId, uBranchWindTexSize.x), floor(nodeId / uBranchWindTexSize.x)) + 0.5) / uBranchWindTexSize;',
          '  vec2 parentUV = (vec2(mod(parentId, uBranchWindTexSize.x), floor(parentId / uBranchWindTexSize.x)) + 0.5) / uBranchWindTexSize;',
          '  nodeDyn = texture2D(uBranchWindTex, nodeUV).xyz;',
          '  parentDyn = texture2D(uBranchWindTex, parentUV).xyz;',
          '}',
          '',
          'float trunkInfluence = (1.0 - hierarchy) * (1.0 - leafiness);',
          'float branchInfluence = hierarchy * (1.0 - leafiness);',
          'float leafInfluence = max(leafiness, smoothstep(0.6, 1.0, hierarchy));',
          'float bindAlongAO = clamp(bind.z, 0.0, 1.0);',
          'float bindParentAO = clamp(bind.w, 0.0, 1.0);',
          'float unionOcclusion = (1.0 - bindAlongAO) * (0.35 + 0.65 * bindParentAO);',
          'vNearFieldAO = clamp((1.0 - hierarchy) * 0.24 + branchInfluence * unionOcclusion, 0.0, 1.0);',
          'float canopyCore = leafInfluence * smoothstep(0.22, 0.95, h);',
          'float canopyInterior = (1.0 - tipWeight * 0.8) * (0.45 + 0.55 * parentInfluence);',
          'vCanopyAO = clamp(canopyCore * canopyInterior, 0.0, 1.0);',
          'vApproxWorldNormal = normalize(mat3(modelMatrix) * normal);',
          'float bendProfile = pow(max(tipWeight, h), mix(1.8, 0.65, hierarchy));',
          'float trunk = uTrunkBend * uWindStrength * rootMask * gust * trunkInfluence * bendProfile * (0.65 + 0.35 * macroWave);',
          'float branch = uBranchBend * uWindStrength * rootMask * gust * branchInfluence * bendProfile * branchWave;',
          'float shear = uCanopyShear * uWindStrength * rootMask * (0.3 + 0.7 * leafInfluence) * pow(h, 1.2) * (0.55 + 0.45 * eddy);',
          'float flutter = uLeafFlutter * uWindStrength * rootMask * leafInfluence * (0.45 + 0.55 * bendProfile) * twigWave;',
          'float torsion = uBranchTorsion * uWindStrength * rootMask * flexibility * (0.2 + 0.8 * tipWeight) * (0.4 + 0.6 * gust) * torsionWave;',
          'float twig = uTwigBend * uWindStrength * rootMask * flexibility * (0.15 + 0.85 * tipWeight) * (0.5 + 0.5 * gust) * (0.4 * branchWave + 0.6 * twigWave);',
          'float turbulence = uTurbulence * uWindStrength * rootMask * flexibility * (0.5 + 0.5 * hierarchy) * eddy;',
          '',
          'transformed += baseDir * trunk;',
          'transformed += parentDir * (branch * parentInfluence * 0.65);',
          'transformed += branchDir * (branch * (1.0 - parentInfluence * 0.55) + shear + twig * 0.55);',
          'transformed += crossDir * (twig * 0.45 + turbulence * 0.25 + torsion * 0.42);',
          'transformed += vec3(0.0, 1.0, 0.0) * (flutter * 0.24 + turbulence * 0.08);',
          'float bindAlong = clamp(bind.z, 0.0, 1.0);',
          'float bindParent = clamp(bind.w, 0.0, 1.0);',
          'transformed += mix(nodeDyn, parentDyn, bindParent) * bindAlong * uBranchDynScale;',
          'vBarkMask = barkMask * (1.0 - leafMask * 0.85);',
          'vBarkGrain = abs(dot(normalize(mat3(modelMatrix) * normal), vec3(0.0, 1.0, 0.0)));',
          'vObjPosApprox = transformed;',
        ].join('\n')
      );

      shader.fragmentShader =
        'uniform float uNearFieldAOStrength;\n' +
        'uniform float uCanopySelfShadow;\n' +
        'uniform vec3 uSunDirWS;\n' +
        'uniform float uBarkAnisotropy;\n' +
        'uniform float uBarkMicroDetail;\n' +
        'uniform float uBarkCurvatureDetail;\n' +
        'varying float vNearFieldAO;\n' +
        'varying float vCanopyAO;\n' +
        'varying vec3 vApproxWorldNormal;\n' +
        'varying float vBarkMask;\n' +
        'varying float vBarkGrain;\n' +
        'varying vec3 vObjPosApprox;\n' +
        shader.fragmentShader;

      shader.fragmentShader = shader.fragmentShader.replace(
        '#include <color_fragment>',
        [
          '#include <color_fragment>',
          'vec3 sunDir = normalize(uSunDirWS);',
          'float sunBlock = 1.0 - clamp(dot(normalize(vApproxWorldNormal), sunDir), 0.0, 1.0);',
          'float nearAO = clamp(vNearFieldAO * uNearFieldAOStrength, 0.0, 0.85);',
          'float canopyAO = clamp(vCanopyAO * uCanopySelfShadow * (0.45 + 0.55 * sunBlock), 0.0, 0.9);',
          'float barkGrain = pow(1.0 - clamp(vBarkGrain, 0.0, 1.0), 1.2);',
          'float barkWave = sin(vObjPosApprox.y * (15.0 + uBarkCurvatureDetail * 18.0) + (vObjPosApprox.x + vObjPosApprox.z) * 4.2);',
          'float barkMicro = (0.5 + 0.5 * barkWave) * uBarkMicroDetail * vBarkMask;',
          'float barkAniso = vBarkMask * uBarkAnisotropy * barkGrain * (0.35 + 0.65 * sunBlock);',
          'float combinedAO = clamp(nearAO + canopyAO, 0.0, 0.92);',
          'diffuseColor.rgb *= (1.0 - combinedAO);',
          'diffuseColor.rgb *= (1.0 - barkMicro * 0.12);',
          'diffuseColor.rgb += vec3(0.018, 0.013, 0.009) * barkAniso;',
        ].join('\n')
      );

      material.userData.shader = shader;
    };
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    sceneRef.current.add(mesh);
    meshRef.current = mesh;

    if (debugSkeleton) {
      const segments = skeletonNodesGeo.filter((node) => (node?.parentId ?? -1) >= 0);
      if (segments.length > 0) {
        const linePositions = new Float32Array(segments.length * 2 * 3);
        const lineColors = new Float32Array(segments.length * 2 * 3);
        for (let i = 0; i < segments.length; i++) {
          const node = segments[i];
          const s = node.start ?? [0, 0, 0];
          const e = node.end ?? s;
          const base = i * 6;
          linePositions[base + 0] = s[0];
          linePositions[base + 1] = s[1];
          linePositions[base + 2] = s[2];
          linePositions[base + 3] = e[0];
          linePositions[base + 4] = e[1];
          linePositions[base + 5] = e[2];

          const kind = String(node.kind ?? 'branch');
          const color =
            kind === 'trunk' ? [0.95, 0.62, 0.23]
              : kind === 'root' ? [0.7, 0.5, 0.26]
                : kind === 'twig' ? [0.78, 0.9, 0.44]
                  : kind === 'leaf' ? [0.44, 1.0, 0.62]
                    : [0.4, 0.86, 1.0];
          lineColors[base + 0] = color[0];
          lineColors[base + 1] = color[1];
          lineColors[base + 2] = color[2];
          lineColors[base + 3] = color[0];
          lineColors[base + 4] = color[1];
          lineColors[base + 5] = color[2];
        }

        const debugGeo = new THREE.BufferGeometry();
        debugGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
        debugGeo.setAttribute('color', new THREE.BufferAttribute(lineColors, 3));
        const debugMat = new THREE.LineBasicMaterial({
          vertexColors: true,
          transparent: true,
          opacity: 0.78,
          depthTest: false,
          depthWrite: false,
        });
        const debugLines = new THREE.LineSegments(debugGeo, debugMat);
        debugLines.renderOrder = 999;
        sceneRef.current.add(debugLines);
        windDebugLinesRef.current = debugLines;
      }
    }
    
  }, [params, seed, lodLevel]);

  const debugSkeletonRaw = params?.['vegetation.wind.debugSkeleton'] ?? params?.windDebugSkeleton ?? false;
  const debugSkeletonEnabled = (typeof debugSkeletonRaw === 'boolean') ? debugSkeletonRaw : (typeof debugSkeletonRaw === 'number' ? debugSkeletonRaw > 0.5 : false);

  return (
    <div ref={containerRef} className={`w-full h-full ${className}`} style={{ position: 'relative' }}>
      {showOverlay && (
        <div style={{ position: 'absolute', top: 8, left: 8, padding: '4px 8px', background: 'rgba(0,0,0,0.4)', color: '#e2e8f0', fontSize: 11, borderRadius: 6, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <span>LOD: {lodLevel}</span>
          {debugSkeletonEnabled && (
            <>
              <span style={{ color: '#94a3b8', fontWeight: 400 }}>|</span>
              <span style={{ color: '#67e8f9' }}>Wind Skeleton Debug</span>
            </>
          )}
          <span style={{ color: '#94a3b8', fontWeight: 400 }}>|</span>
          <span style={{ color: '#94a3b8' }}>Drag rotate | Scroll zoom | Right-drag pan</span>
          <span style={{ color: '#94a3b8', fontWeight: 400 }}>|</span>
          <label style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ color: '#94a3b8' }}>Ground:</span>
            <select
              value={groundLayer}
              onChange={(e) => setGroundLayer(e.target.value as GroundLayerType)}
              style={{ background: 'rgba(30,41,59,0.9)', color: '#e2e8f0', border: '1px solid rgba(148,163,184,0.3)', borderRadius: 4, padding: '2px 6px', fontSize: 11, cursor: 'pointer' }}
            >
              <option value="simple">Simple</option>
              <option value="quick-grass">Quick Grass</option>
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
