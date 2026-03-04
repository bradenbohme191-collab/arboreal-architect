/**
 * CODEX5.3TREES - Root System Panel
 * Full root architecture controls from HyperTreeParams.
 */

import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { TreeSliderRow, TreeToggleRow, TreeSelectRow, TreeSectionTitle } from '../shared/TreeSliderRow';

export default function RootSystemPanel({ subTab }: { subTab: string }) {
  const { treeParams } = useProVegLayout();
  const r = treeParams.roots;

  if (subTab === 'architecture') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Root Architecture</TreeSectionTitle>
        <TreeSelectRow label="Architecture" section="roots" field="architecture" value={r.architecture}
          options={[
            { value: 'TAP_ROOT', label: 'Tap Root' },
            { value: 'FIBROUS', label: 'Fibrous' },
            { value: 'HEART', label: 'Heart' },
            { value: 'PLATE', label: 'Plate' },
            { value: 'BUTTRESS', label: 'Buttress' },
          ]}
        />
        <TreeSliderRow label="Root Count" section="roots" field="count" value={r.count} min={2} max={12} step={1} format={v => v.toFixed(0)} />
        <TreeSliderRow label="Max Depth" section="roots" field="maxDepth" value={r.maxDepth} min={0.1} max={3} step={0.1} unit="m" />
        <TreeSliderRow label="Spread Radius" section="roots" field="spreadRadius" value={r.spreadRadius} min={0.5} max={8} step={0.1} unit="m" />
        <TreeSliderRow label="Tap Root Length" section="roots" field="tapRootLength" value={r.tapRootLength} min={0} max={4} step={0.1} unit="m" />
        <TreeSliderRow label="Branching Density" section="roots" field="branchingDensity" value={r.branchingDensity} min={0} max={1} step={0.01} />
      </div>
    );
  }

  if (subTab === 'fluting') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Fluting Transition</TreeSectionTitle>
        <TreeToggleRow label="Fluting Enabled" section="roots" field="flutingEnabled" value={r.flutingEnabled} />
        <TreeSliderRow label="Fluting Strength" section="roots" field="flutingStrength" value={r.flutingStrength} min={0} max={0.5} step={0.01} />
        <TreeSliderRow label="Fluting Count" section="roots" field="flutingCount" value={r.flutingCount} min={2} max={12} step={1} format={v => v.toFixed(0)} />
        <TreeSliderRow label="Sharpness" section="roots" field="flutingSharpness" value={r.flutingSharpness} min={0.5} max={5} step={0.1} />
        <TreeSliderRow label="Transition Height" section="roots" field="flutingTransitionHeight" value={r.flutingTransitionHeight} min={0} max={1} step={0.01} unit="m" />
        <TreeSliderRow label="Asymmetry" section="roots" field="fluteAsymmetry" value={r.fluteAsymmetry} min={0} max={0.5} step={0.01} />
        
        <TreeSectionTitle>Buttress Roots</TreeSectionTitle>
        <TreeToggleRow label="Buttress Enabled" section="roots" field="buttressEnabled" value={r.buttressEnabled} />
        <TreeSliderRow label="Buttress Strength" section="roots" field="buttressStrength" value={r.buttressStrength} min={0} max={1} step={0.01} />
        <TreeSliderRow label="Buttress Height" section="roots" field="buttressHeight" value={r.buttressHeight} min={0.1} max={2} step={0.05} unit="m" />
      </div>
    );
  }

  // Default: tropism & visual
  return (
    <div className="space-y-3">
      <TreeSectionTitle>Tropism Response</TreeSectionTitle>
      <TreeSliderRow label="Hydrotropism" section="roots" field="hydrotropismStrength" value={r.hydrotropismStrength} min={0} max={1} step={0.01} hint="Attraction to water" />
      <TreeSliderRow label="Gravitropism" section="roots" field="gravitropismStrength" value={r.gravitropismStrength} min={0} max={1} step={0.01} hint="Downward growth bias" />
      <TreeSliderRow label="Lateral Angle" section="roots" field="lateralAngle" value={r.lateralAngle} min={0} max={90} step={1} unit="°" format={v => v.toFixed(0)} />
      
      <TreeSectionTitle>Visual</TreeSectionTitle>
      <TreeSliderRow label="Visibility" section="roots" field="visibility" value={r.visibility} min={0} max={1} step={0.01} />
      <TreeSliderRow label="Base Radius" section="roots" field="baseRadius" value={r.baseRadius} min={0.05} max={0.8} step={0.01} unit="m" />
      <TreeSliderRow label="Taper Rate" section="roots" field="taperRate" value={r.taperRate} min={0.3} max={1} step={0.01} />
    </div>
  );
}
