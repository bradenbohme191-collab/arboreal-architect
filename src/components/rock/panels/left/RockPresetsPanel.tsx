/**
 * Rock Left Presets Panel
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { ROCK_PRESETS, DEFAULT_ROCK_PARAMS, type RockPresetName } from '@/types/rockParams';
import { Button } from '@/components/ui/button';
import { RockSectionTitle } from '../shared/RockSliderRow';

const PRESET_INFO: { id: RockPresetName; label: string; desc: string }[] = [
  { id: 'granite_boulder', label: 'Granite Boulder', desc: 'Coarse-grained igneous, rounded by glacial action' },
  { id: 'sandstone_arch', label: 'Sandstone Arch', desc: 'Wind-carved sedimentary with visible layering' },
  { id: 'basalt_columns', label: 'Basalt Columns', desc: 'Hexagonal columnar jointing from rapid cooling' },
  { id: 'marble_slab', label: 'Marble Slab', desc: 'Polished metamorphic with veining patterns' },
  { id: 'limestone_cliff', label: 'Limestone Cliff', desc: 'Layered marine sedimentary with chemical erosion' },
  { id: 'slate_outcrop', label: 'Slate Outcrop', desc: 'Fine-grained metamorphic with sheeting fractures' },
  { id: 'obsidian_shard', label: 'Obsidian Shard', desc: 'Volcanic glass with conchoidal fracture' },
  { id: 'mountain_face', label: 'Mountain Face', desc: 'Large-scale gneiss with folding and lichen' },
];

export default function RockPresetsPanel() {
  const { setRockParams, resetToDefaults } = useProRockLayout();

  const applyPreset = (id: RockPresetName) => {
    const preset = ROCK_PRESETS[id];
    // Reset to defaults first then overlay preset
    const merged = { ...DEFAULT_ROCK_PARAMS };
    for (const key of Object.keys(preset) as (keyof typeof preset)[]) {
      (merged as any)[key] = { ...(merged as any)[key], ...(preset as any)[key] };
    }
    setRockParams(merged);
  };

  return (
    <div className="space-y-4">
      <RockSectionTitle>Rock Presets</RockSectionTitle>
      <div className="grid gap-2">
        {PRESET_INFO.map((p) => (
          <Button
            key={p.id}
            variant="outline"
            className="h-auto py-3 px-3 flex flex-col items-start text-left gap-1 hover:border-accent/50 hover:bg-accent/5"
            onClick={() => applyPreset(p.id)}
          >
            <span className="text-sm font-medium">{p.label}</span>
            <span className="text-xs text-muted-foreground leading-tight">{p.desc}</span>
          </Button>
        ))}
      </div>
      <div className="pt-2 border-t border-border">
        <Button variant="ghost" size="sm" className="w-full text-xs" onClick={resetToDefaults}>
          Reset All to Defaults
        </Button>
      </div>
    </div>
  );
}
