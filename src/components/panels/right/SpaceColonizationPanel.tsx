import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { SliderRow, SectionTitle } from '@/components/panels/shared/SliderRow';
import { getPN } from '@/types/treeParams';

export default function SpaceColonizationPanel({ subTab }: { subTab: string }) {
  const { treeParams } = useProVegLayout();
  if (subTab === 'attractors') {
    return (
      <div className="space-y-4">
        <SliderRow label="Attractor Count" value={getPN(treeParams, 'attractorCount', 'vegetation.branching.attractorCount', 200)} min={50} max={500} step={10} keyPrimary="attractorCount" keyAlt="vegetation.branching.attractorCount" />
        <SliderRow label="Max Iterations" value={getPN(treeParams, 'maxIterations', 'vegetation.branching.maxIterations', 150)} min={50} max={300} step={10} keyPrimary="maxIterations" keyAlt="vegetation.branching.maxIterations" />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <SliderRow label="Crown Radius Ratio" value={getPN(treeParams, 'crownRadiusRatio', 'vegetation.crown.crownRadiusRatio', 0.8)} min={0.3} max={2} step={0.1} keyPrimary="crownRadiusRatio" keyAlt="vegetation.crown.crownRadiusRatio" />
    </div>
  );
}
