/**
 * Growth Timeline Panel - Wired to HyperTreeParams.growth
 * Includes OPUS Growth Timeline Scrubber instrument
 */
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { TreeSliderRow, TreeSectionTitle } from '../shared/TreeSliderRow';
import { interpolateGrowthStage, GROWTH_STAGES } from '@/types/hyperParams';
import { Button } from '@/components/ui/button';
import GrowthTimelineScrubber from '@/components/instruments/GrowthTimelineScrubber';

export default function GrowthPanel({ subTab }: { subTab: string }) {
  const { treeParams, setTreeParam } = useProVegLayout();
  const g = treeParams.growth;
  const stage = interpolateGrowthStage(g.age);

  if (subTab === 'vitality') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Health & Vigor</TreeSectionTitle>
        <TreeSliderRow label="Vitality" section="growth" field="vitality" value={g.vitality} min={0} max={1} step={0.02} hint="0 = dying · 1 = vigorous" />
        <TreeSliderRow label="Stress Level" section="growth" field="stressLevel" value={g.stressLevel} min={0} max={1} step={0.02} hint="Environmental stress (drought, pollution)" />
        <TreeSliderRow label="Growth Rate" section="growth" field="growthRate" value={g.growthRate} min={0.1} max={3} step={0.1} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <TreeSectionTitle>Age Timeline</TreeSectionTitle>
      <TreeSliderRow label="Age" section="growth" field="age" value={g.age} min={0} max={1} step={0.01} format={v => `${Math.round(v * 100)}%`} />
      
      <div className="bg-muted rounded p-2.5 space-y-1.5">
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">Current Stage</span>
          <span className="text-primary font-medium">{stage.name}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">Height ×</span>
          <span className="font-mono">{stage.heightMultiplier.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">Radius ×</span>
          <span className="font-mono">{stage.radiusMultiplier.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">Branches ×</span>
          <span className="font-mono">{stage.branchCountMultiplier.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">Leaf Density ×</span>
          <span className="font-mono">{stage.leafDensityMultiplier.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">Bark Fissure ×</span>
          <span className="font-mono">{stage.barkFissureDepth.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-[10px]">
          <span className="text-muted-foreground">Crown Shape</span>
          <span className="font-mono capitalize">{stage.crownShape}</span>
        </div>
      </div>

      <TreeSectionTitle>Quick Presets</TreeSectionTitle>
      <div className="grid grid-cols-4 gap-1.5">
        {GROWTH_STAGES.filter(s => s.name !== 'SEED').map(s => (
          <Button
            key={s.name}
            variant={stage.name === s.name ? 'default' : 'ghost'}
            size="sm"
            className="text-[10px] h-7 px-1"
            onClick={() => setTreeParam('growth', 'age', (s.ageRange[0] + s.ageRange[1]) / 2)}
          >
            {s.name.charAt(0) + s.name.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>
    </div>
  );
}
