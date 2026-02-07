/**
 * CODEX5.3TREES - Tree Parameters Type System
 * 
 * TreeParams is a flat key-value registry with dual keys:
 * - Short names: height, baseRadius, branchCount
 * - Namespaced: vegetation.species.heightBase_m, vegetation.trunk.baseRadius_m
 * 
 * Both forms are supported via getP(primary, alt, default) pattern.
 */

export type TreeParams = Record<string, number | string | boolean>;

export type SpeciesProfile = 
  | 'BROADLEAF_DECIDUOUS'
  | 'OAK_MAPLE'
  | 'PINE_CONIFER'
  | 'BIRCH_UPRIGHT'
  | 'WILLOW_WEEPING'
  | 'SPRUCE_CONICAL'
  | 'ACACIA_SAVANNA';

export type BranchModel = 'L_SYSTEM' | 'SPACE_COLONIZATION' | 'HYBRID';
export type BarkTexture = 'SMOOTH' | 'PLATE' | 'FURROWED';
export type LeafRepresentation = 'CLUSTERS' | 'CARDS' | 'MASS_ONLY';
export type LeafShape = 'BROADLEAF' | 'NEEDLE' | 'SCALE' | 'PALM_FROND' | 'COMPOUND' | 'LOBED';
export type Phyllotaxis = 'ALTERNATE' | 'OPPOSITE' | 'WHORLED';
export type RootStyle = 'SURFACE_SPREAD' | 'TAP_ROOT' | 'BUTTRESS';
export type GroundLayerType = 'simple' | 'quick-grass';
export type LODLevel = 'near' | 'mid' | 'far' | 'ultra';
export type WindMode = 'vertex' | 'skeletal';

/**
 * Default tree parameters - the canonical starting state.
 * All species presets modify subsets of these values.
 */
export const DEFAULT_TREE_PARAMS: TreeParams = {
  // ─── INSTANCE & ENVIRONMENT ───────────────────────────────────────
  age01: 1.0,
  'vegetation.instance.age01': 1.0,
  moisture: 0.55,
  'vegetation.env.moisture': 0.55,
  timeOfDay: 0.45,
  'vegetation.env.timeOfDay': 0.45,
  autoSun: true,
  'vegetation.env.autoSun': true,
  autoSunInfluence: 0.82,
  'vegetation.env.autoSunInfluence': 0.82,
  atmosphereStrength: 0.45,
  'vegetation.env.atmosphereStrength': 0.45,
  contactShadowStrength: 0.62,
  'vegetation.env.contactShadowStrength': 0.62,
  contactShadowRadius_m: 1.65,
  'vegetation.env.contactShadowRadius_m': 1.65,
  shadowSoftness: 0.55,
  'vegetation.env.shadowSoftness': 0.55,
  nearFieldAOStrength: 0.36,
  'vegetation.env.nearFieldAOStrength': 0.36,
  canopySelfShadow: 0.48,
  'vegetation.env.canopySelfShadow': 0.48,

  // ─── SPECIES ─────────────────────────────────────────────────────
  speciesProfile: 'BROADLEAF_DECIDUOUS',
  'vegetation.species.profile': 'BROADLEAF_DECIDUOUS',
  height: 8,
  'vegetation.species.heightBase_m': 8,

  // ─── TRUNK ────────────────────────────────────────────────────────
  baseRadius: 0.4,
  'vegetation.trunk.baseRadius_m': 0.4,
  taperExponent: 0.7,
  'vegetation.trunk.taperExponent': 0.7,
  baseFlare: 1.3,
  'vegetation.trunk.baseFlare': 1.3,
  twist: 0,
  'vegetation.trunk.twist_deg': 0,
  trunkColor: '#5d4037',
  'vegetation.trunk.barkColor': '#5d4037',
  barkTexture: 'FURROWED',
  'vegetation.trunk.barkTexture': 'FURROWED',
  barkRoughness: 0.75,
  'vegetation.trunk.barkRoughness': 0.75,
  barkAnisotropy: 0.34,
  'vegetation.trunk.barkAnisotropy': 0.34,
  barkMicroDetail: 0.44,
  'vegetation.trunk.barkMicroDetail': 0.44,
  barkCurvatureDetail: 0.4,
  'vegetation.trunk.barkCurvatureDetail': 0.4,
  trunkKnotCount: 2,
  'vegetation.trunk.gestureKnotCount': 2,
  trunkKnotStrength: 0.25,
  'vegetation.trunk.gestureKnotStrength': 0.25,
  trunkKnotWidth: 0.12,
  'vegetation.trunk.gestureKnotWidth': 0.12,
  trunkOvality: 0.06,
  'vegetation.trunk.ovality': 0.06,
  trunkFlutingStrength: 0,
  'vegetation.trunk.flutingStrength': 0,
  trunkFlutingCount: 4,
  'vegetation.trunk.flutingCount': 4,
  trunkFlutingSharpness: 2,
  'vegetation.trunk.flutingSharpness': 2,
  buttressStrength: 0,
  'vegetation.trunk.buttressStrength': 0,
  buttressCount: 4,
  'vegetation.trunk.buttressCount': 4,
  buttressSharpness: 2.2,
  'vegetation.trunk.buttressSharpness': 2.2,

  // ─── BRANCHING ────────────────────────────────────────────────────
  branchModel: 'L_SYSTEM',
  'vegetation.branching.model': 'L_SYSTEM',
  phyllotaxis: 'ALTERNATE',
  'vegetation.branching.phyllotaxis': 'ALTERNATE',
  maxOrder: 4,
  'vegetation.branching.maxOrder': 4,
  branchCount: 8,
  'vegetation.branching.mainBranchCount': 8,
  branchAngle: 40,
  'vegetation.branching.angleMean_deg': 40,
  branchAngleVar: 15,
  'vegetation.branching.angleVariance_deg': 15,
  branchLength: 0.7,
  'vegetation.branching.lengthRatio': 0.7,
  lengthDecay: 0.75,
  'vegetation.branching.lengthDecay': 0.75,
  radiusDecay: 0.6,
  'vegetation.branching.radiusDecay': 0.6,
  branchProbability: 0.85,
  'vegetation.branching.probability': 0.85,
  apicalDominance: 0.6,
  'vegetation.branching.apicalDominance': 0.6,
  collarStrength: 0.3,
  'vegetation.branching.collarStrength': 0.3,
  collarLength: 0.05,
  'vegetation.branching.collarLength': 0.05,
  junctionMetaballStrength: 0.2,
  'vegetation.branching.junctionMetaballStrength': 0.2,
  junctionMetaballRadius: 0.08,
  'vegetation.branching.junctionMetaballRadius': 0.08,
  unionBlendLength: 0.1,
  'vegetation.branching.unionBlendLength': 0.1,
  unionBlendStrength: 0.15,
  'vegetation.branching.unionBlendStrength': 0.15,
  unionAsymmetry: 0.1,
  'vegetation.branching.unionAsymmetry': 0.1,
  branchKnotStrength: 0.15,
  'vegetation.branching.gestureKnotStrength': 0.15,
  branchKnotWidth: 0.08,
  'vegetation.branching.gestureKnotWidth': 0.08,
  branchOvality: 0.04,
  'vegetation.branching.ovality': 0.04,
  breakProbability: 0.02,
  'vegetation.branching.breakProbability': 0.02,
  breakSeverity: 0.3,
  'vegetation.branching.breakSeverity': 0.3,
  attractorCount: 200,
  'vegetation.branching.attractorCount': 200,
  maxIterations: 150,
  'vegetation.branching.maxIterations': 150,
  crownRadiusRatio: 0.8,
  'vegetation.crown.crownRadiusRatio': 0.8,

  // ─── LEAVES ───────────────────────────────────────────────────────
  leafRepresentation: 'CLUSTERS',
  'vegetation.leaves.representation': 'CLUSTERS',
  leafShape: 'BROADLEAF',
  'vegetation.leaves.shape': 'BROADLEAF',
  leafColor: '#4a7c3f',
  'vegetation.leaves.colorBase': '#4a7c3f',
  leafColorVariation: 0.15,
  'vegetation.leaves.colorVariation': 0.15,
  leafSize: 0.08,
  'vegetation.leaves.size_m': 0.08,
  leafClusterSize: 12,
  'vegetation.leaves.clusterSize': 12,
  leafDensity: 5,
  'vegetation.leaves.cardsPerMeter': 5,
  petioleLengthFactor: 0.5,
  'vegetation.leaves.petioleLengthFactor': 0.5,
  petioleDroop: 0.2,
  'vegetation.leaves.petioleDroop': 0.2,
  petioleWidthFactor: 0.1,
  'vegetation.leaves.petioleWidthFactor': 0.1,

  // ─── BARK ─────────────────────────────────────────────────────────
  branchBarkScale: 0.65,
  'vegetation.bark.branchScale': 0.65,

  // ─── ROOTS ────────────────────────────────────────────────────────
  rootCount: 5,
  'vegetation.roots.rootCount': 5,
  rootStyle: 'SURFACE_SPREAD',
  'vegetation.roots.rootStyle': 'SURFACE_SPREAD',
  rootVisibility: 0.6,
  'vegetation.roots.visibility': 0.6,
  rootShoulderLength: 0.3,
  'vegetation.roots.shoulderLength': 0.3,
  rootShoulderRadiusMul: 1.2,
  'vegetation.roots.shoulderRadiusMul': 1.2,

  // ─── WIND ─────────────────────────────────────────────────────────
  windStrength: 0.5,
  'vegetation.wind.gustStrength': 0.5,
  windEnabled: true,
  'vegetation.wind.enabled': true,
  trunkBend: 0.02,
  'vegetation.wind.trunkBend': 0.02,
  branchBend: 0.15,
  'vegetation.wind.branchBend': 0.15,
  twigBend: 0.4,
  'vegetation.wind.twigBend': 0.4,
  canopyShear: 0.1,
  'vegetation.wind.canopyShear': 0.1,
  phaseRandom: 0.3,
  'vegetation.wind.phaseRandom': 0.3,
  restLean: 0.02,
  'vegetation.wind.restLean': 0.02,
  windGustFrequency: 0.8,
  'vegetation.wind.gustFrequency': 0.8,
  windTurbulence: 0.3,
  'vegetation.wind.turbulence': 0.3,
  leafFlutter: 0.5,
  'vegetation.wind.leafFlutter': 0.5,
  windHierarchyBias: 0.6,
  'vegetation.wind.hierarchyBias': 0.6,
  windMotionInertia: 0.4,
  'vegetation.wind.motionInertia': 0.4,
  windSpringResponse: 0.6,
  'vegetation.wind.springResponse': 0.6,
  windMotionDamping: 0.3,
  'vegetation.wind.motionDamping': 0.3,
  windParentCoupling: 0.7,
  'vegetation.wind.parentCoupling': 0.7,
  windGustVariance: 0.4,
  'vegetation.wind.gustVariance': 0.4,
  windVortexStrength: 0.1,
  'vegetation.wind.vortexStrength': 0.1,
  windLeafMicroTurbulence: 0.3,
  'vegetation.wind.leafMicroTurbulence': 0.3,
  windSolverInfluence: 0.8,
  'vegetation.wind.solverInfluence': 0.8,
  windBranchTorsion: 0.1,
  'vegetation.wind.branchTorsion': 0.1,
  windOrderDrag: 0.5,
  'vegetation.wind.orderDrag': 0.5,
  windGustEnvelope: 0.6,
  'vegetation.wind.gustEnvelope': 0.6,
  windDebugSkeleton: false,
  'vegetation.wind.debugSkeleton': false,
  windMode: 'vertex',
  'vegetation.wind.mode': 'vertex',

  // ─── LOD ──────────────────────────────────────────────────────────
  octaveCapLod1: 6,
  'vegetation.lod.octaveCap.lod1': 6,
  octaveCapLod2: 4,
  'vegetation.lod.octaveCap.lod2': 4,
  octaveCapLod3: 2,
  'vegetation.lod.octaveCap.lod3': 2,
  nearRadius_m: 15,
  'vegetation.lod.distance.nearRadius_m': 15,
  midRadius_m: 40,
  'vegetation.lod.distance.midRadius_m': 40,
  farRadius_m: 100,
  'vegetation.lod.distance.farRadius_m': 100,
};

/**
 * Species presets - each modifies a subset of DEFAULT_TREE_PARAMS
 */
export interface SpeciesPreset {
  name: string;
  profile: SpeciesProfile;
  params: Partial<TreeParams>;
}

export const SPECIES_PRESETS: SpeciesPreset[] = [
  {
    name: 'Oak',
    profile: 'OAK_MAPLE',
    params: {
      height: 12,
      'vegetation.species.heightBase_m': 12,
      baseRadius: 0.5,
      'vegetation.trunk.baseRadius_m': 0.5,
      taperExponent: 0.65,
      'vegetation.trunk.taperExponent': 0.65,
      branchCount: 8,
      'vegetation.branching.mainBranchCount': 8,
      branchAngle: 40,
      'vegetation.branching.angleMean_deg': 40,
      trunkColor: '#5d4037',
      'vegetation.trunk.barkColor': '#5d4037',
      leafColor: '#3d6b35',
      'vegetation.leaves.colorBase': '#3d6b35',
      speciesProfile: 'OAK_MAPLE',
      'vegetation.species.profile': 'OAK_MAPLE',
      leafShape: 'LOBED',
      'vegetation.leaves.shape': 'LOBED',
      leafRepresentation: 'CLUSTERS',
      'vegetation.leaves.representation': 'CLUSTERS',
      crownRadiusRatio: 1.0,
      'vegetation.crown.crownRadiusRatio': 1.0,
    },
  },
  {
    name: 'Pine',
    profile: 'PINE_CONIFER',
    params: {
      height: 18,
      'vegetation.species.heightBase_m': 18,
      baseRadius: 0.38,
      'vegetation.trunk.baseRadius_m': 0.38,
      taperExponent: 0.92,
      'vegetation.trunk.taperExponent': 0.92,
      branchCount: 13,
      'vegetation.branching.mainBranchCount': 13,
      branchAngle: 22,
      'vegetation.branching.angleMean_deg': 22,
      trunkColor: '#7a4a24',
      'vegetation.trunk.barkColor': '#7a4a24',
      leafColor: '#1f5d2a',
      'vegetation.leaves.colorBase': '#1f5d2a',
      speciesProfile: 'PINE_CONIFER',
      'vegetation.species.profile': 'PINE_CONIFER',
      leafShape: 'NEEDLE',
      'vegetation.leaves.shape': 'NEEDLE',
      leafRepresentation: 'CARDS',
      'vegetation.leaves.representation': 'CARDS',
      phyllotaxis: 'WHORLED',
      'vegetation.branching.phyllotaxis': 'WHORLED',
      crownRadiusRatio: 0.5,
      'vegetation.crown.crownRadiusRatio': 0.5,
    },
  },
  {
    name: 'Birch',
    profile: 'BIRCH_UPRIGHT',
    params: {
      height: 10,
      'vegetation.species.heightBase_m': 10,
      baseRadius: 0.25,
      'vegetation.trunk.baseRadius_m': 0.25,
      taperExponent: 0.85,
      'vegetation.trunk.taperExponent': 0.85,
      branchCount: 6,
      'vegetation.branching.mainBranchCount': 6,
      branchAngle: 30,
      'vegetation.branching.angleMean_deg': 30,
      trunkColor: '#f5f5f5',
      'vegetation.trunk.barkColor': '#f5f5f5',
      leafColor: '#7cb342',
      'vegetation.leaves.colorBase': '#7cb342',
      speciesProfile: 'BIRCH_UPRIGHT',
      'vegetation.species.profile': 'BIRCH_UPRIGHT',
      leafShape: 'BROADLEAF',
      'vegetation.leaves.shape': 'BROADLEAF',
      leafRepresentation: 'CLUSTERS',
      'vegetation.leaves.representation': 'CLUSTERS',
      barkTexture: 'PLATE',
      'vegetation.trunk.barkTexture': 'PLATE',
      crownRadiusRatio: 0.6,
      'vegetation.crown.crownRadiusRatio': 0.6,
    },
  },
  {
    name: 'Willow',
    profile: 'WILLOW_WEEPING',
    params: {
      height: 8,
      'vegetation.species.heightBase_m': 8,
      baseRadius: 0.4,
      'vegetation.trunk.baseRadius_m': 0.4,
      taperExponent: 0.6,
      'vegetation.trunk.taperExponent': 0.6,
      branchCount: 10,
      'vegetation.branching.mainBranchCount': 10,
      branchAngle: 50,
      'vegetation.branching.angleMean_deg': 50,
      trunkColor: '#6d5c4d',
      'vegetation.trunk.barkColor': '#6d5c4d',
      leafColor: '#8bc34a',
      'vegetation.leaves.colorBase': '#8bc34a',
      speciesProfile: 'WILLOW_WEEPING',
      'vegetation.species.profile': 'WILLOW_WEEPING',
      leafShape: 'COMPOUND',
      'vegetation.leaves.shape': 'COMPOUND',
      leafRepresentation: 'CLUSTERS',
      'vegetation.leaves.representation': 'CLUSTERS',
      apicalDominance: 0.3,
      'vegetation.branching.apicalDominance': 0.3,
      crownRadiusRatio: 1.2,
      'vegetation.crown.crownRadiusRatio': 1.2,
    },
  },
  {
    name: 'Spruce',
    profile: 'SPRUCE_CONICAL',
    params: {
      height: 21,
      'vegetation.species.heightBase_m': 21,
      baseRadius: 0.34,
      'vegetation.trunk.baseRadius_m': 0.34,
      taperExponent: 1.02,
      'vegetation.trunk.taperExponent': 1.02,
      branchCount: 15,
      'vegetation.branching.mainBranchCount': 15,
      branchAngle: 18,
      'vegetation.branching.angleMean_deg': 18,
      trunkColor: '#6a4d30',
      'vegetation.trunk.barkColor': '#6a4d30',
      leafColor: '#2d5b2d',
      'vegetation.leaves.colorBase': '#2d5b2d',
      speciesProfile: 'SPRUCE_CONICAL',
      'vegetation.species.profile': 'SPRUCE_CONICAL',
      leafShape: 'NEEDLE',
      'vegetation.leaves.shape': 'NEEDLE',
      leafRepresentation: 'CARDS',
      'vegetation.leaves.representation': 'CARDS',
      phyllotaxis: 'WHORLED',
      'vegetation.branching.phyllotaxis': 'WHORLED',
      apicalDominance: 0.9,
      'vegetation.branching.apicalDominance': 0.9,
      crownRadiusRatio: 0.4,
      'vegetation.crown.crownRadiusRatio': 0.4,
    },
  },
  {
    name: 'Acacia',
    profile: 'ACACIA_SAVANNA',
    params: {
      height: 11,
      'vegetation.species.heightBase_m': 11,
      baseRadius: 0.48,
      'vegetation.trunk.baseRadius_m': 0.48,
      taperExponent: 0.62,
      'vegetation.trunk.taperExponent': 0.62,
      branchCount: 7,
      'vegetation.branching.mainBranchCount': 7,
      branchAngle: 54,
      'vegetation.branching.angleMean_deg': 54,
      trunkColor: '#75583d',
      'vegetation.trunk.barkColor': '#75583d',
      leafColor: '#6e8f3a',
      'vegetation.leaves.colorBase': '#6e8f3a',
      speciesProfile: 'ACACIA_SAVANNA',
      'vegetation.species.profile': 'ACACIA_SAVANNA',
      leafShape: 'COMPOUND',
      'vegetation.leaves.shape': 'COMPOUND',
      leafRepresentation: 'CLUSTERS',
      'vegetation.leaves.representation': 'CLUSTERS',
      crownRadiusRatio: 1.5,
      'vegetation.crown.crownRadiusRatio': 1.5,
    },
  },
];

/**
 * Helper to get a parameter value with fallback
 */
export function getP(
  params: TreeParams | null | undefined,
  primaryKey: string,
  altKey?: string,
  defaultValue: number | string | boolean = 0
): number | string | boolean {
  if (!params) return defaultValue;
  const primary = params[primaryKey];
  if (primary !== undefined) return primary;
  if (altKey) {
    const alt = params[altKey];
    if (alt !== undefined) return alt;
  }
  return defaultValue;
}

/**
 * Helper to get numeric parameter
 */
export function getPN(
  params: TreeParams | null | undefined,
  primaryKey: string,
  altKey?: string,
  defaultValue: number = 0
): number {
  const val = getP(params, primaryKey, altKey, defaultValue);
  return typeof val === 'number' ? val : defaultValue;
}

/**
 * Helper to get string parameter
 */
export function getPS(
  params: TreeParams | null | undefined,
  primaryKey: string,
  altKey?: string,
  defaultValue: string = ''
): string {
  const val = getP(params, primaryKey, altKey, defaultValue);
  return typeof val === 'string' ? val : defaultValue;
}

/**
 * Helper to get boolean parameter
 */
export function getPB(
  params: TreeParams | null | undefined,
  primaryKey: string,
  altKey?: string,
  defaultValue: boolean = false
): boolean {
  const val = getP(params, primaryKey, altKey, defaultValue);
  return typeof val === 'boolean' ? val : defaultValue;
}
