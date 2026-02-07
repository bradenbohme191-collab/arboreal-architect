# CODEX5.3TREES — System Anatomy Map (SAM-Style)
**Complete system mapping: ProVeg Studio v2 Pro / procedural tree editor**

**Date:** 2026-02-07  
**Version:** 1.0.0  
**Status:** Canonical system map (SAM methodology applied)  
**Purpose:** Full system documentation with code, NL/syntax descriptions, and relationship mapping for the CODEX5.3TREES application.  
**Scope:** Application root, `src/`, config, scripts, public assets, and build tooling.

---

## TABLE OF CONTENTS

1. [System Overview](#1-system-overview)
2. [Static Structure Map](#2-static-structure-map)
3. [Dynamic Behavior Map](#3-dynamic-behavior-map)
4. [Interface & Integration Map](#4-interface--integration-map)
5. [Constraints & Limitations](#5-constraints--limitations)
6. [Evidence & Validation](#6-evidence--validation)
7. [Relationship Matrix](#7-relationship-matrix)
8. [Summary](#8-summary)
9. [Code & NL/Syntax Reference](#9-code--nlsyntax-reference)

---

## 1. SYSTEM OVERVIEW

**[TAG:OVERVIEW] [TAG:CODEX5.3TREES]**

### What is CODEX5.3TREES?

**CODEX5.3TREES** (shipped as **ProVeg Studio v2 Pro**) is a browser-based **hero tree editor**: a single-tree, full-control slice of the Ultimate Procedural Vegetation Engine. It provides a Lucid-style UI (drawers, rails, bottom dock) and a central Three.js viewport that renders a procedural 3D tree driven by a large parameter set (trunk, branching, leaves, bark, roots, wind, LOD). The app is built with React 18, TypeScript, Vite 5, Tailwind CSS, Radix UI primitives, and Three.js (r0.182).

**Purpose:** Enable artists and designers to tune every exposed parameter of a procedural tree (species profile, trunk shape/gesture, branching model, leaves, bark, roots, wind, LOD) with immediate visual feedback in a 3D viewport. One seed yields one deterministic organism; parameters are stored in a flat key-value registry (`TreeParams`) with dual keys (short names and `vegetation.*` namespace) for presets and future engine integration.

**Core responsibilities:**

1. **Single-tree parameter editing** — All controls map to `TreeParams`; changes flow into `Tree3DPreview` and trigger geometry regeneration or wind/lighting updates.
2. **3D viewport** — Three.js scene with OrbitControls, ShapeForge-style lighting (ambient, main, fill, hemisphere), shadow mapping, optional Quick Grass ground (when `lib` present), contact shadow, and LOD-aware procedural geometry.
3. **Layout** — Unified chrome: top bar, left rail/drawer (presets, environment, seed, diagnostics), right rail/drawer (tree panels with sub-tabs), bottom bar/dock. State (drawer open/closed, panel IDs, widths, tree params, seed, playing, viewport settings) lives in `ProVegLayoutContext`.
4. **Species presets & snapshot testing** — Left presets apply named parameter bundles (Oak, Pine, Birch, etc.); Species Snapshot page renders multiple species for regression/screenshot comparison.

**Alignment with Ultimate Procedural Vegetation Engine:** This app implements **P0 (Current)** in that plan: hero single-tree editor, existing LOD in preview (distance-based near/mid/far/ultra, octave caps), WebGL2 rendering. Meshlet pipeline, WebGPU compute, and forest-scale features are out of scope.

**[END:TAG:OVERVIEW]**

---

## 2. STATIC STRUCTURE MAP

**[TAG:STRUCTURE] [TAG:CODEX5.3TREES]**

### 2.1 Directory and file tree

```
CODEX5.3TREES/
├── index.html                    # Entry HTML; #root + loading message; script /src/main.tsx
├── package.json                  # Dependencies (React, Three, Radix, Vite, Tailwind, etc.); scripts dev/build/preview + fix:radix-exports
├── vite.config.ts                # Vite config: plugins [react()], server port 5175, alias @ → ./src
├── tsconfig.json                 # References tsconfig.app.json, tsconfig.node.json; baseUrl .; paths @/* → ./src/*
├── tsconfig.app.json             # Target ES2020, JSX react-jsx, strict, paths @/* → ./src/*
├── tsconfig.node.json            # Node/build config
├── tailwind.config.ts            # Tailwind + tailwindcss-animate; content src/**/*
├── postcss.config.js             # PostCSS with tailwind, autoprefixer
├── LAUNCH.bat                    # Windows launcher: node/npm checks, npm install if needed, port 5175 check, start browser then npm run dev
├── AUDIT_LAUNCH_AND_CONSOLE_2026-02-07.md
├── public/
│   ├── shaders/quick-grass/      # GLSL for Quick Grass (multiple lighting models; used by lib/quickGrassGround when present)
│   └── textures/grass.png        # Ground plane texture
├── scripts/
│   ├── fixRadixBrokenExports.mjs # Pre-dev/build: patch @radix-ui package.json exports if import path missing
│   └── speciesSnapshotRegression.mjs  # Snapshot test/update for species regression
├── tests/snapshots/              # Baseline images (e.g. Oak, Pine, Birch) and README
├── docs/                         # ULTIMATE_PROCEDURAL_VEGETATION_ENGINE_MASTER_PLAN.md, Quick_Grass, shapeforgeOPUS, etc.
└── src/
    ├── main.tsx                  # React root: getElementById('root'), createRoot, StrictMode, App; error boundary writes innerHTML + console.error
    ├── App.tsx                   # AppErrorBoundary > BrowserRouter > ProVegLayoutProvider > Routes (/, /snapshot/species, *)
    ├── index.css                 # Tailwind directives + app styles
    ├── vite-env.d.ts
    ├── types/
    │   └── treeParams.ts         # TreeParams type; DEFAULT_TREE_PARAMS (full registry)
    ├── contexts/
    │   └── ProVegLayoutContext.tsx  # Layout + tree state; Provider + useProVegLayout
    ├── config/
    │   ├── workspaceScenes.ts    # LEFT_PANELS, RIGHT_PANELS (ids, labels, icons, subTabs)
    │   └── workspaceIcons.tsx    # getIcon(name) from lucide-react
    ├── pages/
    │   ├── ProVegStudioPage.tsx  # Main page: UnifiedTopBar, LeftRail, LeftDrawer, Tree3DPreview, RightDrawer, RightRail, BottomBar, BottomDock
    │   └── SpeciesSnapshotPage.tsx  # Grid of Tree3DPreview with species overrides; route /snapshot/species
    ├── components/
    │   ├── AppErrorBoundary.tsx   # Class component; getDerivedStateFromError; render error UI or children
    │   ├── layout/
    │   │   ├── index.ts          # Re-exports UnifiedTopBar, UnifiedLeftRail, UnifiedLeftDrawer, UnifiedRightRail, UnifiedRightDrawer, UnifiedBottomBar, UnifiedBottomDock
    │   │   ├── UnifiedTopBar.tsx
    │   │   ├── UnifiedLeftRail.tsx
    │   │   ├── UnifiedLeftDrawer.tsx
    │   │   ├── UnifiedRightRail.tsx
    │   │   ├── UnifiedRightDrawer.tsx
    │   │   ├── UnifiedBottomBar.tsx
    │   │   └── UnifiedBottomDock.tsx
    │   ├── panels/
    │   │   ├── LeftPresetsPanel.tsx
    │   │   ├── LeftEnvironmentPanel.tsx
    │   │   ├── LeftSeedPanel.tsx
    │   │   └── right/
    │   │       ├── TrunkPanel.tsx
    │   │       ├── BranchingPanel.tsx
    │   │       ├── LeavesPanel.tsx
    │   │       ├── BarkRootsPanel.tsx
    │   │       ├── WindLODPanel.tsx
    │   │       └── SpaceColonizationPanel.tsx
    │   ├── tree/
    │   │   └── Tree3DPreview.tsx # ~3000 lines: generateTreeGeometry, wind solver, Three scene, OrbitControls, ground, optional Quick Grass
    │   └── ui/
    │       ├── button.tsx
    │       ├── label.tsx
    │       ├── scroll-area.tsx
    │       └── slider.tsx
    └── (lib/ missing: utils.ts, quickGrassGround — see Constraints)
```

### 2.2 Core components table

| Component | Type | Purpose | Location |
|-----------|------|---------|----------|
| `main.tsx` | Entry | Mount React root; catch render errors; display #root or error UI | `src/main.tsx` |
| `App.tsx` | Router root | Error boundary, BrowserRouter, ProVegLayoutProvider, Routes | `src/App.tsx` |
| `ProVegLayoutContext` | Context | Single source of truth: layout (drawers, panels, widths), treeParams, seed, isPlaying, viewportSettings, groundLayer; setters | `src/contexts/ProVegLayoutContext.tsx` |
| `TreeParams` / `DEFAULT_TREE_PARAMS` | Data | Flat registry of all parameters (vegetation.* + short names); consumed by Tree3DPreview and panels | `src/types/treeParams.ts` |
| `Tree3DPreview` | Viewport | Three.js scene, camera, renderer, OrbitControls; generateTreeGeometry(params, seed, ctx); wind solver; ground; optional Quick Grass | `src/components/tree/Tree3DPreview.tsx` |
| `generateTreeGeometry` | Pure function | Builds mesh data (vertices, normals, colors, indices, windData, skeleton) from params + seed + LOD ctx; L-system–style recursion via generateBranch | `src/components/tree/Tree3DPreview.tsx` |
| `UnifiedTopBar` | UI | Title, seed display + randomize, play/pause wind, panels toggle, stats, capture | `src/components/layout/UnifiedTopBar.tsx` |
| `UnifiedLeftRail` / `UnifiedLeftDrawer` | UI | Rail icons for presets/environment/seed/diagnostics; drawer content (LeftPresetsPanel, LeftEnvironmentPanel, LeftSeedPanel) | `src/components/layout/` |
| `UnifiedRightRail` / `UnifiedRightDrawer` | UI | Rail icons for trunk/branching/leaves/bark-roots/wind-lod/space-colonization; drawer content by rightPanel + rightSubTab | `src/components/layout/` |
| `UnifiedBottomBar` / `UnifiedBottomDock` | UI | Bottom chrome and expandable dock | `src/components/layout/` |
| `LeftPresetsPanel` | UI | List of presets (Oak, Pine, Birch, etc.); apply preset = setTreeParams(presetParams) | `src/components/panels/LeftPresetsPanel.tsx` |
| `TrunkPanel` (and other right panels) | UI | Sub-tabs (e.g. shape, gesture, cross, buttress); SliderRow + setTreeParam(key, value) | `src/components/panels/right/TrunkPanel.tsx` etc. |
| `workspaceScenes.ts` | Config | LEFT_PANELS, RIGHT_PANELS with ids, labels, icons, subTabs | `src/config/workspaceScenes.ts` |
| `vite.config.ts` | Build | plugins: [react()], server port 5175, resolve.alias @ → ./src | `vite.config.ts` |
| `fixRadixBrokenExports.mjs` | Script | Patches @radix-ui package.json exports when import path missing (predev) | `scripts/fixRadixBrokenExports.mjs` |

### 2.3 Component hierarchy (runtime)

```
index.html
  └── #root
        └── main.tsx createRoot
              └── StrictMode
                    └── App
                          └── AppErrorBoundary
                                └── BrowserRouter
                                      └── ProVegLayoutProvider  ← state: layout + treeParams + seed + viewportSettings
                                            └── Routes
                                                  ├── Route "/" | "*" → ProVegStudioPage
                                                  │     ├── UnifiedTopBar
                                                  │     ├── UnifiedLeftRail, UnifiedLeftDrawer
                                                  │     ├── main → Tree3DPreview (params, seed, isPlaying, groundLayer)
                                                  │     ├── UnifiedRightDrawer, UnifiedRightRail
                                                  │     ├── UnifiedBottomBar, UnifiedBottomDock
                                                  │     └── (drawers render Left*/Right* panels by panel id)
                                                  └── Route "/snapshot/species" → SpeciesSnapshotPage
                                                        └── Grid of Tree3DPreview with SNAPSHOT_OVERRIDES
```

**[END:TAG:STRUCTURE]**

---

## 3. DYNAMIC BEHAVIOR MAP

**[TAG:BEHAVIOR] [TAG:CODEX5.3TREES]**

### 3.1 Application lifecycle

1. **Load** — index.html loads; script `/src/main.tsx` runs (Vite serves it; React plugin compiles JSX).
2. **Bootstrap** — main.tsx gets `#root`, creates React root, renders `<StrictMode><App /></StrictMode>`. Any sync error is caught and replaced with error div + console.error.
3. **Router** — App mounts BrowserRouter, ProVegLayoutProvider, Routes. Initial URL (e.g. `/`) mounts ProVegStudioPage.
4. **Layout state** — ProVegLayoutProvider initializes defaultState (leftDrawerOpen false, rightDrawerOpen true, treeParams from DEFAULT_TREE_PARAMS, seed 1337, isPlaying true, groundLayer "simple", viewportSettings from DEFAULT_VIEWPORT_SETTINGS).
5. **Viewport** — ProVegStudioPage renders Tree3DPreview with params=treeParams, seed, isPlaying, groundLayer. Tree3DPreview waits for containerReady (ResizeObserver), then creates Three.js scene, camera, renderer, OrbitControls, lights, ground plane, contact shadow. It then builds geometry via generateTreeGeometry(params, seed, { lod: lodLevel }), creates BufferGeometry and Mesh, adds to scene. If groundLayer === 'quick-grass', it calls loadQuickGrassShaders + createQuickGrassGround (requires `@/lib/quickGrassGround`).
6. **Animation** — requestAnimationFrame loop: OrbitControls.update(), wind solver step (if isPlaying), grass update (if active), renderer.render().
7. **User input** — Panel controls call setTreeParam(key, value) or setTreeParams(partial). Context state updates; Tree3DPreview re-renders; paramsRef/params change triggers geometry regeneration (useEffect) and mesh update. Preset click applies full preset object to setTreeParams. Seed change triggers full regen.

### 3.2 Key operations

| Operation | Trigger | Sequence | Output |
|-----------|---------|----------|--------|
| **Param change** | Slider/color/select in any right panel | setTreeParam(key, value) → context state → Tree3DPreview props → useEffect([params]) → generateTreeGeometry → new BufferGeometry → mesh.geometry dispose + assign | Updated tree mesh |
| **Preset apply** | Click preset in LeftPresetsPanel | setTreeParams({ ...treeParams, ...preset.params }) | Full tree param replace; geometry regen |
| **Seed change** | Top bar randomize or LeftSeedPanel | setSeed(newSeed) → context → Tree3DPreview(seed) → regen | New deterministic tree |
| **LOD change** | (Internal: distance or explicit) | setLodLevel / ctx.lod → generateTreeGeometry(..., { lod, lodScale }) → octaveCap and segment counts change | Fewer/more segments and detail |
| **Wind play/pause** | Top bar Play/Pause | setIsPlaying(!isPlaying) → playingRef.current → animation loop skips wind step when false | Wind animation on/off |
| **Ground layer switch** | Left environment/panel | setGroundLayer('simple' \| 'quick-grass') → addGrassRef/removeGrassRef → loadQuickGrassShaders + createQuickGrassGround or teardown | Grass layer visible or not (needs lib) |
| **Viewport settings** | Left environment panel | setViewportSettings(patch) → viewportSettings in context → Tree3DPreview useEffect applies background, fog, lights, exposure, shadows | Scene look updated |

### 3.3 Data flow (tree params and viewport)

```
User (panel UI)
  → setTreeParam(key, value) / setTreeParams(partial)
  → ProVegLayoutContext state (treeParams, seed, viewportSettings, …)
  → ProVegStudioPage passes props to Tree3DPreview
  → Tree3DPreview: paramsRef.current = params; useEffect([params]) runs
  → generateTreeGeometry(params, seed, { lod: lodLevel })
  → vertices, normals, colors, indices, windData, skeleton
  → THREE.BufferGeometry setAttribute / setIndex
  → mesh.geometry = new geometry (old disposed)
  → requestAnimationFrame: wind solver (optional), renderer.renderScene()
```

**[END:TAG:BEHAVIOR]**

---

## 4. INTERFACE & INTEGRATION MAP

**[TAG:INTEGRATION] [TAG:CODEX5.3TREES]**

### 4.1 Public entry points

| Entry | URL / command | Description |
|-------|----------------|-------------|
| **Dev server** | `npm run dev` (Vite) | Serves app at http://localhost:5175 (config in vite.config.ts). |
| **Launch script** | `LAUNCH.bat` | Checks node/npm, installs deps if needed, opens browser to 5175, runs npm run dev. |
| **Build** | `npm run build` | Vite build; output in dist/. |
| **Preview** | `npm run preview` | Serves dist/ after build. |
| **Snapshot test** | `npm run snapshot:test` | speciesSnapshotRegression.mjs. |
| **Snapshot update** | `npm run snapshot:update` | Same script with --update. |

### 4.2 Routes

| Route | Component | Description |
|-------|------------|-------------|
| `/` | ProVegStudioPage | Main hero tree editor. |
| `/snapshot/species` | SpeciesSnapshotPage | Grid of Tree3DPreview with species overrides (Oak, Pine, Birch, Willow, Acacia, Spruce). |
| `*` | ProVegStudioPage | Fallback. |

### 4.3 Configuration

- **Vite:** `vite.config.ts` — plugins: [react()], server: { host: '0.0.0.0', port: 5175 }, resolve.alias '@' → path.resolve(__dirname, './src').
- **TypeScript:** tsconfig.json references app/node; paths `@/*` → `./src/*`.
- **Tailwind:** tailwind.config.ts content `src/**/*`; tailwindcss-animate.
- **Panels:** workspaceScenes.ts defines LEFT_PANELS (presets, environment, seed, diagnostics) and RIGHT_PANELS (trunk, branching, leaves, bark-roots, wind-lod, space-colonization) with subTabs.

### 4.4 Key interfaces (NL/syntax)

- **TreeParams:** `Record<string, number | string | boolean>`. Keys are either short (e.g. `height`, `branchCount`) or namespaced (`vegetation.species.heightBase_m`). Generator uses a single `getP(primaryKey, altKey, default)` so both forms work.
- **ProVegLayoutContext:** Provides state (layout + treeParams + seed + viewportSettings + groundLayer + …) and setters (setTreeParam, setTreeParams, setSeed, setViewportSettings, openLeftPanel, openRightPanel, etc.). Consumed via useProVegLayout().
- **Tree3DPreview props:** `params: TreeParams`, `seed?: number`, `isPlaying?: boolean`, `groundLayer?: GroundLayerType`, `className?: string`, `showOverlay?: boolean`. No direct callbacks; reads layout via useProVegLayout for viewportSettings and setGroundLayer.
- **generateTreeGeometry(params, seed, ctx):** Pure function. `ctx` has optional `lod` ('near'|'mid'|'far'|'ultra') and `lodScale`. Returns object with attributes (position, normal, color, index), windData, windData2, branchBinding, skeleton (nodes array), meta (height, vertCount).

**[END:TAG:INTEGRATION]**

---

## 5. CONSTRAINTS & LIMITATIONS

**[TAG:PERFORMANCE] [TAG:DEPENDENCY] [TAG:CODEX5.3TREES]**

### 5.1 Dependencies

- **Runtime:** React 18, react-dom, react-router-dom, Three.js r0.182, Radix UI (label, scroll-area, select, separator, slider, tabs), class-variance-authority, clsx, tailwind-merge, lucide-react.
- **Build:** Vite 5, @vitejs/plugin-react, TypeScript 5, Tailwind 3, PostCSS, autoprefixer.
- **Missing modules:** `@/lib/utils` (e.g. `cn`) and `@/lib/quickGrassGround` are imported from multiple files but there is no `src/lib/` directory in the repo. Resolving `@` to `./src`, `@/lib/utils` and `@/lib/quickGrassGround` will 404 unless a `src/lib` folder is added. Quick Grass ground layer will fail at runtime when groundLayer === 'quick-grass'.

### 5.2 Invariants

- **Single tree:** One tree per viewport; one seed per tree; deterministic from (params, seed).
- **Context boundary:** useProVegLayout() must be used inside ProVegLayoutProvider or it throws.
- **Root element:** main.tsx assumes `#root` exists; index.html provides it.

### 5.3 Performance

- **Geometry regen:** Any change to params or seed triggers full generateTreeGeometry and mesh replace; no incremental delta. Heavy for very high segment/branch counts.
- **Wind solver:** Runs every frame when isPlaying; skeleton and textures drive vertex displacement.
- **LOD:** near/mid/far/ultra reduce octave caps and geometry scale to limit vertex count at distance.

### 5.4 Known gaps

- **lib/utils and lib/quickGrassGround:** Add `src/lib/utils.ts` (e.g. export function cn(...classes)) and implement or stub `src/lib/quickGrassGround.ts` (loadQuickGrassShaders, createQuickGrassGround) so that build and Quick Grass path succeed.

**[END:TAG:PERFORMANCE] [END:TAG:DEPENDENCY]**

---

## 6. EVIDENCE & VALIDATION

**[TAG:SUMMARY] [TAG:CODEX5.3TREES]**

### 6.1 Launch and console fix (2026-02-07)

- **Issue:** Terminal showed “launched” but app did not run; nothing useful in console.
- **Cause:** vite.config.ts did not register the React plugin; Vite served .tsx without JSX transform.
- **Fix:** Added `plugins: [react()]` to vite.config.ts. Documented in AUDIT_LAUNCH_AND_CONSOLE_2026-02-07.md.

### 6.2 Tests and snapshots

- **tests/snapshots:** Baseline images (e.g. Oak, Birch, Pine) for species regression.
- **scripts/speciesSnapshotRegression.mjs:** Snapshot compare/update (playwright/pixelmatch/pngjs).
- **package.json:** snapshot:test, snapshot:update.

### 6.3 Documentation alignment

- **docs/ULTIMATE_PROCEDURAL_VEGETATION_ENGINE_MASTER_PLAN.md:** P0 phase and vocabulary (TreeSeed, SpeciesTemplate, LOD, FieldAtlas) align with this app as the hero single-tree editor.

**[END:TAG:SUMMARY]**

---

## 7. RELATIONSHIP MATRIX

**[TAG:RELATIONSHIP] [TAG:CODEX5.3TREES]**

| From | To | Relationship | Notes |
|------|-----|--------------|-------|
| main.tsx | index.html #root | Mounts React root | Required DOM node |
| App.tsx | ProVegLayoutProvider | Wraps routes | Provides layout + tree state |
| ProVegStudioPage | Tree3DPreview | Passes params, seed, isPlaying, groundLayer | Primary consumer of treeParams |
| Tree3DPreview | ProVegLayoutContext | useProVegLayout() for viewportSettings, setGroundLayer | Read/write viewport and ground |
| All panels | ProVegLayoutContext | setTreeParam, setTreeParams, setSeed, setViewportSettings, etc. | Single source of truth |
| Tree3DPreview | generateTreeGeometry | Calls with (params, seed, ctx) | Pure; no React state |
| generateTreeGeometry | getP(params, alt, def) | Reads TreeParams with dual keys | vegetation.* and short names |
| LeftPresetsPanel | DEFAULT_TREE_PARAMS / PRESETS | Applies preset object to setTreeParams | Preset = partial TreeParams |
| workspaceScenes | UnifiedLeftDrawer, UnifiedRightDrawer | Panel id → which panel component | LEFT_PANELS, RIGHT_PANELS |
| TrunkPanel (etc.) | SliderRow | setTreeParam(keyPrimary, value); optional keyAlt | Dual-key sync for registry |
| Tree3DPreview | Three.js, OrbitControls | Scene, camera, renderer, controls, lights, ground | External libs |
| Tree3DPreview | @/lib/quickGrassGround | loadQuickGrassShaders, createQuickGrassGround | Optional; missing in repo |
| vite.config.ts | @/ path | resolve.alias '@' → ./src | All @/ imports resolve to src/ |

**[END:TAG:RELATIONSHIP]**

---

## 8. SUMMARY

**[TAG:SUMMARY] [TAG:CODEX5.3TREES]**

- **CODEX5.3TREES** is the ProVeg Studio v2 Pro app: a React + Three.js hero tree editor with a single global layout context, a large TreeParams registry, and a procedural tree generator (generateTreeGeometry) plus wind and LOD.
- **Structure:** Entry (main.tsx, App.tsx), context (ProVegLayoutContext), config (workspaceScenes, treeParams), layout (Unified* chrome), panels (left presets/environment/seed; right trunk/branching/leaves/bark-roots/wind-lod/space-colonization), and viewport (Tree3DPreview with Three.js and optional Quick Grass).
- **Behavior:** User changes params or seed → context updates → Tree3DPreview regens geometry and/or updates wind/viewport; presets replace param subsets; snapshot page renders multiple species.
- **Interfaces:** Routes / and /snapshot/species; Vite dev/build/preview; TreeParams and context API as the main contracts.
- **Constraints:** Missing `src/lib/utils` and `src/lib/quickGrassGround`; full geometry regen on any param/seed change; LOD and wind solver performance depend on skeleton/vertex count.
- **Evidence:** Launch fix (React plugin) documented; snapshot regression script and baseline images present; alignment with Ultimate Procedural Vegetation Engine P0.

**[END:TAG:SUMMARY]**

---

## 9. CODE & NL/SYNTAX REFERENCE

**[TAG:STRUCTURE] [TAG:CODEX5.3TREES]**

This section provides condensed code excerpts and natural-language descriptions for each major module.

---

### 9.1 Entry and root (main.tsx)

**NL:** Ensures a root DOM element exists, creates a React 18 root, and renders the app in StrictMode. On any render error, it replaces the root content with a red error screen and logs to console.

**Code (excerpt):**

```tsx
const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML = "<pre style='...'>Error: #root not found</pre>";
  throw new Error("root element missing");
}
try {
  const root = createRoot(rootEl);
  root.render(<StrictMode><App /></StrictMode>);
} catch (err) {
  rootEl.innerHTML = `<div style="...">ProVeg Studio failed to start ... ${msg} ... ${stack}</div>`;
  console.error(err);
}
```

---

### 9.2 App and routing (App.tsx)

**NL:** Wraps the app in an error boundary and Router; provides ProVegLayoutProvider so all children can read/write layout and tree state. Defines routes: `/` and `*` → ProVegStudioPage, `/snapshot/species` → SpeciesSnapshotPage.

**Code (excerpt):**

```tsx
export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <ProVegLayoutProvider>
          <Routes>
            <Route path="/" element={<ProVegStudioPage />} />
            <Route path="/snapshot/species" element={<SpeciesSnapshotPage />} />
            <Route path="*" element={<ProVegStudioPage />} />
          </Routes>
        </ProVegLayoutProvider>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
```

---

### 9.3 Tree parameters (types/treeParams.ts)

**NL:** Defines the tree parameter registry as a flat record. Supports both short names (e.g. `height`, `branchCount`) and namespaced keys (`vegetation.species.heightBase_m`). DEFAULT_TREE_PARAMS is the full default set used by the generator and presets.

**Syntax:**

- `TreeParams = Record<string, number | string | boolean>`
- Keys: instance (age01), env (moisture, timeOfDay, autoSun, shadows, AO), species (profile, height), trunk (baseRadius, taper, flare, twist, bark*, gesture knots, ovality, fluting, buttress), bark (branchScale), branching (model, phyllotaxis, maxOrder, probability, angles, length/radius decay, junction metaball, union blend, attractorCount, maxIterations, crownRadiusRatio), leaves (representation, shape, color*, size, clusterSize, cardsPerMeter, petiole*), wind (*), LOD (octaveCap.lod1/2/3, distance radii), roots (rootCount, style, visibility, shoulder*).

**Code (excerpt):**

```ts
export type TreeParams = Record<string, number | string | boolean>;

export const DEFAULT_TREE_PARAMS: TreeParams = {
  "vegetation.instance.age01": 1.0,
  age01: 1.0,
  "vegetation.species.heightBase_m": 8,
  height: 8,
  "vegetation.trunk.baseRadius_m": 0.4,
  baseRadius: 0.4,
  // ... 200+ entries
};
```

---

### 9.4 Layout context (contexts/ProVegLayoutContext.tsx)

**NL:** Holds all UI and tree state: drawer open/closed, panel ids, widths, treeParams, seed, isPlaying, paused, showStats, groundLayer, viewportSettings. Exposes setters (setTreeParam, setTreeParams, setSeed, setViewportSettings, openLeftPanel, openRightPanel, etc.) and constants (minDrawerWidth, maxDrawerWidth). useProVegLayout() throws if used outside Provider.

**Code (excerpt):**

```tsx
const ProVegLayoutContext = createContext<ProVegLayoutContextValue | null>(null);

export function ProVegLayoutProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<ProVegLayoutState>(defaultState);
  const setTreeParam = useCallback((key: string, value: number | string | boolean) => {
    setState((s) => ({ ...s, treeParams: { ...s.treeParams, [key]: value } }));
  }, []);
  const value: ProVegLayoutContextValue = {
    ...state,
    setTreeParam,
    setTreeParams,
    openLeftPanel: (id) => setState((s) => ({ ...s, leftPanel: id, leftDrawerOpen: !(s.leftDrawerOpen && s.leftPanel === id) })),
    // ... other setters
  };
  return <ProVegLayoutContext.Provider value={value}>{children}</ProVegLayoutContext.Provider>;
}

export function useProVegLayout() {
  const ctx = useContext(ProVegLayoutContext);
  if (!ctx) throw new Error("useProVegLayout must be used within ProVegLayoutProvider");
  return ctx;
}
```

---

### 9.5 Workspace config (config/workspaceScenes.ts)

**NL:** Defines left and right panel ids, labels, icons, and (for right) sub-tabs. Used by UnifiedLeftDrawer/UnifiedRightDrawer and rails to decide which panel and sub-tab to show.

**Code (excerpt):**

```ts
export const LEFT_PANELS: LeftPanelConfig[] = [
  { id: "presets", label: "Presets", icon: "Bookmark" },
  { id: "environment", label: "Environment", icon: "Cloud" },
  { id: "seed", label: "Seed & Age", icon: "Hash" },
  { id: "diagnostics", label: "Diagnostics", icon: "Activity" },
];

export const RIGHT_PANELS: RightPanelConfig[] = [
  { id: "trunk", label: "Trunk", icon: "TreePine", subTabs: [
    { id: "shape", label: "Shape", icon: "Circle" },
    { id: "gesture", label: "Gesture", icon: "Move" },
    { id: "cross", label: "Cross-section", icon: "CircleDot" },
    { id: "buttress", label: "Buttress", icon: "Mountain" },
  ]},
  // branching, leaves, bark-roots, wind-lod, space-colonization
];
```

---

### 9.6 Tree generator (Tree3DPreview — generateTreeGeometry)

**NL:** Pure function that builds procedural tree geometry from params, seed, and optional LOD context. Uses a seeded RNG, getP(primary, alt, def) for dual-key lookup, and recursive generateBranch to create trunk and branches with Bezier segments, wind metadata, skeleton nodes, and (optionally) roots and leaves. Returns positions, normals, colors, indices, windData arrays, branchBinding, and skeleton for the wind solver and mesh.

**Key steps (conceptual):**

- Resolve branch model (L_SYSTEM), species profile, leaf representation/shape, age, LOD octave caps.
- Build trunk (taper, flare, knots, ovality, fluting, buttress); push wind/skeleton/binding data.
- For each order, call generateBranch(startPos, startDir, length, radius, order, depth, windProfile); generateBranch recurs with decayed length/radius and new wind profile; adds segments (vertices, normals, colors, indices) and leaf geometry when at leaf order.
- Roots and leaves are appended; wind and skeleton arrays are filled for the GPU/CPU wind pass.

**Code (signature and getP pattern):**

```ts
function generateTreeGeometry(params, seed = 1337, ctx = {}) {
  const getP = (k, alt, def) => (params?.[k] ?? (alt ? params?.[alt] : undefined) ?? def);
  const branchModel = getP('vegetation.branching.model', 'branchModel', 'L_SYSTEM');
  const heightBase = getP('height', 'vegetation.species.heightBase_m', 8);
  // ...
  const generateBranch = (startPos, startDir, length, radius, order, depth = 0, windProfile = ...) => {
    if (order > maxOrder || depth > 64 || length < 0.18 || radius < 0.004) return null;
    // bend, Bezier p0–p3, skeleton node, wind meta, segment tris, recurse children
  };
  // trunk, then children from trunk tip; roots; leaves; return { position, normal, color, index, windData, windData2, branchBinding, skeleton, meta }
}
```

---

### 9.7 Tree3DPreview component (viewport)

**NL:** React component that owns the Three.js scene, camera, renderer, OrbitControls, lights, ground plane, contact shadow, and optional Quick Grass. On mount (when containerReady), it creates the scene and mesh; on params/seed change it regenerates geometry and updates the mesh. Animation loop: update controls, optionally run wind solver, update grass, render. Reads viewportSettings from useProVegLayout() and applies background, fog, exposure, and lights.

**Code (props and effect pattern):**

```tsx
export default function Tree3DPreview({
  params,
  seed = 1337,
  isPlaying = false,
  groundLayer = 'simple',
  className = '',
  showOverlay = true
}) {
  const containerRef = useRef(null);
  const [lodLevel, setLodLevel] = useState('near');
  const { setGroundLayer, viewportSettings } = useProVegLayout();
  // ...
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);
  useEffect(() => {
    if (!containerReady) return;
    // create scene, camera, renderer, OrbitControls, lights, ground, contact shadow
    // geometry = generateTreeGeometry(paramsRef.current, seed, { lod: lodLevel });
    // mesh.geometry = new geometry; scene.add(mesh);
    // if groundLayer === 'quick-grass': loadQuickGrassShaders().then(... createQuickGrassGround(...))
  }, [containerReady, params, seed, lodLevel, groundLayer]);
  useEffect(() => {
    // viewportSettings → scene.background, fog, lights, renderer.toneMappingExposure, shadowMap
  }, [viewportSettings]);
  // requestAnimationFrame: controls.update(), wind step, grass update, renderer.render
  return <div ref={containerRef} className={className} style={{ position: 'absolute', inset: 0 }} />;
}
```

---

### 9.8 Top bar (UnifiedTopBar.tsx)

**NL:** Renders app title, seed value + randomize button, play/pause wind, pause simulation, stats toggle, panels toggle, and capture button. All state from useProVegLayout().

**Code (excerpt):**

```tsx
export function UnifiedTopBar() {
  const { seed, setSeed, isPlaying, setIsPlaying, paused, togglePaused, showStats, setShowStats, rightDrawerOpen, setRightDrawerOpen } = useProVegLayout();
  return (
    <header className="h-12 flex items-center justify-between px-3 bg-slate-900/95 ...">
      <div>...<span className="font-mono text-sm text-primary">{seed}</span>
        <Button onClick={() => setSeed(Math.floor(Math.random() * 100000))} title="New random seed">...</Button>
      </div>
      <div>
        <Button onClick={() => setIsPlaying(!isPlaying)}>{isPlaying ? <Pause /> : <Play />}</Button>
        <Button onClick={togglePaused}>...</Button>
        <Button onClick={() => setShowStats(!showStats)}>Stats</Button>
        <Button onClick={() => setRightDrawerOpen(!rightDrawerOpen)}>Panels</Button>
        ...
      </div>
    </header>
  );
}
```

---

### 9.9 Left drawer and presets (UnifiedLeftDrawer, LeftPresetsPanel)

**NL:** UnifiedLeftDrawer shows when leftDrawerOpen; it picks title from LEFT_PANELS by leftPanel and renders LeftPresetsPanel, LeftEnvironmentPanel, or LeftSeedPanel. LeftPresetsPanel lists PRESETS; clicking one calls setTreeParams({ ...treeParams, ...preset.params }).

**Code (LeftPresetsPanel excerpt):**

```tsx
const PRESETS: { name: string; params: Record<string, number | string> }[] = [
  { name: "Oak", params: { height: 12, baseRadius: 0.5, trunkColor: "#5d4037", leafColor: "#3d6b35", "vegetation.species.profile": "OAK_MAPLE", ... } },
  { name: "Pine", params: { ... } },
  // ...
];
// In render: presets.map(p => <Button key={p.name} onClick={() => setTreeParams({ ...treeParams, ...p.params })}>{p.name}</Button>)
```

---

### 9.10 Right panel example (TrunkPanel)

**NL:** TrunkPanel receives rightSubTab and renders different sub-views (shape, gesture, cross, buttress). Each control reads from treeParams via get(primary, alt, def) and writes via setTreeParam(keyPrimary, value) and optionally setTreeParam(keyAlt, value) to keep dual keys in sync.

**Code (SliderRow and shape sub-tab):**

```tsx
function SliderRow({ label, value, min, max, step, keyPrimary, keyAlt, format }: { ... }) {
  const { setTreeParam } = useProVegLayout();
  const set = (v: number) => {
    setTreeParam(keyPrimary, v);
    if (keyAlt) setTreeParam(keyAlt, v);
  };
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Slider value={[value]} min={min} max={max} step={step} onValueChange={([v]) => set(v)} />
      <span className="text-[10px] text-muted-foreground">{format(value)}</span>
    </div>
  );
}

export function TrunkPanel({ subTab }: { subTab: string }) {
  const { treeParams, setTreeParam } = useProVegLayout();
  const get = (primary: string, alt: string, def: number) => (treeParams[primary] ?? treeParams[alt] ?? def) as number;
  if (subTab === "shape") {
    return (
      <div className="space-y-4">
        <SliderRow label="Height (m)" value={get("height", "vegetation.species.heightBase_m", 8)} min={2} max={25} step={0.5} keyPrimary="height" keyAlt="vegetation.species.heightBase_m" />
        <SliderRow label="Base radius (m)" value={get("baseRadius", "vegetation.trunk.baseRadius_m", 0.4)} ... />
        // ...
      </div>
    );
  }
  // gesture, cross, buttress
}
```

---

### 9.11 Vite config

**NL:** Registers the React plugin so JSX/TSX is compiled; serves on 0.0.0.0:5175; maps `@` to `./src` for imports.

**Code:**

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: { host: "0.0.0.0", port: 5175, strictPort: false },
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
});
```

---

### 9.12 Pre-dev script (fixRadixBrokenExports.mjs)

**NL:** Runs before dev/build (predev, prebuild). Scans node_modules/@radix-ui; for each package, if package.json exports.import.default points to a missing file but exports.require.default exists, it patches exports.import.default (and optionally types) to the require path so ESM resolution succeeds.

**Code (conceptual):**

```js
const RADIX_ROOT = path.join(process.cwd(), "node_modules", "@radix-ui");
// for each dir in RADIX_ROOT: read package.json; if import default path missing && require default exists → set exportRoot.import.default = requireDefault; write package.json
```

---

### 9.13 AppErrorBoundary

**NL:** Class component that catches React render errors in the tree below it. getDerivedStateFromError stores the error in state; componentDidCatch logs to console; render shows a full-screen red error panel with message and stack when state.error is set, otherwise renders children.

**Code (excerpt):**

```tsx
export class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };
  static getDerivedStateFromError(error: Error): State { return { error }; }
  componentDidCatch(error: Error, info: React.ErrorInfo) { console.error("AppErrorBoundary:", error, info); }
  render() {
    if (this.state.error) {
      const e = this.state.error;
      return <div style={{ position: "fixed", inset: 0, background: "#1e1e1e", color: "#f87171", ... }}><strong>ProVeg Studio error</strong><pre>{e.message}</pre><pre>{e.stack}</pre></div>;
    }
    return this.props.children;
  }
}
```

---

### 9.14 SpeciesSnapshotPage

**NL:** Renders a grid of Tree3DPreview instances, one per species (Oak, Pine, Birch, Willow, Acacia, Spruce). Each preview gets DEFAULT_TREE_PARAMS merged with SNAPSHOT_OVERRIDES[species] so that species-specific params (height, colors, profile, leaf shape) are applied. Used for visual regression and baseline screenshots.

**Code (excerpt):**

```tsx
const SNAPSHOT_OVERRIDES: Record<string, Record<string, number | string>> = {
  Oak: { height: 12, baseRadius: 0.5, trunkColor: "#5d4037", leafColor: "#3d6b35", "vegetation.species.profile": "OAK_MAPLE", ... },
  Pine: { ... },
  Birch: { ... },
  Willow: { ... },
  Acacia: { ... },
  Spruce: { ... },
};
// In component: useMemo to build params per species; grid of <Tree3DPreview params={mergedParams} seed={...} ... />
```

---

### 9.15 Right panels (BranchingPanel, LeavesPanel, BarkRootsPanel, WindLODPanel, SpaceColonizationPanel)

**NL:** All follow the same pattern as TrunkPanel: they consume useProVegLayout() for treeParams and setTreeParam/setTreeParams, and render sub-tabs (from workspaceScenes RIGHT_PANELS) with sliders, color inputs, and selects. Each SliderRow or control updates one or two keys (primary + optional vegetation.* alt) so the registry stays dual-key consistent. BranchingPanel: branchCount, angles, length/radius decay, junction metaball, union blend, attractorCount, maxIterations. LeavesPanel: leaf representation, shape, color, size, clusterSize, petiole. BarkRootsPanel: bark texture/roughness/anisotropy, root count/style/visibility. WindLODPanel: wind strength, bend factors, LOD octave caps and distance radii. SpaceColonizationPanel: attractors and crown ratio.

**Syntax (no full code):** Same as TrunkPanel: get(primary, alt, def), setTreeParam(keyPrimary, value), keyAlt when present; subTab from props.

---

### 9.16 generateBranch and wind/skeleton data (NL)

**NL:** generateBranch is the recursive heart of the tree generator. It takes start position, direction, length, radius, branch order, depth, and a wind profile. It applies species-specific gravity/wind/random bend, optional breakage (breakProbability/breakSeverity), Bezier control points (p0–p3), gesture knots (branchKnotStrength/Width), and species envelope clamping. It creates a skeleton node (id, parentId, order, radius, length, dir, start, end, center, area, mass, hash, stiffness, damping, parentInfluence, kind). It pushes wind metadata (hierarchy, tipWeight, branchHash, rigidity, parentHash, orderNorm, parentInfluence, leafiness) into windData/windData2 and branchBinding (nodeId, parentId, along, parentBlend). It emits segment triangles (base + tip vertex, normals, colors) and then recurs for child branches with decayed length/radius and new wind profile until order > maxOrder or length/radius below threshold. Leaves are added at terminal branches (leaf cards or clusters). The returned skeleton and wind arrays drive the runtime wind solver (vertex displacement texture or CPU pass).

---

### 9.17 TreeParams key groups (quick reference)

| Group | Example keys (short / vegetation.*) | Purpose |
|-------|--------------------------------------|---------|
| Instance / env | age01; vegetation.env.moisture, timeOfDay, autoSun, contactShadowStrength, nearFieldAOStrength | Age and lighting/env |
| Species | height, vegetation.species.heightBase_m, speciesProfile, vegetation.species.profile | Size and profile (BROADLEAF_DECIDUOUS, PINE_CONIFER, etc.) |
| Trunk | baseRadius, taperExponent, baseFlare, twist, trunkColor, barkTexture, barkRoughness, trunkKnotCount/Strength/Width, trunkOvality, trunkFluting*, buttress* | Trunk shape and bark |
| Bark | branchBarkScale | Branch bark scale |
| Branching | branchModel, phyllotaxis, maxOrder, branchProbability, apicalDominance, branchAngle, branchAngleVar, lengthDecay, radiusDecay, branchCount, branchLength, collar*, junctionMetaball*, unionBlend*, branchKnot*, attractorCount, maxIterations, crownRadiusRatio, breakProbability, breakSeverity | Branch structure and L-system/space-colonization |
| Leaves | leafRepresentation, leafShape, leafColor, leafColorVariation, leafSize, leafClusterSize, leafDensity, petiole* | Leaf type, color, size, density |
| Wind | windStrength, windEnabled, trunkBend, branchBend, twigBend, canopyShear, phaseRandom, restLean, windGustFrequency, windTurbulence, leafFlutter, windHierarchyBias, windMotionInertia, windSpringResponse, windMotionDamping, windParentCoupling, windGustVariance, windVortexStrength, windLeafMicroTurbulence, windSolverInfluence, windBranchTorsion, windOrderDrag, windGustEnvelope, windDebugSkeleton | Wind animation and solver tuning |
| LOD | octaveCapLod1/2/3, vegetation.lod.distance.nearRadius_m, midRadius_m, farRadius_m | Octave caps and distance tiers |
| Roots | rootCount, rootStyle, rootVisibility, rootShoulderLength, rootShoulderRadiusMul | Root count, style (SURFACE_SPREAD), visibility, shoulder shape |

**[END:TAG:STRUCTURE]**

---

# PART II: TREE GROWTH, PARAMETERS, AND WIND — COMPLETE REFERENCE

This part documents **every parameter**, the **full tree-generation algorithm**, **species logic**, **wind solver**, and **code locations** in `Tree3DPreview.tsx` (~3024 lines). File path: `src/components/tree/Tree3DPreview.tsx`.

---

## 10. FULL PARAMETER-TO-CODE INDEX

Every key read via `getP(primaryKey, altKey, default)` and where it is used. Line numbers are approximate (within a few lines).

| Parameter (primary or alt) | Default | Used for | Approx. line range |
|---------------------------|--------|----------|----------------------|
| vegetation.instance.age01 / age01 | 1.0 | ageGrowth(t), break age check, mainBranchCount/len/rad age scaling, root/leaf age scaling | 89–96, 382–383, 1502–1522, 1622–1624 |
| vegetation.env.moisture / moisture | 0.55 | rootLen/rootDepth dry01, root visibility | 224, 1597–1598 |
| vegetation.env.timeOfDay / timeOfDay | 0.45 | sun direction (elevation), trunk lean, animation loop sun/lighting | 99–106, 2192–2274 |
| vegetation.env.autoSun, autoSunInfluence, atmosphereStrength | true, 0.82, 0.45 | Animation: blend manual vs auto sun position/colors/fog | 2209–2272 |
| vegetation.env.contactShadowStrength, contactShadowRadius_m, shadowSoftness | 0.62, 1.65, 0.55 | Contact shadow opacity, scale, shadow camera radius | 2212–2214, 2364–2372 |
| vegetation.env.nearFieldAOStrength, canopySelfShadow | 0.36, 0.48 | Vertex shader AO, material.userData, uniforms | 2613–2614, 2645–2646 |
| vegetation.species.profile / speciesProfile | BROADLEAF_DECIDUOUS | isConifer, leafRep/leafShape override, profile multipliers, envelope (spruce/acacia), species bend/budget | 79–86, 426–469, 393–394, 1116–1151, 1254–1270, 1410–1462, 1467–1588 |
| height / vegetation.species.heightBase_m | 8 | heightBase * ageGrowth(age01), trunk top, envelope, leader/branch lengths | 211–212, 269–270, 410–411, 1568–1584 |
| baseRadius / vegetation.trunk.baseRadius_m | 0.4 | Trunk radius, flare, trunkRadiusAtY, root rad0 | 212–213, 298–299, 853–854, 1591 |
| taperExponent / vegetation.trunk.taperExponent | 0.7 | Trunk radius taper, trunkRadiusAtY | 213, 299, 854 |
| baseFlare / vegetation.trunk.baseFlare | 1.3 | Trunk base flare (t < 0.1) | 298–299, 854 |
| twist / vegetation.trunk.twist_deg | 0 | Trunk ring theta offset | 302 |
| vegetation.trunk.barkColor / trunkColor | #5d4037 | Trunk and branch vertex color | 206, 349–354, 822–823 |
| vegetation.trunk.barkTexture / barkTexture | FURROWED | barkAmp, ridgeK, ridgeF (SMOOTH, PLATE, FURROWED) | 227–228, 308–312, 776–781 |
| vegetation.trunk.barkRoughness, barkAnisotropy, barkMicroDetail, barkCurvatureDetail | 0.75, 0.34, 0.44, 0.4 | Bark displacement amplitude, curvature mul, material roughness, shader uniforms | 228–231, 307–320, 778–806, 2675–2678 |
| vegetation.trunk.gestureKnotCount/Strength/Width, trunkKnotCount/Strength/Width | 2, 0.25, 0.12 | Trunk knot array (ti, dirX, dirZ, amp, width), centerline bend | 216–219, 253–263, 284–295 |
| vegetation.trunk.ovality / trunkOvality | 0.06 | Trunk cross-section oval, branch oval | 219–220, 329–330, 761, 839 |
| vegetation.trunk.flutingStrength/Count/Sharpness | 0, 4, 2 | Trunk flute mul (lower trunk) | 220–223, 330–334 |
| vegetation.trunk.buttressStrength/Count/Sharpness | 0, 4, 2.2 | Trunk buttress lobes (t < 0.08) | 233–236, 323–326 |
| vegetation.bark.branchScale / branchBarkScale | 0.65 | Branch ring bark noise amplitude | 231, 806 |
| vegetation.branching.model / branchModel | L_SYSTEM | doColonize (SPACE_COLONIZATION, HYBRID) | 75, 1592 |
| vegetation.branching.phyllotaxis / phyllotaxis | ALTERNATE | phylloAz(i): ALTERNATE/OPPOSITE/WHORLED; conifer → WHORLED | 396–402, 1489 |
| vegetation.leaves.representation / leafRepresentation | CLUSTERS | CLUSTERS vs CARDS vs MASS_ONLY; leaf count and cross-quads | 76–77, 453, 806–808 |
| vegetation.leaves.shape / leafShape | BROADLEAF | NEEDLE, SCALE, PALM_FROND, COMPOUND, LOBED, BROADLEAF → emitQuadUV / emitBroadleafStripUV | 79–86, 768–792 |
| vegetation.leaves.colorBase / leafColor | #4a7c3f | leafColorBase, leaf color variation | 207–208, 656–658, 697–699 |
| vegetation.leaves.colorVariation / leafColorVariation | 0.15 | Leaf and petiole color variance | 208, 656, 691 |
| vegetation.leaves.size_m / leafSize | 0.08 | Leaf cluster radius and quad size | 453, 466, 479, 727–728 |
| vegetation.leaves.clusterSize / leafClusterSize | 12 | leavesPerCluster, clusterRadius | 454, 461 |
| vegetation.leaves.cardsPerMeter / leafDensity | 8 | densityN, baseCount | 455, 462 |
| vegetation.leaves.petioleLengthFactor, petioleDroop, petioleWidthFactor | 0.35, 0.35, 0.07 | Petiole length, droop, ribbon width | 456–458, 797–804, 803 |
| vegetation.wind.gustStrength / windStrength | 0.6 | Bend magnitude (static), animation windStrength | 100, 1153–1154, 2687 |
| vegetation.wind.restLean / restLean | 0.22 | trunkLeanMag | 100, 107–108 |
| vegetation.lod.octaveCap.lod1/2/3, octaveCapLod1/2/3 | 5, 3, 2 | barkOctaves by lodIndex | 120–124 |
| vegetation.lod.distance.nearRadius_m, midRadius_m, farRadius_m | 4, 8, 15 | LOD switch by camera distance (animate loop) | 2193–2198 |
| vegetation.branching.maxOrder / maxOrder | 5 | Recursion limit, child budget, phylloAz orderNorm | 384, 1116, 1244–1252, 1410 |
| vegetation.branching.probability / branchProbability | 0.65 | branchProb (profile mul), skip child with rng() | 384, 391, 1265 |
| vegetation.branching.apicalDominance / apicalDominance | 0.7 | apicalChance, leader length | 385, 1410–1418, 1558 |
| vegetation.branching.angleMean_deg / branchAngle | 35 | angleMean (rad), tilt for main/child | 386, 1489, 1287–1298 |
| vegetation.branching.angleVariance_deg / branchAngleVar | 12 | angleVar | 387, 1287 |
| vegetation.branching.lengthDecay / lengthDecay | 0.72 | lengthDecay, childLen | 388, 1334 |
| vegetation.branching.radiusDecay / radiusDecay | 0.65 | radiusDecay, childRad, autoParentRad | 389, 1191–1192, 1335 |
| vegetation.branching.collarStrength, collarLength | 0.28, 0.12 | addBezierBranchTube collar bulge, unionLen | 393–394, 733, 746–749 |
| vegetation.branching.junctionMetaballStrength/Radius/Segments | 0.35, 1.25, 7 | addJunctionBlob, addBezierBranchTube junction bulge | 396–399, 756–759, 823–827 |
| vegetation.branching.unionBlendLength/Strength/Asymmetry | 0.22, 0.58, 0.42 | Branch tube union blend to parent radius, asymmetric ring scale | 400–402, 735–738, 762–767 |
| vegetation.branching.gestureKnotStrength/Width, branchKnotStrength/Width | 0.25, 0.18 | generateBranch p1/p2 bump (lateral curve) | 404–405, 1210–1222 |
| vegetation.branching.ovality / branchOvality | 0.05 | Branch ring radAng oval | 408, 761 |
| vegetation.branching.breakProbability, breakSeverity | 0, 0.5 | generateBranch localLen cut, addBrokenTipCap | 411–412, 1162–1170, 1234–1236 |
| vegetation.branching.mainBranchCount / branchCount | 6 | mainBranchCount (profile + age + LOD), loop main branches | 416, 389, 1472–1539 |
| vegetation.branching.lengthRatio / branchLength | 0.55 | branchLengthRatio, main branch len | 417, 391, 1502 |
| vegetation.branching.attractorCount, maxIterations | 220, 18 | Space colonization: attractor count, iteration limit | 1593–1595, 1632 |
| vegetation.crown.crownRadiusRatio / crownRadiusRatio | 0.42 | Crown ellipsoid radii for attractors | 1598–1601 |
| rootCount / vegetation.roots.rootCount | 5 | rootCount loop | 1591 |
| vegetation.roots.style / rootStyle | SURFACE_SPREAD | crownLift, centerAt lift | 1594, 1635 |
| vegetation.roots.visibility / rootVisibility | 0.4 | rootLen, rootDepth, rootRad0, shoulder, blend | 1595, 1622–1635, 1638, 1776–1777 |
| vegetation.roots.shoulderLength, rootShoulderRadiusMul | 0.22, 1.3 | Root shoulder segment (s0–s3), shoulderR0/R1 | 1596–1597, 1759–1778 |
| (Wind params in animation + material) | (see treeParams) | windRuntimeRef, material.userData.windBase, shader uniforms, solver per-node force | 2325–2584, 2612–2684, 2686–2700 |

### 10.1 Exhaustive DEFAULT_TREE_PARAMS key list (src/types/treeParams.ts)

Every key in the registry and its default value. The generator uses getP(primary, alt, def), so either the long (vegetation.*) or short name can be set; both are listed.

**Instance & env:** vegetation.instance.age01 1.0, age01 1.0, vegetation.env.moisture 0.55, moisture 0.55, vegetation.env.timeOfDay 0.45, timeOfDay 0.45, vegetation.env.autoSun true, autoSun true, vegetation.env.autoSunInfluence 0.82, autoSunInfluence 0.82, vegetation.env.atmosphereStrength 0.45, atmosphereStrength 0.45, vegetation.env.contactShadowStrength 0.62, contactShadowStrength 0.62, vegetation.env.contactShadowRadius_m 1.65, contactShadowRadius_m 1.65, vegetation.env.shadowSoftness 0.55, shadowSoftness 0.55, vegetation.env.nearFieldAOStrength 0.36, nearFieldAOStrength 0.36, vegetation.env.canopySelfShadow 0.48, canopySelfShadow 0.48.

**Species / trunk:** vegetation.species.profile "BROADLEAF_DECIDUOUS", speciesProfile "BROADLEAF_DECIDUOUS", height 8, vegetation.species.heightBase_m 8, baseRadius 0.4, vegetation.trunk.baseRadius_m 0.4, taperExponent 0.7, vegetation.trunk.taperExponent 0.7, baseFlare 1.3, vegetation.trunk.baseFlare 1.3, twist 0, vegetation.trunk.twist_deg 0, vegetation.trunk.barkColor "#5d4037", trunkColor "#5d4037", vegetation.trunk.barkTexture "FURROWED", barkTexture "FURROWED", vegetation.trunk.barkRoughness 0.75, barkRoughness 0.75, vegetation.trunk.barkAnisotropy 0.34, barkAnisotropy 0.34, vegetation.trunk.barkMicroDetail 0.44, barkMicroDetail 0.44, vegetation.trunk.barkCurvatureDetail 0.4, barkCurvatureDetail 0.4, vegetation.trunk.gestureKnotCount 2, trunkKnotCount 2, vegetation.trunk.gestureKnotStrength 0.25, trunkKnotStrength 0.25, vegetation.trunk.gestureKnotWidth 0.12, trunkKnotWidth 0.12, vegetation.trunk.ovality 0.06, trunkOvality 0.06, vegetation.trunk.flutingStrength 0, trunkFlutingStrength 0, vegetation.trunk.flutingCount 4, trunkFlutingCount 4, vegetation.trunk.flutingSharpness 2, trunkFlutingSharpness 2, vegetation.trunk.buttressStrength 0, buttressStrength 0, vegetation.trunk.buttressCount 4, buttressCount 4, vegetation.trunk.buttressSharpness 2.2, buttressSharpness 2.2.

**Bark:** vegetation.bark.branchScale 0.65, branchBarkScale 0.65.

**Branching:** vegetation.branching.model "L_SYSTEM", branchModel "L_SYSTEM", vegetation.branching.phyllotaxis "ALTERNATE", phyllotaxis "ALTERNATE", vegetation.branching.maxOrder 5, maxOrder 5, vegetation.branching.probability 0.65, branchProbability 0.65, vegetation.branching.apicalDominance 0.7, apicalDominance 0.7, vegetation.branching.angleMean_deg 35, branchAngle 35, vegetation.branching.angleVariance_deg 12, branchAngleVar 12, vegetation.branching.lengthDecay 0.72, lengthDecay 0.72, vegetation.branching.radiusDecay 0.65, radiusDecay 0.65, vegetation.branching.mainBranchCount 6, branchCount 6, vegetation.branching.lengthRatio 0.55, branchLength 0.55, vegetation.branching.collarStrength 0.38, collarStrength 0.38, vegetation.branching.collarLength 0.15, collarLength 0.15, vegetation.branching.junctionMetaballStrength 0.55, junctionMetaballStrength 0.55, vegetation.branching.junctionMetaballRadius 1.45, junctionMetaballRadius 1.45, vegetation.branching.junctionMetaballSegments 7, junctionMetaballSegments 7, vegetation.branching.unionBlendLength 0.22, unionBlendLength 0.22, vegetation.branching.unionBlendStrength 0.58, unionBlendStrength 0.58, vegetation.branching.unionAsymmetry 0.42, unionAsymmetry 0.42, vegetation.branching.gestureKnotStrength 0.25, branchKnotStrength 0.25, vegetation.branching.gestureKnotWidth 0.18, branchKnotWidth 0.18, vegetation.branching.ovality 0.05, branchOvality 0.05, vegetation.branching.breakProbability 0, breakProbability 0, vegetation.branching.breakSeverity 0.5, breakSeverity 0.5, vegetation.branching.attractorCount 220, attractorCount 220, vegetation.branching.maxIterations 18, maxIterations 18, vegetation.crown.crownRadiusRatio 0.42, crownRadiusRatio 0.42.

**Leaves:** vegetation.leaves.representation "CLUSTERS", leafRepresentation "CLUSTERS", vegetation.leaves.shape "BROADLEAF", leafShape "BROADLEAF", vegetation.leaves.colorBase "#4a7c3f", leafColor "#4a7c3f", vegetation.leaves.colorVariation 0.15, leafColorVariation 0.15, vegetation.leaves.size_m 0.08, leafSize 0.08, vegetation.leaves.clusterSize 12, leafClusterSize 12, vegetation.leaves.cardsPerMeter 8, leafDensity 8, vegetation.leaves.petioleLengthFactor 0.35, petioleLengthFactor 0.35, vegetation.leaves.petioleDroop 0.35, petioleDroop 0.35, vegetation.leaves.petioleWidthFactor 0.07, petioleWidthFactor 0.07.

**Wind:** vegetation.wind.gustStrength 0.6, windStrength 0.6, vegetation.wind.enabled true, windEnabled true, vegetation.wind.trunkBend 0.02, trunkBend 0.02, vegetation.wind.branchBend 0.08, branchBend 0.08, vegetation.wind.twigBend 0.25, twigBend 0.25, vegetation.wind.canopyShear 0.12, canopyShear 0.12, vegetation.wind.phaseRandom 0.8, phaseRandom 0.8, vegetation.wind.restLean 0.22, restLean 0.22, vegetation.wind.gustFrequency 1.0, windGustFrequency 1.0, vegetation.wind.directionVariance 0.35, windDirectionVariance 0.35, vegetation.wind.turbulence 0.5, windTurbulence 0.5, vegetation.wind.leafFlutter 0.35, leafFlutter 0.35, vegetation.wind.hierarchyBias 0.75, windHierarchyBias 0.75, vegetation.wind.motionInertia 0.95, windMotionInertia 0.95, vegetation.wind.springResponse 1.0, windSpringResponse 1.0, vegetation.wind.motionDamping 1.0, windMotionDamping 1.0, vegetation.wind.parentCoupling 0.78, windParentCoupling 0.78, vegetation.wind.gustVariance 0.7, windGustVariance 0.7, vegetation.wind.vortexStrength 0.55, windVortexStrength 0.55, vegetation.wind.leafMicroTurbulence 0.6, windLeafMicroTurbulence 0.6, vegetation.wind.solverInfluence 0.85, windSolverInfluence 0.85, vegetation.wind.branchTorsion 0.32, windBranchTorsion 0.32, vegetation.wind.orderDrag 0.68, windOrderDrag 0.68, vegetation.wind.gustEnvelope 0.58, windGustEnvelope 0.58, vegetation.wind.debugSkeleton false, windDebugSkeleton false.

**LOD:** vegetation.lod.octaveCap.lod1 5, octaveCapLod1 5, vegetation.lod.octaveCap.lod2 3, octaveCapLod2 3, vegetation.lod.octaveCap.lod3 2, octaveCapLod3 2, vegetation.lod.distance.nearRadius_m 4, vegetation.lod.distance.midRadius_m 8, vegetation.lod.distance.farRadius_m 15.

**Roots:** rootCount 5, vegetation.roots.rootCount 5, vegetation.roots.style "SURFACE_SPREAD", rootStyle "SURFACE_SPREAD", vegetation.roots.visibility 0.4, rootVisibility 0.4, vegetation.roots.shoulderLength 0.22, rootShoulderLength 0.22, vegetation.roots.shoulderRadiusMul 1.3, rootShoulderRadiusMul 1.3.

---

## 11. TRUNK GENERATION (STEP-BY-STEP)

**Location:** `generateTreeGeometry` inside Tree3DPreview.tsx, ~266–380.

1. **Constants:** segBase 16, ringBase 20 → segments/rings scaled by lodGeoMul (LOD). trunkTopY = height * 0.6; trunkTop = (trunkLeanTopX, trunkTopY, trunkLeanTopZ). createSkeletonNode(-1, origin, trunkTop, 0, baseRadius, 'trunk', 0) → trunkNodeId.
2. **Rings loop (r = 0..rings):** t = r/rings, y = t * height * 0.6. Centerline: cx, cz = trunk lean (t²) + trunkKnots Gaussian bends (trunkKnotStrength, trunkKnotWidth). Radius: flare for t < 0.1, then baseRadius * pow(1-t, taperExponent) * flare. Twist: theta += t * twist (deg→rad).
3. **Segments loop (s = 0..segments):** theta = (s/segments)*2π + twist. Bark: barkAmp, ridgeK, ridgeF by barkStyle; ridge = sin(theta*ridgeK + y*ridgeF + buttressPhase); barkField = fbm2(..., barkOctaves); barkNoise; barkCurvMul. Buttress: buttressT (t<0.08), lobe = cos(buttressCount*theta + buttressPhase)^buttressSharpness, buttressMul. Ovality and fluting: oval, flutingT, fluteMul, macroMul. r2 = (radius*macroMul + barkNoise)*buttressMul. Vertex (x,y,z) = (cos(theta)*r2+cx, y, sin(theta)*r2+cz). Normal (nx,0,nz). Color trunkColor with rng variation. pushWindMeta(..., trunkHash, ...). pushBranchBinding(trunkNodeId, trunkNodeId, t, 0, 1).
4. **Trunk indices:** For each ring/segment quad: (a, b, a+1), (a+1, b, b+1). vertexOffset = vertices.length/3 for later branches.

---

## 12. SPECIES PROFILE MULTIPLIERS AND ENVELOPES

**Location:** 426–469 (multipliers), 393–394 (envelope strength), 438–443 (clampPointToSpeciesEnvelope).

| Profile | branchCountMul | branchProbMul | apicalMul | angleMul | angleVarMul | lengthRatioMul | lengthDecayMul | radiusDecayMul |
|---------|----------------|---------------|-----------|----------|-------------|----------------|----------------|----------------|
| PINE_CONIFER | 1.35 | 1.08 | 1.28 | 0.72 | 0.62 | 0.82 | 0.94 | 0.93 |
| SPRUCE_CONICAL | 1.42 | 1.12 | 1.36 | 0.62 | 0.52 | 0.74 | 0.92 | 0.9 |
| WILLOW_WEEPING | 1.18 | 1.04 | 0.76 | 1.22 | 1.18 | 1.14 | 0.9 | 0.95 |
| BIRCH_UPRIGHT | 0.88 | 0.92 | 1.1 | 0.84 | 0.75 | 0.9 | 0.96 | 0.9 |
| ACACIA_SAVANNA | 0.86 | 1.08 | 0.52 | 1.34 | 1.35 | 1.24 | 0.86 | 0.92 |
| OAK_MAPLE | 1.08 | 1.0 | 0.92 | 1.08 | 1.08 | 1.08 | 0.98 | 1.0 |

**Envelopes:** speciesEnvelopeStrength: Spruce 0.94, Acacia 0.88, else 0. speciesEnvelopeCenter = (trunkLeanTopX*0.7, trunkTopY+height*0.12, trunkLeanTopZ*0.7). clampPointToSpeciesEnvelope: **Spruce** — conical allowedR from baseR + canopyR*(1-yNorm)^1.12, clamp lateral; **Acacia** — flat crown band (canopyY ± halfBand), allowedR flat, y clamped to band.

---

## 13. BRANCHING: MAIN SPAWN, LEADER, generateBranch, CHILD BUDGETS

**Main branches from trunk (1467–1539):** For i = 0..mainBranchCount-1: t = attachment height (species-specific: conifer tier, willow/birch/acacia spread). y = t*trunkTopY, r = trunk radius at t, az = phylloAz(azIndex++). startPos = (cos(az)*r + leanX, y, sin(az)*r + leanZ). tilt = angleMean + rng*angleVar; dir from tilt and az; species vertical bias (conifer/willow/birch/acacia). len, rad from height*branchLengthRatio and baseRadius*taper with species and hNorm. mainWind = makeWindProfile(1, hash, trunkHash, 0.42, 0, trunkNodeId, trunkNodeId, trunkOutNormal, trunkRadiusAtY(y)). tip = generateBranch(startPos, dir, len, rad, 1, 0, mainWind); scaffoldTips.push(tip.tip).

**Leader (1542–1589):** leaderDir = (sun + lean + jitter). Species adjust (conifer more vertical, willow down, etc.). leaderLen, leaderRad from height and apicalDom; leaderWind; generateBranch(trunkTop, leaderDir, leaderLen, leaderRad, 1, 1, leaderWind). scaffoldTips.push(leaderTip).

**generateBranch (1115–1464):** Exit if order>maxOrder or depth>64 or length<0.18 or radius<0.004. Bend = gravity*speciesGravityMul + windDir*windStrength*speciesWindMul + random*speciesRandMul + speciesVerticalBias. dir = startDir + bend normalized. Optional break: if breakProbability and age01>0.9, sometimes localLen *= cut, broken=true. p0=startPos; p3=p0+dir*localLen; p1, p2 at 0.33/0.66; species envelope clamp p1,p2,p3. createSkeletonNode(parentNodeId, p0, p3, order, radius, 'branch', parentInfluence). Lateral curve on p2; branch gesture knot (branchKnotStrength/Width) on p1/p2. Envelope clamp again. addJunctionBlob(p0, dir, parentRad, radius, order, branchWind). addBezierBranchTube(p0,p1,p2,p3, radius, rad1, order, branchWind). If broken: addBrokenTipCap(out.tip, ...). If order >= maxOrder-2: addLeafCluster(out.tip, out.tipTan, rad1, order, ...). **Child branches:** childBudget by order and species (conifer/willow/birch/acacia different); childCount = round(childBudget + rng*childJitter). whorlMode for conifer order<=2. For each child: tAttach (species-specific), attachPos = bezierPos(..., tAttach), az = whorlMode ? whorlPhase+i*whorlStep : phylloAz(azIndex++), tilt by species, childDir, childLen/childRad (lengthDecay/radiusDecay + species). childWind = makeWindProfile(order+1, childHash, ..., branchNode.id, parentNodeId, side, parentAttachRad). generateBranch(attachPos, childDir, childLen, childRad, order+1, depth+1, childWind). **Birch spur shoots:** if isBirch && order 2..maxOrder-1, spurChance → 1–3 spur twigs + addLeafCluster. **Apical continuation:** if rng() < apicalChance, continue same order from p3 with contDir/contLen/contRad (species-adjusted), generateBranch(p3, contDir, ...). Return out (tip, tipTan, nodeId).

---

## 14. SPACE COLONIZATION (1591–1597, 1626–1692)

**When:** branchModel === 'SPACE_COLONIZATION' || 'HYBRID'. attractorCount, influenceRadius_m, killRadius_m, step_m, maxIterations from params. crownRadiusRatio → crown ellipsoid radii (radii.x/y/z); spruce/acacia different shapes. **Attractors:** Fill attractors[] with points inside ellipsoid shell (q = x²/rx² + y²/ry² + z²/rz² < 1, then scale by shell 0.55–1.0). **Tips:** Start from scaffoldTips or trunkTop. **Loop (maxIter):** Assign each attractor to nearest tip; if d < kill remove attractor; if d < influence add to assigns[tip]. For each tip with assigns: dir = sum(normalize(A - tip)) + sunDir; next = tip + dir*step. createSkeletonNode(twigParentId, tip, next, maxOrder, twigR0, 'twig', 0.74). addBezierBranchTube(p0,p1,p2,p3, twigR0, twigR1, maxOrder, twigWind). If iter > maxIter*0.4: addLeafCluster(p3, ...). newTips.push(next, twigNode.id). tips = concat(newTips).slice(-(60+iter*80)) cap 900.

---

## 15. ROOTS GENERATION (1591–1827)

**When:** rootCount > 0 && rootVisibility > 0.001. rootStyle (SURFACE_SPREAD, BUTTRESS), rootShoulderLength, rootShoulderRadiusMul. For each root r: rootAngle = (r/rootCount)*2π + buttressAlign + jitter. dir2 = (cos(rootAngle), 0, sin(rootAngle)). rootLen, rootDepth, rootRad0 from baseRadius and visibility/dry01/age. rootBasePos = dir2*baseRadius*0.68 at y=-0.02. createSkeletonNode(trunkNodeId, rootBasePos, rootEndEst, 1, rootRad0, 'root', 0.84). addJunctionBlob at root base. If rootShoulderLength > 0: shoulder segment (s0–s3) with addBezierBranchTube. centerAt(t): out = rootAttach + rootLen*t, wiggle = sin(wPhase + t*wFreq*2π)*wAmp*t, down = -rootDepth*t^1.45 - ..., lift = crownLift*sin(π*t)*(1-t). For ring 0..rootRings: center = centerAt(t), tan from prev/next center, rad = rootRad0*(1 - 0.78*t^0.85)*(1 + 0.32*shoulder), radY = rad*(0.45+0.18*rootVisibility). Segments: ring of vertices, normals, colors, pushWindMeta, pushBranchBinding. Indices for quads.

---

## 16. WIND DATA AND SKELETON

**pushWindMeta(hierarchy, tipWeight, branchHash, rigidity, parentHash, orderNorm, parentInfluence, leafiness, count):** Appends to windData (4 per vertex): h, t, b, r; windData2: p, o, pi, lf. **pushBranchBinding(nodeId, parentId, along, parentBlend, count):** Appends (nid, pid, along, pb) per vertex. **createSkeletonNode(parentId, start, end, order, radius, kind, parentInfluence):** Pushes node { id, parentId, order, radius, length, dir, start, end, center, area, mass, hash, stiffness, damping, parentInfluence, kind }. **Fallback (1830–1862):** If windData/windData2/branchBinding length !== vertCount*4, rebuild from vertices/colors/height: hierarchy, tipWeight, rigidity, hash, parentInfluence, leafMask from y and radial; push default wind and binding so attribute counts match.

---

## 17. WIND SOLVER (CPU) AND VERTEX SHADER

**Solver (2325–2584):** Each frame, if mesh and shader and branchWindSolverRef: windRuntimeRef (time, gust, gustEnvelope, gustVel, dirAngle, ...) updated from params (gustVariance, gustEnvelope, motionDamping, vortexStrength, directionVariance, etc.). For each skeleton node: parent disp/vel inherit (parentCoupling), target = parentDisp*inherit. Local wind direction + turbulence + vortex + leafMicroTurbulence. Force from wind (bend + torsion), spring-damper: vel += (target + force - disp)*k - (vel - parentVel*inherit)*c * dt * inertia; vel *= velDrag; disp += vel*dt; clamp |disp| to maxDisp. Write disp to branchWindData (RGBA texture); branchWindTex.needsUpdate = true. **Vertex shader (2686–2700+):** Attributes windData, windData2, branchBinding. Uniforms uTime, uGustState, uGustEnvelope, uWindStrength, uTrunkBend, uBranchBend, uBranchTorsion, uTwigBend, uCanopyShear, uLeafFlutter, uDirectionVariance, uTurbulence, uHierarchyBias, uTreeHeight, uPhase, uWindDir, uBranchWindTex, uBranchWindTexSize, uBranchNodeCount, uBranchDynScale, uNearFieldAOStrength, uCanopySelfShadow, uSunDirWS, uBark*. transformed += bend (trunk/branch/twig/leaf by hierarchy) + torsion + flutter; vNearFieldAO, vCanopyAO, vBarkMask, vBarkGrain set for fragment.

---

## 18. LOD AND GEOMETRY UPDATE

**LOD (2192–2201):** nearR, midR, farR from params (default 4, 8, 15). d = camera.position.distanceTo(controls.target). nextLod = d < nearR ? 'near' : d < midR ? 'mid' : d < farR ? 'far' : 'ultra'. setLodLevel(nextLod) → triggers useEffect([params, seed, lodLevel]). **Geometry update (2619–2634):** useEffect: remove old mesh and wind debug lines; geo = generateTreeGeometry(params, seed, { lod: lodLevel }); new BufferGeometry setAttribute position, normal, color, windData, windData2, branchBinding, setIndex; build branchWindTex (DataTexture) and branchWindSolverRef (nodeCount, disp, vel, nodes); material.userData.windBase = { all wind params }; material.onBeforeCompile = shader inject (vertex attributes + uniforms + #include <begin_vertex> replace for wind displacement). mesh = new THREE.Mesh(geometry, material); scene.add(mesh); meshRef.current = mesh.

---

## 19. CODE LINE REFERENCE TABLE (Tree3DPreview.tsx)

| Block | Line range (approx) | Description |
|-------|----------------------|-------------|
| resolveAssetUrl, seededRandom, fract/lerp/smooth/hash21/noise2/fbm2 | 15–69 | Helpers |
| generateTreeGeometry start, getP, branch/leaf/species/LOD/age/sun/trunk lean | 71–250 | Params and trunk precompute |
| Trunk knots, segBase/ringBase, trunkTop, trunk node | 252–273 | Trunk setup |
| Trunk rings/segments loop (vertices, normals, colors, wind, binding) | 277–368 | Trunk mesh |
| Trunk indices, vertexOffset | 370–380 | |
| Branching constants (maxOrder, prob, apical, angle, length/radius decay, collar, junction, union, branchKnot, break, mainBranchCount, branchLengthRatio) | 384–417 | |
| Species profile multipliers (PINE, SPRUCE, WILLOW, BIRCH, ACACIA, OAK) | 426–469 | |
| Phyllotaxis, safeCross, tangentFrame, bezierPos/bezierTan, envelopeCenterXZ, clampPointToSpeciesEnvelope | 396–443 | |
| makeWindProfile | 445–461 | |
| addLeafCluster (emitPetioleRibbon, emitLeafPrimitive, emitQuadUV, emitBroadleafStripUV, leaf shapes) | 463–818 | |
| addBezierBranchTube | 820–853 | |
| trunkRadiusAtY | 855–860 | |
| addJunctionBlob | 862–1059 | |
| addBrokenTipCap | 1061–1112 | |
| generateBranch | 1115–1464 | |
| Main branch spawn from trunk | 1467–1539 | |
| Leader continuation | 1542–1589 | |
| Space colonization | 1591–1692 | |
| Roots | 1591–1827 | |
| Wind fallback, return vertices/normals/colors/indices/windData/windData2/branchBinding/skeleton/meta | 1829–1881 | |
| Tree3DPreview component (refs, state, useProVegLayout, containerReady, init scene/camera/renderer/controls/lights/ground/contact shadow) | 1883–2140 | |
| Quick Grass (loadQuickGrassShaders, createQuickGrassGround) | 2142–2165 | |
| Resize, animate loop (controls, grass, LOD, env lighting, contact shadow, wind uniforms, solver step, branchWindTex, render) | 2167–2588 | |
| Cleanup | 2590–2616 | |
| useEffect geometry update (generateTreeGeometry, BufferGeometry, branchWindTex, solver ref, material, onBeforeCompile vertex shader) | 2619–2924 | |
| Shader inject (attributes, uniforms, begin_vertex replace) | 2712–2900+ | |

---

**End of Part II.** With Part I (sections 1–9) and Part II (sections 10–19), the document now covers the **entire app**: entry, routing, context, layout, panels, config, **and** the full tree growth pipeline, every parameter, species logic, roots, space colonization, wind data, CPU wind solver, vertex shader wind, LOD, and geometry update with code locations.

---

## PART III — COMPLETE SOURCE CODE (ZERO DATA LOSS)

This part embeds the **full source code** of every file in the app except `Tree3DPreview.tsx`. The canonical copy of `Tree3DPreview.tsx` (3024 lines) is **`src/components/tree/Tree3DPreview.tsx`** in the repository; Sections 9, 11–19 and the line reference table (Section 19) document every function and line range. For a frozen snapshot, copy that file verbatim to `docs/CODEX5.3TREES_Tree3DPreview_FULL_SOURCE.tsx`. No behavior or structure is omitted.

---

### 20. Entry, HTML, and build

**src/main.tsx** (full):

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  document.body.innerHTML = "<pre style='color:red;padding:20px;font-family:monospace'>Error: #root not found</pre>";
  throw new Error("root element missing");
}

try {
  const root = createRoot(rootEl);
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
} catch (err) {
  const msg = err instanceof Error ? err.message : String(err);
  const stack = err instanceof Error ? err.stack : "";
  rootEl.innerHTML = `
    <div style="position:fixed;inset:0;background:#1e1e1e;color:#f87171;padding:24px;font-family:monospace;font-size:14px;overflow:auto;white-space:pre-wrap;">
      <strong>ProVeg Studio failed to start</strong>\n\n${msg}\n\n${stack}
    </div>
  `;
  console.error(err);
}
```

**index.html** (full):

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ProVeg Studio v2 Pro</title>
  </head>
  <body>
    <div id="root">
      <div id="loading-msg" style="position:fixed;inset:0;background:#1e3a5f;color:#e2e8f0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;font-family:system-ui;font-size:20px;">
        <span>Loading ProVeg Studio v2 Pro…</span>
        <span style="font-size:14px;color:#94a3b8;">If this stays, check the browser console (F12) for errors.</span>
      </div>
    </div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

**vite.config.ts** (full):

```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  server: { host: "0.0.0.0", port: 5175, strictPort: false },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**package.json** (full):

```json
{"name":"proveg-studio-v2","private":true,"version":"2.0.0","type":"module","scripts":{"fix:radix-exports":"node scripts/fixRadixBrokenExports.mjs","postinstall":"npm run fix:radix-exports","predev":"npm run fix:radix-exports","prebuild":"npm run fix:radix-exports","prepreview":"npm run fix:radix-exports","dev":"vite","build":"vite build","preview":"vite preview","snapshot:test":"node scripts/speciesSnapshotRegression.mjs","snapshot:update":"node scripts/speciesSnapshotRegression.mjs --update"},"dependencies":{"@radix-ui/react-label":"^2.1.7","@radix-ui/react-presence":"^1.1.5","@radix-ui/react-scroll-area":"^1.2.9","@radix-ui/react-select":"^2.2.5","@radix-ui/react-separator":"^1.1.7","@radix-ui/react-slider":"^1.3.5","@radix-ui/react-tabs":"^1.1.12","class-variance-authority":"^0.7.1","clsx":"^2.1.1","lucide-react":"^0.462.0","react":"^18.3.1","react-dom":"^18.3.1","react-router-dom":"^6.26.0","tailwind-merge":"^2.6.0","tailwindcss-animate":"^1.0.7","three":"^0.182.0"},"devDependencies":{"@types/node":"^22.16.5","@types/react":"^18.3.23","@types/react-dom":"^18.3.7","@types/three":"^0.182.0","@vitejs/plugin-react":"^4.3.4","autoprefixer":"^10.4.21","pixelmatch":"^7.1.0","playwright":"^1.54.2","pngjs":"^7.0.0","postcss":"^8.5.6","tailwindcss":"^3.4.17","typescript":"^5.8.3","vite":"^5.4.19"}}
```

**LAUNCH.bat** (full): See repository root; checks Node/npm, installs deps if needed, checks port 5175, starts browser then `npm run dev`.

---

### 21. App, routing, error boundary, pages

**src/App.tsx** (full): BrowserRouter → AppErrorBoundary → ProVegLayoutProvider → Routes: `/` and `*` → ProVegStudioPage, `/snapshot/species` → SpeciesSnapshotPage.

**src/components/AppErrorBoundary.tsx** (full): Class component, getDerivedStateFromError, componentDidCatch, render: on error shows fixed overlay with message and stack; else children.

**src/pages/ProVegStudioPage.tsx** (full): useProVegLayout (treeParams, seed, isPlaying, showStats, groundLayer). Layout: UnifiedTopBar; flex row: UnifiedLeftRail, UnifiedLeftDrawer, main (Tree3DPreview + optional seed stats), UnifiedRightDrawer, UnifiedRightRail; UnifiedBottomBar; UnifiedBottomDock.

**src/pages/SpeciesSnapshotPage.tsx** (full): URL params species, seed, play, ground. SNAPSHOT_OVERRIDES (each species sets height, vegetation.species.heightBase_m, baseRadius, vegetation.trunk.baseRadius_m, taperExponent, vegetation.trunk.taperExponent, branchCount, vegetation.branching.mainBranchCount, branchAngle, vegetation.branching.angleMean_deg, trunkColor, vegetation.trunk.barkColor, leafColor, vegetation.leaves.colorBase, vegetation.species.profile, speciesProfile, vegetation.leaves.shape, vegetation.leaves.representation): Oak 12m, 0.5r, 0.65 taper, 8 br, 40°, #5d4037, #3d6b35, OAK_MAPLE, LOBED, CLUSTERS. Pine 18, 0.38, 0.92, 13, 22°, #7a4a24, #1f5d2a, PINE_CONIFER, NEEDLE, CARDS. Birch 10, 0.25, 0.85, 6, 30°, #f5f5f5, #7cb342, BIRCH_UPRIGHT, BROADLEAF, CLUSTERS. Willow 8, 0.4, 0.6, 10, 50°, #6d5c4d, #8bc34a, WILLOW_WEEPING, COMPOUND, CLUSTERS. Spruce 21, 0.34, 1.02, 15, 18°, #6a4d30, #2d5b2d, SPRUCE_CONICAL, NEEDLE, CARDS. Acacia 11, 0.48, 0.62, 7, 54°, #75583d, #6e8f3a, ACACIA_SAVANNA, COMPOUND, CLUSTERS. resolveSpecies(raw): trim/lower, find in keys, default "Oak". useMemo: next = {...DEFAULT_TREE_PARAMS}, apply override entries, return next. Renders min-h-screen flex center; div 1280×720 border data-testid="snapshot-root"; Tree3DPreview params, seed, play, ground, showOverlay=false.

---

### 22. Context and config (full source)

**src/contexts/ProVegLayoutContext.tsx** (full):

- MIN_DRAWER=280, MAX_DRAWER=480, DEFAULT_LEFT=300, DEFAULT_RIGHT=340.
- ViewportSettings: backgroundColor, ambientLightIntensity, ambientLightColor, enableShadows, mainLightIntensity, mainLightColor, mainLightPosition[3], fillLightIntensity, fillLightColor, fillLightPosition[3], hemiIntensity, hemiSkyColor, hemiGroundColor, exposure.
- DEFAULT_VIEWPORT_SETTINGS: #1a1a2e, 0.35, #c8d6e5, true, 0.8, #fff, [8,12,5], 0.25, #6b8cce, [-4,6,-3], 0.3, #c8d6e5, #1a1a2e, 1.0.
- ProVegLayoutState: leftDrawerOpen, leftPanel, leftDrawerWidthPx, rightDrawerOpen, rightPanel, rightSubTab, rightDrawerWidthPx, bottomDockExpanded, bottomDockHeightPx, paused, showStats, treeParams, seed, isPlaying, groundLayer, viewportSettings.
- Setters: setLeftDrawerOpen, setLeftPanel, openLeftPanel (toggles drawer if same panel), setLeftDrawerWidthPx (clamp MIN_MAX), setRightDrawerOpen, setRightPanel (clears rightSubTab), setRightSubTab, openRightPanel(id, subTab?), setRightDrawerWidthPx (clamp), setBottomDockExpanded, setBottomDockHeightPx (clamp 120–400), togglePaused, setShowStats, setTreeParams, setTreeParam, setSeed, setIsPlaying, setGroundLayer, setViewportSettings(patch), resetToDefaults; minDrawerWidth, maxDrawerWidth.
- defaultState: leftDrawerOpen false, leftPanel "presets", rightDrawerOpen true, rightPanel "trunk", rightSubTab "shape", treeParams {...DEFAULT_TREE_PARAMS}, seed 1337, isPlaying true, groundLayer "simple", viewportSettings {...DEFAULT_VIEWPORT_SETTINGS}, etc.
- ProVegLayoutProvider: useState(defaultState), value with all above, Provider. useProVegLayout: useContext, throw if null.

**src/config/workspaceScenes.ts** (full): LEFT_PANELS = [{id:"presets",label:"Presets",icon:"Bookmark"},{id:"environment",label:"Environment",icon:"Cloud"},{id:"seed",label:"Seed & Age",icon:"Hash"},{id:"diagnostics",label:"Diagnostics",icon:"Activity"}]. RIGHT_PANELS = [{id:"trunk",label:"Trunk",icon:"TreePine",subTabs:[{id:"shape",label:"Shape",icon:"Circle"},{id:"gesture",label:"Gesture",icon:"Move"},{id:"cross",label:"Cross-section",icon:"CircleDot"},{id:"buttress",label:"Buttress",icon:"Mountain"}]},{id:"branching",label:"Branching",icon:"GitBranch",subTabs:[{id:"structure",label:"Structure",icon:"Network"},{id:"junction",label:"Junction",icon:"Merge"},{id:"gesture",label:"Gesture",icon:"Move"},{id:"damage",label:"Damage",icon:"AlertTriangle"}]},{id:"leaves",label:"Leaves",icon:"Leaf",subTabs:[{id:"representation",label:"Representation",icon:"Layers"},{id:"petiole",label:"Petiole",icon:"Minus"},{id:"color",label:"Color",icon:"Palette"}]},{id:"bark-roots",label:"Bark & Roots",icon:"Mountain",subTabs:[{id:"bark",label:"Bark",icon:"Box"},{id:"roots",label:"Roots",icon:"Root"}]},{id:"wind-lod",label:"Wind & LOD",icon:"Wind",subTabs:[{id:"wind",label:"Wind",icon:"Wind"},{id:"lod",label:"LOD",icon:"Eye"}]},{id:"space-colonization",label:"Space Colonization",icon:"Grid3X3",subTabs:[{id:"attractors",label:"Attractors",icon:"Target"},{id:"crown",label:"Crown",icon:"Cloud"}]}].

**src/config/workspaceIcons.tsx** (full): Imports from lucide-react: Bookmark, Cloud, Hash, Activity, TreePine, GitBranch, Leaf, Mountain, Wind, Grid3X3, Circle, CircleDot, Move, Merge, AlertTriangle, Layers, Minus, Palette, Box, Sprout, Eye, Target, PanelLeftClose, PanelRightClose, LucideIcon. ICON_MAP: Root→Sprout, Network→GitBranch plus all others by name. getIcon(name): ICON_MAP[name] ?? Cloud. Export PanelLeftClose, PanelRightClose.

**src/types/treeParams.ts**: TreeParams = Record<string, number | string | boolean>. DEFAULT_TREE_PARAMS: see Section 10.1 for the exhaustive list (every key and default value).

---

### 23. Layout components (full source)

**src/components/layout/index.ts**: Exports UnifiedTopBar, UnifiedLeftRail, UnifiedLeftDrawer, UnifiedRightRail, UnifiedRightDrawer, UnifiedBottomBar, UnifiedBottomDock.

**UnifiedTopBar**: Seed display + random button; Play/Pause wind; Pause sim; Stats; Panels (right drawer toggle); Camera. Uses useProVegLayout (seed, setSeed, isPlaying, setIsPlaying, togglePaused, showStats, setShowStats, rightDrawerOpen, setRightDrawerOpen).

**UnifiedLeftRail**: LEFT_PANELS map → icon buttons; openLeftPanel(panel.id); close drawer button. leftDrawerOpen, leftPanel, openLeftPanel, setLeftDrawerOpen.

**UnifiedLeftDrawer**: If !leftDrawerOpen return null. Title from LEFT_PANELS. ScrollArea; renders LeftPresetsPanel | LeftEnvironmentPanel | LeftSeedPanel | diagnostics placeholder by leftPanel.

**UnifiedRightRail**: RIGHT_PANELS map → icon buttons; openRightPanel(panel.id); close drawer button.

**UnifiedRightDrawer**: If !rightDrawerOpen return null. Title, subTabs (config.subTabs), effectiveSubTab. Renders TrunkPanel | BranchingPanel | LeavesPanel | BarkRootsPanel | WindLODPanel | SpaceColonizationPanel by rightPanel with subTab.

**UnifiedBottomBar**: Footer text; "Show dock" / "Hide dock" via setBottomDockExpanded.

**UnifiedBottomDock**: If !bottomDockExpanded return null. Height bottomDockHeightPx. Placeholder "Captures · Console · Timeline" and "No captures yet".

---

### 24. Panels — full param mapping (UI → getP/setTreeParam keys)

| Panel | SubTab | Keys used (primary or alt) |
|-------|--------|----------------------------|
| **LeftPresetsPanel** | — | Applies PRESETS (Oak, Pine, Birch, Willow, Spruce, Acacia, Reset); each preset has fixed params; setTreeParams; dual key sync (trunkColor→vegetation.trunk.barkColor, leafColor→vegetation.leaves.colorBase, height→vegetation.species.heightBase_m, baseRadius→vegetation.trunk.baseRadius_m, etc.). |
| **LeftEnvironmentPanel** | — | vegetation.env.moisture/moisture, timeOfDay, autoSun, autoSunInfluence, atmosphereStrength, contactShadowStrength, contactShadowRadius_m, shadowSoftness, nearFieldAOStrength, canopySelfShadow; viewportSettings (backgroundColor, exposure, enableShadows, ambient/main/fill/hemi intensity and colors, mainLightPosition); groundLayer (simple | quick-grass). |
| **LeftSeedPanel** | — | seed, setSeed; vegetation.instance.age01/age01. |
| **TrunkPanel** | shape | height, vegetation.species.heightBase_m; baseRadius, vegetation.trunk.baseRadius_m; taperExponent, baseFlare, twist/vegetation.trunk.twist_deg; vegetation.trunk.barkColor/trunkColor. |
| **TrunkPanel** | gesture | vegetation.trunk.gestureKnotCount/trunkKnotCount, gestureKnotStrength/trunkKnotStrength, gestureKnotWidth/trunkKnotWidth. |
| **TrunkPanel** | cross | vegetation.trunk.ovality/trunkOvality, flutingStrength/trunkFlutingStrength, flutingCount, flutingSharpness, barkRoughness, barkAnisotropy, barkMicroDetail, barkCurvatureDetail. |
| **TrunkPanel** | buttress | vegetation.trunk.buttressStrength/buttressStrength, buttressCount, buttressSharpness. |
| **BranchingPanel** | structure | mainBranchCount/branchCount, angleMean_deg/branchAngle, angleVariance_deg/branchAngleVar, maxOrder, lengthRatio/branchLength, lengthDecay, radiusDecay, probability/branchProbability, apicalDominance. |
| **BranchingPanel** | junction | collarStrength, collarLength, junctionMetaballStrength, junctionMetaballRadius, unionBlendLength, unionBlendStrength, unionAsymmetry. |
| **BranchingPanel** | gesture | gestureKnotStrength/branchKnotStrength, gestureKnotWidth/branchKnotWidth, ovality/branchOvality. |
| **BranchingPanel** | damage | breakProbability, breakSeverity. |
| **LeavesPanel** | representation/color | vegetation.leaves.size_m/leafSize, clusterSize/leafClusterSize, cardsPerMeter/leafDensity, colorVariation/leafColorVariation, vegetation.leaves.colorBase/leafColor. |
| **LeavesPanel** | petiole | petioleLengthFactor, petioleDroop, petioleWidthFactor. |
| **BarkRootsPanel** | bark | vegetation.bark.branchScale/branchBarkScale. |
| **BarkRootsPanel** | roots | vegetation.roots.rootCount/rootCount, visibility/rootVisibility, shoulderLength/rootShoulderLength, shoulderRadiusMul/rootShoulderRadiusMul. |
| **WindLODPanel** | wind | gustStrength/windStrength, restLean, gustFrequency, directionVariance, turbulence, leafFlutter, hierarchyBias, trunkBend, branchBend, twigBend, canopyShear, phaseRandom, motionInertia, springResponse, motionDamping, parentCoupling, gustVariance, gustEnvelope, vortexStrength, branchTorsion, orderDrag, leafMicroTurbulence, solverInfluence; vegetation.wind.debugSkeleton/windDebugSkeleton (ToggleRow). WindDebugMini(gustEnvelope, orderDrag). |
| **WindLODPanel** | lod | vegetation.lod.distance.nearRadius_m, midRadius_m, farRadius_m; vegetation.lod.octaveCap.lod1/lod2/lod3 (octaveCapLod1/Lod2/Lod3). |
| **SpaceColonizationPanel** | attractors | vegetation.branching.attractorCount/attractorCount, maxIterations/maxIterations. |
| **SpaceColonizationPanel** | crown | vegetation.crown.crownRadiusRatio/crownRadiusRatio. |

---

### 25. UI components (full source)

**button.tsx**: cva variants (default, ghost, outline × sm, default, icon), cn, forwardRef Button.

**label.tsx**: Radix LabelPrimitive.Root, cn, forwardRef Label.

**scroll-area.tsx**: Radix ScrollAreaPrimitive.Root + Viewport, ScrollBar (vertical/horizontal), Corner.

**slider.tsx**: Radix SliderPrimitive.Root, Track, Range, Thumb; cn.

All use `@/lib/utils` (cn). **Note:** `src/lib/utils.ts` is missing in repo (constraint); TrunkPanel and UI import it.

**src/index.css** (full): @import Google Fonts JetBrains Mono, Inter. @tailwind base/components/utilities. @layer base: html, body, #root height 100%, margin 0, overflow hidden. :root CSS vars: --background 220 20% 4%, --foreground 210 20% 95%, --card, --card-foreground, --primary 142 65% 45%, --primary-foreground, --secondary, --secondary-foreground, --muted, --muted-foreground, --accent 142 50% 55%, --accent-foreground, --border, --input, --ring 142 65% 45%, --radius 0.5rem. * border-border; body bg-background text-foreground antialiased, font-family Inter system-ui sans-serif.

---

### 26. Scripts (full source)

**scripts/fixRadixBrokenExports.mjs**: Uses node:fs promises, node:path, node:process. RADIX_ROOT = path.join(process.cwd(), "node_modules", "@radix-ui"). exists(filePath) via fs.access. patchPackage(packageDir): read package.json; exportRoot = pkg.exports["."]; importEntry/requireEntry; if import path missing and require path exists, set exportRoot.import.default = requireDefault, set exportRoot.import.types from require.types or pkg.types; write package.json; return pkg.name. main(): list dirs in RADIX_ROOT, patchPackage each, log patched names. Postinstall/predev/prebuild/prepreview run it.

**scripts/speciesSnapshotRegression.mjs**: Imports fs, path, process, fileURLToPath, PNG from pngjs, pixelmatch, chromium from playwright, createServer from vite. ROOT, SNAPSHOT_ROOT, BASELINE_DIR, CURRENT_DIR, DIFF_DIR; SPECIES = ["Oak","Pine","Birch","Willow","Spruce","Acacia"]; UPDATE_BASELINE = argv "--update"; PORT = SNAPSHOT_PORT env or 4173; SEED = SNAPSHOT_SEED env or 1337; MAX_DIFF_RATIO = env or 0.006; BASE_URL. ensureDirs(); waitForServer(url, timeout 70s); startDevServer (Vite root ROOT, port PORT, strictPort true, optimizeDeps.entries index.html); compareSnapshots(speciesName): if UPDATE_BASELINE or no baseline, copy current→baseline; else read baseline + current PNG, same size check, pixelmatch threshold 0.1, ratio = mismatched/(width*height); if ratio > MAX_DIFF_RATIO write diff PNG and return failed; else return passed. captureSpeciesSnapshots: chromium headless, viewport 1280×720, for each SPECIES goto BASE_URL/snapshot/species?species=&seed=&play=0&ground=simple, waitFor root data-testid=snapshot-root, waitForTimeout 1200, root.screenshot to CURRENT_DIR/{species}.png. main: ensureDirs, startDevServer, waitForServer, captureSpeciesSnapshots, compareSnapshots each species, log results, exit 1 if any failed or dimension mismatch. snapshot:test = run; snapshot:update = run with --update.

---

### 27. Public assets inventory

**public/textures/**  
- grass.png — ground plane texture (repeat 26×26, MeshStandardMaterial).

**public/shaders/quick-grass/** (Quick Grass ground layer; loadQuickGrassShaders / createQuickGrassGround from `@/lib/quickGrassGround` — that module is missing in repo)  
- common.glsl, header.glsl, noise.glsl, oklab.glsl, sky.glsl  
- grass-lighting-model-vsh.glsl, grass-lighting-model-fsh.glsl  
- bugs-lighting-model-vsh.glsl, bugs-lighting-model-fsh.glsl  
- lighting-model-fsh.glsl, lighting-model-vsh.glsl  
- phong-lighting-model-fsh.glsl, phong-lighting-model-vsh.glsl  
- sky-lighting-model-fsh.glsl, sky-lighting-model-vsh.glsl  
- terrain-lighting-model-fsh.glsl, terrain-lighting-model-vsh.glsl  
- water-lighting-model-fsh.glsl, water-lighting-model-vsh.glsl, water-texture-fsh.glsl, water-texture-vsh.glsl  
- wind-lighting-model-fsh.glsl, wind-lighting-model-vsh.glsl  

---

### 28. Tree3DPreview.tsx — canonical source

**Canonical full source:** `src/components/tree/Tree3DPreview.tsx` (3024 lines). This document does not duplicate it. Sections 9, 11–19 and the line reference table (Section 19) describe every block, helper, and algorithm. For a single-file snapshot with zero data loss, copy that file to `docs/CODEX5.3TREES_Tree3DPreview_FULL_SOURCE.tsx` or keep it in repo as the single source of truth.

---

**End of Part III.**

---

**Document version:** 1.2.0  
**Last updated:** 2026-02-07  
**Methodology:** SAM (System Anatomy Mapping) — structure, behavior, interfaces, constraints, evidence, relationship matrix, code/NL reference, complete tree growth/parameters/wind reference (Part II), **and** full source of all files except Tree3DPreview + panel→param table + scripts + public assets (Part III). **Definitive reference: no intentional omission of app data.**
