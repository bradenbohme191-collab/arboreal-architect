# Hyper-Realistic Procedural Vegetation Engine — Technical Specification

**Version:** 2.0.0  
**Date:** 2026-02-08  
**Status:** Master Implementation Blueprint  
**Target:** Hero-camera (<1m) hyper-realism with full physics simulation

---

## EXECUTIVE SUMMARY

This document specifies the complete architecture for a hyper-realistic procedural tree engine featuring:

1. **Volumetric Soil System** — 3D procedural soil with moisture/nutrient fields affecting root growth
2. **Biologically Accurate Root Networks** — Complex root systems that merge organically with trunk via fluting
3. **Full Growth Timeline** — Seed-to-mature age slider with realistic developmental stages
4. **Hierarchical Wind Physics** — Drag cascade: leaves → twigs → branches → trunk with force propagation
5. **Breakable Bark Layers** — Multi-layer procedural bark with collision physics and peeling
6. **Deformation & Damage** — Knots, broken limbs, stress-based branch breaking
7. **Hyper-Realistic Foliage** — Leaf veins, petiole connections, flowing movement

---

## SECTION 1: VOLUMETRIC SOIL SYSTEM

### 1.1 Soil Grid Architecture

```typescript
interface SoilVoxel {
  moisture: number;      // 0-1, affects root growth direction
  nutrients: number;     // 0-1, affects root thickness
  density: number;       // 0-1, affects root resistance
  organicMatter: number; // 0-1, affects color and fertility
  temperature: number;   // -10 to 40°C, affects growth rate
  ph: number;            // 4-9, affects nutrient availability
  rockPresence: number;  // 0-1, blocks root growth
}

interface SoilField {
  resolution: [number, number, number]; // 32x32x16 voxels
  bounds: { min: Vector3; max: Vector3 };
  voxels: Float32Array; // Packed soil data
  waterTable: number;   // Depth of water table
  layers: SoilLayer[];  // Horizontal soil horizons
}

interface SoilLayer {
  depth: number;        // Start depth
  thickness: number;    // Layer thickness
  type: 'topsoil' | 'subsoil' | 'bedrock' | 'clay' | 'sand';
  color: string;
  permeability: number;
}
```

### 1.2 Moisture Dynamics

- Water flows downward with gravity, spreads laterally based on permeability
- Roots absorb moisture, creating depletion zones
- Surface evaporation reduces topsoil moisture
- Rain events increase surface moisture that percolates down
- Water table provides constant moisture at depth

### 1.3 Nutrient Distribution

- Nutrients concentrate in organic-rich topsoil
- Root uptake creates nutrient gradients
- Decomposition adds nutrients near surface
- Leaching moves nutrients downward over time

---

## SECTION 2: BIOLOGICALLY ACCURATE ROOT SYSTEM

### 2.1 Root Architecture Types

```typescript
type RootArchitecture = 
  | 'TAP_ROOT'      // Deep central root (oak, walnut)
  | 'FIBROUS'       // Dense shallow network (grass, spruce)
  | 'HEART'         // Compact heart-shaped (birch, maple)
  | 'PLATE'         // Shallow spreading (pine on rocky soil)
  | 'BUTTRESS';     // Surface roots with aerial buttresses (tropical)

interface RootSystem {
  architecture: RootArchitecture;
  primaryRoots: RootNode[];
  totalLength: number;
  maxDepth: number;
  spreadRadius: number;
  biomass: number;
}

interface RootNode {
  id: number;
  parentId: number;
  order: number;           // 0=taproot, 1=primary lateral, 2=secondary, etc.
  
  // Geometry
  start: Vector3;
  end: Vector3;
  startRadius: number;
  endRadius: number;
  segments: number;
  
  // Growth parameters
  age: number;
  growthRate: number;
  tropismStrength: number; // Response to moisture/nutrients
  
  // Physical properties
  tensileStrength: number;
  flexibility: number;
  
  // Soil interaction
  absorptionRate: number;
  mycorrhizalDensity: number; // Fungal symbiosis
  
  children: RootNode[];
}
```

### 2.2 Root Growth Algorithm

1. **Tropism-Driven Extension**
   - Hydrotropism: Roots bend toward moisture gradients
   - Gravitropism: Primary roots grow downward
   - Thigmotropism: Roots avoid rocks/obstacles
   - Chemotropism: Roots seek nutrient concentrations

2. **Branching Rules**
   - Branch angle varies with soil conditions
   - Higher moisture = more lateral branching
   - Nutrient-rich zones = finer root density
   - Rock contact = bifurcation around obstacle

3. **Radius Tapering**
   - Da Vinci's pipe model: parent² = Σchildren²
   - Modified by soil density (compressed = thicker)
   - Modified by nutrient availability

### 2.3 Root-Trunk Fusion (Fluting)

```typescript
interface FlutingTransition {
  fluteCount: number;           // 3-12 flutes matching root count
  fluteSeverity: number;        // 0-1, depth of grooves
  fluteSharpness: number;       // 1-6, edge definition
  transitionHeight: number;     // How far up trunk fluting extends
  rootAlignmentPhase: number;   // Angular offset of flutes to roots
  
  // Organic variation
  fluteAsymmetry: number;       // 0-1, variation between flutes
  buttressBlend: number;        // 0-1, blend into buttress roots
  barkThickeningInFlutes: number; // Extra bark depth in concave areas
}
```

The fluting emerges naturally where major roots meet the trunk:
- Each primary root creates a "lobe" in the trunk cross-section
- Grooves form between roots where wood is thinner
- Fluting severity decreases with height (exponential decay)
- Bark accumulates in concave flute valleys

---

## SECTION 3: FULL GROWTH TIMELINE

### 3.1 Developmental Stages

```typescript
interface GrowthStage {
  name: string;
  ageRange: [number, number]; // Normalized 0-1
  
  // Structural changes
  heightMultiplier: number;
  radiusMultiplier: number;
  branchCountMultiplier: number;
  leafDensityMultiplier: number;
  rootDepthMultiplier: number;
  
  // Visual changes
  barkTextureScale: number;
  barkFissureDepth: number;
  leafSize: number;
  crownShape: 'conical' | 'columnar' | 'spreading' | 'rounded';
  
  // Physics changes
  flexibility: number;
  windResponseMultiplier: number;
}

const GROWTH_STAGES: GrowthStage[] = [
  {
    name: 'Seed',
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
    name: 'Seedling',
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
    name: 'Sapling',
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
    name: 'Pole',
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
    name: 'Mature',
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
    name: 'Over-mature',
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
    name: 'Ancient',
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
```

### 3.2 Age-Driven Parameter Interpolation

All parameters smoothly interpolate between growth stages using hermite curves to avoid discontinuities. The age slider (0.0 to 1.0) maps through these stages with proper easing.

---

## SECTION 4: HIERARCHICAL WIND PHYSICS

### 4.1 Force Propagation Model

```typescript
interface WindSkeletonNode {
  id: number;
  parentId: number;
  order: number;
  kind: 'trunk' | 'branch' | 'twig' | 'leaf' | 'root';
  
  // Physical properties
  mass: number;           // kg
  length: number;         // m
  radius: number;         // m
  surfaceArea: number;    // m² for drag calculation
  
  // Spring-damper properties
  stiffness: number;      // N/m
  damping: number;        // Ns/m
  
  // Hierarchical coupling
  parentInfluence: number; // 0-1, how much parent motion affects this
  childDragSum: number;    // Accumulated drag from all children
  
  // State
  displacement: Vector3;
  velocity: Vector3;
  acceleration: Vector3;
  
  // Leaf attachment
  leafCount: number;
  leafArea: number;        // Total leaf surface area
}

interface WindState {
  time: number;
  
  // Base wind
  direction: Vector3;
  baseSpeed: number;       // m/s (Beaufort scale)
  
  // Gust envelope
  gustStrength: number;    // 0-1
  gustFrequency: number;   // Hz
  gustEnvelope: number;    // Current envelope value
  gustPhase: number;
  
  // Turbulence
  turbulenceScale: number;
  turbulenceIntensity: number;
  vortexStrength: number;
}
```

### 4.2 Drag Cascade Algorithm

The key insight: **drag forces accumulate upward through the hierarchy**.

1. **Calculate Leaf Drag** (highest frequency response)
   ```
   leafDrag = 0.5 * airDensity * velocity² * Cd * leafArea
   ```

2. **Accumulate to Twigs**
   - Twig receives: its own drag + sum of attached leaf drags
   - Twig applies 5-15% bend based on accumulated force

3. **Cascade to Branches**
   - Branch receives: its own drag + sum of child twig forces
   - Each branch order applies progressively less bend (stiffness increases)

4. **Propagate to Trunk**
   - Trunk receives: sum of all branch forces
   - Trunk has highest stiffness, minimal visible bend
   - But: displacement affects all children (they ride on trunk motion)

### 4.3 Realistic Bend Percentages

Based on biomechanical studies:
- **Leaves**: 100% response to local wind (flutter ±30°)
- **Twigs (order 4-5)**: 15-25% of parent + local
- **Small branches (order 3)**: 8-12% of parent + local
- **Medium branches (order 2)**: 4-8% of parent + local
- **Large branches (order 1)**: 2-5% of parent + local
- **Trunk (order 0)**: 0.5-2% total bend from accumulated forces

### 4.4 Spring-Mass-Damper Solver

```typescript
function solveWindPhysics(
  nodes: WindSkeletonNode[],
  wind: WindState,
  dt: number
) {
  // Process from leaves to trunk (bottom-up for drag accumulation)
  for (let i = nodes.length - 1; i >= 0; i--) {
    const node = nodes[i];
    
    // Calculate drag force on this node
    const velocity = wind.baseSpeed * (1 + wind.gustEnvelope * wind.gustStrength);
    const dragForce = calculateDrag(node, velocity, wind.direction);
    
    // Add child drag contributions
    let childDrag = 0;
    for (const child of node.children) {
      childDrag += child.childDragSum * child.parentInfluence;
    }
    node.childDragSum = dragForce + childDrag;
  }
  
  // Apply forces from trunk to leaves (top-down for displacement)
  for (const node of nodes) {
    const parent = nodes[node.parentId];
    const parentDisp = parent ? parent.displacement : Vector3.ZERO;
    
    // Spring force toward rest position
    const springForce = node.displacement.clone().multiplyScalar(-node.stiffness);
    
    // Damping force opposing velocity
    const dampForce = node.velocity.clone().multiplyScalar(-node.damping);
    
    // Wind force (from accumulated drag)
    const windForce = wind.direction.clone().multiplyScalar(node.childDragSum / node.mass);
    
    // Parent coupling (node rides on parent motion)
    const parentPull = parentDisp.clone().multiplyScalar(node.parentInfluence);
    
    // Integration
    const totalForce = springForce.add(dampForce).add(windForce);
    node.acceleration = totalForce.divideScalar(node.mass);
    node.velocity.add(node.acceleration.multiplyScalar(dt));
    node.displacement.add(node.velocity.multiplyScalar(dt)).add(parentPull);
    
    // Clamp to prevent instability
    const maxDisp = node.length * getMaxBendForOrder(node.order);
    if (node.displacement.length() > maxDisp) {
      node.displacement.normalize().multiplyScalar(maxDisp);
    }
  }
}
```

---

## SECTION 5: BREAKABLE BARK LAYERS

### 5.1 Multi-Layer Bark Structure

```typescript
interface BarkLayer {
  depth: number;         // mm from surface
  thickness: number;     // mm
  type: 'outer' | 'middle' | 'inner' | 'cambium';
  
  // Physical properties
  brittleness: number;   // 0-1, tendency to crack
  elasticity: number;    // 0-1, ability to bend without breaking
  adhesion: number;      // 0-1, how strongly attached to layer below
  density: number;       // kg/m³
  
  // Visual properties
  color: string;
  roughness: number;
  normalStrength: number;
  
  // Procedural generation
  crackPattern: 'fissured' | 'plated' | 'smooth' | 'scaly' | 'peeling';
  crackScale: number;
  crackDepth: number;
}

interface BarkSystem {
  layers: BarkLayer[];
  totalThickness: number;
  
  // Damage state
  cracks: BarkCrack[];
  peeledAreas: BarkPeel[];
  impacts: BarkImpact[];
  
  // Generation parameters
  voronoiSeed: number;
  fissureFrequency: number;
  plateSize: number;
}

interface BarkCrack {
  path: Vector3[];        // Crack path along surface
  depth: number;          // How many layers deep
  width: number;          // Crack opening width
  age: number;            // Affects color (older = darker)
}

interface BarkPeel {
  center: Vector3;
  radius: number;
  curls: PeelCurl[];      // Individual peeling strips
  exposedLayer: number;   // Which layer is now visible
}
```

### 5.2 Bark Generation Algorithm

1. **Base Shape**: Voronoi cells create natural plate boundaries
2. **Fissure Network**: Perlin noise + distance field creates crack patterns
3. **Depth Variation**: Plates have varying thickness (noise-driven)
4. **Layer Exposure**: Deeper cracks reveal inner layers (different colors)
5. **Edge Lifting**: Plate edges curl slightly upward

### 5.3 Collision-Based Bark Damage

```typescript
interface CollisionEvent {
  point: Vector3;
  normal: Vector3;
  force: number;          // Newtons
  impactorType: 'blunt' | 'sharp' | 'scraping';
}

function processBarkCollision(
  bark: BarkSystem,
  collision: CollisionEvent
): BarkDamage {
  const stress = collision.force / (Math.PI * 0.01 * 0.01); // Pressure (Pa)
  
  // Determine damage based on layer properties
  let damagedLayers = 0;
  let remainingStress = stress;
  
  for (const layer of bark.layers) {
    const breakThreshold = (1 - layer.brittleness) * 1e6; // Pa
    
    if (remainingStress > breakThreshold) {
      damagedLayers++;
      remainingStress *= 0.7; // Energy absorbed
    } else {
      break;
    }
  }
  
  if (damagedLayers > 0) {
    // Create crack or peel based on impactor type
    if (collision.impactorType === 'scraping') {
      return createBarkPeel(collision.point, damagedLayers);
    } else {
      return createBarkCrack(collision.point, collision.force, damagedLayers);
    }
  }
  
  return null;
}
```

### 5.4 Birch-Style Peeling

Special handling for species with papery bark:
- Outer layers have high brittleness but low adhesion
- Peeling creates curled strips that hang from the trunk
- Curl geometry: spiral with increasing radius from attachment
- Wind causes peeled strips to flutter

---

## SECTION 6: DEFORMATION & DAMAGE SYSTEM

### 6.1 Knot Generation

```typescript
interface WoodKnot {
  position: Vector3;      // Location on branch/trunk
  size: number;           // Diameter
  type: 'live' | 'dead' | 'encased' | 'loose';
  
  // Geometry
  protrusion: number;     // How much it bulges out
  grainDistortion: number; // How much it warps surrounding wood
  
  // Visual
  color: string;          // Usually darker than surrounding wood
  resinPresence: number;  // Shiny resin accumulation
}

// Knots form where branches died and were encased by trunk growth
function generateKnots(
  trunk: TrunkNode,
  deadBranches: BranchNode[],
  age: number
): WoodKnot[] {
  const knots: WoodKnot[] = [];
  
  for (const branch of deadBranches) {
    if (branch.deathAge < age * 0.7) {
      // Branch died early enough to be encased
      knots.push({
        position: branch.attachmentPoint,
        size: branch.baseRadius * 2.5,
        type: age - branch.deathAge > 0.3 ? 'encased' : 'dead',
        protrusion: 0.02 + Math.random() * 0.03,
        grainDistortion: 0.3 + Math.random() * 0.4,
        color: '#3d2817',
        resinPresence: Math.random() * 0.5,
      });
    }
  }
  
  return knots;
}
```

### 6.2 Branch Breaking Physics

```typescript
interface BranchBreakPoint {
  branchId: number;
  position: number;       // 0-1 along branch length
  breakStrength: number;  // Force required to break (N)
  breakType: 'clean' | 'splintered' | 'torn';
}

function calculateBreakStrength(branch: BranchNode): number {
  // Wood strength decreases at branch junctions
  const junctionWeakness = branch.order > 0 ? 0.7 : 1.0;
  
  // Knots create weak points
  const knotWeakness = branch.knots.length > 0 ? 0.6 : 1.0;
  
  // Disease or rot weakens wood
  const healthFactor = branch.health;
  
  // Base strength from radius (scales with cross-sectional area)
  const baseStrength = Math.PI * Math.pow(branch.radius, 2) * WOOD_TENSILE_STRENGTH;
  
  return baseStrength * junctionWeakness * knotWeakness * healthFactor;
}

function checkBranchBreaking(
  branch: BranchNode,
  windForce: number,
  accumulatedStress: number
): BreakEvent | null {
  const totalStress = windForce + accumulatedStress;
  const breakStrength = calculateBreakStrength(branch);
  
  if (totalStress > breakStrength) {
    // Find weakest point along branch
    const breakPoint = findWeakestPoint(branch);
    
    return {
      branchId: branch.id,
      position: breakPoint,
      force: totalStress,
      type: determineBreakType(totalStress / breakStrength),
    };
  }
  
  return null;
}
```

### 6.3 Broken Limb Geometry

When a branch breaks:
1. **Stub remains** on parent with splintered end geometry
2. **Fallen branch** can be added to scene (optional)
3. **Healing callus** forms over time (age-dependent)
4. **Decay** if old break (fungal staining, soft wood)

---

## SECTION 7: HYPER-REALISTIC FOLIAGE

### 7.1 Leaf Anatomy

```typescript
interface LeafGeometry {
  shape: LeafShape;
  
  // Dimensions
  length: number;         // cm
  width: number;          // cm
  thickness: number;      // mm
  
  // Venation
  midribWidth: number;
  secondaryVeinCount: number;
  veinPattern: 'pinnate' | 'palmate' | 'parallel' | 'dichotomous';
  veinDepth: number;      // Relief depth
  
  // Edge
  margin: 'entire' | 'serrate' | 'dentate' | 'lobed' | 'compound';
  serrationDepth: number;
  serrationCount: number;
  
  // Surface
  glossiness: number;
  hairiness: number;
  stomataPattern: 'random' | 'rows' | 'clusters';
  
  // Petiole
  petioleLength: number;
  petioleWidth: number;
  petioleCurve: number;   // Natural droop
}

type LeafShape = 
  | 'OVATE'       // Egg-shaped (oak, beech)
  | 'LANCEOLATE'  // Lance-shaped (willow)
  | 'ELLIPTIC'    // Ellipse (magnolia)
  | 'CORDATE'     // Heart-shaped (linden)
  | 'PALMATELY_LOBED' // Star-shaped (maple)
  | 'NEEDLE'      // Conifer needle
  | 'SCALE'       // Overlapping scales (cedar)
  | 'COMPOUND';   // Multiple leaflets (ash, walnut)
```

### 7.2 Leaf Vein Network Generation

Using L-system-like growth from midrib:
1. **Midrib**: Straight line base to tip
2. **Secondary veins**: Branch at angles (45-70°) from midrib
3. **Tertiary veins**: Connect secondaries in network
4. **Areoles**: Smallest enclosed areas form irregular polygons

### 7.3 Petiole Connection & Movement

```typescript
interface PetioleJoint {
  attachmentPoint: Vector3;  // On twig
  leafCenter: Vector3;       // Center of leaf blade
  
  // Joint physics
  restAngle: number;         // Natural droop angle
  stiffness: number;
  damping: number;
  
  // Movement limits
  maxPitch: number;          // Up/down
  maxYaw: number;            // Left/right
  maxRoll: number;           // Twist
}

// Leaf movement simulation (per-leaf flutter)
function updateLeafPhysics(
  leaf: LeafNode,
  wind: WindState,
  parentMotion: Vector3,
  dt: number
) {
  // Local wind turbulence
  const localWind = sampleTurbulence(leaf.position, wind.time);
  
  // Inherited motion from branch
  const inheritedForce = parentMotion.multiplyScalar(leaf.joint.parentInfluence);
  
  // Aerodynamic forces on leaf surface
  const liftDrag = calculateLeafAerodynamics(leaf, localWind);
  
  // Spring-damper toward rest pose
  const springForce = (leaf.joint.restAngle - leaf.currentAngle) * leaf.joint.stiffness;
  const dampForce = -leaf.angularVelocity * leaf.joint.damping;
  
  // Integration
  leaf.angularAcceleration = (springForce + dampForce + liftDrag) / leaf.inertia;
  leaf.angularVelocity += leaf.angularAcceleration * dt;
  leaf.currentAngle += leaf.angularVelocity * dt;
  
  // Apply to transform
  leaf.rotation = createLeafRotation(
    leaf.currentAngle,
    leaf.joint.restAngle,
    inheritedForce
  );
}
```

---

## SECTION 8: IMPLEMENTATION ARCHITECTURE

### 8.1 Core Modules

```
src/
├── types/
│   ├── soil.ts           # Soil system types
│   ├── roots.ts          # Root system types
│   ├── growth.ts         # Growth timeline types
│   ├── wind.ts           # Wind physics types
│   ├── bark.ts           # Bark layer types
│   ├── damage.ts         # Deformation/damage types
│   ├── foliage.ts        # Leaf system types
│   └── hyperParams.ts    # Master parameter registry
│
├── lib/
│   ├── soil/
│   │   ├── SoilField.ts
│   │   ├── MoistureDynamics.ts
│   │   └── NutrientDistribution.ts
│   │
│   ├── roots/
│   │   ├── RootGenerator.ts
│   │   ├── TropismSolver.ts
│   │   └── FlutingTransition.ts
│   │
│   ├── growth/
│   │   ├── GrowthTimeline.ts
│   │   ├── StageInterpolator.ts
│   │   └── AgeDrivenParams.ts
│   │
│   ├── wind/
│   │   ├── WindSolver.ts
│   │   ├── DragCascade.ts
│   │   └── SkeletonPhysics.ts
│   │
│   ├── bark/
│   │   ├── BarkGenerator.ts
│   │   ├── LayerSystem.ts
│   │   └── DamageProcessor.ts
│   │
│   ├── damage/
│   │   ├── KnotGenerator.ts
│   │   ├── BranchBreaking.ts
│   │   └── DeformationSolver.ts
│   │
│   ├── foliage/
│   │   ├── LeafGenerator.ts
│   │   ├── VeinNetwork.ts
│   │   └── PetiolePhysics.ts
│   │
│   └── core/
│       ├── TreeGenerator.ts      # Master orchestrator
│       ├── GeometryBuilder.ts    # Mesh construction
│       └── ShaderSystem.ts       # Custom shaders
│
├── shaders/
│   ├── bark.vert / bark.frag
│   ├── leaf.vert / leaf.frag
│   ├── wind.vert (vertex displacement)
│   └── soil.frag (volumetric rendering)
│
└── components/
    └── tree/
        └── HyperTree3DPreview.tsx  # Main viewport
```

### 8.2 Parameter Registry

All parameters accessible through unified registry with dual-key support:

```typescript
interface HyperTreeParams {
  // Soil
  'soil.enabled': boolean;
  'soil.moisture': number;
  'soil.nutrients': number;
  'soil.waterTableDepth': number;
  
  // Roots
  'roots.architecture': RootArchitecture;
  'roots.count': number;
  'roots.maxDepth': number;
  'roots.spreadRadius': number;
  'roots.flutingStrength': number;
  
  // Growth
  'growth.age': number;  // 0-1 normalized age
  'growth.vitality': number;
  
  // Wind
  'wind.beaufortScale': number;  // 0-12
  'wind.gustFrequency': number;
  'wind.gustIntensity': number;
  'wind.turbulenceScale': number;
  
  // Bark
  'bark.layerCount': number;
  'bark.totalThickness': number;
  'bark.crackPattern': string;
  'bark.peelingEnabled': boolean;
  
  // Damage
  'damage.knotDensity': number;
  'damage.brokenBranches': number;
  'damage.diseaseLevel': number;
  
  // Foliage
  'foliage.leafShape': LeafShape;
  'foliage.veinDetail': number;
  'foliage.petioleLength': number;
  
  // ... (80+ total parameters)
}
```

---

## SECTION 9: PERFORMANCE TARGETS

| Feature | Target FPS | Vertex Budget | Notes |
|---------|-----------|---------------|-------|
| Hero tree (< 1m) | 60 | 500K | Full detail bark, leaves |
| Close range (1-5m) | 60 | 200K | Reduced leaf geometry |
| Scene view (5-15m) | 60 | 50K | Billboard leaves |
| Wind physics | 60 | N/A | Skeletal solver + vertex shader |
| Soil rendering | 30 | 10K | Volumetric only when visible |

### Optimization Strategies

1. **Instanced leaves** — Single draw call for all leaves
2. **Skeletal wind** — Solve physics on skeleton, apply in vertex shader
3. **LOD transitions** — Smooth geometry morphing
4. **Bark texture caching** — Pre-generate procedural bark to atlas
5. **Soil culling** — Only render visible soil volume

---

## SECTION 10: IMPLEMENTATION PRIORITY

### Phase 1: Core Systems
1. ✅ Unified parameter system (`hyperParams.ts`)
2. ✅ Root generator with fluting transition
3. ✅ Growth timeline interpolation
4. ✅ Basic trunk/branch geometry

### Phase 2: Physics
5. ✅ Hierarchical wind skeleton
6. ✅ Drag cascade solver
7. ✅ Vertex shader displacement

### Phase 3: Detail
8. ✅ Multi-layer bark system
9. ✅ Bark damage/peeling
10. ✅ Leaf vein geometry
11. ✅ Petiole physics

### Phase 4: Polish
12. Soil volumetric rendering
13. Branch breaking simulation
14. Knot generation
15. Species presets

---

*This specification provides the complete blueprint for building the hyper-realistic procedural vegetation engine.*
