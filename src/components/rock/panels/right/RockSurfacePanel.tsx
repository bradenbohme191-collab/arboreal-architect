/**
 * Rock Surface Panel
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSliderRow, RockSectionTitle } from '../shared/RockSliderRow';

export default function RockSurfacePanel({ subTab }: { subTab: string }) {
  const { rockParams } = useProRockLayout();
  const s = rockParams.surface;

  if (subTab === 'displacement') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Displacement</RockSectionTitle>
        <RockSliderRow label="Height" section="surface" field="displacement" value={s.displacement} min={0} max={2} step={0.01} />
        <RockSliderRow label="Bump Scale" section="surface" field="bumpScale" value={s.bumpScale} min={0} max={3} step={0.05} />
        <RockSliderRow label="Noise Octaves" section="surface" field="noiseOctaves" value={s.noiseOctaves} min={1} max={8} step={1} format={v => v.toFixed(0)} />
        <RockSliderRow label="Frequency" section="surface" field="noiseFrequency" value={s.noiseFrequency} min={0.1} max={10} step={0.1} />
      </div>
    );
  }

  if (subTab === 'micro') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Micro Detail</RockSectionTitle>
        <RockSliderRow label="Micro Detail" section="surface" field="microDetail" value={s.microDetail} min={0} max={1} />
        <RockSliderRow label="Porosity" section="surface" field="porosity" value={s.porosity} min={0} max={1} />
        <RockSliderRow label="Lacunarity" section="surface" field="noiseLacunarity" value={s.noiseLacunarity} min={1} max={4} step={0.05} />
        <RockSliderRow label="Persistence" section="surface" field="noisePersistence" value={s.noisePersistence} min={0} max={1} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <RockSectionTitle>Roughness</RockSectionTitle>
      <RockSliderRow label="Roughness" section="surface" field="roughness" value={s.roughness} min={0} max={1} />
      <RockSliderRow label="Glossiness" section="surface" field="glossiness" value={s.glossiness} min={0} max={1} />
    </div>
  );
}
