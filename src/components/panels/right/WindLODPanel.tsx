/**
 * Wind & LOD Panel - Wired to HyperTreeParams.wind and HyperTreeParams.lod
 */
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { TreeSliderRow, TreeSelectRow, TreeToggleRow, TreeSectionTitle } from '../shared/TreeSliderRow';
import { getWindName, BEAUFORT_NAMES } from '@/types/hyperParams';

const WIND_QUALITY = [
  { value: 'LOW', label: 'Low' }, { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' }, { value: 'ULTRA', label: 'Ultra' },
];

export default function WindLODPanel({ subTab }: { subTab: string }) {
  const { treeParams } = useProVegLayout();

  if (subTab === 'wind') {
    const w = treeParams.wind;
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Wind</TreeSectionTitle>
        <TreeToggleRow label="Enabled" section="wind" field="enabled" value={w.enabled} />
        <TreeSliderRow label="Beaufort Scale" section="wind" field="beaufortScale" value={w.beaufortScale} min={0} max={12} step={1} format={v => `${v.toFixed(0)} — ${getWindName(v)}`} />
        <TreeSliderRow label="Direction (°)" section="wind" field="direction" value={w.direction * 180 / Math.PI} min={0} max={360} step={5} unit="°" format={v => v.toFixed(0)} />
        <TreeSelectRow label="Quality" section="wind" field="quality" value={w.quality} options={WIND_QUALITY} />
        <TreeSectionTitle>Gust Envelope</TreeSectionTitle>
        <TreeSliderRow label="Gust Frequency" section="wind" field="gustFrequency" value={w.gustFrequency} min={0.1} max={3} step={0.1} />
        <TreeSliderRow label="Gust Intensity" section="wind" field="gustIntensity" value={w.gustIntensity} min={0} max={1} step={0.05} />
        <TreeSliderRow label="Gust Variance" section="wind" field="gustVariance" value={w.gustVariance} min={0} max={1} step={0.05} />
        <TreeSliderRow label="Envelope Smoothing" section="wind" field="gustEnvelopeSmoothing" value={w.gustEnvelopeSmoothing} min={0} max={1} step={0.05} />
        <TreeSectionTitle>Turbulence</TreeSectionTitle>
        <TreeSliderRow label="Scale" section="wind" field="turbulenceScale" value={w.turbulenceScale} min={1} max={20} step={1} format={v => v.toFixed(0)} />
        <TreeSliderRow label="Intensity" section="wind" field="turbulenceIntensity" value={w.turbulenceIntensity} min={0} max={1} step={0.05} />
        <TreeSliderRow label="Vortex" section="wind" field="vortexStrength" value={w.vortexStrength} min={0} max={1} step={0.05} />
        <TreeSectionTitle>Hierarchy Response</TreeSectionTitle>
        <TreeSliderRow label="Trunk Bend" section="wind" field="trunkBendFactor" value={w.trunkBendFactor} min={0} max={0.05} step={0.002} />
        <TreeSliderRow label="Branch Bend" section="wind" field="branchBendFactor" value={w.branchBendFactor} min={0} max={0.3} step={0.01} />
        <TreeSliderRow label="Twig Bend" section="wind" field="twigBendFactor" value={w.twigBendFactor} min={0} max={0.5} step={0.02} />
        <TreeSliderRow label="Leaf Flutter" section="wind" field="leafFlutterFactor" value={w.leafFlutterFactor} min={0} max={1} step={0.05} />
        <TreeSectionTitle>Drag Cascade</TreeSectionTitle>
        <TreeSliderRow label="Leaf Drag" section="wind" field="leafDragScale" value={w.leafDragScale} min={0} max={2} step={0.1} />
        <TreeSliderRow label="Branch Drag" section="wind" field="branchDragScale" value={w.branchDragScale} min={0} max={2} step={0.1} />
        <TreeSliderRow label="Parent Coupling" section="wind" field="parentCoupling" value={w.parentCoupling} min={0} max={1} step={0.05} />
        <TreeSectionTitle>Spring-Damper</TreeSectionTitle>
        <TreeSliderRow label="Stiffness" section="wind" field="globalStiffness" value={w.globalStiffness} min={1} max={15} step={0.5} />
        <TreeSliderRow label="Damping" section="wind" field="globalDamping" value={w.globalDamping} min={0.5} max={5} step={0.25} />
      </div>
    );
  }

  // LOD
  const lod = treeParams.lod;
  return (
    <div className="space-y-3">
      <TreeSectionTitle>LOD Distances</TreeSectionTitle>
      <TreeSliderRow label="Hero Radius" section="lod" field="heroRadius" value={lod.heroRadius} min={0.1} max={2} step={0.1} unit="m" />
      <TreeSliderRow label="Near Radius" section="lod" field="nearRadius" value={lod.nearRadius} min={2} max={20} step={1} unit="m" />
      <TreeSliderRow label="Mid Radius" section="lod" field="midRadius" value={lod.midRadius} min={10} max={50} step={5} unit="m" />
      <TreeSliderRow label="Far Radius" section="lod" field="farRadius" value={lod.farRadius} min={20} max={100} step={10} unit="m" />
      <TreeSectionTitle>Vertex Budgets</TreeSectionTitle>
      <TreeSliderRow label="Hero Budget" section="lod" field="heroVertexBudget" value={lod.heroVertexBudget} min={100000} max={1000000} step={50000} format={v => `${(v/1000).toFixed(0)}k`} />
      <TreeSliderRow label="Near Budget" section="lod" field="nearVertexBudget" value={lod.nearVertexBudget} min={50000} max={500000} step={25000} format={v => `${(v/1000).toFixed(0)}k`} />
      <TreeSectionTitle>Feature Toggles</TreeSectionTitle>
      <TreeToggleRow label="Hero Leaf Geometry" section="lod" field="heroLeafGeometry" value={lod.heroLeafGeometry} />
      <TreeToggleRow label="Hero Vein Detail" section="lod" field="heroVeinDetail" value={lod.heroVeinDetail} />
      <TreeToggleRow label="Hero Bark Displacement" section="lod" field="heroBarkDisplacement" value={lod.heroBarkDisplacement} />
      <TreeSliderRow label="Transition Smoothing" section="lod" field="transitionSmoothing" value={lod.transitionSmoothing} min={0} max={1} step={0.05} />
    </div>
  );
}
