/**
 * CODEX5.3TREES - Left Presets Panel
 * Species presets using HyperTreeParams species system.
 */

import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { SPECIES_PRESETS } from '@/types/hyperParams';
import { Button } from '@/components/ui/button';
import { TreePine } from '@/config/workspaceIcons';

const SPECIES_COLORS: Record<string, string> = {
  OAK: 'bg-species-oak',
  PINE: 'bg-species-pine',
  BIRCH: 'bg-species-birch',
  WILLOW: 'bg-species-willow',
  SPRUCE: 'bg-species-spruce',
  MAPLE: 'bg-species-oak',
  ACACIA: 'bg-species-acacia',
};

export default function LeftPresetsPanel() {
  const { treeParams, applyPreset, resetToDefaults } = useProVegLayout();
  const currentSpecies = treeParams.species;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Apply species presets to quickly change tree appearance. Each preset adjusts trunk, branching, bark, foliage, and growth parameters.
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        {Object.entries(SPECIES_PRESETS).map(([key, preset]) => {
          const isActive = currentSpecies === key;
          const colorClass = SPECIES_COLORS[key] || 'bg-muted';
          
          return (
            <Button
              key={key}
              variant={isActive ? 'default' : 'outline'}
              className={`h-auto py-3 flex flex-col items-center gap-1.5 ${isActive ? '' : 'hover:border-accent/50'}`}
              onClick={() => applyPreset(key)}
            >
              <div className={`w-3 h-3 rounded-full ${colorClass}`} />
              <span className="text-xs font-medium">{preset.name}</span>
              <span className="text-[9px] text-muted-foreground italic">{preset.scientificName}</span>
            </Button>
          );
        })}
      </div>
      
      <div className="pt-2 border-t border-border">
        <Button variant="ghost" className="w-full justify-center text-xs text-muted-foreground hover:text-foreground" onClick={resetToDefaults}>
          <TreePine className="w-3.5 h-3.5 mr-2" />
          Reset to Defaults
        </Button>
      </div>
      
      <div className="pt-4 border-t border-border">
        <h4 className="text-xs font-medium mb-2">Current Species</h4>
        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${SPECIES_COLORS[currentSpecies] || 'bg-muted'}`} />
            <span className="text-sm font-medium">
              {SPECIES_PRESETS[currentSpecies]?.name || currentSpecies}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-muted-foreground font-mono">
            <div>Height: {treeParams.trunk.heightBase.toFixed(1)}m</div>
            <div>Branches: {treeParams.branching.branchCount}</div>
            <div>Radius: {treeParams.trunk.baseRadius.toFixed(2)}m</div>
            <div>Orders: {treeParams.branching.maxOrder}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
