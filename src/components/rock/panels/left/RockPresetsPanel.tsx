/**
 * Rock Left Presets Panel - Expanded with 16 geological presets
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { ROCK_PRESETS, DEFAULT_ROCK_PARAMS, type RockPresetName } from '@/types/rockParams';
import { Button } from '@/components/ui/button';
import { RockSectionTitle } from '../shared/RockSliderRow';

const PRESET_INFO: { id: RockPresetName; label: string; desc: string; origin: string }[] = [
  // Igneous
  { id: 'granite_boulder', label: 'Granite Boulder', desc: 'Coarse-grained plutonic, rounded by glacial action', origin: 'Igneous' },
  { id: 'basalt_columns', label: 'Basalt Columns', desc: 'Hexagonal columnar jointing from rapid lava cooling', origin: 'Igneous' },
  { id: 'obsidian_shard', label: 'Obsidian Shard', desc: 'Volcanic glass with conchoidal fracture', origin: 'Igneous' },
  { id: 'pumice_volcanic', label: 'Pumice', desc: 'Highly vesicular volcanic foam, ultra-light', origin: 'Igneous' },
  // Sedimentary
  { id: 'sandstone_arch', label: 'Sandstone Arch', desc: 'Wind-carved aeolian with cross-bedding & tafoni', origin: 'Sedimentary' },
  { id: 'limestone_cliff', label: 'Limestone Cliff', desc: 'Marine sedimentary with fossils & karst dissolution', origin: 'Sedimentary' },
  { id: 'conglomerate_river', label: 'River Conglomerate', desc: 'Poorly sorted river cobbles in a matrix', origin: 'Sedimentary' },
  { id: 'travertine_terraced', label: 'Travertine', desc: 'Chemical precipitate with rhythmic banding', origin: 'Sedimentary' },
  { id: 'flint_nodule', label: 'Flint Nodule', desc: 'Microcrystalline silica with waxy conchoidal fracture', origin: 'Sedimentary' },
  { id: 'breccia_fault', label: 'Fault Breccia', desc: 'Crushed angular fragments from tectonic shear', origin: 'Sedimentary' },
  // Metamorphic
  { id: 'marble_slab', label: 'Marble Slab', desc: 'Recrystallized limestone with veining & translucency', origin: 'Metamorphic' },
  { id: 'slate_outcrop', label: 'Slate Outcrop', desc: 'Low-grade with perfect basal cleavage', origin: 'Metamorphic' },
  { id: 'quartzite_ridge', label: 'Quartzite Ridge', desc: 'Recrystallized sandstone, vitreous & hard', origin: 'Metamorphic' },
  { id: 'schist_foliated', label: 'Foliated Schist', desc: 'Medium-grade with mica-rich schistosity', origin: 'Metamorphic' },
  { id: 'gneiss_banded', label: 'Banded Gneiss', desc: 'High-grade with bold light/dark banding', origin: 'Metamorphic' },
  { id: 'mountain_face', label: 'Mountain Face', desc: 'Large-scale exposed face with lichen & rills', origin: 'Metamorphic' },
];

export default function RockPresetsPanel() {
  const { setRockParams, resetToDefaults } = useProRockLayout();

  const applyPreset = (id: RockPresetName) => {
    const preset = ROCK_PRESETS[id];
    const merged = { ...DEFAULT_ROCK_PARAMS };
    for (const key of Object.keys(preset) as (keyof typeof preset)[]) {
      (merged as any)[key] = { ...(merged as any)[key], ...(preset as any)[key] };
    }
    setRockParams(merged);
  };

  const origins = ['Igneous', 'Sedimentary', 'Metamorphic'] as const;

  return (
    <div className="space-y-4">
      {origins.map(origin => (
        <div key={origin}>
          <RockSectionTitle>{origin}</RockSectionTitle>
          <div className="grid gap-2">
            {PRESET_INFO.filter(p => p.origin === origin).map(p => (
              <Button
                key={p.id}
                variant="outline"
                className="h-auto py-2.5 px-3 flex flex-col items-start text-left gap-0.5 hover:border-accent/50 hover:bg-accent/5"
                onClick={() => applyPreset(p.id)}
              >
                <span className="text-sm font-medium">{p.label}</span>
                <span className="text-[10px] text-muted-foreground leading-tight">{p.desc}</span>
              </Button>
            ))}
          </div>
        </div>
      ))}
      <div className="pt-2 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full text-xs" onClick={resetToDefaults}>
          Reset All to Defaults
        </Button>
      </div>
    </div>
  );
}
