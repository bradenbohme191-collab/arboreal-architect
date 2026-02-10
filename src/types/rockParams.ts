/**
 * CODEX5.3ROCKS - Hyper-Realistic Procedural Rock/Boulder/Cliff Parameter Types
 */

// ─── SURFACE ────────────────────────────────────────────────────────────────
export interface RockSurfaceParams {
  roughness: number;           // 0-1
  displacement: number;        // 0-2 height multiplier
  microDetail: number;         // 0-1 fine grain
  porosity: number;            // 0-1 pore density
  glossiness: number;          // 0-1 wet/polished look
  bumpScale: number;           // 0-3
  noiseOctaves: number;        // 1-8
  noiseFrequency: number;      // 0.1-10
  noiseLacunarity: number;     // 1-4
  noisePersistence: number;    // 0-1
}

// ─── GEOLOGY ────────────────────────────────────────────────────────────────
export type RockType = 'granite' | 'sandstone' | 'limestone' | 'basalt' | 'marble' | 'slate' | 'obsidian' | 'quartzite' | 'gneiss' | 'shale';
export type FormationType = 'boulder' | 'cliff' | 'mountain' | 'outcrop' | 'pebble' | 'slab' | 'pillar' | 'arch';

export interface RockGeologyParams {
  rockType: RockType;
  formationType: FormationType;
  stratification: number;      // 0-1 layer visibility
  layerThickness: number;      // 0.01-0.5
  layerAngle: number;          // 0-90 degrees
  layerDistortion: number;     // 0-1
  mineralDensity: number;      // 0-1
  mineralScale: number;        // 0.01-0.5
  crystalSize: number;         // 0-1
  crystalDensity: number;      // 0-1
  grainSize: number;           // 0-1
  foldIntensity: number;       // 0-1 metamorphic folding
}

// ─── WEATHERING ─────────────────────────────────────────────────────────────
export interface RockWeatheringParams {
  erosionAmount: number;       // 0-1
  erosionPattern: 'uniform' | 'directional' | 'chemical' | 'freeze-thaw';
  waterStaining: number;       // 0-1
  waterFlowDirection: number;  // 0-360 degrees
  oxidation: number;           // 0-1 rust/iron staining
  lichenCoverage: number;      // 0-1
  lichenColor: string;
  mossCoverage: number;        // 0-1
  mossColor: string;
  saltDeposit: number;         // 0-1
  windPolish: number;          // 0-1
  ageYears: number;            // 0-1000000 geological age
}

// ─── FRACTURES ──────────────────────────────────────────────────────────────
export interface RockFractureParams {
  crackDensity: number;        // 0-1
  crackDepth: number;          // 0-1
  crackWidth: number;          // 0-0.1
  crackPattern: 'random' | 'columnar' | 'conchoidal' | 'sheeting' | 'blocky';
  jointSetCount: number;       // 0-3
  jointAngle: number;          // 0-90
  jointSpacing: number;        // 0.1-2
  faultOffset: number;         // 0-1
  faultAngle: number;          // 0-90
  chippingAmount: number;      // 0-1
  spallingDepth: number;       // 0-0.5
}

// ─── COLORING ───────────────────────────────────────────────────────────────
export interface RockColorParams {
  baseColor: string;
  secondaryColor: string;
  veinColor: string;
  veinIntensity: number;       // 0-1
  veinScale: number;           // 0.1-5
  colorVariation: number;      // 0-1
  saturation: number;          // 0-2
  brightness: number;          // 0-2
  patina: number;              // 0-1 surface age coloring
  ironOxide: number;           // 0-1
}

// ─── SHAPE ──────────────────────────────────────────────────────────────────
export interface RockShapeParams {
  width: number;               // 0.1-20
  height: number;              // 0.1-30
  depth: number;               // 0.1-20
  roundness: number;           // 0-1
  angularity: number;          // 0-1
  asymmetry: number;           // 0-1
  taperTop: number;            // 0-1
  taperBottom: number;         // 0-1
  overhangAmount: number;      // 0-1
  overhangDirection: number;   // 0-360
  tessellation: number;        // 4-256 mesh resolution
  noiseDisplacement: number;   // 0-2
}

// ─── ENVIRONMENT ────────────────────────────────────────────────────────────
export interface RockEnvironmentParams {
  groundEmbedding: number;     // 0-1 how deep in ground
  scatterDensity: number;      // 0-1 debris/smaller rocks
  scatterScale: number;        // 0.01-0.5
  dustAmount: number;          // 0-1
  snowCoverage: number;        // 0-1
  snowAngleThreshold: number;  // 0-90
  waterPooling: number;        // 0-1
  vegetationGrowth: number;    // 0-1 cracks/crevice plants
}

// ─── LOD ────────────────────────────────────────────────────────────────────
export type RockLODLevel = 'hero' | 'near' | 'mid' | 'far';

export interface RockLODParams {
  lodLevel: RockLODLevel;
  lodBias: number;             // 0-2
  normalMapIntensity: number;  // 0-2
  parallaxDepth: number;       // 0-0.1
  displacementSubdivisions: number; // 1-8
}

// ─── UNIFIED PARAMS ─────────────────────────────────────────────────────────
export interface HyperRockParams {
  surface: RockSurfaceParams;
  geology: RockGeologyParams;
  weathering: RockWeatheringParams;
  fractures: RockFractureParams;
  color: RockColorParams;
  shape: RockShapeParams;
  environment: RockEnvironmentParams;
  lod: RockLODParams;
}

// ─── DEFAULTS ───────────────────────────────────────────────────────────────
export const DEFAULT_ROCK_PARAMS: HyperRockParams = {
  surface: {
    roughness: 0.7,
    displacement: 0.5,
    microDetail: 0.5,
    porosity: 0.3,
    glossiness: 0.1,
    bumpScale: 1.0,
    noiseOctaves: 5,
    noiseFrequency: 2.0,
    noiseLacunarity: 2.1,
    noisePersistence: 0.5,
  },
  geology: {
    rockType: 'granite',
    formationType: 'boulder',
    stratification: 0.3,
    layerThickness: 0.1,
    layerAngle: 15,
    layerDistortion: 0.2,
    mineralDensity: 0.4,
    mineralScale: 0.05,
    crystalSize: 0.3,
    crystalDensity: 0.2,
    grainSize: 0.4,
    foldIntensity: 0.0,
  },
  weathering: {
    erosionAmount: 0.3,
    erosionPattern: 'uniform',
    waterStaining: 0.2,
    waterFlowDirection: 180,
    oxidation: 0.15,
    lichenCoverage: 0.1,
    lichenColor: '#7a8a3a',
    mossCoverage: 0.05,
    mossColor: '#2d5a1e',
    saltDeposit: 0.0,
    windPolish: 0.1,
    ageYears: 50000,
  },
  fractures: {
    crackDensity: 0.3,
    crackDepth: 0.4,
    crackWidth: 0.02,
    crackPattern: 'random',
    jointSetCount: 1,
    jointAngle: 45,
    jointSpacing: 0.5,
    faultOffset: 0.0,
    faultAngle: 60,
    chippingAmount: 0.2,
    spallingDepth: 0.1,
  },
  color: {
    baseColor: '#6b6b6b',
    secondaryColor: '#8a8076',
    veinColor: '#d4cfc5',
    veinIntensity: 0.3,
    veinScale: 1.0,
    colorVariation: 0.3,
    saturation: 0.8,
    brightness: 1.0,
    patina: 0.2,
    ironOxide: 0.1,
  },
  shape: {
    width: 2.0,
    height: 1.5,
    depth: 1.8,
    roundness: 0.4,
    angularity: 0.5,
    asymmetry: 0.3,
    taperTop: 0.2,
    taperBottom: 0.1,
    overhangAmount: 0.0,
    overhangDirection: 0,
    tessellation: 64,
    noiseDisplacement: 0.5,
  },
  environment: {
    groundEmbedding: 0.2,
    scatterDensity: 0.1,
    scatterScale: 0.1,
    dustAmount: 0.1,
    snowCoverage: 0.0,
    snowAngleThreshold: 30,
    waterPooling: 0.0,
    vegetationGrowth: 0.05,
  },
  lod: {
    lodLevel: 'near',
    lodBias: 1.0,
    normalMapIntensity: 1.0,
    parallaxDepth: 0.03,
    displacementSubdivisions: 4,
  },
};

// ─── PRESETS ─────────────────────────────────────────────────────────────────
export type RockPresetName = 'granite_boulder' | 'sandstone_arch' | 'basalt_columns' | 'marble_slab' | 'limestone_cliff' | 'slate_outcrop' | 'obsidian_shard' | 'mountain_face';

export const ROCK_PRESETS: Record<RockPresetName, Partial<HyperRockParams>> = {
  granite_boulder: {
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'granite', formationType: 'boulder', crystalSize: 0.5, crystalDensity: 0.6, grainSize: 0.5 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#8c8c8c', secondaryColor: '#a39e94', veinColor: '#f0ebe3' },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, roundness: 0.5, angularity: 0.3, width: 2.5, height: 2.0, depth: 2.2 },
  },
  sandstone_arch: {
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'sandstone', formationType: 'arch', stratification: 0.8, layerThickness: 0.08, grainSize: 0.7 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#c4956a', secondaryColor: '#a87042', veinColor: '#e8d5b7' },
    weathering: { ...DEFAULT_ROCK_PARAMS.weathering, erosionAmount: 0.7, erosionPattern: 'directional', windPolish: 0.5 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 6, height: 8, depth: 2, roundness: 0.6, overhangAmount: 0.7 },
  },
  basalt_columns: {
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'basalt', formationType: 'pillar', crystalSize: 0.1, grainSize: 0.1 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#2d2d2d', secondaryColor: '#3a3a3a', veinColor: '#555' },
    fractures: { ...DEFAULT_ROCK_PARAMS.fractures, crackPattern: 'columnar', crackDensity: 0.8, jointSetCount: 3, jointSpacing: 0.3 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 1.0, height: 5.0, depth: 1.0, angularity: 0.9, roundness: 0.1 },
  },
  marble_slab: {
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'marble', formationType: 'slab', crystalSize: 0.6, foldIntensity: 0.5 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#e8e4df', secondaryColor: '#d5cfc5', veinColor: '#6b6b6b', veinIntensity: 0.7, veinScale: 2.0 },
    surface: { ...DEFAULT_ROCK_PARAMS.surface, glossiness: 0.7, roughness: 0.2 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 3, height: 0.5, depth: 2, roundness: 0.1, angularity: 0.8 },
  },
  limestone_cliff: {
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'limestone', formationType: 'cliff', stratification: 0.9, layerThickness: 0.15 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#c9c0a8', secondaryColor: '#b0a78f', veinColor: '#d9d3c3' },
    weathering: { ...DEFAULT_ROCK_PARAMS.weathering, erosionAmount: 0.5, erosionPattern: 'chemical', waterStaining: 0.6 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 10, height: 15, depth: 3, angularity: 0.7, taperTop: 0.1 },
  },
  slate_outcrop: {
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'slate', formationType: 'outcrop', stratification: 0.95, layerThickness: 0.03 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#4a5055', secondaryColor: '#3a3f44', veinColor: '#6a6f74' },
    fractures: { ...DEFAULT_ROCK_PARAMS.fractures, crackPattern: 'sheeting', crackDensity: 0.6 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 4, height: 3, depth: 1.5, angularity: 0.8 },
  },
  obsidian_shard: {
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'obsidian', formationType: 'slab', crystalSize: 0, grainSize: 0 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#0a0a0f', secondaryColor: '#1a1a25', veinColor: '#2a2a3a' },
    surface: { ...DEFAULT_ROCK_PARAMS.surface, glossiness: 0.9, roughness: 0.05 },
    fractures: { ...DEFAULT_ROCK_PARAMS.fractures, crackPattern: 'conchoidal', crackDensity: 0.4 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 1, height: 2, depth: 0.3, angularity: 0.95, roundness: 0 },
  },
  mountain_face: {
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'gneiss', formationType: 'mountain', foldIntensity: 0.6, stratification: 0.5 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#6b6560', secondaryColor: '#7a7570', veinColor: '#958f85' },
    weathering: { ...DEFAULT_ROCK_PARAMS.weathering, erosionAmount: 0.6, ageYears: 500000, lichenCoverage: 0.3, mossCoverage: 0.15 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 20, height: 25, depth: 8, asymmetry: 0.5, angularity: 0.6 },
  },
};
