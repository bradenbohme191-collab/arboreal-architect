/**
 * Soil System Panel - Wired to HyperTreeParams.soil
 */
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { TreeSliderRow, TreeToggleRow, TreeSectionTitle } from '../shared/TreeSliderRow';

export default function SoilPanel({ subTab }: { subTab: string }) {
  const { treeParams } = useProVegLayout();
  const s = treeParams.soil;

  if (subTab === 'composition') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Moisture & Chemistry</TreeSectionTitle>
        <TreeSliderRow label="Moisture" section="soil" field="moisture" value={s.moisture} min={0} max={1} step={0.02} hint="0 = arid desert · 1 = waterlogged" />
        <TreeSliderRow label="Nutrients" section="soil" field="nutrients" value={s.nutrients} min={0} max={1} step={0.02} hint="Affects growth vigor and leaf density" />
        <TreeSliderRow label="Water Table Depth" section="soil" field="waterTableDepth" value={s.waterTableDepth} min={0.5} max={5} step={0.25} unit="m" />
        <TreeSliderRow label="Organic Matter" section="soil" field="organicMatter" value={s.organicMatter} min={0} max={1} step={0.05} />
        <TreeSliderRow label="Rock Density" section="soil" field="rockDensity" value={s.rockDensity} min={0} max={1} step={0.05} hint="Obstacles that deflect root growth" />
      </div>
    );
  }

  if (subTab === 'visual') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Visual Settings</TreeSectionTitle>
        <TreeSliderRow label="Visual Opacity" section="soil" field="visualOpacity" value={s.visualOpacity} min={0} max={1} step={0.05} />
        <TreeSliderRow label="Radius (m)" section="soil" field="radius" value={s.radius} min={1} max={10} step={0.5} unit="m" />
        <TreeSliderRow label="Depth (m)" section="soil" field="depth" value={s.depth} min={0.5} max={5} step={0.25} unit="m" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <TreeSectionTitle>Soil System</TreeSectionTitle>
      <TreeToggleRow label="Soil Enabled" section="soil" field="enabled" value={s.enabled} />
      <TreeSliderRow label="Moisture" section="soil" field="moisture" value={s.moisture} min={0} max={1} step={0.02} />
      <TreeSliderRow label="Nutrients" section="soil" field="nutrients" value={s.nutrients} min={0} max={1} step={0.02} />
      <TreeSliderRow label="Rock Density" section="soil" field="rockDensity" value={s.rockDensity} min={0} max={1} step={0.05} />
    </div>
  );
}
