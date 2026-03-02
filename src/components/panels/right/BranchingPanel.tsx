/**
 * Branching Panel - Wired to HyperTreeParams.branching
 */
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { TreeSliderRow, TreeSelectRow, TreeSectionTitle } from '../shared/TreeSliderRow';

const BRANCH_MODELS = [
  { value: 'L_SYSTEM', label: 'L-System' },
  { value: 'SPACE_COLONIZATION', label: 'Space Colonization' },
  { value: 'HYBRID', label: 'Hybrid' },
];
const PHYLLOTAXIS = [
  { value: 'ALTERNATE', label: 'Alternate' },
  { value: 'OPPOSITE', label: 'Opposite' },
  { value: 'WHORLED', label: 'Whorled' },
  { value: 'RANDOM', label: 'Random' },
];

export default function BranchingPanel({ subTab }: { subTab: string }) {
  const { treeParams } = useProVegLayout();
  const b = treeParams.branching;

  if (subTab === 'structure') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Topology</TreeSectionTitle>
        <TreeSelectRow label="Model" section="branching" field="model" value={b.model} options={BRANCH_MODELS} />
        <TreeSelectRow label="Phyllotaxis" section="branching" field="phyllotaxis" value={b.phyllotaxis} options={PHYLLOTAXIS} />
        <TreeSliderRow label="Branch Count" section="branching" field="branchCount" value={b.branchCount} min={2} max={25} step={1} format={v => v.toFixed(0)} />
        <TreeSliderRow label="Max Order" section="branching" field="maxOrder" value={b.maxOrder} min={1} max={8} step={1} format={v => v.toFixed(0)} />
        <TreeSliderRow label="Start Height" section="branching" field="startHeight" value={b.startHeight} min={0.05} max={0.7} step={0.05} />
        <TreeSectionTitle>Angles</TreeSectionTitle>
        <TreeSliderRow label="Angle Mean (°)" section="branching" field="angleMean" value={b.angleMean} min={10} max={80} step={1} unit="°" format={v => v.toFixed(0)} />
        <TreeSliderRow label="Angle Variance" section="branching" field="angleVariance" value={b.angleVariance} min={0} max={30} step={1} format={v => v.toFixed(0)} />
        <TreeSectionTitle>Scaling</TreeSectionTitle>
        <TreeSliderRow label="Length Decay" section="branching" field="lengthDecay" value={b.lengthDecay} min={0.4} max={0.95} step={0.02} />
        <TreeSliderRow label="Radius Decay" section="branching" field="radiusDecay" value={b.radiusDecay} min={0.3} max={0.9} step={0.02} />
        <TreeSliderRow label="Probability" section="branching" field="probability" value={b.probability} min={0.2} max={1} step={0.05} />
        <TreeSliderRow label="Apical Dominance" section="branching" field="apicalDominance" value={b.apicalDominance} min={0} max={1} step={0.05} hint="0 = spreading · 1 = columnar leader" />
        <TreeSliderRow label="Child Budget" section="branching" field="childBudget" value={b.childBudget} min={1} max={6} step={1} format={v => v.toFixed(0)} />
      </div>
    );
  }

  if (subTab === 'junction') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Junction Geometry</TreeSectionTitle>
        <TreeSliderRow label="Collar Strength" section="branching" field="collarStrength" value={b.collarStrength} min={0} max={1} step={0.05} />
        <TreeSliderRow label="Collar Length" section="branching" field="collarLength" value={b.collarLength} min={0.02} max={0.3} step={0.01} />
        <TreeSliderRow label="Junction Blob" section="branching" field="junctionBlob" value={b.junctionBlob} min={0} max={1} step={0.05} hint="Organic bulge at branch attachment" />
      </div>
    );
  }

  if (subTab === 'gesture') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Branch Curvature</TreeSectionTitle>
        <p className="text-[10px] text-muted-foreground">Branch gesture is generated via Bezier curves with random control point offsets.</p>
      </div>
    );
  }

  if (subTab === 'damage') {
    const d = treeParams.damage;
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Branch Breaking</TreeSectionTitle>
        <TreeSliderRow label="Broken Branches" section="damage" field="brokenBranchCount" value={d.brokenBranchCount} min={0} max={8} step={1} format={v => v.toFixed(0)} />
        <TreeSliderRow label="Break Threshold" section="damage" field="breakThreshold" value={d.breakThreshold} min={0.2} max={1} step={0.05} hint="Lower = easier to break" />
        <TreeSliderRow label="Healing Rate" section="damage" field="healingRate" value={d.healingRate} min={0} max={1} step={0.05} />
        <TreeSectionTitle>Knots</TreeSectionTitle>
        <TreeSliderRow label="Knot Density" section="damage" field="knotDensity" value={d.knotDensity} min={0} max={1} step={0.05} />
        <TreeSectionTitle>Deformation</TreeSectionTitle>
        <TreeSliderRow label="Lean Angle (°)" section="damage" field="leanAngle" value={d.leanAngle} min={0} max={30} step={1} unit="°" format={v => v.toFixed(0)} />
        <TreeSliderRow label="Lean Direction (°)" section="damage" field="leanDirection" value={d.leanDirection} min={0} max={360} step={5} unit="°" format={v => v.toFixed(0)} />
        <TreeSliderRow label="Crookedness" section="damage" field="crookedness" value={d.crookedness} min={0} max={0.5} step={0.02} />
        <TreeSectionTitle>Disease</TreeSectionTitle>
        <TreeSliderRow label="Disease Level" section="damage" field="diseaseLevel" value={d.diseaseLevel} min={0} max={1} step={0.05} />
        <TreeSliderRow label="Rot Spots" section="damage" field="rotSpots" value={d.rotSpots} min={0} max={10} step={1} format={v => v.toFixed(0)} />
      </div>
    );
  }

  return null;
}
