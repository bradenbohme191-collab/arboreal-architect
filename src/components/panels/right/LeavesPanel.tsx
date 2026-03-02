/**
 * Leaves/Foliage Panel - Wired to HyperTreeParams.foliage
 */
import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { TreeSliderRow, TreeColorRow, TreeSelectRow, TreeSectionTitle } from '../shared/TreeSliderRow';

const LEAF_SHAPES = [
  { value: 'OVATE', label: 'Ovate' }, { value: 'LANCEOLATE', label: 'Lanceolate' },
  { value: 'ELLIPTIC', label: 'Elliptic' }, { value: 'CORDATE', label: 'Cordate (Heart)' },
  { value: 'PALMATELY_LOBED', label: 'Lobed (Maple)' }, { value: 'NEEDLE', label: 'Needle' },
  { value: 'SCALE', label: 'Scale' }, { value: 'COMPOUND', label: 'Compound' },
];
const VEIN_PATTERNS = [
  { value: 'pinnate', label: 'Pinnate' }, { value: 'palmate', label: 'Palmate' },
  { value: 'parallel', label: 'Parallel' }, { value: 'dichotomous', label: 'Dichotomous' },
];
const MARGINS = [
  { value: 'entire', label: 'Entire (Smooth)' }, { value: 'serrate', label: 'Serrate' },
  { value: 'dentate', label: 'Dentate' }, { value: 'lobed', label: 'Lobed' },
  { value: 'compound', label: 'Compound' },
];

export default function LeavesPanel({ subTab }: { subTab: string }) {
  const { treeParams } = useProVegLayout();
  const f = treeParams.foliage;

  if (subTab === 'representation') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Shape & Size</TreeSectionTitle>
        <TreeSelectRow label="Leaf Shape" section="foliage" field="shape" value={f.shape} options={LEAF_SHAPES} />
        <TreeSliderRow label="Length (m)" section="foliage" field="length" value={f.length} min={0.01} max={0.3} step={0.005} unit="m" />
        <TreeSliderRow label="Width (m)" section="foliage" field="width" value={f.width} min={0.005} max={0.2} step={0.005} unit="m" />
        <TreeSliderRow label="Thickness" section="foliage" field="thickness" value={f.thickness} min={0.0005} max={0.005} step={0.0005} />
        <TreeSectionTitle>Density</TreeSectionTitle>
        <TreeSliderRow label="Density" section="foliage" field="density" value={f.density} min={2} max={30} step={1} format={v => v.toFixed(0)} />
        <TreeSliderRow label="Cluster Size" section="foliage" field="clusterSize" value={f.clusterSize} min={2} max={20} step={1} format={v => v.toFixed(0)} />
        <TreeSectionTitle>Edge</TreeSectionTitle>
        <TreeSelectRow label="Margin" section="foliage" field="margin" value={f.margin} options={MARGINS} />
        <TreeSliderRow label="Serration Depth" section="foliage" field="serrationDepth" value={f.serrationDepth} min={0} max={0.01} step={0.001} />
        <TreeSliderRow label="Serration Count" section="foliage" field="serrationCount" value={f.serrationCount} min={5} max={40} step={1} format={v => v.toFixed(0)} />
      </div>
    );
  }

  if (subTab === 'petiole') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Petiole (Stem)</TreeSectionTitle>
        <TreeSliderRow label="Length (m)" section="foliage" field="petioleLength" value={f.petioleLength} min={0} max={0.05} step={0.002} unit="m" />
        <TreeSliderRow label="Width (m)" section="foliage" field="petioleWidth" value={f.petioleWidth} min={0.0005} max={0.005} step={0.0005} unit="m" />
        <TreeSliderRow label="Droop" section="foliage" field="petioleDroop" value={f.petioleDroop} min={0} max={0.5} step={0.02} />
        <TreeSectionTitle>Venation</TreeSectionTitle>
        <TreeSelectRow label="Vein Pattern" section="foliage" field="veinPattern" value={f.veinPattern} options={VEIN_PATTERNS} />
        <TreeSliderRow label="Vein Detail" section="foliage" field="veinDetail" value={f.veinDetail} min={0} max={1} step={0.05} />
        <TreeSliderRow label="Midrib Width" section="foliage" field="midribWidth" value={f.midribWidth} min={0.001} max={0.005} step={0.0005} />
        <TreeSliderRow label="Secondary Veins" section="foliage" field="secondaryVeinCount" value={f.secondaryVeinCount} min={3} max={16} step={1} format={v => v.toFixed(0)} />
        <TreeSliderRow label="Vein Depth" section="foliage" field="veinDepth" value={f.veinDepth} min={0} max={0.002} step={0.0001} />
      </div>
    );
  }

  if (subTab === 'color') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Leaf Color</TreeSectionTitle>
        <TreeColorRow label="Base Color" section="foliage" field="colorBase" value={f.colorBase} />
        <TreeSliderRow label="Variation" section="foliage" field="colorVariation" value={f.colorVariation} min={0} max={0.5} step={0.02} />
        <TreeColorRow label="Autumn Color" section="foliage" field="autumnColor" value={f.autumnColor} />
        <TreeSectionTitle>Surface</TreeSectionTitle>
        <TreeSliderRow label="Glossiness" section="foliage" field="glossiness" value={f.glossiness} min={0} max={1} step={0.05} />
        <TreeSliderRow label="Translucency" section="foliage" field="translucency" value={f.translucency} min={0} max={1} step={0.05} hint="Back-lit light transmission" />
      </div>
    );
  }

  return null;
}
