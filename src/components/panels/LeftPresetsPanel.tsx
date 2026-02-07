/**
 * CODEX5.3TREES - Left Presets Panel
 * 
 * Species presets for quick tree style application.
 */

import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { SPECIES_PRESETS, DEFAULT_TREE_PARAMS } from '@/types/treeParams';
import { Button } from '@/components/ui/button';
import { TreePine } from '@/config/workspaceIcons';

const SPECIES_COLORS: Record<string, string> = {
  Oak: 'bg-species-oak',
  Pine: 'bg-species-pine',
  Birch: 'bg-species-birch',
  Willow: 'bg-species-willow',
  Spruce: 'bg-species-spruce',
  Acacia: 'bg-species-acacia',
};

export default function LeftPresetsPanel() {
  const { treeParams, setTreeParams } = useProVegLayout();

  const handleApplyPreset = (preset: typeof SPECIES_PRESETS[0]) => {
    setTreeParams({ ...treeParams, ...preset.params });
  };

  const handleReset = () => {
    setTreeParams({ ...DEFAULT_TREE_PARAMS });
  };

  // Determine current species from params
  const currentProfile = treeParams['vegetation.species.profile'] || treeParams.speciesProfile;

  return (
    <div className="space-y-4">
      <p className="text-xs text-muted-foreground">
        Apply species presets to quickly change tree appearance. Each preset adjusts height, trunk, branching, and foliage parameters.
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        {SPECIES_PRESETS.map((preset) => {
          const isActive = currentProfile === preset.profile;
          const colorClass = SPECIES_COLORS[preset.name] || 'bg-muted';
          
          return (
            <Button
              key={preset.name}
              variant={isActive ? 'default' : 'outline'}
              className={`h-auto py-3 flex flex-col items-center gap-1.5 ${
                isActive ? '' : 'hover:border-accent/50'
              }`}
              onClick={() => handleApplyPreset(preset)}
            >
              <div className={`w-3 h-3 rounded-full ${colorClass}`} />
              <span className="text-xs font-medium">{preset.name}</span>
            </Button>
          );
        })}
      </div>
      
      <div className="pt-2 border-t border-border">
        <Button
          variant="ghost"
          className="w-full justify-center text-xs text-muted-foreground hover:text-foreground"
          onClick={handleReset}
        >
          <TreePine className="w-3.5 h-3.5 mr-2" />
          Reset to Defaults
        </Button>
      </div>
      
      <div className="pt-4 border-t border-border">
        <h4 className="text-xs font-medium mb-2">Current Species</h4>
        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${
              SPECIES_PRESETS.find(p => p.profile === currentProfile)
                ? SPECIES_COLORS[SPECIES_PRESETS.find(p => p.profile === currentProfile)!.name]
                : 'bg-muted'
            }`} />
            <span className="text-sm font-medium">
              {SPECIES_PRESETS.find(p => p.profile === currentProfile)?.name || 'Custom'}
            </span>
          </div>
          <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px] text-muted-foreground font-mono">
            <div>Height: {(treeParams.height as number || 8).toFixed(1)}m</div>
            <div>Branches: {treeParams.branchCount || 8}</div>
            <div>Radius: {(treeParams.baseRadius as number || 0.4).toFixed(2)}m</div>
            <div>Orders: {treeParams.maxOrder || 4}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
