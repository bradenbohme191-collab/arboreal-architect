/**
 * CODEX5.3TREES - Leaves, BarkRoots, WindLOD, SpaceColonization Panels
 */
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { SliderRow, ColorRow, SectionTitle } from '@/components/panels/shared/SliderRow';
import { getPN, getPS } from '@/types/treeParams';

export default function LeavesPanel({ subTab }: { subTab: string }) {
  const { treeParams } = useProVegLayout();
  return (
    <div className="space-y-4">
      <SliderRow label="Leaf Size (m)" value={getPN(treeParams, 'leafSize', 'vegetation.leaves.size_m', 0.08)} min={0.02} max={0.3} step={0.01} keyPrimary="leafSize" keyAlt="vegetation.leaves.size_m" unit="m" />
      <SliderRow label="Cluster Size" value={getPN(treeParams, 'leafClusterSize', 'vegetation.leaves.clusterSize', 12)} min={3} max={30} step={1} keyPrimary="leafClusterSize" keyAlt="vegetation.leaves.clusterSize" />
      <SliderRow label="Color Variation" value={getPN(treeParams, 'leafColorVariation', 'vegetation.leaves.colorVariation', 0.15)} min={0} max={0.5} step={0.02} keyPrimary="leafColorVariation" keyAlt="vegetation.leaves.colorVariation" />
      <ColorRow label="Leaf Color" value={getPS(treeParams, 'leafColor', 'vegetation.leaves.colorBase', '#4a7c3f')} keyPrimary="leafColor" keyAlt="vegetation.leaves.colorBase" />
    </div>
  );
}
