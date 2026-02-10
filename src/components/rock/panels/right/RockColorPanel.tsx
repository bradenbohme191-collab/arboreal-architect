/**
 * Rock Color & Material Panel
 */
import { useProRockLayout } from '@/contexts/ProRockLayoutContext';
import { RockSliderRow, RockColorRow, RockSectionTitle } from '../shared/RockSliderRow';

export default function RockColorPanel({ subTab }: { subTab: string }) {
  const { rockParams } = useProRockLayout();
  const c = rockParams.color;

  if (subTab === 'veins') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Veins & Striations</RockSectionTitle>
        <RockColorRow label="Vein Color" section="color" field="veinColor" value={c.veinColor} />
        <RockSliderRow label="Vein Intensity" section="color" field="veinIntensity" value={c.veinIntensity} min={0} max={1} />
        <RockSliderRow label="Vein Scale" section="color" field="veinScale" value={c.veinScale} min={0.1} max={5} step={0.1} />
      </div>
    );
  }

  if (subTab === 'patina') {
    return (
      <div className="space-y-3">
        <RockSectionTitle>Patina & Oxidation</RockSectionTitle>
        <RockSliderRow label="Patina" section="color" field="patina" value={c.patina} min={0} max={1} />
        <RockSliderRow label="Iron Oxide" section="color" field="ironOxide" value={c.ironOxide} min={0} max={1} />
        <RockSliderRow label="Color Variation" section="color" field="colorVariation" value={c.colorVariation} min={0} max={1} />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <RockSectionTitle>Base Colors</RockSectionTitle>
      <RockColorRow label="Base Color" section="color" field="baseColor" value={c.baseColor} />
      <RockColorRow label="Secondary" section="color" field="secondaryColor" value={c.secondaryColor} />
      <RockSliderRow label="Saturation" section="color" field="saturation" value={c.saturation} min={0} max={2} step={0.05} />
      <RockSliderRow label="Brightness" section="color" field="brightness" value={c.brightness} min={0} max={2} step={0.05} />
    </div>
  );
}
