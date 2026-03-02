/**
 * Bark & Roots Panel - Wired to HyperTreeParams.bark and HyperTreeParams.roots
 */
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { TreeSliderRow, TreeColorRow, TreeSelectRow, TreeToggleRow, TreeSectionTitle } from '../shared/TreeSliderRow';

const BARK_PATTERNS = [
  { value: 'FISSURED', label: 'Fissured' }, { value: 'PLATED', label: 'Plated' },
  { value: 'SMOOTH', label: 'Smooth' }, { value: 'SCALY', label: 'Scaly' },
  { value: 'PEELING', label: 'Peeling (Birch)' }, { value: 'CORKY', label: 'Corky' },
];
const ROOT_ARCHS = [
  { value: 'TAP_ROOT', label: 'Tap Root' }, { value: 'FIBROUS', label: 'Fibrous' },
  { value: 'HEART', label: 'Heart' }, { value: 'PLATE', label: 'Plate' },
  { value: 'BUTTRESS', label: 'Buttress' },
];

export default function BarkRootsPanel({ subTab }: { subTab: string }) {
  const { treeParams } = useProVegLayout();

  if (subTab === 'bark') {
    const bk = treeParams.bark;
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Bark Pattern</TreeSectionTitle>
        <TreeSelectRow label="Pattern" section="bark" field="pattern" value={bk.pattern} options={BARK_PATTERNS} />
        <TreeSliderRow label="Crack Scale" section="bark" field="crackScale" value={bk.crackScale} min={2} max={25} step={1} format={v => v.toFixed(0)} />
        <TreeSliderRow label="Crack Depth" section="bark" field="crackDepth" value={bk.crackDepth} min={0} max={0.05} step={0.002} />
        <TreeSliderRow label="Fissure Frequency" section="bark" field="fissureFrequency" value={bk.fissureFrequency} min={0} max={1} step={0.05} />
        <TreeSliderRow label="Plate Size" section="bark" field="plateSize" value={bk.plateSize} min={0.05} max={0.4} step={0.02} />
        <TreeSectionTitle>Layers</TreeSectionTitle>
        <TreeSliderRow label="Layer Count" section="bark" field="layerCount" value={bk.layerCount} min={1} max={5} step={1} format={v => v.toFixed(0)} />
        <TreeSliderRow label="Total Thickness" section="bark" field="totalThickness" value={bk.totalThickness} min={0.005} max={0.05} step={0.002} />
        <TreeSectionTitle>Peeling</TreeSectionTitle>
        <TreeToggleRow label="Peeling Enabled" section="bark" field="peelingEnabled" value={bk.peelingEnabled} />
        <TreeSliderRow label="Peeling Intensity" section="bark" field="peelingIntensity" value={bk.peelingIntensity} min={0} max={1} step={0.05} />
        <TreeSliderRow label="Curl Radius" section="bark" field="peelCurlRadius" value={bk.peelCurlRadius} min={0.005} max={0.05} step={0.002} />
        <TreeSectionTitle>Growth</TreeSectionTitle>
        <TreeToggleRow label="Moss" section="bark" field="mossEnabled" value={bk.mossEnabled} />
        <TreeSliderRow label="Moss Amount" section="bark" field="mossAmount" value={bk.mossAmount} min={0} max={1} step={0.05} />
        <TreeColorRow label="Moss Color" section="bark" field="mossColor" value={bk.mossColor} />
        <TreeSliderRow label="Weathering" section="bark" field="weatheringAge" value={bk.weatheringAge} min={0} max={1} step={0.05} />
        <TreeSliderRow label="UV Damage" section="bark" field="uvDamage" value={bk.uvDamage} min={0} max={1} step={0.05} />
        <TreeSliderRow label="Moisture Staining" section="bark" field="moistureStaining" value={bk.moistureStaining} min={0} max={1} step={0.05} />
      </div>
    );
  }

  // Roots sub-tab
  const r = treeParams.roots;
  return (
    <div className="space-y-3">
      <TreeSectionTitle>Root Architecture</TreeSectionTitle>
      <TreeSelectRow label="Architecture" section="roots" field="architecture" value={r.architecture} options={ROOT_ARCHS} />
      <TreeSliderRow label="Root Count" section="roots" field="count" value={r.count} min={2} max={12} step={1} format={v => v.toFixed(0)} />
      <TreeSliderRow label="Max Depth (m)" section="roots" field="maxDepth" value={r.maxDepth} min={0.2} max={3} step={0.1} unit="m" />
      <TreeSliderRow label="Spread Radius (m)" section="roots" field="spreadRadius" value={r.spreadRadius} min={1} max={8} step={0.5} unit="m" />
      <TreeSliderRow label="Tap Root Length" section="roots" field="tapRootLength" value={r.tapRootLength} min={0.5} max={3} step={0.1} />
      <TreeSliderRow label="Lateral Angle (°)" section="roots" field="lateralAngle" value={r.lateralAngle} min={10} max={60} step={1} unit="°" format={v => v.toFixed(0)} />
      <TreeSliderRow label="Branching Density" section="roots" field="branchingDensity" value={r.branchingDensity} min={0} max={1} step={0.05} />
      <TreeSectionTitle>Tropism</TreeSectionTitle>
      <TreeSliderRow label="Hydrotropism" section="roots" field="hydrotropismStrength" value={r.hydrotropismStrength} min={0} max={1} step={0.05} hint="Root attraction to moisture" />
      <TreeSliderRow label="Gravitropism" section="roots" field="gravitropismStrength" value={r.gravitropismStrength} min={0} max={1} step={0.05} hint="Downward growth tendency" />
      <TreeSectionTitle>Visual</TreeSectionTitle>
      <TreeSliderRow label="Visibility" section="roots" field="visibility" value={r.visibility} min={0} max={1} step={0.05} />
      <TreeSliderRow label="Base Radius" section="roots" field="baseRadius" value={r.baseRadius} min={0.05} max={0.5} step={0.02} />
      <TreeSliderRow label="Taper Rate" section="roots" field="taperRate" value={r.taperRate} min={0.3} max={0.9} step={0.05} />
    </div>
  );
}
