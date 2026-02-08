# ProVeg Studio v2 Pro - Future Development Roadmap

**Status:** Active planning document  
**Last Updated:** 2026-02-06  
**Scope:** All future plans for evolving this app into a full developer engine for trees, foliage, and organic terrain assets.

---

## 1. Mission

Build a production-grade vegetation platform that supports:

- Hero-quality single-tree authoring (close camera, film/game asset quality).
- Forest-scale deployment (large scenes with stable performance).
- Species-accurate growth behavior and motion response.
- Deterministic outputs (same seed + params = same result).
- Editor workflow that is fast, testable, and extensible.

---

## 2. Current Baseline (As Of 2026-02-06)

Implemented:

- Param-driven procedural tree generation with species profiles.
- Distance LOD controls and wind controls in UI.
- Species silhouette constraints for spruce/acacia crown shaping.
- Wind debug mini-visualizer in the Wind panel.
- Snapshot regression route and scripts for Oak, Pine, Birch, Willow, Spruce, Acacia.
- Build stability fix for broken Radix package exports via automated script.

Gaps that remain highest priority:

- Wind realism pass 2 (hierarchy-aware dynamic gust behavior).
- Geometry realism pass 2 (trunk-root continuity and branch junction morph quality).
- Lighting and shading pass 2 (species look presets, stronger scene realism).

---

## 3. Future Phases (Execution Order)

### Phase 1 - Core Stabilization and Determinism (Now -> 2026-02-20)

Goals:

- Keep build/dev/snapshot flows stable for daily iteration.
- Lock deterministic generation and regression workflow as non-optional.

Deliverables:

- Finalize deterministic seed policy for all procedural branches/leaves/wind init states.
- Add automated preflight checks for snapshot harness dependencies.
- Expand snapshot suite to include quick-grass mode and at least one animated wind frame test.

Exit criteria:

- `npm run build` and `npm run snapshot:test` are green in CI-equivalent local runs.
- Re-running snapshot tests on unchanged branch gives <=0.6% diff threshold (current target).

### Phase 2 - Wind Realism 2.0 (2026-02-20 -> 2026-03-20)

Goals:

- Convert current bend model to richer hierarchical response.
- Improve gust behavior so trees do not hold unrealistic static bends.

Deliverables:

- Parent-child branch force propagation update:
- Parent motion contributes to child inertia and phase.
- Child still receives independent local wind and turbulence.
- Per-order aerodynamic model:
- Drag and inertia tuned by branch order, radius, and leaf load.
- Gust system rewrite:
- Time-varying gust envelopes, directional drift, pulse decay, and recovery.
- Leaf micro-motion improvements:
- Independent high-frequency flutter layered over macro branch motion.
- Debug tools:
- Add branch-order overlays and gust timeline graph for tuning.

Exit criteria:

- Observable non-static gust cycles under sustained wind.
- Branch hierarchy visibly coherent in debug mode.
- No major perf regression (>10%) relative to current baseline at same scene complexity.

### Phase 3 - Geometry Realism 2.0 (2026-03-20 -> 2026-04-25)

Goals:

- Remove hard-cut geometry transitions.
- Improve organic continuity from roots to trunk to branches.

Deliverables:

- Trunk-root continuity pass:
- Main trunk behaves as true primary axis with smooth root merge.
- Branch union quality pass:
- Junction blend handles collars, flares, and asymmetry without tube-stuck look.
- Species-aware allometry constraints:
- Better trunk taper and primary scaffold differences by species class.
- Surface continuity:
- Improve normal continuity and shading behavior across unions.

Exit criteria:

- No visible hard seams at major trunk/branch unions in near camera.
- Root-trunk transition reads as single organic structure.
- Snapshot baselines updated with no unacceptable regressions.

### Phase 4 - Lighting, Materials, and Scene Realism (2026-04-25 -> 2026-05-30)

Goals:

- Increase perceived realism via lighting and material response.
- Provide repeatable scene presets for species look development.

Deliverables:

- Species lighting presets:
- Sun angle, skylight tint, AO strength, contact shadow settings per species archetype.
- Bark and leaf shading updates:
- Better near-field AO, canopy self-shadow balance, and bark grain response.
- Ground/scene presets:
- Studio neutral, overcast, golden hour, harsh noon.
- Shadow quality controls:
- Bias, cascade-like tuning strategy, and clear quality-performance tiers.

Exit criteria:

- Species presets produce clearly distinct but physically plausible looks.
- Shadows and contact grounding are stable without obvious acne or peter-panning.

### Phase 5 - Species Library Expansion (2026-05-30 -> 2026-07-15)

Goals:

- Expand beyond broadleaf baseline into robust conifer and biome-specific classes.

Deliverables:

- Add new species packs:
- Pine variants, fir, cedar, cypress, eucalyptus, baobab, mangrove, shrubs.
- Species-specific rule sets:
- Branching grammar, silhouette envelope, bark style, leaf model, wind profile.
- Preset management:
- Save/load/share profile bundles with versioned schema.

Exit criteria:

- At least 12 production-usable species templates with snapshot coverage.
- Each species has validated silhouette and wind behavior presets.

### Phase 6 - Terrain and Foliage Ecosystem Layer (2026-07-15 -> 2026-09-01)

Goals:

- Transition from single-asset workflow to ecosystem authoring workflow.

Deliverables:

- Foliage field controls:
- Density maps, biome masks, slope/moisture constraints, clustering controls.
- Ground cover integration:
- Grass, shrubs, debris, and undergrowth coherence around trees.
- Terrain interaction:
- Root exposure and placement adaptation to slope/erosion hints.

Exit criteria:

- Generate coherent multi-species scenes with controllable ecological patterns.
- Keep interactive editing usable at target scene scales.

### Phase 7 - Performance, Streaming, and Scale (2026-09-01 -> 2026-10-31)

Goals:

- Keep visual gains while scaling to heavy scenes.

Deliverables:

- LOD progression improvements:
- Lower popping, better silhouette retention, improved leaf/branch reduction.
- Instance and streaming strategy:
- Efficient loading/unloading and memory budget controls.
- GPU cost profiling:
- Targeted optimizations for vertex work, overdraw, and shadow cost.

Exit criteria:

- Stable interaction at large scene counts on target hardware profile.
- Memory and frame-time budgets tracked in repeatable benchmarks.

### Phase 8 - Productization and Extensibility (2026-11-01 -> 2027-01-31)

Goals:

- Make the engine usable as a platform, not only an internal prototype.

Deliverables:

- Export pipeline:
- Clean asset export for DCC/game workflows (geometry, materials, wind metadata).
- Plugin and API surfaces:
- Species modules and tool extensions without core forks.
- Collaboration features:
- Versioned presets, compare mode, and structured change history.
- Release hardening:
- Documentation completeness and regression suites for core systems.

Exit criteria:

- Teams can generate, tune, and export assets reliably.
- New species/features can be added through documented extension points.

---

## 4. Cross-Cutting Workstreams (Always On)

`WS-1 Testing and Regression`

- Snapshot tests for species and key presets.
- Wind behavior regression scenes.
- Geometry seam checks for trunk-root and branch unions.

`WS-2 Documentation and Knowledge Base`

- Keep this roadmap and implementation docs in sync every phase close.
- Record defaults, ranges, and rationale for all new params.

`WS-3 UX and Tooling Quality`

- Keep panel controls understandable and grouped by intent.
- Add diagnostic panels before adding complex hidden behavior.

`WS-4 Data/Schema Governance`

- Version `TreeParams` schema.
- Avoid breaking legacy key compatibility without migration logic.

---

## 5. Plan Backlog (Detailed)

Priority P0 (must complete before broad scaling):

- Wind hierarchy solver rewrite.
- Branch union and trunk-root morphology pass.
- Lighting preset system and shadow calibration.
- Deterministic animated snapshot tests.

Priority P1:

- Species pack expansion to 12+ templates.
- Terrain-aware placement and undergrowth coherence.
- Performance instrumentation dashboard.

Priority P2:

- Streaming/instancing scale-out optimizations.
- Export pipeline hardening.
- Plugin API and collaboration workflows.

---

## 6. Risks and Mitigations

Risk: Visual realism improvements reduce performance too much.  
Mitigation: Every feature lands with tiered quality settings and benchmark checks.

Risk: Wind realism becomes unstable or hard to tune.  
Mitigation: Keep debug overlays and deterministic test scenes for every solver change.

Risk: Parameter growth makes UI unusable.  
Mitigation: Group controls by intent, maintain presets, and hide advanced settings behind expert mode.

Risk: Species expansion drifts into arbitrary art direction.  
Mitigation: Add silhouette, allometry, and motion acceptance criteria for each species.

---

## 7. Definition Of Done Per Phase

Each phase is complete only when:

- Functional targets are implemented.
- Snapshot regressions are green.
- Performance is within agreed budget or documented with explicit tradeoff.
- Documentation updated (this roadmap + relevant implementation docs).

---

## 8. Immediate Next Actions

`A1` Start Phase 2 wind solver branch with strict before/after comparison scenes.  
`A2` Define geometry seam quality tests for trunk-root and major branch junctions.  
`A3` Implement first species lighting preset set (Oak, Pine, Spruce, Acacia).  
`A4` Add roadmap progress tracker section after each completed phase.

