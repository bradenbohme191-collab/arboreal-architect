# ProVeg Studio v2 Pro — Documentation Index

**Purpose:** Single entry point for all vegetation and ProVeg-related documentation across the ProEarth/GPTworking ecosystem.  
**Last Updated:** 2026-02-06

---

## 1. This App (ProVeg Studio v2 Pro)

| Document | Path | Description |
|----------|------|-------------|
| **Future Development Roadmap** | [FUTURE_DEVELOPMENT_ROADMAP.md](./FUTURE_DEVELOPMENT_ROADMAP.md) | Active execution plan: phased roadmap, workstreams, risks, and acceptance gates for all upcoming tree/foliage/terrain engine development. |
| **Ultimate Procedural Vegetation Engine Master Plan** | [ULTIMATE_PROCEDURAL_VEGETATION_ENGINE_MASTER_PLAN.md](./ULTIMATE_PROCEDURAL_VEGETATION_ENGINE_MASTER_PLAN.md) | 20-section vision: LOD architecture, GPU pipelines, streaming, materials, ecosystem, performance, QA, monetization, extensibility. Audited and aligned with existing ProEarth docs. |
| **This index** | [PROVEG_DOCUMENTATION_INDEX.md](./PROVEG_DOCUMENTATION_INDEX.md) | You are here. |

**In-repo (no doc file yet):**

- **UI spec:** Lucid Workspace UI is defined in `effect-setup-hub/docs/LUCID_WORKSPACE_UI.md` (fixed top/bottom bars, left/right rails + resizable drawers, bottom dock).
- **Tree generator:** `src/components/tree/Tree3DPreview.tsx` — single procedural tree (L-system / space colonization), distance-based LOD, wind in vertex shader.
- **Params:** `src/types/treeParams.ts` — `TreeParams` and `DEFAULT_TREE_PARAMS` (vegetation.* and legacy keys).

---

## 2. Canonical Vegetation & Procedural Tree Docs (WorldBuilder)

| Document | Location | Use when |
|----------|----------|----------|
| **Procedural Trees & Foliage Master Plan v1** | `worldbuilderv3/WorldBuilder_Copy3_Master_WBIN_Timeline_ProVeg_DEEPFIX2/WorldBuilder - Copy3/docs/PROCEDURAL_TREES_FOLIAGE_MASTER_PLAN_v1.md` | Defining TreeSeed, SpeciesTemplate, FieldAtlas, LOD ladder, determinism, two-pipeline (ecology + organism). |
| **Vegetation System Summary** | Same repo: `docs/VEGETATION_SYSTEM_SUMMARY.md` | Current V11 engine (TreeKernel, LOD3/2/1/0), species, integration roadmap, research (Space Colonization, GPU instancing, SSS). |
| **Vegetation Documentation Index** | Same repo: `docs/VEGETATION_DOCUMENTATION_INDEX.md` | Finding all vegetation docs inside WorldBuilder - Copy3. |
| **Vegetation Integration Quick Start** | Same repo: `docs/VEGETATION_INTEGRATION_QUICK_START.md` | Integrating vegetation with world generator and biomes. |

---

## 3. Hero Tree & ProVeg Consolidation (Proveg Repo)

| Document | Location | Use when |
|----------|----------|----------|
| **ProVeg Master Plan (Hero Trees)** | `worldbuilderv3/proveg_consolidated_v8_handoff_plus_breakdown/proveg/MASTER_PLAN.md` | Phenotype kernel, editor-first, one-seed-one-organism, v7/v8 implemented features (junctions, gesture knots, bark, damage, LOD, petiole). |
| **ProVeg Handoff** | Same repo: `HANDOFF.md` | Handoff for next builder/agent. |
| **Planning Next Layers** | Same repo: `PLANNING_NEXT_LAYERS.md` | Next-layer work after current baseline. |
| **Enhancements Breakdown** | Same repo: `ENHANCEMENTS_BREAKDOWN.md` | Breakdown of enhancement items. |

---

## 4. Foliage, Terrain & Biome Vision (ION-LucidEngine)

| Document | Location | Use when |
|----------|----------|----------|
| **Foliage & Terrain Studio Vision** | `ION-LucidEngine/docs/AI_THINKING_JOURNALS/42_FOLIAGE_TERRAIN_STUDIO_VISION.md` | Field → Profile → Instance pipeline; noise-as-placeholder; species/habitat/distribution/instance layers; Foliage Studio vs Terrain Studio. |
| **OPUStree Vegetation Architecture** | `ION-LucidEngine/docs/AI_THINKING_JOURNALS/41_OPUSTREE_VEGETATION_ARCHITECTURE.md` | OPUStree param panels and how they feed world/vegetation. |
| **OPUS 4.6 Biome LOD Consolidation** | `ION-LucidEngine/docs/AI_THINKING_JOURNALS/43_OPUS_46_BIOME_LOD_CONSOLIDATION.md` | 1km+ LOD scope; editable groups (Foliage, Grasses, Sands, Rocks, etc.); biome → group mapping. |
| **OPUS 4.6 Arrival Audit** | `ION-LucidEngine/docs/AI_THINKING_JOURNALS/40_OPUS_4_6_ARRIVAL_AUDIT.md` | Arrival/audit context for OPUS 4.6. |

---

## 5. LOD & Rendering Systems (effect-setup-hub, ION)

| Document | Location | Use when |
|----------|----------|----------|
| **Six-LOD Atmospheric Rendering** | `effect-setup-hub/docs/SIX_LOD_ATMOSPHERIC_RENDERING_SYSTEM.md` | LOD bands 0–5 (ground to deep space), physics-first atmosphere, seamless transitions. Vegetation LOD philosophy aligns. |
| **Deep Weather Terrain Optics** | `effect-setup-hub/docs/DEEP_WEATHER_TERRAIN_OPTICS_INTEGRATION.md` | Weather, terrain, optics integration. |
| **Complete Rendering Pipeline Design** | `effect-setup-hub/docs/COMPLETE_RENDERING_PIPELINE_DESIGN.md` | Full rendering pipeline. |
| **Lucid Workspace UI** | `effect-setup-hub/docs/LUCID_WORKSPACE_UI.md` | UI layout used by ProVeg Studio v2 (top bar, rails, drawers, bottom dock). |

---

## 6. World & Ecology (IONv1, NEXT_EVOLUTION)

| Document | Location | Use when |
|----------|----------|----------|
| **Next Evolution Plan** | `worldbuilderv4/IONv1_hyper_lensflare_docked_FIXED2/IONv1/docs/NEXT_EVOLUTION_PLAN.md` | Analysis modules (17), overlays (72), scientific classifications; next phases for planetary ecology. |
| **Realism Canon** | Same IONv1 repo: `docs/REALISM_CANON.md` | Realism standards and references. |
| **Master Globe Consolidation** | Same IONv1 repo: `docs/MASTER_GLOBE_CONSOLIDATION.md` | Globe-level systems consolidation. |
| **Master Dynamics Index** | Same IONv1 repo: `docs/MASTER_DYNAMICS_INDEX.md` | Dynamics systems index. |

---

## 7. WorldBuilder V3 / V4 Specifics

| Document | Location | Use when |
|----------|----------|----------|
| **World Builder V12 Master Plan** | WorldBuilder - Copy3: `docs/WORLD_BUILDER_V12_MASTER_PLAN.md` | V12 roadmap. |
| **V12 Phases and Progress** | Same: `docs/V12_PHASES_AND_PROGRESS.md` | Phase tracking. |
| **V12 Living Roadmap** | Same: `docs/V12_LIVING_ROADMAP.md` | Living roadmap. |
| **Vegetation Integration Audit** | Same: `docs/VEGETATION_INTEGRATION_AUDIT.md` | Integration audit. |
| **Vegetation Research and Enhancement** | Same: `docs/VEGETATION_SYSTEM_RESEARCH_AND_ENHANCEMENT_ANALYSIS.md` | Research and enhancement analysis. |
| **Errors Found (WB v3)** | `worldbuilderv3/ERRORS_FOUND.md` | Known issues (determinism, LOD, no-op editors, file map, registry). |
| **HANDOFF / AUDIT** | `worldbuilderv3/HANDOFF.md`, `AUDIT_AND_ANALYSIS.md` | Handoff and audit for WorldBuilder v3. |

---

## 8. Ports & Launchers

| Resource | Location | Purpose |
|----------|----------|---------|
| **ProVeg Studio v2 LAUNCH.bat** | `proveg-studio-v2/LAUNCH.bat` | Start dev server (port 5175), open http://127.0.0.1:5175. |
| **KILL_PORTS.bat** | `ProEarth/GPTworking/KILL_PORTS.bat` | List and optionally kill processes on 5173, 5174, 5175, 5176, 5180. |
| **Port reference** | (in KILL_PORTS.bat banner) | 5173 effect-setup-hub, 5174 WorldBuilder Copy3, 5175 ProVeg Studio v2, 5176 IONv1, 5180 Lucid Engine. |

---

## 9. How It All Fits Together

```
┌─────────────────────────────────────────────────────────────────────────┐
│ ULTIMATE_PROCEDURAL_VEGETATION_ENGINE_MASTER_PLAN (this app’s docs/)   │
│ 20 sections: LOD → close-range → GPU → streaming → materials →          │
│ ecosystem → performance → lighting → tools → collaboration →             │
│ optimization → QA → monetization → deployment → extensibility           │
└─────────────────────────────────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ PROCEDURAL_TREES_FOLIAGE_MASTER_PLAN_v1 (WorldBuilder - Copy3)          │
│ Vocabulary, TreeSeed, SpeciesTemplate, FieldAtlas, LOD ladder,          │
│ two pipelines, determinism                                              │
└─────────────────────────────────────────────────────────────────────────┘
                    │
        ┌───────────┼───────────┐
        ▼           ▼           ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────────────────────────────┐
│ ProVeg       │ │ Vegetation   │ │ FOLIAGE_TERRAIN_STUDIO_VISION        │
│ MASTER_PLAN  │ │ System       │ │ Field→Profile→Instance; noise         │
│ (hero tree   │ │ Summary      │ │ philosophy; Foliage Studio phases     │
│ phenotype    │ │ (V11 engine, │ │                                      │
│ kernel)      │ │ integration) │ │ OPUS 4.6 Biome LOD (1km+ groups)     │
└──────────────┘ └──────────────┘ └──────────────────────────────────────┘
        │                   │
        └─────────┬─────────┘
                  ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ ProVeg Studio v2 Pro (this app)                                         │
│ Browser hero-tree editor: Lucid UI + Tree3DPreview + full tree params.  │
│ Implements: single tree, distance LOD, wind, all panels;                │
│ extends toward: meshlet LOD, WebGPU, streaming (per Master Plan).        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 10. Quick Links by Task

| Task | Start here |
|------|------------|
| Understand the full vision (LOD, GPU, streaming, ecosystem) | [ULTIMATE_PROCEDURAL_VEGETATION_ENGINE_MASTER_PLAN.md](./ULTIMATE_PROCEDURAL_VEGETATION_ENGINE_MASTER_PLAN.md) |
| Align vocabulary (TreeSeed, SpeciesTemplate, FieldAtlas) | PROCEDURAL_TREES_FOLIAGE_MASTER_PLAN_v1 + Vocabulary section in Ultimate Plan |
| See what’s implemented in WorldBuilder vegetation | VEGETATION_SYSTEM_SUMMARY.md |
| See what’s implemented in ProVeg (hero tree) | proveg MASTER_PLAN.md, ProVeg Studio v2 `treeParams.ts` + Tree3DPreview |
| Design Foliage Studio / Terrain Studio features | 42_FOLIAGE_TERRAIN_STUDIO_VISION.md |
| Edit biomes at 1km+ (groups, panels) | 43_OPUS_46_BIOME_LOD_CONSOLIDATION.md |
| Match LOD philosophy (seamless bands) | SIX_LOD_ATMOSPHERIC_RENDERING_SYSTEM.md |
| Plan ecology / analysis / next evolution | NEXT_EVOLUTION_PLAN.md |
| Free a stuck dev port | `../KILL_PORTS.bat` |
