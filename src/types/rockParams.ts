/**
 * CODEX5.3ROCKS - First-Principles Geological Parameter System
 * 
 * Architecture: Origin → Internal Structure → Surface Expression → Deformation
 * All rocks derive from 3 origins: Igneous (cooled magma), Sedimentary (compacted sediments),
 * Metamorphic (transformed under heat/pressure). This drives every downstream parameter.
 */

// ─── ORIGIN ─────────────────────────────────────────────────────────────────
// The fundamental geological class that drives internal structure & appearance
export type OriginClass = 'igneous' | 'sedimentary' | 'metamorphic';
export type IgneousType = 'plutonic' | 'volcanic' | 'hypabyssal';
export type SedimentSource = 'marine' | 'fluvial' | 'aeolian' | 'glacial' | 'lacustrine' | 'chemical';
export type MetamorphicGrade = 'low' | 'medium' | 'high' | 'ultra';
export type CementationType = 'silica' | 'calcite' | 'iron' | 'clay' | 'none';

export interface RockOriginParams {
  originClass: OriginClass;
  // Igneous
  coolingRate: number;           // 0-1 (0=slow/coarse crystals, 1=fast/glassy)
  intrusionDepth: number;        // 0-1 (0=surface/extrusive, 1=deep/intrusive)
  igneousType: IgneousType;
  silicaContent: number;         // 0-1 (0=mafic/dark, 1=felsic/light)
  gasContent: number;            // 0-1 vesicularity (pumice=1)
  // Sedimentary
  sedimentSource: SedimentSource;
  compactionPressure: number;    // 0-1
  cementationType: CementationType;
  cementationStrength: number;   // 0-1
  sortingDegree: number;         // 0-1 (0=poorly sorted, 1=well sorted)
  organicContent: number;        // 0-1
  // Metamorphic
  metamorphicGrade: MetamorphicGrade;
  parentRock: string;            // protolith
  heatPressureRatio: number;     // 0-1 (0=pressure dominant, 1=heat dominant)
  foliationIntensity: number;    // 0-1
  foliationAngle: number;        // 0-360
  recrystallization: number;     // 0-1
}

// ─── INTERNAL STRUCTURE ─────────────────────────────────────────────────────
// The volumetric grain/crystal/void matrix that defines exterior expression
export type GrainShape = 'equant' | 'tabular' | 'prismatic' | 'acicular' | 'fibrous' | 'dendritic';
export type InclusionMineral = 'quartz' | 'feldspar' | 'mica' | 'pyroxene' | 'olivine' | 'garnet' | 'tourmaline' | 'pyrite' | 'calcite';
export type FossilType = 'none' | 'shell' | 'coral' | 'ammonite' | 'crinoid' | 'plant' | 'trace';

export interface RockInternalParams {
  // Grain
  grainSize: number;             // 0-1 (0=aphanitic/fine, 1=pegmatitic/coarse)
  grainShape: GrainShape;
  grainUniformity: number;       // 0-1 (0=varied porphyritic, 1=equigranular)
  grainFlowIntensity: number;    // 0-1 directional alignment
  grainFlowAngle: number;        // 0-360
  // Crystal matrix
  crystalSize: number;           // 0-1
  crystalDensity: number;        // 0-1
  crystalOrientation: number;    // 0-1 (0=random, 1=aligned)
  phenocrystSize: number;        // 0-1 large crystals in fine matrix
  phenocrystDensity: number;     // 0-1
  // Voids & porosity
  voidDensity: number;           // 0-1
  voidSize: number;              // 0-1
  voidShape: number;             // 0-1 (0=spherical vesicles, 1=elongated)
  voidConnectivity: number;      // 0-1 (permeability)
  // Inclusions
  inclusionMineral: InclusionMineral;
  inclusionDensity: number;      // 0-1
  inclusionSize: number;         // 0-1
  inclusionColor: string;
  // Banding & foliation
  bandingIntensity: number;      // 0-1 (gneissic banding, sedimentary lamination)
  bandingScale: number;          // 0.01-1
  bandingContrast: number;       // 0-1
  bandingColor: string;
  // Fossils (sedimentary)
  fossilType: FossilType;
  fossilDensity: number;         // 0-1
  fossilSize: number;            // 0-1
  fossilPreservation: number;    // 0-1
  // Veins
  veinNetworkDensity: number;    // 0-1
  veinMineral: string;           // 'quartz' | 'calcite' | 'iron'
  veinWidth: number;             // 0-1
  veinColor: string;
  veinBranching: number;         // 0-1
}

// ─── SURFACE ────────────────────────────────────────────────────────────────
export type Luster = 'vitreous' | 'pearly' | 'silky' | 'waxy' | 'resinous' | 'adamantine' | 'metallic' | 'earthy' | 'dull';
export type CleavageType = 'none' | 'basal' | 'cubic' | 'rhombohedral' | 'prismatic' | 'pinacoidal';

export interface RockSurfaceParams {
  roughness: number;             // 0-1
  displacement: number;          // 0-2
  microDetail: number;           // 0-1
  porosity: number;              // 0-1
  glossiness: number;            // 0-1
  bumpScale: number;             // 0-3
  noiseOctaves: number;          // 1-8
  noiseFrequency: number;        // 0.1-10
  noiseLacunarity: number;       // 1-4
  noisePersistence: number;      // 0-1
  // Expanded
  luster: Luster;
  cleavageType: CleavageType;
  cleavageAngle: number;         // 0-90 degrees
  schistosity: number;           // 0-1 (layered flaky texture)
  porphyriticTexture: number;    // 0-1 (large crystals in fine matrix)
  conchoidal: number;            // 0-1 (glass-like fracture surfaces)
  transparency: number;          // 0-1 (0=opaque, 1=translucent)
  subsurfaceScatter: number;     // 0-1 (light penetration depth)
  microCrystalline: number;      // 0-1 (chalcedony, chert-like)
  exfoliationLayers: number;     // 0-1 (onion-skin peeling)
}

// ─── GEOLOGY ────────────────────────────────────────────────────────────────
export type RockType = 'granite' | 'sandstone' | 'limestone' | 'basalt' | 'marble' | 'slate'
  | 'obsidian' | 'quartzite' | 'gneiss' | 'shale' | 'pumice' | 'tuff' | 'diorite'
  | 'gabbro' | 'rhyolite' | 'andesite' | 'conglomerate' | 'breccia' | 'chalk'
  | 'dolomite' | 'mudstone' | 'siltstone' | 'phyllite' | 'schist' | 'hornfels'
  | 'migmatite' | 'eclogite' | 'serpentinite' | 'travertine' | 'flint';

export type FormationType = 'boulder' | 'cliff' | 'mountain' | 'outcrop' | 'pebble' | 'slab'
  | 'pillar' | 'arch' | 'tor' | 'stack' | 'cave_wall' | 'riverbed' | 'scree'
  | 'talus' | 'moraine' | 'dike' | 'sill' | 'batholith' | 'xenolith';

export interface RockGeologyParams {
  rockType: RockType;
  formationType: FormationType;
  stratification: number;        // 0-1
  layerThickness: number;        // 0.01-0.5
  layerAngle: number;            // 0-90
  layerDistortion: number;       // 0-1
  mineralDensity: number;        // 0-1
  mineralScale: number;          // 0.01-0.5
  foldIntensity: number;         // 0-1
  foldWavelength: number;        // 0.1-5
  foldAsymmetry: number;         // 0-1
  unconformity: number;          // 0-1 (angular unconformities between layers)
  interbedding: number;          // 0-1 (alternating layer types)
  crossBedding: number;          // 0-1 (angled internal laminations)
  crossBeddingAngle: number;     // 0-45
  rippleMarks: number;           // 0-1 (preserved wave action)
  mudCracks: number;             // 0-1 (desiccation polygons)
  loadCasts: number;             // 0-1 (soft sediment deformation)
}

// ─── WEATHERING ─────────────────────────────────────────────────────────────
export type ErosionPattern = 'uniform' | 'directional' | 'chemical' | 'freeze-thaw' | 'thermal' | 'salt' | 'abrasion' | 'glacial';

export interface RockWeatheringParams {
  erosionAmount: number;
  erosionPattern: ErosionPattern;
  waterStaining: number;
  waterFlowDirection: number;
  oxidation: number;
  lichenCoverage: number;
  lichenColor: string;
  mossCoverage: number;
  mossColor: string;
  saltDeposit: number;
  windPolish: number;
  ageYears: number;
  // Expanded
  tafoniDensity: number;         // 0-1 (honeycomb weathering cavities)
  tafoniScale: number;           // 0-1
  honeycombDensity: number;      // 0-1 (alveolar weathering)
  cavernousWeathering: number;   // 0-1
  caseHardening: number;         // 0-1 (harder outer crust)
  desertVarnish: number;         // 0-1 (dark manganese/iron coating)
  desertVarnishColor: string;
  spheroidalWeathering: number;  // 0-1 (onion-skin chemical decay)
  karstDissolution: number;      // 0-1 (limestone dissolution)
  speleothem: number;            // 0-1 (stalactite/stalagmite formations)
  rillErosion: number;           // 0-1 (water channel grooves)
  rillDepth: number;             // 0-1
  rillDirection: number;         // 0-360
  glacialStriae: number;         // 0-1 (parallel scratch marks)
  glacialPolish: number;         // 0-1
  pedestal: number;              // 0-1 (undercut mushroom shape)
  alveolarDepth: number;         // 0-1
  biologicalBoring: number;      // 0-1 (organism-created holes)
  rootWedging: number;           // 0-1 (plant root fracturing)
}

// ─── FRACTURES ──────────────────────────────────────────────────────────────
export type CrackPattern = 'random' | 'columnar' | 'conchoidal' | 'sheeting' | 'blocky' | 'radial' | 'en_echelon' | 'pinnate';
export type ExfoliationType = 'none' | 'sheeting' | 'spheroidal' | 'onion_skin';

export interface RockFractureParams {
  crackDensity: number;
  crackDepth: number;
  crackWidth: number;
  crackPattern: CrackPattern;
  crackPropagation: number;      // 0-1 (how cracks branch/grow)
  crackFill: number;             // 0-1 (mineral infill in cracks)
  crackFillColor: string;
  jointSetCount: number;
  jointAngle: number;
  jointSpacing: number;
  jointRoughness: number;        // 0-1 (smooth vs rough joint surfaces)
  jointPersistence: number;      // 0-1 (how far joints extend)
  faultOffset: number;
  faultAngle: number;
  faultGouge: number;            // 0-1 (crushed material in fault zone)
  chippingAmount: number;
  spallingDepth: number;
  // Expanded
  exfoliationType: ExfoliationType;
  exfoliationThickness: number;  // 0-1
  brecciation: number;           // 0-1 (angular fragment texture)
  brecciationScale: number;      // 0-1
  tensionCracks: number;         // 0-1
  shearZones: number;            // 0-1
  shearZoneWidth: number;        // 0-0.5
  microFractures: number;        // 0-1 (hairline fractures)
  cleavageFracture: number;      // 0-1 (mineral-plane splitting)
  hackleMarks: number;           // 0-1 (feathery fracture surface marks)
  ribMarks: number;              // 0-1 (concentric fracture marks)
  plumoseStructure: number;      // 0-1 (feather-like fracture pattern)
}

// ─── DEFORMATION ────────────────────────────────────────────────────────────
// Tools to physically alter the rock from its procedural seed
export type ImpactType = 'blunt' | 'sharp' | 'explosive' | 'projectile';
export type SplitPlaneType = 'clean' | 'rough' | 'stepped' | 'curved';
export type CarveAgent = 'water' | 'wind' | 'ice' | 'lava' | 'manual';

export interface RockDeformationParams {
  // Impact damage
  impactCount: number;           // 0-10
  impactDepth: number;           // 0-1
  impactRadius: number;          // 0-1
  impactType: ImpactType;
  impactScatter: number;         // 0-1 (ejecta/debris scatter)
  // Splitting
  splitPlaneCount: number;       // 0-5
  splitPlaneAngle: number;       // 0-180
  splitPlaneRoughness: number;   // 0-1
  splitPlaneType: SplitPlaneType;
  splitSeparation: number;       // 0-1 (how far apart split pieces)
  // Carving
  carveAgent: CarveAgent;
  carveDepth: number;            // 0-1
  carveWidth: number;            // 0-1
  carveChannelCount: number;     // 0-10
  carveSinuosity: number;        // 0-1 (winding path)
  // Tumbling/polishing
  tumblingAmount: number;        // 0-1 (river/glacial rounding)
  tumblingTime: number;          // 0-1 (duration of tumbling)
  // Compression/stress
  compressionAmount: number;     // 0-1
  compressionAxis: number;       // 0-360
  shearStress: number;           // 0-1
  shearAngle: number;            // 0-90
  // Thermal
  thermalShock: number;          // 0-1 (sudden temperature change cracking)
  thermalCycles: number;         // 0-1000
  lavaScouring: number;          // 0-1
  contactMetamorphism: number;   // 0-1 (heat alteration zone)
  // Burial/exhumation
  burialDepth: number;           // 0-1 (overburden pressure effects)
  exhumationRate: number;        // 0-1 (unloading fractures)
}

// ─── COLORING ───────────────────────────────────────────────────────────────
export interface RockColorParams {
  baseColor: string;
  secondaryColor: string;
  tertiaryColor: string;
  veinColor: string;
  veinIntensity: number;
  veinScale: number;
  colorVariation: number;
  saturation: number;
  brightness: number;
  patina: number;
  ironOxide: number;
  // Expanded
  colorNoise: number;            // 0-1 (speckled color variation)
  colorNoiseScale: number;       // 0.01-1
  bandingColors: number;         // 0-1 (strength of color banding)
  iridescence: number;           // 0-1 (labradorite play of color)
  chatoyancy: number;            // 0-1 (cat's eye effect)
  aventurescence: number;        // 0-1 (sparkle from inclusions)
  bleaching: number;             // 0-1 (chemical color removal)
  stainPenetration: number;      // 0-1 (how deep stains go)
  liesegang: number;             // 0-1 (rhythmic color banding from diffusion)
  limoniteCrust: number;         // 0-1 (yellow-brown surface iron)
  manganeseStain: number;        // 0-1 (black dendrite patterns)
}

// ─── SHAPE ──────────────────────────────────────────────────────────────────
export interface RockShapeParams {
  width: number;
  height: number;
  depth: number;
  roundness: number;
  angularity: number;
  asymmetry: number;
  taperTop: number;
  taperBottom: number;
  overhangAmount: number;
  overhangDirection: number;
  tessellation: number;
  noiseDisplacement: number;
  // Expanded
  elongation: number;            // 0-1 (prolate vs oblate)
  flatness: number;              // 0-1 (disc vs sphere)
  sphericity: number;            // 0-1 (overall roundness measure)
  concavity: number;             // 0-1 (inward-curving surfaces)
  undercuts: number;             // 0-1 (overhanging underside)
  undercutDepth: number;         // 0-1
  pinnacleCount: number;         // 0-5 (pointed protrusions)
  pinnacleHeight: number;        // 0-1
  facetCount: number;            // 0-20 (flat face count for angular rocks)
  facetSharpness: number;        // 0-1
  massDistribution: number;      // 0-1 (0=bottom-heavy, 1=top-heavy)
  coreHollowness: number;        // 0-1 (geode-like hollow interior)
}

// ─── ENVIRONMENT ────────────────────────────────────────────────────────────
export interface RockEnvironmentParams {
  groundEmbedding: number;
  scatterDensity: number;
  scatterScale: number;
  dustAmount: number;
  snowCoverage: number;
  snowAngleThreshold: number;
  waterPooling: number;
  vegetationGrowth: number;
  // Expanded
  tectonicStress: number;        // 0-1 (active tectonic compression)
  submersionDepth: number;       // 0-1 (underwater portion)
  tideLine: number;              // 0-1 (visible tide mark)
  acidRainExposure: number;      // 0-1
  thermalVentProximity: number;  // 0-1 (mineral deposits)
  permafrostDepth: number;       // 0-1
  windExposure: number;          // 0-1
  windDirection: number;         // 0-360
  solarExposure: number;         // 0-1 (differential weathering)
  rainfallIntensity: number;     // 0-1
  altitude: number;              // 0-1 (affects weathering type)
  soilContact: number;           // 0-1 (soil staining/chemistry)
  debrisApron: number;           // 0-1 (talus/scree at base)
  debrisSize: number;            // 0-1
}

// ─── LOD ────────────────────────────────────────────────────────────────────
export type RockLODLevel = 'hero' | 'near' | 'mid' | 'far';

export interface RockLODParams {
  lodLevel: RockLODLevel;
  lodBias: number;
  normalMapIntensity: number;
  parallaxDepth: number;
  displacementSubdivisions: number;
}

// ─── UNIFIED PARAMS ─────────────────────────────────────────────────────────
export interface HyperRockParams {
  origin: RockOriginParams;
  internalStructure: RockInternalParams;
  surface: RockSurfaceParams;
  geology: RockGeologyParams;
  weathering: RockWeatheringParams;
  fractures: RockFractureParams;
  deformation: RockDeformationParams;
  color: RockColorParams;
  shape: RockShapeParams;
  environment: RockEnvironmentParams;
  lod: RockLODParams;
}

// ─── DEFAULTS ───────────────────────────────────────────────────────────────
export const DEFAULT_ROCK_PARAMS: HyperRockParams = {
  origin: {
    originClass: 'igneous',
    coolingRate: 0.3,
    intrusionDepth: 0.7,
    igneousType: 'plutonic',
    silicaContent: 0.65,
    gasContent: 0,
    sedimentSource: 'marine',
    compactionPressure: 0.5,
    cementationType: 'silica',
    cementationStrength: 0.5,
    sortingDegree: 0.5,
    organicContent: 0,
    metamorphicGrade: 'medium',
    parentRock: 'granite',
    heatPressureRatio: 0.5,
    foliationIntensity: 0.3,
    foliationAngle: 0,
    recrystallization: 0.3,
  },
  internalStructure: {
    grainSize: 0.4,
    grainShape: 'equant',
    grainUniformity: 0.6,
    grainFlowIntensity: 0.1,
    grainFlowAngle: 0,
    crystalSize: 0.3,
    crystalDensity: 0.2,
    crystalOrientation: 0.2,
    phenocrystSize: 0.1,
    phenocrystDensity: 0.05,
    voidDensity: 0.1,
    voidSize: 0.2,
    voidShape: 0.3,
    voidConnectivity: 0.1,
    inclusionMineral: 'quartz',
    inclusionDensity: 0.1,
    inclusionSize: 0.2,
    inclusionColor: '#e8e0d0',
    bandingIntensity: 0.1,
    bandingScale: 0.1,
    bandingContrast: 0.3,
    bandingColor: '#555555',
    fossilType: 'none',
    fossilDensity: 0,
    fossilSize: 0.3,
    fossilPreservation: 0.5,
    veinNetworkDensity: 0.2,
    veinMineral: 'quartz',
    veinWidth: 0.3,
    veinColor: '#d4cfc5',
    veinBranching: 0.3,
  },
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
    luster: 'dull',
    cleavageType: 'none',
    cleavageAngle: 0,
    schistosity: 0,
    porphyriticTexture: 0,
    conchoidal: 0,
    transparency: 0,
    subsurfaceScatter: 0,
    microCrystalline: 0,
    exfoliationLayers: 0,
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
    foldIntensity: 0.0,
    foldWavelength: 1.0,
    foldAsymmetry: 0.0,
    unconformity: 0,
    interbedding: 0,
    crossBedding: 0,
    crossBeddingAngle: 20,
    rippleMarks: 0,
    mudCracks: 0,
    loadCasts: 0,
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
    tafoniDensity: 0,
    tafoniScale: 0.3,
    honeycombDensity: 0,
    cavernousWeathering: 0,
    caseHardening: 0,
    desertVarnish: 0,
    desertVarnishColor: '#2a1810',
    spheroidalWeathering: 0,
    karstDissolution: 0,
    speleothem: 0,
    rillErosion: 0,
    rillDepth: 0.3,
    rillDirection: 180,
    glacialStriae: 0,
    glacialPolish: 0,
    pedestal: 0,
    alveolarDepth: 0.2,
    biologicalBoring: 0,
    rootWedging: 0,
  },
  fractures: {
    crackDensity: 0.3,
    crackDepth: 0.4,
    crackWidth: 0.02,
    crackPattern: 'random',
    crackPropagation: 0.3,
    crackFill: 0,
    crackFillColor: '#d4cfc5',
    jointSetCount: 1,
    jointAngle: 45,
    jointSpacing: 0.5,
    jointRoughness: 0.5,
    jointPersistence: 0.5,
    faultOffset: 0.0,
    faultAngle: 60,
    faultGouge: 0,
    chippingAmount: 0.2,
    spallingDepth: 0.1,
    exfoliationType: 'none',
    exfoliationThickness: 0.3,
    brecciation: 0,
    brecciationScale: 0.3,
    tensionCracks: 0,
    shearZones: 0,
    shearZoneWidth: 0.1,
    microFractures: 0.1,
    cleavageFracture: 0,
    hackleMarks: 0,
    ribMarks: 0,
    plumoseStructure: 0,
  },
  deformation: {
    impactCount: 0,
    impactDepth: 0.3,
    impactRadius: 0.3,
    impactType: 'blunt',
    impactScatter: 0.2,
    splitPlaneCount: 0,
    splitPlaneAngle: 0,
    splitPlaneRoughness: 0.5,
    splitPlaneType: 'rough',
    splitSeparation: 0,
    carveAgent: 'water',
    carveDepth: 0,
    carveWidth: 0.3,
    carveChannelCount: 0,
    carveSinuosity: 0.5,
    tumblingAmount: 0,
    tumblingTime: 0.5,
    compressionAmount: 0,
    compressionAxis: 0,
    shearStress: 0,
    shearAngle: 45,
    thermalShock: 0,
    thermalCycles: 0,
    lavaScouring: 0,
    contactMetamorphism: 0,
    burialDepth: 0,
    exhumationRate: 0,
  },
  color: {
    baseColor: '#6b6b6b',
    secondaryColor: '#8a8076',
    tertiaryColor: '#5a5550',
    veinColor: '#d4cfc5',
    veinIntensity: 0.3,
    veinScale: 1.0,
    colorVariation: 0.3,
    saturation: 0.8,
    brightness: 1.0,
    patina: 0.2,
    ironOxide: 0.1,
    colorNoise: 0.2,
    colorNoiseScale: 0.1,
    bandingColors: 0.1,
    iridescence: 0,
    chatoyancy: 0,
    aventurescence: 0,
    bleaching: 0,
    stainPenetration: 0.3,
    liesegang: 0,
    limoniteCrust: 0,
    manganeseStain: 0,
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
    elongation: 0.3,
    flatness: 0.2,
    sphericity: 0.5,
    concavity: 0,
    undercuts: 0,
    undercutDepth: 0.2,
    pinnacleCount: 0,
    pinnacleHeight: 0.3,
    facetCount: 0,
    facetSharpness: 0.5,
    massDistribution: 0.5,
    coreHollowness: 0,
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
    tectonicStress: 0,
    submersionDepth: 0,
    tideLine: 0,
    acidRainExposure: 0,
    thermalVentProximity: 0,
    permafrostDepth: 0,
    windExposure: 0.3,
    windDirection: 270,
    solarExposure: 0.5,
    rainfallIntensity: 0.3,
    altitude: 0.3,
    soilContact: 0.2,
    debrisApron: 0.1,
    debrisSize: 0.3,
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
export type RockPresetName =
  | 'granite_boulder' | 'sandstone_arch' | 'basalt_columns' | 'marble_slab'
  | 'limestone_cliff' | 'slate_outcrop' | 'obsidian_shard' | 'mountain_face'
  | 'pumice_volcanic' | 'conglomerate_river' | 'quartzite_ridge' | 'schist_foliated'
  | 'travertine_terraced' | 'flint_nodule' | 'breccia_fault' | 'gneiss_banded';

export const ROCK_PRESETS: Record<RockPresetName, Partial<HyperRockParams>> = {
  granite_boulder: {
    origin: { ...DEFAULT_ROCK_PARAMS.origin, originClass: 'igneous', coolingRate: 0.2, intrusionDepth: 0.8, igneousType: 'plutonic', silicaContent: 0.7 },
    internalStructure: { ...DEFAULT_ROCK_PARAMS.internalStructure, grainSize: 0.5, crystalSize: 0.5, crystalDensity: 0.6, grainUniformity: 0.6 },
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'granite', formationType: 'boulder' },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#8c8c8c', secondaryColor: '#a39e94', colorNoise: 0.4 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, roundness: 0.5, angularity: 0.3, width: 2.5, height: 2.0, depth: 2.2 },
    deformation: { ...DEFAULT_ROCK_PARAMS.deformation, tumblingAmount: 0.4 },
  },
  sandstone_arch: {
    origin: { ...DEFAULT_ROCK_PARAMS.origin, originClass: 'sedimentary', sedimentSource: 'aeolian', compactionPressure: 0.6, cementationType: 'iron', sortingDegree: 0.8 },
    internalStructure: { ...DEFAULT_ROCK_PARAMS.internalStructure, grainSize: 0.6, grainShape: 'equant', grainUniformity: 0.7 },
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'sandstone', formationType: 'arch', stratification: 0.8, crossBedding: 0.6, crossBeddingAngle: 25 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#c4956a', secondaryColor: '#a87042', liesegang: 0.4 },
    weathering: { ...DEFAULT_ROCK_PARAMS.weathering, erosionAmount: 0.7, erosionPattern: 'directional', windPolish: 0.5, tafoniDensity: 0.4 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 6, height: 8, depth: 2, roundness: 0.6, overhangAmount: 0.7 },
  },
  basalt_columns: {
    origin: { ...DEFAULT_ROCK_PARAMS.origin, originClass: 'igneous', coolingRate: 0.5, intrusionDepth: 0.1, igneousType: 'volcanic', silicaContent: 0.3 },
    internalStructure: { ...DEFAULT_ROCK_PARAMS.internalStructure, grainSize: 0.1, crystalSize: 0.05, voidDensity: 0.05 },
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'basalt', formationType: 'pillar' },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#2d2d2d', secondaryColor: '#3a3a3a' },
    fractures: { ...DEFAULT_ROCK_PARAMS.fractures, crackPattern: 'columnar', crackDensity: 0.8, jointSetCount: 3, jointSpacing: 0.3 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 1.0, height: 5.0, depth: 1.0, angularity: 0.9, roundness: 0.1, facetCount: 6, facetSharpness: 0.8 },
  },
  marble_slab: {
    origin: { ...DEFAULT_ROCK_PARAMS.origin, originClass: 'metamorphic', metamorphicGrade: 'high', parentRock: 'limestone', heatPressureRatio: 0.7, recrystallization: 0.9 },
    internalStructure: { ...DEFAULT_ROCK_PARAMS.internalStructure, crystalSize: 0.6, veinNetworkDensity: 0.7, veinColor: '#6b6b6b', veinWidth: 0.4 },
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'marble', formationType: 'slab', foldIntensity: 0.5 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#e8e4df', secondaryColor: '#d5cfc5', veinColor: '#6b6b6b', veinIntensity: 0.7, veinScale: 2.0 },
    surface: { ...DEFAULT_ROCK_PARAMS.surface, glossiness: 0.7, roughness: 0.2, luster: 'vitreous', subsurfaceScatter: 0.3 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 3, height: 0.5, depth: 2, roundness: 0.1, angularity: 0.8 },
  },
  limestone_cliff: {
    origin: { ...DEFAULT_ROCK_PARAMS.origin, originClass: 'sedimentary', sedimentSource: 'marine', compactionPressure: 0.7, cementationType: 'calcite' },
    internalStructure: { ...DEFAULT_ROCK_PARAMS.internalStructure, fossilType: 'shell', fossilDensity: 0.4, fossilSize: 0.3 },
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'limestone', formationType: 'cliff', stratification: 0.9, layerThickness: 0.15 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#c9c0a8', secondaryColor: '#b0a78f' },
    weathering: { ...DEFAULT_ROCK_PARAMS.weathering, erosionAmount: 0.5, erosionPattern: 'chemical', karstDissolution: 0.4, waterStaining: 0.6 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 10, height: 15, depth: 3, angularity: 0.7, taperTop: 0.1 },
  },
  slate_outcrop: {
    origin: { ...DEFAULT_ROCK_PARAMS.origin, originClass: 'metamorphic', metamorphicGrade: 'low', parentRock: 'shale', foliationIntensity: 0.9 },
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'slate', formationType: 'outcrop', stratification: 0.95, layerThickness: 0.03 },
    surface: { ...DEFAULT_ROCK_PARAMS.surface, cleavageType: 'basal', schistosity: 0.3 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#4a5055', secondaryColor: '#3a3f44' },
    fractures: { ...DEFAULT_ROCK_PARAMS.fractures, crackPattern: 'sheeting', crackDensity: 0.6, cleavageFracture: 0.8 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 4, height: 3, depth: 1.5, angularity: 0.8, flatness: 0.6 },
  },
  obsidian_shard: {
    origin: { ...DEFAULT_ROCK_PARAMS.origin, originClass: 'igneous', coolingRate: 1.0, intrusionDepth: 0, igneousType: 'volcanic', silicaContent: 0.9 },
    internalStructure: { ...DEFAULT_ROCK_PARAMS.internalStructure, grainSize: 0, crystalSize: 0, crystalDensity: 0 },
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'obsidian', formationType: 'slab' },
    surface: { ...DEFAULT_ROCK_PARAMS.surface, glossiness: 0.9, roughness: 0.05, luster: 'vitreous', conchoidal: 0.9 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#0a0a0f', secondaryColor: '#1a1a25' },
    fractures: { ...DEFAULT_ROCK_PARAMS.fractures, crackPattern: 'conchoidal', crackDensity: 0.4, hackleMarks: 0.6, ribMarks: 0.5 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 1, height: 2, depth: 0.3, angularity: 0.95, roundness: 0 },
  },
  mountain_face: {
    origin: { ...DEFAULT_ROCK_PARAMS.origin, originClass: 'metamorphic', metamorphicGrade: 'high', parentRock: 'granite', foliationIntensity: 0.5 },
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'gneiss', formationType: 'mountain', foldIntensity: 0.6, stratification: 0.5 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#6b6560', secondaryColor: '#7a7570' },
    weathering: { ...DEFAULT_ROCK_PARAMS.weathering, erosionAmount: 0.6, ageYears: 500000, lichenCoverage: 0.3, mossCoverage: 0.15, rillErosion: 0.4 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 20, height: 25, depth: 8, asymmetry: 0.5, angularity: 0.6 },
    environment: { ...DEFAULT_ROCK_PARAMS.environment, altitude: 0.8, windExposure: 0.7, debrisApron: 0.5 },
  },
  pumice_volcanic: {
    origin: { ...DEFAULT_ROCK_PARAMS.origin, originClass: 'igneous', coolingRate: 0.9, igneousType: 'volcanic', silicaContent: 0.7, gasContent: 0.8 },
    internalStructure: { ...DEFAULT_ROCK_PARAMS.internalStructure, voidDensity: 0.8, voidSize: 0.4, voidShape: 0.6, grainSize: 0 },
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'pumice', formationType: 'pebble' },
    surface: { ...DEFAULT_ROCK_PARAMS.surface, roughness: 0.9, porosity: 0.8, luster: 'dull' },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#d4ccc0', secondaryColor: '#c4bbb0', brightness: 1.3 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 0.5, height: 0.4, depth: 0.5, roundness: 0.6, noiseDisplacement: 0.8 },
  },
  conglomerate_river: {
    origin: { ...DEFAULT_ROCK_PARAMS.origin, originClass: 'sedimentary', sedimentSource: 'fluvial', compactionPressure: 0.4, sortingDegree: 0.1 },
    internalStructure: { ...DEFAULT_ROCK_PARAMS.internalStructure, grainSize: 0.9, grainUniformity: 0.1, inclusionDensity: 0.7, inclusionSize: 0.6 },
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'conglomerate', formationType: 'riverbed' },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#8a7e70', colorNoise: 0.8, colorVariation: 0.7 },
    deformation: { ...DEFAULT_ROCK_PARAMS.deformation, tumblingAmount: 0.6 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, roundness: 0.7, width: 1.5, height: 0.8, depth: 1.2 },
  },
  quartzite_ridge: {
    origin: { ...DEFAULT_ROCK_PARAMS.origin, originClass: 'metamorphic', metamorphicGrade: 'medium', parentRock: 'sandstone', recrystallization: 0.8 },
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'quartzite', formationType: 'outcrop' },
    surface: { ...DEFAULT_ROCK_PARAMS.surface, glossiness: 0.4, roughness: 0.4, luster: 'vitreous', microCrystalline: 0.6 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#e0d8cc', secondaryColor: '#c8c0b0', aventurescence: 0.2 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 5, height: 4, depth: 2.5, angularity: 0.7 },
  },
  schist_foliated: {
    origin: { ...DEFAULT_ROCK_PARAMS.origin, originClass: 'metamorphic', metamorphicGrade: 'medium', parentRock: 'shale', foliationIntensity: 0.9 },
    internalStructure: { ...DEFAULT_ROCK_PARAMS.internalStructure, bandingIntensity: 0.7, bandingContrast: 0.6, inclusionMineral: 'mica', inclusionDensity: 0.5 },
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'schist', formationType: 'outcrop' },
    surface: { ...DEFAULT_ROCK_PARAMS.surface, schistosity: 0.8, luster: 'silky' },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#5a5a5a', secondaryColor: '#7a7570', aventurescence: 0.3 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, flatness: 0.5 },
  },
  travertine_terraced: {
    origin: { ...DEFAULT_ROCK_PARAMS.origin, originClass: 'sedimentary', sedimentSource: 'chemical', cementationType: 'calcite' },
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'travertine', formationType: 'slab', stratification: 0.7, layerThickness: 0.05 },
    surface: { ...DEFAULT_ROCK_PARAMS.surface, porosity: 0.5, glossiness: 0.3 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#e8dcc8', secondaryColor: '#d4c8b4', bandingColors: 0.6, liesegang: 0.5 },
    weathering: { ...DEFAULT_ROCK_PARAMS.weathering, speleothem: 0.5, waterStaining: 0.4 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 4, height: 1, depth: 3, flatness: 0.7 },
  },
  flint_nodule: {
    origin: { ...DEFAULT_ROCK_PARAMS.origin, originClass: 'sedimentary', sedimentSource: 'chemical', cementationType: 'silica' },
    internalStructure: { ...DEFAULT_ROCK_PARAMS.internalStructure, grainSize: 0, microCrystalline: 0.9 } as any,
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'flint', formationType: 'pebble' },
    surface: { ...DEFAULT_ROCK_PARAMS.surface, conchoidal: 0.9, glossiness: 0.5, roughness: 0.2, luster: 'waxy', microCrystalline: 0.9 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#2a2a2a', secondaryColor: '#3a3530' },
    fractures: { ...DEFAULT_ROCK_PARAMS.fractures, crackPattern: 'conchoidal', hackleMarks: 0.7 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 0.4, height: 0.3, depth: 0.35, roundness: 0.6, sphericity: 0.7 },
  },
  breccia_fault: {
    origin: { ...DEFAULT_ROCK_PARAMS.origin, originClass: 'sedimentary', compactionPressure: 0.3, sortingDegree: 0 },
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'breccia', formationType: 'outcrop' },
    fractures: { ...DEFAULT_ROCK_PARAMS.fractures, brecciation: 0.9, brecciationScale: 0.5, crackDensity: 0.7 },
    deformation: { ...DEFAULT_ROCK_PARAMS.deformation, impactCount: 3, shearStress: 0.6 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#7a6a5a', colorNoise: 0.9, colorVariation: 0.8 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, angularity: 0.9, roundness: 0.1, width: 3, height: 2.5 },
  },
  gneiss_banded: {
    origin: { ...DEFAULT_ROCK_PARAMS.origin, originClass: 'metamorphic', metamorphicGrade: 'high', parentRock: 'granite', foliationIntensity: 0.7, recrystallization: 0.7 },
    internalStructure: { ...DEFAULT_ROCK_PARAMS.internalStructure, bandingIntensity: 0.9, bandingContrast: 0.8, bandingColor: '#d0c8b8' },
    geology: { ...DEFAULT_ROCK_PARAMS.geology, rockType: 'gneiss', formationType: 'outcrop', foldIntensity: 0.5, foldWavelength: 1.5 },
    color: { ...DEFAULT_ROCK_PARAMS.color, baseColor: '#5a5a5a', secondaryColor: '#8a8580', bandingColors: 0.8 },
    shape: { ...DEFAULT_ROCK_PARAMS.shape, width: 3, height: 2.5, depth: 2, angularity: 0.5 },
  },
};
