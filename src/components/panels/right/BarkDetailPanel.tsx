/**
 * CODEX5.3TREES - Bark Detail Panel
 * Full bark system: pattern, layers, peeling, moss, weathering.
 */

import { useProVegLayout } from '@/contexts/ProVegLayoutContext';
import { TreeSliderRow, TreeToggleRow, TreeSelectRow, TreeColorRow, TreeSectionTitle } from '../shared/TreeSliderRow';

export default function BarkDetailPanel({ subTab }: { subTab: string }) {
  const { treeParams } = useProVegLayout();
  const b = treeParams.bark;

  if (subTab === 'pattern') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Bark Pattern</TreeSectionTitle>
        <TreeSelectRow label="Pattern" section="bark" field="pattern" value={b.pattern}
          options={[
            { value: 'FISSURED', label: 'Fissured' },
            { value: 'PLATED', label: 'Plated' },
            { value: 'SMOOTH', label: 'Smooth' },
            { value: 'SCALY', label: 'Scaly' },
            { value: 'PEELING', label: 'Peeling' },
            { value: 'CORKY', label: 'Corky' },
          ]}
        />
        <TreeSliderRow label="Crack Scale" section="bark" field="crackScale" value={b.crackScale} min={1} max={30} step={0.5} />
        <TreeSliderRow label="Crack Depth" section="bark" field="crackDepth" value={b.crackDepth} min={0} max={0.1} step={0.001} format={v => `${(v*1000).toFixed(1)}mm`} />
        <TreeSliderRow label="Fissure Freq" section="bark" field="fissureFrequency" value={b.fissureFrequency} min={0} max={1} step={0.01} />
        <TreeSliderRow label="Plate Size" section="bark" field="plateSize" value={b.plateSize} min={0.01} max={0.5} step={0.01} />
        <TreeSliderRow label="Layer Count" section="bark" field="layerCount" value={b.layerCount} min={1} max={6} step={1} format={v => v.toFixed(0)} />
        <TreeSliderRow label="Total Thickness" section="bark" field="totalThickness" value={b.totalThickness} min={0.001} max={0.1} step={0.001} format={v => `${(v*1000).toFixed(1)}mm`} />
      </div>
    );
  }

  if (subTab === 'peeling') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Peeling Bark</TreeSectionTitle>
        <TreeToggleRow label="Peeling Enabled" section="bark" field="peelingEnabled" value={b.peelingEnabled} />
        <TreeSliderRow label="Intensity" section="bark" field="peelingIntensity" value={b.peelingIntensity} min={0} max={1} step={0.01} />
        <TreeSliderRow label="Curl Radius" section="bark" field="peelCurlRadius" value={b.peelCurlRadius} min={0.005} max={0.1} step={0.005} format={v => `${(v*1000).toFixed(0)}mm`} />
      </div>
    );
  }

  if (subTab === 'moss') {
    return (
      <div className="space-y-3">
        <TreeSectionTitle>Moss & Lichen</TreeSectionTitle>
        <TreeToggleRow label="Moss Enabled" section="bark" field="mossEnabled" value={b.mossEnabled} />
        <TreeSliderRow label="Amount" section="bark" field="mossAmount" value={b.mossAmount} min={0} max={1} step={0.01} />
        <TreeSliderRow label="Height Limit" section="bark" field="mossHeight" value={b.mossHeight} min={0} max={1} step={0.01} hint="Max height % where moss grows" />
        <TreeColorRow label="Moss Color" section="bark" field="mossColor" value={b.mossColor} />
      </div>
    );
  }

  // Default: weathering
  return (
    <div className="space-y-3">
      <TreeSectionTitle>Weathering</TreeSectionTitle>
      <TreeSliderRow label="Weathering Age" section="bark" field="weatheringAge" value={b.weatheringAge} min={0} max={1} step={0.01} hint="Surface aging effects" />
      <TreeSliderRow label="UV Damage" section="bark" field="uvDamage" value={b.uvDamage} min={0} max={1} step={0.01} />
      <TreeSliderRow label="Moisture Stain" section="bark" field="moistureStaining" value={b.moistureStaining} min={0} max={1} step={0.01} />
    </div>
  );
}
