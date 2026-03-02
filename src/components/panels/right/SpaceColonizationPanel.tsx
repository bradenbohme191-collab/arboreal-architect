/**
 * Space Colonization Panel - Crown shape and attractor controls
 */
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { TreeSliderRow, TreeSectionTitle } from '../shared/TreeSliderRow';

export default function SpaceColonizationPanel({ subTab }: { subTab: string }) {
  const { treeParams } = useProVegLayout();
  const b = treeParams.branching;

  if (subTab === 'attractors') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Space Colonization</TreeSectionTitle>
        <p className="text-[10px] text-muted-foreground">Controls for attractor-based crown generation (when Space Colonization model is active).</p>
        <TreeSliderRow label="Child Budget" section="branching" field="childBudget" value={b.childBudget} min={1} max={8} step={1} format={v => v.toFixed(0)} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <TreeSectionTitle>Crown</TreeSectionTitle>
      <TreeSliderRow label="Start Height" section="branching" field="startHeight" value={b.startHeight} min={0.05} max={0.7} step={0.05} hint="Where branching begins along trunk" />
    </div>
  );
}
