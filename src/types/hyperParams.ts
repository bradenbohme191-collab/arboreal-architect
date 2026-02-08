/**
 * HYPER-REALISTIC VEGETATION ENGINE
 * 
 * Unified parameter system for all tree generation features including:
 * - Volumetric soil with moisture/nutrients
 * - Biologically accurate roots with fluting
 * - Full growth timeline (seed to ancient)
 * - Hierarchical wind physics
 * - Multi-layer breakable bark
 * - Deformation and damage systems
 * - Hyper-detailed foliage
 */

// ─── ROOT ARCHITECTURE TYPES ─────────────────────────────────────────────────

export type RootArchitecture = 
  | 'TAP_ROOT'    // Deep central root (oak, walnut)
  | 'FIBROUS'     // Dense shallow network (spruce)
  | 'HEART'       // Compact heart-shaped (birch, maple)
  | 'PLATE'       // Shallow spreading (pine on rocky soil)
  | 'BUTTRESS';   // Surface roots with aerial buttresses

export type LeafShape = 
  | 'OVATE'           // Egg-shaped (oak, beech)
  | 'LANCEOLATE'      // Lance-shaped (willow)
  | 'ELLIPTIC'        // Ellipse (magnolia)
  | 'CORDATE'         // Heart-shaped (linden)
  | 'PALMATELY_LOBED' // Star-shaped (maple)
  | 'NEEDLE'          // Conifer needle
  | 'SCALE'           // Overlapping scales (cedar)
  | 'COMPOUND';       // Multiple leaflets

export type BarkPattern = 
  | 'FISSURED'   // Deep vertical cracks
  | 'PLATED'     // Flat plates
  | 'SMOOTH'     // Minimal texture
  | 'SCALY'      // Overlapping scales
  | 'PEELING'    // Papery peeling (birch)
  | 'CORKY';     // Cork-like (cork oak)

export type SoilType = 
  | 'TOPSOIL' 
  | 'SUBSOIL' 
  | 'CLAY' 
  | 'SAND' 
  | 'LOAM' 
  | 'BEDROCK';

export type GrowthStageName = 
  | 'SEED' 
  | 'SEEDLING' 
  | 'SAPLING' 
  | 'POLE' 
  | 'MATURE' 
  | 'OVERMATURE' 
  | 'ANCIENT';

export type LODLevel = 'hero' | 'near' | 'mid' | 'far' | 'ultra';

export type WindQuality = 'LOW' | 'MEDIUM' | 'HIGH' | 'ULTRA';

// ─── SOIL SYSTEM ─────────────────────────────────────────────────────────────

export interface SoilLayer {
  depth: number;
  thickness: number;
  type: SoilType;
  color: string;
  permeability: number;
  nutrients: number;
}

export interface SoilParams {
  enabled: boolean;
  radius: number;
  depth: number;
  moisture: number;
  nutrients: number;
  waterTableDepth: number;
  organicMatter: number;
  rockDensity: number;
  layers: SoilLayer[];
  visualOpacity: number;
}

// ─── ROOT SYSTEM ─────────────────────────────────────────────────────────────

export interface RootParams {
  architecture: RootArchitecture;
  count: number;
  maxDepth: number;
  spreadRadius: number;
  tapRootLength: number;
  lateralAngle: number;
  branchingDensity: number;
  
  // Tropism response
  hydrotropismStrength: number;
  gravitropismStrength: number;
  
  // Visual
  visibility: number;
  baseRadius: number;
  taperRate: number;
  
  // Fluting transition to trunk
  flutingEnabled: boolean;
  flutingStrength: number;
  flutingCount: number;
  flutingSharpness: number;
  flutingTransitionHeight: number;
  fluteAsymmetry: number;
  
  // Buttress
  buttressEnabled: boolean;
  buttressStrength: number;
  buttressHeight: number;
}

// ─── GROWTH TIMELINE ─────────────────────────────────────────────────────────

export interface GrowthStage {
  name: GrowthStageName;
  ageRange: [number, number];
  heightMultiplier: number;
  radiusMultiplier: number;
  branchCountMultiplier: number;
  leafDensityMultiplier: number;
  rootDepthMultiplier: number;
  barkTextureScale: number;
  barkFissureDepth: number;
  leafSize: number;
  crownShape: 'conical' | 'columnar' | 'spreading' | 'rounded';
  flexibility: number;
  windResponseMultiplier: number;
}

export interface GrowthParams {
  age: number;           // 0-1 normalized age (seed to ancient)
  vitality: number;      // 0-1 health/vigor
  stressLevel: number;   // 0-1 environmental stress
  growthRate: number;    // Speed of development
}

// ─── WIND PHYSICS ────────────────────────────────────────────────────────────

export interface WindParams {
  enabled: boolean;
  beaufortScale: number;  // 0-12
  direction: number;      // Radians
  
  // Gust envelope
  gustFrequency: number;
  gustIntensity: number;
  gustVariance: number;
  gustEnvelopeSmoothing: number;
  
  // Turbulence
  turbulenceScale: number;
  turbulenceIntensity: number;
  vortexStrength: number;
  
  // Hierarchical response
  trunkBendFactor: number;
  branchBendFactor: number;
  twigBendFactor: number;
  leafFlutterFactor: number;
  
  // Drag cascade
  leafDragScale: number;
  branchDragScale: number;
  parentCoupling: number;
  
  // Spring-damper
  globalStiffness: number;
  globalDamping: number;
  
  quality: WindQuality;
}

// ─── BARK SYSTEM ─────────────────────────────────────────────────────────────

export interface BarkLayerParams {
  thickness: number;
  brittleness: number;
  elasticity: number;
  adhesion: number;
  color: string;
  roughness: number;
}

export interface BarkParams {
  pattern: BarkPattern;
  layerCount: number;
  totalThickness: number;
  layers: BarkLayerParams[];
  
  // Procedural generation
  crackScale: number;
  crackDepth: number;
  fissureFrequency: number;
  plateSize: number;
  
  // Peeling (for birch-like bark)
  peelingEnabled: boolean;
  peelingIntensity: number;
  peelCurlRadius: number;
  
  // Moss/lichen
  mossEnabled: boolean;
  mossAmount: number;
  mossHeight: number;
  mossColor: string;
  
  // Weathering
  weatheringAge: number;
  uvDamage: number;
  moistureStaining: number;
}

// ─── DAMAGE SYSTEM ───────────────────────────────────────────────────────────

export interface DamageParams {
  // Knots
  knotDensity: number;
  knotSizeRange: [number, number];
  knotTypes: ('live' | 'dead' | 'encased')[];
  
  // Branch breaking
  breakingEnabled: boolean;
  brokenBranchCount: number;
  breakThreshold: number;  // Force multiplier
  healingRate: number;
  
  // Disease/rot
  diseaseLevel: number;
  rotSpots: number;
  
  // Physical deformation
  leanAngle: number;
  leanDirection: number;
  crookedness: number;
}

// ─── FOLIAGE SYSTEM ──────────────────────────────────────────────────────────

export interface LeafParams {
  shape: LeafShape;
  length: number;
  width: number;
  thickness: number;
  
  // Venation
  veinPattern: 'pinnate' | 'palmate' | 'parallel' | 'dichotomous';
  veinDetail: number;       // 0-1, level of vein geometry
  midribWidth: number;
  secondaryVeinCount: number;
  veinDepth: number;        // Relief depth
  
  // Edge
  margin: 'entire' | 'serrate' | 'dentate' | 'lobed' | 'compound';
  serrationDepth: number;
  serrationCount: number;
  
  // Surface
  glossiness: number;
  translucency: number;
  colorBase: string;
  colorVariation: number;
  autumnColor: string;
  
  // Petiole
  petioleLength: number;
  petioleWidth: number;
  petioleDroop: number;
  
  // Density & clustering
  density: number;
  clusterSize: number;
}

// ─── TRUNK & BRANCHING ───────────────────────────────────────────────────────

export interface TrunkParams {
  heightBase: number;
  baseRadius: number;
  taperExponent: number;
  baseFlare: number;
  flareZone: number;
  
  // Cross-section
  ovality: number;
  twist: number;
  
  // Gesture
  curveStrength: number;
  knotCount: number;
  knotStrength: number;
  
  // Color
  barkColor: string;
}

export interface BranchingParams {
  model: 'L_SYSTEM' | 'SPACE_COLONIZATION' | 'HYBRID';
  phyllotaxis: 'ALTERNATE' | 'OPPOSITE' | 'WHORLED' | 'RANDOM';
  maxOrder: number;
  branchCount: number;
  
  // Angles
  angleMean: number;
  angleVariance: number;
  
  // Scaling
  lengthDecay: number;
  radiusDecay: number;
  probability: number;
  apicalDominance: number;
  childBudget: number;
  
  // Junction
  collarStrength: number;
  collarLength: number;
  junctionBlob: number;
  
  // Start position
  startHeight: number;
}

// ─── LOD SYSTEM ──────────────────────────────────────────────────────────────

export interface LODParams {
  heroRadius: number;      // < heroRadius = hero detail
  nearRadius: number;
  midRadius: number;
  farRadius: number;
  
  // Geometry budgets
  heroVertexBudget: number;
  nearVertexBudget: number;
  midVertexBudget: number;
  farVertexBudget: number;
  
  // Feature toggles per LOD
  heroLeafGeometry: boolean;
  heroVeinDetail: boolean;
  heroBarkDisplacement: boolean;
  
  // Transition
  transitionSmoothing: number;
}

// ─── VIEWPORT SETTINGS ───────────────────────────────────────────────────────

export interface ViewportSettings {
  backgroundColor: string;
  fogEnabled: boolean;
  fogColor: string;
  fogNear: number;
  fogFar: number;
  exposure: number;
  enableShadows: boolean;
  shadowMapSize: number;
  
  // Lighting
  ambientIntensity: number;
  ambientColor: string;
  mainLightIntensity: number;
  mainLightColor: string;
  mainLightPosition: [number, number, number];
  fillLightIntensity: number;
  fillLightColor: string;
  fillLightPosition: [number, number, number];
  hemiSkyColor: string;
  hemiGroundColor: string;
  hemiIntensity: number;
}

// ─── SPECIES PRESET ──────────────────────────────────────────────────────────

export interface SpeciesPreset {
  name: string;
  scientificName: string;
  trunk: Partial<TrunkParams>;
  branching: Partial<BranchingParams>;
  roots: Partial<RootParams>;
  bark: Partial<BarkParams>;
  foliage: Partial<LeafParams>;
  growth: Partial<GrowthParams>;
  wind: Partial<WindParams>;
}

// ─── MASTER PARAMETER OBJECT ─────────────────────────────────────────────────

export interface HyperTreeParams {
  // Core identity
  species: string;
  seed: number;
  
  // Subsystems
  soil: SoilParams;
  roots: RootParams;
  growth: GrowthParams;
  wind: WindParams;
  bark: BarkParams;
  damage: DamageParams;
  foliage: LeafParams;
  trunk: TrunkParams;
  branching: BranchingParams;
  lod: LODParams;
  viewport: ViewportSettings;
}

// ─── DEFAULT VALUES ──────────────────────────────────────────────────────────

export const DEFAULT_SOIL_PARAMS: SoilParams = {
  enabled: true,
  radius: 4,
  depth: 1.5,
  moisture: 0.55,
  nutrients: 0.6,
  waterTableDepth: 2.0,
  organicMatter: 0.4,
  rockDensity: 0.1,
  layers: [
    { depth: 0, thickness: 0.3, type: 'TOPSOIL', color: '#3d2817', permeability: 0.8, nutrients: 0.8 },
    { depth: 0.3, thickness: 0.5, type: 'SUBSOIL', color: '#5a4030', permeability: 0.5, nutrients: 0.4 },
    { depth: 0.8, thickness: 0.7, type: 'CLAY', color: '#6b5545', permeability: 0.2, nutrients: 0.2 },
  ],
  visualOpacity: 0.35,
};

export const DEFAULT_ROOT_PARAMS: RootParams = {
  architecture: 'TAP_ROOT',
  count: 6,
  maxDepth: 1.2,
  spreadRadius: 3.0,
  tapRootLength: 1.5,
  lateralAngle: 35,
  branchingDensity: 0.6,
  hydrotropismStrength: 0.4,
  gravitropismStrength: 0.6,
  visibility: 0.6,
  baseRadius: 0.25,
  taperRate: 0.7,
  flutingEnabled: true,
  flutingStrength: 0.12,
  flutingCount: 5,
  flutingSharpness: 2.2,
  flutingTransitionHeight: 0.4,
  fluteAsymmetry: 0.15,
  buttressEnabled: false,
  buttressStrength: 0.3,
  buttressHeight: 0.5,
};

export const DEFAULT_GROWTH_PARAMS: GrowthParams = {
  age: 0.6,  // Mature tree
  vitality: 0.85,
  stressLevel: 0.1,
  growthRate: 1.0,
};

export const DEFAULT_WIND_PARAMS: WindParams = {
  enabled: true,
  beaufortScale: 3,
  direction: 0,
  gustFrequency: 0.8,
  gustIntensity: 0.5,
  gustVariance: 0.4,
  gustEnvelopeSmoothing: 0.3,
  turbulenceScale: 5,
  turbulenceIntensity: 0.3,
  vortexStrength: 0.2,
  trunkBendFactor: 0.015,
  branchBendFactor: 0.08,
  twigBendFactor: 0.2,
  leafFlutterFactor: 0.5,
  leafDragScale: 1.0,
  branchDragScale: 0.5,
  parentCoupling: 0.75,
  globalStiffness: 5.0,
  globalDamping: 2.0,
  quality: 'HIGH',
};

export const DEFAULT_BARK_PARAMS: BarkParams = {
  pattern: 'FISSURED',
  layerCount: 3,
  totalThickness: 0.02,
  layers: [
    { thickness: 0.008, brittleness: 0.7, elasticity: 0.3, adhesion: 0.6, color: '#5d4037', roughness: 0.8 },
    { thickness: 0.007, brittleness: 0.5, elasticity: 0.5, adhesion: 0.8, color: '#4a3228', roughness: 0.6 },
    { thickness: 0.005, brittleness: 0.3, elasticity: 0.7, adhesion: 0.9, color: '#3d2817', roughness: 0.4 },
  ],
  crackScale: 12,
  crackDepth: 0.02,
  fissureFrequency: 0.6,
  plateSize: 0.15,
  peelingEnabled: false,
  peelingIntensity: 0,
  peelCurlRadius: 0.02,
  mossEnabled: true,
  mossAmount: 0.25,
  mossHeight: 0.5,
  mossColor: '#3a5a2a',
  weatheringAge: 0.5,
  uvDamage: 0.2,
  moistureStaining: 0.3,
};

export const DEFAULT_DAMAGE_PARAMS: DamageParams = {
  knotDensity: 0.3,
  knotSizeRange: [0.02, 0.08],
  knotTypes: ['live', 'dead', 'encased'],
  breakingEnabled: true,
  brokenBranchCount: 0,
  breakThreshold: 0.8,
  healingRate: 0.5,
  diseaseLevel: 0,
  rotSpots: 0,
  leanAngle: 0,
  leanDirection: 0,
  crookedness: 0.1,
};

export const DEFAULT_LEAF_PARAMS: LeafParams = {
  shape: 'OVATE',
  length: 0.08,
  width: 0.05,
  thickness: 0.001,
  veinPattern: 'pinnate',
  veinDetail: 0.6,
  midribWidth: 0.002,
  secondaryVeinCount: 8,
  veinDepth: 0.0005,
  margin: 'serrate',
  serrationDepth: 0.003,
  serrationCount: 20,
  glossiness: 0.4,
  translucency: 0.3,
  colorBase: '#4a7c3f',
  colorVariation: 0.15,
  autumnColor: '#c04030',
  petioleLength: 0.02,
  petioleWidth: 0.001,
  petioleDroop: 0.15,
  density: 12,
  clusterSize: 8,
};

export const DEFAULT_TRUNK_PARAMS: TrunkParams = {
  heightBase: 10,
  baseRadius: 0.45,
  taperExponent: 0.55,
  baseFlare: 1.4,
  flareZone: 0.08,
  ovality: 0.04,
  twist: 8,
  curveStrength: 0.12,
  knotCount: 2,
  knotStrength: 0.2,
  barkColor: '#5d4037',
};

export const DEFAULT_BRANCHING_PARAMS: BranchingParams = {
  model: 'L_SYSTEM',
  phyllotaxis: 'ALTERNATE',
  maxOrder: 5,
  branchCount: 8,
  angleMean: 40,
  angleVariance: 12,
  lengthDecay: 0.68,
  radiusDecay: 0.58,
  probability: 0.7,
  apicalDominance: 0.6,
  childBudget: 3,
  collarStrength: 0.3,
  collarLength: 0.12,
  junctionBlob: 0.35,
  startHeight: 0.3,
};

export const DEFAULT_LOD_PARAMS: LODParams = {
  heroRadius: 0.5,
  nearRadius: 5,
  midRadius: 15,
  farRadius: 40,
  heroVertexBudget: 500000,
  nearVertexBudget: 200000,
  midVertexBudget: 50000,
  farVertexBudget: 10000,
  heroLeafGeometry: true,
  heroVeinDetail: true,
  heroBarkDisplacement: true,
  transitionSmoothing: 0.3,
};

export const DEFAULT_VIEWPORT_SETTINGS: ViewportSettings = {
  backgroundColor: '#0d1117',
  fogEnabled: true,
  fogColor: '#0d1117',
  fogNear: 20,
  fogFar: 100,
  exposure: 1.1,
  enableShadows: true,
  shadowMapSize: 2048,
  ambientIntensity: 0.35,
  ambientColor: '#4466aa',
  mainLightIntensity: 1.2,
  mainLightColor: '#ffe8cc',
  mainLightPosition: [8, 14, 6],
  fillLightIntensity: 0.3,
  fillLightColor: '#6688cc',
  fillLightPosition: [-5, 8, -4],
  hemiSkyColor: '#8899bb',
  hemiGroundColor: '#221100',
  hemiIntensity: 0.35,
};

export const DEFAULT_HYPER_TREE_PARAMS: HyperTreeParams = {
  species: 'OAK',
  seed: 1337,
  soil: DEFAULT_SOIL_PARAMS,
  roots: DEFAULT_ROOT_PARAMS,
  growth: DEFAULT_GROWTH_PARAMS,
  wind: DEFAULT_WIND_PARAMS,
  bark: DEFAULT_BARK_PARAMS,
  damage: DEFAULT_DAMAGE_PARAMS,
  foliage: DEFAULT_LEAF_PARAMS,
  trunk: DEFAULT_TRUNK_PARAMS,
  branching: DEFAULT_BRANCHING_PARAMS,
  lod: DEFAULT_LOD_PARAMS,
  viewport: DEFAULT_VIEWPORT_SETTINGS,
};

// ─── SPECIES PRESETS ─────────────────────────────────────────────────────────

export const SPECIES_PRESETS: Record<string, SpeciesPreset> = {
  OAK: {
    name: 'Oak',
    scientificName: 'Quercus robur',
    trunk: { heightBase: 12, baseRadius: 0.5, taperExponent: 0.5, baseFlare: 1.5, barkColor: '#5d4037' },
    branching: { maxOrder: 5, branchCount: 8, angleMean: 42, apicalDominance: 0.5, startHeight: 0.28 },
    roots: { architecture: 'TAP_ROOT', count: 5, flutingCount: 5, flutingStrength: 0.12 },
    bark: { pattern: 'FISSURED', crackDepth: 0.025, mossAmount: 0.4 },
    foliage: { shape: 'PALMATELY_LOBED', colorBase: '#3d6b35', density: 14 },
    growth: { age: 0.6 },
    wind: { beaufortScale: 3 },
  },
  PINE: {
    name: 'Pine',
    scientificName: 'Pinus sylvestris',
    trunk: { heightBase: 18, baseRadius: 0.35, taperExponent: 0.85, baseFlare: 1.2, barkColor: '#7a4a24' },
    branching: { maxOrder: 4, branchCount: 16, angleMean: 25, apicalDominance: 0.9, startHeight: 0.12, lengthDecay: 0.62 },
    roots: { architecture: 'PLATE', count: 4, flutingCount: 3, flutingStrength: 0.06 },
    bark: { pattern: 'PLATED', plateSize: 0.2, mossAmount: 0.2 },
    foliage: { shape: 'NEEDLE', colorBase: '#1f5d2a', length: 0.08, density: 20 },
    growth: { age: 0.5 },
    wind: { beaufortScale: 3, leafFlutterFactor: 0.3 },
  },
  BIRCH: {
    name: 'Birch',
    scientificName: 'Betula pendula',
    trunk: { heightBase: 11, baseRadius: 0.22, taperExponent: 0.72, baseFlare: 1.15, barkColor: '#e8e0d0' },
    branching: { maxOrder: 5, branchCount: 7, angleMean: 32, apicalDominance: 0.8, startHeight: 0.35, radiusDecay: 0.52 },
    roots: { architecture: 'HEART', count: 4, flutingCount: 3, flutingStrength: 0.04 },
    bark: { pattern: 'PEELING', peelingEnabled: true, peelingIntensity: 0.6, mossAmount: 0.15 },
    foliage: { shape: 'OVATE', colorBase: '#7cb342', length: 0.05, density: 16 },
    growth: { age: 0.55 },
    wind: { beaufortScale: 3, leafFlutterFactor: 0.6 },
  },
  WILLOW: {
    name: 'Willow',
    scientificName: 'Salix babylonica',
    trunk: { heightBase: 10, baseRadius: 0.42, taperExponent: 0.48, baseFlare: 1.4, barkColor: '#6d5c4d' },
    branching: { maxOrder: 7, branchCount: 12, angleMean: 58, apicalDominance: 0.35, startHeight: 0.2, lengthDecay: 0.82 },
    roots: { architecture: 'FIBROUS', count: 5, flutingCount: 4, flutingStrength: 0.08 },
    bark: { pattern: 'FISSURED', crackDepth: 0.015, mossAmount: 0.45 },
    foliage: { shape: 'LANCEOLATE', colorBase: '#8bc34a', length: 0.06, width: 0.01, density: 25 },
    growth: { age: 0.5 },
    wind: { beaufortScale: 3, leafFlutterFactor: 0.8, branchBendFactor: 0.12 },
  },
  SPRUCE: {
    name: 'Spruce',
    scientificName: 'Picea abies',
    trunk: { heightBase: 20, baseRadius: 0.32, taperExponent: 0.95, baseFlare: 1.18, barkColor: '#6a4d30' },
    branching: { maxOrder: 4, branchCount: 18, angleMean: 18, apicalDominance: 0.95, startHeight: 0.08, childBudget: 5 },
    roots: { architecture: 'PLATE', count: 4, flutingCount: 3, flutingStrength: 0.05 },
    bark: { pattern: 'SCALY', plateSize: 0.08, mossAmount: 0.2 },
    foliage: { shape: 'NEEDLE', colorBase: '#2d5b2d', length: 0.025, density: 22 },
    growth: { age: 0.55 },
    wind: { beaufortScale: 3, leafFlutterFactor: 0.25 },
  },
  MAPLE: {
    name: 'Maple',
    scientificName: 'Acer saccharum',
    trunk: { heightBase: 13, baseRadius: 0.4, taperExponent: 0.52, baseFlare: 1.35, barkColor: '#6b5040' },
    branching: { maxOrder: 5, branchCount: 9, angleMean: 45, apicalDominance: 0.55, startHeight: 0.3 },
    roots: { architecture: 'HEART', count: 5, flutingCount: 4, flutingStrength: 0.1 },
    bark: { pattern: 'FISSURED', crackDepth: 0.018, mossAmount: 0.3 },
    foliage: { shape: 'PALMATELY_LOBED', colorBase: '#4a8040', autumnColor: '#c04030', density: 12 },
    growth: { age: 0.6 },
    wind: { beaufortScale: 3, leafFlutterFactor: 0.5 },
  },
  ACACIA: {
    name: 'Acacia',
    scientificName: 'Acacia tortilis',
    trunk: { heightBase: 10, baseRadius: 0.45, taperExponent: 0.45, baseFlare: 1.6, barkColor: '#75583d' },
    branching: { maxOrder: 5, branchCount: 6, angleMean: 58, apicalDominance: 0.3, startHeight: 0.4, lengthDecay: 0.75 },
    roots: { architecture: 'TAP_ROOT', count: 6, flutingCount: 6, flutingStrength: 0.15, buttressEnabled: true },
    bark: { pattern: 'FISSURED', crackDepth: 0.02, mossAmount: 0.1 },
    foliage: { shape: 'COMPOUND', colorBase: '#6e8f3a', length: 0.04, density: 18 },
    growth: { age: 0.5 },
    wind: { beaufortScale: 2, branchBendFactor: 0.1 },
  },
};

// ─── GROWTH STAGES ───────────────────────────────────────────────────────────

export const GROWTH_STAGES: GrowthStage[] = [
  {
    name: 'SEED',
    ageRange: [0.0, 0.02],
    heightMultiplier: 0.01,
    radiusMultiplier: 0.005,
    branchCountMultiplier: 0,
    leafDensityMultiplier: 0.2,
    rootDepthMultiplier: 0.05,
    barkTextureScale: 0.1,
    barkFissureDepth: 0,
    leafSize: 0.3,
    crownShape: 'conical',
    flexibility: 1.0,
    windResponseMultiplier: 2.0,
  },
  {
    name: 'SEEDLING',
    ageRange: [0.02, 0.08],
    heightMultiplier: 0.08,
    radiusMultiplier: 0.02,
    branchCountMultiplier: 0.1,
    leafDensityMultiplier: 0.4,
    rootDepthMultiplier: 0.15,
    barkTextureScale: 0.3,
    barkFissureDepth: 0.05,
    leafSize: 0.5,
    crownShape: 'conical',
    flexibility: 0.9,
    windResponseMultiplier: 1.8,
  },
  {
    name: 'SAPLING',
    ageRange: [0.08, 0.25],
    heightMultiplier: 0.35,
    radiusMultiplier: 0.12,
    branchCountMultiplier: 0.4,
    leafDensityMultiplier: 0.7,
    rootDepthMultiplier: 0.4,
    barkTextureScale: 0.6,
    barkFissureDepth: 0.2,
    leafSize: 0.8,
    crownShape: 'columnar',
    flexibility: 0.7,
    windResponseMultiplier: 1.4,
  },
  {
    name: 'POLE',
    ageRange: [0.25, 0.45],
    heightMultiplier: 0.7,
    radiusMultiplier: 0.4,
    branchCountMultiplier: 0.7,
    leafDensityMultiplier: 0.9,
    rootDepthMultiplier: 0.7,
    barkTextureScale: 0.85,
    barkFissureDepth: 0.5,
    leafSize: 0.95,
    crownShape: 'columnar',
    flexibility: 0.5,
    windResponseMultiplier: 1.1,
  },
  {
    name: 'MATURE',
    ageRange: [0.45, 0.75],
    heightMultiplier: 1.0,
    radiusMultiplier: 1.0,
    branchCountMultiplier: 1.0,
    leafDensityMultiplier: 1.0,
    rootDepthMultiplier: 1.0,
    barkTextureScale: 1.0,
    barkFissureDepth: 1.0,
    leafSize: 1.0,
    crownShape: 'spreading',
    flexibility: 0.3,
    windResponseMultiplier: 1.0,
  },
  {
    name: 'OVERMATURE',
    ageRange: [0.75, 0.9],
    heightMultiplier: 1.0,
    radiusMultiplier: 1.15,
    branchCountMultiplier: 0.85,
    leafDensityMultiplier: 0.8,
    rootDepthMultiplier: 1.0,
    barkTextureScale: 1.2,
    barkFissureDepth: 1.3,
    leafSize: 0.9,
    crownShape: 'spreading',
    flexibility: 0.2,
    windResponseMultiplier: 0.9,
  },
  {
    name: 'ANCIENT',
    ageRange: [0.9, 1.0],
    heightMultiplier: 0.95,
    radiusMultiplier: 1.3,
    branchCountMultiplier: 0.6,
    leafDensityMultiplier: 0.5,
    rootDepthMultiplier: 1.0,
    barkTextureScale: 1.5,
    barkFissureDepth: 1.6,
    leafSize: 0.7,
    crownShape: 'rounded',
    flexibility: 0.15,
    windResponseMultiplier: 0.7,
  },
];

// ─── UTILITY FUNCTIONS ───────────────────────────────────────────────────────

/** Get interpolated growth stage values for a given age */
export function interpolateGrowthStage(age: number): GrowthStage {
  const clampedAge = Math.max(0, Math.min(1, age));
  
  // Find surrounding stages
  let lower = GROWTH_STAGES[0];
  let upper = GROWTH_STAGES[GROWTH_STAGES.length - 1];
  
  for (let i = 0; i < GROWTH_STAGES.length - 1; i++) {
    if (clampedAge >= GROWTH_STAGES[i].ageRange[0] && clampedAge < GROWTH_STAGES[i + 1].ageRange[0]) {
      lower = GROWTH_STAGES[i];
      upper = GROWTH_STAGES[i + 1];
      break;
    }
  }
  
  // Calculate interpolation factor within the stage range
  const rangeStart = lower.ageRange[0];
  const rangeEnd = upper.ageRange[0];
  const t = rangeEnd > rangeStart ? (clampedAge - rangeStart) / (rangeEnd - rangeStart) : 0;
  
  // Smooth interpolation
  const smoothT = t * t * (3 - 2 * t); // Hermite smoothstep
  
  const lerp = (a: number, b: number) => a + (b - a) * smoothT;
  
  return {
    name: lower.name,
    ageRange: [clampedAge, clampedAge],
    heightMultiplier: lerp(lower.heightMultiplier, upper.heightMultiplier),
    radiusMultiplier: lerp(lower.radiusMultiplier, upper.radiusMultiplier),
    branchCountMultiplier: lerp(lower.branchCountMultiplier, upper.branchCountMultiplier),
    leafDensityMultiplier: lerp(lower.leafDensityMultiplier, upper.leafDensityMultiplier),
    rootDepthMultiplier: lerp(lower.rootDepthMultiplier, upper.rootDepthMultiplier),
    barkTextureScale: lerp(lower.barkTextureScale, upper.barkTextureScale),
    barkFissureDepth: lerp(lower.barkFissureDepth, upper.barkFissureDepth),
    leafSize: lerp(lower.leafSize, upper.leafSize),
    crownShape: lower.crownShape,
    flexibility: lerp(lower.flexibility, upper.flexibility),
    windResponseMultiplier: lerp(lower.windResponseMultiplier, upper.windResponseMultiplier),
  };
}

/** Apply species preset to base params */
export function applySpeciesPreset(
  base: HyperTreeParams, 
  speciesName: string
): HyperTreeParams {
  const preset = SPECIES_PRESETS[speciesName];
  if (!preset) return base;
  
  return {
    ...base,
    species: speciesName,
    trunk: { ...base.trunk, ...preset.trunk },
    branching: { ...base.branching, ...preset.branching },
    roots: { ...base.roots, ...preset.roots },
    bark: { ...base.bark, ...preset.bark },
    foliage: { ...base.foliage, ...preset.foliage },
    growth: { ...base.growth, ...preset.growth },
    wind: { ...base.wind, ...preset.wind },
  };
}

/** Beaufort scale to wind speed (m/s) */
export const BEAUFORT_SPEEDS = [0, 0.3, 1.5, 3.3, 5.5, 8.0, 10.8, 13.9, 17.2, 20.8, 24.5, 28.5, 32.7];
export const BEAUFORT_NAMES = [
  'Calm', 'Light Air', 'Light Breeze', 'Gentle Breeze', 'Moderate Breeze',
  'Fresh Breeze', 'Strong Breeze', 'Near Gale', 'Gale', 'Strong Gale',
  'Storm', 'Violent Storm', 'Hurricane'
];

export function getWindSpeed(beaufort: number): number {
  const idx = Math.max(0, Math.min(12, Math.round(beaufort)));
  return BEAUFORT_SPEEDS[idx];
}

export function getWindName(beaufort: number): string {
  const idx = Math.max(0, Math.min(12, Math.round(beaufort)));
  return BEAUFORT_NAMES[idx];
}
