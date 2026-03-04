/**
 * CODEX5.3TREES - Left Diagnostics Panel
 * Debug information and performance stats.
 */

import { useProVegLayout } from '@/contexts/ProVegLayoutContext';

export default function LeftDiagnosticsPanel() {
  const { treeParams, seed, lodLevel, windMode, isPlaying } = useProVegLayout();

  return (
    <div className="space-y-4">
      <div className="glass-panel rounded-lg p-3 space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-accent">State</h4>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="text-muted-foreground">Seed</div>
          <div className="text-primary">{seed}</div>
          <div className="text-muted-foreground">LOD Level</div>
          <div className="text-primary uppercase">{lodLevel}</div>
          <div className="text-muted-foreground">Wind Mode</div>
          <div className="text-primary uppercase">{windMode}</div>
          <div className="text-muted-foreground">Wind Playing</div>
          <div className={isPlaying ? 'text-accent' : 'text-muted-foreground'}>{isPlaying ? 'ON' : 'OFF'}</div>
        </div>
      </div>
      
      <div className="glass-panel rounded-lg p-3 space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-accent">Tree Parameters</h4>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="text-muted-foreground">Height</div>
          <div className="text-foreground">{treeParams.trunk.heightBase.toFixed(1)}m</div>
          <div className="text-muted-foreground">Base Radius</div>
          <div className="text-foreground">{treeParams.trunk.baseRadius.toFixed(2)}m</div>
          <div className="text-muted-foreground">Branch Count</div>
          <div className="text-foreground">{treeParams.branching.branchCount}</div>
          <div className="text-muted-foreground">Max Order</div>
          <div className="text-foreground">{treeParams.branching.maxOrder}</div>
          <div className="text-muted-foreground">Branch Angle</div>
          <div className="text-foreground">{treeParams.branching.angleMean}°</div>
          <div className="text-muted-foreground">Leaf Size</div>
          <div className="text-foreground">{treeParams.foliage.length.toFixed(3)}m</div>
        </div>
      </div>
      
      <div className="glass-panel rounded-lg p-3 space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-accent">Colors</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground">Trunk</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-foreground uppercase">{treeParams.trunk.barkColor}</span>
              <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: treeParams.trunk.barkColor }} />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono text-muted-foreground">Leaves</span>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono text-foreground uppercase">{treeParams.foliage.colorBase}</span>
              <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: treeParams.foliage.colorBase }} />
            </div>
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-lg p-3 space-y-2">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-accent">Subsystems</h4>
        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
          <div className="text-muted-foreground">Growth Age</div>
          <div className="text-foreground">{(treeParams.growth.age * 100).toFixed(0)}%</div>
          <div className="text-muted-foreground">Vitality</div>
          <div className="text-foreground">{(treeParams.growth.vitality * 100).toFixed(0)}%</div>
          <div className="text-muted-foreground">Soil Moisture</div>
          <div className="text-foreground">{(treeParams.soil.moisture * 100).toFixed(0)}%</div>
          <div className="text-muted-foreground">Bark Pattern</div>
          <div className="text-foreground">{treeParams.bark.pattern}</div>
          <div className="text-muted-foreground">Root Arch.</div>
          <div className="text-foreground">{treeParams.roots.architecture}</div>
          <div className="text-muted-foreground">Damage</div>
          <div className="text-foreground">{treeParams.damage.brokenBranchCount} breaks</div>
        </div>
      </div>
    </div>
  );
}
