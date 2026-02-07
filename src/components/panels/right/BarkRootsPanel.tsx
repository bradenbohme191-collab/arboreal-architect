import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { SliderRow } from '@/components/panels/shared/SliderRow';
import { getPN } from '@/types/treeParams';

export default function BarkRootsPanel({ subTab }: { subTab: string }) {
  const { treeParams } = useProVegLayout();
  if (subTab === 'bark') {
    return (
      <div className="space-y-4">
        <SliderRow label="Branch Bark Scale" value={getPN(treeParams, 'branchBarkScale', 'vegetation.bark.branchScale', 0.65)} min={0.2} max={1.2} step={0.05} keyPrimary="branchBarkScale" keyAlt="vegetation.bark.branchScale" />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <SliderRow label="Root Count" value={getPN(treeParams, 'rootCount', 'vegetation.roots.rootCount', 5)} min={0} max={12} step={1} keyPrimary="rootCount" keyAlt="vegetation.roots.rootCount" />
      <SliderRow label="Root Visibility" value={getPN(treeParams, 'rootVisibility', 'vegetation.roots.visibility', 0.6)} min={0} max={1} step={0.05} keyPrimary="rootVisibility" keyAlt="vegetation.roots.visibility" />
    </div>
  );
}
