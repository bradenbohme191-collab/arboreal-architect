/**
 * CODEX5.3TREES - Damage Panel
 * Knots, branch breaking, disease/rot, physical deformation.
 */

import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { TreeSliderRow, TreeToggleRow, TreeSectionTitle } from '../shared/TreeSliderRow';

export default function DamagePanel({ subTab }: { subTab: string }) {
  const { treeParams } = useProVegLayout();
  const d = treeParams.damage;

  if (subTab === 'knots') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Knot Formation</TreeSectionTitle>
        <TreeSliderRow label="Knot Density" section="damage" field="knotDensity" value={d.knotDensity} min={0} max={1} step={0.01} hint="Frequency of knots on trunk/branches" />
        <TreeSliderRow label="Min Size" section="damage" field="knotSizeRange" value={d.knotSizeRange[0]} min={0.005} max={0.1} step={0.005} format={v => `${(v*100).toFixed(1)}cm`} />
        <TreeSliderRow label="Max Size" section="damage" field="knotSizeRange" value={d.knotSizeRange[1]} min={0.02} max={0.2} step={0.005} format={v => `${(v*100).toFixed(1)}cm`} />
        <TreeSliderRow label="Healing Rate" section="damage" field="healingRate" value={d.healingRate} min={0} max={1} step={0.01} hint="How quickly wounds heal over" />
      </div>
    );
  }

  if (subTab === 'breaking') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Branch Breaking</TreeSectionTitle>
        <TreeToggleRow label="Breaking Enabled" section="damage" field="breakingEnabled" value={d.breakingEnabled} />
        <TreeSliderRow label="Broken Branches" section="damage" field="brokenBranchCount" value={d.brokenBranchCount} min={0} max={10} step={1} format={v => v.toFixed(0)} />
        <TreeSliderRow label="Break Threshold" section="damage" field="breakThreshold" value={d.breakThreshold} min={0.1} max={2} step={0.05} hint="Force multiplier before snapping" />
      </div>
    );
  }

  if (subTab === 'disease') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Disease & Rot</TreeSectionTitle>
        <TreeSliderRow label="Disease Level" section="damage" field="diseaseLevel" value={d.diseaseLevel} min={0} max={1} step={0.01} />
        <TreeSliderRow label="Rot Spots" section="damage" field="rotSpots" value={d.rotSpots} min={0} max={10} step={1} format={v => v.toFixed(0)} />
      </div>
    );
  }

  // Default: deformation
  return (
    <div className="space-y-3">
      <TreeSectionTitle>Physical Deformation</TreeSectionTitle>
      <TreeSliderRow label="Lean Angle" section="damage" field="leanAngle" value={d.leanAngle} min={0} max={45} step={0.5} unit="°" format={v => v.toFixed(1)} />
      <TreeSliderRow label="Lean Direction" section="damage" field="leanDirection" value={d.leanDirection} min={0} max={360} step={1} unit="°" format={v => v.toFixed(0)} />
      <TreeSliderRow label="Crookedness" section="damage" field="crookedness" value={d.crookedness} min={0} max={1} step={0.01} hint="Trunk irregularity/warping" />
    </div>
  );
}
