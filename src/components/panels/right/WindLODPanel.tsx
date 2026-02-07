import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { SliderRow, ToggleRow, SectionTitle } from '@/components/panels/shared/SliderRow';
import { getPN, getPB } from '@/types/treeParams';

export default function WindLODPanel({ subTab }: { subTab: string }) {
  const { treeParams } = useProVegLayout();
  if (subTab === 'wind') {
    return (
      <div className="space-y-4">
        <SliderRow label="Wind Strength" value={getPN(treeParams, 'windStrength', 'vegetation.wind.gustStrength', 0.5)} min={0} max={2} step={0.05} keyPrimary="windStrength" keyAlt="vegetation.wind.gustStrength" />
        <SliderRow label="Trunk Bend" value={getPN(treeParams, 'trunkBend', 'vegetation.wind.trunkBend', 0.02)} min={0} max={0.1} step={0.005} keyPrimary="trunkBend" keyAlt="vegetation.wind.trunkBend" />
        <SliderRow label="Branch Bend" value={getPN(treeParams, 'branchBend', 'vegetation.wind.branchBend', 0.15)} min={0} max={0.5} step={0.02} keyPrimary="branchBend" keyAlt="vegetation.wind.branchBend" />
        <SliderRow label="Leaf Flutter" value={getPN(treeParams, 'leafFlutter', 'vegetation.wind.leafFlutter', 0.5)} min={0} max={1} step={0.05} keyPrimary="leafFlutter" keyAlt="vegetation.wind.leafFlutter" />
        <SliderRow label="Gust Frequency" value={getPN(treeParams, 'windGustFrequency', 'vegetation.wind.gustFrequency', 0.8)} min={0.1} max={2} step={0.1} keyPrimary="windGustFrequency" keyAlt="vegetation.wind.gustFrequency" />
      </div>
    );
  }
  return (
    <div className="space-y-4">
      <SectionTitle>LOD Distances</SectionTitle>
      <SliderRow label="Near Radius" value={getPN(treeParams, 'nearRadius_m', 'vegetation.lod.distance.nearRadius_m', 15)} min={5} max={50} step={1} keyPrimary="nearRadius_m" keyAlt="vegetation.lod.distance.nearRadius_m" unit="m" />
      <SliderRow label="Mid Radius" value={getPN(treeParams, 'midRadius_m', 'vegetation.lod.distance.midRadius_m', 40)} min={20} max={100} step={5} keyPrimary="midRadius_m" keyAlt="vegetation.lod.distance.midRadius_m" unit="m" />
      <SliderRow label="Far Radius" value={getPN(treeParams, 'farRadius_m', 'vegetation.lod.distance.farRadius_m', 100)} min={50} max={200} step={10} keyPrimary="farRadius_m" keyAlt="vegetation.lod.distance.farRadius_m" unit="m" />
    </div>
  );
}
