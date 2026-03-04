/**
 * Trunk Panel - Wired to HyperTreeParams.trunk
 * Includes OPUS Trunk Cross-Section instrument
 */
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { TreeSliderRow, TreeColorRow, TreeSectionTitle } from '../shared/TreeSliderRow';
import TrunkCrossSectionEditor from '@/components/instruments/TrunkCrossSectionEditor';

export default function TrunkPanel({ subTab }: { subTab: string }) {
  const { treeParams } = useProVegLayout();
  const t = treeParams.trunk;

  if (subTab === 'shape') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Dimensions</TreeSectionTitle>
        <TreeSliderRow label="Height (m)" section="trunk" field="heightBase" value={t.heightBase} min={2} max={30} step={0.5} unit="m" />
        <TreeSliderRow label="Base Radius (m)" section="trunk" field="baseRadius" value={t.baseRadius} min={0.1} max={1.5} step={0.02} unit="m" />
        <TreeSliderRow label="Taper Exponent" section="trunk" field="taperExponent" value={t.taperExponent} min={0.3} max={1.5} step={0.05} />
        <TreeSliderRow label="Base Flare" section="trunk" field="baseFlare" value={t.baseFlare} min={1} max={2.5} step={0.05} />
        <TreeSliderRow label="Flare Zone" section="trunk" field="flareZone" value={t.flareZone} min={0.02} max={0.2} step={0.01} />
        <TreeSliderRow label="Twist (°)" section="trunk" field="twist" value={t.twist} min={-90} max={90} step={1} unit="°" format={v => v.toFixed(0)} />
        <TreeColorRow label="Bark Color" section="trunk" field="barkColor" value={t.barkColor} />
      </div>
    );
  }

  if (subTab === 'gesture') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Gesture Knots</TreeSectionTitle>
        <TreeSliderRow label="Curve Strength" section="trunk" field="curveStrength" value={t.curveStrength} min={0} max={0.5} step={0.01} />
        <TreeSliderRow label="Knot Count" section="trunk" field="knotCount" value={t.knotCount} min={0} max={6} step={1} format={v => v.toFixed(0)} />
        <TreeSliderRow label="Knot Strength" section="trunk" field="knotStrength" value={t.knotStrength} min={0} max={1} step={0.05} />
      </div>
    );
  }

  if (subTab === 'cross') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Cross Section</TreeSectionTitle>
        <p className="text-[10px] text-muted-foreground mb-2">Drag control points to shape the trunk cross-section.</p>
        <TrunkCrossSectionEditor />
        <TreeSliderRow label="Ovality" section="trunk" field="ovality" value={t.ovality} min={0} max={0.4} step={0.01} />
        <TreeSliderRow label="Twist" section="trunk" field="twist" value={t.twist} min={-90} max={90} step={1} unit="°" format={v => v.toFixed(0)} />
      </div>
    );
  }

  if (subTab === 'buttress') {
    const r = treeParams.roots;
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Buttress Roots</TreeSectionTitle>
        <TreeSliderRow label="Strength" section="roots" field="buttressStrength" value={r.buttressStrength} min={0} max={1} step={0.05} />
        <TreeSliderRow label="Height" section="roots" field="buttressHeight" value={r.buttressHeight} min={0} max={1} step={0.05} />
        <TreeSectionTitle>Fluting</TreeSectionTitle>
        <TreeSliderRow label="Fluting Strength" section="roots" field="flutingStrength" value={r.flutingStrength} min={0} max={0.3} step={0.01} />
        <TreeSliderRow label="Fluting Count" section="roots" field="flutingCount" value={r.flutingCount} min={2} max={10} step={1} format={v => v.toFixed(0)} />
        <TreeSliderRow label="Fluting Sharpness" section="roots" field="flutingSharpness" value={r.flutingSharpness} min={0.5} max={5} step={0.1} />
        <TreeSliderRow label="Transition Height" section="roots" field="flutingTransitionHeight" value={r.flutingTransitionHeight} min={0.1} max={1} step={0.05} />
        <TreeSliderRow label="Asymmetry" section="roots" field="fluteAsymmetry" value={r.fluteAsymmetry} min={0} max={0.5} step={0.02} />
      </div>
    );
  }

  return null;
}
